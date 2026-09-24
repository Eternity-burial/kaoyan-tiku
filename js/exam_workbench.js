/**
 * 考研数学考点与破题诀专题工作台逻辑引擎 (exam_workbench.js)
 *
 * 核心交互：
 * 1. 三维模式切换 (考点题型 / 研砖破题诀 / 知识点理论)
 * 2. 考点树与同类题即时加载与多维过滤
 * 3. 研砖 199 破题诀讲义抽屉与招式拓扑快速穿梭
 * 4. 视觉题图、题眼信号 (Signals)、解题骨架与避坑警示深度呈现
 * 5. 全键盘优先操作与无缝跳回主刷题台
 */

(function () {
  'use strict';

  // 全局状态
  var currentMode = 'exam'; // 'exam' | 'method' | 'knowledge'
  var activeExamPointId = null;
  var activeMethodId = null;
  var activeKpId = null;
  var searchQuery = '';

  var registry = null;
  var questionIndex = null;
  var taxonomyTree = null;
  var chaptersMap = null;

  // DOM 元素引用
  var dom = {
    tabs: null,
    search: null,
    sidebarTitle: null,
    sidebarList: null,
    bannerTitle: null,
    bannerDesc: null,
    bannerCount: null,
    questionStream: null,
    drawer: null,
    drawerBackdrop: null,
    drawerTitle: null,
    drawerBody: null,
    btnTheme: null
  };

  // 初始化入口
  document.addEventListener('DOMContentLoaded', function () {
    cacheDom();
    bindEvents();
    initTheme();
    loadData();
  });

  function cacheDom() {
    dom.tabs = document.querySelectorAll('.ew-tab-btn');
    dom.search = document.getElementById('ewSearchInput');
    dom.sidebarTitle = document.getElementById('ewSidebarTitle');
    dom.sidebarList = document.getElementById('ewSidebarList');
    dom.bannerTitle = document.getElementById('ewBannerTitle');
    dom.bannerDesc = document.getElementById('ewBannerDesc');
    dom.bannerCount = document.getElementById('ewBannerCount');
    dom.questionStream = document.getElementById('ewQuestionStream');
    dom.drawer = document.getElementById('ewDrawer');
    dom.drawerBackdrop = document.getElementById('ewDrawerBackdrop');
    dom.drawerTitle = document.getElementById('ewDrawerTitle');
    dom.drawerBody = document.getElementById('ewDrawerBody');
    dom.btnTheme = document.getElementById('btnTheme');
  }

  function bindEvents() {
    // 模式切换
    dom.tabs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var mode = btn.dataset.mode;
        setMode(mode);
      });
    });

    // 搜索
    if (dom.search) {
      dom.search.addEventListener('input', function (e) {
        searchQuery = (e.target.value || '').trim().toLowerCase();
        renderSidebar();
      });
    }

    // 抽屉关闭
    var btnCloseDrawer = document.getElementById('ewDrawerClose');
    if (btnCloseDrawer) {
      btnCloseDrawer.addEventListener('click', closeDrawer);
    }
    if (dom.drawerBackdrop) {
      dom.drawerBackdrop.addEventListener('click', closeDrawer);
    }

    // 主题切换
    if (dom.btnTheme) {
      dom.btnTheme.addEventListener('click', toggleTheme);
    }

    // 全局快捷键
    window.addEventListener('keydown', handleGlobalKeydown);
  }

  function initTheme() {
    var saved = localStorage.getItem('kaoyan.g.theme');
    if (saved === 'dark' || (!saved && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }

  function toggleTheme() {
    var cur = document.documentElement.getAttribute('data-theme') || 'light';
    var next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('kaoyan.g.theme', next);
    } catch (e) {}
  }

  function handleGlobalKeydown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      if (e.key === 'Escape') {
        e.target.blur();
      }
      return;
    }

    if (e.key === 'Escape') {
      closeDrawer();
    } else if (e.key === '1') {
      setMode('exam');
    } else if (e.key === '2') {
      setMode('method');
    } else if (e.key === '3') {
      setMode('knowledge');
    } else if (e.key === '/' || e.key === 's') {
      e.preventDefault();
      if (dom.search) dom.search.focus();
    } else if (e.key === 't' || e.key === 'T') {
      toggleTheme();
    }
  }

  // 加载数据
  async function loadData() {
    try {
      showLoading('正在加载考点中枢与题目图谱...');
      var [resReg, resIdx, resTree] = await Promise.all([
        fetch('data/exam_system/exam_points_registry.json').then(r => r.json()),
        fetch('data/exam_system/question_exam_index.json').then(r => r.json()),
        fetch('data/exam_system/taxonomy_tree.json').then(r => r.json())
      ]);

      registry = resReg;
      questionIndex = resIdx;
      taxonomyTree = resTree;

      // 初始渲染侧栏
      renderSidebar();

      // 检查 URL 是否携带特定 qid
      var urlParams = new URLSearchParams(window.location.search);
      var urlQid = urlParams.get('qid');
      if (urlQid && questionIndex[urlQid]) {
        var qObj = questionIndex[urlQid];
        if (qObj.exam_point_ids && qObj.exam_point_ids.length > 0) {
          selectExamPoint(qObj.exam_point_ids[0]);
        } else if (qObj.method_ids && qObj.method_ids.length > 0) {
          selectMethod(qObj.method_ids[0]);
        } else {
          autoSelectInitialItem();
        }
      } else {
        autoSelectInitialItem();
      }
    } catch (err) {
      console.error('加载考点系统数据失败:', err);
      showError('加载考点数据失败，请确认 data/exam_system 资源完整。');
    }
  }

  function buildChapterImageMap() {
    chaptersMap = new Map();
    if (typeof window.SUBJECTS !== 'undefined' && Array.isArray(window.SUBJECTS)) {
      window.SUBJECTS.forEach(sub => {
        (sub.chapters || []).forEach(ch => {
          if (ch.uid) chaptersMap.set(ch.uid, ch);
          if (ch.id) chaptersMap.set(ch.id, ch);
        });
      });
    }
  }

  function setMode(mode) {
    if (currentMode === mode) return;
    currentMode = mode;
    dom.tabs.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    renderSidebar();
    autoSelectInitialItem();
  }

  function autoSelectInitialItem() {
    if (currentMode === 'exam') {
      // 默认选择第一个包含题目的考点
      for (const disc of taxonomyTree) {
        for (const ch of disc.chapters) {
          if (ch.exam_points && ch.exam_points.length > 0) {
            selectExamPoint(ch.exam_points[0].id);
            return;
          }
        }
      }
    } else if (currentMode === 'method') {
      // 默认选择 GS01-M01
      selectMethod('GS01-M01');
    } else if (currentMode === 'knowledge') {
      // 默认选择第一个知识点
      var firstKpId = Object.keys(registry.knowledge_points)[0];
      if (firstKpId) selectKnowledgePoint(firstKpId);
    }
  }

  // 渲染左侧导航侧栏
  function renderSidebar() {
    if (!registry) return;

    if (currentMode === 'exam') {
      dom.sidebarTitle.textContent = '题型考点分类树';
      renderExamPointsTree();
    } else if (currentMode === 'method') {
      dom.sidebarTitle.textContent = '研砖 199 破题诀招式库';
      renderMethodsList();
    } else if (currentMode === 'knowledge') {
      dom.sidebarTitle.textContent = '理论知识点索引';
      renderKnowledgeList();
    }
  }

  // 1. 渲染考点树
  function renderExamPointsTree() {
    dom.sidebarList.innerHTML = '';
    var frag = document.createDocumentFragment();

    taxonomyTree.forEach(disc => {
      var groupTitle = document.createElement('div');
      groupTitle.className = 'ew-group-title';
      groupTitle.textContent = disc.discipline;
      frag.appendChild(groupTitle);

      disc.chapters.forEach(ch => {
        var filteredEps = ch.exam_points.filter(ep => {
          if (!searchQuery) return true;
          return ep.name.toLowerCase().includes(searchQuery);
        });

        if (filteredEps.length === 0) return;

        var block = document.createElement('div');
        block.className = 'ew-chapter-block';

        var header = document.createElement('div');
        header.className = 'ew-chapter-header';
        header.innerHTML = `
          <span>${escapeHtml(ch.chapter)}</span>
          <span class="ew-chapter-badge">${filteredEps.length} 考点</span>
        `;

        var epList = document.createElement('div');
        epList.className = 'ew-ep-list';

        filteredEps.forEach(ep => {
          var item = document.createElement('div');
          item.className = 'ew-ep-item' + (ep.id === activeExamPointId ? ' active' : '');
          item.dataset.id = ep.id;
          item.innerHTML = `
            <span class="ew-ep-name">${escapeHtml(ep.name)}</span>
            <span class="ew-ep-count">${ep.question_count} 题</span>
          `;
          item.addEventListener('click', function () {
            selectExamPoint(ep.id);
          });
          epList.appendChild(item);
        });

        block.appendChild(header);
        block.appendChild(epList);
        frag.appendChild(block);
      });
    });

    dom.sidebarList.appendChild(frag);
  }

  // 2. 渲染方法列表 (研砖破题诀)
  function renderMethodsList() {
    dom.sidebarList.innerHTML = '';
    var frag = document.createDocumentFragment();

    // 收集所有具有 code 的研砖方法并去重
    var seenCodes = new Set();
    var methods = [];
    for (var m of Object.values(registry.methods)) {
      if (!m.code || m.source_provenance.indexOf('YANBRICK_POJUE') === -1) continue;
      if (seenCodes.has(m.code)) continue;
      seenCodes.add(m.code);
      if (!searchQuery) {
        methods.push(m);
        continue;
      }
      var q = searchQuery;
      if ((m.name && m.name.toLowerCase().includes(q)) ||
          (m.code && m.code.toLowerCase().includes(q)) ||
          (m.one_liner && m.one_liner.toLowerCase().includes(q)) ||
          (m.search_keywords && m.search_keywords.some(k => k.toLowerCase().includes(q)))) {
        methods.push(m);
      }
    }

    // 按高数 (GS) -> 线代 (XD) -> 概率 (GL) 标准顺序排序
    var domainOrder = { 'GS': 1, 'XD': 2, 'GL': 3 };
    methods.sort(function (a, b) {
      var domA = (a.code || '').slice(0, 2);
      var domB = (b.code || '').slice(0, 2);
      var ordA = domainOrder[domA] || 99;
      var ordB = domainOrder[domB] || 99;
      if (ordA !== ordB) return ordA - ordB;
      return (a.code || '').localeCompare(b.code || '');
    });

    // 统计
    var groupHeader = document.createElement('div');
    groupHeader.className = 'ew-group-title';
    groupHeader.textContent = `精选招式 (${methods.length} 招)`;
    frag.appendChild(groupHeader);

    methods.forEach(m => {
      var item = document.createElement('div');
      item.className = 'ew-method-item' + (m.code === activeMethodId ? ' active' : '');
      item.dataset.code = m.code;
      item.innerHTML = `
        <div class="ew-method-top">
          <span class="ew-method-code">${escapeHtml(m.code)}</span>
          <span class="ew-ep-count">${m.question_count} 题</span>
        </div>
        <div class="ew-method-name">${escapeHtml(m.name)}</div>
        ${m.one_liner ? `<div class="ew-method-oneliner">${escapeHtml(m.one_liner)}</div>` : ''}
      `;
      item.addEventListener('click', function () {
        selectMethod(m.code);
      });
      frag.appendChild(item);
    });

    dom.sidebarList.appendChild(frag);
  }

  // 3. 渲染知识点列表
  function renderKnowledgeList() {
    dom.sidebarList.innerHTML = '';
    var frag = document.createDocumentFragment();

    var kps = Object.values(registry.knowledge_points).filter(kp => {
      if (!searchQuery) return true;
      return kp.name.toLowerCase().includes(searchQuery);
    });

    var groupHeader = document.createElement('div');
    groupHeader.className = 'ew-group-title';
    groupHeader.textContent = `知识点 (${kps.length} 项)`;
    frag.appendChild(groupHeader);

    kps.forEach(kp => {
      var item = document.createElement('div');
      item.className = 'ew-ep-item' + (kp.id === activeKpId ? ' active' : '');
      item.innerHTML = `
        <span class="ew-ep-name">${escapeHtml(kp.name)}</span>
        <span class="ew-ep-count">${kp.question_count} 题</span>
      `;
      item.addEventListener('click', function () {
        selectKnowledgePoint(kp.id);
      });
      frag.appendChild(item);
    });

    dom.sidebarList.appendChild(frag);
  }

  // 选中考点
  function selectExamPoint(epId) {
    activeExamPointId = epId;
    activeMethodId = null;
    activeKpId = null;

    updateSidebarActiveState();

    var ep = registry.exam_points[epId];
    if (!ep) return;

    dom.bannerTitle.innerHTML = `<span>🏷️ ${escapeHtml(ep.name)}</span>`;
    dom.bannerDesc.textContent = `${ep.discipline} · ${ep.parent || '核心考点'}`;

    // 查找该考点关联的题目
    var matchedQids = [];
    for (var qid in questionIndex) {
      var q = questionIndex[qid];
      if (q.exam_point_ids && q.exam_point_ids.includes(epId)) {
        matchedQids.push(qid);
      }
    }

    dom.bannerCount.textContent = `专题同类题: ${matchedQids.length} 道`;
    renderQuestionStream(matchedQids);
  }

  // 选中方法 (破题诀)
  function selectMethod(methodCode) {
    activeMethodId = methodCode;
    activeExamPointId = null;
    activeKpId = null;

    updateSidebarActiveState();

    var m = registry.methods[methodCode] || registry.methods[`METHOD.YANBRICK.${methodCode}`];
    if (!m) return;

    dom.bannerTitle.innerHTML = `
      <span>💡 [${escapeHtml(m.code)}] ${escapeHtml(m.name)}</span>
      <button type="button" class="ew-icon-btn btn-sm" id="btnOpenPojueDrawer" style="font-size:12px;margin-left:8px;">
        📖 查阅破题秘籍
      </button>
    `;
    dom.bannerDesc.textContent = m.one_liner || m.domain_name || '研砖破题绝招';

    var btnDrawer = document.getElementById('btnOpenPojueDrawer');
    if (btnDrawer) {
      btnDrawer.addEventListener('click', function () {
        openMethodDrawer(m);
      });
    }

    // 查找使用该方法的题目
    var matchedQids = [];
    var methodIdsToMatch = [methodCode, m.id];
    for (var qid in questionIndex) {
      var q = questionIndex[qid];
      if (q.method_ids && q.method_ids.some(mid => methodIdsToMatch.includes(mid))) {
        matchedQids.push(qid);
      }
    }

    dom.bannerCount.textContent = `应用此招试题: ${matchedQids.length} 道`;
    renderQuestionStream(matchedQids);
  }

  // 选中知识点
  function selectKnowledgePoint(kpId) {
    activeKpId = kpId;
    activeExamPointId = null;
    activeMethodId = null;

    updateSidebarActiveState();

    var kp = registry.knowledge_points[kpId];
    if (!kp) return;

    dom.bannerTitle.innerHTML = `<span>🧠 ${escapeHtml(kp.name)}</span>`;
    dom.bannerDesc.textContent = `${kp.discipline} · 理论概念`;

    var matchedQids = [];
    for (var qid in questionIndex) {
      var q = questionIndex[qid];
      if (q.knowledge_point_ids && q.knowledge_point_ids.includes(kpId)) {
        matchedQids.push(qid);
      }
    }

    dom.bannerCount.textContent = `涉及此理论试题: ${matchedQids.length} 道`;
    renderQuestionStream(matchedQids);
  }

  function updateSidebarActiveState() {
    var items = dom.sidebarList.querySelectorAll('.ew-ep-item, .ew-method-item');
    items.forEach(el => el.classList.remove('active'));

    if (activeExamPointId) {
      var activeEl = dom.sidebarList.querySelector(`.ew-ep-item[data-id="${activeExamPointId}"]`);
      if (activeEl) activeEl.classList.add('active');
    }
  }

  // 渲染中央题目流
  function renderQuestionStream(qids) {
    dom.questionStream.innerHTML = '';

    if (qids.length === 0) {
      dom.questionStream.innerHTML = `
        <div style="text-align:center;padding:60px 20px;color:var(--text-muted);">
          <div style="font-size:36px;margin-bottom:12px;">🔍</div>
          <div style="font-size:15px;font-weight:600;">暂无直接挂载的题目</div>
          <div style="font-size:12.5px;margin-top:4px;">可切换其他考点，或在主题库做题时自主关联。</div>
        </div>
      `;
      return;
    }

    var frag = document.createDocumentFragment();

    qids.forEach((qid, idx) => {
      var q = questionIndex[qid];
      if (!q) return;

      var card = document.createElement('div');
      card.className = 'ew-qcard';
      card.dataset.qid = qid;

      // 1. 卡片头部信息与跳转主刷题台
      var headerHtml = `
        <div class="ew-qcard-header">
          <div class="ew-qcard-book">
            <span>📚 ${escapeHtml(q.book)}</span>
            <span>·</span>
            <span>${escapeHtml(q.chapter)}</span>
            <span>·</span>
            <span>${escapeHtml(q.label)}</span>
          </div>
          <a class="ew-icon-btn" href="index.html?jumpQid=${encodeURIComponent(qid)}" target="_blank" title="跳转至主刷题台全键盘练习">
            <span>🚀 做此题</span>
          </a>
        </div>
      `;

      // 2. 三维胶囊标签区
      var pillsHtml = `<div class="ew-qcard-pills">`;
      // 考点胶囊
      (q.exam_point_ids || []).forEach(eid => {
        var ep = registry.exam_points[eid];
        if (ep) {
          pillsHtml += `<span class="ew-pill ew-pill-ep" data-eid="${eid}">🏷️ ${escapeHtml(ep.name)}</span>`;
        }
      });
      // 方法胶囊
      (q.method_ids || []).forEach(mid => {
        var m = registry.methods[mid];
        if (m) {
          pillsHtml += `<span class="ew-pill ew-pill-method" data-mcode="${m.code || mid}">💡 ${escapeHtml(m.code ? '['+m.code+'] ' : '')}${escapeHtml(m.name)}</span>`;
        }
      });
      // 知识点胶囊
      (q.knowledge_point_ids || []).forEach(kid => {
        var kp = registry.knowledge_points[kid];
        if (kp) {
          pillsHtml += `<span class="ew-pill ew-pill-kp">🧠 ${escapeHtml(kp.name)}</span>`;
        }
      });
      pillsHtml += `</div>`;

      // 3. 题眼 Signals 识别框
      var signalsHtml = '';
      if (q.signals && q.signals.length > 0) {
        signalsHtml = `
          <div class="ew-signals-box">
            <div class="ew-signals-title">⚡ 视觉题眼与解题信号</div>
            ${q.signals.map(s => `<div>• <strong>${escapeHtml(s.text)}</strong> ${s.suggests ? '➔ <em>' + escapeHtml(s.suggests) + '</em>' : ''}</div>`).join('')}
          </div>
        `;
      }

      // 4. 原题图片或文本
      var imgHtml = renderQuestionImageHtml(qid, q);

      // 5. 易错警示与骨架解析 (折叠)
      var solId = `sol_${idx}_${Date.now()}`;
      var solHtml = `
        <div class="ew-solution-section">
          <button type="button" class="ew-sol-toggle-btn" data-target="${solId}">
            <span>展开解析与解题骨架</span>
            <span>▼</span>
          </button>
          <div class="ew-sol-body" id="${solId}" style="display:none;">
            ${renderSolutionContent(q)}
          </div>
        </div>
      `;

      card.innerHTML = headerHtml + pillsHtml + signalsHtml + imgHtml + solHtml;

      // 绑定卡片内点击事件
      card.querySelectorAll('.ew-pill-method').forEach(pill => {
        pill.addEventListener('click', function (e) {
          e.stopPropagation();
          var mcode = pill.dataset.mcode;
          var mObj = registry.methods[mcode] || registry.methods[`METHOD.YANBRICK.${mcode}`];
          if (mObj) openMethodDrawer(mObj);
        });
      });

      card.querySelectorAll('.ew-pill-ep').forEach(pill => {
        pill.addEventListener('click', function (e) {
          e.stopPropagation();
          var eid = pill.dataset.eid;
          selectExamPoint(eid);
        });
      });

      var btnToggleSol = card.querySelector('.ew-sol-toggle-btn');
      if (btnToggleSol) {
        btnToggleSol.addEventListener('click', function () {
          var targetId = btnToggleSol.dataset.target;
          var body = document.getElementById(targetId);
          if (body) {
            var isHidden = body.style.display === 'none';
            body.style.display = isHidden ? 'block' : 'none';
            btnToggleSol.innerHTML = isHidden ? '<span>收起解析与骨架</span> <span>▲</span>' : '<span>展开解析与解题骨架</span> <span>▼</span>';
            if (isHidden && window.renderMathInElement) {
              window.renderMathInElement(body, {
                delimiters: [
                  { left: "$$", right: "$$", display: true },
                  { left: "$", right: "$", display: false }
                ]
              });
            }
          }
        });
      }

      frag.appendChild(card);
    });

    dom.questionStream.appendChild(frag);

    // 渲染 KaTeX
    if (window.renderMathInElement) {
      window.renderMathInElement(dom.questionStream, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false }
        ]
      });
    }
  }

  // 拼接题目图片展示 HTML
  function renderQuestionImageHtml(qid, q) {
    // 探测相对路径：题库/{book}/{subject}/...
    var parts = qid.split('::');
    var book = parts[1];
    var subj = parts[2];
    var ch = parts[3];
    var label = parts[4];

    var imgPath = '';
    // 如果是老姚高数、1000题、李范等，构建标准本地图片 URL
    if (book && label) {
      imgPath = `题库/${book}/${subj}/${ch}/${label}_question.png`;
    }

    if (q.objective) {
      return `
        <div style="font-size:14px;line-height:1.6;margin:12px 0;color:var(--text);background:rgba(0,0,0,0.02);padding:10px 14px;border-radius:6px;">
          ${escapeHtml(q.objective)}
        </div>
      `;
    }

    return `
      <div class="ew-img-wrap">
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">题目原图 (${escapeHtml(label)})</div>
        <img src="${escapeHtml(imgPath)}" onerror="this.onerror=null; this.parentElement.innerHTML='<div style=\\'padding:12px;color:var(--text-muted);font-size:12px;\\'>原图加载请点击上方「做此题」直达题库工作台</div>';" alt="${escapeHtml(label)}" />
      </div>
    `;
  }

  // 拼接详细解析与解题骨架
  function renderSolutionContent(q) {
    var html = '';

    // 1. 解题骨架 Solution Skeleton
    if (q.solution_skeleton && q.solution_skeleton.length > 0) {
      html += `
        <div style="margin-bottom:12px;">
          <div style="font-size:12px;font-weight:700;color:var(--primary);margin-bottom:6px;">🪜 推导与解答骨架步骤</div>
          <div class="ew-skeleton-flow">
            ${q.solution_skeleton.map((sk, sIdx) => `
              <div class="ew-skeleton-step">
                <span class="ew-step-num">${sIdx + 1}.</span>
                <span class="ew-step-content">${escapeHtml(sk.step)} ${sk.purpose ? '<span style="color:var(--text-muted);">(' + escapeHtml(sk.purpose) + ')</span>' : ''}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // 2. 避坑警示 Pitfalls
    if (q.pitfalls && q.pitfalls.length > 0) {
      html += `
        <div style="background:rgba(211, 47, 47, 0.08);border-left:3px solid var(--unfamiliar);padding:8px 12px;border-radius:4px;margin-top:10px;font-size:12px;">
          <div style="font-weight:700;color:var(--unfamiliar);margin-bottom:2px;">⚠️ 阅卷避坑与无效方法警示</div>
          ${q.pitfalls.map(p => `<div>• <strong>${escapeHtml(p.name)}</strong>: ${escapeHtml(p.reason || '')}</div>`).join('')}
        </div>
      `;
    }

    return html;
  }

  // 打开研砖破题诀讲义抽屉
  function openMethodDrawer(method) {
    if (!method) return;

    dom.drawerTitle.innerHTML = `
      <span class="ew-method-code">${escapeHtml(method.code || '招式')}</span>
      <span style="font-size:16px;font-weight:700;color:var(--text);">${escapeHtml(method.name)}</span>
    `;

    var bodyHtml = '';

    // 1. 一句话秒杀判据
    if (method.one_liner) {
      bodyHtml += `
        <div style="background:linear-gradient(135deg, rgba(121,26,136,0.12), rgba(121,26,136,0.03));border-left:4px solid var(--primary);padding:10px 14px;border-radius:6px;margin-bottom:16px;">
          <div style="font-size:11px;font-weight:700;color:var(--primary);text-transform:uppercase;">⚡ 核心秒杀判据</div>
          <div style="font-size:13.5px;font-weight:600;margin-top:2px;color:var(--text);">${escapeHtml(method.one_liner)}</div>
        </div>
      `;
    }

    // 2. 完整讲义 Markdown
    if (method.full_markdown && typeof window.marked !== 'undefined') {
      var cleanMd = method.full_markdown;
      bodyHtml += `<div class="ew-markdown-view">${window.marked.parse(cleanMd)}</div>`;
    } else {
      // 结构化降级呈现
      if (method.when_to_use) {
        bodyHtml += `<h3>什么时候用</h3><p>${escapeHtml(method.when_to_use)}</p>`;
      }
      if (method.steps && method.steps.length > 0) {
        bodyHtml += `<h3>怎么做</h3><ol>${method.steps.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ol>`;
      }
      if (method.pitfalls && method.pitfalls.length > 0) {
        bodyHtml += `<h3>边界与易错</h3><ul>${method.pitfalls.map(p => `<li>${escapeHtml(p)}</li>`).join('')}</ul>`;
      }
    }

    // 3. 拓扑上下游招式
    if ((method.upstream_methods && method.upstream_methods.length > 0) || (method.downstream_methods && method.downstream_methods.length > 0)) {
      bodyHtml += `
        <div style="margin-top:24px;padding-top:16px;border-top:1px dashed var(--border);">
          <div style="font-size:12px;font-weight:700;color:var(--text-muted);margin-bottom:8px;">🔗 招式拓扑脉络</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            ${(method.upstream_methods || []).map(up => `<span class="ew-pill ew-pill-method" onclick="window.ewSelectPojue('${up}')">前驱: ${up}</span>`).join('')}
            ${(method.downstream_methods || []).map(down => `<span class="ew-pill ew-pill-method" onclick="window.ewSelectPojue('${down}')">后继: ${down}</span>`).join('')}
          </div>
        </div>
      `;
    }

    dom.drawerBody.innerHTML = bodyHtml;
    dom.drawer.classList.add('open');
    if (dom.drawerBackdrop) dom.drawerBackdrop.classList.add('active');

    // 渲染数学公式
    if (window.renderMathInElement) {
      window.renderMathInElement(dom.drawerBody, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false }
        ]
      });
    }
  }

  function closeDrawer() {
    if (dom.drawer) dom.drawer.classList.remove('open');
    if (dom.drawerBackdrop) dom.drawerBackdrop.classList.remove('active');
  }

  window.ewSelectPojue = function (code) {
    var m = registry.methods[code] || registry.methods[`METHOD.YANBRICK.${code}`];
    if (m) openMethodDrawer(m);
  };

  function showLoading(msg) {
    dom.questionStream.innerHTML = `<div style="text-align:center;padding:80px;color:var(--text-muted);">${escapeHtml(msg)}</div>`;
  }

  function showError(msg) {
    dom.questionStream.innerHTML = `<div style="text-align:center;padding:80px;color:var(--unfamiliar);">${escapeHtml(msg)}</div>`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

})();
