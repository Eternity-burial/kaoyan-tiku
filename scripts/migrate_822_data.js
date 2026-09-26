/**
 * scripts/migrate_822_data.js
 * 
 * 822 教材数据无损升级脚本：
 * 1. 自动备份 kaoyan_tiku_data.json
 * 2. 迁移 822 教材 8 个章节的存储键及内部 $chapterUid
 * 3. 迁移 kaoyan.g.topics 中引用的 822 题目 QID
 * 4. 迁移 kaoyan.g.resume 中的 822 断点记录
 * 5. 校验数据完整性 (断言题目总数、掌握度总数精确无误)
 * 6. 安全清理旧键
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const DATA_FILE = path.join(__dirname, '../kaoyan_tiku_data.json');
const BACKUP_FILE = path.join(__dirname, '../kaoyan_tiku_data.json.bak');

console.log('=== 开始执行 822 教材数据无损迁移 ===\n');

// 1. 读取原数据
const rawContent = fs.readFileSync(DATA_FILE, 'utf8');
const db = JSON.parse(rawContent);
assert.ok(db && db.data, '无效数据库格式');

// 2. 物理备份
fs.writeFileSync(BACKUP_FILE, rawContent, 'utf8');
console.log('✔ 已创建安全物理备份:', BACKUP_FILE);

// 统计基线数据
let baselineStatusCount = 0;
let baselineSm2Count = 0;
let baselineNotesCount = 0;
for (const k in db.data) {
  if (k.startsWith('kaoyan.q.')) {
    const obj = JSON.parse(db.data[k]);
    for (const slug in obj) {
      if (slug.startsWith('$')) continue;
      if (obj[slug].status) baselineStatusCount++;
      if (obj[slug].sm2) baselineSm2Count++;
      if (obj[slug].notes) baselineNotesCount++;
    }
  }
}
console.log(`基线统计: 掌握度=${baselineStatusCount}, SM-2=${baselineSm2Count}, 笔记=${baselineNotesCount}`);

// 3. 迁移章节键
const CHAPTER_MAP = {
  'kaoyan.q.822::控制工程基础::控制工程基础::ch01': 'kaoyan.q.822::822教材::控制工程基础::ch01',
  'kaoyan.q.822::控制工程基础::控制工程基础::ch02': 'kaoyan.q.822::822教材::控制工程基础::ch02',
  'kaoyan.q.822::控制工程基础::控制工程基础::ch03': 'kaoyan.q.822::822教材::控制工程基础::ch03',
  'kaoyan.q.822::控制工程基础::控制工程基础::ch04': 'kaoyan.q.822::822教材::控制工程基础::ch04',
  'kaoyan.q.822::控制工程基础::控制工程基础::ch05': 'kaoyan.q.822::822教材::控制工程基础::ch05',
  'kaoyan.q.822::控制工程基础::控制工程基础::ch06': 'kaoyan.q.822::822教材::控制工程基础::ch06',
  'kaoyan.q.822::控制工程基础::控制工程基础::ch07': 'kaoyan.q.822::822教材::控制工程基础::ch07',
  'kaoyan.q.822::控制工程基础::控制工程基础::ch09': 'kaoyan.q.822::822教材::控制工程基础::ch09'
};

let migratedChapterKeys = 0;
for (const [oldKey, newKey] of Object.entries(CHAPTER_MAP)) {
  if (db.data[oldKey]) {
    const chapterObj = JSON.parse(db.data[oldKey]);
    const newUid = newKey.replace('kaoyan.q.', '');
    chapterObj.$chapterUid = newUid;
    db.data[newKey] = JSON.stringify(chapterObj);
    delete db.data[oldKey];
    migratedChapterKeys++;
    console.log(`  ✔ 迁移章节键: ${oldKey} -> ${newKey} (包含题目数: ${Object.keys(chapterObj).filter(s => !s.startsWith('$')).length})`);
  }
}
console.log(`✔ 共迁移 ${migratedChapterKeys} 个章节键\n`);

// 4. 迁移 kaoyan.g.topics 中的 QID 引用
if (db.data['kaoyan.g.topics']) {
  const topicsObj = JSON.parse(db.data['kaoyan.g.topics']);
  let qidUpdated = 0;
  for (const topicId in topicsObj) {
    const topic = topicsObj[topicId];
    if (topic && Array.isArray(topic.members)) {
      topic.members.forEach(m => {
        if (m.qid && m.qid.startsWith('822::控制工程基础::控制工程基础::')) {
          const oldQid = m.qid;
          m.qid = m.qid.replace('822::控制工程基础::控制工程基础::', '822::822教材::控制工程基础::');
          qidUpdated++;
          console.log(`  ✔ 迁移考点题目 QID: ${oldQid} -> ${m.qid}`);
        }
      });
    }
  }
  db.data['kaoyan.g.topics'] = JSON.stringify(topicsObj);
  console.log(`✔ 共迁移 ${qidUpdated} 处专题关联 QID\n`);
}

// 5. 迁移 kaoyan.g.resume 中的断点
if (db.data['kaoyan.g.resume']) {
  const resumeObj = JSON.parse(db.data['kaoyan.g.resume']);
  const newResumeObj = {};
  for (const k in resumeObj) {
    let newK = k;
    if (k.startsWith('822::ch::822::控制工程基础::控制工程基础::')) {
      newK = k.replace('822::ch::822::控制工程基础::控制工程基础::', '822::ch::822::822教材::控制工程基础::');
    } else if (k === '822::控制工程基础') {
      newK = '822::822教材';
    }
    
    let val = resumeObj[k];
    if (val && typeof val === 'object' && val.ch && val.ch.startsWith('822::控制工程基础::控制工程基础::')) {
      val = Object.assign({}, val, {
        ch: val.ch.replace('822::控制工程基础::控制工程基础::', '822::822教材::控制工程基础::')
      });
    }
    newResumeObj[newK] = val;
  }
  db.data['kaoyan.g.resume'] = JSON.stringify(newResumeObj);
  console.log('✔ 已规范化 kaoyan.g.resume 断点存储');
}

// 6. 校验迁移后的完整性
let afterStatusCount = 0;
let afterSm2Count = 0;
let afterNotesCount = 0;
for (const k in db.data) {
  if (k.startsWith('kaoyan.q.')) {
    const obj = JSON.parse(db.data[k]);
    for (const slug in obj) {
      if (slug.startsWith('$')) continue;
      if (obj[slug].status) afterStatusCount++;
      if (obj[slug].sm2) afterSm2Count++;
      if (obj[slug].notes) afterNotesCount++;
    }
  }
}
console.log(`\n迁移后统计: 掌握度=${afterStatusCount}, SM-2=${afterSm2Count}, 笔记=${afterNotesCount}`);

assert.strictEqual(afterStatusCount, baselineStatusCount, '掌握度总数必须严格相等！');
assert.strictEqual(afterSm2Count, baselineSm2Count, 'SM-2总数必须严格相等！');
assert.strictEqual(afterNotesCount, baselineNotesCount, '笔记总数必须严格相等！');

// 重点断言：822 教材第 2 章数据完备性
const ch02Data = JSON.parse(db.data['kaoyan.q.822::822教材::控制工程基础::ch02']);
assert.ok(ch02Data, '新键 kaoyan.q.822::822教材::控制工程基础::ch02 必须存在');
assert.strictEqual(ch02Data.$chapterUid, '822::822教材::控制工程基础::ch02');
const ch02Questions = Object.keys(ch02Data).filter(s => !s.startsWith('$'));
assert.strictEqual(ch02Questions.length, 92, '822教材第2章必须包含全部92题数据');
assert.strictEqual(ch02Data['ex_2-1'].status, 'proficient', 'ex_2-1 必须为 proficient');

console.log('✔ 全部校验通过！822 教材第 2 章 92 题数据 100% 完整！');

// 7. 保存更新后的主文件
db.lastSaved = new Date().toISOString();
db.timestamp = Date.now();
fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf8');
console.log('✔ 成功写回主数据文件:', DATA_FILE);
console.log('\n=== 822 教材数据无损迁移圆满完成 ===');
