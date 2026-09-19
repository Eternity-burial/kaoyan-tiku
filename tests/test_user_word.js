const assert = require('assert');
const path = require('path');

// Mock localStorage
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; }
};

const LexiconLoader = require('../js/lexicon_loader.js');
const UserWordManager = require('../js/user_word.js');

async function testUserWord() {
  console.log('Testing UserWordManager...');
  await LexiconLoader.initIndexes();
  await LexiconLoader.loadArticle('ky-en1-2014-r-t1');

  // 1. Test toggleStar on Lexeme + Occurrence
  const lexExchequer = await LexiconLoader.getLexemeById('lex-16f5c88c0356ae16b47c') || { lexemeId: 'lex-test-1', lemma: 'exchequer' };
  const occ1 = {
    occurrenceId: 'occ-test-1',
    surface: 'Exchequer',
    location: { year: 2014, text: 1, ps: 'P1-S1' },
    context: { contextMeaning: '国库，财政部' }
  };

  const isSaved1 = UserWordManager.toggleStar(lexExchequer, occ1);
  assert.strictEqual(isSaved1, true, 'Should be saved');
  assert.strictEqual(UserWordManager.isOccurrenceSaved(lexExchequer.lexemeId, 'occ-test-1'), true);

  // 2. Add another occurrence under same Lexeme (2018 Text 2)
  const occ2 = {
    occurrenceId: 'occ-test-2',
    surface: 'exchequer',
    location: { year: 2018, text: 2, ps: 'P3-S2' },
    context: { contextMeaning: '财政机关' }
  };
  UserWordManager.toggleStar(lexExchequer, occ2);

  const uw = UserWordManager.getUserWord(lexExchequer.lexemeId);
  assert.strictEqual(uw.savedOccurrences.length, 2, 'Should have 2 saved occurrences aggregated under 1 Lexeme');
  console.log('✔ Multiple occurrences aggregated under 1 Lexeme:', uw.savedOccurrences.map(o => `${o.year} ${o.ps}`));

  // 3. Test Mastery & SM-2
  UserWordManager.setMastery(lexExchequer.lexemeId, 'proficient');
  assert.strictEqual(uw.mastery, 'proficient');
  console.log('✔ Set mastery proficient');

  // 4. Test Idempotent Legacy Migration
  localStorage.setItem('ky_english_starred_words', JSON.stringify({
    'perceive': { word: 'perceive', ipa: 'pəˈsiːv', meaning: '察觉，感知', year: '2014', textId: 'text1', date: '2026/9/19' },
    'taken': { word: 'taken', ipa: 'teɪkən', meaning: '采取', year: '2015', textId: 'text2', date: '2026/9/19' }
  }));

  const res1 = await UserWordManager.migrateLegacyStarredWords();
  console.log('Migration 1 result:', res1);
  assert(res1.migrated >= 1, 'At least 1 word should be migrated');

  const starredWordsAfter1 = UserWordManager.getStarredUserWords().length;

  // Run migration again (must be idempotent)
  const res2 = await UserWordManager.migrateLegacyStarredWords();
  console.log('Migration 2 result (idempotent):', res2);
  assert.strictEqual(res2.migrated, 0, 'Second run must migrate 0 words');
  assert.strictEqual(UserWordManager.getStarredUserWords().length, starredWordsAfter1, 'Starred words count must not change');
  console.log('✔ Idempotent migration verified');

  console.log('\nAll UserWord tests PASSED! ✨\n');
}

testUserWord().catch(err => {
  console.error('UserWord test FAILED:', err);
  process.exit(1);
});
