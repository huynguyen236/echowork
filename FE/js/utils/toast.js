/**
 * EchoWork Toast Notifications
 * Lightweight toast system — no dependencies.
 */

(function () {
  // Inject styles once
  if (!document.getElementById('echo-toast-styles')) {
    const style = document.createElement('style');
    style.id = 'echo-toast-styles';
    style.textContent = `
      #echo-toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 99999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      }
      .echo-toast {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 18px;
        border-radius: 12px;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        font-weight: 500;
        color: white;
        box-shadow: 0 8px 24px rgba(0,0,0,0.18);
        pointer-events: auto;
        min-width: 260px;
        max-width: 380px;
        animation: toastIn 0.35s ease forwards;
        transition: opacity 0.4s ease, transform 0.4s ease;
      }
      .echo-toast.success { background: linear-gradient(135deg, #00b894, #00cec9); }
      .echo-toast.error   { background: linear-gradient(135deg, #e17055, #d63031); }
      .echo-toast.info    { background: linear-gradient(135deg, #0984e3, #6c5ce7); }
      .echo-toast.warn    { background: linear-gradient(135deg, #fdcb6e, #e17055); color: #2d3436; }
      .echo-toast-icon    { font-size: 18px; flex-shrink: 0; }
      .echo-toast-msg     { flex: 1; line-height: 1.4; }
      .echo-toast-close   {
        background: none; border: none; color: inherit; opacity: 0.7;
        cursor: pointer; font-size: 16px; padding: 0; line-height: 1;
        flex-shrink: 0;
      }
      .echo-toast-close:hover { opacity: 1; }
      .echo-toast.hide {
        opacity: 0;
        transform: translateX(30px);
      }
      @keyframes toastIn {
        from { opacity: 0; transform: translateX(30px); }
        to   { opacity: 1; transform: translateX(0); }
      }
    `;
    document.head.appendChild(style);
  }

  function getContainer() {
    let el = document.getElementById('echo-toast-container');
    if (!el) {
      el = document.createElement('div');
      el.id = 'echo-toast-container';
      document.body.appendChild(el);
    }
    return el;
  }

  const ICONS = { success: '✅', error: '❌', info: 'ℹ️', warn: '⚠️' };

  function show(message, type = 'info', duration = 4000) {
    const container = getContainer();
    const toast = document.createElement('div');
    toast.className = `echo-toast ${type}`;
    toast.innerHTML = `
      <span class="echo-toast-icon">${ICONS[type] || 'ℹ️'}</span>
      <span class="echo-toast-msg">${message}</span>
      <button class="echo-toast-close" aria-label="Đóng">×</button>
    `;

    const close = () => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 450);
    };

    toast.querySelector('.echo-toast-close').addEventListener('click', close);
    container.appendChild(toast);

    if (duration > 0) setTimeout(close, duration);
    return toast;
  }

  window.EchoToast = {
    success: (msg, dur) => show(msg, 'success', dur),
    error:   (msg, dur) => show(msg, 'error',   dur),
    info:    (msg, dur) => show(msg, 'info',     dur),
    warn:    (msg, dur) => show(msg, 'warn',     dur),
  };
})();
