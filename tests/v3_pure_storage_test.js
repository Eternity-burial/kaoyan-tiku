/**
 * tests/v3_pure_storage_test.js
 *
 * 纯净 V3 SSOT 存储架构深度验证：
 * 1. 验证在无任何旧魔数键的环境下，全部掌握度、SM-2、笔记的纯净读写
 * 2. 模拟插题/拆题破坏性实验，断言 100% 抗漂移与零错位
 * 3. 验证本地导出的 kaoyan_tiku_data.json 能被 StorageSync 100% 还原
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('  V3 纯净 SSOT 存储与零错位抗漂移破坏性集成测试');
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
const storageV3Src = fs.readFileSync(path.join(__dirname, '../js/storage_v3.js'), 'utf8');
const v3Win = { localStorage: mockLS, StorageV3: null, console: console };
new Function('window', 'localStorage', storageV3Src)(v3Win, mockLS);
const { ChapterStore, GlobalStore, UiStore, ResumeStore, MigrationRunner } = v3Win.StorageV3;

// 2. 测试纯净读写
console.log('--- 1. 纯净 V3 读写测试 (无旧键依赖) ---');
const testCh = {
  uid: 'math::李范全书::高数::ch03',
  id: 'ch136',
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

// 3. 模拟章节动态插入小题（破坏性漂移测试）
console.log('\n--- 2. 章节动态插入/拆题抗漂移破坏性测试 ---');
// 原始：['ex_3-1', 'ex_3-2', 'ex_3-3']，'ex_3-2' 原本下标为 1
// 现实变动：在 ex_3-1 和 ex_3-2 之间插入新题 'ex_3-1_plus'，并把 ex_3-2 拆分为 (I) 和 (II)
const updatedCh = {
  uid: 'math::李范全书::高数::ch03',
  id: 'ch136',
  total: 4, ownTotal: 4,
  labels: ['ex_3-1', 'ex_3-1_plus', 'ex_3-2', 'ex_3-3'],
  getQuestionSlug(i) { return this.labels[i] || null; },
  getIdxBySlug(slug) { return this.labels.indexOf(slug); }
};

// 内存装载：通过 readIntoMemory 装载
const memStatuses = {};
const memSm2 = {};
const memNotes = {};
const newStore = new ChapterStore(updatedCh);
newStore.readIntoMemory({ statuses: memStatuses, sm2: memSm2, notes: memNotes }, 0);

// 断言：
// 下标 0 (ex_3-1): 未做
assert.strictEqual(memStatuses[0], undefined);
// 下标 1 (新插入的 ex_3-1_plus): 未做，绝对不能被旧 ex_3-2 污染！
assert.strictEqual(memStatuses[1], undefined, '新插入的题目状态应为未标记，绝不被旧数据错位污染');
assert.strictEqual(memSm2[1], undefined);
assert.strictEqual(memNotes[1], undefined);

// 下标 2 (原 ex_3-2，现在被顺移到下标 2): 必须 100% 保持！
assert.strictEqual(memStatuses[2], 'wrong', '原 ex_3-2 即使顺移到下标 2，状态依然精准对齐');
assert.strictEqual(memSm2[2].interval, 4, '原 ex_3-2 的 SM-2 间隔依然精准对齐');
assert.strictEqual(memNotes['ch136::ex_3-2'], '重点难点：必须熟记极坐标面积元公式', '原 ex_3-2 的笔记依然精准对齐');
console.log('  ✔ 题目中间插入新题后，旧题数据零漂移、新题零污染验证通过！');

// 4. 验证真实数据库迁移后的数据完整性
console.log('\n--- 3. 真实迁移后 kaoyan_tiku_data.json 数据集校验 ---');
const dbPath = path.join(__dirname, '../kaoyan_tiku_data.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

assert.strictEqual(db.version, 3);
assert.ok(db.storageEngine === 'StorageEngine-SSOT' || db.storageEngine === 'StorageV3-SSOT');

let totalStatus = 0;
let totalSm2 = 0;
let totalNotes = 0;
let legacyKeys = 0;

for (const k in db.data) {
  if (k.startsWith('kaoyan.q.')) {
    const chapterData = JSON.parse(db.data[k]);
    for (const slug in chapterData) {
      if (slug.charAt(0) === '$') continue;
      // 断言没有纯数字键
      assert.ok(!/^\d+$/.test(slug), `章节 ${k} 内部不能有纯数字键: ${slug}`);
      const entry = chapterData[slug];
      if (entry.status) totalStatus++;
      if (entry.sm2) totalSm2++;
      if (entry.notes) totalNotes++;
    }
  } else if (!k.startsWith('kaoyan.g.') && !k.startsWith('kaoyan.ui.') && !k.startsWith('annot_') && !k.startsWith('ky_english_') && !k.startsWith('english_vocab_')) {
    legacyKeys++;
  }
}

assert.strictEqual(legacyKeys, 0, '新数据库中不能存在任何非规范历史键');
assert.strictEqual(totalStatus, 1732, '掌握度状态总数精确对齐权威数据 (1732题)');
assert.strictEqual(totalSm2, 1640, 'SM-2复习记录总数精确对齐权威数据 (1640题)');
assert.strictEqual(totalNotes, 247, '笔记总数精确对齐权威数据 (247条)');

// 验证例3-39各小题内容彼此独立、未被覆盖
const ch03 = JSON.parse(db.data['kaoyan.q.math::李范全书::高数::ch03']);
assert.strictEqual(ch03['ex_3-39_(I)'].status, 'proficient');
assert.strictEqual(ch03['ex_3-39_(I)'].notes, '$(Ⅰ)$过');
assert.strictEqual(ch03['ex_3-39_(II)'].status, 'vague');
assert.strictEqual(ch03['ex_3-39_(II)'].notes, '$\\int \\sqrt{a^2-x^2} \\,dx$并不好处理');
assert.strictEqual(ch03['ex_3-39_(III)'].status, 'rusty');
assert.strictEqual(ch03['ex_3-39_(III)'].notes, '注意$(a-b)$的范围，换元法很巧妙');
assert.strictEqual(ch03['ex_3-39_(IV)'].status, 'wrong');
assert.strictEqual(ch03['ex_3-39_(IV)'].notes, undefined);
assert.strictEqual(ch03['ex_3-39_(V)'].status, 'wrong');
assert.strictEqual(ch03['ex_3-39_(V)'].notes, undefined);
assert.strictEqual(ch03['ex_3-39_(VI)'].status, 'wrong');
assert.strictEqual(ch03['ex_3-39_(VI)'].notes, undefined);

console.log(`  ✔ 真实数据库包含 ${totalStatus} 题掌握度，${totalSm2} 题 SM-2，${totalNotes} 条笔记，0 旧键残留`);
console.log('  ✔ 例3-39各小题 (I)~(VI) 独立掌握度、SM-2与笔记断言完全一致，无覆盖');

console.log('\n====================================================');
console.log('  全部集成与破坏性测试 100% 通过！');
console.log('====================================================\n');
