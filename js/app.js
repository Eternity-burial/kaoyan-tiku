'use strict';

    // ===== 全局常量 =====
    // 仪表盘/错题本列顺序（高数→线代→概率论）
    var SUBJECT_ORDER = ['高数', '线代', '概率论'];

    // localStorage 容量溢出保护：写入失败时静默捕获并在控制台提示
    // 大体积数据（标注 JSON、SM-2 全量）优先使用此函数，避免 QuotaExceededError 静默丢失数据
    function safeLSSet(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        if (e && (e.name === 'QuotaExceededError' || e.code === 22)) {
          console.warn('[题库] localStorage 已满，无法保存键:', key, '。请尝试清理旧标注数据。');
        }
      }
    }

    // ===== 章节数据（已移至 js/chapters.js）=====

    let curSubjectId = 'shu1';
    window.curSubjectId = curSubjectId;
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
    let bookMismatch = {}; // R+T键：该题与实书不符  { idx: true }
    let currentFilters = new Set(['all']);
    let subMode = false; // F键：小题选择模式（仅当前题组含子题时生效）
    let visualRows = []; // W/S 视觉行映射，每个元素是一个数组包含该行的 group.startIdx

    function isAllFilterActive() {
      return currentFilters.has('all') || currentFilters.size === 0;
    }

    function getChapter() { return CHAPTERS.find(c => c.id === currentChapterId); }
    function chapterById(id) { return CHAPTERS.find(c => c.id === id); }

    // ===== 合并章节（1000题/李范习题并入）辅助 =====
    // 当前索引所属分区：idx 落在合并章节的伴章段 → 30讲/36讲为 '1000题'，李范全书为 '习题'；否则按标签分类
    function partOfIdx(idx) {
      const ch = getChapter();
      if (ch && ch.q1000Total && idx >= ch.ownTotal) {
        if (ch.wb === '李范全书') return '习题';
        return '1000题';
      }
      if (ch && ch.wb === '老姚高数' && ch.sections) {
        const s = ch.sections.find(function (sec) { return idx >= sec.start && idx < sec.start + sec.count; });
        if (s) return s.type;
      }
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
    function statusSources(ch) {
      ch = ch || getChapter();
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
    function notifyStorageSync() {
      if (window.storageSync && typeof window.storageSync.scheduleSave === 'function') {
        window.storageSync.scheduleSave();
      }
    }

    function loadStatuses() {
      statuses = loadIndexedObj(function (ch) { return localStorage.getItem(chapterStatusKey(ch)); });
    }
    function saveStatuses() {
      saveIndexedObj(statuses,
        function (ch, val) { localStorage.setItem(chapterStatusKey(ch), val); },
        function (ch) { localStorage.removeItem(chapterStatusKey(ch)); });
      notifyStorageSync();
    }
    function loadQBad() {
      qBad = loadIndexedObj(function (ch) { return localStorage.getItem(ch.id + '_' + curSubject.storageSuffix + '_qbad'); });
    }
    function saveQBad() {
      saveIndexedObj(qBad,
        function (ch, val) { localStorage.setItem(ch.id + '_' + curSubject.storageSuffix + '_qbad', val); },
        function (ch) { localStorage.removeItem(ch.id + '_' + curSubject.storageSuffix + '_qbad'); });
      notifyStorageSync();
    }
    function loadSBad() {
      sBad = loadIndexedObj(function (ch) { return localStorage.getItem(ch.id + '_' + curSubject.storageSuffix + '_sbad'); });
    }
    function saveSBad() {
      saveIndexedObj(sBad,
        function (ch, val) { localStorage.setItem(ch.id + '_' + curSubject.storageSuffix + '_sbad', val); },
        function (ch) { localStorage.removeItem(ch.id + '_' + curSubject.storageSuffix + '_sbad'); });
      notifyStorageSync();
    }
    function loadBookMismatch() {
      bookMismatch = loadIndexedObj(function (ch) { return localStorage.getItem(ch.id + '_' + curSubject.storageSuffix + '_book_mismatch'); });
    }
    function saveBookMismatch() {
      saveIndexedObj(bookMismatch,
        function (ch, val) { localStorage.setItem(ch.id + '_' + curSubject.storageSuffix + '_book_mismatch', val); },
        function (ch) { localStorage.removeItem(ch.id + '_' + curSubject.storageSuffix + '_book_mismatch'); });
      notifyStorageSync();
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
      notifyStorageSync();
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
      notifyStorageSync();
    }

    // ===== 笔记数据（按书分离：复合键 '<源章节id>::<label>'） =====
    // 合并章节的 1000题 段笔记落到 1000题 伴章的存储对象（键 1-1），自身段落到本章对象（键 例1-1）。
    // 复合键含源章节 id，天然避免「30讲例1-1」与「1000题1-1」互相覆盖。
    let notesData = {};
    let notesDirty = false; // 笔记编辑态是否有未保存改动（用于切题/切章/切科目时自动保存）
    function notesSourceId(idx) {
      const ch = getChapter();
      if (ch.q1000Total && idx >= ch.ownTotal) return chapterById(ch.q1000Id).id;
      return ch.id;
    }
    function loadNotes() {
      autoSaveNotes(); // 重建前先保存未提交的编辑内容（覆盖 applyResumeBook 等直接调 loadNotes 的路径）
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
      notifyStorageSync();
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

    // ===== 考研倒计时 =====
    const MOTIVATION_QUOTES = [
      '“星光不问赶路人，时光不负有心人。”',
      '“日拱一卒无有穷，终有凌云登顶时。”',
      '“既然选择了远方，便只顾风雨兼程。”',
      '“每一个清晨与深夜的伏案，都是通往梦想的阶梯。”',
      '“沉潜笃定，静待花开；乾坤未定，你我皆是黑马！”'
    ];

    function getKaoyanTargetDate() {
      const now = new Date();
      const currentYear = now.getFullYear();
      let target = new Date(currentYear, 11, 19, 8, 30, 0); // 12月19日
      if (now > target) {
        target = new Date(currentYear + 1, 11, 19, 8, 30, 0);
      }
      return target;
    }

    function renderCountdown() {
      const target = getKaoyanTargetDate();
      const now = new Date();
      const diffMs = target - now;
      const days = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

      const sbDays = document.getElementById('sidebarCountdownDays');
      const sbDate = document.getElementById('sidebarCountdownDate');
      if (sbDays) sbDays.textContent = days + ' 天';
      if (sbDate) sbDate.textContent = target.getFullYear() + '/' + (target.getMonth() + 1) + '/' + target.getDate();

      const dbDays = document.getElementById('dbCountdownDays');
      const dbQuote = document.getElementById('dbCountdownQuote');
      if (dbDays) dbDays.textContent = days;
      if (dbQuote) {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const dayOfYear = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24));
        dbQuote.textContent = MOTIVATION_QUOTES[dayOfYear % MOTIVATION_QUOTES.length];
      }
    }

    // ===== 侧边栏 8 字数码管实时时钟 =====
    function updateClock() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');

      const dH1 = document.getElementById('segH1');
      const dH2 = document.getElementById('segH2');
      const dM1 = document.getElementById('segM1');
      const dM2 = document.getElementById('segM2');
      const dS1 = document.getElementById('segS1');
      const dS2 = document.getElementById('segS2');

      if (dH1) dH1.setAttribute('data-val', h[0]);
      if (dH2) dH2.setAttribute('data-val', h[1]);
      if (dM1) dM1.setAttribute('data-val', m[0]);
      if (dM2) dM2.setAttribute('data-val', m[1]);
      if (dS1) dS1.setAttribute('data-val', s[0]);
      if (dS2) dS2.setAttribute('data-val', s[1]);

      const dateEl = document.getElementById('clockDate');
      if (dateEl) {
        const y = now.getFullYear();
        const mo = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        const days = ['日', '一', '二', '三', '四', '五', '六'];
        const day = days[now.getDay()];
        dateEl.textContent = y + '/' + mo + '/' + d + ' 周' + day;
      }
    }
    setInterval(updateClock, 1000);
    updateClock();

    // ===== 昼夜主题（默认清华紫明亮 / 沉浸暗夜）与试卷暗化 =====
    var currentTheme = localStorage.getItem('kaoyan_theme') || 'light';
    var darkImageFilter = localStorage.getItem('kaoyan_dark_img_filter') === '1';

    const THEME_NAMES = {
      light: '明亮',
      dark: '暗夜'
    };

    function applyTheme(theme) {
      if (theme !== 'dark') theme = 'light';
      currentTheme = theme;
      document.documentElement.setAttribute('data-theme', theme);
      document.body.setAttribute('data-theme', theme);
      localStorage.setItem('kaoyan_theme', theme);

      var btnTheme = document.getElementById('btnToggleTheme');
      var engTxtTheme = document.getElementById('engTxtTheme');
      var themeLabel = THEME_NAMES[theme] || '明亮';

      if (btnTheme) btnTheme.innerHTML = '主题：' + themeLabel + '<span class="sol-key">Y</span>';
      if (engTxtTheme) engTxtTheme.textContent = '主题：' + themeLabel + ' (Y)';

      var btnDarkFilter = document.getElementById('btnDarkFilter');
      if (btnDarkFilter) {
        btnDarkFilter.style.display = (theme === 'dark') ? 'block' : 'none';
      }
      updateImageDarkFilter();
      notifyStorageSync();

      // 若当前正处于全局进度总览面板，立即重绘环形图以适配新主题配色
      if (typeof dashboardOpen !== 'undefined' && dashboardOpen) {
        var dbOverview = document.getElementById('dbOverview');
        if (dbOverview && dbOverview.style.display !== 'none') {
          renderDashboardOverview();
        }
      }
    }

    function toggleTheme() {
      applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    }
    window.toggleTheme = toggleTheme;

    function toggleImageDarkFilter() {
      darkImageFilter = !darkImageFilter;
      localStorage.setItem('kaoyan_dark_img_filter', darkImageFilter ? '1' : '0');
      updateImageDarkFilter();
      notifyStorageSync();
    }
    window.toggleImageDarkFilter = toggleImageDarkFilter;

    function updateImageDarkFilter() {
      var btnDarkFilter = document.getElementById('btnDarkFilter');
      if (btnDarkFilter) {
        btnDarkFilter.innerHTML = '试卷暗化：' + (darkImageFilter ? '开' : '关') + '<span class="sol-key">U</span>';
        btnDarkFilter.classList.toggle('active', darkImageFilter);
      }
      var enable = (currentTheme === 'dark' && darkImageFilter);
      var qImg = document.getElementById('questionImg');
      var lbImg = document.getElementById('lightboxImg');

      if (qImg) qImg.classList.toggle('dark-filter', enable);
      if (lbImg) lbImg.classList.toggle('dark-filter', enable);

      document.querySelectorAll('.solution-img, #solutionImgs img, .solution-imgs img, #solutionArea img, mjs-marker-area').forEach(function(el) {
        el.classList.toggle('dark-filter', enable);
      });
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
      autoSaveNotes(); // 切章前保存未提交的笔记（loadNotes 会重建 notesData）
      currentChapterId = chapterId;
      current = 0;
      showSolution = defaultShowSolution;
      // 小题模式（F）是全局开关，切章不重置，跨章保持
      loadStatuses(); loadQBad(); loadSBad(); loadBookMismatch(); loadNotes(); loadSm2();
      // 每次切章先清除错题本返回状态（错题本跳题会在 switchTo 之后重新置位）
      showWrongBookReturnBtn(false);
      // 全局筛选跨章保持：不重置、不按章恢复，仅加载本章数据后定位到第一条筛中题
      updateFilterButtons();
      updateFilterCounts();
      // 优先恢复章节级停靠记录（切回某章回到上次停的题），再走定位逻辑。
      // 仅恢复位置，不恢复小题模式（全局开关由 F 控制，跨章保持）
      const chResume = loadChapterResume(ch.id);
      if (chResume) {
        current = chResume.idx;
        // 若全局筛选激活且恢复位置被筛掉，跳到第一条筛中题
        if (!isAllFilterActive()) {
          const filtered = getFilteredIndices();
          if (filtered.length > 0 && filtered.indexOf(current) === -1) current = filtered[0];
        }
        renderTitle();
        switchTo(current);
        return;
      }
      // 定位逻辑：无章节记忆时落在第一道可见题（源序第一条，如 822 例题第一题）。
      // 不再按 partOrder 跳到"第一分区第一个"——避免 822 落到习题区导致按 A 跳回上一分区末尾。
      // partOrder 仅用于侧栏显示排序（renderNav），不影响切章落点。
      let target = 0;
      const filtered = getFilteredIndices();
      target = filtered.length > 0 ? filtered[0] : 0;
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
    // 1000题/李范习题已分别并入 30讲/36讲/李范全书：标题栏书籍下拉不再单独列伴章（进度统计仍按书分开）。
    function fillWbPanel(activeWb) {
      var entries = getSortedWbs().filter(function(e) { return e.wb !== '1000题' && e.wb !== '李范习题'; });
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
            // 复习中标题只读：不响应下拉点击（保留文本标签供查看书/模块/章节）
            if (reviewSession) return;
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
    // 合并章节：李范全书为 例题 → 习题；30讲/36讲为 例题 → 习题 → 1000题；其余章节用科目 partOrder
    function getPartOrder() {
      const ch = getChapter();
      if (ch && ch.wb === '老姚高数' && ch.sections) return ch.sections.map(function (s) { return s.type; });
      if (ch && ch.wb === '李范全书') return ['例题', '习题'];
      if (ch && ch.q1000Total) return ['例题', '习题', '1000题'];
      return curSubject ? curSubject.partOrder : ['例题', '习题'];
    }

    function classifyLabel(label) {
      const ch = getChapter();
      if (ch && ch.wb === '老姚高数' && ch.sections) {
        const idx = ch.labels.indexOf(label);
        if (idx >= 0) {
          const s = ch.sections.find(function(sec) { return idx >= sec.start && idx < sec.start + sec.count; });
          if (s && s.exampleCount !== undefined) {
            return (idx < s.start + s.exampleCount) ? '例题' : '补充练习';
          }
        }
      }
      return curSubject ? curSubject.classifyLabel(label) : (label.startsWith('例') ? '例题' : '习题');
    }

    // ===== 渲染章节统计面板 =====
    // 合并章节（1000题/李范习题并入）按书分两块统计：第1块=自身部分，第2块=伴章部分；
    // 进度分别累计，实现「进度按书分开」。非合并章节单块渲染（与现状一致）。
    function renderStats() {
      const ch = getChapter();
      const hasMerge = ch && ch.q1000Total;
      let segs;
      if (hasMerge) {
        const compCh = chapterById(ch.q1000Id);
        const compWb = compCh ? compCh.wb : '伴章';
        segs = [
          { label: getWbLabel(ch.wb), start: 0, len: ch.ownTotal },
          { label: getWbLabel(compWb), start: ch.ownTotal, len: ch.q1000Total }
        ];
      } else {
        segs = [{ label: '', start: 0, len: ch.total }];
      }
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
            '<span><span class="sc-dot" style="background:var(--lv5)"></span>熟练 <span class="sc-val">' + lv5 + '</span></span>' +
            '<span><span class="sc-dot" style="background:var(--lv4)"></span>较熟 <span class="sc-val">' + lv4 + '</span></span>' +
            '<span><span class="sc-dot" style="background:var(--lv3)"></span>模糊 <span class="sc-val">' + lv3 + '</span></span>' +
            '<span><span class="sc-dot" style="background:var(--lv2)"></span>困难 <span class="sc-val">' + lv2 + '</span></span>' +
            '<span><span class="sc-dot" style="background:var(--lv1)"></span>不会 <span class="sc-val">' + lv1 + '</span></span>' +
            '<span><span class="sc-dot" style="background:var(--text-light)"></span>未做 <span class="sc-val">' + un + '</span></span>' +
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

    // 计算当前激活科目下所有章节的全量总览数据
    function getSubjectOverallStats() {
      var totalQ = 0, doneQ = 0, profQ = 0, vagQ = 0, wrongQ = 0;
      if (typeof CHAPTERS !== 'undefined' && Array.isArray(CHAPTERS)) {
        for (var i = 0; i < CHAPTERS.length; i++) {
          var ch = CHAPTERS[i];
          if (!ch || ch.total === 0) continue;
          var stats = getChStats(ch);
          var len = ch.ownTotal || ch.total;
          totalQ += len;
          doneQ += stats.done;
          profQ += (stats.lv5 + stats.lv4);
          vagQ += (stats.lv3 + stats.lv2);
          wrongQ += stats.lv1;
        }
      }
      var pct = totalQ > 0 ? Math.round((doneQ / totalQ) * 100) : 0;
      var profPct = totalQ > 0 ? Math.round((profQ / totalQ) * 100) : 0;
      return {
        total: totalQ,
        done: doneQ,
        proficient: profQ,
        vague: vagQ,
        wrong: wrongQ,
        unmarked: totalQ - doneQ,
        progressPct: pct,
        proficientPct: profPct
      };
    }

    // 考研学习日判定算法：以每日清晨 04:00 为分界（00:00~03:59 的深夜复习归属前一学习日）
    function getStudyDayDate(ts) {
      var d = ts ? new Date(ts) : new Date();
      // 减去 4 小时偏移量：让凌晨 00:00~03:59 自动翻入上一自然日
      return new Date(d.getTime() - 4 * 3600 * 1000);
    }

    function getStudyDayKey(ts) {
      var sd = getStudyDayDate(ts);
      var y = sd.getFullYear();
      var m = String(sd.getMonth() + 1).padStart(2, '0');
      var d = String(sd.getDate()).padStart(2, '0');
      return y + '-' + m + '-' + d;
    }

    // 返回考研学习日的自纪元天数整数索引（用于到期精准判定与连续打卡统计）
    function getStudyDayIndex(ts) {
      var sd = getStudyDayDate(ts);
      return Math.floor(Date.UTC(sd.getFullYear(), sd.getMonth(), sd.getDate()) / (24 * 3600 * 1000));
    }

    // 获取最近 N 天的每日推进刷题数据（按每日清晨 04:00 归集考研学习日）
    function getDailyStudyData(daysCount) {
      if (!daysCount) daysCount = 14;
      var dailyMap = {};
      var baseDay = getStudyDayDate(); // 当前考研学习日基准

      for (var i = daysCount - 1; i >= 0; i--) {
        var d = new Date(baseDay.getTime() - i * 24 * 60 * 60 * 1000);
        var y = d.getFullYear();
        var m = String(d.getMonth() + 1).padStart(2, '0');
        var day = String(d.getDate()).padStart(2, '0');
        var key = y + '-' + m + '-' + day;
        var label = (d.getMonth() + 1) + '/' + d.getDate();
        dailyMap[key] = { key: key, label: label, count: 0, date: d };
      }

      // 从 SM-2 历史记录中回填历史做题与复习数据（按 4:00 AM 归入考研学习日）
      for (var k = 0; k < localStorage.length; k++) {
        var lk = localStorage.key(k);
        if (lk && lk.startsWith('sm2_')) {
          try {
            var data = JSON.parse(localStorage.getItem(lk));
            if (data && typeof data === 'object') {
              Object.values(data).forEach(function(record) {
                if (record && record.history && Array.isArray(record.history)) {
                  record.history.forEach(function(h) {
                    if (h.date) {
                      var dk = getStudyDayKey(h.date);
                      if (dailyMap[dk]) {
                        dailyMap[dk].count++;
                      }
                    }
                  });
                }
              });
            }
          } catch (e) {}
        }
      }

      // 叠加实时学习打卡日志
      try {
        var studyLog = JSON.parse(localStorage.getItem('kaoyan_study_log') || '{}');
        Object.keys(studyLog).forEach(function(dk) {
          if (dailyMap[dk]) {
            dailyMap[dk].count = Math.max(dailyMap[dk].count, studyLog[dk].count || 0);
          }
        });
      } catch (e) {}

      return Object.values(dailyMap);
    }

    // 记录做题打卡推进（按每日凌晨 04:00 归属考研学习日）
    function recordStudyActivity() {
      var dk = getStudyDayKey(Date.now());
      try {
        var studyLog = JSON.parse(localStorage.getItem('kaoyan_study_log') || '{}');
        studyLog[dk] = studyLog[dk] || { count: 0 };
        studyLog[dk].count++;
        localStorage.setItem('kaoyan_study_log', JSON.stringify(studyLog));
        if (window.storageSync && typeof window.storageSync.scheduleSave === 'function') {
          window.storageSync.scheduleSave();
        }
      } catch (e) {}
    }
    window.recordStudyActivity = recordStudyActivity;

    // 辅助圆角矩形路径
    function roundRect(ctx, x, y, width, height, radius) {
      if (width < 2 * radius) radius = width / 2;
      if (height < 2 * radius) radius = height / 2;
      if (height <= 0) return;
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + width, y, x + width, y + height, radius);
      ctx.arcTo(x + width, y + height, x, y + height, 0);
      ctx.arcTo(x, y + height, x, y, 0);
      ctx.arcTo(x, y, x + width, y, radius);
      ctx.closePath();
    }

    // 绘制总掌握度主环形进度表（清华紫纯正渐变）
    function drawMasterGauge(canvas, stats) {
      if (!canvas) return;
      var ctx = canvas.getContext('2d');
      var dpr = window.devicePixelRatio || 1;
      var size = 90;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = size + 'px';
      canvas.style.height = size + 'px';
      ctx.scale(dpr, dpr);

      var isDark = currentTheme === 'dark';
      var cx = size / 2, cy = size / 2;
      var r = 36;
      var lineWidth = 7;
      var p = stats.total > 0 ? (stats.done / stats.total) : 0;

      ctx.clearRect(0, 0, size, size);

      // 底轨
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(102, 8, 116, 0.08)';
      ctx.lineWidth = lineWidth;
      ctx.stroke();

      // 渐变进度条（清华紫双色调）
      if (p > 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + p * 2 * Math.PI);
        var grad = ctx.createLinearGradient(0, 0, size, size);
        if (isDark) {
          grad.addColorStop(0, '#cf6fe8');
          grad.addColorStop(1, '#8a2b9c');
        } else {
          grad.addColorStop(0, '#8a2b9c');
          grad.addColorStop(1, '#660874');
        }
        ctx.strokeStyle = grad;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    }

    // 绘制近 14 天推进趋势图（高 DPI 柱状与日均线，清华紫系）
    function drawTrendChart(canvas, dailyData) {
      if (!canvas) return;
      var ctx = canvas.getContext('2d');
      var dpr = window.devicePixelRatio || 1;
      var container = canvas.parentElement;
      var width = container ? container.clientWidth : 600;
      var height = 130;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(dpr, dpr);

      var isDark = currentTheme === 'dark';
      ctx.clearRect(0, 0, width, height);

      if (!dailyData || dailyData.length === 0) return;

      var paddingLeft = 32, paddingRight = 16, paddingTop = 22, paddingBottom = 24;
      var chartW = width - paddingLeft - paddingRight;
      var chartH = height - paddingTop - paddingBottom;

      var maxVal = 0;
      var sum = 0;
      dailyData.forEach(function(d) {
        if (d.count > maxVal) maxVal = d.count;
        sum += d.count;
      });
      if (maxVal < 10) maxVal = 10;
      else maxVal = Math.ceil(maxVal * 1.18);

      var avg = Math.round(sum / dailyData.length);

      // Y 轴刻度与横向辅助网格
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';
      ctx.lineWidth = 1;
      ctx.fillStyle = isDark ? '#7a7a8c' : '#999999';
      ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      for (var s = 0; s <= 2; s++) {
        var val = Math.round((maxVal / 2) * s);
        var y = paddingTop + chartH - (val / maxVal) * chartH;
        ctx.beginPath();
        ctx.moveTo(paddingLeft, y);
        ctx.lineTo(width - paddingRight, y);
        ctx.stroke();
        ctx.fillText(String(val), paddingLeft - 6, y);
      }

      // 绘制每日柱状图
      var count = dailyData.length;
      var barGap = 6;
      var totalBarWidth = (chartW - (count - 1) * barGap) / count;
      var barWidth = Math.min(26, Math.max(10, totalBarWidth));
      var actualGap = count > 1 ? (chartW - barWidth * count) / (count - 1) : 0;

      ctx.textAlign = 'center';

      dailyData.forEach(function(d, idx) {
        var x = paddingLeft + idx * (barWidth + actualGap);
        var barH = (d.count / maxVal) * chartH;
        var y = paddingTop + chartH - barH;

        // 柱子底轨背景槽
        ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)';
        roundRect(ctx, x, paddingTop, barWidth, chartH, 3);
        ctx.fill();

        // 推进活跃柱（纯正清华紫发光渐变）
        if (d.count > 0) {
          var grad = ctx.createLinearGradient(0, y, 0, paddingTop + chartH);
          if (isDark) {
            grad.addColorStop(0, '#cf6fe8');
            grad.addColorStop(1, 'rgba(102, 8, 116, 0.65)');
          } else {
            grad.addColorStop(0, '#8a2b9c');
            grad.addColorStop(1, '#660874');
          }
          ctx.fillStyle = grad;
          roundRect(ctx, x, y, barWidth, barH, 3);
          ctx.fill();

          // 柱顶数量文字
          ctx.fillStyle = isDark ? '#e2e2e8' : '#333333';
          ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillText(String(d.count), x + barWidth / 2, y - 5);
        }

        // 底部日期标注
        ctx.fillStyle = isDark ? '#8e8e9c' : '#777777';
        ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(d.label, x + barWidth / 2, height - 8);
      });

      // 日均虚线标注（清华紫柔和辉光线）
      if (avg > 0) {
        var avgY = paddingTop + chartH - (avg / maxVal) * chartH;
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = isDark ? 'rgba(207, 111, 232, 0.65)' : 'rgba(102, 8, 116, 0.5)';
        ctx.lineWidth = 1.2;
        ctx.moveTo(paddingLeft, avgY);
        ctx.lineTo(width - paddingRight, avgY);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // 绘制分书籍同心圆环形图（纯正清华紫系 + 抗摩尔纹）
    function drawDonut(canvas, chapters, label) {
      var ctx = canvas.getContext('2d');
      var dpr = window.devicePixelRatio || 1;
      var size = 260;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = size + 'px';
      canvas.style.height = size + 'px';
      ctx.scale(dpr, dpr);

      var isDark = currentTheme === 'dark';
      var cx = size / 2, cy = size / 2;
      var outerR = 108;
      var innerR = 28;
      var ringCount = chapters.length;
      if (ringCount === 0) {
        ctx.fillStyle = isDark ? '#888' : '#999';
        ctx.font = '14px "Microsoft YaHei",sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('(无数据)', cx, cy);
        return;
      }
      var ringWidth = (outerR - innerR) / ringCount;

      ctx.clearRect(0, 0, size, size);

      var purpleDark = isDark ? [207, 111, 232] : [102, 8, 116];
      var purpleLight = isDark ? [102, 8, 116] : [225, 190, 231];
      var unfilledColor = isDark ? 'rgba(255, 255, 255, 0.05)' : '#f2edf4';
      var centerBg = isDark ? '#22232a' : '#ffffff';
      var strokeColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)';
      var labelColor = isDark ? '#e2e2e8' : '#333333';
      var pctColor = isDark ? '#cf6fe8' : '#660874';

      // 1. 一次性绘制连续光滑的整圈底轨，彻底消除 30 个独立同心细圆相互叠加产生的摩尔纹（Moire Fringe）
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, 0, 2 * Math.PI);
      ctx.arc(cx, cy, innerR, 0, 2 * Math.PI, true);
      ctx.closePath();
      ctx.fillStyle = unfilledColor;
      ctx.fill();

      var totalDone = 0, totalQ = 0;

      // 2. 仅绘制已完成有进度的章节扇形弧（内到外：第0讲到最后一讲）
      for (var i = 0; i < ringCount; i++) {
        var ri = innerR + i * ringWidth;
        var ro = innerR + (i + 1) * ringWidth;
        var pr = getChProgress(chapters[i]);
        totalDone += pr.done;
        totalQ += pr.total;
        var p = pr.progress;
        if (p > 0) {
          var color = dbLerpColor(purpleLight, purpleDark, p);
          var cStr = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
          ctx.beginPath();
          ctx.arc(cx, cy, ro, -Math.PI / 2, -Math.PI / 2 + p * 2 * Math.PI);
          ctx.arc(cx, cy, ri, -Math.PI / 2 + p * 2 * Math.PI, -Math.PI / 2, true);
          ctx.closePath();
          ctx.fillStyle = cStr;
          ctx.fill();
        }
      }

      // 中心圆卡片
      ctx.beginPath();
      ctx.arc(cx, cy, innerR, 0, 2 * Math.PI);
      ctx.fillStyle = centerBg;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1;
      ctx.stroke();

      // 中心文字
      var pct = totalQ > 0 ? Math.round(totalDone / totalQ * 100) : 0;
      ctx.fillStyle = labelColor;
      ctx.font = 'bold 12px "Microsoft YaHei","PingFang SC",sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, cx, cy - 9);
      ctx.fillStyle = pctColor;
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
      renderCountdown();
      document.getElementById('dbOverview').style.display = '';
      document.getElementById('dbDetail').style.display = 'none';

      // 1. 计算并渲染全学科总掌握度与指标
      var stats = getSubjectOverallStats();
      var pctEl = document.getElementById('dbMasterPct');
      if (pctEl) pctEl.textContent = stats.progressPct + '%';

      var metricDone = document.getElementById('dbMetricDone');
      if (metricDone) metricDone.textContent = stats.done + ' / ' + stats.total;

      var metricProf = document.getElementById('dbMetricProf');
      if (metricProf) metricProf.textContent = stats.proficient + ' 题 (' + stats.proficientPct + '%)';

      var metricVag = document.getElementById('dbMetricVag');
      if (metricVag) metricVag.textContent = stats.vague + ' 题';

      var metricWrong = document.getElementById('dbMetricWrong');
      if (metricWrong) metricWrong.textContent = stats.wrong + ' 题';

      // 2. 每日推进统计趋势
      var dailyData = getDailyStudyData(14);
      var totalPeriod = 0;
      dailyData.forEach(function(d) { totalPeriod += d.count; });
      var avgPeriod = Math.round(totalPeriod / dailyData.length);

      var tagTotal = document.getElementById('dbTrendTotal');
      if (tagTotal) tagTotal.textContent = '近14天累计: ' + totalPeriod + ' 题';

      var tagAvg = document.getElementById('dbTrendAvg');
      if (tagAvg) tagAvg.textContent = '日均: ' + avgPeriod + ' 题/天';

      // 3. 渲染各个书籍卡片 DOM
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

      // 4. DOM 更新后绘制所有 Canvas
      setTimeout(function() {
        var masterCanvas = document.getElementById('dbMasterCanvas');
        if (masterCanvas) drawMasterGauge(masterCanvas, stats);

        var trendCanvas = document.getElementById('dbTrendCanvas');
        if (trendCanvas) drawTrendChart(trendCanvas, dailyData);

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
      // 列顺序使用模块级 SUBJECT_ORDER 常量（高数→线代→概率论，其余排后）
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
      // If clicking a companion chapter (1000题 or 李范习题), jump to base chapter and target companion offset
      const baseCh = CHAPTERS.find(function(c) { return c.q1000Id === chapterId; });
      if (baseCh) {
        switchChapter(baseCh.id);
        if (baseCh.ownTotal) {
          switchTo(baseCh.ownTotal);
        }
        return;
      }
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
      // 章节级记忆：切回某章时恢复上次停的题（键含 ch id，无 ch 字段）
      if (currentChapterId) map[curSubjectId + '::ch::' + currentChapterId] = { idx: current, sub: !!subMode };
      try { localStorage.setItem('kaoyan_resume', JSON.stringify(map)); } catch (e) {}
      notifyStorageSync();
    }
    // 读取某章的章节级停靠记录（无记录/记录失效返回 null）
    function loadChapterResume(chId) {
      var map = {};
      try { map = JSON.parse(localStorage.getItem('kaoyan_resume')) || {}; } catch (e) { map = {}; }
      var r = map[curSubjectId + '::ch::' + chId];
      if (!r) return null;
      var ch = CHAPTERS.find(function (c) { return c.id === chId; });
      if (!ch || ch.total === 0) return null;
      var idx = Math.min(Math.max(0, r.idx || 0), ch.total - 1);
      var subOk = false;
      if (r.sub) {
        ensureGroups(ch);
        var g = ch.groupForIdx[idx];
        subOk = !!(g && g.isParent && g.count > 1);
      }
      return { idx: idx, sub: subOk };
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
      // 小题模式（F）是全局开关，切书不重置、跨书保持
      loadStatuses(); loadQBad(); loadSBad(); loadBookMismatch(); loadNotes(); loadSm2();
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

      const mathLayout = document.getElementById('mathAppLayout') || document.querySelector('.app-layout');
      const engLayout = document.getElementById('englishAppLayout');

      if (subjectId === 'english' || subjectId === 'bishe' || (subj && subj.type === 'english')) {
        autoSaveNotes();
        if (reviewSession) exitReviewSession();
        saveResume();
        curSubjectId = subjectId;
        window.curSubjectId = subjectId;
        curSubject = subj;
        localStorage.setItem('kaoyan_subject', subjectId);
        if (mathLayout) mathLayout.style.display = 'none';
        if (engLayout) engLayout.style.display = 'flex';
        if (window.kyApp && window.kyApp.activate) window.kyApp.activate(subjectId);
        closeSubjectPicker();
        return;
      }

      if ((curSubjectId === 'english' || curSubjectId === 'bishe' || (curSubject && curSubject.type === 'english')) && window.kyApp && window.kyApp.saveResume) {
        window.kyApp.saveResume();
      }
      if (engLayout) engLayout.style.display = 'none';
      if (mathLayout) mathLayout.style.display = 'flex';

      autoSaveNotes(); // 切科目前保存未提交的笔记（loadNotes 会重建 notesData）
      // 切科目时若有进行中的复习：提交已评级结果并清除续接会话（跨科目不保留）
      if (reviewSession) exitReviewSession();
      saveResume(); // 先记录当前科目停的位置，再切换
      curSubjectId = subjectId;
      window.curSubjectId = subjectId;
      curSubject = subj;
      CHAPTERS = subj.chapters;
      var resume = loadResume(subjectId);
      if (resume) {
        currentChapterId = resume.ch;
        current = resume.idx;
      } else {
        currentChapterId = subj.initChapterId;
        current = 0;
      }
      // 小题模式（F）是全局开关，切科目不重置、跨科目保持
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
      loadStatuses(); loadQBad(); loadSBad(); loadBookMismatch(); loadNotes();
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
    window.switchSubject = switchSubject;
    window.openSubjectPicker = openSubjectPicker;
    window.closeSubjectPicker = closeSubjectPicker;
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
      // 收集有错/糊题的书籍（1000题/李范习题已并入 30讲/36讲/李范全书：不再单列伴章，
      // 其错题归入对应 base 书卡；第0讲 wb 已改 '基础30讲' 也并入）。
      var wbSet = new Set();
      for (const ch of CHAPTERS) {
        if (ch.total === 0) continue;
        if (ch.wb === '1000题' || ch.wb === '李范习题') continue; // 数据源章节：错题由其 base 伴章汇总
        var key = chapterStatusKey(ch);
        var statusObj;
        try { statusObj = JSON.parse(localStorage.getItem(key)) || {}; } catch (e) { statusObj = {}; }
        var ownLen = ch.ownTotal || ch.total;
        for (var i = 0; i < ownLen; i++) {
          if (statusObj[i] === 'wrong' || statusObj[i] === 'vague') { wbSet.add(ch.wb); break; }
        }
        // 伴章（1000题/李范习题）部分也归入 base 书
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
      // 合并章节（有 q1000Id）：自身部分(ownTotal) + 伴章部分(偏移 ownTotal) 一起进 base 书卡。
      const colMap = {};
      let totalWrong = 0;
      for (const ch of CHAPTERS) {
        if (ch.total === 0) continue;
        if (ch.wb !== wrongBookWb) continue;
        if (ch.wb === '1000题' || ch.wb === '李范习题') continue;
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
        // 伴章（1000题/李范习题）部分
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
        // 列顺序：高数 → 线代 → 概率论（其余排后，使用模块级 SUBJECT_ORDER 常量）
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
              '<div class="wrongbook-chapter-header">' +
              '<div class="wrongbook-chapter-title">' + name + '</div>' +
              '<div class="wrongbook-status-count">' +
              (g.familiar ? '<span class="ws w-familiar">较熟 ' + g.familiar.length + '</span>' : '') +
              (g.vague ? '<span class="ws w-vague">模糊 ' + g.vague.length + '</span>' : '') +
              (g.rusty ? '<span class="ws w-rusty">困难 ' + g.rusty.length + '</span>' : '') +
              (g.wrong ? '<span class="ws w-wrong">不会 ' + g.wrong.length + '</span>' : '') +
              '</div></div>' +
              '<div class="wrongbook-q-grid">';
            function qItem(idx, cls, statTitle) {
              const label = labels[idx] || (idx + 1);
              const isQ = ch.q1000Total && idx >= ch.ownTotal;
              const qc = isQ ? chapterById(ch.q1000Id) : null;
              let tag = '';
              const dispLabel = (ch.displayLabels && ch.displayLabels[idx]) ? ch.displayLabels[idx] : label;
              let titleText = '第' + label + '题（' + statTitle + '）';
              if (isQ && qc) {
                const secInfo = ch.sections ? ch.sections.find(function(s) { return idx >= s.start && idx < s.start + s.count; }) : null;
                let typeName = secInfo ? secInfo.type : '习题';
                if (typeName.indexOf('计算') !== -1) typeName = '计算';
                else if (typeName.indexOf('选择') !== -1) typeName = '选择';
                else if (typeName.indexOf('填空') !== -1) typeName = '填空';
                else if (typeName.indexOf('证明') !== -1) typeName = '证明';
                else if (typeName.indexOf('最值') !== -1) typeName = '最值';
                else if (typeName.indexOf('应用') !== -1) typeName = '应用';
                else if (typeName.length > 2) typeName = typeName.slice(0, 2);

                tag = qc.wb === '1000题' ? '<span class="ws q1000-tag">1000</span>' : '<span class="ws lf-tag">' + typeName + '</span>';
                titleText = (secInfo ? secInfo.type + ' ' : '') + '第' + dispLabel + '题 (' + label + ')（' + statTitle + '）';
              }
              return '<span class="wrongbook-q-item ' + cls + '" data-chapter="' + ch.id + '" data-index="' + idx + '" title="' + titleText + '"><span class="q-num">' + dispLabel + '</span>' + tag + '</span>';
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

    // ===== 题号分区手风琴折叠状态存储与题号网格渲染 =====
    const collapsedSections = new Set();

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

      // 更新题号区顶部当前进度摘要 (如 "共 68 题 · 当前 第 14 题")
      const qnavStat = document.getElementById('qnavStat');
      if (qnavStat) {
        qnavStat.textContent = '共 ' + labels.length + ' 题 · 当前 第 ' + (current + 1) + ' 题';
      }

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
        if (qBad[i] || sBad[i] || bookMismatch[i] || groupHasNote || groupHasAnnot) {
          const badgeSpan = document.createElement('span');
          badgeSpan.className = 'img-badges';
          if (qBad[i]) { const d = document.createElement('span'); d.className = 'qbad-dot'; d.textContent = 'Q'; badgeSpan.appendChild(d); }
          if (sBad[i]) { const d = document.createElement('span'); d.className = 'sbad-dot'; d.textContent = 'S'; badgeSpan.appendChild(d); }
          if (bookMismatch[i]) { const d = document.createElement('span'); d.className = 'mismatch-dot'; d.textContent = '书'; badgeSpan.appendChild(d); }
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

      // 当前题所在的分区必须保持自动展开，绝不折叠
      const curPartLabel = partOfIdx(current);
      const curSecKey = (curSubjectId || 'default') + '::' + currentChapterId + '::' + curPartLabel;
      collapsedSections.delete(curSecKey);

      // 收集当前章节中有题目的非当前分区 keys（用于一键全部折叠/展开）
      const validOtherSecKeys = [];

      parts.forEach(function(part) {
        // 收集该分区的 subGroups
        var secGroups = [];
        ch.subGroups.forEach(function(g) {
          if (g.startIdx >= part.startIdx && g.startIdx < part.endIdx) {
            secGroups.push(g);
          }
        });

        // 该分区无题则跳过（如36讲无习题、某些章节无例题）
        if (secGroups.length === 0) return;

        const secKey = (curSubjectId || 'default') + '::' + currentChapterId + '::' + part.label;
        if (part.label !== curPartLabel) {
          validOtherSecKeys.push(secKey);
        }

        // 计算该分区已完成题数与总题数
        let totalSecQuestions = 0;
        let completedSecQuestions = 0;
        secGroups.forEach(function(g) {
          for (var k = 0; k < g.count; k++) {
            totalSecQuestions++;
            if (statuses[g.startIdx + k]) completedSecQuestions++;
          }
        });

        const isCollapsed = collapsedSections.has(secKey);

        // 分区手风琴标题
        var secTitle = document.createElement('div');
        secTitle.className = 'section-header' + (isCollapsed ? ' collapsed' : '');
        secTitle.title = isCollapsed ? '点击展开本分区题号' : '点击收起本分区题号';
        secTitle.innerHTML = '<div class="sec-header-left">' +
          '<span class="sec-arrow">' + (isCollapsed ? '▸' : '▾') + '</span>' +
          '<span class="sec-title-text">' + part.label + '</span>' +
          '</div>' +
          '<span class="sec-badge">' + completedSecQuestions + '/' + totalSecQuestions + '</span>';

        secTitle.onclick = function(e) {
          e.stopPropagation();
          if (collapsedSections.has(secKey)) {
            collapsedSections.delete(secKey);
          } else {
            collapsedSections.add(secKey);
          }
          renderNav();
        };
        nav.appendChild(secTitle);

        // 若被折叠，不渲染下方题号按钮
        if (isCollapsed) return;

        var curSubType = null;
        secGroups.forEach(function(g) {
          // 插入题型二级子标题（老姚高数在小节内分 例题 / 习题；其余书籍按 sections 题型）
          if (ch.wb === '老姚高数' && ch.sections) {
            var s = ch.sections.find(function(sec) { return g.startIdx >= sec.start && g.startIdx < sec.start + sec.count; });
            var rawLabel = ch.labels[g.startIdx] || '';
            var subType;
            if (s && s.exampleCount !== undefined) {
              subType = (g.startIdx < s.start + s.exampleCount) ? '例题' : '补充练习';
            } else {
              subType = /例/.test(rawLabel) ? '例题' : '补充练习';
            }
            if (subType !== curSubType) {
              curSubType = subType;
              var subTitle = document.createElement('div');
              subTitle.className = 'subsection-header';
              subTitle.textContent = subType;
              nav.appendChild(subTitle);
            }
          } else if (ch.sections) {
            var matchingSec = ch.sections.find(function(s) { return s.start === g.startIdx; });
            if (matchingSec) {
              var subTitle = document.createElement('div');
              subTitle.className = 'subsection-header';
              subTitle.textContent = matchingSec.type;
              nav.appendChild(subTitle);
            }
          }

          var dispLabel = (ch.displayLabels && ch.displayLabels[g.startIdx]) ? ch.displayLabels[g.startIdx] : g.parentLabel;
          var secInfo = ch.sections ? ch.sections.find(function(s) { return g.startIdx >= s.start && g.startIdx < s.start + s.count; }) : null;
          var isK = ch.isKnowledge && ch.isKnowledge[g.startIdx];
          var desc = ch.itemDescs && ch.itemDescs[g.startIdx];

          var btn = document.createElement('button');
          btn.setAttribute('data-group-start', g.startIdx);
          if (desc) {
            btn.title = (secInfo ? secInfo.type + ' · ' : '') + desc;
          } else if (secInfo) {
            btn.title = secInfo.type + (isK ? ' · ' : ' 第') + dispLabel + (isK ? '' : '题') + ' (' + g.parentLabel + ')';
          } else {
            btn.title = g.parentLabel;
          }
          var inCurGroup = (curGroup === g);
          var cls = '';
          if (isK) cls += ' is-knowledge';

          if (inCurGroup && (!g.isParent || !subMode)) { cls += ' active'; }

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
            textSpan.textContent = dispLabel;
            btn.appendChild(textSpan);
          } else {
            cls += ' ' + getStatusClass(g.startIdx);
            btn.className = cls.trim();
            btn.textContent = dispLabel;
          }

          if (!groupHasVisible) { btn.style.visibility = 'hidden'; }
          appendBadges(btn, g.startIdx);

          btn.onclick = function() {
            // 点击侧栏定位到该题组第一个可见题；小题模式（F 全局开关）不重置，跨章/跨题保持
            if (visIdx.length > 0) { switchTo(visIdx[0]); }
          };
          nav.appendChild(btn);
        });
      });

      // 更新「全部折叠/展开」按钮状态
      const btnToggleAll = document.getElementById('btnToggleAllSections');
      if (btnToggleAll) {
        if (validOtherSecKeys.length === 0) {
          btnToggleAll.style.display = 'none';
        } else {
          btnToggleAll.style.display = '';
          const allOthersCollapsed = validOtherSecKeys.every(function(k) { return collapsedSections.has(k); });
          if (allOthersCollapsed) {
            btnToggleAll.textContent = '全部展开';
            btnToggleAll.title = '展开所有题号分区';
          } else {
            btnToggleAll.textContent = '全部折叠';
            btnToggleAll.title = '折叠其他题号分区，仅保留当前分区';
          }
          btnToggleAll.onclick = function(e) {
            e.stopPropagation();
            if (allOthersCollapsed) {
              validOtherSecKeys.forEach(function(k) { collapsedSections.delete(k); });
            } else {
              validOtherSecKeys.forEach(function(k) { collapsedSections.add(k); });
            }
            renderNav();
          };
        }
      }

      // 构建视觉行映射（W/S 导航用）
      buildVisualRows(nav);

      renderSubSelectBar(curGroup);

      // 自动平滑滚动聚焦到当前题号按钮（保证当前题始终在可视窗口内部，免去手动查找）
      const activeBtn = nav.querySelector('button.active, button.has-subs.active');
      if (activeBtn) {
        requestAnimationFrame(function() {
          activeBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        });
      }
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
      if (groups.length === 0) return;
      const gi = groups.indexOf(g);
      if (gi > 0) {
        const pv = groupVisibleIndices(groups[gi - 1]);
        if (pv.length > 0) { switchTo(pv[pv.length - 1]); return; }
      } else if (gi === -1) {
        // 当前组不在可见列表中（被过滤器排除），寻找前一个可见组
        const prevG = groups.slice().reverse().find(function (cand) { return cand.startIdx < g.startIdx; });
        if (prevG) {
          const pv = groupVisibleIndices(prevG);
          if (pv.length > 0) { switchTo(pv[pv.length - 1]); return; }
        }
      }
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
      if (groups.length === 0) return;
      const gi = groups.indexOf(g);
      if (gi !== -1) {
        if (gi < groups.length - 1) {
          const nv = groupVisibleIndices(groups[gi + 1]);
          if (nv.length > 0) switchTo(nv[0]);
        }
      } else {
        // 关键修复：当前题目刚被打标并被过滤器移出（例如处于「未做」或「模糊」筛选态），
        // gi 为 -1，此时寻找第一个起始序号大于当前题的可见组进行跳转
        const nextG = groups.find(function (cand) { return cand.startIdx > g.startIdx; });
        if (nextG) {
          const nv = groupVisibleIndices(nextG);
          if (nv.length > 0) { switchTo(nv[0]); return; }
        } else if (groups.length > 0) {
          // 若后续没有了，跳转到剩余筛选列表的第一个
          const firstNv = groupVisibleIndices(groups[0]);
          if (firstNv.length > 0) switchTo(firstNv[0]);
        }
      }
    }

    // F：切换小题选择模式（全局开关，跨章保持；当前题无子题时仅切换开关，导航仍正常逐题/逐组）
    function toggleSubMode() {
      const g = currentGroup();
      if (!g) return;
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
          img.classList.toggle('dark-filter', (currentTheme === 'dark' && darkImageFilter));
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
        // 关键：MarkerView 内部会在 Shadow DOM 里克隆一张 _editingTarget 底图。
        // 普通只读浏览时，底层原图（#questionImg / .solution-img）已有标准 dark-filter 样式。
        // 若 MarkerView 内部克隆底图可见，会导致双重底图重叠以及多层滤镜乘法导致图片过暗。
        // 注入 Shadow DOM 样式彻底隐藏内部克隆底图，上层仅保留透明的 SVG 标注，底图 100% 复用真实原图。
        if (viewer.shadowRoot) {
          const st = document.createElement('style');
          st.textContent = 'img { display: none !important; }';
          viewer.shadowRoot.appendChild(st);
        }
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
      autoSaveNotes(); // 切题前保存未提交的笔记（当前仍是旧题，saveNote 用 current 定位正确）
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
      const secInfo = ch.sections ? ch.sections.find(function(s) { return current >= s.start && current < s.start + s.count; }) : null;
      const isK = ch.isKnowledge && ch.isKnowledge[current];
      const desc = ch.itemDescs && ch.itemDescs[current];
      if (desc) {
        qLabelText = (secInfo ? secInfo.type + ' · ' : '') + desc;
      } else if (secInfo && ch.displayLabels) {
        qLabelText = secInfo.type + (isK ? ' · ' : ' 第') + ch.displayLabels[current] + (isK ? '' : '题');
      } else if (subMode) {
        qLabelText = labels[current];
      } else if (g && g.isParent) {
        qLabelText = g.parentLabel;
      } else {
        qLabelText = labels[current];
      }
      document.getElementById('qLabel').textContent = qLabelText;
      updateStatusBtns(); updateQBadBtn(); updateSBadBtn(); updateBookMismatchBtn(); updateImgBadWarnings();
      renderNotes();
      recordRecentQuestion(getCurrentQid());
      renderRelatedQuestions();
      renderStats();
      renderNav();
      renderSm2InfoBar();
      updateHeaderProgressTag();
      saveResume(); // 记住当前停的章节/题目/小题模式，刷新或切科目前保留
      document.getElementById('questionImg').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // ===== 题目图/解析图不达标 & 与实书不符 =====
    function updateQBadBtn() { const btn = document.getElementById('btnQBad'); if (btn) btn.classList.toggle('marked', !!qBad[current]); }
    function updateSBadBtn() { const btn = document.getElementById('btnSBad'); if (btn) btn.classList.toggle('marked', !!sBad[current]); }
    function updateBookMismatchBtn() { const btn = document.getElementById('btnBookMismatch'); if (btn) btn.classList.toggle('marked', !!bookMismatch[current]); }

    function updateImgBadWarnings() {
      const qWarn = document.getElementById('qBadWarning');
      if (qWarn) qWarn.classList.toggle('show', !!qBad[current]);
      const sWarn = document.getElementById('sBadWarning');
      if (sWarn) sWarn.classList.toggle('show', !!sBad[current]);
      const mWarn = document.getElementById('bookMismatchWarning');
      if (mWarn) mWarn.classList.toggle('show', !!bookMismatch[current]);
      const qImg = document.getElementById('questionImg');
      if (qImg) {
        qImg.classList.toggle('qbad-border', !!qBad[current]);
        qImg.classList.toggle('mismatch-border', !!bookMismatch[current]);
      }
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
          // 优化数学公式排版：自动对极限、求和、最值等算子补全 \limits，确保上下标显示在正下方
          var processed = m.replace(/\\(lim|sum|prod|max|min|inf|sup)(?!\\limits|\\nolimits)\s*_/g, function(match, op) {
            return '\\' + op + '\\limits_';
          });
          mathSpans.push(processed);
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

    // HTML 转义安全工具函数
    function escapeHtml(str) {
      if (str === undefined || str === null) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    // ===== 同类题与跨书双向关联管理系统 =====
    var relatedTopics = {};
    var recentQuestionsHistory = [];
    var jumpReturnStack = [];
    var relatedModalOpen = false;

    // 1. QID 编解码与元数据工具
    function getQid(subjId, chId, idx) {
      return (subjId || curSubjectId) + '::' + (chId || currentChapterId) + '::' + idx;
    }

    function getCurrentQid() {
      return getQid(curSubjectId, currentChapterId, current);
    }

    function parseQid(qid) {
      if (!qid || typeof qid !== 'string') return null;
      var parts = qid.split('::');
      if (parts.length < 3) return null;
      return {
        subjectId: parts[0],
        chapterId: parts[1],
        idx: parseInt(parts[2], 10)
      };
    }

    function getQuestionMeta(qid) {
      var parsed = parseQid(qid);
      if (!parsed || isNaN(parsed.idx)) return null;

      var subj = SUBJECTS.find(function(s) { return s.id === parsed.subjectId; });
      if (!subj) return null;

      var ch = subj.chapters ? subj.chapters.find(function(c) { return c.id === parsed.chapterId; }) : null;
      if (!ch) return null;

      var label = (ch.labels && ch.labels[parsed.idx]) ? ch.labels[parsed.idx] : '#' + (parsed.idx + 1);

      // 读取该题当前掌握度状态
      var status = null;
      try {
        var statusKey = ch.id + '_' + subj.storageSuffix + '_status';
        var statusObj = JSON.parse(localStorage.getItem(statusKey) || '{}');
        status = statusObj[parsed.idx] || null;
      } catch (e) {}

      var book = ch.wb || subj.name || '题库';
      var chShort = ch.short || ch.name;
      var displayTitle = book + ' · ' + chShort + ' ' + label;

      return {
        qid: qid,
        subjectId: parsed.subjectId,
        subjectName: subj.name,
        chapterId: parsed.chapterId,
        chapterName: ch.name,
        chapterShort: chShort,
        bookName: book,
        idx: parsed.idx,
        label: label,
        status: status,
        displayTitle: displayTitle
      };
    }

    // 2. 同类题数据存储与主题管理
    function loadRelatedTopics() {
      try {
        relatedTopics = JSON.parse(localStorage.getItem('kaoyan_related_topics') || '{}');
      } catch (e) {
        relatedTopics = {};
      }
    }

    function saveRelatedTopics() {
      localStorage.setItem('kaoyan_related_topics', JSON.stringify(relatedTopics));
      notifyStorageSync();
    }

    function getTopicsForQid(qid) {
      var list = [];
      for (var tid in relatedTopics) {
        if (!Object.prototype.hasOwnProperty.call(relatedTopics, tid)) continue;
        var t = relatedTopics[tid];
        if (t && t.members && t.members.some(function(m) { return m.qid === qid; })) {
          list.push(t);
        }
      }
      return list;
    }

    function getRelatedQuestionsForQid(qid) {
      var relatedMap = {};
      var myTopics = getTopicsForQid(qid);

      myTopics.forEach(function(t) {
        if (!t.members) return;
        t.members.forEach(function(m) {
          if (m.qid !== qid) {
            if (!relatedMap[m.qid]) {
              relatedMap[m.qid] = {
                qid: m.qid,
                topics: [t.name],
                notes: m.note ? [m.note] : []
              };
            } else {
              var item = relatedMap[m.qid];
              if (item.topics.indexOf(t.name) === -1) item.topics.push(t.name);
              if (m.note && item.notes.indexOf(m.note) === -1) item.notes.push(m.note);
            }
          }
        });
      });

      var list = [];
      for (var k in relatedMap) {
        if (Object.prototype.hasOwnProperty.call(relatedMap, k)) {
          var meta = getQuestionMeta(k);
          if (meta) {
            meta.topics = relatedMap[k].topics;
            meta.note = relatedMap[k].notes.join('；');
            list.push(meta);
          }
        }
      }

      return {
        topics: myTopics,
        relatedQuestions: list
      };
    }

    function createRelatedTopic(name, currentQid, note) {
      if (!name || !name.trim()) return null;
      var tid = 'topic_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      var newTopic = {
        id: tid,
        name: name.trim(),
        createTime: Date.now(),
        members: currentQid ? [{ qid: currentQid, note: note || '' }] : []
      };
      relatedTopics[tid] = newTopic;
      saveRelatedTopics();
      return newTopic;
    }

    function addQuestionToTopic(topicId, qid, note) {
      var t = relatedTopics[topicId];
      if (!t) return false;
      if (!t.members) t.members = [];
      var existing = t.members.find(function(m) { return m.qid === qid; });
      if (!existing) {
        t.members.push({ qid: qid, note: note || '' });
      } else if (note) {
        existing.note = note;
      }
      saveRelatedTopics();
      return true;
    }

    function removeQuestionFromTopic(topicId, qid) {
      var t = relatedTopics[topicId];
      if (!t || !t.members) return false;
      t.members = t.members.filter(function(m) { return m.qid !== qid; });
      if (t.members.length === 0) {
        delete relatedTopics[topicId];
      }
      saveRelatedTopics();
      return true;
    }

    function recordRecentQuestion(qid) {
      if (!qid) return;
      recentQuestionsHistory = recentQuestionsHistory.filter(function(q) { return q !== qid; });
      recentQuestionsHistory.unshift(qid);
      if (recentQuestionsHistory.length > 10) recentQuestionsHistory.pop();
    }

    // 3. 渲染主界面同类题卡片栏（直接渲染题目图片）
    function renderRelatedQuestions() {
      var curQid = getCurrentQid();
      var data = getRelatedQuestionsForQid(curQid);
      var wrap = document.getElementById('relatedTopicsWrap');
      var list = document.getElementById('relatedCardsList');
      if (!wrap || !list) return;

      // 渲染主题胶囊
      if (data.topics.length > 0) {
        wrap.innerHTML = data.topics.map(function(t) {
          return '<span class="related-topic-pill" title="考点：' + escapeHtml(t.name) + '">' + escapeHtml(t.name) + '</span>';
        }).join('');
      } else {
        wrap.innerHTML = '';
      }

      // 渲染同类题卡片（直接展示题目图片）
      if (data.relatedQuestions.length > 0) {
        list.innerHTML = data.relatedQuestions.map(function(q) {
          var dotClass = q.status ? ' ' + q.status : '';
          var noteHtml = q.note ? '<span class="rc-note" title="' + escapeHtml(q.note) + '">' + escapeHtml(q.note) + '</span>' : '<span class="rc-note"></span>';
          var imgSrc = getImgPathForQid(q.qid);
          return '<div class="related-card" data-qid="' + escapeHtml(q.qid) + '" title="点击跳转至：' + escapeHtml(q.displayTitle) + '">' +
            '<div class="rc-head">' +
              '<div class="rc-head-left">' +
                '<span class="rc-book">' + escapeHtml(q.bookName) + '</span>' +
                '<span class="rc-label">' + escapeHtml(q.chapterShort + ' ' + q.label) + '</span>' +
              '</div>' +
              '<span class="rc-dot' + dotClass + '"></span>' +
            '</div>' +
            '<div class="rc-img-box">' +
              (imgSrc ? '<img src="' + escapeHtml(imgSrc) + '" loading="lazy" alt="' + escapeHtml(q.label) + '">' : '<span style="font-size:12px;color:var(--text-muted)">题目图片</span>') +
            '</div>' +
            '<div class="rc-foot">' +
              noteHtml +
              '<span class="rc-jump-btn">点击跨书跳转 →</span>' +
            '</div>' +
          '</div>';
        }).join('');

        list.querySelectorAll('.related-card').forEach(function(card) {
          card.onclick = function() {
            var targetQid = this.dataset.qid;
            if (targetQid) jumpToQid(targetQid, true);
          };
        });
      } else {
        list.innerHTML = '<span class="related-empty-hint">暂无关联同类题，点击右侧「+ 关联同类题」可跨书归类</span>';
      }
    }

    // 4. 跨书/跨章无缝跳转与返回栈管理
    function jumpToQid(targetQid, pushStack) {
      var target = parseQid(targetQid);
      if (!target) return;
      autoSaveNotes();

      if (pushStack) {
        var curQid = getCurrentQid();
        var curMeta = getQuestionMeta(curQid);
        jumpReturnStack.push({ qid: curQid, meta: curMeta });
      }

      if (target.subjectId !== curSubjectId) {
        switchSubject(target.subjectId);
      }
      if (target.chapterId !== currentChapterId) {
        switchChapter(target.chapterId);
      }
      switchTo(target.idx);
      updateJumpReturnBar();
    }

    function returnToPreviousQuestion() {
      if (jumpReturnStack.length === 0) return;
      var prev = jumpReturnStack.pop();
      if (prev && prev.qid) {
        jumpToQid(prev.qid, false);
      }
      updateJumpReturnBar();
    }

    function closeJumpReturnBar() {
      jumpReturnStack = [];
      updateJumpReturnBar();
    }

    function updateJumpReturnBar() {
      var bar = document.getElementById('jumpReturnBar');
      var txt = document.getElementById('jumpBackText');
      if (!bar) return;
      if (jumpReturnStack.length > 0) {
        var top = jumpReturnStack[jumpReturnStack.length - 1];
        var title = top.meta ? top.meta.displayTitle : top.qid;
        if (txt) txt.textContent = '返回原题：' + title;
        bar.style.display = 'flex';
      } else {
        bar.style.display = 'none';
      }
    }

    // 5. 题目题干图片路径提取辅助方法
    function getImgPathForQid(qid) {
      var parsed = parseQid(qid);
      if (!parsed || isNaN(parsed.idx)) return '';
      var subj = SUBJECTS.find(function(s) { return s.id === parsed.subjectId; });
      if (!subj || !subj.getImgPath) return '';
      var ch = subj.chapters ? subj.chapters.find(function(c) { return c.id === parsed.chapterId; }) : null;
      if (!ch || !ch.labels) return '';
      var label = ch.labels[parsed.idx];
      if (!label) return '';
      return subj.getImgPath(ch, label) + '_question.png';
    }

    // 6. 主题彻底删除
    function deleteRelatedTopic(topicId) {
      var t = relatedTopics[topicId];
      if (!t) return false;
      if (!confirm('确定要彻底删除考点主题“' + t.name + '”吗？\n该操作将清除此主题下所有题目的关联。')) {
        return false;
      }
      delete relatedTopics[topicId];
      saveRelatedTopics();
      renderRelatedModalTopics();
      renderRelatedQuestions();
      if (typeof renderPickerQuestions === 'function') renderPickerQuestions();
      return true;
    }

    // 7. 同类题弹窗交互与跨书做题工作台
    var pickerAllBooks = [];
    var pickerActiveBookIdx = 0;
    var pickerActiveChapterId = '';
    var pickerActiveQIdx = 0;
    var pickerSolShown = false;

    function openRelatedModal() {
      relatedModalOpen = true;
      var modal = document.getElementById('relatedModal');
      if (!modal) return;
      var curQid = getCurrentQid();
      var curMeta = getQuestionMeta(curQid);
      var curText = document.getElementById('relatedModalCurQText');
      if (curText && curMeta) {
        curText.textContent = '当前题目：' + curMeta.displayTitle;
      }
      renderRelatedModalTopics();
      initVisualQuestionPicker();
      renderRelatedModalRecent();
      modal.style.display = 'flex';
    }

    function closeRelatedModal() {
      relatedModalOpen = false;
      var modal = document.getElementById('relatedModal');
      if (modal) modal.style.display = 'none';
      renderRelatedQuestions();
    }

    function renderRelatedModalTopics() {
      var curQid = getCurrentQid();
      var myTopics = getTopicsForQid(curQid);
      var container = document.getElementById('rmCurrentTopics');
      if (!container) return;

      // 1. 渲染当前题已加入的主题（单 ✕ 图标移出，移除冗余汉字「删」）
      if (myTopics.length > 0) {
        container.innerHTML = myTopics.map(function(t) {
          return '<span class="rm-topic-tag">' +
            '<span>' + escapeHtml(t.name) + '</span>' +
            '<button type="button" class="rm-topic-del" data-tid="' + escapeHtml(t.id) + '" title="将当前题目移出该考点">✕</button>' +
          '</span>';
        }).join('');

        container.querySelectorAll('button[data-tid]').forEach(function(btn) {
          btn.onclick = function() {
            var tid = this.dataset.tid;
            if (tid) {
              removeQuestionFromTopic(tid, curQid);
              renderRelatedModalTopics();
              renderRelatedQuestions();
              renderModalWorkbench();
            }
          };
        });
      } else {
        container.innerHTML = '<span class="related-empty-hint">当前题目尚未归入任何考点主题</span>';
      }

      // 2. 渲染全库已有考点主题（支持点击直接加入与彻底删除）
      var availContainer = document.getElementById('rmAvailableTopics');
      var availWrap = document.getElementById('rmAvailableTopicsWrap');
      if (availContainer) {
        var myTopicIds = myTopics.map(function(t) { return t.id; });
        var otherTopics = [];
        for (var tid in relatedTopics) {
          if (!Object.prototype.hasOwnProperty.call(relatedTopics, tid)) continue;
          if (myTopicIds.indexOf(tid) === -1) {
            otherTopics.push(relatedTopics[tid]);
          }
        }

        if (otherTopics.length > 0) {
          if (availWrap) availWrap.style.display = 'block';
          availContainer.innerHTML = otherTopics.map(function(t) {
            var count = (t.members ? t.members.length : 0);
            return '<div class="rm-avail-tag-wrap">' +
              '<button type="button" class="rm-avail-btn" data-add-tid="' + escapeHtml(t.id) + '" title="点击将当前题目加入此考点">' +
                '<span>+ ' + escapeHtml(t.name) + '</span>' +
                '<span class="rm-avail-count">(' + count + '题)</span>' +
              '</button>' +
              '<button type="button" class="rm-topic-trash-btn" data-trash-tid="' + escapeHtml(t.id) + '" title="彻底删除此考点主题">✕</button>' +
            '</div>';
          }).join('');

          availContainer.querySelectorAll('button[data-add-tid]').forEach(function(btn) {
            btn.onclick = function() {
              var targetTid = this.dataset.addTid;
              if (targetTid) {
                addQuestionToTopic(targetTid, curQid);
                renderRelatedModalTopics();
                renderRelatedQuestions();
                renderModalWorkbench();
              }
            };
          });

          availContainer.querySelectorAll('button[data-trash-tid]').forEach(function(btn) {
            btn.onclick = function() {
              var targetTid = this.dataset.trashTid;
              if (targetTid) deleteRelatedTopic(targetTid);
            };
          });
        } else {
          if (availWrap) {
            var totalCount = Object.keys(relatedTopics).length;
            if (totalCount === 0) {
              availWrap.style.display = 'none';
            } else {
              availWrap.style.display = 'block';
              availContainer.innerHTML = '<span class="related-empty-hint">已加入所有已有考点主题</span>';
            }
          }
        }
      }
    }

    // 8. 跨书题目浏览器（做题式双栏工作台）
    function initVisualQuestionPicker() {
      var booksBar = document.getElementById('rmBooksBar');
      if (!booksBar) return;

      // 提取全库书籍：当前学科的书籍排在前面，异科沉底排在最后！
      pickerAllBooks = [];
      var curSubjBooks = [];
      var otherSubjBooks = [];

      SUBJECTS.forEach(function(s) {
        if (!s.chapters || s.chapters.length === 0) return;
        var wbMap = {};
        s.chapters.forEach(function(c) {
          var wb = c.wb || s.name;
          if (!wbMap[wb]) {
            wbMap[wb] = true;
            var item = { subjectId: s.id, subjectName: s.name, bookName: wb };
            if (s.id === curSubjectId) {
              curSubjBooks.push(item);
            } else {
              otherSubjBooks.push(item);
            }
          }
        });
      });

      pickerAllBooks = curSubjBooks.concat(otherSubjBooks);

      // 默认选中当前正在做的科目与书籍
      var curBookMatchIdx = pickerAllBooks.findIndex(function(b) {
        if (b.subjectId !== curSubjectId) return false;
        var curCh = CHAPTERS.find(function(c) { return c.id === currentChapterId; });
        var curWb = curCh ? (curCh.wb || curSubject.name) : '';
        return b.bookName === curWb;
      });
      pickerActiveBookIdx = (curBookMatchIdx >= 0) ? curBookMatchIdx : 0;

      // 默认章节与题号（与主界面当前题一致）
      var chosenBook = pickerAllBooks[pickerActiveBookIdx];
      var s = chosenBook ? SUBJECTS.find(function(sub) { return sub.id === chosenBook.subjectId; }) : null;
      var chs = s ? s.chapters.filter(function(c) { return (c.wb || s.name) === chosenBook.bookName; }) : [];
      if (chs.length > 0) {
        var matchCh = chs.find(function(c) { return c.id === currentChapterId; });
        pickerActiveChapterId = matchCh ? matchCh.id : chs[0].id;
        pickerActiveQIdx = (matchCh && s.id === curSubjectId) ? current : 0;
      }
      pickerSolShown = false;

      renderPickerBooks();
    }

    function renderPickerBooks() {
      var booksBar = document.getElementById('rmBooksBar');
      if (!booksBar || pickerAllBooks.length === 0) return;

      booksBar.innerHTML = pickerAllBooks.map(function(b, idx) {
        var cls = (idx === pickerActiveBookIdx) ? 'rm-book-chip active' : 'rm-book-chip';
        return '<button type="button" class="' + cls + '" data-book-idx="' + idx + '">' +
          escapeHtml(b.subjectName + ' · ' + b.bookName) +
        '</button>';
      }).join('');

      booksBar.querySelectorAll('button[data-book-idx]').forEach(function(btn) {
        btn.onclick = function() {
          pickerActiveBookIdx = parseInt(this.dataset.bookIdx, 10);
          var chosenBook = pickerAllBooks[pickerActiveBookIdx];
          var s = chosenBook ? SUBJECTS.find(function(sub) { return sub.id === chosenBook.subjectId; }) : null;
          var chs = s ? s.chapters.filter(function(c) { return (c.wb || s.name) === chosenBook.bookName; }) : [];
          if (chs.length > 0) {
            pickerActiveChapterId = chs[0].id;
            pickerActiveQIdx = 0;
          }
          renderPickerBooks();
          renderPickerChapters();
          renderModalWorkbench();
        };
      });

      renderPickerChapters();
      renderModalWorkbench();
    }

    function renderPickerChapters() {
      var chSelect = document.getElementById('rmChapterSelect');
      if (!chSelect) return;
      var chosenBook = pickerAllBooks[pickerActiveBookIdx];
      if (!chosenBook) return;

      var s = SUBJECTS.find(function(sub) { return sub.id === chosenBook.subjectId; });
      var chs = s ? s.chapters.filter(function(c) { return (c.wb || s.name) === chosenBook.bookName; }) : [];
      if (chs.length === 0) {
        chSelect.innerHTML = '<option value="">暂无章节</option>';
        return;
      }

      if (!chs.some(function(c) { return c.id === pickerActiveChapterId; })) {
        pickerActiveChapterId = chs[0].id;
      }

      chSelect.innerHTML = chs.map(function(c) {
        var isSel = (c.id === pickerActiveChapterId) ? ' selected' : '';
        return '<option value="' + escapeHtml(c.id) + '"' + isSel + '>' +
          escapeHtml(c.short || c.name) + ' (' + c.total + '题)' +
        '</option>';
      }).join('');

      chSelect.onchange = function() {
        pickerActiveChapterId = this.value;
        pickerActiveQIdx = 0;
        renderModalWorkbench();
      };
    }

    function renderModalWorkbench() {
      var qTitleEl = document.getElementById('rmViewerQTitle');
      var qImgEl = document.getElementById('rmViewerQImg');
      var solAreaEl = document.getElementById('rmViewerSolArea');
      var solImgsEl = document.getElementById('rmViewerSolImgs');
      var btnToggleSol = document.getElementById('rmBtnToggleSol');
      var btnLinkCurrent = document.getElementById('rmBtnLinkCurrent');
      var navGrid = document.getElementById('rmNavGrid');
      var navCount = document.getElementById('rmNavCount');
      if (!qTitleEl || !qImgEl || !navGrid) return;

      var chosenBook = pickerAllBooks[pickerActiveBookIdx];
      if (!chosenBook) return;
      var s = SUBJECTS.find(function(sub) { return sub.id === chosenBook.subjectId; });
      var ch = s ? s.chapters.find(function(c) { return c.id === pickerActiveChapterId; }) : null;
      if (!ch || !ch.labels || ch.labels.length === 0) {
        qTitleEl.textContent = '该章节暂无题目';
        qImgEl.style.display = 'none';
        navGrid.innerHTML = '';
        if (navCount) navCount.textContent = '0 题';
        return;
      }

      pickerActiveQIdx = Math.max(0, Math.min(pickerActiveQIdx, ch.total - 1));
      var label = ch.labels[pickerActiveQIdx];
      var targetQid = getQid(s.id, ch.id, pickerActiveQIdx);
      var curQid = getCurrentQid();
      var isCurrent = (targetQid === curQid);
      var myTopics = getTopicsForQid(curQid);
      var isLinked = myTopics.some(function(t) {
        return t.members && t.members.some(function(m) { return m.qid === targetQid; });
      });

      // 1. 左侧题目大图与解析展示
      var qImgSrc = s.getImgPath(ch, label) + '_question.png';
      var solImgSrc = s.getImgPath(ch, label) + '_solution.png';

      qTitleEl.textContent = chosenBook.bookName + ' · ' + (ch.short || ch.name) + ' · ' + label + (isCurrent ? ' (当前做题)' : '');
      qImgEl.style.display = 'block';
      qImgEl.src = qImgSrc;
      qImgEl.alt = label;

      if (solImgsEl) {
        solImgsEl.innerHTML = '<img src="' + escapeHtml(solImgSrc) + '" alt="解析" onerror="this.style.display=\'none\';this.parentNode.innerHTML=\'<span style=\\\'font-size:12px;color:var(--text-muted)\\\'>暂无解析图片</span>\';">';
      }
      if (solAreaEl) {
        solAreaEl.style.display = pickerSolShown ? 'flex' : 'none';
      }
      if (btnToggleSol) {
        btnToggleSol.innerHTML = pickerSolShown ? '隐藏解析 <span class="key">Space</span>' : '显示解析 <span class="key">Space</span>';
      }

      if (btnLinkCurrent) {
        if (isCurrent) {
          btnLinkCurrent.textContent = '当前正在做';
          btnLinkCurrent.disabled = true;
          btnLinkCurrent.className = 'gel-btn btn-sm';
        } else if (isLinked) {
          btnLinkCurrent.textContent = '已关联（点击移出）';
          btnLinkCurrent.disabled = false;
          btnLinkCurrent.className = 'gel-btn btn-sm btn-danger';
        } else {
          btnLinkCurrent.textContent = '+ 关联此题到考点';
          btnLinkCurrent.disabled = false;
          btnLinkCurrent.className = 'gel-btn btn-sm btn-primary';
        }
      }

      // 2. 右侧题号导航区
      if (navCount) {
        navCount.textContent = (pickerActiveQIdx + 1) + ' / ' + ch.total + ' 题';
      }

      var statusKey = 'kaoyan_' + s.id + '_' + ch.id + '_statuses';
      var statuses = {};
      try { statuses = JSON.parse(localStorage.getItem(statusKey) || '{}'); } catch(e) {}

      var navBtnsHtml = [];
      for (var i = 0; i < ch.total; i++) {
        var btnLabel = (ch.displayLabels && ch.displayLabels[i]) ? ch.displayLabels[i] : ch.labels[i];
        var qid_i = getQid(s.id, ch.id, i);
        var inTopics = myTopics.some(function(t) {
          return t.members && t.members.some(function(m) { return m.qid === qid_i; });
        });
        var isActive = (i === pickerActiveQIdx);
        var st = statuses[i] || '';
        var cls = 'rm-nav-btn' + (isActive ? ' active' : '') + (st ? ' ' + st : '') + (inTopics ? ' linked' : '');
        navBtnsHtml.push(
          '<button type="button" class="' + cls + '" data-qidx="' + i + '" title="' + escapeHtml(btnLabel) + (inTopics ? ' [已关联]' : '') + '">' +
            escapeHtml(btnLabel) +
          '</button>'
        );
      }
      navGrid.innerHTML = navBtnsHtml.join('');

      navGrid.querySelectorAll('button[data-qidx]').forEach(function(btn) {
        btn.onclick = function() {
          pickerActiveQIdx = parseInt(this.dataset.qidx, 10);
          renderModalWorkbench();
        };
      });

      var curActiveBtn = navGrid.querySelector('button.active');
      if (curActiveBtn) {
        curActiveBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }

    function modalPickerPrevQ() {
      if (pickerActiveQIdx > 0) {
        pickerActiveQIdx--;
        renderModalWorkbench();
      }
    }

    function modalPickerNextQ() {
      var chosenBook = pickerAllBooks[pickerActiveBookIdx];
      if (!chosenBook) return;
      var s = SUBJECTS.find(function(sub) { return sub.id === chosenBook.subjectId; });
      var ch = s ? s.chapters.find(function(c) { return c.id === pickerActiveChapterId; }) : null;
      if (ch && pickerActiveQIdx < ch.total - 1) {
        pickerActiveQIdx++;
        renderModalWorkbench();
      }
    }

    function modalPickerUpQ() {
      if (pickerActiveQIdx - 4 >= 0) {
        pickerActiveQIdx -= 4;
        renderModalWorkbench();
      }
    }

    function modalPickerDownQ() {
      var chosenBook = pickerAllBooks[pickerActiveBookIdx];
      if (!chosenBook) return;
      var s = SUBJECTS.find(function(sub) { return sub.id === chosenBook.subjectId; });
      var ch = s ? s.chapters.find(function(c) { return c.id === pickerActiveChapterId; }) : null;
      if (ch && pickerActiveQIdx + 4 < ch.total) {
        pickerActiveQIdx += 4;
        renderModalWorkbench();
      }
    }

    function toggleModalPickerSol() {
      pickerSolShown = !pickerSolShown;
      renderModalWorkbench();
    }

    function toggleModalPickerLinkCurrent() {
      var chosenBook = pickerAllBooks[pickerActiveBookIdx];
      if (!chosenBook) return;
      var s = SUBJECTS.find(function(sub) { return sub.id === chosenBook.subjectId; });
      var ch = s ? s.chapters.find(function(c) { return c.id === pickerActiveChapterId; }) : null;
      if (!ch || !ch.labels) return;

      var targetQid = getQid(s.id, ch.id, pickerActiveQIdx);
      var curQid = getCurrentQid();
      if (targetQid === curQid) return;

      var myTopics = getTopicsForQid(curQid);
      var isLinked = myTopics.some(function(t) {
        return t.members && t.members.some(function(m) { return m.qid === targetQid; });
      });

      if (isLinked) {
        myTopics.forEach(function(t) {
          removeQuestionFromTopic(t.id, targetQid);
        });
      } else {
        ensureAndLinkTargetQuestion(targetQid);
      }

      renderRelatedModalTopics();
      renderRelatedModalRecent();
      renderModalWorkbench();
      renderRelatedQuestions();
    }

    function renderRelatedModalRecent() {
      var list = document.getElementById('rmRecentList');
      if (!list) return;
      var curQid = getCurrentQid();
      var candidates = recentQuestionsHistory.filter(function(q) { return q !== curQid; });
      var myTopics = getTopicsForQid(curQid);

      if (candidates.length === 0) {
        list.innerHTML = '<span class="related-empty-hint">暂无最近浏览的其他题目</span>';
        return;
      }

      list.innerHTML = candidates.map(function(qid) {
        var meta = getQuestionMeta(qid);
        if (!meta) return '';
        var imgSrc = getImgPathForQid(qid);
        var alreadyIn = myTopics.some(function(t) {
          return t.members && t.members.some(function(m) { return m.qid === qid; });
        });
        return '<div class="rm-item-row">' +
          '<div class="rm-item-info">' +
            (imgSrc ? '<img src="' + escapeHtml(imgSrc) + '" class="rm-item-thumb" loading="lazy">' : '') +
            '<span class="rm-item-book">' + escapeHtml(meta.bookName) + '</span>' +
            '<span class="rm-item-title">' + escapeHtml(meta.chapterShort + ' ' + meta.label) + '</span>' +
          '</div>' +
          (alreadyIn ?
            '<span style="font-size:12px; color:#10b981; font-weight:600">已关联</span>' :
            '<button type="button" class="gel-btn btn-sm" data-link-qid="' + escapeHtml(qid) + '">+ 关联到当前题</button>'
          ) +
        '</div>';
      }).join('');

      list.querySelectorAll('button[data-link-qid]').forEach(function(btn) {
        btn.onclick = function() {
          var targetQid = this.dataset.linkQid;
          ensureAndLinkTargetQuestion(targetQid);
          renderRelatedModalRecent();
          renderModalWorkbench();
        };
      });
    }

    function ensureAndLinkTargetQuestion(targetQid, note) {
      var curQid = getCurrentQid();
      var myTopics = getTopicsForQid(curQid);
      var topic = null;

      if (myTopics.length > 0) {
        topic = myTopics[0];
      } else {
        var curMeta = getQuestionMeta(curQid);
        var autoName = (curMeta ? curMeta.displayTitle : '同类题考点') + ' 关联组';
        topic = createRelatedTopic(autoName, curQid);
      }

      addQuestionToTopic(topic.id, curQid);
      addQuestionToTopic(topic.id, targetQid, note || '');
      renderRelatedModalTopics();
      renderRelatedModalRecent();
      renderRelatedQuestions();
      renderModalWorkbench();
    }

    function initRelatedModal() {
      var btnOpen = document.getElementById('btnOpenRelatedModal');
      if (btnOpen) btnOpen.onclick = openRelatedModal;
      var btnClose = document.getElementById('btnCloseRelatedModal');
      if (btnClose) btnClose.onclick = closeRelatedModal;
      var btnDone = document.getElementById('btnDoneRelatedModal');
      if (btnDone) btnDone.onclick = closeRelatedModal;

      var btnToggleSol = document.getElementById('rmBtnToggleSol');
      if (btnToggleSol) btnToggleSol.onclick = toggleModalPickerSol;
      var btnLinkCurrent = document.getElementById('rmBtnLinkCurrent');
      if (btnLinkCurrent) btnLinkCurrent.onclick = toggleModalPickerLinkCurrent;

      var btnJumpBack = document.getElementById('btnJumpBack');
      if (btnJumpBack) btnJumpBack.onclick = returnToPreviousQuestion;
      var btnJumpClose = document.getElementById('btnJumpClose');
      if (btnJumpClose) btnJumpClose.onclick = closeJumpReturnBar;

      // 新建主题按钮
      var btnCreate = document.getElementById('btnCreateTopic');
      var inputName = document.getElementById('inputNewTopicName');
      if (btnCreate && inputName) {
        var doCreate = function() {
          var name = inputName.value.trim();
          if (!name) { alert('请输入考点主题名称'); return; }
          createRelatedTopic(name, getCurrentQid());
          inputName.value = '';
          renderRelatedModalTopics();
          renderRelatedQuestions();
          renderModalWorkbench();
        };
        btnCreate.onclick = doCreate;
        inputName.onkeydown = function(e) {
          if (e.key === 'Enter') { e.preventDefault(); doCreate(); }
        };
      }

      // Tab 切换
      var tabs = document.querySelectorAll('.rm-tab-btn');
      tabs.forEach(function(btn) {
        btn.onclick = function() {
          tabs.forEach(function(b) { b.classList.remove('active'); });
          this.classList.add('active');
          var tabKey = this.dataset.tab;
          var pPicker = document.getElementById('rmTabPicker');
          var pRecent = document.getElementById('rmTabRecent');
          var pSearch = document.getElementById('rmTabSearch');
          if (pPicker) pPicker.style.display = (tabKey === 'picker') ? 'flex' : 'none';
          if (pRecent) pRecent.style.display = (tabKey === 'recent') ? 'flex' : 'none';
          if (pSearch) pSearch.style.display = (tabKey === 'search') ? 'flex' : 'none';
        };
      });

      // 搜索题号
      var searchInput = document.getElementById('inputRelatedSearch');
      var searchResults = document.getElementById('rmSearchResults');
      if (searchInput && searchResults) {
        searchInput.oninput = function() {
          var q = this.value.trim().toLowerCase();
          if (!q) { searchResults.innerHTML = ''; return; }
          var curQid = getCurrentQid();
          var matches = [];

          SUBJECTS.forEach(function(s) {
            if (!s.chapters) return;
            s.chapters.forEach(function(c) {
              if (!c.labels) return;
              c.labels.forEach(function(l, idx) {
                var qid = getQid(s.id, c.id, idx);
                if (qid === curQid) return;
                var fullStr = ((c.wb || s.name) + ' ' + (c.short || c.name) + ' ' + l).toLowerCase();
                if (fullStr.indexOf(q) !== -1 || l.toLowerCase().indexOf(q) !== -1) {
                  matches.push(qid);
                }
              });
            });
          });

          if (matches.length === 0) {
            searchResults.innerHTML = '<span class="related-empty-hint">未找到匹配的题目</span>';
            return;
          }

          var myTopics = getTopicsForQid(curQid);
          searchResults.innerHTML = matches.slice(0, 15).map(function(qid) {
            var meta = getQuestionMeta(qid);
            if (!meta) return '';
            var imgSrc = getImgPathForQid(qid);
            var alreadyIn = myTopics.some(function(t) {
              return t.members && t.members.some(function(m) { return m.qid === qid; });
            });
            return '<div class="rm-item-row">' +
              '<div class="rm-item-info">' +
                (imgSrc ? '<img src="' + escapeHtml(imgSrc) + '" class="rm-item-thumb" loading="lazy">' : '') +
                '<span class="rm-item-book">' + escapeHtml(meta.bookName) + '</span>' +
                '<span class="rm-item-title">' + escapeHtml(meta.chapterShort + ' ' + meta.label) + '</span>' +
              '</div>' +
              (alreadyIn ?
                '<span style="font-size:12px; color:#10b981; font-weight:600">已关联</span>' :
                '<button type="button" class="gel-btn btn-sm" data-search-qid="' + escapeHtml(qid) + '">+ 关联此题</button>'
              ) +
            '</div>';
          }).join('');

          searchResults.querySelectorAll('button[data-search-qid]').forEach(function(btn) {
            btn.onclick = function() {
              var targetQid = this.dataset.searchQid;
              ensureAndLinkTargetQuestion(targetQid);
              renderModalWorkbench();
            };
          });
        };
      }
    }

    // 编辑时右侧实时预览（防抖）
    // ===== 考研数学常用 LaTeX 符号盘与自动补全词典 =====
    const MATH_PALETTE_DATA = {
      calc: [
        { label: "一阶导 f'(x)", code: "f'(x)", render: "f'(x)" },
        { label: "二阶导 f''(x)", code: "f''(x)", render: "f''(x)" },
        { label: "n阶导 fⁿ(x)", code: "f^{(n)}(x)", render: "fⁿ(x)" },
        { label: "导数值 f'(x₀)", code: "f'(x_0)", render: "f'(x₀)" },
        { label: 'lim(∞)', code: '\\lim_{x \\to \\infty} |', render: 'lim_{x→∞}' },
        { label: 'lim(0)', code: '\\lim_{x \\to 0} |', render: 'lim_{x→0}' },
        { label: '分式', code: '\\frac{|}{}', render: 'a/b' },
        { label: '导数 dy/dx', code: '\\frac{\\mathrm{d}y}{\\mathrm{d}x}', render: 'dy/dx' },
        { label: '偏导 ∂f/∂x', code: '\\frac{\\partial f}{\\partial x}', render: '∂f/∂x' },
        { label: '不定积分', code: '\\int | \\,dx', render: '∫f(x)dx' },
        { label: '定积分', code: '\\int_{|}^{} \\,dx', render: '∫_a^b' },
        { label: '二重积分', code: '\\iint_{D} | \\,dxdy', render: '∬_D' },
        { label: '三重积分', code: '\\iiint_{\\Omega} | \\,dxdydz', render: '∭_Ω' },
        { label: '自然常数', code: '\\mathrm{e}^{|}', render: 'e^x' },
        { label: '无穷大', code: '\\infty', render: '∞' },
        { label: '微分 dy', code: '\\mathrm{d}y', render: 'dy' },
        { label: '微分 dx', code: '\\mathrm{d}x', render: 'dx' }
      ],
      algebra: [
        { label: '求和', code: '\\sum_{i=1}^{n} |', render: '∑' },
        { label: '连乘', code: '\\prod_{i=1}^{n} |', render: '∏' },
        { label: '根号', code: '\\sqrt{|}', render: '√x' },
        { label: 'n次根号', code: '\\sqrt[n]{|}', render: 'ⁿ√x' },
        { label: '正负号', code: '\\pm ', render: '±' },
        { label: '不等于', code: '\\ne ', render: '≠' },
        { label: '约等于', code: '\\approx ', render: '≈' },
        { label: '恒等于', code: '\\equiv ', render: '≡' },
        { label: '小于等于', code: '\\le ', render: '≤' },
        { label: '大于等于', code: '\\ge ', render: '≥' },
        { label: '自然对数', code: '\\ln(|)', render: 'ln(x)' },
        { label: '绝对值', code: '| |', render: '|x|' }
      ],
      greek: [
        { label: 'α (alpha)', code: '\\alpha', render: 'α' },
        { label: 'β (beta)', code: '\\beta', render: 'β' },
        { label: 'γ (gamma)', code: '\\gamma', render: 'γ' },
        { label: 'δ (delta)', code: '\\delta', render: 'δ' },
        { label: 'λ (lambda)', code: '\\lambda', render: 'λ' },
        { label: 'θ (theta)', code: '\\theta', render: 'θ' },
        { label: 'σ (sigma)', code: '\\sigma', render: 'σ' },
        { label: 'ξ (xi)', code: '\\xi', render: 'ξ' },
        { label: 'η (eta)', code: '\\eta', render: 'η' },
        { label: 'ω (omega)', code: '\\omega', render: 'ω' },
        { label: 'Δ (Delta)', code: '\\Delta', render: 'Δ' },
        { label: 'Λ (Lambda)', code: '\\Lambda', render: 'Λ' }
      ],
      linalg: [
        { label: '圆括号矩阵', code: '\\begin{pmatrix} | & \\\\ & \\end{pmatrix}', render: '(矩阵)' },
        { label: '方括号矩阵', code: '\\begin{bmatrix} | & \\\\ & \\end{bmatrix}', render: '[矩阵]' },
        { label: '行列式', code: '\\begin{vmatrix} | & \\\\ & \\end{vmatrix}', render: '|行列式|' },
        { label: '向量 A', code: '\\boldsymbol{A}', render: 'A' },
        { label: '转置 A^T', code: 'A^{\\mathrm{T}}', render: 'Aᵀ' },
        { label: '逆阵 A⁻¹', code: 'A^{-1}', render: 'A⁻¹' },
        { label: '伴随阵 A*', code: 'A^{*}', render: 'A*' },
        { label: '矩阵秩 r(A)', code: 'r(A)', render: 'r(A)' },
        { label: '行列式 det', code: '|A|', render: '|A|' },
        { label: '特征多项式', code: '|\\lambda E - A|', render: '|λE-A|' }
      ],
      templates: [
        { label: '1^∞ 型极限', code: '1^\\infty \\text{型: } \\lim_{x \\to |} [1+f(x)]^{\\frac{1}{f(x)} \\cdot f(x)g(x)} = \\mathrm{e}^{\\lim f(x)g(x)}', render: '1^∞极限' },
        { label: '常用等价无穷小', code: '\\sin x \\sim x, \\; \\ln(1+x) \\sim x, \\; \\mathrm{e}^x - 1 \\sim x, \\; 1-\\cos x \\sim \\frac{1}{2}x^2', render: '等价无穷小' },
        { label: 'e^x 泰勒展开', code: '\\mathrm{e}^x = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + o(x^3)', render: 'e^x展开' },
        { label: 'cos x 泰勒展开', code: '\\cos x = 1 - \\frac{x^2}{2!} + \\frac{x^4}{4!} + o(x^4)', render: 'cos展开' },
        { label: 'sin x 泰勒展开', code: '\\sin x = x - \\frac{x^3}{3!} + \\frac{x^5}{5!} + o(x^5)', render: 'sin展开' },
        { label: '重点标注块', code: '> **重点提示**：|', render: '重点引用' }
      ]
    };

    const AUTOCOMPLETE_DICT = [
      { key: 'fp', insert: "f'(x)", desc: "一阶导数 f'(x)", preview: "f'(x)" },
      { key: 'fprime', insert: "f'(x)", desc: "一阶导数 f'(x)", preview: "f'(x)" },
      { key: 'fpp', insert: "f''(x)", desc: "二阶导数 f''(x)", preview: "f''(x)" },
      { key: 'fn', insert: "f^{(n)}(x)", desc: "n阶导数 fⁿ(x)", preview: "fⁿ(x)" },
      { key: 'f0', insert: "f'(x_0)", desc: "导数值 f'(x₀)", preview: "f'(x₀)" },
      { key: 'fx', insert: "f(x)", desc: "函数 f(x)", preview: "f(x)" },
      { key: 'gx', insert: "g(x)", desc: "函数 g(x)", preview: "g(x)" },
      { key: 'df', insert: "\\frac{\\mathrm{d}f}{\\mathrm{d}x}", desc: "全导数 df/dx", preview: "df/dx" },
      { key: 'lim', insert: '\\lim_{x \\to \\infty} |', desc: '极限(趋于无穷)', preview: 'lim_{x→∞}' },
      { key: 'lim0', insert: '\\lim_{x \\to 0} |', desc: '极限(趋于0)', preview: 'lim_{x→0}' },
      { key: 'frac', insert: '\\frac{|}{}', desc: '分式', preview: 'a/b' },
      { key: 'sqrt', insert: '\\sqrt{|}', desc: '平方根', preview: '√' },
      { key: 'cbrt', insert: '\\sqrt[3]{|}', desc: '立方根', preview: '∛' },
      { key: 'uint', insert: '\\int | \\,dx', desc: '不定积分 ∫f(x)dx', preview: '∫' },
      { key: 'int', insert: '\\int | \\,dx', desc: '不定积分 ∫f(x)dx', preview: '∫' },
      { key: 'dint', insert: '\\int_{|}^{} \\,dx', desc: '定积分 ∫_a^b', preview: '∫_a^b' },
      { key: 'iint', insert: '\\iint_{D} | \\,dxdy', desc: '二重积分', preview: '∬' },
      { key: 'iiint', insert: '\\iiint_{\\Omega} | \\,dxdydz', desc: '三重积分', preview: '∭' },
      { key: 'sum', insert: '\\sum_{i=1}^{n} |', desc: '求和', preview: '∑' },
      { key: 'prod', insert: '\\prod_{i=1}^{n} |', desc: '连乘', preview: '∏' },
      { key: 'partial', insert: '\\frac{\\partial |}{\\partial x}', desc: '偏导数', preview: '∂/∂x' },
      { key: 'matrix', insert: '\\begin{pmatrix} | & \\\\ & \\end{pmatrix}', desc: '常用矩阵', preview: '(矩阵)' },
      { key: 'pmatrix', insert: '\\begin{pmatrix} | & \\\\ & \\end{pmatrix}', desc: '圆括号矩阵', preview: '(矩阵)' },
      { key: 'bmatrix', insert: '\\begin{bmatrix} | & \\\\ & \\end{bmatrix}', desc: '方括号矩阵', preview: '[矩阵]' },
      { key: 'vmatrix', insert: '\\begin{vmatrix} | & \\\\ & \\end{vmatrix}', desc: '行列式', preview: '|行列式|' },
      { key: 'alpha', insert: '\\alpha', desc: '阿尔法', preview: 'α' },
      { key: 'beta', insert: '\\beta', desc: '贝塔', preview: 'β' },
      { key: 'gamma', insert: '\\gamma', desc: '伽马', preview: 'γ' },
      { key: 'delta', insert: '\\delta', desc: '德尔塔', preview: 'δ' },
      { key: 'lambda', insert: '\\lambda', desc: '兰姆达', preview: 'λ' },
      { key: 'theta', insert: '\\theta', desc: '西塔', preview: 'θ' },
      { key: 'sigma', insert: '\\sigma', desc: '西格玛', preview: 'σ' },
      { key: 'xi', insert: '\\xi', desc: '克西', preview: 'ξ' },
      { key: 'eta', insert: '\\eta', desc: '艾塔', preview: 'η' },
      { key: 'omega', insert: '\\omega', desc: '欧米伽', preview: 'ω' },
      { key: 'Delta', insert: '\\Delta', desc: '大写德尔塔', preview: 'Δ' },
      { key: 'Lambda', insert: '\\Lambda', desc: '对角阵', preview: 'Λ' },
      { key: 'infty', insert: '\\infty', desc: '无穷大', preview: '∞' },
      { key: 'to', insert: '\\to ', desc: '趋近于', preview: '→' },
      { key: 'ne', insert: '\\ne ', desc: '不等于', preview: '≠' },
      { key: 'le', insert: '\\le ', desc: '小于等于', preview: '≤' },
      { key: 'ge', insert: '\\ge ', desc: '大于等于', preview: '≥' },
      { key: 'approx', insert: '\\approx ', desc: '约等于', preview: '≈' },
      { key: 'equiv', insert: '\\equiv ', desc: '恒等于', preview: '≡' },
      { key: 'sim', insert: '\\sim ', desc: '等价无穷小', preview: '~' },
      { key: 'pm', insert: '\\pm ', desc: '正负号', preview: '±' },
      { key: 'in', insert: '\\in ', desc: '属于', preview: '∈' },
      { key: 'notin', insert: '\\notin ', desc: '不属于', preview: '∉' },
      { key: 'subset', insert: '\\subset ', desc: '子集', preview: '⊂' },
      { key: 'cup', insert: '\\cup ', desc: '并集', preview: '∪' },
      { key: 'cap', insert: '\\cap ', desc: '交集', preview: '∩' },
      { key: 'forall', insert: '\\forall ', desc: '任意', preview: '∀' },
      { key: 'exists', insert: '\\exists ', desc: '存在', preview: '∃' },
      { key: 'because', insert: '\\because ', desc: '因为', preview: '∵' },
      { key: 'therefore', insert: '\\therefore ', desc: '所以', preview: '∴' },
      { key: 'Rightarrow', insert: '\\Rightarrow ', desc: '推出', preview: '⇒' },
      { key: 'Leftrightarrow', insert: '\\Leftrightarrow ', desc: '等价于', preview: '⇔' },
      { key: 'ln', insert: '\\ln(|)', desc: '自然对数', preview: 'ln' },
      { key: 'sin', insert: '\\sin(|)', desc: '正弦', preview: 'sin' },
      { key: 'cos', insert: '\\cos(|)', desc: '余弦', preview: 'cos' },
      { key: 'tan', insert: '\\tan(|)', desc: '正切', preview: 'tan' },
      { key: 'arctan', insert: '\\arctan(|)', desc: '反正切', preview: 'arctan' },
      { key: 'arcsin', insert: '\\arcsin(|)', desc: '反正弦', preview: 'arcsin' },
      { key: 'arccos', insert: '\\arccos(|)', desc: '反余弦', preview: 'arccos' }
    ];

    // 将 LaTeX 片段安全插入当前笔记输入框
    function insertSnippetIntoNotes(snippet) {
      const duo = document.getElementById('notesDuo');
      if (!duo || duo.style.display === 'none') {
        enterEditMode();
      }
      const textarea = document.getElementById('notesTextarea');
      if (!textarea) return;

      const start = textarea.selectionStart !== undefined ? textarea.selectionStart : textarea.value.length;
      const end = textarea.selectionEnd !== undefined ? textarea.selectionEnd : start;
      const val = textarea.value;
      const selected = val.substring(start, end);

      let insertText = snippet;
      let targetCursor = start + snippet.length;

      if (snippet.indexOf('|') !== -1) {
        if (selected) {
          insertText = snippet.replace('|', selected);
          targetCursor = start + insertText.length;
        } else {
          const pipeIdx = snippet.indexOf('|');
          insertText = snippet.replace('|', '');
          targetCursor = start + pipeIdx;
        }
      }

      textarea.value = val.substring(0, start) + insertText + val.substring(end);
      textarea.selectionStart = targetCursor;
      textarea.selectionEnd = targetCursor;
      textarea.focus();
      notesDirty = true;
      updateNotesPreview();
    }

    // 智能括号与美元符号配对/包裹辅助
    function wrapOrInsertPair(textarea, openChar, closeChar) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;
      if (start !== end) {
        const sel = val.substring(start, end);
        textarea.value = val.substring(0, start) + openChar + sel + closeChar + val.substring(end);
        textarea.selectionStart = start + openChar.length;
        textarea.selectionEnd = end + openChar.length;
      } else {
        textarea.value = val.substring(0, start) + openChar + closeChar + val.substring(end);
        textarea.selectionStart = start + openChar.length;
        textarea.selectionEnd = start + openChar.length;
      }
      notesDirty = true;
      updateNotesPreview();
    }

    // 自动补全状态管理
    let acVisible = false;
    let acItems = [];
    let acActiveIndex = 0;
    let acQueryStart = -1;

    function showAcPopup() {
      acVisible = true;
      const popup = document.getElementById('notesAutocompletePopup');
      if (!popup) return;
      popup.style.display = 'flex';
      renderAcPopup();
    }

    function hideAcPopup() {
      acVisible = false;
      const popup = document.getElementById('notesAutocompletePopup');
      if (popup) popup.style.display = 'none';
    }

    function renderAcPopup() {
      const popup = document.getElementById('notesAutocompletePopup');
      if (!popup || !acVisible) return;
      popup.innerHTML = '';
      acItems.slice(0, 10).forEach(function(item, idx) {
        const el = document.createElement('div');
        el.className = 'n-ac-item' + (idx === acActiveIndex ? ' active' : '');
        el.innerHTML = '<div class="n-ac-left">' +
          '<span class="n-ac-label">\\' + item.key + '</span>' +
          '<span class="n-ac-desc">' + item.desc + '</span>' +
          '</div>' +
          '<span class="n-ac-preview">' + (item.preview || '') + '</span>';
        el.addEventListener('mousedown', function(e) {
          e.preventDefault(); // 防止失去焦点
          applyAutocomplete(item);
        });
        popup.appendChild(el);
      });
      const activeEl = popup.children[acActiveIndex];
      if (activeEl && activeEl.scrollIntoView) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }

    function applyAutocomplete(item) {
      const textarea = document.getElementById('notesTextarea');
      if (!textarea || acQueryStart === -1) return;
      const val = textarea.value;
      const before = val.substring(0, acQueryStart);
      const after = val.substring(textarea.selectionStart);
      let insertText = item.insert;
      let targetCursor = acQueryStart + insertText.length;
      if (insertText.indexOf('|') !== -1) {
        const pipeIdx = insertText.indexOf('|');
        insertText = insertText.replace('|', '');
        targetCursor = acQueryStart + pipeIdx;
      }
      textarea.value = before + insertText + after;
      textarea.selectionStart = targetCursor;
      textarea.selectionEnd = targetCursor;
      textarea.focus();
      hideAcPopup();
      notesDirty = true;
      updateNotesPreview();
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
      hideAcPopup();
      toggleMathSymbolPalette(false); // 结束编辑自动收起符号工具盘
    }

    // ===== 题号右上角「有笔记 / 有标注」提示（右侧导航角标） =====
    // 指定题号 idx 的题目图/解析图是否有标注
    // 优化：通过 imgAnnotations 索引前缀匹配，避免逐号探测最多 20 张解析图分片的硬编码上限
    function hasQuestionImagesAnnotated(idx) {
      const base = normalizeAnnotSrc(getImgPath(idx));
      // 任何以该题 base 路径为前缀的标注 key 存在，即认为该题有标注
      return Object.keys(imgAnnotations).some(function(k) { return k.indexOf(base) === 0; });
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
      notesDirty = false; // 进入编辑时重置（初始值即已保存内容）
      updateNotesPreview();
      toggleMathSymbolPalette(true); // 进入编辑自动展开常用符号代码工具盘

      // 实时预览（防抖）+ 自动补全触发 + 标记未保存改动
      textarea.oninput = function() {
        notesDirty = true;
        updateNotesPreview();

        const pos = textarea.selectionStart;
        const val = textarea.value;
        const before = val.substring(0, pos);
        const m = before.match(/\\([a-zA-Z0-9]*)$/);
        if (m) {
          const query = m[1].toLowerCase();
          acQueryStart = before.length - m[0].length;
          const matches = AUTOCOMPLETE_DICT.filter(function(item) {
            return item.key.toLowerCase().indexOf(query) === 0 || item.desc.indexOf(query) !== -1;
          });
          if (matches.length > 0) {
            acItems = matches;
            acActiveIndex = 0;
            showAcPopup();
          } else {
            hideAcPopup();
          }
        } else {
          hideAcPopup();
        }
      };

      // 快捷键、成对闭合与自动补全拦截
      textarea.onkeydown = function(e) {
        if (acVisible) {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            acActiveIndex = (acActiveIndex + 1) % Math.min(acItems.length, 10);
            renderAcPopup();
            return;
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            acActiveIndex = (acActiveIndex - 1 + Math.min(acItems.length, 10)) % Math.min(acItems.length, 10);
            renderAcPopup();
            return;
          } else if (e.key === 'Tab' || e.key === 'Enter') {
            e.preventDefault();
            applyAutocomplete(acItems[acActiveIndex]);
            return;
          } else if (e.key === 'Escape') {
            e.preventDefault();
            hideAcPopup();
            return;
          }
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const val = textarea.value;

        // 跳过已存在的右括号/美元符号
        if (start === end && (e.key === '$' || e.key === '}' || e.key === ')' || e.key === ']') && val[start] === e.key) {
          e.preventDefault();
          textarea.selectionStart = start + 1;
          textarea.selectionEnd = start + 1;
          return;
        }

        // 成对自动闭合
        if (e.key === '$') {
          e.preventDefault();
          wrapOrInsertPair(textarea, '$', '$');
          return;
        } else if (e.key === '{') {
          e.preventDefault();
          wrapOrInsertPair(textarea, '{', '}');
          return;
        } else if (e.key === '(') {
          e.preventDefault();
          wrapOrInsertPair(textarea, '(', ')');
          return;
        } else if (e.key === '[') {
          e.preventDefault();
          wrapOrInsertPair(textarea, '[', ']');
          return;
        } else if (e.key === 'Backspace' && start === end && start > 0) {
          const prevChar = val[start - 1];
          const nextChar = val[start];
          if ((prevChar === '$' && nextChar === '$') ||
              (prevChar === '{' && nextChar === '}') ||
              (prevChar === '(' && nextChar === ')') ||
              (prevChar === '[' && nextChar === ']')) {
            e.preventDefault();
            textarea.value = val.substring(0, start - 1) + val.substring(start + 1);
            textarea.selectionStart = start - 1;
            textarea.selectionEnd = start - 1;
            notesDirty = true;
            updateNotesPreview();
            return;
          }
        }

        // Enter 保存，Shift+Enter 换行
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
      notesDirty = false;
      hideAcPopup();
      renderNotes(); // 保存后回到查看模式（渲染结果）
      renderNav();
    }

    // 离开编辑态前的自动保存：若有未提交改动且仍在编辑态，落盘并退出编辑态
    function autoSaveNotes() {
      if (!notesDirty) return;
      const duo = document.getElementById('notesDuo');
      if (duo && duo.style.display === 'none') { notesDirty = false; return; } // 已退出编辑态，忽略残留标志
      saveNote(); // 内部写 notesData + saveNotes + renderNotes（退出编辑态）+ 清零 notesDirty
    }

    function cancelNoteEdit() {
      notesDirty = false; // 用户主动放弃编辑，丢弃未保存内容
      hideAcPopup();
      renderNotes(); // 取消后回到查看模式（渲染结果）
    }

    function deleteNote() {
      delete notesData[notesKeyFor(current)];
      saveNotes();
      notesDirty = false;
      renderNotes();
      renderNav();
    }

    function focusNotes() {
      enterEditMode(); // N 键：直接进入编辑
    }

    function toggleQBad() { qBad[current] = !qBad[current]; if (!qBad[current]) delete qBad[current]; saveQBad(); updateQBadBtn(); updateImgBadWarnings(); renderNav(); }
    function toggleSBad() { sBad[current] = !sBad[current]; if (!sBad[current]) delete sBad[current]; saveSBad(); updateSBadBtn(); updateImgBadWarnings(); renderNav(); }
    function toggleBookMismatch() { bookMismatch[current] = !bookMismatch[current]; if (!bookMismatch[current]) delete bookMismatch[current]; saveBookMismatch(); updateBookMismatchBtn(); updateImgBadWarnings(); renderNav(); }

    // ===== 组合键检测（R/T 图质量与实书不符标记） =====
    let rtComboState = { r: false, t: false, timer: null };
    function resetRtCombo() {
      rtComboState.r = false; rtComboState.t = false;
      if (rtComboState.timer) { clearTimeout(rtComboState.timer); rtComboState.timer = null; }
    }
    function handleBadKey(key) {
      var ch = key.toLowerCase();
      if (ch !== 'r' && ch !== 't') { resetRtCombo(); return; }
      rtComboState[ch] = true;
      if (rtComboState.timer) { clearTimeout(rtComboState.timer); rtComboState.timer = null; }
      // 检测组合键（顺序无关）：R + T → 该题与实书不符
      if (rtComboState.r && rtComboState.t) {
        toggleBookMismatch();
        resetRtCombo();
        return;
      }
      // 未形成组合，等待 120ms 后按单键触发
      rtComboState.timer = setTimeout(function() {
        if (rtComboState.r) { toggleQBad(); }
        else if (rtComboState.t) { toggleSBad(); }
        resetRtCombo();
      }, 120);
    }

    // ===== 组合键检测（Z/X/C 5级打标） =====
    let comboState = { z: false, x: false, c: false, timer: null };
    function resetCombo() {
      comboState.z = false; comboState.x = false; comboState.c = false;
      if (comboState.timer) { clearTimeout(comboState.timer); comboState.timer = null; }
    }
    function handleStatusKey(key) {
      // 注：调用方已在 keydown 中做了 INPUT/TEXTAREA 过滤
      var ch = key.toLowerCase();
      if (ch !== 'z' && ch !== 'x' && ch !== 'c') { resetCombo(); return; }
      comboState[ch] = true;
      if (comboState.timer) { clearTimeout(comboState.timer); comboState.timer = null; }
      // 检测组合键（顺序无关）
      // Z + X → 较熟练 (familiar, lv4)
      if (comboState.z && comboState.x) {
        setStatus('familiar'); resetCombo(); return;
      }
      // X + C → 困难 (rusty, lv2)
      if (comboState.x && comboState.c) {
        setStatus('rusty'); resetCombo(); return;
      }
      // 未形成组合，等待 120ms 后按单键触发
      comboState.timer = setTimeout(function() {
        if (comboState.z) { setStatus('proficient'); }
        else if (comboState.x) { setStatus('vague'); }
        else if (comboState.c) { setStatus('wrong'); }
        resetCombo();
      }, 120);
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
      const scoreMap = { proficient: 5, familiar: 4, vague: 3, rusty: 2, wrong: 1 };
      const score = scoreMap[status];
      if (reviewSession && !togglingOff && score) {
        // 复习会话评级：延迟提交，不即时改 SM-2
        const item = reviewCurrentItem();
        const isReviewTarget = item && currentChapterId === item.chapterId && current === item.idx;
        if (isReviewTarget) {
          item.finalScore = score;
          item.status = 'graded';
          reviewAdvance(1); // 评级后自动进入下一复习题
        } else {
          // A/D/W/S 漂移到相邻题评级：只重定基线，不改复习位置
          rebaselineSm2(current, score);
        }
      } else if (!togglingOff && score) {
        // 常规答题改标：重定基线，首次标记（原本未做）时自动跳到下一题
        rebaselineSm2(current, score);
        recordStudyActivity();
        if (!had) navNext();
      }
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
        // 工具栏 / 预设色板 / 标注按钮 / 关闭按钮等控件上的点击不拦截
        if (e.target.closest && e.target.closest('#annotToolbar, #annotPalette, #lightboxAnnotate, #lightboxClose, .annot-palette, .annot-toolbar, .at-btn, .at-swatch, .at-color-swatch, .at-width-wrap, .at-width-step, .annot-palette-custom')) return;
        if (e.composedPath) {
          const path = e.composedPath();
          const hitControl = path.some(function (el) {
            return el && (
              el.id === 'annotToolbar' ||
              el.id === 'annotPalette' ||
              el.id === 'lightboxAnnotate' ||
              el.id === 'lightboxClose' ||
              (el.classList && (
                el.classList.contains('annot-palette') ||
                el.classList.contains('annot-toolbar') ||
                el.classList.contains('at-btn') ||
                el.classList.contains('at-swatch') ||
                el.classList.contains('at-color-swatch') ||
                el.classList.contains('at-width-wrap') ||
                el.classList.contains('at-width-step') ||
                el.classList.contains('annot-palette-custom')
              ))
            );
          });
          if (hitControl) return;
        }
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

      // 快捷键帮助：点击背景或关闭按钮关闭
      const scOverlay = document.getElementById('shortcutOverlay');
      if (scOverlay) {
        scOverlay.addEventListener('click', function(e) {
          if (e.target === scOverlay) toggleShortcutHelp();
        });
      }
      const scCloseBtn = document.getElementById('btnShortcutModalClose');
      if (scCloseBtn) {
        scCloseBtn.addEventListener('click', function() {
          toggleShortcutHelp();
        });
      }
      // 侧栏折叠、笔记快捷工具栏与常用数学符号盘初始化
      initSidebarCollapse();
      initNotesQuickToolbar();
      initMathSymbolPalette();
    });

    // ===== 侧栏折叠与自适应逻辑（I 键收起两侧栏进入沉浸模式） =====
    let sidebarCollapsed = false;
    try {
      sidebarCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
    } catch (e) {}

    function setSidebarCollapsed(collapsed) {
      sidebarCollapsed = !!collapsed;
      const layout = document.getElementById('mathAppLayout');
      if (layout) layout.classList.toggle('sidebar-collapsed', sidebarCollapsed);
      const floatBtn = document.getElementById('btnFloatingExpandSidebar');
      if (floatBtn) floatBtn.style.display = sidebarCollapsed ? 'inline-flex' : 'none';
      try {
        localStorage.setItem('sidebar_collapsed', sidebarCollapsed ? 'true' : 'false');
      } catch (e) {}
      updateHeaderProgressTag();
    }

    function toggleLeftSidebar() {
      setSidebarCollapsed(!sidebarCollapsed);
    }

    // 侧栏收起时在上方书名/章节信息栏展现当前题目与分区进度（不显示符号代码）
    function updateHeaderProgressTag() {
      const tag = document.getElementById('headerProgressTag');
      if (!tag) return;
      const ch = getChapter();
      if (!ch || !ch.labels || !sidebarCollapsed) {
        tag.style.display = 'none';
        return;
      }

      const partLabel = partOfIdx(current) || '题目';
      ensureGroups(ch);
      const g = ch.groupForIdx[current];
      let qDisplay = (ch.displayLabels && ch.displayLabels[current]) ? ch.displayLabels[current] : (g && g.parentLabel ? g.parentLabel : ch.labels[current]);

      // 计算当前分区完成情况
      let secTotal = 0, secDone = 0;
      for (let i = 0; i < ch.labels.length; i++) {
        if (partOfIdx(i) === partLabel) {
          secTotal++;
          if (statuses[i]) secDone++;
        }
      }

      tag.innerHTML = '<span class="hpt-part">[' + partLabel + ']</span>' +
                      '<span class="hpt-q">' + qDisplay + '</span>' +
                      '<span class="hpt-stat">本区 ' + secDone + '/' + secTotal + ' · 全章 ' + (current + 1) + '/' + ch.labels.length + '</span>';
      tag.style.display = 'inline-flex';
    }

    function initSidebarCollapse() {
      const btnCollapse = document.getElementById('btnCollapseSidebar');
      if (btnCollapse) {
        btnCollapse.addEventListener('click', function() {
          setSidebarCollapsed(true);
        });
      }
      const btnExpand = document.getElementById('btnFloatingExpandSidebar');
      if (btnExpand) {
        btnExpand.addEventListener('click', function() {
          setSidebarCollapsed(false);
        });
      }
      setSidebarCollapsed(sidebarCollapsed);
    }

    // ===== 笔记快速插入工具栏初始化 =====
    function initNotesQuickToolbar() {
      const bar = document.getElementById('notesQuickToolbar');
      if (!bar) return;
      bar.addEventListener('click', function(e) {
        const btn = e.target.closest('.nqt-btn');
        if (!btn) return;
        const snippet = btn.dataset.insert;
        if (snippet) {
          e.preventDefault();
          insertSnippetIntoNotes(snippet);
        }
      });
    }

    // ===== 右侧常用数学符号工具盘折叠与切换 =====
    function toggleMathSymbolPalette(forceOpen) {
      const panel = document.getElementById('mathSymbolPalette');
      if (!panel) return;
      if (forceOpen === true) {
        panel.classList.remove('collapsed');
      } else if (forceOpen === false) {
        panel.classList.add('collapsed');
      } else {
        panel.classList.toggle('collapsed');
      }
      if (!panel.classList.contains('collapsed') && !sidebarCollapsed) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    // ===== 右侧常用数学符号工具盘初始化 =====
    function initMathSymbolPalette() {
      const grid = document.getElementById('paletteGrid');
      const tabs = document.querySelectorAll('.palette-tab');
      const header = document.getElementById('paletteHeader');
      const panel = document.getElementById('mathSymbolPalette');
      let currentTab = 'calc';

      // 默认初始收起状态，进入笔记编辑时自动展开
      if (panel) {
        panel.classList.add('collapsed');
      }

      function renderGrid(tabKey) {
        if (!grid) return;
        grid.innerHTML = '';
        const list = MATH_PALETTE_DATA[tabKey] || [];
        list.forEach(function(item) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'palette-item';
          btn.title = item.code.replace(/\|/g, '');
          btn.innerHTML = '<span class="palette-item-render">' + item.render + '</span>' +
                          '<span class="palette-item-code">' + item.label + '</span>';
          btn.addEventListener('click', function(e) {
            e.preventDefault();
            insertSnippetIntoNotes(item.code);
          });
          grid.appendChild(btn);
        });
      }

      tabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
          tabs.forEach(function(t) { t.classList.remove('active'); });
          tab.classList.add('active');
          currentTab = tab.dataset.tab;
          renderGrid(currentTab);
        });
      });

      if (header && panel) {
        header.addEventListener('click', function(e) {
          toggleMathSymbolPalette();
        });
      }

      renderGrid(currentTab);
    }

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
      safeLSSet(annotKey(imgSrc), JSON.stringify(state)); // 标注 JSON 体积较大，用 safeLSSet 防配额溢出静默丢失
      notifyStorageSync();
    }
    function getAnnotation(imgSrc) { return imgAnnotations[normalizeAnnotSrc(imgSrc)] || null; }
    function clearAnnotation(imgSrc) {
      const key = normalizeAnnotSrc(imgSrc);
      delete imgAnnotations[key];
      try { localStorage.removeItem('annot_' + key); } catch (e) {}
      notifyStorageSync();
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
      const enable = (currentTheme === 'dark' && darkImageFilter);
      img.classList.toggle('dark-filter', enable);
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
        if (mview.shadowRoot) {
          const st = document.createElement('style');
          st.textContent = 'img { display: none !important; }';
          mview.shadowRoot.appendChild(st);
        }
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
      const enable = (currentTheme === 'dark' && darkImageFilter);
      if (ma) ma.classList.toggle('dark-filter', enable);
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
      if (tb) {
        tb.addEventListener('click', function (e) {
          e.stopPropagation();
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
      }

      // 粗细滑块实时应用（同步到当前工具的记忆值）
      const widthInput = document.getElementById('annotWidth');
      if (widthInput) {
        widthInput.addEventListener('click', function (e) { e.stopPropagation(); });
        widthInput.addEventListener('input', function (e) {
          lbAnnotWidth = parseInt(e.target.value, 10) || 1;
          const s = ANNOT_TOOL_STYLES[lbCurrentAnnotTool];
          if (s) s.width = lbAnnotWidth;
          updateAnnotWidthUI();
          if (lbMarkerArea) applyAnnotStyle();
        });
      }

      // 颜色按钮：开关预设色板
      const colorBtn = document.getElementById('annotColorSwatch');
      if (colorBtn) colorBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleAnnotPalette();
      });

      // 色板：预设色点击
      const pal = document.getElementById('annotPalette');
      if (pal) {
        pal.addEventListener('click', function (e) {
          e.stopPropagation();
          const s = e.target.closest('.at-swatch');
          if (s) { setAnnotColor(s.dataset.color); toggleAnnotPalette(false); return; }
        });
      }

      // 色板：自定义色
      const custom = document.getElementById('annotColorCustom');
      if (custom) {
        custom.addEventListener('click', function (e) { e.stopPropagation(); });
        custom.addEventListener('input', function (e) { setAnnotColor(e.target.value); });
        custom.addEventListener('change', function (e) { setAnnotColor(e.target.value); });
      }

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
    const btnMismatch = document.getElementById('btnBookMismatch');
    if (btnMismatch) btnMismatch.onclick = toggleBookMismatch;

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

    // ===== SM-2 复习持久化与重置 =====
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
      notifyStorageSync();
    }

    // 读取任意章节「合并后」的 SM-2（own 段 + 1000题伴章段），键为合并索引 0..total-1
    function readMergedSm2(ch) {
      var out = {};
      statusSources(ch).forEach(function(src) {
        var obj;
        try { obj = JSON.parse(localStorage.getItem(sm2Key(src.ch)) || '{}'); } catch (e) { obj = {}; }
        for (var i = 0; i < src.len; i++) {
          if (obj[i]) out[src.offset + i] = obj[i];
        }
      });
      return out;
    }

    // 将「合并后」的 SM-2 写回 own/伴章两块存储键
    function writeMergedSm2(ch, merged) {
      statusSources(ch).forEach(function(src) {
        var out = {};
        for (var i = 0; i < src.len; i++) {
          if (merged[src.offset + i]) out[i] = merged[src.offset + i];
        }
        if (Object.keys(out).length > 0) {
          localStorage.setItem(sm2Key(src.ch), JSON.stringify(out));
        } else {
          localStorage.removeItem(sm2Key(src.ch));
        }
      });
      notifyStorageSync();
    }

    // 重置所有 SM-2 复习进度
    function resetAllSm2() {
      var keys = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf('sm2_') === 0) {
          keys.push(k);
        }
      }
      keys.forEach(function(k) { localStorage.removeItem(k); });
      sm2 = {};
      if (sm2PanelOpen) renderSm2Panel();
      alert('SM-2 复习进度已重置（' + keys.length + ' 条记录已清除）。');
      return keys.length;
    }

    var selectedSm2Batch = 30; // 默认单次冲刺 30 题

    // ===== 记忆留存率算法 (基于 FSRS / 负幂律遗忘曲线) =====
    function calcRetrievability(record, now) {
      if (!record || !record.lastReview || !record.interval) return 1.0;
      var curStudyDay = getStudyDayIndex(now || Date.now());
      var lastStudyDay = record.lastStudyDay !== undefined ? record.lastStudyDay : getStudyDayIndex(record.lastReview);
      var elapsed = Math.max(0, curStudyDay - lastStudyDay);
      var stability = Math.max(1, record.interval);
      // R(t) = (1 + 0.19 * (elapsed / stability))^(-1)
      var retrievability = Math.pow(1 + 0.19 * (elapsed / stability), -1);
      return Math.max(0.0, Math.min(1.0, retrievability));
    }

    // ===== SM-2+ 强化间隔重复算法（提取努力 + 历史遗忘阻尼 + 连击复苏） =====
    function calcSM2Plus(record, score, customNow) {
      if (!record) record = { ef: 2.5, interval: 1, reps: 0, nextReview: 0, lastReview: 0, history: [] };
      var now = customNow || Date.now();
      var curStudyDay = getStudyDayIndex(now);
      var ef = record.ef !== undefined ? record.ef : 2.5;
      var interval = record.interval || 1;
      var reps = record.reps || 0;
      var hist = record.history ? record.history.slice() : [];

      // 1. 真实流逝学习日与预测留存率
      var lastStudyDay = record.lastStudyDay !== undefined ? record.lastStudyDay : (record.lastReview ? getStudyDayIndex(record.lastReview) : curStudyDay);
      var elapsedDays = Math.max(0, curStudyDay - lastStudyDay);
      var curR = calcRetrievability(record, now);

      // 2. 统计历史遗忘频次（Lapse Count）
      var lapseCount = 0;
      hist.forEach(function(h) { if (h.score <= 2) lapseCount++; });

      // 3. 提取努力效应（Retrieval Effort Effect / 逾期奖励与提前平抑）
      var effortFactor = 1.0;
      if (score >= 4 && record.lastReview > 0) {
        if (elapsedDays >= interval) {
          // 逾期回忆成功：难度越大，记忆提取巩固越深
          effortFactor = 1.0 + Math.min(1.5, ((elapsedDays - interval) / Math.max(1, interval)) * 0.6);
        } else {
          // 提前复习：平抑过快膨胀
          effortFactor = 0.5 + 0.5 * (elapsedDays / Math.max(1, interval));
        }
      }

      // 4. 历史遗忘阻尼（Lapse Damping）
      var lapseDamping = Math.max(0.70, Math.pow(0.94, lapseCount));

      // 5. 简易度因子 (EF) 变化映射
      var deltaMap = { 5: 0.15, 4: 0.02, 3: -0.10, 2: -0.18, 1: -0.25 };
      var delta = deltaMap[score] !== undefined ? deltaMap[score] : 0;
      ef = Math.max(1.3, Math.min(3.2, ef + delta));

      // 6. 突破 EF 地狱的「连击复苏加速（Recovery Boost）」
      if (ef <= 1.6 && hist.length >= 1) {
        var lastScore = hist[hist.length - 1].score;
        if (score >= 4 && lastScore >= 4) {
          ef = Math.min(3.2, ef + 0.15);
        }
      }

      // 7. 间隔天数 (Interval) 与重复次数 (Reps) 计算
      if (score === 5) {
        // 熟练：高效拉长复习间隔
        if (reps === 0) interval = 1;
        else if (reps === 1) interval = Math.max(2, Math.round(6 * effortFactor));
        else interval = Math.max(interval + 1, Math.round(interval * ef * 1.18 * effortFactor * lapseDamping));
        reps++;
      } else if (score === 4) {
        // 较熟练：标准稳定递增
        if (reps === 0) interval = 1;
        else if (reps === 1) interval = Math.max(2, Math.round(5 * effortFactor));
        else interval = Math.max(interval + 1, Math.round(interval * ef * effortFactor * lapseDamping));
        reps++;
      } else if (score === 3) {
        // 模糊：平滑衰减，保留部分记忆成果
        reps = Math.max(1, reps - 1);
        interval = Math.max(2, Math.round(interval * 0.5));
      } else if (score === 2) {
        // 困难：次日强化
        reps = 0;
        interval = 1;
      } else {
        // 不会：重置
        reps = 0;
        interval = 1;
      }

      // 8. 到期时间戳（对齐考研学习日清晨 04:00）
      var dueStudyDay = curStudyDay + interval;
      var dueDayDate = new Date(dueStudyDay * 24 * 3600 * 1000);
      var nextReview = new Date(dueDayDate.getUTCFullYear(), dueDayDate.getUTCMonth(), dueDayDate.getUTCDate(), 4, 0, 0, 0).getTime();

      hist.push({
        date: now,
        score: score,
        ef: parseFloat(ef.toFixed(2)),
        interval: interval,
        elapsedDays: elapsedDays,
        retrievability: parseFloat(curR.toFixed(3)),
        studyDay: curStudyDay
      });

      return {
        ef: parseFloat(ef.toFixed(2)),
        interval: interval,
        reps: reps,
        nextReview: nextReview,
        lastReview: now,
        lastStudyDay: curStudyDay,
        history: hist
      };
    }

    // 从纯历史事件序列全量回放重构最新的记忆状态（自愈与一致性引擎）
    function replayHistory(historyLogs) {
      if (!Array.isArray(historyLogs) || historyLogs.length === 0) return null;
      var sorted = historyLogs.slice().sort(function(a, b) { return (a.date || 0) - (b.date || 0); });
      var state = null;
      sorted.forEach(function(evt) {
        var score = evt.score || 3;
        var evtDate = evt.date || Date.now();
        state = calcSM2Plus(state, score, evtDate);
      });
      return state;
    }

    // 保持 calcSM2 兼容旧调用与测试
    function calcSM2(record, score) {
      return calcSM2Plus(record, score);
    }

    function checkMastered(record) {
      if (!record || !record.history || record.history.length < 3) return false;
      var h = record.history;
      return h.slice(-3).every(function(e) { return e.score >= 4; }) && record.interval >= 60;
    }

    // 根据掌握度等级返回恰当的初始 SM-2 状态
    function getSm2Seed(score) {
      if (score === 5)      return { ef: 2.6, interval: 30, reps: 3, history: [] };
      else if (score === 4) return { ef: 2.5, interval: 7,  reps: 2, history: [] };
      else if (score === 3) return { ef: 2.4, interval: 2,  reps: 1, history: [] };
      else if (score === 2) return { ef: 2.3, interval: 1,  reps: 0, history: [] };
      else                  return { ef: 2.2, interval: 1,  reps: 0, history: [] };
    }

    // 计算逾期天数（基于考研学习日）
    function getSm2OverdueDays(rec) {
      if (!rec || !rec.nextReview) return 0;
      var curStudyDay = getStudyDayIndex(Date.now());
      var dueStudyDay = (rec.lastStudyDay !== undefined && rec.interval)
        ? (rec.lastStudyDay + rec.interval)
        : getStudyDayIndex(rec.nextReview);
      return Math.max(0, curStudyDay - dueStudyDay);
    }

    // 获取到期状态：mastered / overdue / due / queued
    function getSm2Label(rec) {
      if (!rec || !rec.nextReview) return '';
      if (checkMastered(rec)) return 'mastered';
      var curStudyDay = getStudyDayIndex(Date.now());
      var dueStudyDay = (rec.lastStudyDay !== undefined && rec.interval)
        ? (rec.lastStudyDay + rec.interval)
        : getStudyDayIndex(rec.nextReview);

      if (dueStudyDay < curStudyDay) return 'overdue';
      if (dueStudyDay === curStudyDay) return 'due';
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
      var overdueDays = getSm2OverdueDays(rec);
      var retrievability = Math.round(calcRetrievability(rec) * 100);

      var lapseCount = 0;
      if (rec.history && Array.isArray(rec.history)) {
        rec.history.forEach(function(h) { if (h.score <= 2) lapseCount++; });
      }

      var tag = '';
      if (label === 'due') tag = '<span class="sm2-due-tag">今日到期</span>';
      else if (label === 'overdue') tag = '<span class="sm2-overdue-tag">已逾期 ' + overdueDays + ' 天</span>';
      else if (label === 'mastered') tag = '<span style="color:#F5A623;font-weight:600">已掌握</span>';

      var rColor = retrievability >= 85 ? 'var(--lv5-dark, #2e7d32)' : (retrievability >= 60 ? 'var(--uncertain-dark, #f59e0b)' : 'var(--unfamiliar, #dc2626)');

      bar.innerHTML = '<span>EF: ' + (rec.ef ? rec.ef.toFixed(2) : '2.50') + '</span>' +
        '<span>间隔: ' + rec.interval + '天</span>' +
        '<span>留存率: <b style="color:' + rColor + '">' + retrievability + '%</b></span>' +
        '<span>复习: ' + rec.reps + '次' + (lapseCount > 0 ? ' (' + lapseCount + '错)' : '') + '</span>' +
        (rec.lastReview ? '<span>上次: ' + new Date(rec.lastReview).toLocaleDateString('zh-CN') + '</span>' : '') +
        '<span>下次: ' + dd + '</span>' + tag;
    }

    // 模块归一：'基础篇-线代' → '线代'
    function canonicalSubj(subj) { return String(subj || '').replace(/^(基础篇|强化篇)[-—]/, ''); }
    // 复习用「浏览章」：排除 1000题 数据源章
    function reviewChapters() {
      return CHAPTERS.filter(function(c) { return c.wb !== '1000题' && c.total > 0; });
    }

    // 智能优先级得分算法：逾期天数权重 2.5 + 薄弱度权重 2.0 + EF难度权重 1.5 + 历史错题次数权重 1.2
    function calculatePriorityScore(item) {
      var rec = item.record || {};
      var overdueDays = item.overdueDays || getSm2OverdueDays(rec);
      var currentScore = item.currentScore || 3;
      var ef = rec.ef || 2.5;
      var lapseCount = 0;
      if (rec.history && Array.isArray(rec.history)) {
        rec.history.forEach(function(h) { if (h.score <= 2) lapseCount++; });
      }
      return (overdueDays * 2.5) + ((5 - currentScore) * 2.0) + ((3.2 - ef) * 1.5) + (lapseCount * 1.2);
    }

    // 获取当前选中的复习模式
    function getSm2Mode() {
      var mode = document.querySelector('input[name="sm2mode"]:checked');
      return mode ? mode.value : 'smart';
    }

    // 获取当前选中的冲刺组容量
    function getSm2BatchLimit() {
      return selectedSm2Batch;
    }

    // 统一收集到期题目队列（多维排序调度 + 分批冲刺控制）
    function collectDueItems(chapters, mode, batchLimit) {
      if (!mode) mode = getSm2Mode();
      if (batchLimit === undefined) batchLimit = getSm2BatchLimit();
      var queue = [];

      chapters.forEach(function(ch) {
        var merged = readMergedSm2(ch);
        var curStatusObj = {};
        try { curStatusObj = JSON.parse(localStorage.getItem(chapterStatusKey(ch)) || '{}'); } catch(e) {}
        var scoreMap = { proficient: 5, familiar: 4, vague: 3, rusty: 2, wrong: 1 };

        for (var i = 0; i < ch.total; i++) {
          var rec = merged[i];
          if (!rec || !rec.nextReview) continue;
          var label = getSm2Label(rec);
          if (label !== 'due' && label !== 'overdue') continue;

          var st = curStatusObj[i];
          var curScore = st ? (scoreMap[st] || 3) : 3;
          var overdueDays = getSm2OverdueDays(rec);

          queue.push({
            chapterId: ch.id,
            idx: i,
            record: rec,
            status: 'pending',
            finalScore: null,
            currentScore: curScore,
            overdueDays: overdueDays,
            priorityScore: 0
          });
        }
      });

      // 计算每个项目的智能优先级得分
      queue.forEach(function(item) {
        item.priorityScore = calculatePriorityScore(item);
      });

      // 根据模式排序
      if (mode === 'smart') {
        // 智能优先级推荐：按综合优先级得分降序排列
        queue.sort(function(a, b) { return b.priorityScore - a.priorityScore; });
      } else if (mode === 'overdue') {
        // 艾宾浩斯抢险：仅逾期题目 + 逾期天数降序
        queue = queue.filter(function(it) { return it.overdueDays > 0; });
        queue.sort(function(a, b) { return b.overdueDays - a.overdueDays; });
      } else if (mode === 'random') {
        // 跨学科随机穿插
        for (var i = queue.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var tmp = queue[i]; queue[i] = queue[j]; queue[j] = tmp;
        }
      } else {
        // sequential: 保持自然章节与题号顺序
      }

      // 截取批次上限
      if (batchLimit && batchLimit > 0 && queue.length > batchLimit) {
        queue = queue.slice(0, batchLimit);
      }

      return queue;
    }

    // 重定基线（非复习改标 / 复习中漂移到相邻题）：从对应等级种子重新计算
    function rebaselineSm2(idx, score) {
      if (!score) {
        delete sm2[idx];
      } else {
        sm2[idx] = calcSM2Plus(getSm2Seed(score), score);
      }
      saveSm2();
    }

    // ===== SM-2 未来 7 天到期负荷预测直方图 =====
    function renderSm2Projection() {
      var container = document.getElementById('sm2ProjectionBars');
      if (!container) return;

      var curStudyDay = getStudyDayIndex(Date.now());
      var dayCounts = [0, 0, 0, 0, 0, 0, 0];
      var dayLabels = ['今天', '明天', '后天', '第4天', '第5天', '第6天', '第7天'];

      if (CHAPTERS && CHAPTERS.length > 0) {
        CHAPTERS.forEach(function(ch) {
          var sm2Obj = readMergedSm2(ch);
          for (var idx in sm2Obj) {
            var item = sm2Obj[idx];
            if (item && item.nextReview) {
              var dueStudyDay = (item.lastStudyDay !== undefined && item.interval)
                ? (item.lastStudyDay + item.interval)
                : getStudyDayIndex(item.nextReview);
              var diffDays = dueStudyDay - curStudyDay;
              if (diffDays <= 0) {
                dayCounts[0]++;
              } else if (diffDays < 7) {
                dayCounts[diffDays]++;
              }
            }
          }
        });
      }

      var maxCount = Math.max(1, Math.max.apply(null, dayCounts));
      container.innerHTML = dayCounts.map(function(count, i) {
        var heightPercent = Math.max(8, Math.round((count / maxCount) * 100));
        return '<div class="sm2-proj-col">' +
          '<div class="sm2-proj-bar-wrapper">' +
            '<span class="sm2-proj-count">' + count + '</span>' +
            '<div class="sm2-proj-bar' + (i === 0 ? ' today' : '') + '" style="height:' + heightPercent + '%"></div>' +
          '</div>' +
          '<span class="sm2-proj-label">' + dayLabels[i] + '</span>' +
        '</div>';
      }).join('');
    }

    // 计算复习战绩指标（今日已复习、记忆保持率、连续打卡天数、高危待抢险题）
    function getSm2RetentionStats() {
      var curStudyDay = getStudyDayIndex(Date.now());
      var todayReviewedCount = 0;
      var last30DaysReviews = [];
      var activeStudyDays = {};
      var urgentOverdueCount = 0;

      reviewChapters().forEach(function(ch) {
        var merged = readMergedSm2(ch);
        for (var i = 0; i < ch.total; i++) {
          var rec = merged[i];
          if (!rec) continue;
          var overdueDays = getSm2OverdueDays(rec);
          if (overdueDays >= 3) urgentOverdueCount++;

          if (rec.history && Array.isArray(rec.history)) {
            rec.history.forEach(function(h) {
              if (h.date) {
                var hStudyDay = h.studyDay !== undefined ? h.studyDay : getStudyDayIndex(h.date);
                activeStudyDays[hStudyDay] = true;
                if (hStudyDay === curStudyDay) {
                  todayReviewedCount++;
                }
                if (curStudyDay - hStudyDay <= 30) {
                  last30DaysReviews.push(h.score);
                }
              }
            });
          }
        }
      });

      // 叠加 kaoyan_study_log
      try {
        var studyLog = JSON.parse(localStorage.getItem('kaoyan_study_log') || '{}');
        Object.keys(studyLog).forEach(function(dk) {
          var p = dk.split('-');
          if (p.length === 3) {
            var dIndex = getStudyDayIndex(new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2]), 12, 0, 0).getTime());
            activeStudyDays[dIndex] = true;
          }
        });
      } catch (e) {}

      // 计算连续打卡天数 (Streak)
      var streak = 0;
      var checkDay = curStudyDay;
      if (!activeStudyDays[checkDay]) checkDay = curStudyDay - 1;
      while (activeStudyDays[checkDay]) {
        streak++;
        checkDay--;
      }

      // 计算 30 天记忆保持率 (Score >= 3 占比)
      var retentionRate = 100;
      if (last30DaysReviews.length > 0) {
        var passCount = last30DaysReviews.filter(function(s) { return s >= 3; }).length;
        retentionRate = Math.round((passCount / last30DaysReviews.length) * 100);
      }

      return {
        todayReviewedCount: todayReviewedCount,
        retentionRate: retentionRate,
        streak: streak,
        urgentOverdueCount: urgentOverdueCount
      };
    }

    // ---- SM-2 复习面板 ----
    function sm2ChapterSummary(ch) {
      var due = 0, overdue = 0, queued = 0, mastered = 0;
      var merged = readMergedSm2(ch);
      for (var i = 0; i < ch.total; i++) {
        var rec = merged[i];
        if (!rec || !rec.nextReview) continue;
        var label = getSm2Label(rec);
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

    // 章节行 HTML
    function sm2ChapterRowHtml(ch, s) {
      var name = ch.short || ch.name;
      var statsStr = '';
      if (s.due) statsStr += '<span class="sm2-ch-due">到期 ' + s.due + '</span> ';
      if (s.overdue) statsStr += '<span class="sm2-ch-overdue">逾期 ' + s.overdue + '</span> ';
      if (s.queued) statsStr += '<span style="font-size:11px;color:#888">队列 ' + s.queued + '</span> ';
      if (s.mastered) statsStr += '<span style="font-size:11px;color:#F5A623">已掌握 ' + s.mastered + '</span> ';

      var dueCount = s.due + s.overdue;
      var hasAnyRecord = (s.queued + s.mastered) > 0;
      var btnText, btnDisabled = '';
      if (dueCount === 0 && hasAnyRecord) {
        btnText = '已完成';
        btnDisabled = ' disabled style="opacity:0.6;cursor:default"';
      } else if (dueCount > 0) {
        btnText = '继续复习';
      } else {
        btnText = '复习';
      }
      return '<div class="sm2-ch-row">' +
        '<div class="sm2-ch-info"><span class="sm2-ch-name">' + name + '</span><span class="sm2-ch-stats">' + statsStr + '</span></div>' +
        '<button class="sm2-ch-btn"' + btnDisabled + ' onclick="' + (btnDisabled ? '' : 'startReviewChapter(\'' + ch.id + '\')') + '">' + btnText + '</button>' +
        '</div>';
    }

    // 渲染复习主面板
    function renderSm2Panel() {
      var allDue = 0, allOverdue = 0, allQueued = 0, allMastered = 0;

      // 按模块分组
      var moduleMap = {};
      var subjOrder = curSubject ? curSubject.subjOrder : [];
      reviewChapters().forEach(function(ch) {
        var mod = canonicalSubj(ch.subj);
        (moduleMap[mod] = moduleMap[mod] || []).push(ch);
      });
      var moduleNames = [];
      subjOrder.forEach(function(s) { if (moduleMap[s]) moduleNames.push(s); });
      Object.keys(moduleMap).forEach(function(m) { if (moduleNames.indexOf(m) === -1) moduleNames.push(m); });

      var moduleHtmls = [];
      moduleNames.forEach(function(mod) {
        var modChs = moduleMap[mod];
        var bookMap = {};
        modChs.forEach(function(ch) { var wb = ch.wb || ''; (bookMap[wb] = bookMap[wb] || []).push(ch); });
        var bookNames = [];
        var wbOrder = curSubject ? curSubject.wbOrder : [];
        wbOrder.forEach(function(e) { if (e.wb !== '1000题' && bookMap[e.wb]) bookNames.push(e.wb); });
        Object.keys(bookMap).forEach(function(wb) { if (bookNames.indexOf(wb) === -1) bookNames.push(wb); });

        var rowsHtml = '';
        var modDue = 0, modOverdue = 0, modQueued = 0, modMastered = 0;
        bookNames.forEach(function(wb) {
          var bRows = [];
          bookMap[wb].forEach(function(ch) {
            var s = sm2ChapterSummary(ch);
            if (s.due + s.overdue + s.queued + s.mastered === 0) return;
            allDue += s.due; allOverdue += s.overdue; allQueued += s.queued; allMastered += s.mastered;
            modDue += s.due; modOverdue += s.overdue; modQueued += s.queued; modMastered += s.mastered;
            bRows.push({ ch: ch, summary: s });
          });
          if (bRows.length === 0) return;
          rowsHtml += '<div class="sm2-book-header" style="font-weight:700;color:var(--primary);margin:8px 0 4px;font-size:14px">' + getWbLabel(wb) + '</div>';
          bRows.forEach(function(row) { rowsHtml += sm2ChapterRowHtml(row.ch, row.summary); });
        });
        if (!rowsHtml) return;

        var modDueCount = modDue + modOverdue;
        var modHasRecord = (modQueued + modMastered) > 0;
        var modBtnDisabled = '', modBtnText = '复习此模块';
        if (modDueCount === 0 && modHasRecord) {
          modBtnText = '已完成';
          modBtnDisabled = ' disabled style="opacity:0.6;cursor:default"';
        }
        var header = '<div class="sm2-module-header">' +
          '<span class="sm2-module-name">' + mod + '</span>' +
          '<span class="sm2-mod-stats">' +
            (modDue ? '<span class="sm2-ch-due">到期 ' + modDue + '</span> ' : '') +
            (modOverdue ? '<span class="sm2-ch-overdue">逾期 ' + modOverdue + '</span> ' : '') +
          '</span>' +
          '<button class="sm2-mod-btn"' + modBtnDisabled + ' onclick="' + (modBtnDisabled ? '' : 'startReviewModule(\'' + mod + '\')') + '">' + modBtnText + '</button>' +
          '</div>';
        moduleHtmls.push({ header: header, rows: rowsHtml });
      });

      // 提取核心指标
      var stats = getSm2RetentionStats();

      // 更新顶部 6 大统计卡片
      var elDue = document.querySelector('#sm2CardDue .sm2-stat-num');
      if (elDue) elDue.textContent = allDue;
      var elOverdue = document.querySelector('#sm2CardOverdue .sm2-stat-num');
      if (elOverdue) elOverdue.textContent = allOverdue;
      var elTodayRev = document.querySelector('#sm2CardTodayReviewed .sm2-stat-num');
      if (elTodayRev) elTodayRev.textContent = stats.todayReviewedCount;
      var elRet = document.querySelector('#sm2CardRetention .sm2-stat-num');
      if (elRet) elRet.textContent = stats.retentionRate + '%';
      var elStreak = document.querySelector('#sm2CardStreak .sm2-stat-num');
      if (elStreak) elStreak.textContent = stats.streak + '天';
      var elMastered = document.querySelector('#sm2CardMastered .sm2-stat-num');
      if (elMastered) elMastered.textContent = allMastered;

      // 渲染未来 7 天到期负荷预测直方图
      renderSm2Projection();

      // 绑定策略卡片与批次容量事件
      setupSm2StrategyEvents();

      // 渲染章节列表
      var chHtml = '';
      var totalModuleCount = moduleNames.length;
      moduleHtmls.forEach(function(m) {
        if (totalModuleCount > 1) chHtml += m.header;
        chHtml += m.rows;
      });
      if (!chHtml) chHtml = '<div style="text-align:center;color:var(--text-muted);padding:20px">暂无 SM-2 复习数据。打标后自动生成。</div>';

      // 顶部续接按钮
      var pending = loadReviewSession();
      if (pending) {
        var ungraded = pending.queue.filter(function(it) { return it.status !== 'graded'; }).length;
        chHtml = '<button class="sm2-resume-btn" onclick="resumeReviewSession()">继续上次复习（剩余 ' + ungraded + ' 题）</button>' + chHtml;
      }
      document.getElementById('sm2Chapters').innerHTML = chHtml;

      // 更新「开始复习冲刺」主按钮状态与文本
      var startAllBtn = document.getElementById('btnSm2StartAll');
      if (startAllBtn) {
        var allDueCount = allDue + allOverdue;
        var batchLimit = getSm2BatchLimit();
        var limitDesc = (batchLimit > 0 && allDueCount > batchLimit) ? (batchLimit + ' 题') : '全部';
        if (allDueCount === 0 && (allQueued + allMastered) > 0) {
          startAllBtn.textContent = '今日到期已全部清空';
          startAllBtn.disabled = true;
          startAllBtn.style.opacity = '0.6';
          startAllBtn.style.cursor = 'default';
        } else {
          startAllBtn.textContent = '开始复习冲刺 (' + limitDesc + ' · 共 ' + allDueCount + ' 题待复习)';
          startAllBtn.disabled = false;
          startAllBtn.style.opacity = '';
          startAllBtn.style.cursor = '';
        }
      }
    }

    // 绑定策略卡片与冲刺容量点击事件
    function setupSm2StrategyEvents() {
      // 策略卡片
      document.querySelectorAll('.sm2-strategy-card').forEach(function(card) {
        card.onclick = function() {
          document.querySelectorAll('.sm2-strategy-card').forEach(function(c) { c.classList.remove('active'); });
          card.classList.add('active');
          var input = card.querySelector('input[type="radio"]');
          if (input) input.checked = true;
        };
      });

      // 容量 Pills
      document.querySelectorAll('.sm2-batch-btn').forEach(function(btn) {
        btn.onclick = function() {
          document.querySelectorAll('.sm2-batch-btn').forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');
          selectedSm2Batch = parseInt(btn.getAttribute('data-batch'), 10) || 0;
          // 刷新主按钮上的批次描述
          var startAllBtn = document.getElementById('btnSm2StartAll');
          if (startAllBtn && !startAllBtn.disabled) {
            var allDueCount = (parseInt(document.querySelector('#sm2CardDue .sm2-stat-num').textContent, 10) || 0) +
                              (parseInt(document.querySelector('#sm2CardOverdue .sm2-stat-num').textContent, 10) || 0);
            var limitDesc = (selectedSm2Batch > 0 && allDueCount > selectedSm2Batch) ? (selectedSm2Batch + ' 题') : '全部';
            startAllBtn.textContent = '开始复习冲刺 (' + limitDesc + ' · 共 ' + allDueCount + ' 题待复习)';
          }
        };
      });
    }

    // 面板内联提示
    var sm2ToastTimer = null;
    function showSm2Toast(msg) {
      var box = document.getElementById('sm2Chapters');
      if (!box) return;
      var toast = document.createElement('div');
      toast.className = 'sm2-toast';
      toast.textContent = msg;
      box.insertBefore(toast, box.firstChild);
      if (sm2ToastTimer) clearTimeout(sm2ToastTimer);
      sm2ToastTimer = setTimeout(function() {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 2200);
    }

    function startReviewModule(module) {
      var mode = getSm2Mode();
      var batchLimit = getSm2BatchLimit();
      var chs = reviewChapters().filter(function(c) { return canonicalSubj(c.subj) === module; });
      var queue = collectDueItems(chs, mode, batchLimit);
      if (queue.length === 0) { showSm2Toast('该模块没有到期题目'); return; }
      startReview(queue, mode);
    }

    function startReviewChapter(chapterId) {
      var ch = chapterById(chapterId);
      if (!ch) return;
      var mode = getSm2Mode();
      var batchLimit = getSm2BatchLimit();
      var queue = collectDueItems([ch], mode, batchLimit);
      if (queue.length === 0) { showSm2Toast(mode === 'overdue' ? '该章节没有逾期题目' : '该章节没有到期题目'); return; }
      startReview(queue, mode);
    }

    var _startAllReview = function() {
      var mode = getSm2Mode();
      var batchLimit = getSm2BatchLimit();
      var queue = collectDueItems(reviewChapters(), mode, batchLimit);
      if (queue.length === 0) { showSm2Toast('没有待复习的题目'); return; }
      startReview(queue, mode);
    };

    // ===== 复习会话续接（kaoyan_review_session）=====
    function saveReviewSession() {
      if (!reviewSession) return;
      var persist = {
        subjectId: curSubjectId,
        queue: reviewSession.queue.map(function(it) {
          return { chapterId: it.chapterId, idx: it.idx, status: it.status || 'pending', finalScore: it.finalScore };
        }),
        currentIdx: reviewSession.currentIdx,
        mode: reviewSession.mode,
        originChapter: reviewSession.originChapter,
        originIdx: reviewSession.originIdx,
        done: !!reviewSession.done,
        startTime: reviewSession.startTime || Date.now(),
        savedAt: Date.now()
      };
      try { localStorage.setItem('kaoyan_review_session', JSON.stringify(persist)); } catch (e) {}
    }

    function loadReviewSession() {
      var raw = null;
      try { raw = JSON.parse(localStorage.getItem('kaoyan_review_session')) || null; } catch (e) { raw = null; }
      if (!raw || !Array.isArray(raw.queue) || raw.queue.length === 0) return null;
      if (raw.subjectId && raw.subjectId !== curSubjectId) return null;
      return raw;
    }

    function clearReviewSession() {
      try { localStorage.removeItem('kaoyan_review_session'); } catch (e) {}
    }

    function startReview(queue, mode) {
      reviewSession = {
        queue: queue,
        currentIdx: 0,
        mode: mode,
        originChapter: currentChapterId,
        originIdx: current,
        startTime: Date.now()
      };
      saveReviewSession();
      closeSm2Panel();

      // 进入复习 UI
      document.getElementById('statsBlock').style.display = 'none';
      document.getElementById('reviewQueuePanel').style.display = '';
      document.getElementById('reviewControls').style.display = '';

      var first = queue[0];
      switchChapter(first.chapterId);
      switchTo(first.idx);

      renderReviewQueue();
      renderReviewProgress();
    }

    function resumeReviewSession() {
      var persist = loadReviewSession();
      if (!persist) { showSm2Toast('没有待续接的复习'); return; }
      var anyInCurrent = persist.queue.some(function(it) { return chapterById(it.chapterId); });
      if (!anyInCurrent) { clearReviewSession(); showSm2Toast('上次复习的科目已切换，无法续接'); return; }

      var queue = persist.queue.map(function(it) {
        var ch = chapterById(it.chapterId);
        var rec = null;
        if (ch) {
          var merged = readMergedSm2(ch);
          rec = merged[it.idx] || null;
        }
        return { chapterId: it.chapterId, idx: it.idx, record: rec, status: it.status || 'pending', finalScore: it.finalScore };
      });
      reviewSession = {
        queue: queue,
        currentIdx: Math.min(Math.max(0, persist.currentIdx || 0), queue.length - 1),
        mode: persist.mode || 'smart',
        originChapter: persist.originChapter,
        originIdx: persist.originIdx,
        done: !!persist.done,
        startTime: persist.startTime || Date.now()
      };
      closeSm2Panel();
      document.getElementById('statsBlock').style.display = 'none';
      document.getElementById('reviewQueuePanel').style.display = '';
      document.getElementById('reviewControls').style.display = '';

      var item = reviewCurrentItem();
      if (item) {
        switchChapter(item.chapterId);
        switchTo(item.idx);
      } else {
        switchChapter(persist.queue[persist.queue.length - 1].chapterId);
        switchTo(persist.queue[persist.queue.length - 1].idx);
      }
      renderReviewQueue();
      renderReviewProgress();
      saveReviewSession();
    }

    function reviewCurrentItem() {
      if (!reviewSession) return null;
      var q = reviewSession.queue;
      if (reviewSession.currentIdx < 0 || reviewSession.currentIdx >= q.length) return null;
      return q[reviewSession.currentIdx];
    }

    function renderReviewProgress() {
      if (!reviewSession) return;
      var total = reviewSession.queue.length;
      var cur = reviewSession.currentIdx + 1;
      var panelTitle = document.getElementById('panelTitle');
      if (panelTitle) {
        var modeLabel = { smart: '智能', overdue: '抢险', random: '随机', sequential: '顺序' }[reviewSession.mode] || '';
        if (reviewSession.done) {
          var ungraded = reviewSession.queue.filter(function(it) { return it.status !== 'graded'; }).length;
          panelTitle.textContent = '还有 ' + ungraded + ' 题未评级';
        } else {
          panelTitle.textContent = '冲刺复习 ' + cur + '/' + total + ' · ' + modeLabel;
        }
        panelTitle.style.display = '';
        document.querySelectorAll('#chapterTitleBar .title-dropdown .title-arrow').forEach(function(a) { a.style.display = 'none'; });
      }
    }

    function renderReviewQueue() {
      var panel = document.getElementById('reviewQueue');
      if (!panel) return;
      if (!reviewSession) { panel.innerHTML = ''; return; }
      var queue = reviewSession.queue;
      panel.innerHTML = '';
      queue.forEach(function(item, i) {
        var btn = document.createElement('button');
        btn.className = 'review-q';
        btn.textContent = i + 1;
        btn.title = '第 ' + (i + 1) + ' 个复习题';
        if (reviewSession.done) {
          if (i === reviewSession.currentIdx) btn.classList.add('current');
        } else if (i === reviewSession.currentIdx) {
          btn.classList.add('current');
        }
        if (item.status === 'graded') btn.classList.add('graded');
        else if (item.status === 'skipped') btn.classList.add('skipped');
        btn.addEventListener('click', function() { reviewJump(i); });
        panel.appendChild(btn);
      });
      var header = document.getElementById('reviewQueueHeader');
      if (header) {
        if (reviewSession.done) {
          var ungraded = queue.filter(function(it) { return it.status !== 'graded'; }).length;
          header.textContent = '还有 ' + ungraded + ' 题未评级';
        } else {
          header.textContent = '本次冲刺 ' + queue.length + ' 题';
        }
      }
    }

    // 复习导航：前进/后退/跳题
    function reviewAdvance(delta) {
      if (!reviewSession) return;
      if (delta < 0) {
        reviewSession.currentIdx = Math.max(0, reviewSession.currentIdx - 1);
        reviewSession.done = false;
      } else {
        var q = reviewSession.queue;
        var idx = reviewSession.currentIdx + 1;
        while (idx < q.length && q[idx].status === 'graded') idx++;
        if (idx >= q.length) {
          var ungraded = q.filter(function(it) { return it.status !== 'graded'; }).length;
          if (ungraded === 0) {
            finishReviewSession();
            return;
          }
          reviewSession.done = true;
          reviewSession.currentIdx = q.length;
          renderReviewQueue();
          renderReviewProgress();
          saveReviewSession();
          return;
        }
        reviewSession.currentIdx = idx;
      }
      var item = reviewSession.queue[reviewSession.currentIdx];
      switchChapter(item.chapterId);
      switchTo(item.idx);
      renderReviewQueue();
      renderReviewProgress();
      saveReviewSession();
    }

    function reviewPrev() { reviewAdvance(-1); }
    function reviewNext() { reviewAdvance(1); }

    function reviewJump(i) {
      if (!reviewSession) return;
      if (i < 0 || i >= reviewSession.queue.length) return;
      reviewSession.currentIdx = i;
      reviewSession.done = false;
      var item = reviewSession.queue[i];
      switchChapter(item.chapterId);
      switchTo(item.idx);
      renderReviewQueue();
      renderReviewProgress();
      saveReviewSession();
    }

    function reviewSkip() {
      if (!reviewSession) return;
      var item = reviewCurrentItem();
      if (!item) return;
      item.status = 'skipped';
      renderReviewQueue();
      reviewAdvance(1);
    }

    // 统一提交复习结果
    function commitReviewResults() {
      if (!reviewSession) return;
      var groups = {};
      reviewSession.queue.forEach(function(item) {
        if (item.finalScore == null) return;
        (groups[item.chapterId] = groups[item.chapterId] || []).push(item);
      });
      Object.keys(groups).forEach(function(cid) {
        var ch = chapterById(cid);
        if (!ch) return;
        var merged = readMergedSm2(ch);
        groups[cid].forEach(function(item) {
          merged[item.idx] = calcSM2Plus(merged[item.idx], item.finalScore);
        });
        writeMergedSm2(ch, merged);
      });
      loadSm2();
    }

    // 复习全部完成，提交数据并展示结算战报弹窗
    function finishReviewSession() {
      if (!reviewSession) return;
      var sessionCopy = {
        queue: reviewSession.queue.slice(),
        startTime: reviewSession.startTime || Date.now(),
        mode: reviewSession.mode
      };
      commitReviewResults();
      clearReviewSession();

      var originCh = reviewSession.originChapter;
      var originIdx = reviewSession.originIdx;
      reviewSession = null;

      // 恢复复习 UI 控件
      document.getElementById('statsBlock').style.display = '';
      document.getElementById('reviewQueuePanel').style.display = 'none';
      document.getElementById('reviewControls').style.display = 'none';
      document.getElementById('sm2InfoBar').style.display = 'none';
      setPanelTitle('');
      document.querySelectorAll('#chapterTitleBar .title-dropdown .title-arrow').forEach(function(a) { a.style.display = ''; });

      // 展示完成战报弹窗
      showReviewSummaryModal(sessionCopy, originCh, originIdx);
    }

    // 渲染复习结算战报弹窗
    function showReviewSummaryModal(sessionData, originCh, originIdx) {
      var modal = document.getElementById('reviewSummaryOverlay');
      if (!modal) {
        restoreReviewOrigin(originCh, originIdx);
        return;
      }

      var queue = sessionData.queue || [];
      var scores = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      var gradedCount = 0;
      queue.forEach(function(item) {
        if (item.finalScore) {
          scores[item.finalScore] = (scores[item.finalScore] || 0) + 1;
          gradedCount++;
        }
      });

      var passCount = (scores[5] || 0) + (scores[4] || 0) + (scores[3] || 0);
      var retentionPct = gradedCount > 0 ? Math.round((passCount / gradedCount) * 100) : 100;
      var durationMs = Date.now() - (sessionData.startTime || Date.now());
      var durationMins = Math.max(1, Math.round(durationMs / 60000));

      document.getElementById('summaryTotalCount').textContent = queue.length;
      document.getElementById('summaryRetentionPct').textContent = retentionPct + '%';
      document.getElementById('summaryDurationText').textContent = durationMins + ' 分钟';

      document.getElementById('bpProf').textContent = scores[5] || 0;
      document.getElementById('bpFam').textContent = scores[4] || 0;
      document.getElementById('bpVag').textContent = scores[3] || 0;
      document.getElementById('bpRus').textContent = scores[2] || 0;
      document.getElementById('bpWrg').textContent = scores[1] || 0;

      modal.style.display = 'flex';

      var btnExit = document.getElementById('btnSummaryExit');
      var btnNext = document.getElementById('btnSummaryNext');

      function cleanupModal() {
        modal.style.display = 'none';
        if (btnExit) btnExit.removeEventListener('click', onExit);
        if (btnNext) btnNext.removeEventListener('click', onNext);
      }

      function onExit() {
        cleanupModal();
        restoreReviewOrigin(originCh, originIdx);
      }

      function onNext() {
        cleanupModal();
        _startAllReview();
      }

      if (btnExit) btnExit.addEventListener('click', onExit);
      if (btnNext) btnNext.addEventListener('click', onNext);
    }

    function restoreReviewOrigin(originCh, originIdx) {
      if (originCh && originCh !== currentChapterId) {
        switchChapter(originCh);
        current = originIdx;
        switchTo(current);
      } else {
        if (originIdx !== undefined && originIdx !== null && originCh) {
          current = originIdx;
          switchTo(current);
        } else {
          renderTitle();
        }
      }
    }

    function exitReviewSession() {
      if (!reviewSession) {
        document.getElementById('statsBlock').style.display = '';
        document.getElementById('reviewQueuePanel').style.display = 'none';
        document.getElementById('reviewControls').style.display = 'none';
        return;
      }
      commitReviewResults();
      clearReviewSession();
      var originCh = reviewSession.originChapter;
      var originIdx = reviewSession.originIdx;
      reviewSession = null;

      document.getElementById('statsBlock').style.display = '';
      document.getElementById('reviewQueuePanel').style.display = 'none';
      document.getElementById('reviewControls').style.display = 'none';
      document.getElementById('sm2InfoBar').style.display = 'none';
      setPanelTitle('');
      document.querySelectorAll('#chapterTitleBar .title-dropdown .title-arrow').forEach(function(a) { a.style.display = ''; });

      restoreReviewOrigin(originCh, originIdx);
    }

    // 安装全局开始按钮 + 复习控件
    document.addEventListener('DOMContentLoaded', function() {
      var btn = document.getElementById('btnSm2StartAll');
      if (btn) btn.addEventListener('click', function() { _startAllReview(); });
      var bPrev = document.getElementById('btnReviewPrev');
      if (bPrev) bPrev.addEventListener('click', function() { reviewPrev(); });
      var bSkip = document.getElementById('btnReviewSkip');
      if (bSkip) bSkip.addEventListener('click', function() { reviewSkip(); });
      var bNext = document.getElementById('btnReviewNext');
      if (bNext) bNext.addEventListener('click', function() { reviewNext(); });
    });
    document.addEventListener('keydown', function (e) {
      // 标注模式下吃掉全部按键（Snipaste 式：避免切题/改状态等全局快捷键误触发）。
      // 需在 INPUT 判断之前：标注工具栏含 range 输入（粗细滑块），焦点在其上时 Alt 退出仍须生效。
      if (lbAnnotMode) { handleAnnotKeydown(e); return; }
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const key = e.key.toLowerCase();
      const isShift = e.shiftKey;

      // 英语科目处于激活态时，由 english_app.js 接管做题按键，主系统放行系统级按键（G / Esc / Y / U）
      if (curSubjectId === 'english') {
        if (key === 'g') {
          if (subjectPickerOpen) closeSubjectPicker();
          else openSubjectPicker();
        } else if (key === 'escape' && subjectPickerOpen) {
          closeSubjectPicker();
        } else if (key === 'y') {
          toggleTheme();
        } else if (key === 'u') {
          toggleImageDarkFilter();
        }
        return;
      }

      // 系统全局控制键（Y 主题切换 / U 试卷暗化 / G 科目切换 / H 快捷键帮助 / Esc 关闭）：
      // 具备最高全局优先级，在任何面板（全局进度 V / 错题本 B / 间隔复习 M / 科目选择 G）打开时均可随时响应！
      // 题目级操作键（A/D/W/S/Z/X/C 等）在面板打开时予以拦截，避免在面板下静默操作隐藏题目。
      if (subjectPickerOpen) {
        // 科目选择弹窗：放行 G（切换）、Esc（关闭）、Y（主题）、U（暗化）
        if (key !== 'g' && key !== 'escape' && key !== 'y' && key !== 'u') return;
      } else if (relatedModalOpen) {
        // 同类题做题工作台内部快捷键接管：
        // A/Left 上一题，D/Right 下一题，W/Up 上排，S/Down 下排，Space 切换解析，Enter 关联/移出，L/Esc 关闭
        if (key === 'a' || key === 'arrowleft') {
          e.preventDefault();
          modalPickerPrevQ();
          return;
        }
        if (key === 'd' || key === 'arrowright') {
          e.preventDefault();
          modalPickerNextQ();
          return;
        }
        if (key === 'w' || key === 'arrowup') {
          e.preventDefault();
          modalPickerUpQ();
          return;
        }
        if (key === 's' || key === 'arrowdown') {
          e.preventDefault();
          modalPickerDownQ();
          return;
        }
        if (key === ' ') {
          e.preventDefault();
          toggleModalPickerSol();
          return;
        }
        if (key === 'enter') {
          e.preventDefault();
          toggleModalPickerLinkCurrent();
          return;
        }
        if (key === 'l' || key === 'escape') {
          e.preventDefault();
          closeRelatedModal();
          return;
        }
        if (key !== 'y' && key !== 'u') return;
      } else if (dashboardOpen || wrongBookOpen || shortcutHelpOpen || sm2PanelOpen) {
        const panelKeys = ['h', 'escape', 'g', 'y', 'u'];
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

      // 非 Z/X/C 键按下时，打断待处理的组合超时（避免导航/面板等操作后意外改标记）
      if (key !== 'z' && key !== 'x' && key !== 'c') resetCombo();
      // 非 R/T 键按下时，打断待处理的 R+T 组合超时
      if (key !== 'r' && key !== 't') resetRtCombo();

      switch (key) {
        // 上一题 / 下一题（题组级 / 子题级，见 navPrev / navNext）
        case 'a': case 'arrowleft': navPrev(); break;
        case 'd': case 'arrowright': navNext(); break;
        // 小题选择模式
        case 'f': toggleSubMode(); break;
        // 上一行 / 下一行（视觉网格行导航）
        case 'w': case 'arrowup': navUp(); break;
        case 's': case 'arrowdown': navDown(); break;
        // 掌握度（组合键）
        case 'z': case 'x': case 'c': e.preventDefault(); handleStatusKey(key); break;
        // 解析
        case ' ': e.preventDefault(); toggleSolution(); break;
        // 章节切换（复习中 Q/E = 上一/下一复习题）
        case 'q': if (reviewSession) reviewPrev(); else gotoPrevChapter(); break;
        case 'e': if (reviewSession) reviewNext(); else gotoNextChapter(); break;
        // 图片质量与实书不符标记（R / T / R+T 组合键）
        case 'r': case 't': e.preventDefault(); handleBadKey(key); break;
        // 笔记与帮助
        case 'n': e.preventDefault(); focusNotes(); break;
        case 'h': toggleShortcutHelp(); break;
        // 全局进度 / 错题本 / 间隔重复
        case 'v': toggleDashboard(); break;
        case 'b': toggleWrongBook(); break;
        case 'm': toggleSm2Panel(); break;
        // 同类题关联面板
        case 'l': if (relatedModalOpen) closeRelatedModal(); else openRelatedModal(); break;
        // 切换科目与主题与试卷暗化与侧栏/符号盘折叠
        case 'i': toggleLeftSidebar(); break;
        case 'p': toggleMathSymbolPalette(); break;
        case 'g': openSubjectPicker(); break;
        case 'y': toggleTheme(); break;
        case 'u': toggleImageDarkFilter(); break;
        // 灯箱快捷键
        // Esc 关闭顺序：先关面板/灯箱/弹窗，再退复习——避免「复习中打开面板后按 Esc 直接退复习但面板残留」
        case 'escape':
          if (relatedModalOpen) { closeRelatedModal(); return; }
          if (sm2PanelOpen) { closeSm2Panel(); return; }
          if (document.getElementById('lightbox').classList.contains('show')) { closeLightbox(); return; }
          if (subjectPickerOpen) { closeSubjectPicker(); return; }
          if (shortcutHelpOpen) { toggleShortcutHelp(); return; }
          if (dashboardOpen) { toggleDashboard(); return; }
          if (wrongBookOpen) { toggleWrongBook(); return; }
          if (reviewSession) { exitReviewSession(); return; }
          break;
        case '=':
        case '+': if (document.getElementById('lightbox').classList.contains('show')) { lbScale = Math.min(lbScale * 1.2, 5); lbApplyTransform(); return; } break;
        case '-': if (document.getElementById('lightbox').classList.contains('show')) { lbScale = Math.max(lbScale / 1.2, 0.5); lbApplyTransform(); return; } break;
        case '0': if (document.getElementById('lightbox').classList.contains('show')) { lbScale = 1; lbTranslateX = 0; lbTranslateY = 0; lbApplyTransform(); return; } break;
      }
    });

    // ===== 横向滚轮切题（常规状态，效果同 A/D 键） =====
    // 方向锁定策略：手势前几个事件确定主导方向（横/纵），之后互斥屏蔽。
    // — 锁定为横向：累积 dx，超 30 立即切题并用 lock 防连切，小幅度即可触发
    // — 锁定为纵向：整段手势忽略（触控板上下滑绝不切题）
    // — 300ms 无新事件 → 手势结束，全部重置
    // 触控板 vs 鼠标滚轮方向解耦：单次 |dx|≥50 判为鼠标滚轮（右滚→下一题），
    // 否则判为触控板（右滑→上一题）。两者语义天然相反。
    let _wDir = null, _wAccum = 0, _wLocked = false, _wTimer = null, _wIsMouse = false;
    document.addEventListener('wheel', function (e) {
      if (lbAnnotMode) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (subjectPickerOpen || dashboardOpen || wrongBookOpen || shortcutHelpOpen || sm2PanelOpen) return;
      if (document.getElementById('lightbox').classList.contains('show')) return;

      const dx = e.deltaX || 0, dy = e.deltaY || 0;
      const absDX = Math.abs(dx), absDY = Math.abs(dy);

      // 重置计时器：每次新事件都推迟 reset
      if (_wTimer) clearTimeout(_wTimer);
      _wTimer = setTimeout(function () {
        _wDir = null; _wAccum = 0; _wLocked = false; _wTimer = null; _wIsMouse = false;
      }, 300);

      if (_wLocked) return;

      // 方向未确定：哪个方向明显主导即锁定；同时标记设备类型
      if (_wDir === null) {
        if (absDX > absDY * 1.5 && absDX > 4) {
          _wDir = 'h';
          _wIsMouse = absDX >= 50; // 单次大增量 = 鼠标滚轮
        }
        else if (absDY > absDX * 1.5 && absDY > 4) { _wDir = 'v'; }
        else return; // 方向不明确，继续观察
      }

      if (_wDir === 'v') return; // 纵向手势，整段忽略

      // 横向手势：累积 dx，达标即切
      _wAccum += dx;
      if (Math.abs(_wAccum) > 15) {
        if (_wIsMouse) {
          // 鼠标滚轮：右滚→下一题
          if (_wAccum > 0) navNext();
          else navPrev();
        } else {
          // 触控板：右滑→上一题
          if (_wAccum > 0) navPrev();
          else navNext();
        }
        _wLocked = true;
        _wAccum = 0;
      }
    }, { passive: false });

    // ===== 初始化 =====
    // 读取 URL 参数或上次选择的科目（默认数学），加载其章节数组
    var urlParams = new URLSearchParams(window.location.search);
    var urlSubj = urlParams.get('subj');
    var savedSubject = (urlSubj && SUBJECTS.some(function (s) { return s.id === urlSubj; })) ? urlSubj : localStorage.getItem('kaoyan_subject');
    curSubjectId = (savedSubject && SUBJECTS.some(function (s) { return s.id === savedSubject; })) ? savedSubject : 'shu1';
    window.curSubjectId = curSubjectId;
    
    if (curSubjectId === 'english' || curSubjectId === 'bishe') {
      curSubject = SUBJECTS.find(function (s) { return s.id === curSubjectId; });
      CHAPTERS = [];
      document.addEventListener('DOMContentLoaded', function () {
        switchSubject(curSubjectId);
      });
    } else {
      curSubject = SUBJECTS.find(function (s) { return s.id === curSubjectId; });
      CHAPTERS = curSubject.chapters;
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
      loadStatuses(); loadQBad(); loadSBad(); loadBookMismatch(); loadNotes(); loadSm2(); loadRelatedTopics();
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
    }
    // DOM 就绪后初始化主题、倒计时与事件绑定
    document.addEventListener('DOMContentLoaded', function () {
      applyTheme(localStorage.getItem('kaoyan_theme') || 'light');
      renderCountdown();
      initRelatedModal();

      var btnTheme = document.getElementById('btnToggleTheme');
      if (btnTheme) btnTheme.onclick = toggleTheme;
      var btnFilter = document.getElementById('btnDarkFilter');
      if (btnFilter) btnFilter.onclick = toggleImageDarkFilter;

      // 首次加载（无已选科目）弹出科目选择
      if (!savedSubject) openSubjectPicker();
    });

    // 暴露核心刷新与读取方法至 window，供本地同步模块与英语模块触发联动
    window.loadStatuses = loadStatuses;
    window.loadQBad = loadQBad;
    window.loadSBad = loadSBad;
    window.loadBookMismatch = loadBookMismatch;
    window.loadNotes = loadNotes;
    window.loadAnnotations = loadAnnotations;
    window.loadSm2 = loadSm2;
    window.loadRelatedTopics = loadRelatedTopics;
    window.renderRelatedQuestions = renderRelatedQuestions;
    window.openRelatedModal = openRelatedModal;
    window.closeRelatedModal = closeRelatedModal;
    window.jumpToQid = jumpToQid;
    window.loadGlobalFilters = loadGlobalFilters;
    window.loadSolutionPref = loadSolutionPref;
    window.renderStats = renderStats;
    window.renderNav = renderNav;
    window.renderNotes = renderNotes;
    window.updateFilterCounts = updateFilterCounts;
    window.renderSm2InfoBar = renderSm2InfoBar;
    window.renderCountdown = renderCountdown;
    window.toggleTheme = toggleTheme;
    window.applyTheme = applyTheme;
    window.toggleImageDarkFilter = toggleImageDarkFilter;
    window.switchTo = switchTo;
    window.switchChapter = switchChapter;
    window.openSubjectPicker = openSubjectPicker;
    window.closeSubjectPicker = closeSubjectPicker;
  