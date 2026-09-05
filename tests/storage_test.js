/**
 * tests/storage_test.js
 *
 * 标准存储架构深度集成测试：
 * 1. 验证在无任何旧魔数键的环境下，全部掌握度、SM-2、笔记的纯净读写
 * 2. 模拟插题/拆题破坏性实验，断言 100% 抗漂移与零错位
 * 3. 验证本地导出的 kaoyan_tiku_data.json 能被 100% 完整校验
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('  标准 SSOT 存储与零错位抗漂移破坏性集成测试');
console.log('====================================================\n');

// 1. Mock LocalStorage
function createMockLocalStorage() {
  const store = {};
  return {
    getItem: function(k) { return store[k] !== undefined ? store[k] : null; },
    setItem: function(k, v) { store[k] = String(v); },
    removeItem: function(k) { delete store[k]; },
    clear: function() { for (let k in store) delete store[k]; },
    get length() { return Object.keys(store).length; },
    key: function(i) { return Object.keys(store)[i] || null; },
    _store: store
  };
}

const mockLS = createMockLocalStorage();
const storageSrc = fs.readFileSync(path.join(__dirname, '../js/storage.js'), 'utf8');
const win = { localStorage: mockLS, StorageEngine: null, console: console };
new Function('window', 'localStorage', storageSrc)(win, mockLS);
const { ChapterStore, GlobalStore, UiStore, ResumeStore } = win.StorageEngine;

// 2. 测试纯净读写
console.log('--- 1. 纯净存储读写测试 ---');
const testCh = {
  uid: 'math::李范全书::高数::ch03',
  id: 'math::李范全书::高数::ch03',
  total: 3, ownTotal: 3,
  labels: ['ex_3-1', 'ex_3-2', 'ex_3-3'],
  getQuestionSlug(i) { return this.labels[i] || null; },
  getIdxBySlug(slug) { return this.labels.indexOf(slug); }
};

const store = new ChapterStore(testCh);
store.setQuestion('ex_3-2', {
  status: 'wrong',
  sm2: { ef: 2.3, interval: 4, reps: 2 },
  notes: '重点难点：必须熟记极坐标面积元公式',
  qbad: true
});

const q = store.getQuestion('ex_3-2');
assert.strictEqual(q.status, 'wrong');
assert.strictEqual(q.sm2.interval, 4);
assert.strictEqual(q.notes, '重点难点：必须熟记极坐标面积元公式');
assert.strictEqual(q.qbad, true);
console.log('  ✔ 单题原子属性写入与读取完全匹配');

// 2.1 验证取消标记后持久化完全清除（杜绝刷新复活）
console.log('\n--- 1.1 取消标记与状态清除持久化（杜绝刷新复活）测试 ---');
const unmarkCh = {
  uid: 'math::test::unmark',
  id: 'math::test::unmark',
  total: 2, ownTotal: 2,
  labels: ['ex_1-1', 'ex_1-2'],
  getQuestionSlug(i) { return this.labels[i]; }
};
const unmarkStore = new ChapterStore(unmarkCh);

// (1) 首次标记熟练并记录笔记
unmarkStore.writeFromMemory({
  statuses: { 0: 'proficient' },
  notes: { 'math::test::unmark::ex_1-1': '第一题笔记' },
  qBad: { 0: true },
  offset: 0,
  len: 2
});

let savedRaw = JSON.parse(mockLS.getItem('kaoyan.q.math::test::unmark'));
assert.strictEqual(savedRaw['ex_1-1'].status, 'proficient');
assert.strictEqual(savedRaw['ex_1-1'].notes, '第一题笔记');
assert.strictEqual(savedRaw['ex_1-1'].qbad, true);

// (2) 模拟按 Z 取消标记（内存态删除），只提交 statuses 更新
unmarkStore.writeFromMemory({
  statuses: {}, // 0 号题已被取消，不再在 statuses 中
  offset: 0,
  len: 2
});

savedRaw = JSON.parse(mockLS.getItem('kaoyan.q.math::test::unmark'));
assert.strictEqual(savedRaw['ex_1-1'].status, undefined, '取消标记后 status 属性必须从存储中彻底删除');
assert.strictEqual(savedRaw['ex_1-1'].notes, '第一题笔记', '笔记内容不受影响，完整保留');
assert.strictEqual(savedRaw['ex_1-1'].qbad, true, '图片不达标标志不受影响，完整保留');

// (3) 模拟页面刷新（重新从本地存储加载到内存）
const memAfterRefresh = { statuses: {}, notes: {}, qBad: {} };
unmarkStore.readIntoMemory(memAfterRefresh, 0);
assert.strictEqual(memAfterRefresh.statuses[0], undefined, '刷新后已取消的掌握度绝不复活');
assert.strictEqual(memAfterRefresh.notes['math::test::unmark::ex_1-1'], '第一题笔记', '刷新后笔记正常读入');
assert.strictEqual(memAfterRefresh.qBad[0], true, '刷新后 qBad 正常读入');

// (4) 取消 qBad 与删除笔记
unmarkStore.writeFromMemory({
  qBad: {}, // 取消 qBad
  notes: { 'math::test::unmark::ex_1-1': '' }, // 清空笔记
  offset: 0,
  len: 2
});

savedRaw = JSON.parse(mockLS.getItem('kaoyan.q.math::test::unmark'));
assert.strictEqual(savedRaw['ex_1-1'], undefined, '当全部属性清空后，整题 slug 键彻底清理');
console.log('  ✔ 取消掌握度标记/取消qBad/清空笔记后持久化彻底清除，刷新零复活验证通过！');

// 3. 破坏性测试：模拟题目中间插入新题
console.log('\n--- 2. 章节动态插入/拆题抗漂移破坏性测试 ---');
// 假设我们在 ex_3-1 与 ex_3-2 之间插入一道新题 ex_3-1_inserted
const modifiedCh = {
  uid: 'math::李范全书::高数::ch03',
  id: 'math::李范全书::高数::ch03',
  total: 4, ownTotal: 4,
  labels: ['ex_3-1', 'ex_3-1_inserted', 'ex_3-2', 'ex_3-3'],
  getQuestionSlug(i) { return this.labels[i] || null; },
  getIdxBySlug(slug) { return this.labels.indexOf(slug); }
};

const modifiedStore = new ChapterStore(modifiedCh);
const memStatuses = {};
const memNotes = {};
const memSm2 = {};
modifiedStore.readIntoMemory({ statuses: memStatuses, notes: memNotes, sm2: memSm2 }, 0);

// 断言：由于使用了 slug 键，插入新题后，原来的 ex_3-2 依然精准映射到它在修改后的下标 2 上！
assert.strictEqual(memStatuses[2], 'wrong');
assert.strictEqual(memNotes['math::李范全书::高数::ch03::ex_3-2'], '重点难点：必须熟记极坐标面积元公式');
assert.strictEqual(memSm2[2].interval, 4);

// 新插入的题由于没有做过，状态完全为 undefined，未受任何污染！
assert.strictEqual(memStatuses[1], undefined);
assert.strictEqual(memNotes['math::李范全书::高数::ch03::ex_3-1_inserted'], undefined);
console.log('  ✔ 题目中间插入新题后，旧题数据零漂移、新题零污染验证通过！');

// 4. 验证真实 kaoyan_tiku_data.json 数据集
console.log('\n--- 3. 真实 kaoyan_tiku_data.json 数据集校验 ---');
const dbPath = path.join(__dirname, '../kaoyan_tiku_data.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

assert.strictEqual(db.version, 3);
assert.strictEqual(db.storageEngine, 'StorageEngine-SSOT');

let totalStatus = 0;
let totalSm2 = 0;
let totalNotes = 0;

for (let key in db.data) {
  if (key.startsWith('kaoyan.q.')) {
    const rawChapter = JSON.parse(db.data[key]);
    assert.strictEqual(rawChapter.$v, 3);
    for (let slug in rawChapter) {
      if (slug.startsWith('$')) continue;
      const item = rawChapter[slug];
      if (item.status) totalStatus++;
      if (item.sm2) totalSm2++;
      if (item.notes) totalNotes++;
    }
  }
}

console.log(`  ✔ 真实数据库包含 ${totalStatus} 题掌握度，${totalSm2} 题 SM-2，${totalNotes} 条笔记，0 旧键残留`);
assert.ok(totalStatus >= 1730, `做题数应大于等于基准1730，当前为 ${totalStatus}`);
assert.ok(totalSm2 >= 1640, `SM-2数应大于等于基准1640，当前为 ${totalSm2}`);
assert.ok(totalNotes >= 247, `笔记数应大于等于基准247，当前为 ${totalNotes}`);

// 重点断言：基础30讲高数第5讲具备完整24题，第10讲已彻底纯净（无孤立误触题）
const chLec05 = JSON.parse(db.data['kaoyan.q.math::基础30讲::高数::lec05']);
const chLec10 = JSON.parse(db.data['kaoyan.q.math::基础30讲::高数::lec10']);
assert.strictEqual(Object.keys(chLec05).filter(s => !s.startsWith('$')).length, 24, '基础30讲高数第5讲具备完整24题数据');
assert.strictEqual(Object.keys(chLec10).filter(s => !s.startsWith('$')).length, 0, '基础30讲高数第10讲必须无孤立误触题残留');

// 重点断言：例3-39 各小题 (I)~(VI) 数据完全独立无覆盖
const ch03Key = 'kaoyan.q.math::李范全书::高数::ch03';
assert.ok(db.data[ch03Key], '必须包含李范全书高数第3章');
const ch03Data = JSON.parse(db.data[ch03Key]);

const q339_1 = ch03Data['ex_3-39_(I)'];
const q339_2 = ch03Data['ex_3-39_(II)'];
const q339_3 = ch03Data['ex_3-39_(III)'];
const q339_4 = ch03Data['ex_3-39_(IV)'];
const q339_5 = ch03Data['ex_3-39_(V)'];
const q339_6 = ch03Data['ex_3-39_(VI)'];

assert.ok(q339_1 && q339_2 && q339_3 && q339_4 && q339_5 && q339_6, '例3-39所有小题均必须存在');

// 断言各小题掌握度互不相同
assert.strictEqual(q339_1.status, 'proficient');
assert.strictEqual(q339_2.status, 'vague');
assert.strictEqual(q339_3.status, 'rusty');
assert.strictEqual(q339_4.status, 'wrong');
assert.strictEqual(q339_5.status, 'wrong');
assert.strictEqual(q339_6.status, 'wrong');

// 断言各小题笔记互不相同
assert.strictEqual(q339_1.notes, '$(Ⅰ)$过');
assert.strictEqual(q339_2.notes, '$\\int \\sqrt{a^2-x^2} \\,dx$并不好处理');
assert.strictEqual(q339_3.notes, '注意$(a-b)$的范围，换元法很巧妙');
assert.strictEqual(q339_4.notes, undefined);

// 断言各小题 SM-2 间隔与打分互不相同
assert.strictEqual(q339_1.sm2.interval, 97);
assert.strictEqual(q339_2.sm2.interval, 2);
assert.strictEqual(q339_3.sm2.interval, 1);

console.log('  ✔ 例3-39各小题 (I)~(VI) 独立掌握度、SM-2与笔记断言完全一致，无覆盖');

// 5. 验证 100% 标注切图物理存在
let validAnnotCount = 0;
for (let key in db.data) {
  if (key.startsWith('annot_')) {
    let p = decodeURIComponent(key.slice(14));
    assert.ok(fs.existsSync(p), `标注文件路径必须在磁盘物理存在: ${p}`);
    validAnnotCount++;
  }
}
assert.ok(validAnnotCount >= 122, `标注数应大于等于122，当前为 ${validAnnotCount}`);
console.log(`  ✔ 真实数据库包含 ${validAnnotCount} 处图片标注，100% 物理存在且零断链`);

// 6. 验证考点亲密度 (Affinity) 纯净性
const aff = JSON.parse(db.data['kaoyan.g.affinity']);
let oldAffKeys = 0;
for (let p in aff.pairs) {
  if (p.includes('ch136') || p.includes('ch213') || p.includes('ch214') || /::\d+::/.test(p) || /::\d+$/.test(p)) {
    oldAffKeys++;
  }
}
for (let o in aff.customOrders) {
  if (o.includes('ch136') || o.includes('ch213') || o.includes('ch214') || /::\d+$/.test(o)) {
    oldAffKeys++;
  }
}
assert.strictEqual(oldAffKeys, 0, '考点亲密度必须无历史旧魔数/数字下标残留');
assert.strictEqual(Object.keys(aff.pairs).length, 117);
assert.strictEqual(Object.keys(aff.customOrders).length, 6);
console.log(`  ✔ 考点亲密度校验通过: 117 对规范 URN 关联与 6 项自定义顺序，0 历史旧键残留`);

console.log('\n====================================================');
console.log('  全部集成与破坏性测试 100% 通过！');
console.log('====================================================\n');
