/**
 * 考研英语 · 智能精读与题型分析系统 核心应用逻辑 (SPA 多年份可扩展模块)
 * 数据存储于：题库/英语/data_YYYY.js (注册至 window.ENGLISH_DATA['YYYY'])
 * 配色体系：清华紫品牌主色 (#660874) + 纯净模考与沉浸精读双轨引擎
 */

(function () {
  'use strict';

  // 全局状态
  const state = {
    currentYear: '2010',
    currentTextId: 'text1',
    currentQIndex: 21,
    mode: 'analysis', // 'analysis' (精读解析) | 'practice' (模考做题)
    typeFilter: 'all',
    showAllTranslation: false,
    showSolution: true,
    defaultShowSolution: true,
    practiceAnswers: {}, // { qIndex: { selected: 'A', submitted: true } }
    mastery: {},
    notes: {},
    initialized: false
  };

  // DOM 元素引用
  let dom = {};

  function initDom() {
    dom = {
      layout: document.getElementById('englishAppLayout'),
      ddYear: document.getElementById('engDdYear'),
      trigYear: document.getElementById('engTrigYear'),
      txtYear: document.getElementById('engTxtYear'),
      panelYear: document.getElementById('engPanelYear'),
      passagePane: document.getElementById('engPassagePane'),
      analysisPane: document.getElementById('engAnalysisPane'),
      textTabs: document.getElementById('engTextTabs'),
      typeFilterBar: document.getElementById('engTypeFilterBar'),
      questionPills: document.getElementById('engQuestionPills'),
      stemCard: document.getElementById('engStemCard'),
      optionsList: document.getElementById('engOptionsList'),
      reflectionCard: document.getElementById('engReflectionCard'),
      btnToggleSol: document.getElementById('engBtnToggleSol'),
      txtToggleSol: document.getElementById('engTxtToggleSol'),
      btnToggleTrans: document.getElementById('engBtnToggleTrans'),
      btnPracticeMode: document.getElementById('engBtnPracticeMode'),
      btnAnalysisMode: document.getElementById('engBtnAnalysisMode'),
      vocabPopover: document.getElementById('engVocabPopover'),
      btnVocabBook: document.getElementById('engBtnVocabBook'),
      modalVocabBook: document.getElementById('engModalVocabBook'),
      btnCloseVocabBook: document.getElementById('btnCloseVocabBook'),
      btnThemeToggle: document.getElementById('engBtnThemeToggle'),
      modalHelp: document.getElementById('engModalHelp'),
      btnHelp: document.getElementById('engBtnHelp'),
      btnCloseHelp: document.getElementById('engBtnCloseHelp')
    };
  }

  // ===== 真人原声与神经网络双轨发音引擎 =====
  function playWordPronunciation(word, type = 1) {
    if (!word) return;
    const cleanWord = word.trim().toLowerCase();
    
    // 优先调用有道高保真真人发音录音 (1: 英音, 2: 美音)
    const audioUrl = `https://dict.youdao.com/dictvoice?type=${type}&audio=${encodeURIComponent(cleanWord)}`;
    const audio = new Audio(audioUrl);
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // 离线/网络失败时，无缝降级为浏览器原生 Web Speech API (Edge 神经网络自然人声)
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(cleanWord);
          utterance.lang = type === 1 ? 'en-GB' : 'en-US';
          utterance.rate = 0.9;
          window.speechSynthesis.speak(utterance);
        }
      });
    }
  }

  // ===== 生词本管理 =====
  let starredWords = {};
  let vocabBlurMode = true;

  function loadStarredWords() {
    try {
      starredWords = JSON.parse(localStorage.getItem('ky_english_starred_words') || '{}');
    } catch (e) {
      starredWords = {};
    }
  }

  function saveStarredWords() {
    try {
      localStorage.setItem('ky_english_starred_words', JSON.stringify(starredWords));
      if (window.storageSync && typeof window.storageSync.scheduleSave === 'function') {
        window.storageSync.scheduleSave();
      }
    } catch (e) {}
  }

  function isWordStarred(word) {
    if (!word) return false;
    return !!starredWords[word.toLowerCase()];
  }

  function toggleStarWord(word, meta) {
    if (!word) return;
    const k = word.toLowerCase();
    if (starredWords[k]) {
      delete starredWords[k];
    } else {
      starredWords[k] = {
        word: word,
        ipa: meta.ipa || '',
        meaning: meta.meaning || '',
        year: meta.year || state.currentYear,
        textId: meta.textId || state.currentTextId,
        date: new Date().toLocaleDateString()
      };
    }
    saveStarredWords();
    renderVocabNotebook();
  }

  function openVocabNotebook() {
    loadStarredWords();
    renderVocabNotebook();
    const modal = document.getElementById('engModalVocabBook');
    if (modal) modal.classList.add('show');
  }

  function closeVocabNotebook() {
    const modal = document.getElementById('engModalVocabBook');
    if (modal) modal.classList.remove('show');
  }

  function renderVocabNotebook() {
    const grid = document.getElementById('vocabGrid');
    const badge = document.getElementById('vocabTotalBadge');
    if (!grid) return;

    const list = Object.values(starredWords);
    if (badge) badge.textContent = `(共 ${list.length} 词)`;

    if (list.length === 0) {
      grid.innerHTML = `
        <div class="vocab-empty" style="grid-column: 1 / -1; padding: 40px 20px; text-align: center;">
          <div style="font-size:15px;color:var(--text);font-weight:700;">生词本暂无记录</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:6px;">在精读文章中悬浮或点击任意标红/标绿重点词汇，点击“收藏”即可集中复习自测</div>
        </div>
      `;
      return;
    }

    grid.innerHTML = list.map(item => `
      <div class="vocab-card">
        <div class="vocab-card-head">
          <div>
            <span class="vocab-word-text">${escapeHtml(item.word)}</span>
            <span class="vocab-word-phonetic">[${escapeHtml(item.ipa)}]</span>
          </div>
          <div style="display:flex;gap:4px;">
            <button class="popover-btn" title="英音发音" onclick="window.kyApp.playWordPronunciation('${escapeHtml(item.word)}', 1)">英音</button>
            <button class="popover-btn" title="美音发音" onclick="window.kyApp.playWordPronunciation('${escapeHtml(item.word)}', 2)">美音</button>
          </div>
        </div>
        <div class="vocab-word-trans ${vocabBlurMode ? 'blur-mode' : ''}" title="点击显隐释义" onclick="this.classList.toggle('blur-mode')">
          ${escapeHtml(item.meaning)}
        </div>
        <div class="vocab-card-meta">
          <span>${item.year} 年真题 · ${item.textId || ''}</span>
          <button class="vocab-unstar-btn" onclick="window.kyApp.toggleStarWord('${escapeHtml(item.word)}', {})">移除</button>
        </div>
      </div>
    `).join('');
  }

  function exportStarredWords() {
    const list = Object.values(starredWords);
    if (list.length === 0) {
      alert('生词本为空，无需导出');
      return;
    }
    let md = `# 考研英语真题生词本 (共 ${list.length} 词)\n\n| 单词 | 音标 | 考研释义 | 真题出处 |\n| :--- | :--- | :--- | :--- |\n`;
    list.forEach(w => {
      md += `| **${w.word}** | [${w.ipa}] | ${w.meaning.replace(/\|/g, '/')} | ${w.year} ${w.textId || ''} |\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `考研英语真题生词本_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // 所有真题年份清单 (1998 ~ 2026)
  const ALL_ENGLISH_YEARS = Array.from({ length: 29 }, (_, i) => String(1998 + i));
  const loadingYears = new Map();

  // 动态异步按需加载指定年份的真题数据 (支持 local file:// 与 http://)
  function loadYearDataAsync(year) {
    if (window.ENGLISH_DATA && window.ENGLISH_DATA[year]) {
      return Promise.resolve(window.ENGLISH_DATA[year]);
    }
    if (loadingYears.has(year)) {
      return loadingYears.get(year);
    }
    const p = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `题库/英语/data_${year}.js`;
      script.onload = () => {
        loadingYears.delete(year);
        resolve(window.ENGLISH_DATA && window.ENGLISH_DATA[year]);
      };
      script.onerror = (e) => {
        loadingYears.delete(year);
        reject(new Error(`加载 ${year} 年真题失败`));
      };
      document.head.appendChild(script);
    });
    loadingYears.set(year, p);
    return p;
  }

  // 获取所有支持的真题年份
  function getAvailableYears() {
    return ALL_ENGLISH_YEARS;
  }

  // 获取当前选定年份的数据集
  function getCurrentDataset() {
    if (!window.ENGLISH_DATA) return { texts: [] };
    if (window.ENGLISH_DATA[state.currentYear]) {
      return window.ENGLISH_DATA[state.currentYear];
    }
    const years = Object.keys(window.ENGLISH_DATA);
    if (years.length > 0) {
      state.currentYear = years[0];
      return window.ENGLISH_DATA[years[0]];
    }
    return { texts: [] };
  }

  // 获取当前 Text 与 Question 数据
  function getCurrentText() {
    const dataset = getCurrentDataset();
    if (!dataset.texts || dataset.texts.length === 0) return null;
    return dataset.texts.find(t => t.id === state.currentTextId) || dataset.texts[0];
  }

  function getCurrentQuestion() {
    const text = getCurrentText();
    if (!text || !text.questions || text.questions.length === 0) return null;
    return text.questions.find(q => q.qIndex === state.currentQIndex) || text.questions[0];
  }

  // 状态记忆与恢复 (年份 + 章节 + 题目 + 模式 + 筛选 + 译文显示)
  function saveResume() {
    const data = {
      year: state.currentYear,
      textId: state.currentTextId,
      qIndex: state.currentQIndex,
      mode: state.mode,
      typeFilter: state.typeFilter,
      showAllTranslation: !!state.showAllTranslation
    };
    function notifyStorageSync() {
      if (window.storageSync && typeof window.storageSync.scheduleSave === 'function') {
        window.storageSync.scheduleSave();
      }
    }

    try {
      localStorage.setItem('kaoyan_resume_english', JSON.stringify(data));
      localStorage.setItem('ky_english_mode', state.mode);
      // 按年份独立记忆上次停的 Text + 题目（切年份时恢复，而不是每次都回到第1篇第1题）
      const yearKey = `kaoyan_resume_english_y${state.currentYear}`;
      localStorage.setItem(yearKey, JSON.stringify({ textId: state.currentTextId, qIndex: state.currentQIndex }));
      let map = {};
      try { map = JSON.parse(localStorage.getItem('kaoyan_resume')) || {}; } catch (e) { map = {}; }
      map['english'] = { ch: state.currentTextId, idx: state.currentQIndex, year: state.currentYear, mode: state.mode };
      localStorage.setItem('kaoyan_resume', JSON.stringify(map));
      notifyStorageSync();
    } catch (e) {}
  }

  function loadResume() {
    try {
      const saved = JSON.parse(localStorage.getItem('kaoyan_resume_english'));
      if (saved) {
        if (saved.year && window.ENGLISH_DATA && window.ENGLISH_DATA[saved.year]) {
          state.currentYear = saved.year;
        }
        const dataset = getCurrentDataset();
        if (dataset.texts && dataset.texts.length > 0) {
          const text = dataset.texts.find(t => t.id === saved.textId);
          if (text) {
            state.currentTextId = text.id;
            if (text.questions && text.questions.some(q => q.qIndex === saved.qIndex)) {
              state.currentQIndex = saved.qIndex;
            } else if (text.questions && text.questions.length > 0) {
              state.currentQIndex = text.questions[0].qIndex;
            }
          }
        }
        if (saved.mode && (saved.mode === 'analysis' || saved.mode === 'practice')) {
          state.mode = saved.mode;
        }
        if (saved.typeFilter) state.typeFilter = saved.typeFilter;
        if (typeof saved.showAllTranslation === 'boolean') state.showAllTranslation = saved.showAllTranslation;
      } else {
        const savedMode = localStorage.getItem('ky_english_mode');
        if (savedMode && (savedMode === 'analysis' || savedMode === 'practice')) {
          state.mode = savedMode;
        }
      }
    } catch (e) {}
  }

  // 解析显示偏好存储与读取 (按科目独立记忆)
  function loadSolutionPref() {
    try {
      const v = JSON.parse(localStorage.getItem('english_ui_solution'));
      if (v && typeof v.def === 'boolean') state.defaultShowSolution = v.def;
      else state.defaultShowSolution = true;
      if (v && typeof v.show === 'boolean') state.showSolution = v.show;
      else state.showSolution = state.defaultShowSolution;
    } catch (e) {
      state.defaultShowSolution = true;
      state.showSolution = true;
    }
  }

  function saveSolutionPref() {
    try {
      localStorage.setItem('english_ui_solution', JSON.stringify({
        show: !!state.showSolution,
        def: !!state.defaultShowSolution
      }));
      notifyStorageSync();
    } catch (e) {}
  }

  function toggleSolution() {
    state.showSolution = !state.showSolution;
    saveSolutionPref();
    updateSolutionUI();
  }

  function toggleDefaultSolution() {
    state.defaultShowSolution = !state.defaultShowSolution;
    state.showSolution = state.defaultShowSolution;
    saveSolutionPref();
    updateSolutionUI();
  }

  function updateSolutionUI() {
    if (dom.txtToggleSol) {
      dom.txtToggleSol.textContent = state.showSolution ? '💡 解析: 显示' : '💡 解析: 隐藏';
    }
    if (dom.btnToggleSol) {
      dom.btnToggleSol.classList.toggle('active', state.showSolution);
      dom.btnToggleSol.title = `快捷键: Space (单题) / Shift+Space (默认: ${state.defaultShowSolution ? '显示' : '隐藏'})`;
    }
    renderQuestion();
    if (state.mode === 'analysis') {
      if (state.showSolution) {
        highlightCurrentQuestionGrounding();
      } else {
        document.querySelectorAll('.sentence-item').forEach(s => {
          s.classList.remove('highlight-target', 'highlight-distractor', 'highlight-topic', 'pulse-target');
        });
      }
    }
  }

  // 加载当前年份的掌握度与笔记
  function loadYearStorage() {
    try {
      state.mastery = JSON.parse(localStorage.getItem(`ky_english_mastery_${state.currentYear}`) || '{}');
      state.notes = JSON.parse(localStorage.getItem(`ky_english_notes_${state.currentYear}`) || '{}');
    } catch (e) {
      state.mastery = {};
      state.notes = {};
    }
  }


  // 渲染年份标题下拉面板（与数学题库 title-dropdown 风格一致）
  function renderYearSelector() {
    if (!dom.txtYear || !dom.panelYear) return;
    dom.txtYear.textContent = `${state.currentYear} 年真题`;

    const years = getAvailableYears();
    dom.panelYear.innerHTML = '';
    years.forEach(y => {
      const btn = document.createElement('button');
      btn.className = `title-option ${y === state.currentYear ? 'active' : ''}`;
      btn.textContent = `${y} 年真题`;
      btn.onclick = (e) => {
        e.stopPropagation();
        closeYearDropdown();
        switchYear(y);
      };
      dom.panelYear.appendChild(btn);
    });
  }

  function toggleYearDropdown() {
    if (!dom.trigYear || !dom.panelYear) return;
    const isOpen = dom.trigYear.classList.contains('open');
    if (isOpen) {
      closeYearDropdown();
    } else {
      openYearDropdown();
    }
  }

  function openYearDropdown() {
    if (dom.trigYear) dom.trigYear.classList.add('open');
    if (dom.panelYear) dom.panelYear.classList.add('open');
  }

  function closeYearDropdown() {
    if (dom.trigYear) dom.trigYear.classList.remove('open');
    if (dom.panelYear) dom.panelYear.classList.remove('open');
  }

  // 切换年份：恢复该年上次停的位置（无记录则从第1篇第1题开始）
  async function switchYear(year) {
    if (!window.ENGLISH_DATA || !window.ENGLISH_DATA[year]) {
      if (dom.passagePane) {
        dom.passagePane.innerHTML = `<div style="padding:48px 20px;color:#64748b;text-align:center;font-size:15px;font-weight:600;"><div style="font-size:28px;margin-bottom:12px;">⏳</div>正在加载 ${year} 年真题精读数据...</div>`;
      }
      try {
        await loadYearDataAsync(year);
      } catch (err) {
        if (dom.passagePane) {
          dom.passagePane.innerHTML = `<div style="padding:48px 20px;color:#dc2626;text-align:center;"><div style="font-size:28px;margin-bottom:12px;">⚠️</div>加载 ${year} 年真题失败，请检查题库文件是否存在</div>`;
        }
        return;
      }
    }
    state.currentYear = year;
    loadYearStorage();

    const dataset = getCurrentDataset();
    if (dataset.texts && dataset.texts.length > 0) {
      // 尝试恢复该年的上次阅读位置
      let restored = false;
      try {
        const yearKey = `kaoyan_resume_english_y${year}`;
        const saved = JSON.parse(localStorage.getItem(yearKey));
        if (saved) {
          const text = dataset.texts.find(t => t.id === saved.textId);
          if (text) {
            state.currentTextId = text.id;
            if (text.questions && text.questions.some(q => q.qIndex === saved.qIndex)) {
              state.currentQIndex = saved.qIndex;
            } else if (text.questions && text.questions.length > 0) {
              state.currentQIndex = text.questions[0].qIndex;
            }
            restored = true;
          }
        }
      } catch (e) {}
      // 无记录则默认落在第1篇第1题
      if (!restored) {
        state.currentTextId = dataset.texts[0].id;
        const firstQ = dataset.texts[0].questions;
        state.currentQIndex = firstQ && firstQ.length > 0 ? firstQ[0].qIndex : 1;
      }
    }
    state.showSolution = state.defaultShowSolution;

    saveResume();
    renderYearSelector();
    renderTextTabs();
    renderTypeFilter();
    renderPassage();
    renderQuestionPills();
    updateSolutionUI();
  }

  // 初始化应用
  async function init() {
    initDom();
    if (!dom.passagePane) return;
    if (state.initialized) return;
    state.initialized = true;

    loadResume();
    loadSolutionPref();

    // 动态异步载入初始年份数据
    if (!window.ENGLISH_DATA || !window.ENGLISH_DATA[state.currentYear]) {
      if (dom.passagePane) {
        dom.passagePane.innerHTML = `<div style="padding:48px 20px;color:#64748b;text-align:center;font-size:15px;font-weight:600;"><div style="font-size:28px;margin-bottom:12px;">⏳</div>正在加载 ${state.currentYear} 年真题精读数据...</div>`;
      }
      try {
        await loadYearDataAsync(state.currentYear);
      } catch (e) {}
    }

    loadYearStorage();

    renderYearSelector();
    renderTextTabs();
    renderTypeFilter();
    renderPassage();
    renderQuestionPills();
    updateSolutionUI();

    setupEventListeners();
    setupKeyboardShortcuts();
    updateModeClass();
  }

  async function activate() {
    initDom();
    if (!state.initialized) {
      await init();
    } else {
      loadResume();
      loadSolutionPref();
      if (!window.ENGLISH_DATA || !window.ENGLISH_DATA[state.currentYear]) {
        if (dom.passagePane) {
          dom.passagePane.innerHTML = `<div style="padding:48px 20px;color:#64748b;text-align:center;font-size:15px;font-weight:600;"><div style="font-size:28px;margin-bottom:12px;">⏳</div>正在加载 ${state.currentYear} 年真题精读数据...</div>`;
        }
        try {
          await loadYearDataAsync(state.currentYear);
        } catch (e) {}
      }
      loadYearStorage();
      renderYearSelector();
      renderTextTabs();
      renderTypeFilter();
      renderPassage();
      renderQuestionPills();
      updateSolutionUI();
      updateModeClass();
    }
  }
  function updateModeClass() {
    if (!dom.layout) return;
    if (state.mode === 'practice') {
      dom.layout.classList.add('mode-practice-active');
      if (dom.btnPracticeMode) dom.btnPracticeMode.classList.add('active');
      if (dom.btnAnalysisMode) dom.btnAnalysisMode.classList.remove('active');
      if (dom.btnToggleTrans) dom.btnToggleTrans.style.display = 'none';
      if (dom.btnToggleSol) dom.btnToggleSol.style.display = 'none';
    } else {
      dom.layout.classList.remove('mode-practice-active');
      if (dom.btnAnalysisMode) dom.btnAnalysisMode.classList.add('active');
      if (dom.btnPracticeMode) dom.btnPracticeMode.classList.remove('active');
      if (dom.btnToggleTrans) dom.btnToggleTrans.style.display = 'inline-flex';
      if (dom.btnToggleSol) dom.btnToggleSol.style.display = 'inline-flex';
    }
  }

  // 渲染 Text 切换标签
  function renderTextTabs() {
    if (!dom.textTabs) return;
    const dataset = getCurrentDataset();
    if (!dataset.texts) return;

    dom.textTabs.innerHTML = '';
    dataset.texts.forEach(t => {
      const btn = document.createElement('button');
      btn.className = `text-tab ${t.id === state.currentTextId ? 'active' : ''}`;
      btn.textContent = `Text ${t.number}`;
      btn.title = t.chineseTitle;
      btn.onclick = () => switchText(t.id);
      dom.textTabs.appendChild(btn);
    });
  }

  // 渲染题型筛选条
  function renderTypeFilter() {
    if (!dom.typeFilterBar) return;
    const types = ['all', '细节题', '推断题', '例证题', '主旨题', '态度题', '词义题'];
    dom.typeFilterBar.innerHTML = '';
    types.forEach(t => {
      const chip = document.createElement('button');
      chip.className = `filter-chip ${state.typeFilter === t ? 'active' : ''}`;
      chip.textContent = t === 'all' ? '全部题型' : t;
      chip.onclick = () => {
        state.typeFilter = t;
        renderTypeFilter();
        renderQuestionPills();
      };
      dom.typeFilterBar.appendChild(chip);
    });
  }

  // 切换 Text（篇章）
  function switchText(textId, targetQIndex = null) {
    state.currentTextId = textId;
    const text = getCurrentText();
    if (!text) return;
    
    const dataset = getCurrentDataset();
    if (dom.textTabs && dataset.texts) {
      dom.textTabs.querySelectorAll('.text-tab').forEach((tab, i) => {
        tab.classList.toggle('active', dataset.texts[i] && dataset.texts[i].id === textId);
      });
    }

    if (targetQIndex && text.questions.some(q => q.qIndex === targetQIndex)) {
      state.currentQIndex = targetQIndex;
    } else if (text.questions && text.questions.length > 0) {
      state.currentQIndex = text.questions[0].qIndex;
    }

    saveResume(); // 切换篇章后保存位置（恢复时可精确到篇章+题目）
    renderPassage();
    renderQuestionPills();
    renderQuestion();
  }

  // 渲染左侧文章
  function renderPassage() {
    if (!dom.passagePane) return;
    const text = getCurrentText();
    if (!text) {
      dom.passagePane.innerHTML = '<div style="padding:20px;color:#94a3b8;text-align:center;">暂无文章数据</div>';
      return;
    }

    let html = `
      <div class="passage-header-box">
        <span class="passage-topic-tag">${escapeHtml(text.topic)}</span>
        <h2 class="passage-title-en">Text ${text.number}: ${escapeHtml(text.title)}</h2>
        <div class="passage-title-zh">${escapeHtml(text.chineseTitle)}</div>
        <div class="passage-overview-card">
          <strong>【文章主旨精要】</strong> ${escapeHtml(text.overview)}
        </div>
      </div>
    `;

    (text.paragraphs || []).forEach(p => {
      html += `
        <div class="paragraph-block" id="para-${p.pIndex}">
          <div class="paragraph-meta">
            <span class="paragraph-index-badge">Paragraph ${p.pIndex}</span>
            <span class="paragraph-logic-role">${escapeHtml(p.logicRole)}</span>
          </div>
          <div class="paragraph-main-idea">
            <strong>段落大意：</strong>${escapeHtml(p.mainIdea)}
          </div>
          <div class="sentence-list">
      `;

      (p.sentences || []).forEach(s => {
        let sentenceText = escapeHtml(s.text);

        if (s.vocab && s.vocab.length > 0) {
          s.vocab.forEach(v => {
            const regex = new RegExp(`\\b(${escapeRegExp(v.word)})\\b`, 'gi');
            sentenceText = sentenceText.replace(regex, (match) => {
              const lvl = v.level === 'purple' ? 'blue' : (v.level || 'green');
              return `<span class="vocab-word level-${lvl}" data-word="${escapeHtml(v.word)}" data-ipa="${escapeHtml(v.ipa || '')}" data-meaning="${escapeHtml(v.meaning || '')}">${match}</span>`;
            });
          });
        }

        html += `
          <div class="sentence-item ${s.isTopicSentence ? 'is-topic' : ''}" id="sentence-${s.id}" data-id="${s.id}">
            <span class="sentence-id-tag">[${s.id}]</span>
            <span class="sentence-text">${sentenceText} </span>
            <div class="sentence-trans">${escapeHtml(s.translation || '')}</div>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    });

    dom.passagePane.innerHTML = html;

    attachPassageEvents();
    if (state.mode === 'analysis') {
      highlightCurrentQuestionGrounding();
    }
  }

  // 渲染题目切换胶囊
  function renderQuestionPills() {
    if (!dom.questionPills) return;
    const text = getCurrentText();
    if (!text || !text.questions) return;
    dom.questionPills.innerHTML = '';

    text.questions.forEach(q => {
      if (state.mode === 'analysis' && state.typeFilter !== 'all' && q.type !== state.typeFilter) {
        return;
      }

      const pill = document.createElement('div');
      const masteryState = state.mastery[q.qIndex] || 'unmarked';
      pill.className = `q-pill ${q.qIndex === state.currentQIndex ? 'active' : ''} status-${masteryState}`;
      pill.innerHTML = `
        <span class="q-num">${q.qIndex}</span>
        <span class="q-state-dot"></span>
      `;
      pill.title = `第${q.qIndex}题 (${q.type})`;
      pill.onclick = () => switchQuestion(q.qIndex);
      dom.questionPills.appendChild(pill);
    });
  }

  // 切换题目 (跨篇章自动同步与位置保存)
  function switchQuestion(qIndex) {
    const dataset = getCurrentDataset();
    if (dataset.texts) {
      const parentText = dataset.texts.find(t => t.questions.some(q => q.qIndex === qIndex));
      if (parentText && parentText.id !== state.currentTextId) {
        switchText(parentText.id, qIndex);
        return;
      }
    }
    state.currentQIndex = qIndex;
    state.showSolution = state.defaultShowSolution;
    saveResume();

    renderQuestionPills();
    updateSolutionUI();
  }

  function navPrev() {
    const text = getCurrentText();
    const dataset = getCurrentDataset();
    if (!text || !dataset.texts) return;

    const curIdx = text.questions.findIndex(x => x.qIndex === state.currentQIndex);
    if (curIdx > 0) {
      switchQuestion(text.questions[curIdx - 1].qIndex);
    } else {
      const textIdx = dataset.texts.findIndex(t => t.id === state.currentTextId);
      if (textIdx > 0) {
        const prevText = dataset.texts[textIdx - 1];
        switchText(prevText.id, prevText.questions[prevText.questions.length - 1].qIndex);
      }
    }
  }

  function navNext() {
    const text = getCurrentText();
    const dataset = getCurrentDataset();
    if (!text || !dataset.texts) return;

    const curIdx = text.questions.findIndex(x => x.qIndex === state.currentQIndex);
    if (curIdx < text.questions.length - 1) {
      switchQuestion(text.questions[curIdx + 1].qIndex);
    } else {
      const textIdx = dataset.texts.findIndex(t => t.id === state.currentTextId);
      if (textIdx < dataset.texts.length - 1) {
        const nextText = dataset.texts[textIdx + 1];
        switchText(nextText.id, nextText.questions[0].qIndex);
      }
    }
  }

  // 渲染右侧题目工作台
  function renderQuestion() {
    const q = getCurrentQuestion();
    if (!q || !dom.stemCard) return;

    const isPractice = state.mode === 'practice';
    const pAns = state.practiceAnswers[q.qIndex] || {};
    const isSubmitted = !isPractice || pAns.submitted;
    const shouldShowSol = !isPractice ? state.showSolution : pAns.submitted;

    if (isPractice && !pAns.submitted) {
      dom.stemCard.innerHTML = `
        <div class="stem-text" style="font-size:16px;margin-bottom:0;">${q.qIndex}. ${escapeHtml(q.stem)}</div>
      `;
    } else {
      let keywordsHtml = '';
      if (shouldShowSol && q.stemKeywords && q.stemKeywords.length > 0) {
        keywordsHtml = `
          <div class="stem-keywords">
            <span style="font-size:11px;color:#94a3b8;font-weight:600;">定位关键词:</span>
            ${q.stemKeywords.map(k => `<span class="keyword-tag">#${escapeHtml(k)}</span>`).join('')}
          </div>
        `;
      }

      dom.stemCard.innerHTML = `
        <div class="stem-header">
          <span class="q-type-badge">${escapeHtml(q.type)}</span>
          <span class="tangchi-badge">${escapeHtml(q.tangchiModel || '唐迟解题模型')}</span>
        </div>
        <div class="stem-text">${q.qIndex}. ${escapeHtml(q.stem)}</div>
        ${keywordsHtml}
      `;
    }

    renderOptions(q, shouldShowSol);

    if (dom.reflectionCard) {
      if (isSubmitted) {
        dom.reflectionCard.style.display = 'block';
        renderReflection(q, shouldShowSol);
      } else {
        dom.reflectionCard.style.display = 'none';
      }
    }
  }

  // 渲染选项列表
  function renderOptions(q, shouldShowSol) {
    if (!dom.optionsList) return;
    dom.optionsList.innerHTML = '';
    const isPractice = state.mode === 'practice';
    const pAns = state.practiceAnswers[q.qIndex] || {};
    const isSubmitted = !isPractice || pAns.submitted;

    (q.options || []).forEach(opt => {
      const card = document.createElement('div');
      const isSelected = pAns.selected === opt.key;

      let cardClass = 'option-card';
      if (isSelected) cardClass += ' selected';
      if (shouldShowSol) {
        if (opt.isCorrect) cardClass += ' is-correct';
        else if (isSelected && !opt.isCorrect) cardClass += ' is-distractor';
      }

      card.className = cardClass;

      let analysisHtml = '';
      if (shouldShowSol) {
        const tagType = opt.isCorrect ? 'tag-correct' : 'tag-trap';
        const tagText = opt.isCorrect ? '【正确项 · 同义替换】' : `【干扰特征: ${opt.distractorType || '干扰项'}】`;
        
        let locateBtnHtml = '';
        if (opt.refSentences && opt.refSentences.length > 0) {
          locateBtnHtml = opt.refSentences.map(sid => `
            <button class="btn-locate-sentence" onclick="event.stopPropagation(); window.kyApp.locateSentence('${sid}', '${opt.isCorrect ? 'target' : 'distractor'}')">
              🎯 定位原文 ${sid}
            </button>
          `).join(' ');
        }

        analysisHtml = `
          <div class="option-analysis-box">
            <span class="distractor-tag ${tagType}">${escapeHtml(tagText)}</span>
            <span>${escapeHtml(opt.analysis || '')}</span>
            <div style="margin-top:6px;">${locateBtnHtml}</div>
          </div>
        `;
      }

      card.innerHTML = `
        <div class="option-main-row">
          <div class="option-key">${opt.key}</div>
          <div class="option-text">${escapeHtml(opt.text)}</div>
        </div>
        ${analysisHtml}
      `;

      card.onclick = () => onOptionClick(opt.key);
      dom.optionsList.appendChild(card);
    });

    if (isPractice && !pAns.submitted) {
      const submitBox = document.createElement('div');
      submitBox.style.marginTop = '12px';
      submitBox.innerHTML = `
        <button class="toggle-btn" style="width:100%;height:40px;justify-content:center;background:var(--primary);color:#fff;border:none;font-weight:700;font-size:14px;box-shadow:0 2px 8px rgba(102,8,116,0.3);" onclick="window.kyApp.submitPracticeAnswer()">
          提交本题答案 (Enter)
        </button>
      `;
      dom.optionsList.appendChild(submitBox);
    }
  }

  // 选项点击事件
  function onOptionClick(key) {
    const q = getCurrentQuestion();
    if (!q) return;

    const pAns = state.practiceAnswers[q.qIndex] || {};

    if (state.mode === 'practice' && !pAns.submitted) {
      if (!state.practiceAnswers[q.qIndex]) {
        state.practiceAnswers[q.qIndex] = {};
      }
      state.practiceAnswers[q.qIndex].selected = key;
      renderOptions(q, false);
    } else {
      const opt = q.options.find(o => o.key === key);
      if (opt && opt.refSentences && opt.refSentences.length > 0) {
        locateSentence(opt.refSentences[0], opt.isCorrect ? 'target' : 'distractor');
      } else if (q.targetSentences && q.targetSentences.length > 0) {
        locateSentence(q.targetSentences[0], 'target');
      }
    }
  }

  // 提交做题答案
  function submitPracticeAnswer() {
    const q = getCurrentQuestion();
    if (!q) return;
    const pAns = state.practiceAnswers[q.qIndex];
    if (!pAns || !pAns.selected) {
      alert('请先选择一个选项！');
      return;
    }
    pAns.submitted = true;
    
    const isCorrect = pAns.selected === q.officialAnswer;
    setMastery(q.qIndex, isCorrect ? 'proficient' : 'wrong');

    renderQuestion();
    highlightCurrentQuestionGrounding();
  }

  // 渲染复盘手记
  function renderReflection(q, shouldShowSol) {
    if (!dom.reflectionCard) return;
    const noteData = state.notes[q.qIndex] || { mistakeTag: '', text: '' };
    const curMastery = state.mastery[q.qIndex] || 'unmarked';

    const reasons = ['定位偏差', '生词卡壳', '逻辑倒置', '过度推理', '偷换概念', '粗心看漏'];

    let guideHtml = '';
    if (shouldShowSol) {
      guideHtml = `
        <div class="guide-accordion">
          <div class="guide-summary" onclick="document.getElementById('guideBody').style.display = document.getElementById('guideBody').style.display === 'none' ? 'block' : 'none'">
            <span>💡 考研命题人避坑指南与名师复盘</span>
            <span style="font-size:10px;">▾</span>
          </div>
          <div class="guide-body" id="guideBody" style="display:none;">
            <p style="margin-bottom:6px;"><strong>【陷阱特征剖析】</strong> ${escapeHtml((q.presetReflection && q.presetReflection.trapAnalysis) || '关注选项中的同义替换与绝对化词汇。')}</p>
            <p><strong>【唐迟方法总结】</strong> ${escapeHtml((q.presetReflection && q.presetReflection.methodSummary) || '细节服从主旨，注意逻辑转折处。')}</p>
          </div>
        </div>
      `;
    }

    dom.reflectionCard.innerHTML = `
      <div class="reflection-title">
        <span>✍️ 我的做题思考与错因复盘</span>
        <span style="font-size:11px;color:#94a3b8;">自动按年份同步存储</span>
      </div>

      <div class="mastery-buttons">
        <button class="btn-mastery ${curMastery === 'proficient' ? 'active-proficient' : ''}" onclick="window.kyApp.setMastery(${q.qIndex}, 'proficient')">熟练 (Z)</button>
        <button class="btn-mastery ${curMastery === 'vague' ? 'active-vague' : ''}" onclick="window.kyApp.setMastery(${q.qIndex}, 'vague')">模糊 (X)</button>
        <button class="btn-mastery ${curMastery === 'wrong' ? 'active-wrong' : ''}" onclick="window.kyApp.setMastery(${q.qIndex}, 'wrong')">不会 (C)</button>
      </div>

      <div class="mistake-reasons">
        <span style="font-size:11px;color:#64748b;font-weight:600;">错因归因:</span>
        ${reasons.map(r => `
          <span class="reason-chip ${noteData.mistakeTag === r ? 'selected' : ''}" onclick="window.kyApp.setMistakeReason(${q.qIndex}, '${r}')">${r}</span>
        `).join('')}
      </div>

      <textarea class="reflection-textarea" id="txtReflection" placeholder="写下你当时为什么选错？被哪个词/逻辑误导了？正确的定位思维路径是什么？" oninput="window.kyApp.onNoteInput(${q.qIndex}, this.value)">${escapeHtml(noteData.text || '')}</textarea>
      
      ${guideHtml}
    `;
  }

  // 记录掌握状态 (按当前年份存储) 首次标记时自动跳转下一题
  function setMastery(qIndex, status) {
    const had = state.mastery[qIndex];
    const togglingOff = (had === status);
    if (togglingOff) {
      delete state.mastery[qIndex];
    } else {
      state.mastery[qIndex] = status;
    }
    localStorage.setItem(`ky_english_mastery_${state.currentYear}`, JSON.stringify(state.mastery));
    if (window.storageSync && typeof window.storageSync.scheduleSave === 'function') {
      window.storageSync.scheduleSave();
    }
    renderQuestionPills();
    renderReflection(getCurrentQuestion());
    // 仅在首次标记（原本无熟练度）时才自动跳到下一题
    if (!togglingOff && !had && state.currentQIndex < 4) {
      switchQuestion(1);
    }
  }

  // 记录错因标签
  function setMistakeReason(qIndex, reason) {
    if (!state.notes[qIndex]) state.notes[qIndex] = { mistakeTag: '', text: '' };
    if (state.notes[qIndex].mistakeTag === reason) {
      state.notes[qIndex].mistakeTag = '';
    } else {
      state.notes[qIndex].mistakeTag = reason;
    }
    localStorage.setItem(`ky_english_notes_${state.currentYear}`, JSON.stringify(state.notes));
    if (window.storageSync && typeof window.storageSync.scheduleSave === 'function') {
      window.storageSync.scheduleSave();
    }
    renderReflection(getCurrentQuestion());
  }

  // 用户笔记输入
  let noteDebounceTimer = null;
  function onNoteInput(qIndex, val) {
    clearTimeout(noteDebounceTimer);
    noteDebounceTimer = setTimeout(() => {
      if (!state.notes[qIndex]) state.notes[qIndex] = { mistakeTag: '', text: '' };
      state.notes[qIndex].text = val;
      localStorage.setItem(`ky_english_notes_${state.currentYear}`, JSON.stringify(state.notes));
      if (window.storageSync && typeof window.storageSync.scheduleSave === 'function') {
        window.storageSync.scheduleSave();
      }
    }, 300);
  }

  // 双向定位与高亮句子
  function locateSentence(sentenceId, highlightType = 'target') {
    if (state.mode === 'practice') return;

    const el = document.getElementById(`sentence-${sentenceId}`);
    if (!el) return;

    document.querySelectorAll('.sentence-item').forEach(s => {
      s.classList.remove('highlight-target', 'highlight-distractor', 'pulse-target');
    });

    const cls = highlightType === 'target' ? 'highlight-target' : 'highlight-distractor';
    el.classList.add(cls, 'pulse-target');
    el.classList.add('show-trans');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // 默认高亮当前题目的定位句
  function highlightCurrentQuestionGrounding() {
    if (state.mode === 'practice') return;

    const q = getCurrentQuestion();
    if (!q) return;

    document.querySelectorAll('.sentence-item').forEach(s => {
      s.classList.remove('highlight-target', 'highlight-distractor', 'highlight-topic', 'pulse-target');
    });

    if (q.targetSentences && q.targetSentences.length > 0) {
      q.targetSentences.forEach(sid => {
        const el = document.getElementById(`sentence-${sid}`);
        if (el) el.classList.add('highlight-target');
      });
    }
  }

  // 文章区域事件绑定
  let popoverHideTimer = null;
  let isVocabPinned = false;
  let pinnedWordEl = null;

  function attachPassageEvents() {
    if (!dom.passagePane) return;
    dom.passagePane.querySelectorAll('.vocab-word').forEach(vEl => {
      // 鼠标悬停进入
      vEl.addEventListener('mouseenter', (e) => {
        if (state.mode === 'practice') return;
        if (isVocabPinned) return; // 处于点击常驻锁定时，不随鼠标划过切换
        clearTimeout(popoverHideTimer);
        const word = vEl.dataset.word;
        const ipa = vEl.dataset.ipa;
        const meaning = vEl.dataset.meaning;
        showVocabPopover(vEl, word, ipa, meaning);
      });

      // 鼠标移出：给予 400ms 缓冲并结合悬浮桥接，鼠标可自由滑入浮窗
      vEl.addEventListener('mouseleave', () => {
        if (isVocabPinned) return;
        clearTimeout(popoverHideTimer);
        popoverHideTimer = setTimeout(() => {
          hideVocabPopover();
        }, 400);
      });

      // 点击单词：永久常驻锁定（Pin），无需小心翼翼保持鼠标位置
      vEl.addEventListener('click', (e) => {
        if (state.mode === 'practice') return;
        e.stopPropagation();
        const word = vEl.dataset.word;
        const ipa = vEl.dataset.ipa;
        const meaning = vEl.dataset.meaning;

        if (isVocabPinned && pinnedWordEl === vEl) {
          // 再次点击同一单词：解锁并关闭
          isVocabPinned = false;
          pinnedWordEl = null;
          hideVocabPopover();
        } else {
          // 锁定到当前单词
          isVocabPinned = true;
          pinnedWordEl = vEl;
          clearTimeout(popoverHideTimer);
          showVocabPopover(vEl, word, ipa, meaning, true);
        }
      });
    });

    dom.passagePane.querySelectorAll('.sentence-item').forEach(sEl => {
      sEl.addEventListener('click', (e) => {
        if (state.mode === 'practice') return;
        if (e.target.closest('.vocab-word')) return;
        sEl.classList.toggle('show-trans');
      });
    });
  }

  // 显示词汇气泡（支持点击常驻锁定与真人发音/收藏）
  function showVocabPopover(anchorEl, word, ipa, meaning, isPinned = false) {
    if (!dom.vocabPopover) return;
    const pop = dom.vocabPopover;
    const starred = isWordStarred(word);
    
    pop.classList.toggle('pinned', isPinned);
    pop.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;">
        <div>
          <span class="popover-word">${escapeHtml(word)}</span>
          <span class="popover-ipa">[${escapeHtml(ipa)}]</span>
        </div>
        <div style="display:flex;align-items:center;gap:4px;">
          <button class="popover-btn" title="英音真人发音" onclick="window.kyApp.playWordPronunciation('${escapeHtml(word)}', 1)">英音</button>
          <button class="popover-btn" title="美音真人发音" onclick="window.kyApp.playWordPronunciation('${escapeHtml(word)}', 2)">美音</button>
          <button class="popover-btn ${starred ? 'starred' : ''}" id="btnStarPop_${escapeHtml(word)}" title="收藏至生词本" onclick="window.kyApp.toggleStarWord('${escapeHtml(word)}', {ipa: '${escapeHtml(ipa)}', meaning: '${escapeHtml(meaning)}'}); const b = document.getElementById('btnStarPop_${escapeHtml(word)}'); if(b){ b.classList.toggle('starred'); b.textContent = b.classList.contains('starred') ? '已收藏' : '收藏'; }">${starred ? '已收藏' : '收藏'}</button>
        </div>
      </div>
      <div class="popover-meaning">${escapeHtml(meaning)}</div>
    `;
    pop.style.display = 'block';

    pop.onmouseenter = () => {
      clearTimeout(popoverHideTimer);
    };
    pop.onmouseleave = () => {
      if (isVocabPinned) return;
      clearTimeout(popoverHideTimer);
      popoverHideTimer = setTimeout(() => hideVocabPopover(), 400);
    };

    const rect = anchorEl.getBoundingClientRect();
    const popHeight = 110;
    let top = rect.bottom + 6;
    if (top + popHeight > window.innerHeight) {
      top = Math.max(10, rect.top - popHeight - 6);
    }
    pop.style.left = `${Math.min(window.innerWidth - 330, Math.max(10, rect.left))}px`;
    pop.style.top = `${top}px`;
  }

  function hideVocabPopover() {
    isVocabPinned = false;
    pinnedWordEl = null;
    if (dom.vocabPopover) {
      dom.vocabPopover.style.display = 'none';
      dom.vocabPopover.classList.remove('pinned');
    }
  }

  // 设置事件监听
  function setupEventListeners() {
    if (dom.trigYear) {
      dom.trigYear.onclick = (e) => {
        e.stopPropagation();
        toggleYearDropdown();
      };
    }

    document.addEventListener('click', (e) => {
      if (dom.ddYear && !dom.ddYear.contains(e.target)) {
        closeYearDropdown();
      }
      if (dom.vocabPopover && dom.vocabPopover.style.display !== 'none') {
        if (!dom.vocabPopover.contains(e.target) && !e.target.closest('.vocab-word')) {
          hideVocabPopover();
        }
      }
    });

    if (dom.btnToggleSol) {
      dom.btnToggleSol.onclick = () => {
        toggleSolution();
      };
    }

    if (dom.btnToggleTrans) {
      dom.btnToggleTrans.onclick = () => {
        if (state.mode === 'practice') return;
        state.showAllTranslation = !state.showAllTranslation;
        saveResume();
        if (dom.passagePane) dom.passagePane.classList.toggle('show-all-trans', state.showAllTranslation);
        dom.btnToggleTrans.classList.toggle('active', state.showAllTranslation);
      };
    }

    if (dom.btnVocabBook) {
      dom.btnVocabBook.onclick = openVocabNotebook;
    }
    if (dom.btnCloseVocabBook) {
      dom.btnCloseVocabBook.onclick = closeVocabNotebook;
    }
    const modalVocab = document.getElementById('engModalVocabBook');
    if (modalVocab) {
      modalVocab.onclick = (e) => {
        if (e.target === modalVocab) closeVocabNotebook();
      };
    }

    const btnToggleBlur = document.getElementById('btnToggleVocabBlur');
    if (btnToggleBlur) {
      btnToggleBlur.onclick = () => {
        vocabBlurMode = !vocabBlurMode;
        renderVocabNotebook();
      };
    }

    const btnExpVocab = document.getElementById('btnExportVocab');
    if (btnExpVocab) {
      btnExpVocab.onclick = exportStarredWords;
    }

    if (dom.btnThemeToggle) {
      dom.btnThemeToggle.onclick = () => {
        if (typeof window.toggleTheme === 'function') {
          window.toggleTheme();
        }
      };
    }

    function setMode(m) {
      if (m !== 'analysis' && m !== 'practice') return;
      state.mode = m;
      saveResume();
      updateModeClass();
      renderPassage();
      renderQuestionPills();
      renderQuestion();
    }

    if (dom.btnPracticeMode) {
      dom.btnPracticeMode.onclick = () => setMode('practice');
    }

    if (dom.btnAnalysisMode) {
      dom.btnAnalysisMode.onclick = () => setMode('analysis');
    }

    if (dom.btnHelp) {
      dom.btnHelp.onclick = () => {
        if (dom.modalHelp) dom.modalHelp.classList.add('active');
      };
    }
    if (dom.btnCloseHelp) {
      dom.btnCloseHelp.onclick = () => {
        if (dom.modalHelp) dom.modalHelp.classList.remove('active');
      };
    }
    if (dom.modalHelp) {
      dom.modalHelp.onclick = (e) => {
        if (e.target === dom.modalHelp) dom.modalHelp.classList.remove('active');
      };
    }
  }

  // 键盘快捷键支持
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      const isEnglish = (window.curSubjectId === 'english') || (dom.layout && dom.layout.style.display !== 'none');
      if (!isEnglish) return;
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

      const q = getCurrentQuestion();
      if (!q) return;

      // Shift + Space: 切换默认解析偏好
      if (e.shiftKey && (e.key === ' ' || e.code === 'Space')) {
        e.preventDefault();
        toggleDefaultSolution();
        return;
      }

      // Space: 切换当前题解析显示
      if (!e.shiftKey && (e.key === ' ' || e.code === 'Space')) {
        e.preventDefault();
        toggleSolution();
        return;
      }

      if (['1', '2', '3', '4'].includes(e.key)) {
        const optionKeys = ['A', 'B', 'C', 'D'];
        const opt = optionKeys[parseInt(e.key) - 1];
        if (opt) selectOption(q.qIndex, opt);
      }
      else if (e.key === 'q' || e.key === 'Q' || e.key === 'ArrowLeft') { switchQuestion(-1); }
      else if (e.key === 'e' || e.key === 'E' || e.key === 'ArrowRight') { switchQuestion(1); }
      else if (e.key === 'z' || e.key === 'Z') { setMastery(q.qIndex, 'proficient'); }
      else if (e.key === 'x' || e.key === 'X') { setMastery(q.qIndex, 'vague'); }
      else if (e.key === 'c' || e.key === 'C') { setMastery(q.qIndex, 'wrong'); }
      else if (e.key === 't' || e.key === 'T') { if (dom.btnToggleTrans) dom.btnToggleTrans.click(); }
      else if (e.key === 'm' || e.key === 'M') {
        if (state.mode === 'analysis' && dom.btnPracticeMode) dom.btnPracticeMode.click();
        else if (dom.btnAnalysisMode) dom.btnAnalysisMode.click();
      }
      else if (e.key === 'g' || e.key === 'G') {
        if (typeof window.openSubjectPicker === 'function') window.openSubjectPicker();
      }
      else if (e.key === 'y' || e.key === 'Y') {
        if (typeof window.toggleTheme === 'function') window.toggleTheme();
      }
      else if (e.key === 'h' || e.key === 'H') { if (dom.btnHelp) dom.btnHelp.click(); }
      else if (e.key === 'Escape') {
        closeYearDropdown();
        closeVocabNotebook();
        if (typeof window.closeSubjectPicker === 'function') window.closeSubjectPicker();
        if (dom.modalHelp) dom.modalHelp.classList.remove('active');
      }
      else if (e.key === 'Enter' && state.mode === 'practice') {
        submitPracticeAnswer();
      }
    });
  }

  function setMode(m) {
    if (m !== 'analysis' && m !== 'practice') return;
    state.mode = m;
    saveResume();
    updateModeClass();
    renderPassage();
    renderQuestionPills();
    renderQuestion();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  window.englishApp = {
    init,
    activate,
    saveResume,
    loadResume,
    switchYear,
    setMode,
    locateSentence,
    setMastery,
    setMistakeReason,
    onNoteInput,
    submitPracticeAnswer,
    toggleSolution,
    toggleDefaultSolution,
    playWordPronunciation,
    toggleStarWord,
    openVocabNotebook,
    closeVocabNotebook,
    get state() { return state; },
    get curDataset() { return getCurrentDataset(); }
  };
  window.kyApp = window.englishApp;
  window.kyEnglishApp = window.englishApp;

  document.addEventListener('DOMContentLoaded', init);
})();