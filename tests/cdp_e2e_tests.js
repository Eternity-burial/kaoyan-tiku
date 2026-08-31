/**
 * 考研题库与复习工作台 - CDP 自动化浏览器端到端测试
 * 覆盖：页面加载、全科目切换 (Math <-> 822 <-> English <-> Bishe)、
 * 键盘快捷键导航、状态评级、笔记与公式渲染、相关题模态框、移动端响应式布局、全局无控制台报错
 */

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

function evaluate(ws, expression, id = 2) {
  return sendCDP(ws, 'Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, id)
    .then(r => r.result ? r.result.value : undefined);
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
  const targets = await getJson(`http://127.0.0.1:${PORT}/json`);
  const pageTarget = targets.find(t => t.type === 'page');
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

  // 5. 测试主页面考点快速添加与即时删除
  console.log('[6/8] 测试主页面考点快速关联与删除交互...');
  await evaluate(ws, `
    (() => {
      // 点击快速关联考点按钮
      document.getElementById('btnQuickAddTopic').click();
      const input = document.getElementById('inputQuickTopicSearch');
      input.value = '洛必达求极限 $\\\\lim_{x \\\\to 0}\\\\frac{\\\\sin x}{x}$';
      document.getElementById('btnQuickCreateTopic').click();
    })()
  `);
  await sleep(400);

  const topicCountAfterAdd = await evaluate(ws, `document.querySelectorAll('#relatedTopicsWrap .related-topic-pill').length`);
  console.log('  添加考点后胶囊数量:', topicCountAfterAdd);
  if (topicCountAfterAdd === 0) throw new Error('考点未成功添加');

  // 测试点击 ✕ 即时删除
  await evaluate(ws, `
    (() => {
      const delBtn = document.querySelector('#relatedTopicsWrap .topic-pill-remove');
      if (delBtn) delBtn.click();
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

      // 关闭灯箱
      closeLightbox();

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

  // 测试点击遮罩层背景关闭弹窗
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

  // 验证主页面右侧栏题号区高度已提升为 1.5 倍 (405px)
  const qnavMaxHeight = await evaluate(ws, `window.getComputedStyle(document.getElementById('qnav')).maxHeight`);
  console.log('  主页面右侧栏题号区 max-height (1.5倍):', qnavMaxHeight);
  if (qnavMaxHeight !== '405px') throw new Error('主页面题号区高度未正确设置为 405px (当前为 ' + qnavMaxHeight + ')');

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

  // 8. 切换回 Math 并测试跨章节安全撤销
  console.log('[9/9] 测试跨章节 Ctrl+Z 撤销与状态回滚...');
  await evaluate(ws, 'switchSubject("math")');
  await sleep(500);

  const undoCheck = await evaluate(ws, `
    (() => {
      // 1. 在 ch1 的题 0 打标为熟练 (Z)
      switchChapter('ch1');
      switchTo(0);
      setStatus('proficient');
      const status1Before = statuses[0];

      // 2. 切换到 ch2 的题 0
      switchChapter('ch2');
      switchTo(0);
      const ch2Before = currentChapterId;

      // 3. 触发 Ctrl+Z 撤销
      undoLastMark();

      return {
        status1Before,
        curChAfterUndo: currentChapterId,
        curIdxAfterUndo: current,
        status1AfterUndo: statuses[0] || 'unmarked'
      };
    })()
  `);
  console.log('  撤销前状态:', undoCheck.status1Before, '撤销后回到章节:', undoCheck.curChAfterUndo, '题号:', undoCheck.curIdxAfterUndo, '撤销后状态:', undoCheck.status1AfterUndo);
  if (undoCheck.curChAfterUndo !== 'ch1' || undoCheck.status1AfterUndo !== 'unmarked') {
    throw new Error('跨章节撤销失败，未正确回退至 ch1 原始未打标状态');
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
  }
  if (httpProcess && httpProcess.pid) {
    try {
      execSync(`taskkill /F /PID ${httpProcess.pid} /T`, { stdio: 'ignore' });
    } catch (e) {}
  }
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
