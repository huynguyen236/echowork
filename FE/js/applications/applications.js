/**
 * EchoWork Applications Page Logic
 * Candidate: view their applications and status.
 */
document.addEventListener('DOMContentLoaded', async function () {
  const { apiFetch } = window.EchoAPI;
  const { requireAuth, updateHeaderAuth } = window.EchoAuth;
  const { error } = window.EchoToast;

  if (!requireAuth(['CANDIDATE'])) return;
  updateHeaderAuth();

  const container = document.getElementById('applications-container');
  const emptyEl   = document.getElementById('applications-empty');
  if (!container) return;

  try {
    const res = await apiFetch('/applications');
    const { applications } = res.data;

    if (!applications || applications.length === 0) {
      if (emptyEl) emptyEl.style.display = 'block';
      container.innerHTML = '';
      return;
    }

    container.innerHTML = applications.map(app => `
      <div class="application-item" style="
        background:white;border-radius:12px;padding:18px 22px;
        box-shadow:0 2px 8px rgba(0,0,0,0.06);border:1px solid #e5e7eb;
        display:flex;align-items:center;justify-content:space-between;gap:16px;
        margin-bottom:12px;
      ">
        <div style="flex:1;min-width:0;">
          <div style="font-size:15px;font-weight:700;color:#111827;margin-bottom:3px">${escHtml(app.job.title)}</div>
          <div style="font-size:13px;color:#6b7280">🏢 ${escHtml(app.job.companyName)}</div>
          ${app.job.location ? `<div style="font-size:12px;color:#9ca3af;margin-top:2px">📍 ${escHtml(app.job.location)}</div>` : ''}
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <span style="
            display:inline-block;padding:5px 14px;border-radius:20px;font-size:12px;font-weight:700;
            ${statusStyle(app.status)}
          ">${statusLabel(app.status)}</span>
          <div style="font-size:11px;color:#9ca3af;margin-top:5px">
            ${new Date(app.createdAt).toLocaleDateString('vi-VN')}
          </div>
        </div>
      </div>
    `).join('');

  } catch (err) {
    error(err.message || 'Không thể tải danh sách ứng tuyển.');
    container.innerHTML = `<p style="color:#e17055;text-align:center">Lỗi: ${err.message}</p>`;
  }

  function statusLabel(status) {
    return { PENDING: '⏳ Đang xét duyệt', ACCEPTED: '✅ Đã chấp nhận', REJECTED: '❌ Không phù hợp' }[status] || status;
  }

  function statusStyle(status) {
    return {
      PENDING:  'background:#fef3c7;color:#92400e;',
      ACCEPTED: 'background:#d1fae5;color:#065f46;',
      REJECTED: 'background:#fee2e2;color:#991b1b;',
    }[status] || 'background:#f3f4f6;color:#374151;';
  }

  function escHtml(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
});
