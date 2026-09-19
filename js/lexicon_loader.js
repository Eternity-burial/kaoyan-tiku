/**
 * Kaoyan-Tiku: Unified Canonical Lexicon Loader (LexiconLoader)
 * 职责：
 *   1. 统一加载并索引 Canonical Lexicon 事实层。
 *   2. 支持 browser (file:/// 与 http://) 及 Node.js 双重运行环境。
 *   3. 提供 O(1) 的篇章词汇对齐、句级定位 (P-S)、全词查询链 (Surface -> Lemma -> Lexeme)。
 *   4. 支持按需惰性加载词汇分片 (Shards) 与历年考研语境 Occurrence 分片。
 */

(function (global) {
  'use strict';

  // Node.js 垫片：若没有 window 则映射到 global
  if (typeof window === 'undefined') {
    global.window = global;
  }

  // 基础根路径（相对当前 HTML 页面）
  var BASE_DIST_PATH = '题库/英语/lexicon/dist/';

  // 确保全局挂载空间
  global.__KY_LEXICON__ = global.__KY_LEXICON__ || {};
  var root = global.__KY_LEXICON__;

  root.surfaceIndex = root.surfaceIndex || null;
  root.lemmaIndex = root.lemmaIndex || null;
  root.phraseIndex = root.phraseIndex || null;
  root.occByLexeme = root.occByLexeme || null;
  root.articles = root.articles || {};
  root.lexemes = root.lexemes || {};
  root.allOccurrences = root.allOccurrences || {};

  var loadingPromises = {};

  function isNode() {
    return typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
  }

  // 动态加载 JS 脚本（兼容 file:/// 与 HTTP/HTTPS）
  function loadScript(src) {
    if (loadingPromises[src]) {
      return loadingPromises[src];
    }

    if (isNode()) {
      var fs = require('fs');
      var path = require('path');
      var vm = require('vm');
      var fullPath = path.resolve(__dirname, '..', src);
      try {
        var code = fs.readFileSync(fullPath, 'utf8');
        vm.runInThisContext(code);
        loadingPromises[src] = Promise.resolve();
        return loadingPromises[src];
      } catch (e) {
        return Promise.reject(e);
      }
    }

    var p = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.charset = 'utf-8';
      script.onload = function () {
        script.onload = null;
        script.onerror = null;
        resolve();
      };
      script.onerror = function (err) {
        script.onload = null;
        script.onerror = null;
        delete loadingPromises[src];
        reject(new Error('Failed to load lexicon script: ' + src));
      };
      document.head.appendChild(script);
    });

    loadingPromises[src] = p;
    return p;
  }

  // ===== 1. 核心索引加载 =====
  function initIndexes() {
    var tasks = [];
    if (!root.surfaceIndex) {
      tasks.push(loadScript(BASE_DIST_PATH + 'indexes/surface-index.js'));
    }
    if (!root.lemmaIndex) {
      tasks.push(loadScript(BASE_DIST_PATH + 'indexes/lemma-index.js'));
    }
    if (!root.phraseIndex) {
      tasks.push(loadScript(BASE_DIST_PATH + 'indexes/phrase-index.js'));
    }
    if (!root.occByLexeme) {
      tasks.push(loadScript(BASE_DIST_PATH + 'indexes/occ-by-lexeme.js'));
    }
    return Promise.all(tasks);
  }

  // ===== 2. 篇章数据包加载 =====
  function loadArticle(articleId) {
    if (!articleId) return Promise.resolve(null);
    if (root.articles[articleId]) {
      return Promise.resolve(root.articles[articleId]);
    }
    var scriptPath = BASE_DIST_PATH + 'articles/' + encodeURIComponent(articleId) + '.js';
    return loadScript(scriptPath).then(function () {
      var art = root.articles[articleId] || null;
      if (art && art.lexemes) {
        // 合并篇章内的 lexemes 到全局快速字典缓存
        Object.assign(root.lexemes, art.lexemes);
      }
      return art;
    }).catch(function (e) {
      console.warn('[LexiconLoader] Article pack not found for:', articleId, e);
      return null;
    });
  }

  function getArticle(articleId) {
    return root.articles[articleId] || null;
  }

  // ===== 3. 按 P-S 定位 Occurrences =====
  function getOccurrencesByPs(articleId, ps) {
    var art = getArticle(articleId);
    if (!art || !art.byPs || !art.byPs[ps]) return [];
    var occIds = art.byPs[ps];
    return occIds.map(function (id) {
      return art.occurrences[id] || root.allOccurrences[id];
    }).filter(Boolean);
  }

  function getOccurrenceById(occId, articleId) {
    if (articleId && root.articles[articleId] && root.articles[articleId].occurrences[occId]) {
      return root.articles[articleId].occurrences[occId];
    }
    if (root.allOccurrences[occId]) {
      return root.allOccurrences[occId];
    }
    // 从篇章中搜索
    var keys = Object.keys(root.articles);
    for (var i = 0; i < keys.length; i++) {
      var a = root.articles[keys[i]];
      if (a && a.occurrences && a.occurrences[occId]) {
        return a.occurrences[occId];
      }
    }
    return null;
  }

  // ===== 4. 按需加载 Lexeme 分片 =====
  function loadLexemeShard(shardHex) {
    shardHex = shardHex.toLowerCase();
    var shardPath = BASE_DIST_PATH + 'shards/lex-' + shardHex + '.js';
    return loadScript(shardPath);
  }

  function getLexemeById(lexemeId) {
    if (!lexemeId) return Promise.resolve(null);
    if (root.lexemes[lexemeId]) {
      return Promise.resolve(root.lexemes[lexemeId]);
    }
    // 篇章中遍历
    var artKeys = Object.keys(root.articles);
    for (var i = 0; i < artKeys.length; i++) {
      var a = root.articles[artKeys[i]];
      if (a && a.lexemes && a.lexemes[lexemeId]) {
        root.lexemes[lexemeId] = a.lexemes[lexemeId];
        return Promise.resolve(a.lexemes[lexemeId]);
      }
    }
    // 按 lexemeId 第 4 位十六进制字符定位分片
    var hex = (lexemeId.length > 4) ? lexemeId.charAt(4).toLowerCase() : '0';
    return loadLexemeShard(hex).then(function () {
      return root.lexemes[lexemeId] || null;
    }).catch(function () {
      return null;
    });
  }

  function getLexemeByIdSync(lexemeId) {
    if (!lexemeId) return null;
    if (root.lexemes[lexemeId]) return root.lexemes[lexemeId];
    var artKeys = Object.keys(root.articles);
    for (var i = 0; i < artKeys.length; i++) {
      var a = root.articles[artKeys[i]];
      if (a && a.lexemes && a.lexemes[lexemeId]) {
        root.lexemes[lexemeId] = a.lexemes[lexemeId];
        return a.lexemes[lexemeId];
      }
    }
    return null;
  }

  // ===== 5. 历年真题语境加载 (Occurrence Shards) =====
  function loadOccShard(shardHex) {
    shardHex = shardHex.toLowerCase();
    var shardPath = BASE_DIST_PATH + 'shards/occ-' + shardHex + '.js';
    return loadScript(shardPath);
  }

  function getHistoricalOccurrences(lexemeId) {
    if (!lexemeId) return Promise.resolve([]);
    return initIndexes().then(function () {
      var occIds = (root.occByLexeme && root.occByLexeme[lexemeId]) || [];
      if (!occIds || occIds.length === 0) return [];

      // 检查需要哪些分片
      var neededShards = {};
      var missing = false;
      for (var i = 0; i < occIds.length; i++) {
        var oid = occIds[i];
        if (!root.allOccurrences[oid]) {
          var hex = (oid.length > 4) ? oid.charAt(4).toLowerCase() : '0';
          neededShards[hex] = true;
          missing = true;
        }
      }

      var shardPromises = [];
      if (missing) {
        Object.keys(neededShards).forEach(function (h) {
          shardPromises.push(loadOccShard(h));
        });
      }

      return Promise.all(shardPromises).then(function () {
        var result = [];
        for (var j = 0; j < occIds.length; j++) {
          var occ = root.allOccurrences[occIds[j]] || getOccurrenceById(occIds[j]);
          if (occ) result.push(occ);
        }
        // 按年份降序排
        result.sort(function (a, b) {
          var ya = (a.location && a.location.year) || 0;
          var yb = (b.location && b.location.year) || 0;
          return yb - ya;
        });
        return result;
      });
    });
  }

  // ===== 6. 词形变化启发式还原器 (Morphological Lemmatizer) =====
  function generateMorphologicalCandidates(word) {
    var raw = (word || '').trim();
    if (!raw) return [];
    var lower = raw.toLowerCase();
    var candidates = [raw];
    if (lower !== raw) candidates.push(lower);

    // 常见英语屈折规则
    // 1. -ies -> -y (e.g. companies -> company)
    if (lower.endsWith('ies') && lower.length > 4) {
      candidates.push(lower.slice(0, -3) + 'y');
    }
    // 2. -es -> -e or '' (e.g. boxes -> box, isolates -> isolate)
    if (lower.endsWith('es') && lower.length > 3) {
      candidates.push(lower.slice(0, -1)); // isolates -> isolate
      candidates.push(lower.slice(0, -2)); // boxes -> box
    }
    // 3. -s -> '' (e.g. cats -> cat)
    if (lower.endsWith('s') && !lower.endsWith('ss') && lower.length > 2) {
      candidates.push(lower.slice(0, -1));
    }
    // 4. -ing -> '' or -e (e.g. running -> run, making -> make, seeing -> see)
    if (lower.endsWith('ing') && lower.length > 4) {
      var baseIng = lower.slice(0, -3);
      candidates.push(baseIng);
      candidates.push(baseIng + 'e');
      // 双写结尾 (e.g. stopping -> stop)
      if (baseIng.length > 2 && baseIng.charAt(baseIng.length - 1) === baseIng.charAt(baseIng.length - 2)) {
        candidates.push(baseIng.slice(0, -1));
      }
    }
    // 5. -ed -> '' or -e or -y (e.g. perceived -> perceive, applied -> apply)
    if (lower.endsWith('ied') && lower.length > 4) {
      candidates.push(lower.slice(0, -3) + 'y');
    } else if (lower.endsWith('ed') && lower.length > 3) {
      var baseEd = lower.slice(0, -2);
      candidates.push(baseEd);
      candidates.push(baseEd + 'e'); // perceived -> perceive
      if (baseEd.length > 2 && baseEd.charAt(baseEd.length - 1) === baseEd.charAt(baseEd.length - 2)) {
        candidates.push(baseEd.slice(0, -1));
      }
    }
    // 6. -er / -est (e.g. bigger -> big, higher -> high)
    if (lower.endsWith('est') && lower.length > 4) {
      candidates.push(lower.slice(0, -3));
      candidates.push(lower.slice(0, -3) + 'e');
    } else if (lower.endsWith('er') && lower.length > 3) {
      candidates.push(lower.slice(0, -2));
      candidates.push(lower.slice(0, -2) + 'e');
    }

    return candidates;
  }

  // ===== 7. 核心词汇查询链 (Lookup Chain) =====
  /**
   * 查询顺序：
   * 1. 当前句的 Occurrence (精确匹配 surface 或 phrase)
   * 2. 当前篇章的 Occurrence
   * 3. Surface Index
   * 4. Lemma Index (含 forms/exchange)
   * 5. 规则词形还原候选
   *
   * 返回 Promise<{ occurrence: Occurrence|null, lexemeId: string|null, lexeme: Lexeme|null, matchType: string }>
   */
  function lookup(surface, articleId, ps) {
    if (!surface) return Promise.resolve(null);
    var cleanSurface = surface.trim();

    // 1. 先检查当前句的 Occurrence (最高优先级)
    if (articleId && ps) {
      var sentenceOccs = getOccurrencesByPs(articleId, ps);
      for (var i = 0; i < sentenceOccs.length; i++) {
        var occ = sentenceOccs[i];
        if (occ.surface === cleanSurface || occ.surface.toLowerCase() === cleanSurface.toLowerCase()) {
          var lex = getLexemeByIdSync(occ.lexemeId);
          if (lex) {
            return Promise.resolve({
              occurrence: occ,
              lexemeId: occ.lexemeId,
              lexeme: lex,
              matchType: 'sentence-occurrence'
            });
          }
          return getLexemeById(occ.lexemeId).then(function (l) {
            return {
              occurrence: occ,
              lexemeId: occ.lexemeId,
              lexeme: l,
              matchType: 'sentence-occurrence'
            };
          });
        }
      }
    }

    // 2. 检查当前篇章的其他 Occurrence
    if (articleId) {
      var art = getArticle(articleId);
      if (art && art.occurrences) {
        var occKeys = Object.keys(art.occurrences);
        for (var j = 0; j < occKeys.length; j++) {
          var aOcc = art.occurrences[occKeys[j]];
          if (aOcc.surface === cleanSurface || aOcc.surface.toLowerCase() === cleanSurface.toLowerCase()) {
            var aLex = getLexemeByIdSync(aOcc.lexemeId);
            if (aLex) {
              return Promise.resolve({
                occurrence: aOcc,
                lexemeId: aOcc.lexemeId,
                lexeme: aLex,
                matchType: 'article-occurrence'
              });
            }
            return getLexemeById(aOcc.lexemeId).then(function (l) {
              return {
                occurrence: aOcc,
                lexemeId: aOcc.lexemeId,
                lexeme: l,
                matchType: 'article-occurrence'
              };
            });
          }
        }
      }
    }

    // 3. 全局索引查询
    return initIndexes().then(function () {
      var targetLexemeId = null;
      var matchType = 'dictionary';

      // 3.1 surface index (区分大小写与小写)
      if (root.surfaceIndex) {
        var hitS = root.surfaceIndex[cleanSurface] || root.surfaceIndex[cleanSurface.toLowerCase()];
        if (hitS && hitS.length > 0) {
          targetLexemeId = hitS[0];
          matchType = 'surface-index';
        }
      }

      // 3.2 lemma index (含 exchange / forms)
      if (!targetLexemeId && root.lemmaIndex) {
        var hitL = root.lemmaIndex[cleanSurface] || root.lemmaIndex[cleanSurface.toLowerCase()];
        if (hitL && hitL.length > 0) {
          targetLexemeId = hitL[0];
          matchType = 'lemma-index';
        }
      }

      // 3.3 启发式形态候选
      if (!targetLexemeId && root.lemmaIndex) {
        var candidates = generateMorphologicalCandidates(cleanSurface);
        for (var k = 0; k < candidates.length; k++) {
          var cand = candidates[k];
          var hitC = root.lemmaIndex[cand] || (root.surfaceIndex && root.surfaceIndex[cand]);
          if (hitC && hitC.length > 0) {
            targetLexemeId = hitC[0];
            matchType = 'morphological-lemma';
            break;
          }
        }
      }

      if (!targetLexemeId) {
        return null;
      }

      return getLexemeById(targetLexemeId).then(function (lex) {
        return {
          occurrence: null,
          lexemeId: targetLexemeId,
          lexeme: lex,
          matchType: matchType
        };
      });
    });
  }

  // ===== 8. 暴露对外接口 =====
  var LexiconLoader = {
    initIndexes: initIndexes,
    loadArticle: loadArticle,
    getArticle: getArticle,
    getOccurrencesByPs: getOccurrencesByPs,
    getOccurrenceById: getOccurrenceById,
    getLexemeById: getLexemeById,
    getLexemeByIdSync: getLexemeByIdSync,
    getHistoricalOccurrences: getHistoricalOccurrences,
    lookup: lookup,
    generateMorphologicalCandidates: generateMorphologicalCandidates,
    getPhraseIndex: function () { return root.phraseIndex || []; },
    getRoot: function () { return root; }
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = LexiconLoader;
  }
  global.LexiconLoader = LexiconLoader;

})(typeof window !== 'undefined' ? window : global);
