/**
 * 考研英语 · 智能精读与题型分析系统 核心应用逻辑 (SPA 多年份可扩展模块)
 * 数据存储于：题库/英语/data_YYYY.js (注册至 window.ENGLISH_DATA['YYYY'])
 * 配色体系：清华紫品牌主色 (#660874) + 纯净模考与沉浸精读双轨引擎
 */

(function () {
  'use strict';

  // 全局状态
  const state = {
    currentSubject: 'english',
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
      questionToolbar: document.querySelector('#engAnalysisPane .question-toolbar'),
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
            <button type="button" class="popover-btn" data-action="pronounce" data-audio-type="1" data-word="${escapeHtml(item.word)}" title="英音发音">英音</button>
            <button type="button" class="popover-btn" data-action="pronounce" data-audio-type="2" data-word="${escapeHtml(item.word)}" title="美音发音">美音</button>
          </div>
        </div>
        <div class="vocab-word-trans ${vocabBlurMode ? 'blur-mode' : ''}" title="点击显隐释义" onclick="this.classList.toggle('blur-mode')">
          ${escapeHtml(item.meaning)}
        </div>
        <div class="vocab-card-meta">
          <span>${item.year} 年真题 · ${item.textId || ''}</span>
          <button type="button" class="vocab-unstar-btn" data-action="unstar" data-word="${escapeHtml(item.word)}">移除</button>
        </div>
      </div>
    `).join('');

    grid.onclick = (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      const word = btn.dataset.word;
      if (action === 'pronounce') {
        const type = parseInt(btn.dataset.audioType, 10) || 1;
        playWordPronunciation(word, type);
      } else if (action === 'unstar') {
        toggleStarWord(word, {});
      }
    };
  }

  function exportStarredWords() {
    const list = Object.values(starredWords);
    if (list.length === 0) {
      if (typeof window.showToast === 'function') {
        window.showToast('生词本为空，无需导出', 'info');
      } else if (window.storageSync && typeof window.storageSync.showToast === 'function') {
        window.storageSync.showToast('生词本为空，无需导出', 'info');
      }
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
  // 核心适配真题年份清单 (2007 ~ 2015)
  const ADAPTED_YEARS = ['2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015'];

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

  // 获取所有支持的真题年份列表 (1998 ~ 2026)
  function getAvailableYears() {
    return ALL_ENGLISH_YEARS;
  }

  // 标准题型映射表（兼容王晶婷 6 大题型体系）
  const STANDARD_TYPE_MAP = {
    'DETAIL': '细节题',
    'INFERENCE': '推断题',
    'EXEMPLIFICATION': '例证题',
    'EXAMPLE': '例证题',
    'MAIN_IDEA': '主旨题',
    'MAIN': '主旨题',
    'ATTITUDE': '态度题',
    'VOCAB': '词义题',
    'VOCABULARY': '词义题'
  };

  // 标准干扰项分类映射表（王晶婷 8 大干扰项特征体系）
  const DISTRACTOR_TYPE_MAP = {
    'UNFOUNDED': '无中生有',
    'ATTRIBUTION_ERROR': '张冠李戴',
    'EXTREME_ABSOLUTE': '夸大/绝对化',
    'CONTRADICTION': '正反混淆',
    'CAUSALITY_INVERSION': '因果倒置',
    'SCOPE_DISTORTION': '以偏概全',
    'CONCEPT_DISTORTION': '偷换概念',
    'LITERAL_TRAP': '望文生义',
    'NONE': '正确项'
  };

  // 标准题型智能收敛归一化（将历年细分子题型统一归入王晶婷 6 大标准题型）
  function mapToStandardType(typeStr) {
    if (!typeStr) return '细节题';
    if (STANDARD_TYPE_MAP[typeStr]) return STANDARD_TYPE_MAP[typeStr];
    if (typeStr.includes('推断') || typeStr.includes('推理')) return '推断题';
    if (typeStr.includes('例证') || typeStr.includes('修辞') || typeStr.includes('论据')) return '例证题';
    if (typeStr.includes('主旨') || typeStr.includes('标题') || typeStr.includes('结构') || typeStr.includes('概括') || typeStr.includes('设问')) return '主旨题';
    if (typeStr.includes('态度') || typeStr.includes('情感') || typeStr.includes('观点')) return '态度题';
    if (typeStr.includes('词义') || typeStr.includes('词句') || typeStr.includes('指代')) return '词义题';
    if (typeStr.includes('细节') || typeStr.includes('事实') || typeStr.includes('原因') || typeStr.includes('目的') || typeStr.includes('条件') || typeStr.includes('功能')) return '细节题';
    return '细节题';
  }

  // 结构化长难句语法精析格式化工具
  function formatSyntaxAnalysis(syntax) {
    if (!syntax) return '';
    if (typeof syntax === 'string') return escapeHtml(syntax);
    if (typeof syntax === 'object') {
      const parts = [];
      if (syntax.structureType) {
        parts.push(`<strong>【句型】</strong>${escapeHtml(syntax.structureType)}`);
      }
      if (syntax.mainClause) {
        parts.push(`<strong>【主干】</strong>${escapeHtml(syntax.mainClause)}`);
      }
      if (syntax.subordinateClauses && syntax.subordinateClauses.length > 0) {
        const subStr = Array.isArray(syntax.subordinateClauses)
          ? syntax.subordinateClauses.join('；')
          : syntax.subordinateClauses;
        parts.push(`<strong>【修饰从句】</strong>${escapeHtml(subStr)}`);
      }
      if (syntax.corePattern) {
        parts.push(`<strong>【核心句型】</strong><code>${escapeHtml(syntax.corePattern)}</code>`);
      }
      return parts.join(' &nbsp;|&nbsp; ');
    }
    return '';
  }

  // 篇章数据弹性归一化 (无缝兼容 1998~2026 全年份与多代重构数据结构)
  function normalizeText(t, idx) {
    if (!t) return null;
    if (t._normalized) return t;

    const textNum = t.number || t.textIndex || (idx + 1);
    t.number = textNum;

    // 确保标准 id 存在 (如 text1, text2...)，同时保留原 id 别名用于外部定位兼容
    const originalId = t.id;
    if (!t.id || !t.id.startsWith('text')) {
      t.aliasId = originalId;
      t.id = 'text' + textNum;
    }

    t.title = t.title || t.englishTitle || (`Reading Comprehension Text ${textNum}`);
    t.chineseTitle = t.chineseTitle || '';
    t.topic = t.topic || (t.topicDomain ? (t.subTopic ? `${t.topicDomain} · ${t.subTopic}` : t.topicDomain) : (t.domainKnowledge && t.domainKnowledge.domain)) || '真题精读';
    t.overview = t.overview || (t.domainKnowledge && t.domainKnowledge.coreThesis) || (t.macroStructure && t.macroStructure.coreThesis) || (t.backgroundKnowledgeCapsule && t.backgroundKnowledgeCapsule.coreTopic) || '';

    // 段落挂载双轨对齐
    const rawParas = t.paragraphs || (t.textAnalysis && t.textAnalysis.paragraphs) || [];
    t.paragraphs = rawParas;

    // 规范化全文词汇表 (若有)
    if (t.vocabulary && Array.isArray(t.vocabulary)) {
      t.vocabulary.forEach(v => {
        v.meaning = v.meaning || v.contextMeaning || v.examMeaning || '';
        if (!v.level) {
          v.level = v.isInObstacleList ? 'red' : 'green';
        }
      });
    }

    // 规范化各段落与句子
    t.paragraphs.forEach((p, pIdx) => {
      const pIndex = p.pIndex || p.paraIndex || (pIdx + 1);
      p.pIndex = pIndex;
      p.logicRole = p.logicRole || '';
      p.mainIdea = p.mainIdea || p.paraMainIdea || '';
      p.sentences = p.sentences || [];

      p.sentences.forEach((s, sIdx) => {
        const sIndex = s.sIndex || s.sentenceIndex || (sIdx + 1);
        s.sIndex = sIndex;
        s.id = `P${pIndex}-S${sIndex}`;
        s.text = s.text || s.en || s.english || '';
        s.translation = s.translation || s.zh || s.chinese || '';
        s.syntaxAnalysis = s.syntaxAnalysis || s.syntax || s.grammarAnalysis || null;
        s.vocab = s.vocab || [];
      });
    });

    // 规范化题目与选项
    t.questions = t.questions || [];
    t.questions.forEach((q, qIdx) => {
      if (!q.qIndex) {
        q.qIndex = 21 + (textNum - 1) * 5 + qIdx;
      }
      q.stem = q.stem || q.questionText || '';
      const rawType = q.type || q.standardType || q.typeDisplayName;
      q.typeDisplayName = q.typeDisplayName || q.type || STANDARD_TYPE_MAP[q.standardType] || '细节题';
      q.type = mapToStandardType(rawType);
      q.tangchiModel = q.tangchiModel || (q.standardType ? '唐迟真题方法论' : '唐迟解题模型');
      q.stemKeywords = q.stemKeywords || [];
      q.targetSentences = q.targetSentences || [];
      q.options = q.options || [];

      q.options.forEach(opt => {
        opt.text = opt.text || '';
        opt.distractorType = opt.distractorDisplayName || DISTRACTOR_TYPE_MAP[opt.distractorType] || opt.distractorType || (opt.isCorrect ? '正确项' : '干扰项');
        opt.analysis = opt.analysis || opt.reason || opt.translation || '';
        opt.refSentences = opt.refSentences || [];
      });

      if (!q.presetReflection && q.explanation) {
        q.presetReflection = {
          trapAnalysis: q.explanation.distractorAnalysis || q.explanation.trapAnalysis || q.explanation.summary || '',
          methodSummary: q.explanation.method || q.explanation.methodSummary || ''
        };
      }
    });

    t._normalized = true;
    return t;
  }

  // 获取当前选定年份的数据集
  function getCurrentDataset() {
    if (!window.ENGLISH_DATA) return { texts: [] };
    let data = window.ENGLISH_DATA[state.currentYear];
    if (!data) {
      const years = Object.keys(window.ENGLISH_DATA);
      if (years.length > 0) {
        state.currentYear = years[0];
        data = window.ENGLISH_DATA[years[0]];
      }
    }
    if (data && data.texts) {
      data.texts.forEach((t, idx) => normalizeText(t, idx));
    }
    return data || { texts: [] };
  }

  // 获取当前 Text 与 Question 数据
  function getCurrentText() {
    const dataset = getCurrentDataset();
    if (!dataset.texts || dataset.texts.length === 0) return null;
    return dataset.texts.find(t => t.id === state.currentTextId || t.aliasId === state.currentTextId) || dataset.texts[0];
  }

  function getCurrentQuestion() {
    const text = getCurrentText();
    if (!text || !text.questions || text.questions.length === 0) return null;
    return text.questions.find(q => q.qIndex === state.currentQIndex) || text.questions[0];
  }

  // 状态记忆与恢复 (按科目独立持久化)
  function saveResume() {
    const subjKey = state.currentSubject || 'english';
    const data = {
      subject: subjKey,
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
      const entry = {
        year: state.currentYear,
        textId: state.currentTextId,
        qIndex: state.currentQIndex,
        mode: state.mode,
        typeFilter: state.typeFilter,
        showAllTranslation: !!state.showAllTranslation
      };
      if (window.StorageEngine && window.StorageEngine.GlobalStore) {
        let resumeMap = window.StorageEngine.GlobalStore.get('resume') || {};
        resumeMap.english = entry;
        resumeMap[`english_y${state.currentYear}`] = { textId: state.currentTextId, qIndex: state.currentQIndex };
        window.StorageEngine.GlobalStore.set('resume', resumeMap);
        window.StorageEngine.GlobalStore.set('english_mode', state.mode);
      }
      notifyStorageSync();
    } catch (e) {}
  }

  function loadResume() {
    try {
      const subjKey = state.currentSubject || 'english';
      let saved = null;
      if (window.StorageEngine && window.StorageEngine.GlobalStore) {
        const resumeMap = window.StorageEngine.GlobalStore.get('resume') || {};
        saved = resumeMap.english;
      }
      if (saved) {
        if (saved.year) {
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
        state.currentYear = '2010';
        const savedMode = localStorage.getItem(`ky_${subjKey}_mode`);
        if (savedMode && (savedMode === 'analysis' || savedMode === 'practice')) {
          state.mode = savedMode;
        }
      }

      // 独立全局偏好回退保障（防止任何异常覆盖导致模式被重置）
      if (window.StorageEngine && window.StorageEngine.GlobalStore) {
        const gm = window.StorageEngine.GlobalStore.get('english_mode');
        if (gm && (gm === 'analysis' || gm === 'practice')) {
          state.mode = gm;
        }
      }
    } catch (e) {}
  }

  // 解析显示偏好存储与读取 (通过 StorageEngine.UiStore)
  function loadSolutionPref() {
    try {
      let v = null;
      if (window.StorageEngine && window.StorageEngine.UiStore) {
        v = window.StorageEngine.UiStore.get('english');
      }
      if (!v) {
        v = JSON.parse(localStorage.getItem('english_ui_solution'));
      }
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
      const val = {
        show: !!state.showSolution,
        def: !!state.defaultShowSolution
      };
      if (window.StorageEngine && window.StorageEngine.UiStore) {
        window.StorageEngine.UiStore.set('english', val);
      }
      try { localStorage.removeItem('english_ui_solution'); } catch (e) {}
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
      dom.txtToggleSol.textContent = state.showSolution ? '解析: 显示' : '解析: 隐藏';
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

  // 加载当前年份的掌握度、笔记与做题作答
  function loadYearStorage() {
    const subjKey = state.currentSubject || 'english';
    try {
      state.mastery = JSON.parse(localStorage.getItem(`ky_${subjKey}_mastery_${state.currentYear}`) || '{}');
      state.notes = JSON.parse(localStorage.getItem(`ky_${subjKey}_notes_${state.currentYear}`) || '{}');
      state.practiceAnswers = JSON.parse(localStorage.getItem(`ky_${subjKey}_practice_${state.currentYear}`) || '{}');
    } catch (e) {
      state.mastery = {};
      state.notes = {};
      state.practiceAnswers = {};
    }
  }

  function savePracticeStorage() {
    const subjKey = state.currentSubject || 'english';
    try {
      localStorage.setItem(`ky_${subjKey}_practice_${state.currentYear}`, JSON.stringify(state.practiceAnswers));
      if (window.storageSync && typeof window.storageSync.scheduleSave === 'function') {
        window.storageSync.scheduleSave();
      }
    } catch (e) {}
  }

  function saveMasteryStorage() {
    const subjKey = state.currentSubject || 'english';
    try {
      localStorage.setItem(`ky_${subjKey}_mastery_${state.currentYear}`, JSON.stringify(state.mastery));
      if (window.storageSync && typeof window.storageSync.scheduleSave === 'function') {
        window.storageSync.scheduleSave();
      }
    } catch (e) {}
  }

  // 渲染年份标题下拉面板
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

  // 切换真题年份：恢复该年份上次停的位置
  let _switchYearSeq = 0;
  async function switchYear(year) {
    const seq = ++_switchYearSeq;
    if (!window.ENGLISH_DATA || !window.ENGLISH_DATA[year]) {
      if (dom.passagePane) {
        dom.passagePane.innerHTML = `<div style="padding:48px 20px;color:#64748b;text-align:center;font-size:15px;font-weight:600;">正在加载 ${year} 年真题精读数据...</div>`;
      }
      try {
        await loadYearDataAsync(year);
      } catch (err) {
        if (seq !== _switchYearSeq) return;
        if (dom.passagePane) {
          dom.passagePane.innerHTML = `<div style="padding:48px 20px;color:#dc2626;text-align:center;">加载 ${year} 年真题失败，请检查题库文件是否存在</div>`;
        }
        return;
      }
    }
    if (seq !== _switchYearSeq) return;
    state.currentYear = year;
    loadYearStorage();

    const dataset = getCurrentDataset();
    if (dataset.texts && dataset.texts.length > 0) {
      let restored = false;
      try {
        if (window.StorageEngine && window.StorageEngine.GlobalStore) {
          const resumeMap = window.StorageEngine.GlobalStore.get('resume') || {};
          const saved = resumeMap[`english_y${year}`];
          if (saved) {
            const text = dataset.texts.find(t => t.id === saved.textId || t.aliasId === saved.textId);
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
        }
      } catch (e) {}
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

  // 打开原图全屏预览 (复用 lightbox 弹窗)
  function openFigureLightbox(src) {
    if (!src) return;
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    if (lb && img) {
      img.src = src;
      lb.classList.add('open');
    }
  }

  // 初始化应用
  async function init() {
    initDom();
    if (!dom.passagePane) return;
    if (state.initialized) return;
    state.initialized = true;

    loadResume();
    loadSolutionPref();

    if (state.currentSubject === 'english' && (!window.ENGLISH_DATA || !window.ENGLISH_DATA[state.currentYear])) {
      if (dom.passagePane) {
        dom.passagePane.innerHTML = `<div style="padding:48px 20px;color:#64748b;text-align:center;font-size:15px;font-weight:600;">正在加载 ${state.currentYear} 年真题精读数据...</div>`;
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
    setupWheelAndRightClickGestures();
    updateModeClass();
  }

  async function activate(subjectId = 'english') {
    state.currentSubject = subjectId;
    initDom();
    if (!state.currentYear || state.currentYear.startsWith('paper')) {
      state.currentYear = '2010';
    }

    if (!state.initialized) {
      await init();
    } else {
      loadResume();
      loadSolutionPref();
      if (state.currentSubject === 'english' && (!window.ENGLISH_DATA || !window.ENGLISH_DATA[state.currentYear])) {
        if (dom.passagePane) {
          dom.passagePane.innerHTML = `<div style="padding:48px 20px;color:#64748b;text-align:center;font-size:15px;font-weight:600;">正在加载 ${state.currentYear} 年真题精读数据...</div>`;
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
    dom.layout.classList.remove('mode-reader-layout');
    if (dom.btnPracticeMode) dom.btnPracticeMode.style.display = 'inline-flex';
    if (dom.btnAnalysisMode) dom.btnAnalysisMode.style.display = 'inline-flex';
    if (dom.typeFilterBar) dom.typeFilterBar.style.display = 'flex';
    if (dom.questionPills) dom.questionPills.style.display = 'flex';

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

  // 渲染顶部章节/快速导航标签
  function renderTextTabs() {
    if (!dom.textTabs) return;
    const dataset = getCurrentDataset();
    if (!dataset.texts) return;
    dom.textTabs.style.display = 'flex';
    dom.textTabs.innerHTML = '';
    dataset.texts.forEach(t => {
      const btn = document.createElement('button');
      const isActive = (t.id === state.currentTextId || t.aliasId === state.currentTextId);
      btn.className = `text-tab ${isActive ? 'active' : ''}`;
      btn.textContent = `Text ${t.number}`;
      btn.title = t.chineseTitle || '';
      btn.onclick = () => switchText(t.id);
      dom.textTabs.appendChild(btn);
    });
  }

  // 渲染题型筛选条
  function renderTypeFilter() {
    if (!dom.typeFilterBar) return;

    dom.typeFilterBar.style.display = 'flex';
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
    const dataset = getCurrentDataset();
    const targetText = dataset.texts && dataset.texts.find(t => t.id === textId || t.aliasId === textId);
    if (targetText) {
      state.currentTextId = targetText.id;
    } else {
      state.currentTextId = textId;
    }
    const text = getCurrentText();
    if (!text) return;
    
    if (dom.textTabs && dataset.texts) {
      dom.textTabs.querySelectorAll('.text-tab').forEach((tab, i) => {
        const item = dataset.texts[i];
        tab.classList.toggle('active', item && (item.id === state.currentTextId || item.aliasId === state.currentTextId));
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

  // 渲染文章主体（考研英语真题单篇精读）
  function renderPassage() {
    if (!dom.passagePane) return;

    const text = getCurrentText();
    if (!text) {
      dom.passagePane.innerHTML = '<div style="padding:20px;color:#94a3b8;text-align:center;">暂无文章数据</div>';
      return;
    }

    let figureHtml = '';
    if (text.figure && text.figure.image) {
      figureHtml = `
        <div class="passage-figure-box">
          <img src="${escapeHtml(text.figure.image)}" alt="${escapeHtml(text.figure.alt || '')}" onclick="window.kyApp.openFigureLightbox(this.src)" class="passage-figure-img" title="点击放大查看高清图表">
          <div class="passage-figure-caption">${escapeHtml(text.figure.caption || '')}</div>
        </div>
      `;
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
      ${figureHtml}
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
        const vList = (s.vocab && s.vocab.length > 0) ? s.vocab : (text.vocabulary || text.vocab || []);
        const sentenceText = renderAnnotatedSentenceText(s.text, vList);
        const sentenceTrans = renderAnnotatedTranslation(s.translation, vList);

        let syntaxHtml = '';
        if (s.syntaxAnalysis) {
          const formattedSyntax = formatSyntaxAnalysis(s.syntaxAnalysis);
          if (formattedSyntax) {
            syntaxHtml = `
              <div class="sentence-syntax">
                <span class="syntax-badge">语法解析</span>
                <span class="syntax-content">${formattedSyntax}</span>
              </div>
            `;
          }
        }

        html += `
          <div class="sentence-item ${s.isTopicSentence ? 'is-topic' : ''}" id="sentence-${s.id}" data-id="${s.id}">
            <span class="sentence-id-tag">[${s.id}]</span>
            <span class="sentence-text">${sentenceText} </span>
            <div class="sentence-trans">${sentenceTrans}</div>
            ${syntaxHtml}
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    });

    dom.passagePane.innerHTML = html;

    if (window.MarkdownLatexEngine && typeof window.MarkdownLatexEngine.renderMathInElement === 'function') {
      window.MarkdownLatexEngine.renderMathInElement(dom.passagePane);
    } else if (window.renderMathInElement) {
      try {
        window.renderMathInElement(dom.passagePane, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\[', right: '\\]', display: true },
            { left: '\\(', right: '\\)', display: false }
          ],
          throwOnError: false
        });
      } catch (e) {}
    }

    attachPassageEvents();
    if (state.mode === 'analysis') {
      highlightCurrentQuestionGrounding();
    }
  }

  // 获取当前篇章做题作答状态 (5 题)
  function getCurrentTextPracticeStatus() {
    const text = getCurrentText();
    if (!text || !text.questions) return { total: 0, answered: 0, allAnswered: false, allSubmitted: false, questions: [] };
    const questions = text.questions;
    let answered = 0;
    let allSubmitted = questions.length > 0;
    questions.forEach(q => {
      const p = state.practiceAnswers[q.qIndex];
      if (p && p.selected) answered++;
      if (!p || !p.submitted) allSubmitted = false;
    });
    return {
      total: questions.length,
      answered,
      allAnswered: answered === questions.length && questions.length > 0,
      allSubmitted,
      questions
    };
  }

  // 渲染题目切换胶囊与工具栏
  function renderQuestionPills() {
    if (!dom.questionPills) return;
    const text = getCurrentText();
    if (!text || !text.questions) return;
    dom.questionPills.innerHTML = '';

    const isPractice = (state.mode === 'practice');

    text.questions.forEach(q => {
      if (!isPractice && state.typeFilter !== 'all' && q.type !== state.typeFilter) {
        return;
      }

      const pill = document.createElement('div');
      if (isPractice) {
        const pAns = state.practiceAnswers[q.qIndex] || {};
        let pillClass = `q-pill ${q.qIndex === state.currentQIndex ? 'active' : ''}`;
        if (pAns.selected) pillClass += ' is-answered';
        if (pAns.submitted) {
          pillClass += ` is-submitted ${pAns.isCorrect ? 'is-correct' : 'is-wrong'}`;
        }
        pill.className = pillClass;
        const choiceText = pAns.selected ? `<span class="q-pill-choice">${escapeHtml(pAns.selected)}</span>` : '';
        pill.innerHTML = `<span class="q-num">${q.qIndex}</span>${choiceText}`;
        pill.title = `第${q.qIndex}题 (${q.type})${pAns.selected ? ` - 已选 ${pAns.selected}` : ' - 未作答'}`;
      } else {
        const masteryState = state.mastery[q.qIndex] || 'unmarked';
        pill.className = `q-pill ${q.qIndex === state.currentQIndex ? 'active' : ''} status-${masteryState}`;
        pill.innerHTML = `
          <span class="q-num">${q.qIndex}</span>
          <span class="q-state-dot"></span>
        `;
        pill.title = `第${q.qIndex}题 (${q.type})`;
      }

      pill.onclick = () => switchQuestion(q.qIndex);
      dom.questionPills.appendChild(pill);
    });

    // 模考做题模式工具栏右侧状态区 (进度、整篇提交、快捷键提示)
    const toolbar = dom.questionToolbar || (dom.analysisPane ? dom.analysisPane.querySelector('.question-toolbar') : null);
    if (toolbar) {
      let rightBox = toolbar.querySelector('.practice-toolbar-right');
      if (isPractice) {
        if (!rightBox) {
          rightBox = document.createElement('div');
          rightBox.className = 'practice-toolbar-right';
          toolbar.appendChild(rightBox);
        }
        const status = getCurrentTextPracticeStatus();
        let badgeHtml = '';
        if (status.allSubmitted) {
          badgeHtml = '<span class="practice-progress-badge all-answered">已交卷判分</span>';
        } else if (status.allAnswered) {
          badgeHtml = '<span class="practice-progress-badge all-answered">5/5 题已完成 · 按 Enter 提交</span>';
        } else {
          badgeHtml = `<span class="practice-progress-badge">已答 ${status.answered}/${status.total} 题</span>`;
        }

        rightBox.innerHTML = `
          ${badgeHtml}
          <button class="practice-submit-btn ${status.allSubmitted ? 'disabled' : ''}" id="btnPracticeSubmitWhole" ${status.allSubmitted ? 'disabled' : ''} onclick="window.kyApp.handlePracticeEnter()">
            ${status.allSubmitted ? '已交卷' : '整篇提交 (Enter)'}
          </button>
          <span class="practice-shortcut-hint" title="A/D 切换小题 · 1-4 选择选项 · W/S 切换篇章 · Q/E 切换年份">A/D题 · 1-4选 · W/S篇 · Q/E年</span>
        `;
      } else if (rightBox) {
        rightBox.remove();
      }
    }
  }

  // 切换题目 (跨篇章自动同步与位置保存)
  function switchQuestion(qIndex) {
    const dataset = getCurrentDataset();
    if (dataset.texts) {
      const parentText = dataset.texts.find(t => t.questions && t.questions.some(q => q.qIndex === qIndex));
      if (parentText && parentText.id !== state.currentTextId && parentText.aliasId !== state.currentTextId) {
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

  // 小题切换: A (上一题) / D (下一题)
  function navPrev() {
    const text = getCurrentText();
    const dataset = getCurrentDataset();
    if (!text || !dataset.texts) return;

    const curIdx = text.questions.findIndex(x => x.qIndex === state.currentQIndex);
    if (curIdx > 0) {
      switchQuestion(text.questions[curIdx - 1].qIndex);
    } else {
      const textIdx = dataset.texts.findIndex(t => t.id === state.currentTextId || t.aliasId === state.currentTextId);
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
      const textIdx = dataset.texts.findIndex(t => t.id === state.currentTextId || t.aliasId === state.currentTextId);
      if (textIdx < dataset.texts.length - 1) {
        const nextText = dataset.texts[textIdx + 1];
        switchText(nextText.id, nextText.questions[0].qIndex);
      }
    }
  }

  // 篇章切换: W (上一篇) / S (下一篇)
  function navPrevText() {
    const dataset = getCurrentDataset();
    if (!dataset.texts || dataset.texts.length === 0) return;
    const curIdx = dataset.texts.findIndex(t => t.id === state.currentTextId || t.aliasId === state.currentTextId);
    if (curIdx > 0) {
      switchText(dataset.texts[curIdx - 1].id);
    } else {
      if (typeof window.showToast === 'function') {
        window.showToast('已是当前年份第一篇 (Text 1)', 'info');
      }
    }
  }

  function navNextText() {
    const dataset = getCurrentDataset();
    if (!dataset.texts || dataset.texts.length === 0) return;
    const curIdx = dataset.texts.findIndex(t => t.id === state.currentTextId || t.aliasId === state.currentTextId);
    if (curIdx >= 0 && curIdx < dataset.texts.length - 1) {
      switchText(dataset.texts[curIdx + 1].id);
    } else {
      if (typeof window.showToast === 'function') {
        window.showToast(`已是当前年份最后一篇 (Text ${dataset.texts.length})`, 'info');
      }
    }
  }

  // 年份切换: Q (上一年) / E (下一年) (仅适配 2007~2015 年真题)
  function navPrevYear() {
    const curY = String(state.currentYear);
    let idx = ADAPTED_YEARS.indexOf(curY);
    if (idx === -1) {
      switchYear('2010');
      return;
    }
    if (idx > 0) {
      switchYear(ADAPTED_YEARS[idx - 1]);
    } else {
      if (typeof window.showToast === 'function') {
        window.showToast('已是首年真题 (2007 年)', 'info');
      }
    }
  }

  function navNextYear() {
    const curY = String(state.currentYear);
    let idx = ADAPTED_YEARS.indexOf(curY);
    if (idx === -1) {
      switchYear('2010');
      return;
    }
    if (idx < ADAPTED_YEARS.length - 1) {
      switchYear(ADAPTED_YEARS[idx + 1]);
    } else {
      if (typeof window.showToast === 'function') {
        window.showToast('已是末年真题 (2015 年)', 'info');
      }
    }
  }

  // 模考做题模式：Enter 触发整篇提交与二重确认弹窗
  function handlePracticeEnter() {
    const confirmModal = document.getElementById('confirmModal');
    if (confirmModal && confirmModal.style.display !== 'none') {
      if (typeof window.closeConfirmModal === 'function') {
        window.closeConfirmModal(true);
      }
      return;
    }

    const status = getCurrentTextPracticeStatus();
    if (status.allSubmitted) {
      const text = getCurrentText();
      const num = text ? text.number : '';
      if (typeof window.showToast === 'function') {
        window.showToast(`Text ${num} 答卷已提交！如需重测请在精读模式复盘。`, 'info');
      }
      return;
    }

    if (!status.allAnswered) {
      const msg = `当前篇章还有未作答题目 (已完成 ${status.answered}/${status.total} 题)，请完成全部 5 道题后再按 Enter 提交！`;
      if (typeof window.showToast === 'function') {
        window.showToast(msg, 'warning');
      }
      return;
    }

    openPracticeSubmitModal();
  }

  // 唤起提交确认弹窗 (二重回车确认)
  function openPracticeSubmitModal() {
    const text = getCurrentText();
    if (!text) return;
    const status = getCurrentTextPracticeStatus();

    let gridHtml = '<div class="practice-confirm-grid">';
    status.questions.forEach(q => {
      const p = state.practiceAnswers[q.qIndex] || {};
      const val = escapeHtml(p.selected || '-');
      const isEmpty = !p.selected;
      gridHtml += `
        <div class="practice-confirm-cell ${isEmpty ? 'is-empty' : ''}">
          <span class="cell-num">第 ${q.qIndex} 题</span>
          <span class="cell-ans">${val}</span>
        </div>
      `;
    });
    gridHtml += '</div>';

    const htmlContent = `
      <div class="practice-confirm-wrap">
        <div class="practice-confirm-meta">
          <span class="confirm-meta-badge">已作答 ${status.answered}/${status.total} 题</span>
          <span class="confirm-meta-desc">请核对各题选项，确认无误后提交</span>
        </div>
        ${gridHtml}
        <div class="practice-confirm-tip">
          交卷后将即刻判分并展现精读译文、长难句与题眼定位，记录自动存入题库。
        </div>
      </div>
    `;

    if (typeof window.showConfirmModal === 'function') {
      window.showConfirmModal({
        title: `${state.currentYear} 年真题 · Text ${text.number} · 模考交卷`,
        html: htmlContent,
        confirmText: '确认交卷',
        cancelText: '检查修改',
        onConfirm: () => {
          submitWholeTextPractice();
        }
      });
    } else {
      submitWholeTextPractice();
    }
  }

  // 正式交卷：判分、存入 localStorage 并写入 kaoyan_tiku_data.json
  function submitWholeTextPractice() {
    const text = getCurrentText();
    if (!text || !text.questions) return;

    let correctCount = 0;
    text.questions.forEach(q => {
      if (!state.practiceAnswers[q.qIndex]) {
        state.practiceAnswers[q.qIndex] = {};
      }
      const p = state.practiceAnswers[q.qIndex];
      p.submitted = true;
      const isCorrect = (p.selected === q.officialAnswer);
      p.isCorrect = isCorrect;
      if (isCorrect) correctCount++;
      state.mastery[q.qIndex] = isCorrect ? 'proficient' : 'wrong';
    });

    savePracticeStorage();
    saveMasteryStorage();

    renderPassage();
    renderQuestionPills();
    renderQuestion();

    const total = text.questions.length;
    const msg = `Text ${text.number} 答卷已成功提交！答对 ${correctCount}/${total} 题，数据已成功计入题库。`;
    if (typeof window.showToast === 'function') {
      window.showToast(msg, 'success');
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
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
          <span class="q-type-badge" style="font-size:11px;padding:2px 6px;">${escapeHtml(q.type)}</span>
          <span style="font-size:11px;color:var(--text-muted);font-weight:600;">第 ${q.qIndex} 题</span>
        </div>
        <div class="stem-text" style="font-size:15px;line-height:1.45;margin-bottom:0;font-weight:600;">${q.qIndex}. ${escapeHtml(q.stem)}</div>
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

    if (dom.analysisPane) {
      if (window.MarkdownLatexEngine && typeof window.MarkdownLatexEngine.renderMathInElement === 'function') {
        window.MarkdownLatexEngine.renderMathInElement(dom.analysisPane);
      } else if (window.renderMathInElement) {
        try {
          window.renderMathInElement(dom.analysisPane, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false },
              { left: '\\[', right: '\\]', display: true },
              { left: '\\(', right: '\\)', display: false }
            ],
            throwOnError: false
          });
        } catch (e) {}
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
              定位原文 ${sid}
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
      state.practiceAnswers[q.qIndex].submitted = false;
      savePracticeStorage();
      renderOptions(q, false);
      renderQuestionPills();
    } else {
      const opt = q.options.find(o => o.key === key);
      if (opt && opt.refSentences && opt.refSentences.length > 0) {
        locateSentence(opt.refSentences[0], opt.isCorrect ? 'target' : 'distractor');
      } else if (q.targetSentences && q.targetSentences.length > 0) {
        locateSentence(q.targetSentences[0], 'target');
      }
    }
  }

  // 提交做题答案 (兼容转发至整篇提交与二重确认流程)
  function submitPracticeAnswer() {
    handlePracticeEnter();
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
            <span>考研命题人避坑指南与名师复盘</span>
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
        <span>我的做题思考与错因复盘</span>
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
    if (!togglingOff && typeof window.recordStudyActivity === 'function') {
      window.recordStudyActivity();
    }
    // 仅在首次标记（原本无熟练度）时才自动跳到下一题
    if (!togglingOff && !had) {
      navNext();
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

  // 文章区域事件绑定（采用事件委托，完全不受 Math/KaTeX 动态节点替换影响）
  let popoverHideTimer = null;
  let isVocabPinned = false;
  let pinnedWordEl = null;

  function attachPassageEvents() {
    if (!dom.passagePane) return;
    
    // 清除旧的直接事件绑定，改用事件委托挂载在 passagePane 上
    dom.passagePane.onclick = (e) => {
      // 1. 点击生词：永久常驻锁定释义卡片
      const vEl = e.target.closest('.vocab-word');
      if (vEl) {
        if (state.mode === 'practice') return;
        e.stopPropagation();
        const word = vEl.dataset.word;
        const ipa = vEl.dataset.ipa;
        const meaning = vEl.dataset.meaning;

        if (isVocabPinned && pinnedWordEl === vEl) {
          isVocabPinned = false;
          pinnedWordEl = null;
          hideVocabPopover();
        } else {
          isVocabPinned = true;
          pinnedWordEl = vEl;
          clearTimeout(popoverHideTimer);
          showVocabPopover(vEl, word, ipa, meaning, true);
        }
        return;
      }

      // 2. 点击句子：切换单句译文显隐
      const sEl = e.target.closest('.sentence-item');
      if (sEl) {
        if (state.mode === 'practice') return;
        sEl.classList.toggle('show-trans');
        return;
      }
    };

    // 鼠标划入生词：即时浮现释义
    dom.passagePane.onmouseover = (e) => {
      if (state.mode === 'practice') return;
      if (isVocabPinned) return;
      const vEl = e.target.closest('.vocab-word');
      if (vEl) {
        clearTimeout(popoverHideTimer);
        const word = vEl.dataset.word;
        const ipa = vEl.dataset.ipa;
        const meaning = vEl.dataset.meaning;
        showVocabPopover(vEl, word, ipa, meaning, false);
      }
    };

    // 鼠标划出生词：延迟消失（支持无缝滑入浮窗内部）
    dom.passagePane.onmouseout = (e) => {
      if (isVocabPinned) return;
      const vEl = e.target.closest('.vocab-word');
      if (vEl && (!e.relatedTarget || !vEl.contains(e.relatedTarget))) {
        clearTimeout(popoverHideTimer);
        popoverHideTimer = setTimeout(() => {
          hideVocabPopover();
        }, 400);
      }
    };
  }

  // 显示词汇气泡（支持点击常驻锁定与真人发音/收藏）
  function showVocabPopover(anchorEl, word, ipa, meaning, isPinned = false) {
    if (!dom.vocabPopover) {
      dom.vocabPopover = document.getElementById('engVocabPopover');
    }
    if (!dom.vocabPopover) return;
    const pop = dom.vocabPopover;
    const starred = isWordStarred(word);
    
    pop.classList.toggle('pinned', isPinned);
    pop.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;">
        <div>
          <span class="popover-word">${escapeHtml(word)}</span>
          ${ipa ? `<span class="popover-ipa">[${escapeHtml(ipa)}]</span>` : ''}
        </div>
        <div style="display:flex;align-items:center;gap:4px;">
          <button type="button" class="popover-btn" data-pop-action="pronounce" data-audio-type="1" title="英音真人发音">英音</button>
          <button type="button" class="popover-btn" data-pop-action="pronounce" data-audio-type="2" title="美音真人发音">美音</button>
          <button type="button" class="popover-btn ${starred ? 'starred' : ''}" data-pop-action="toggle-star" title="收藏至生词本">${starred ? '已收藏' : '收藏'}</button>
        </div>
      </div>
      <div class="popover-meaning">${escapeHtml(meaning || '暂无释义')}</div>
    `;
    pop.querySelectorAll('button[data-pop-action]').forEach(b => {
      b.onclick = (e) => {
        e.stopPropagation();
        const action = b.dataset.popAction;
        if (action === 'pronounce') {
          const type = parseInt(b.dataset.audioType, 10) || 1;
          playWordPronunciation(word, type);
        } else if (action === 'toggle-star') {
          toggleStarWord(word, { ipa: ipa || '', meaning: meaning || '' });
          const isNowStarred = isWordStarred(word);
          b.classList.toggle('starred', isNowStarred);
          b.textContent = isNowStarred ? '已收藏' : '收藏';
        }
      };
    });
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
    const popHeight = 120;
    let top = rect.bottom + 6;
    if (top + popHeight > window.innerHeight) {
      top = Math.max(10, rect.top - popHeight - 6);
    }
    pop.style.left = `${Math.min(window.innerWidth - 340, Math.max(10, rect.left))}px`;
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
        if (dom.layout) dom.layout.classList.toggle('show-all-trans', state.showAllTranslation);
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

  // ===== 滚轮手势与右键切文章系统（仿照数学题库逻辑） =====
  let _isRightMouseDown = false;
  let _suppressNextContextMenu = false;
  let _rwAccum = 0, _rwLocked = false, _rwTimer = null;
  let _wDir = null, _wAccum = 0, _wLocked = false, _wTimer = null, _wIsMouse = false;

  function setupWheelAndRightClickGestures() {
    document.addEventListener('mousedown', function (e) {
      if (e.button === 2) _isRightMouseDown = true;
    }, true);

    document.addEventListener('mouseup', function (e) {
      if (e.button === 2) {
        _isRightMouseDown = false;
        _rwAccum = 0;
        _rwLocked = false;
        if (_rwTimer) { clearTimeout(_rwTimer); _rwTimer = null; }
        if (_suppressNextContextMenu) {
          setTimeout(function () { _suppressNextContextMenu = false; }, 200);
        }
      }
    }, true);

    window.addEventListener('blur', function () {
      _isRightMouseDown = false;
      _suppressNextContextMenu = false;
      _rwAccum = 0;
      _rwLocked = false;
      if (_rwTimer) { clearTimeout(_rwTimer); _rwTimer = null; }
    });

    document.addEventListener('contextmenu', function (e) {
      if (_suppressNextContextMenu) {
        e.preventDefault();
        e.stopPropagation();
        _suppressNextContextMenu = false;
      }
    }, true);

    document.addEventListener('wheel', function (e) {
      const isAppActive = window.curSubjectId === 'english' || (dom.layout && dom.layout.style.display !== 'none');
      if (!isAppActive) return;

      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;

      // 模态框打开时禁止滚轮切题/切文章
      const confirmModal = document.getElementById('confirmModal');
      if (confirmModal && confirmModal.style.display !== 'none') return;
      const isModalOpen = (dom.modalVocabBook && dom.modalVocabBook.classList.contains('show')) ||
                          (dom.modalHelp && dom.modalHelp.classList.contains('active')) ||
                          !!window.subjectPickerOpen;
      if (isModalOpen) return;

      const dx = e.deltaX || 0, dy = e.deltaY || 0;
      const isRightClick = ((e.buttons & 2) !== 0) || _isRightMouseDown;

      // ===== 右键 + 滚轮：切文章 (等效 W / S) =====
      if (isRightClick) {
        e.preventDefault();
        _suppressNextContextMenu = true;

        if (_rwTimer) clearTimeout(_rwTimer);
        _rwTimer = setTimeout(function () {
          _rwAccum = 0;
          _rwLocked = false;
          _rwTimer = null;
        }, 250);

        if (_rwLocked) return;

        const delta = Math.abs(dy) >= Math.abs(dx) ? dy : dx;
        _rwAccum += delta;

        if (Math.abs(_rwAccum) >= 20) {
          if (_rwAccum > 0) {
            // 滚轮向下 / 向右：下一篇 (S)
            navNextText();
          } else {
            // 滚轮向上 / 向左：上一篇 (W)
            navPrevText();
          }
          _rwLocked = true;
          _rwAccum = 0;
        }
        return;
      }

      // ===== 单独滚轮切题 (等效 A / D) =====
      const absDX = Math.abs(dx), absDY = Math.abs(dy);

      // 判定滚轮触发区域
      const inAnalysisPane = e.target.closest && e.target.closest('.analysis-pane, #analysisPane, .question-toolbar, .question-pills, .options-list, .stem-card');
      const inPassagePane = e.target.closest && e.target.closest('.passage-pane, #passagePane');

      // 若在文章阅读区且为纯纵向滚轮：允许原生上下滚动文章内容阅读，不劫持
      if (inPassagePane && absDY > absDX * 1.5) {
        return;
      }

      // 重置计时器
      if (_wTimer) clearTimeout(_wTimer);
      _wTimer = setTimeout(function () {
        _wDir = null; _wAccum = 0; _wLocked = false; _wTimer = null; _wIsMouse = false;
      }, 300);

      if (_wLocked) return;

      // 1. 若在题目区/选项区/做题卡片区（无论是纵向还是横向手势）：
      if (inAnalysisPane) {
        const delta = Math.abs(dy) >= Math.abs(dx) ? dy : dx;
        if (Math.abs(delta) < 4) return;
        _wAccum += delta;
        if (Math.abs(_wAccum) > 15) {
          if (_wAccum > 0) navNext();
          else navPrev();
          _wLocked = true;
          _wAccum = 0;
        }
        return;
      }

      // 2. 在其他区域的横向手势（触控板两指左右横滑或水平滚轮，仿照数学题库）
      if (_wDir === null) {
        if (absDX > absDY * 1.5 && absDX > 4) {
          _wDir = 'h';
          _wIsMouse = absDX >= 50;
        } else if (absDY > absDX * 1.5 && absDY > 4) {
          _wDir = 'v';
        } else {
          return;
        }
      }

      if (_wDir === 'v') return;

      _wAccum += dx;
      if (Math.abs(_wAccum) > 15) {
        if (_wIsMouse) {
          if (_wAccum > 0) navNext();
          else navPrev();
        } else {
          if (_wAccum > 0) navPrev();
          else navNext();
        }
        _wLocked = true;
        _wAccum = 0;
      }
    }, { passive: false });
  }

  // 供键盘与外部调用的选项选择
  function selectOption(qIndex, key) {
    if (qIndex != null && qIndex !== state.currentQIndex) {
      switchQuestion(qIndex);
    }
    onOptionClick(key);
  }

  // 键盘快捷键支持
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      const isAppActive = window.curSubjectId === 'english' || (dom.layout && dom.layout.style.display !== 'none');
      if (!isAppActive) return;
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

      // 0. 模考交卷确认弹窗激活态安全拦截（二重回车确认与 Esc 撤销）：
      const confirmModal = document.getElementById('confirmModal');
      if (confirmModal && confirmModal.style.display !== 'none') {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (typeof window.closeConfirmModal === 'function') window.closeConfirmModal(true);
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          if (typeof window.closeConfirmModal === 'function') window.closeConfirmModal(false);
          return;
        }
        return; // 弹窗处于打开状态时，独占响应
      }

      // 弹窗激活态安全拦截（生词本自测 / 英语帮助 / 科目选择器）：
      // 弹窗处于打开状态时，独占响应 Esc 关闭，彻底阻止题目做题快捷键向底层泄露
      const isModalOpen = (dom.modalVocabBook && dom.modalVocabBook.classList.contains('show')) ||
                          (dom.modalHelp && dom.modalHelp.classList.contains('active')) ||
                          !!window.subjectPickerOpen;
      if (isModalOpen) {
        if (e.key === 'Escape') {
          closeYearDropdown();
          closeVocabNotebook();
          hideVocabPopover();
          if (typeof window.closeSubjectPicker === 'function') window.closeSubjectPicker();
          if (dom.modalHelp) dom.modalHelp.classList.remove('active');
        }
        return;
      }

      // 全局通用快捷键（考研英语专属控制）
      // 注：Y (主题切换) 与 G (科目切换) 已由主系统 app.js 单轨处理，此处不再重复监听，消除双重翻转抵消 Bug
      if (e.key === 't' || e.key === 'T') {
        if (dom.btnToggleTrans) dom.btnToggleTrans.click();
        return;
      }
      if (e.key === 'h' || e.key === 'H') {
        if (dom.btnHelp) dom.btnHelp.click();
        return;
      }
      if (e.key === 'Escape') {
        closeYearDropdown();
        closeVocabNotebook();
        hideVocabPopover();
        if (typeof window.closeSubjectPicker === 'function') window.closeSubjectPicker();
        if (dom.modalHelp) dom.modalHelp.classList.remove('active');
        return;
      }

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

      const keyLow = e.key.toLowerCase();

      // 年份切换: Q (上一年) / E (下一年) (仅适配 2007~2015 年真题)
      if (keyLow === 'q') {
        e.preventDefault();
        navPrevYear();
        return;
      }
      if (keyLow === 'e') {
        e.preventDefault();
        navNextYear();
        return;
      }

      // 篇章切换: W (上一篇) / S (下一篇)
      if (keyLow === 'w') {
        e.preventDefault();
        navPrevText();
        return;
      }
      if (keyLow === 's') {
        e.preventDefault();
        navNextText();
        return;
      }

      // 小题切换: A (上一题) / D (下一题) 或方向键
      if (keyLow === 'a' || e.key === 'ArrowLeft') {
        e.preventDefault();
        navPrev();
        return;
      }
      if (keyLow === 'd' || e.key === 'ArrowRight') {
        e.preventDefault();
        navNext();
        return;
      }

      // 选项选择: 1 / 2 / 3 / 4 -> A / B / C / D
      if (['1', '2', '3', '4'].includes(e.key)) {
        const optionKeys = ['A', 'B', 'C', 'D'];
        const opt = optionKeys[parseInt(e.key, 10) - 1];
        if (opt) selectOption(q.qIndex, opt);
        return;
      }

      // 做题模式下的 Enter 整篇提交与二重确认
      if (e.key === 'Enter' && state.mode === 'practice') {
        e.preventDefault();
        handlePracticeEnter();
        return;
      }

      if (keyLow === 'z') { setMastery(q.qIndex, 'proficient'); }
      else if (keyLow === 'x') { setMastery(q.qIndex, 'vague'); }
      else if (keyLow === 'c') { setMastery(q.qIndex, 'wrong'); }
      else if (keyLow === 'm') {
        if (state.mode === 'analysis' && dom.btnPracticeMode) dom.btnPracticeMode.click();
        else if (dom.btnAnalysisMode) dom.btnAnalysisMode.click();
      }
      else if (keyLow === 'u') {
        if (typeof window.toggleImageDarkFilter === 'function') window.toggleImageDarkFilter();
      }
    });
  }

  function setMode(m) {
    if (m !== 'analysis' && m !== 'practice') return;
    state.mode = m;
    if (window.StorageEngine && window.StorageEngine.GlobalStore) {
      window.StorageEngine.GlobalStore.set('english_mode', m);
    }
    saveResume();
    updateModeClass();
    renderPassage();
    renderQuestionPills();
    renderQuestion();
  }

  function escapeHtml(str) {
    if (str === undefined || str === null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // 安全渲染带有数学公式与生词高亮的句子（基于非重叠区间与公式保护，彻底杜绝 HTML 属性污染、标签破坏与乱码）
  function renderAnnotatedSentenceText(rawText, vocabList) {
    if (!rawText) return '';
    
    // 1. 提取并保护所有 LaTeX 数学公式 ($...$, $$...$$, \[...\], \(...\))
    const mathPlaceholders = [];
    let safeText = rawText.replace(/(\$\$[\s\S]*?\$\$|\$[^\$]+?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g, (m) => {
      const idx = mathPlaceholders.length;
      mathPlaceholders.push(m);
      return `___MATH_PH_${idx}___`;
    });

    if (!vocabList || vocabList.length === 0) {
      safeText = escapeHtml(safeText);
      return safeText.replace(/___MATH_PH_(\d+)___/g, (m, idx) => mathPlaceholders[parseInt(idx, 10)] || '');
    }

    // 2. 标记所有数学占位符位置为占用，禁止单词替换命中占位符内部
    const sortedVocab = [...vocabList].sort((a, b) => (b.word.length - a.word.length));
    const occupied = new Uint8Array(safeText.length);
    
    const phRegex = /___MATH_PH_\d+___/g;
    let phMatch;
    while ((phMatch = phRegex.exec(safeText)) !== null) {
      for (let i = phMatch.index; i < phMatch.index + phMatch[0].length; i++) {
        occupied[i] = 1;
      }
    }

    const matches = [];

    // 3. 寻找所有匹配区间（长词优先），杜绝嵌套与属性破坏
    sortedVocab.forEach(v => {
      if (!v.word) return;
      const wordEsc = escapeRegExp(v.word);
      const regex = new RegExp(`(?<![a-zA-Z0-9_])(${wordEsc})(?![a-zA-Z0-9_])`, 'gi');
      let m;
      while ((m = regex.exec(safeText)) !== null) {
        const start = m.index;
        const end = start + m[0].length;
        
        let hasOverlap = false;
        for (let i = start; i < end; i++) {
          if (occupied[i]) {
            hasOverlap = true;
            break;
          }
        }

        if (!hasOverlap) {
          for (let i = start; i < end; i++) occupied[i] = 1;
          matches.push({
            start,
            end,
            rawText: m[0],
            vocab: v
          });
        }
      }
    });

    // 4. 按起始位置升序排列，单趟线性拼接 HTML
    matches.sort((a, b) => a.start - b.start);
    
    let result = '';
    let lastIdx = 0;
    matches.forEach(item => {
      if (item.start > lastIdx) {
        result += escapeHtml(safeText.slice(lastIdx, item.start));
      }
      const v = item.vocab;
      const lvl = v.level === 'purple' ? 'blue' : (v.level || 'green');
      result += `<span class="vocab-word level-${escapeHtml(lvl)}" data-word="${escapeHtml(v.word)}" data-ipa="${escapeHtml(v.ipa || '')}" data-meaning="${escapeHtml(v.meaning || '')}">${escapeHtml(item.rawText)}</span>`;
      lastIdx = item.end;
    });

    if (lastIdx < safeText.length) {
      result += escapeHtml(safeText.slice(lastIdx));
    }

    // 5. 还原 LaTeX 数学公式
    result = result.replace(/___MATH_PH_(\d+)___/g, (m, idx) => {
      return mathPlaceholders[parseInt(idx, 10)] || '';
    });

    return result;
  }

  // 安全渲染带有数学公式与中文生词高亮的译文（基于非重叠区间与公式保护）
  function renderAnnotatedTranslation(rawTrans, vocabList) {
    if (!rawTrans) return '';
    
    // 1. 提取并保护所有 LaTeX 数学公式 ($...$, $$...$$, \[...\], \(...\))
    const mathPlaceholders = [];
    let safeText = rawTrans.replace(/(\$\$[\s\S]*?\$\$|\$[^\$]+?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g, (m) => {
      const idx = mathPlaceholders.length;
      mathPlaceholders.push(m);
      return `___MATH_PH_${idx}___`;
    });

    if (!vocabList || vocabList.length === 0) {
      safeText = escapeHtml(safeText);
      return safeText.replace(/___MATH_PH_(\d+)___/g, (m, idx) => mathPlaceholders[parseInt(idx, 10)] || '');
    }

    // 2. 从 vocabList 中收集所有候选中文词汇（优先使用显式对齐字段 v.zh）
    const candidateTerms = [];
    vocabList.forEach(v => {
      if (v.zh && v.zh.trim().length >= 1) {
        candidateTerms.push({
          term: v.zh.trim(),
          vocab: v
        });
      }
      if (v.meaning) {
        let cleanMeaning = v.meaning.replace(/（[^）]*）|\([^)]*\)/g, '');
        const parts = cleanMeaning.split(/[,，、;；/ \s]+/);
        parts.forEach(p => {
          const cnMatches = p.match(/[\u4e00-\u9fa5]{2,}/g);
          if (cnMatches) {
            cnMatches.forEach(term => {
              if (term.length >= 2) {
                candidateTerms.push({
                  term,
                  vocab: v
                });
              }
            });
          }
        });
      }
    });

    if (candidateTerms.length === 0) {
      safeText = escapeHtml(safeText);
      return safeText.replace(/___MATH_PH_(\d+)___/g, (m, idx) => mathPlaceholders[parseInt(idx, 10)] || '');
    }

    // 按词长降序排列（长词优先匹配）
    candidateTerms.sort((a, b) => b.term.length - a.term.length);

    // 3. 标记所有数学占位符位置为占用
    const occupied = new Uint8Array(safeText.length);
    const phRegex = /___MATH_PH_\d+___/g;
    let phMatch;
    while ((phMatch = phRegex.exec(safeText)) !== null) {
      for (let i = phMatch.index; i < phMatch.index + phMatch[0].length; i++) {
        occupied[i] = 1;
      }
    }

    const matches = [];

    // 4. 寻找所有匹配区间（长词优先），杜绝嵌套
    candidateTerms.forEach(item => {
      const termEsc = escapeRegExp(item.term);
      const regex = new RegExp(termEsc, 'g');
      let m;
      while ((m = regex.exec(safeText)) !== null) {
        const start = m.index;
        const end = start + m[0].length;
        
        let hasOverlap = false;
        for (let i = start; i < end; i++) {
          if (occupied[i]) {
            hasOverlap = true;
            break;
          }
        }

        if (!hasOverlap) {
          for (let i = start; i < end; i++) occupied[i] = 1;
          matches.push({
            start,
            end,
            rawText: m[0],
            vocab: item.vocab
          });
        }
      }
    });

    // 5. 按起始位置升序排列，单趟拼接 HTML
    matches.sort((a, b) => a.start - b.start);
    
    let result = '';
    let lastIdx = 0;
    matches.forEach(item => {
      if (item.start > lastIdx) {
        result += escapeHtml(safeText.slice(lastIdx, item.start));
      }
      const v = item.vocab;
      const lvl = v.level === 'purple' ? 'blue' : (v.level || 'green');
      result += `<span class="vocab-word trans-vocab-word level-${escapeHtml(lvl)}" data-word="${escapeHtml(v.word)}" data-ipa="${escapeHtml(v.ipa || '')}" data-meaning="${escapeHtml(v.meaning || '')}">${escapeHtml(item.rawText)}</span>`;
      lastIdx = item.end;
    });

    if (lastIdx < safeText.length) {
      result += escapeHtml(safeText.slice(lastIdx));
    }

    // 6. 还原 LaTeX 数学公式
    result = result.replace(/___MATH_PH_(\d+)___/g, (m, idx) => {
      return mathPlaceholders[parseInt(idx, 10)] || '';
    });

    return result;
  }

  window.englishApp = {
    init,
    activate,
    saveResume,
    loadResume,
    switchYear,
    switchText,
    switchQuestion,
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
    selectOption,
    navPrev,
    navNext,
    navPrevText,
    navNextText,
    navPrevYear,
    navNextYear,
    handlePracticeEnter,
    submitWholeTextPractice,
    openPracticeSubmitModal,
    getCurrentTextPracticeStatus,
    ADAPTED_YEARS,
    openFigureLightbox,
    renderQuestion,
    get state() { return state; },
    get curDataset() { return getCurrentDataset(); }
  };
  window.kyApp = window.englishApp;
  window.kyEnglishApp = window.englishApp;

  document.addEventListener('DOMContentLoaded', init);
})();