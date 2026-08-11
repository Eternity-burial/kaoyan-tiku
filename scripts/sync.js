// 考研题库 无感自动备份
// 启动后持续监控，每 5 分钟通过 CDP 读取 localStorage 写入 data/
// 用法：node scripts/sync.js （由 启动.bat 后台拉起）

const http = require('http');
const fs = require('fs');
const path = require('path');
const WS = require('ws');

const PORT = 9223;
const DATA_DIR = path.join(__dirname, '..', 'data');
const INTERVAL_MS = 5 * 60 * 1000; // 5 分钟
const MAX_BACKUPS = 30;

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); } });
    }).on('error', reject);
  });
}

function sendCommand(wsUrl, method, params) {
  return new Promise((resolve, reject) => {
    const ws = new WS(wsUrl);
    const timer = setTimeout(() => { ws.close(); reject(new Error('WS timeout')); }, 10000);
    ws.on('open', () => ws.send(JSON.stringify({ id: 1, method, params })));
    ws.on('message', (data) => { clearTimeout(timer); ws.close(); resolve(JSON.parse(data)); });
    ws.on('error', (e) => { clearTimeout(timer); reject(e); });
  });
}

async function doBackup() {
  const pages = await getJson(`http://localhost:${PORT}/json`);
  const target = pages.find(p => p.url && p.url.includes('index.html'));
  if (!target) return false;

  const result = await sendCommand(target.webSocketDebuggerUrl, 'Runtime.evaluate', {
    expression: 'JSON.stringify(Object.fromEntries(Object.entries(localStorage)))',
    returnByValue: true
  });

  if (!result.result || !result.result.value) return false;

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  const now = new Date();
  const ds = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
  const filepath = path.join(DATA_DIR, `backup_${ds}.json`);

  const data = JSON.parse(result.result.value);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');

  // 清理旧备份
  const files = fs.readdirSync(DATA_DIR).filter(f => f.startsWith('backup_') && f.endsWith('.json')).sort();
  while (files.length > MAX_BACKUPS) fs.unlinkSync(path.join(DATA_DIR, files.shift()));

  // 快照
  fs.copyFileSync(filepath, path.join(DATA_DIR, 'latest.json'));
  return true;
}

async function main() {
  console.log('🦐 备份守护已启动（每 ' + (INTERVAL_MS/60000) + ' 分钟同步一次）');

  let lastOk = false;
  while (true) {
    try {
      const ok = await doBackup();
      if (ok && !lastOk) process.stdout.write(new Date().toLocaleTimeString('zh-CN') + ' 备份已连接\n');
      lastOk = ok;
    } catch (e) {
      if (lastOk) process.stdout.write(new Date().toLocaleTimeString('zh-CN') + ' 等待 Chrome…\n');
      lastOk = false;
    }
    await new Promise(r => setTimeout(r, INTERVAL_MS));
  }
}

main();
