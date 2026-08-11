// 考研题库 CDP 自动备份脚本
// 通过 Chrome DevTools Protocol 读取 localStorage 并写入本地 data/ 目录
// 用法：node scripts/backup.js
// 前提：Chrome 需以 --remote-debugging-port=9223 启动（使用 启动.bat 即可）

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9223;
const DATA_DIR = path.join(__dirname, '..', 'data');
const MAX_BACKUPS = 30; // 只保留最近 30 份备份

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

function sendCommand(wsUrl, method, params) {
  return new Promise((resolve, reject) => {
    const WS = require('ws');
    const ws = new WS(wsUrl);
    ws.on('open', () => {
      ws.send(JSON.stringify({ id: 1, method, params }));
    });
    ws.on('message', (data) => {
      const msg = JSON.parse(data);
      ws.close();
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    });
    ws.on('error', reject);
  });
}

(async () => {
  try {
    // 1. 获取 Chrome 页面列表
    const pages = await getJson(`http://localhost:${PORT}/json`);
    const target = pages.find(p => p.url && p.url.includes('index.html'));
    if (!target) {
      console.error('未找到已打开的题库页面。请确认 Chrome 已通过 启动.bat 打开。');
      process.exit(1);
    }

    // 2. 通过 CDP 连接并执行 JS
    console.log('连接到页面: ' + target.title);
    const result = await sendCommand(target.webSocketDebuggerUrl, 'Runtime.evaluate', {
      expression: 'JSON.stringify(Object.fromEntries(Object.entries(localStorage)))',
      returnByValue: true
    });

    if (!result.result || !result.result.value) {
      console.error('读取 localStorage 失败');
      process.exit(1);
    }

    // 3. 写入本地文件
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    
    const now = new Date();
    const ds = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}-${String(now.getMinutes()).padStart(2,'0')}`;
    const filename = `backup_${ds}.json`;
    const filepath = path.join(DATA_DIR, filename);
    
    const data = JSON.parse(result.result.value);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`备份完成: ${filename} (${Object.keys(data).length} 键)`);

    // 4. 清理旧备份
    const files = fs.readdirSync(DATA_DIR)
      .filter(f => f.startsWith('backup_') && f.endsWith('.json'))
      .sort();
    while (files.length > MAX_BACKUPS) {
      fs.unlinkSync(path.join(DATA_DIR, files.shift()));
      console.log('清理旧备份: ' + files[0]);
    }

    // 5. 始终保留一份最新快照
    const latestPath = path.join(DATA_DIR, 'latest.json');
    fs.copyFileSync(filepath, latestPath);
    console.log('最新快照: latest.json');

  } catch (e) {
    console.error('备份失败: ' + e.message);
    process.exit(1);
  }
})();
