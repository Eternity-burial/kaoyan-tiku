const fs = require('fs');
const path = require('path');

// Load chapters.js
const chaptersCode = fs.readFileSync('js/chapters.js', 'utf8');
eval(chaptersCode.replace('const SHU1_CHAPTERS', 'global.SHU1_CHAPTERS'));

// -------------------------------------------------------------
// Helper: parse example numbers from table string
// -------------------------------------------------------------
function parseExampleNums(text) {
  if (!text) return [];
  text = text.replace(/\s+/g, '');
  const exParts = [];
  const tokens = text.split(/[,、，/及与\+]/);
  for (let tok of tokens) {
    if (tok.includes('习题')) {
      const mEx = tok.match(/例\s*[\d\.\-]+/g);
      if (mEx) exParts.push(...mEx);
    } else {
      exParts.push(tok);
    }
  }

  const nums = [];
  for (let tok of exParts) {
    const cleaned = tok.replace(/（[^）]*）|\([^\)]*\)/g, '');
    const mRange = cleaned.match(/(?:例)?\s*\d+[\.\-](\d+)\s*[–\-\~至到]\s*(?:(?:例)?\s*\d+[\.\-])?(\d+)/);
    if (mRange) {
      const start = parseInt(mRange[1], 10);
      const end = parseInt(mRange[2], 10);
      for (let i = start; i <= end; i++) nums.push(i);
      continue;
    }
    const mSingle = cleaned.match(/(?:例)?\s*\d+[\.\-](\d+)/g);
    if (mSingle) {
      for (let s of mSingle) {
        const m = s.match(/(?:例)?\s*\d+[\.\-](\d+)/);
        if (m) nums.push(parseInt(m[1], 10));
      }
    }
  }
  return [...new Set(nums)].sort((a, b) => a - b);
}

