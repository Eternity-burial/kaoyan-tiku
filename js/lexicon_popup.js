/**
 * Kaoyan-Tiku: Lexicon Popup v2 & Historical Context Explorer (LexiconPopup)
 * 职责：
 *   1. 渲染规范的 Popup v2 气泡卡片：
 *      - 呈现顺序严格遵循：Headword/IPA/POS -> 【本句义】 -> 【考研真题】 -> 【通用词义】 -> 【考研标记】 -> 【个人学习】。
 *      - 严格区分 sentenceCount / occurrenceCount / paperCount 与 ECDICT BNC/FRQ 通用频次。
 *      - 支持短语与单字双轨切换。
 *   2. 提供历年真题语境浏览器 (Historical Occurrences Viewer)，多义词分语境呈现。
 *   3. 与 UserWord 和 SM-2 收藏体系无缝联动。
 */

(function (global) {
  'use strict';

  var dom = {
    popover: null,
    historyModal: null
  };

  var state = {
    currentSurface: '',
    currentArticleId: '',
    currentPs: '',
    currentOccurrence: null,
    currentLexeme: null,
    parentPhraseOccurrence: null,
    isPinned: false,
    activeTab: 'primary', // 'primary' | 'phrase' | 'word'
    hideTimer: null
  };

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initDom() {
    if (!dom.popover) {
      dom.popover = document.getElementById('engVocabPopover');
      if (!dom.popover) {
        dom.popover = document.createElement('div');
        dom.popover.id = 'engVocabPopover';
        dom.popover.className = 'vocab-popover';
        document.body.appendChild(dom.popover);
      }
    }

    if (!dom.historyModal) {
      dom.historyModal = document.getElementById('engModalLexHistory');
      if (!dom.historyModal) {
        dom.historyModal = document.createElement('div');
        dom.historyModal.id = 'engModalLexHistory';
        dom.historyModal.className = 'modal-overlay lex-history-modal-overlay';
        dom.historyModal.style.display = 'none';
        dom.historyModal.innerHTML = [
          '<div class="modal-card lex-history-modal-card">',
          '  <div class="modal-header">',
          '    <div class="lex-history-title-wrap">',
          '      <h3 id="lexHistoryTitle">历年真题语境</h3>',
          '      <span class="lex-history-badge" id="lexHistoryCountBadge"></span>',
          '    </div>',
          '    <button class="btn-close-modal" id="btnHistoryClose">&times;</button>',
          '  </div>',
          '  <div class="modal-body lex-history-body" id="lexHistoryBody">',
          '    <div class="lex-loading">正在加载历年真题语境...</div>',
          '  </div>',
          '</div>'
        ].join('\n');
        document.body.appendChild(dom.historyModal);

        var btnClose = document.getElementById('btnHistoryClose');
        if (btnClose) {
          btnClose.onclick = closeHistoryModal;
        }
        dom.historyModal.onclick = function (e) {
          if (e.target === dom.historyModal) closeHistoryModal();
        };
      }
    }
  }

  function playPronunciation(word, type) {
    if (window.kyApp && typeof window.kyApp.playWordPronunciation === 'function') {
      window.kyApp.playWordPronunciation(word, type);
      return;
    }
    try {
      var audio = new Audio('https://dict.youdao.com/dictvoice?audio=' + encodeURIComponent(word) + '&type=' + type);
      audio.play().catch(function () {});
    } catch (e) {}
  }

  // 格式化 ECDICT 中文字典释义为词性分行卡片
  function formatDictZh(defZh) {
    if (!defZh) return '';
    var lines = defZh.replace(/\\n/g, '\n').split('\n');
    var html = [];
    lines.forEach(function (line) {
      line = line.trim();
      if (!line) return;
      var posMatch = line.match(/^([a-z]+\.|\[[^\]]+\])\s*(.*)$/i);
      if (posMatch) {
        var pos = posMatch[1];
        var defs = posMatch[2];
        var isDomain = pos.charAt(0) === '[';
        html.push('<div class="pop-dict-entry">');
        html.push('  <span class="pop-pos-badge' + (isDomain ? ' domain-tag' : '') + '">' + escapeHtml(pos) + '</span>');
        html.push('  <span class="pop-def-line">' + escapeHtml(defs) + '</span>');
        html.push('</div>');
      } else {
        html.push('<div class="pop-dict-entry">');
        html.push('  <span class="pop-def-line">' + escapeHtml(line) + '</span>');
        html.push('</div>');
      }
    });
    return html.join('\n');
  }

  // ===== 渲染 Popup v2 核心内容 =====
  function renderPopupContent(lookupResult, queryMeta) {
    var occ = lookupResult.occurrence;
    var lex = lookupResult.lexeme;
    var surface = queryMeta.surface || (occ && occ.surface) || (lex && lex.lemma) || '';
    var ps = queryMeta.ps || (occ && occ.location && occ.location.ps) || '';
    var year = (occ && occ.location && occ.location.year) || '';
    var textNum = (occ && occ.location && occ.location.text) || '';

    var d = (lex && lex.dictionary) || {};
    var headword = (lex && lex.display) || (lex && lex.lemma) || surface;
    var ipa = d.ipa || '';
    var pos = d.pos || '';

    // 检查 UserWord 收藏与掌握度
    var userWord = (window.UserWordManager && lex) ? window.UserWordManager.getUserWord(lex.lexemeId) : null;
    var isStarred = false;
    var currentMastery = 'unmarked';
    if (userWord) {
      currentMastery = userWord.mastery || 'unmarked';
      if (occ) {
        isStarred = window.UserWordManager.isOccurrenceSaved(lex.lexemeId, occ.occurrenceId);
      } else {
        isStarred = !!userWord.starred;
      }
    }

    var html = [];

    // 1. 顶部栏 (Headword / IPA / POS / 发音 / 收藏)
    html.push('<div class="pop-header">');
    html.push('  <div class="pop-title-box">');
    html.push('    <span class="pop-headword">' + escapeHtml(headword) + '</span>');
    if (ipa) {
      html.push('    <span class="pop-ipa">[' + escapeHtml(ipa) + ']</span>');
    }
    if (pos) {
      html.push('    <span class="pop-pos">' + escapeHtml(pos) + '</span>');
    }
    html.push('  </div>');
    html.push('  <div class="pop-header-actions">');
    html.push('    <button type="button" class="pop-action-btn" data-act="pronounce-uk" title="英音发音">英</button>');
    html.push('    <button type="button" class="pop-action-btn" data-act="pronounce-us" title="美音发音">美</button>');
    html.push('    <button type="button" class="pop-star-btn ' + (isStarred ? 'is-starred' : '') + '" data-act="toggle-star" title="' + (isStarred ? '已收藏当前语境' : '收藏当前真题语境') + '">');
    html.push('      ' + (isStarred ? '★ 已收藏' : '☆ 收藏') + '</button>');
    html.push('  </div>');
    html.push('</div>');

    // 短语/单字切换提示栏（若当前是短语内包含单字或单字从属短语）
    if (queryMeta.phraseContext) {
      html.push('<div class="pop-context-switcher">');
      html.push('  <span class="switcher-label">当前词条：</span>');
      html.push('  <button class="switcher-tab ' + (state.activeTab === 'phrase' ? 'active' : '') + '" data-act="switch-tab" data-tab="phrase">短语: ' + escapeHtml(queryMeta.phraseContext.surface) + '</button>');
      html.push('  <button class="switcher-tab ' + (state.activeTab === 'word' ? 'active' : '') + '" data-act="switch-tab" data-tab="word">单字: ' + escapeHtml(queryMeta.singleWordContext.surface) + '</button>');
      html.push('</div>');
    }

    // 2. 【核心词典释义】(第一优先呈现，如同扇贝/欧路APP，词性分行清晰排版)
    var defZh = (d.generalDefinition && d.generalDefinition.zh) || '';
    var defEn = (d.generalDefinition && d.generalDefinition.en) || '';
    if (defZh) {
      html.push('<div class="pop-dict-box">');
      html.push(formatDictZh(defZh));
      if (defEn) {
        html.push('  <details class="pop-dict-en-details">');
        html.push('    <summary>英文完整释义 (展开)</summary>');
        html.push('    <div class="pop-dict-en">' + escapeHtml(defEn).replace(/\\n/g, '<br>').replace(/\n/g, '<br>') + '</div>');
        html.push('  </details>');
      }
      html.push('</div>');
    } else if (defEn) {
      html.push('<div class="pop-dict-box">');
      html.push('  <div class="pop-dict-en">' + escapeHtml(defEn).replace(/\\n/g, '<br>').replace(/\n/g, '<br>') + '</div>');
      html.push('</div>');
    }

    // 3. 【真题本句语境义】（仅在当前句子有特殊考义时作为高亮贴士呈现；无真题标注时彻底隐藏，不占版面）
    var contextMeaning = occ && occ.context ? (occ.context.contextMeaning || '').trim() : '';
    if (contextMeaning) {
      var locText = (year ? (year + ' 年') : '') + (textNum ? (' · Text ' + textNum) : '') + (ps ? (' · ' + ps) : '');
      html.push('<div class="pop-context-tip">');
      html.push('  <div class="pop-context-tip-head">');
      html.push('    <span class="tip-icon">💡</span><span class="tip-label">真题本句考义</span>');
      if (locText) {
        html.push('    <span class="tip-loc">' + escapeHtml(locText) + '</span>');
      }
      html.push('  </div>');
      html.push('  <div class="pop-context-tip-val">' + escapeHtml(contextMeaning) + '</div>');
      if (occ.annotations && occ.annotations.pdfPrintedGloss) {
        html.push('  <div class="pop-context-gloss">印刷边注: ' + escapeHtml(occ.annotations.pdfPrintedGloss) + '</div>');
      }
      html.push('</div>');
    }

    // 4. 【考研真题考频与分布】(单行紧凑状态条)
    var corpus = (lex && lex.kaoyanCorpus) || {};
    var sCount = corpus.sentenceCount;
    var pCount = corpus.paperCount;
    var hasCorpusStats = (typeof sCount === 'number');
    if (hasCorpusStats || lex) {
      html.push('<div class="pop-stats-bar">');
      if (hasCorpusStats) {
        html.push('  <span class="stat-info">📊 考研考频: <strong>' + sCount + '</strong> 句 (' + (pCount || 0) + ' 卷)' + (corpus.cefr ? ' · <strong>' + escapeHtml(corpus.cefr) + '</strong>' : '') + '</span>');
      } else {
        html.push('  <span class="stat-info">📖 考研词库</span>');
      }
      if (lex) {
        html.push('  <button type="button" class="btn-history-link" data-act="open-history" data-lexeme-id="' + lex.lexemeId + '">历年真题语境 &gt;</button>');
      }
      html.push('</div>');
    }

    // 5. 【考研标记徽章】
    var ann = (occ && occ.annotations) || {};
    var badges = [];
    if (ann.obstacleWord) badges.push('<span class="exam-tag tag-obstacle">考研难词</span>');
    if (ann.familiarWordUncommonMeaning) badges.push('<span class="exam-tag tag-rare">熟词僻义</span>');
    if (ann.examPointPdf) badges.push('<span class="exam-tag tag-exampoint">考点重点</span>');
    if (ann.personalPdf) badges.push('<span class="exam-tag tag-personal">个人笔记标注</span>');
    if (ann.properNoun || (lex && lex.properNoun)) badges.push('<span class="exam-tag tag-proper">专有名词</span>');
    if (lex && lex.type === 'phrase') badges.push('<span class="exam-tag tag-phrase">固定搭配</span>');

    if (badges.length > 0) {
      html.push('<div class="pop-tags-wrap">' + badges.join(' ') + '</div>');
    }

    // 6. 【个人掌握度与手记】
    html.push('<div class="pop-section pop-section-mastery">');
    html.push('  <div class="pop-mastery-title-row">');
    html.push('    <span class="pop-section-title">【复习掌握度】</span>');
    if (userWord && userWord.sm2 && userWord.sm2.reps > 0) {
      var nextDays = Math.max(0, Math.ceil(((userWord.sm2.nextReview || 0) - Date.now()) / (24 * 3600 * 1000)));
      html.push('    <span class="sm2-status-tag" title="SM-2 间隔重复状态">已复习 ' + userWord.sm2.reps + ' 次 · ' + (nextDays === 0 ? '今日到期' : (nextDays + '天后复习')) + '</span>');
    }
    html.push('  </div>');
    html.push('  <div class="pop-mastery-btn-group">');
    html.push('    <button type="button" class="btn-mastery-choice ' + (currentMastery === 'proficient' ? 'active-proficient' : '') + '" data-act="set-mastery" data-status="proficient">熟练 (Z)</button>');
    html.push('    <button type="button" class="btn-mastery-choice ' + (currentMastery === 'vague' ? 'active-vague' : '') + '" data-act="set-mastery" data-status="vague">模糊 (X)</button>');
    html.push('    <button type="button" class="btn-mastery-choice ' + (currentMastery === 'wrong' ? 'active-wrong' : '') + '" data-act="set-mastery" data-status="wrong">不会 (C)</button>');
    html.push('  </div>');

    var userNote = (userWord && userWord.note) || '';
    html.push('  <details class="pop-note-details" ' + (userNote ? 'open' : '') + '>');
    html.push('    <summary>个人生词手记 ' + (userNote ? '(已记)' : '+') + '</summary>');
    html.push('    <textarea class="pop-note-textarea" placeholder="记录你对此词/短语的助记联想、考法技巧...">' + escapeHtml(userNote) + '</textarea>');
    html.push('  </details>');
    html.push('</div>');

    return html.join('\n');
  }

  // ===== 显示 Popover =====
  function showPopover(anchorEl, lookupResult, queryMeta, isPinned) {
    initDom();
    var pop = dom.popover;
    if (!pop) return;

    state.isPinned = isPinned;
    state.currentSurface = queryMeta.surface;
    state.currentArticleId = queryMeta.articleId;
    state.currentPs = queryMeta.ps;
    state.currentOccurrence = lookupResult.occurrence;
    state.currentLexeme = lookupResult.lexeme;

    pop.classList.toggle('pinned', isPinned);
    pop.innerHTML = renderPopupContent(lookupResult, queryMeta);

    // 绑定内部交互事件
    attachPopoverEvents(pop, lookupResult, queryMeta);

    // 先以隐藏模式撑开以精确获取真实尺寸
    pop.style.display = 'block';
    pop.style.visibility = 'hidden';
    pop.style.maxHeight = '';

    // 精确视口边缘定位防遮挡（统一优先放置于单词正下方）
    var rect = anchorEl.getBoundingClientRect();
    var popWidth = pop.offsetWidth || 360;
    var popHeight = pop.offsetHeight || 280;
    var viewHeight = window.innerHeight;
    var viewWidth = window.innerWidth;

    // 1. 水平定位：默认对齐单词左侧，右侧贴边防溢出
    var left = rect.left;
    if (left + popWidth > viewWidth - 14) {
      left = Math.max(10, viewWidth - popWidth - 14);
    }
    if (left < 10) left = 10;

    // 2. 垂直定位：统一放到单词下方，除非下方空间严重不足
    var spaceBelow = viewHeight - rect.bottom - 10;
    var spaceAbove = rect.top - 10;
    var top;

    // 只有在下方空间严重不足（< 220px）且上方空间明显更大时，才放置在单词上方
    if (spaceBelow < 220 && spaceAbove > spaceBelow) {
      top = Math.max(10, rect.top - popHeight - 6);
      pop.style.maxHeight = Math.min(spaceAbove - 8, viewHeight * 0.75) + 'px';
    } else {
      // 绝大多数情况统一放置在单词正下方
      top = rect.bottom + 6;
      pop.style.maxHeight = Math.min(spaceBelow - 8, viewHeight * 0.75) + 'px';
    }

    pop.style.left = Math.round(left) + 'px';
    pop.style.top = Math.round(top) + 'px';
    pop.style.visibility = 'visible';

    pop.onmouseenter = function () {
      clearTimeout(state.hideTimer);
    };
    pop.onmouseleave = function () {
      if (state.isPinned) return;
      clearTimeout(state.hideTimer);
      state.hideTimer = setTimeout(function () {
        hidePopover();
      }, 350);
    };
  }

  function hidePopover() {
    state.isPinned = false;
    if (dom.popover) {
      dom.popover.style.display = 'none';
      dom.popover.classList.remove('pinned');
    }
  }

  function attachPopoverEvents(pop, lookupResult, queryMeta) {
    var occ = lookupResult.occurrence;
    var lex = lookupResult.lexeme;
    var headword = (lex && lex.lemma) || queryMeta.surface || '';

    pop.onclick = function (e) {
      var btn = e.target.closest('[data-act]');
      if (!btn) return;
      var act = btn.dataset.act;

      if (act === 'pronounce-uk') {
        playPronunciation(headword, 1);
      } else if (act === 'pronounce-us') {
        playPronunciation(headword, 2);
      } else if (act === 'toggle-star') {
        if (!lex || !window.UserWordManager) return;
        var nowStarred = window.UserWordManager.toggleStar(lex, occ, queryMeta);
        btn.classList.toggle('is-starred', nowStarred);
        btn.textContent = nowStarred ? '★ 已收藏' : '☆ 收藏';
        btn.title = nowStarred ? '已收藏当前语境' : '收藏当前真题语境';
        // 同步通知生词本更新
        if (window.LexiconNotebook && typeof window.LexiconNotebook.onUserWordChanged === 'function') {
          window.LexiconNotebook.onUserWordChanged();
        }
      } else if (act === 'set-mastery') {
        var status = btn.dataset.status;
        if (!lex || !window.UserWordManager) return;
        window.UserWordManager.setMastery(lex.lexemeId, status);
        pop.querySelectorAll('.btn-mastery-choice').forEach(function (b) {
          b.className = 'btn-mastery-choice' + (b.dataset.status === status ? (' active-' + status) : '');
        });
      } else if (act === 'open-history') {
        var lexId = btn.dataset.lexemeId;
        openHistoryModal(lexId, headword);
      } else if (act === 'switch-tab') {
        var targetTab = btn.dataset.tab;
        state.activeTab = targetTab;
        if (targetTab === 'phrase' && queryMeta.phraseContext) {
          pop.innerHTML = renderPopupContent(queryMeta.phraseContext.lookupResult, queryMeta.phraseContext);
          attachPopoverEvents(pop, queryMeta.phraseContext.lookupResult, queryMeta.phraseContext);
        } else if (targetTab === 'word' && queryMeta.singleWordContext) {
          pop.innerHTML = renderPopupContent(queryMeta.singleWordContext.lookupResult, queryMeta.singleWordContext);
          attachPopoverEvents(pop, queryMeta.singleWordContext.lookupResult, queryMeta.singleWordContext);
        }
      }
    };

    // 笔记防抖实时落盘
    var textarea = pop.querySelector('.pop-note-textarea');
    if (textarea) {
      var noteTimer = null;
      textarea.oninput = function () {
        clearTimeout(noteTimer);
        var val = textarea.value;
        noteTimer = setTimeout(function () {
          if (lex && window.UserWordManager) {
            window.UserWordManager.setNote(lex.lexemeId, val);
          }
        }, 400);
      };
    }
  }

  // ===== 历年真题语境抽屉 / 模态框 =====
  function openHistoryModal(lexemeId, lemma) {
    initDom();
    if (!dom.historyModal) return;

    var titleEl = document.getElementById('lexHistoryTitle');
    var badgeEl = document.getElementById('lexHistoryCountBadge');
    var bodyEl = document.getElementById('lexHistoryBody');

    if (titleEl) titleEl.textContent = '「' + (lemma || lexemeId) + '」历年真题语境';
    if (badgeEl) badgeEl.textContent = '加载中...';
    if (bodyEl) bodyEl.innerHTML = '<div class="lex-loading" style="padding:40px;text-align:center;color:#64748b;">正在加载全库历年真题语境...</div>';

    dom.historyModal.style.display = 'flex';

    if (!window.LexiconLoader) return;

    window.LexiconLoader.getHistoricalOccurrences(lexemeId).then(function (occs) {
      if (badgeEl) badgeEl.textContent = '(共 ' + occs.length + ' 处考查语境)';
      if (occs.length === 0) {
        if (bodyEl) {
          bodyEl.innerHTML = '<div style="padding:40px;text-align:center;color:#94a3b8;">暂无历年真题独立句子级索引记录</div>';
        }
        return;
      }

      var cardsHtml = occs.map(function (o, idx) {
        var loc = o.location || {};
        var year = loc.year || '历年';
        var textNum = loc.text ? ('Text ' + loc.text) : (loc.section || '');
        var ps = loc.ps || '';
        var meaning = (o.context && o.context.contextMeaning) || '详见真题语境';
        var sentenceEn = (o.sentence && o.sentence.text) || '';
        var sentenceZh = (o.sentence && o.sentence.translation) || '';

        // 高亮关键词
        var highlightedSentence = escapeHtml(sentenceEn);
        if (o.surface) {
          var re = new RegExp('(?<![a-zA-Z0-9_])(' + escapeHtml(o.surface) + ')(?![a-zA-Z0-9_])', 'gi');
          highlightedSentence = highlightedSentence.replace(re, '<mark class="lex-history-mark">$1</mark>');
        }

        var isSaved = (window.UserWordManager) ? window.UserWordManager.isOccurrenceSaved(lexemeId, o.occurrenceId) : false;

        return [
          '<div class="lex-history-card">',
          '  <div class="lex-history-card-header">',
          '    <div class="loc-tags">',
          '      <span class="hist-year-badge">' + year + ' 年</span>',
          '      <span class="hist-text-badge">' + escapeHtml(textNum) + '</span>',
          (ps ? ('      <span class="hist-ps-badge">' + escapeHtml(ps) + '</span>') : ''),
          '    </div>',
          '    <div class="hist-card-actions">',
          '      <span class="hist-meaning-badge">语境义: ' + escapeHtml(meaning) + '</span>',
          '      <button type="button" class="hist-star-btn ' + (isSaved ? 'is-starred' : '') + '" data-act="hist-toggle-star" data-occ-id="' + o.occurrenceId + '">',
          '        ' + (isSaved ? '★ 已收藏' : '☆ 收藏此句') + '</button>',
          '    </div>',
          '  </div>',
          '  <div class="lex-history-sentence-en">' + highlightedSentence + '</div>',
          (sentenceZh ? ('  <div class="lex-history-sentence-zh">' + escapeHtml(sentenceZh) + '</div>') : ''),
          '</div>'
        ].join('\n');
      }).join('\n');

      if (bodyEl) {
        bodyEl.innerHTML = cardsHtml;
        bodyEl.onclick = function (e) {
          var btn = e.target.closest('[data-act="hist-toggle-star"]');
          if (!btn) return;
          var occId = btn.dataset.occId;
          var targetOcc = occs.find(function (x) { return x.occurrenceId === occId; });
          if (targetOcc && window.UserWordManager && window.LexiconLoader) {
            window.LexiconLoader.getLexemeById(lexemeId).then(function (lex) {
              if (lex) {
                var nowStar = window.UserWordManager.toggleStar(lex, targetOcc, {
                  year: targetOcc.location && targetOcc.location.year,
                  textId: targetOcc.location && targetOcc.location.text ? ('text' + targetOcc.location.text) : '',
                  ps: targetOcc.location && targetOcc.location.ps
                });
                btn.classList.toggle('is-starred', nowStar);
                btn.textContent = nowStar ? '★ 已收藏' : '☆ 收藏此句';
              }
            });
          }
        };
      }
    }).catch(function (err) {
      if (bodyEl) {
        bodyEl.innerHTML = '<div style="padding:40px;text-align:center;color:#ef4444;">加载历年真题语境失败: ' + escapeHtml(err.message) + '</div>';
      }
    });
  }

  function closeHistoryModal() {
    if (dom.historyModal) {
      dom.historyModal.style.display = 'none';
    }
  }

  var LexiconPopup = {
    show: showPopover,
    hide: hidePopover,
    openHistory: openHistoryModal,
    closeHistory: closeHistoryModal,
    renderPopupContent: renderPopupContent,
    getState: function () { return state; }
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = LexiconPopup;
  }
  global.LexiconPopup = LexiconPopup;

})(typeof window !== 'undefined' ? window : global);
