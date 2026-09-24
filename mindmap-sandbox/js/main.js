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

  // 2. 注册飞书经典视觉主题 (Feishu / Lark Design System: 直角折线与下划线规范)
  MindMap.defineTheme('feishu', {
    backgroundColor: '#f8f9fa',
    lineColor: '#bbbfc4',
    lineWidth: 2,
    lineStyle: 'straight',      // 直角折线模式 (包含水平延伸与垂直拐角)
    lineRadius: 8,              // 折线拐角圆角 8px (复刻飞书圆角折线)
    nodeUseLineStyle: true,     // 激活下划线横线模式 (二级及以下节点无边框，文字置于横线上)
    root: {
      shape: 'rectangle',
      fillColor: '#3370ff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
      borderColor: 'transparent',
      borderWidth: 0,
      borderRadius: 8,
      paddingX: 20,
      paddingY: 12
    },
    second: {
      shape: 'rectangle',
      marginX: 80,
      marginY: 32,
      fillColor: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
      color: '#1f2329',
      fontSize: 14,
      fontWeight: '500',
      borderColor: '#dee0e3',
      borderWidth: 1.5,
      borderRadius: 6,
      hoverRectColor: '#3370ff',
      paddingX: 16,
      paddingY: 10
    },
    node: {
      shape: 'rectangle',
      marginX: 50,
      marginY: 20,
      fillColor: 'transparent',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
      color: '#1f2329',
      fontSize: 13,
      fontWeight: 'normal',
      borderColor: 'transparent',
      borderWidth: 0,
      borderRadius: 0,
      hoverRectColor: '#3370ff',
      paddingX: 10,
      paddingY: 6
    }
  });

  // 3. 实例化思维导图
  const mindMap = new MindMap({
    el: container,
    data: window.defaultMindMapData || { data: { text: '根节点' }, children: [] },
    layout: 'logicalStructure', // 经典逻辑结构图（向右水平展开）
    theme: 'feishu',            // 飞书专属商务质感主题
    enableFreeDrag: false,      // 禁用自由散落拖拽，强制树状吸附
    autoMoveWhenMouseInEdgeOnDrag: true, // 拖动靠近视口边缘时自动滚动画布
    useLeftKeySelectionRightKeyDrag: true, // 空白处左键框选，右键拖拽平移画布
    mouseScaleCenterUseMousePosition: true, // 鼠标滚轮缩放以当前光标所在点为中心
    dragPlaceholderLineConfig: {
      color: '#3370ff',
      width: 2.5
    },
    dragPlaceholderRectFill: 'rgba(51, 112, 255, 0.15)'
  });

  // 4. 全局暴露实例供测试脚本与调试使用
  window._mindMapInstance = mindMap;

  // 5. 初始化飞书磁吸拖拽增强器
  if (window.FeishuDragEnhancer) {
    window._feishuDragEnhancerInstance = new window.FeishuDragEnhancer(mindMap);
    console.log('[Mindmap Sandbox] 飞书磁吸拖拽增强器已挂载并激活');
  }

  // 6. 初始化飞书大纲引擎与双向视图控制器
  const outlinerContainer = document.getElementById('outlinerContainer');
  let outliner = null;
  let dualViewController = null;

  if (window.FeishuOutliner && outlinerContainer) {
    outliner = new window.FeishuOutliner(outlinerContainer);
    window._outlinerInstance = outliner;
    console.log('[Mindmap Sandbox] 飞书大纲引擎已初始化');
  }

  if (window.DualViewController && outliner) {
    dualViewController = new window.DualViewController(mindMap, outliner, {
      defaultView: 'mindmap'
    });
    window._dualViewControllerInstance = dualViewController;
    console.log('[Mindmap Sandbox] 飞书双向视图控制器已挂载并激活');
  }

  // 7. 视口大小自适应监听
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

  // 7. 导出与导入纯文本导图数据
  const btnExportJson = document.getElementById('btnExportJson');
  const btnImportJson = document.getElementById('btnImportJson');
  const importFileInput = document.getElementById('importFileInput');

  if (btnExportJson) {
    btnExportJson.addEventListener('click', () => {
      const data = mindMap.getData(false);
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mindmap_export_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  if (btnImportJson && importFileInput) {
    btnImportJson.addEventListener('click', () => {
      importFileInput.click();
    });

    importFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const parsed = JSON.parse(evt.target.result);
          if (parsed && (parsed.data || parsed.root)) {
            mindMap.setData(parsed);
            mindMap.view.reset();
            updateZoomDisplay();
          } else {
            alert('导入失败：未识别到合法的思维导图节点数据结构');
          }
        } catch (err) {
          alert('导入失败：JSON 文件解析出错 - ' + err.message);
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    });
  }

  console.log('[Mindmap Sandbox] 思维导图实例初始化完成，挂载于 window._mindMapInstance');
})();
