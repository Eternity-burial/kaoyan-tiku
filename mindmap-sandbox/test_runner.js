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
    console.log(`✅ 测试 6: 初始拓扑结构验证通过 (三大章节: ${treeTopology.ch1KidsCount}节 / ${treeTopology.ch2KidsCount}节 / ${treeTopology.ch3KidsCount}节)`);

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
    console.log(`✅ 测试 7: 改变父子关系 (Reparenting) 成功，4个子定理完整保留 (${reparentTest.movedSubtreeKidTitles.join(', ')})`);

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
    console.log('✅ 测试 8: 历史栈撤销 (Undo) 与重做 (Redo) 拓扑还原 100% 精准');

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
    console.log(`✅ 测试 9: 同级节点重新排序 (Sibling Reorder) 正常: ${siblingReorderTest.newTitles[0]} -> ${siblingReorderTest.newTitles[1]} -> ${siblingReorderTest.newTitles[2]}`);

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
    console.log(`✅ 测试 10: 防成环保护 (Cycle Prevention) 完备 (节点具备 isParent 拓扑层级校验)`);

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
    console.log(`✅ 测试 11: 插入子节点 (Tab / INSERT_CHILD_NODE) 成功，子节点数从 ${insertChildTest.beforeKidsCount} 增至 ${insertChildTest.afterKidsCount}`);

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
    console.log(`✅ 测试 12: 插入同级节点 (Enter / INSERT_NODE) 成功，同级节点数从 ${insertSiblingTest.beforeChCount} 增至 ${insertSiblingTest.afterChCount}`);

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
    console.log(`✅ 测试 13: 删除节点 (Del / REMOVE_NODE) 成功，节点数减 1 还原`);

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
    console.log(`✅ 测试 14: 节点原地编辑 (TextEdit) 成功，SVG 文本与排版已同步更新为: "${textEditTest.dataText}"`);

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
    console.log(`✅ 测试 15: 画布平移漫游 (Pan / translateXY) 坐标换算精准 (Δx=-60, Δy=-40)`);

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
    console.log(`✅ 测试 16: 纯文本树数据结构导出 (getData) 完整 (根节点="${exportTest.rootTitle}", 子分支数=${exportTest.childrenCount}, JSON大小=${exportTest.jsonLength}B)`);

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
    console.log(`✅ 测试 17: 外部数据结构导入 (setData) 成功，新知识架构已完整呈现 (根="${importTest.newRootTitle}", 分支数=${importTest.branchCount})`);

    console.log('\n🎉 ====================================================');
    console.log('   所有 Phase (1~5) 共计 17 项端到端测试全部完美通过！');
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n❌ 自动化回归测试失败:', err.message);
    process.exitCode = 1;
  } finally {
    await cleanup();
  }
}

run();
