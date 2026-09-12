/**
 * 考研题库 · 全局统一模态确认框与通知中心 (ConfirmModal & Toast Engine)
 *
 * 规范原则：
 *   1. 彻底取缔并防御性拦截浏览器原生 window.alert 与 window.confirm，杜绝任何未预期系统弹窗。
 *   2. 采用 Quiet Liquid 磨砂玻璃（14px blur）与清华紫视觉规范，与应用全界面深度融合。
 *   3. 核心 API：showConfirmModal(options) 返回 Promise<boolean>；showToast(message, type)。
 *   4. 最早载入执行，保证所有下游业务模块（storage_sync、topics、annotator、english等）均可即刻无缝调用。
 */

(function () {
  'use strict';

  var confirmModalResolve = null;
  var currentConfirmOptions = null;

  function escapeHtml(str) {
    if (str === undefined || str === null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ===== 全局统一确认模态框 (Quiet Liquid Confirm Modal) =====
  function showConfirmModal(options) {
    options = options || {};
    var title = options.title || '操作确认';
    var message = options.message || '确定要继续吗？';
    var confirmText = options.confirmText || '确定';
    var cancelText = options.cancelText || '取消';
    var isDanger = !!options.danger;
    var icon = options.icon || null;

    var modal = document.getElementById('confirmModal');
    var card = modal ? modal.querySelector('.confirm-modal-card') : null;
    var iconEl = document.getElementById('confirmModalIcon');
    var titleEl = document.getElementById('confirmModalTitle');
    var msgEl = document.getElementById('confirmModalMessage');
    var okBtn = document.getElementById('btnConfirmModalOk');
    var cancelBtn = document.getElementById('btnConfirmModalCancel');

    if (!modal || !okBtn || !cancelBtn) {
      console.warn('[ConfirmModal] 模态框 DOM 尚未挂载');
      if (typeof options.onConfirm === 'function') options.onConfirm();
      return Promise.resolve(true);
    }

    if (confirmModalResolve) {
      var prevOpts = currentConfirmOptions;
      var prevR = confirmModalResolve;
      currentConfirmOptions = null;
      confirmModalResolve = null;
      if (prevOpts && typeof prevOpts.onCancel === 'function') {
        try { prevOpts.onCancel(); } catch (e) {}
      }
      prevR(false);
    }

    currentConfirmOptions = options;

    if (iconEl) {
      iconEl.textContent = '';
      iconEl.style.display = 'none';
    }
    if (titleEl) titleEl.textContent = title;
    if (msgEl) {
      if (options.html) {
        msgEl.innerHTML = options.html;
      } else {
        msgEl.innerHTML = escapeHtml(message).replace(/\n/g, '<br>');
      }
    }

    okBtn.innerHTML = escapeHtml(confirmText) + ' <span class="key">Enter</span>';
    cancelBtn.innerHTML = escapeHtml(cancelText) + ' <span class="key">Esc</span>';

    if (card) {
      card.classList.toggle('is-danger', isDanger);
    }

    modal.style.display = 'flex';
    document.body.classList.add('modal-open');

    setTimeout(function () {
      if (isDanger && cancelBtn) {
        cancelBtn.focus();
      } else if (okBtn) {
        okBtn.focus();
      }
    }, 50);

    return new Promise(function (resolve) {
      confirmModalResolve = resolve;
    });
  }

  function closeConfirmModal(result) {
    var modal = document.getElementById('confirmModal');
    if (modal) modal.style.display = 'none';
    var hasOtherModal = (document.getElementById('relatedModal') && document.getElementById('relatedModal').style.display !== 'none') ||
                        (document.getElementById('topicRenameModal') && document.getElementById('topicRenameModal').style.display !== 'none') ||
                        (document.getElementById('shortcutModal') && document.getElementById('shortcutModal').classList.contains('show'));
    if (!hasOtherModal) {
      document.body.classList.remove('modal-open');
    }

    var opts = currentConfirmOptions;
    currentConfirmOptions = null;
    if (result && opts && typeof opts.onConfirm === 'function') {
      try { opts.onConfirm(); } catch (e) { console.error(e); }
    } else if (!result && opts && typeof opts.onCancel === 'function') {
      try { opts.onCancel(); } catch (e) { console.error(e); }
    }

    if (confirmModalResolve) {
      var r = confirmModalResolve;
      confirmModalResolve = null;
      r(!!result);
    }
  }

  // ===== 全局统一轻提示 (Toast) =====
  function showToast(message, type) {
    type = type || 'info';
    var toast = document.getElementById('storageSyncToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'storageSyncToast';
      toast.className = 'sync-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = 'sync-toast show toast-' + type;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
      toast.classList.remove('show');
    }, 3200);
  }

  // ===== 全局防御层：彻底拦截并取缔原生 alert / confirm =====
  window.alert = function (msg) {
    showToast(String(msg), 'info');
  };

  window.confirm = function (msg) {
    console.warn('[window.confirm 被拦截]: 原生阻塞确认框已被取缔，请使用异步 showConfirmModal。消息:', msg);
    showConfirmModal({ message: String(msg) });
    return true;
  };

  // 暴露全局 API
  window.showConfirmModal = showConfirmModal;
  window.closeConfirmModal = closeConfirmModal;
  window.showToast = showToast;

  // DOM 就绪后绑定模态框交互事件
  function initConfirmModalEvents() {
    var btnOk = document.getElementById('btnConfirmModalOk');
    var btnCancel = document.getElementById('btnConfirmModalCancel');
    var btnClose = document.getElementById('btnConfirmModalClose');
    var modal = document.getElementById('confirmModal');

    if (btnOk) btnOk.addEventListener('click', function () { closeConfirmModal(true); });
    if (btnCancel) btnCancel.addEventListener('click', function () { closeConfirmModal(false); });
    if (btnClose) btnClose.addEventListener('click', function () { closeConfirmModal(false); });
    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeConfirmModal(false);
      });
    }

    document.addEventListener('keydown', function (e) {
      if (!modal || modal.style.display === 'none') return;
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        closeConfirmModal(false);
      }
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initConfirmModalEvents);
  } else {
    initConfirmModalEvents();
  }

})();
