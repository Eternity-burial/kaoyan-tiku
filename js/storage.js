/**
 * 考研题库 · 存储引擎 (StorageEngine)
 *
 * 规范原则：
 *   1. 单一可信数据源 (SSOT)：存储键严格为规范题目 slug（物理切图文件名去扩展名），彻底拒绝任何纯数字键。
 *   2. 章节实体与数据原子化：每个章节的所有属性 (status / qbad / sbad / mismatch / sm2 / notes) 合并持久化。
 *   3. 内存与磁盘解耦：UI/内存交互按当前视图索引操作，磁盘持久化通过 slug 实现 100% 防漂移与抗错位。
 *   4. 零历史兼容负担：不维护旧版数字索引及过渡格式，纯净自解释架构。
 *
 * 键空间规范：
 *   kaoyan.q.<chapterUid>  — 题目数据
 *   kaoyan.g.<name>        — 全局数据（resume / filters / topics / affinity / study_log / theme）
 *   kaoyan.ui.<subjectId>  — UI 偏好
 *   annot_<imgUrl>         — 标注数据
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
        console.warn('[StorageEngine] localStorage 已满，无法保存:', key);
      } else {
        console.warn('[StorageEngine] 写入失败:', key, e);
      }
      return false;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DataValidator：数据完整性与抗漂移校验
  // ─────────────────────────────────────────────────────────────────────────────
  var VALID_STATUS_VALUES = ['proficient', 'familiar', 'vague', 'rusty', 'wrong', null, undefined, ''];

  var DataValidator = {
    /**
     * 校验 questionSlug：必须是非空字符串，且绝对不能是纯数字。
     * 纯数字 slug 会在插题后产生数字索引漂移，一律拒绝。
     */
    validateSlug: function (slug) {
      if (!slug || typeof slug !== 'string') return false;
      if (/^\d+$/.test(slug)) return false;
      return true;
    },

    validateStatus: function (val) {
      return VALID_STATUS_VALUES.indexOf(val) !== -1;
    },

    validateSm2: function (rec) {
      if (!rec || typeof rec !== 'object') return false;
      if (rec.ef !== undefined && typeof rec.ef !== 'number') return false;
      if (rec.interval !== undefined && typeof rec.interval !== 'number') return false;
      return true;
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // GlobalStore：管理 kaoyan.g.* 全局状态
  // ─────────────────────────────────────────────────────────────────────────────
  var GlobalStore = {
    _key: function (name) { return 'kaoyan.g.' + name; },

    get: function (name) {
      try {
        var raw = localStorage.getItem(this._key(name));
        if (raw) return JSON.parse(raw);
        return null;
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
  // UiStore：管理 kaoyan.ui.* UI 偏好
  // ─────────────────────────────────────────────────────────────────────────────
  var UiStore = {
    _key: function (subjectId) { return 'kaoyan.ui.' + subjectId; },

    get: function (subjectId) {
      try {
        var raw = localStorage.getItem(this._key(subjectId));
        if (raw) return JSON.parse(raw);
        return null;
      } catch (e) {
        return null;
      }
    },

    set: function (subjectId, val) {
      safeLSSet(this._key(subjectId), JSON.stringify(val));
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // ChapterStore：按章节规范 UID 管理题目数据
  // ─────────────────────────────────────────────────────────────────────────────
  function ChapterStore(ch) {
    if (!ch || !ch.uid) {
      throw new Error('[ChapterStore] 章节对象缺少 uid，无法初始化');
    }
    this.ch = ch;
    this.key = 'kaoyan.q.' + ch.uid;
    this._cache = null;
    this._dirty = false;
  }

  ChapterStore.prototype = {
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

    invalidate: function () {
      this._cache = null;
      this._dirty = false;
    },

    load: function () {
      if (this._cache) return this._cache;
      var raw = this._loadRaw();
      var result = {};
      if (raw) {
        for (var k in raw) {
          if (!Object.prototype.hasOwnProperty.call(raw, k)) continue;
          if (k.charAt(0) === '$') continue;
          if (!DataValidator.validateSlug(k)) continue;
          result[k] = raw[k];
        }
      }
      this._cache = result;
      return result;
    },

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

    setQuestion: function (slug, fields) {
      if (!DataValidator.validateSlug(slug)) {
        console.warn('[ChapterStore] setQuestion: 无效 slug，已拒绝:', slug);
        return false;
      }
      var data = this.load();
      data[slug] = Object.assign({}, data[slug] || {}, fields);
      var q = data[slug];
      if (q.status === null || q.status === undefined || q.status === '') delete q.status;
      if (!q.qbad) delete q.qbad;
      if (!q.sbad) delete q.sbad;
      if (!q.mismatch) delete q.mismatch;
      if (!q.sm2) delete q.sm2;
      if (!q.notes) delete q.notes;
      if (Object.keys(q).length === 0) delete data[slug];
      return this.save(data);
    },

    getQuestion: function (slug) {
      if (!DataValidator.validateSlug(slug)) return {};
      var data = this.load();
      if (data[slug]) return data[slug];
      if (this.ch && this.ch.labels) {
        for (var i = 0; i < this.ch.labels.length; i++) {
          var s = this.ch.getQuestionSlug ? this.ch.getQuestionSlug(i) : null;
          if (s === slug) {
            var legacy = 'pb_' + String(this.ch.labels[i]).trim().replace(/\s+/g, '_');
            if (data[legacy]) return data[legacy];
            break;
          }
        }
      }
      return {};
    },

    writeFromMemory: function (opts) {
      var ch = this.ch;
      var offset = opts.offset || 0;
      var len = opts.len || (ch.ownTotal || ch.total || 0);
      var data = this.load();

      for (var i = 0; i < len; i++) {
        var slug = ch.getQuestionSlug ? ch.getQuestionSlug(i) : null;
        if (!DataValidator.validateSlug(slug)) continue;

        var memIdx = offset + i;
        var legacySlug = (ch.labels && ch.labels[i]) ? ('pb_' + String(ch.labels[i]).trim().replace(/\s+/g, '_')) : null;
        var q = Object.assign({}, (legacySlug && data[legacySlug]) || {}, data[slug] || {});

        if (opts.statuses) {
          var s = opts.statuses[memIdx];
          if (s !== undefined && s !== null && s !== '' && DataValidator.validateStatus(s)) {
            q.status = s;
          } else {
            delete q.status;
          }
        }

        if (opts.qBad) {
          if (opts.qBad[memIdx]) q.qbad = true;
          else delete q.qbad;
        }

        if (opts.sBad) {
          if (opts.sBad[memIdx]) q.sbad = true;
          else delete q.sbad;
        }

        if (opts.bookMismatch) {
          if (opts.bookMismatch[memIdx]) q.mismatch = true;
          else delete q.mismatch;
        }

        if (opts.sm2) {
          var sm = opts.sm2[memIdx];
          if (sm && DataValidator.validateSm2(sm)) {
            q.sm2 = sm;
          } else {
            delete q.sm2;
          }
        }

        if (opts.notes) {
          var label = ch.labels && ch.labels[i];
          var noteKey = ch.id + '::' + label;
          if (label) {
            var n = opts.notes[noteKey];
            if (n !== undefined && n !== null && n !== '') {
              q.notes = n;
            } else {
              delete q.notes;
            }
          }
        }

        if (Object.keys(q).length > 0) {
          data[slug] = q;
        } else {
          delete data[slug];
        }
        if (legacySlug && legacySlug !== slug && data[legacySlug]) {
          delete data[legacySlug];
        }
      }

      return this.save(data);
    },

    readIntoMemory: function (out, offset) {
      var ch = this.ch;
      offset = offset || 0;
      var len = ch.ownTotal || ch.total || 0;
      var data = this.load();

      for (var i = 0; i < len; i++) {
        var slug = ch.getQuestionSlug ? ch.getQuestionSlug(i) : null;
        if (!slug) continue;
        var q = data[slug];
        if (!q && ch.labels && ch.labels[i]) {
          var legacySlug = 'pb_' + String(ch.labels[i]).trim().replace(/\s+/g, '_');
          if (data[legacySlug]) q = data[legacySlug];
        }
        if (!q) continue;

        var memIdx = offset + i;

        if (q.status !== undefined && out.statuses) out.statuses[memIdx] = q.status;
        if (q.qbad && out.qBad) out.qBad[memIdx] = true;
        if (q.sbad && out.sBad) out.sBad[memIdx] = true;
        if (q.mismatch && out.bookMismatch) out.bookMismatch[memIdx] = true;
        if (q.sm2 && out.sm2) out.sm2[memIdx] = q.sm2;

        if (q.notes !== undefined && out.notes) {
          var label = ch.labels && ch.labels[i];
          if (label) out.notes[ch.id + '::' + label] = q.notes;
        }
      }
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // ResumeStore：断点位置精准恢复（基于题目的规范 slug，彻底防止插题漂移）
  // ─────────────────────────────────────────────────────────────────────────────
  var ResumeStore = {
    _RESUME_KEY: 'kaoyan.g.resume',

    _load: function () {
      try {
        var raw = localStorage.getItem(this._RESUME_KEY);
        if (raw) return JSON.parse(raw) || {};
        return {};
      } catch (e) {
        return {};
      }
    },

    _save: function (map) {
      map.$v = 2;
      safeLSSet(this._RESUME_KEY, JSON.stringify(map));
    },

    save: function (subjId, chapterId, ch, idx, subMode) {
      var map = this._load();
      // 伴章自愈：若外部传入的是伴章（如 1000题 或 李范习题），自动重定向为母章与题号偏移
      var host = null;
      if (ch && !ch.q1000Total && typeof window !== 'undefined' && window.SUBJECTS) {
        var subObj = window.SUBJECTS.find(function(s) { return s.id === subjId; });
        if (subObj && subObj.chapters) {
          host = subObj.chapters.find(function(c) { return c.q1000Id === chapterId; });
        }
      }
      if (host) {
        chapterId = host.id;
        idx = (host.ownTotal || 0) + idx;
        ch = host;
      }

      var slug = (ch && ch.getQuestionSlug) ? ch.getQuestionSlug(idx) : null;
      var wb = ch ? ch.wb : '';

      var entry = { ch: chapterId, sub: !!subMode, slug: slug, idx: idx };

      map[subjId] = entry;
      if (wb) map[subjId + '::' + wb] = entry;
      map[subjId + '::ch::' + chapterId] = { sub: !!subMode, slug: slug, idx: idx };

      // 清理历史伴章残留键
      delete map[subjId + '::1000题'];
      delete map[subjId + '::李范习题'];

      this._save(map);
    },

    loadChapter: function (subjId, chapterId, ch) {
      var map = this._load();
      var r = map[subjId + '::ch::' + chapterId];
      if (!r || !ch || ch.total === 0) return null;

      var idx = (r.slug && ch.getIdxBySlug) ? ch.getIdxBySlug(r.slug) : -1;
      if (idx < 0 && typeof r.idx === 'number') {
        idx = r.idx;
      }
      if (idx < 0) return null;

      idx = Math.min(Math.max(0, idx), ch.total - 1);
      return { idx: idx, sub: !!r.sub };
    },

    loadSubject: function (subjId, chapters) {
      var map = this._load();
      var r = map[subjId];
      if (!r || !r.ch) return null;

      var ch = null;
      for (var i = 0; i < chapters.length; i++) {
        if (chapters[i].id === r.ch) {
          ch = chapters[i];
          break;
        }
      }
      if (!ch || ch.total === 0) return null;

      // 伴章自愈：若历史断点保存的是 1000 题或李范习题伴章，自动重定向至母章
      if (ch && !ch.q1000Total) {
        var host = chapters.find(function (c) { return c.q1000Id === ch.id; });
        if (host) {
          var origSlug = r.slug;
          var qIdx = (origSlug && ch.getIdxBySlug) ? ch.getIdxBySlug(origSlug) : (typeof r.idx === 'number' ? r.idx : 0);
          if (qIdx < 0) qIdx = 0;
          return {
            ch: host.id,
            idx: Math.min(host.total - 1, (host.ownTotal || 0) + qIdx),
            sub: !!r.sub
          };
        }
      }

      var idx = (r.slug && ch.getIdxBySlug) ? ch.getIdxBySlug(r.slug) : -1;
      if (idx < 0 && typeof r.idx === 'number') {
        idx = r.idx;
      }
      if (idx < 0) idx = 0;
      idx = Math.min(Math.max(0, idx), ch.total - 1);

      return { ch: ch.id, idx: idx, sub: !!r.sub };
    },

    loadBook: function (subjId, wb, chapters) {
      var map = this._load();
      // 若请求 1000题 或 李范习题，自动映射至母章书名
      if (wb === '1000题') wb = '基础30讲';
      if (wb === '李范习题') wb = '李范全书';

      var key = subjId + '::' + wb;
      var r = map[key];
      if (!r || !r.ch) return null;

      var ch = null;
      for (var i = 0; i < chapters.length; i++) {
        if (chapters[i].id === r.ch && chapters[i].wb === wb) {
          ch = chapters[i];
          break;
        }
      }
      if (!ch || ch.total === 0) return null;

      var idx = (r.slug && ch.getIdxBySlug) ? ch.getIdxBySlug(r.slug) : -1;
      if (idx < 0 && typeof r.idx === 'number') {
        idx = r.idx;
      }
      if (idx < 0) idx = 0;
      idx = Math.min(Math.max(0, idx), ch.total - 1);

      return { ch: ch.id, idx: idx, sub: !!r.sub };
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 暴露全局统一标准 StorageEngine
  // ─────────────────────────────────────────────────────────────────────────────
  window.StorageEngine = {
    ChapterStore: ChapterStore,
    GlobalStore: GlobalStore,
    UiStore: UiStore,
    ResumeStore: ResumeStore,
    DataValidator: DataValidator
  };

})();
