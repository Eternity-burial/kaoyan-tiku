/**
 * 飞书思维导图富节点渲染器 (FeishuNodeRenderer)
 * 职责：
 * 1. 挂载至 SimpleMindMap 的 customCreateNodeContent 配置项
 * 2. 调度全局 MarkdownLatexEngine 进行 Markdown + KaTeX + DOMPurify 安全编译
 * 3. 严格遵循飞书卡片视觉规范（层级配色、边距圆角、光学中轴基线对齐）
 * 4. 纯原生 Vanilla JS 实现，严格零表情符号
 */
(function (global) {
  'use strict';

  function stripOuterParagraph(str) {
    if (!str || typeof str !== 'string') return '';
    let s = str.trim();
    // 剥离 SimpleMindMap 默认包裹的 <p>...</p> 标签，还原原始 Markdown/LaTeX 文本
    if (s.startsWith('<p>') && s.endsWith('</p>') && s.indexOf('<p>', 3) === -1) {
      s = s.slice(3, -4);
    }
    return s;
  }

  function renderNodeContent(node) {
    const rawData = (node.nodeData && node.nodeData.data) || {};
    let text = rawData.text || '';
    text = stripOuterParagraph(text);

    // 1. 若全局存在 MarkdownLatexEngine，进行行内公式与 Markdown 编译
    let renderedHtml = '';
    if (global.MarkdownLatexEngine && typeof global.MarkdownLatexEngine.renderInline === 'function') {
      renderedHtml = global.MarkdownLatexEngine.renderInline(text);
    } else {
      renderedHtml = String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }

    if (!renderedHtml || renderedHtml.trim() === '') {
      renderedHtml = '&nbsp;';
    }

    // 2. 确定层级索引 (0 为根节点，1 为二级章节卡片，2 及以上为三级叶子节点)
    const layerIndex = node.layerIndex !== undefined ? node.layerIndex : (node.isRoot ? 0 : 2);

    // 3. 构建飞书专属卡片 DOM
    const cardEl = document.createElement('div');
    const cardClasses = `feishu-node-card level-${layerIndex} ${node.isRoot ? 'is-root' : ''}`;
    cardEl.className = cardClasses;
    cardEl.dataset.nodeUid = rawData.uid || '';

    // 支持全局粗体、斜体、下划线样式
    if (rawData.fontWeight === 'bold') {
      cardEl.style.fontWeight = 'bold';
    }
    if (rawData.fontStyle === 'italic') {
      cardEl.style.fontStyle = 'italic';
    }
    if (rawData.textDecoration === 'underline') {
      cardEl.style.textDecoration = 'underline';
    }

    const contentEl = document.createElement('div');
    let contentClasses = 'feishu-node-content';
    // 飞书文字与公式区域精细高亮
    if (rawData.highlightColor) {
      contentClasses += ` feishu-hl-${rawData.highlightColor} feishu-highlight-${rawData.highlightColor}`;
    }
    contentEl.className = contentClasses;
    contentEl.innerHTML = renderedHtml;

    cardEl.appendChild(contentEl);
    return cardEl;
  }

  global.FeishuNodeRenderer = {
    render: renderNodeContent,
    stripOuterParagraph: stripOuterParagraph
  };
})(typeof window !== 'undefined' ? window : this);
