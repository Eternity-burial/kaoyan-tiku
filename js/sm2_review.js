/**
 * 考研题库 · 基于 SM-2+ 的间隔重复记忆与冲刺复习模块 (Sm2Review)
 *
 * 职责：
 *   1. 记忆留存率 (calcRetrievability) 与 SM-2+ 强化算法 (calcSM2Plus)：
 *      - FSRS / 负幂律遗忘曲线 R(t) = (1 + 0.19 * (t / S))^(-1)
 *      - 提取努力效应 (Retrieval Effort Effect)
 *      - 历史遗忘频次阻尼 (Lapse Damping)
 *      - 突破 EF 陷阱的连击复苏机制 (Recovery Boost)
 *      - 考研学习日清晨 04:00 时间对齐
 *   2. 复习主面板 (sm2Panel)：
 *      - 6 大核心记忆指标统计（今日到期、已逾期、今日已复习、记忆留存率、连续打卡天数、已掌握题数）
 *      - 未来 7 天到期复习负荷预测直方图 (renderSm2Projection)
 *      - 4 种复习策略调度（智能多因子推荐 / 艾宾浩斯抢险 / 随机穿插 / 自然顺序）
 *      - 冲刺批次容量控制 (10/20/30/全部)
 *      - 按学科与书籍分类展示到期章节清单
 *   3. 专属沉浸式复习会话 (Review Session)：
 *      - 跨章节题目队列管理、即时打分与热键评级
 *      - 会话中断与暂停持久化 (LocalStorage 自动续接)
 *      - 结算战报弹窗 (showReviewSummaryModal)
 */

