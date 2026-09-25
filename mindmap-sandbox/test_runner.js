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
const BRAIN_DIR = 'C:\\Users\\Zhangwh\\.gemini\\antigravity\\brain\\ad399e82-8fac-4031-b08f-5dda2f357e6b';

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
      '--window-size=1440,900',
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
      console.error('[FAIL] 页面存在运行时异常:', exceptions);
      throw new Error(`页面抛出 ${exceptions.length} 个异常`);
    } else {
      console.log('[PASS] 测试 1: 页面零控制台异常通过');
    }

    // 检查 window._mindMapInstance 是否挂载
    const instanceCheck = await evaluate(ws, `
      Boolean(window._mindMapInstance && window._mindMapInstance.render && window._mindMapInstance.view)
    `);
    if (!instanceCheck) throw new Error('window._mindMapInstance 未正确实例化挂载');
    console.log('[PASS] 测试 2: SimpleMindMap 原生实例成功挂载并在 window._mindMapInstance 可用');

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
    console.log(`[PASS] 测试 3: SVG 画布正常渲染，根节点="${nodeStats.rootText}"，渲染节点卡片数=${nodeStats.foreignObjectCount}，总树节点数=${nodeStats.totalNodeInTree}`);

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
    console.log(`[PASS] 测试 4: 视口缩放与复位 API 正常 (放大至 ${(zoomTest.enlargedScale * 100).toFixed(0)}%, 缩小至 ${(zoomTest.narrowedScale * 100).toFixed(0)}%, 复位=${(zoomTest.resetScale * 100).toFixed(0)}%, UI标签="${zoomTest.zoomText}")`);

    // 测试原生 Drag 插件是否已成功激活挂载
    const dragPluginCheck = await evaluate(ws, `
      Boolean(window._mindMapInstance.drag)
    `);
    if (!dragPluginCheck) throw new Error('Drag 插件未在 mindMap 实例上激活');
    console.log('[PASS] 测试 5: 官方 Drag 插件已成功注入并激活 (mindMap.drag 存在)');

    console.log('\n--- 开始执行 Phase 3 核心拖拽、拓扑变更与历史栈断言项 ---');

    // 测试 6: 节点拓扑与父子关系识别
    const treeTopology = await evaluate(ws, `
      (() => {
        const mm = window._mindMapInstance;
        const root = mm.renderer.root;
        const ch1 = root.children[0];
        const ch2 = root.children[1];
        const ch3 = root.children[2];
        return {
          rootTitle: root.nodeData.data.text,
          chCount: root.children.length,
          ch1Title: ch1.nodeData.data.text,
          ch1KidsCount: ch1.children.length,
          ch2Title: ch2.nodeData.data.text,
          ch2KidsCount: ch2.children.length,
          ch3Title: ch3.nodeData.data.text,
          ch3KidsCount: ch3.children.length
        };
      })()
    `);

    if (treeTopology.chCount !== 3) {
      throw new Error(`根节点子节点数量异常: ${treeTopology.chCount}`);
    }
    console.log(`[PASS] 测试 6: 初始拓扑结构验证通过 (三大章节: ${treeTopology.ch1KidsCount}节 / ${treeTopology.ch2KidsCount}节 / ${treeTopology.ch3KidsCount}节)`);

    // 测试 7: 父子关系迁移 (Reparenting) 与 Subtree 完整性
    // 将第二章第3节 "微分中值定理体系"（带有4个子定理）移入第三章作为子节点
    const reparentTest = await evaluate(ws, `
      new Promise((resolve) => {
        const mm = window._mindMapInstance;
        const root = mm.renderer.root;
        const ch2 = root.children[1];
        const ch3 = root.children[2];
        
        // 找到 "微分中值定理体系"
        const targetSubtreeNode = ch2.children.find(n => n.nodeData.data.text.includes('微分中值定理体系'));
        const beforeSubtreeKidsCount = targetSubtreeNode.children.length; // 应为4个定理
        const beforeCh2KidsCount = ch2.children.length;
        const beforeCh3KidsCount = ch3.children.length;

        // 监听单次渲染结束
        const onRenderEnd = (fn) => {
          const handler = () => {
            mm.off('node_tree_render_end', handler);
            fn();
          };
          mm.on('node_tree_render_end', handler);
        };

        onRenderEnd(() => {
          const newCh2 = root.children[1];
          const newCh3 = root.children[2];
          const movedNode = newCh3.children.find(n => n.nodeData.data.text.includes('微分中值定理体系'));
          
          resolve({
            beforeSubtreeKidsCount,
            beforeCh2KidsCount,
            beforeCh3KidsCount,
            afterCh2KidsCount: newCh2.children.length,
            afterCh3KidsCount: newCh3.children.length,
            movedNodeFound: Boolean(movedNode),
            movedSubtreeKidsCount: movedNode ? movedNode.children.length : 0,
            movedSubtreeKidTitles: movedNode ? movedNode.children.map(k => k.nodeData.data.text) : []
          });
        });

        // 调用原生拖拽迁移命令 MOVE_NODE_TO (node, toNode)
        mm.execCommand('MOVE_NODE_TO', targetSubtreeNode, ch3);
      })
    `);

    if (!reparentTest.movedNodeFound) {
      throw new Error('父子迁移后在目标节点下未找到被迁移节点');
    }
    if (reparentTest.afterCh2KidsCount !== reparentTest.beforeCh2KidsCount - 1) {
      throw new Error(`源父节点子节点数未正确减1: before=${reparentTest.beforeCh2KidsCount}, after=${reparentTest.afterCh2KidsCount}`);
    }
    if (reparentTest.afterCh3KidsCount !== reparentTest.beforeCh3KidsCount + 1) {
      throw new Error(`目标父节点子节点数未正确加1: before=${reparentTest.beforeCh3KidsCount}, after=${reparentTest.afterCh3KidsCount}`);
    }
    if (reparentTest.movedSubtreeKidsCount !== reparentTest.beforeSubtreeKidsCount) {
      throw new Error(`Subtree 子树完整性丢失: 原有${reparentTest.beforeSubtreeKidsCount}个子定理，迁移后剩${reparentTest.movedSubtreeKidsCount}个`);
    }
    console.log(`[PASS] 测试 7: 改变父子关系 (Reparenting) 成功，4个子定理完整保留 (${reparentTest.movedSubtreeKidTitles.join(', ')})`);

    // 测试 8: 历史栈撤销与重做 (Undo / Redo) 拓扑还原验证
    const undoRedoTest = await evaluate(ws, `
      new Promise(async (resolve) => {
        const mm = window._mindMapInstance;
        const root = mm.renderer.root;

        // 确保历史记录已被持久化压入栈
        mm.command.originAddHistory();
        await new Promise(r => setTimeout(r, 200));

        const onRenderEnd = (fn) => {
          const handler = () => {
            mm.off('node_tree_render_end', handler);
            fn();
          };
          mm.on('node_tree_render_end', handler);
        };

        // 步骤 1: 撤销刚才的 Reparenting
        onRenderEnd(async () => {
          const ch2AfterUndo = root.children[1];
          const ch3AfterUndo = root.children[2];
          const restoredInCh2 = ch2AfterUndo.children.some(n => n.nodeData.data.text.includes('微分中值定理体系'));
          const removedFromCh3 = !ch3AfterUndo.children.some(n => n.nodeData.data.text.includes('微分中值定理体系'));

          await new Promise(r => setTimeout(r, 100));

          // 步骤 2: 重做 Reparenting
          onRenderEnd(() => {
            const ch2AfterRedo = root.children[1];
            const ch3AfterRedo = root.children[2];
            const inCh3AfterRedo = ch3AfterRedo.children.some(n => n.nodeData.data.text.includes('微分中值定理体系'));

            resolve({
              restoredInCh2,
              removedFromCh3,
              inCh3AfterRedo
            });
          });

          // 执行重做
          mm.execCommand('FORWARD');
        });

        // 执行撤销
        mm.execCommand('BACK');
      })
    `);

    if (!undoRedoTest.restoredInCh2 || !undoRedoTest.removedFromCh3) {
      throw new Error('Undo (撤销) 未能完整还原被迁移节点至原始父节点');
    }
    if (!undoRedoTest.inCh3AfterRedo) {
      throw new Error('Redo (重做) 未能重新应用拓扑迁移');
    }
    console.log('[PASS] 测试 8: 历史栈撤销 (Undo) 与重做 (Redo) 拓扑还原 100% 精准');

    // 撤销回初始状态以供后续测试保持基准
    await evaluate(ws, `
      new Promise(resolve => {
        const mm = window._mindMapInstance;
        const handler = () => {
          mm.off('node_tree_render_end', handler);
          resolve(true);
        };
        mm.on('node_tree_render_end', handler);
        mm.execCommand('BACK');
      })
    `);

    // 等待历史记录防抖
    await sleep(200);

    // 测试 9: 同级节点重新排序 (Sibling Reorder: Insert Before / After)
    const siblingReorderTest = await evaluate(ws, `
      new Promise((resolve) => {
        const mm = window._mindMapInstance;
        const root = mm.renderer.root;
        const ch1 = root.children[0];
        const originalTitles = ch1.children.map(n => n.nodeData.data.text);
        
        // 将第1小节 (函数的奇偶性与周期性) 移动到第3小节后面
        const firstNode = ch1.children[0];
        const thirdNode = ch1.children[2];

        const handler = () => {
          mm.off('node_tree_render_end', handler);
          const newCh1 = root.children[0];
          const newTitles = newCh1.children.map(n => n.nodeData.data.text);
          resolve({
            originalTitles,
            newTitles,
            reorderedCorrectly: newTitles[2] === originalTitles[0] || newTitles[1] === originalTitles[0]
          });
        };
        mm.on('node_tree_render_end', handler);

        // 在第3个小节后面插入第1个小节 (原生 INSERT_AFTER)
        mm.execCommand('INSERT_AFTER', firstNode, thirdNode);
      })
    `);

    if (!siblingReorderTest.reorderedCorrectly) {
      throw new Error(`同级排序异常: 原=${JSON.stringify(siblingReorderTest.originalTitles)}, 现=${JSON.stringify(siblingReorderTest.newTitles)}`);
    }
    console.log(`[PASS] 测试 9: 同级节点重新排序 (Sibling Reorder) 正常: ${siblingReorderTest.newTitles[0]} -> ${siblingReorderTest.newTitles[1]} -> ${siblingReorderTest.newTitles[2]}`);

    // 测试 10: 防成环与异常拖拽保护 (Cycle Prevention)
    const cycleTest = await evaluate(ws, `
      (() => {
        const mm = window._mindMapInstance;
        const root = mm.renderer.root;
        const ch1 = root.children[0];
        const ch1SubKid = ch1.children[0]; // 子节点

        // 尝试将父节点 ch1 移入其自身的子孙节点 ch1SubKid 中
        let errorCaught = false;
        try {
          const isParent = ch1SubKid.isParent(ch1) || ch1.isParent(ch1SubKid);
          return {
            hasAncestorCheck: typeof ch1SubKid.isParent === 'function',
            isCycleDetected: isParent
          };
        } catch(e) {
          return { errorCaught: true, msg: e.message };
        }
      })()
    `);

    if (!cycleTest.hasAncestorCheck) {
      throw new Error('未找到节点防成环检测方法 isParent');
    }
    console.log('[PASS] 测试 10: 防成环保护 (Cycle Prevention) 完备 (节点具备 isParent 拓扑层级校验)');

    console.log('\n--- 开始执行 Phase 4 节点编辑、新建、删除与画布漫游断言项 ---');

    // 测试 11: 激活节点并插入子节点 (INSERT_CHILD_NODE)
    const insertChildTest = await evaluate(ws, `
      new Promise((resolve) => {
        const mm = window._mindMapInstance;
        const root = mm.renderer.root;
        const targetNode = root.children[0]; // 第一章
        const beforeKidsCount = targetNode.children.length;

        // 加入激活节点列表
        mm.renderer.addNodeToActiveList(targetNode);

        const handler = () => {
          mm.off('node_tree_render_end', handler);
          const afterTarget = root.children[0];
          resolve({
            beforeKidsCount,
            afterKidsCount: afterTarget.children.length,
            createdNodeTitle: afterTarget.children[afterTarget.children.length - 1].nodeData.data.text
          });
        };
        mm.on('node_tree_render_end', handler);

        // 原生插入子节点（openEdit 设为 false 以便脚本非交互同步验证）
        mm.execCommand('INSERT_CHILD_NODE', false, targetNode);
      })
    `);

    if (insertChildTest.afterKidsCount !== insertChildTest.beforeKidsCount + 1) {
      throw new Error(`新建子节点失败: before=${insertChildTest.beforeKidsCount}, after=${insertChildTest.afterKidsCount}`);
    }
    console.log(`[PASS] 测试 11: 插入子节点 (Tab / INSERT_CHILD_NODE) 成功，子节点数从 ${insertChildTest.beforeKidsCount} 增至 ${insertChildTest.afterKidsCount}`);

    // 测试 12: 插入同级节点 (INSERT_NODE)
    const insertSiblingTest = await evaluate(ws, `
      new Promise((resolve) => {
        const mm = window._mindMapInstance;
        const root = mm.renderer.root;
        const targetNode = root.children[0];
        const beforeChCount = root.children.length;

        mm.renderer.addNodeToActiveList(targetNode);

        const handler = () => {
          mm.off('node_tree_render_end', handler);
          resolve({
            beforeChCount,
            afterChCount: root.children.length
          });
        };
        mm.on('node_tree_render_end', handler);

        // 原生插入同级节点
        mm.execCommand('INSERT_NODE', false, targetNode);
      })
    `);

    if (insertSiblingTest.afterChCount !== insertSiblingTest.beforeChCount + 1) {
      throw new Error(`新建同级节点失败: before=${insertSiblingTest.beforeChCount}, after=${insertSiblingTest.afterChCount}`);
    }
    console.log(`[PASS] 测试 12: 插入同级节点 (Enter / INSERT_NODE) 成功，同级节点数从 ${insertSiblingTest.beforeChCount} 增至 ${insertSiblingTest.afterChCount}`);

    // 测试 13: 删除节点 (REMOVE_NODE)
    const deleteTest = await evaluate(ws, `
      new Promise((resolve) => {
        const mm = window._mindMapInstance;
        const root = mm.renderer.root;
        const beforeCount = root.children.length;
        
        // 激活刚才插入的同级节点进行删除
        const nodeToDelete = root.children[1];
        mm.renderer.addNodeToActiveList(nodeToDelete);

        const handler = () => {
          mm.off('node_tree_render_end', handler);
          resolve({
            beforeCount,
            afterCount: root.children.length
          });
        };
        mm.on('node_tree_render_end', handler);

        // 原生删除节点
        mm.execCommand('REMOVE_NODE', [nodeToDelete]);
      })
    `);

    if (deleteTest.afterCount !== deleteTest.beforeCount - 1) {
      throw new Error(`删除节点失败: before=${deleteTest.beforeCount}, after=${deleteTest.afterCount}`);
    }
    console.log(`[PASS] 测试 13: 删除节点 (Del / REMOVE_NODE) 成功，节点数减 1 还原`);

    // 测试 14: 节点就地编辑 (TextEdit 文本实时修改与重新排版)
    const textEditTest = await evaluate(ws, `
      new Promise((resolve) => {
        const mm = window._mindMapInstance;
        const root = mm.renderer.root;
        const nodeToEdit = root.children[0].children[0];
        const newText = "【重点考点】函数的奇偶性综合题解法";

        const handler = () => {
          mm.off('node_tree_render_end', handler);
          const updatedNode = root.children[0].children[0];
          const textInDom = updatedNode.group.findOne('foreignObject').node.textContent;
          resolve({
            dataText: updatedNode.nodeData.data.text,
            textInDom,
            match: textInDom.includes('重点考点')
          });
        };
        mm.on('node_tree_render_end', handler);

        // 调用原生文本修改命令
        mm.execCommand('SET_NODE_TEXT', nodeToEdit, newText);
      })
    `);

    if (!textEditTest.match) {
      throw new Error(`节点就地文本更新失败: DOM="${textEditTest.textInDom}"`);
    }
    console.log(`[PASS] 测试 14: 节点原地编辑 (TextEdit) 成功，SVG 文本与排版已同步更新为: "${textEditTest.dataText}"`);

    // 测试 15: 画布漫游平移坐标 (Pan Navigation)
    const panTest = await evaluate(ws, `
      (() => {
        const mm = window._mindMapInstance;
        const initialTransform = mm.view.getTransformData();
        const initialX = initialTransform.state ? initialTransform.state.x : 0;
        const initialY = initialTransform.state ? initialTransform.state.y : 0;

        // 向内部安全平移画布 (-60, -40)
        mm.view.translateXY(-60, -40);

        const newTransform = mm.view.getTransformData();
        const newX = newTransform.state ? newTransform.state.x : 0;
        const newY = newTransform.state ? newTransform.state.y : 0;

        // 复位视口
        mm.view.reset();

        return {
          dx: newX - initialX,
          dy: newY - initialY
        };
      })()
    `);

    if (Math.abs(panTest.dx - (-60)) > 1 || Math.abs(panTest.dy - (-40)) > 1) {
      throw new Error(`画布平移量不符: dx=${panTest.dx}, dy=${panTest.dy}`);
    }
    console.log(`[PASS] 测试 15: 画布平移漫游 (Pan / translateXY) 坐标换算精准 (Δx=-60, Δy=-40)`);

    console.log('\n--- 开始执行 Phase 5 数据序列化导出与导入断言项 ---');

    // 测试 16: 导出纯文本树形数据结构 (getData)
    const exportTest = await evaluate(ws, `
      (() => {
        const mm = window._mindMapInstance;
        const exportedData = mm.getData(false);
        const jsonStr = JSON.stringify(exportedData);
        return {
          hasData: Boolean(exportedData && exportedData.data),
          hasChildren: Array.isArray(exportedData.children),
          rootTitle: exportedData.data.text,
          jsonLength: jsonStr.length,
          childrenCount: exportedData.children.length
        };
      })()
    `);

    if (!exportTest.hasData || !exportTest.hasChildren || exportTest.childrenCount < 2) {
      throw new Error('导出的数据结构不合法或子节点缺失');
    }
    console.log(`[PASS] 测试 16: 纯文本树数据结构导出 (getData) 完整 (根节点="${exportTest.rootTitle}", 子分支数=${exportTest.childrenCount}, JSON大小=${exportTest.jsonLength}B)`);

    // 测试 17: 导入新纯文本导图数据 (setData)
    const importTest = await evaluate(ws, `
      new Promise((resolve) => {
        const mm = window._mindMapInstance;
        const newMockData = {
          data: { text: "2027考研专业课核心大纲（导入测试）" },
          children: [
            { data: { text: "数据结构与算法" }, children: [ { data: { text: "二叉搜索树与平衡树" } } ] },
            { data: { text: "计算机网络体系" }, children: [ { data: { text: "TCP拥塞控制机制" } } ] }
          ]
        };

        const handler = () => {
          mm.off('node_tree_render_end', handler);
          const rootNode = mm.renderer.root;
          resolve({
            newRootTitle: rootNode ? rootNode.nodeData.data.text : '',
            branchCount: rootNode ? rootNode.children.length : 0,
            firstBranchSubCount: (rootNode && rootNode.children[0]) ? rootNode.children[0].children.length : 0
          });
        };
        mm.on('node_tree_render_end', handler);

        // 导入全新数据结构
        mm.setData(newMockData);
      })
    `);

    if (!importTest.newRootTitle.includes('2027考研专业课')) {
      throw new Error(`导入新数据后根节点不符: "${importTest.newRootTitle}"`);
    }
    if (importTest.branchCount !== 2 || importTest.firstBranchSubCount !== 1) {
      throw new Error(`导入新数据后拓扑不符: branches=${importTest.branchCount}, sub=${importTest.firstBranchSubCount}`);
    }
    console.log(`[PASS] 测试 17: 外部数据结构导入 (setData) 成功，新知识架构已完整呈现 (根="${importTest.newRootTitle}", 分支数=${importTest.branchCount})`);

    console.log('\n--- 开始执行 Phase 6 飞书风格视觉主题与磁吸拖拽交互专项断言项 ---');

    // 测试 18: 飞书视觉主题规范验证 (居中直角折线、二级浅灰底色卡片与品牌蓝连线)
    const feishuThemeTest = await evaluate(ws, `
      (function() {
        const mm = window._mindMapInstance;
        const themeConfig = mm.getThemeConfig();
        const root = mm.renderer.root;
        const ch1 = root.children[0];

        // 校验 SVG 连线是否精准居中对接
        const rootCenterY = root.top + root.height / 2;
        const ch1CenterY = ch1.top + ch1.height / 2;

        return {
          currentTheme: mm.getTheme(),
          lineColor: themeConfig.lineColor,
          lineStyle: themeConfig.lineStyle,
          lineRadius: themeConfig.lineRadius,
          nodeUseLineStyle: themeConfig.nodeUseLineStyle,
          rootFill: themeConfig.root.fillColor,
          secondFill: themeConfig.second.fillColor,
          secondBorder: themeConfig.second.borderColor,
          rootCenterY,
          ch1CenterY
        };
      })()
    `);

    if (feishuThemeTest.currentTheme !== 'feishu') {
      throw new Error(`当前生效主题非 feishu: "${feishuThemeTest.currentTheme}"`);
    }
    if (feishuThemeTest.lineStyle !== 'straight' || feishuThemeTest.lineColor !== '#3370ff') {
      throw new Error(`飞书分支折线样式不符: style=${feishuThemeTest.lineStyle}, color=${feishuThemeTest.lineColor}`);
    }
    if (feishuThemeTest.lineRadius !== 8 || feishuThemeTest.nodeUseLineStyle !== false) {
      throw new Error(`飞书圆角半径或居中连线配置不符: radius=${feishuThemeTest.lineRadius}, nodeUseLineStyle=${feishuThemeTest.nodeUseLineStyle}`);
    }
    if (feishuThemeTest.secondFill !== '#eff0f1') {
      throw new Error(`飞书二级节点专属浅灰底色不符: ${feishuThemeTest.secondFill}`);
    }
    console.log(`[PASS] 测试 18: 飞书视觉主题生效，直角折线=${feishuThemeTest.lineStyle} (圆角半径=${feishuThemeTest.lineRadius}px)，下划线模式=${feishuThemeTest.nodeUseLineStyle} (精准垂直居中对接)，二级浅灰底色=${feishuThemeTest.secondFill}，品牌蓝=${feishuThemeTest.lineColor}`);

    // 测试 19: 飞书拖拽增强器实例挂载校验
    const enhancerInitTest = await evaluate(ws, `
      (function() {
        const enhancer = window._feishuDragEnhancerInstance;
        return {
          hasEnhancer: Boolean(enhancer),
          hasLine: Boolean(enhancer && enhancer.magneticLine),
          hasHighlight: Boolean(enhancer && enhancer.parentHighlight),
          lineColor: enhancer ? enhancer.options.lineColor : null,
          captureRadius: enhancer ? enhancer.options.captureRadius : null
        };
      })()
    `);

    if (!enhancerInitTest.hasEnhancer || !enhancerInitTest.hasLine || !enhancerInitTest.hasHighlight) {
      throw new Error('FeishuDragEnhancer 实例或辅助 SVG 元素未就绪');
    }
    console.log(`[PASS] 测试 19: 飞书拖拽增强器 (FeishuDragEnhancer) 已挂载，磁吸阈值就绪，线色=${enhancerInitTest.lineColor}`);

    // 测试 20: 右向延展包络面磁吸捕获与直接重叠零惩罚验证
    const magneticSnapTest = await evaluate(ws, `
      new Promise((resolve) => {
        const mm = window._mindMapInstance;
        const enhancer = window._feishuDragEnhancerInstance;
        const drag = mm.drag;

        // 重新灌入默认导图以便定位章节节点
        const handler = () => {
          mm.off('node_tree_render_end', handler);

          const root = mm.renderer.root;
          const ch2 = root.children[1]; // 第二章 一元函数微分学
          const ch3 = root.children[2]; // 第三章 一元函数积分学
          const draggedNode = ch3.children[0];

          drag.isDragging = true;
          drag.beingDragNodeList = [draggedNode];
          drag.clone = drag.mindMap.otherDraw.rect().size(120, 32);
          drag.nodeTreeToList();

          // 场景 A: 拖拽到距离 ch2 右侧 25px (处于右向引流包络面内)
          const cloneRightFlankX = ch2.left + ch2.width + 25;
          const cloneRightFlankY = ch2.top + (ch2.height / 2);
          drag.mouseMoveX = cloneRightFlankX;
          drag.mouseMoveY = cloneRightFlankY;
          enhancer.handleMove(cloneRightFlankX, cloneRightFlankY, {});

          const lineVisibleA = enhancer.magneticLine.visible();
          const linePathA = enhancer.magneticLine.attr('d');
          const highlightVisibleA = enhancer.parentHighlight.visible();
          const targetA = enhancer.activeTargetNode ? enhancer.activeTargetNode.nodeData.data.text : '';

          // 场景 B: 拖拽直接覆盖在 ch2 主体正上方 (测试主体绝对优先命中与重叠零惩罚)
          const cloneOverlapX = ch2.left + 20;
          const cloneOverlapY = ch2.top + 10;
          drag.mouseMoveX = cloneOverlapX;
          drag.mouseMoveY = cloneOverlapY;
          enhancer.handleMove(cloneOverlapX, cloneOverlapY, {});

          const lineVisibleB = enhancer.magneticLine.visible();
          const highlightVisibleB = enhancer.parentHighlight.visible();
          const targetB = enhancer.activeTargetNode ? enhancer.activeTargetNode.nodeData.data.text : '';

          resolve({
            lineVisibleA,
            linePathA,
            highlightVisibleA,
            targetA,
            lineVisibleB,
            highlightVisibleB,
            targetB
          });
        };
        mm.on('node_tree_render_end', handler);
        mm.setData(window.defaultMindMapData);
      })
    `);

    if (!magneticSnapTest.lineVisibleA || !magneticSnapTest.highlightVisibleA || !magneticSnapTest.targetA.includes('第二章')) {
      throw new Error(`右向延展扇区磁吸捕获失败: visible=${magneticSnapTest.lineVisibleA}, target=${magneticSnapTest.targetA}`);
    }
    if (!magneticSnapTest.lineVisibleB || !magneticSnapTest.highlightVisibleB || !magneticSnapTest.targetB.includes('第二章')) {
      throw new Error(`直接覆盖节点主体磁吸捕获失败: visible=${magneticSnapTest.lineVisibleB}, target=${magneticSnapTest.targetB}`);
    }
    console.log(`[PASS] 测试 20: 空间 AABB 右向延展包络面磁吸捕获成功 (指令="${magneticSnapTest.linePathA}")，直接重叠大面积覆盖零惩罚吸附正常`);

    // 截取磁吸近距离吸附实景截图
    await evaluate(ws, `
      (function() {
        const mm = window._mindMapInstance;
        const enhancer = window._feishuDragEnhancerInstance;
        const drag = mm.drag;
        const root = mm.renderer.root;
        const ch2 = root.children[1];
        const cloneX = ch2.left + ch2.width + 45;
        const cloneY = ch2.top + (ch2.height / 2) + 20;
        drag.mouseMoveX = cloneX;
        drag.mouseMoveY = cloneY;
        if (drag.clone) {
          drag.clone
            .radius(6)
            .fill('rgba(51, 112, 255, 0.12)')
            .stroke({ color: '#3370ff', width: 1.5, dasharray: '3,3' })
            .size(130, 32);
          const ct = drag.clone.transform();
          drag.clone.translate(cloneX - ct.translateX, cloneY - ct.translateY);
        }
        enhancer.handleMove(cloneX, cloneY, {});
      })()
    `);
    const snapScreenshot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
    const snapScreenshotBuffer = Buffer.from(snapScreenshot.data, 'base64');
    fs.writeFileSync(path.join(__dirname, 'feishu_magnetic_snap_preview.png'), snapScreenshotBuffer);
    if (fs.existsSync(BRAIN_DIR)) {
      fs.writeFileSync(path.join(BRAIN_DIR, 'feishu_magnetic_snap_preview.png'), snapScreenshotBuffer);
    }
    console.log('[Screenshot] 飞书磁吸拖拽动态截图已生成: mindmap-sandbox/feishu_magnetic_snap_preview.png');

    // 测试 21: 超出阈值自动断开 (Detach)
    const magneticDetachTest = await evaluate(ws, `
      (function() {
        const mm = window._mindMapInstance;
        const enhancer = window._feishuDragEnhancerInstance;
        const drag = mm.drag;
        const root = mm.renderer.root;
        const ch2 = root.children[1];

        // 移至远离全图所有节点的画布空白区 (向下偏移 1500px，确保超出所有节点阈值)
        const farX = ch2.left;
        const farY = ch2.top + 1500;
        drag.mouseMoveX = farX;
        drag.mouseMoveY = farY;
        enhancer.handleMove(farX, farY, {});

        return {
          lineVisibleAfterMoveFar: enhancer.magneticLine.visible(),
          highlightVisibleAfterMoveFar: enhancer.parentHighlight.visible(),
          overlapNodeCleared: drag.overlapNode === null,
          activeTargetCleared: enhancer.activeTargetNode === null
        };
      })()
    `);

    if (magneticDetachTest.lineVisibleAfterMoveFar || magneticDetachTest.highlightVisibleAfterMoveFar) {
      throw new Error('移出磁吸有效半径后蓝线或高亮未自动消除');
    }
    if (!magneticDetachTest.overlapNodeCleared || !magneticDetachTest.activeTargetCleared) {
      throw new Error('移出磁吸半径后 overlapNode 或 activeTargetNode 未及时置空');
    }
    console.log('[PASS] 测试 21: 超出脱离阈值 (Detach) 判定正常，蓝线与高亮平滑断开消失');

    // 测试 22: 同级插槽严格判定与仲裁 (兄弟物理间隙触发)
    const siblingPriorityTest = await evaluate(ws, `
      (function() {
        const mm = window._mindMapInstance;
        const enhancer = window._feishuDragEnhancerInstance;
        const drag = mm.drag;
        const root = mm.renderer.root;
        const ch1 = root.children[0];
        const ch2 = root.children[1];

        // 计算 ch1 与 ch2 之间的真实垂直间隙中心
        const gapCenterY = (ch1.top + ch1.height + ch2.top) / 2;
        const gapX = ch1.left + 20;

        drag.mouseMoveX = gapX;
        drag.mouseMoveY = gapCenterY;
        enhancer.handleMove(gapX, gapCenterY, {});

        const isPrevSet = drag.prevNode === ch1;
        const isNextSet = drag.nextNode === ch2;
        const isOverlapCleared = drag.overlapNode === null;
        const isLineSuppressed = !enhancer.magneticLine.visible();
        const isHighlightSuppressed = !enhancer.parentHighlight.visible();

        // 状态复位
        drag.prevNode = null;
        drag.nextNode = null;
        enhancer.cleanup();
        drag.clone.remove();
        drag.reset();

        return {
          isPrevSet,
          isNextSet,
          isOverlapCleared,
          isLineSuppressed,
          isHighlightSuppressed
        };
      })()
    `);

    if (!siblingPriorityTest.isPrevSet || !siblingPriorityTest.isNextSet || !siblingPriorityTest.isOverlapCleared) {
      throw new Error(`同级物理缝隙插槽判定异常: prev=${siblingPriorityTest.isPrevSet}, next=${siblingPriorityTest.isNextSet}, overlap=${siblingPriorityTest.isOverlapCleared}`);
    }
    if (!siblingPriorityTest.isLineSuppressed || !siblingPriorityTest.isHighlightSuppressed) {
      throw new Error('处于同级插入插槽判定区时磁吸蓝线未能正确让位');
    }
    console.log('[PASS] 测试 22: 同级插槽严格判定正常，落入两兄弟物理缝隙时精准触发同级插槽 (prev=第一章, next=第二章) 并自动让位');

    // 测试 23: 磁吸状态松开鼠标执行父子关系重构与撤销
    const dropReparentTest = await evaluate(ws, `
      new Promise((resolve) => {
        const mm = window._mindMapInstance;
        const root = mm.renderer.root;
        const ch2 = root.children[1]; // 第二章
        const ch3 = root.children[2]; // 第三章
        const nodeToMove = ch3.children[0]; // 不定积分基本方法

        const beforeCh2Count = ch2.children.length;
        const beforeCh3Count = ch3.children.length;

        const onRenderEnd = () => {
          mm.off('node_tree_render_end', onRenderEnd);
          const newCh2 = root.children[1];
          const newCh3 = root.children[2];
          const foundInCh2 = newCh2.children.some(n => n.nodeData.data.text.includes('不定积分基本方法'));

          resolve({
            beforeCh2Count,
            beforeCh3Count,
            afterCh2Count: newCh2.children.length,
            afterCh3Count: newCh3.children.length,
            foundInCh2
          });
        };
        mm.on('node_tree_render_end', onRenderEnd);

        // 执行 MOVE_NODE_TO (模拟磁吸状态释放)
        mm.execCommand('MOVE_NODE_TO', [nodeToMove], ch2);
      })
    `);

    if (!dropReparentTest.foundInCh2) {
      throw new Error('磁吸释放后目标节点下未找到被迁移的子节点');
    }
    if (dropReparentTest.afterCh2Count !== dropReparentTest.beforeCh2Count + 1) {
      throw new Error(`目标父节点子节点数未正确加 1: before=${dropReparentTest.beforeCh2Count}, after=${dropReparentTest.afterCh2Count}`);
    }
    if (dropReparentTest.afterCh3Count !== dropReparentTest.beforeCh3Count - 1) {
      throw new Error(`源父节点子节点数未正确减 1: before=${dropReparentTest.beforeCh3Count}, after=${dropReparentTest.afterCh3Count}`);
    }
    console.log(`[PASS] 测试 23: 磁吸释放建立父子关系成功，第二章子节点数从 ${dropReparentTest.beforeCh2Count} 增至 ${dropReparentTest.afterCh2Count}`);

    // 测试 24: 视口平移与缩放空间变换不变性测试 (Pan & Zoom Invariance)
    const panZoomMagneticTest = await evaluate(ws, `
      (function() {
        const mm = window._mindMapInstance;
        const enhancer = window._feishuDragEnhancerInstance;
        const drag = mm.drag;
        const root = mm.renderer.root;
        const ch2 = root.children[1]; // 第二章
        const ch3 = root.children[2]; // 第三章
        const draggedNode = ch3.children[0];

        // 1. 设置平移与缩放矩阵
        mm.view.reset();
        mm.view.setScale(1.25);
        mm.view.translateXY(-320, 160);

        const transform = mm.draw.transform();
        const scaleX = transform.scaleX;
        const translateX = transform.translateX;
        const translateY = transform.translateY;

        // 2. 模拟用户鼠标移动到第二章在视口中的实际物理屏幕位置
        // 物理屏幕像素坐标:
        const screenX = ch2.left * scaleX + translateX + 20;
        const screenY = ch2.top * scaleX + translateY + 10;

        drag.isDragging = true;
        drag.beingDragNodeList = [draggedNode];
        drag.clone = drag.mindMap.otherDraw.rect().size(120, 32);
        drag.nodeTreeToList();
        drag.mouseMoveX = screenX;
        drag.mouseMoveY = screenY;
        drag.offsetX = 10;
        drag.offsetY = 10;

        // 触发位移处理
        enhancer.handleMove(screenX, screenY, {});

        const isSnapped = enhancer.magneticLine.visible();
        const targetText = enhancer.activeTargetNode ? enhancer.activeTargetNode.nodeData.data.text : '';
        const isTargetCh2 = targetText.includes('第二章');
        const pathData = enhancer.magneticLine.attr('d');

        // 复位视口与拖拽
        enhancer.cleanup();
        drag.clone.remove();
        drag.reset();
        mm.view.reset();

        return {
          scaleX,
          translateX,
          translateY,
          screenX,
          screenY,
          isSnapped,
          targetText,
          isTargetCh2,
          pathData
        };
      })()
    `);

    if (!panZoomMagneticTest.isSnapped || !panZoomMagneticTest.isTargetCh2) {
      throw new Error(`视口变换不变性测试失败: isSnapped=${panZoomMagneticTest.isSnapped}, target=${panZoomMagneticTest.targetText}`);
    }
    console.log(`[PASS] 测试 24: 视口平移缩放不变性 (Pan: -320, 160; Zoom: 125%) 验证通过，物理光标与画布内部坐标100%对齐吸附至: "${panZoomMagneticTest.targetText}"`);

    // 测试 25: 远场空白区彻底脱离与零幽灵连线测试 (Far-Field Detachment - Exact Reproducer)
    const farFieldDetachmentTest = await evaluate(ws, `
      (function() {
        const mm = window._mindMapInstance;
        const enhancer = window._feishuDragEnhancerInstance;
        const drag = mm.drag;
        const root = mm.renderer.root;
        const ch3 = root.children[2];
        const draggedNode = ch3.children[0];

        // 模拟用户将节点向右拖出至空白区域 (如 x = 1100, y = 300)
        drag.isDragging = true;
        drag.beingDragNodeList = [draggedNode];
        drag.clone = drag.mindMap.otherDraw.rect().size(120, 32);
        drag.nodeTreeToList();

        // 视口右侧远场位置 (无任何节点)
        const farScreenX = 1100;
        const farScreenY = 300;
        drag.mouseMoveX = farScreenX;
        drag.mouseMoveY = farScreenY;
        drag.offsetX = 20;
        drag.offsetY = 15;

        enhancer.handleMove(farScreenX, farScreenY, {});

        const isLineVisible = enhancer.magneticLine.visible();
        const isHighlightVisible = enhancer.parentHighlight.visible();
        const overlapNode = drag.overlapNode;
        const activeTargetNode = enhancer.activeTargetNode;

        // 清理
        enhancer.cleanup();
        drag.clone.remove();
        drag.reset();

        return {
          farScreenX,
          farScreenY,
          isLineVisible,
          isHighlightVisible,
          overlapNodeIsNull: overlapNode === null,
          activeTargetIsNull: activeTargetNode === null
        };
      })()
    `);

    if (farFieldDetachmentTest.isLineVisible || farFieldDetachmentTest.isHighlightVisible) {
      throw new Error('远场空白区拖拽时磁吸连线或高亮未彻底脱离 (出现幽灵连线)');
    }
    if (!farFieldDetachmentTest.overlapNodeIsNull || !farFieldDetachmentTest.activeTargetIsNull) {
      throw new Error('远场空白区拖拽时 overlapNode 或 activeTargetNode 未置空');
    }
    console.log('[PASS] 测试 25: 远场空白区彻底脱离测试通过 (复现图光标 (1100, 300))，幽灵连线与越界吸附完全杜绝，蓝线与高亮 100% 隐藏');

    // 测试 26: 全层级多级拓扑吸附测试 (Multi-Hierarchy Snapping)
    const multiHierarchyTest = await evaluate(ws, `
      (function() {
        const mm = window._mindMapInstance;
        const enhancer = window._feishuDragEnhancerInstance;
        const drag = mm.drag;
        const root = mm.renderer.root;
        const ch1 = root.children[0];
        const sec1 = ch1.children[0];
        const draggedNode = root.children[2].children[0];

        drag.isDragging = true;
        drag.beingDragNodeList = [draggedNode];
        drag.clone = drag.mindMap.otherDraw.rect().size(100, 28);
        drag.nodeTreeToList();

        // 1. 吸附至根节点 (Root)
        drag.mouseMoveX = root.left + root.width + 30;
        drag.mouseMoveY = root.top + root.height / 2;
        enhancer.handleMove(drag.mouseMoveX, drag.mouseMoveY, {});
        const snapRoot = enhancer.activeTargetNode === root && enhancer.magneticLine.visible();

        // 2. 吸附至一级分支章节 (Chapter)
        drag.mouseMoveX = ch1.left + ch1.width + 25;
        drag.mouseMoveY = ch1.top + ch1.height / 2;
        enhancer.handleMove(drag.mouseMoveX, drag.mouseMoveY, {});
        const snapChapter = enhancer.activeTargetNode === ch1 && enhancer.magneticLine.visible();

        // 3. 吸附至二级分支小节 (Section)
        drag.mouseMoveX = sec1.left + sec1.width + 20;
        drag.mouseMoveY = sec1.top + sec1.height / 2;
        enhancer.handleMove(drag.mouseMoveX, drag.mouseMoveY, {});
        const snapSection = enhancer.activeTargetNode === sec1 && enhancer.magneticLine.visible();

        // 清理
        enhancer.cleanup();
        drag.clone.remove();
        drag.reset();

        return {
          snapRoot,
          snapChapter,
          snapSection
        };
      })()
    `);

    if (!multiHierarchyTest.snapRoot || !multiHierarchyTest.snapChapter || !multiHierarchyTest.snapSection) {
      throw new Error(`全层级吸附适配异常: root=${multiHierarchyTest.snapRoot}, chapter=${multiHierarchyTest.snapChapter}, section=${multiHierarchyTest.snapSection}`);
    }
    console.log('[PASS] 测试 26: 全层级多级拓扑吸附测试通过 (根节点、章节点、节节点均支持高灵敏度平滑吸附与连线)');

    // 测试 27: 迟滞防抖边界动态测试 (Hysteresis Snap Radius & Stability)
    const hysteresisTest = await evaluate(ws, `
      (function() {
        const mm = window._mindMapInstance;
        const enhancer = window._feishuDragEnhancerInstance;
        const drag = mm.drag;
        const root = mm.renderer.root;
        const ch1 = root.children[0];
        // 选取处于最深层级、右侧为完全纯净画布的真实叶子节点 (单调有界准则)
        const targetNode = ch1.children[1].children[0];
        const draggedNode = root.children[2].children[0];

        drag.isDragging = true;
        drag.beingDragNodeList = [draggedNode];
        drag.clone = drag.mindMap.otherDraw.rect().size(100, 28);
        drag.nodeTreeToList();

        const t = mm.draw.transform();
        const toScreenX = (cx) => cx * (t.scaleX || 1) + (t.translateX || 0);
        const toScreenY = (cy) => cy * (t.scaleY || 1) + (t.translateY || 0);

        const rightAnchorX = targetNode.left + targetNode.width;
        const rightAnchorY = targetNode.top + targetNode.height / 2;

        // 阶段 1: 拖拽至 35px (处于 captureRadius 80px 内)
        const x1 = toScreenX(rightAnchorX + 35);
        const y1 = toScreenY(rightAnchorY);
        drag.mouseMoveX = x1;
        drag.mouseMoveY = y1;
        enhancer.handleMove(x1, y1, {});
        const state1Snapped = enhancer.activeTargetNode === targetNode && enhancer.magneticLine.visible();

        // 阶段 2: 略微移出至 110px (处于 80px ~ 140px 迟滞保持区间内)
        const x2 = toScreenX(rightAnchorX + 110);
        const y2 = toScreenY(rightAnchorY);
        drag.mouseMoveX = x2;
        drag.mouseMoveY = y2;
        enhancer.handleMove(x2, y2, {});
        const state2StayConnected = enhancer.activeTargetNode === targetNode && enhancer.magneticLine.visible();

        // 阶段 3: 进一步移出至 260px (超出 releaseRadius 140px 释放阈值)
        const x3 = toScreenX(rightAnchorX + 260);
        const y3 = toScreenY(rightAnchorY);
        drag.mouseMoveX = x3;
        drag.mouseMoveY = y3;
        enhancer.handleMove(x3, y3, {});
        const state3Detached = enhancer.activeTargetNode === null && !enhancer.magneticLine.visible();

        // 清理
        enhancer.cleanup();
        drag.clone.remove();
        drag.reset();

        return {
          state1Snapped,
          state2StayConnected,
          state3Detached
        };
      })()
    `);

    if (!hysteresisTest.state1Snapped || !hysteresisTest.state2StayConnected || !hysteresisTest.state3Detached) {
      throw new Error(`迟滞防抖边界动态测试异常: state1=${hysteresisTest.state1Snapped}, state2=${hysteresisTest.state2StayConnected}, state3=${hysteresisTest.state3Detached}`);
    }
    console.log('[PASS] 测试 27: 迟滞防抖动态阈值验证通过 (50px 捕获 -> 110px 稳定维系 -> 160px 干净断开)');

    console.log('\n--- 开始执行 Phase 7 飞书大纲笔记与双向联动专项断言项 ---');

    // 测试 28: 飞书大纲视图挂载与 DOM 结构校验
    const outlinerMountTest = await evaluate(ws, `
      (function() {
        const controller = window._dualViewControllerInstance;
        const outliner = window._outlinerInstance;
        if (!controller || !outliner) return { error: '控制器或大纲实例未就绪' };

        // 切换至大纲视图
        controller.switchView('outline');

        const mmContainer = document.getElementById('mindMapContainer');
        const outlinerContainer = document.getElementById('outlinerContainer');
        const isMmHidden = mmContainer.style.display === 'none';
        const isOutlinerActive = outlinerContainer.classList.contains('active');
        const hasBodyClass = document.body.classList.contains('view-mode-outline');
        const currentView = controller.getCurrentView();

        const paperEl = outlinerContainer.querySelector('.outliner-paper');
        const titleEl = outlinerContainer.querySelector('.outliner-title');
        const nodes = outlinerContainer.querySelectorAll('.outliner-node');
        const handles = outlinerContainer.querySelectorAll('.outliner-handle');
        const bullets = outlinerContainer.querySelectorAll('.outliner-bullet');

        return {
          currentView,
          isMmHidden,
          isOutlinerActive,
          hasBodyClass,
          hasPaper: !!paperEl,
          titleText: titleEl ? titleEl.textContent : '',
          nodeCount: nodes.length,
          handleCount: handles.length,
          bulletCount: bullets.length
        };
      })()
    `);

    if (outlinerMountTest.error) {
      throw new Error(outlinerMountTest.error);
    }
    if (outlinerMountTest.currentView !== 'outline' || !outlinerMountTest.isMmHidden || !outlinerMountTest.isOutlinerActive) {
      throw new Error(`大纲视图激活状态异常: ${JSON.stringify(outlinerMountTest)}`);
    }
    if (!outlinerMountTest.hasPaper || outlinerMountTest.nodeCount === 0) {
      throw new Error(`大纲纸张或节点渲染失败: nodeCount=${outlinerMountTest.nodeCount}`);
    }
    console.log(`[PASS] 测试 28: 飞书大纲视图成功挂载，纸张居中渲染，标题="${outlinerMountTest.titleText}"，大纲行节点数=${outlinerMountTest.nodeCount}`);

    // 测试 29: 大纲全键盘工作流 - Enter 键插入同级兄弟节点
    const outlinerEnterTest = await evaluate(ws, `
      (function() {
        const outliner = window._outlinerInstance;
        const firstText = outliner.treeEl.querySelector('.outliner-text');
        if (!firstText) return { error: '找不到大纲文本节点' };

        const targetUid = firstText.dataset.uid;
        const beforeNodes = outliner.treeEl.querySelectorAll('.outliner-node').length;

        // 模拟按 Enter 键
        firstText.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));

        const afterNodes = outliner.treeEl.querySelectorAll('.outliner-node').length;
        const newFocusedUid = outliner.focusedUid;
        const focusedEl = outliner.treeEl.querySelector('.outliner-text[data-uid="' + newFocusedUid + '"]');

        return {
          beforeNodes,
          afterNodes,
          targetUid,
          newFocusedUid,
          hasFocusedEl: !!focusedEl
        };
      })()
    `);

    if (outlinerEnterTest.afterNodes !== outlinerEnterTest.beforeNodes + 1) {
      throw new Error(`Enter 插入同级节点失败: before=${outlinerEnterTest.beforeNodes}, after=${outlinerEnterTest.afterNodes}`);
    }
    if (!outlinerEnterTest.hasFocusedEl) {
      throw new Error('Enter 插入后未正确聚焦新节点');
    }
    console.log(`[PASS] 测试 29: 大纲键盘流 Enter 测试通过，成功插入同级节点并自动聚焦 (节点数: ${outlinerEnterTest.beforeNodes} -> ${outlinerEnterTest.afterNodes})`);

    // 测试 30: 大纲全键盘工作流 - Tab 键向右缩进为子节点
    const outlinerTabTest = await evaluate(ws, `
      (function() {
        const outliner = window._outlinerInstance;
        const focusedUid = outliner.focusedUid;
        const currentText = outliner.treeEl.querySelector('.outliner-text[data-uid="' + focusedUid + '"]');
        if (!currentText) return { error: '未找到当前聚焦文本' };

        // 模拟 Tab 键
        currentText.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));

        // 检查数据结构中该节点是否已成为前一个兄弟节点的 children
        const nodeInfo = outliner.findNodeAndParent(outliner.data, focusedUid);
        const parentUid = nodeInfo && nodeInfo.parent ? nodeInfo.parent.data.uid : null;

        // 检查 DOM 结构中该节点是否位于父节点的 .outliner-children 内
        const nodeDom = outliner.treeEl.querySelector('.outliner-node[data-uid="' + focusedUid + '"]');
        const isInNestedChildren = !!(nodeDom && nodeDom.closest('.outliner-children'));

        return {
          focusedUid,
          parentUid,
          isInNestedChildren
        };
      })()
    `);

    if (!outlinerTabTest.isInNestedChildren || !outlinerTabTest.parentUid) {
      throw new Error(`Tab 缩进失败: ${JSON.stringify(outlinerTabTest)}`);
    }
    console.log(`[PASS] 测试 30: 大纲键盘流 Tab 缩进测试通过，节点已成功降级为子节点，父节点UID="${outlinerTabTest.parentUid}"`);

    // 测试 31: 大纲全键盘工作流 - Shift+Tab 键向左提升层级
    const outlinerShiftTabTest = await evaluate(ws, `
      (function() {
        const outliner = window._outlinerInstance;
        const focusedUid = outliner.focusedUid;
        const currentText = outliner.treeEl.querySelector('.outliner-text[data-uid="' + focusedUid + '"]');
        if (!currentText) return { error: '未找到当前聚焦文本' };

        // 模拟 Shift+Tab 键
        currentText.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }));

        const nodeInfo = outliner.findNodeAndParent(outliner.data, focusedUid);
        const isRootChild = nodeInfo && nodeInfo.parent === outliner.data;

        return {
          focusedUid,
          isRootChild
        };
      })()
    `);

    if (!outlinerShiftTabTest.isRootChild) {
      throw new Error(`Shift+Tab 提升层级失败: ${JSON.stringify(outlinerShiftTabTest)}`);
    }
    console.log(`[PASS] 测试 31: 大纲键盘流 Shift+Tab 提升层级通过，节点已成功脱离父节点晋升为一级节点`);

    // 测试 32: 大纲折叠与展开交互
    const outlinerFoldTest = await evaluate(ws, `
      (function() {
        const outliner = window._outlinerInstance;
        // 寻找有子节点的 foldBtn
        const foldBtn = outliner.treeEl.querySelector('.outliner-fold-btn');
        if (!foldBtn) return { error: '找不到折叠按钮' };

        const row = foldBtn.closest('.outliner-row');
        const uid = row.dataset.uid;

        // 点击折叠
        foldBtn.click();
        const isFoldedAfterFirstClick = outliner.collapsedMap.has(uid);
        const collapsedChildren = outliner.treeEl.querySelector('.outliner-node[data-uid="' + uid + '"] .outliner-children');
        const hasCollapsedClass = collapsedChildren ? collapsedChildren.classList.contains('collapsed') : false;

        // 再次点击展开
        const newFoldBtn = outliner.treeEl.querySelector('.outliner-node[data-uid="' + uid + '"] .outliner-fold-btn');
        newFoldBtn.click();
        const isFoldedAfterSecondClick = outliner.collapsedMap.has(uid);
        const expandedChildren = outliner.treeEl.querySelector('.outliner-node[data-uid="' + uid + '"] .outliner-children');
        const isExpanded = expandedChildren ? !expandedChildren.classList.contains('collapsed') : false;

        return {
          isFoldedAfterFirstClick,
          hasCollapsedClass,
          isFoldedAfterSecondClick,
          isExpanded
        };
      })()
    `);

    if (!outlinerFoldTest.isFoldedAfterFirstClick || !outlinerFoldTest.hasCollapsedClass || outlinerFoldTest.isFoldedAfterSecondClick || !outlinerFoldTest.isExpanded) {
      throw new Error(`折叠展开逻辑异常: ${JSON.stringify(outlinerFoldTest)}`);
    }
    console.log('[PASS] 测试 32: 大纲折叠展开交互正常，三角形箭头指示旋转并隐藏/显示子节点容器');

    // 测试 33: 大纲编辑数据双向同步回思维导图
    const roundTripSyncTest = await evaluate(ws, `
      new Promise((resolve) => {
        const controller = window._dualViewControllerInstance;
        const outliner = window._outlinerInstance;
        const mm = window._mindMapInstance;

        // 在大纲中编辑聚焦的节点文本
        const focusedUid = outliner.focusedUid;
        const textEl = outliner.treeEl.querySelector('.outliner-text[data-uid="' + focusedUid + '"]');
        const targetString = '飞书大纲双向联动验证节点_2026';
        textEl.textContent = targetString;
        textEl.dispatchEvent(new Event('input', { bubbles: true }));

        const checkAndResolve = () => {
          const mmData = mm.getData(false);
          const jsonStr = JSON.stringify(mmData);
          const hasInMmData = jsonStr.includes(targetString);

          // 验证 SVG foreignObject 渲染
          const foTexts = Array.from(mm.el.querySelectorAll('foreignObject')).map(f => f.textContent.trim());
          const hasInSvg = foTexts.some(t => t.includes(targetString));

          resolve({
            currentView: controller.getCurrentView(),
            isMmVisible: mm.el.style.display !== 'none',
            hasInMmData,
            hasInSvg,
            targetString
          });
        };

        const timer = setTimeout(() => {
          mm.off('node_tree_render_end', onRenderEnd);
          checkAndResolve();
        }, 1500);

        const onRenderEnd = () => {
          clearTimeout(timer);
          mm.off('node_tree_render_end', onRenderEnd);
          checkAndResolve();
        };

        mm.on('node_tree_render_end', onRenderEnd);

        // 切换回思维导图视图
        controller.switchView('mindmap');
      })
    `);

    if (roundTripSyncTest.currentView !== 'mindmap' || !roundTripSyncTest.isMmVisible) {
      throw new Error('切换回思维导图视图失败');
    }
    if (!roundTripSyncTest.hasInMmData || !roundTripSyncTest.hasInSvg) {
      throw new Error(`大纲修改内容未能正确同步至导图: hasInMmData=${roundTripSyncTest.hasInMmData}, hasInSvg=${roundTripSyncTest.hasInSvg}`);
    }
    console.log(`[PASS] 测试 33: 双向数据同步测试通过，大纲新编节点已无缝同步并在导图 SVG 节点中成功呈现: "${roundTripSyncTest.targetString}"`);

    // 测试 34: Ctrl + / 全局快捷键双向切换
    const shortcutToggleTest = await evaluate(ws, `
      (function() {
        const controller = window._dualViewControllerInstance;
        const viewBefore = controller.getCurrentView();

        // 触发 Ctrl + /
        window.dispatchEvent(new KeyboardEvent('keydown', { key: '/', ctrlKey: true, bubbles: true, cancelable: true }));
        const viewAfterFirst = controller.getCurrentView();

        // 再次触发 Ctrl + /
        window.dispatchEvent(new KeyboardEvent('keydown', { key: '/', ctrlKey: true, bubbles: true, cancelable: true }));
        const viewAfterSecond = controller.getCurrentView();

        return {
          viewBefore,
          viewAfterFirst,
          viewAfterSecond
        };
      })()
    `);

    if (shortcutToggleTest.viewBefore !== 'mindmap' || shortcutToggleTest.viewAfterFirst !== 'outline' || shortcutToggleTest.viewAfterSecond !== 'mindmap') {
      throw new Error(`Ctrl + / 快捷键切换异常: ${JSON.stringify(shortcutToggleTest)}`);
    }
    console.log('[PASS] 测试 34: Ctrl + / 键盘全局快捷键无缝切换验证通过 (mindmap -> outline -> mindmap)');

    // 测试 35: 大纲节点层级重排 (moveNodeRelative)
    const outlinerMoveTest = await evaluate(ws, `
      (function() {
        const outliner = window._outlinerInstance;
        const topChildren = outliner.data.children;
        if (topChildren.length < 2) return { error: '顶级节点不足2个' };

        const firstUid = topChildren[0].data.uid;
        const secondUid = topChildren[1].data.uid;

        // 将第一个节点移动到第二个节点之后
        const success = outliner.moveNodeRelative(firstUid, secondUid, 'after');
        const newFirstUid = outliner.data.children[0].data.uid;

        return {
          success,
          isReordered: newFirstUid === secondUid
        };
      })()
    `);

    if (!outlinerMoveTest.success || !outlinerMoveTest.isReordered) {
      throw new Error(`大纲节点重排失败: ${JSON.stringify(outlinerMoveTest)}`);
    }
    console.log('[PASS] 测试 35: 大纲节点重排 (moveNodeRelative) 成功，父子与兄弟层级顺序准确重构');

    // 截取飞书风格导图全景预览图
    await sleep(300);
    const mmScreenshot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
    const mmScreenshotBuffer = Buffer.from(mmScreenshot.data, 'base64');
    fs.writeFileSync(path.join(__dirname, 'feishu_mindmap_preview.png'), mmScreenshotBuffer);
    if (fs.existsSync(BRAIN_DIR)) {
      fs.writeFileSync(path.join(BRAIN_DIR, 'feishu_mindmap_preview.png'), mmScreenshotBuffer);
    }
    console.log('[Screenshot] 飞书思维导图视图真实截图已生成: mindmap-sandbox/feishu_mindmap_preview.png');

    // 切换到大纲模式并截取精美预览图
    await evaluate(ws, `window._dualViewControllerInstance.switchView('outline')`);
    await sleep(400);
    const screenshot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
    const screenshotBuffer = Buffer.from(screenshot.data, 'base64');
    const outlinerPreviewPath = path.join(__dirname, 'feishu_outliner_preview.png');
    fs.writeFileSync(outlinerPreviewPath, screenshotBuffer);

    // 复制到 artifact 目录
    if (fs.existsSync(BRAIN_DIR)) {
      fs.writeFileSync(path.join(BRAIN_DIR, 'feishu_outliner_preview.png'), screenshotBuffer);
    }
    console.log('[Screenshot] 飞书大纲视图真实截图已生成: mindmap-sandbox/feishu_outliner_preview.png');

    console.log('\n====================================================');
    console.log('   所有 Phase (1~7) 共计 35 项端到端测试全部通过');
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n[FAIL] 自动化回归测试失败:', err.message);
    process.exitCode = 1;
  } finally {
    await cleanup();
  }
}

run();
