/**
 * 考研题库 · 图片标注与 Snipaste 风格灯箱工具栏模块 (ImageAnnotator)
 *
 * 职责：
 *   1. 管理图片矢量标注 (marker.js 3) 的 LocalStorage 持久化存储与路径标准化 (normalizeSrc)。
 *   2. 管理灯箱查看模式下的自建 Snipaste 风格标注工具栏 (annotToolbar)：
 *      - 矩形框、直线、荧光笔高亮、自由画笔4种工具及其独立颜色/粗细记忆
 *      - Microsoft Office 20 标准色预设面板与取色器
 *      - Shift 轴向锁定（水平/竖直画线）
 *      - 右键 + 滚轮调节粗细，横向滚轮切工具，普通滚轮无漂移缩放
 *      - 撤销 (Undo)、重做 (Redo)、删除选中图形
 *   3. 灯箱原图与标注矢量层无缝叠加与保存退出。
 */

(function () {
  'use strict';

  var imgAnnotations = {}; // key: 图片绝对 src，value: markerArea.getState() 矢量 JSON
  var lbCurrentSrc = null;
  var lbMarkerArea = null;
  var lbAnnotMode = false;
  var lbAnnotColor = '#ff0000';
  var lbAnnotWidth = 4;
  var lbLastAnnotTool = 'FrameMarker';
  var lbCurrentAnnotTool = 'FrameMarker';
  var lbCurrentAnnotEditor = null;
  var lbAnnotShiftWasOn = false;

  var ANNOT_TOOLS = ['FrameMarker', 'LineMarker', 'HighlighterMarker', 'FreehandMarker'];

  var ANNOT_TOOL_STYLES = {
    LineMarker:        { color: '#ff0000', width: 4 },
    FrameMarker:       { color: '#ff0000', width: 4 },
    HighlighterMarker: { color: '#ffff00', width: 20 },
    FreehandMarker:    { color: '#ff0000', width: 3 }
  };

  var ANNOT_COLORS = [
    '#000000', '#7f7f7f',
    '#880015', '#ed1c24',
    '#ff7f27', '#fff200',
    '#22b14c', '#1e90ff',
    '#3f48cc', '#a349a4',
    '#ffffff', '#c3c3c3',
    '#b97a57', '#ffaec9',
    '#ffc90e', '#efe4b0',
    '#b5e61d', '#99d9ea',
    '#7092be', '#c8bfe7'
  ];

  function normalizeAnnotSrc(imgSrc) {
    try {
      return new URL(imgSrc, window.location.href).href;
    } catch (e) {
      return imgSrc;
    }
  }

  function annotKey(imgSrc) {
    return 'annot_' + normalizeAnnotSrc(imgSrc);
  }

  function loadAnnotations() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf('annot_') === 0) {
          try {
            imgAnnotations[normalizeAnnotSrc(k.substring(6))] = JSON.parse(localStorage.getItem(k));
          } catch (e) {}
        }
      }
    } catch (e) {}
  }

  function saveAnnotation(imgSrc, state) {
    var key = normalizeAnnotSrc(imgSrc);
    imgAnnotations[key] = state;
    if (window.safeLSSet) {
      window.safeLSSet(annotKey(imgSrc), JSON.stringify(state));
    } else {
      localStorage.setItem(annotKey(imgSrc), JSON.stringify(state));
    }
    if (window.notifyStorageSync) window.notifyStorageSync();
  }

  function normalizeAnnotState(st) {
    if (!st || !Array.isArray(st.markers)) return st;
    st.markers.forEach(function (m) {
      if (m && typeof m.rotationAngle !== 'number') {
        m.rotationAngle = 0;
      }
    });
    return st;
  }

  function getAnnotation(imgSrc) {
    var st = imgAnnotations[normalizeAnnotSrc(imgSrc)] || null;
    return normalizeAnnotState(st);
  }

  function clearAnnotation(imgSrc) {
    var key = normalizeAnnotSrc(imgSrc);
    delete imgAnnotations[key];
    try {
      localStorage.removeItem(annotKey(imgSrc));
    } catch (e) {}
    if (window.notifyStorageSync) window.notifyStorageSync();
  }

  function hasAnnotation(imgSrc) {
    return !!getAnnotation(imgSrc);
  }

  function hasPrefix(prefix) {
    var base = normalizeAnnotSrc(prefix);
    return Object.keys(imgAnnotations).some(function (k) {
      return k.indexOf(base) === 0;
    });
  }

  function showLightboxAnnotationOverlay() {
    var lbOverlay = document.getElementById('lightboxAnnotOverlay');
    if (!lbOverlay) {
      var lb = document.getElementById('lightbox');
      if (lb) {
        lbOverlay = document.createElement('div');
        lbOverlay.id = 'lightboxAnnotOverlay';
        lbOverlay.className = 'lightbox-annot-overlay';
        var hint = lb.querySelector('.lightbox-hint');
        if (hint) {
          lb.insertBefore(lbOverlay, hint);
        } else {
          lb.appendChild(lbOverlay);
        }
      }
    }
    if (!lbOverlay || typeof markerjs3 === 'undefined') return;
    lbOverlay.innerHTML = '';
    var hasA = hasAnnotation(lbCurrentSrc);
    if (!lbCurrentSrc || !hasA) {
      lbOverlay.style.display = 'none';
      return;
    }
    var img = document.getElementById('lightboxImg');
    lbOverlay.style.display = '';
    var apply = function () {
      var mview = new markerjs3.MarkerView();
      lbOverlay.appendChild(mview);
      mview.targetImage = img;
      mview.show(getAnnotation(lbCurrentSrc));
      if (mview.shadowRoot) {
        var st = document.createElement('style');
        st.textContent = 'img { display: none !important; }';
        mview.shadowRoot.appendChild(st);
      }
    };
    if (img && img.complete && img.naturalWidth > 0) apply();
    else if (img) {
      img.onload = function () { apply(); };
    }
  }

  function updateAnnotateBtn() {
    var btn = document.getElementById('lightboxAnnotate');
    if (!btn) return;
    if (!lbCurrentSrc) {
      btn.style.display = 'none';
      return;
    }
    btn.style.display = '';
    var hasAny = hasAnnotation(lbCurrentSrc);
    btn.textContent = hasAny ? '标注（已有）' : '标注';
    btn.classList.toggle('has-annot', hasAny);
  }

  function applyAnnotStyle() {
    if (!lbMarkerArea) return;
    var editor = lbMarkerArea.currentMarkerEditor;
    if (!editor) return;
    try {
      if (lbAnnotColor) editor.strokeColor = lbAnnotColor;
      if (lbAnnotWidth) editor.strokeWidth = lbAnnotWidth;
    } catch (e) {}
  }

  function highlightAnnotTool(tool) {
    document.querySelectorAll('#annotToolbar .at-tool').forEach(function (b) {
      b.classList.toggle('active', b.dataset.tool === tool);
    });
  }

  function loadAnnotToolStyle(tool) {
    var s = ANNOT_TOOL_STYLES[tool];
    if (!s) return;
    lbAnnotColor = s.color;
    lbAnnotWidth = s.width;
    var w = document.getElementById('annotWidth');
    if (w) w.value = lbAnnotWidth;
    updateAnnotWidthUI();
    updateAnnotColorUI();
  }

  function selectAnnotTool(toolName) {
    if (!lbMarkerArea) return;
    lbCurrentAnnotTool = toolName;
    lbLastAnnotTool = toolName;
    lbCurrentAnnotEditor = null;
    if (toolName !== 'select') loadAnnotToolStyle(toolName);
    var editor = null;
    try {
      if (toolName === 'select') {
        lbMarkerArea.switchToSelectMode();
      } else {
        editor = lbMarkerArea.createMarker(toolName);
      }
    } catch (e) {}
    if (editor) {
      try {
        if (lbAnnotColor) editor.strokeColor = lbAnnotColor;
        if (lbAnnotWidth) editor.strokeWidth = lbAnnotWidth;
      } catch (e) {}
      lbCurrentAnnotEditor = editor;
    }
    highlightAnnotTool(toolName);
  }

  function closeAnnotator() {
    if (lbMarkerArea) {
      try { lbMarkerArea.remove(); } catch (e) {}
      lbMarkerArea = null;
    }
    lbAnnotMode = false;
    var img = document.getElementById('lightboxImg');
    var overlay = document.getElementById('lightbox');
    if (img) img.style.display = '';
    var hint = overlay && overlay.querySelector('.lightbox-hint');
    if (hint) {
      hint.style.display = '';
      hint.textContent = '滚轮缩放 / 拖拽移动 / 双击或点击背景关闭';
    }
    var tb = document.getElementById('annotToolbar');
    if (tb) tb.style.display = 'none';
    var pal = document.getElementById('annotPalette');
    if (pal) pal.style.display = 'none';
    updateAnnotateBtn();
    if (lbCurrentSrc) showLightboxAnnotationOverlay();
  }

  function openAnnotator(src) {
    if (src) lbCurrentSrc = src;
    if (typeof markerjs3 === 'undefined') {
      if (typeof window.showToast === 'function') {
        window.showToast('标注组件未加载', 'warning');
      } else if (window.storageSync && typeof window.storageSync.showToast === 'function') {
        window.storageSync.showToast('标注组件未加载', 'warning');
      }
      return;
    }
    if (!lbCurrentSrc) return;
    closeAnnotator();
    var img = document.getElementById('lightboxImg');
    var overlay = document.getElementById('lightbox');
    if (img) img.style.display = 'none';
    var lbOverlay = document.getElementById('lightboxAnnotOverlay');
    if (lbOverlay) {
      lbOverlay.style.display = 'none';
      lbOverlay.innerHTML = '';
    }
    var hint = overlay ? overlay.querySelector('.lightbox-hint') : null;
    if (hint) hint.style.display = 'none';

    var ma;
    try {
      ma = new markerjs3.MarkerArea();
    } catch (e) {
      ma = null;
    }
    lbMarkerArea = ma;
    if (!ma) return;
    ma.targetImage = img;

    var state = getAnnotation(lbCurrentSrc);
    if (state) {
      try { ma.restoreState(state); } catch (e) {}
    }
    if (overlay) overlay.appendChild(ma);
    var isDark = (typeof window.currentTheme !== 'undefined' ? window.currentTheme : 'light') === 'dark';
    if (ma) ma.classList.toggle('dark-filter', isDark && !!window.darkImageFilter);

    ma.addEventListener('wheel', onAnnotWheel, { passive: false, capture: true });
    window.removeEventListener('pointermove', onAnnotPointerMove);
    window.addEventListener('pointermove', onAnnotPointerMove);
    window.removeEventListener('pointerup', onAnnotPointerUp);
    window.addEventListener('pointerup', onAnnotPointerUp);

    var tb = document.getElementById('annotToolbar');
    if (tb) {
      tb.style.display = '';
      var widthEl = document.getElementById('annotWidth');
      if (widthEl) widthEl.value = lbAnnotWidth;
      updateAnnotWidthUI();
    }
    buildAnnotPalette();
    lbAnnotMode = true;
    selectAnnotTool('FrameMarker');

    var annotBtn = document.getElementById('lightboxAnnotate');
    if (annotBtn) {
      annotBtn.textContent = '退出标注';
      annotBtn.classList.remove('has-annot');
    }
  }

  function snapAnnotToAxis() {
    if (!lbAnnotMode) return false;
    var tool = lbCurrentAnnotTool;
    if (tool !== 'LineMarker') return false;
    var ed = lbCurrentAnnotEditor;
    if (!ed || (ed.state !== 'creating' && ed.state !== 'select')) return false;
    var marker = ed.marker;
    if (!marker || typeof marker.x1 !== 'number' || typeof marker.y1 !== 'number') return false;
    var x1 = marker.x1, y1 = marker.y1;
    var dx = marker.x2 - x1, dy = marker.y2 - y1;
    try {
      if (Math.abs(dx) >= Math.abs(dy)) marker.y2 = y1;
      else marker.x2 = x1;
      marker.adjustVisual();
      if (ed.adjustControlBox) ed.adjustControlBox();
    } catch (err) {}
    return true;
  }

  function onAnnotPointerMove(e) {
    if (e.shiftKey) {
      lbAnnotShiftWasOn = true;
      snapAnnotToAxis();
    } else {
      lbAnnotShiftWasOn = false;
    }
  }

  function onAnnotPointerUp(e) {
    if (lbAnnotShiftWasOn) {
      snapAnnotToAxis();
      lbAnnotShiftWasOn = false;
    }
  }

  function onAnnotWheel(e) {
    if (!lbAnnotMode) return;
    e.preventDefault();
    e.stopPropagation();

    if (e.buttons === 2 || e.button === 2) {
      var delta = (e.deltaY < 0) ? 1 : -1;
      adjustAnnotWidth(delta);
      return;
    }

    var dx = e.deltaX || 0, dy = e.deltaY || 0;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 1) {
      cycleAnnotToolByDelta(dx > 0 ? 1 : -1);
      return;
    }

    zoomAnnotAt(e.clientX, e.clientY, dy < 0 ? 1.15 : 0.87);
  }

  function zoomAnnotAt(cx, cy, factor) {
    var ma = lbMarkerArea;
    if (!ma) return;
    var cc = ma.shadowRoot && ma.shadowRoot.querySelector('.canvas-container');
    if (!cc) return;
    var cr = cc.getBoundingClientRect();
    var Cx = cr.left + cr.width / 2, Cy = cr.top + cr.height / 2;
    var oldZoom = ma._zoomLevel || 1;
    var newZoom = Math.min(Math.max(oldZoom * factor, 0.5), 5);
    if (newZoom === oldZoom) return;
    var ddx = (cx - Cx - (ma._panX || 0)) / oldZoom;
    var ddy = (cy - Cy - (ma._panY || 0)) / oldZoom;
    ma._zoomLevel = newZoom;
    ma._panX = (ma._panX || 0) + (oldZoom - newZoom) * ddx;
    ma._panY = (ma._panY || 0) + (oldZoom - newZoom) * ddy;
    ma.applyTransform();
    try { ma.adjustEditorsZoom(); } catch (e) {}
  }

  function cycleAnnotToolByDelta(dir) {
    var i = ANNOT_TOOLS.indexOf(lbCurrentAnnotTool);
    if (i < 0) i = ANNOT_TOOLS.indexOf(lbLastAnnotTool);
    if (i < 0) i = 0;
    selectAnnotTool(ANNOT_TOOLS[(i + dir + ANNOT_TOOLS.length) % ANNOT_TOOLS.length]);
  }

  function adjustAnnotWidth(d) {
    lbAnnotWidth = Math.max(1, Math.min(30, (lbAnnotWidth || 1) + d));
    var s = ANNOT_TOOL_STYLES[lbCurrentAnnotTool];
    if (s) s.width = lbAnnotWidth;
    var w = document.getElementById('annotWidth');
    if (w) w.value = lbAnnotWidth;
    updateAnnotWidthUI();
    if (lbMarkerArea) applyAnnotStyle();
  }

  function doUndo() {
    if (lbMarkerArea) { try { lbMarkerArea.undo(); } catch (err) {} }
  }

  function doRedo() {
    if (lbMarkerArea) { try { lbMarkerArea.redo(); } catch (err) {} }
  }

  function deleteAnnotSelection() {
    if (lbMarkerArea) { try { lbMarkerArea.deleteSelectedMarkers(); } catch (err) {} }
  }

  function buildAnnotPalette() {
    var wrap = document.getElementById('annotPaletteSwatches');
    if (!wrap) return;
    wrap.innerHTML = '';
    ANNOT_COLORS.forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'at-swatch';
      b.dataset.color = c;
      b.style.background = c;
      b.title = c;
      wrap.appendChild(b);
    });
    updateAnnotColorUI();
  }

  function toggleAnnotPalette(show) {
    var p = document.getElementById('annotPalette');
    if (!p) return;
    var willShow = (typeof show === 'boolean') ? show : (p.style.display === 'none');
    p.style.display = willShow ? '' : 'none';
    if (willShow) updateAnnotColorUI();
  }

  function setAnnotColor(hex) {
    lbAnnotColor = hex;
    var s = ANNOT_TOOL_STYLES[lbCurrentAnnotTool];
    if (s) s.color = hex;
    updateAnnotColorUI();
    if (lbMarkerArea) applyAnnotStyle();
  }

  function updateAnnotColorUI() {
    var dot = document.getElementById('annotColorDot');
    if (dot) dot.style.background = lbAnnotColor;
    document.querySelectorAll('#annotPalette .at-swatch').forEach(function (s) {
      s.classList.toggle('active', String(s.dataset.color || '').toLowerCase() === String(lbAnnotColor).toLowerCase());
    });
  }

  function updateAnnotWidthUI() {
    var v = document.getElementById('annotWidthVal');
    if (v) v.textContent = lbAnnotWidth;
  }

  function annotHasContent() {
    var ma = lbMarkerArea;
    if (!ma) return false;
    try { ma.switchToSelectMode(); } catch (e) {}
    try {
      var st = ma.getState();
      if (st && Array.isArray(st.markers)) {
        return st.markers.some(function (m) {
          if (!m) return false;
          var f = m.frame;
          if (f && f.width === 0 && f.height === 0) return false;
          return true;
        });
      }
    } catch (e) {}
    return false;
  }

  function saveAnnotationFromArea(callbacks) {
    if (!lbCurrentSrc) return;
    if (lbMarkerArea) {
      try { lbMarkerArea.switchToSelectMode(); } catch (e) {}
      var st;
      try { st = lbMarkerArea.getState(); } catch (e) {}
      if (st && Array.isArray(st.markers)) {
        st.markers = st.markers.filter(function (m) {
          if (!m) return false;
          var f = m.frame;
          if (f && f.width === 0 && f.height === 0) return false;
          return true;
        });
      }
      if (st && st.markers && st.markers.length === 0) {
        clearAnnotation(lbCurrentSrc);
      } else if (st) {
        saveAnnotation(lbCurrentSrc, st);
      }
    }
    closeAnnotator();
    updateAnnotateBtn();

    if (callbacks && typeof callbacks.refreshPageOverlays === 'function') {
      callbacks.refreshPageOverlays();
    } else if (typeof window.refreshPageOverlays === 'function') {
      window.refreshPageOverlays();
    }
    if (callbacks && typeof callbacks.renderNav === 'function') {
      callbacks.renderNav();
    } else if (typeof window.renderNav === 'function') {
      window.renderNav();
    }
  }

  function cycleAnnotTool() {
    var i = ANNOT_TOOLS.indexOf(lbCurrentAnnotTool);
    if (i < 0) i = 0;
    selectAnnotTool(ANNOT_TOOLS[(i + 1) % ANNOT_TOOLS.length]);
  }

  function toggleAnnotToolbar() {
    var tb = document.getElementById('annotToolbar');
    if (!tb) return;
    var hide = tb.style.display !== 'none';
    tb.style.display = hide ? 'none' : '';
    var hint = document.querySelector('#lightbox .lightbox-hint');
    if (hint) {
      if (hide) {
        hint.textContent = '工具栏已隐藏，按空格重新显示';
        hint.style.display = '';
      } else {
        hint.textContent = '滚轮缩放 / 拖拽移动 / 双击或点击背景关闭 · 空格隐藏工具栏';
        hint.style.display = '';
      }
    }
  }

  function finishCurrentAnnot() {
    if (!lbMarkerArea) return;
    try {
      lbMarkerArea.switchToSelectMode();
      var t = lbLastAnnotTool;
      if (t && t !== 'select') {
        selectAnnotTool(t);
      }
    } catch (e) {}
  }

  function onAnnotContextMenu(e) {
    if (!lbAnnotMode) return;
    if (e.target && e.target.closest && e.target.closest('#annotToolbar')) return;
    e.preventDefault();
    finishCurrentAnnot();
  }

  function toggleAnnotateMode() {
    if (lbAnnotMode) {
      saveAnnotationFromArea(annotToolbarCallbacks);
    } else {
      openAnnotator(lbCurrentSrc);
    }
  }

  var annotToolbarBound = false;
  var annotToolbarCallbacks = null;

  function bindAnnotToolbar(callbacks) {
    if (callbacks) annotToolbarCallbacks = callbacks;
    if (annotToolbarBound) return;
    annotToolbarBound = true;

    var annotBtn = document.getElementById('lightboxAnnotate');
    if (annotBtn) {
      annotBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleAnnotateMode();
      });
    }

    var tb = document.getElementById('annotToolbar');
    if (tb) {
      tb.addEventListener('click', function (e) {
        e.stopPropagation();
        var btn = e.target.closest('.at-btn, .at-width-step');
        if (!btn) return;
        var action = btn.dataset.action;
        var tool = btn.dataset.tool;
        if (action === 'undo')        { doUndo(); return; }
        if (action === 'redo')        { doRedo(); return; }
        if (action === 'save')        { saveAnnotationFromArea(annotToolbarCallbacks); return; }
        if (action === 'cancel')      { closeAnnotator(); return; }
        if (action === 'width-minus') { adjustAnnotWidth(-1); return; }
        if (action === 'width-plus')  { adjustAnnotWidth(1); return; }
        if (tool && ANNOT_TOOLS.indexOf(tool) >= 0) { selectAnnotTool(tool); }
      });
    }

    var widthInput = document.getElementById('annotWidth');
    if (widthInput) {
      widthInput.addEventListener('click', function (e) { e.stopPropagation(); });
      widthInput.addEventListener('input', function (e) {
        lbAnnotWidth = parseInt(e.target.value, 10) || 1;
        var s = ANNOT_TOOL_STYLES[lbCurrentAnnotTool];
        if (s) s.width = lbAnnotWidth;
        updateAnnotWidthUI();
        if (lbMarkerArea) applyAnnotStyle();
      });
    }

    var colorBtn = document.getElementById('annotColorSwatch');
    if (colorBtn) {
      colorBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleAnnotPalette();
      });
    }

    var pal = document.getElementById('annotPalette');
    if (pal) {
      pal.addEventListener('click', function (e) {
        e.stopPropagation();
        var s = e.target.closest('.at-swatch');
        if (s) {
          setAnnotColor(s.dataset.color);
          toggleAnnotPalette(false);
        }
      });
    }

    var custom = document.getElementById('annotColorCustom');
    if (custom) {
      custom.addEventListener('click', function (e) { e.stopPropagation(); });
      custom.addEventListener('input', function (e) { setAnnotColor(e.target.value); });
      custom.addEventListener('change', function (e) { setAnnotColor(e.target.value); });
    }

    document.addEventListener('click', function (e) {
      if (!pal || pal.style.display === 'none') return;
      if (!e.target.closest('#annotPalette') && !e.target.closest('#annotColorSwatch')) {
        pal.style.display = 'none';
      }
    });

    var lightboxEl = document.getElementById('lightbox');
    if (lightboxEl) {
      lightboxEl.addEventListener('contextmenu', onAnnotContextMenu, true);
    }
  }

  function handleAnnotKeydown(e) {
    if (!lbAnnotMode) return;
    var key = e.key.toLowerCase();

    var pal = document.getElementById('annotPalette');
    if (pal && pal.style.display !== 'none' && key === 'escape') {
      e.preventDefault();
      toggleAnnotPalette(false);
      return;
    }

    if (e.ctrlKey || e.metaKey) {
      switch (key) {
        case 'z': e.preventDefault(); e.shiftKey ? doRedo() : doUndo(); break;
        case 'y': e.preventDefault(); doRedo(); break;
        case 's': e.preventDefault(); saveAnnotationFromArea(); break;
      }
      return;
    }
    if (e.altKey) return;

    switch (key) {
      case ' ':        e.preventDefault(); toggleAnnotToolbar(); return;
      case 'tab':      e.preventDefault(); cycleAnnotTool(); return;
      case 'escape':   e.preventDefault(); closeAnnotator(); return;
      case 'delete':
      case 'backspace': e.preventDefault(); deleteAnnotSelection(); return;
    }

    var map = { l: 'LineMarker', r: 'FrameMarker', h: 'HighlighterMarker', b: 'FreehandMarker' };
    if (map[key]) {
      e.preventDefault();
      selectAnnotTool(map[key]);
    }
  }

  // 初始自动载入标注数据与事件绑定
  loadAnnotations();
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        bindAnnotToolbar();
      });
    } else {
      bindAnnotToolbar();
    }
  }

  // 暴露全局命名空间
  window.ImageAnnotator = {
    normalizeSrc: normalizeAnnotSrc,
    load: loadAnnotations,
    save: saveAnnotation,
    get: getAnnotation,
    clear: clearAnnotation,
    has: hasAnnotation,
    hasPrefix: hasPrefix,
    open: openAnnotator,
    close: closeAnnotator,
    saveFromArea: saveAnnotationFromArea,
    isAnnotMode: function () { return lbAnnotMode; },
    hasContent: annotHasContent,
    getMarkerArea: function () { return lbMarkerArea; },
    getCurrentSrc: function () { return lbCurrentSrc; },
    setCurrentSrc: function (s) { lbCurrentSrc = s; },
    getAnnotationsMap: function () { return imgAnnotations; },
    showOverlay: showLightboxAnnotationOverlay,
    updateBtn: updateAnnotateBtn,
    bindToolbar: bindAnnotToolbar,
    handleKeydown: handleAnnotKeydown,
    selectTool: selectAnnotTool,
    cycleTool: cycleAnnotTool,
    toggleToolbar: toggleAnnotToolbar,
    adjustWidth: adjustAnnotWidth,
    undo: doUndo,
    redo: doRedo,
    deleteSelection: deleteAnnotSelection,
    toggleAnnotateMode: toggleAnnotateMode
  };

  // 全局接口互通别名
  window.normalizeAnnotSrc = normalizeAnnotSrc;
  window.getAnnotation = getAnnotation;
  window.hasAnnotation = hasAnnotation;
  window.clearAnnotation = clearAnnotation;
  window.saveAnnotation = saveAnnotation;
  window.imgAnnotations = imgAnnotations;
  window.handleAnnotKeydown = handleAnnotKeydown;
  window.toggleAnnotateMode = toggleAnnotateMode;

  try {
    Object.defineProperty(window, 'lbAnnotMode', {
      get: function () { return lbAnnotMode; },
      set: function (v) { lbAnnotMode = !!v; },
      configurable: true
    });
    Object.defineProperty(window, 'lbMarkerArea', {
      get: function () { return lbMarkerArea; },
      configurable: true
    });
  } catch (e) {
    window.lbAnnotMode = lbAnnotMode;
    window.lbMarkerArea = lbMarkerArea;
  }

})();
