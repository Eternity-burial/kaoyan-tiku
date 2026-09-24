/**
 * 飞书风格思维导图磁吸拖拽增强模块 (FeishuDragEnhancer)
 * 核心特性：
 * 1. 动态三次贝塞尔磁吸连线 (Elastic Cubic Bezier Line)
 * 2. 候选父节点飞书蓝高亮光晕 (Parent Snap Halo)
 * 3. 磁吸捕获半径与迟滞脱离阈值 (Hysteresis Snapping Radius)
 * 4. 兄弟节点同级插入与父子磁吸的智能仲裁 (Sibling vs Child Arbitration)
 * 5. 全程零表情符号，保持工业级稳健性
 */
(function (global) {
  'use strict';

  class FeishuDragEnhancer {
    constructor(mindMap, options = {}) {
      if (!mindMap || !mindMap.drag) {
        console.warn('[FeishuDragEnhancer] 无法获取 mindMap.drag 实例，增强器未激活');
        return;
      }

      this.mindMap = mindMap;
      this.drag = mindMap.drag;
      this.options = Object.assign({
        captureRadius: 140, // 初始磁吸捕获半径 (画布坐标单位)
        releaseRadius: 180, // 迟滞脱离半径 (防止临界值抖动)
        lineColor: '#3370ff',
        lineWidth: 2.5,
        highlightColor: '#3370ff',
        highlightFill: 'rgba(51, 112, 255, 0.08)'
      }, options);

      this.activeTargetNode = null;
      this.rafId = null;

      this.initSvgElements();
      this.hookDragLifecycle();
    }

    // 初始化 SVG 磁吸辅助绘图元素 (挂载于 otherDraw 顶层容器)
    initSvgElements() {
      // 动态三次贝塞尔磁吸连线
      this.magneticLine = this.mindMap.otherDraw.path()
        .stroke({
          color: this.options.lineColor,
          width: this.options.lineWidth,
          linecap: 'round',
          linejoin: 'round'
        })
        .fill('none')
        .hide();
      this.magneticLine.node.setAttribute('class', 'smm-feishu-magnetic-line');

      // 候选父节点吸附高亮光晕边框
      this.parentHighlight = this.mindMap.otherDraw.rect()
        .radius(8)
        .stroke({
          color: this.options.highlightColor,
          width: 2
        })
        .fill({
          color: this.options.highlightFill
        })
        .hide();
      this.parentHighlight.node.setAttribute('class', 'smm-feishu-parent-highlight');
    }

    // 挂接 SimpleMindMap 原生拖拽生命周期
    hookDragLifecycle() {
      const self = this;
      const originalOnMove = this.drag.onMove.bind(this.drag);
      const originalRemoveCloneNode = this.drag.removeCloneNode.bind(this.drag);

      // 增强 onMove：在克隆节点位移与重叠检测后，实时驱动飞书磁吸判定
      this.drag.onMove = function (x, y, e) {
        originalOnMove(x, y, e);
        self.handleMove(x, y, e);
      };

      // 增强 removeCloneNode：在拖拽完成或取消清理时，安全复位所有磁吸效果
      this.drag.removeCloneNode = function () {
        self.cleanup();
        originalRemoveCloneNode();
      };

      // 监听导图拖拽结束事件作为多重防漏兜底
      this.mindMap.on('node_dragend', () => {
        this.cleanup();
      });
    }

    // 拖拽位移核心处理
    handleMove(cloneX, cloneY, e) {
      if (!this.drag.isDragging || !this.drag.clone) {
        return;
      }

      // 1. 同级插入插槽优先仲裁：若光标处于同级兄弟插槽判定区间内，让位于同级插入
      if (this.drag.prevNode || this.drag.nextNode) {
        this.cleanup();
        return;
      }

      const draggedNode = this.drag.beingDragNodeList && this.drag.beingDragNodeList[0];
      if (!draggedNode) {
        return;
      }

      // 2. 计算被拖拽克隆节点的左侧输入端连接点 (画布 SVG 绝对坐标)
      const cloneAnchorX = cloneX;
      const cloneAnchorY = cloneY + (draggedNode.height / 2);

      // 3. 在当前有效候选节点列表中检索空间最优父节点
      let bestCandidate = null;
      let minDistance = Infinity;

      const captureRadius = this.options.captureRadius;
      const releaseRadius = this.options.releaseRadius;

      // drag.nodeList 已经由 native nodeTreeToList 剪枝（排除了当前拖拽子树）
      const candidates = this.drag.nodeList || [];

      for (let i = 0; i < candidates.length; i++) {
        const node = candidates[i];
        if (node.isGeneralization) continue;
        if (node.uid === draggedNode.uid || (draggedNode.isAncestor && draggedNode.isAncestor(node))) {
          continue;
        }

        // 候选父节点的右侧输出端连接点
        const candAnchorX = node.left + node.width;
        const candAnchorY = node.top + (node.height / 2);

        const dx = cloneAnchorX - candAnchorX;
        const dy = cloneAnchorY - candAnchorY;

        // 空间朝向加权：逻辑结构图向右展开，克隆节点在候选右侧享有正常欧氏距离，若在左后方则重度惩罚
        let distance;
        if (dx >= -20) {
          distance = Math.sqrt(dx * dx + dy * dy);
        } else {
          distance = Math.sqrt((dx * 2.8) * (dx * 2.8) + dy * dy);
        }

        // 迟滞阈值判定：如果当前候选正是当前已吸附的目标，给予 releaseRadius 容差防止边缘抖动
        const effectiveRadius = (this.activeTargetNode && this.activeTargetNode.uid === node.uid)
          ? releaseRadius
          : captureRadius;

        if (distance <= effectiveRadius && distance < minDistance) {
          minDistance = distance;
          bestCandidate = node;
        }
      }

      // 4. 磁吸状态触发或脱离处理
      if (bestCandidate) {
        this.applyMagneticSnap(bestCandidate, cloneAnchorX, cloneAnchorY);
      } else {
        if (this.activeTargetNode && this.drag.overlapNode === this.activeTargetNode) {
          this.drag.overlapNode = null;
        }
        this.cleanup();
      }
    }

    // 激活并渲染磁吸状态
    applyMagneticSnap(targetParent, cloneAnchorX, cloneAnchorY) {
      this.activeTargetNode = targetParent;
      this.drag.overlapNode = targetParent;

      // 隐藏原生多余的静态矩形占位符与连线
      if (this.drag.placeholder) {
        this.drag.placeholder.size(0, 0);
      }
      if (this.drag.placeHolderLine) {
        this.drag.placeHolderLine.hide();
      }

      // 计算飞书标准直角阶梯折线 (带圆角平滑过渡)
      const x1 = targetParent.left + targetParent.width;
      const y1 = targetParent.top + (targetParent.height / 2);
      const x2 = cloneAnchorX;
      const y2 = cloneAnchorY;

      let pathData;
      if (Math.abs(y2 - y1) < 2) {
        pathData = `M ${x1} ${y1} L ${x2} ${y2}`;
      } else {
        const midX = x1 + Math.max((x2 - x1) * 0.5, 20);
        const radius = 8;
        const maxR = Math.min(radius, Math.abs(midX - x1) / 2, Math.abs(y2 - y1) / 2);
        const r = Math.max(maxR, 0);

        if (r < 2) {
          pathData = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
        } else {
          const isDown = y2 > y1;
          const dy1 = isDown ? r : -r;
          const dy2 = isDown ? -r : r;
          pathData = `M ${x1} ${y1} L ${midX - r} ${y1} Q ${midX} ${y1} ${midX} ${y1 + dy1} L ${midX} ${y2 + dy2} Q ${midX} ${y2} ${midX + r} ${y2} L ${x2} ${y2}`;
        }
      }
      this.magneticLine.plot(pathData).show();

      // 候选父节点吸附高亮轮廓更新
      this.parentHighlight
        .size(targetParent.width + 12, targetParent.height + 8)
        .move(targetParent.left - 6, targetParent.top - 4)
        .show();
    }

    // 复位与清理磁吸状态
    cleanup() {
      this.activeTargetNode = null;
      if (this.magneticLine) {
        this.magneticLine.hide();
      }
      if (this.parentHighlight) {
        this.parentHighlight.hide();
      }
    }
  }

  // 挂载至全局命名空间
  global.FeishuDragEnhancer = FeishuDragEnhancer;
})(typeof window !== 'undefined' ? window : this);
