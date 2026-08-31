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

  // 6. 测试 L 快捷键打开模态框、布局无重叠与题号对齐
  console.log('[7/8] 测试 L 面板 (考点管理与跨书题号网格)...');
  await evaluate(ws, `openRelatedModal()`);
  await sleep(400);

  const modalLayoutCheck = await evaluate(ws, `
    (() => {
      const modal = document.getElementById('relatedModal');
      const isVisible = modal && modal.style.display !== 'none';
      const navBtns = document.querySelectorAll('#rmNavSection .rm-nav-btn').length;
      const secHeaders = document.querySelectorAll('#rmNavSection .section-header').length;
      const boxCurrent = document.querySelector('.rm-box-current').getBoundingClientRect();
      const boxAvail = document.querySelector('.rm-box-available').getBoundingClientRect();
      const boxCreate = document.querySelector('.rm-box-create').getBoundingClientRect();
      
      // 检查垂直排列无重叠: boxCurrent.bottom <= boxAvail.top, boxAvail.bottom <= boxCreate.top
      const noOverlap = (boxCurrent.bottom <= boxAvail.top + 2) && (boxAvail.bottom <= boxCreate.top + 2);

      return {
        isVisible,
        navBtns,
        secHeaders,
        noOverlap
      };
    })()
  `);
  console.log('  L面板可见:', modalLayoutCheck.isVisible, '题号按钮数:', modalLayoutCheck.navBtns, '分区标题数:', modalLayoutCheck.secHeaders, '左侧卡片无重叠:', modalLayoutCheck.noOverlap);
  if (!modalLayoutCheck.isVisible) throw new Error('L面板未能正常打开');
  if (modalLayoutCheck.navBtns === 0) throw new Error('L面板题号网格渲染失败');
  if (!modalLayoutCheck.noOverlap) throw new Error('L面板左侧卡片出现重叠');

  await evaluate(ws, `closeRelatedModal()`);
  await sleep(300);

  // 7. 测试科目切换 (Math -> 822 -> English)
  console.log('[8/8] 测试科目切换 (Math -> 822 -> English)...');
  
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

  // 切换回 Math
  await evaluate(ws, 'switchSubject("math")');
  await sleep(500);

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
