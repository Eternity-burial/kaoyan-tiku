/**
 * 考研英语一 · 智能精读与题型分析系统 核心应用逻辑 (SPA 多年份可扩展模块)
 * 数据存储于：题库/英语一/data_YYYY.js (注册至 window.ENGLISH_DATA['YYYY'])
 * 配色体系：清华紫品牌主色 (#660874) + 纯净模考与沉浸精读双轨引擎
 */

(function () {
  'use strict';

  // 全局状态
  const state = {
    currentYear: localStorage.getItem('ky_english_current_year') || '2010',
    currentTextId: 'text1',
    currentQIndex: 21,
    mode: 'analysis', // 'analysis' (精读解析) | 'practice' (模考做题)
    typeFilter: 'all',
    showAllTranslation: false,
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
      yearSelect: document.getElementById('engYearSelect'),
      passagePane: document.getElementById('engPassagePane'),
      analysisPane: document.getElementById('engAnalysisPane'),
      textTabs: document.getElementById('engTextTabs'),
      typeFilterBar: document.getElementById('engTypeFilterBar'),
      questionPills: document.getElementById('engQuestionPills'),
      stemCard: document.getElementById('engStemCard'),
      optionsList: document.getElementById('engOptionsList'),
      reflectionCard: document.getElementById('engReflectionCard'),
      btnToggleTrans: document.getElementById('engBtnToggleTrans'),
      btnPracticeMode: document.getElementById('engBtnPracticeMode'),
      btnAnalysisMode: document.getElementById('engBtnAnalysisMode'),
      vocabPopover: document.getElementById('engVocabPopover'),
      modalHelp: document.getElementById('engModalHelp'),
      btnHelp: document.getElementById('engBtnHelp'),
      btnCloseHelp: document.getElementById('engBtnCloseHelp'),
      btnSwitchSubjectHeader: document.getElementById('engBtnSwitchSubjectHeader')
    };
  }

  // 获取所有已加载的真题年份
  function getAvailableYears() {
    if (!window.ENGLISH_DATA) return ['2010'];
    const years = Object.keys(window.ENGLISH_DATA);
    return years.length > 0 ? years.sort() : ['2010'];
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

  // 渲染年份下拉选择器
  function renderYearSelector() {
    if (!dom.yearSelect) return;
    const years = getAvailableYears();
    dom.yearSelect.innerHTML = '';
    years.forEach(y => {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = `${y} 年真题`;
      opt.selected = (y === state.currentYear);
      dom.yearSelect.appendChild(opt);
    });
    dom.yearSelect.onchange = (e) => switchYear(e.target.value);
  }

  // 切换年份
  function switchYear(year) {
    if (!window.ENGLISH_DATA || !window.ENGLISH_DATA[year]) return;
    state.currentYear = year;
    localStorage.setItem('ky_english_current_year', year);
    loadYearStorage();

    const dataset = getCurrentDataset();
    if (dataset.texts && dataset.texts.length > 0) {
      state.currentTextId = dataset.texts[0].id;
      state.currentQIndex = dataset.texts[0].questions[0].qIndex;
    }

    renderYearSelector();
    renderTextTabs();
    renderTypeFilter();
    renderPassage();
    renderQuestionPills();
    renderQuestion();
  }

  // 初始化应用
  function init() {
    initDom();
    if (!dom.passagePane) return;
    if (state.initialized) return;
    state.initialized = true;

    loadYearStorage();
    renderYearSelector();
    renderTextTabs();
    renderTypeFilter();
    
    const dataset = getCurrentDataset();
    if (dataset.texts && dataset.texts.length > 0) {
      switchText(dataset.texts[0].id, dataset.texts[0].questions[0].qIndex);
    }

    setupEventListeners();
    setupKeyboardShortcuts();
    updateModeClass();
  }

  function activate() {
    initDom();
    if (!state.initialized) {
      init();
    } else {
      loadYearStorage();
      renderYearSelector();
      renderTextTabs();
      renderTypeFilter();
      renderPassage();
      renderQuestionPills();
      renderQuestion();
      updateModeClass();
    }
  }

  // 更新容器模式 class
  function updateModeClass() {
    if (!dom.layout) return;
    if (state.mode === 'practice') {
      dom.layout.classList.add('mode-practice-active');
      if (dom.btnPracticeMode) dom.btnPracticeMode.classList.add('active');
      if (dom.btnAnalysisMode) dom.btnAnalysisMode.classList.remove('active');
      if (dom.btnToggleTrans) dom.btnToggleTrans.style.display = 'none';
    } else {
      dom.layout.classList.remove('mode-practice-active');
      if (dom.btnAnalysisMode) dom.btnAnalysisMode.classList.add('active');
      if (dom.btnPracticeMode) dom.btnPracticeMode.classList.remove('active');
      if (dom.btnToggleTrans) dom.btnToggleTrans.style.display = 'inline-flex';
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

  // 切换 Text
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

  // 切换题目 (跨篇章自动同步)
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
    renderQuestionPills();
    renderQuestion();
    if (state.mode === 'analysis') {
      highlightCurrentQuestionGrounding();
    }
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

    if (isPractice && !pAns.submitted) {
      dom.stemCard.innerHTML = `
        <div class="stem-text" style="font-size:16px;margin-bottom:0;">${q.qIndex}. ${escapeHtml(q.stem)}</div>
      `;
    } else {
      dom.stemCard.innerHTML = `
        <div class="stem-header">
          <span class="q-type-badge">${escapeHtml(q.type)}</span>
          <span class="tangchi-badge">${escapeHtml(q.tangchiModel || '唐迟解题模型')}</span>
        </div>
        <div class="stem-text">${q.qIndex}. ${escapeHtml(q.stem)}</div>
        <div class="stem-keywords">
          <span style="font-size:11px;color:#94a3b8;font-weight:600;">定位关键词:</span>
          ${(q.stemKeywords || []).map(k => `<span class="keyword-tag">#${escapeHtml(k)}</span>`).join('')}
        </div>
      `;
    }

    renderOptions(q);

    if (dom.reflectionCard) {
      if (isSubmitted) {
        dom.reflectionCard.style.display = 'block';
        renderReflection(q);
      } else {
        dom.reflectionCard.style.display = 'none';
      }
    }
  }

  // 渲染选项列表
  function renderOptions(q) {
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
      if (isSubmitted) {
        if (opt.isCorrect) cardClass += ' is-correct';
        else if (isSelected && !opt.isCorrect) cardClass += ' is-distractor';
      }

      card.className = cardClass;

      let analysisHtml = '';
      if (isSubmitted) {
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
      renderOptions(q);
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
  function renderReflection(q) {
    if (!dom.reflectionCard) return;
    const noteData = state.notes[q.qIndex] || { mistakeTag: '', text: '' };
    const curMastery = state.mastery[q.qIndex] || 'unmarked';

    const reasons = ['定位偏差', '生词卡壳', '逻辑倒置', '过度推理', '偷换概念', '粗心看漏'];

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

  // 记录掌握状态 (按当前年份存储)
  function setMastery(qIndex, status) {
    if (state.mastery[qIndex] === status) {
      delete state.mastery[qIndex];
    } else {
      state.mastery[qIndex] = status;
    }
    localStorage.setItem(`ky_english_mastery_${state.currentYear}`, JSON.stringify(state.mastery));
    renderQuestionPills();
    renderReflection(getCurrentQuestion());
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
  function attachPassageEvents() {
    if (!dom.passagePane) return;
    dom.passagePane.querySelectorAll('.vocab-word').forEach(vEl => {
      vEl.addEventListener('mouseenter', (e) => {
        if (state.mode === 'practice') return;
        const word = vEl.dataset.word;
        const ipa = vEl.dataset.ipa;
        const meaning = vEl.dataset.meaning;
        showVocabPopover(e, word, ipa, meaning);
      });
      vEl.addEventListener('mouseleave', () => {
        hideVocabPopover();
      });
    });

    dom.passagePane.querySelectorAll('.sentence-item').forEach(sEl => {
      sEl.addEventListener('click', () => {
        if (state.mode === 'practice') return;
        sEl.classList.toggle('show-trans');
      });
    });
  }

  // 显示词汇气泡
  function showVocabPopover(e, word, ipa, meaning) {
    if (!dom.vocabPopover) return;
    const pop = dom.vocabPopover;
    pop.innerHTML = `
      <div>
        <span class="popover-word">${escapeHtml(word)}</span>
        <span class="popover-ipa">[${escapeHtml(ipa)}]</span>
      </div>
      <div class="popover-meaning">${escapeHtml(meaning)}</div>
    `;
    pop.style.display = 'block';

    const rect = e.target.getBoundingClientRect();
    pop.style.left = `${Math.min(window.innerWidth - 300, Math.max(10, rect.left))}px`;
    pop.style.top = `${rect.bottom + 8}px`;
  }

  function hideVocabPopover() {
    if (dom.vocabPopover) dom.vocabPopover.style.display = 'none';
  }

  // 设置事件监听
  function setupEventListeners() {
    if (dom.btnSwitchSubjectHeader) {
      dom.btnSwitchSubjectHeader.onclick = () => {
        if (typeof window.openSubjectPicker === 'function') {
          window.openSubjectPicker();
        }
      };
    }

    if (dom.btnToggleTrans) {
      dom.btnToggleTrans.onclick = () => {
        if (state.mode === 'practice') return;
        state.showAllTranslation = !state.showAllTranslation;
        if (dom.passagePane) dom.passagePane.classList.toggle('show-all-trans', state.showAllTranslation);
        dom.btnToggleTrans.classList.toggle('active', state.showAllTranslation);
      };
    }

    if (dom.btnPracticeMode) {
      dom.btnPracticeMode.onclick = () => {
        state.mode = 'practice';
        updateModeClass();
        renderPassage();
        renderQuestionPills();
        renderQuestion();
      };
    }

    if (dom.btnAnalysisMode) {
      dom.btnAnalysisMode.onclick = () => {
        state.mode = 'analysis';
        updateModeClass();
        renderPassage();
        renderQuestionPills();
        renderQuestion();
      };
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

      if (e.key === '1' || e.key === 'a' || e.key === 'A') { onOptionClick('A'); }
      else if (e.key === '2' || e.key === 'b' || e.key === 'B') { onOptionClick('B'); }
      else if (e.key === '3' || e.key === 'c' || e.key === 'C') { onOptionClick('C'); }
      else if (e.key === '4' || e.key === 'd' || e.key === 'D') { onOptionClick('D'); }
      else if (e.key === 'q' || e.key === 'Q' || e.key === 'ArrowLeft') {
        navPrev();
      }
      else if (e.key === 'e' || e.key === 'E' || e.key === 'ArrowRight') {
        navNext();
      }
      else if (e.key === 'g' || e.key === 'G') {
        if (typeof window.openSubjectPicker === 'function') {
          window.openSubjectPicker();
        }
      }
      else if (e.key === 'Escape') {
        if (typeof window.closeSubjectPicker === 'function') window.closeSubjectPicker();
        if (dom.modalHelp) dom.modalHelp.classList.remove('active');
      }
      else if (e.key === 'z' || e.key === 'Z') { setMastery(q.qIndex, 'proficient'); }
      else if (e.key === 'x' || e.key === 'X') { setMastery(q.qIndex, 'vague'); }
      else if (e.key === 'c' || e.key === 'C') { setMastery(q.qIndex, 'wrong'); }
      else if (e.key === 't' || e.key === 'T') { if (dom.btnToggleTrans) dom.btnToggleTrans.click(); }
      else if (e.key === 'm' || e.key === 'M') {
        if (state.mode === 'analysis' && dom.btnPracticeMode) dom.btnPracticeMode.click();
        else if (dom.btnAnalysisMode) dom.btnAnalysisMode.click();
      }
      else if (e.key === 'h' || e.key === 'H') { if (dom.btnHelp) dom.btnHelp.click(); }
      else if (e.key === 'Enter' && state.mode === 'practice') {
        submitPracticeAnswer();
      }
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  window.kyApp = {
    init,
    activate,
    switchYear,
    locateSentence,
    setMastery,
    setMistakeReason,
    onNoteInput,
    submitPracticeAnswer
  };

  document.addEventListener('DOMContentLoaded', init);
})();