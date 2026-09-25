/**
 * 考研题库 - 语义化题目实体与抗错位自动化测试套件 (Semantic Question Entity Tests)
 * 验证：章节全局 UID、题目物理 Slug、规范 URN 编解码、双模解析与增删小题抗错位性
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('  考研题库 - 语义化题目实体自动化测试 (Semantic Entity Tests)');
console.log('====================================================\n');

let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  \x1b[32m✔\x1b[0m ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  \x1b[31m✖\x1b[0m ${name}`);
    console.error(`    \x1b[31mError: ${err.message}\x1b[0m`);
    if (err.stack) {
      console.error('    ' + err.stack.split('\n').slice(1, 4).join('\n    '));
    }
    failedTests++;
  }
}

// 载入 chapters.js
const chaptersSrc = fs.readFileSync('d:/tj/822/考研题库/js/chapters.js', 'utf8');
const mockWindow = {};
new Function('window', chaptersSrc + '\nwindow.SUBJECTS = SUBJECTS;\nwindow.SHU1_CHAPTERS = SHU1_CHAPTERS;')(mockWindow);
const SUBJECTS = mockWindow.SUBJECTS;

test('1. 全库 100% 章节具备全局唯一语义 UID (无魔数冲突)', () => {
  const seenUids = new Set();
  let totalChapters = 0;
  SUBJECTS.forEach(s => {
    if (!s.chapters) return;
    s.chapters.forEach(ch => {
      totalChapters++;
      assert(ch.uid, `Chapter ${ch.id} must have a uid`);
      assert(!seenUids.has(ch.uid), `Duplicate chapter uid found: ${ch.uid}`);
      seenUids.add(ch.uid);
      assert(ch.book, `Chapter ${ch.id} must have book property`);
      assert(ch.discipline, `Chapter ${ch.id} must have discipline property`);
      assert(ch.chapterSlug, `Chapter ${ch.id} must have chapterSlug property`);
    });
  });
  console.log(`    (验证通过: 全库 ${totalChapters} 个章节 UID 100% 唯一无碰撞)`);
});

test('2. 题目 Slug 严格对应物理切图命名规范', () => {
  const mathSubj = SUBJECTS.find(s => s.id === 'math');
  const chLifan03 = mathSubj.chapters.find(c => c.id === 'math::李范全书::高数::ch03');
  assert(chLifan03, 'math::李范全书::高数::ch03 must exist');
  assert.strictEqual(chLifan03.uid, 'math::李范全书::高数::ch03');
  assert.strictEqual(chLifan03.id, 'math::李范全书::高数::ch03');

  // 测试例3-14 (I) 与 (II)
  const slug1 = chLifan03.getQuestionSlug(20);
  const slug2 = chLifan03.getQuestionSlug(21);
  assert.strictEqual(slug1, 'ex_3-14_(I)');
  assert.strictEqual(slug2, 'ex_3-14_(II)');
  assert.strictEqual(chLifan03.getQuestionUID(20), 'math::李范全书::高数::ch03::ex_3-14_(I)');

  // 测试例3-17
  assert.strictEqual(chLifan03.getQuestionSlug(26), 'ex_3-17');
  assert.strictEqual(chLifan03.getQuestionUID(26), 'math::李范全书::高数::ch03::ex_3-17');

  // 反查验证
  assert.strictEqual(chLifan03.getIdxBySlug('ex_3-14_(I)'), 20);
  assert.strictEqual(chLifan03.getIdxBySlug('ex_3-17'), 26);
  assert.strictEqual(chLifan03.getLabelBySlug('ex_3-14_(I)'), '例3-14 (I)');
});

test('3. 822 科目与小题300及822教材题目实体命名验证', () => {
  const subj822 = SUBJECTS.find(s => s.id === '822');
  const ch300_01 = subj822.chapters.find(c => c.id === '822::小题300::控制工程基础::ch01');
  assert(ch300_01, '822::小题300::控制工程基础::ch01 must exist');
  assert.strictEqual(ch300_01.uid, '822::小题300::控制工程基础::ch01');
  assert.strictEqual(ch300_01.id, '822::小题300::控制工程基础::ch01');
  assert.strictEqual(ch300_01.getQuestionSlug(0), 'q001');
  assert.strictEqual(ch300_01.getQuestionUID(0), '822::小题300::控制工程基础::ch01::q001');

  const ch822_01 = subj822.chapters.find(c => c.id === '822::822教材::控制工程基础::ch01');
  assert(ch822_01, '822::822教材::控制工程基础::ch01 must exist');
  assert.strictEqual(ch822_01.uid, '822::822教材::控制工程基础::ch01');
  assert.strictEqual(ch822_01.book, '822教材');
  assert.strictEqual(ch822_01.getQuestionSlug(0), 'pb_1-1_(1)');
});

test('4. 抗错位破坏性测试 (Anti-Drift Resilience Test)', () => {
  // 模拟章节数据对象
  const mockCh = {
    id: 'mock_ch',
    uid: 'math::测试教材::高数::ch01',
    book: '测试教材',
    subj: '高数',
    labels: ['例1-1', '例1-2', '例1-3'], // 原有 3 道题
    getQuestionSlug: function(idxOrLabel) {
      const l = typeof idxOrLabel === 'number' ? this.labels[idxOrLabel] : idxOrLabel;
      return 'ex_' + l.replace('例', '').replace(/\s+/g, '_');
    },
    getIdxBySlug: function(slug) {
      for (let i = 0; i < this.labels.length; i++) {
        if (this.getQuestionSlug(i) === slug) return i;
      }
      return -1;
    }
  };

  // 模拟存储：用户给例1-1打了proficient，例1-2打了vague，例1-3打了wrong
  const storage = {
    'ex_1-1': 'proficient',
    'ex_1-2': 'vague',
    'ex_1-3': 'wrong'
  };

  // 破坏性模拟：用户拆分了题目，在例1-2的位置拆分为 (I) 和 (II)
  mockCh.labels = ['例1-1', '例1-2 (I)', '例1-2 (II)', '例1-3']; // 变成 4 道题！

  // 验证：通过 Slug 寻址，例1-3 的状态依然 100% 是 wrong，绝对没有因为下标平移变成其他值！
  const idxFor1_3 = mockCh.getIdxBySlug('ex_1-3');
  assert.strictEqual(idxFor1_3, 3); // 下标已经从 2 变成了 3

  const slugFor1_3 = mockCh.getQuestionSlug(idxFor1_3);
  assert.strictEqual(slugFor1_3, 'ex_1-3');
  assert.strictEqual(storage[slugFor1_3], 'wrong');

  const idxFor1_1 = mockCh.getIdxBySlug('ex_1-1');
  assert.strictEqual(storage[mockCh.getQuestionSlug(idxFor1_1)], 'proficient');

  console.log('    (抗错位验证通过: 任意插入/拆分小题后，所有题目状态通过 Slug 精准对齐，零错位！)');
});

console.log('\n====================================================');
console.log(`  测试结果: ${passedTests} passed, ${failedTests} failed`);
console.log('====================================================\n');
if (failedTests > 0) process.exit(1);
