/**
 * 飞书思维笔记大纲引擎 (FeishuOutliner)
 * 特性：
 * 1. 递归渲染树状大纲纸张列表 (• 圆点手柄 + 极细竖向导向线)
 * 2. 全键盘快捷工作流:
 *    - Enter: 创建同级兄弟节点并自动聚焦
 *    - Tab: 向右缩进降级为子节点
 *    - Shift + Tab: 向左提升层级
 *    - Backspace: 空节点回退与删除
 *    - Up / Down: 行间垂直跳转
 * 3. 圆点手柄支持拖拽重排与父子层级变更 (HTML5 Drag and Drop)
 * 4. 纯原生 Vanilla JS 实现，零外部重型框架依赖，零表情符号
 */
(function (global) {
  'use strict';

  function generateUid() {
    return 'node_' + Math.random().toString(36).substr(2, 9);
  }

  function stripHtmlTags(html) {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  class FeishuOutliner {
    constructor(container, options = {}) {
      if (!container) {
        throw new Error('[FeishuOutliner] 未指定挂载容器');
      }

      this.container = container;
      this.options = Object.assign({
        placeholder: '输入内容...',
        titlePlaceholder: '输入导图根节点标题...'
      }, options);

      this.data = null;
      this.listeners = {};
      this.draggedUid = null;
      this.focusedUid = null;
      this.collapsedMap = new Set(); // 记录折叠状态的节点 uid

      this.initDom();
      this.bindEvents();
    }

    // 初始化外部骨架
    initDom() {
      this.container.innerHTML = `
        <div class="outliner-paper">
          <h1 class="outliner-title" contenteditable="true" spellcheck="false"></h1>
          <div class="outliner-tree"></div>
        </div>
      `;

      this.paper = this.container.querySelector('.outliner-paper');
      this.titleEl = this.container.querySelector('.outliner-title');
      this.treeEl = this.container.querySelector('.outliner-tree');
    }

    // 载入思维导图标准树数据并渲染
    setData(treeData) {
      if (!treeData) return;
      this.data = JSON.parse(JSON.stringify(treeData));
      this.ensureUidsAndCleanText(this.data);
      this.render();
    }

    // 获取当前大纲最新树形数据
    getData() {
      if (!this.data) return null;
      return JSON.parse(JSON.stringify(this.data));
    }

    // 确保每个节点均拥有唯一 uid，并过滤富文本 HTML 标签为纯文本
    ensureUidsAndCleanText(node) {
      if (!node.data) node.data = {};
      if (!node.data.uid) node.data.uid = generateUid();
      if (typeof node.data.text === 'string') {
        node.data.text = stripHtmlTags(node.data.text);
      }
      if (Array.isArray(node.children)) {
        node.children.forEach(child => this.ensureUidsAndCleanText(child));
      }
    }

    // 渲染全量大纲树
    render() {
      if (!this.data) return;

      // 渲染根节点标题
      const rootText = stripHtmlTags(this.data.data.text || '未命名思维导图');
      this.titleEl.textContent = rootText;

      // 渲染子节点列表
      this.treeEl.innerHTML = '';
      const children = this.data.children || [];
      children.forEach((child) => {
        const childEl = this.renderNode(child, 1);
        this.treeEl.appendChild(childEl);
      });

      // 恢复焦点
      if (this.focusedUid) {
        this.focusNode(this.focusedUid);
      }
    }

    // 递归渲染单节点
    renderNode(nodeData, level = 1) {
      const uid = nodeData.data.uid;
      const text = stripHtmlTags(nodeData.data.text || '');
      const hasChildren = Array.isArray(nodeData.children) && nodeData.children.length > 0;
      const isCollapsed = this.collapsedMap.has(uid);

      const nodeEl = document.createElement('div');
      nodeEl.className = `outliner-node level-${level}`;
      nodeEl.dataset.uid = uid;

      const rowEl = document.createElement('div');
      rowEl.className = 'outliner-row';
      rowEl.dataset.uid = uid;

      // 折叠小箭头
      if (hasChildren) {
        const foldBtn = document.createElement('span');
        foldBtn.className = `outliner-fold-btn ${isCollapsed ? 'folded' : ''}`;
        foldBtn.innerHTML = '&#9660;'; // 纯字符下三角
        foldBtn.title = isCollapsed ? '展开子项' : '折叠子项';
        foldBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleCollapse(uid);
        });
        rowEl.appendChild(foldBtn);
      } else {
        const foldPlaceholder = document.createElement('span');
        foldPlaceholder.style.width = '14px';
        foldPlaceholder.style.height = '14px';
        foldPlaceholder.style.marginRight = '-4px';
        foldPlaceholder.style.flexShrink = '0';
        rowEl.appendChild(foldPlaceholder);
      }

      // 圆点拖拽手柄
      const handleEl = document.createElement('div');
      handleEl.className = 'outliner-handle';
      handleEl.title = '拖动调整顺序或层级';
      handleEl.draggable = true;

      const bulletEl = document.createElement('span');
      bulletEl.className = 'outliner-bullet';
      handleEl.appendChild(bulletEl);
      rowEl.appendChild(handleEl);

      // 可编辑文本域
      const textEl = document.createElement('div');
      textEl.className = 'outliner-text';
      textEl.contentEditable = 'true';
      textEl.spellcheck = false;
      textEl.dataset.uid = uid;
      textEl.textContent = text;
      rowEl.appendChild(textEl);

      nodeEl.appendChild(rowEl);

      // 子节点列表容器
      if (hasChildren) {
        const childrenContainer = document.createElement('div');
        childrenContainer.className = `outliner-children ${isCollapsed ? 'collapsed' : ''}`;
        nodeData.children.forEach(child => {
          childrenContainer.appendChild(this.renderNode(child, level + 1));
        });
        nodeEl.appendChild(childrenContainer);
      }

      return nodeEl;
    }

    // 折叠展开切换
    toggleCollapse(uid) {
      if (this.collapsedMap.has(uid)) {
        this.collapsedMap.delete(uid);
      } else {
        this.collapsedMap.add(uid);
      }
      this.render();
    }

    // 聚焦指定节点并放置光标于末尾
    focusNode(uid) {
      this.focusedUid = uid;
      const targetEl = this.container.querySelector(`.outliner-text[data-uid="${uid}"]`);
      if (targetEl) {
        targetEl.focus();
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(targetEl);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }

    // 绑定大纲编辑核心事件与键盘机制
    bindEvents() {
      // 1. 标题输入联动根节点文本
      this.titleEl.addEventListener('input', () => {
        if (!this.data) return;
        this.data.data.text = this.titleEl.textContent.trim();
        this.emitChange();
      });

      this.titleEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          // 在根节点回车，新增第一个一级节点
          const newUid = generateUid();
          const newNode = { data: { text: '新主题', uid: newUid }, children: [] };
          if (!this.data.children) this.data.children = [];
          this.data.children.unshift(newNode);
          this.focusedUid = newUid;
          this.render();
          this.emitChange();
        }
      });

      // 2. 文本域输入同步
      this.treeEl.addEventListener('input', (e) => {
        const target = e.target;
        if (!target.classList.contains('outliner-text')) return;
        const uid = target.dataset.uid;
        const found = this.findNode(uid);
        if (found) {
          found.data.text = target.textContent.trim();
          this.emitChange();
        }
      });

      // 3. 全键盘协议 (Enter, Tab, Shift+Tab, Backspace, Arrows)
      this.treeEl.addEventListener('keydown', (e) => {
        const target = e.target;
        if (!target.classList.contains('outliner-text')) return;
        const uid = target.dataset.uid;

        // Enter 键：插入同级节点
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          const newUid = generateUid();
          const newNode = { data: { text: '', uid: newUid }, children: [] };
          this.insertSiblingAfter(uid, newNode);
          this.focusedUid = newUid;
          this.render();
          this.emitChange();
          return;
        }

        // Tab 键：向右缩进为上一个兄弟节点的子项
        if (e.key === 'Tab' && !e.shiftKey) {
          e.preventDefault();
          const success = this.indentNode(uid);
          if (success) {
            this.focusedUid = uid;
            this.render();
            this.emitChange();
          }
          return;
        }

        // Shift + Tab 键：向左提升层级
        if (e.key === 'Tab' && e.shiftKey) {
          e.preventDefault();
          const success = this.outdentNode(uid);
          if (success) {
            this.focusedUid = uid;
            this.render();
            this.emitChange();
          }
          return;
        }

        // Backspace 键：空节点回退或删除
        if (e.key === 'Backspace') {
          const currentText = target.textContent.trim();
          if (currentText === '') {
            e.preventDefault();
            // 先尝试提升层级
            const outdentSuccess = this.outdentNode(uid);
            if (outdentSuccess) {
              this.focusedUid = uid;
              this.render();
              this.emitChange();
              return;
            }
            // 已经是顶级空节点，直接删除并聚焦上一项
            const prevTextEl = this.getPreviousTextEl(target);
            this.removeNode(uid);
            if (prevTextEl) {
              this.focusedUid = prevTextEl.dataset.uid;
            }
            this.render();
            this.emitChange();
            return;
          }
        }

        // 上下方向键：行间导航
        if (e.key === 'ArrowUp') {
          const prevEl = this.getPreviousTextEl(target);
          if (prevEl) {
            e.preventDefault();
            prevEl.focus();
          }
        } else if (e.key === 'ArrowDown') {
          const nextEl = this.getNextTextEl(target);
          if (nextEl) {
            e.preventDefault();
            nextEl.focus();
          }
        }
      });

      // 4. 原生 HTML5 拖拽手柄支持
      this.bindDragAndDrop();
    }

    // 拖拽手柄监听
    bindDragAndDrop() {
      this.treeEl.addEventListener('dragstart', (e) => {
        const handle = e.target.closest('.outliner-handle');
        if (!handle) return;
        const row = handle.closest('.outliner-row');
        this.draggedUid = row.dataset.uid;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.draggedUid);
      });

      this.treeEl.addEventListener('dragover', (e) => {
        e.preventDefault();
        const row = e.target.closest('.outliner-row');
        if (!row || row.dataset.uid === this.draggedUid) return;

        // 根据鼠标相对于行的高度判断放置位置 (上半部: 放在上方; 下半部: 放在下方)
        const rect = row.getBoundingClientRect();
        const offsetY = e.clientY - rect.top;
        this.clearDragHoverClasses();

        if (offsetY < rect.height * 0.5) {
          row.classList.add('drag-over-top');
        } else {
          row.classList.add('drag-over-bottom');
        }
      });

      this.treeEl.addEventListener('dragleave', (e) => {
        const row = e.target.closest('.outliner-row');
        if (row) {
          row.classList.remove('drag-over-top', 'drag-over-bottom', 'drag-over-child');
        }
      });

      this.treeEl.addEventListener('drop', (e) => {
        e.preventDefault();
        const row = e.target.closest('.outliner-row');
        if (!row || !this.draggedUid || row.dataset.uid === this.draggedUid) {
          this.clearDragHoverClasses();
          return;
        }

        const targetUid = row.dataset.uid;
        const isTop = row.classList.contains('drag-over-top');
        this.clearDragHoverClasses();

        this.moveNodeRelative(this.draggedUid, targetUid, isTop ? 'before' : 'after');
        this.focusedUid = this.draggedUid;
        this.render();
        this.emitChange();
        this.draggedUid = null;
      });

      this.treeEl.addEventListener('dragend', () => {
        this.clearDragHoverClasses();
        this.draggedUid = null;
      });
    }

    clearDragHoverClasses() {
      const rows = this.treeEl.querySelectorAll('.outliner-row');
      rows.forEach(r => r.classList.remove('drag-over-top', 'drag-over-bottom', 'drag-over-child'));
    }

    // 获取上一个文本元素
    getPreviousTextEl(currentTextEl) {
      const allTextEls = Array.from(this.treeEl.querySelectorAll('.outliner-text'));
      const idx = allTextEls.indexOf(currentTextEl);
      return idx > 0 ? allTextEls[idx - 1] : null;
    }

    // 获取下一个文本元素
    getNextTextEl(currentTextEl) {
      const allTextEls = Array.from(this.treeEl.querySelectorAll('.outliner-text'));
      const idx = allTextEls.indexOf(currentTextEl);
      return idx >= 0 && idx < allTextEls.length - 1 ? allTextEls[idx + 1] : null;
    }

    // 树形数据操作工具集
    findNode(uid) {
      const res = this.findNodeAndParent(this.data, uid);
      return res ? res.node : null;
    }

    findNodeAndParent(root, uid, parent = null) {
      if (root.data && root.data.uid === uid) {
        return { node: root, parent, index: parent ? parent.children.indexOf(root) : -1 };
      }
      if (root.children) {
        for (let i = 0; i < root.children.length; i++) {
          const found = this.findNodeAndParent(root.children[i], uid, root);
          if (found) return found;
        }
      }
      return null;
    }

    insertSiblingAfter(uid, newNode) {
      const found = this.findNodeAndParent(this.data, uid);
      if (!found || !found.parent) return false;
      found.parent.children.splice(found.index + 1, 0, newNode);
      return true;
    }

    indentNode(uid) {
      const found = this.findNodeAndParent(this.data, uid);
      if (!found || !found.parent || found.index === 0) return false;
      const prevSibling = found.parent.children[found.index - 1];
      found.parent.children.splice(found.index, 1);
      if (!prevSibling.children) prevSibling.children = [];
      prevSibling.children.push(found.node);
      // 展开目标节点以呈现新缩进项
      this.collapsedMap.delete(prevSibling.data.uid);
      return true;
    }

    outdentNode(uid) {
      const found = this.findNodeAndParent(this.data, uid);
      if (!found || !found.parent) return false;
      const grand = this.findNodeAndParent(this.data, found.parent.data.uid);
      if (!grand || !grand.parent) return false;
      found.parent.children.splice(found.index, 1);
      grand.parent.children.splice(grand.index + 1, 0, found.node);
      return true;
    }

    removeNode(uid) {
      const found = this.findNodeAndParent(this.data, uid);
      if (!found || !found.parent) return false;
      found.parent.children.splice(found.index, 1);
      return true;
    }

    moveNodeRelative(srcUid, targetUid, position) {
      const srcFound = this.findNodeAndParent(this.data, srcUid);
      const targetFound = this.findNodeAndParent(this.data, targetUid);
      if (!srcFound || !targetFound || !srcFound.parent || !targetFound.parent) return false;

      // 检查防成环保护：目标不能是源节点的子孙
      if (this.isDescendant(srcFound.node, targetFound.node)) return false;

      // 从原位置移除
      srcFound.parent.children.splice(srcFound.index, 1);

      // 重新查找目标位置（由于可能发生索引偏移）
      const refreshedTarget = this.findNodeAndParent(this.data, targetUid);
      const insertIdx = position === 'before' ? refreshedTarget.index : refreshedTarget.index + 1;
      refreshedTarget.parent.children.splice(insertIdx, 0, srcFound.node);
      return true;
    }

    isDescendant(ancestor, candidate) {
      if (!ancestor || !ancestor.children) return false;
      for (const child of ancestor.children) {
        if (child.data.uid === candidate.data.uid) return true;
        if (this.isDescendant(child, candidate)) return true;
      }
      return false;
    }

    // 事件订阅系统
    on(event, handler) {
      if (!this.listeners[event]) this.listeners[event] = [];
      this.listeners[event].push(handler);
    }

    emit(event, payload) {
      if (this.listeners[event]) {
        this.listeners[event].forEach(fn => fn(payload));
      }
    }

    emitChange() {
      this.emit('change', this.getData());
    }
  }

  global.FeishuOutliner = FeishuOutliner;
})(typeof window !== 'undefined' ? window : this);