// -------------------------------------------------------------
// 1. Process 基础30讲 (ch1 - ch18)
// -------------------------------------------------------------
function buildJichuData() {
  const dir = path.join(__dirname, '../题库/讲义和笔记/基础高数18讲整理');
  const mdFiles = fs.readdirSync(dir).filter(f => f.endsWith('.md') && !f.startsWith('00_') && !f.includes('附录')).sort();
  const jichuChapters = global.SHU1_CHAPTERS.filter(c => c.wb === '基础30讲' && c.subj === '高数' && !c.short.includes('第0讲'));

  const jichuUpdates = {};

  mdFiles.forEach((f, idx) => {
    const ch = jichuChapters[idx];
    const ownLabels = ch.labels.slice(0, ch.ownTotal || ch.labels.length);
    const exLabels = ownLabels.filter(l => l.includes('例'));
    const pbLabels = ownLabels.filter(l => !l.includes('例'));
    const exCount = exLabels.length;
    const totalOwn = ownLabels.length;

    const content = fs.readFileSync(path.join(dir, f), 'utf8');
    const lines = content.split(/\r?\n/);
    let inTable = false;
    const tableLines = [];
    for (const l of lines) {
      if (l.includes('结构与例题总览') || l.includes('例题总览')) {
        inTable = true;
        continue;
      }
      if (inTable) {
        if (l.trim().startsWith('|')) {
          tableLines.push(l.trim());
        } else if (tableLines.length > 0 && l.trim() !== '') {
          break;
        }
      }
    }

    const rows = [];
    for (let i = 2; i < tableLines.length; i++) {
      const trimmed = tableLines[i].replace(/^\||\|$/g, '');
      const parts = trimmed.split('|').map(s => s.trim());
      let point = parts[0];
      let exStr = '';
      for (let c = parts.length - 1; c >= 0; c--) {
        if (parts[c].includes('例') || parts[c].includes('习题')) {
          exStr = parts[c];
          point = parts.slice(0, c).join(' ');
          break;
        }
      }
      if (exStr) {
        const nums = parseExampleNums(exStr);
        if (nums.length > 0) {
          // clean point name
          point = point.replace(/\s+/g, ' ').trim();
          rows.push({ point, nums });
        }
      }
    }

    // Special case ch3: example 12
    if (idx + 1 === 3) {
      const lastRow = rows.find(r => r.point.includes('微分') || r.nums.includes(11));
      if (lastRow && !lastRow.nums.includes(12)) {
        lastRow.nums.push(12);
        lastRow.nums.sort((a, b) => a - b);
      }
    }

    // Map each example num 1..exCount to a point
    const exPointMap = {};
    rows.forEach(r => {
      r.nums.forEach(n => {
        if (n <= exCount) exPointMap[n] = r.point;
      });
    });

    // Fill any missing by neighboring
    for (let n = 1; n <= exCount; n++) {
      if (!exPointMap[n]) {
        exPointMap[n] = exPointMap[n - 1] || exPointMap[n + 1] || '基础例题精讲';
      }
    }

    // Build contiguous subSections for 例题
    const exSubSections = [];
    let curPoint = null;
    let curStart = 0;
    let curCount = 0;

    for (let i = 0; i < exCount; i++) {
      const n = i + 1;
      const pt = exPointMap[n];
      if (pt !== curPoint) {
        if (curPoint !== null) {
          exSubSections.push({ type: curPoint, start: curStart, count: curCount });
        }
        curPoint = pt;
        curStart = i;
        curCount = 1;
      } else {
        curCount++;
      }
    }
    if (curPoint !== null) {
      exSubSections.push({ type: curPoint, start: curStart, count: curCount });
    }

    // Build sections:
    // Section 1: 例题 (contains exSubSections)
    // Section 2: 课后习题 (if pbLabels exist)
    const sections = [];
    sections.push({
      type: '例题',
      start: 0,
      count: exCount,
      exampleCount: exCount,
      subSections: exSubSections
    });

    if (pbLabels.length > 0) {
      sections.push({
        type: '习题',
        start: exCount,
        count: pbLabels.length,
        exampleCount: 0,
        subSections: [
          { type: '课后习题', start: exCount, count: pbLabels.length }
        ]
      });
    }

    // Build itemDescs for all ownLabels
    const itemDescs = [];
    for (let i = 0; i < totalOwn; i++) {
      const lbl = ownLabels[i];
      if (i < exCount) {
        const pt = exPointMap[i + 1] || '例题';
        itemDescs.push(`${pt} · ${lbl}`);
      } else {
        itemDescs.push(`课后习题 · ${lbl}`);
      }
    }

    jichuUpdates[ch.id] = { sections, itemDescs };
  });

  return jichuUpdates;
}

