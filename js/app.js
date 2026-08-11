
    // ===== 章节数据（已移至 js/chapters.js）=====

    let curSubjectId = 'shu1';
    let curSubject = SUBJECTS[0];
    let CHAPTERS = curSubject.chapters;   // 当前科目章节数组（原 const 改 let，切换科目时重赋值）
    function getCurrentSubject() { return curSubject; }
// ===== 状态变量 (0-based) =====
    let currentChapterId = 'ch1';
    let current = 0;
    let showSolution = true;
    let defaultShowSolution = true;
    let statuses = {};
    let qBad = {};   // R键：题目图不达标  { idx: true }
    let sBad = {};   // T键：解析图不达标  { idx: true }
    let currentFilters = new Set(['all']);
    let subMode = false; // F键：小题选择模式（仅当前题组含子题时生效）
    let visualRows = []; // W/S 视觉行映射，每个元素是一个数组包含该行的 group.startIdx

    function isAllFilterActive() {
      return currentFilters.has('all') || currentFilters.size === 0;
    }

    function getChapter() { return CHAPTERS.find(c => c.id === currentChapterId); }
    function chapterById(id) { return CHAPTERS.find(c => c.id === id); }

    // ===== 合并章节（1000题并入30讲/36讲）辅助 =====
    // 当前索引所属分区：idx 落在合并章节的 1000题 段 → '1000题'；否则按标签分类
    function partOfIdx(idx) {
      const ch = getChapter();
      if (ch && ch.q1000Total && idx >= ch.ownTotal) return '1000题';
      return classifyLabel(ch ? ch.labels[idx] : '');
    }
    // 笔记命名空间键：避免「30讲例1-1」与「1000题1-1」笔记键冲突。
    // 返回 '<源章节id>::<标签>'，源章节 = 1000题伴章（1000段）或本章（自身段）。
    function notesKeyFor(idx) {
      const ch = getChapter();
      const label = ch.labels[idx];
      if (ch.q1000Total && idx >= ch.ownTotal) {
        return chapterById(ch.q1000Id).id + '::' + label;
      }
      return ch.id + '::' + label;
    }

    // ===== 题组（父题/子题）解析 =====
    // 去掉 label 末尾括号及内容（支持 (1)、(a)、(I)、全角括号），得到父题号
    function stripSubSuffix(label) { return String(label).replace(/\s*[\(（][^\)）]*[\)）]\s*$/, ''); }
    // 提取 label 末尾括号内容，如 '3-4(1)' -> '(1)'；无括号返回原 label
    function subSuffix(label) { const m = String(label).match(/[\(（][^\)）]*[\)）]\s*$/); return m ? m[0].trim() : String(label); }

    // 为章节计算 subGroups / groupForIdx（懒计算，缓存在章节对象上）
    function ensureGroups(ch) {
      if (ch.subGroups && ch.groupForIdx) return;
      const labels = ch.labels || [];
      const groups = [];
      let i = 0;
      while (i < labels.length) {
        const parent = stripSubSuffix(labels[i]);
        const hasParen = parent !== labels[i];
        let j = i + 1;
        if (hasParen) {
          while (j < labels.length && stripSubSuffix(labels[j]) === parent && stripSubSuffix(labels[j]) !== labels[j]) j++;
        }
        groups.push({ parentLabel: parent, startIdx: i, count: j - i, isParent: hasParen && (j - i) > 1 });
        i = j;
      }
      ch.subGroups = groups;
      ch.groupForIdx = new Array(labels.length);
      groups.forEach(g => { for (let k = 0; k < g.count; k++) ch.groupForIdx[g.startIdx + k] = g; });
    }

    // 题组内当前筛选下可见的索引列表
    // filteredSet 可传入预计算的筛中索引集合，避免在 renderNav 等热路径中反复调用 getFilteredIndices()。
    // 传入 null 且当前为「全部」筛选时，直接返回整组（跳过 Set 构建）。
    function groupVisibleIndices(g, filteredSet) {
      if (!filteredSet) {
        if (isAllFilterActive()) {
          return Array.from({ length: g.count }, (_, k) => g.startIdx + k);
        }
        filteredSet = new Set(getFilteredIndices());
      }
      const out = [];
      for (let k = 0; k < g.count; k++) { const idx = g.startIdx + k; if (filteredSet.has(idx)) out.push(idx); }
      return out;
    }
    function storageKey() { return currentChapterId + '_' + curSubject.storageSuffix + '_status'; }
    function qBadStorageKey() { return currentChapterId + '_' + curSubject.storageSuffix + '_qbad'; }
    function sBadStorageKey() { return currentChapterId + '_' + curSubject.storageSuffix + '_sbad'; }
    function chapterStatusKey(ch) { return ch.id + '_' + curSubject.storageSuffix + '_status'; }
    function totalQuestions() { return getChapter().total; }

    // ===== 筛选相关 =====
    function updateFilterButtons() {
      document.querySelectorAll('.filter-btn').forEach(b => {
        const active = currentFilters.has(b.dataset.filter);
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }

    function applyFilter(filterKey) {
      if (filterKey === 'all') {
        currentFilters = new Set(['all']);
      } else {
        if (currentFilters.has('all')) currentFilters.delete('all');
        if (currentFilters.has(filterKey)) {
          currentFilters.delete(filterKey);
          if (currentFilters.size === 0) currentFilters.add('all');
        } else {
          currentFilters.add(filterKey);
        }
      }
      updateFilterButtons();
      saveGlobalFilters(); // 筛选状态持久化（跨会话记忆）
      const filtered = getFilteredIndices();
      updateFilterCounts();
      if (filtered.length > 0 && !isFiltered(current)) {
        switchTo(filtered[0]);
      } else {
        renderNav();
      }
    }

    function getFilteredIndices() {
      const ch = getChapter();
      const all = Array.from({ length: ch.total }, function(_, i) { return i; });
      if (isAllFilterActive()) return all;
      return all.filter(function(i) {
        // 带笔记
        if (currentFilters.has('unmarked')) {
          if (notesData[notesKeyFor(i)] || hasQuestionImagesAnnotated(i)) return true;
        }
        const s = statuses[i] || '';
        // 合并筛选：熟练 = proficient(lv5) + familiar(lv4)
        if (currentFilters.has('proficient') && (s === 'proficient' || s === 'familiar')) return true;
        // 模糊 = vague(lv3) + rusty(lv2)
        if (currentFilters.has('vague') && (s === 'vague' || s === 'rusty')) return true;
        // 不会 = wrong(lv1)
        if (currentFilters.has('wrong') && s === 'wrong') return true;
        return false;
      });
    }
    function filteredIndex(idx) { return getFilteredIndices().indexOf(idx); }
    function isFiltered(idx) { return filteredIndex(idx) !== -1; }

    // ===== localStorage 持久化（按书分离：合并章节的自身部分与1000题部分分开存取） =====
    // 合并章节（ch 有 q1000Id）：内存态 statuses/qBad/sBad 用合并索引承载，
    // 保存时按 [本章自身段, 1000题伴章段] 拆到两本书各自的存储键，加载时反向合并。
    // 非合并章节与现状完全一致（单一源）。→ 进度天然按书分开。
    function statusSources() {
      const ch = getChapter();
      // 合并章节：自身段长度为 ownTotal；非合并章节用 total
      const srcs = [{ ch: ch, offset: 0, len: (ch.q1000Total ? ch.ownTotal : ch.total) }];
      if (ch && ch.q1000Id) {
        srcs.push({ ch: chapterById(ch.q1000Id), offset: ch.ownTotal, len: ch.q1000Total });
      }
      return srcs;
    }
    // 通用：按「源章节+偏移」拆合（statuses/qBad/sBad 共用）
    function loadIndexedObj(readRaw) {
      const out = {};
      statusSources().forEach(function (src) {
        let o = {};
        try { o = JSON.parse(readRaw(src.ch)) || {}; } catch (e) { o = {}; }
        for (var k = 0; k < src.len; k++) {
          if (o[k] !== undefined) out[src.offset + k] = o[k];
        }
      });
      return out;
    }
    function saveIndexedObj(obj, writeRaw, removeRaw) {
      statusSources().forEach(function (src) {
        const part = {};
        for (var k = 0; k < src.len; k++) {
          if (obj[src.offset + k] !== undefined) part[k] = obj[src.offset + k];
        }
        const keys = Object.keys(part);
        if (keys.length > 0) writeRaw(src.ch, JSON.stringify(part));
        else if (removeRaw) removeRaw(src.ch); // 空源不写、清掉残留空对象，保持存储干净
      });
    }
    function loadStatuses() {
      statuses = loadIndexedObj(function (ch) { return localStorage.getItem(chapterStatusKey(ch)); });
    }
    function saveStatuses() {
      saveIndexedObj(statuses,
        function (ch, val) { localStorage.setItem(chapterStatusKey(ch), val); },
        function (ch) { localStorage.removeItem(chapterStatusKey(ch)); });
    }
    function loadQBad() {
      qBad = loadIndexedObj(function (ch) { return localStorage.getItem(ch.id + '_' + curSubject.storageSuffix + '_qbad'); });
    }
    function saveQBad() {
      saveIndexedObj(qBad,
        function (ch, val) { localStorage.setItem(ch.id + '_' + curSubject.storageSuffix + '_qbad', val); },
        function (ch) { localStorage.removeItem(ch.id + '_' + curSubject.storageSuffix + '_qbad'); });
    }
    function loadSBad() {
      sBad = loadIndexedObj(function (ch) { return localStorage.getItem(ch.id + '_' + curSubject.storageSuffix + '_sbad'); });
    }
    function saveSBad() {
      saveIndexedObj(sBad,
        function (ch, val) { localStorage.setItem(ch.id + '_' + curSubject.storageSuffix + '_sbad', val); },
        function (ch) { localStorage.removeItem(ch.id + '_' + curSubject.storageSuffix + '_sbad'); });
    }

    // ===== 全局 UI 状态持久化（跨会话记忆） =====
    // 全局键：状态筛选（跨章节/科目保持）；科目键：解析显示偏好（showSolution 当前态 + defaultShowSolution 默认态）
    function globalUIFilterKey() { return 'kaoyan_ui_filters'; }
    function uiSolutionStorageKey() { return curSubjectId + '_ui_solution'; }

    function loadGlobalFilters() {
      var saved = null;
      try { saved = JSON.parse(localStorage.getItem(globalUIFilterKey())); } catch (e) { saved = null; }
      if (!saved || !Array.isArray(saved) || saved.length === 0) {
        currentFilters = new Set(['all']);
        return;
      }
      // 只保留合法筛选键；「全部」与其他组合互斥
      var valid = ['all', 'proficient', 'vague', 'wrong', 'unmarked'].filter(function (k) { return saved.indexOf(k) !== -1; });
      if (valid.indexOf('all') !== -1) currentFilters = new Set(['all']);
      else if (valid.length > 0) currentFilters = new Set(valid);
      else currentFilters = new Set(['all']);
    }
    function saveGlobalFilters() {
      try { localStorage.setItem(globalUIFilterKey(), JSON.stringify(Array.from(currentFilters))); } catch (e) {}
    }

    function loadSolutionPref() {
      var v = null;
      try { v = JSON.parse(localStorage.getItem(uiSolutionStorageKey())); } catch (e) { v = null; }
      if (v && typeof v.def === 'boolean') defaultShowSolution = v.def;
      else defaultShowSolution = true;
      if (v && typeof v.show === 'boolean') showSolution = v.show;
      else showSolution = defaultShowSolution;
    }
    function saveSolutionPref() {
      try { localStorage.setItem(uiSolutionStorageKey(), JSON.stringify({ show: !!showSolution, def: !!defaultShowSolution })); } catch (e) {}
    }

    // ===== 笔记数据（按书分离：复合键 '<源章节id>::<label>'） =====
    // 合并章节的 1000题 段笔记落到 1000题 伴章的存储对象（键 1-1），自身段落到本章对象（键 例1-1）。
    // 复合键含源章节 id，天然避免「30讲例1-1」与「1000题1-1」互相覆盖。
    let notesData = {};
    function notesSourceId(idx) {
      const ch = getChapter();
      if (ch.q1000Total && idx >= ch.ownTotal) return chapterById(ch.q1000Id).id;
      return ch.id;
    }
    function loadNotes() {
      const ch = getChapter();
      notesData = {};
      const srcIds = [ch.id];
      if (ch.q1000Id) srcIds.push(ch.q1000Id);
      srcIds.forEach(function (cid) {
        let o = {};
        try { o = JSON.parse(localStorage.getItem(cid + '_' + curSubject.storageSuffix + '_notes')) || {}; } catch (e) { o = {}; }
        for (var k in o) { if (Object.prototype.hasOwnProperty.call(o, k)) notesData[cid + '::' + k] = o[k]; }
      });
    }
    function saveNotes() {
      const ch = getChapter();
      const srcIds = [ch.id];
      if (ch.q1000Id) srcIds.push(ch.q1000Id);
      srcIds.forEach(function (cid) {
        const part = {};
        for (var k in notesData) {
          if (Object.prototype.hasOwnProperty.call(notesData, k) && k.indexOf(cid + '::') === 0) {
            part[k.substring(cid.length + 2)] = notesData[k];
          }
        }
        const key = cid + '_' + curSubject.storageSuffix + '_notes';
        const keys = Object.keys(part);
        if (keys.length > 0) localStorage.setItem(key, JSON.stringify(part));
        else localStorage.removeItem(key); // 空源不写、清残留空对象
      });
    }

    function getStatusClass(idx) {
      const s = statuses[idx];
      if (s === 'proficient') return 'proficient';
      if (s === 'familiar') return 'familiar';
      if (s === 'vague') return 'vague';
      if (s === 'rusty') return 'rusty';
      if (s === 'wrong') return 'wrong';
      return '';
    }

    // ===== 图片路径（按当前科目的 getImgPath） =====
        function getImgPath(idx) {
      const ch = getChapter();
      // 合并章节的 1000题 段：路径路由到 1000题 伴章（标签与目录均为 pb_ 前缀）
      if (ch.q1000Total && idx >= ch.ownTotal) {
        const qc = chapterById(ch.q1000Id);
        return curSubject.getImgPath(qc, qc.labels[idx - ch.ownTotal]);
      }
      return curSubject.getImgPath(ch, ch.labels[idx]);
    }


    // ===== 章节切换 =====
    function switchChapter(chapterId) {
      const ch = CHAPTERS.find(c => c.id === chapterId);
      if (!ch || ch.total === 0) { alert('该章节尚未导入'); return; }
      currentChapterId = chapterId;
      current = 0;
      showSolution = defaultShowSolution;
      subMode = false;
      loadStatuses(); loadQBad(); loadSBad(); loadNotes(); loadSm2();
      // 每次切章先清除错题本返回状态（错题本跳题会在 switchTo 之后重新置位）
      showWrongBookReturnBtn(false);
      // 全局筛选跨章保持：不重置、不按章恢复，仅加载本章数据后定位到第一条筛中题
      // 定位规则：默认落在本章第一个分区（按科目 partOrder）的起始题；
      // 若全局筛选激活且该分区无筛中题，则顺延到后续分区第一条筛中题（否则回退到起点）。
      updateFilterButtons();
      updateFilterCounts();
      const partOrder = getPartOrder();
      let target = 0;
      if (partOrder.length > 0) {
        const firstLabel = classifyLabel(ch.labels[0]);
        if (firstLabel === partOrder[0]) {
          // 起点即第一分区起始：直接落在第一条筛中题（无筛选时即 0）
          const filtered = getFilteredIndices();
          target = filtered.length > 0 ? filtered[0] : 0;
        } else {
          // 起点不在第一分区（如 822 源序 ch2 例题在前、partOrder 习题在前）：
          // 优先落在第一分区的第一条筛中题；无筛中题时顺延到后续分区的第一条筛中题；再不行回退 0
          const filtered = getFilteredIndices();
          const filteredInFirst = filtered.find(i => classifyLabel(ch.labels[i]) === partOrder[0]);
          if (filteredInFirst !== undefined) { target = filteredInFirst; }
          else {
            const other = filtered.find(i => classifyLabel(ch.labels[i]) !== partOrder[0]);
            if (other !== undefined) { target = other; } else { target = 0; }
          }
        }
      }
      renderTitle();
      // switchTo 内部已调用 renderStats + renderNav，此处不重复渲染
      switchTo(target);
    }

    function gotoPrevChapter() {
      let idx = CHAPTERS.findIndex(c => c.id === currentChapterId);
      for (let i = idx - 1; i >= 0; i--) { if (CHAPTERS[i].total > 0) { switchChapter(CHAPTERS[i].id); return; } }
    }
    function gotoNextChapter() {
      let idx = CHAPTERS.findIndex(c => c.id === currentChapterId);
      for (let i = idx + 1; i < CHAPTERS.length; i++) { if (CHAPTERS[i].total > 0) { switchChapter(CHAPTERS[i].id); return; } }
    }

    // ===== 章节标题栏（三级面板式下拉） =====
    function getUniqueWbs() {
      var wbs = [];
      CHAPTERS.forEach(function(c) { if (c.wb && wbs.indexOf(c.wb) === -1) wbs.push(c.wb); });
      return wbs;
    }

    // 关闭所有标题下拉面板
    function closeAllTitlePanels() {
      document.querySelectorAll('.title-trigger.open').forEach(function(t) { t.classList.remove('open'); });
      document.querySelectorAll('.title-panel.open').forEach(function(p) { p.classList.remove('open'); });
    }

    // 填充某个面板的选项
    function fillPanel(panelId, items, idKey, textKey, activeId, onClick) {
      var panel = document.getElementById(panelId);
      panel.innerHTML = '';
      items.forEach(function(item) {
        var btn = document.createElement('button');
        btn.className = 'title-option';
        if ((idKey ? item[idKey] : item) === activeId) btn.classList.add('active');
        btn.textContent = textKey ? item[textKey] : item;
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          closeAllTitlePanels();
          onClick(item);
        });
        panel.appendChild(btn);
      });
    }

    // 书籍展示名称 + 固定排序（按当前科目的 wbOrder）
    function getSortedWbs() {
      var existing = getUniqueWbs();
      var result = [];
      var order = curSubject ? curSubject.wbOrder : [];
      order.forEach(function(entry) {
        if (existing.indexOf(entry.wb) !== -1) result.push(entry);
      });
      return result;
    }

    // 填充书籍面板
    // 1000题已并入 30讲/36讲：标题栏书籍下拉不再单独列 1000题（进度统计仍按书分开）。
    function fillWbPanel(activeWb) {
      var entries = getSortedWbs().filter(function(e) { return e.wb !== '1000题'; });
      fillPanel('panelWb', entries, 'wb', 'label', activeWb, function(entry) {
        document.getElementById('txtWb').textContent = entry.label;
        // 切书先尝试恢复该书的停靠位置；无记录才落到第一学科第一章节
        if (applyResumeBook(entry.wb)) return;
        var subjs = getSortedSubjs(entry.wb);
        if (subjs.length > 0) {
          var firstSubj = subjs[0];
          document.getElementById('txtSubj').textContent = firstSubj;
          fillSubjPanel(entry.wb, firstSubj);
          var firstCh = CHAPTERS.find(function(c) { return c.wb === entry.wb && c.subj === firstSubj; });
          if (firstCh) {
            document.getElementById('txtChapter').textContent = firstCh.short;
            fillChapterPanel(entry.wb, firstSubj, firstCh.id);
            switchChapter(firstCh.id);
          }
        }
      });
    }

    // 学科固定排序（按当前科目的 subjOrder）
    function getSortedSubjs(wb) {
      var subjs = [];
      CHAPTERS.forEach(function(c) { if (c.wb === wb && c.subj && subjs.indexOf(c.subj) === -1) subjs.push(c.subj); });
      var sorted = [];
      var order = curSubject ? curSubject.subjOrder : [];
      order.forEach(function(s) { if (subjs.indexOf(s) !== -1) sorted.push(s); });
      subjs.forEach(function(s) { if (sorted.indexOf(s) === -1) sorted.push(s); }); // 未列出的学科放末尾
      return sorted;
    }

    // 填充学科面板
    function fillSubjPanel(wb, activeSubj) {
      var subjs = getSortedSubjs(wb);
      fillPanel('panelSubj', subjs, null, null, activeSubj, function(subj) {
        document.getElementById('txtSubj').textContent = subj;
        var firstCh = CHAPTERS.find(function(c) { return c.wb === wb && c.subj === subj; });
        if (firstCh) {
          document.getElementById('txtChapter').textContent = firstCh.short;
          fillChapterPanel(wb, subj, firstCh.id);
          switchChapter(firstCh.id);
        }
      });
    }

    // 填充章节面板
    // 只列「浏览章节」：排除 wb==='1000题' 的章节（1000题 已并入 30讲/36讲 题目区，
    // 其章节仅作为数据源/统计单元；第0讲已改 wb='基础30讲' 会正常列出）。
    function fillChapterPanel(wb, subj, activeId) {
      var chs = CHAPTERS.filter(function(c) { return c.wb === wb && c.subj === subj && c.wb !== '1000题'; });
      fillPanel('panelChapter', chs, 'id', 'short', activeId, function(ch) {
        document.getElementById('txtChapter').textContent = ch.short;
        switchChapter(ch.id);
      });
    }

    function renderTitle() {
      var ch = getChapter();
      var wb = ch.wb || '';
      var subj = ch.subj || '';

      var wbLabel = getWbLabel(wb); // 按当前科目的 wbOrder 映射显示名
      document.getElementById('txtWb').textContent = wbLabel;
      document.getElementById('txtSubj').textContent = subj;
      document.getElementById('txtChapter').textContent = ch.short;

      fillWbPanel(wb);
      fillSubjPanel(wb, subj);
      fillChapterPanel(wb, subj, ch.id);

      // 学科下拉可见性：当前书籍仅一个学科时隐藏（822 各书只有「控制工程基础」，标题栏只需 书籍+章节；
      // 数学各书有 高数/线代/概率论 三学科，保留学科下拉）
      var ddSubjEl = document.getElementById('ddSubj');
      if (ddSubjEl) ddSubjEl.style.display = getSortedSubjs(wb).length > 1 ? '' : 'none';
    }

    // 面板展开/收起 + 外部点击关闭
    (function () {
      document.addEventListener('DOMContentLoaded', function () {
        function togglePanel(ddId, trigId) {
          var trig = document.getElementById(trigId);
          var panel = document.getElementById(ddId.replace('dd', 'panel'));
          if (!trig || !panel) return;
          trig.addEventListener('click', function(e) {
            e.stopPropagation();
            var isOpen = panel.classList.contains('open');
            closeAllTitlePanels();
            if (!isOpen) {
              panel.classList.add('open');
              trig.classList.add('open');
            }
          });
        }
        togglePanel('ddWb', 'trigWb');
        togglePanel('ddSubj', 'trigSubj');
        togglePanel('ddChapter', 'trigChapter');
        togglePanel('ddWbWrongbook', 'trigWbWrongbook');

        document.addEventListener('click', function(e) {
          var openPanels = document.querySelectorAll('.title-panel.open');
          if (openPanels.length === 0) return;
          var inside = false;
          openPanels.forEach(function(p) { if (p.parentElement.contains(e.target)) inside = true; });
          if (!inside) closeAllTitlePanels();
        });
      });
    })();

    // ===== 自动分区：从 label 推断所属类别（按当前科目） =====
    // 合并章节（1000题并入）分区顺序为 例题 → 习题 → 1000题；其余章节用科目 partOrder
    function getPartOrder() {
      const ch = getChapter();
      if (ch && ch.q1000Total) return ['例题', '习题', '1000题'];
      return curSubject ? curSubject.partOrder : ['例题', '习题'];
    }

    function classifyLabel(label) {
      return curSubject ? curSubject.classifyLabel(label) : (label.startsWith('例') ? '例题' : '习题');
    }

    // ===== 渲染章节统计面板 =====
    // 合并章节（1000题并入）按书分两块统计：第1块=自身部分，第2块=1000题部分；
    // 进度分别累计，实现「进度按书分开」。非合并章节单块渲染（与现状一致）。
    function renderStats() {
      const ch = getChapter();
      const hasMerge = ch && ch.q1000Total;
      const segs = hasMerge
        ? [{ label: getWbLabel(ch.wb), start: 0, len: ch.ownTotal },
           { label: '1000题', start: ch.ownTotal, len: ch.q1000Total }]
        : [{ label: '', start: 0, len: ch.total }];
      const html = segs.map(function (seg) {
        let lv5 = 0, lv4 = 0, lv3 = 0, lv2 = 0, lv1 = 0, un = 0;
        for (let i = seg.start; i < seg.start + seg.len; i++) {
          const s = statuses[i];
          if (s === 'proficient') lv5++;
          else if (s === 'familiar') lv4++;
          else if (s === 'vague') lv3++;
          else if (s === 'rusty') lv2++;
          else if (s === 'wrong') lv1++;
          else un++;
        }
        const done = lv5 + lv4 + lv3 + lv2 + lv1;
        const pct = seg.len > 0 ? Math.round(done / seg.len * 100) : 0;
        return '<div class="stats-seg">' +
          (seg.label ? '<div class="stats-seg-label">' + seg.label + '</div>' : '') +
          '<div class="stats-bar-wrap"><div class="stats-bar-fill" style="width:' + pct + '%"></div></div>' +
          '<div class="stats-counts">' +
            '<span><span class="sc-dot" style="background:#389E0D"></span>熟练 ' + lv5 + '</span>' +
            '<span><span class="sc-dot" style="background:#7CB305"></span>较熟 ' + lv4 + '</span>' +
            '<span><span class="sc-dot" style="background:#FBC02D"></span>模糊 ' + lv3 + '</span>' +
            '<span><span class="sc-dot" style="background:#F57C00"></span>困难 ' + lv2 + '</span>' +
            '<span><span class="sc-dot" style="background:#D32F2F"></span>不会 ' + lv1 + '</span>' +
            '<span><span class="sc-dot" style="background:#bbb"></span>未做 ' + un + '</span>' +
          '</div>' +
        '</div>';
      }).join('');
      document.getElementById('statsPanel').innerHTML = html;
    }


    // ===== 全局仪表盘（环形热力图） =====
    // 书籍列表按当前科目（数学 4 本 / 822 1 本），用 getSortedWbs()
    var dashboardOpen = false;
    // 全局进度处于详情视图时，用于「返回总览」按钮与鼠标后退键回总览
    var dashboardDetailReturn = false;

    function getBookChapters(wb) {
      // 第0讲（statsWb='1000题' 但 wb 已改 '基础30讲'）按 statsWb 归属统计书
      return CHAPTERS.filter(function(c) { return (c.statsWb || c.wb) === wb && c.total > 0; });
    }

    function getChProgress(ch) {
      var key = chapterStatusKey(ch);
      var statusObj;
      try { statusObj = JSON.parse(localStorage.getItem(key)) || {}; } catch (e) { statusObj = {}; }
      var done = 0;
      // 合并章节只统计自身部分（1000题部分由其伴章章对象统计）→ 进度按书分开
      var len = ch.ownTotal || ch.total;
      for (var i = 0; i < len; i++) {
        var s = statusObj[i];
        if (s === 'proficient' || s === 'familiar' || s === 'vague' || s === 'rusty' || s === 'wrong') done++;
      }
      return { progress: len > 0 ? done / len : 0, done: done, total: len };
    }

    function getChStats(ch) {
      var key = chapterStatusKey(ch);
      var statusObj;
      try { statusObj = JSON.parse(localStorage.getItem(key)) || {}; } catch (e) { statusObj = {}; }
      var lv5 = 0, lv4 = 0, lv3 = 0, lv2 = 0, lv1 = 0;
      var len = ch.ownTotal || ch.total;
      for (var i = 0; i < len; i++) {
        var s = statusObj[i];
        if (s === 'proficient') lv5++;
        else if (s === 'familiar') lv4++;
        else if (s === 'vague') lv3++;
        else if (s === 'rusty') lv2++;
        else if (s === 'wrong') lv1++;
      }
      var done = lv5 + lv4 + lv3 + lv2 + lv1;
      return {
        lv5: lv5, lv4: lv4, lv3: lv3, lv2: lv2, lv1: lv1,
        proficient: lv5 + lv4, vague: lv3 + lv2, wrong: lv1,
        unmarked: len - done, done: done,
        pct: len > 0 ? Math.round(done / len * 100) : 0
      };
    }

    function dbLerpColor(c1, c2, t) {
      return [
        Math.round(c1[0] + (c2[0] - c1[0]) * t),
        Math.round(c1[1] + (c2[1] - c1[1]) * t),
        Math.round(c1[2] + (c2[2] - c1[2]) * t)
      ];
    }

    function drawDonut(canvas, chapters, label) {
      var ctx = canvas.getContext('2d');
      var dpr = window.devicePixelRatio || 1;
      var size = 260;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = size + 'px';
      canvas.style.height = size + 'px';
      ctx.scale(dpr, dpr);

      var cx = size / 2, cy = size / 2;
      var outerR = 108;
      var innerR = 28;
      var ringCount = chapters.length;
      if (ringCount === 0) {
        ctx.fillStyle = '#999';
        ctx.font = '14px "Microsoft YaHei",sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('(无数据)', cx, cy);
        return;
      }
      var ringWidth = (outerR - innerR) / ringCount;

      ctx.clearRect(0, 0, size, size);

      var purpleDark = [102, 8, 116];
      var purpleLight = [225, 190, 231];
      var totalDone = 0, totalQ = 0;

      // Inner to outer: inner ring = chapter 0 (第1讲), outer ring = last chapter
      for (var i = 0; i < ringCount; i++) {
        var ri = innerR + i * ringWidth;
        var ro = innerR + (i + 1) * ringWidth;
        var pr = getChProgress(chapters[i]);
        totalDone += pr.done;
        totalQ += pr.total;
        var p = pr.progress;
        var color = dbLerpColor(purpleLight, purpleDark, p);
        var cStr = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';

        // Filled arc (clockwise from top)
        ctx.beginPath();
        ctx.arc(cx, cy, ro, -Math.PI / 2, -Math.PI / 2 + p * 2 * Math.PI);
        ctx.arc(cx, cy, ri, -Math.PI / 2 + p * 2 * Math.PI, -Math.PI / 2, true);
        ctx.closePath();
        ctx.fillStyle = cStr;
        ctx.fill();

        // Unfilled arc
        if (p < 1) {
          ctx.beginPath();
          ctx.arc(cx, cy, ro, -Math.PI / 2 + p * 2 * Math.PI, -Math.PI / 2 + 2 * Math.PI);
          ctx.arc(cx, cy, ri, -Math.PI / 2 + 2 * Math.PI, -Math.PI / 2 + p * 2 * Math.PI, true);
          ctx.closePath();
          ctx.fillStyle = '#e8e8e8';
          ctx.fill();
        }
      }

      // Center circle with slight shadow
      ctx.beginPath();
      ctx.arc(cx, cy, innerR, 0, 2 * Math.PI);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Center text
      var pct = totalQ > 0 ? Math.round(totalDone / totalQ * 100) : 0;
      ctx.fillStyle = '#333';
      ctx.font = 'bold 12px "Microsoft YaHei","PingFang SC",sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, cx, cy - 9);
      ctx.fillStyle = '#660874';
      ctx.font = 'bold 17px "Microsoft YaHei","PingFang SC",sans-serif';
      ctx.fillText(pct + '%', cx, cy + 11);
    }

    function setPanelTitle(text, wrongbookMode) {
      var bar = document.getElementById('chapterTitleBar');
      var panelTitle = document.getElementById('panelTitle');
      if (!bar || !panelTitle) return;
      var dropdowns = bar.querySelectorAll('.title-dropdown');
      if (text) {
        panelTitle.textContent = text;
        panelTitle.style.display = '';
        dropdowns.forEach(function(d) {
          if (wrongbookMode && d.id === 'ddWbWrongbook') d.style.display = ''; // 错题本模式保留书籍下拉
          else d.style.display = 'none';
        });
      } else {
        panelTitle.style.display = 'none';
        dropdowns.forEach(function(d) {
          if (d.id === 'ddWbWrongbook') d.style.display = 'none'; // 退出错题本模式隐藏书籍下拉
          else d.style.display = '';
        });
      }
    }

    function toggleDashboard() {
      dashboardOpen = !dashboardOpen;
      var panel = document.getElementById('dashboardPanel');
      var content = document.getElementById('mainAreaContent');
      var btn = document.getElementById('btnDashboard');
      if (dashboardOpen) {
        renderDashboardOverview();
        panel.style.display = '';
        content.style.display = 'none';
        setPanelTitle('全局学习进度');
        btn.innerHTML = '返回章节<span class="sol-key">V</span>';
        showWrongBookReturnBtn(false); // 打开全局进度时隐藏错题本返回按钮
        // 若错题本同时打开则关闭，避免两个面板重叠
        if (wrongBookOpen) {
          wrongBookOpen = false;
          document.getElementById('wrongBookPanel').style.display = 'none';
          document.getElementById('btnWrongBook').innerHTML = '错题本<span class="sol-key">B</span>';
        }
      } else {
        panel.style.display = 'none';
        content.style.display = '';
        showDashboardBackBtn(false);
        setPanelTitle('');
        renderTitle();
        btn.innerHTML = '全局进度<span class="sol-key">V</span>';
      }
    }

    function showDashboardBackBtn(show) {
      const btn = document.getElementById('btnBackDashboard');
      if (btn) {
        btn.style.display = show ? '' : 'none';
        if (show) alignBackBtnToMainArea(btn); // 显示时动态对齐下方图片区左缘
      }
      dashboardDetailReturn = show;
    }
    function backToDashboardOverview() {
      // 从详情视图回到全局进度总览
      renderDashboardOverview();
    }
    function renderDashboardOverview() {
      showDashboardBackBtn(false);
      document.getElementById('dbOverview').style.display = '';
      document.getElementById('dbDetail').style.display = 'none';

      var grid = document.getElementById('dbGrid');
      var html = '';
      var books = getSortedWbs(); // 按当前科目返回 {wb,label} 列表
      for (var b = 0; b < books.length; b++) {
        var wb = books[b].wb;
        var label = books[b].label;
        var cid = 'dbCanvas' + b;
        html += '<div class="db-donut-card" data-wb="' + wb + '" onclick="openDashboardDetail(\'' + wb + '\')">' +
          '<canvas id="' + cid + '"></canvas>' +
        '</div>';
      }
      grid.innerHTML = html;

      // Draw donuts after DOM update
      setTimeout(function() {
        for (var b = 0; b < books.length; b++) {
          var wb = books[b].wb;
          var chapters = getBookChapters(wb);
          var canvas = document.getElementById('dbCanvas' + b);
          if (canvas) drawDonut(canvas, chapters, books[b].label);
        }
      }, 20);
    }

    function openDashboardDetail(wb) {
      showDashboardBackBtn(true);
      document.getElementById('dbOverview').style.display = 'none';
      document.getElementById('dbDetail').style.display = '';
      document.getElementById('dbDetailTitle').textContent = getWbLabel(wb) + ' — 章节进度';

      var chapters = getBookChapters(wb);
      var grid = document.getElementById('dbDetailList');

      function cardHtml(ch) {
        var name = ch.short || ch.name;
        var stats = getChStats(ch);
        return '<div class="db-chapter-card" data-cid="' + ch.id + '" onclick="jumpToChapter(\'' + ch.id + '\')">' +
          '<div class="db-chapter-name">' + name + '</div>' +
          '<div class="db-chapter-bar"><div class="db-chapter-fill" style="width:' + stats.pct + '%"></div></div>' +
          '<div class="db-chapter-stats">' +
            '<span class="db-stat"><span class="db-stat-dot" style="background:#389E0D"></span>熟练 ' + stats.proficient + '</span>' +
            '<span class="db-stat"><span class="db-stat-dot" style="background:#FBC02D"></span>模糊 ' + stats.vague + '</span>' +
            '<span class="db-stat"><span class="db-stat-dot" style="background:#D32F2F"></span>不会 ' + stats.wrong + '</span>' +
            '<span class="db-stat"><span class="db-stat-dot" style="background:#ccc"></span>未做 ' + stats.unmarked + '</span>' +
          '</div></div>';
      }

      // 按主学科分组，列顺序：高数 → 线代 → 概率论（其余排后）
      var colMap = {};
      chapters.forEach(function(ch) {
        var bs = baseSubject(ch.subj);
        (colMap[bs] = colMap[bs] || []).push(ch);
      });
      var SUBJECT_ORDER = ['高数', '线代', '概率论'];
      var colKeys = [];
      SUBJECT_ORDER.forEach(function(s) { if (colMap[s]) colKeys.push(s); });
      Object.keys(colMap).forEach(function(s) { if (colKeys.indexOf(s) === -1) colKeys.push(s); });

      var html = '';
      colKeys.forEach(function(bs) {
        var colChs = colMap[bs];
        html += '<div class="db-subject-col">' +
          '<div class="db-subject-header">' + bs + ' <span class="db-subject-count">' + colChs.length + ' 章</span></div>';
        // 列内含"基础篇/强化篇"多篇（如1000题）时，加子分组标题
        var hasSub = colChs.some(function(ch) { return /^(基础篇|强化篇)/.test(ch.subj); });
        if (hasSub) {
          ['基础篇', '强化篇'].forEach(function(pfx) {
            var group = colChs.filter(function(ch) { return String(ch.subj).indexOf(pfx) === 0; });
            if (group.length === 0) return;
            html += '<div class="db-subject-subheader">' + pfx + '</div>';
            group.forEach(function(ch) { html += cardHtml(ch); });
          });
        } else {
          colChs.forEach(function(ch) { html += cardHtml(ch); });
        }
        html += '</div>';
      });
      grid.innerHTML = html;
    }

    function jumpToChapter(chapterId) {
      // Close dashboard panel
      dashboardOpen = false;
      showDashboardBackBtn(false);
      document.getElementById('dashboardPanel').style.display = 'none';
      document.getElementById('mainAreaContent').style.display = '';
      document.getElementById('btnDashboard').innerHTML = '全局进度<span class="sol-key">V</span>';
      setPanelTitle('');
      renderTitle();
      // Switch to the chapter
      switchChapter(chapterId);
    }

    // Back button
    document.addEventListener('DOMContentLoaded', function() {
      // 「返回总览」按钮：全局进度处于详情视图时显示，点击回到总览（同时绑定后退）
      const dbBack = document.getElementById('btnBackDashboard');
      if (dbBack) dbBack.addEventListener('click', function() {
        backToDashboardOverview();
      });
      // 「返回错题本」按钮：从错题本跳题后显示，点击回到错题本面板（同时绑定后退）
      const wbBack = document.getElementById('btnBackWrongBook');
      if (wbBack) wbBack.addEventListener('click', function() {
        backToWrongBook();
      });
    });

    // ===== 错题本 =====
    let wrongBookOpen = false;
    // 从错题本跳题后，用于「返回错题本」按钮与鼠标后退键回错题本
    let wrongBookReturn = false;
    function showWrongBookReturnBtn(show) {
      const btn = document.getElementById('btnBackWrongBook');
      if (btn) {
        btn.style.display = show ? '' : 'none';
        if (show) alignBackBtnToMainArea(btn); // 显示时动态对齐下方图片区左缘
      }
      wrongBookReturn = show;
    }
    function alignBackBtnToMainArea(btn) {
      // left = 主区域左缘相对标题栏左缘的偏移（动态计算，避免硬编码宽度）
      const mainArea = document.querySelector('.main-area');
      const bar = document.getElementById('chapterTitleBar');
      if (!mainArea || !bar) return;
      const barRect = bar.getBoundingClientRect();
      const mainRect = mainArea.getBoundingClientRect();
      btn.style.left = (mainRect.left - barRect.left) + 'px';
    }
    function backToWrongBook() {
      // 从题目页回到错题本面板
      wrongBookOpen = true;
      const panel = document.getElementById('wrongBookPanel');
      const dashPanel = document.getElementById('dashboardPanel');
      const content = document.getElementById('mainAreaContent');
      const btn = document.getElementById('btnWrongBook');
      renderWrongBook();
      dashPanel.style.display = 'none';
      content.style.display = 'none';
      panel.style.display = '';
      btn.innerHTML = '返回章节<span class="sol-key">B</span>';
      if (dashboardOpen) { dashboardOpen = false; showDashboardBackBtn(false); document.getElementById('btnDashboard').innerHTML = '全局进度<span class="sol-key">V</span>'; }
      showWrongBookReturnBtn(false); // 回到错题本后隐藏返回按钮
    }
    function toggleWrongBook() {
      wrongBookOpen = !wrongBookOpen;
      const panel = document.getElementById('wrongBookPanel');
      const dashPanel = document.getElementById('dashboardPanel');
      const content = document.getElementById('mainAreaContent');
      const btn = document.getElementById('btnWrongBook');
      if (wrongBookOpen) {
        renderWrongBook();
        dashPanel.style.display = 'none';
        content.style.display = 'none';
        panel.style.display = '';
        btn.innerHTML = '返回章节<span class="sol-key">B</span>';
        showWrongBookReturnBtn(false); // 打开错题本面板本身时不显示返回按钮
        // 关闭仪表盘
        if (dashboardOpen) { dashboardOpen = false; showDashboardBackBtn(false); document.getElementById('btnDashboard').innerHTML = '全局进度<span class="sol-key">V</span>'; }
      } else {
        panel.style.display = 'none';
        content.style.display = '';
        setPanelTitle('');
        renderTitle();
        btn.innerHTML = '错题本<span class="sol-key">B</span>';
        showWrongBookReturnBtn(false);
      }
    }

    // ===== 快捷键帮助模态 =====
    let shortcutHelpOpen = false;
    function toggleShortcutHelp() {
      shortcutHelpOpen = !shortcutHelpOpen;
      document.getElementById('shortcutOverlay').classList.toggle('show', shortcutHelpOpen);
    }

    // ===== 科目选择模态 =====
    let subjectPickerOpen = false;
    function openSubjectPicker() {
      subjectPickerOpen = true;
      document.getElementById('subjectOverlay').classList.add('show');
    }
    function closeSubjectPicker() {
      subjectPickerOpen = false;
      document.getElementById('subjectOverlay').classList.remove('show');
    }

    // ===== 记住上次位置（章节 + 题目 + 小题模式），按科目、再按书籍分别保存 =====
    // 键 kaoyan_resume = JSON {
    //   '<科目id>': { ch, idx, sub },                      // 切科目时恢复
    //   '<科目id>::<书籍wb>': { ch, idx, sub }             // 切书籍时恢复
    // }
    function saveResume() {
      var map = {};
      try { map = JSON.parse(localStorage.getItem('kaoyan_resume')) || {}; } catch (e) { map = {}; }
      map[curSubjectId] = { ch: currentChapterId, idx: current, sub: !!subMode };
      var wb = getChapter() ? getChapter().wb : '';
      if (wb) map[curSubjectId + '::' + wb] = { ch: currentChapterId, idx: current, sub: !!subMode };
      try { localStorage.setItem('kaoyan_resume', JSON.stringify(map)); } catch (e) {}
    }
    function loadResume(subjectId) {
      var map = {};
      try { map = JSON.parse(localStorage.getItem('kaoyan_resume')) || {}; } catch (e) { map = {}; }
      var r = map[subjectId];
      if (!r || !r.ch) return null;
      var subj = SUBJECTS.find(function (s) { return s.id === subjectId; });
      if (!subj) return null;
      var ch = subj.chapters.find(function (c) { return c.id === r.ch; });
      if (!ch || ch.total === 0) return null;
      var idx = Math.min(Math.max(0, r.idx || 0), ch.total - 1);
      // 小题模式仅当该题属于含子题的父题组时才恢复，避免无子题时残留
      var subOk = false;
      if (r.sub) {
        ensureGroups(ch);
        var g = ch.groupForIdx[idx];
        subOk = !!(g && g.isParent && g.count > 1);
      }
      return { ch: r.ch, idx: idx, sub: subOk };
    }
    // 切换到某本书时恢复该书停靠位置（切书不回到第1讲第1题）。
    // 返回 true 表示已恢复；false 表示无记录/记录失效，调用方走「第一学科第一章节」。
    function applyResumeBook(wb) {
      var map = {};
      try { map = JSON.parse(localStorage.getItem('kaoyan_resume')) || {}; } catch (e) { map = {}; }
      var r = map[curSubjectId + '::' + wb];
      if (!r || !r.ch) return false;
      var ch = CHAPTERS.find(function (c) { return c.id === r.ch; });
      if (!ch || ch.total === 0 || ch.wb !== wb) return false;
      var idx = Math.min(Math.max(0, r.idx || 0), ch.total - 1);
      var subOk = false;
      if (r.sub) {
        ensureGroups(ch);
        var g = ch.groupForIdx[idx];
        subOk = !!(g && g.isParent && g.count > 1);
      }
      currentChapterId = ch.id;
      current = idx;
      subMode = subOk;
      loadStatuses(); loadQBad(); loadSBad(); loadNotes(); loadSm2();
      // 若全局筛选激活且恢复的位置被筛掉，跳到第一条筛中题，避免落在不可见题上
      if (!isAllFilterActive()) {
        const filtered = getFilteredIndices();
        if (filtered.length > 0 && filtered.indexOf(current) === -1) current = filtered[0];
      }
      renderTitle(); switchTo(current); updateFilterCounts();
      return true;
    }
    function switchSubject(subjectId) {
      const subj = SUBJECTS.find(s => s.id === subjectId);
      if (!subj) return;
      saveResume(); // 先记录当前科目停的位置，再切换
      curSubjectId = subjectId;
      curSubject = subj;
      CHAPTERS = subj.chapters;
      migrateAllSm2();   // 切科目时也触发迁移（每个科目只跑一次）
      var resume = loadResume(subjectId);
      if (resume) {
        currentChapterId = resume.ch;
        current = resume.idx;
        subMode = resume.sub;
      } else {
        currentChapterId = subj.initChapterId;
        current = 0; subMode = false;
      }
      localStorage.setItem('kaoyan_subject', subjectId);
      // 关闭可能打开的全局进度/错题本面板，避免旧科目 DOM 残留
      if (dashboardOpen) {
        dashboardOpen = false; dashboardDetailReturn = false;
        document.getElementById('dashboardPanel').style.display = 'none';
        document.getElementById('mainAreaContent').style.display = '';
        document.getElementById('btnDashboard').innerHTML = '全局进度<span class="sol-key">V</span>';
        showDashboardBackBtn(false); setPanelTitle('');
      }
      if (wrongBookOpen) {
        wrongBookOpen = false; wrongBookReturn = false;
        document.getElementById('wrongBookPanel').style.display = 'none';
        document.getElementById('mainAreaContent').style.display = '';
        document.getElementById('btnWrongBook').innerHTML = '错题本<span class="sol-key">B</span>';
        showWrongBookReturnBtn(false); setPanelTitle('');
      }
      wrongBookWb = null; // 无条件重置错题本书籍筛选（书籍列表按科目不同，防跨科目残留）
      closeAllTitlePanels(); // 关闭可能残留的标题下拉面板（切换后重建）
      loadStatuses(); loadQBad(); loadSBad(); loadNotes();
      loadSolutionPref(); renderSolDefaultBtn(); updateSolutionUI(); // 解析默认按科目记忆
      renderTitle(); renderStats(); renderNav();
      // 若全局筛选激活且恢复的位置被筛掉，则跳到第一条筛中题，避免落在不可见题上
      if (!isAllFilterActive()) {
        const filtered = getFilteredIndices();
        if (filtered.length > 0 && filtered.indexOf(current) === -1) current = filtered[0];
      }
      switchTo(current); updateFilterCounts();
      closeSubjectPicker();
    }
    function pickSubject(id) {
      const s = SUBJECTS.find(x => x.id === id);
      if (s) switchSubject(id);
      closeSubjectPicker();
    }
    document.addEventListener('DOMContentLoaded', function () {
      const btnSwitch = document.getElementById('btnSwitchSubject');
      if (btnSwitch) btnSwitch.onclick = openSubjectPicker;
      document.querySelectorAll('#subjectOverlay .subject-option').forEach(function (btn) {
        btn.addEventListener('click', function () { pickSubject(btn.dataset.subject); });
      });
      const so = document.getElementById('subjectOverlay');
      if (so) so.addEventListener('click', function (e) { if (e.target === this) closeSubjectPicker(); });
    });

    // 鼠标侧键后退：详情视图/从错题本跳题后，鼠标后退键回总览或错题本
    document.addEventListener('mouseup', function (e) {
      if (e.button !== 3) return; // 按钮 3 = 浏览器后退键（XButton1）
      if (dashboardDetailReturn) backToDashboardOverview();
      else if (wrongBookReturn) backToWrongBook();
    });
    // 窗口尺寸变化时，若返回按钮可见则重新对齐
    window.addEventListener('resize', function () {
      if (dashboardDetailReturn) {
        const dbtn = document.getElementById('btnBackDashboard');
        if (dbtn) alignBackBtnToMainArea(dbtn);
      }
      if (wrongBookReturn) {
        const btn = document.getElementById('btnBackWrongBook');
        if (btn) alignBackBtnToMainArea(btn);
      }
    });

    // ===== 错题本辅助函数 =====
    // 主学科：去掉"基础篇-/强化篇-"前缀（与全局进度一致）
    function baseSubject(subj) { return String(subj).replace(/^(基础篇|强化篇)[-—]/, ''); }
    function getWbLabel(wb) {
      var order = curSubject ? curSubject.wbOrder : [];
      for (var i = 0; i < order.length; i++) { if (order[i].wb === wb) return order[i].label; }
      return wb;
    }
    let wrongBookWb = null; // 错题本书籍筛选（null=未初始化，首次打开时跟随当前章节栏书籍）

    function updateWrongBookTitle() {
      // 错题本模式：保留标题栏书籍下拉，标题固定为「错题本」
      setPanelTitle('错题本', true);
    }

    function fillWrongBookWbPanel() {
      // 收集有错/糊题的书籍（1000题已并入 30讲/36讲：不再单列 1000题 书，
      // 其错题归入对应 base 书卡；第0讲 wb 已改 '基础30讲' 也并入）。
      var wbSet = new Set();
      for (const ch of CHAPTERS) {
        if (ch.total === 0) continue;
        if (ch.wb === '1000题') continue; // 数据源章节：错题由其 base 伴章汇总
        var key = chapterStatusKey(ch);
        var statusObj;
        try { statusObj = JSON.parse(localStorage.getItem(key)) || {}; } catch (e) { statusObj = {}; }
        var ownLen = ch.ownTotal || ch.total;
        for (var i = 0; i < ownLen; i++) {
          if (statusObj[i] === 'wrong' || statusObj[i] === 'vague') { wbSet.add(ch.wb); break; }
        }
        // 1000题 伴章部分也归入 base 书
        if (ch.q1000Id && !wbSet.has(ch.wb)) {
          var qc = chapterById(ch.q1000Id);
          var qkey = chapterStatusKey(qc);
          var qobj;
          try { qobj = JSON.parse(localStorage.getItem(qkey)) || {}; } catch (e) { qobj = {}; }
          for (var q = 0; q < qc.total; q++) {
            if (qobj[q] === 'wrong' || qobj[q] === 'vague') { wbSet.add(ch.wb); break; }
          }
        }
      }
      var entries = [];
      var order = curSubject ? curSubject.wbOrder : [];
      order.forEach(function(e) { if (wbSet.has(e.wb)) entries.push({ wb: e.wb, label: e.label }); });
      wbSet.forEach(function(w) { if (!entries.some(function(e) { return e.wb === w; })) entries.push({ wb: w, label: w }); });
      var defaultWb = order.length > 0 ? order[0].wb : (entries.length > 0 ? entries[0].wb : '');
      // 首次打开（null）：跟随当前章节栏选中的书籍；若该书无错题则回退到第一个有错题的书籍
      if (wrongBookWb === null) {
        var curWb = getChapter() ? getChapter().wb : null;
        wrongBookWb = (curWb && entries.some(function(e) { return e.wb === curWb; })) ? curWb : (entries.length > 0 ? entries[0].wb : defaultWb);
      } else if (!entries.some(function(e) { return e.wb === wrongBookWb; })) {
        wrongBookWb = entries.length > 0 ? entries[0].wb : defaultWb;
      }
      document.getElementById('txtWbWrongbook').textContent = getWbLabel(wrongBookWb);
      fillPanel('panelWbWrongbook', entries, 'wb', 'label', wrongBookWb, function(entry) {
        wrongBookWb = entry.wb;
        renderWrongBook();
      });
    }

    function renderWrongBook() {
      fillWrongBookWbPanel();
      updateWrongBookTitle();
      const grid = document.getElementById('wrongBookGrid');

      // 按书籍筛选 + 按学科分组收集。
      // 合并章节（有 q1000Id）：自身部分(ownTotal) + 伴章 1000题 部分(偏移 ownTotal) 一起进 base 书卡。
      const colMap = {};
      let totalWrong = 0;
      for (const ch of CHAPTERS) {
        if (ch.total === 0) continue;
        if (ch.wb !== wrongBookWb) continue;
        if (ch.wb === '1000题') continue;
        const groups = {}; // { wrong: [], rusty: [], vague: [], familiar: [] }
        // 自身部分
        var key = chapterStatusKey(ch);
        let statusObj;
        try { statusObj = JSON.parse(localStorage.getItem(key)) || {}; } catch (e) { statusObj = {}; }
        var ownLen = ch.ownTotal || ch.total;
        for (let i = 0; i < ownLen; i++) {
          var s = statusObj[i];
          if (s === 'wrong') (groups.wrong = groups.wrong || []).push(i);
          else if (s === 'rusty') (groups.rusty = groups.rusty || []).push(i);
          else if (s === 'vague') (groups.vague = groups.vague || []).push(i);
          else if (s === 'familiar') (groups.familiar = groups.familiar || []).push(i);
        }
        // 1000题 伴章部分
        if (ch.q1000Id) {
          var qc = chapterById(ch.q1000Id);
          var qkey = chapterStatusKey(qc);
          let qobj;
          try { qobj = JSON.parse(localStorage.getItem(qkey)) || {}; } catch (e) { qobj = {}; }
          for (let q = 0; q < qc.total; q++) {
            var qs = qobj[q];
            if (qs === 'wrong') (groups.wrong = groups.wrong || []).push(ch.ownTotal + q);
            else if (qs === 'rusty') (groups.rusty = groups.rusty || []).push(ch.ownTotal + q);
            else if (qs === 'vague') (groups.vague = groups.vague || []).push(ch.ownTotal + q);
            else if (qs === 'familiar') (groups.familiar = groups.familiar || []).push(ch.ownTotal + q);
          }
        }
        var totalCount = (groups.wrong ? groups.wrong.length : 0) + (groups.rusty ? groups.rusty.length : 0) + (groups.vague ? groups.vague.length : 0) + (groups.familiar ? groups.familiar.length : 0);
        if (totalCount === 0) continue;
        totalWrong += totalCount;
        const bs = baseSubject(ch.subj);
        (colMap[bs] = colMap[bs] || []).push({ ch, groups });
      }

      let html = '';
      if (totalWrong === 0) {
        html = '<div class="wrongbook-empty">暂无标记为「不会」「困难」「模糊」「较熟练」的题目</div>';
      } else {
        // 列顺序：高数 → 线代 → 概率论（其余排后）
        const SUBJECT_ORDER = ['高数', '线代', '概率论'];
        const colKeys = [];
        SUBJECT_ORDER.forEach(function(s) { if (colMap[s]) colKeys.push(s); });
        Object.keys(colMap).forEach(function(s) { if (colKeys.indexOf(s) === -1) colKeys.push(s); });
        colKeys.forEach(function(bs) {
          const items = colMap[bs];
          html += '<div class="db-subject-col">' +
            '<div class="db-subject-header">' + bs + ' <span class="db-subject-count">' + items.length + ' 讲</span></div>';
          items.forEach(function(item) {
            const ch = item.ch;
            const name = ch.short || ch.name;
            const labels = ch.labels || [];
            var g = item.groups;
            html += '<div class="wrongbook-chapter-card">' +
              '<div class="wrongbook-chapter-name">' + name +
              '<span class="wrongbook-status-count">' +
              (g.familiar ? '<span class="ws w-familiar">较熟 ' + g.familiar.length + '</span>' : '') +
              (g.vague ? '<span class="ws w-vague">模糊 ' + g.vague.length + '</span>' : '') +
              (g.rusty ? '<span class="ws w-rusty">困难 ' + g.rusty.length + '</span>' : '') +
              (g.wrong ? '<span class="ws w-wrong">不会 ' + g.wrong.length + '</span>' : '') +
              '</span></div>' +
              '<div class="wrongbook-q-grid">';
            function qItem(idx, cls, statTitle) {
              const label = labels[idx] || (idx + 1);
              const isQ = ch.q1000Total && idx >= ch.ownTotal;
              const tag = isQ ? '<span class="ws q1000-tag">1000</span>' : '';
              return '<span class="wrongbook-q-item ' + cls + '" data-chapter="' + ch.id + '" data-index="' + idx + '" title="第' + label + '题（' + statTitle + '）">' + label + tag + '</span>';
            }
            if (g.wrong) for (var wIdx of g.wrong) html += qItem(wIdx, 'wrong', '不会');
            if (g.rusty) for (var rIdx of g.rusty) html += qItem(rIdx, 'rusty', '困难');
            if (g.vague) for (var vIdx of g.vague) html += qItem(vIdx, 'vague', '模糊');
            if (g.familiar) for (var fIdx of g.familiar) html += qItem(fIdx, 'familiar', '较熟练');
            html += '</div></div>';
          });
          html += '</div>';
        });
      }
      grid.innerHTML = html;

      // 点击跳转
      grid.querySelectorAll('.wrongbook-q-item').forEach(function(el) {
        el.addEventListener('click', function() {
          const cid = this.getAttribute('data-chapter');
          const idx = parseInt(this.getAttribute('data-index'));
          // 关闭错题本
          wrongBookOpen = false;
          document.getElementById('wrongBookPanel').style.display = 'none';
          document.getElementById('mainAreaContent').style.display = '';
          document.getElementById('btnWrongBook').innerHTML = '错题本<span class="sol-key">B</span>';
          setPanelTitle(''); // 恢复章节下拉栏（与 dashboard 跳转一致）
          renderTitle();
          // 切换章节并跳转到目标题
          switchChapter(cid);
          switchTo(idx);
          // 标记从错题本进入，显示「返回错题本」按钮
          showWrongBookReturnBtn(true);
        });
      });
    }

    // ===== 渲染题号网格 =====
    function renderNav() {
      const nav = document.getElementById('qnav');
      nav.innerHTML = '';
      const ch = getChapter();
      ensureGroups(ch);
      const cols = effectiveCols();
      nav.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';
      const labels = ch.labels;
      const curGroup = ch.groupForIdx[current];
      // 预计算筛中索引集合，renderNav 内多处使用，避免重复调用 getFilteredIndices()。
      // 「全部」筛选下无需构建集合（所有组均可见）。
      const filteredSet = isAllFilterActive() ? null : new Set(getFilteredIndices());

      function appendBadges(btn, i) {
        const labels = ch.labels;
        // 该题组内任一题有笔记或有图片标注，就在题号右上角亮提示圆点
        let groupHasNote = false, groupHasAnnot = false;
        const g0 = ch.groupForIdx[i];
        const start = g0 ? g0.startIdx : i;
        const count = g0 ? g0.count : 1;
        for (var k = 0; k < count; k++) {
          const idx = start + k;
          if (notesData[notesKeyFor(idx)]) groupHasNote = true;
          if (hasQuestionImagesAnnotated(idx)) groupHasAnnot = true;
          if (groupHasNote && groupHasAnnot) break;
        }
        if (qBad[i] || sBad[i] || groupHasNote || groupHasAnnot) {
          const badgeSpan = document.createElement('span');
          badgeSpan.className = 'img-badges';
          if (qBad[i]) { const d = document.createElement('span'); d.className = 'qbad-dot'; d.textContent = 'Q'; badgeSpan.appendChild(d); }
          if (sBad[i]) { const d = document.createElement('span'); d.className = 'sbad-dot'; d.textContent = 'S'; badgeSpan.appendChild(d); }
          if (groupHasNote) { const d = document.createElement('span'); d.className = 'note-dot'; d.textContent = '●'; badgeSpan.appendChild(d); }
          if (groupHasAnnot) { const d = document.createElement('span'); d.className = 'annot-dot'; d.textContent = '●'; badgeSpan.appendChild(d); }
          btn.appendChild(badgeSpan);
        }
      }

      // 自动从 labels 推断分区（连续同类别归为一个 partition）
      // 合并章节用 partOfIdx(i)：1000题 段独立成「1000题」分区，不并入「例题/习题」
      var parts = []; // [{label, startIdx, endIdx}]
      var curPart = null;
      var partOrder = getPartOrder(); // 当前科目分区顺序
      for (var i = 0; i < labels.length; i++) {
        var cat = partOfIdx(i);
        if (!curPart || curPart.label !== cat) {
          if (curPart) curPart.endIdx = i;
          curPart = { label: cat, startIdx: i, endIdx: -1 };
          parts.push(curPart);
        }
      }
      if (curPart) curPart.endIdx = labels.length;

      // 按 partOrder 排序渲染
      parts.sort(function(a, b) {
        return partOrder.indexOf(a.label) - partOrder.indexOf(b.label);
      });
      // 补全 partOrder 中缺失的分区（如无例题则显示"无"）
      partOrder.forEach(function(po) {
        if (!parts.some(function(p) { return p.label === po; })) {
          parts.push({ label: po, startIdx: -1, endIdx: -1 });
        }
      });
      parts.sort(function(a, b) {
        return partOrder.indexOf(a.label) - partOrder.indexOf(b.label);
      });

      parts.forEach(function(part) {
        // 收集该分区的 subGroups
        var secGroups = [];
        ch.subGroups.forEach(function(g) {
          if (g.startIdx >= part.startIdx && g.startIdx < part.endIdx) {
            secGroups.push(g);
          }
        });

        // 分区标题
        var secTitle = document.createElement('div');
        secTitle.className = 'section-header';
        secTitle.textContent = part.label;
        nav.appendChild(secTitle);

        if (secGroups.length === 0) {
          var emptyDiv = document.createElement('div');
          emptyDiv.className = 'section-empty';
          emptyDiv.textContent = '无';
          nav.appendChild(emptyDiv);
          return;
        }

        secGroups.forEach(function(g) {
          var btn = document.createElement('button');
          btn.setAttribute('data-group-start', g.startIdx);
          btn.title = g.parentLabel;
          var inCurGroup = (curGroup === g);
          var cls = '';

          if (inCurGroup && (!g.isParent || !subMode)) { cls = 'active'; }

          var visIdx = groupVisibleIndices(g, filteredSet);
          var groupHasVisible = isAllFilterActive() || visIdx.length > 0;
          if (!groupHasVisible) cls += ' filtered-out';

          if (g.isParent) {
            cls += ' has-subs';
            var anyStatus = false;
            for (var k = 0; k < g.count; k++) { if (statuses[g.startIdx + k]) { anyStatus = true; break; } }
            if (anyStatus) cls += ' has-color';
            btn.className = cls.trim();

            for (var k = 0; k < g.count; k++) {
              var idx = g.startIdx + k;
              var bar = document.createElement('span');
              bar.className = 'sub-bar';
              var st = statuses[idx];
              if (st) bar.classList.add(st);
              if (inCurGroup && subMode && idx === current) bar.classList.add('active-sub');
              bar.style.width = (100 / g.count) + '%';
              bar.style.left = (k * 100 / g.count) + '%';
              btn.appendChild(bar);
            }

            var textSpan = document.createElement('span');
            textSpan.className = 'btn-text';
            textSpan.textContent = g.parentLabel;
            btn.appendChild(textSpan);
          } else {
            cls += ' ' + getStatusClass(g.startIdx);
            btn.className = cls.trim();
            btn.textContent = g.parentLabel;
          }

          if (!groupHasVisible) { btn.style.visibility = 'hidden'; }
          appendBadges(btn, g.startIdx);

          btn.onclick = function() {
            if (visIdx.length > 0) { subMode = false; switchTo(visIdx[0]); }
          };
          nav.appendChild(btn);
        });
      });

      // 构建视觉行映射（W/S 导航用）
      buildVisualRows(nav);

      renderSubSelectBar(curGroup);
    }

    // ===== 根据 DOM 构建视觉行映射 =====
    function buildVisualRows(nav) {
      visualRows = [];
      var btns = nav.querySelectorAll('button[data-group-start]');
      var lastTop = -1;
      btns.forEach(function(btn) {
        var top = btn.offsetTop;
        if (top !== lastTop) {
          visualRows.push([]);
          lastTop = top;
        }
        visualRows[visualRows.length - 1].push(parseInt(btn.getAttribute('data-group-start')));
      });
    }

    // W/S：按视觉行偏移（基于 DOM 实际布局，跳过 section header 行）
    function navByGroupOffset(offset) {
      var groups = visibleGroups();
      var g = currentGroup();
      if (!g || visualRows.length === 0) return;

      // 找到当前 group 在哪个视觉行、哪一列
      var curRow = -1, curCol = -1;
      for (var r = 0; r < visualRows.length; r++) {
        var col = visualRows[r].indexOf(g.startIdx);
        if (col !== -1) { curRow = r; curCol = col; break; }
      }
      if (curRow === -1) return;

      var targetRow = curRow + offset;
      if (targetRow < 0 || targetRow >= visualRows.length) return;

      var targetRowSids = visualRows[targetRow];
      // 目标列：优先与当前列同列；若当前列超出目标行长度（目标行较短，如末行不足一列），
      // 夹到目标行最后一个——如 13 题中第 10 题按 S 落到第 13 题（下一行最后一个）。
      var targetCol = Math.min(curCol, targetRowSids.length - 1);
      // 从目标列向外扩展，找最近的可见 group（处理筛选隐藏的题）。
      // 扩展半径覆盖整个目标行：目标行可能比当前列短（上一行/末行不足一列），
      // 此时旧代码 d 上限用 targetRowSids.length 够不到任何项 → S/W 无反应。
      for (var d = 0; d < targetRowSids.length; d++) {
        var left = targetCol - d, right = targetCol + d;
        if (left >= 0) {
          var tgL = groups.find(function(gr) { return gr.startIdx === targetRowSids[left]; });
          if (tgL && groupVisibleIndices(tgL).length > 0) { switchTo(groupVisibleIndices(tgL)[0]); return; }
        }
        if (right < targetRowSids.length && d > 0) {
          var tgR = groups.find(function(gr) { return gr.startIdx === targetRowSids[right]; });
          if (tgR && groupVisibleIndices(tgR).length > 0) { switchTo(groupVisibleIndices(tgR)[0]); return; }
        }
      }
    }

    function navUp() { navByGroupOffset(-1); }
    function navDown() { navByGroupOffset(1); }
    function renderSubSelectBar(curGroup) {
      const bar = document.getElementById('subSelectBar');
      if (!bar) return;

      if (!curGroup || !curGroup.isParent) {
        bar.innerHTML = '';
        bar.style.display = 'none';
        return;
      }

      bar.style.display = 'block';
      bar.innerHTML = '';
      const ch = getChapter();
      const labels = ch.labels;
      const filteredSet = new Set(getFilteredIndices());

      for (let k = 0; k < curGroup.count; k++) {
        const i = curGroup.startIdx + k;
        const btn = document.createElement('button');
        btn.className = 'sub-sel-btn';
        btn.textContent = subSuffix(labels[i]);
        btn.title = labels[i];

        // 未按F时所有子题高亮，按F后仅当前子题高亮
        if (!subMode || i === current) {
          btn.classList.add('active');
        }

        const visible = isAllFilterActive() || filteredSet.has(i);
        if (!visible) { btn.style.display = 'none'; }

        btn.onclick = function () {
          if (!isFiltered(i)) return;
          subMode = true;
          switchTo(i);
        };
        bar.appendChild(btn);
      }
    }

    // ===== 题组级 / 子题级导航 =====
    function visibleGroups() {
      const ch = getChapter();
      ensureGroups(ch);
      if (isAllFilterActive()) return ch.subGroups.slice();
      const filteredSet = new Set(getFilteredIndices());
      return ch.subGroups.filter(g => groupVisibleIndices(g, filteredSet).length > 0);
    }

    function currentGroup() {
      const ch = getChapter();
      ensureGroups(ch);
      return ch.groupForIdx[current];
    }

    function effectiveCols() {
      // 每行列数：按科目配置（数学/822 均为 5），与 822 原工具一致；忽略章节数据中的 cols 字段
      return (curSubject && curSubject.navCols) ? curSubject.navCols : 5;
    }

    // A：上一题（题组级：跳上一题组最后一个可见子题；子题级：组内-1，越界跳上一组末尾）
    function navPrev() {
      const g = currentGroup();
      if (!g) return;
      if (subMode) {
        const vis = groupVisibleIndices(g);
        const pos = vis.indexOf(current);
        if (pos > 0) { switchTo(vis[pos - 1]); return; }
      }
      const groups = visibleGroups();
      const gi = groups.indexOf(g);
      if (gi <= 0) return;
      const pv = groupVisibleIndices(groups[gi - 1]);
      if (pv.length > 0) switchTo(pv[pv.length - 1]);
    }

    // D：下一题（题组级：跳下一题组第一个可见子题；子题级：组内+1，越界跳下一组开头）
    function navNext() {
      const g = currentGroup();
      if (!g) return;
      if (subMode) {
        const vis = groupVisibleIndices(g);
        const pos = vis.indexOf(current);
        if (pos !== -1 && pos < vis.length - 1) { switchTo(vis[pos + 1]); return; }
      }
      const groups = visibleGroups();
      const gi = groups.indexOf(g);
      if (gi === -1 || gi >= groups.length - 1) return;
      const nv = groupVisibleIndices(groups[gi + 1]);
      if (nv.length > 0) switchTo(nv[0]);
    }

    // F：切换小题选择模式（仅当前题组含子题时生效）
    function toggleSubMode() {
      const g = currentGroup();
      if (!g || !g.isParent) return;
      subMode = !subMode;
      renderNav();
      renderSubSelectBar(g);
      // 同步更新题号标签
      const ch = getChapter();
      const labels = ch.labels;
      document.getElementById('qLabel').textContent = subMode ? labels[current] : g.parentLabel;
    }

    // ===== 切换题目 =====
    function updateSolutionUI() {
      const area = document.getElementById('solutionArea');
      const btn = document.getElementById('btnToggle');
      if (showSolution) {
        area.classList.add('show');
        btn.innerHTML = '<span class="func-name">隐藏解析</span><span class="key">Space</span>';
        btn.classList.add('hide');
        // 从隐藏切换为显示时，重新加载解析图并叠加标注：
        // 隐藏期间图片无实际尺寸，标注叠加会被跳过（避免 NaN 放大 bug），
        // 显示后再重新探测/渲染，等图片有尺寸后 onload 里会正常叠加。
        refreshSolutionAnnotations();
      } else {
        area.classList.remove('show');
        btn.innerHTML = '<span class="func-name">显示解析</span><span class="key">Space</span>';
        btn.classList.remove('hide');
      }
    }
    // 对当前已加载的解析图重新叠加标注（隐藏→显示后调用，修复 NaN 放大 bug）
    function refreshSolutionAnnotations() {
      const container = document.getElementById('solutionImgs');
      if (!container) return;
      container.querySelectorAll('.annot-wrapper').forEach(function (wrap) {
        const img = wrap.querySelector('.solution-img');
        const overlay = wrap.querySelector('.annot-overlay');
        if (img && overlay) renderImageAnnotation(img.src, img, overlay);
      });
    }

    // ===== 分片解析图：_solution.png + _solution_2.png + _solution_3.png ... =====
    let _solutionImgGen = 0; // 世代号：切题过快时丢弃过期分片回调
    function setSolutionImages(base) {
      const container = document.getElementById('solutionImgs');
      if (!container) return;
      container.innerHTML = '';
      const gen = ++_solutionImgGen;
      function tryAdd(n) {
        const src = n === 1 ? base + '_solution.png' : base + '_solution_' + n + '.png';
        const img = document.createElement('img');
        img.className = 'solution-img';
        img.alt = '解析' + (n > 1 ? '（' + n + '）' : '');
        img.onload = function () {
          if (gen !== _solutionImgGen) return; // 已有更新的题目在加载，丢弃
          // 每个解析图包一层标注叠加容器
          const wrap = document.createElement('div');
          wrap.className = 'annot-wrapper';
          const overlay = document.createElement('div');
          overlay.className = 'annot-overlay';
          overlay.style.display = 'none';
          wrap.appendChild(img);
          wrap.appendChild(overlay);
          container.appendChild(wrap);
          img.classList.toggle('sbad-border', !!sBad[current]); // 异步加载后才生效，需在追加时补齐边框
          // 若该图有标注，加载完成后叠加显示
          if (hasAnnotation(src)) renderImageAnnotation(src, img, overlay);
          tryAdd(n + 1); // 加载成功则继续探测下一张
        };
        img.onerror = function () {
          // 未找到该分片，停止探测；若第 1 张（_solution.png）就缺失且尚无任何分片加载成功，给出占位提示
          if (gen === _solutionImgGen && n === 1 && container.children.length === 0) {
            const ph = document.createElement('div');
            ph.className = 'section-empty';
            ph.style.textAlign = 'center';
            ph.style.padding = '12px';
            ph.textContent = '（该题暂无解析图）';
            container.appendChild(ph);
          }
        };
        img.src = src;
      }
      tryAdd(1);
    }

    // ===== 普通浏览标注叠加（切题即见） =====
    var _annotViewers = {}; // key: 归一化 src，value: MarkerView 实例

    // 永久屏蔽 marker.js 内置在 .canvas-container 上的滚轮平移监听（根因修复）：
    // 该监听匿名、不可解绑，且 MarkerView/MarkerArea 都在 **appendChild 时**才绑定到
    // .canvas-container 上（不是构造时），所以旧的「构造期临时 patch addEventListener」
    // 根本拦不住它 → 标注图在只读浏览时滚轮一滚，标注层就相对底图平移并 preventDefault，
    // 造成图片撕裂/重叠 + 页面无法滚动。
    // 方案：启动即全局 patch Element.prototype.addEventListener，凡是在带
    // canvas-container 类名的元素上注册 wheel 监听一律丢弃。这样无论 marker.js 何时、
    // 在哪一步绑定，内置滚轮平移都永远不会生效。
    // 兼容性验证：MarkerArea（编辑模式）自身的滚轮缩放/切工具走 ma 元素上的
    // onAnnotWheel（capture 监听），而真实 wheel 事件是 composed 的，能从 shadow 内
    // .canvas-container 冒泡穿透到宿主 ma 元素上，故全局屏蔽后编辑缩放功能不受影响。
    (function blockMarkerCanvasWheel() {
      const origAE = Element.prototype.addEventListener;
      Element.prototype.addEventListener = function (type, fn, opts) {
        if (type === 'wheel' && this.classList && this.classList.contains('canvas-container')) {
          return; // 丢弃 marker.js 内置滚轮平移监听
        }
        return origAE.call(this, type, fn, opts);
      };
    })();
    function clearImageAnnotation(src) {
      const key = normalizeAnnotSrc(src);
      const v = _annotViewers[key];
      if (v) { try { v.remove(); } catch (e) {} delete _annotViewers[key]; }
    }
    function renderImageAnnotation(src, imgEl, overlayEl) {
      const key = normalizeAnnotSrc(src);
      // 移除旧的 overlay
      if (overlayEl) overlayEl.innerHTML = '';
      clearImageAnnotation(key);
      const state = getAnnotation(key);
      if (!state || typeof markerjs3 === 'undefined' || !overlayEl) return;
      // 若图片处于 display:none（解析默认隐藏）或尚未布局出实际尺寸，此时创建 MarkerView 会用 0 尺寸
      // 计算 SVG 矩阵 → NaN → 标注区域被放大/错乱。等图片可见后再渲染（见 updateSolutionUI 的重新触发）。
      if (imgEl.getBoundingClientRect().width === 0 || imgEl.getBoundingClientRect().height === 0) return;
      overlayEl.style.display = '';
      try {
        const viewer = new markerjs3.MarkerView();
        _annotViewers[key] = viewer;
        overlayEl.appendChild(viewer);
        viewer.targetImage = imgEl;
        viewer.show(state);
      } catch (e) { /* 标注渲染失败时静默 */ }
    }
    function renderQuestionAnnotations() {
      const img = document.getElementById('questionImg');
      const overlay = document.getElementById('qAnnotOverlay');
      const src = img && img.src;
      if (!src || !overlay) return;
      if (img.complete && img.naturalWidth > 0) {
        renderImageAnnotation(src, img, overlay);
      } else {
        img.onload = function() { renderImageAnnotation(src, img, overlay); };
      }
    }

    function switchTo(idx) {
      current = idx;
      showSolution = defaultShowSolution;
      const ch = getChapter();
      const base = getImgPath(idx);
      document.getElementById('questionImg').src = base + '_question.png';
      setSolutionImages(base);
      renderQuestionAnnotations(); // 叠加已保存的图片标注（切题即见）
      updateSolutionUI();
      // 更新题号标签
      ensureGroups(ch);
      const g = ch.groupForIdx[current];
      const labels = ch.labels;
      let qLabelText;
      if (subMode) {
        qLabelText = labels[current];
      } else if (g && g.isParent) {
        qLabelText = g.parentLabel;
      } else {
        qLabelText = labels[current];
      }
      document.getElementById('qLabel').textContent = qLabelText;
      updateStatusBtns(); updateQBadBtn(); updateSBadBtn(); updateImgBadWarnings();
      renderNotes();
      renderStats();
      renderNav();
      renderSm2InfoBar();
      saveResume(); // 记住当前停的章节/题目/小题模式，刷新或切科目前保留
      document.getElementById('questionImg').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // ===== 题目图/解析图不达标 =====
    function updateQBadBtn() { document.getElementById('btnQBad').classList.toggle('marked', !!qBad[current]); }
    function updateSBadBtn() { document.getElementById('btnSBad').classList.toggle('marked', !!sBad[current]); }

    function updateImgBadWarnings() {
      document.getElementById('qBadWarning').classList.toggle('show', !!qBad[current]);
      document.getElementById('sBadWarning').classList.toggle('show', !!sBad[current]);
      document.getElementById('questionImg').classList.toggle('qbad-border', !!qBad[current]);
      document.querySelectorAll('#solutionImgs .solution-img').forEach(img => {
        img.classList.toggle('sbad-border', !!sBad[current]);
      });
    }

    // ===== 笔记渲染 =====
    // Markdown + LaTeX 渲染：marked 转 HTML → DOMPurify 消毒 → auto-render 渲染 KaTeX → 再次消毒
    // 两次消毒：marked 默认放行内联 HTML（防 <img onerror> 等注入）；KaTeX \href 可能生成链接（防 javascript: 链接）
    function sanitizeNotesHtml(html) {
      if (typeof DOMPurify === 'undefined') return String(html).replace(/<[^>]*>/g, ''); // 无 DOMPurify 时兜底去标签
      return DOMPurify.sanitize(html, { ADD_ATTR: ['target'] });
    }
    function renderNotesMarkdown(src) {
      if (!src) return '';
      var html;
      try {
        // 先抽离 $...$/$$...$$ 公式占位，避免 marked 的 Markdown 转义吞掉 LaTeX 反斜杠（如 \{、\\）
        var mathSpans = [];
        var protectedSrc = src.replace(/\$\$[\s\S]+?\$\$|\$[^$\n]+?\$/g, function (m) {
          mathSpans.push(m);
          return '' + (mathSpans.length - 1) + '';
        });
        // breaks:true → 单换行渲染为 <br>，所见即所得（空行仍是段落间距）
        var md = marked.parse(protectedSrc, { breaks: true });
        html = sanitizeNotesHtml(md);
      } catch (e) { html = String(src).replace(/</g, '&lt;'); }
      var holder = document.createElement('div');
      holder.innerHTML = html;
      restoreMathPlaceholders(holder, mathSpans); // 在 DOM 中还原公式为纯文本，避免消毒器二次破坏
      try {
        renderMathInElement(holder, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false }
          ],
          throwOnError: false
        });
      } catch (e) {}
      return sanitizeNotesHtml(holder.innerHTML);
    }

    // 把 N 占位符还原为原始 LaTeX 文本（text node，不经 HTML 解析）
    function restoreMathPlaceholders(root, spans) {
      if (!spans.length || !root) return;
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      var nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        var txt = node.nodeValue || '';
        if (txt.indexOf('') === -1) continue;
        var frag = document.createDocumentFragment();
        var re = /([0-9]+)/g, m, last = 0, hit = false;
        while ((m = re.exec(txt)) !== null) {
          if (m.index > last) frag.appendChild(document.createTextNode(txt.substring(last, m.index)));
          var idx = parseInt(m[1], 10);
          if (spans[idx] !== undefined) frag.appendChild(document.createTextNode(spans[idx]));
          last = m.index + m[0].length;
          hit = true;
        }
        if (!hit) continue;
        if (last < txt.length) frag.appendChild(document.createTextNode(txt.substring(last)));
        node.parentNode.replaceChild(frag, node);
      }
    }

    // 编辑时右侧实时预览（防抖）
    var notesPreviewTimer = null;
    function updateNotesPreview() {
      clearTimeout(notesPreviewTimer);
      notesPreviewTimer = setTimeout(function() {
        var preview = document.getElementById('notesPreview');
        var textarea = document.getElementById('notesTextarea');
        if (preview) preview.innerHTML = renderNotesMarkdown(textarea ? textarea.value : '');
      }, 200);
    }

    // 查看模式：渲染结果常驻显示在「笔记」下方
    function renderNotes() {
      const hasNote = notesData[notesKeyFor(current)];
      const duo = document.getElementById('notesDuo');
      if (duo) duo.style.display = 'none'; // 非编辑态隐藏双栏编辑区
      const render = document.getElementById('notesRender');
      render.style.display = '';
      render.innerHTML = renderNotesMarkdown(hasNote || '');
      document.getElementById('btnNoteEdit').style.display = '';
      document.getElementById('btnNoteSave').style.display = 'none';
      document.getElementById('btnNoteCancel').style.display = 'none';
      document.getElementById('btnNoteDelete').style.display = hasNote ? '' : 'none';
    }

    // ===== 题号右上角「有笔记 / 有标注」提示（右侧导航角标） =====
    // 指定题号 idx 的题目图/解析图是否有标注
    function hasQuestionImagesAnnotated(idx) {
      // 用 getImgPath(idx) 自动路由到伴章路径（1000题 段）
      const base = getImgPath(idx);
      if (hasAnnotation(base + '_question.png')) return true;
      for (var n = 1; n <= 20; n++) {
        if (hasAnnotation(n === 1 ? base + '_solution.png' : base + '_solution_' + n + '.png')) return true;
      }
      return false;
    }
    // 有笔记（按当前题号 label）或任一图片有标注 → 右侧导航题号亮提示圆点（见 renderNav/appendBadges）

    function enterEditMode() {
      const duo = document.getElementById('notesDuo');
      const render = document.getElementById('notesRender');
      const btnEdit = document.getElementById('btnNoteEdit');
      const btnSave = document.getElementById('btnNoteSave');
      const btnCancel = document.getElementById('btnNoteCancel');
      const btnDelete = document.getElementById('btnNoteDelete');

      const label = getChapter().labels[current];
      const textarea = document.getElementById('notesTextarea');
      textarea.value = notesData[notesKeyFor(current)] || '';
      duo.style.display = '';
      render.style.display = 'none';
      btnEdit.style.display = 'none';
      btnSave.style.display = '';
      btnCancel.style.display = '';
      btnDelete.style.display = 'none';
      textarea.focus();
      updateNotesPreview();

      // 实时预览（防抖）
      textarea.oninput = updateNotesPreview;
      // Enter 保存，Shift+Enter 换行
      textarea.onkeydown = function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          saveNote();
        }
      };
    }

    function saveNote() {
      const nk = notesKeyFor(current);
      const textarea = document.getElementById('notesTextarea');
      const val = textarea.value.trim();
      if (val) {
        notesData[nk] = val;
      } else {
        delete notesData[nk];
      }
      saveNotes();
      renderNotes(); // 保存后回到查看模式（渲染结果）
      renderNav();
    }

    function cancelNoteEdit() {
      renderNotes(); // 取消后回到查看模式（渲染结果）
    }

    function deleteNote() {
      delete notesData[notesKeyFor(current)];
      saveNotes();
      renderNotes();
      renderNav();
    }

    function focusNotes() {
      enterEditMode(); // N 键：直接进入编辑
    }

    function toggleQBad() { qBad[current] = !qBad[current]; if (!qBad[current]) delete qBad[current]; saveQBad(); updateQBadBtn(); updateImgBadWarnings(); renderNav(); }
    function toggleSBad() { sBad[current] = !sBad[current]; if (!sBad[current]) delete sBad[current]; saveSBad(); updateSBadBtn(); updateImgBadWarnings(); renderNav(); }

    // ===== 组合键检测（Z/X/C 5级打标） =====
    let comboState = { z: false, x: false, timer: null };
    function resetCombo() { comboState.z = false; comboState.x = false; if (comboState.timer) { clearTimeout(comboState.timer); comboState.timer = null; } }
    function handleStatusKey(key) {
      // 注：调用方已在 keydown 中做了 INPUT/TEXTAREA 过滤
      if (key === 'z') {
        comboState.z = true;
        comboState.timer = setTimeout(function() { setStatus('proficient'); resetCombo(); }, 200);
        return;
      }
      if (key === 'x') {
        if (comboState.z) { clearTimeout(comboState.timer); setStatus('familiar'); resetCombo(); return; }
        comboState.x = true;
        comboState.timer = setTimeout(function() { setStatus('vague'); resetCombo(); }, 200);
        return;
      }
      if (key === 'c') {
        if (comboState.x) { clearTimeout(comboState.timer); setStatus('rusty'); resetCombo(); return; }
        setStatus('wrong'); resetCombo();
        return;
      }
      // 非 Z/X/C 键打断组合
      resetCombo();
    }

    // ===== 掌握度 =====
    function updateStatusBtns() {
      const cur = statuses[current] || '';
      ['proficient', 'familiar', 'vague', 'rusty', 'wrong'].forEach(function(s) {
        const btn = document.getElementById('btn' + s.charAt(0).toUpperCase() + s.slice(1));
        if (!btn) return;
        btn.className = 'gel-btn btn-status' + (s === cur ? ' ' + s + ' active' : '');
      });
    }

    function setStatus(status) {
      const had = statuses[current];
      // 复习会话中不允许取消标记（同一键重复选 = 正常记录，不 toggle off）
      const togglingOff = reviewSession ? false : (had === status);
      // 撤销栈：记录本次修改前的状态
      if (!togglingOff) pushUndo(current, had);
      if (togglingOff) { delete statuses[current]; pushUndo(current, had); }
      else { statuses[current] = status; }
      saveStatuses(); updateStatusBtns(); renderStats(); renderNav(); updateFilterCounts();
      // SM-2: 普通刷题区改标记 = 重新定基线；复习会话 = 真正复习事件
      const scoreMap = { proficient: 5, familiar: 4, vague: 3, rusty: 2, wrong: 1 };
      if (!togglingOff && scoreMap[status]) {
        sm2Review(current, scoreMap[status], !!reviewSession);
      }
      if (reviewSession) { reviewNext(); }
      else if (!togglingOff && !had) { navNext(); }
      renderSm2InfoBar();
    }

    // ===== 撤销最近一次掌握度标记 =====
    var undoStack = [];
    function pushUndo(idx, prevStatus) {
      undoStack.push({ idx: idx, prevStatus: prevStatus || '' });
      if (undoStack.length > 50) undoStack.shift();
    }
    function undoLastMark() {
      if (undoStack.length === 0) return;
      var act = undoStack.pop();
      switchTo(act.idx);
      if (act.prevStatus) { statuses[act.idx] = act.prevStatus; }
      else { delete statuses[act.idx]; }
      saveStatuses(); updateStatusBtns(); renderStats(); renderNav(); updateFilterCounts();
      renderSm2InfoBar();
    }

    function toggleSolution() {
      showSolution = !showSolution;
      saveSolutionPref(); // 解析显示开关持久化（按科目记忆）
      updateSolutionUI();
    }

    function toggleDefaultSolution() {
      defaultShowSolution = !defaultShowSolution;
      showSolution = defaultShowSolution;
      saveSolutionPref(); // 解析默认偏好持久化（按科目记忆）
      renderSolDefaultBtn();
      updateSolutionUI();
    }

    function renderSolDefaultBtn() {
      const btn = document.getElementById('btnSolDefault');
      if (defaultShowSolution) {
        btn.innerHTML = '解析默认：显示<span class="sol-key">Shift+Space</span>';
      } else {
        btn.innerHTML = '解析默认：隐藏<span class="sol-key">Shift+Space</span>';
      }
    }

    // ===== 筛选栏数字统计 =====
    function updateFilterCounts() {
      const ch = getChapter();
      const total = ch.total;
      let prof = 0, vag = 0, wr = 0;
      Object.values(statuses).forEach(function(s) {
        if (s === 'proficient' || s === 'familiar') prof++;
        else if (s === 'vague' || s === 'rusty') vag++;
        else if (s === 'wrong') wr++;
      });
      // 带笔记计数
      let withNoteOrAnnot = 0;
      for (let i = 0; i < total; i++) {
        if (notesData[notesKeyFor(i)] || hasQuestionImagesAnnotated(i)) withNoteOrAnnot++;
      }
      const setCount = function(filter, val) {
        const el = document.querySelector('.filter-btn[data-filter="' + filter + '"] .filter-count');
        if (el) el.textContent = val;
      };
      setCount('all', total);
      setCount('proficient', prof);
      setCount('vague', vag);
      setCount('wrong', wr);
      setCount('unmarked', withNoteOrAnnot);
    }

    // ===== 灯箱（图片点击全屏） =====
    let lbScale = 1, lbTranslateX = 0, lbTranslateY = 0, lbDragging = false, lbLastX = 0, lbLastY = 0;

    function lbApplyTransform() {
      const img = document.getElementById('lightboxImg');
      img.style.transform = 'translate(' + lbTranslateX + 'px,' + lbTranslateY + 'px) scale(' + lbScale + ')';
    }


    document.addEventListener('DOMContentLoaded', function () {
      const overlay = document.getElementById('lightbox');
      const lbImg = document.getElementById('lightboxImg');

      // 题目图片点击打开灯箱。
      // 用捕获阶段监听 .annot-wrapper（图片 + readonly 标注层的父容器）：
      // 有标注时 readonly 标注层（mjs-marker-view 及其 shadow 内部）会覆盖图片区域，
      // 点击的 target 是标注层本身而非 <img>，冒泡阶段到不了 questionImg（questionImg
      // 是兄弟节点，不在事件路径上）。捕获阶段在 wrapper 上先于 target 处理，且能拿到
      // 图片 src，保证无论是否命中标注层都能开灯箱。
      document.getElementById('qAnnotWrap').addEventListener('click', function (e) {
        const img = document.getElementById('questionImg');
        const src = img && img.src;
        if (src && !src.endsWith('/')) openLightbox(src);
      }, true);
      // 解析图片（含分片）也可点击打开灯箱。
      // 捕获阶段监听：有标注时点击 target 是标注层（mjs-marker-view）而非 <img>，
      // 需从事件路径里找对应的 .solution-img 取 src（与主题目图同理，见 qAnnotWrap）。
      document.getElementById('solutionImgs').addEventListener('click', function (e) {
        // 从事件路径找 .solution-img（覆盖 命中标注层 / 命中 <img> 两种情况）。
        // 有标注时点击命中标注层，.solution-img 是 .annot-overlay 的兄弟节点、不在路径上，
        // 但 .annot-wrapper 是标注层的祖先、一定在路径上——从它里面取回被覆盖的那张 <img>。
        const path = e.composedPath ? e.composedPath() : (e.path || []);
        let img = null;
        for (let i = 0; i < path.length; i++) {
          const el = path[i];
          if (el && el.classList) {
            if (el.classList.contains('solution-img')) { img = el; break; }
            if (el.classList.contains('annot-wrapper')) {
              const im = el.querySelector('.solution-img');
              if (im) { img = im; break; }
            }
          }
        }
        const src = img && img.src;
        if (src && !src.endsWith('/')) openLightbox(src);
      }, true);

      document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
      overlay.addEventListener('click', function (e) { if (e.target === overlay) closeLightbox(); });

      // 标注模式下点击非图片背景：与查看模式一致地退出（保存标注并回到灯箱查看）。
      // mjs-marker-area 铺满灯箱，需在 capture 阶段拦截：命中 marker-area 本身或其后代空白区即视为背景点击。
      overlay.addEventListener('click', function (e) {
        if (!lbAnnotMode) return;
        const ma = lbMarkerArea;
        if (!ma) return;
        // 工具栏 / 标注按钮 / 关闭按钮上的点击不拦截
        if (e.target.closest && e.target.closest('#annotToolbar, #lightboxAnnotate, #lightboxClose')) return;
        // 判断是否点在图内：标记编辑区（canvas-container）内的图片/控件算图内，其余算背景
        let insideImage = false;
        try {
          const cc = ma.shadowRoot && ma.shadowRoot.querySelector('.canvas-container');
          const imgEl = cc && cc.querySelector('img');
          if (imgEl && imgEl.getBoundingClientRect) {
            const r = imgEl.getBoundingClientRect();
            insideImage = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
          }
        } catch (err) {}
        if (!insideImage) {
          e.stopPropagation();
          // 无标注内容 → 直接退出灯箱；有标注内容 → 先保存并退出标注模式（回到灯箱查看）
          if (annotHasContent()) saveAnnotationFromArea();
          else closeLightbox();
        }
      }, true);

      // 灯箱滚轮缩放
      overlay.addEventListener('wheel', function (e) {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 1.15 : 0.87;
        const newScale = Math.min(Math.max(lbScale * delta, 0.5), 5);
        const rect = lbImg.getBoundingClientRect();
        const mx = e.clientX - rect.left - rect.width / 2;
        const my = e.clientY - rect.top - rect.height / 2;
        lbTranslateX -= mx * (newScale / lbScale - 1);
        lbTranslateY -= my * (newScale / lbScale - 1);
        lbScale = newScale;
        lbApplyTransform();
      }, { passive: false });

      // 灯箱拖拽
      lbImg.addEventListener('mousedown', function (e) {
        lbDragging = true; lbLastX = e.clientX; lbLastY = e.clientY;
        lbImg.classList.add('grabbing');
      });
      window.addEventListener('mousemove', function (e) {
        if (!lbDragging) return;
        lbTranslateX += e.clientX - lbLastX;
        lbTranslateY += e.clientY - lbLastY;
        lbLastX = e.clientX; lbLastY = e.clientY;
        lbApplyTransform();
      });
      window.addEventListener('mouseup', function () {
        lbDragging = false;
        lbImg.classList.remove('grabbing');
      });

      // 灯箱双击关闭
      lbImg.addEventListener('dblclick', closeLightbox);

      // 快捷键帮助：点击背景关闭
      const scOverlay = document.getElementById('shortcutOverlay');
      scOverlay.addEventListener('click', function(e) {
        if (e.target === scOverlay) toggleShortcutHelp();
      });
    });

    // ===== 图片标注（marker.js 3）：矢量数据持久化 =====
    var imgAnnotations = {}; // key: 图片 src，value: markerArea.getState() 的矢量 JSON
    // 统一 key：图片 src 可能来自 img.src（绝对 file:// URL）或 getImgPath 拼出的相对路径。
    // 灯箱用绝对路径存取、解析图加载用相对路径查询，必须归一化成同一个 key 才能对上。
    function normalizeAnnotSrc(imgSrc) {
      try { return new URL(imgSrc, window.location.href).href; } catch (e) { return imgSrc; }
    }
    function annotKey(imgSrc) { return 'annot_' + normalizeAnnotSrc(imgSrc); }
    function loadAnnotations() {
      try {
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i);
          if (k && k.indexOf('annot_') === 0) {
            try { imgAnnotations[normalizeAnnotSrc(k.substring(6))] = JSON.parse(localStorage.getItem(k)); } catch (e) {}
          }
        }
      } catch (e) {}
    }
    function saveAnnotation(imgSrc, state) {
      imgAnnotations[normalizeAnnotSrc(imgSrc)] = state;
      try { localStorage.setItem(annotKey(imgSrc), JSON.stringify(state)); } catch (e) {}
    }
    function getAnnotation(imgSrc) { return imgAnnotations[normalizeAnnotSrc(imgSrc)] || null; }
    function clearAnnotation(imgSrc) {
      const key = normalizeAnnotSrc(imgSrc);
      delete imgAnnotations[key];
      try { localStorage.removeItem('annot_' + key); } catch (e) {}
    }
    function hasAnnotation(imgSrc) { return !!getAnnotation(imgSrc); }
    loadAnnotations();

    // ===== 灯箱标注编辑（marker.js 3 + 自建 Snipaste 风格工具栏） =====
    var lbCurrentSrc = null;     // 灯箱当前打开的图片 src
    var lbMarkerArea = null;     // 当前 MarkerArea 实例
    var lbAnnotMode = false;     // 是否处于标注模式
    var lbAnnotColor = '#ff0000'; // 当前标注颜色
    var lbAnnotWidth = 4;        // 当前标注粗细
    var lbLastAnnotTool = 'FrameMarker';   // 最近一次绘图工具（Tab/右键/横向滚轮用）
    var lbCurrentAnnotTool = 'FrameMarker'; // 当前激活工具
    var lbCurrentAnnotEditor = null;       // 当前未注册的绘图编辑器（Shift 锁定时覆写坐标）
    var lbAnnotShiftWasOn = false;         // 拖动期间是否按住 Shift（释放时再吸一次）

    // 工具按钮 → marker typeName（按工具栏从左到右顺序，横向滚轮/Tab 循环用）
    var ANNOT_TOOLS = ['FrameMarker', 'LineMarker', 'HighlighterMarker', 'FreehandMarker'];

    // 每个标注工具各自的默认颜色/粗细（Snipaste：不同标注形状分别记忆颜色）。
    // 切到某工具时载入其记忆值；用户调整后按工具分别保存，不再互相串扰。
    var ANNOT_TOOL_STYLES = {
      LineMarker:        { color: '#ff0000', width: 4 },  // 直线：红 4
      FrameMarker:       { color: '#ff0000', width: 4 },  // 矩形：红 4
      HighlighterMarker: { color: '#ffff00', width: 20 }, // 高亮：亮黄 20
      FreehandMarker:    { color: '#ff0000', width: 3 }   // 画笔：红 3
    };

    // 预设色板（Microsoft Office 标准 20 色，Snipaste 等标注工具调色板底层即此套 RGB）
    var ANNOT_COLORS = [
      '#000000', '#7f7f7f', // 黑 / 灰
      '#880015', '#ed1c24', // 深红 / 红
      '#ff7f27', '#fff200', // 橙 / 黄
      '#22b14c', '#1e90ff', // 绿 / 亮蓝
      '#3f48cc', '#a349a4', // 蓝 / 紫
      '#ffffff', '#c3c3c3', // 白 / 浅灰
      '#b97a57', '#ffaec9', // 棕 / 粉
      '#ffc90e', '#efe4b0', // 明黄 / 米黄
      '#b5e61d', '#99d9ea', // 黄绿 / 浅青
      '#7092be', '#c8bfe7'  // 蓝灰 / 浅紫
    ];

    function openLightbox(src) {
      closeAnnotator();
      const overlay = document.getElementById('lightbox');
      const img = document.getElementById('lightboxImg');
      lbCurrentSrc = src;
      img.src = src;
      lbScale = 1; lbTranslateX = 0; lbTranslateY = 0;
      img.style.transform = '';
      overlay.classList.add('show');
      document.body.style.overflow = 'hidden';
      updateAnnotateBtn();
      openAnnotator(); // 点击图片默认即进入标注模式
    }

    function showLightboxAnnotationOverlay() {
      const lbOverlay = document.getElementById('lightboxAnnotOverlay');
      if (!lbOverlay || typeof markerjs3 === 'undefined') return;
      lbOverlay.innerHTML = '';
      const hasA = hasAnnotation(lbCurrentSrc);
      if (!lbCurrentSrc || !hasA) { lbOverlay.style.display = 'none'; return; }
      const img = document.getElementById('lightboxImg');
      lbOverlay.style.display = '';
      const apply = function () {
        const mview = new markerjs3.MarkerView();
        lbOverlay.appendChild(mview);
        mview.targetImage = img;
        mview.show(getAnnotation(lbCurrentSrc));
      };
      if (img.complete && img.naturalWidth > 0) apply();
      else { img.onload = function() { apply(); }; }
    }

    function updateAnnotateBtn() {
      const btn = document.getElementById('lightboxAnnotate');
      if (!btn) return;
      if (!lbCurrentSrc) { btn.style.display = 'none'; return; }
      btn.style.display = '';
      var hasAny = hasAnnotation(lbCurrentSrc);
      btn.textContent = hasAny ? '标注（已有）' : '标注';
      btn.classList.toggle('has-annot', hasAny);
    }

    // 应用当前颜色/粗细到编辑器（新建 marker 时生效）
    function applyAnnotStyle() {
      if (!lbMarkerArea) return;
      const editor = lbMarkerArea.currentMarkerEditor;
      if (!editor) return;
      try {
        if (lbAnnotColor) editor.strokeColor = lbAnnotColor;
        if (lbAnnotWidth) editor.strokeWidth = lbAnnotWidth;
      } catch (e) {}
    }

    // 高亮当前工具按钮
    function highlightAnnotTool(tool) {
      document.querySelectorAll('#annotToolbar .at-tool').forEach(function (b) {
        b.classList.toggle('active', b.dataset.tool === tool);
      });
    }

    // 载入某工具的已记忆/默认颜色粗细，并同步到 UI
    function loadAnnotToolStyle(tool) {
      const s = ANNOT_TOOL_STYLES[tool];
      if (!s) return;
      lbAnnotColor = s.color;
      lbAnnotWidth = s.width;
      const w = document.getElementById('annotWidth');
      if (w) w.value = lbAnnotWidth;
      updateAnnotWidthUI();
      updateAnnotColorUI();
    }

    // 切换标注工具（select → 选择模式；否则 createMarker）
    // 每次切工具载入该工具记忆的颜色/粗细（Snipaste：按形状记忆颜色），
    // 因此高亮不再被重置回默认，画笔也不会继承高亮的 20 粗细。
    function selectAnnotTool(toolName) {
      if (!lbMarkerArea) return;
      lbCurrentAnnotTool = toolName;
      lbLastAnnotTool = toolName;
      lbCurrentAnnotEditor = null;
      if (toolName !== 'select') loadAnnotToolStyle(toolName); // 载入该工具记忆值
      let editor = null;
      try {
        if (toolName === 'select') {
          lbMarkerArea.switchToSelectMode();
        } else {
          editor = lbMarkerArea.createMarker(toolName);
        }
      } catch (e) {}
      // 工具就绪后应用颜色/粗细（createMarker 返回当前编辑器）
      if (editor) {
        try {
          if (lbAnnotColor) editor.strokeColor = lbAnnotColor;
          if (lbAnnotWidth) editor.strokeWidth = lbAnnotWidth;
        } catch (e) {}
        lbCurrentAnnotEditor = editor; // 供 Shift 锁定使用
      }
      highlightAnnotTool(toolName);
    }

    function closeAnnotator() {
      // 销毁 MarkerArea，退出标注模式，回到灯箱查看
      if (lbMarkerArea) {
        try { lbMarkerArea.remove(); } catch (e) {}
        lbMarkerArea = null;
      }
      lbAnnotMode = false;
      const img = document.getElementById('lightboxImg');
      const overlay = document.getElementById('lightbox');
      if (img) img.style.display = '';
      const hint = overlay && overlay.querySelector('.lightbox-hint');
      if (hint) { hint.style.display = ''; hint.textContent = '滚轮缩放 / 拖拽移动 / 双击或点击背景关闭'; }
      const tb = document.getElementById('annotToolbar');
      if (tb) tb.style.display = 'none';
      // 关闭预设色板
      const pal = document.getElementById('annotPalette');
      if (pal) pal.style.display = 'none';
      updateAnnotateBtn();
      // 回到查看：刷新灯箱标注叠加
      if (lbCurrentSrc) showLightboxAnnotationOverlay();
    }

    function openAnnotator() {
      if (typeof markerjs3 === 'undefined') { alert('标注组件未加载'); return; }
      if (!lbCurrentSrc) return;
      closeAnnotator(); // 清掉残留
      const img = document.getElementById('lightboxImg');
      const overlay = document.getElementById('lightbox');
      // 隐藏原图、标注叠加与提示，注入 MarkerArea
      img.style.display = 'none';
      const lbOverlay = document.getElementById('lightboxAnnotOverlay');
      if (lbOverlay) { lbOverlay.style.display = 'none'; lbOverlay.innerHTML = ''; }
      const hint = overlay.querySelector('.lightbox-hint');
      if (hint) hint.style.display = 'none';
      // 内置滚轮平移已由全局 blockMarkerCanvasWheel 永久屏蔽，直接构造即可
      let ma;
      try {
        ma = new markerjs3.MarkerArea();
      } catch (e) {
        ma = null;
      }
      lbMarkerArea = ma;
      ma.targetImage = img; // 复用灯箱中原图引用
      // 已有标注则恢复
      const state = getAnnotation(lbCurrentSrc);
      if (state) {
        try { ma.restoreState(state); } catch (e) {}
      }
      overlay.appendChild(ma);
      // 滚轮缩放/右键粗细/横向切工具（capture 拦截，避免冒泡到 overlay 缩放监听）
      ma.addEventListener('wheel', onAnnotWheel, { passive: false, capture: true });
      // Shift 锁定：marker.js 的 window pointermove/up 在 appendChild 时已注册且永不移除，
      // remove+add 让本监听排在 marker.js 之后执行，从而能在其更新 x2/y2 后覆写为水平/竖直
      window.removeEventListener('pointermove', onAnnotPointerMove);
      window.addEventListener('pointermove', onAnnotPointerMove);
      window.removeEventListener('pointerup', onAnnotPointerUp);
      window.addEventListener('pointerup', onAnnotPointerUp);
      // 显示工具栏，默认选择矩形（进入即用 FrameMarker）
      const tb = document.getElementById('annotToolbar');
      if (tb) {
        tb.style.display = '';
        document.getElementById('annotWidth').value = lbAnnotWidth;
        updateAnnotWidthUI();
      }
      buildAnnotPalette(); // 重建预设色板（含高亮当前色）
      lbAnnotMode = true;
      selectAnnotTool('FrameMarker'); // 进入即用矩形（内部已初始化 lbCurrentAnnotTool/lbLastAnnotTool）
      const annotBtn = document.getElementById('lightboxAnnotate');
      if (annotBtn) {
        annotBtn.textContent = '退出标注';
        annotBtn.classList.remove('has-annot');
      }
    }

    // 工具栏事件绑定（DOMContentLoaded 后调用）
    function bindAnnotToolbar() {
      const tb = document.getElementById('annotToolbar');
      if (!tb) return;
      tb.addEventListener('click', function (e) {
        const btn = e.target.closest('.at-btn, .at-width-step');
        if (!btn) return;
        const action = btn.dataset.action;
        const tool = btn.dataset.tool;
        if (action === 'undo')        { doUndo(); return; }
        if (action === 'redo')        { doRedo(); return; }
        if (action === 'save')        { saveAnnotationFromArea(); return; }
        if (action === 'cancel')      { closeAnnotator(); return; }
        if (action === 'width-minus') { adjustAnnotWidth(-1); return; }
        if (action === 'width-plus')  { adjustAnnotWidth(1); return; }
        if (tool && ANNOT_TOOLS.indexOf(tool) >= 0) { selectAnnotTool(tool); }
      });

      // 粗细滑块实时应用（同步到当前工具的记忆值）
      document.getElementById('annotWidth').addEventListener('input', function (e) {
        lbAnnotWidth = parseInt(e.target.value, 10) || 1;
        const s = ANNOT_TOOL_STYLES[lbCurrentAnnotTool];
        if (s) s.width = lbAnnotWidth;
        updateAnnotWidthUI();
        if (lbMarkerArea) applyAnnotStyle();
      });

      // 颜色按钮：开关预设色板
      const colorBtn = document.getElementById('annotColorSwatch');
      if (colorBtn) colorBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleAnnotPalette();
      });

      // 色板：预设色点击
      const pal = document.getElementById('annotPalette');
      if (pal) pal.addEventListener('click', function (e) {
        const s = e.target.closest('.at-swatch');
        if (s) { setAnnotColor(s.dataset.color); toggleAnnotPalette(false); return; }
      });

      // 色板：自定义色
      const custom = document.getElementById('annotColorCustom');
      if (custom) custom.addEventListener('input', function (e) { setAnnotColor(e.target.value); });

      // 点击工具栏外部关闭色板
      document.addEventListener('click', function (e) {
        if (!pal || pal.style.display === 'none') return;
        if (!e.target.closest('#annotPalette') && !e.target.closest('#annotColorSwatch')) {
          pal.style.display = 'none';
        }
      });

      // 右键结束当前标注编辑（画折线/多边形时）
      document.getElementById('lightbox').addEventListener('contextmenu', onAnnotContextMenu, true);
    }


    function refreshPageOverlays() {
      renderQuestionAnnotations();
      // 解析图标注由 setSolutionImages 在加载时处理；此处重新渲染当前解析图
      const container = document.getElementById('solutionImgs');
      if (container) {
        const base = getImgPath(current);
        setSolutionImages(base); // 重新探测，触发 hasAnnotation 叠加
      }
    }

    function closeLightbox() {
      closeAnnotator();
      const overlay = document.getElementById('lightbox');
      overlay.classList.remove('show');
      document.body.style.overflow = '';
      lbCurrentSrc = null;
    }

    // 标注按钮事件（在 DOMContentLoaded 中绑定）
    document.addEventListener('DOMContentLoaded', function () {
      const annotBtn = document.getElementById('lightboxAnnotate');
      if (annotBtn) {
        annotBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          if (lbAnnotMode) { saveAnnotationFromArea(); }
          else openAnnotator();
        });
      }
      // 灯箱内标注叠加容器（注入 HTML 之后在下方补建）
      const overlay = document.getElementById('lightbox');
      if (overlay && !document.getElementById('lightboxAnnotOverlay')) {
        const lbOverlay = document.createElement('div');
        lbOverlay.className = 'lightbox-annot-overlay';
        lbOverlay.id = 'lightboxAnnotOverlay';
        lbOverlay.style.display = 'none';
        overlay.appendChild(lbOverlay);
      }
      bindAnnotToolbar(); // 自建工具栏事件
      // Shift 锁定监听在 openAnnotator 中「remove+add」以排在 marker.js 之后执行
    });

    // ===== 标注模式键盘交互（Snipaste 式） =====
    function handleAnnotKeydown(e) {
      const key = e.key.toLowerCase();

      // Alt：退出标注（进入/退出标注的快捷键），保存并回到灯箱查看
      if (e.key === 'Alt') {
        e.preventDefault();
        saveAnnotationFromArea();
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (key) {
          case 'z': e.preventDefault(); e.shiftKey ? doRedo() : doUndo(); break;
          case 'y': e.preventDefault(); doRedo(); break;
          case 's': e.preventDefault(); saveAnnotationFromArea(); break;
        }
        return; // 其它 Ctrl 组合放行（如 Ctrl+C 复制）
      }
      if (e.altKey) return;

      switch (key) {
        case ' ':        e.preventDefault(); toggleAnnotToolbar(); return; // 空格：显隐工具栏
        case 'tab':      e.preventDefault(); cycleAnnotTool(); return;     // Tab：在直线/矩形/高亮/画笔间切换
        case 'escape':   e.preventDefault(); closeAnnotator(); return;     // Esc：退出标注
        case 'delete':
        case 'backspace': e.preventDefault(); deleteAnnotSelection(); return;
      }

      // 工具快捷键：直线/矩形/高亮/画笔
      const map = { l: 'LineMarker', r: 'FrameMarker', h: 'HighlighterMarker', b: 'FreehandMarker' };
      if (map[key]) {
        e.preventDefault();
        selectAnnotTool(map[key]); // 切工具即载入该工具记忆的颜色/粗细
      }
    }

    // Tab 在工具栏工具顺序中循环（矩形 → 直线 → 高亮 → 画笔，与 ANNOT_TOOLS 一致）
    function cycleAnnotTool() {
      let i = ANNOT_TOOLS.indexOf(lbCurrentAnnotTool);
      if (i < 0) i = 0;
      selectAnnotTool(ANNOT_TOOLS[(i + 1) % ANNOT_TOOLS.length]);
    }

    // 空格显隐工具栏（Snipaste：空格显示/隐藏标注工具条）
    function toggleAnnotToolbar() {
      const tb = document.getElementById('annotToolbar');
      if (!tb) return;
      const hide = tb.style.display !== 'none';
      tb.style.display = hide ? 'none' : '';
      const hint = document.querySelector('#lightbox .lightbox-hint');
      if (hint) {
        if (hide) {
          hint.textContent = '工具栏已隐藏，按空格重新显示';
          hint.style.display = '';
        } else {
          hint.textContent = '滚轮缩放 / 拖拽移动 / 双击或点击背景关闭 · 空格隐藏工具栏';
          hint.style.display = '';
        }
      }
    }

    // 右键结束当前标注编辑（连续绘制同一工具）
    function onAnnotContextMenu(e) {
      if (!lbAnnotMode) return;
      if (e.target && e.target.closest && e.target.closest('#annotToolbar')) return; // 工具栏上右键不拦截
      e.preventDefault();
      finishCurrentAnnot();
    }

    function finishCurrentAnnot() {
      if (!lbMarkerArea) return;
      try {
        lbMarkerArea.switchToSelectMode(); // 内部 deselect → 收尾当前编辑
        const t = lbLastAnnotTool;
        if (t && t !== 'select') {
          // 重新进入同工具，便于连续绘制
          selectAnnotTool(t);
        }
      } catch (e) {}
    }

    // Shift 锁定直线为水平或竖直（Snipaste：按住 Shift 画直线）
    // marker.js 的 onPointerMove/onPointerUp 绑定在 window 上且先于本监听器注册，
    // 会先按局部坐标更新 marker.x2/y2；此处只做「吸到水平/竖直」的覆写。
    function snapAnnotToAxis() {
      if (!lbAnnotMode) return false;
      const tool = lbCurrentAnnotTool;
      if (tool !== 'LineMarker') return false;
      const ed = lbCurrentAnnotEditor;
      if (!ed || (ed.state !== 'creating' && ed.state !== 'select')) return false;
      const marker = ed.marker;
      if (!marker || typeof marker.x1 !== 'number' || typeof marker.y1 !== 'number') return false;
      const x1 = marker.x1, y1 = marker.y1;
      const dx = marker.x2 - x1, dy = marker.y2 - y1;
      try {
        if (Math.abs(dx) >= Math.abs(dy)) marker.y2 = y1; // 水平锁定
        else marker.x2 = x1;                              // 竖直锁定
        marker.adjustVisual();
        if (ed.adjustControlBox) ed.adjustControlBox();
      } catch (err) {}
      return true;
    }
    function onAnnotPointerMove(e) {
      if (e.shiftKey) {
        lbAnnotShiftWasOn = true;
        snapAnnotToAxis();
      } else {
        lbAnnotShiftWasOn = false;
      }
    }
    // 释放时 marker.js 的 resize 会用末帧坐标覆盖，需再吸一次（需记录 Shift 状态）
    function onAnnotPointerUp(e) {
      if (lbAnnotShiftWasOn) {
        snapAnnotToAxis();
        lbAnnotShiftWasOn = false;
      }
    }

    // 滚轮交互（capture 拦截，阻止冒泡到 overlay 缩放）：
    //   - 普通滚轮（deltaY）→ 缩放（光标处）
    //   - 右键按住 + 滚轮 → 调节画笔粗细
    //   - 横向滚轮（deltaX）→ 切换工具
    function onAnnotWheel(e) {
      if (!lbAnnotMode) return;
      e.preventDefault();
      e.stopPropagation();

      // 右键按住：调节粗细（Snipaste：右键+滚轮）
      if (e.buttons === 2 || e.button === 2) {
        const delta = (e.deltaY < 0) ? 1 : -1;
        adjustAnnotWidth(delta);
        return;
      }

      // 横向滚轮：切换工具（|deltaX| 明显大于 |deltaY| 时判定为横向）
      const dx = e.deltaX || 0, dy = e.deltaY || 0;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 1) {
        cycleAnnotToolByDelta(dx > 0 ? 1 : -1);
        return;
      }

      // 普通滚轮：缩放（光标处）
      zoomAnnotAt(e.clientX, e.clientY, dy < 0 ? 1.15 : 0.87);
    }

    // 在光标处缩放（保持光标下的图片坐标不漂移）
    function zoomAnnotAt(cx, cy, factor) {
      const ma = lbMarkerArea;
      if (!ma) return;
      const cc = ma.shadowRoot && ma.shadowRoot.querySelector('.canvas-container');
      if (!cc) return;
      const cr = cc.getBoundingClientRect();
      const Cx = cr.left + cr.width / 2, Cy = cr.top + cr.height / 2;
      const oldZoom = ma._zoomLevel || 1;
      const newZoom = Math.min(Math.max(oldZoom * factor, 0.5), 5);
      if (newZoom === oldZoom) return;
      const ddx = (cx - Cx - (ma._panX || 0)) / oldZoom;
      const ddy = (cy - Cy - (ma._panY || 0)) / oldZoom;
      ma._zoomLevel = newZoom;
      ma._panX = (ma._panX || 0) + (oldZoom - newZoom) * ddx;
      ma._panY = (ma._panY || 0) + (oldZoom - newZoom) * ddy;
      ma.applyTransform();
      try { ma.adjustEditorsZoom(); } catch (e) {}
    }

    // 横向滚轮切换工具（在工具栏工具顺序中循环）
    function cycleAnnotToolByDelta(dir) {
      let i = ANNOT_TOOLS.indexOf(lbCurrentAnnotTool);
      if (i < 0) i = ANNOT_TOOLS.indexOf(lbLastAnnotTool);
      if (i < 0) i = 0;
      selectAnnotTool(ANNOT_TOOLS[(i + dir + ANNOT_TOOLS.length) % ANNOT_TOOLS.length]);
    }

    function adjustAnnotWidth(d) {
      lbAnnotWidth = Math.max(1, Math.min(30, (lbAnnotWidth || 1) + d));
      const s = ANNOT_TOOL_STYLES[lbCurrentAnnotTool];
      if (s) s.width = lbAnnotWidth; // 同步到当前工具的记忆值
      const w = document.getElementById('annotWidth');
      if (w) w.value = lbAnnotWidth;
      updateAnnotWidthUI();
      if (lbMarkerArea) applyAnnotStyle();
    }

    // 撤销 / 重做 / 删除
    function doUndo() {
      if (lbMarkerArea) { try { lbMarkerArea.undo(); } catch (err) {} }
    }
    function doRedo() {
      if (lbMarkerArea) { try { lbMarkerArea.redo(); } catch (err) {} }
    }
    function deleteAnnotSelection() {
      if (lbMarkerArea) { try { lbMarkerArea.deleteSelectedMarkers(); } catch (err) {} }
    }

    // ===== 颜色 / 粗细 UI =====
    function buildAnnotPalette() {
      const wrap = document.getElementById('annotPaletteSwatches');
      if (!wrap) return;
      wrap.innerHTML = '';
      ANNOT_COLORS.forEach(function (c) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'at-swatch';
        b.dataset.color = c;
        b.style.background = c;
        b.title = c;
        wrap.appendChild(b);
      });
      updateAnnotColorUI();
    }
    function toggleAnnotPalette(show) {
      const p = document.getElementById('annotPalette');
      if (!p) return;
      const willShow = (typeof show === 'boolean') ? show : (p.style.display === 'none');
      p.style.display = willShow ? '' : 'none';
      if (willShow) updateAnnotColorUI();
    }
    function setAnnotColor(hex) {
      lbAnnotColor = hex;
      const s = ANNOT_TOOL_STYLES[lbCurrentAnnotTool];
      if (s) s.color = hex; // 同步到当前工具的记忆值
      updateAnnotColorUI();
      if (lbMarkerArea) applyAnnotStyle();
    }
    function updateAnnotColorUI() {
      const dot = document.getElementById('annotColorDot');
      if (dot) dot.style.background = lbAnnotColor;
      document.querySelectorAll('#annotPalette .at-swatch').forEach(function (s) {
        s.classList.toggle('active', String(s.dataset.color || '').toLowerCase() === String(lbAnnotColor).toLowerCase());
      });
    }
    function updateAnnotWidthUI() {
      const v = document.getElementById('annotWidthVal');
      if (v) v.textContent = lbAnnotWidth;
    }

    // 标注区当前是否有有效内容（用于背景点击时判断「直接关灯箱」还是「先保存再退出标注」）。
    // 需先 switchToSelectMode 收尾未完成图形，再按 saveAnnotationFromArea 相同的规则过滤 0 尺寸图形。
    function annotHasContent() {
      const ma = lbMarkerArea;
      if (!ma) return false;
      try { ma.switchToSelectMode(); } catch (e) {}
      try {
        const st = ma.getState();
        if (st && Array.isArray(st.markers)) {
          return st.markers.some(function (m) {
            if (!m) return false;
            const f = m.frame;
            if (f && f.width === 0 && f.height === 0) return false;
            return true;
          });
        }
      } catch (e) {}
      return false;
    }

    // 从当前 MarkerArea 读取并保存（点「保存」按钮时）
    function saveAnnotationFromArea() {
      if (!lbCurrentSrc) return;
      if (lbMarkerArea) {
        try { lbMarkerArea.switchToSelectMode(); } catch (e) {} // 收尾：finalize 未完成的图形
        let st;
        try { st = lbMarkerArea.getState(); } catch (e) {}
        if (st && Array.isArray(st.markers)) {
          // 过滤空图形（0 尺寸图形）
          st.markers = st.markers.filter(function (m) {
            if (!m) return false;
            var f = m.frame;
            if (f && f.width === 0 && f.height === 0) return false;
            return true;
          });
        }
        // 无有效标注则清理，避免残留空状态
        if (st && st.markers && st.markers.length === 0) {
          clearAnnotation(lbCurrentSrc);
        } else if (st) {
          saveAnnotation(lbCurrentSrc, st);
        }
      }
      closeAnnotator();
      updateAnnotateBtn();
      refreshPageOverlays();
      renderNav(); // 右侧导航角标同步（标注新增/清除）
    }

    // ===== 事件绑定 =====
    document.getElementById('btnToggle').onclick = toggleSolution;
    document.getElementById('btnSolDefault').onclick = toggleDefaultSolution;
    document.getElementById('btnDashboard').onclick = toggleDashboard;
    document.getElementById('btnWrongBook').onclick = toggleWrongBook;
    document.getElementById('btnShortcutHelp').onclick = toggleShortcutHelp;
    ['Proficient', 'Familiar', 'Vague', 'Rusty', 'Wrong'].forEach(s => {
      document.getElementById('btn' + s).onclick = function () { setStatus(s.toLowerCase()); };
    });
    document.getElementById('btnQBad').onclick = toggleQBad;
    document.getElementById('btnSBad').onclick = toggleSBad;

    // 笔记按钮事件
    document.getElementById('btnNoteEdit').onclick = enterEditMode;
    document.getElementById('btnNoteSave').onclick = saveNote;
    document.getElementById('btnNoteCancel').onclick = cancelNoteEdit;
    document.getElementById('btnNoteDelete').onclick = deleteNote;

    // 筛选按钮事件
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        applyFilter(this.dataset.filter);
      });
    });

    // 导出按钮事件
    document.getElementById('btnExportVague').onclick = function () { exportQuestions('vague'); };
    document.getElementById('btnExportWrong').onclick = function () { exportQuestions('wrong'); };

    // ===== 错题导出 =====
    function exportQuestions(statusFilter) {
      const ch = getChapter();
      const items = [];
      for (let i = 0; i < ch.total; i++) {
        if (statuses[i] === statusFilter) {
          items.push({ label: ch.labels[i], qImg: getImgPath(i) + '_question.png' });
        }
      }
      if (items.length === 0) {
        alert(statusFilter === 'vague' ? '当前章节没有标记为"模糊"的题目' : '当前章节没有标记为"不会"的题目');
        return;
      }
      const statusLabel = statusFilter === 'vague' ? '模糊' : '不会';
      const statusColor = statusFilter === 'vague' ? '#FBC02D' : '#B71C1C';
      const cardsHTML = items.map((item, idx) => {
        // 导出窗口是 about:blank，相对路径无法解析；转成绝对路径（file:// 或 http(s)://）
        let abs = item.qImg;
        try { abs = new URL(item.qImg, window.location.href).href; } catch (e) {}
        return `<div class="card"><h3>${idx + 1}. ${item.label}</h3><img src="${abs}" alt="题目" onerror="this.style.display='none'"></div>`;
      }).join('');

      const w = window.open('', '_blank', 'width=900,height=700');
      w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${ch.name} — ${statusLabel}题</title>
<style>
body{font-family:"Microsoft YaHei",sans-serif;background:#fff;padding:20px;color:#333}
h1{font-size:20px;text-align:center;margin-bottom:4px}
.subtitle{text-align:center;color:${statusColor};font-size:14px;margin-bottom:20px}
.card{border:1px solid #ddd;border-radius:8px;padding:16px;margin-bottom:20px;page-break-inside:avoid}
.card h3{font-size:14px;color:${statusColor};margin:0 0 8px}
.card img{max-width:100%;display:block;margin:8px 0}
@media print{body{padding:0}.card{border:none;border-bottom:1px dashed #ccc;border-radius:0;margin-bottom:12px;padding:12px 0}}
</style></head><body>
<h1>${ch.name}</h1>
<div class="subtitle">${statusLabel}题 · 共 ${items.length} 题</div>
${cardsHTML}
<script>window.onload=function(){window.print()}<\/script>
</body></html>`);
      w.document.close();
    }

    // ===== SM-2 间隔重复复习系统 =====
    let sm2 = {};          // { idx: { ef, interval, reps, nextReview, lastReview, history } }
    let reviewSession = null;  // { queue: [{chapterId, idx}], currentIdx, mode }
    let sm2PanelOpen = false;

    // SM-2 存储键：sm2_<subjectId>_<chapterId>（含科目 ID 避免数学/822 的 ch1 冲突）
    function sm2Key(ch) { return 'sm2_' + curSubjectId + '_' + ch.id; }

    function loadSm2() {
      const ch = getChapter(); if (!ch) return;
      sm2 = {};
      const srcs = statusSources();
      srcs.forEach(function(src) {
        let obj;
        try { obj = JSON.parse(localStorage.getItem(sm2Key(src.ch)) || '{}'); } catch(e) { obj = {}; }
        var len = src.len;
        for (var i = 0; i < len; i++) {
          if (obj[i]) sm2[src.offset + i] = obj[i];
        }
      });
    }

    // ===== 一次性全量迁移：为所有已有掌握度标记但缺 SM-2 记录的题目创建复习排期 =====
    function migrateAllSm2() {
      var flagKey = 'kaoyan_sm2_migrated_' + curSubjectId;
      if (localStorage.getItem(flagKey) === '1') return;
      var scoreMap = { proficient: 5, familiar: 4, vague: 3, rusty: 2, wrong: 1 };
      var migrated = 0;
      CHAPTERS.forEach(function(ch) {
        if (ch.total === 0) return;
        var sm2Obj;
        try { sm2Obj = JSON.parse(localStorage.getItem(sm2Key(ch)) || '{}'); } catch(e) { sm2Obj = {}; }
        var statusObj;
        try { statusObj = JSON.parse(localStorage.getItem(chapterStatusKey(ch)) || '{}'); } catch(e) { statusObj = {}; }
        var changed = false;
        for (var i = 0; i < ch.total; i++) {
          var s = statusObj[i];
          if (s && !sm2Obj[i]) {
            changed = true;
            var score = scoreMap[s] || 3;
            sm2Obj[i] = calcSM2(getSm2Seed(score), score);
            migrated++;
          }
        }
        if (changed) {
          localStorage.setItem(sm2Key(ch), JSON.stringify(sm2Obj));
        }
      });
      localStorage.setItem(flagKey, '1');
      console.log('SM-2 migration: ' + migrated + ' records created for subject ' + curSubjectId);
    }

    function saveSm2() {
      const srcs = statusSources();
      srcs.forEach(function(src) {
        var out = {};
        var len = src.len;
        for (var i = 0; i < len; i++) {
          if (sm2[src.offset + i]) out[i] = sm2[src.offset + i];
        }
        if (Object.keys(out).length > 0) {
          localStorage.setItem(sm2Key(src.ch), JSON.stringify(out));
        } else {
          localStorage.removeItem(sm2Key(src.ch));
        }
      });
    }

    // ===== 重置所有 SM-2 复习进度（清除 bug 遗留数据后重新迁移） =====
    function resetAllSm2() {
      var keys = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && (k.indexOf('sm2_') === 0 || k.indexOf('kaoyan_sm2_migrated_') === 0)) {
          keys.push(k);
        }
      }
      keys.forEach(function(k) { localStorage.removeItem(k); });
      sm2 = {};
      if (sm2PanelOpen) renderSm2Panel();
      console.log('SM-2 进度已重置：' + keys.length + ' 条记录已清除。刷新页面将自动迁移已有掌握度标记。');
      alert('SM-2 复习进度已重置（' + keys.length + ' 条）。\n\n建议刷新页面以重新触发自动迁移。');
      return keys.length;
    }

    function calcSM2(record, score) {
      if (!record) record = { ef: 2.5, interval: 1, reps: 0, nextReview: 0, lastReview: 0, history: [] };
      var now = Date.now();
      var ef = record.ef, interval = record.interval, reps = record.reps;
      var deltaMap = { 5: 0.10, 4: 0.00, 3: -0.14, 2: -0.22, 1: -0.30 };
      var delta = deltaMap[score] || 0;
      if (score >= 3) {
        if (reps === 0) interval = 1;
        else if (reps === 1) interval = 6;
        else interval = Math.round(interval * ef);
        reps++;
      } else {
        interval = 1; reps = 0;
      }
      ef = Math.max(1.3, ef + delta);
      var nextReview = now + interval * 86400000;
      record.history = record.history || [];
      record.history.push({ date: now, score: score, ef: ef, interval: interval });
      return { ef: ef, interval: interval, reps: reps, nextReview: nextReview, lastReview: now, history: record.history };
    }

    function checkMastered(record) {
      if (!record || !record.history || record.history.length < 3) return false;
      var h = record.history;
      return h.slice(-3).every(function(e) { return e.score >= 4; }) && record.interval > 90;
    }

    function sm2Review(idx, score, isReviewSession) {
      if (isReviewSession) {
        // 复习会话：真正的复习事件，SM-2 正常累进
        sm2[idx] = calcSM2(sm2[idx], score);
      } else {
        // 普通刷题区：改标记只是重新定基线，不累进，从对应掌握度的种子开始
        sm2[idx] = calcSM2(getSm2Seed(score), score);
      }
      saveSm2();
    }

    // 根据掌握度等级返回恰当的初始 SM-2 状态（模拟已有几次复习）
    function getSm2Seed(score) {
      if (score === 5)      return { ef: 2.5, interval: 30, reps: 3, history: [] };
      else if (score === 4) return { ef: 2.5, interval: 7,  reps: 2, history: [] };
      else if (score === 3) return { ef: 2.5, interval: 1,  reps: 1, history: [] };
      else                  return { ef: 2.5, interval: 1,  reps: 0, history: [] };
    }

    function getSm2Label(rec) {
      if (!rec || !rec.nextReview) return '';
      var now = Date.now();
      if (checkMastered(rec) || rec.nextReview > now + 90 * 86400000) return 'mastered';
      if (rec.nextReview < new Date(new Date().setHours(0,0,0,0)).getTime()) return 'overdue';
      if (rec.nextReview <= now) return 'due';
      return 'queued';
    }

    // ---- SM-2 信息行 ----
    function renderSm2InfoBar() {
      var bar = document.getElementById('sm2InfoBar');
      if (!bar) return;
      var rec = sm2[current];
      if (!rec || !rec.nextReview) { bar.style.display = 'none'; return; }
      bar.style.display = '';
      var dueDate = new Date(rec.nextReview);
      var dd = dueDate.getFullYear() + '-' + String(dueDate.getMonth()+1).padStart(2,'0') + '-' + String(dueDate.getDate()).padStart(2,'0');
      var label = getSm2Label(rec);
      var tag = '';
      if (label === 'due') tag = '<span class="sm2-due-tag">今日到期</span>';
      else if (label === 'overdue') tag = '<span class="sm2-overdue-tag">已逾期</span>';
      else if (label === 'mastered') tag = '<span style="color:#F5A623;font-weight:600">⭐ 已掌握</span>';
      bar.innerHTML = '<span>EF: ' + rec.ef.toFixed(2) + '</span>' +
        '<span>间隔: ' + rec.interval + '天</span>' +
        '<span>复习次数: ' + rec.reps + '</span>' +
        (rec.lastReview ? '<span>上次: ' + new Date(rec.lastReview).toLocaleDateString('zh-CN') + '</span>' : '') +
        '<span>下次: ' + dd + '</span>' + tag;
    }

    // ---- SM-2 复习面板 ----
    function buildReviewQueue(wbFilter) {
      var queue = [];
      var chapters = getBookChapters ? getBookChapters(wbFilter) : [getChapter()];
      if (!chapters.length) chapters = [getChapter()];
      chapters.forEach(function(ch) {
        var key = sm2Key(ch);
        var obj;
        try { obj = JSON.parse(localStorage.getItem(key) || '{}'); } catch(e) { obj = {}; }
        var len = ch.ownTotal || ch.total;
        for (var i = 0; i < len; i++) {
          if (obj[i] && obj[i].nextReview) {
            queue.push({ chapterId: ch.id, idx: i, record: obj[i] });
          }
        }
      });
      return queue;
    }

    function sm2ChapterSummary(ch) {
      var due = 0, overdue = 0, queued = 0, mastered = 0;
      var key = sm2Key(ch);
      var obj;
      try { obj = JSON.parse(localStorage.getItem(key) || '{}'); } catch(e) { obj = {}; }
      var len = ch.ownTotal || ch.total;
      for (var i = 0; i < len; i++) {
        if (!obj[i] || !obj[i].nextReview) continue;
        var label = getSm2Label(obj[i]);
        if (label === 'due') due++;
        else if (label === 'overdue') overdue++;
        else if (label === 'mastered') mastered++;
        else queued++;
      }
      return { due: due, overdue: overdue, queued: queued, mastered: mastered };
    }

    function toggleSm2Panel() {
      if (!sm2PanelOpen) {
        var panel = document.getElementById('sm2Panel');
        var mainContent = document.getElementById('mainAreaContent');
        var dashboard = document.getElementById('dashboardPanel');
        var wrongBook = document.getElementById('wrongBookPanel');
        if (dashboard) dashboard.style.display = 'none';
        if (wrongBook) wrongBook.style.display = 'none';
        dashboardOpen = false;
        wrongBookOpen = false;
        document.getElementById('btnDashboard').innerHTML = '全局进度<span class="sol-key">V</span>';
        document.getElementById('btnWrongBook').innerHTML = '错题本<span class="sol-key">B</span>';
        panel.style.display = 'block';
        mainContent.style.display = 'none';
        setPanelTitle('间隔重复复习');
        sm2PanelOpen = true;
        renderSm2Panel();
      } else {
        closeSm2Panel();
      }
    }

    function closeSm2Panel() {
      sm2PanelOpen = false;
      document.getElementById('sm2Panel').style.display = 'none';
      document.getElementById('mainAreaContent').style.display = '';
      setPanelTitle('');
      renderTitle();
    }

    function renderSm2Panel() {
      var books = getSortedWbs();
      var allQueue = [];
      var allDue = 0, allOverdue = 0, allQueued = 0, allMastered = 0;

      // 按书收集团队所有SM-2数据
      var bookData = [];
      books.forEach(function(b) {
        var chs = getBookChapters(b.wb);
        var bDue = 0, bOverdue = 0, bQueued = 0, bMastered = 0;
        var chRows = [];
        chs.forEach(function(ch) {
          var s = sm2ChapterSummary(ch);
          if (s.due + s.overdue + s.queued + s.mastered === 0) return;
          bDue += s.due; bOverdue += s.overdue; bQueued += s.queued; bMastered += s.mastered;
          chRows.push({ ch: ch, summary: s });
        });
        allDue += bDue; allOverdue += bOverdue; allQueued += bQueued; allMastered += bMastered;
        if (chRows.length > 0) bookData.push({ label: b.label, wb: b.wb, rows: chRows, due: bDue, overdue: bOverdue });
      });

      // 更新统计卡片
      document.querySelector('#sm2CardDue .sm2-stat-num').textContent = allDue;
      document.querySelector('#sm2CardOverdue .sm2-stat-num').textContent = allOverdue;
      document.querySelector('#sm2CardQueue .sm2-stat-num').textContent = allQueued;
      document.querySelector('#sm2CardMastered .sm2-stat-num').textContent = allMastered;

      // 渲染章节列表
      var chHtml = '';
      bookData.forEach(function(bd) {
        chHtml += '<div class="sm2-book-header" style="font-weight:700;color:var(--primary);margin:8px 0 4px;font-size:14px">' + bd.label + '</div>';
        bd.rows.forEach(function(row) {
          var s = row.summary;
          var name = row.ch.short || row.ch.name;
          var statsStr = '';
          if (s.due) statsStr += '<span class="sm2-ch-due">到期 ' + s.due + '</span> ';
          if (s.overdue) statsStr += '<span class="sm2-ch-overdue">逾期 ' + s.overdue + '</span> ';
          if (s.queued) statsStr += '<span style="font-size:11px;color:#888">队列 ' + s.queued + '</span> ';
          chHtml += '<div class="sm2-ch-row">' +
            '<div class="sm2-ch-info"><span class="sm2-ch-name">' + name + '</span><span class="sm2-ch-stats">' + statsStr + '</span></div>' +
            '<button class="sm2-ch-btn" onclick="startReviewChapter(\'' + row.ch.id + '\')">复习</button>' +
            '</div>';
        });
      });
      if (!chHtml) chHtml = '<div style="text-align:center;color:var(--text-muted);padding:20px">暂无 SM-2 复习数据。打标后自动生成。</div>';
      document.getElementById('sm2Chapters').innerHTML = chHtml;
    }

    function startReviewChapter(chapterId) {
      var ch = chapterById(chapterId);
      if (!ch) return;
      var queue = [];
      var key = sm2Key(ch);
      var obj;
      try { obj = JSON.parse(localStorage.getItem(key) || '{}'); } catch(e) { obj = {}; }
      var len = ch.ownTotal || ch.total;
      for (var i = 0; i < len; i++) {
        if (obj[i] && obj[i].nextReview && obj[i].nextReview <= Date.now()) {
          queue.push({ chapterId: chapterId, idx: i, record: obj[i] });
        }
      }
      if (queue.length === 0) { alert('该章节没有到期题目'); return; }
      var mode = document.querySelector('input[name="sm2mode"]:checked');
      mode = mode ? mode.value : 'sequential';
      // 仅逾期模式：从已收集的队列中再过滤
      if (mode === 'overdue') {
        var todayStart = new Date(); todayStart.setHours(0,0,0,0);
        queue = queue.filter(function(item) { return item.record.nextReview < todayStart.getTime(); });
        if (queue.length === 0) { alert('该章节没有逾期题目'); return; }
      }
      startReview(queue, mode);
    }

    var _startAllReview = function() {
      var mode = document.querySelector('input[name="sm2mode"]:checked');
      mode = mode ? mode.value : 'sequential';
      var books = getSortedWbs();
      var queue = [];
      books.forEach(function(b) {
        var chs = getBookChapters(b.wb);
        chs.forEach(function(ch) {
          var key = sm2Key(ch);
          var obj;
          try { obj = JSON.parse(localStorage.getItem(key) || '{}'); } catch(e) { obj = {}; }
          var len = ch.ownTotal || ch.total;
          for (var i = 0; i < len; i++) {
            if (obj[i] && obj[i].nextReview && obj[i].nextReview <= Date.now()) {
              // 仅逾期模式：只取昨天及之前到期的
              if (mode === 'overdue') {
                var todayStart = new Date(); todayStart.setHours(0,0,0,0);
                if (obj[i].nextReview >= todayStart.getTime()) continue;
              }
              queue.push({ chapterId: ch.id, idx: i, record: obj[i] });
            }
          }
        });
      });
      if (queue.length === 0) { alert('没有到期题目'); return; }
      startReview(queue, mode);
    };

    function startReview(queue, mode) {
      if (mode === 'random') {
        for (var i = queue.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var tmp = queue[i]; queue[i] = queue[j]; queue[j] = tmp;
        }
      }
      reviewSession = { queue: queue, currentIdx: 0, mode: mode, originChapter: currentChapterId, originIdx: current };
      closeSm2Panel();
      // 跳转到第一题
      var first = queue[0];
      switchChapter(first.chapterId);
      switchTo(first.idx);
      // 在标题栏显示复习进度
      renderReviewProgress();
    }

    function reviewNext() {
      if (!reviewSession) return;
      reviewSession.currentIdx++;
      if (reviewSession.currentIdx >= reviewSession.queue.length) {
        alert('🎉 本轮复习完成！');
        exitReviewSession();
        return;
      }
      var item = reviewSession.queue[reviewSession.currentIdx];
      switchChapter(item.chapterId);
      switchTo(item.idx);
      renderReviewProgress();
    }

    function renderReviewProgress() {
      if (!reviewSession) return;
      var total = reviewSession.queue.length;
      var cur = reviewSession.currentIdx + 1;
      var title = document.getElementById('titleBar');
      if (title) {
        var modeLabel = { sequential: '顺序', random: '随机', overdue: '仅逾期' }[reviewSession.mode] || '';
        document.getElementById('panelTitle').textContent = '📋 复习中 ' + cur + '/' + total + ' ' + modeLabel;
        document.getElementById('panelTitle').style.display = '';
        document.getElementById('chapterDropdown').style.display = 'none';
      }
    }

    function exitReviewSession() {
      if (reviewSession) {
        var originCh = reviewSession.originChapter;
        var originIdx = reviewSession.originIdx;
        reviewSession = null;
        document.getElementById('sm2InfoBar').style.display = 'none';
        setPanelTitle('');
        if (originCh && originCh !== currentChapterId) {
          switchChapter(originCh);
          current = originIdx;
          switchTo(current);
        } else {
          renderTitle();
        }
      }
    }

    // 安装全局开始按钮
    document.addEventListener('DOMContentLoaded', function() {
      var btn = document.getElementById('btnSm2StartAll');
      if (btn) btn.addEventListener('click', function() { _startAllReview(); });
    });
    document.addEventListener('keydown', function (e) {
      // 标注模式下吃掉全部按键（Snipaste 式：避免切题/改状态等全局快捷键误触发）。
      // 需在 INPUT 判断之前：标注工具栏含 range 输入（粗细滑块），焦点在其上时 Alt 退出仍须生效。
      if (lbAnnotMode) { handleAnnotKeydown(e); return; }
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const key = e.key.toLowerCase();
      const isShift = e.shiftKey;

      // 面板（全局进度/错题本/快捷键帮助/科目选择）打开时，仅允许面板相关按键，避免误操作隐藏的章节
      if (subjectPickerOpen) {
        // 科目选择弹窗独占：只放行 G（重新打开/切换）与 Esc（关闭），H 等不再叠加其它弹窗
        if (key !== 'g' && key !== 'escape') return;
      } else if (dashboardOpen || wrongBookOpen || shortcutHelpOpen || sm2PanelOpen) {
        const panelKeys = ['h', 'escape'];
        if (dashboardOpen || wrongBookOpen) panelKeys.push('v', 'b');
        if (sm2PanelOpen) panelKeys.push('m');
        if (!panelKeys.includes(key)) return;
      }

      // Alt：进入标注（进入/退出标注的快捷键；仅灯箱打开时生效）
      if (e.key === 'Alt' && !e.ctrlKey && !e.metaKey) {
        const lbEl = document.getElementById('lightbox');
        if (lbEl && lbEl.classList.contains('show')) {
          e.preventDefault();
          openAnnotator();
        }
        return;
      }

      // Ctrl+Z：撤销最近一次掌握度标记
      if ((e.ctrlKey || e.metaKey) && key === 'z' && !isShift) {
        e.preventDefault();
        undoLastMark();
        return;
      }

      // Shift 筛选快捷键
      if (isShift) {
        switch (key) {
          case 'a': e.preventDefault(); applyFilter('all'); return;
          case 'z': e.preventDefault(); applyFilter('proficient'); return;
          case 'x': e.preventDefault(); applyFilter('vague'); return;
          case 'c': e.preventDefault(); applyFilter('wrong'); return;
          case 'n': e.preventDefault(); applyFilter('unmarked'); return;
          case ' ': e.preventDefault(); toggleDefaultSolution(); return;
        }
      }

      // 灯箱打开（未处于标注模式）时：只放行灯箱自己的快捷键（Esc 关闭、+/=/0 缩放），
      // 屏蔽切题/改状态等全局快捷键，避免在放大查看图片时背后静默切换题目。
      if (document.getElementById('lightbox').classList.contains('show')) {
        if (key === 'escape') { closeLightbox(); return; }
        // +、=、-、0 在下方 switch 中按灯箱缩放处理
        if (key !== '+' && key !== '=' && key !== '-' && key !== '0') return;
      }

      // 带修饰键（Ctrl / Alt / Cmd）的普通键不放行：避免 Ctrl+A、Ctrl+W、Alt+A 等误触发放大/切题/改状态
      // （Shift 组合已在上方处理；Alt 进入标注已在前面单独处理）
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      switch (key) {
        // 上一题 / 下一题（题组级 / 子题级，见 navPrev / navNext）
        case 'a': case 'arrowleft': navPrev(); break;
        case 'd': case 'arrowright': navNext(); break;
        // 数字键 1-5 直接评级（1=不会 5=熟练）
        case '1': e.preventDefault(); setStatus('wrong'); break;
        case '2': e.preventDefault(); setStatus('rusty'); break;
        case '3': e.preventDefault(); setStatus('vague'); break;
        case '4': e.preventDefault(); setStatus('familiar'); break;
        case '5': e.preventDefault(); setStatus('proficient'); break;
        // 小题选择模式
        case 'f': toggleSubMode(); break;
        // 上一行 / 下一行（视觉网格行导航）
        case 'w': case 'arrowup': navUp(); break;
        case 's': case 'arrowdown': navDown(); break;
        // 掌握度（组合键）
        case 'z': case 'x': case 'c': e.preventDefault(); handleStatusKey(key); break;
        // 解析
        case ' ': e.preventDefault(); toggleSolution(); break;
        // 章节切换
        case 'q': gotoPrevChapter(); break;
        case 'e': gotoNextChapter(); break;
        // 图片质量标记
        case 'r': toggleQBad(); break;
        case 't': toggleSBad(); break;
        // 笔记与帮助
        case 'n': e.preventDefault(); focusNotes(); break;
        case 'h': toggleShortcutHelp(); break;
        // 全局进度 / 错题本 / 间隔重复
        case 'v': toggleDashboard(); break;
        case 'b': toggleWrongBook(); break;
        case 'm': toggleSm2Panel(); break;
        // 切换科目
        case 'g': openSubjectPicker(); break;
        // 灯箱快捷键
        case 'escape':
          if (reviewSession) { exitReviewSession(); return; }
          if (sm2PanelOpen) { closeSm2Panel(); return; }
          if (document.getElementById('lightbox').classList.contains('show')) { closeLightbox(); return; }
          if (subjectPickerOpen) { closeSubjectPicker(); return; }
          if (shortcutHelpOpen) { toggleShortcutHelp(); return; }
          if (dashboardOpen) { toggleDashboard(); return; }
          if (wrongBookOpen) { toggleWrongBook(); return; }
          break;
        case '=':
        case '+': if (document.getElementById('lightbox').classList.contains('show')) { lbScale = Math.min(lbScale * 1.2, 5); lbApplyTransform(); return; } break;
        case '-': if (document.getElementById('lightbox').classList.contains('show')) { lbScale = Math.max(lbScale / 1.2, 0.5); lbApplyTransform(); return; } break;
        case '0': if (document.getElementById('lightbox').classList.contains('show')) { lbScale = 1; lbTranslateX = 0; lbTranslateY = 0; lbApplyTransform(); return; } break;
      }
    });

    // ===== 横向滚轮切题（常规状态，效果同 A/D 键） =====
    // 触控板/横向滚轮左右推 → navPrev()/navNext()。防护与键盘 handler 对齐：
    // - 标注模式（lbAnnotMode）不动（灯箱标注里横向滚轮是切工具）
    // - INPUT/TEXTAREA 焦点不动（避免输入框内横向滚动误切题）
    // - 面板/弹窗打开不动（与键盘 A/D 被拦截一致）
    // - 灯箱打开不动（灯箱滚轮是缩放）
    // - 仅当横向位移明显主导（|dx| 显著大于 |dy|）才切题，防止普通纵向滚动误触发
    document.addEventListener('wheel', function (e) {
      if (lbAnnotMode) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (subjectPickerOpen || dashboardOpen || wrongBookOpen || shortcutHelpOpen || sm2PanelOpen) return;
      if (document.getElementById('lightbox').classList.contains('show')) return;
      // 横向滚轮：|dx| 明显大于 |dy| 且达到阈值才判定为切题意图（避免纵向滚动/微小平移误触发）
      const dx = e.deltaX || 0, dy = e.deltaY || 0;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 2) {
        if (dx > 0) navNext();
        else navPrev();
      }
    }, { passive: false });

    // ===== 初始化 =====
    // 读取上次选择的科目（默认数学），加载其章节数组
    var savedSubject = localStorage.getItem('kaoyan_subject');
    curSubjectId = (savedSubject && SUBJECTS.some(function (s) { return s.id === savedSubject; })) ? savedSubject : 'shu1';
    curSubject = SUBJECTS.find(function (s) { return s.id === curSubjectId; });
    CHAPTERS = curSubject.chapters;
    // 一次性全量迁移已有掌握度 → SM-2 复习记录（每个科目只跑一次）
    migrateAllSm2();
    // 恢复上次停的章节/题目/小题模式（无记录时从该科目默认章节第 1 题开始）
    var resume = loadResume(curSubjectId);
    if (resume) {
      currentChapterId = resume.ch;
      current = resume.idx;
      subMode = resume.sub;
    } else {
      currentChapterId = curSubject.initChapterId;
      current = 0; subMode = false;
    }

    loadGlobalFilters(); loadSolutionPref(); // 恢复筛选状态与解析默认（解析默认按科目）
    loadStatuses(); loadQBad(); loadSBad(); loadNotes(); loadSm2();
    // 若恢复的筛选状态激活且当前题被筛掉，跳到第一条筛中题，避免落在不可见题上
    if (!isAllFilterActive()) {
      const filtered = getFilteredIndices();
      if (filtered.length > 0 && filtered.indexOf(current) === -1) current = filtered[0];
    }
    renderTitle();
    renderStats();
    renderNav(); switchTo(current); updateFilterCounts();
    updateFilterButtons(); // 恢复筛选按钮高亮（需在 renderNav 之后，按钮已重建）
    renderSolDefaultBtn(); updateSolutionUI();
    // 首次加载（无已选科目）弹出科目选择（等 DOM 就绪，科目弹窗 HTML 在脚本后）
    if (!savedSubject) document.addEventListener('DOMContentLoaded', function () { openSubjectPicker(); });
  