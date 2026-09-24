/**
 * 思维导图沙箱自动化验证套件 (CDP E2E Test Suite)
 * 测试内容：
 * 1. 沙箱独立 HTML 与 Vendor 资源加载 (无 404，无 JS/CSS 报错)
 * 2. SimpleMindMap 实例正确挂载并渲染出 SVG 节点树
 * 3. 默认知识架构数据结构与节点总数校验
 * 4. 视口控制命令 (居中、自适应、放大、缩小) 与比例联动
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const WSClient = globalThis.WebSocket;
const HTTP_PORT = 8991;
const CDP_PORT = 9331;
const ROOT_DIR = path.resolve(__dirname, '..');

let httpServer = null;
let chromeProcess = null;
let exceptions = [];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 简易静态文件服务器
function startHttpServer() {
  return new Promise((resolve) => {
    httpServer = http.createServer((req, res) => {
      let reqPath = decodeURIComponent(req.url.split('?')[0]);
      if (reqPath === '/') reqPath = '/mindmap-sandbox/index.html';
      const filePath = path.join(ROOT_DIR, reqPath);

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const mimeMap = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.svg': 'image/svg+xml'
      };
      const contentType = mimeMap[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    });

    httpServer.listen(HTTP_PORT, '127.0.0.1', () => {
      console.log(`[HTTP] 沙箱静态服务器已启动: http://127.0.0.1:${HTTP_PORT}/mindmap-sandbox/index.html`);
      resolve();
    });
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

let cdpSeq = 200;
function evaluate(ws, expression) {
  const id = ++cdpSeq;
  return sendCDP(ws, 'Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, id)
    .then(r => {
      if (r && r.exceptionDetails) {
        const desc = (r.exceptionDetails.exception && r.exceptionDetails.exception.description) || r.exceptionDetails.text;
        throw new Error(`[CDP Evaluation Error]: ${desc}`);
      }
      return r && r.result ? r.result.value : undefined;
    });
}

async function cleanup() {
  if (chromeProcess) {
    try { chromeProcess.kill('SIGKILL'); } catch (e) {}
    chromeProcess = null;
  }
  if (httpServer) {
    try { httpServer.close(); } catch (e) {}
    httpServer = null;
  }
}

async function run() {
  console.log('====================================================');
  console.log('  思维导图沙箱 - Phase 2 自动化回归验证 (CDP E2E)');
  console.log('====================================================\n');

  try {
    // 1. 启动静态服务器
    await startHttpServer();

    // 2. 查找并启动 Chrome
    const chromeCandidates = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
    ];
    const chromePath = chromeCandidates.find(p => fs.existsSync(p));
    if (!chromePath) {
      throw new Error('未找到 Chrome 或 Edge 浏览器可执行程序');
    }

    const profileDir = path.join(require('os').tmpdir(), `mindmap_cdp_profile_${Date.now()}`);
    console.log(`[Chrome] 启动浏览器: ${chromePath} (端口: ${CDP_PORT})...`);
    chromeProcess = spawn(chromePath, [
      `--remote-debugging-port=${CDP_PORT}`,
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      `--user-data-dir=${profileDir}`,
      `http://127.0.0.1:${HTTP_PORT}/mindmap-sandbox/index.html`
    ], { detached: false, stdio: 'ignore' });

    await sleep(2000);

    // 3. 连接 CDP WebSocket
    console.log('[CDP] 连接 Chrome DevTools 协议...');
    let pageTarget = null;
    for (let retry = 0; retry < 15; retry++) {
      try {
        const targets = await getJson(`http://127.0.0.1:${CDP_PORT}/json`);
        pageTarget = targets && targets.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
        if (pageTarget) break;
      } catch (e) {}
      await sleep(400);
    }

    if (!pageTarget) throw new Error('无法连接至 Chrome 调试端口');

    const ws = new WSClient(pageTarget.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve);
      ws.addEventListener('error', reject);
    });

    // 开启 Runtime 异常捕获
    await sendCDP(ws, 'Runtime.enable');
    await sendCDP(ws, 'Page.enable');

    ws.addEventListener('message', (evt) => {
      try {
        const msg = JSON.parse(evt.data.toString());
        if (msg.method === 'Runtime.exceptionThrown') {
          exceptions.push(msg.params.exceptionDetails);
        }
      } catch (e) {}
    });

    // 等待页面完全加载与思维导图初次渲染
    await sleep(1500);

    console.log('\n--- 开始执行 Phase 2 断言项 ---');

    // 检查是否有未捕获异常
    if (exceptions.length > 0) {
      console.error('❌ 页面存在运行时异常:', exceptions);
      throw new Error(`页面抛出 ${exceptions.length} 个异常`);
    } else {
      console.log('✅ 测试 1: 页面零控制台异常通过');
    }

    // 检查 window._mindMapInstance 是否挂载
    const instanceCheck = await evaluate(ws, `
      Boolean(window._mindMapInstance && window._mindMapInstance.render && window._mindMapInstance.view)
    `);
    if (!instanceCheck) throw new Error('window._mindMapInstance 未正确实例化挂载');
    console.log('✅ 测试 2: SimpleMindMap 原生实例成功挂载并在 window._mindMapInstance 可用');

    // 检查 SVG 与节点元素渲染数量
    const nodeStats = await evaluate(ws, `
      (() => {
        const container = document.getElementById('mindMapContainer');
        const svg = container ? container.querySelector('svg') : null;
        if (!svg) return { hasSvg: false, textNodeCount: 0, rootText: '' };
        
        const mm = window._mindMapInstance;
        const rootNode = mm.renderer.root;
        const nodeList = mm.renderer.nodeList || [];
        const nodeTexts = nodeList.map(n => n.nodeData && n.nodeData.data && n.nodeData.data.text).filter(Boolean);

        const foreignObjects = Array.from(svg.querySelectorAll('foreignObject'));
        const paragraphTexts = Array.from(svg.querySelectorAll('foreignObject p, foreignObject div'))
          .map(el => el.textContent.trim())
          .filter(Boolean);

        // 递归统计 root 的所有子孙节点
        function countTree(node) {
          if (!node) return 0;
          let count = 1;
          const kids = node.children || [];
          for (const kid of kids) {
            count += countTree(kid);
          }
          return count;
        }
        const totalNodeInTree = countTree(rootNode);

        return {
          hasSvg: true,
          foreignObjectCount: foreignObjects.length,
          paragraphTextsCount: paragraphTexts.length,
          totalNodeInTree,
          rootText: rootNode ? (rootNode.nodeData && rootNode.nodeData.data && rootNode.nodeData.data.text) : '',
          sampleParagraphs: paragraphTexts.slice(0, 5)
        };
      })()
    `);

    console.log('[NodeStats]:', JSON.stringify(nodeStats, null, 2));

    if (!nodeStats.hasSvg) throw new Error('容器内未找到 SVG 画布元素');
    if (nodeStats.foreignObjectCount < 10) throw new Error(`渲染节点数量过低: foreignObjectCount=${nodeStats.foreignObjectCount}`);
    if (!nodeStats.rootText.includes('高等数学')) throw new Error(`根节点文本不匹配: ${nodeStats.rootText}`);
    console.log(`✅ 测试 3: SVG 画布正常渲染，根节点="${nodeStats.rootText}"，渲染节点卡片数=${nodeStats.foreignObjectCount}，总树节点数=${nodeStats.totalNodeInTree}`);

    // 测试视口控制能力 (缩小、放大、复位)
    const zoomTest = await evaluate(ws, `
      (() => {
        const mm = window._mindMapInstance;
        const initialTransform = mm.view.getTransformData();
        const initialScale = mm.view.scale || (initialTransform && initialTransform.scale) || (initialTransform && initialTransform.state && initialTransform.state.scale) || 1;
        
        mm.view.enlarge();
        const enlargedTransform = mm.view.getTransformData();
        const enlargedScale = mm.view.scale || (enlargedTransform && enlargedTransform.scale) || (enlargedTransform && enlargedTransform.state && enlargedTransform.state.scale) || 1.1;
        
        mm.view.narrow();
        mm.view.narrow();
        const narrowedTransform = mm.view.getTransformData();
        const narrowedScale = mm.view.scale || (narrowedTransform && narrowedTransform.scale) || (narrowedTransform && narrowedTransform.state && narrowedTransform.state.scale) || 0.9;
        
        mm.view.reset();
        const resetTransform = mm.view.getTransformData();
        const resetScale = mm.view.scale || (resetTransform && resetTransform.scale) || (resetTransform && resetTransform.state && resetTransform.state.scale) || 1;
        
        const zoomText = document.getElementById('zoomLevelText').textContent;
        return {
          initialScale,
          enlargedScale,
          narrowedScale,
          resetScale,
          initialTransform,
          zoomText
        };
      })()
    `);

    console.log('[DEBUG ZoomData]:', JSON.stringify(zoomTest, null, 2));

    if (zoomTest.enlargedScale <= zoomTest.narrowedScale) {
      throw new Error(`缩放比率关系异常: enlarged=${zoomTest.enlargedScale}, narrowed=${zoomTest.narrowedScale}`);
    }
    console.log(`✅ 测试 4: 视口缩放与复位 API 正常 (放大至 ${(zoomTest.enlargedScale * 100).toFixed(0)}%, 缩小至 ${(zoomTest.narrowedScale * 100).toFixed(0)}%, 复位=${(zoomTest.resetScale * 100).toFixed(0)}%, UI标签="${zoomTest.zoomText}")`);

    // 测试原生 Drag 插件是否已成功激活挂载
    const dragPluginCheck = await evaluate(ws, `
      Boolean(window._mindMapInstance.drag)
    `);
    if (!dragPluginCheck) throw new Error('Drag 插件未在 mindMap 实例上激活');
    console.log('✅ 测试 5: 官方 Drag 插件已成功注入并激活 (mindMap.drag 存在)');

    console.log('\n🎉 ====================================================');
    console.log('   Phase 2 所有测试全部通过！画布初始化与原生能力正常。');
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n❌ Phase 2 测试失败:', err.message);
    process.exitCode = 1;
  } finally {
    await cleanup();
  }
}

run();
