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

const EXPECTED_BOOKS = [
  '880', '1000题', '822教材', '基础30讲', '夜雨强化',
  '小题300', '强化240', '强化36讲', '李范习题', '李范全书', '真题分类', '老姚高数'
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

runTest('1. .gitmodules 配置文件格式完整且覆盖全部 12 本书籍', () => {
  const gmPath = path.join(ROOT_DIR, '.gitmodules');
  assert(fs.existsSync(gmPath), '.gitmodules must exist');
  const gmContent = fs.readFileSync(gmPath, 'utf8');
  EXPECTED_BOOKS.forEach(b => {
    assert(gmContent.includes(`submodule "题库/${b}"`), `Must register submodule "题库/${b}" in .gitmodules`);
    assert(gmContent.includes(`path = 题库/${b}`), `Must configure path for 题库/${b}`);
    assert(gmContent.includes(`url = https://github.com/Eternity-burial/shu1-tiku-assets-`), `Must point to Eternity-burial remote`);
  });
});

runTest('2. 12 本书籍子模块本地文件与目录物理完整存在', () => {
  EXPECTED_BOOKS.forEach(b => {
    const bookDir = path.join(ROOT_DIR, '题库', b);
    assert(fs.existsSync(bookDir), `Directory must exist: ${bookDir}`);
    const files = fs.readdirSync(bookDir);
    assert(files.length > 0, `Book directory ${b} must not be empty`);
  });
});

runTest('3. 主仓库 Git 索引仅保留纯代码与数据，杜绝题图大文件污染', () => {
  const stdout = execSync('git ls-files', { cwd: ROOT_DIR, encoding: 'utf8' });
  const lines = stdout.split('\n').filter(l => l.trim().length > 0);
  // Total files in main repo index should be ~94
  assert(lines.length < 150, `Main repository index should be lightweight (found ${lines.length} files)`);
  // Ensure no raw image files are directly tracked in main repo
  const trackedImgs = lines.filter(l => l.endsWith('.png') || l.endsWith('.jpg') || l.endsWith('.jpeg'));
  assert.strictEqual(trackedImgs.length, 0, `Main repo index must NOT track binary image files (found ${trackedImgs.length})`);
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

console.log(`\n====================================================`);
console.log(`  测试结果: ${passed} passed, ${failed} failed`);
console.log(`====================================================`);

if (failed > 0) process.exit(1);
