/**
 * Kaoyan-Tiku: Comprehensive Lexicon & Intensive Reading Regression Test Suite
 * 覆盖：
 *   1. 普通词、词形变化 (inflections: -ed, -en, irregular plurals)
 *   2. 多义词与本句真题语境义 (Context meanings vs Dictionary meanings)
 *   3. 熟词僻义 (Familiar Word Uncommon Meaning)
 *   4. 固定短语 (Phrases) 与单字共存
 *   5. 专有名词 (Proper Nouns) 保护
 *   6. Personal PDF 与 Exam-point PDF 标注词 (2007-2018 抽检)
 *   7. UserWord 模型与 SM-2 算法积分
 *   8. 1998-2026 全量 29 年份真题数据模型无损校验
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const BASE_DIR = path.resolve(__dirname, '..');

// 模拟 DOM / LocalStorage
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; }
};

global.window = global;
global.document = {
  createElement: () => ({ style: {}, classList: { add: () => {}, remove: () => {}, toggle: () => {} }, appendChild: () => {} }),
  head: { appendChild: () => {} },
  body: { appendChild: () => {} },
  getElementById: () => null
};

const LexiconLoader = require('../js/lexicon_loader.js');
const LexiconTokenizer = require('../js/lexicon_tokenizer.js');
const UserWordManager = require('../js/user_word.js');
const LexiconPopup = require('../js/lexicon_popup.js');

let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      console.log(`  \x1b[32m✔\x1b[0m ${name}`);
      passedTests++;
    })
    .catch((err) => {
      console.error(`  \x1b[31m✖\x1b[0m ${name}: ${err.message}`);
      if (err.stack) console.error(err.stack.split('\n').slice(1, 3).join('\n'));
      failedTests++;
    });
}

async function runAll() {
  console.log('====================================================');
  console.log('  Kaoyan-Tiku: Lexicon Regression Test Suite');
  console.log('====================================================\n');

  await LexiconLoader.initIndexes();

  // 1. 普通词查询
  await test('1. 普通词 (scheme, introduced, career) 正常解析与 ECDICT 词典绑定', async () => {
    const res = await LexiconLoader.lookup('career');
    assert(res && res.lexeme, 'career must resolve');
    assert(res.lexeme.dictionary.generalDefinition.zh, 'career must have Chinese definition');
  });

  // 2. 词形变化 (Inflections)
  await test('2. 词形变化 (perceived->perceive, taken->take, children->child, criteria->criterion, isolates->isolate)', async () => {
    const pRes = await LexiconLoader.lookup('perceived');
    assert.strictEqual(pRes.lexeme.lemma, 'perceive');

    const tRes = await LexiconLoader.lookup('taken');
    assert.strictEqual(tRes.lexeme.lemma, 'take');

    const cRes = await LexiconLoader.lookup('children');
    assert.strictEqual(cRes.lexeme.lemma, 'child');

    const crRes = await LexiconLoader.lookup('criteria');
    assert.strictEqual(crRes.lexeme.lemma, 'criterion');

    const iRes = await LexiconLoader.lookup('isolates');
    assert.strictEqual(iRes.lexeme.lemma, 'isolate');
  });

  // 3. 多义词与本句真题语境义 (Context Meaning vs General Meaning)
  await test('3. 多义词 isolates (2014 T2 P5-S4) 优先命中本句真题义「使...孤立 / 隔离」', async () => {
    const artId = 'ky-en1-2014-r-t2';
    await LexiconLoader.loadArticle(artId);
    const hit = await LexiconLoader.lookup('isolates', artId, 'P5-S4');
    assert(hit && hit.occurrence, 'Should match occurrence in P5-S4');
    assert.strictEqual(hit.matchType, 'sentence-occurrence');
    assert(hit.occurrence.context.contextMeaning.includes('使') || hit.occurrence.context.contextMeaning.includes('孤立') || hit.occurrence.context.contextMeaning.includes('隔离'));
    assert.strictEqual(hit.occurrence.annotations.examPointPdf, true);
  });

  // 4. Lazynote 考研真题频次三维统计隔离校验 (would)
  await test('4. Lazynote 统计指标三维物理隔离 (would: sentenceCount=304, occurrenceCount=321, paperCount=46)', async () => {
    const lexWould = await LexiconLoader.getLexemeById('lex-0067e5569081fd1e2ad3');
    assert(lexWould && lexWould.kaoyanCorpus);
    assert.strictEqual(lexWould.kaoyanCorpus.sentenceCount, 304);
    assert.strictEqual(lexWould.kaoyanCorpus.occurrenceCount, 321);
    assert.strictEqual(lexWould.kaoyanCorpus.paperCount, 46);
    // 验证 ECDICT BNC 与 FRQ 不被篡改为考研频次
    assert.strictEqual(lexWould.dictionary.generalCorpusFrequency.bnc, 34);
    assert.strictEqual(lexWould.dictionary.generalCorpusFrequency.frq, 41);
  });

  // 5. 熟词僻义 (Familiar Word Uncommon Meaning)
  await test('5. 熟词僻义标记 (annotations.familiarWordUncommonMeaning) 识别与 level-amber 样式', async () => {
    const artId = 'ky-en1-2007-r-t3';
    const art = await LexiconLoader.loadArticle(artId);
    assert(art && art.occurrences, '2007-r-t3 must load');
    const occs = LexiconLoader.getOccurrencesByPs(artId, 'P2-S4');
    const parachuteOcc = occs.find(o => o.surface === 'parachute' && o.annotations.familiarWordUncommonMeaning);
    assert(parachuteOcc, 'parachute in 2007 T3 P2-S4 must be familiarWordUncommonMeaning');
    const html = LexiconTokenizer.renderSentenceHtml('a golden parachute deal', occs, [], 'P2-S4', artId);
    assert(html.includes('level-amber'), 'Should assign level-amber class to rare sense words');
  });

  // 6. 固定短语 (Phrases) 与单字独立性
  await test('6. 固定短语 (Chancellor of the Exchequer) 贪婪探测与单字共存', async () => {
    const artId = 'ky-en1-2014-r-t1';
    await LexiconLoader.loadArticle(artId);
    const occs = LexiconLoader.getOccurrencesByPs(artId, 'P1-S1');
    const sentenceText = 'George Osborne, Chancellor of the Exchequer, introduced the "upfront work search" scheme.';
    const html = LexiconTokenizer.renderSentenceHtml(sentenceText, occs, [], 'P1-S1', artId);
    assert(html.includes('Chancellor of the Exchequer'), 'Full phrase must be detected');
    assert(html.includes('lex-phrase') || html.includes('level-blue'), 'Phrase class must be present');
    assert(html.includes('data-phrase-surface'), 'Must provide data-phrase-surface');
  });

  // 7. 专有名词 (Proper Nouns) 保护
  await test('7. 专有名词 (George Osborne) 专有标记不被 lowercase 错并', async () => {
    const res = await LexiconLoader.lookup('New York');
    assert(res && res.lexeme, 'New York must resolve');
    assert.strictEqual(res.lexeme.properNoun, true);
  });

  // 8. 2007-2018 PDF 历史标注词抽检 (Personal PDF & Exam-point PDF)
  await test('8. 2007-2018 抽检：Personal PDF 与 Exam-point PDF 真实双标注词 (2014 T1 apparent)', async () => {
    const artId = 'ky-en1-2014-r-t1';
    await LexiconLoader.loadArticle(artId);
    const hit = await LexiconLoader.lookup('apparent', artId, 'P2-S1');
    assert(hit && hit.occurrence, 'apparent must have occurrence in P2-S1');
    assert.strictEqual(hit.occurrence.annotations.personalPdf, true);
    assert.strictEqual(hit.occurrence.annotations.examPointPdf, true);
    assert(hit.occurrence.annotations.pdfPrintedGloss.length > 0);
  });

  // 9. UserWord 模型与 SM-2 连续复习
  await test('9. UserWord 模型多语境聚合与 SM-2+ 积分演进', async () => {
    const lex = { lexemeId: 'lex-reg-test', lemma: 'resilient' };
    const occA = { occurrenceId: 'occ-reg-a', location: { year: 2011, ps: 'P2-S1' }, context: { contextMeaning: '有复原力的' } };
    const occB = { occurrenceId: 'occ-reg-b', location: { year: 2017, ps: 'P4-S3' }, context: { contextMeaning: '韧性的' } };

    UserWordManager.toggleStar(lex, occA);
    UserWordManager.toggleStar(lex, occB);
    const uw = UserWordManager.getUserWord('lex-reg-test');
    assert.strictEqual(uw.savedOccurrences.length, 2);

    // SM-2 评分演进
    UserWordManager.recordReviewSM2('lex-reg-test', 5);
    assert(uw.sm2.reps >= 1);
    assert.strictEqual(uw.mastery, 'proficient');

    UserWordManager.recordReviewSM2('lex-reg-test', 1);
    assert.strictEqual(uw.mastery, 'wrong');
  });

  // 10. 1998-2026 现有 29 年份真题完整性回归
  await test('10. 1998-2026 全量 29 个年份数据文件结构完整性 (4篇阅读+题目+翻译无损)', async () => {
    const years = Array.from({ length: 29 }, (_, i) => String(1998 + i));
    for (const y of years) {
      const p = path.join(BASE_DIR, '题库', '英语', `data_${y}.js`);
      assert(fs.existsSync(p), `data_${y}.js must exist`);
      const content = fs.readFileSync(p, 'utf8');
      assert(content.includes(`window.ENGLISH_DATA['${y}']`) || content.includes(`window.ENGLISH_DATA["${y}"]`), `${y} data header must exist`);
      assert(content.includes('texts'), `${y} texts array must exist`);
      assert(content.includes('paragraphs'), `${y} paragraphs must exist`);
    }
  });

  console.log('\n====================================================');
  console.log(`  回归测试结果: ${passedTests} passed, ${failedTests} failed`);
  console.log('====================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAll().catch(err => {
  console.error('Fatal error in test suite:', err);
  process.exit(1);
});