(function () {
  'use strict';

  var sm2PanelOpen = false;
  window.sm2PanelOpen = false;
  var reviewSession = null;
  var selectedSm2Batch = 20;

  // 依赖的考研学习日索引计算
  function getStudyDayIndex(ts) {
    if (window.Dashboard && typeof window.Dashboard.getStudyDayIndex === 'function') {
      return window.Dashboard.getStudyDayIndex(ts);
    }
    var d = ts ? new Date(ts) : new Date();
    var sd = new Date(d.getTime() - 4 * 3600 * 1000);
    return Math.floor(Date.UTC(sd.getFullYear(), sd.getMonth(), sd.getDate()) / (24 * 3600 * 1000));
  }

  // ===== 1. 记忆留存率算法 (基于 FSRS / 负幂律遗忘曲线) =====
  function calcRetrievability(record, now) {
    if (!record || !record.lastReview || !record.interval) return 1.0;
    var curStudyDay = getStudyDayIndex(now || Date.now());
    var lastStudyDay = record.lastStudyDay !== undefined ? record.lastStudyDay : getStudyDayIndex(record.lastReview);
    var elapsed = Math.max(0, curStudyDay - lastStudyDay);
    var stability = Math.max(1, record.interval);
    var retrievability = Math.pow(1 + 0.19 * (elapsed / stability), -1);
    return Math.max(0.0, Math.min(1.0, retrievability));
  }

  // ===== 2. SM-2+ 强化间隔重复算法 =====
  function calcSM2Plus(record, score, customNow) {
    if (!record) record = { ef: 2.5, interval: 1, reps: 0, nextReview: 0, lastReview: 0, history: [] };
    var now = customNow || Date.now();
    var curStudyDay = getStudyDayIndex(now);
    var ef = (typeof record.ef === 'number' && !isNaN(record.ef)) ? record.ef : 2.5;
    var interval = (typeof record.interval === 'number' && !isNaN(record.interval) && record.interval >= 1) ? record.interval : 1;
    var reps = (typeof record.reps === 'number' && !isNaN(record.reps) && record.reps >= 0) ? record.reps : 0;
    var hist = Array.isArray(record.history) ? record.history.slice() : [];

    score = parseInt(score, 10);
    if (isNaN(score) || score < 1 || score > 5) score = 3;

    var lastStudyDay = record.lastStudyDay !== undefined ? record.lastStudyDay : (record.lastReview ? getStudyDayIndex(record.lastReview) : curStudyDay);
    var elapsedDays = Math.max(0, curStudyDay - lastStudyDay);
    var curR = calcRetrievability(record, now);

    var lapseCount = 0;
    hist.forEach(function (h) { if (h.score <= 2) lapseCount++; });

    var effortFactor = 1.0;
    if (score >= 4 && record.lastReview > 0) {
      if (elapsedDays >= interval) {
        effortFactor = 1.0 + Math.min(1.5, ((elapsedDays - interval) / Math.max(1, interval)) * 0.6);
      } else {
        effortFactor = 0.5 + 0.5 * (elapsedDays / Math.max(1, interval));
      }
    }

    var lapseDamping = Math.max(0.70, Math.pow(0.94, lapseCount));
    var deltaMap = { 5: 0.15, 4: 0.02, 3: -0.10, 2: -0.18, 1: -0.25 };
    var delta = deltaMap[score] !== undefined ? deltaMap[score] : 0;
    ef = Math.max(1.3, Math.min(3.2, ef + delta));

    if (ef <= 1.6 && hist.length >= 1) {
      var lastScore = hist[hist.length - 1].score;
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

    var dueStudyDay = curStudyDay + interval;
    var dueDayDate = new Date(dueStudyDay * 24 * 3600 * 1000);
    var nextReview = new Date(dueDayDate.getUTCFullYear(), dueDayDate.getUTCMonth(), dueDayDate.getUTCDate(), 4, 0, 0, 0).getTime();

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

  function replayHistory(historyLogs) {
    if (!Array.isArray(historyLogs) || historyLogs.length === 0) return null;
    var sorted = historyLogs.slice().sort(function (a, b) { return (a.date || 0) - (b.date || 0); });
    var state = null;
    sorted.forEach(function (evt) {
      var score = evt.score || 3;
      var evtDate = evt.date || Date.now();
      state = calcSM2Plus(state, score, evtDate);
    });
    return state;
  }

  function calcSM2(record, score) {
    return calcSM2Plus(record, score);
  }

  function checkMastered(record) {
    if (!record || !record.history || record.history.length < 3) return false;
    var h = record.history;
    return h.slice(-3).every(function (e) { return e.score >= 4; }) && record.interval >= 60;
  }

  function getSm2Seed(score) {
    if (score === 5)      return { ef: 2.6, interval: 30, reps: 3, history: [] };
    else if (score === 4) return { ef: 2.5, interval: 7,  reps: 2, history: [] };
    else if (score === 3) return { ef: 2.4, interval: 2,  reps: 1, history: [] };
    else if (score === 2) return { ef: 2.3, interval: 1,  reps: 0, history: [] };
    else                  return { ef: 2.2, interval: 1,  reps: 0, history: [] };
  }

  function getSm2OverdueDays(rec) {
    if (!rec || !rec.nextReview) return 0;
    var curStudyDay = getStudyDayIndex(Date.now());
    var dueStudyDay = (rec.lastStudyDay !== undefined && rec.interval)
      ? (rec.lastStudyDay + rec.interval)
      : getStudyDayIndex(rec.nextReview);
    return Math.max(0, curStudyDay - dueStudyDay);
  }

  function getSm2Label(rec) {
    if (!rec || !rec.nextReview) return '';
    if (checkMastered(rec)) return 'mastered';
    var curStudyDay = getStudyDayIndex(Date.now());
    var dueStudyDay = (rec.lastStudyDay !== undefined && rec.interval)
      ? (rec.lastStudyDay + rec.interval)
      : getStudyDayIndex(rec.nextReview);

    if (dueStudyDay < curStudyDay) return 'overdue';
    if (dueStudyDay === curStudyDay) return 'due';
    return 'queued';
  }

  function renderSm2InfoBar(current, sm2Map) {
    var bar = document.getElementById('sm2InfoBar');
    if (!bar) return;
    var rec = sm2Map ? sm2Map[current] : (window.sm2 ? window.sm2[current] : null);
    if (!rec || !rec.nextReview) { bar.style.display = 'none'; return; }
    bar.style.display = '';
    var dueDate = new Date(rec.nextReview);
    var dd = dueDate.getFullYear() + '-' + String(dueDate.getMonth() + 1).padStart(2, '0') + '-' + String(dueDate.getDate()).padStart(2, '0');
    var label = getSm2Label(rec);
    var overdueDays = getSm2OverdueDays(rec);
    var retrievability = Math.round(calcRetrievability(rec) * 100);

    var lapseCount = 0;
    if (rec.history && Array.isArray(rec.history)) {
      rec.history.forEach(function (h) { if (h.score <= 2) lapseCount++; });
    }

    var tag = '';
    if (label === 'due') tag = '<span class="sm2-due-tag">今日到期</span>';
    else if (label === 'overdue') tag = '<span class="sm2-overdue-tag">已逾期 ' + overdueDays + ' 天</span>';
    else if (label === 'mastered') tag = '<span style="color:#F5A623;font-weight:600">已掌握</span>';

    var rColor = retrievability >= 85 ? 'var(--lv5-dark, #2e7d32)' : (retrievability >= 60 ? 'var(--uncertain-dark, #f59e0b)' : 'var(--unfamiliar, #dc2626)');

    bar.innerHTML = '<span>EF: ' + (rec.ef ? rec.ef.toFixed(2) : '2.50') + '</span>' +
      '<span>间隔: ' + rec.interval + '天</span>' +
      '<span>留存率: <b style="color:' + rColor + '">' + retrievability + '%</b></span>' +
      '<span>复习: ' + rec.reps + '次' + (lapseCount > 0 ? ' (' + lapseCount + '错)' : '') + '</span>' +
      (rec.lastReview ? '<span>上次: ' + new Date(rec.lastReview).toLocaleDateString('zh-CN') + '</span>' : '') +
      '<span>下次: ' + dd + '</span>' + tag;
  }

  function canonicalSubj(subj) {
    return String(subj || '').replace(/^(基础篇|强化篇)[-—]/, '');
  }

  function getChapters() {
    if (typeof window.CHAPTERS !== 'undefined' && Array.isArray(window.CHAPTERS) && window.CHAPTERS.length > 0) {
      return window.CHAPTERS;
    }
    if (typeof window.curSubject !== 'undefined' && window.curSubject && Array.isArray(window.curSubject.chapters)) {
      return window.curSubject.chapters;
    }
    if (typeof window.SUBJECTS !== 'undefined' && Array.isArray(window.SUBJECTS)) {
      var curSubjId = window.curSubjectId || 'math';
      var subj = window.SUBJECTS.find(function(s) { return s.id === curSubjId; });
      if (subj && subj.chapters) return subj.chapters;
    }
    return [];
  }

  function reviewChapters() {
    var chapters = getChapters();
    return chapters.filter(function (c) { return c.wb !== '1000题' && c.total > 0; });
  }

  function calculatePriorityScore(item) {
    var rec = item.record || {};
    var overdueDays = item.overdueDays || getSm2OverdueDays(rec);
    var currentScore = item.currentScore || 3;
    var ef = rec.ef || 2.5;
    var lapseCount = 0;
    if (rec.history && Array.isArray(rec.history)) {
      rec.history.forEach(function (h) { if (h.score <= 2) lapseCount++; });
    }
    return (overdueDays * 2.5) + ((5 - currentScore) * 2.0) + ((3.2 - ef) * 1.5) + (lapseCount * 1.2);
  }

  function getSm2Mode() {
    var mode = document.querySelector('input[name="sm2mode"]:checked');
    return mode ? mode.value : 'smart';
  }

  function getSm2BatchLimit() {
    return selectedSm2Batch;
  }

  function collectDueItems(chapters, mode, batchLimit) {
    if (!mode) mode = getSm2Mode();
    if (batchLimit === undefined) batchLimit = getSm2BatchLimit();
    var queue = [];

    chapters.forEach(function (ch) {
      var merged = (typeof window.readMergedSm2 === 'function') ? window.readMergedSm2(ch) : {};
      var curStatusObj = (typeof window.getChapterStatusMap === 'function') ? window.getChapterStatusMap(ch) : {};
      var scoreMap = { proficient: 5, familiar: 4, vague: 3, rusty: 2, wrong: 1 };

      for (var i = 0; i < ch.total; i++) {
        var rec = merged[i];
        if (!rec || !rec.nextReview) continue;
        var label = getSm2Label(rec);
        if (label !== 'due' && label !== 'overdue') continue;

        var st = curStatusObj[i];
        var curScore = st ? (scoreMap[st] || 3) : 3;
        var overdueDays = getSm2OverdueDays(rec);

        queue.push({
          chapterId: ch.id,
          idx: i,
          record: rec,
          status: 'pending',
          finalScore: null,
          currentScore: curScore,
          overdueDays: overdueDays,
          priorityScore: 0
        });
      }
    });

    queue.forEach(function (item) {
      item.priorityScore = calculatePriorityScore(item);
    });

    if (mode === 'smart') {
      queue.sort(function (a, b) { return b.priorityScore - a.priorityScore; });
    } else if (mode === 'overdue') {
      queue = queue.filter(function (it) { return it.overdueDays > 0; });
      queue.sort(function (a, b) { return b.overdueDays - a.overdueDays; });
    } else if (mode === 'random') {
      for (var i = queue.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = queue[i]; queue[i] = queue[j]; queue[j] = tmp;
      }
    }

    if (batchLimit && batchLimit > 0 && queue.length > batchLimit) {
      queue = queue.slice(0, batchLimit);
    }

    return queue;
  }

  function rebaselineSm2(idx, score, sm2Map, saveFn) {
    if (!score) {
      delete sm2Map[idx];
    } else {
      sm2Map[idx] = calcSM2Plus(getSm2Seed(score), score);
    }
    if (typeof saveFn === 'function') saveFn();
    else if (typeof window.saveSm2 === 'function') window.saveSm2();
  }

  // ===== SM-2 未来 7 天到期负荷预测直方图 =====
  function renderSm2Projection() {
    var container = document.getElementById('sm2ProjectionBars');
    if (!container) return;

    var curStudyDay = getStudyDayIndex(Date.now());
    var dayCounts = [0, 0, 0, 0, 0, 0, 0];
    var chapters = getChapters();

    if (chapters.length > 0) {
      chapters.forEach(function (ch) {
        var sm2Obj = (typeof window.readMergedSm2 === 'function') ? window.readMergedSm2(ch) : {};
        for (var idx in sm2Obj) {
          var item = sm2Obj[idx];
          if (!item || !item.nextReview) continue;
          var dueStudyDay = (item.lastStudyDay !== undefined && item.interval)
            ? (item.lastStudyDay + item.interval)
            : getStudyDayIndex(item.nextReview);
          var diff = dueStudyDay - curStudyDay;
          if (diff <= 0) {
            dayCounts[0]++;
          } else if (diff >= 1 && diff <= 6) {
            dayCounts[diff]++;
          }
        }
      });
    }

    var maxCount = Math.max.apply(null, dayCounts);
    if (maxCount === 0) maxCount = 1;

    var dayLabels = ['今天', '明天', '后天', '第4天', '第5天', '第6天', '第7天'];
    var html = '';
    for (var d = 0; d < 7; d++) {
      var count = dayCounts[d];
      var heightPct = Math.round((count / maxCount) * 100);
      var barStyle = heightPct > 0 ? ('height:' + Math.max(8, heightPct) + '%') : 'height:4px;opacity:0.3;';
      var isToday = (d === 0);
      var colClass = isToday ? 'sm2-proj-col today' : 'sm2-proj-col';

      html += '<div class="' + colClass + '" title="' + dayLabels[d] + ' 预计到期 ' + count + ' 题">' +
        '<div class="sm2-proj-bar-wrapper">' +
          '<div class="sm2-proj-bar" style="' + barStyle + '">' +
            (count > 0 ? ('<span class="sm2-proj-num">' + count + '</span>') : '') +
          '</div>' +
        '</div>' +
        '<div class="sm2-proj-label">' + dayLabels[d] + '</div>' +
      '</div>';
    }
    container.innerHTML = html;
  }

  // ===== 提取全学科复习与留存率综合指标 =====
  function getSm2RetentionStats() {
    var totalAssessed = 0;
    var weightedRSum = 0;
    var todayReviewedCount = 0;
    var todayStudyDay = getStudyDayIndex(Date.now());
    var studyDaysSet = {};
    var chapters = getChapters();

    chapters.forEach(function (ch) {
      var sm2Obj = (typeof window.readMergedSm2 === 'function') ? window.readMergedSm2(ch) : {};
      for (var idx in sm2Obj) {
        var item = sm2Obj[idx];
        if (!item) continue;
        if (item.lastReview && item.interval) {
          totalAssessed++;
          weightedRSum += calcRetrievability(item);
        }
        if (item.history && Array.isArray(item.history)) {
          item.history.forEach(function (h) {
            if (h.date) {
              var sIdx = h.studyDay !== undefined ? h.studyDay : getStudyDayIndex(h.date);
              studyDaysSet[sIdx] = true;
              if (sIdx === todayStudyDay) todayReviewedCount++;
            }
          });
        }
      }
    });

    var avgR = totalAssessed > 0 ? (weightedRSum / totalAssessed) : 1.0;
    var streak = 0;
    var checkDay = todayStudyDay;
    if (!studyDaysSet[checkDay]) checkDay--;
    while (studyDaysSet[checkDay]) {
      streak++;
      checkDay--;
    }

    return {
      retentionRate: Math.round(avgR * 100),
      todayReviewedCount: todayReviewedCount,
      streak: streak,
      totalAssessed: totalAssessed
    };
  }

  function sm2ChapterSummary(ch) {
    var merged = (typeof window.readMergedSm2 === 'function') ? window.readMergedSm2(ch) : {};
    var due = 0, overdue = 0, queued = 0, mastered = 0;
    for (var i = 0; i < ch.total; i++) {
      var rec = merged[i];
      if (!rec || !rec.nextReview) continue;
      var lbl = getSm2Label(rec);
      if (lbl === 'mastered') mastered++;
      else if (lbl === 'overdue') overdue++;
      else if (lbl === 'due') due++;
      else queued++;
    }
    return { due: due, overdue: overdue, queued: queued, mastered: mastered };
  }

  function toggleSm2Panel() {
    if (!sm2PanelOpen) {
      var panel = document.getElementById('sm2Panel');
      var mainContent = document.getElementById('mainAreaContent');
      var dashboard = document.getElementById('dashboardPanel');
      var wrongBook = document.getElementById('wrongBookPanel');
      if (dashboard) dashboard.style.display = 'none';
      if (wrongBook) wrongBook.style.display = 'none';
      if (window.Dashboard) window.Dashboard.setOpen(false);
      window.dashboardOpen = false;
      window.wrongBookOpen = false;
      var btnDb = document.getElementById('btnDashboard');
      if (btnDb) btnDb.innerHTML = '全局进度<span class="sol-key">V</span>';
      var btnWb = document.getElementById('btnWrongBook');
      if (btnWb) btnWb.innerHTML = '错题本<span class="sol-key">B</span>';
      if (panel) panel.style.display = 'block';
      if (mainContent) mainContent.style.display = 'none';
      if (typeof window.setPanelTitle === 'function') window.setPanelTitle('间隔重复复习');
      sm2PanelOpen = true;
      window.sm2PanelOpen = true;
      renderSm2Panel();
    } else {
      closeSm2Panel();
    }
  }

  function closeSm2Panel() {
    sm2PanelOpen = false;
    window.sm2PanelOpen = false;
    var panel = document.getElementById('sm2Panel');
    if (panel) panel.style.display = 'none';
    var mainContent = document.getElementById('mainAreaContent');
    if (mainContent) mainContent.style.display = '';
    if (typeof window.setPanelTitle === 'function') window.setPanelTitle('');
    if (typeof window.renderTitle === 'function') window.renderTitle();
  }

  function sm2ChapterRowHtml(ch, s) {
    var name = ch.short || ch.name;
    var statsStr = '';
    if (s.due) statsStr += '<span class="sm2-ch-due">到期 ' + s.due + '</span> ';
    if (s.overdue) statsStr += '<span class="sm2-ch-overdue">逾期 ' + s.overdue + '</span> ';
    if (s.queued) statsStr += '<span style="font-size:11px;color:#888">队列 ' + s.queued + '</span> ';
    if (s.mastered) statsStr += '<span style="font-size:11px;color:#F5A623">已掌握 ' + s.mastered + '</span> ';

    var dueCount = s.due + s.overdue;
    var hasAnyRecord = (s.queued + s.mastered) > 0;
    var btnText, btnDisabled = '';
    if (dueCount === 0 && hasAnyRecord) {
      btnText = '已完成';
      btnDisabled = ' disabled style="opacity:0.6;cursor:default"';
    } else if (dueCount > 0) {
      btnText = '继续复习';
    } else {
      btnText = '复习';
    }
    return '<div class="sm2-ch-row">' +
      '<div class="sm2-ch-info"><span class="sm2-ch-name">' + name + '</span><span class="sm2-ch-stats">' + statsStr + '</span></div>' +
      '<button class="sm2-ch-btn"' + btnDisabled + ' onclick="' + (btnDisabled ? '' : 'Sm2Review.startChapter(\'' + ch.id + '\')') + '">' + btnText + '</button>' +
      '</div>';
  }

  function renderSm2Panel() {
    var allDue = 0, allOverdue = 0, allQueued = 0, allMastered = 0;
    var moduleMap = {};
    var curSubj = window.curSubject;
    var subjOrder = curSubj ? curSubj.subjOrder : [];
    reviewChapters().forEach(function (ch) {
      var mod = canonicalSubj(ch.subj);
      (moduleMap[mod] = moduleMap[mod] || []).push(ch);
    });
    var moduleNames = [];
    subjOrder.forEach(function (s) { if (moduleMap[s]) moduleNames.push(s); });
    Object.keys(moduleMap).forEach(function (m) { if (moduleNames.indexOf(m) === -1) moduleNames.push(m); });

    var moduleHtmls = [];
    moduleNames.forEach(function (mod) {
      var modChs = moduleMap[mod];
      var bookMap = {};
      modChs.forEach(function (ch) { var wb = ch.wb || ''; (bookMap[wb] = bookMap[wb] || []).push(ch); });
      var bookNames = [];
      var wbOrder = curSubj ? curSubj.wbOrder : [];
      wbOrder.forEach(function (e) { if (e.wb !== '1000题' && bookMap[e.wb]) bookNames.push(e.wb); });
      Object.keys(bookMap).forEach(function (wb) { if (bookNames.indexOf(wb) === -1) bookNames.push(wb); });

      var rowsHtml = '';
      var modDue = 0, modOverdue = 0, modQueued = 0, modMastered = 0;
      bookNames.forEach(function (wb) {
        var bRows = [];
        bookMap[wb].forEach(function (ch) {
          var s = sm2ChapterSummary(ch);
          if (s.due + s.overdue + s.queued + s.mastered === 0) return;
          allDue += s.due; allOverdue += s.overdue; allQueued += s.queued; allMastered += s.mastered;
          modDue += s.due; modOverdue += s.overdue; modQueued += s.queued; modMastered += s.mastered;
          bRows.push({ ch: ch, summary: s });
        });
        if (bRows.length === 0) return;
        var wbLabel = (typeof window.getWbLabel === 'function') ? window.getWbLabel(wb) : wb;
        rowsHtml += '<div class="sm2-book-header" style="font-weight:700;color:var(--primary);margin:8px 0 4px;font-size:14px">' + wbLabel + '</div>';
        bRows.forEach(function (row) { rowsHtml += sm2ChapterRowHtml(row.ch, row.summary); });
      });
      if (!rowsHtml) return;

      var modDueCount = modDue + modOverdue;
      var modHasRecord = (modQueued + modMastered) > 0;
      var modBtnDisabled = '', modBtnText = '复习此模块';
      if (modDueCount === 0 && modHasRecord) {
        modBtnText = '已完成';
        modBtnDisabled = ' disabled style="opacity:0.6;cursor:default"';
      }
      var header = '<div class="sm2-module-header">' +
        '<span class="sm2-module-name">' + mod + '</span>' +
        '<span class="sm2-mod-stats">' +
          (modDue ? '<span class="sm2-ch-due">到期 ' + modDue + '</span> ' : '') +
          (modOverdue ? '<span class="sm2-ch-overdue">逾期 ' + modOverdue + '</span> ' : '') +
        '</span>' +
        '<button class="sm2-mod-btn"' + modBtnDisabled + ' onclick="' + (modBtnDisabled ? '' : 'Sm2Review.startModule(\'' + mod + '\')') + '">' + modBtnText + '</button>' +
        '</div>';
      moduleHtmls.push({ header: header, rows: rowsHtml });
    });

    var stats = getSm2RetentionStats();
    var elDue = document.querySelector('#sm2CardDue .sm2-stat-num');
    if (elDue) elDue.textContent = allDue;
    var elOverdue = document.querySelector('#sm2CardOverdue .sm2-stat-num');
    if (elOverdue) elOverdue.textContent = allOverdue;
    var elTodayRev = document.querySelector('#sm2CardTodayReviewed .sm2-stat-num');
    if (elTodayRev) elTodayRev.textContent = stats.todayReviewedCount;
    var elRet = document.querySelector('#sm2CardRetention .sm2-stat-num');
    if (elRet) elRet.textContent = stats.retentionRate + '%';
    var elStreak = document.querySelector('#sm2CardStreak .sm2-stat-num');
    if (elStreak) elStreak.textContent = stats.streak + '天';
    var elMastered = document.querySelector('#sm2CardMastered .sm2-stat-num');
    if (elMastered) elMastered.textContent = allMastered;
    try {
      renderSm2Projection();
    } catch (e) {
      console.error('[Sm2Review] renderSm2Projection error:', e);
    }

    var list = document.getElementById('sm2Chapters') || document.getElementById('sm2ChapterList');
    if (list) {
      if (moduleHtmls.length === 0) {
        list.innerHTML = '<div class="sm2-empty-state"><div class="sm2-empty-icon">✓</div><div class="sm2-empty-text">当前暂无到期复习题目</div></div>';
      } else {
        list.innerHTML = moduleHtmls.map(function (m) {
          return '<div class="sm2-module-block">' + m.header + m.rows + '</div>';
        }).join('');
      }
    }
  }

  // ===== 专属复习会话管理 =====
  function saveReviewSession() {
    if (!reviewSession) {
      if (window.StorageEngine && window.StorageEngine.GlobalStore) {
        window.StorageEngine.GlobalStore.remove('review_session');
      } else {
        localStorage.removeItem('kaoyan.g.review_session');
      }
      return;
    }
    var persist = {
      queue: reviewSession.queue.map(function (it) {
        return { chapterId: it.chapterId, idx: it.idx, status: it.status, finalScore: it.finalScore };
      }),
      currentIdx: reviewSession.currentIdx,
      mode: reviewSession.mode,
      originChapter: reviewSession.originChapter,
      originIdx: reviewSession.originIdx,
      done: reviewSession.done,
      startTime: reviewSession.startTime
    };
    if (window.StorageEngine && window.StorageEngine.GlobalStore) {
      window.StorageEngine.GlobalStore.set('review_session', persist);
    } else {
      localStorage.setItem('kaoyan.g.review_session', JSON.stringify(persist));
    }
  }

  function loadReviewSession() {
    try {
      if (window.StorageEngine && window.StorageEngine.GlobalStore) {
        var obj = window.StorageEngine.GlobalStore.get('review_session');
        if (obj) return obj;
      }
      var raw = localStorage.getItem('kaoyan.g.review_session');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function clearReviewSession() {
    reviewSession = null;
    if (window.StorageEngine && window.StorageEngine.GlobalStore) {
      window.StorageEngine.GlobalStore.remove('review_session');
    } else {
      localStorage.removeItem('kaoyan.g.review_session');
    }
  }

  function startReviewSession(queue, mode) {
    if (!queue || queue.length === 0) {
      if (typeof window.showToast === 'function') {
        window.showToast('当前没有待复习的题目', 'info');
      } else if (window.storageSync && typeof window.storageSync.showToast === 'function') {
        window.storageSync.showToast('当前没有待复习的题目', 'info');
      }
      return;
    }

    reviewSession = {
      queue: queue,
      currentIdx: 0,
      mode: mode || 'smart',
      done: false,
      originChapter: window.currentChapterId,
      originIdx: window.current,
      startTime: Date.now()
    };
    saveReviewSession();
    closeSm2Panel();

    var statsBlock = document.getElementById('statsBlock');
    if (statsBlock) statsBlock.style.display = 'none';
    var rqPanel = document.getElementById('reviewQueuePanel');
    if (rqPanel) rqPanel.style.display = '';
    var rControls = document.getElementById('reviewControls');
    if (rControls) rControls.style.display = '';

    var first = queue[0];
    if (typeof window.switchChapter === 'function') window.switchChapter(first.chapterId);
    if (typeof window.switchTo === 'function') window.switchTo(first.idx);

    renderReviewQueue();
    renderReviewProgress();
  }

  function startReviewChapter(chapterId) {
    var ch = (typeof window.chapterById === 'function') ? window.chapterById(chapterId) : null;
    if (!ch) return;
    var queue = collectDueItems([ch], 'sequential', 0);
    startReviewSession(queue, 'sequential');
  }

  function startReviewModule(modName) {
    var chs = reviewChapters().filter(function (c) {
      return canonicalSubj(c.subj) === modName;
    });
    var queue = collectDueItems(chs);
    startReviewSession(queue, getSm2Mode());
  }

  function startAllReview() {
    var queue = collectDueItems(reviewChapters());
    startReviewSession(queue, getSm2Mode());
  }

  function reviewCurrentItem() {
    if (!reviewSession) return null;
    var q = reviewSession.queue;
    if (reviewSession.currentIdx < 0 || reviewSession.currentIdx >= q.length) return null;
    return q[reviewSession.currentIdx];
  }

  function renderReviewProgress() {
    if (!reviewSession) return;
    var total = reviewSession.queue.length;
    var cur = reviewSession.currentIdx + 1;
    var panelTitle = document.getElementById('panelTitle');
    if (panelTitle) {
      var modeLabel = { smart: '智能', overdue: '抢险', random: '随机', sequential: '顺序' }[reviewSession.mode] || '';
      if (reviewSession.done) {
        var ungraded = reviewSession.queue.filter(function (it) { return it.status !== 'graded'; }).length;
        panelTitle.textContent = '还有 ' + ungraded + ' 题未评级';
      } else {
        panelTitle.textContent = '冲刺复习 ' + cur + '/' + total + ' · ' + modeLabel;
      }
      panelTitle.style.display = '';
      document.querySelectorAll('#chapterTitleBar .title-dropdown .title-arrow').forEach(function (a) {
        a.style.display = 'none';
      });
    }
  }

  function renderReviewQueue() {
    var panel = document.getElementById('reviewQueue');
    if (!panel) return;
    if (!reviewSession) { panel.innerHTML = ''; return; }
    var queue = reviewSession.queue;
    panel.innerHTML = '';
    queue.forEach(function (item, i) {
      var btn = document.createElement('button');
      btn.className = 'review-q';
      btn.textContent = i + 1;
      btn.title = '第 ' + (i + 1) + ' 个复习题';
      if (reviewSession.done) {
        if (i === reviewSession.currentIdx) btn.classList.add('current');
      } else if (i === reviewSession.currentIdx) {
        btn.classList.add('current');
      }
      if (item.status === 'graded') {
        btn.classList.add('graded');
        if (item.finalScore) btn.classList.add('score-' + item.finalScore);
      } else if (item.status === 'skipped') {
        btn.classList.add('skipped');
      }
      btn.onclick = function () { reviewJump(i); };
      panel.appendChild(btn);
    });
  }

  function gradeCurrentReview(score) {
    if (!reviewSession) return;
    var item = reviewCurrentItem();
    if (!item) return;
    item.status = 'graded';
    item.finalScore = score;
    renderReviewQueue();
    if (window.Dashboard && typeof window.Dashboard.recordStudyActivity === 'function') {
      window.Dashboard.recordStudyActivity();
    }
    reviewAdvance(1);
  }

  function reviewAdvance(delta) {
    if (!reviewSession) return;
    var nextIdx = reviewSession.currentIdx + delta;
    if (nextIdx >= reviewSession.queue.length) {
      var unFinished = reviewSession.queue.find(function (it) { return it.status !== 'graded'; });
      if (!unFinished) {
        finishReviewSession();
        return;
      }
      reviewSession.done = true;
      renderReviewProgress();
      renderReviewQueue();
      saveReviewSession();
      return;
    }
    if (nextIdx < 0) return;
    reviewSession.currentIdx = nextIdx;
    reviewSession.done = false;
    var item = reviewSession.queue[nextIdx];
    if (typeof window.switchChapter === 'function') window.switchChapter(item.chapterId);
    if (typeof window.switchTo === 'function') window.switchTo(item.idx);
    renderReviewQueue();
    renderReviewProgress();
    saveReviewSession();
  }

  function reviewPrev() { reviewAdvance(-1); }
  function reviewNext() { reviewAdvance(1); }

  function reviewJump(i) {
    if (!reviewSession) return;
    if (i < 0 || i >= reviewSession.queue.length) return;
    reviewSession.currentIdx = i;
    reviewSession.done = false;
    var item = reviewSession.queue[i];
    if (typeof window.switchChapter === 'function') window.switchChapter(item.chapterId);
    if (typeof window.switchTo === 'function') window.switchTo(item.idx);
    renderReviewQueue();
    renderReviewProgress();
    saveReviewSession();
  }

  function reviewSkip() {
    if (!reviewSession) return;
    var item = reviewCurrentItem();
    if (!item) return;
    item.status = 'skipped';
    renderReviewQueue();
    reviewAdvance(1);
  }

  function commitReviewResults() {
    if (!reviewSession) return;
    var groups = {};
    reviewSession.queue.forEach(function (item) {
      if (item.finalScore == null) return;
      (groups[item.chapterId] = groups[item.chapterId] || []).push(item);
    });
    Object.keys(groups).forEach(function (cid) {
      var ch = (typeof window.chapterById === 'function') ? window.chapterById(cid) : null;
      if (!ch) return;
      var merged = (typeof window.readMergedSm2 === 'function') ? window.readMergedSm2(ch) : {};
      groups[cid].forEach(function (item) {
        merged[item.idx] = calcSM2Plus(merged[item.idx], item.finalScore);
      });
      if (typeof window.writeMergedSm2 === 'function') {
        window.writeMergedSm2(ch, merged);
      }
    });
    if (typeof window.loadSm2 === 'function') window.loadSm2();
  }

  function finishReviewSession() {
    if (!reviewSession) return;
    var sessionCopy = {
      queue: reviewSession.queue.slice(),
      startTime: reviewSession.startTime || Date.now(),
      mode: reviewSession.mode
    };
    var originCh = reviewSession.originChapter || (typeof window.currentChapterId !== 'undefined' ? window.currentChapterId : '');
    var originIdx = (typeof reviewSession.originIdx === 'number') ? reviewSession.originIdx : (typeof window.current !== 'undefined' ? window.current : 0);

    commitReviewResults();
    clearReviewSession();

    var statsBlock = document.getElementById('statsBlock');
    if (statsBlock) statsBlock.style.display = '';
    var rqPanel = document.getElementById('reviewQueuePanel');
    if (rqPanel) rqPanel.style.display = 'none';
    var rControls = document.getElementById('reviewControls');
    if (rControls) rControls.style.display = 'none';
    var sm2Info = document.getElementById('sm2InfoBar');
    if (sm2Info) sm2Info.style.display = 'none';

    if (typeof window.setPanelTitle === 'function') window.setPanelTitle('');
    document.querySelectorAll('#chapterTitleBar .title-dropdown .title-arrow').forEach(function (a) {
      a.style.display = '';
    });

    showReviewSummaryModal(sessionCopy, originCh, originIdx);
  }

  var reviewSummaryModalOpen = false;
  var _summaryExitFn = null;
  var _summaryNextFn = null;

  function showReviewSummaryModal(sessionData, originCh, originIdx) {
    var modal = document.getElementById('reviewSummaryOverlay');
    if (!modal) {
      restoreReviewOrigin(originCh, originIdx);
      return;
    }

    var queue = sessionData.queue || [];
    var scores = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    var gradedCount = 0;
    queue.forEach(function (item) {
      if (item.finalScore) {
        scores[item.finalScore] = (scores[item.finalScore] || 0) + 1;
        gradedCount++;
      }
    });

    var passCount = (scores[5] || 0) + (scores[4] || 0) + (scores[3] || 0);
    var retentionPct = gradedCount > 0 ? Math.round((passCount / gradedCount) * 100) : 100;
    var durationMs = Date.now() - (sessionData.startTime || Date.now());
    var durationMins = Math.max(1, Math.round(durationMs / 60000));

    var elTotal = document.getElementById('summaryTotalCount');
    if (elTotal) elTotal.textContent = queue.length;
    var elRet = document.getElementById('summaryRetentionPct');
    if (elRet) elRet.textContent = retentionPct + '%';
    var elDur = document.getElementById('summaryDurationText');
    if (elDur) elDur.textContent = durationMins + ' 分钟';

    var bp5 = document.getElementById('bpProf'); if (bp5) bp5.textContent = scores[5] || 0;
    var bp4 = document.getElementById('bpFam');  if (bp4) bp4.textContent = scores[4] || 0;
    var bp3 = document.getElementById('bpVag');  if (bp3) bp3.textContent = scores[3] || 0;
    var bp2 = document.getElementById('bpRus');  if (bp2) bp2.textContent = scores[2] || 0;
    var bp1 = document.getElementById('bpWrg');  if (bp1) bp1.textContent = scores[1] || 0;

    reviewSummaryModalOpen = true;
    modal.style.display = 'flex';

    var btnExit = document.getElementById('btnSummaryExit');
    var btnNext = document.getElementById('btnSummaryNext');

    function cleanupModal() {
      reviewSummaryModalOpen = false;
      modal.style.display = 'none';
      modal.removeEventListener('click', onBackdropClick);
      if (btnExit) btnExit.removeEventListener('click', onExit);
      if (btnNext) btnNext.removeEventListener('click', onNext);
      _summaryExitFn = null;
      _summaryNextFn = null;
    }

    function onBackdropClick(e) {
      if (e.target === modal) onExit();
    }

    function onExit() {
      cleanupModal();
      restoreReviewOrigin(originCh, originIdx);
    }

    function onNext() {
      cleanupModal();
      startAllReview();
    }

    _summaryExitFn = onExit;
    _summaryNextFn = onNext;

    modal.addEventListener('click', onBackdropClick);
    if (btnExit) btnExit.addEventListener('click', onExit);
    if (btnNext) btnNext.addEventListener('click', onNext);
  }

  function restoreReviewOrigin(originCh, originIdx) {
    if (originCh && originCh !== window.currentChapterId) {
      if (typeof window.switchChapter === 'function') window.switchChapter(originCh);
      if (typeof originIdx === 'number' && typeof window.switchTo === 'function') {
        window.switchTo(originIdx);
      }
    } else {
      if (typeof originIdx === 'number' && typeof window.switchTo === 'function') {
        window.switchTo(originIdx);
      } else if (typeof window.renderTitle === 'function') {
        window.renderTitle();
      }
    }
  }

  function exitReviewSession() {
    if (!reviewSession) {
      var statsBlock = document.getElementById('statsBlock');
      if (statsBlock) statsBlock.style.display = '';
      var rqPanel = document.getElementById('reviewQueuePanel');
      if (rqPanel) rqPanel.style.display = 'none';
      var rControls = document.getElementById('reviewControls');
      if (rControls) rControls.style.display = 'none';
      return;
    }
    commitReviewResults();
    var hasUngraded = reviewSession.queue && reviewSession.queue.some(function (it) { return it.status !== 'graded'; });
    var originCh = reviewSession.originChapter || (typeof window.currentChapterId !== 'undefined' ? window.currentChapterId : '');
    var originIdx = (typeof reviewSession.originIdx === 'number') ? reviewSession.originIdx : (typeof window.current !== 'undefined' ? window.current : 0);

    if (hasUngraded) {
      saveReviewSession();
      if (window.storageSync && typeof window.storageSync.showToast === 'function') {
        window.storageSync.showToast('已暂停并保存复习进度，可随时在「间隔复习 (M)」中续接', 'info');
      }
      reviewSession = null;
    } else {
      clearReviewSession();
    }

    var sBlock = document.getElementById('statsBlock');
    if (sBlock) sBlock.style.display = '';
    var rqP = document.getElementById('reviewQueuePanel');
    if (rqP) rqP.style.display = 'none';
    var rC = document.getElementById('reviewControls');
    if (rC) rC.style.display = 'none';
    var sm2Bar = document.getElementById('sm2InfoBar');
    if (sm2Bar) sm2Bar.style.display = 'none';

    if (typeof window.setPanelTitle === 'function') window.setPanelTitle('');
    document.querySelectorAll('#chapterTitleBar .title-dropdown .title-arrow').forEach(function (a) {
      a.style.display = '';
    });

    restoreReviewOrigin(originCh, originIdx);
  }

  // DOM 绑定
  document.addEventListener('DOMContentLoaded', function () {
    var btnStartAll = document.getElementById('btnSm2StartAll');
    if (btnStartAll) btnStartAll.addEventListener('click', function () { startAllReview(); });
    var bPrev = document.getElementById('btnReviewPrev');
    if (bPrev) bPrev.addEventListener('click', function () { reviewPrev(); });
    var bSkip = document.getElementById('btnReviewSkip');
    if (bSkip) bSkip.addEventListener('click', function () { reviewSkip(); });
    var bNext = document.getElementById('btnReviewNext');
    if (bNext) bNext.addEventListener('click', function () { reviewNext(); });
    var btnClose = document.getElementById('btnSm2Close');
    if (btnClose) btnClose.addEventListener('click', function () { closeSm2Panel(); });

    // 批次容量选择
    document.querySelectorAll('.sm2-batch-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.sm2-batch-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        selectedSm2Batch = parseInt(btn.dataset.batch, 10) || 0;
      });
    });
  });

  // 暴露全局命名空间
  window.Sm2Review = {
    calcRetrievability: calcRetrievability,
    calcSM2Plus: calcSM2Plus,
    calcSM2: calcSM2,
    replayHistory: replayHistory,
    checkMastered: checkMastered,
    getSm2Seed: getSm2Seed,
    getSm2OverdueDays: getSm2OverdueDays,
    getSm2Label: getSm2Label,
    renderInfoBar: renderSm2InfoBar,
    rebaseline: rebaselineSm2,
    getRetentionStats: getSm2RetentionStats,
    renderProjection: renderSm2Projection,
    togglePanel: toggleSm2Panel,
    closePanel: closeSm2Panel,
    renderPanel: renderSm2Panel,
    isPanelOpen: function () { return sm2PanelOpen; },
    startChapter: startReviewChapter,
    startModule: startReviewModule,
    startAll: startAllReview,
    resumeSession: function () {
      var persist = loadReviewSession();
      if (!persist) return;
      var q = persist.queue.map(function (it) {
        var ch = (typeof window.chapterById === 'function') ? window.chapterById(it.chapterId) : null;
        var rec = null;
        if (ch) {
          var merged = (typeof window.readMergedSm2 === 'function') ? window.readMergedSm2(ch) : {};
          rec = merged[it.idx] || null;
        }
        return { chapterId: it.chapterId, idx: it.idx, record: rec, status: it.status || 'pending', finalScore: it.finalScore };
      });
      reviewSession = {
        queue: q,
        currentIdx: Math.min(Math.max(0, persist.currentIdx || 0), q.length - 1),
        mode: persist.mode || 'smart',
        originChapter: persist.originChapter,
        originIdx: persist.originIdx,
        done: !!persist.done,
        startTime: persist.startTime || Date.now()
      };
      closeSm2Panel();
      var statsBlock = document.getElementById('statsBlock');
      if (statsBlock) statsBlock.style.display = 'none';
      var rqPanel = document.getElementById('reviewQueuePanel');
      if (rqPanel) rqPanel.style.display = '';
      var rControls = document.getElementById('reviewControls');
      if (rControls) rControls.style.display = '';

      var item = reviewCurrentItem();
      if (item) {
        if (typeof window.switchChapter === 'function') window.switchChapter(item.chapterId);
        if (typeof window.switchTo === 'function') window.switchTo(item.idx);
      }
      renderReviewQueue();
      renderReviewProgress();
      saveReviewSession();
    },
    gradeCurrent: gradeCurrentReview,
    reviewCurrentItem: reviewCurrentItem,
    reviewAdvance: reviewAdvance,
    reviewPrev: reviewPrev,
    reviewNext: reviewNext,
    reviewJump: reviewJump,
    reviewSkip: reviewSkip,
    exitSession: exitReviewSession,
    getSession: function () { return reviewSession; },
    collectDueItems: collectDueItems,
    showSummaryModal: showReviewSummaryModal,
    isSummaryModalOpen: function () { return reviewSummaryModalOpen; },
    closeSummaryModal: function () { if (typeof _summaryExitFn === 'function') _summaryExitFn(); },
    nextSummarySprint: function () { if (typeof _summaryNextFn === 'function') _summaryNextFn(); }
  };

  // 全局接口互通别名
  window.calcRetrievability = calcRetrievability;
  window.calcSM2Plus = calcSM2Plus;
  window.calcSM2 = calcSM2;
  window.getSm2Seed = getSm2Seed;
  window.getSm2Label = getSm2Label;
  window.getSm2OverdueDays = getSm2OverdueDays;
  window.toggleSm2Panel = toggleSm2Panel;
  window.closeSm2Panel = closeSm2Panel;
  window.renderSm2Panel = renderSm2Panel;
  window.startReviewChapter = startReviewChapter;
  window.startReviewModule = startReviewModule;
  window.startAllReview = startAllReview;
  window.resumeReviewSession = window.Sm2Review.resumeSession;
  window.exitReviewSession = exitReviewSession;
  window.gradeCurrentReview = gradeCurrentReview;
  window.reviewCurrentItem = reviewCurrentItem;
  window.reviewAdvance = reviewAdvance;
  window.reviewPrev = reviewPrev;
  window.reviewNext = reviewNext;
  window.showReviewSummaryModal = showReviewSummaryModal;
  window.isReviewSummaryOpen = function () { return reviewSummaryModalOpen; };
  window.closeReviewSummaryModal = function () { if (typeof _summaryExitFn === 'function') _summaryExitFn(); };
  window.nextReviewSummarySprint = function () { if (typeof _summaryNextFn === 'function') _summaryNextFn(); };

  try {
    Object.defineProperty(window, 'reviewSession', {
      get: function () { return reviewSession; },
      set: function (v) { reviewSession = v; },
      configurable: true
    });
  } catch (e) {
    window.reviewSession = reviewSession;
  }

})();
