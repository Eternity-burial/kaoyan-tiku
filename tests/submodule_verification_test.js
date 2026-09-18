/**
 * 考研题库 - 子模块解耦架构完整性与图源连通性自动化测试
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { execSync } = require('child_process');

console.log('====================================================');
console.log('  考研题库 - Git 子模块解耦架构完整性测试');
console.log('====================================================\n');

const ROOT_DIR = path.resolve(__dirname, '..');

const EXPECTED_MODULES = [
  '880', '1000题', '822教材', '基础30讲', '夜雨强化',
  '小题300', '强化240', '强化36讲', '李范习题', '李范全书', '真题分类', '老姚高数', '英语精读PDF', '讲义和笔记', 'kaoyan-lazynote-data'
];

let passed = 0;
let failed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  \x1b[32m✔\x1b[0m ${name}`);
    passed++;
  } catch (e) {
    console.error(`  \x1b[31m✖\x1b[0m ${name}: ${e.message}`);
    failed++;
  }
}

runTest('1. .gitmodules 配置文件格式完整且覆盖全部 15 个资源子模块', () => {
  const gmPath = path.join(ROOT_DIR, '.gitmodules');
  assert(fs.existsSync(gmPath), '.gitmodules must exist');
  const gmContent = fs.readFileSync(gmPath, 'utf8');
  EXPECTED_MODULES.forEach(b => {
    assert(gmContent.includes(`submodule "题库/${b}"`), `Must register submodule "题库/${b}" in .gitmodules`);
    assert(gmContent.includes(`path = 题库/${b}`), `Must configure path for 题库/${b}`);
    assert(gmContent.includes(`url = https://github.com/Eternity-burial/`), `Must point to Eternity-burial remote`);
  });
});

runTest('2. 15 个资源子模块本地文件与目录物理完整存在', () => {
  EXPECTED_MODULES.forEach(b => {
    const bookDir = path.join(ROOT_DIR, '题库', b);
    assert(fs.existsSync(bookDir), `Directory must exist: ${bookDir}`);
    const files = fs.readdirSync(bookDir);
    assert(files.length > 0, `Directory ${b} must not be empty`);
  });
});

runTest('3. 主仓库 Git 索引仅保留纯代码与数据，杜绝题图与 PDF 大文件污染', () => {
  const stdout = execSync('git ls-files', { cwd: ROOT_DIR, encoding: 'utf8' });
  const lines = stdout.split('\n').filter(l => l.trim().length > 0);
  // Total files in main repo index should be ~95
  assert(lines.length < 150, `Main repository index should be lightweight (found ${lines.length} files)`);
  // Ensure no raw image or pdf files are directly tracked in main repo
  const trackedBinaries = lines.filter(l => l.endsWith('.png') || l.endsWith('.jpg') || l.endsWith('.jpeg') || l.endsWith('.pdf'));
  assert.strictEqual(trackedBinaries.length, 0, `Main repo index must NOT track binary image/pdf files (found ${trackedBinaries.length})`);
});

runTest('4. 前端 chapters.js 图片路径解析与子模块挂载 100% 物理连通', () => {
  const chaptersSrc = fs.readFileSync(path.join(ROOT_DIR, 'js/chapters.js'), 'utf8');
  const mockWindow = {};
  new Function('window', chaptersSrc + '\nwindow.SUBJECTS = SUBJECTS;')(mockWindow);
  const mathSubj = mockWindow.SUBJECTS.find(s => s.id === 'math');
  const sub822 = mockWindow.SUBJECTS.find(s => s.id === '822');

  // Test 880 sample image
  const ch880 = mathSubj.chapters.find(c => c.id === 'math::880::高数::ch01');
  assert(ch880, 'math::880::高数::ch01 must exist');
  const imgRel880 = mathSubj.getImgPath(ch880, ch880.labels[0]) + '_question.png';
  assert(fs.existsSync(path.join(ROOT_DIR, imgRel880)), `Image must exist on disk: ${imgRel880}`);

  // Test 老姚高数 sample image
  const chLaoyao = mathSubj.chapters.find(c => c.id === 'math::老姚高数::高数::ch01');
  assert(chLaoyao, 'math::老姚高数::高数::ch01 must exist');
  const imgRelLaoyao = mathSubj.getImgPath(chLaoyao, '1-1') + '_question.png';
  assert(fs.existsSync(path.join(ROOT_DIR, imgRelLaoyao)), `Image must exist on disk: ${imgRelLaoyao}`);

  // Test 822教材 sample image
  const ch822 = sub822.chapters[0];
  assert(ch822, 'ch822 must exist');
  const imgRel822 = sub822.getImgPath(ch822, ch822.labels[0]) + '_question.png';
  assert(fs.existsSync(path.join(ROOT_DIR, imgRel822)), `Image must exist on disk: ${imgRel822}`);
});

runTest('5. 英语精读 PDF 子模块物理结构与双轨分类完整性（48篇考点标注 + 48篇个人精读 + 1篇词汇汇总）', () => {
  const pdfBase = path.join(ROOT_DIR, '题库', '英语精读PDF');
  assert(fs.existsSync(pdfBase), '英语精读PDF directory must exist');
  
  const examDir = path.join(pdfBase, '考点标注版');
  const personalDir = path.join(pdfBase, '个人精读版');
  const vocabDir = path.join(pdfBase, '词汇汇总');
  
  assert(fs.existsSync(examDir), '考点标注版 directory must exist');
  assert(fs.existsSync(personalDir), '个人精读版 directory must exist');
  assert(fs.existsSync(vocabDir), '词汇汇总 directory must exist');
  
  const examFiles = fs.readdirSync(examDir).filter(f => f.endsWith('.pdf'));
  const personalFiles = fs.readdirSync(personalDir).filter(f => f.endsWith('.pdf'));
  const vocabFiles = fs.readdirSync(vocabDir).filter(f => f.endsWith('.pdf'));
  
  assert.strictEqual(examFiles.length, 48, `考点标注版 should contain 48 PDFs, found ${examFiles.length}`);
  assert.strictEqual(personalFiles.length, 48, `个人精读版 should contain 48 PDFs, found ${personalFiles.length}`);
  assert.strictEqual(vocabFiles.length, 1, `词汇汇总 should contain 1 PDF, found ${vocabFiles.length}`);
});

runTest('6. 讲义和笔记子模块物理结构与核心分类完整性（10大分类目录 + 198份文档与高清笔记）', () => {
  const notesBase = path.join(ROOT_DIR, '题库', '讲义和笔记');
  assert(fs.existsSync(notesBase), '讲义和笔记 directory must exist');

  const expectedDirs = [
    '基础高数18讲整理', '基础线代6讲', '基础概率论6讲',
    '强化高数18讲整理', '强化线代9讲', '强化概率9讲',
    '零基础通关讲义整理', '李范复习全书整理',
    '数学笔记', '老姚高数_源码题库'
  ];

  expectedDirs.forEach(d => {
    const dirPath = path.join(notesBase, d);
    assert(fs.existsSync(dirPath), `Subdirectory must exist: ${d}`);
  });

  const reportPath = path.join(notesBase, '老姚高数_例题与补充练习统计报告.md');
  assert(fs.existsSync(reportPath), '老姚高数_例题与补充练习统计报告.md must exist');

  // Count asset files (excluding .git, .gitignore, README.md)
  let count = 0;
  function walkDir(cur) {
    const entries = fs.readdirSync(cur, { withFileTypes: true });
    for (const ent of entries) {
      if (ent.name === '.git') continue;
      const full = path.join(cur, ent.name);
      if (ent.isDirectory()) {
        walkDir(full);
      } else {
        if (ent.name !== '.gitignore' && ent.name !== 'README.md') {
          count++;
        }
      }
    }
  }
  walkDir(notesBase);
  assert.strictEqual(count, 198, `讲义和笔记 should contain exactly 198 asset files, found ${count}`);
});

runTest('7. kaoyan-lazynote-data 子模块物理结构与原始数据集完整性（7978份文件 + records/raw/crawler/manifests）', () => {
  const lnBase = path.join(ROOT_DIR, '题库', 'kaoyan-lazynote-data');
  assert(fs.existsSync(lnBase), 'kaoyan-lazynote-data directory must exist');

  const expectedDirs = ['audit', 'crawler', 'indexes', 'manifests', 'raw', 'records', 'schemas'];
  expectedDirs.forEach(d => {
    const dp = path.join(lnBase, d);
    assert(fs.existsSync(dp), `Directory must exist: ${d}`);
  });

  const readmePath = path.join(lnBase, 'README.md');
  assert(fs.existsSync(readmePath), 'kaoyan-lazynote-data README.md must exist');

  // Count all tracked non-.git files
  let count = 0;
  function walkDir(cur) {
    const entries = fs.readdirSync(cur, { withFileTypes: true });
    for (const ent of entries) {
      if (ent.name === '.git') continue;
      const full = path.join(cur, ent.name);
      if (ent.isDirectory()) {
        walkDir(full);
      } else {
        count++;
      }
    }
  }
  walkDir(lnBase);
  assert.strictEqual(count, 7978, `kaoyan-lazynote-data should contain exactly 7978 files, found ${count}`);
});

console.log(`\n====================================================`);
console.log(`  测试结果: ${passed} passed, ${failed} failed`);
console.log(`====================================================`);

if (failed > 0) process.exit(1);
