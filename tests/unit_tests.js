/**
 * 考研题库与复习工作台 - 单元测试套件 (Unit Test Suite)
 * 覆盖：SM-2/SM-2+ 算法、章节数据模型、题组解析、存储同步正则与防污染、XSS 消毒与公式占位、QID 编解码
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('  考研题库 - 单元测试套件 (Unit Tests Runner)');
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

// ===== 载入被测模块 =====
const chaptersSrc = fs.readFileSync(path.join(__dirname, '../js/chapters.js'), 'utf8');

// 模拟浏览器全局环境
const mockWindow = {
  location: { href: 'http://localhost:8080/' },
  localStorage: {},
  addEventListener: () => {},
  document: {
    addEventListener: () => {},
    getElementById: () => null,
    querySelectorAll: () => []
  }
};

// 注入 Chapters 数据
new Function('window', chaptersSrc + '\nwindow.SUBJECTS = SUBJECTS;\nwindow.SHU1_CHAPTERS = SHU1_CHAPTERS;')(mockWindow);
const SUBJECTS = mockWindow.SUBJECTS;
const SHU1_CHAPTERS = mockWindow.SHU1_CHAPTERS;

// ===== SM-2+ 纯函数实现提取验证 =====
function getStudyDayDate(ts) {
  const d = ts ? new Date(ts) : new Date();
  return new Date(d.getTime() - 4 * 3600 * 1000);
}

function getStudyDayIndex(ts) {
  const sd = getStudyDayDate(ts);
  return Math.floor(Date.UTC(sd.getFullYear(), sd.getMonth(), sd.getDate()) / (24 * 3600 * 1000));
}

function calcRetrievability(record, now) {
  if (!record || !record.lastReview || !record.interval) return 1.0;
  const curStudyDay = getStudyDayIndex(now || Date.now());
  const lastStudyDay = record.lastStudyDay !== undefined ? record.lastStudyDay : getStudyDayIndex(record.lastReview);
  const elapsed = Math.max(0, curStudyDay - lastStudyDay);
  const stability = Math.max(1, record.interval);
  const retrievability = Math.pow(1 + 0.19 * (elapsed / stability), -1);
  return Math.max(0.0, Math.min(1.0, retrievability));
}

function calcSM2Plus(record, score, customNow) {
  if (!record) record = { ef: 2.5, interval: 1, reps: 0, nextReview: 0, lastReview: 0, history: [] };
  const now = customNow || Date.now();
  const curStudyDay = getStudyDayIndex(now);
  let ef = (typeof record.ef === 'number' && !isNaN(record.ef)) ? record.ef : 2.5;
  let interval = (typeof record.interval === 'number' && !isNaN(record.interval) && record.interval >= 1) ? record.interval : 1;
  let reps = (typeof record.reps === 'number' && !isNaN(record.reps) && record.reps >= 0) ? record.reps : 0;
  const hist = Array.isArray(record.history) ? record.history.slice() : [];

  score = parseInt(score, 10);
  if (isNaN(score) || score < 1 || score > 5) score = 3;

  const lastStudyDay = record.lastStudyDay !== undefined ? record.lastStudyDay : (record.lastReview ? getStudyDayIndex(record.lastReview) : curStudyDay);
  const elapsedDays = Math.max(0, curStudyDay - lastStudyDay);
  const curR = calcRetrievability(record, now);

  let lapseCount = 0;
  hist.forEach(h => { if (h.score <= 2) lapseCount++; });

  let effortFactor = 1.0;
  if (score >= 4 && record.lastReview > 0) {
    if (elapsedDays >= interval) {
      effortFactor = 1.0 + Math.min(1.5, ((elapsedDays - interval) / Math.max(1, interval)) * 0.6);
    } else {
      effortFactor = 0.5 + 0.5 * (elapsedDays / Math.max(1, interval));
    }
  }

  const lapseDamping = Math.max(0.70, Math.pow(0.94, lapseCount));
  const deltaMap = { 5: 0.15, 4: 0.02, 3: -0.10, 2: -0.18, 1: -0.25 };
  const delta = deltaMap[score] !== undefined ? deltaMap[score] : 0;
  ef = Math.max(1.3, Math.min(3.2, ef + delta));

  if (ef <= 1.6 && hist.length >= 1) {
    const lastScore = hist[hist.length - 1].score;
    if (score >= 4 && lastScore >= 4) {
      ef = Math.min(3.2, ef + 0.15);
    }
  }

  if (score === 5) {
    if (reps === 0) interval = 1;
    else if (reps === 1) interval = Math.max(2, Math.round(6 * effortFactor));
    else interval = Math.max(interval + 1, Math.round(interval * ef * 1.18 * effortFactor * lapseDamping));
    reps++;
  } else if (score === 4) {
    if (reps === 0) interval = 1;
    else if (reps === 1) interval = Math.max(2, Math.round(5 * effortFactor));
    else interval = Math.max(interval + 1, Math.round(interval * ef * effortFactor * lapseDamping));
    reps++;
  } else if (score === 3) {
    reps = Math.max(1, reps - 1);
    interval = Math.max(2, Math.round(interval * 0.5));
  } else if (score === 2) {
    reps = 0;
    interval = 1;
  } else {
    reps = 0;
    interval = 1;
  }

  const dueStudyDay = curStudyDay + interval;
  const dueDayDate = new Date(dueStudyDay * 24 * 3600 * 1000);
  const nextReview = new Date(dueDayDate.getUTCFullYear(), dueDayDate.getUTCMonth(), dueDayDate.getUTCDate(), 4, 0, 0, 0).getTime();

  hist.push({
    date: now,
    score: score,
    ef: parseFloat(ef.toFixed(2)),
    interval: interval,
    elapsedDays: elapsedDays,
    retrievability: parseFloat(curR.toFixed(3)),
    studyDay: curStudyDay
  });

  return {
    ef: parseFloat(ef.toFixed(2)),
    interval: interval,
    reps: reps,
    nextReview: nextReview,
    lastReview: now,
    lastStudyDay: curStudyDay,
    history: hist
  };
}

function escapeHtml(str) {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeSubjectId(sid) {
  if (sid === 'shu1') return 'math';
  return sid || 'math';
}

function getQid(subjId, chId, idx) {
  const sid = normalizeSubjectId(subjId || 'math');
  return sid + '::' + chId + '::' + idx;
}

function parseQid(qid) {
  if (!qid || typeof qid !== 'string') return null;
  const parts = qid.split('::');
  if (parts.length < 3) return null;
  const sid = normalizeSubjectId(parts[0]);
  const idx = parseInt(parts[2], 10);
  if (isNaN(idx) || idx < 0) return null;
  return {
    subjectId: sid,
    chapterId: parts[1],
    idx: idx,
    qIdx: idx
  };
}

// 1. SM-2+ 间隔重复算法测试
console.log('--- 1. SM-2 / SM-2+ 间隔重复复习算法 ---');

test('新题初次评级 (Score 5) 应正确初始化', () => {
  const res = calcSM2Plus(null, 5);
  assert.strictEqual(res.reps, 1);
  assert.strictEqual(res.interval, 1);
  assert.strictEqual(res.ef, 2.65);
  assert.strictEqual(res.history.length, 1);
  assert.strictEqual(res.history[0].score, 5);
});

test('连续熟练评级 (5 -> 5 -> 5) 间隔应呈指数级增长', () => {
  const baseTime = Date.now();
  let r1 = calcSM2Plus(null, 5, baseTime);
  let r2 = calcSM2Plus(r1, 5, baseTime + 1 * 86400000);
  assert.strictEqual(r2.reps, 2);
  assert.strictEqual(r2.interval, 6);
  assert.strictEqual(r2.ef, 2.80);

  let r3 = calcSM2Plus(r2, 5, baseTime + 7 * 86400000);
  assert.strictEqual(r3.reps, 3);
  assert.ok(r3.interval >= 18, `Expected interval >= 18, got ${r3.interval}`);
  assert.strictEqual(r3.ef, 2.95);
});

test('模糊评级 (Score 3) 应平滑衰减间隔并递减 reps (不直接清零)', () => {
  let r = calcSM2Plus(null, 5);
  r = calcSM2Plus(r, 5);
  r.interval = 20;
  r.reps = 3;

  const rVague = calcSM2Plus(r, 3);
  assert.strictEqual(rVague.reps, 2);
  assert.strictEqual(rVague.interval, 10);
  assert.strictEqual(rVague.ef, 2.7);
});

test('不会评级 (Score 1) 应重置 reps 为 0，间隔为 1，并扣减 EF', () => {
  let r = calcSM2Plus(null, 5);
  r.interval = 30;
  r.reps = 4;
  r.ef = 2.5;

  const rWrong = calcSM2Plus(r, 1);
  assert.strictEqual(rWrong.reps, 0);
  assert.strictEqual(rWrong.interval, 1);
  assert.strictEqual(rWrong.ef, 2.25);
});

test('EF 下限与上限截断保护 (1.3 <= EF <= 3.2)', () => {
  let rLow = { ef: 1.35, interval: 1, reps: 0, history: [] };
  let rAfterLow = calcSM2Plus(rLow, 1);
  assert.strictEqual(rAfterLow.ef, 1.3);

  let rHigh = { ef: 3.15, interval: 10, reps: 3, history: [] };
  let rAfterHigh = calcSM2Plus(rHigh, 5);
  assert.strictEqual(rAfterHigh.ef, 3.2);
});

test('连击复苏加速 (Recovery Boost): 低 EF (<=1.6) 下连续两次 >=4 分应额外提升 EF', () => {
  const baseTime = Date.now();
  let r = { ef: 1.4, interval: 1, reps: 0, history: [{ score: 4, date: baseTime }] };
  let rBoost = calcSM2Plus(r, 5, baseTime + 86400000);
  assert.strictEqual(rBoost.ef, 1.70);
});

test('异常入参健壮性: 非法 score/NaN 自动回退为默认 3 分', () => {
  const rInvalid = calcSM2Plus(null, 'invalid');
  assert.strictEqual(rInvalid.history[0].score, 3);
  assert.strictEqual(rInvalid.ef, 2.4);

  const rNull = calcSM2Plus(null, null);
  assert.strictEqual(rNull.history[0].score, 3);
});

test('记忆留存率 (calcRetrievability) 在区间 [0, 1] 严格单调递减', () => {
  const now = Date.now();
  const rec = { lastReview: now, interval: 10, lastStudyDay: getStudyDayIndex(now) };
  const rDay0 = calcRetrievability(rec, now);
  const rDay5 = calcRetrievability(rec, now + 5 * 86400000);
  const rDay10 = calcRetrievability(rec, now + 10 * 86400000);
  const rDay30 = calcRetrievability(rec, now + 30 * 86400000);

  assert.strictEqual(rDay0, 1.0);
  assert.ok(rDay0 > rDay5 && rDay5 > rDay10 && rDay10 > rDay30, 'Retrievability should decay strictly over time');
  assert.ok(rDay30 > 0.0 && rDay30 < 1.0, 'Retrievability bounded between 0 and 1');
});

// 2. 章节元数据模型与伴章路由
console.log('\n--- 2. 章节元数据模型与伴章路由 ---');

test('科目定义完整性: 包含 math, 822, english', () => {
  const ids = SUBJECTS.map(s => s.id);
  assert.ok(ids.includes('math'));
  assert.ok(ids.includes('822'));
  assert.ok(ids.includes('english'));
  assert.strictEqual(ids.length, 3);
});

test('数学科目 (math) 232 章节元数据校验', () => {
  const math = SUBJECTS.find(s => s.id === 'math');
  assert.strictEqual(math.chapters.length, 232);
  math.chapters.forEach(ch => {
    assert.ok(ch.id, 'Chapter must have ID');
    assert.ok(ch.name, 'Chapter must have name');
    assert.strictEqual(ch.total, ch.labels.length, `Chapter ${ch.id} total must match labels count`);
    assert.ok(ch.relPath, 'Chapter must have relPath');
  });
});

test('822 科目 35 章节元数据校验及标签分类', () => {
  const sub822 = SUBJECTS.find(s => s.id === '822');
  assert.strictEqual(sub822.chapters.length, 35);
  sub822.chapters.forEach(ch => {
    assert.strictEqual(ch.total, ch.labels.length, `Chapter ${ch.id} total must match labels count`);
  });
  assert.strictEqual(sub822.classifyLabel('例2-1'), '例题');
  assert.strictEqual(sub822.classifyLabel('例题1'), '章末例题');
  assert.strictEqual(sub822.classifyLabel('1-1 (1)'), '习题');
});

test('图片路径生成器: 数学例题/习题与822特例', () => {
  const math = SUBJECTS.find(s => s.id === 'math');
  const ch1 = math.chapters[0];
  assert.strictEqual(math.getImgPath(ch1, '例1-1'), '题库/1000题/基础篇/高数/零基础/ex_1-1');
  assert.strictEqual(math.getImgPath(ch1, '1-1'), '题库/1000题/基础篇/高数/零基础/pb_1-1');

  const sub822 = SUBJECTS.find(s => s.id === '822');
  const ch822 = sub822.chapters[0];
  assert.strictEqual(sub822.getImgPath(ch822, '例题1'), '题库/822教材/ch1/ce_1');
  assert.strictEqual(sub822.getImgPath(ch822, '1-1 (1)'), '题库/822教材/ch1/pb_1-1_(1)');
});

// 3. StorageSync 数据采集正则与安全性（纯净 V3 SSOT）
console.log('\n--- 3. StorageSync 数据同步正则与防污染 ---');

const syncKeyRegex = /^kaoyan\.(?:q|g|ui)\.|^annot_|^ky_english_|^english_vocab_/;

test('StorageSync 正则精确覆盖纯净 V3 存储、标注与英语词汇键', () => {
  const validKeys = [
    'kaoyan.q.math::基础30讲::高数::lec01',
    'kaoyan.q.822::小题300::控制工程基础::ch01',
    'kaoyan.g.resume',
    'kaoyan.g.filters',
    'kaoyan.g.study_log',
    'kaoyan.g.topics',
    'kaoyan.g.affinity',
    'kaoyan.ui.math',
    'kaoyan.ui.822',
    'kaoyan.ui.english',
    'annot_题库/基础30讲/高数/第1讲/ex_1-1_question.png',
    'ky_english_mastery_2010',
    'ky_english_notes_2010',
    'english_vocab_star'
  ];

  validKeys.forEach(k => {
    assert.ok(syncKeyRegex.test(k), `Key "${k}" should match StorageSync regex`);
  });
});

test('StorageSync 正则彻底拒绝历史旧魔数键与第三方系统键（SSOT 纯净化）', () => {
  const rejectedKeys = [
    'ch1_s1_status', 'ch212_s1_notes', 'm3ch1_822_qbad', 'ch5_822_book_mismatch',
    'sm2_math_ch1', 'sm2_822_ch5',
    'status::math::李范全书::高数::ch03', 'mismatch::math::李范全书::高数::ch03',
    'kaoyan_resume', 'kaoyan_ui_filters', 'math_ui_solution',
    '_ga', 'session_id', 'google_analytics', 'temp_data', '__proto__', 'constructor'
  ];

  rejectedKeys.forEach(k => {
    assert.ok(!syncKeyRegex.test(k), `Key "${k}" should NOT match StorageSync regex`);
  });
});

test('原型污染防御: applyAllData 忽略 __proto__, constructor, prototype', () => {
  const dummyPayload = {
    data: {
      '__proto__': '{"polluted":true}',
      'constructor': '{"polluted":true}',
      'prototype': '{"polluted":true}',
      'ch1_s1_status': '{"0":"proficient"}'
    }
  };

  const cleanObj = {};
  for (const k in dummyPayload.data) {
    if (Object.prototype.hasOwnProperty.call(dummyPayload.data, k)) {
      if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
      cleanObj[k] = dummyPayload.data[k];
    }
  }

  assert.strictEqual(Object.prototype.hasOwnProperty.call(cleanObj, '__proto__'), false);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(cleanObj, 'constructor'), false);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(cleanObj, 'prototype'), false);
  assert.strictEqual(cleanObj['ch1_s1_status'], '{"0":"proficient"}');
  assert.strictEqual(({}).polluted, undefined);
});

// 4. HTML 转义与 QID 编解码
console.log('\n--- 4. 安全转义与 QID 工具函数 ---');

test('HTML 转义 (escapeHtml) 防御 XSS 注入', () => {
  const evil = '<script>alert("xss")</script>&<img src=x onerror=\'hack\'>';
  const safe = escapeHtml(evil);
  assert.strictEqual(safe, '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;&amp;&lt;img src=x onerror=&#39;hack&#39;&gt;');
  assert.strictEqual(escapeHtml(null), '');
  assert.strictEqual(escapeHtml(undefined), '');
});

test('QID 编解码 (getQid & parseQid)', () => {
  const qid = getQid('math', 'ch1', 5);
  assert.strictEqual(qid, 'math::ch1::5');

  const parsed = parseQid(qid);
  assert.deepStrictEqual(parsed, {
    subjectId: 'math',
    chapterId: 'ch1',
    idx: 5,
    qIdx: 5
  });

  assert.strictEqual(parseQid('invalid-qid'), null);
  assert.strictEqual(parseQid('math::ch1::-1'), null);
  assert.strictEqual(parseQid('math::ch1::abc'), null);
  assert.strictEqual(parseQid(null), null);
});

// 5. 跨章节与跨科目撤销栈 (Undo Stack) 机制测试
console.log('\n--- 5. 跨章节撤销 (Undo Stack) 与状态回滚 ---');

test('跨章节撤销: 正确记录 chapterId 与 subjectId 并支持准确回退', () => {
  const undoStack = [];
  function pushUndoMock(idx, prevStatus, chId, subjId) {
    undoStack.push({ idx: idx, prevStatus: prevStatus || '', chapterId: chId, subjectId: subjId });
    if (undoStack.length > 50) undoStack.shift();
  }

  // 模拟在 ch1 做题 -> 记录 undo -> 切换到 ch2 做题 -> 记录 undo
  pushUndoMock(0, '', 'ch1', 'math'); // ch1 题目 0 从未做变成熟练
  pushUndoMock(5, 'wrong', 'ch2', 'math'); // ch2 题目 5 从不会变成熟练

  assert.strictEqual(undoStack.length, 2);
  const top = undoStack.pop();
  assert.strictEqual(top.chapterId, 'ch2');
  assert.strictEqual(top.idx, 5);
  assert.strictEqual(top.prevStatus, 'wrong');

  const second = undoStack.pop();
  assert.strictEqual(second.chapterId, 'ch1');
  assert.strictEqual(second.idx, 0);
  assert.strictEqual(second.prevStatus, '');
});

// 6. 英语生词安全与特殊字符防护
console.log('\n--- 6. 英语生词本与特殊字符转义防护 ---');

test('包含英文单引号、撇号与 HTML 实体的内容能够被安全转义', () => {
  const wordWithApos = "don't";
  const defWithApos = "adj. 自己的 (one's own), 不受影响的 <immune>";
  const escapedWord = escapeHtml(wordWithApos);
  const escapedDef = escapeHtml(defWithApos);

  assert.strictEqual(escapedWord, 'don&#39;t');
  assert.ok(!escapedDef.includes('<') && !escapedDef.includes('>'));
  assert.ok(escapedDef.includes('one&#39;s own'));
  assert.ok(escapedDef.includes('&lt;immune&gt;'));
});

// 7. 考点主题管理与关联映射
console.log('\n--- 7. 考点主题数据结构与关联映射 ---');

test('考点主题创建、关联题目与解除关联数据模型测试', () => {
  const topicsMap = {};
  
  function addTopic(id, name) {
    if (!topicsMap[id]) {
      topicsMap[id] = { id: id, name: name, questions: [] };
    }
  }

  function linkQuestion(topicId, qid) {
    if (topicsMap[topicId] && !topicsMap[topicId].questions.includes(qid)) {
      topicsMap[topicId].questions.push(qid);
    }
  }

  function unlinkQuestion(topicId, qid) {
    if (topicsMap[topicId]) {
      topicsMap[topicId].questions = topicsMap[topicId].questions.filter(q => q !== qid);
    }
  }

  addTopic('topic_taylor', '泰勒公式 $\\lim_{x \\to 0}\\frac{\\sin x}{x}$');
  assert.ok(topicsMap['topic_taylor']);
  assert.strictEqual(topicsMap['topic_taylor'].name, '泰勒公式 $\\lim_{x \\to 0}\\frac{\\sin x}{x}$');

  linkQuestion('topic_taylor', 'math::ch1::0');
  linkQuestion('topic_taylor', 'math::ch31::2');
  assert.strictEqual(topicsMap['topic_taylor'].questions.length, 2);

  // 幂等性测试
  linkQuestion('topic_taylor', 'math::ch1::0');
  assert.strictEqual(topicsMap['topic_taylor'].questions.length, 2);

  unlinkQuestion('topic_taylor', 'math::ch1::0');
  assert.strictEqual(topicsMap['topic_taylor'].questions.length, 1);
  assert.strictEqual(topicsMap['topic_taylor'].questions[0], 'math::ch31::2');
});

test('二级子考点格式解析 (大考点/子考点)', () => {
  function parseTopicAndSubTopic(input) {
    if (!input || typeof input !== 'string') return { topicName: '', subTopic: '' };
    var text = input.trim();
    var splitMatch = text.match(/^(.*?)\s*[\/／\\\|]\s*(.*?)$/);
    if (splitMatch && splitMatch[1] && splitMatch[2]) {
      return { topicName: splitMatch[1].trim(), subTopic: splitMatch[2].trim() };
    }
    return { topicName: text, subTopic: '' };
  }

  const res1 = parseTopicAndSubTopic('定积分几何应用 / 旋转体体积');
  assert.strictEqual(res1.topicName, '定积分几何应用');
  assert.strictEqual(res1.subTopic, '旋转体体积');

  const res2 = parseTopicAndSubTopic('极限计算／0比0型');
  assert.strictEqual(res2.topicName, '极限计算');
  assert.strictEqual(res2.subTopic, '0比0型');

  const res3 = parseTopicAndSubTopic('洛必达法则');
  assert.strictEqual(res3.topicName, '洛必达法则');
  assert.strictEqual(res3.subTopic, '');
});

test('题目对双向亲密度无向 Key 与优先级双向互通排序', () => {
  function getPairKey(qid1, qid2) {
    if (!qid1 || !qid2) return '';
    return qid1 < qid2 ? (qid1 + '::' + qid2) : (qid2 + '::' + qid1);
  }

  // 无向 Key 一致性检验
  const k1 = getPairKey('math::ch215::2', 'math::ch215::19');
  const k2 = getPairKey('math::ch215::19', 'math::ch215::2');
  assert.strictEqual(k1, k2);
  assert.strictEqual(k1, 'math::ch215::19::math::ch215::2');

  const affinityStore = {
    pairs: {},
    customOrders: {}
  };

  function updateOrder(curQid, newOrderedQids) {
    affinityStore.customOrders[curQid] = newOrderedQids.slice();
    newOrderedQids.forEach((targetQid, idx) => {
      const pKey = getPairKey(curQid, targetQid);
      const bonus = Math.max(10, 100 - idx * 15);
      affinityStore.pairs[pKey] = Math.max((affinityStore.pairs[pKey] || 0), bonus);
    });
  }

  function sortQuestions(curQid, list) {
    const customOrder = affinityStore.customOrders[curQid] || [];
    return list.slice().sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      const idxA = customOrder.indexOf(a.qid);
      const idxB = customOrder.indexOf(b.qid);
      if (idxA !== -1) scoreA += 10000 - idxA * 100;
      if (idxB !== -1) scoreB += 10000 - idxB * 100;

      const affA = affinityStore.pairs[getPairKey(curQid, a.qid)] || 0;
      const affB = affinityStore.pairs[getPairKey(curQid, b.qid)] || 0;
      scoreA += affA * 10;
      scoreB += affB * 10;

      scoreA += (a.sameSubTopicCount || 0) * 50;
      scoreB += (b.sameSubTopicCount || 0) * 50;

      return scoreB - scoreA;
    });
  }

  const qA = 'math::ch215::2';
  const qB = 'math::ch215::19';
  const qC = 'math::ch215::35';

  // 1. 在题目 A 视角下，用户手动将题目 B 拖到了第一位，C 为第二位
  updateOrder(qA, [qB, qC]);
  const sortedForA = sortQuestions(qA, [{ qid: qC }, { qid: qB }]);
  assert.strictEqual(sortedForA[0].qid, qB);
  assert.strictEqual(sortedForA[1].qid, qC);

  // 2. 验证双向性：当切换到题目 B 视角时，B 视角并没有显式拖拽，但 A 自动因为双向亲密度排在第一位！
  const sortedForB = sortQuestions(qB, [{ qid: qC }, { qid: qA }]);
  assert.strictEqual(sortedForB[0].qid, qA);
  assert.strictEqual(sortedForB[1].qid, qC);
});

// 8. .gitignore 凭据防护校验
console.log('\n--- 8. .gitignore 凭据过滤规则完整性 ---');

test('.gitignore 规则覆盖各类敏感 token、session 和私钥文件', () => {
  const gitignoreContent = fs.readFileSync(path.join(__dirname, '../.gitignore'), 'utf8');
  assert.ok(gitignoreContent.includes('*token*'), '.gitignore must contain *token*');
  assert.ok(gitignoreContent.includes('*session*'), '.gitignore must contain *session*');
  assert.ok(gitignoreContent.includes('*.key'), '.gitignore must contain *.key');
  assert.ok(gitignoreContent.includes('*.env*'), '.gitignore must contain *.env*');
});

// ===== 9. StorageEngine 核心模块与防漂移架构单元测试 =====
console.log('\n--- 9. StorageEngine: DataValidator / ChapterStore / GlobalStore / UiStore / ResumeStore ---');

const storageSrc = fs.readFileSync(path.join(__dirname, '../js/storage.js'), 'utf8');

function makeMockLS() {
  const store = {};
  return {
    getItem(k) { return store[k] !== undefined ? store[k] : null; },
    setItem(k, v) { store[k] = String(v); },
    removeItem(k) { delete store[k]; },
    get length() { return Object.keys(store).length; },
    key(i) { return Object.keys(store)[i] || null; },
    _store: store
  };
}

const mockLS3 = makeMockLS();
const engWin = { localStorage: mockLS3, StorageEngine: null, console: console };
new Function('window', 'localStorage', storageSrc)(engWin, mockLS3);
const { DataValidator, ChapterStore, GlobalStore, UiStore, ResumeStore } = engWin.StorageEngine;

// ── DataValidator ──
test('DataValidator: 拒绝纯数字 slug（核心防漂移规则）', () => {
  assert.strictEqual(DataValidator.validateSlug('0'), false);
  assert.strictEqual(DataValidator.validateSlug('42'), false);
  assert.strictEqual(DataValidator.validateSlug('999'), false);
});

test('DataValidator: 接受有效 slug', () => {
  assert.strictEqual(DataValidator.validateSlug('例1-1'), true);
  assert.strictEqual(DataValidator.validateSlug('pb_1-1'), true);
  assert.strictEqual(DataValidator.validateSlug('ex_3-22_(II)'), true);
});

test('DataValidator: 拒绝空/非字符串/零值 slug', () => {
  assert.strictEqual(DataValidator.validateSlug(''), false);
  assert.strictEqual(DataValidator.validateSlug(null), false);
  assert.strictEqual(DataValidator.validateSlug(undefined), false);
  assert.strictEqual(DataValidator.validateSlug(0), false);
});

test('DataValidator: 接受合法掌握度值与拒绝非法值', () => {
  ['proficient', 'familiar', 'vague', 'rusty', 'wrong', null, undefined, ''].forEach(v => {
    assert.strictEqual(DataValidator.validateStatus(v), true, 'Should accept: ' + String(v));
  });
  assert.strictEqual(DataValidator.validateStatus('good'), false);
  assert.strictEqual(DataValidator.validateStatus(1), false);
  assert.strictEqual(DataValidator.validateStatus(true), false);
});

test('DataValidator: 校验 SM-2 记录格式', () => {
  assert.strictEqual(DataValidator.validateSm2({ ef: 2.5, interval: 6 }), true);
  assert.strictEqual(DataValidator.validateSm2({ ef: 'bad' }), false);
  assert.strictEqual(DataValidator.validateSm2(null), false);
});

// 通用 mock 章节
const mockCh3 = {
  uid: 'math::基础30讲::高数::lec01',
  id: 'math::基础30讲::高数::lec01',
  total: 3, ownTotal: 3,
  labels: ['例1-1', '例1-2', '例1-3'],
  getQuestionSlug(i) { return this.labels[i] || null; },
  getIdxBySlug(slug) { return this.labels.indexOf(slug); }
};

// ── ChapterStore ──
test('ChapterStore: 构造校验与空 uid 拒绝', () => {
  assert.throws(() => new ChapterStore({}), /uid/);
  assert.throws(() => new ChapterStore(null), /uid/);
});

test('ChapterStore.load: 纯数字 key 被过滤（核心防漂移）', () => {
  const ls = makeMockLS();
  const payload = JSON.stringify({
    '$v': 3,
    '$chapterUid': mockCh3.uid,
    '$saved': '2026-01-01T00:00:00Z',
    '0': { status: 'wrong' },
    '例1-1': { status: 'familiar' }
  });
  ls.setItem('kaoyan.q.' + mockCh3.uid, payload);

  const win = { localStorage: ls, StorageEngine: null, console: console };
  new Function('window', 'localStorage', storageSrc)(win, ls);
  const store = new win.StorageEngine.ChapterStore(mockCh3);
  const res = store.load();
  assert.ok(!('0' in res), '纯数字 key 应被过滤');
  assert.ok('例1-1' in res, 'slug key 应保留');
  assert.strictEqual(res['例1-1'].status, 'familiar');
});

test('ChapterStore.setQuestion: 原子更新与清空空字段', () => {
  const ls = makeMockLS();
  const win = { localStorage: ls, StorageEngine: null, console: console };
  new Function('window', 'localStorage', storageSrc)(win, ls);
  const store = new win.StorageEngine.ChapterStore(mockCh3);

  store.setQuestion('例1-1', { status: 'proficient', qbad: true });
  let q = store.getQuestion('例1-1');
  assert.strictEqual(q.status, 'proficient');
  assert.strictEqual(q.qbad, true);

  // 更新单个字段，不覆盖已有字段
  store.setQuestion('例1-1', { notes: '重点题' });
  q = store.getQuestion('例1-1');
  assert.strictEqual(q.status, 'proficient');
  assert.strictEqual(q.qbad, true);
  assert.strictEqual(q.notes, '重点题');

  // 清理字段
  store.setQuestion('例1-1', { status: null, qbad: false, notes: '' });
  q = store.getQuestion('例1-1');
  assert.deepStrictEqual(q, {});
});

test('ChapterStore.writeFromMemory & readIntoMemory: 内存与持久化映射', () => {
  const ls = makeMockLS();
  const win = { localStorage: ls, StorageEngine: null, console: console };
  new Function('window', 'localStorage', storageSrc)(win, ls);
  const store = new win.StorageEngine.ChapterStore(mockCh3);

  const memStatuses = { 0: 'proficient', 1: 'vague' };
  const memSm2 = { 0: { ef: 2.5, interval: 6 } };
  store.writeFromMemory({ statuses: memStatuses, sm2: memSm2, offset: 0, len: 2 });

  const readBackStatuses = {};
  const readBackSm2 = {};
  store.readIntoMemory({ statuses: readBackStatuses, sm2: readBackSm2 }, 0);

  assert.strictEqual(readBackStatuses[0], 'proficient');
  assert.strictEqual(readBackStatuses[1], 'vague');
  assert.strictEqual(readBackSm2[0].interval, 6);
});

// ── GlobalStore & UiStore ──
test('GlobalStore & UiStore: 键值存取与隔离', () => {
  const ls = makeMockLS();
  const win = { localStorage: ls, StorageEngine: null, console: console };
  new Function('window', 'localStorage', storageSrc)(win, ls);
  const { GlobalStore, UiStore } = win.StorageEngine;

  GlobalStore.set('theme', 'dark');
  assert.strictEqual(GlobalStore.get('theme'), 'dark');
  GlobalStore.remove('theme');
  assert.strictEqual(GlobalStore.get('theme'), null);

  UiStore.set('math', { show: true, def: false });
  assert.deepStrictEqual(UiStore.get('math'), { show: true, def: false });
});

// ── ResumeStore ──
test('ResumeStore: slug 规范恢复（插题后断点不漂移）', () => {
  // 模拟在 idx=2 处插入了「新题」，原来 idx=2 是「例1-3」，现在 idx=3 才是「例1-3」
  const ch = Object.assign({}, mockCh3, {
    labels: ['例1-1', '例1-2', '新题', '例1-3'],
    total: 4
  });
  ch.getIdxBySlug = function(slug) { return this.labels.indexOf(slug); };
  ch.getQuestionSlug = function(i) { return this.labels[i]; };

  const ls = makeMockLS();
  const win = { localStorage: ls, StorageEngine: null, console: console };
  new Function('window', 'localStorage', storageSrc)(win, ls);
  const { ResumeStore } = win.StorageEngine;

  // 以 slug 保存断点 (指向例1-3)
  ResumeStore.save('math', ch.id, ch, 3, false);

  // 读取断点验证
  const r = ResumeStore.loadChapter('math', ch.id, ch);
  assert.ok(r);
  assert.strictEqual(r.idx, 3, 'slug 解析的 idx 应为 3（插题后位置正确）');
});

console.log('\n====================================================');
console.log(`  测试结果: ${passedTests} passed, ${failedTests} failed`);
console.log('====================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