// -------------------------------------------------------------
// 2. Process 强化36讲 (ch31 - ch48)
// -------------------------------------------------------------
function buildQianghuaData() {
  const dir = path.join(__dirname, '../题库/讲义和笔记/强化高数18讲整理');
  const mdFiles = fs.readdirSync(dir).filter(f => f.endsWith('.md') && !f.startsWith('00_') && !f.includes('附录')).sort();
  const qianghuaChapters = global.SHU1_CHAPTERS.filter(c => c.wb === '强化36讲' && c.subj === '高数');

  const qianghuaUpdates = {};

  mdFiles.forEach((f, idx) => {
    const ch = qianghuaChapters[idx];
    const ownLabels = ch.labels.slice(0, ch.ownTotal || ch.labels.length);
    const exCount = ownLabels.length;

    const content = fs.readFileSync(path.join(dir, f), 'utf8');
    const lines = content.split(/\r?\n/);
    let inTable = false;
    const tableLines = [];
    for (const l of lines) {
      if (l.includes('结构与例题总览') || l.includes('例题总览')) {
        inTable = true;
        continue;
      }
      if (inTable) {
        if (l.trim().startsWith('|')) {
          tableLines.push(l.trim());
        } else if (tableLines.length > 0 && l.trim() !== '') {
          break;
        }
      }
    }

    const rows = [];
    for (let i = 2; i < tableLines.length; i++) {
      const trimmed = tableLines[i].replace(/^\||\|$/g, '');
      const parts = trimmed.split('|').map(s => s.trim());
      if (parts.length >= 2) {
        let point = parts[0];
        const exStr = parts[1];
        let nums = parseExampleNums(exStr);
        if (nums.length === 0 && exStr.includes('例')) {
          nums = parseExampleNums(exStr.replace(/[^例\d\.\-、，–]/g, ''));
        }
        if (nums.length > 0) {
          point = point.replace(/\s+/g, ' ').trim();
          rows.push({ point, nums });
        }
      }
    }

    // Special fixes for ch33 (ex 3, 8) and ch39 (ex 19)
    if (idx + 1 === 3) {
      // 3.3 is f 与 |f| 连续可导关系
      rows.push({ point: '三、$f$ 与 |f| 连续可导关系', nums: [3] });
      // 3.8 is 一点求导
      const p5 = rows.find(r => r.point.includes('一点求导'));
      if (p5) p5.nums.push(8);
      rows.sort((a, b) => a.nums[0] - b.nums[0]);
    }
    if (idx + 1 === 9) {
      // 9.19 is 反常积分计算
      const pLast = rows[rows.length - 1];
      if (pLast && !pLast.nums.includes(19)) {
        pLast.nums.push(19);
        pLast.nums.sort((a, b) => a - b);
      }
    }

    // Map label indices to points
    // Some labels have subparts like "例9-3 (1)", "例9-3 (2)"
    const exPointMap = {};
    for (let i = 0; i < exCount; i++) {
      const lbl = ownLabels[i];
      const m = lbl.match(/例\d+-(\d+)/);
      const exNum = m ? parseInt(m[1], 10) : (i + 1);
      
      // Find row containing exNum
      let matchedRow = rows.find(r => r.nums.includes(exNum));
      if (!matchedRow) {
        // Fallback to nearest row
        matchedRow = rows[rows.length - 1];
      }
      exPointMap[i] = matchedRow ? matchedRow.point : '强化重难点精讲';
    }

    // Build contiguous subSections
    const exSubSections = [];
    let curPoint = null;
    let curStart = 0;
    let curCount = 0;

    for (let i = 0; i < exCount; i++) {
      const pt = exPointMap[i];
      if (pt !== curPoint) {
        if (curPoint !== null) {
          exSubSections.push({ type: curPoint, start: curStart, count: curCount });
        }
        curPoint = pt;
        curStart = i;
        curCount = 1;
      } else {
        curCount++;
      }
    }
    if (curPoint !== null) {
      exSubSections.push({ type: curPoint, start: curStart, count: curCount });
    }

    const sections = [{
      type: '例题',
      start: 0,
      count: exCount,
      exampleCount: exCount,
      subSections: exSubSections
    }];

    const itemDescs = [];
    for (let i = 0; i < exCount; i++) {
      const lbl = ownLabels[i];
      const pt = exPointMap[i];
      itemDescs.push(`${pt} · ${lbl}`);
    }

    qianghuaUpdates[ch.id] = { sections, itemDescs };
  });

  return qianghuaUpdates;
}

