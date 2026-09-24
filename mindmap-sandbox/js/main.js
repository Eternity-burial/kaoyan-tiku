(function () {
  'use strict';

  // 1. 获取 MindMap 构造函数
  const MindMap = (window.simpleMindMap && (window.simpleMindMap.default || window.simpleMindMap)) || window.MindMap;
  if (!MindMap) {
    console.error('[Mindmap Sandbox] 无法找到 SimpleMindMap 构造函数，请检查 vendor 脚本是否正确加载。');
    return;
  }

  const container = document.getElementById('mindMapContainer');
  if (!container) {
    console.error('[Mindmap Sandbox] 找不到挂载容器 #mindMapContainer');
    return;
  }

  // 2. 实例化思维导图（完全采用官方原生能力）
  const mindMap = new MindMap({
    el: container,
    data: window.defaultMindMapData || { data: { text: '根节点' }, children: [] },
    layout: 'logicalStructure', // 经典逻辑结构图（向右水平展开）
    theme: 'classic4',          // 清爽商务浅色主题
    enableFreeDrag: false,      // 禁用自由散落拖拽，强制严密的树状插槽吸附
    autoMoveWhenMouseInEdgeOnDrag: true, // 拖动靠近视口边缘时自动滚动画布
    useLeftKeySelectionRightKeyDrag: true, // 空白处左键框选，右键拖拽平移画布
    mouseScaleCenterUseMousePosition: true, // 鼠标滚轮缩放以当前光标所在点为中心
    dragPlaceholderLineConfig: {
      color: '#2563eb',
      width: 3
    },
    dragPlaceholderRectFill: 'rgba(37, 99, 235, 0.12)'
  });

  // 3. 全局暴露实例供测试脚本与调试使用
  window._mindMapInstance = mindMap;

  // 4. 视口大小自适应监听
  window.addEventListener('resize', () => {
    mindMap.resize();
  });

  // 5. 缩放比例文本显示联动
  const zoomText = document.getElementById('zoomLevelText');
  function updateZoomDisplay() {
    if (!zoomText || !mindMap.view) return;
    const transform = mindMap.view.getTransformData();
    const scale = (transform && transform.state && transform.state.scale) || (transform && transform.scale) || (mindMap.view.scale) || 1;
    zoomText.textContent = `${Math.round(scale * 100)}%`;
  }

  mindMap.on('scale', updateZoomDisplay);
  mindMap.on('view_data_change', updateZoomDisplay);
  mindMap.on('node_tree_render_end', updateZoomDisplay);

  // 6. 顶部悬浮控制栏原生命令绑定
  const btnInsertChild = document.getElementById('btnInsertChild');
  const btnInsertSibling = document.getElementById('btnInsertSibling');
  const btnDeleteNode = document.getElementById('btnDeleteNode');
  const btnUndo = document.getElementById('btnUndo');
  const btnRedo = document.getElementById('btnRedo');
  const btnResetView = document.getElementById('btnResetView');
  const btnFitView = document.getElementById('btnFitView');
  const btnZoomIn = document.getElementById('btnZoomIn');
  const btnZoomOut = document.getElementById('btnZoomOut');

  if (btnInsertChild) {
    btnInsertChild.addEventListener('click', () => {
      mindMap.execCommand('INSERT_CHILD_NODE');
    });
  }

  if (btnInsertSibling) {
    btnInsertSibling.addEventListener('click', () => {
      mindMap.execCommand('INSERT_NODE');
    });
  }

  if (btnDeleteNode) {
    btnDeleteNode.addEventListener('click', () => {
      mindMap.execCommand('REMOVE_NODE');
    });
  }

  if (btnUndo) {
    btnUndo.addEventListener('click', () => {
      mindMap.execCommand('BACK');
    });
  }

  if (btnRedo) {
    btnRedo.addEventListener('click', () => {
      mindMap.execCommand('FORWARD');
    });
  }

  if (btnResetView) {
    btnResetView.addEventListener('click', () => {
      mindMap.view.reset();
      updateZoomDisplay();
    });
  }

  if (btnFitView) {
    btnFitView.addEventListener('click', () => {
      mindMap.view.fit();
      updateZoomDisplay();
    });
  }

  if (btnZoomIn) {
    btnZoomIn.addEventListener('click', () => {
      mindMap.view.enlarge();
      updateZoomDisplay();
    });
  }

  if (btnZoomOut) {
    btnZoomOut.addEventListener('click', () => {
      mindMap.view.narrow();
      updateZoomDisplay();
    });
  }

  console.log('[Mindmap Sandbox] 思维导图实例初始化完成，挂载于 window._mindMapInstance');
})();
