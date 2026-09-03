/**
 * 考研题库 · 存储引擎 v3
 *
 * 设计目标：彻底消除「在章节中间插入新题导致数字索引漂移、数据错位」的问题。
 *
 * 核心原则：
 *   1. 存储键 = questionSlug（物理切图文件名去扩展名），绝不使用纯数字索引作为持久化键。
 *   2. 每个章节的 status / qbad / sbad / mismatch / sm2 / notes 合并存入单一 JSON 对象。
 *   3. 内存中仍用数字索引（idx）操作，只在磁盘读写时做 idx ↔ slug 映射。
 *   4. 读取时按优先级兼容旧格式，读到后立即升级写回 v3，但不强删旧 key（留 30 天缓冲）。
 *   5. 每个存储对象带 $v（版本号）和 $saved（写入时间戳），便于审计和排查。
 *
 * 键空间规范：
 *   kaoyan.q.<chapterUid>  — 题目数据（v3 格式）
 *   kaoyan.g.<name>        — 全局数据（resume / filters / topics / affinity / study_log / theme / …）
 *   kaoyan.ui.<subjectId>  — UI 偏好（solution 显示等）
 *   annot_<imgUrl>         — 标注数据（保持独立 key，体积大，不合并）
 */

(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────────────────────────
  // 工具：安全写 localStorage（防 QuotaExceededError 静默丢失）
  // ─────────────────────────────────────────────────────────────────────────────
  function safeLSSet(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      if (e && (e.name === 'QuotaExceededError' || e.code === 22)) {
        console.warn('[StorageV3] localStorage 已满，无法保存:', key);
      } else {
        console.warn('[StorageV3] 写入失败:', key, e);
      }
      return false;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DataValidator：写入前校验，防止脏数据进入存储
  // ─────────────────────────────────────────────────────────────────────────────
  var VALID_STATUS_VALUES = ['proficient', 'familiar', 'vague', 'rusty', 'wrong', null, undefined, ''];

  var DataValidator = {
    /**
     * 校验 questionSlug：必须是非空字符串，且不能是纯数字。
     * 纯数字 slug 是历史遗留的数字索引，接受它会导致插题后数据漂移。
     */
    validateSlug: function (slug) {
      if (!slug || typeof slug !== 'string') return false;
      if (/^\d+$/.test(slug)) return false;  // 拒绝纯数字
      return true;
    },

    /**
     * 校验掌握度状态值。
     */
    validateStatus: function (val) {
      return VALID_STATUS_VALUES.indexOf(val) !== -1;
    },

    /**
     * 校验 SM-2 记录对象（宽松，只检查必要字段类型）。
     */
    validateSm2: function (rec) {
      if (!rec || typeof rec !== 'object') return false;
      if (rec.ef !== undefined && typeof rec.ef !== 'number') return false;
      if (rec.interval !== undefined && typeof rec.interval !== 'number') return false;
      return true;
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // GlobalStore：管理 kaoyan.g.* 全局 key
  // ─────────────────────────────────────────────────────────────────────────────
  var GlobalStore = {
    _key: function (name) { return 'kaoyan.g.' + name; },

    get: function (name) {
      try {
        var raw = localStorage.getItem(this._key(name));
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    },

    set: function (name, val) {
      safeLSSet(this._key(name), JSON.stringify(val));
    },

    remove: function (name) {
      try { localStorage.removeItem(this._key(name)); } catch (e) {}
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // UiStore：管理 kaoyan.ui.* UI 偏好 key
  // ─────────────────────────────────────────────────────────────────────────────
  var UiStore = {
    _key: function (subjectId) { return 'kaoyan.ui.' + subjectId; },

    get: function (subjectId) {
      try {
        var raw = localStorage.getItem(this._key(subjectId));
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    },

    set: function (subjectId, val) {
      safeLSSet(this._key(subjectId), JSON.stringify(val));
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // ChapterStore：按章节管理题目数据（v3 格式）
  //
  // 存储格式（kaoyan.q.<chapterUid>）：
  // {
  //   "$v": 3,
  //   "$saved": "2026-09-03T13:00:00Z",
  //   "$chapterUid": "math::基础30讲::高数::lec01",
  //   "例1-1": { status, qbad, sbad, mismatch, sm2, notes },
  //   "pb_1-1": { ... },
  //   ...
  // }
  // ─────────────────────────────────────────────────────────────────────────────
  function ChapterStore(ch) {
    if (!ch || !ch.uid) {
      throw new Error('[ChapterStore] 章节对象缺少 uid，无法初始化');
    }
    this.ch = ch;
    this.key = 'kaoyan.q.' + ch.uid;
    this._cache = null;       // 内存缓存，减少 JSON.parse 次数
    this._dirty = false;      // 是否有未写回的修改
  }

  ChapterStore.prototype = {
    /**
     * 从磁盘加载 v3 格式数据。返回 { slug → { status, qbad, sbad, mismatch, sm2, notes } }。
     * 不含元数据字段（$v / $saved / $chapterUid）。
     */
    _loadRaw: function () {
      try {
        var raw = localStorage.getItem(this.key);
        if (!raw) return null;
        var obj = JSON.parse(raw);
        if (!obj || obj.$v !== 3) return null;
        return obj;
      } catch (e) {
        return null;
      }
    },

    /**
     * 清除内存缓存（外部数据变化后调用，强制下次重新从磁盘读）。
     */
    invalidate: function () {
      this._cache = null;
      this._dirty = false;
    },

    /**
     * 读取章节的完整题目数据映射（含缓存）。
     * 返回 { slug → { status, qbad, sbad, mismatch, sm2, notes } }
     */
    load: function () {
      if (this._cache) return this._cache;
      var raw = this._loadRaw();
      var result = {};
      if (raw) {
        for (var k in raw) {
          if (!Object.prototype.hasOwnProperty.call(raw, k)) continue;
          if (k.charAt(0) === '$') continue; // 跳过元数据字段
          if (!DataValidator.validateSlug(k)) continue; // 跳过无效 slug（含纯数字历史键）
          result[k] = raw[k];
        }
      }
      this._cache = result;
      return result;
    },

    /**
     * 将完整数据写回磁盘。data = { slug → { ... } }
     */
    save: function (data) {
      var payload = { $v: 3, $saved: new Date().toISOString(), $chapterUid: this.ch.uid };
      for (var slug in data) {
        if (!Object.prototype.hasOwnProperty.call(data, slug)) continue;
        if (!DataValidator.validateSlug(slug)) {
          console.warn('[ChapterStore] save: 跳过无效 slug:', slug);
          continue;
        }
        payload[slug] = data[slug];
      }
      var ok = safeLSSet(this.key, JSON.stringify(payload));
      if (ok) {
        this._cache = data;
        this._dirty = false;
      }
      return ok;
    },

    /**
     * 原子读-改-写单道题数据。fields 中的字段会合并（而非覆盖）到已有数据上。
     * slug 必须通过 DataValidator.validateSlug。
     */
    setQuestion: function (slug, fields) {
      if (!DataValidator.validateSlug(slug)) {
        console.warn('[ChapterStore] setQuestion: 无效 slug，已拒绝:', slug);
        return false;
      }
      var data = this.load();
      data[slug] = Object.assign({}, data[slug] || {}, fields);
      // 清理 undefined / null 的标志字段（减少存储体积）
      var q = data[slug];
      if (q.status === null || q.status === undefined || q.status === '') delete q.status;
      if (!q.qbad) delete q.qbad;
      if (!q.sbad) delete q.sbad;
      if (!q.mismatch) delete q.mismatch;
      if (!q.sm2) delete q.sm2;
      if (!q.notes) delete q.notes;
      // 若题目数据已全空，移除该 slug 条目
      if (Object.keys(q).length === 0) delete data[slug];
      return this.save(data);
    },

    /**
     * 读取单道题数据（slug 不存在时返回 {}）。
     */
    getQuestion: function (slug) {
      if (!DataValidator.validateSlug(slug)) return {};
      var data = this.load();
      return data[slug] || {};
    },

    /**
     * 将内存态的 statuses / qBad / sBad / bookMismatch / sm2 / notes
     * 一次性写入 v3 格式。
     *
     * @param {object} opts
     *   opts.statuses       { idx → statusString }
     *   opts.qBad           { idx → true }
     *   opts.sBad           { idx → true }
     *   opts.bookMismatch   { idx → true }
     *   opts.sm2            { idx → sm2Record }
     *   opts.notes          { "chId::label" → noteText }  (notesData 格式)
     *   opts.offset         number  该章在合并章节中的起始偏移
     *   opts.len            number  该章自身的题目数量
     */
    writeFromMemory: function (opts) {
      var ch = this.ch;
      var offset = opts.offset || 0;
      var len = opts.len || (ch.ownTotal || ch.total || 0);

      // 先读当前 v3 数据（保留其他字段，避免覆盖）
      var data = this.load();

      for (var i = 0; i < len; i++) {
        var slug = ch.getQuestionSlug ? ch.getQuestionSlug(i) : null;
        if (!DataValidator.validateSlug(slug)) continue;

        var memIdx = offset + i;
        var entry = {};

        if (opts.statuses && opts.statuses[memIdx] !== undefined) {
          if (DataValidator.validateStatus(opts.statuses[memIdx])) {
            entry.status = opts.statuses[memIdx];
          }
        }
        if (opts.qBad && opts.qBad[memIdx]) entry.qbad = true;
        if (opts.sBad && opts.sBad[memIdx]) entry.sbad = true;
        if (opts.bookMismatch && opts.bookMismatch[memIdx]) entry.mismatch = true;
        if (opts.sm2 && opts.sm2[memIdx]) {
          if (DataValidator.validateSm2(opts.sm2[memIdx])) entry.sm2 = opts.sm2[memIdx];
        }

        // notes：从 notesData 中找 "chId::label" 格式的条目
        if (opts.notes) {
          var label = ch.labels && ch.labels[i];
          var noteKey = ch.id + '::' + label;
          if (label && opts.notes[noteKey] !== undefined) {
            entry.notes = opts.notes[noteKey];
          }
        }

        if (Object.keys(entry).length > 0) {
          data[slug] = Object.assign({}, data[slug] || {}, entry);
        }
      }

      return this.save(data);
    },

    /**
     * 从 v3 数据填充内存态对象（loadStatuses / loadSm2 等的下游）。
     * 返回 { statuses, qBad, sBad, bookMismatch, sm2, notes } 按内存格式填充到 out 对象。
     *
     * @param {object} out       需要填充的内存容器（原地修改）
     *   out.statuses / out.qBad / out.sBad / out.bookMismatch / out.sm2 / out.notes
     * @param {number} offset    该章在合并章节中的起始偏移
     */
    readIntoMemory: function (out, offset) {
      var ch = this.ch;
      offset = offset || 0;
      var len = ch.ownTotal || ch.total || 0;
      var data = this.load();

      for (var i = 0; i < len; i++) {
        var slug = ch.getQuestionSlug ? ch.getQuestionSlug(i) : null;
        if (!slug) continue;
        var q = data[slug];
        if (!q) continue;

        var memIdx = offset + i;

        if (q.status !== undefined && out.statuses) out.statuses[memIdx] = q.status;
        if (q.qbad && out.qBad) out.qBad[memIdx] = true;
        if (q.sbad && out.sBad) out.sBad[memIdx] = true;
        if (q.mismatch && out.bookMismatch) out.bookMismatch[memIdx] = true;
        if (q.sm2 && out.sm2) out.sm2[memIdx] = q.sm2;

        // notes：写回 notesData 格式（"chId::label"）
        if (q.notes !== undefined && out.notes) {
          var label = ch.labels && ch.labels[i];
          if (label) out.notes[ch.id + '::' + label] = q.notes;
        }
      }
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // MigrationRunner：v1 / v2 → v3 格式无损升级
  //
  // v1 格式：多个独立 key（ch.id_suffix_status, ch.id_suffix_qbad, sm2_subj_chid）
  //          值为 JSON 对象，key 为数字索引或 slug 混合
  // v2 格式：status::<chuid> / sm2::<chuid>（38220b4e 引入）
  //          值同 v1，key 可能是 slug 或 slug+数字 双写
  // v3 格式：kaoyan.q.<chuid>（本模块）
  //          key 严格为 slug，不含纯数字 key
  // ─────────────────────────────────────────────────────────────────────────────
  var MigrationRunner = {
    STORAGE_VERSION_KEY: 'kaoyan.g.storage_version',
    TARGET_VERSION: 3,

    getCurrentVersion: function () {
      try {
        var v = parseInt(localStorage.getItem(this.STORAGE_VERSION_KEY), 10);
        return isNaN(v) ? 0 : v;
      } catch (e) {
        return 0;
      }
    },

    needsMigration: function () {
      return this.getCurrentVersion() < this.TARGET_VERSION;
    },

    /**
     * 从旧格式 JSON 对象中，按 slug 优先级提取值，**拒绝纯数字 key**。
     * 用于 v1/v2 → v3 升级时的读取。
     *
     * @param {object} obj     旧格式 JSON 对象
     * @param {object} ch      章节对象（含 labels / getQuestionSlug）
     * @param {number} len     该段题目数量
     * @returns {object}       { slug → value }（纯数字 key 已过滤）
     */
    _extractBySlug: function (obj, ch, len) {
      if (!obj) return {};
      var hasSemanticKeys = false;
      var oKeys = Object.keys(obj);
      for (var ki = 0; ki < oKeys.length; ki++) {
        if (!/^\d+$/.test(oKeys[ki])) { hasSemanticKeys = true; break; }
      }

      var result = {};
      for (var i = 0; i < len; i++) {
        var slug = ch.getQuestionSlug ? ch.getQuestionSlug(i) : null;
        var label = ch.labels && ch.labels[i];
        var val = undefined;

        if (slug && obj[slug] !== undefined) val = obj[slug];
        else if (label && obj[label] !== undefined) val = obj[label];
        // 只有当整个对象都是纯数字 key 时，才允许 fallback 到数字索引
        else if (!hasSemanticKeys && obj[i] !== undefined) val = obj[i];

        if (val !== undefined && slug && DataValidator.validateSlug(slug)) {
          result[slug] = val;
        }
      }
      return result;
    },

    /**
     * 对单个章节执行 v1/v2 → v3 迁移。
     * 不删除旧 key（留 30 天缓冲，storage_sync.js 负责文件级备份）。
     *
     * @param {object} ch         章节对象
     * @param {string} subjId     科目 ID（用于拼 v1 key）
     * @param {string} storageSuffix  科目存储后缀（如 'math', '822'）
     */
    runForChapter: function (ch, subjId, storageSuffix) {
      if (!ch || !ch.uid) return;
      var store = new ChapterStore(ch);

      var len = ch.ownTotal || ch.total || 0;
      if (len === 0) return;

      var rawExisting = store._loadRaw();
      var merged = rawExisting ? Object.assign({}, store.load()) : {};

      // ── 读 v2 语义键格式（status::<uid> / sm2::<uid> / qbad::<uid> 等）──
      var v2Types = {
        status: 'status::',
        qbad: 'qbad::',
        sbad: 'sbad::',
        mismatch: 'mismatch::',
        sm2: 'sm2::'
      };
      var v2Data = {};
      for (var type in v2Types) {
        try {
          var raw = localStorage.getItem(v2Types[type] + ch.uid);
          v2Data[type] = raw ? JSON.parse(raw) : null;
        } catch (e) { v2Data[type] = null; }
      }

      // ── 读 v1 旧格式键 ──
      var v1Data = {};
      try { v1Data.status = JSON.parse(localStorage.getItem(ch.id + '_' + storageSuffix + '_status')); } catch (e) {}
      try { v1Data.qbad   = JSON.parse(localStorage.getItem(ch.id + '_' + storageSuffix + '_qbad'));   } catch (e) {}
      try { v1Data.sbad   = JSON.parse(localStorage.getItem(ch.id + '_' + storageSuffix + '_sbad'));   } catch (e) {}
      try { v1Data.mismatch = JSON.parse(localStorage.getItem(ch.id + '_' + storageSuffix + '_book_mismatch')); } catch (e) {}
      try {
        var sm2RawV1 = localStorage.getItem('sm2_' + subjId + '_' + ch.id);
        // shu1 → math 历史兼容
        if (!sm2RawV1 && subjId === 'math') sm2RawV1 = localStorage.getItem('sm2_shu1_' + ch.id);
        v1Data.sm2 = sm2RawV1 ? JSON.parse(sm2RawV1) : null;
      } catch (e) {}

      // notes v1：<chId>_<suffix>_notes，键为 label
      var notesObj = null;
      try { notesObj = JSON.parse(localStorage.getItem(ch.id + '_' + storageSuffix + '_notes')); } catch (e) {}

      var changed = !rawExisting;

      // ── 合并：v3 已有优先，其次 v2，最后 v1 ──
      for (var i = 0; i < len; i++) {
        var slug = ch.getQuestionSlug ? ch.getQuestionSlug(i) : null;
        if (!DataValidator.validateSlug(slug)) continue;

        var statusSlugs = this._extractBySlug(v2Data.status || v1Data.status, ch, len);
        var qbadSlugs   = this._extractBySlug(v2Data.qbad   || v1Data.qbad,   ch, len);
        var sbadSlugs   = this._extractBySlug(v2Data.sbad   || v1Data.sbad,   ch, len);
        var mismatchSlugs = this._extractBySlug(v2Data.mismatch || v1Data.mismatch, ch, len);
        var sm2Slugs    = this._extractBySlug(v2Data.sm2    || v1Data.sm2,    ch, len);

        var existingEntry = merged[slug] || {};
        var entry = Object.assign({}, existingEntry);

        if (entry.status === undefined && statusSlugs[slug] !== undefined && DataValidator.validateStatus(statusSlugs[slug])) {
          entry.status = statusSlugs[slug];
          changed = true;
        }
        if (!entry.qbad && qbadSlugs[slug]) { entry.qbad = true; changed = true; }
        if (!entry.sbad && sbadSlugs[slug]) { entry.sbad = true; changed = true; }
        if (!entry.mismatch && mismatchSlugs[slug]) { entry.mismatch = true; changed = true; }
        if (!entry.sm2 && sm2Slugs[slug] && DataValidator.validateSm2(sm2Slugs[slug])) { entry.sm2 = sm2Slugs[slug]; changed = true; }

        if (!entry.notes && notesObj) {
          var label = ch.labels && ch.labels[i];
          if (label && notesObj[label] !== undefined) { entry.notes = notesObj[label]; changed = true; }
        }

        if (Object.keys(entry).length > 0) merged[slug] = entry;
      }

      // ── 写入 v3 格式（仅在有新字段被合并或初次创建时写入）──
      if (changed && Object.keys(merged).length > 0) {
        store.save(merged);
      }
    },

    /**
     * 对所有科目的所有章节执行迁移（异步，逐章节处理避免主线程阻塞）。
     * 完成后写入版本号。
     *
     * @param {Array}  subjects   SUBJECTS 数组
     * @param {function} onProgress  可选回调 (doneCount, totalCount)
     * @param {function} onComplete  完成回调
     */
    runAll: function (subjects, onProgress, onComplete) {
      if (!this.needsMigration()) {
        if (onComplete) onComplete(false); // false = 无需迁移
        return;
      }

      var self = this;
      var tasks = [];
      subjects.forEach(function (subj) {
        if (!subj || !subj.chapters) return;
        subj.chapters.forEach(function (ch) {
          if (ch.total > 0) {
            tasks.push({ ch: ch, subjId: subj.id, suffix: subj.storageSuffix });
          }
        });
      });

      var done = 0;
      var total = tasks.length;

      function processNext() {
        if (done >= total) {
          // 所有章节处理完毕，清理所有旧魔数存储键，实现 SSOT 纯净存储
          self.purgeLegacyKeys();
          try {
            localStorage.setItem(self.STORAGE_VERSION_KEY, String(self.TARGET_VERSION));
            localStorage.setItem('kaoyan.g.migrated_at', new Date().toISOString());
          } catch (e) {}
          if (onComplete) onComplete(true); // true = 执行了迁移
          return;
        }
        var task = tasks[done];
        try {
          self.runForChapter(task.ch, task.subjId, task.suffix);
        } catch (e) {
          console.warn('[MigrationRunner] 章节迁移失败:', task.ch.uid, e);
        }
        done++;
        if (onProgress) onProgress(done, total);
        // 使用 setTimeout 让出主线程，避免大批章节时阻塞 UI
        setTimeout(processNext, 0);
      }

      processNext();
    },

    /**
     * 彻底清除所有历史旧魔数存储键（不再保留冗余双写与脏数据）
     */
    purgeLegacyKeys: function () {
      var keysToRemove = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (!k) continue;
        if (
          /^(?:ch|m\d+).*_(?:status|qbad|sbad|book_mismatch|notes)$/.test(k) ||
          /^sm2_/.test(k) ||
          /^(?:status|sm2|notes|qbad|sbad|mismatch)::/.test(k) ||
          /^(?:kaoyan_resume|kaoyan_ui_filters|shu1_ui_solution)$/.test(k) ||
          /^(?:math|822|english)_ui_solution$/.test(k)
        ) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(function (k) {
        try { localStorage.removeItem(k); } catch (e) {}
      });
      console.log('[StorageV3] 已彻底清理 ' + keysToRemove.length + ' 个历史旧魔数存储键，实现 SSOT 纯净存储。');
      return keysToRemove.length;
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // ResumeStore：断点续接（改为存 slug，插题后恢复位置不会漂移）
  //
  // 格式（kaoyan.g.resume）：
  // {
  //   "$v": 2,
  //   "<subjectId>": { ch: "<chapterId>", slug: "<questionSlug>", sub: bool },
  //   "<subjectId>::<wb>": { ch: "<chapterId>", slug: "<questionSlug>", sub: bool },
  //   "<subjectId>::ch::<chapterId>": { slug: "<questionSlug>", sub: bool }
  // }
  // ─────────────────────────────────────────────────────────────────────────────
  var ResumeStore = {
    _RESUME_KEY: 'kaoyan.g.resume',
    _load: function () {
      try {
        var raw = localStorage.getItem(this._RESUME_KEY);
        return raw ? (JSON.parse(raw) || {}) : {};
      } catch (e) {
        return {};
      }
    },

    _save: function (map) {
      map.$v = 2;
      safeLSSet(this._RESUME_KEY, JSON.stringify(map));
    },

    /**
     * 保存断点。slugOrIdx：优先用 slug，无法获取时退回 idx（兼容过渡期）。
     */
    save: function (subjId, chapterId, ch, idx, subMode) {
      var map = this._load();
      var slug = (ch && ch.getQuestionSlug) ? ch.getQuestionSlug(idx) : null;
      var wb = ch ? ch.wb : '';

      var entry = { ch: chapterId, sub: !!subMode };
      if (DataValidator.validateSlug(slug)) entry.slug = slug;
      else entry.idx = idx;

      map[subjId] = entry;
      if (wb) map[subjId + '::' + wb] = entry;
      map[subjId + '::ch::' + chapterId] = { sub: !!subMode, slug: entry.slug, idx: entry.idx };

      this._save(map);
    },

    /**
     * 读取章节级断点，返回 { idx, sub } 或 null。
     * 优先用 slug 解析，兼容旧 idx 格式。
     */
    loadChapter: function (subjId, chapterId, ch) {
      var map = this._load();
      var r = map[subjId + '::ch::' + chapterId];
      if (!r) return null;
      if (!ch || ch.total === 0) return null;

      var idx = -1;
      // 优先用 slug 解析（防漂移）
      if (r.slug && DataValidator.validateSlug(r.slug) && ch.getIdxBySlug) {
        idx = ch.getIdxBySlug(r.slug);
      }
      // fallback 到旧 idx
      if (idx < 0 && r.idx !== undefined) idx = r.idx;
      if (idx < 0) return null;

      idx = Math.min(Math.max(0, idx), ch.total - 1);
      return { idx: idx, sub: !!r.sub };
    },

    /**
     * 读取科目级断点，返回 { ch, idx, sub } 或 null。
     */
    loadSubject: function (subjId, chapters) {
      // shu1 → math 历史兼容
      if (subjId === 'shu1') subjId = 'math';
      var map = this._load();
      var r = map[subjId];
      // 旧 key 兼容
      if (!r && subjId === 'math') r = map['shu1'];
      if (!r || !r.ch) return null;

      var ch = null;
      for (var i = 0; i < chapters.length; i++) {
        if (chapters[i].id === r.ch) { ch = chapters[i]; break; }
      }
      if (!ch || ch.total === 0) return null;

      var idx = -1;
      if (r.slug && DataValidator.validateSlug(r.slug) && ch.getIdxBySlug) {
        idx = ch.getIdxBySlug(r.slug);
      }
      if (idx < 0 && r.idx !== undefined) idx = r.idx;
      if (idx < 0) idx = 0;
      idx = Math.min(Math.max(0, idx), ch.total - 1);

      return { ch: r.ch, idx: idx, sub: !!r.sub };
    },

    /**
     * 读取书籍级断点，返回 { ch, idx, sub } 或 null。
     */
    loadBook: function (subjId, wb, chapters) {
      if (subjId === 'shu1') subjId = 'math';
      var map = this._load();
      var key = subjId + '::' + wb;
      var r = map[key];
      // shu1 旧 key 兼容
      if (!r && subjId === 'math') r = map['shu1::' + wb];
      if (!r || !r.ch) return null;

      var ch = null;
      for (var i = 0; i < chapters.length; i++) {
        if (chapters[i].id === r.ch && chapters[i].wb === wb) { ch = chapters[i]; break; }
      }
      if (!ch || ch.total === 0) return null;

      var idx = -1;
      if (r.slug && DataValidator.validateSlug(r.slug) && ch.getIdxBySlug) {
        idx = ch.getIdxBySlug(r.slug);
      }
      if (idx < 0 && r.idx !== undefined) idx = r.idx;
      if (idx < 0) idx = 0;
      idx = Math.min(Math.max(0, idx), ch.total - 1);

      return { ch: r.ch, idx: idx, sub: !!r.sub };
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 暴露全局统一标准 StorageEngine（并保留 StorageV3 别名以保持引用稳定）
  // ─────────────────────────────────────────────────────────────────────────────
  window.StorageEngine = window.StorageV3 = {
    ChapterStore: ChapterStore,
    GlobalStore: GlobalStore,
    UiStore: UiStore,
    ResumeStore: ResumeStore,
    MigrationRunner: MigrationRunner,
    DataValidator: DataValidator
  };

})();