// -------------------------------------------------------------
// 3. Process 李范全书 (高数 ch01 - ch11)
// -------------------------------------------------------------
function buildLiFanData() {
  const chNames = [
    '第一章', '第二章', '第三章', '第四章', '第五章',
    '第六章', '第七章', '第八章', '第九章', '第十章', '第十一章'
  ];
  const lifanChapters = global.SHU1_CHAPTERS.filter(c => c.wb === '李范全书' && c.subj === '高数');

  const lifanUpdates = {};

  chNames.forEach((chName, idx) => {
    const ch = lifanChapters[idx];
    const ownLabels = ch.labels.slice(0, ch.ownTotal || ch.labels.length);
    const exLabels = ownLabels.filter(l => l.includes('例'));
    const exCount = exLabels.length;

    const fpath = path.join(__dirname, `../题库/讲义和笔记/李范复习全书整理/李范复习全书_${chName}.md`);
    const content = fs.existsSync(fpath) ? fs.readFileSync(fpath, 'utf8') : '';
    const lines = content.split(/\r?\n/);

    // Extract 题型
    const tiXingList = [];
    let startTiXingEx = Math.min(20, Math.floor(exCount / 2)); // default boundary

    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      const mTx = l.match(/(?:#+|\*\*)\s*(题型[一二三四五六七八九十\d]+[^\n\*\#]+)/);
      if (mTx) {
        tiXingList.push({ name: mTx[1].trim() });
      }
    }

    // Build subSections for 例题:
    // If we have 题型:
    // SubSection 1: 考核知识要点例题 (0 to startTiXingEx)
    // Then distribute remaining examples evenly across 题型 (or 1..2 each)
    const exSubSections = [];
    if (tiXingList.length > 0 && exCount > tiXingList.length) {
      const yaoDianCount = Math.max(1, Math.min(Math.floor(exCount * 0.4), exCount - tiXingList.length));
      exSubSections.push({
        type: '考核知识要点讲解',
        start: 0,
        count: yaoDianCount
      });

      const remainEx = exCount - yaoDianCount;
      const numTx = tiXingList.length;
      let curr = yaoDianCount;
      for (let t = 0; t < numTx; t++) {
        const txName = tiXingList[t].name;
        // calculate count for this 题型
        const count = Math.floor((remainEx - (curr - yaoDianCount)) / (numTx - t));
        if (count > 0 && curr < exCount) {
          exSubSections.push({
            type: txName,
            start: curr,
            count: (t === numTx - 1) ? (exCount - curr) : count
          });
          curr += count;
        }
      }
      if (curr < exCount && exSubSections.length > 0) {
        exSubSections[exSubSections.length - 1].count += (exCount - curr);
      }
    } else {
      exSubSections.push({
        type: '考核知识要点与例题',
        start: 0,
        count: exCount
      });
    }

    // Sections for 李范全书:
    // Section 1: 例题 (contains exSubSections)
    // Note: The 习题 sections (选择题, 填空题, etc.) are appended during mergeLiFanIntoBooks!
    const sections = [{
      type: '例题',
      start: 0,
      count: exCount,
      exampleCount: exCount,
      subSections: exSubSections
    }];

    // Item descs for 例题
    const itemDescs = [];
    for (let i = 0; i < exCount; i++) {
      const sub = exSubSections.find(s => i >= s.start && i < s.start + s.count);
      const subType = sub ? sub.type : '例题';
      itemDescs.push(`${subType} · ${ownLabels[i]}`);
    }

    lifanUpdates[ch.id] = { sections, itemDescs };
  });

  return lifanUpdates;
}

// -------------------------------------------------------------
// 4. Process 老姚高数 (ch01 - ch12)
// -------------------------------------------------------------
function buildLaoYaoData() {
  const laoyaoChapters = global.SHU1_CHAPTERS.filter(c => c.wb === '老姚高数');
  const laoyaoUpdates = {};

  laoyaoChapters.forEach(ch => {
    const sections = JSON.parse(JSON.stringify(ch.sections));
    const itemDescs = new Array(ch.labels.length);

    sections.forEach(s => {
      // If no subSections, split into 例题 and 补充练习
      if (!s.subSections) {
        if (s.exampleCount === undefined || s.exampleCount >= s.count) {
          s.subSections = [
            { type: '例题', start: s.start, count: s.count }
          ];
        } else {
          s.subSections = [
            { type: '例题', start: s.start, count: s.exampleCount },
            { type: '补充练习', start: s.start + s.exampleCount, count: s.count - s.exampleCount }
          ];
        }
      }

      // Generate itemDescs for all questions in this section
      for (let i = s.start; i < s.start + s.count; i++) {
        const sub = s.subSections.find(ss => i >= ss.start && i < ss.start + ss.count);
        const subName = sub ? sub.type : (i < s.start + (s.exampleCount || 0) ? '例题' : '补充练习');
        itemDescs[i] = `${s.type} · ${subName} · ${ch.labels[i]}`;
      }
    });

    laoyaoUpdates[ch.id] = { sections, itemDescs };
  });

  return laoyaoUpdates;
}

console.log('Testing builders:');
const jichu = buildJichuData();
console.log('Jichu chapters built:', Object.keys(jichu).length);

const qianghua = buildQianghuaData();
console.log('Qianghua chapters built:', Object.keys(qianghua).length);

const lifan = buildLiFanData();
console.log('LiFan chapters built:', Object.keys(lifan).length);

const laoyao = buildLaoYaoData();
console.log('LaoYao chapters built:', Object.keys(laoyao).length);

