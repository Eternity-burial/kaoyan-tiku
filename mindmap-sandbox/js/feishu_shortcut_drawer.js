/**
 * 飞书思维笔记快捷键指南抽屉 (FeishuShortcutDrawer)
 * 职责：
 * 1. 挂载于界面右侧的滑出式面板 (Right Drawer)
 * 2. 忠实呈现飞书思维笔记核心快捷键指南 (常用、节点样式、节点操作、导航)
 * 3. 剔除无用的空使用指南标签页，直观展示紧凑快捷键清单
 * 4. 支持 Ctrl + / 全局唤起与切换，按 Esc 或点击关闭按钮平滑收起
 * 5. 严格零表情符号规范
 */
(function (global) {
  'use strict';

  class FeishuShortcutDrawer {
    constructor() {
      this.isOpen = false;
      this.initDom();
      this.bindEvents();
    }

    initDom() {
      const existing = document.querySelector('.feishu-shortcut-drawer');
      if (existing) existing.remove();

      this.drawerEl = document.createElement('aside');
      this.drawerEl.className = 'feishu-shortcut-drawer';
      this.drawerEl.innerHTML = `
        <div class="drawer-header">
          <div class="drawer-title" style="font-size: 15px; font-weight: 600; color: #1f2329;">快捷键指南</div>
          <button type="button" class="drawer-close-btn" title="关闭 (Esc)">&#x2715;</button>
        </div>
        <div class="drawer-body">
          <!-- 常用 -->
          <div class="shortcut-section">
            <div class="shortcut-section-title">常用</div>
            <div class="shortcut-item"><span>插入同级节点</span><kbd>Enter</kbd></div>
            <div class="shortcut-item"><span>插入子节点</span><kbd>Tab</kbd></div>
            <div class="shortcut-item"><span>插入父节点</span><kbd>Shift + Tab</kbd></div>
            <div class="shortcut-item"><span>进入节点编辑状态</span><kbd>空格</kbd></div>
            <div class="shortcut-item"><span>节点导航</span><kbd>&uarr; &darr; &larr; &rarr;</kbd></div>
            <div class="shortcut-item"><span>撤销</span><kbd>Ctrl + Z</kbd></div>
            <div class="shortcut-item"><span>重做</span><kbd>Ctrl + Y</kbd></div>
          </div>

          <!-- 节点样式 -->
          <div class="shortcut-section">
            <div class="shortcut-section-title">节点样式</div>
            <div class="shortcut-item"><span>高亮 (7色)</span><kbd>Alt + R, Y, P, B, C, O, G (Alt + H)</kbd></div>
            <div class="shortcut-item"><span>加粗</span><kbd>Ctrl + B</kbd></div>
            <div class="shortcut-item"><span>斜体</span><kbd>Ctrl + I</kbd></div>
            <div class="shortcut-item"><span>下划线</span><kbd>Ctrl + U</kbd></div>
          </div>

          <!-- 节点操作 -->
          <div class="shortcut-section">
            <div class="shortcut-section-title">节点操作</div>
            <div class="shortcut-item"><span>复制节点</span><kbd>Ctrl + C</kbd></div>
            <div class="shortcut-item"><span>剪切节点</span><kbd>Ctrl + X</kbd></div>
            <div class="shortcut-item"><span>粘贴节点</span><kbd>Ctrl + V</kbd></div>
            <div class="shortcut-item"><span>创建节点副本</span><kbd>Ctrl + D</kbd></div>
            <div class="shortcut-item"><span>展开/折叠当前节点</span><kbd>Alt + .</kbd></div>
            <div class="shortcut-item"><span>全部展开/全部折叠</span><kbd>Alt + Shift + .</kbd></div>
          </div>

          <!-- 导航 -->
          <div class="shortcut-section">
            <div class="shortcut-section-title">导航</div>
            <div class="shortcut-item"><span>画布放大</span><kbd>Ctrl + +</kbd></div>
            <div class="shortcut-item"><span>画布缩小</span><kbd>Ctrl + -</kbd></div>
            <div class="shortcut-item"><span>进入当前节点 (聚焦)</span><kbd>Ctrl + ]</kbd></div>
            <div class="shortcut-item"><span>返回上一级节点</span><kbd>Ctrl + [</kbd></div>
            <div class="shortcut-item"><span>视图切换 (大纲/导图)</span><kbd>M</kbd></div>
            <div class="shortcut-item"><span>快捷键面板</span><kbd>H / Ctrl + /</kbd></div>
          </div>
        </div>
      `;

      document.body.appendChild(this.drawerEl);
      this.closeBtn = this.drawerEl.querySelector('.drawer-close-btn');
    }

    bindEvents() {
      // 点击关闭
      this.closeBtn.addEventListener('click', () => {
        this.close();
      });

      // 按 Esc 关闭抽屉
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });
    }

    open() {
      this.isOpen = true;
      this.drawerEl.classList.add('open');
    }

    close() {
      this.isOpen = false;
      this.drawerEl.classList.remove('open');
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }
  }

  global.FeishuShortcutDrawer = FeishuShortcutDrawer;
})(typeof window !== 'undefined' ? window : this);
