/**
 * 考研题库 · 全局学习进度与仪表盘模块 (Dashboard)
 *
 * 职责：
 *   1. 考研学习日与时间判定算法（以每日清晨 04:00 为分界，深夜学习归属前一日）。
 *   2. 统计当前科目下全部书籍与章节的掌握度、做题进度、未做题数。
 *   3. 绘制全屏仪表盘视图：
 *      - 全景总掌握度清华紫高 DPI 渐变环形表 (drawMasterGauge)
 *      - 近 14 天做题推进柱状趋势图与日均线 (drawTrendChart)
 *      - 各书籍同心圆环形图（抗摩尔纹连续轨道）(drawDonut)
 *   4. 章节维度详情列表展示与跳转交互 (openDashboardDetail, jumpToChapter)。
 */

(function () {
  'use strict';

  var dashboardOpen = false;
  var dashboardDetailReturn = false;

  // 依赖的全局环境适配
  function getChapters() {
    if (typeof window.CHAPTERS !== 'undefined' && Array.isArray(window.CHAPTERS) && window.CHAPTERS.length > 0) {
      return window.CHAPTERS;
    }
    if (typeof CHAPTERS !== 'undefined' && Array.isArray(CHAPTERS) && CHAPTERS.length > 0) {
      return CHAPTERS;
    }
    if (typeof window.curSubject !== 'undefined' && window.curSubject && Array.isArray(window.curSubject.chapters)) {
      return window.curSubject.chapters;
    }
    if (typeof curSubject !== 'undefined' && curSubject && Array.isArray(curSubject.chapters)) {
      return curSubject.chapters;
    }
    var subjectsList = (typeof window.SUBJECTS !== 'undefined') ? window.SUBJECTS : (typeof SUBJECTS !== 'undefined' ? SUBJECTS : null);
    if (subjectsList && Array.isArray(subjectsList)) {
      var curSubjId = (typeof window.curSubjectId !== 'undefined') ? window.curSubjectId : (typeof curSubjectId !== 'undefined' ? curSubjectId : 'math');
      var subj = subjectsList.find(function(s) { return s.id === curSubjId; });
      if (subj && subj.chapters) return subj.chapters;
      if (subjectsList[0] && subjectsList[0].chapters) return subjectsList[0].chapters;
    }
    return [];
  }

  function getChStatusMap(ch) {
    if (typeof window.getChapterStatusMap === 'function') {
      return window.getChapterStatusMap(ch);
    }
    if (typeof getChapterStatusMap === 'function') {
      return getChapterStatusMap(ch);
    }
    if (window.StorageEngine && ch && ch.uid) {
      var store = new window.StorageEngine.ChapterStore(ch);
      var out = {};
      store.readIntoMemory({ statuses: out }, 0);
      return out;
    }
    return {};
  }

  function getBookChapters(wb) {
    var chapters = getChapters();
    return chapters.filter(function (c) {
      return (c.statsWb || c.wb) === wb && c.total > 0;
    });
  }

  function getChProgress(ch) {
    var statusObj = getChStatusMap(ch);
    var done = 0;
    var len = ch.ownTotal || ch.total || 0;
    for (var i = 0; i < len; i++) {
      var s = statusObj[i];
      if (s === 'proficient' || s === 'familiar' || s === 'vague' || s === 'rusty' || s === 'wrong') done++;
    }
    return { progress: len > 0 ? done / len : 0, done: done, total: len };
  }

  function getChStats(ch) {
    var statusObj = getChStatusMap(ch);
    var lv5 = 0, lv4 = 0, lv3 = 0, lv2 = 0, lv1 = 0;
    var len = ch.ownTotal || ch.total || 0;
    for (var i = 0; i < len; i++) {
      var s = statusObj[i];
      if (s === 'proficient') lv5++;
      else if (s === 'familiar') lv4++;
      else if (s === 'vague') lv3++;
      else if (s === 'rusty') lv2++;
      else if (s === 'wrong') lv1++;
    }
    var done = lv5 + lv4 + lv3 + lv2 + lv1;
    return {
      lv5: lv5, lv4: lv4, lv3: lv3, lv2: lv2, lv1: lv1,
      proficient: lv5 + lv4, vague: lv3 + lv2, wrong: lv1,
      unmarked: len - done, done: done,
      pct: len > 0 ? Math.round(done / len * 100) : 0
    };
  }

  function dbLerpColor(c1, c2, t) {
    return [
      Math.round(c1[0] + (c2[0] - c1[0]) * t),
      Math.round(c1[1] + (c2[1] - c1[1]) * t),
      Math.round(c1[2] + (c2[2] - c1[2]) * t)
    ];
  }

  // 计算当前激活科目下所有章节的全量总览数据
  function getSubjectOverallStats() {
    var totalQ = 0, doneQ = 0, profQ = 0, vagQ = 0, wrongQ = 0;
    var chapters = getChapters();
    for (var i = 0; i < chapters.length; i++) {
      var ch = chapters[i];
      if (!ch || ch.total === 0) continue;
      var stats = getChStats(ch);
      var len = ch.ownTotal || ch.total;
      totalQ += len;
      doneQ += stats.done;
      profQ += (stats.lv5 + stats.lv4);
      vagQ += (stats.lv3 + stats.lv2);
      wrongQ += stats.lv1;
    }
    var pct = totalQ > 0 ? Math.round((doneQ / totalQ) * 100) : 0;
    var profPct = totalQ > 0 ? Math.round((profQ / totalQ) * 100) : 0;
    return {
      total: totalQ,
      done: doneQ,
      proficient: profQ,
      vague: vagQ,
      wrong: wrongQ,
      unmarked: totalQ - doneQ,
      progressPct: pct,
      proficientPct: profPct
    };
  }

  // 考研学习日判定算法：以每日清晨 04:00 为分界（00:00~03:59 的深夜复习归属前一学习日）
  function getStudyDayDate(ts) {
    var d = ts ? new Date(ts) : new Date();
    return new Date(d.getTime() - 4 * 3600 * 1000);
  }

  function getStudyDayKey(ts) {
    var sd = getStudyDayDate(ts);
    var y = sd.getFullYear();
    var m = String(sd.getMonth() + 1).padStart(2, '0');
    var d = String(sd.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  function getStudyDayIndex(ts) {
    var sd = getStudyDayDate(ts);
    return Math.floor(Date.UTC(sd.getFullYear(), sd.getMonth(), sd.getDate()) / (24 * 3600 * 1000));
  }

  // 获取最近 N 天的每日推进刷题数据（按每日清晨 04:00 归集考研学习日）
  function getDailyStudyData(daysCount) {
    if (!daysCount) daysCount = 14;
    var dailyMap = {};
    var baseDay = getStudyDayDate();

    for (var i = daysCount - 1; i >= 0; i--) {
      var d = new Date(baseDay.getTime() - i * 24 * 60 * 60 * 1000);
      var y = d.getFullYear();
      var m = String(d.getMonth() + 1).padStart(2, '0');
      var day = String(d.getDate()).padStart(2, '0');
      var key = y + '-' + m + '-' + day;
      var label = (d.getMonth() + 1) + '/' + d.getDate();
      dailyMap[key] = { key: key, label: label, count: 0, date: d };
    }

    // 从 V3 SSOT 题库数据 (kaoyan.q.*) 及历史 SM-2 记录中回填做题与复习数据
    for (var k = 0; k < localStorage.length; k++) {
      var lk = localStorage.key(k);
      if (lk && (lk.startsWith('kaoyan.q.') || lk.startsWith('sm2_'))) {
        try {
          var data = JSON.parse(localStorage.getItem(lk));
          if (data && typeof data === 'object') {
            Object.values(data).forEach(function (record) {
              if (record && typeof record === 'object') {
                var hist = (record.sm2 && Array.isArray(record.sm2.history)) ? record.sm2.history : (Array.isArray(record.history) ? record.history : null);
                if (hist) {
                  hist.forEach(function (h) {
                    if (h && h.date) {
                      var dk = getStudyDayKey(h.date);
                      if (dailyMap[dk]) {
                        dailyMap[dk].count++;
                      }
                    }
                  });
                }
              }
            });
          }
        } catch (e) {}
      }
    }

    // 叠加实时学习打卡日志 (通过规范 SSOT 存储引擎 GlobalStore 读取)
    try {
      var studyLog = null;
      if (window.StorageEngine && window.StorageEngine.GlobalStore) {
        studyLog = window.StorageEngine.GlobalStore.get('study_log');
      }
      if (studyLog) {
        Object.keys(studyLog).forEach(function (dk) {
          if (dailyMap[dk]) {
            dailyMap[dk].count = Math.max(dailyMap[dk].count, studyLog[dk].count || 0);
          }
        });
      }
    } catch (e) {}

    return Object.values(dailyMap);
  }

  function recordStudyActivity() {
    var dk = getStudyDayKey(Date.now());
    try {
      var studyLog = null;
      if (window.StorageEngine && window.StorageEngine.GlobalStore) {
        studyLog = window.StorageEngine.GlobalStore.get('study_log');
      }
      studyLog = studyLog || {};
      studyLog[dk] = studyLog[dk] || { count: 0 };
      studyLog[dk].count++;
      if (window.StorageEngine && window.StorageEngine.GlobalStore) {
        window.StorageEngine.GlobalStore.set('study_log', studyLog);
      }
      if (window.storageSync && typeof window.storageSync.scheduleSave === 'function') {
        window.storageSync.scheduleSave();
      }
    } catch (e) {}
  }

  function roundRect(ctx, x, y, width, height, radius) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    if (height <= 0) return;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, 0);
    ctx.arcTo(x, y + height, x, y, 0);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  }

  // 绘制总掌握度主环形进度表（清华紫纯正渐变）
  function drawMasterGauge(canvas, stats) {
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var size = 90;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    var isDark = (typeof window.currentTheme !== 'undefined' ? window.currentTheme : 'light') === 'dark';
    var cx = size / 2, cy = size / 2;
    var r = 36;
    var lineWidth = 7;
    var p = stats.total > 0 ? (stats.done / stats.total) : 0;

    ctx.clearRect(0, 0, size, size);

    // 底轨
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(102, 8, 116, 0.08)';
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // 渐变进度条
    if (p > 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + p * 2 * Math.PI);
      var grad = ctx.createLinearGradient(0, 0, size, size);
      if (isDark) {
        grad.addColorStop(0, '#cf6fe8');
        grad.addColorStop(1, '#8a2b9c');
      } else {
        grad.addColorStop(0, '#8a2b9c');
        grad.addColorStop(1, '#660874');
      }
      ctx.strokeStyle = grad;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  }

  // 绘制近 14 天推进趋势图（高 DPI 柱状与日均线，清华紫系）
  function drawTrendChart(canvas, dailyData) {
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var container = canvas.parentElement;
    var width = container ? container.clientWidth : 600;
    var height = 130;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    var isDark = (typeof window.currentTheme !== 'undefined' ? window.currentTheme : 'light') === 'dark';
    ctx.clearRect(0, 0, width, height);

    if (!dailyData || dailyData.length === 0) return;

    var paddingLeft = 32, paddingRight = 16, paddingTop = 22, paddingBottom = 24;
    var chartW = width - paddingLeft - paddingRight;
    var chartH = height - paddingTop - paddingBottom;

    var maxVal = 0;
    var sum = 0;
    dailyData.forEach(function (d) {
      if (d.count > maxVal) maxVal = d.count;
      sum += d.count;
    });
    if (maxVal < 10) maxVal = 10;
    else maxVal = Math.ceil(maxVal * 1.18);

    var avg = Math.round(sum / dailyData.length);

    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';
    ctx.lineWidth = 1;
    ctx.fillStyle = isDark ? '#7a7a8c' : '#999999';
    ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (var s = 0; s <= 2; s++) {
      var val = Math.round((maxVal / 2) * s);
      var y = paddingTop + chartH - (val / maxVal) * chartH;
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.stroke();
      ctx.fillText(String(val), paddingLeft - 6, y);
    }

    var count = dailyData.length;
    var barGap = 6;
    var totalBarWidth = (chartW - (count - 1) * barGap) / count;
    var barWidth = Math.min(26, Math.max(10, totalBarWidth));
    var actualGap = count > 1 ? (chartW - barWidth * count) / (count - 1) : 0;

    ctx.textAlign = 'center';

    dailyData.forEach(function (d, idx) {
      var x = paddingLeft + idx * (barWidth + actualGap);
      var barH = (d.count / maxVal) * chartH;
      var y = paddingTop + chartH - barH;

      ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)';
      roundRect(ctx, x, paddingTop, barWidth, chartH, 3);
      ctx.fill();

      if (d.count > 0) {
        var grad = ctx.createLinearGradient(0, y, 0, paddingTop + chartH);
        if (isDark) {
          grad.addColorStop(0, '#cf6fe8');
          grad.addColorStop(1, 'rgba(102, 8, 116, 0.65)');
        } else {
          grad.addColorStop(0, '#8a2b9c');
          grad.addColorStop(1, '#660874');
        }
        ctx.fillStyle = grad;
        roundRect(ctx, x, y, barWidth, barH, 3);
        ctx.fill();

        ctx.fillStyle = isDark ? '#e2e2e8' : '#333333';
        ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(String(d.count), x + barWidth / 2, y - 5);
      }

      ctx.fillStyle = isDark ? '#8e8e9c' : '#777777';
      ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(d.label, x + barWidth / 2, height - 8);
    });

    if (avg > 0) {
      var avgY = paddingTop + chartH - (avg / maxVal) * chartH;
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = isDark ? 'rgba(207, 111, 232, 0.65)' : 'rgba(102, 8, 116, 0.5)';
      ctx.lineWidth = 1.2;
      ctx.moveTo(paddingLeft, avgY);
      ctx.lineTo(width - paddingRight, avgY);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // 绘制分书籍同心圆环形图（纯正清华紫系 + 抗摩尔纹）
  function drawDonut(canvas, chapters, label) {
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var size = 260;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    var isDark = (typeof window.currentTheme !== 'undefined' ? window.currentTheme : 'light') === 'dark';
    var cx = size / 2, cy = size / 2;
    var outerR = 108;
    var innerR = 28;
    var ringCount = chapters.length;
    if (ringCount === 0) {
      ctx.fillStyle = isDark ? '#888' : '#999';
      ctx.font = '14px "Microsoft YaHei",sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('(无数据)', cx, cy);
      return;
    }
    var ringWidth = (outerR - innerR) / ringCount;

    ctx.clearRect(0, 0, size, size);

    var purpleDark = isDark ? [207, 111, 232] : [102, 8, 116];
    var purpleLight = isDark ? [102, 8, 116] : [225, 190, 231];
    var unfilledColor = isDark ? 'rgba(255, 255, 255, 0.05)' : '#f2edf4';
    var centerBg = isDark ? '#22232a' : '#ffffff';
    var strokeColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)';
    var labelColor = isDark ? '#e2e2e8' : '#333333';
    var pctColor = isDark ? '#cf6fe8' : '#660874';

    // 1. 一次性绘制连续光滑的整圈底轨，消除摩尔纹
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, 2 * Math.PI);
    ctx.arc(cx, cy, innerR, 0, 2 * Math.PI, true);
    ctx.closePath();
    ctx.fillStyle = unfilledColor;
    ctx.fill();

    var totalDone = 0, totalQ = 0;

    // 2. 绘制各章节进度扇形弧
    for (var i = 0; i < ringCount; i++) {
      var ri = innerR + i * ringWidth;
      var ro = innerR + (i + 1) * ringWidth;
      var pr = getChProgress(chapters[i]);
      totalDone += pr.done;
      totalQ += pr.total;
      var p = pr.progress;
      if (p > 0) {
        var color = dbLerpColor(purpleLight, purpleDark, p);
        var cStr = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
        ctx.beginPath();
        ctx.arc(cx, cy, ro, -Math.PI / 2, -Math.PI / 2 + p * 2 * Math.PI);
        ctx.arc(cx, cy, ri, -Math.PI / 2 + p * 2 * Math.PI, -Math.PI / 2, true);
        ctx.closePath();
        ctx.fillStyle = cStr;
        ctx.fill();
      }
    }

    // 中心圆卡片
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, 2 * Math.PI);
    ctx.fillStyle = centerBg;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;
    ctx.stroke();

    var pct = totalQ > 0 ? Math.round(totalDone / totalQ * 100) : 0;
    ctx.fillStyle = labelColor;
    ctx.font = 'bold 12px "Microsoft YaHei","PingFang SC",sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, cx, cy - 9);
    ctx.fillStyle = pctColor;
    ctx.font = 'bold 17px "Microsoft YaHei","PingFang SC",sans-serif';
    ctx.fillText(pct + '%', cx, cy + 11);
  }

  function showDashboardBackBtn(show) {
    var btn = document.getElementById('btnBackDashboard');
    if (btn) {
      btn.style.display = show ? '' : 'none';
      if (show && typeof window.alignBackBtnToMainArea === 'function') {
        window.alignBackBtnToMainArea(btn);
      }
    }
    dashboardDetailReturn = show;
  }

  function backToDashboardOverview() {
    renderDashboardOverview();
  }

  function renderDashboardOverview() {
    showDashboardBackBtn(false);
    if (typeof window.renderCountdown === 'function') window.renderCountdown();
    var dbO = document.getElementById('dbOverview');
    if (dbO) dbO.style.display = '';
    var dbD = document.getElementById('dbDetail');
    if (dbD) dbD.style.display = 'none';

    var stats = getSubjectOverallStats();
    var pctEl = document.getElementById('dbMasterPct');
    if (pctEl) pctEl.textContent = stats.progressPct + '%';

    var metricDone = document.getElementById('dbMetricDone');
    if (metricDone) metricDone.textContent = stats.done + ' / ' + stats.total;

    var metricProf = document.getElementById('dbMetricProf');
    if (metricProf) metricProf.textContent = stats.proficient + ' 题 (' + stats.proficientPct + '%)';

    var metricVag = document.getElementById('dbMetricVag');
    if (metricVag) metricVag.textContent = stats.vague + ' 题';

    var metricWrong = document.getElementById('dbMetricWrong');
    if (metricWrong) metricWrong.textContent = stats.wrong + ' 题';

    var dailyData = getDailyStudyData(14);
    var totalPeriod = 0;
    dailyData.forEach(function (d) { totalPeriod += d.count; });
    var avgPeriod = Math.round(totalPeriod / dailyData.length);

    var tagTotal = document.getElementById('dbTrendTotal');
    if (tagTotal) tagTotal.textContent = '近14天累计: ' + totalPeriod + ' 题';

    var tagAvg = document.getElementById('dbTrendAvg');
    if (tagAvg) tagAvg.textContent = '日均: ' + avgPeriod + ' 题/天';

    var grid = document.getElementById('dbGrid');
    var html = '';
    var books = (typeof window.getSortedWbs === 'function') ? window.getSortedWbs() : [];
    if (!books || books.length === 0) {
      var existingWbs = [];
      getChapters().forEach(function(c) {
        var w = c.statsWb || c.wb;
        if (w && existingWbs.indexOf(w) === -1 && w !== '1000题' && w !== '李范习题') existingWbs.push(w);
      });
      books = existingWbs.map(function(w) {
        var lbl = (typeof window.getWbLabel === 'function') ? window.getWbLabel(w) : w;
        return { wb: w, label: lbl };
      });
    }
    for (var b = 0; b < books.length; b++) {
      var wb = books[b].wb;
      var cid = 'dbCanvas' + b;
      html += '<div class="db-donut-card" data-wb="' + wb + '" onclick="Dashboard.openDetail(\'' + wb + '\')">' +
        '<canvas id="' + cid + '"></canvas>' +
      '</div>';
    }
    if (grid) grid.innerHTML = html;

    setTimeout(function () {
      var masterCanvas = document.getElementById('dbMasterCanvas');
      if (masterCanvas) drawMasterGauge(masterCanvas, stats);

      var trendCanvas = document.getElementById('dbTrendCanvas');
      if (trendCanvas) drawTrendChart(trendCanvas, dailyData);

      for (var b = 0; b < books.length; b++) {
        var wb = books[b].wb;
        var chapters = getBookChapters(wb);
        var canvas = document.getElementById('dbCanvas' + b);
        if (canvas) drawDonut(canvas, chapters, books[b].label);
      }
    }, 20);
  }

  function openDashboardDetail(wb) {
    showDashboardBackBtn(true);
    var dbO = document.getElementById('dbOverview');
    if (dbO) dbO.style.display = 'none';
    var dbD = document.getElementById('dbDetail');
    if (dbD) dbD.style.display = '';
    var titleEl = document.getElementById('dbDetailTitle');
    var wbLabel = (typeof window.getWbLabel === 'function') ? window.getWbLabel(wb) : wb;
    if (titleEl) titleEl.textContent = wbLabel + ' — 章节进度';

    var chapters = getBookChapters(wb);
    var grid = document.getElementById('dbDetailList');

    function cardHtml(ch) {
      var name = ch.short || ch.name;
      var stats = getChStats(ch);
      return '<div class="db-chapter-card" data-cid="' + ch.id + '" onclick="Dashboard.jumpToChapter(\'' + ch.id + '\')">' +
        '<div class="db-chapter-name">' + name + '</div>' +
        '<div class="db-chapter-bar"><div class="db-chapter-fill" style="width:' + stats.pct + '%"></div></div>' +
        '<div class="db-chapter-stats">' +
          '<span class="db-stat"><span class="db-stat-dot" style="background:#389E0D"></span>熟练 ' + stats.proficient + '</span>' +
          '<span class="db-stat"><span class="db-stat-dot" style="background:#FBC02D"></span>模糊 ' + stats.vague + '</span>' +
          '<span class="db-stat"><span class="db-stat-dot" style="background:#D32F2F"></span>不会 ' + stats.wrong + '</span>' +
          '<span class="db-stat"><span class="db-stat-dot" style="background:#ccc"></span>未做 ' + stats.unmarked + '</span>' +
        '</div></div>';
    }

    var colMap = {};
    chapters.forEach(function (ch) {
      var bs = (typeof window.baseSubject === 'function') ? window.baseSubject(ch.subj) : ch.subj;
      (colMap[bs] = colMap[bs] || []).push(ch);
    });

    var subOrder = (typeof window.SUBJECT_ORDER !== 'undefined') ? window.SUBJECT_ORDER : ['高数', '线代', '概率论'];
    var colKeys = [];
    subOrder.forEach(function (s) { if (colMap[s]) colKeys.push(s); });
    Object.keys(colMap).forEach(function (s) { if (colKeys.indexOf(s) === -1) colKeys.push(s); });

    var html = '';
    colKeys.forEach(function (bs) {
      var colChs = colMap[bs];
      html += '<div class="db-subject-col">' +
        '<div class="db-subject-header">' + bs + ' <span class="db-subject-count">' + colChs.length + ' 章</span></div>';
      var hasSub = colChs.some(function (ch) { return /^(基础篇|强化篇)/.test(ch.subj); });
      if (hasSub) {
        ['基础篇', '强化篇'].forEach(function (pfx) {
          var group = colChs.filter(function (ch) { return String(ch.subj).indexOf(pfx) === 0; });
          if (group.length === 0) return;
          html += '<div class="db-subject-subheader">' + pfx + '</div>';
          group.forEach(function (ch) { html += cardHtml(ch); });
        });
      } else {
        colChs.forEach(function (ch) { html += cardHtml(ch); });
      }
      html += '</div>';
    });
    if (grid) grid.innerHTML = html;
  }

  function jumpToChapter(chapterId) {
    dashboardOpen = false;
    window.dashboardOpen = false;
    showDashboardBackBtn(false);
    var panel = document.getElementById('dashboardPanel');
    if (panel) panel.style.display = 'none';
    var content = document.getElementById('mainAreaContent');
    if (content) content.style.display = '';
    var btn = document.getElementById('btnDashboard');
    if (btn) btn.innerHTML = '全局进度<span class="sol-key">V</span>';

    if (typeof window.setPanelTitle === 'function') window.setPanelTitle('');
    if (typeof window.renderTitle === 'function') window.renderTitle();

    var allChapters = getChapters();
    var baseCh = allChapters.find(function (c) { return c.q1000Id === chapterId; });
    if (baseCh) {
      if (typeof window.switchChapter === 'function') window.switchChapter(baseCh.id);
      if (baseCh.ownTotal && typeof window.switchTo === 'function') {
        window.switchTo(baseCh.ownTotal);
      }
      return;
    }
    if (typeof window.switchChapter === 'function') window.switchChapter(chapterId);
  }

  function toggleDashboard() {
    if (typeof window.toggleWrongBook === 'function' && window.wrongBookOpen) {
      window.toggleWrongBook();
    }
    dashboardOpen = !dashboardOpen;
    window.dashboardOpen = dashboardOpen;
    var panel = document.getElementById('dashboardPanel');
    var content = document.getElementById('mainAreaContent');
    var btn = document.getElementById('btnDashboard');
    if (dashboardOpen) {
      renderDashboardOverview();
      if (panel) panel.style.display = '';
      if (content) content.style.display = 'none';
      if (typeof window.setPanelTitle === 'function') window.setPanelTitle('全局学习进度');
      if (btn) btn.innerHTML = '返回章节<span class="sol-key">V</span>';
      if (typeof window.showWrongBookReturnBtn === 'function') window.showWrongBookReturnBtn(false);
      if (window.wrongBookOpen) {
        window.wrongBookOpen = false;
        var wbP = document.getElementById('wrongBookPanel');
        if (wbP) wbP.style.display = 'none';
        var wbB = document.getElementById('btnWrongBook');
        if (wbB) wbB.innerHTML = '错题本<span class="sol-key">B</span>';
      }
    } else {
      if (panel) panel.style.display = 'none';
      if (content) content.style.display = '';
      showDashboardBackBtn(false);
      if (typeof window.setPanelTitle === 'function') window.setPanelTitle('');
      if (typeof window.renderTitle === 'function') window.renderTitle();
      if (btn) btn.innerHTML = '全局进度<span class="sol-key">V</span>';
    }
  }

  function closeDashboard() {
    if (!dashboardOpen) return;
    dashboardOpen = false;
    window.dashboardOpen = false;
    dashboardDetailReturn = false;
    var panel = document.getElementById('dashboardPanel');
    if (panel) panel.style.display = 'none';
    var content = document.getElementById('mainAreaContent');
    if (content) content.style.display = '';
    showDashboardBackBtn(false);
    var btn = document.getElementById('btnDashboard');
    if (btn) btn.innerHTML = '全局进度<span class="sol-key">V</span>';
  }

  // 绑定「返回总览」按钮
  document.addEventListener('DOMContentLoaded', function () {
    var dbBack = document.getElementById('btnBackDashboard');
    if (dbBack) {
      dbBack.addEventListener('click', function () {
        backToDashboardOverview();
      });
    }
  });

  // 暴露全局命名空间
  window.Dashboard = {
    isOpen: function () { return dashboardOpen; },
    isDetailReturn: function () { return dashboardDetailReturn; },
    setOpen: function (v) { dashboardOpen = !!v; window.dashboardOpen = !!v; },
    toggle: toggleDashboard,
    close: closeDashboard,
    renderOverview: renderDashboardOverview,
    openDetail: openDashboardDetail,
    backToOverview: backToDashboardOverview,
    jumpToChapter: jumpToChapter,
    getSubjectOverallStats: getSubjectOverallStats,
    getChStats: getChStats,
    getChProgress: getChProgress,
    getDailyStudyData: getDailyStudyData,
    recordStudyActivity: recordStudyActivity,
    getStudyDayKey: getStudyDayKey,
    getStudyDayIndex: getStudyDayIndex
  };

  // 全局常用别名互通
  window.openDashboardDetail = openDashboardDetail;
  window.recordStudyActivity = recordStudyActivity;

})();
