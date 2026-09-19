const assert = require('assert');
const path = require('path');
const LexiconLoader = require('../js/lexicon_loader.js');

async function runTests() {
  console.log('Testing LexiconLoader in Node.js...');

  // 1. Init indexes
  await LexiconLoader.initIndexes();
  const root = LexiconLoader.getRoot();
  assert(root.surfaceIndex, 'surfaceIndex must be loaded');
  assert(root.lemmaIndex, 'lemmaIndex must be loaded');
  assert(root.phraseIndex, 'phraseIndex must be loaded');
  assert(root.occByLexeme, 'occByLexeme must be loaded');
  console.log('✔ Indexes loaded successfully');

  // 2. Load article
  const artId = 'ky-en1-2014-r-t1';
  const art = await LexiconLoader.loadArticle(artId);
  assert(art, 'Article ky-en1-2014-r-t1 must exist');
  assert(Object.keys(art.occurrences).length > 0, 'Occurrences must not be empty');
  assert(art.byPs['P1-S1'], 'P1-S1 must have occurrences');
  console.log(`✔ Article ${artId} loaded with ${Object.keys(art.occurrences).length} occurrences`);

  // 3. Check P-S mapping
  const p1s1Occs = LexiconLoader.getOccurrencesByPs(artId, 'P1-S1');
  assert(p1s1Occs.length > 0, 'P1-S1 occurrences must be found');
  const surfaces = p1s1Occs.map(o => o.surface);
  assert(surfaces.includes('Exchequer'), 'Exchequer must be in P1-S1');
  console.log('✔ P-S mapping verified:', surfaces);

  // 4. Test Lookup: Sentence Occurrence Priority
  const hit1 = await LexiconLoader.lookup('Exchequer', artId, 'P1-S1');
  assert(hit1 && hit1.matchType === 'sentence-occurrence', 'Should match sentence-occurrence');
  assert(hit1.occurrence.surface === 'Exchequer');
  assert(hit1.lexeme.lemma === 'exchequer' || hit1.lexeme.lemma === 'Exchequer');
  console.log('✔ Sentence occurrence lookup passed:', hit1.occurrence.context.contextMeaning);

  // 5. Test Lookup: Inflected forms
  const hitPerceived = await LexiconLoader.lookup('perceived');
  assert(hitPerceived && hitPerceived.lexeme, 'perceived must resolve');
  console.log('✔ perceived ->', hitPerceived.lexeme.lemma);

  const hitTaken = await LexiconLoader.lookup('taken');
  assert(hitTaken && hitTaken.lexeme, 'taken must resolve');
  console.log('✔ taken ->', hitTaken.lexeme.lemma);

  const hitChildren = await LexiconLoader.lookup('children');
  assert(hitChildren && hitChildren.lexeme, 'children must resolve');
  assert(hitChildren.lexeme.lemma === 'child', 'children must resolve to child');
  console.log('✔ children ->', hitChildren.lexeme.lemma);

  const hitCriteria = await LexiconLoader.lookup('criteria');
  assert(hitCriteria && hitCriteria.lexeme, 'criteria must resolve');
  assert(hitCriteria.lexeme.lemma === 'criterion', 'criteria must resolve to criterion');
  console.log('✔ criteria ->', hitCriteria.lexeme.lemma);

  // 6. Test Historical Occurrences
  const lexWould = 'lex-0067e5569081fd1e2ad3'; // would
  const hist = await LexiconLoader.getHistoricalOccurrences(lexWould);
  assert(hist.length > 0, 'Historical occurrences for would must not be empty');
  // 7. Test Tokenizer
  const LexiconTokenizer = require('../js/lexicon_tokenizer.js');
  const rawSentence = 'In order to "change lives for the better" and reduce "dependency", George Osborne, Chancellor of the Exchequer, introduced the "upfront work search" scheme and spent $30.';
  const tokOccs = LexiconLoader.getOccurrencesByPs(artId, 'P1-S1');
  const html = LexiconTokenizer.renderSentenceHtml(rawSentence, tokOccs, [], 'P1-S1', artId);
  assert(html.includes('Chancellor of the Exchequer'), 'Phrase must be rendered');
  assert(html.includes('data-surface="introduced"'), 'Plain token introduced must be clickable');
  assert(html.includes('data-surface="dependency"'), 'Plain token dependency must be clickable');
  assert(html.includes('<span class="currency-dollar">$</span>30'), 'Currency dollar must be preserved');
  console.log('✔ Tokenizer generated HTML correctly with clickable tokens and preserved currency');

  console.log('\nAll LexiconLoader & Tokenizer tests PASSED! ✨\n');
}

runTests().catch(err => {
  console.error('Test FAILED:', err);
  process.exit(1);
});
