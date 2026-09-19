/**
 * Kaoyan-Tiku: UserWord Model & Legacy Starred Words Migration (UserWordManager)
 * 职责：
 *   1. 统一管理 UserWord 运行时实体模型 (按 Lexeme 聚合 + savedOccurrences 语境多选)。
 *   2. 实现旧版 ky_english_starred_words 幂等、无损自动迁移。
 *   3. 深度接入 SM-2+ (window.Sm2Review) 间隔重复算法与掌握度评级。
 *   4. 与 StorageSync 本地硬盘自动静默同步。
 */

(function (global) {
  'use strict';

  var STORAGE_KEY_V2 = 'ky_english_user_words_v2';
  var MIGRATION_FLAG_KEY = 'ky_english_userword_migrated_v1';
  var LEGACY_STORAGE_KEY = 'ky_english_starred_words';

  var userWords = {}; // { [lexemeId]: UserWord }
  var isLoaded = false;

  function initDefaultSM2() {
    return {
      ef: 2.5,
      interval: 1,
      reps: 0,
      nextReview: 0,
      lastReview: 0,
      history: []
    };
  }

  function loadUserWords() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY_V2);
      userWords = raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.warn('[UserWordManager] Failed to parse user_words_v2 from storage:', e);
      userWords = {};
    }
    isLoaded = true;
    return userWords;
  }

  function saveUserWords() {
    try {
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(userWords));
      if (global.storageSync && typeof global.storageSync.scheduleSave === 'function') {
        global.storageSync.scheduleSave();
      }
    } catch (e) {
      console.warn('[UserWordManager] Failed to save user_words_v2 to storage:', e);
    }
  }

  function getUserWord(lexemeId) {
    if (!isLoaded) loadUserWords();
    return userWords[lexemeId] || null;
  }

  function getAllUserWords() {
    if (!isLoaded) loadUserWords();
    return Object.values(userWords);
  }

  function getStarredUserWords() {
    if (!isLoaded) loadUserWords();
    return Object.values(userWords).filter(function (uw) {
      return uw.starred || (uw.savedOccurrences && uw.savedOccurrences.length > 0);
    });
  }

  function isOccurrenceSaved(lexemeId, occurrenceId) {
    var uw = getUserWord(lexemeId);
    if (!uw || !Array.isArray(uw.savedOccurrences)) return false;
    return uw.savedOccurrences.some(function (o) {
      return o.occurrenceId === occurrenceId;
    });
  }

  function isLexemeStarred(lexemeId) {
    var uw = getUserWord(lexemeId);
    if (!uw) return false;
    return !!(uw.starred || (uw.savedOccurrences && uw.savedOccurrences.length > 0));
  }

  /**
   * 收藏 / 取消收藏特定语境（或整个 Lexeme）
   */
  function toggleStar(lexeme, occurrence, meta) {
    if (!lexeme || !lexeme.lexemeId) return false;
    if (!isLoaded) loadUserWords();

    var lexId = lexeme.lexemeId;
    var lemma = lexeme.lemma || lexeme.display || (meta && meta.surface) || '';
    meta = meta || {};

    var uw = userWords[lexId];
    if (!uw) {
      uw = {
        lexemeId: lexId,
        lemma: lemma,
        starred: true,
        mastery: 'unmarked',
        queryCount: 1,
        savedOccurrences: [],
        note: '',
        sm2: initDefaultSM2(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      userWords[lexId] = uw;
    }

    uw.updatedAt = new Date().toISOString();

    if (occurrence && occurrence.occurrenceId) {
      var occId = occurrence.occurrenceId;
      var existingIdx = -1;
      for (var i = 0; i < uw.savedOccurrences.length; i++) {
        if (uw.savedOccurrences[i].occurrenceId === occId) {
          existingIdx = i;
          break;
        }
      }

      if (existingIdx !== -1) {
        // 已收藏此语境：移除该语境
        uw.savedOccurrences.splice(existingIdx, 1);
        if (uw.savedOccurrences.length === 0) {
          uw.starred = false;
        }
      } else {
        // 新增收藏此语境
        var loc = occurrence.location || {};
        var savedOcc = {
          occurrenceId: occId,
          year: loc.year || meta.year || null,
          textId: (loc.text ? ('text' + loc.text) : (loc.section || meta.textId || null)),
          ps: loc.ps || meta.ps || null,
          surface: occurrence.surface || meta.surface || lemma,
          contextMeaning: (occurrence.context && occurrence.context.contextMeaning) || meta.meaning || '',
          savedAt: new Date().toISOString()
        };
        uw.savedOccurrences.push(savedOcc);
        uw.starred = true;
      }
    } else {
      // 整体词条级收藏切换
      uw.starred = !uw.starred;
    }

    saveUserWords();
    return isLexemeStarred(lexId);
  }

  /**
   * 移除特定已收藏语境
   */
  function removeSavedOccurrence(lexemeId, occurrenceId) {
    var uw = getUserWord(lexemeId);
    if (!uw || !Array.isArray(uw.savedOccurrences)) return;
    uw.savedOccurrences = uw.savedOccurrences.filter(function (o) {
      return o.occurrenceId !== occurrenceId;
    });
    if (uw.savedOccurrences.length === 0) {
      uw.starred = false;
    }
    uw.updatedAt = new Date().toISOString();
    saveUserWords();
  }

  /**
   * 取消收藏整个词条（保留学习记录，但移出生词本列表）
   */
  function unstarLexeme(lexemeId) {
    var uw = getUserWord(lexemeId);
    if (!uw) return;
    uw.starred = false;
    uw.savedOccurrences = [];
    uw.updatedAt = new Date().toISOString();
    saveUserWords();
  }

  /**
   * 设置掌握度 (熟练 proficient / 模糊 vague / 不会 wrong / unmarked)
   */
  function setMastery(lexemeId, status) {
    var uw = getUserWord(lexemeId);
    if (!uw) {
      uw = {
        lexemeId: lexemeId,
        lemma: '',
        starred: false,
        mastery: status,
        queryCount: 1,
        savedOccurrences: [],
        note: '',
        sm2: initDefaultSM2(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      userWords[lexemeId] = uw;
    }

    uw.mastery = status;
    uw.updatedAt = new Date().toISOString();

    // SM-2 同步基线
    var scoreMap = { proficient: 5, vague: 3, wrong: 1 };
    var sm2Score = scoreMap[status];
    if (sm2Score && global.Sm2Review && typeof global.Sm2Review.calcSM2Plus === 'function') {
      var nextSm2 = global.Sm2Review.calcSM2Plus(uw.sm2, sm2Score);
      if (nextSm2) {
        uw.sm2 = nextSm2;
      }
    }

    saveUserWords();
  }

  /**
   * 记录 SM-2 复习打分 (1 ~ 5)
   */
  function recordReviewSM2(lexemeId, score) {
    var uw = getUserWord(lexemeId);
    if (!uw) return null;

    score = parseInt(score, 10);
    if (isNaN(score) || score < 1 || score > 5) score = 3;

    if (global.Sm2Review && typeof global.Sm2Review.calcSM2Plus === 'function') {
      var nextSm2 = global.Sm2Review.calcSM2Plus(uw.sm2, score);
      if (nextSm2) {
        uw.sm2 = nextSm2;
      }
    } else {
      // 算法兜底
      uw.sm2 = uw.sm2 || initDefaultSM2();
      uw.sm2.reps = (uw.sm2.reps || 0) + 1;
      uw.sm2.lastReview = Date.now();
      uw.sm2.nextReview = Date.now() + (score >= 4 ? (uw.sm2.reps * 3) : 1) * 86400000;
    }

    // 根据评分反向调整掌握度
    if (score >= 4) {
      uw.mastery = 'proficient';
    } else if (score === 3) {
      uw.mastery = 'vague';
    } else {
      uw.mastery = 'wrong';
    }

    uw.updatedAt = new Date().toISOString();
    saveUserWords();
    return uw.sm2;
  }

  /**
   * 更新个人笔记
   */
  function setNote(lexemeId, noteText) {
    var uw = getUserWord(lexemeId);
    if (!uw) return;
    uw.note = noteText || '';
    uw.updatedAt = new Date().toISOString();
    saveUserWords();
  }

  /**
   * 增加查询次数计数器
   */
  function incrementQueryCount(lexemeId) {
    var uw = getUserWord(lexemeId);
    if (!uw) return;
    uw.queryCount = (uw.queryCount || 0) + 1;
    saveUserWords();
  }

  // ===== 8. 旧版生词本数据幂等迁移 =====
  /**
   * 将 ky_english_starred_words 无损迁移到 ky_english_user_words_v2
   */
  function migrateLegacyStarredWords() {
    if (!isLoaded) loadUserWords();

    var legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacyRaw) return Promise.resolve({ migrated: 0, skipped: 0 });

    var legacyMap = {};
    try {
      legacyMap = JSON.parse(legacyRaw);
    } catch (e) {
      return Promise.resolve({ migrated: 0, skipped: 0 });
    }

    var legacyWords = Object.keys(legacyMap);
    if (legacyWords.length === 0) return Promise.resolve({ migrated: 0, skipped: 0 });

    if (!global.LexiconLoader) {
      return Promise.resolve({ migrated: 0, skipped: legacyWords.length });
    }

    var migratedCount = 0;
    var skippedCount = 0;

    var tasks = legacyWords.map(function (k) {
      var oldItem = legacyMap[k];
      var rawWord = (oldItem.word || k).trim();

      // 查询该词在 Canonical Lexicon 中的 lexemeId
      return global.LexiconLoader.lookup(rawWord).then(function (res) {
        if (!res || !res.lexemeId) {
          skippedCount++;
          return;
        }

        var lexId = res.lexemeId;
        var existing = userWords[lexId];
        if (existing) {
          // 已存在 UserWord，严禁覆盖更新的字段
          skippedCount++;
          return;
        }

        // 尝试恢复 Occurrence
        var recoveredOccs = [];
        if (oldItem.year && oldItem.textId && res.occurrence) {
          var oLoc = res.occurrence.location || {};
          if (String(oLoc.year) === String(oldItem.year)) {
            recoveredOccs.push({
              occurrenceId: res.occurrence.occurrenceId,
              year: oLoc.year,
              textId: oldItem.textId,
              ps: oLoc.ps,
              surface: res.occurrence.surface || rawWord,
              contextMeaning: (res.occurrence.context && res.occurrence.context.contextMeaning) || oldItem.meaning || '',
              savedAt: oldItem.date || new Date().toISOString()
            });
          }
        }

        userWords[lexId] = {
          lexemeId: lexId,
          lemma: (res.lexeme && res.lexeme.lemma) || rawWord,
          starred: true,
          mastery: 'unmarked',
          queryCount: 1,
          savedOccurrences: recoveredOccs,
          note: '',
          sm2: initDefaultSM2(),
          createdAt: oldItem.date || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        migratedCount++;
      }).catch(function () {
        skippedCount++;
      });
    });

    return Promise.all(tasks).then(function () {
      saveUserWords();
      localStorage.setItem(MIGRATION_FLAG_KEY, new Date().toISOString());
      console.log('[UserWordManager] Legacy starred words migration completed. Migrated:', migratedCount, 'Skipped:', skippedCount);
      return { migrated: migratedCount, skipped: skippedCount };
    });
  }

  var UserWordManager = {
    loadUserWords: loadUserWords,
    saveUserWords: saveUserWords,
    getUserWord: getUserWord,
    getAllUserWords: getAllUserWords,
    getStarredUserWords: getStarredUserWords,
    isOccurrenceSaved: isOccurrenceSaved,
    isLexemeStarred: isLexemeStarred,
    toggleStar: toggleStar,
    removeSavedOccurrence: removeSavedOccurrence,
    unstarLexeme: unstarLexeme,
    setMastery: setMastery,
    recordReviewSM2: recordReviewSM2,
    setNote: setNote,
    incrementQueryCount: incrementQueryCount,
    migrateLegacyStarredWords: migrateLegacyStarredWords
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserWordManager;
  }
  global.UserWordManager = UserWordManager;

  // 立即预读用户数据
  loadUserWords();

})(typeof window !== 'undefined' ? window : global);
