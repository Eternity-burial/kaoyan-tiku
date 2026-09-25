/**
 * 飞书思维笔记全局快捷键管理器 (FeishuShortcutManager)
 * 职责：
 * 1. 7 色高亮体系 (Alt + R, Y, P, B, C, O, G)
 * 2. 节点样式切换 (Ctrl + B 加粗, Ctrl + I 斜体, Ctrl + U 下划线)
 * 3. 节点副本创建 (Ctrl + D Duplicate)
 * 4. 节点折叠与展开 (Alt + . / Alt + Shift + .)
 * 5. 单节点钻取聚焦与返回 (Ctrl + ] / Ctrl + [)
 * 6. 画布缩放 (Ctrl + + / -) 与快捷键指南抽屉唤起 (Ctrl + /)
 * 7. 纯原生 Vanilla JS，严格零表情符号
 */
(function (global) {
  'use strict';

  function generateUid() {
    return 'node_' + Math.random().toString(36).substr(2, 9);
  }

  function safeCloneNodeData(source) {
    if (!source) return null;
    const res = {
      data: {},
      children: []
    };
    if (source.data) {
      for (const k in source.data) {
        if (k === '_node' || k === 'node' || k.startsWith('_')) continue;
        const val = source.data[k];
        if (typeof val !== 'object' || val === null) {
          res.data[k] = val;
        } else if (Array.isArray(val)) {
          res.data[k] = val.slice();
        } else {
          try {
            res.data[k] = JSON.parse(JSON.stringify(val));
          } catch (e) {
            // 忽略潜在循环结构
          }
        }
      }
    }
    res.data.uid = generateUid();
    if (Array.isArray(source.children)) {
      res.children = source.children.map(child => safeCloneNodeData(child)).filter(Boolean);
    }
    return res;
  }

  class FeishuShortcutManager {
    constructor(mindMap, options = {}) {
      if (!mindMap) {
        throw new Error('[FeishuShortcutManager] 必须传入 SimpleMindMap 实例');
      }
      this.mindMap = mindMap;
      this.options = options;
      this.shortcutDrawer = options.shortcutDrawer || null;

      // 钻取栈 (Drill-down stack)
      this.drillStack = [];
      this.breadcrumbEl = null;

      this.initBreadcrumbDom();
      this.bindShortcuts();
    }

    initBreadcrumbDom() {
      const existing = document.querySelector('.feishu-drill-breadcrumb');
      if (existing) existing.remove();

      this.breadcrumbEl = document.createElement('div');
      this.breadcrumbEl.className = 'feishu-drill-breadcrumb';
      this.breadcrumbEl.style.cssText = `
        position: fixed;
        top: 16px;
        left: 140px;
        z-index: 120;
        display: none;
        align-items: center;
        gap: 8px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(12px);
        padding: 4px 12px;
        border-radius: 16px;
        border: 1px solid #dee0e3;
        box-shadow: 0 4px 12px rgba(31, 35, 41, 0.08);
        font-size: 13px;
        color: #646a73;
      `;
      document.body.appendChild(this.breadcrumbEl);
    }

    bindShortcuts() {
      window.addEventListener('keydown', (e) => {
        const isEditing = this.isUserTyping();
        const activeList = (this.mindMap.renderer && this.mindMap.renderer.activeNodeList) || [];
        const activeNode = (activeList.length === 1) ? activeList[0] : null;

        // 1. 快捷键指南面板呼出 (H 键与 Ctrl + /)
        if ((e.key === 'h' || e.key === 'H') && !isEditing && !e.altKey) {
          e.preventDefault();
          e.stopPropagation();
          if (this.shortcutDrawer) {
            this.shortcutDrawer.toggle();
          }
          return;
        }

        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
          e.preventDefault();
          e.stopPropagation();
          if (this.shortcutDrawer) {
            this.shortcutDrawer.toggle();
          }
          return;
        }


        // 2. 7 色高亮体系 (Alt + R, Y, P, B, C, O, G 以及 Alt + H 快捷高亮)
        if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
          const colorMap = {
            'KeyR': 'red',
            'KeyY': 'yellow',
            'KeyP': 'purple',
            'KeyB': 'blue',
            'KeyC': 'cyan',
            'KeyO': 'orange',
            'KeyG': 'green',
            'KeyH': 'yellow'
          };
          const colorKey = colorMap[e.code];
          if (colorKey) {
            if (isEditing) {
              e.preventDefault();
              e.stopPropagation();
              this.dispatchFormatting('color', colorKey);
              return;
            } else if (activeNode) {
              e.preventDefault();
              e.stopPropagation();
              this.toggleNodeHighlight(activeNode, colorKey);
              return;
            }
          }
        }

        // 3. 复制节点副本 (Ctrl + D)
        if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D') && !e.shiftKey && !e.altKey) {
          if (activeNode && !isEditing) {
            e.preventDefault();
            e.stopPropagation();
            this.duplicateNode(activeNode);
            return;
          }
        }

        // 4. 聚焦钻取进入当前节点 (Ctrl + ]) 与返回上一级 (Ctrl + [)
        if ((e.ctrlKey || e.metaKey) && e.key === ']') {
          if (activeNode && !isEditing) {
            e.preventDefault();
            e.stopPropagation();
            this.drillDown(activeNode);
            return;
          }
        }
        if ((e.ctrlKey || e.metaKey) && e.key === '[') {
          if (!isEditing && this.drillStack.length > 0) {
            e.preventDefault();
            e.stopPropagation();
            this.drillUp();
            return;
          }
        }

        // 5. 展开 / 折叠 (Alt + . 与 Alt + Shift + .)
        if (e.altKey && e.key === '.') {
          e.preventDefault();
          e.stopPropagation();
          if (e.shiftKey) {
            // 全部展开/折叠
            this.toggleExpandAll();
          } else if (activeNode) {
            // 单节点展开/折叠
            const expand = activeNode.getData('expand');
            this.mindMap.execCommand('SET_NODE_EXPAND', activeNode, !expand);
          }
          return;
        }

        // 6. 富文本样式快捷键 (Ctrl + B / I / U / Shift+X / E) 编辑态与非编辑态双模流转
        if ((e.ctrlKey || e.metaKey) && !e.altKey) {
          const k = e.key.toLowerCase();
          if (k === 'b' || k === 'i' || k === 'u') {
            if (isEditing) {
              e.preventDefault();
              e.stopPropagation();
              const map = { 'b': 'bold', 'i': 'italic', 'u': 'underline' };
              this.dispatchFormatting(map[k]);
              return;
            } else if (activeNode) {
              e.preventDefault();
              e.stopPropagation();
              if (k === 'b') this.toggleNodeStyle(activeNode, 'fontWeight', 'bold');
              else if (k === 'i') this.toggleNodeStyle(activeNode, 'fontStyle', 'italic');
              else if (k === 'u') this.toggleNodeStyle(activeNode, 'textDecoration', 'underline');
              return;
            }
          }
          // 删除线 Ctrl + Shift + X
          if (e.shiftKey && k === 'x') {
            if (isEditing) {
              e.preventDefault();
              e.stopPropagation();
              this.dispatchFormatting('strikethrough');
              return;
            }
          }
          // 行内代码 Ctrl + E
          if (!e.shiftKey && k === 'e') {
            if (isEditing) {
              e.preventDefault();
              e.stopPropagation();
              this.dispatchFormatting('code');
              return;
            }
          }
        }
      }, true);
    }

    // 转发富文本排版指令（优先作用于活跃编辑器的文本选区）
    dispatchFormatting(formatType, extra = null) {
      const editor = this.mindMap.feishuNodeEditor || window._feishuNodeEditorInstance;
      if (editor && editor.isEditing) {
        editor.formatSelection(formatType, extra);
        return true;
      }
      const outliner = window._outlinerInstance;
      if (outliner && outliner.focusedUid) {
        outliner.formatSelection(formatType, extra);
        return true;
      }
      return false;
    }

    // 判断用户是否正在输入框中键入
    isUserTyping() {
      const el = document.activeElement;
      if (!el) return false;
      const tag = el.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable;
    }

    // 切换节点高亮颜色 (Toggle 逻辑与深度清理)
    toggleNodeHighlight(node, colorKey) {
      if (!node) return;
      const curColor = node.getData('highlightColor');
      const isClearing = (!colorKey || colorKey === 'none' || curColor === colorKey);
      const targetColor = isClearing ? null : colorKey;

      const nodeData = node.getData() || {};
      let text = nodeData.text || '';

      if (!targetColor && text) {
        text = text.replace(/<span class="feishu-(?:text|inline)-hl-[a-z]+">([\s\S]+?)<\/span>/gi, '$1')
                   .replace(/<mark class="[^"]*">([\s\S]+?)<\/mark>/gi, '$1');
      }

      if (node.nodeData && node.nodeData.data) {
        if (targetColor) {
          node.nodeData.data.highlightColor = targetColor;
        } else {
          delete node.nodeData.data.highlightColor;
        }
      }

      const nodeUid = node.getData('uid');
      this.mindMap.execCommand('SET_NODE_DATA', node, {
        highlightColor: targetColor,
        text: text
      });
      this.mindMap.render(() => {
        if (this.mindMap.renderer && nodeUid) {
          const freshNode = this.mindMap.renderer.findNodeByUid(nodeUid);
          if (freshNode) {
            this.mindMap.renderer.clearActiveNodeList();
            this.mindMap.renderer.addNodeToActiveList(freshNode);
          }
        }
      });
    }

    // 切换节点样式 (粗体/斜体/下划线)
    toggleNodeStyle(node, key, value) {
      if (!node) return;
      const cur = node.getData(key);
      const target = (cur === value) ? '' : value;
      this.mindMap.execCommand('SET_NODE_DATA', node, { [key]: target });
      this.mindMap.render();
    }

    // 创建节点副本 (Ctrl + D)
    duplicateNode(node) {
      if (!node || node.isRoot) return;
      const parent = node.parent;
      if (!parent || !parent.nodeData || !Array.isArray(parent.nodeData.children)) return;

      const cloned = safeCloneNodeData(node.nodeData);
      const index = parent.nodeData.children.findIndex(child => child.data && child.data.uid === node.getData('uid'));
      if (index !== -1) {
        parent.nodeData.children.splice(index + 1, 0, cloned);
        this.mindMap.render(() => {
          // 自动激活新创建的副本节点
          const newNode = this.mindMap.renderer.findNodeByUid(cloned.data.uid);
          if (newNode) {
            this.mindMap.renderer.clearActiveNodeList();
            this.mindMap.renderer.addNodeToActiveList(newNode);
          }
        });
      }
    }

    // 进入当前节点聚焦钻取 (Ctrl + ])
    drillDown(node) {
      if (!node || node.isRoot) return;
      const currentFullTree = this.mindMap.getData(false);
      const nodeText = (node.getData('text') || '聚焦节点').replace(/<[^>]+>/g, '').trim();

      this.drillStack.push({
        fullTree: JSON.parse(JSON.stringify(currentFullTree)),
        targetUid: node.getData('uid'),
        title: nodeText
      });

      const subtree = safeCloneNodeData(node.nodeData);
      this.mindMap.setData(subtree);
      this.mindMap.view.reset();

      this.updateBreadcrumb();
    }

    // 返回上一级节点 (Ctrl + [)
    drillUp() {
      if (this.drillStack.length === 0) return;
      const prev = this.drillStack.pop();
      this.mindMap.setData(prev.fullTree);
      this.mindMap.view.reset();

      this.updateBreadcrumb();
      // 重新高亮刚才聚焦的节点
      setTimeout(() => {
        const targetNode = this.mindMap.renderer.findNodeByUid(prev.targetUid);
        if (targetNode) {
          this.mindMap.renderer.clearActiveNodeList();
          this.mindMap.renderer.addNodeToActiveList(targetNode);
        }
      }, 50);
    }

    // 更新面包屑指示器
    updateBreadcrumb() {
      if (!this.breadcrumbEl) return;
      if (this.drillStack.length === 0) {
        this.breadcrumbEl.style.display = 'none';
        this.breadcrumbEl.innerHTML = '';
        return;
      }

      this.breadcrumbEl.style.display = 'inline-flex';
      const items = ['<span style="cursor: pointer; color: #3370ff;" class="breadcrumb-root">全部导图</span>'];
      this.drillStack.forEach((entry, idx) => {
        items.push('<span>/</span>');
        items.push(`<span style="font-weight: 500; color: #1f2329;">${entry.title}</span>`);
      });

      this.breadcrumbEl.innerHTML = items.join('');
      const rootBtn = this.breadcrumbEl.querySelector('.breadcrumb-root');
      if (rootBtn) {
        rootBtn.onclick = () => {
          while (this.drillStack.length > 1) {
            this.drillStack.pop();
          }
          this.drillUp();
        };
      }
    }

    // 全部折叠 / 展开
    toggleExpandAll() {
      let hasUnexpanded = false;
      const walk = (node) => {
        if (node.getData && node.getData('expand') === false) {
          hasUnexpanded = true;
          return;
        }
        if (node.children) node.children.forEach(walk);
      };
      if (this.mindMap.renderer && this.mindMap.renderer.root) {
        walk(this.mindMap.renderer.root);
      }

      if (hasUnexpanded) {
        this.expandAll();
      } else {
        this.collapseAll();
      }
    }

    // 全部展开
    expandAll() {
      if (typeof this.mindMap.execCommand === 'function') {
        this.mindMap.execCommand('EXPAND_ALL');
      }
      if (window._outlinerInstance && typeof window._outlinerInstance.expandAll === 'function') {
        window._outlinerInstance.expandAll();
      }
    }

    // 全部折叠
    collapseAll() {
      if (typeof this.mindMap.execCommand === 'function') {
        this.mindMap.execCommand('UNEXPAND_ALL');
      }
      if (window._outlinerInstance && typeof window._outlinerInstance.collapseAll === 'function') {
        window._outlinerInstance.collapseAll();
      }
    }
  }

  // 静态暴露辅助方法供工具条调用
  FeishuShortcutManager.duplicateActiveNode = function(mindMap) {
    const activeList = (mindMap.renderer && mindMap.renderer.activeNodeList) || [];
    if (activeList.length === 1 && global._feishuShortcutManagerInstance) {
      global._feishuShortcutManagerInstance.duplicateNode(activeList[0]);
    }
  };

  FeishuShortcutManager.drillDown = function(mindMap) {
    const activeList = (mindMap.renderer && mindMap.renderer.activeNodeList) || [];
    if (activeList.length === 1 && global._feishuShortcutManagerInstance) {
      global._feishuShortcutManagerInstance.drillDown(activeList[0]);
    }
  };

  global.FeishuShortcutManager = FeishuShortcutManager;
})(typeof window !== 'undefined' ? window : this);
