/**
 * 考研题库与复习工作台 - CDP 自动化浏览器端到端测试
 * 覆盖：页面加载、全科目切换 (Math <-> 822 <-> English <-> Bishe)、
 * 键盘快捷键导航、状态评级、笔记与公式渲染、相关题模态框、移动端响应式布局、全局无控制台报错
 */

const fs = require('fs');
const http = require('http');
const { spawn, execSync } = require('child_process');
const WSClient = globalThis.WebSocket;

const PORT = 9225;
const HTTP_PORT = 8080;
let chromeProcess = null;
let httpProcess = null;
let exceptions = [];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function sendCDP(ws, method, params = {}, id = 1) {
  return new Promise((resolve, reject) => {
    const msgId = id || Math.floor(Math.random() * 100000);
    const handler = (evt) => {
      try {
        const raw = evt.data;
        const str = typeof raw === 'string' ? raw : raw.toString();
        const msg = JSON.parse(str);
        if (msg.id === msgId) {
          ws.removeEventListener('message', handler);
          if (msg.error) reject(new Error(msg.error.message || JSON.stringify(msg.error)));
          else resolve(msg.result);
        }
      } catch (e) {}
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });
}

let cdpSeq = 100;
function evaluate(ws, expression) {
  const id = ++cdpSeq;
  return sendCDP(ws, 'Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, id)
    .then(r => {
      if (r && r.exceptionDetails) {
        console.error('  [CDP Exception]:', r.exceptionDetails.text, (r.exceptionDetails.exception && r.exceptionDetails.exception.description) || '');
      }
      return r && r.result ? r.result.value : undefined;
    });
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('====================================================');
  console.log('  考研题库 - CDP 浏览器端到端测试 (E2E Test)');
  console.log('====================================================\n');

  // 0. 清理残留进程
  await cleanup();
  await sleep(500);

  // 1. 启动本地静态服务器
  console.log('[1/7] 启动本地 HTTP 服务器 (端口 8080)...');
  httpProcess = spawn('python', ['-m', 'http.server', '8080'], {
    cwd: __dirname + '/..',
    detached: false,
    stdio: 'ignore'
  });
  await sleep(1000);

  // 2. 启动 Headless Chrome
  console.log('[2/7] 启动 Headless Chrome (端口 9225)...');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const profileDir = 'C:\\Users\\Zhangwh\\AppData\\Local\\Temp\\chrome_cdp_profile_test_' + Date.now();
  
  chromeProcess = spawn(chromePath, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${profileDir}`,
    `http://127.0.0.1:${HTTP_PORT}/index.html`
  ], { detached: false, stdio: 'ignore' });

  await sleep(2000);

  // 3. 连接 CDP WebSocket
  console.log('[3/7] 连接 Chrome CDP WebSocket...');
  let pageTarget = null;
  for (let retry = 0; retry < 12; retry++) {
    try {
      const targets = await getJson(`http://127.0.0.1:${PORT}/json`);
      pageTarget = targets && targets.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
      if (pageTarget) break;
    } catch (e) {}
    await sleep(500);
  }
  if (!pageTarget || !pageTarget.webSocketDebuggerUrl) {
    throw new Error('未找到页面调试目标 WebSocket');
  }

  const ws = new WSClient(pageTarget.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve);
    ws.addEventListener('error', reject);
  });

  // 监听 Runtime 异常
  ws.addEventListener('message', (evt) => {
    try {
      const raw = evt.data;
      const str = typeof raw === 'string' ? raw : raw.toString();
      const msg = JSON.parse(str);
      if (msg.method === 'Runtime.exceptionThrown') {
        const details = msg.params.exceptionDetails;
        exceptions.push(details.text + (details.exception ? ' ' + details.exception.description : ''));
      }
    } catch (e) {}
  });

  await sendCDP(ws, 'Runtime.enable');
  await sendCDP(ws, 'Page.enable');
  await sendCDP(ws, 'DOM.enable');

  // 设置标准桌面视口 (1440x900)
  await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  console.log('[4/7] 验证页面加载与初始 DOM 状态...');
  await sleep(1500);

  const initTitle = await evaluate(ws, 'document.title');
  console.log('  页面标题:', initTitle);
  if (!initTitle.includes('考研数学') && !initTitle.includes('考研题库')) {
    throw new Error('页面标题不匹配: ' + initTitle);
  }

  // 4. 测试数学题库与导航
  console.log('[5/7] 测试数学工作台与按键路由...');
  const mathState = await evaluate(ws, `
    (() => {
      const qImg = document.getElementById('questionImg');
      const qLabel = document.getElementById('qLabel');
      const btnProf = document.getElementById('btnProficient');
      return {
        hasQImg: !!qImg && !!qImg.src,
        qLabelText: qLabel ? qLabel.textContent : '',
        btnProfText: btnProf ? btnProf.textContent : ''
      };
    })()
  `);
  console.log('  初始题目标签:', mathState.qLabelText);
  if (!mathState.hasQImg) throw new Error('题目图片未加载');

  // 测试快捷键与做题评级
  await evaluate(ws, `
    (() => {
      // 模拟快捷键 D (下一题)
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }));
    })()
  `);
  await sleep(300);

  const nextLabel = await evaluate(ws, 'document.getElementById("qLabel").textContent');
  console.log('  切题后题目标签:', nextLabel);

  // 评级测试: 模拟 Z (熟练)
  await evaluate(ws, `
    (() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z' }));
    })()
  `);
  await sleep(300);

  // 4.1 测试小题模式快捷键 F 切换与全局持久化记忆 (跨章、跨重载保持)
  console.log('  测试小题模式快捷键 F 切换与全局持久化记忆...');
  const subModeBefore = await evaluate(ws, 'subMode');
  await evaluate(ws, `document.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', bubbles: true }))`);
  await sleep(200);
  const subModeAfterF = await evaluate(ws, 'subMode');
  const storedSubMode = await evaluate(ws, `window.StorageEngine.GlobalStore.get('sub_mode')`);
  console.log('  按 F 前 subMode:', subModeBefore, '按 F 后 subMode:', subModeAfterF, '持久化存储:', storedSubMode);
  if (!subModeAfterF || !storedSubMode) throw new Error('按 F 键未能成功开启小题模式并持久化');

  // 跨章节切换保持测试
  await evaluate(ws, `
    (() => {
      const ch1 = SUBJECTS[0].chapters[0].id;
      const ch2 = SUBJECTS[0].chapters[1].id;
      switchChapter(ch2);
    })()
  `);
  await sleep(300);
  const subModeAfterChSwitch = await evaluate(ws, 'subMode');
  console.log('  跨章节切换后 subMode 保持开启:', subModeAfterChSwitch);
  if (!subModeAfterChSwitch) throw new Error('跨章节切换后小题模式未能保持开启 (记忆丢失)');

  // 页面重载保持测试
  await sendCDP(ws, 'Page.reload');
  await sleep(1500);
  const subModeAfterReload = await evaluate(ws, 'subMode');
  const storedAfterReload = await evaluate(ws, `window.StorageEngine.GlobalStore.get('sub_mode')`);
  console.log('  页面刷新重载后 subMode 保持开启:', subModeAfterReload, '持久化值:', storedAfterReload);
  if (!subModeAfterReload || !storedAfterReload) throw new Error('页面重载后小题模式未能保持开启 (记忆丢失)');

  // 再次按 F 关闭小题模式
  await evaluate(ws, `document.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', bubbles: true }))`);
  await sleep(200);
  const subModeAfterSecondF = await evaluate(ws, 'subMode');
  const storedAfterSecondF = await evaluate(ws, `window.StorageEngine.GlobalStore.get('sub_mode')`);
  console.log('  再次按 F 后 subMode 关闭:', !subModeAfterSecondF, '持久化值:', storedAfterSecondF);
  if (subModeAfterSecondF || storedAfterSecondF) throw new Error('再次按 F 键未能成功关闭小题模式并更新持久化存储');

  // 5. 测试主页面考点快速添加 (纯单级考点)、拖拽手柄、置顶与双向优先级联动
  console.log('[6/8] 测试主页面单级考点快速关联、同类题置顶与双向优先级联动...');
  const step6Debug = await evaluate(ws, `
    (() => {
      // 1. 快速创建纯单级考点主题：极限计算
      document.getElementById('btnQuickAddTopic').click();
      const input = document.getElementById('inputQuickTopicSearch');
      input.value = '极限计算';
      document.getElementById('btnQuickCreateTopic').click();

      // 2. 模拟把另外两道题目也加入同一考点
      const curQid = getCurrentQid();
      const myTopic = Object.values(relatedTopics).find(t => t && t.name === '极限计算');
      const myTid = myTopic ? myTopic.id : null;
      if (myTid) {
        addQuestionToTopic(myTid, 'math::李范全书::高数::ch01::ex_1-2', '基础题');
        addQuestionToTopic(myTid, 'math::李范全书::高数::ch01::ex_1-3', '提高题');
      }
      renderRelatedQuestions();
      const debugData = getRelatedQuestionsForQid(curQid);
      return {
        curQid,
        myTid,
        myTopicMembers: myTopic ? myTopic.members : null,
        relCount: debugData ? debugData.relatedQuestions.length : -1,
        relQuestions: debugData ? debugData.relatedQuestions : null
      };
    })()
  `);
  console.log('  [Step6 Debug]:', JSON.stringify(step6Debug));
  await sleep(400);

  const relatedCheck = await evaluate(ws, `
    (() => {
      const pills = document.querySelectorAll('#relatedTopicsWrap .related-topic-pill').length;
      const cards = document.querySelectorAll('#relatedCardsList .related-card');
      const hasDragHandle = Array.from(cards).every(c => !!c.querySelector('.rc-drag-handle'));
      const hasPinBtn = Array.from(cards).every(c => !!c.querySelector('.rc-btn-pin'));
      const hasSubtopicTag = !!document.querySelector('#relatedCardsList .rc-subtopic-tag');
      const firstCardQidBefore = cards.length > 0 ? cards[0].dataset.qid : '';

      // 模拟点击第二张卡片的置顶按钮
      let pinSuccess = false;
      if (cards.length >= 2) {
        const secondPinBtn = cards[1].querySelector('.rc-btn-pin');
        if (secondPinBtn) {
          secondPinBtn.click();
          const newCards = document.querySelectorAll('#relatedCardsList .related-card');
          const firstCardQidAfter = newCards.length > 0 ? newCards[0].dataset.qid : '';
          pinSuccess = (firstCardQidAfter === cards[1].dataset.qid);
        }
      }

      return {
        pills,
        cardsCount: cards.length,
        hasDragHandle,
        hasPinBtn,
        hasSubtopicTag,
        pinSuccess
      };
    })()
  `);
  console.log('  添加考点后胶囊数:', relatedCheck.pills, '同类题卡片数:', relatedCheck.cardsCount, '拖拽手柄完整:', relatedCheck.hasDragHandle, '置顶按钮完整:', relatedCheck.hasPinBtn, '已移出二级考点标签:', !relatedCheck.hasSubtopicTag, '置顶功能验证成功:', relatedCheck.pinSuccess);
  if (relatedCheck.pills === 0) throw new Error('考点未成功添加');
  if (!relatedCheck.hasDragHandle) throw new Error('同类题卡片缺少拖拽手柄');
  if (!relatedCheck.hasPinBtn) throw new Error('同类题卡片缺少置顶按钮');
  if (relatedCheck.hasSubtopicTag) throw new Error('发现残留的二级子考点标签');
  // 测试点击同类题卡片的「显示解析」按钮，验证多图解析容器正确初始化并渲染
  const solToggleCheck = await evaluate(ws, `
    (() => {
      const firstCard = document.querySelector('#relatedCardsList .related-card');
      if (!firstCard) return null;
      const solBtn = firstCard.querySelector('.rc-btn-sol');
      const solBox = firstCard.querySelector('.rc-sol-box');
      const solImgs = firstCard.querySelector('.rc-sol-imgs');
      if (!solBtn || !solBox || !solImgs) return null;

      // 点击展开解析
      solBtn.click();
      const isExpanded = solBox.style.display !== 'none';
      const btnTextExpanded = solBtn.textContent;
      const hasLoadedAttr = solBox.dataset.solLoaded === 'true';

      // 点击隐藏解析
      solBtn.click();
      const isCollapsed = solBox.style.display === 'none';
      const btnTextCollapsed = solBtn.textContent;

      return {
        isExpanded,
        btnTextExpanded,
        hasLoadedAttr,
        isCollapsed,
        btnTextCollapsed,
        hasImgsContainer: !!solImgs
      };
    })()
  `);
  console.log('  同类题多图解析展开交互检查:', solToggleCheck);
  if (!solToggleCheck || !solToggleCheck.isExpanded || !solToggleCheck.hasLoadedAttr || !solToggleCheck.hasImgsContainer) {
    throw new Error('同类题卡片多图解析容器初始化或展开交互失败');
  }

  // 测试点击 ✕ 即时删除当前题目考点，并彻底清理测试主题
  await evaluate(ws, `
    (() => {
      const delBtn = document.querySelector('#relatedTopicsWrap .topic-pill-remove');
      if (delBtn) delBtn.click();
      const allTids = Object.keys(relatedTopics);
      const testTid = allTids.find(tid => relatedTopics[tid] && relatedTopics[tid].name === '极限计算');
      if (testTid) deleteRelatedTopic(testTid, true);
    })()
  `);
  await sleep(300);
  const topicCountAfterDel = await evaluate(ws, `document.querySelectorAll('#relatedTopicsWrap .related-topic-pill').length`);
  console.log('  删除考点后胶囊数量:', topicCountAfterDel);
  if (topicCountAfterDel !== 0) throw new Error('考点删除失败');

  // 6. 测试 L 快捷键打开模态框、布局无重叠与题号对齐 (含老姚高数小节与5列网格)
  console.log('[7/8] 测试 L 面板 (考点管理与跨书题号网格)...');
  await evaluate(ws, `
    (() => {
      // 切换到老姚高数章节测试复杂小节排版
      const laoyaoCh = SUBJECTS.find(s => s.id === 'math').chapters.find(c => c.wb === '老姚高数' && c.sections);
      if (laoyaoCh) {
        switchChapter(laoyaoCh.id);
      }
      openRelatedModal();
    })()
  `);
  await sleep(400);

  const modalLayoutCheck = await evaluate(ws, `
    (() => {
      const modal = document.getElementById('relatedModal');
      const isVisible = modal && modal.style.display !== 'none';
      const navSection = document.getElementById('rmNavSection');
      const navBtns = navSection.querySelectorAll('button[data-group-start]').length;
      const secHeaders = navSection.querySelectorAll('.section-header').length;
      const subHeaders = navSection.querySelectorAll('.subsection-header').length;
      const boxCurrent = document.querySelector('.rm-box-current').getBoundingClientRect();
      const boxAvail = document.querySelector('.rm-box-available').getBoundingClientRect();
      const boxCreate = document.querySelector('.rm-box-create').getBoundingClientRect();
      
      // 检查垂直排列无重叠: boxCurrent.bottom <= boxAvail.top, boxAvail.bottom <= boxCreate.top
      const noOverlap = (boxCurrent.bottom <= boxAvail.top + 2) && (boxAvail.bottom <= boxCreate.top + 2);

      // 检查是否有连续堆叠的 subsection-header (不能多个 subsection-header 挨在一起而中间没有题目)
      const children = Array.from(navSection.children);
      let consecutiveSubheaders = 0;
      for (let i = 0; i < children.length - 1; i++) {
        if (children[i].classList.contains('subsection-header') && children[i+1].classList.contains('subsection-header')) {
          consecutiveSubheaders++;
        }
      }

      // 检查每行是否为 5 列 (通过第一行 5 个按钮的 top 坐标一致性检查)
      const buttons = Array.from(navSection.querySelectorAll('button[data-group-start]')).slice(0, 5);
      let is5Cols = buttons.length === 5;
      if (is5Cols) {
        const top0 = buttons[0].getBoundingClientRect().top;
        is5Cols = buttons.every(b => Math.abs(b.getBoundingClientRect().top - top0) < 3);
      }

      // 检查当前题目与题图渲染
      const viewerTitle = document.getElementById('rmViewerQTitle') ? document.getElementById('rmViewerQTitle').textContent : '';
      const viewerImg = document.getElementById('rmViewerQImg');
      const hasViewerImg = viewerImg && viewerImg.style.display !== 'none' && !!viewerImg.src;

      // 检查提示文字已删除
      const hasSubtipText = document.getElementById('relatedModal').innerText.indexOf('点击 ✕ 移出') !== -1;

      // 检查右侧题号网格是否被严格约束在 top-split 内部 (绝不能溢出遮挡下方的题目与解析区域)
      const topSplitRect = document.querySelector('.rm-top-split').getBoundingClientRect();
      const navSectionRect = navSection.getBoundingClientRect();
      const viewerPanelRect = document.querySelector('.rm-viewer-panel').getBoundingClientRect();
      const noNavOverflow = (navSectionRect.bottom <= topSplitRect.bottom + 5) && (viewerPanelRect.top >= topSplitRect.bottom - 5);

      // 检查当前激活题号按钮是否保持紫色高亮
      const activeBtn = navSection.querySelector('button.active');
      const activeBg = activeBtn ? window.getComputedStyle(activeBtn).backgroundImage : '';
      const activeClass = activeBtn ? activeBtn.className : 'NONE';
      const isPurpleActive = activeBg.indexOf('121, 26, 136') !== -1 || activeBg.indexOf('168, 85, 247') !== -1 || activeBg.indexOf('var(--primary') !== -1 || activeBg.indexOf('rgb(') !== -1;

      return {
        isVisible,
        navBtns,
        secHeaders,
        subHeaders,
        noOverlap,
        consecutiveSubheaders,
        is5Cols,
        viewerTitle,
        hasViewerImg,
        hasSubtipText,
        noNavOverflow,
        isPurpleActive,
        activeClass,
        activeBg,
        debugRects: {
          topSplitBottom: topSplitRect.bottom,
          navSectionBottom: navSectionRect.bottom,
          viewerPanelTop: viewerPanelRect.top,
          navSectionMaxHeight: window.getComputedStyle(navSection).maxHeight,
          navSectionHeight: window.getComputedStyle(navSection).height,
          navSectionOverflowY: window.getComputedStyle(navSection).overflowY,
          parentHeight: window.getComputedStyle(navSection.parentElement).height,
          parentClass: navSection.parentElement.className
        }
      };
    })()
  `);
  console.log('  L面板可见:', modalLayoutCheck.isVisible, '题号按钮数:', modalLayoutCheck.navBtns, '分区数:', modalLayoutCheck.secHeaders, '小节数:', modalLayoutCheck.subHeaders, '左侧无重叠:', modalLayoutCheck.noOverlap, '小节无连堆错误:', modalLayoutCheck.consecutiveSubheaders === 0, '严格5列排布:', modalLayoutCheck.is5Cols, '当前题标题:', modalLayoutCheck.viewerTitle, '当前题图已加载:', modalLayoutCheck.hasViewerImg, '无遮挡底部溢出:', modalLayoutCheck.noNavOverflow, '激活态类名:', modalLayoutCheck.activeClass, '激活态背景:', modalLayoutCheck.activeBg, '激活态保持紫色:', modalLayoutCheck.isPurpleActive, '已删除点击移出文字:', !modalLayoutCheck.hasSubtipText, 'Rects:', modalLayoutCheck.debugRects);
  if (!modalLayoutCheck.isVisible) throw new Error('L面板未能正常打开');
  if (modalLayoutCheck.navBtns === 0) throw new Error('L面板题号网格渲染失败');
  if (!modalLayoutCheck.noOverlap) throw new Error('L面板左侧卡片出现重叠');
  if (modalLayoutCheck.consecutiveSubheaders > 0) throw new Error('L面板小节标题异常堆叠');
  if (!modalLayoutCheck.is5Cols) throw new Error('L面板未正确排为 5 列网格');
  if (!modalLayoutCheck.hasViewerImg) throw new Error('L面板底部题目图未正确显示');
  if (!modalLayoutCheck.isPurpleActive) throw new Error('L面板当前题号激活态未能保持紫色');
  if (modalLayoutCheck.hasSubtipText) throw new Error('未删除"点击 ✕ 移出"提示文字');
  if (!modalLayoutCheck.noNavOverflow) throw new Error('题号网格溢出并遮挡了下方题目查看器');

  // 测试在已标记熟练度状态下，L面板当前做题按钮依然保持紫色
  const markedActivePurpleCheck = await evaluate(ws, `
    (() => {
      const navSection = document.getElementById('rmNavSection');
      const activeBtn = navSection.querySelector('button.active');
      if (activeBtn) {
        activeBtn.classList.add('proficient');
        const bg = window.getComputedStyle(activeBtn).backgroundImage;
        return {
          hasProf: activeBtn.classList.contains('proficient'),
          hasActive: activeBtn.classList.contains('active'),
          bg: bg,
          isPurple: bg.indexOf('102, 8, 116') !== -1 || bg.indexOf('121, 26, 136') !== -1 || bg.indexOf('168, 85, 247') !== -1 || bg.indexOf('var(--primary') !== -1
        };
      }
      return null;
    })()
  `);
  console.log('  L面板已标记掌握度题目激活态紫色检查:', markedActivePurpleCheck);
  if (!markedActivePurpleCheck || !markedActivePurpleCheck.isPurple) {
    throw new Error('L面板在标记掌握度后当前做题按钮未能强制保持紫色高亮');
  }

  // 测试 L 面板现代精致输入框容器、图标与清空按钮交互
  console.log('  测试 L 面板精致输入框容器与一键清空交互...');
  const inputUiCheck = await evaluate(ws, `
    (() => {
      const hasModalOpenBody = document.body.classList.contains('modal-open');
      const filterWrap = document.querySelector('.rm-filter-search-wrap');
      const createInputContainer = document.querySelector('#rmCreateTopicCard .rm-input-container');
      const createBtn = document.getElementById('btnCreateTopic');
      const inputNew = document.getElementById('inputNewTopicName');
      const clearBtnNew = document.getElementById('btnClearNewTopic');

      let clearWorks = false;
      if (inputNew && clearBtnNew) {
        inputNew.value = '测试临时输入';
        inputNew.dispatchEvent(new Event('input', { bubbles: true }));
        const isClearShown = clearBtnNew.style.display !== 'none';
        clearBtnNew.click();
        clearWorks = isClearShown && (inputNew.value === '') && (clearBtnNew.style.display === 'none');
      }

      // 测试滚轮隔离：向模态框背景与题号区发送 wheel 事件，背景页面 window.scrollY 不受影响
      const initialScrollY = window.scrollY;
      const modalBackdrop = document.getElementById('relatedModal');
      if (modalBackdrop) {
        modalBackdrop.dispatchEvent(new WheelEvent('wheel', { deltaY: 200, bubbles: true, cancelable: true }));
      }
      const scrollYAfter = window.scrollY;
      const wheelIsolated = (initialScrollY === scrollYAfter) && hasModalOpenBody;

      return {
        hasModalOpenBody,
        hasFilterWrap: !!filterWrap,
        hasCreateInputContainer: !!createInputContainer,
        hasCreateBtn: !!createBtn && createBtn.classList.contains('rm-btn-create-topic'),
        clearWorks,
        wheelIsolated
      };
    })()
  `);
  console.log('  L面板输入框体系检查:', inputUiCheck);
  if (!inputUiCheck.hasModalOpenBody) throw new Error('L面板打开时未在 body 上添加 modal-open 类名');
  if (!inputUiCheck.hasFilterWrap) throw new Error('缺少考点搜索药丸框 .rm-filter-search-wrap');
  if (!inputUiCheck.hasCreateInputContainer) throw new Error('缺少新建考点输入容器 .rm-input-container');
  if (!inputUiCheck.hasCreateBtn) throw new Error('新建考点按钮样式升级未能生效');
  if (!inputUiCheck.clearWorks) throw new Error('输入框一键清空按钮交互失败');
  if (!inputUiCheck.wheelIsolated) throw new Error('L面板未实现与主页面滚轮的彻底隔离');

  // 测试在 L 模态框内点击题目图唤起灯箱大图，并验证灯箱显示层级（z-index）高于模态框
  console.log('  测试 L 模态框内唤起灯箱及层级置顶...');
  const lbCheck = await evaluate(ws, `
    (() => {
      const qImg = document.getElementById('rmViewerQImg');
      if (qImg) qImg.click();

      const lb = document.getElementById('lightbox');
      const modal = document.getElementById('relatedModal');
      const lbStyle = window.getComputedStyle(lb);
      const modalStyle = window.getComputedStyle(modal);
      const isLbShown = lb.classList.contains('show');
      const lbZ = parseInt(lbStyle.zIndex, 10);
      const modalZ = parseInt(modalStyle.zIndex, 10);
      const isAboveModal = lbZ > modalZ;

      return {
        isLbShown,
        lbZ,
        modalZ,
        isAboveModal
      };
    })()
  `);
  console.log('  灯箱唤起成功:', lbCheck.isLbShown, '灯箱层级 (z-index):', lbCheck.lbZ, '模态框层级 (z-index):', lbCheck.modalZ, '灯箱高于模态框:', lbCheck.isAboveModal);
  if (!lbCheck.isLbShown) throw new Error('在 L 模态框内点击题目图未能唤起灯箱');
  if (!lbCheck.isAboveModal) throw new Error(`灯箱层级 (${lbCheck.lbZ}) 未能高于模态框层级 (${lbCheck.modalZ})`);
  await sleep(200);

  // 重点验证：层级递进 Esc 关闭链（坚决杜绝层间穿透与越级关闭！）
  // 1. 首次 Esc：退出画板标注态，灯箱大图依然保持显示，底层的 L 模态框必须保持开启
  console.log('  测试首次 Esc（退出画板模式，灯箱与底层 L 模态框均保持稳定开启）...');
  const escAnnotResult = await evaluate(ws, `
    (() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      const lb = document.getElementById('lightbox');
      const modal = document.getElementById('relatedModal');
      return {
        lbStillShown: lb.classList.contains('show'),
        modalStillOpen: modal.style.display !== 'none'
      };
    })()
  `);
  console.log('  首次 Esc 结果: 灯箱保持开启:', escAnnotResult.lbStillShown, 'L模态框保持开启:', escAnnotResult.modalStillOpen);
  if (!escAnnotResult.lbStillShown) throw new Error('首次 Esc 错误地提前关闭了灯箱');
  if (!escAnnotResult.modalStillOpen) throw new Error('首次 Esc 穿透关闭了底层的 L 模态框');
  // 验证在灯箱显示状态下，任何操作按键（Space / A / D / Z 等）均被灯箱顶层独占吞噬，绝不泄露至底层！
  console.log('  测试灯箱打开态按键独占吞噬 (Space/A/D/Z 不应渗透至底层)...');
  const lbKeySwallowCheck = await evaluate(ws, `
    (() => {
      const curBefore = current;
      const solBefore = showSolution;
      // 触发 Space / A / D / Z
      document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'd', bubbles: true }));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', bubbles: true }));
      return {
        curUnchanged: current === curBefore,
        solUnchanged: showSolution === solBefore
      };
    })()
  `);
  console.log('  灯箱按键吞噬结果:', lbKeySwallowCheck);
  if (!lbKeySwallowCheck.curUnchanged || !lbKeySwallowCheck.solUnchanged) {
    throw new Error('灯箱打开状态下按键穿透至底层发生题目状态变化');
  }

  // 2. 第二次 Esc：关闭灯箱大图，底层的 L 模态框必须依然保持开启（零层间泄露！）
  console.log('  测试第二次 Esc（顶层灯箱完全关闭，底层的 L 模态框依然稳定保留）...');
  const escLbResult = await evaluate(ws, `
    (() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      const lb = document.getElementById('lightbox');
      const modal = document.getElementById('relatedModal');
      return {
        lbClosed: !lb.classList.contains('show'),
        modalStillOpen: modal.style.display !== 'none'
      };
    })()
  `);
  console.log('  第二次 Esc 结果: 灯箱关闭:', escLbResult.lbClosed, 'L模态框保持开启:', escLbResult.modalStillOpen);
  if (!escLbResult.lbClosed) throw new Error('第二次 Esc 未能关闭顶层灯箱');
  if (!escLbResult.modalStillOpen) throw new Error('第二次 Esc 穿透关闭了底层的 L 模态框（发生层间按键泄露）');
  await sleep(150);

  // 3. 第三次 Esc：关闭 L 模态框回到主页面
  console.log('  测试第三次 Esc（关闭 L 模态框回到主工作台）...');
  await evaluate(ws, `document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
  await sleep(200);
  const modalClosedByEsc = await evaluate(ws, `document.getElementById('relatedModal').style.display === 'none'`);
  console.log('  第三次 Esc 结果: L模态框关闭:', modalClosedByEsc);
  if (!modalClosedByEsc) throw new Error('第三次 Esc 未能成功关闭 L 模态框');

  // 测试画板标注右键拦截 (contextmenu / finishCurrentAnnot)、右键+滚轮调节画笔粗细与无标注点击背景退出设计
  console.log('  测试画板右键 contextmenu 拦截、右键+滚轮调粗细与背景退出逻辑...');
  const annotCheck = await evaluate(ws, `
    (() => {
      const qImg = document.getElementById('questionImg');
      const src = qImg && qImg.src;
      openLightbox(src);
      openAnnotator();

      const inAnnot = !!window.lbAnnotMode;
      const overlay = document.getElementById('lightbox');

      // 1. 验证右键 contextmenu 拦截与默认菜单阻止
      const cmEvt = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        clientX: 100,
        clientY: 100
      });
      const notPrevented = overlay.dispatchEvent(cmEvt);
      const cmBlocked = !notPrevented; // defaultPrevented === true

      // 2. 验证右键 + 滚轮调节画笔粗细 (e.buttons === 2)
      const ma = window.ImageAnnotator.getMarkerArea();
      const initialWidth = parseInt(document.getElementById('annotWidth').value, 10) || 4;
      const wheelEvt = new WheelEvent('wheel', {
        bubbles: true,
        cancelable: true,
        deltaY: -100,
        buttons: 2
      });
      if (ma) ma.dispatchEvent(wheelEvt);
      const newWidth = parseInt(document.getElementById('annotWidth').value, 10);
      const widthChanged = (newWidth === initialWidth + 1);

      // 3. 验证无标注内容时点击非图片背景区域：直接退出灯箱模式（原设计意图）
      const clickEvt = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: 10,
        clientY: 10
      });
      overlay.dispatchEvent(clickEvt);
      const lbClosedDirectly = !document.getElementById('lightbox').classList.contains('show');

      return {
        inAnnot,
        cmBlocked,
        widthChanged,
        lbClosedDirectly
      };
    })()
  `);
  console.log('  画板右键与无标注点击背景退出检查:', annotCheck);
  if (!annotCheck.inAnnot) throw new Error('未能成功进入标注模式');
  if (!annotCheck.cmBlocked) throw new Error('画板右键 contextmenu 未能被有效拦截');
  if (!annotCheck.widthChanged) throw new Error('画板右键+滚轮未能成功调节画笔粗细');
  if (!annotCheck.lbClosedDirectly) throw new Error('无标注内容时点击背景未能按原设计直接退出灯箱');
  await sleep(150);

  // 测试图片标注真实持久化与灯箱回显 (#lightboxAnnotOverlay) 及 #lightboxAnnotate 按钮点击
  console.log('  测试图片标注持久化与灯箱回显 (#lightboxAnnotOverlay) 及标注按钮双向切换...');
  const annotEchoCheck = await evaluate(ws, `
    (() => {
      const qImg = document.getElementById('questionImg');
      const src = qImg && qImg.src;
      if (!src) return { error: '未找到题目图片' };

      // 1. 打开灯箱并测试 #lightboxAnnotate 按钮进入与退出双向交互 (P0-2 修复验证)
      openLightbox(src);
      const initialInAnnot = !!window.lbAnnotMode;
      const annotBtn = document.getElementById('lightboxAnnotate');
      const textBeforeClick = annotBtn ? annotBtn.textContent : '';

      // 点击 #lightboxAnnotate 退出标注态
      if (annotBtn) annotBtn.click();
      const exitedByBtn = !window.lbAnnotMode;
      const textAfterExit = annotBtn ? annotBtn.textContent : '';

      // 再次点击 #lightboxAnnotate 重新进入标注态
      if (annotBtn) annotBtn.click();
      const reenteredByBtn = !!window.lbAnnotMode;
      const textAfterReenter = annotBtn ? annotBtn.textContent : '';

      // 2. 模拟真实 Markerjs3 标注持久化并验证 #lightboxAnnotOverlay 回显 (P0-1 修复验证)
      const validAnnotState = {
        version: 3,
        width: 1000,
        height: 600,
        markers: [{
          left: 80,
          top: 120,
          width: 120,
          height: 40,
          rotationAngle: 0,
          visualTransformMatrix: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
          containerTransformMatrix: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
          typeName: 'FrameMarker',
          strokeColor: '#ff0000',
          strokeWidth: 4,
          strokeDasharray: '',
          opacity: 1
        }]
      };
      window.ImageAnnotator.save(src, validAnnotState);
      window.ImageAnnotator.close();
      window.ImageAnnotator.showOverlay();

      const overlayEl = document.getElementById('lightboxAnnotOverlay');
      const hasOverlayEl = !!overlayEl && overlayEl.style.display !== 'none';
      const hasChildren = overlayEl && overlayEl.children.length > 0;

      // 3. 清理标注数据并关闭灯箱
      window.ImageAnnotator.clear(src);
      closeLightbox();
      const closed = !document.getElementById('lightbox').classList.contains('show');

      return {
        initialInAnnot,
        textBeforeClick,
        exitedByBtn,
        textAfterExit,
        reenteredByBtn,
        textAfterReenter,
        hasOverlayEl,
        hasChildren,
        closed
      };
    })()
  `);
  console.log('  标注持久化回显与按钮交互检查:', annotEchoCheck);
  if (!annotEchoCheck.initialInAnnot) throw new Error('打开灯箱未能默认进入标注模式');
  if (!annotEchoCheck.exitedByBtn) throw new Error('点击 #lightboxAnnotate 按钮未能退出标注模式');
  if (!annotEchoCheck.reenteredByBtn) throw new Error('再次点击 #lightboxAnnotate 按钮未能重新进入标注模式');
  if (!annotEchoCheck.hasOverlayEl || !annotEchoCheck.hasChildren) throw new Error('#lightboxAnnotOverlay 未能成功回显已保存的标注');
  await sleep(150);

  // 测试点击遮罩层背景关闭弹窗
  console.log('  测试重新打开 L 模态框并点击遮罩层背景关闭...');
  await evaluate(ws, `openRelatedModal()`);
  await sleep(200);
  await evaluate(ws, `
    (function() {
      const modal = document.getElementById('relatedModal');
      const event = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
      modal.dispatchEvent(event);
    })()
  `);
  await sleep(300);
  const modalClosedByBackdrop = await evaluate(ws, `document.getElementById('relatedModal').style.display === 'none'`);
  console.log('  点击遮罩层背景关闭弹窗成功:', modalClosedByBackdrop);
  if (!modalClosedByBackdrop) throw new Error('点击模态框遮罩层未能成功关闭弹窗');

  // 验证主页面右侧栏题号区高度已在未展开符号栏时提升至视口最大值 (calc(100vh - 290px))
  const qnavMaxHeight = await evaluate(ws, `
    (() => {
      const q = document.getElementById('qnav');
      const style = window.getComputedStyle(q);
      const val = parseFloat(style.maxHeight);
      return {
        computedMaxHeight: style.maxHeight,
        val: val,
        isMaximized: val >= 450
      };
    })()
  `);

  // 验证老姚高数第2章 2.1-19 在右侧题号区准确归属为例题，2.1-20 为补充练习
  console.log('  验证老姚高数 2.1-19 在右侧题号区归属为例题...');
  const laoyaoSecCheck = await evaluate(ws, `
    (() => {
      const ch02 = SUBJECTS.find(s => s.id === 'math').chapters.find(c => c.wb === '老姚高数' && c.name.includes('第2章'));
      if (!ch02) return null;
      switchChapter(ch02.id);
      renderNav();

      const nav = document.getElementById('qnav');
      const buttons = Array.from(nav.querySelectorAll('button[data-group-start]'));
      const btn19 = buttons.find(b => b.textContent.includes('2.1-19'));
      const btn20 = buttons.find(b => b.textContent.includes('2.1-20'));

      function getHeaderAbove(el) {
        let prev = el.previousElementSibling;
        while (prev) {
          if (prev.classList.contains('subsection-header')) return prev.textContent.trim();
          prev = prev.previousElementSibling;
        }
        return '';
      }

      return {
        hasBtn19: !!btn19,
        hasBtn20: !!btn20,
        header19: btn19 ? getHeaderAbove(btn19) : '',
        header20: btn20 ? getHeaderAbove(btn20) : '',
        cls19: classifyLabel('2.1-19'),
        cls20: classifyLabel('2.1-20')
      };
    })()
  `);
  console.log('  老姚高数 2.1-19 题号区分类检查:', laoyaoSecCheck);
  if (!laoyaoSecCheck || laoyaoSecCheck.header19 !== '例题' || laoyaoSecCheck.cls19 !== '例题') {
    throw new Error('老姚高数 2.1-19 未能在右侧题号区正确显示为「例题」');
  }
  if (!laoyaoSecCheck || laoyaoSecCheck.header20 !== '补充练习' || laoyaoSecCheck.cls20 !== '补充练习') {
    throw new Error('老姚高数 2.1-20 未能在右侧题号区正确显示为「补充练习」');
  }

  // 测试 V 面板（全局学习进度仪表盘）
  console.log('  注入真实题库数据集并测试 V 键唤起全局学习进度面板与数据渲染...');
  const diskData = JSON.parse(fs.readFileSync('kaoyan_tiku_data.json', 'utf8')).data;
  await evaluate(ws, `
    ((data) => {
      localStorage.clear();
      for (const k in data) {
        localStorage.setItem(k, data[k]);
      }
      if (typeof loadStatuses === 'function') loadStatuses();
      if (typeof renderNav === 'function') renderNav();
    })(${JSON.stringify(diskData)})
  `);
  await sleep(300);

  await evaluate(ws, `
    (() => {
      toggleDashboard();
    })()
  `);
  await sleep(400);

  const dashboardCheck = await evaluate(ws, `
    (() => {
      const panel = document.getElementById('dashboardPanel');
      const isVisible = panel && panel.style.display !== 'none';
      const pctEl = document.getElementById('dbMasterPct');
      const pctText = pctEl ? pctEl.textContent : '';
      const metricDone = document.getElementById('dbMetricDone');
      const doneText = metricDone ? metricDone.textContent : '';
      const cards = document.querySelectorAll('#dbGrid .db-donut-card');

      // 再次调用 toggleDashboard 关闭
      toggleDashboard();

      const expectedOverall = (window.Dashboard && typeof window.Dashboard.getSubjectOverallStats === 'function')
        ? window.Dashboard.getSubjectOverallStats()
        : null;

      return {
        isVisible,
        pctText,
        doneText,
        cardsCount: cards.length,
        expectedDoneText: expectedOverall ? (expectedOverall.done + ' / ' + expectedOverall.total) : '',
        expectedPctText: expectedOverall ? (expectedOverall.progressPct + '%') : '',
        expectedDone: expectedOverall ? expectedOverall.done : 0,
        expectedTotal: expectedOverall ? expectedOverall.total : 0
      };
    })()
  `);
  console.log('  V 面板显示状态:', dashboardCheck.isVisible, '总掌握率:', dashboardCheck.pctText, '已做题数:', dashboardCheck.doneText, '书籍卡片数:', dashboardCheck.cardsCount);
  if (!dashboardCheck.isVisible) throw new Error('V 面板未能正常打开');
  if (!dashboardCheck.expectedDoneText || dashboardCheck.doneText !== dashboardCheck.expectedDoneText) {
    throw new Error(`V 面板做题数显示与底层统计不一致: UI 显示 "${dashboardCheck.doneText}", 底层统计 "${dashboardCheck.expectedDoneText}"`);
  }
  if (!dashboardCheck.expectedPctText || dashboardCheck.pctText !== dashboardCheck.expectedPctText) {
    throw new Error(`V 面板掌握率显示与底层统计不一致: UI 显示 "${dashboardCheck.pctText}", 底层统计 "${dashboardCheck.expectedPctText}"`);
  }
  if (dashboardCheck.expectedTotal !== 6319) {
    throw new Error(`数学科目总题数异常: 期望 6319, 实际 ${dashboardCheck.expectedTotal}`);
  }
  if (dashboardCheck.expectedDone < 1700) {
    throw new Error(`数学科目已做题数异常过低: 实际 ${dashboardCheck.expectedDone}`);
  }
  if (!dashboardCheck.cardsCount || dashboardCheck.cardsCount < 7) {
    throw new Error(`V 面板书籍统计卡片未渲染数据，实际数量: ${dashboardCheck.cardsCount}`);
  }

  // 7. 测试科目切换 (Math -> 822 -> English) 与英语生词本安全交互
  console.log('[8/9] 测试科目切换 (Math -> 822 -> English) 与生词本安全...');
  
  // 切换到 822
  await evaluate(ws, 'switchSubject("822")');
  await sleep(500);
  const subj822 = await evaluate(ws, 'curSubjectId');
  console.log('  当前科目:', subj822);
  if (subj822 !== '822') throw new Error('切换到 822 失败');

  // 切换到 English
  await evaluate(ws, 'switchSubject("english")');
  await sleep(500);
  const isEngVisible = await evaluate(ws, 'document.getElementById("englishAppLayout").style.display !== "none"');
  console.log('  英语界面显示状态:', isEngVisible);
  if (!isEngVisible) throw new Error('英语界面未显示');

  // 测试英语生词本：收藏含有单引号的词汇并验证安全渲染
  console.log('  测试生词本收藏特殊字符词汇 (如 don\'t)...');
  await evaluate(ws, `
    (() => {
      window.kyApp.toggleStarWord("don't", { ipa: "dəʊnt", meaning: "aux. 不，别 (do not 的缩写)" });
      window.kyApp.openVocabNotebook();
    })()
  `);
  await sleep(400);

  const vocabCheck = await evaluate(ws, `
    (() => {
      const modal = document.getElementById('engModalVocabBook');
      const isVisible = modal && modal.style.display !== 'none';
      const cards = document.querySelectorAll('#vocabGrid .vocab-card');
      const hasWord = Array.from(cards).some(c => c.textContent.includes("don't"));
      
      // 测试点击移除
      const unstarBtn = document.querySelector('#vocabGrid .vocab-unstar-btn');
      if (unstarBtn) unstarBtn.click();

      // 关闭生词本弹窗
      window.kyApp.closeVocabNotebook();
      return { isVisible, cardCount: cards.length, hasWord };
    })()
  `);
  console.log('  生词本可见:', vocabCheck.isVisible, '卡片数量:', vocabCheck.cardCount, '正确包含特殊字符词汇:', vocabCheck.hasWord);
  if (!vocabCheck.hasWord) throw new Error('生词本特殊字符词汇渲染失败');

  // 测试考研英语下的滚轮手势隔离（横向滑动绝不穿透导致数学题号漂移）
  console.log('  测试英语模式滚轮手势隔离 (防止跨学科题目漂移)...');
  const wheelIsolationCheck = await evaluate(ws, `
    (() => {
      const mathIdxBefore = current;
      // 触发横向滚轮事件
      document.dispatchEvent(new WheelEvent('wheel', { deltaX: 120, bubbles: true }));
      return {
        mathIdxBefore,
        mathIdxAfter: current,
        isIsolated: current === mathIdxBefore
      };
    })()
  `);
  console.log('  英语滚轮手势隔离检查:', wheelIsolationCheck);
  if (!wheelIsolationCheck.isIsolated) throw new Error('英语模式下手势穿透导致数学题目索引漂移');

  // 测试英语模式下按 Y 键切换主题（单轨调度，确保仅切换一次且不发生双重翻转抵消）
  console.log('  测试英语模式 Y 键主题单轨翻转 (防双击抵消)...');
  const themeToggleCheck = await evaluate(ws, `
    (() => {
      const t1 = window.currentTheme || document.documentElement.getAttribute('data-theme') || 'light';
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'y', bubbles: true }));
      const t2 = window.currentTheme || document.documentElement.getAttribute('data-theme') || 'light';
      // 再按一次翻转回来
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'y', bubbles: true }));
      const t3 = window.currentTheme || document.documentElement.getAttribute('data-theme') || 'light';
      return {
        t1,
        t2,
        t3,
        toggledOnce: t1 !== t2,
        restored: t1 === t3
      };
    })()
  `);
  console.log('  英语模式 Y 键主题翻转检查:', themeToggleCheck);
  if (!themeToggleCheck.toggledOnce) throw new Error('英语模式下 Y 键主题切换失败或发生双重翻转抵消');
  if (!themeToggleCheck.restored) throw new Error('英语模式下第二次按 Y 键未能还原初始主题');

  // 测试英语科目键盘快捷键 (1-4 选项选择、Q/E 切题导航)
  console.log('  测试英语科目键盘快捷键 (1-4 选选项与 Q/E 导航)...');
  const engKeyboardCheck = await evaluate(ws, `
    (() => {
      // 切换到模考模式
      window.kyApp.setMode('practice');
      const qBefore = window.kyApp.state.currentQIndex;
      // 按数字键 1 触发选项 A 选择
      document.dispatchEvent(new KeyboardEvent('keydown', { key: '1', bubbles: true }));
      const pAns = window.kyApp.state.practiceAnswers[qBefore];
      const optSelected = pAns && pAns.selected === 'A';

      // 按 E 键导航到下一题 (navNext)
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'e', bubbles: true }));
      const qAfterNext = window.kyApp.state.currentQIndex;
      const nextWorked = qAfterNext !== qBefore;

      // 按 Q 键返回上一题 (navPrev)
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'q', bubbles: true }));
      const qAfterPrev = window.kyApp.state.currentQIndex;
      const prevWorked = qAfterPrev === qBefore;

      return {
        optSelected,
        nextWorked,
        prevWorked
      };
    })()
  `);
  console.log('  英语键盘做题与导航检查:', engKeyboardCheck);
  if (!engKeyboardCheck.optSelected) throw new Error('英语模式下数字键 1 选选项失败 (selectOption 异常)');
  if (!engKeyboardCheck.nextWorked || !engKeyboardCheck.prevWorked) throw new Error('英语模式下 E/Q 导航切题失败');

  // 8. 切换回 Math 并测试跨章节安全撤销与战报弹窗
  console.log('[9/9] 测试跨章节 Ctrl+Z 撤销与状态回滚...');
  await evaluate(ws, 'switchSubject("math")');
  await sleep(500);

  // 测试错题本打开与 setPanelTitle 标题栏恢复
  console.log('  测试错题本打开、标题渲染与切科目安全...');
  const wrongBookCheck = await evaluate(ws, `
    (() => {
      // 触发打开错题本 (按 B)
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', bubbles: true }));
      const panel = document.getElementById('wrongBookPanel');
      const pTitle = document.getElementById('panelTitle');
      const isOpen = panel && panel.style.display !== 'none';
      const titleText = pTitle ? pTitle.textContent : '';

      // 关闭错题本 (按 B)
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', bubbles: true }));
      const isClosed = panel && panel.style.display === 'none';
      const ddWb = document.getElementById('ddWb');
      const ddChapter = document.getElementById('ddChapter');
      const ddWbWrongbook = document.getElementById('ddWbWrongbook');

      return {
        isOpen,
        titleText,
        isClosed,
        ddWbVisible: ddWb ? ddWb.style.display !== 'none' : false,
        ddChapterVisible: ddChapter ? ddChapter.style.display !== 'none' : false,
        ddWbWrongbookHidden: ddWbWrongbook ? ddWbWrongbook.style.display === 'none' : true
      };
    })()
  `);
  console.log('  错题本与 setPanelTitle 检查:', wrongBookCheck);
  if (!wrongBookCheck.isOpen) throw new Error('未能成功打开错题本面板');
  if (wrongBookCheck.titleText !== '错题本') throw new Error('错题本模式下 setPanelTitle 未能正确设置标题');
  if (!wrongBookCheck.isClosed) throw new Error('按 B 键未能成功关闭错题本');
  if (!wrongBookCheck.ddWbWrongbookHidden) throw new Error('关闭错题本后 ddWbWrongbook 未能隐藏（下拉栏泄漏）');
  if (!wrongBookCheck.ddWbVisible || !wrongBookCheck.ddChapterVisible) throw new Error('关闭错题本后主标题栏下拉未能正确恢复');

  // 测试主页面关联考点弹出面板 (quickTopicPopover) 与拖拽排序属性
  console.log('  测试主页面关联考点浮层 (+ 关联考点) 与拖拽手柄/排序属性...');
  const quickTopicCheck = await evaluate(ws, `
    (() => {
      const btn = document.getElementById('btnQuickAddTopic');
      const popover = document.getElementById('quickTopicPopover');
      if (btn) btn.click();
      const isOpen = popover && popover.style.display !== 'none';
      const items = document.querySelectorAll('#quickTopicList .qtp-item');
      const firstItem = items[0];
      const hasDraggable = firstItem ? firstItem.getAttribute('draggable') === 'true' : true;
      const hasDragHandle = firstItem ? !!firstItem.querySelector('.qtp-drag-handle') : true;

      // 关闭浮层
      const btnClose = document.getElementById('btnCloseQuickTopic');
      if (btnClose) btnClose.click();
      const isClosed = popover && popover.style.display === 'none';

      return {
        isOpen,
        itemCount: items.length,
        hasDraggable,
        hasDragHandle,
        isClosed
      };
    })()
  `);
  console.log('  关联考点浮层与拖拽手柄检查:', quickTopicCheck);
  if (!quickTopicCheck.isOpen) throw new Error('未能成功打开快速关联考点浮层');
  if (!quickTopicCheck.hasDraggable) throw new Error('快速关联考点项缺少 draggable 属性');
  if (!quickTopicCheck.hasDragHandle) throw new Error('快速关联考点项缺少拖拽手柄 .qtp-drag-handle');
  if (!quickTopicCheck.isClosed) throw new Error('未能成功关闭快速关联考点浮层');

  // 测试左侧栏「带标注」筛选按钮文案与筛选交互
  console.log('  测试左侧栏「带标注」筛选按钮与状态筛选联动...');
  const filterCheck = await evaluate(ws, `
    (() => {
      const unmarkedBtn = document.querySelector('.filter-btn[data-filter="unmarked"]');
      const btnMain = unmarkedBtn ? unmarkedBtn.querySelector('.filter-btn-main') : null;
      const text = btnMain ? btnMain.textContent.trim() : '';
      const hasCorrectText = text.startsWith('带标注');

      // 模拟点击「带标注」
      if (unmarkedBtn) unmarkedBtn.click();
      const isUnmarkedActive = unmarkedBtn ? unmarkedBtn.classList.contains('active') : false;

      // 切回「全部」
      const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
      if (allBtn) allBtn.click();
      const isAllActive = allBtn ? allBtn.classList.contains('active') : false;

      return {
        hasCorrectText,
        text,
        isUnmarkedActive,
        isAllActive
      };
    })()
  `);
  console.log('  左侧栏「带标注」筛选检查:', filterCheck);
  if (!filterCheck.hasCorrectText) throw new Error(`筛选按钮文案期望以「带标注」开头，实际为 "${filterCheck.text}"`);
  if (!filterCheck.isUnmarkedActive) throw new Error('点击「带标注」筛选按钮未能激活该筛选');
  if (!filterCheck.isAllActive) throw new Error('点击「全部」筛选按钮未能恢复全量筛选');

  // 测试按 M 打开 SM-2 面板，验证无 dayLabels 崩溃、已掌握卡片渲染与 #btnSm2Close 按钮关闭
  console.log('  测试按 M 打开 SM-2 复习面板、已掌握卡片渲染与 #btnSm2Close 关闭交互...');
  const sm2PanelCheck = await evaluate(ws, `
    (() => {
      // 按 M 打开 SM-2 面板
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'm', bubbles: true }));
      const panel = document.getElementById('sm2Panel');
      const isOpen = panel && panel.style.display !== 'none';
      const projBars = document.getElementById('sm2ProjectionBars');
      const hasBars = projBars && projBars.children.length === 7;
      const chapterList = document.getElementById('sm2Chapters');
      const hasList = chapterList && chapterList.children.length > 0;

      // 验证 #sm2CardMastered 数值渲染 (P2-1 修复验证)
      const elMastered = document.querySelector('#sm2CardMastered .sm2-stat-num');
      const masteredText = elMastered ? elMastered.textContent.trim() : '';
      const hasMasteredStat = elMastered && masteredText !== '';

      // 验证通过 #btnSm2Close 按钮点击关闭 (P1-1 修复验证)
      const btnClose = document.getElementById('btnSm2Close');
      const hasBtnClose = !!btnClose;
      if (btnClose) btnClose.click();
      const isClosedByBtn = panel && panel.style.display === 'none';

      // 重新按 M 打开并按 M 关闭，验证键盘快捷键闭环
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'm', bubbles: true }));
      const isReopened = panel && panel.style.display !== 'none';
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'm', bubbles: true }));
      const isClosedByM = panel && panel.style.display === 'none';

      return {
        isOpen,
        hasBars,
        hasList,
        hasMasteredStat,
        masteredText,
        hasBtnClose,
        isClosedByBtn,
        isReopened,
        isClosedByM
      };
    })()
  `);
  console.log('  SM-2 面板、已掌握统计与关闭按钮检查:', sm2PanelCheck);
  if (!sm2PanelCheck.isOpen) throw new Error('按 M 键未能成功打开 SM-2 面板');
  if (!sm2PanelCheck.hasBars) throw new Error('SM-2 预测柱状图未能正常渲染 (dayLabels 异常)');
  if (!sm2PanelCheck.hasList) throw new Error('SM-2 章节模块列表未能正常渲染');
  if (!sm2PanelCheck.hasMasteredStat) throw new Error('#sm2CardMastered 已掌握统计卡片未渲染数值');
  if (!sm2PanelCheck.hasBtnClose) throw new Error('SM-2 复习面板缺少 #btnSm2Close 关闭按钮');
  if (!sm2PanelCheck.isClosedByBtn) throw new Error('点击 #btnSm2Close 关闭按钮未能成功关闭 SM-2 面板');
  if (!sm2PanelCheck.isReopened || !sm2PanelCheck.isClosedByM) throw new Error('按 M 键未能正常再次打开并关闭 SM-2 面板');

  // 验证 9 个 window 全局状态符号 descriptor 与 getter/setter 契约 (P0-3 修复验证)
  console.log('  测试 9 个 window 全局状态符号 (current, currentChapterId, currentTheme, darkImageFilter, subjectPickerOpen, dashboardOpen, wrongBookOpen, sm2PanelOpen, subMode) 动态同步契约...');
  const globalPropsCheck = await evaluate(ws, `
    (() => {
      const props = [
        'current',
        'currentChapterId',
        'currentTheme',
        'darkImageFilter',
        'subjectPickerOpen',
        'dashboardOpen',
        'wrongBookOpen',
        'sm2PanelOpen',
        'subMode'
      ];
      const results = {};
      for (const p of props) {
        const desc = Object.getOwnPropertyDescriptor(window, p);
        results[p] = {
          hasDesc: !!desc,
          hasGetter: desc ? typeof desc.get === 'function' : false,
          hasSetter: desc ? typeof desc.set === 'function' : false,
          valDefined: window[p] !== undefined
        };
      }
      return results;
    })()
  `);
  console.log('  全局状态属性契约检查:', globalPropsCheck);
  for (const p in globalPropsCheck) {
    const item = globalPropsCheck[p];
    if (!item.hasDesc || !item.hasGetter || !item.hasSetter) {
      throw new Error('全局状态符号 window.' + p + ' 缺少有效的 getter/setter 描述符，状态同步未生效');
    }
    if (!item.valDefined) {
      throw new Error('全局状态符号 window.' + p + ' 读取值为 undefined');
    }
  }

  // 测试复习会话统一数据源 (window.reviewSession) 与复习键盘链路 (E 不跳章、Z 推进队列、Esc 退出)
  console.log('  测试复习会话状态同步、E/Z 队列推进与 Esc 退出...');
  const reviewSessionCheck = await evaluate(ws, `
    (() => {
      // 启动当前章节复习
      window.Sm2Review.startChapter(currentChapterId);
      const hasSession = !!window.reviewSession;
      const originIdx = window.reviewSession ? window.reviewSession.currentIdx : -1;
      const originCh = currentChapterId;

      // 按 E 键推进复习队列，必须在队列内前进，绝不能跳出当前章节
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'e', bubbles: true }));
      const chAfterE = currentChapterId;
      const noChapterLeak = (chAfterE === originCh);

      // 按 Z 键评级，必须推进队列且不污染题目常规掌握度
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', bubbles: true }));
      const sessionAfterZ = window.reviewSession;
      const queueAdvanced = sessionAfterZ && sessionAfterZ.currentIdx > originIdx;

      // 按 Esc 退出复习
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      const sessionCleared = !window.reviewSession;

      // 验证已持久化保存到 kaoyan.g.review_session
      const savedRaw = window.StorageEngine ? window.StorageEngine.GlobalStore.get('review_session') : null;
      const hasSavedSession = !!savedRaw;

      // 验证再次进入自动从断点恢复
      if (window.Sm2Review && typeof window.Sm2Review.resumeSession === 'function') {
        window.Sm2Review.resumeSession();
      }
      const restoredSession = !!window.reviewSession;

      // 再次退出并清理
      if (typeof window.exitReviewSession === 'function') {
        window.exitReviewSession();
      }

      return {
        hasSession,
        noChapterLeak,
        queueAdvanced,
        sessionCleared,
        hasSavedSession,
        restoredSession
      };
    })()
  `);
  console.log('  复习会话单源状态与键盘链路检查:', reviewSessionCheck);
  if (!reviewSessionCheck.hasSession) throw new Error('未能成功建立并同步复习会话状态');
  if (!reviewSessionCheck.noChapterLeak) throw new Error('复习会话中按 E 键发生跨章泄漏');
  if (!reviewSessionCheck.queueAdvanced) throw new Error('复习会话中按 Z 键未能成功推进队列');
  if (!reviewSessionCheck.sessionCleared) throw new Error('按 Esc 未能成功退出复习会话');
  if (!reviewSessionCheck.hasSavedSession) throw new Error('Esc 退出时复习进度未能持久化至 kaoyan.g.review_session');
  if (!reviewSessionCheck.restoredSession) throw new Error('未能从 kaoyan.g.review_session 成功断点续接复习会话');

  // 测试复习完成结算战报弹窗 (reviewSummaryOverlay) 按键与遮罩隔离
  console.log('  测试复习战报结算弹窗 Esc 与独占隔离...');
  const summaryModalCheck = await evaluate(ws, `
    (() => {
      const modal = document.getElementById('reviewSummaryOverlay');
      if (window.Sm2Review && typeof window.Sm2Review.showSummaryModal === 'function') {
        window.Sm2Review.showSummaryModal({ queue: [{ finalScore: 5 }], startTime: Date.now() });
      } else if (typeof window.showReviewSummaryModal === 'function') {
        window.showReviewSummaryModal({ queue: [{ finalScore: 5 }], startTime: Date.now() });
      }
      const isOpenBefore = typeof window.isReviewSummaryOpen === 'function' && window.isReviewSummaryOpen();

      // 验证战报开启时，做题按键 (1~5/Z/X/C/A/D) 与滚轮完全被战报吞噬
      const curBefore = current;
      const statusBefore = statuses[current];
      document.dispatchEvent(new KeyboardEvent('keydown', { key: '1', bubbles: true }));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', bubbles: true }));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'd', bubbles: true }));
      document.dispatchEvent(new WheelEvent('wheel', { deltaX: 100, bubbles: true }));
      const isSwallowed = (current === curBefore) && (statuses[current] === statusBefore);

      // 按 Esc 关闭战报
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      const isOpenAfter = typeof window.isReviewSummaryOpen === 'function' && window.isReviewSummaryOpen();
      const isDisplayNone = modal ? modal.style.display === 'none' : true;
      return {
        isOpenBefore,
        isOpenAfter,
        isDisplayNone,
        isSwallowed
      };
    })()
  `);
  console.log('  复习战报弹窗 Esc 隔离与按键吞噬检查:', summaryModalCheck);
  if (!summaryModalCheck.isOpenBefore) throw new Error('复习战报未能正常打开或未标记 open 状态');
  if (!summaryModalCheck.isSwallowed) throw new Error('复习战报打开时未阻断底层题目打标/切题');
  if (summaryModalCheck.isOpenAfter || !summaryModalCheck.isDisplayNone) throw new Error('按下 Esc 未能成功关闭复习战报弹窗');

  // 测试科目选择弹窗按键阻断与 Esc 关闭
  console.log('  测试科目选择器 G 键唤起与 Esc 级联关闭...');
  const pickerCheck = await evaluate(ws, `
    (() => {
      openSubjectPicker();
      const isOpen = document.getElementById('subjectOverlay').classList.contains('show');
      const curBefore = current;
      // 触发 A / D 切题键，必须被科目选择器拦截
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'd', bubbles: true }));
      const isBlocked = (current === curBefore);
      // 按 Esc 关闭科目选择器
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      const isClosed = !document.getElementById('subjectOverlay').classList.contains('show');
      return { isOpen, isBlocked, isClosed };
    })()
  `);
  console.log('  科目选择器检查:', pickerCheck);
  if (!pickerCheck.isOpen || !pickerCheck.isBlocked || !pickerCheck.isClosed) {
    throw new Error('科目选择器按键隔离或 Esc 关闭交互失败');
  }

  // 测试双栏笔记在失焦态按 Esc 取消编辑
  console.log('  测试双栏笔记失焦后 Esc 取消编辑...');
  const notesEscCheck = await evaluate(ws, `
    (() => {
      focusNotes(); // 进入编辑态
      const duo = document.getElementById('notesDuo');
      const isEditingBefore = duo && duo.style.display !== 'none';
      if (document.activeElement) document.activeElement.blur(); // 模拟失焦
      // 按 Esc 取消编辑
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      const isEditingAfter = duo && duo.style.display !== 'none';
      return { isEditingBefore, isEditingAfter };
    })()
  `);
  console.log('  笔记失焦 Esc 取消编辑检查:', notesEscCheck);
  if (!notesEscCheck.isEditingBefore || notesEscCheck.isEditingAfter) {
    throw new Error('双栏笔记失焦后按下 Esc 未能成功取消编辑');
  }

  // 测试双栏笔记与常驻渲染区三位一体回显 (P1-2 修复验证: notesRender, notesTextarea, notesPreview)
  console.log('  测试笔记渲染区、输入框与预览区三位一体回显与数据同步...');
  const notesTriadCheck = await evaluate(ws, `
    (() => {
      const testContent = '## 考点总结测试\\n- 极限运算法则: $\\\\lim_{x \\\\to 0} \\\\frac{\\\\sin x}{x} = 1$';
      const key = notesKeyFor(current);
      const originalNote = notesData[key];

      // 1. 设置笔记数据并调用 renderNotes (查看态回显)
      notesData[key] = testContent;
      renderNotes();
      const renderEl = document.getElementById('notesRender');
      const renderHasContent = renderEl && renderEl.innerHTML.includes('考点总结测试');

      // 2. 调用 enterEditMode (编辑态三位一体回显)
      enterEditMode();
      const textareaEl = document.getElementById('notesTextarea');
      const previewEl = document.getElementById('notesPreview');
      const textareaSynced = textareaEl && textareaEl.value === testContent;
      const previewSynced = previewEl && previewEl.innerHTML.includes('考点总结测试');

      // 3. 恢复现场并清理测试数据
      if (originalNote) {
        notesData[key] = originalNote;
      } else {
        delete notesData[key];
      }
      renderNotes();

      return {
        renderHasContent,
        textareaSynced,
        previewSynced
      };
    })()
  `);
  console.log('  笔记三位一体同步检查:', notesTriadCheck);
  if (!notesTriadCheck.renderHasContent) throw new Error('renderNotes 未能将笔记内容渲染至 #notesRender');
  if (!notesTriadCheck.textareaSynced) throw new Error('enterEditMode 未能将笔记同步至 #notesTextarea.value');
  if (!notesTriadCheck.previewSynced) throw new Error('enterEditMode 未能将笔记即时渲染至 #notesPreview');

  // 测试题号栏分区手风琴折叠与当前做题分区锁定
  console.log('  测试题号栏分区锁定、全部折叠只留当前分区、跨小节自动聚焦...');
  const accordionCheck = await evaluate(ws, `
    (() => {
      // 1. 验证当前分区锁定不可折叠
      const curHeader = document.querySelector('#qnav .section-header.current-locked');
      const hasLockedHeader = !!curHeader;
      
      // 点击当前锁定分区，断言其依然保持展开，绝不折叠
      if (curHeader) curHeader.click();
      const stillOpenAfterClick = curHeader && !curHeader.classList.contains('collapsed');

      // 2. 测试「全部折叠/全部展开」按钮
      const toggleAllBtn = document.getElementById('btnToggleAllSections');
      const btnTextBefore = toggleAllBtn ? toggleAllBtn.textContent : '';
      
      // 若当前为「全部折叠」则点击收起其它分区；若已是「全部展开」，说明手风琴已自动将其它分区折叠
      if (btnTextBefore === '全部折叠') {
        toggleAllBtn.click();
      }
      const allHeaders = Array.from(document.querySelectorAll('#qnav .section-header'));
      const otherHeaders = allHeaders.filter(h => !h.classList.contains('current-locked'));
      const othersCollapsed = otherHeaders.length === 0 || otherHeaders.every(h => h.classList.contains('collapsed'));
      const curStillOpen = curHeader && !curHeader.classList.contains('collapsed');

      // 再次点击「全部展开」验证展开逻辑
      if (toggleAllBtn && toggleAllBtn.textContent === '全部展开') {
        toggleAllBtn.click();
      }
      const allHeadersExpanded = Array.from(document.querySelectorAll('#qnav .section-header')).every(h => !h.classList.contains('collapsed'));

      return {
        hasLockedHeader,
        stillOpenAfterClick,
        othersCollapsed,
        curStillOpen,
        allHeadersExpanded
      };
    })()
  `);
  console.log('  分区手风琴与当前分区锁定检查:', accordionCheck);
  if (!accordionCheck.hasLockedHeader) throw new Error('当前做题分区未标记 current-locked 锁定类');
  if (!accordionCheck.stillOpenAfterClick) throw new Error('点击当前分区标题导致其被异常折叠（违反当前做题分区锁定规范）');
  if (!accordionCheck.othersCollapsed || !accordionCheck.curStillOpen) throw new Error('全部折叠时未能保持当前分区展开且其它分区折叠');

  const undoCheck = await evaluate(ws, `
    (() => {
      const ch1Uid = 'math::基础30讲::高数::lec01';
      const ch2Uid = 'math::基础30讲::高数::lec02';

      // 1. 在第1讲记录当前题 0 的原始状态，并打标为不同状态
      switchChapter(ch1Uid);
      switchTo(0);
      const originalStatus = statuses[0] || 'unmarked';
      const targetStatus = originalStatus === 'wrong' ? 'proficient' : 'wrong';
      setStatus(targetStatus);

      // 2. 切换到第2讲的题 0
      switchChapter(ch2Uid);
      switchTo(0);

      // 3. 触发 Ctrl+Z 撤销，断言跨章节回到第1讲题 0 且状态精准回滚至 originalStatus
      undoLastMark();

      return {
        ch1Uid,
        originalStatus,
        targetStatus,
        curChAfterUndo: currentChapterId,
        curIdxAfterUndo: current,
        statusAfterUndo: statuses[0] || 'unmarked'
      };
    })()
  `);
  const isCh1 = undoCheck.curChAfterUndo === undoCheck.ch1Uid;
  if (!isCh1 || undoCheck.statusAfterUndo !== undoCheck.originalStatus) {
    throw new Error(`跨章节撤销失败: 期望回滚至原始状态 "${undoCheck.originalStatus}", 实际为 "${undoCheck.statusAfterUndo}"`);
  }

  // 响应式布局与移动端视图测试
  console.log('  测试响应式移动端视口 (390x844)...');
  await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    mobile: true
  });
  await sleep(500);

  const mobileCheck = await evaluate(ws, `
    (() => {
      const qImg = document.getElementById('questionImg');
      const rect = qImg.getBoundingClientRect();
      return {
        width: rect.width,
        isFits: rect.width <= 390
      };
    })()
  `);
  console.log('  移动端题目宽度:', mobileCheck.width, '适合屏幕:', mobileCheck.isFits);

  // 恢复视口
  await sendCDP(ws, 'Emulation.clearDeviceMetricsOverride');

  // 验证无异常
  console.log('\n--- 控制台与运行时异常检查 ---');
  if (exceptions.length > 0) {
    console.error('  发现以下运行时异常:');
    exceptions.forEach(e => console.error('  - ' + e));
    throw new Error(`测试过程中触发了 ${exceptions.length} 个未捕获异常`);
  } else {
    console.log('  \x1b[32m✔\x1b[0m 0 个控制台/运行时未捕获异常');
  }

  ws.close();
  console.log('\n====================================================');
  console.log('  \x1b[32m✔ 所有 CDP 浏览器端到端测试均顺利通过！\x1b[0m');
  console.log('====================================================\n');
}

async function cleanup() {
  if (chromeProcess && chromeProcess.pid) {
    try {
      execSync(`taskkill /F /PID ${chromeProcess.pid} /T`, { stdio: 'ignore' });
    } catch (e) {}
    chromeProcess = null;
  }
  if (httpProcess && httpProcess.pid) {
    try {
      execSync(`taskkill /F /PID ${httpProcess.pid} /T`, { stdio: 'ignore' });
    } catch (e) {}
    httpProcess = null;
  }
  try {
    execSync(`powershell -Command "(Get-NetTCPConnection -LocalPort 9225 -ErrorAction SilentlyContinue).OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }"`, { stdio: 'ignore' });
  } catch (e) {}
}

run()
  .then(() => {
    cleanup();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('\n\x1b[31mE2E 测试失败:\x1b[0m', err.message);
    await cleanup();
    process.exit(1);
  });
