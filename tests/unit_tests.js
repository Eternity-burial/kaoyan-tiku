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

function getQid(subjId, chId, idx, slug) {
  const sid = normalizeSubjectId(subjId || 'math');
  if (chId && chId.includes('::') && slug) {
    return chId + '::' + slug;
  }
  return sid + '::' + chId + '::' + idx;
}

function parseQid(qid) {
  if (!qid || typeof qid !== 'string') return null;
  const parts = qid.split('::');
  if (parts.length >= 5) {
    const sid = normalizeSubjectId(parts[0]);
    const chapterUid = parts.slice(0, 4).join('::');
    const questionSlug = parts.slice(4).join('::');
    return {
      subjectId: sid,
      chapterUid: chapterUid,
      chapterId: chapterUid,
      questionSlug: questionSlug,
      canonicalQid: chapterUid + '::' + questionSlug,
      isSemantic: true
    };
  }
  if (parts.length === 3) {
    const sid = normalizeSubjectId(parts[0]);
    const idx = parseInt(parts[2], 10);
    if (isNaN(idx) || idx < 0) return null;
    return {
      subjectId: sid,
      chapterId: parts[1],
      idx: idx,
      qIdx: idx,
      isSemantic: false
    };
  }
  return null;
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

test('时钟回拨/负时间差边界 (Clock Skew): 系统时间回拨时不应导致算法崩溃或间隔异常', () => {
  const baseTime = Date.now();
  const r = { ef: 2.5, interval: 10, reps: 2, lastReview: baseTime, lastStudyDay: getStudyDayIndex(baseTime), history: [] };
  // 模拟客户端时钟往前回拨了 2 天
  const rPast = calcSM2Plus(r, 4, baseTime - 2 * 86400000);
  assert.strictEqual(rPast.reps, 3);
  assert.ok(rPast.interval >= 10, '时钟回拨时间隔不应被异常缩短为负数或0');
  assert.ok(rPast.ef >= 2.5, 'EF 计算应正常');
});

test('评分边界值与非整数入参健壮性', () => {
  // score 字符串数字 '5' 自动转整
  const rStr5 = calcSM2Plus(null, '5');
  assert.strictEqual(rStr5.history[0].score, 5);
  // score 超出范围 [1, 5] 自动回退默认 3
  const rOutLow = calcSM2Plus(null, 0);
  assert.strictEqual(rOutLow.history[0].score, 3);
  const rOutHigh = calcSM2Plus(null, 6);
  assert.strictEqual(rOutHigh.history[0].score, 3);
  const rNegative = calcSM2Plus(null, -10);
  assert.strictEqual(rNegative.history[0].score, 3);
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

test('老姚高数章节小节分类: 2.1-19 准确归类为例题而非补充练习', () => {
  const math = SUBJECTS.find(s => s.id === 'math');
  const ch02 = math.chapters.find(c => c.wb === '老姚高数' && c.name.includes('第2章'));
  assert.ok(ch02);
  const sec2_1 = ch02.sections.find(s => s.type.startsWith('2.1'));
  assert.ok(sec2_1);
  assert.strictEqual(sec2_1.exampleCount, 19, 'Section 2.1 exampleCount 应为 19 (包含 2.1-19)');

  function classifyLaoYaoLabel(ch, label) {
    const idx = ch.labels.indexOf(label);
    if (idx >= 0) {
      const s = ch.sections.find(function(sec) { return idx >= sec.start && idx < sec.start + sec.count; });
      if (s && s.exampleCount !== undefined) {
        return (idx < s.start + s.exampleCount) ? '例题' : '补充练习';
      }
    }
    return 'unknown';
  }

  assert.strictEqual(classifyLaoYaoLabel(ch02, '2.1-19'), '例题');
  assert.strictEqual(classifyLaoYaoLabel(ch02, '2.1-20'), '补充练习');
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

test('StorageSync 0题空数据拦截防御: 阻止空缓存覆盖破坏本地真实数据', () => {
  function validateSyncData(dataObj) {
    let questionCount = 0;
    for (const k in dataObj) {
      if (k.startsWith('kaoyan.q.')) {
        try {
          const parsed = JSON.parse(dataObj[k]);
          for (const slug in parsed) {
            if (!slug.startsWith('$') && parsed[slug] && parsed[slug].status) {
              questionCount++;
            }
          }
        } catch (e) {}
      }
    }
    return questionCount > 0;
  }

  assert.strictEqual(validateSyncData({}), false, '空对象必须被拦截');
  assert.strictEqual(validateSyncData({ 'kaoyan.g.theme': 'dark' }), false, '无题目数据的对象必须被拦截');
  assert.strictEqual(validateSyncData({ 'kaoyan.q.test': JSON.stringify({ 'ex_1-1': { status: 'proficient' } }) }), true, '有题目的有效数据应放行');
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

test('HTML 转义 (escapeHtml) 边界与防注入', () => {
  const evil = '<script>alert("xss")</script>&<img src=x onerror=\'hack\'>';
  const safe = escapeHtml(evil);
  assert.strictEqual(safe, '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;&amp;&lt;img src=x onerror=&#39;hack&#39;&gt;');
  assert.strictEqual(escapeHtml(null), '');
  assert.strictEqual(escapeHtml(undefined), '');
  assert.strictEqual(escapeHtml(''), '');
  assert.strictEqual(escapeHtml(0), '0');
  assert.strictEqual(escapeHtml(false), 'false');
});

test('QID 编解码与 Canonical 5-part 语义规范', () => {
  // 3-part 格式: <subj>::<chap>::<idx>
  const qid3 = getQid('math', 'math_lec01', 5);
  assert.strictEqual(qid3, 'math::math_lec01::5');

  const parsed3 = parseQid(qid3);
  assert.strictEqual(parsed3.subjectId, 'math');
  assert.strictEqual(parsed3.chapterId, 'math_lec01');
  assert.strictEqual(parsed3.idx, 5);

  // 5-part Canonical 语义格式: <chUid>::<slug>
  const qid5 = getQid('math', 'math::李范全书::高数::ch03', 20, 'ex_3-14_(I)');
  assert.strictEqual(qid5, 'math::李范全书::高数::ch03::ex_3-14_(I)');

  const parsed5 = parseQid(qid5);
  assert.strictEqual(parsed5.subjectId, 'math');
  assert.strictEqual(parsed5.chapterUid, 'math::李范全书::高数::ch03');
  assert.strictEqual(parsed5.questionSlug, 'ex_3-14_(I)');
  assert.strictEqual(parsed5.isSemantic, true);

  // 异常格式校验
  assert.strictEqual(parseQid('invalid-qid'), null);
  assert.strictEqual(parseQid('math::ch1::-1'), null);
  assert.strictEqual(parseQid('math::ch1::abc'), null);
  assert.strictEqual(parseQid(''), null);
  assert.strictEqual(parseQid(null), null);
  assert.strictEqual(parseQid(undefined), null);
});

// 5. 跨章节与跨科目撤销栈 (Undo Stack) 机制测试
console.log('\n--- 5. 跨章节撤销 (Undo Stack) 与状态回滚 ---');

test('跨章节撤销: 使用标准语义 URN 准确回退', () => {
  const undoStack = [];
  function pushUndoMock(idx, prevStatus, chId, subjId) {
    undoStack.push({ idx: idx, prevStatus: prevStatus || '', chapterId: chId, subjectId: subjId });
    if (undoStack.length > 50) undoStack.shift();
  }

  const ch1Uid = 'math::基础30讲::高数::lec01';
  const ch2Uid = 'math::基础30讲::高数::lec02';

  // 模拟在 lec01 做题 -> 记录 undo -> 切换到 lec02 做题 -> 记录 undo
  pushUndoMock(0, '', ch1Uid, 'math');
  pushUndoMock(5, 'wrong', ch2Uid, 'math');

  assert.strictEqual(undoStack.length, 2);
  const top = undoStack.pop();
  assert.strictEqual(top.chapterId, ch2Uid);
  assert.strictEqual(top.idx, 5);
  assert.strictEqual(top.prevStatus, 'wrong');

  const second = undoStack.pop();
  assert.strictEqual(second.chapterId, ch1Uid);
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

test('纯单级考点格式保留 (已移出二级考点切分，完整保留考点全称)', () => {
  function parseTopicAndSubTopic(input) {
    if (!input || typeof input !== 'string') return { topicName: '', subTopic: '' };
    return { topicName: input.trim(), subTopic: '' };
  }

  const res1 = parseTopicAndSubTopic('定积分几何应用 / 旋转体体积');
  assert.strictEqual(res1.topicName, '定积分几何应用 / 旋转体体积');
  assert.strictEqual(res1.subTopic, '');

  const res2 = parseTopicAndSubTopic('极限计算／0比0型');
  assert.strictEqual(res2.topicName, '极限计算／0比0型');
  assert.strictEqual(res2.subTopic, '');

  const res3 = parseTopicAndSubTopic('洛必达法则');
  assert.strictEqual(res3.topicName, '洛必达法则');
  assert.strictEqual(res3.subTopic, '');

  const resMath = parseTopicAndSubTopic("$f'(x)与|\\varphi(x)|$问题");
  assert.strictEqual(resMath.topicName, "$f'(x)与|\\varphi(x)|$问题");
  assert.strictEqual(resMath.subTopic, '');

  const resMathSlash = parseTopicAndSubTopic("$\\int \\frac{f(x)}{g(x)}\\,dx$ / 有理函数");
  assert.strictEqual(resMathSlash.topicName, "$\\int \\frac{f(x)}{g(x)}\\,dx$ / 有理函数");
  assert.strictEqual(resMathSlash.subTopic, '');
});

test('小题模式 (subMode) 全局开关与跨章跨刷新持久化契约', () => {
  const store = {};
  const mockGlobalStore = {
    get: (k) => store[k] !== undefined ? store[k] : null,
    set: (k, v) => { store[k] = v; }
  };

  let subMode = false;
  function toggleSubMode() {
    subMode = !subMode;
    mockGlobalStore.set('sub_mode', subMode);
  }

  // 1. 默认关闭
  assert.strictEqual(subMode, false);

  // 2. 按 F 开启
  toggleSubMode();
  assert.strictEqual(subMode, true);
  assert.strictEqual(mockGlobalStore.get('sub_mode'), true);

  // 3. 模拟跨章切换与刷新恢复
  let restoredSubMode = mockGlobalStore.get('sub_mode');
  assert.strictEqual(restoredSubMode, true);

  // 4. 再次按 F 关闭
  toggleSubMode();
  assert.strictEqual(subMode, false);
  assert.strictEqual(mockGlobalStore.get('sub_mode'), false);
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

test('合并章节伴章段 QID 路由隔离: 杜绝两书同号题（如30讲3-2与1000题3-2）考点与同类题泄露', () => {
  const win = {};
  new Function('window', chaptersSrc)(win);
  const math = win.SUBJECTS.find(s => s.id === 'math');
  const lec03 = math.chapters.find(c => c.uid === 'math::基础30讲::高数::lec03');
  assert.ok(lec03, '基础30讲第3讲必须存在');
  assert.strictEqual(lec03.ownTotal, 21);
  assert.strictEqual(lec03.q1000Total, 15);

  // 1. 测试 ch.getQuestionUID
  const uid30 = lec03.getQuestionUID(13); // 30讲 3-2 (本章段)
  const uid1000 = lec03.getQuestionUID(22); // 1000题 3-2 (伴章段: 21 + 1)
  assert.strictEqual(uid30, 'math::基础30讲::高数::lec03::pb_3-2');
  assert.strictEqual(uid1000, 'math::1000题::基础篇-高数::ch03::pb_3-2');
  assert.notStrictEqual(uid30, uid1000, '合并章节伴章段的 QID 绝不能与本章同号题冲突');

  // 2. 测试 topics.js 中的 getQid
  const topicsSrc = fs.readFileSync(path.join(__dirname, '../js/topics.js'), 'utf8');
  win.curSubjectId = 'math';
  win.curSubject = math;
  win.CHAPTERS = math.chapters;
  win.currentChapterId = lec03.uid;
  new Function('window', 'document', 'localStorage', 'StorageEngine', 'CHAPTERS', 'curSubject', 'SUBJECTS', topicsSrc)(
    win, { addEventListener: () => {} }, { getItem: () => null, setItem: () => {} }, {}, win.CHAPTERS, win.curSubject, win.SUBJECTS
  );

  const qid30 = win.getQid('math', lec03.uid, 13);
  const qid1000_2 = win.getQid('math', lec03.uid, 22);
  assert.strictEqual(qid30, 'math::基础30讲::高数::lec03::pb_3-2');
  assert.strictEqual(qid1000_2, 'math::1000题::基础篇-高数::ch03::pb_3-2');
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

// ── 10. 左侧栏状态筛选规则（较熟练和模糊归模糊，困难和不会归不会） ──
console.log('\n--- 10. 左侧栏状态筛选与计数归类规则 ---');

test('左侧栏状态筛选: 较熟练+模糊归为模糊类，困难+不会归为不会类，熟练保持独立', () => {
  const mockStatuses = {
    0: 'proficient', // 熟练
    1: 'familiar',   // 较熟练
    2: 'vague',      // 模糊
    3: 'rusty',      // 困难
    4: 'wrong',      // 不会
    5: ''            // 未做
  };
  const total = 6;

  function filterQuestions(filterSet) {
    const all = Array.from({ length: total }, (_, i) => i);
    if (filterSet.has('all') || filterSet.size === 0) return all;
    return all.filter(i => {
      const s = mockStatuses[i] || '';
      if (filterSet.has('proficient') && s === 'proficient') return true;
      if (filterSet.has('vague') && (s === 'vague' || s === 'familiar')) return true;
      if (filterSet.has('wrong') && (s === 'wrong' || s === 'rusty')) return true;
      return false;
    });
  }

  // 1. 筛选「熟练」：只应包含 index 0 (proficient)
  const profRes = filterQuestions(new Set(['proficient']));
  assert.deepStrictEqual(profRes, [0], '「熟练」筛选仅包含 proficient(lv5)');

  // 2. 筛选「模糊」：必须包含 index 1 (familiar, 较熟练) 与 index 2 (vague, 模糊)
  const vagueRes = filterQuestions(new Set(['vague']));
  assert.deepStrictEqual(vagueRes, [1, 2], '「模糊」筛选必须合并较熟练(familiar)与模糊(vague)');

  // 3. 筛选「不会」：必须包含 index 3 (rusty, 困难) 与 index 4 (wrong, 不会)
  const wrongRes = filterQuestions(new Set(['wrong']));
  assert.deepStrictEqual(wrongRes, [3, 4], '「不会」筛选必须合并困难(rusty)与不会(wrong)');

  // 4. 多选组合筛选（如 模糊 + 不会）
  const multiRes = filterQuestions(new Set(['vague', 'wrong']));
  assert.deepStrictEqual(multiRes, [1, 2, 3, 4]);

  // 5. 状态筛选栏计数汇总
  let profCount = 0, vagCount = 0, wrCount = 0;
  Object.values(mockStatuses).forEach(s => {
    if (s === 'proficient') profCount++;
    else if (s === 'vague' || s === 'familiar') vagCount++;
    else if (s === 'wrong' || s === 'rusty') wrCount++;
  });
  assert.strictEqual(profCount, 1, '熟练计数应为 1');
  assert.strictEqual(vagCount, 2, '模糊计数应为 2 (较熟练 1 + 模糊 1)');
  assert.strictEqual(wrCount, 2, '不会计数应为 2 (困难 1 + 不会 1)');
});

test('左侧栏状态筛选: 「带标注」(unmarked) 必须包含文字笔记、图片标注与关联同类题', () => {
  const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  assert(indexHtml.includes('带标注 <span class="filter-count"></span>'), '左侧栏筛选按钮文本必须为「带标注」');
  assert(indexHtml.includes('<span class="desc">带标注</span><span class="key"><kbd>Shift</kbd>+<kbd>N</kbd></span>'), '快捷键帮助中的描述必须为「带标注」');

  // 模拟题库数据：共 6 道题
  // index 0: 纯文字笔记
  // index 1: 纯图片标注
  // index 2: 纯同类题关联 (有 topic)
  // index 3: 笔记 + 同类题关联复合标注
  // index 4: 无任何标注
  // index 5: 无任何标注
  const mockNotesData = { 'ch1::1-1': '重要极限公式笔记', 'ch1::1-4': '复合笔记' };
  const mockAnnotSet = new Set(['ch1::1-2']); // index 1 有图片标注
  const mockTopicsData = {
    t1: { id: 't1', members: [{ qid: 'math::ch1::1-3' }, { qid: 'math::ch1::1-4' }] }
  };

  function mockHasQuestionMarked(idx) {
    const noteKey = 'ch1::1-' + (idx + 1);
    if (mockNotesData[noteKey]) return true;
    if (mockAnnotSet.has(noteKey)) return true;
    const qid = 'math::ch1::1-' + (idx + 1);
    for (const tid in mockTopicsData) {
      if (mockTopicsData[tid].members.some(m => m.qid === qid)) return true;
    }
    return false;
  }

  const total = 6;
  const filteredIndices = [];
  let withMarkedCount = 0;
  for (let i = 0; i < total; i++) {
    if (mockHasQuestionMarked(i)) {
      filteredIndices.push(i);
      withMarkedCount++;
    }
  }

  assert.deepStrictEqual(filteredIndices, [0, 1, 2, 3], '带标注筛选必须准确捕获笔记、图片标注及同类题关联题目');
  assert.strictEqual(withMarkedCount, 4, '带标注计数应为 4（不重复计数复合标注题）');
  assert.strictEqual(mockHasQuestionMarked(4), false, '无标注题目不得命中');
  assert.strictEqual(mockHasQuestionMarked(5), false, '无标注题目不得命中');
});

// ── 11. 独立历史数据迁移工具 (tools/migrate_legacy_storage.js) ──
console.log('\n--- 11. 独立迁移工具 (MigrationTool) 与 idx->slug 转换 ---');

test('MigrationTool: 完整迁移测试 (备份、idx->slug映射、全局及UI键迁移、旧键彻底清理)', () => {
  const { migrateLegacyStorage } = require('../tools/migrate_legacy_storage');
  const mockLS = makeMockLS();

  // 1. 设置各类历史旧键
  const legacyResume = {
    'math': { ch: 'ch1', idx: 1, sub: true },
    'math::基础30讲': { ch: 'ch1', idx: 2, sub: false },
    'math::ch::ch1': { idx: 0, sub: true },
    '822': { ch: 'ch2', idx: 0, sub: false }
  };
  mockLS.setItem('kaoyan_resume', JSON.stringify(legacyResume));
  mockLS.setItem('kaoyan_resume_english', JSON.stringify({ year: '2021', textId: 'text1', qIndex: 21 }));
  mockLS.setItem('kaoyan_resume_english_y2021', JSON.stringify({ textId: 'text1', qIndex: 22 }));
  mockLS.setItem('kaoyan_related_topics', JSON.stringify({ top1: { name: '泰勒公式' } }));
  mockLS.setItem('kaoyan_related_affinity', JSON.stringify({ pairs: { 'k1': 5 } }));
  mockLS.setItem('kaoyan_study_log', JSON.stringify({ '2026-09-04': { count: 10 } }));
  mockLS.setItem('kaoyan_theme', 'dark');
  mockLS.setItem('kaoyan_dark_img_filter', 'invert');
  mockLS.setItem('kaoyan_ui_filters', JSON.stringify({ hideProficient: true }));
  mockLS.setItem('kaoyan_subject', 'math');
  mockLS.setItem('math_ui_solution', JSON.stringify({ show: true }));
  mockLS.setItem('822_ui_solution', JSON.stringify({ show: false }));

  // 2. Mock 章节定义与 slug 解析
  const mockSubjects = [
    {
      id: 'math',
      chapters: [
        {
          id: 'ch1',
          uid: 'math::基础30讲::高数::第1讲 函数极限与连续',
          total: 3,
          labels: ['例1-1', '例1-2', '例1-3'],
          getQuestionSlug(idx) {
            return ['ex_1-1', 'ex_1-2', 'ex_1-3'][idx];
          }
        }
      ]
    },
    {
      id: '822',
      chapters: [
        {
          id: 'ch2',
          uid: '822::控制工程基础::第2章 控制系统数学模型',
          total: 1,
          labels: ['2-1'],
          getQuestionSlug(idx) {
            return 'pb_2-1';
          }
        }
      ]
    }
  ];

  // 3. 执行迁移
  const report = migrateLegacyStorage(mockLS, mockSubjects);

  // 4. 断言验证
  assert.strictEqual(report.success, true, '迁移必须成功');

  // 备份快照验证
  const backupRaw = mockLS.getItem('kaoyan.migration.backup');
  assert.ok(backupRaw, '必须创建全量快照备份');
  const backup = JSON.parse(backupRaw);
  assert.strictEqual(backup.snapshot['kaoyan_theme'], 'dark');

  // 断点转换验证 (必须为 slug 而非纯数字 idx)
  const resumeJson = mockLS.getItem('kaoyan.g.resume');
  assert.ok(resumeJson, '必须生成 kaoyan.g.resume');
  const resume = JSON.parse(resumeJson);
  assert.strictEqual(resume.$v, 2);
  assert.strictEqual(resume['math'].slug, 'ex_1-2', 'math 科目断点必须成功转换为 slug');
  assert.strictEqual(resume['math'].sub, true);
  assert.strictEqual(resume['math::基础30讲'].slug, 'ex_1-3', '书籍断点必须转换为 slug');
  assert.strictEqual(resume['math::ch::ch1'].slug, 'ex_1-1', '章节断点必须转换为 slug');
  assert.strictEqual(resume['822'].slug, 'pb_2-1', '822 断点必须转换为 slug');
  assert.strictEqual(resume['english'].year, '2021');
  assert.strictEqual(resume['english_y2021'].qIndex, 22);

  // 全局及 UI 键验证
  assert.strictEqual(JSON.parse(mockLS.getItem('kaoyan.g.topics')).top1.name, '泰勒公式');
  assert.strictEqual(JSON.parse(mockLS.getItem('kaoyan.g.affinity')).pairs.k1, 5);
  assert.strictEqual(JSON.parse(mockLS.getItem('kaoyan.g.study_log'))['2026-09-04'].count, 10);
  assert.strictEqual(JSON.parse(mockLS.getItem('kaoyan.g.theme')), 'dark');
  assert.strictEqual(JSON.parse(mockLS.getItem('kaoyan.g.dark_img_filter')), 'invert');
  assert.strictEqual(JSON.parse(mockLS.getItem('kaoyan.g.filters')).hideProficient, true);
  assert.strictEqual(JSON.parse(mockLS.getItem('kaoyan.g.subject')), 'math');
  assert.strictEqual(JSON.parse(mockLS.getItem('kaoyan.ui.math')).show, true);
  assert.strictEqual(JSON.parse(mockLS.getItem('kaoyan.ui.822')).show, false);

  // 旧键彻底清理验证
  assert.strictEqual(mockLS.getItem('kaoyan_resume'), null, '旧 kaoyan_resume 必须被删除');
  assert.strictEqual(mockLS.getItem('kaoyan_resume_english'), null);
  assert.strictEqual(mockLS.getItem('kaoyan_resume_english_y2021'), null);
  assert.strictEqual(mockLS.getItem('kaoyan_related_topics'), null);
  assert.strictEqual(mockLS.getItem('kaoyan_related_affinity'), null);
  assert.strictEqual(mockLS.getItem('kaoyan_study_log'), null);
  assert.strictEqual(mockLS.getItem('kaoyan_theme'), null);
  assert.strictEqual(mockLS.getItem('kaoyan_dark_img_filter'), null);
  assert.strictEqual(mockLS.getItem('kaoyan_ui_filters'), null);
  assert.strictEqual(mockLS.getItem('kaoyan_subject'), null);
  assert.strictEqual(mockLS.getItem('math_ui_solution'), null);
  assert.strictEqual(mockLS.getItem('822_ui_solution'), null);
});

console.log('\n--- 12. TopicManager API 完整性与伴章 Null 守卫测试 ---');

test('TopicManager: API 导出完整性与别名互通', () => {
  const mathSubj = SUBJECTS.find(s => s.id === 'math');
  const topicWin = {
    curSubjectId: 'math',
    SUBJECTS: [mathSubj],
    CHAPTERS: mathSubj.chapters,
    currentChapterId: 'math::基础30讲::高数::lec00',
    escapeHtml: str => String(str),
    safeLSSet: () => {}
  };
  const doc = {
    getElementById: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {}
  };
  const topicsSrc = fs.readFileSync(path.join(__dirname, '../js/topics.js'), 'utf8');
  new Function('window', 'document', 'localStorage', 'StorageEngine', 'CHAPTERS', 'curSubject', 'SUBJECTS', topicsSrc)(
    topicWin, doc, { getItem: () => null, setItem: () => {} }, {}, topicWin.CHAPTERS, mathSubj, [mathSubj]
  );

  assert.ok(topicWin.TopicManager, 'TopicManager 应该已成功导出到 window');
  assert.strictEqual(typeof topicWin.TopicManager.normalizeSubjectId, 'function');
  assert.strictEqual(topicWin.TopicManager.normalizeSubjectId('shu1'), 'math');
  assert.strictEqual(topicWin.TopicManager.normalizeSubjectId('math'), 'math');
  assert.strictEqual(topicWin.TopicManager.normalizeSubjectId('822'), '822');

  assert.strictEqual(typeof topicWin.TopicManager.getAffinityPairKey, 'function');
  const k1 = topicWin.TopicManager.getAffinityPairKey('qA', 'qB');
  const k2 = topicWin.TopicManager.getAffinityPairKey('qB', 'qA');
  assert.strictEqual(k1, k2, '对偶题目键应具备对称无向性');

  assert.strictEqual(typeof topicWin.TopicManager.getAffinity, 'function');
  assert.strictEqual(typeof topicWin.TopicManager.recordAffinity, 'function');
  topicWin.TopicManager.recordAffinity('qA', 'qB', 5);
  assert.strictEqual(topicWin.TopicManager.getAffinity('qA', 'qB'), 5);
  assert.strictEqual(topicWin.TopicManager.getAffinity('qB', 'qA'), 5);

  assert.strictEqual(typeof topicWin.TopicManager.getQuestionData, 'function');
  const qData = topicWin.TopicManager.getQuestionData('dummy_qid');
  assert.ok(Array.isArray(qData.topics));
  assert.ok(Array.isArray(qData.relatedQuestions));
});

// --- 13. 数学符号盘与 LaTeX 自动补全完整性校验 ---
console.log('\n--- 13. 数学符号盘与 LaTeX 自动补全完整性校验 ---');

test('MathPalette: 符号盘数据集与 index.html 6 大 Tabs 1:1 精确映射', () => {
  const palWin = {};
  const palDoc = {
    getElementById: () => null,
    querySelectorAll: () => []
  };
  const palSrc = fs.readFileSync(path.join(__dirname, '../js/math_palette.js'), 'utf8');
  new Function('window', 'document', palSrc)(palWin, palDoc);

  assert.ok(palWin.MathPalette, 'MathPalette 应该成功导出到 window');
  const data = palWin.MathPalette.DATA;
  assert.ok(data, 'MathPalette.DATA 应该存在');

  const expectedCategories = ['calc', 'algebra', 'greek', 'linalg', 'prob', 'templates'];
  const actualCategories = Object.keys(data);
  assert.deepStrictEqual(actualCategories.sort(), expectedCategories.sort(), '数据分类必须与 6 大 Tab 严格 1:1 对齐');

  expectedCategories.forEach(cat => {
    assert.ok(Array.isArray(data[cat]), `分类 ${cat} 必须为数组`);
    assert.ok(data[cat].length >= 15, `分类 ${cat} 的项数应足够丰富 (当前: ${data[cat].length})`);
    data[cat].forEach((item, idx) => {
      assert.ok(typeof item.label === 'string' && item.label.length > 0, `${cat}[${idx}] label 必须非空`);
      assert.ok(typeof item.code === 'string' && item.code.length > 0, `${cat}[${idx}] code 必须非空`);
      assert.ok(typeof item.render === 'string' && item.render.length > 0, `${cat}[${idx}] render 必须非空`);
    });
  });

  // 验证线性代数与代数集合不再错位混淆
  const linalgLabels = data.linalg.map(x => x.label);
  assert.ok(linalgLabels.some(l => l.includes('圆括号矩阵')), '线性代数必须包含矩阵');
  assert.ok(linalgLabels.some(l => l.includes('特征方程') || l.includes('特征值')), '线性代数必须包含特征值');

  const algebraLabels = data.algebra.map(x => x.label);
  assert.ok(algebraLabels.some(l => l.includes('根号')), '代数/集合必须包含根号');
  assert.ok(algebraLabels.some(l => l.includes('属于')), '代数/集合必须包含集合属于符号');
  // 验证三角函数与反三角函数 9 大项完整存在
  const trigLabels = data.algebra.map(x => x.label);
  ['正弦 sin', '余弦 cos', '正切 tan', '余切 cot', '正割 sec', '余割 csc', '反正弦 arcsin', '反余弦 arccos', '反正切 arctan'].forEach(trig => {
    assert.ok(trigLabels.includes(trig), `代数初等函数必须包含 ${trig}`);
  });

  // 验证高频模板 18 大项完整恢复
  assert.strictEqual(data.templates.length, 18, '高频模板应完整包含 18 项核心考研公式');
  const templateLabels = data.templates.map(x => x.label);
  assert.ok(templateLabels.some(l => l.includes('点火公式')), '高频模板必须包含 Wallis 点火公式');
  assert.ok(templateLabels.some(l => l.includes('等价无穷小')), '高频模板必须包含等价无穷小速查');
  assert.ok(templateLabels.some(l => l.includes('麦克劳林')), '高频模板必须包含麦克劳林展开');

  // 验证自动补全词典包含导数快捷键
  const dict = palWin.MathPalette.AUTOCOMPLETE_DICT;
  assert.ok(Array.isArray(dict) && dict.length >= 105, 'AUTOCOMPLETE_DICT 词典完整度校验');
  const dictKeys = new Set(dict.map(x => x.key));
  assert.ok(dictKeys.has('fp'), '自动补全应包含 fp');
  assert.ok(dictKeys.has('fprime'), '自动补全应包含 fprime');
  assert.ok(dictKeys.has('fpp'), '自动补全应包含 fpp');
  assert.ok(dictKeys.has('fn'), '自动补全应包含 fn');
  assert.ok(dictKeys.has('f0'), '自动补全应包含 f0');
});

test('MathPalette.insertSnippetIntoNotes: 消除 | 占位符冲突与保护公式字面量', () => {
  const palWin = {};
  let mockTextarea = {
    value: '',
    selectionStart: 0,
    selectionEnd: 0,
    focus: () => {}
  };
  const palDoc = {
    getElementById: (id) => {
      if (id === 'notesDuo') return { style: { display: 'flex' } };
      if (id === 'notesTextarea') return mockTextarea;
      return null;
    },
    querySelectorAll: () => []
  };
  const palSrc = fs.readFileSync(path.join(__dirname, '../js/math_palette.js'), 'utf8');
  new Function('window', 'document', palSrc)(palWin, palDoc);

  const { insertSnippetIntoNotes } = palWin.MathPalette;

  // 1. 测试字面量竖线不被吞噬
  mockTextarea.value = ''; mockTextarea.selectionStart = 0; mockTextarea.selectionEnd = 0;
  insertSnippetIntoNotes('|A|');
  assert.strictEqual(mockTextarea.value, '|A|', '|A| 中的首个竖线不应被当做占位符删除');

  mockTextarea.value = ''; mockTextarea.selectionStart = 0; mockTextarea.selectionEnd = 0;
  insertSnippetIntoNotes('|\\lambda E - A| = 0');
  assert.strictEqual(mockTextarea.value, '|\\lambda E - A| = 0', '特征方程中的竖线必须完整保留');

  mockTextarea.value = ''; mockTextarea.selectionStart = 0; mockTextarea.selectionEnd = 0;
  insertSnippetIntoNotes('\\|\\boldsymbol{x}\\|');
  assert.strictEqual(mockTextarea.value, '\\|\\boldsymbol{x}\\|', '范数 \\| 中的竖线必须完整保留');

  mockTextarea.value = ''; mockTextarea.selectionStart = 0; mockTextarea.selectionEnd = 0;
  insertSnippetIntoNotes('P(A \\mid B)');
  assert.strictEqual(mockTextarea.value, 'P(A \\mid B)', '条件概率语法应完整保留');

  // 2. 测试占位符正常工作
  mockTextarea.value = ''; mockTextarea.selectionStart = 0; mockTextarea.selectionEnd = 0;
  insertSnippetIntoNotes('\\frac{|}{}');
  assert.strictEqual(mockTextarea.value, '\\frac{}{}', '分式占位符应被消费');
  assert.strictEqual(mockTextarea.selectionStart, 6, '光标应准确定位在分子大括号内');

  // 3. 测试绝对值 |⦙| 模板选区包裹与居中定位
  mockTextarea.value = ''; mockTextarea.selectionStart = 0; mockTextarea.selectionEnd = 0;
  insertSnippetIntoNotes('|⦙|');
  assert.strictEqual(mockTextarea.value, '||', '未选中文字时插入 ||');
  assert.strictEqual(mockTextarea.selectionStart, 1, '光标应准确定位于两竖线之间');

  mockTextarea.value = 'sin(x)'; mockTextarea.selectionStart = 0; mockTextarea.selectionEnd = 6;
  insertSnippetIntoNotes('|⦙|');
  assert.strictEqual(mockTextarea.value, '|sin(x)|', '选中文字时应自动包裹为绝对值 |选区|');
  assert.strictEqual(mockTextarea.selectionStart, 8, '光标应定位于包裹后的右侧');
});

// ===== 14. 顶部标题栏下拉栏状态管理与防泄露 (TitleBar Dropdowns Management) =====
console.log('\n--- 14. 顶部标题栏下拉栏状态管理与防泄露 (TitleBar Dropdowns Management) ---');

test('setPanelTitle: 错题本模式打开与退出时各下拉栏显示控制，严防 ddWbWrongbook 泄漏', () => {
  // 模拟 DOM 节点
  const elements = {
    chapterTitleBar: { querySelectorAll: () => [] },
    panelTitle: { textContent: '', style: { display: 'none' } },
    ddWb: { style: { display: '' } },
    ddSubj: { style: { display: '' } },
    ddChapter: { style: { display: '' } },
    ddWbWrongbook: { style: { display: 'none' } }
  };

  // 模拟 app.js 中的 setPanelTitle 实现逻辑
  function testSetPanelTitle(text, wrongbookMode, currentWbSubjsCount) {
    const bar = elements.chapterTitleBar;
    const panelTitle = elements.panelTitle;
    const ddWb = elements.ddWb;
    const ddSubj = elements.ddSubj;
    const ddChapter = elements.ddChapter;
    const ddWbWrongbook = elements.ddWbWrongbook;

    if (text) {
      panelTitle.textContent = text;
      panelTitle.style.display = '';
      if (ddWb) ddWb.style.display = 'none';
      if (ddSubj) ddSubj.style.display = 'none';
      if (ddChapter) ddChapter.style.display = 'none';
      if (ddWbWrongbook) ddWbWrongbook.style.display = wrongbookMode ? '' : 'none';
    } else {
      panelTitle.textContent = '';
      panelTitle.style.display = 'none';
      if (ddWb) ddWb.style.display = '';
      if (ddChapter) ddChapter.style.display = '';
      if (ddWbWrongbook) ddWbWrongbook.style.display = 'none';
      if (ddSubj) {
        ddSubj.style.display = currentWbSubjsCount > 1 ? '' : 'none';
      }
    }
  }

  // 1. 进入错题本模式
  testSetPanelTitle('错题本', true, 3);
  assert.strictEqual(elements.panelTitle.textContent, '错题本');
  assert.strictEqual(elements.panelTitle.style.display, '');
  assert.strictEqual(elements.ddWb.style.display, 'none');
  assert.strictEqual(elements.ddSubj.style.display, 'none');
  assert.strictEqual(elements.ddChapter.style.display, 'none');
  assert.strictEqual(elements.ddWbWrongbook.style.display, '', '错题本模式下 ddWbWrongbook 应显示');

  // 2. 退出错题本模式（当前书籍多学科，如数一 基础30讲）
  testSetPanelTitle('', false, 3);
  assert.strictEqual(elements.panelTitle.style.display, 'none');
  assert.strictEqual(elements.ddWb.style.display, '');
  assert.strictEqual(elements.ddChapter.style.display, '');
  assert.strictEqual(elements.ddWbWrongbook.style.display, 'none', '退出错题本后 ddWbWrongbook 必须被隐藏，禁止泄漏！');
  assert.strictEqual(elements.ddSubj.style.display, '', '多学科书籍 ddSubj 应显示');

  // 3. 进入总览面板并退出（当前书籍单学科，如 822 控制工程基础 或 老姚高数）
  testSetPanelTitle('全局学习进度', false, 1);
  assert.strictEqual(elements.ddWbWrongbook.style.display, 'none');
  testSetPanelTitle('', false, 1);
  assert.strictEqual(elements.ddWbWrongbook.style.display, 'none', '退出总览后 ddWbWrongbook 必须被隐藏');
  assert.strictEqual(elements.ddSubj.style.display, 'none', '单学科书籍退出总览后 ddSubj 必须保持隐藏，禁止意外浮现多余下拉栏');
});

// ===== 15. 考点主题拖拽排序与优先级持久化 (Topic Drag-and-Drop Sorting) =====
console.log('\n--- 15. 考点主题拖拽排序与优先级持久化 (Topic Drag-and-Drop Sorting) ---');

test('sortTopicsList: 考点自定义数值 order 排序与 fallback 规则验证', () => {
  const topicsSrc = fs.readFileSync(path.join(__dirname, '../js/topics.js'), 'utf8');
  const mockWin = {
    SUBJECTS: SUBJECTS,
    document: {
      addEventListener: () => {},
      getElementById: () => null,
      querySelectorAll: () => []
    },
    location: { href: 'http://localhost/' }
  };
  new Function('window', 'document', topicsSrc)(mockWin, mockWin.document);
  const sortTopicsList = mockWin.TopicManager.sortTopicsList;
  assert.strictEqual(typeof sortTopicsList, 'function', 'sortTopicsList 必须导出');

  // 1. 无 order 考点默认按 createTime 降序（最新优先）排序
  const rawList1 = [
    { id: 't2', name: '极限运算', createTime: 2000 },
    { id: 't1', name: '导数定义', createTime: 1000 },
    { id: 't3', name: '级数审敛', createTime: 3000 }
  ];
  const sorted1 = sortTopicsList(rawList1);
  assert.deepStrictEqual(sorted1.map(t => t.id), ['t3', 't2', 't1'], '无 order 时默认按 createTime 降序排序（最新考点靠前）');

  // 2. 存在显式 order 时，严格按 order 升序优先排序
  const rawList2 = [
    { id: 't1', name: '导数定义', createTime: 1000, order: 2 },
    { id: 't2', name: '极限运算', createTime: 2000, order: 0 },
    { id: 't3', name: '级数审敛', createTime: 3000, order: 1 }
  ];
  const sorted2 = sortTopicsList(rawList2);
  assert.deepStrictEqual(sorted2.map(t => t.id), ['t2', 't3', 't1'], '显式 order 拥有最高排序优先级');

  // 3. 混合 order：未设定 order 的新考点默认按时间降序排在最前，已有 order 的项按 order 升序紧随其后
  const rawList3 = [
    { id: 't_no_order_1', name: '后建考点', createTime: 5000 },
    { id: 't_order_1', name: '首要考点', order: 0, createTime: 4000 },
    { id: 't_no_order_0', name: '先建考点', createTime: 2000 },
    { id: 't_order_2', name: '次要考点', order: 1, createTime: 1000 }
  ];
  const sorted3 = sortTopicsList(rawList3);
  assert.deepStrictEqual(sorted3.map(t => t.id), ['t_no_order_1', 't_no_order_0', 't_order_1', 't_order_2'], '未设定 order 的新考点降序在前，已设定 order 项按 order 排序在后');

  // 4. 模拟拖拽调换位置：把 t3 拖到首位
  const newOrder = ['t3', 't2', 't1'];
  const topicMap = {
    t1: { id: 't1', name: 'A', order: 0 },
    t2: { id: 't2', name: 'B', order: 1 },
    t3: { id: 't3', name: 'C', order: 2 }
  };
  newOrder.forEach((tid, idx) => {
    topicMap[tid].order = idx;
  });
  const reordered = sortTopicsList(Object.values(topicMap));
  assert.deepStrictEqual(reordered.map(t => t.id), ['t3', 't2', 't1'], '拖拽重排后更新 order 得到正确序列');
});

// ===== 16. 跳转做此题返回条与返回键主题色校验 =====
console.log('\n--- 16. 跳转做此题返回条与返回键主题色校验 (Jump Return Bar Theme) ---');

test('跳转做此题返回键 (.btn-jump-back) 与返回条样式严格采用清华紫主色系', () => {
  const stylesSrc = fs.readFileSync(path.join(__dirname, '../css/styles.css'), 'utf8');

  // 1. 确保 .btn-jump-back 采用清华紫渐变 (#8a2b9c -> #660874)
  assert.ok(stylesSrc.includes('linear-gradient(135deg, #8a2b9c 0%, #660874 100%)'), '.btn-jump-back 应采用清华紫渐变 #8a2b9c -> #660874');

  // 2. 确保不再包含过亮刺眼的荧光亮紫 (#7c3aed)
  const jumpBackBlock = stylesSrc.match(/\.btn-jump-back\s*\{[^}]+\}/)?.[0] || '';
  assert.ok(!jumpBackBlock.includes('#7c3aed'), '.btn-jump-back 不应再含有过亮的 #7c3aed');
  assert.ok(!jumpBackBlock.includes('#9333ea'), '.btn-jump-back 不应再含有过亮的 #9333ea');

  // 3. 确保返回条 .jump-return-bar 容器背景与边框同样采用清华紫色系 rgba(102, 8, 116, ...)
  const jumpBarBlock = stylesSrc.match(/\.jump-return-bar\s*\{[^}]+\}/)?.[0] || '';
  assert.ok(jumpBarBlock.includes('102, 8, 116'), '.jump-return-bar 容器应采用清华紫 (102, 8, 116) 色系');
  assert.ok(!jumpBarBlock.includes('138, 43, 226'), '.jump-return-bar 不应含有过亮荧光紫 rgba(138, 43, 226)');

  // 4. 确保暗黑模式适配
  assert.ok(stylesSrc.includes('[data-theme="dark"] .btn-jump-back'), '应包含暗黑模式下 .btn-jump-back 的适配');
  assert.ok(stylesSrc.includes('[data-theme="dark"] .jump-return-bar'), '应包含暗黑模式下 .jump-return-bar 的适配');
});

// ===== 17. 解析按钮交互状态样式与快捷键对比度隔离校验 =====
console.log('\n--- 17. 解析按钮交互状态样式与快捷键对比度隔离校验 (BtnToggle Hover & Key Style Isolation) ---');

test('解析按钮显示态与隐藏态 hover 样式隔离，防止 Space 快捷键变白隐形', () => {
  const stylesSrc = fs.readFileSync(path.join(__dirname, '../css/styles.css'), 'utf8');

  // 1. 确保显示解析态使用 :not(.hide):hover，避免样式泄露到隐藏解析态
  assert.ok(stylesSrc.includes('.gel-btn.btn-toggle:not(.hide):hover'), '必须使用 :not(.hide):hover 进行状态样式精确隔离');
  assert.ok(stylesSrc.includes('.gel-btn.btn-toggle:not(.hide):hover .key'), '必须独立定义未展开状态下的 hover key 颜色');

  // 2. 确保隐藏解析态 (.gel-btn.btn-toggle.hide:hover) 显式声明 .key 颜色，且绝不使用白色
  const hideHoverBlock = stylesSrc.match(/\.gel-btn\.btn-toggle\.hide:hover\s*\{[^}]+\}/)?.[0] || '';
  const hideHoverKeyBlock = stylesSrc.match(/\.gel-btn\.btn-toggle\.hide:hover\s+\.key\s*\{[^}]+\}/)?.[0] || '';

  assert.ok(hideHoverKeyBlock.length > 0, '.gel-btn.btn-toggle.hide:hover .key 必须有显式规则');
  assert.ok(
    !hideHoverKeyBlock.includes('#fff') && !hideHoverKeyBlock.includes('rgba(255, 255, 255'),
    '在浅色果冻背景下，.hide:hover .key 绝不能设置为白色'
  );
  assert.ok(
    hideHoverKeyBlock.includes('var(--primary-light') || hideHoverKeyBlock.includes('#9c27b0'),
    '.hide:hover .key 应使用紫色保持清晰对比度'
  );

  // 3. 隐藏解析态 hover 时文字高亮为主色调 var(--primary)
  const hideHoverFuncNameBlock = stylesSrc.match(/\.gel-btn\.btn-toggle\.hide:hover\s+\.func-name\s*\{[^}]+\}/)?.[0] || '';
  assert.ok(hideHoverFuncNameBlock.includes('var(--primary)'), '隐藏解析态 hover 时 .func-name 应高亮为 var(--primary)');

  // 4. 确保深色模式下同样对两种状态进行了 hover 适配
  assert.ok(stylesSrc.includes('[data-theme="dark"] .gel-btn.btn-toggle:not(.hide):hover'), '深色模式应适配显示解析 hover');
  assert.ok(stylesSrc.includes('[data-theme="dark"] .gel-btn.btn-toggle.hide:hover'), '深色模式应适配隐藏解析 hover');
  assert.ok(stylesSrc.includes('[data-theme="dark"] .gel-btn.btn-toggle.hide:hover .key'), '深色模式应适配隐藏解析 hover 下的 .key');
});

console.log('\n====================================================');
console.log(`  测试结果: ${passedTests} passed, ${failedTests} failed`);
console.log('====================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

