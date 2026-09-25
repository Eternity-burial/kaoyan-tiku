/**
 * 飞书思维导图底部固定深色工具条 (FeishuBottomToolbar)
 * 职责：
 * 1. 固定居中于画布底部 (position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%))
 * 2. 严格遵循飞书极简规范，仅保留最左侧核心排版 4 大按钮：
 *    - A: 7 色高亮色块与清除 (Alt + R, Y, P, B, C, O, G / H)
 *    - B: 加粗 (Ctrl + B)
 *    - I: 斜体 (Ctrl + I)
 *    - U: 下划线 (Ctrl + U)
 * 3. 彻底精简剔除其余 7 个冗余按钮与分割线 (+子节点、+同级、副本、聚焦、折叠、删除、快捷键)
 * 4. 严格零表情符号规范
 */
(function (global) {
  'use strict';

  const FEISHU_COLORS = [
    { key: 'red', name: '粉', hex: '#ffc5c0', shortcut: 'Alt+R' },
    { key: 'yellow', name: '黄', hex: '#ffe699', shortcut: 'Alt+Y' },
    { key: 'purple', name: '紫', hex: '#f6d5f8', shortcut: 'Alt+P' },
    { key: 'blue', name: '蓝', hex: '#badbff', shortcut: 'Alt+B' },
    { key: 'cyan', name: '青', hex: '#a8f0eb', shortcut: 'Alt+C' },
    { key: 'green', name: '绿', hex: '#e0f3a0', shortcut: 'Alt+G' },
    { key: 'gray', name: '灰', hex: '#dee2e6', shortcut: 'Alt+O' }
  ];

  class FeishuBottomToolbar {
    constructor(mindMap, options = {}) {
      if (!mindMap) {
        throw new Error('[FeishuBottomToolbar] 必须传入 SimpleMindMap 实例');
      }
      this.mindMap = mindMap;
      this.options = options;
      this.activeNode = null;

      this.initDom();
      this.bindEvents();
    }

    initDom() {
      const existing = document.querySelector('.feishu-bottom-toolbar');
      if (existing) existing.remove();

      this.toolbarEl = document.createElement('nav');
      this.toolbarEl.className = 'feishu-bottom-toolbar';
      this.toolbarEl.innerHTML = `
        <!-- 1. 颜色与高亮选择器 (A) -->
        <button type="button" class="bar-btn" id="feishuBtnColor" title="高亮标记 (H / Alt + R, Y, P, B, C, G, O)">
          <span style="font-weight: bold; border-bottom: 2px solid #3370ff; padding-bottom: 1px;">A</span>
        </button>

        <div class="feishu-color-popover" id="feishuColorPopover">
          ${FEISHU_COLORS.map(c => `
            <button type="button" class="color-dot color-swatch-btn" data-color="${c.key}" title="${c.name}色 (${c.shortcut})" style="background-color: ${c.hex};">A</button>
          `).join('')}
          <button type="button" class="color-dot color-swatch-btn is-clear" data-color="none" title="清除高亮">&empty;</button>
        </div>

        <div class="bar-divider"></div>

        <!-- 2. 加粗 (B) -->
        <button type="button" class="bar-btn" id="feishuBtnBold" title="加粗 (Ctrl + B)">
          <strong style="font-size: 13px;">B</strong>
        </button>

        <!-- 3. 斜体 (I) -->
        <button type="button" class="bar-btn" id="feishuBtnItalic" title="斜体 (Ctrl + I)">
          <em style="font-size: 13px; font-style: italic;">I</em>
        </button>

        <!-- 4. 下划线 (U) -->
        <button type="button" class="bar-btn" id="feishuBtnUnderline" title="下划线 (Ctrl + U)">
          <span style="font-size: 13px; text-decoration: underline;">U</span>
        </button>
      `;

      document.body.appendChild(this.toolbarEl);

      this.btnColor = this.toolbarEl.querySelector('#feishuBtnColor');
      this.colorPopover = this.toolbarEl.querySelector('#feishuColorPopover');
      this.btnBold = this.toolbarEl.querySelector('#feishuBtnBold');
      this.btnItalic = this.toolbarEl.querySelector('#feishuBtnItalic');
      this.btnUnderline = this.toolbarEl.querySelector('#feishuBtnUnderline');
    }

    bindEvents() {
      // 监听 SimpleMindMap 激活节点变化
      this.mindMap.on('node_active', (node, activeList) => {
        this.activeNode = (activeList && activeList.length === 1) ? activeList[0] : null;
        this.updateButtonStates();
      });

      // 颜色按钮点击切换 popover
      this.btnColor.addEventListener('click', (e) => {
        e.stopPropagation();
        this.colorPopover.classList.toggle('show');
      });

      // 点击空白处关闭颜色 popover
      document.addEventListener('click', (e) => {
        if (!this.toolbarEl.contains(e.target)) {
          this.colorPopover.classList.remove('show');
        }
      });

      // 格式化按钮防失焦，保证输入框选区不被破坏
      [this.btnBold, this.btnItalic, this.btnUnderline, this.btnColor, this.colorPopover].forEach((el) => {
        if (el) {
          el.addEventListener('mousedown', (e) => e.preventDefault());
        }
      });

      // 选中颜色
      this.colorPopover.addEventListener('click', (e) => {
        const dot = e.target.closest('.color-dot');
        if (!dot) return;
        const color = dot.dataset.color;
        if (!this.dispatchTypographyCommand('color', color)) {
          this.setNodeHighlight(color === 'none' ? null : color);
        }
        this.colorPopover.classList.remove('show');
      });

      // B / I / U 样式切换（优先作用于活跃编辑器的文本选区，否则作用于整节点）
      this.btnBold.addEventListener('click', () => {
        if (!this.dispatchTypographyCommand('bold')) {
          this.toggleNodeStyle('fontWeight', 'bold');
        }
      });
      this.btnItalic.addEventListener('click', () => {
        if (!this.dispatchTypographyCommand('italic')) {
          this.toggleNodeStyle('fontStyle', 'italic');
        }
      });
      this.btnUnderline.addEventListener('click', () => {
        if (!this.dispatchTypographyCommand('underline')) {
          this.toggleNodeStyle('textDecoration', 'underline');
        }
      });
    }

    // 转发富文本排版指令（优先作用于活跃编辑器的文本选区）
    dispatchTypographyCommand(formatType, extra = null) {
      // 1. 检查导图编辑器选区
      const editor = this.mindMap.feishuNodeEditor || window._feishuNodeEditorInstance;
      if (editor && editor.isEditing) {
        editor.formatSelection(formatType, extra);
        return true;
      }

      // 2. 检查大纲编辑器选区
      const outliner = window._outlinerInstance;
      if (outliner && outliner.focusedUid) {
        outliner.formatSelection(formatType, extra);
        return true;
      }

      return false;
    }

    // 设置节点高亮颜色 (7 色体系与深度清除逻辑)
    setNodeHighlight(colorKey) {
      const activeList = (this.mindMap.renderer && this.mindMap.renderer.activeNodeList) || [];
      if (activeList.length === 0) return;

      activeList.forEach((node) => {
        const curColor = node.getData('highlightColor');
        const isClearing = (!colorKey || colorKey === 'none' || curColor === colorKey);
        const targetColor = isClearing ? null : colorKey;

        const nodeData = node.getData() || {};
        let text = nodeData.text || '';

        // 若是执行清除操作，同时将文本中残留的内联高亮标签安全剥离
        if (!targetColor && text) {
          text = text.replace(/<span class="feishu-(?:text|inline)-hl-[a-z]+">([\s\S]+?)<\/span>/gi, '$1')
                     .replace(/<mark class="[^"]*">([\s\S]+?)<\/mark>/gi, '$1');
        }

        // 物理级确保 node.nodeData.data 中的属性被干净删除或更新
        if (node.nodeData && node.nodeData.data) {
          if (targetColor) {
            node.nodeData.data.highlightColor = targetColor;
          } else {
            delete node.nodeData.data.highlightColor;
          }
        }

        this.mindMap.execCommand('SET_NODE_DATA', node, {
          highlightColor: targetColor,
          text: text
        });
      });
      this.mindMap.render();
      this.updateButtonStates();
    }

    // 切换节点富文本样式
    toggleNodeStyle(key, value) {
      const activeList = (this.mindMap.renderer && this.mindMap.renderer.activeNodeList) || [];
      if (activeList.length === 0) return;

      activeList.forEach((node) => {
        const cur = node.getData(key);
        const target = (cur === value) ? '' : value;
        this.mindMap.execCommand('SET_NODE_DATA', node, { [key]: target });
      });
      this.mindMap.render();
      this.updateButtonStates();
    }

    // 根据当前激活节点刷新按钮指示
    updateButtonStates() {
      if (!this.activeNode) {
        this.btnBold.classList.remove('active');
        this.btnItalic.classList.remove('active');
        this.btnUnderline.classList.remove('active');
        return;
      }

      const isBold = this.activeNode.getData('fontWeight') === 'bold';
      const isItalic = this.activeNode.getData('fontStyle') === 'italic';
      const isUnderline = this.activeNode.getData('textDecoration') === 'underline';

      this.btnBold.classList.toggle('active', isBold);
      this.btnItalic.classList.toggle('active', isItalic);
      this.btnUnderline.classList.toggle('active', isUnderline);

      const color = this.activeNode.getData('highlightColor');
      const found = FEISHU_COLORS.find(c => c.key === color);
      const indicator = this.btnColor.querySelector('span');
      if (indicator) {
        indicator.style.borderBottomColor = found ? found.hex : '#3370ff';
      }
    }
  }

  global.FeishuBottomToolbar = FeishuBottomToolbar;
})(typeof window !== 'undefined' ? window : this);
