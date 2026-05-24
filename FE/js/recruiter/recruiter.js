/**
 * EchoWork Recruiter Dashboard Logic
 * Handles: stats, job listing, applicants, create/delete job, status updates.
 *
 * Security fix: replaced unsafe onclick="fn(id, '${title}')" with data-* attributes
 * + event delegation to prevent quote-injection attacks from job titles.
 */
document.addEventListener('DOMContentLoaded', async function () {
  const { apiFetch } = window.EchoAPI;
  const { requireAuth, getUser, logout } = window.EchoAuth;
  const { success, error, info } = window.EchoToast;

  // Auth guard — RECRUITER or ADMIN only
  if (!requireAuth(['RECRUITER', 'ADMIN'])) return;

  const user = getUser();

  // ── Update user info in header ─────────────────────────────────────────────
  const companyNameEl = document.getElementById('recruiter-company-name');
  const companyInitEl = document.getElementById('recruiter-company-initial');
  const greetingEl    = document.getElementById('recruiter-greeting');

  if (companyNameEl) companyNameEl.textContent = user.fullName;
  if (companyInitEl) companyInitEl.textContent = (user.fullName || 'R').charAt(0).toUpperCase();
  if (greetingEl)    greetingEl.textContent = `Xin chào, ${user.fullName}! 👋`;

  // Logout button
  document.querySelectorAll('.recruiter-logout-btn').forEach(btn => {
    btn.addEventListener('click', logout);
  });

  // ── Load dashboard data ────────────────────────────────────────────────────
  await Promise.all([loadStats(), loadJobs(), loadRecentApplications()]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  async function loadStats() {
    try {
      if (user.role === 'ADMIN') {
        // Admins use the dedicated statistics endpoint — no over-fetching
        const statsRes = await apiFetch('/admin/statistics');
        const s = statsRes.data;
        setEl('stat-total-jobs',    s.jobs.total);
        setEl('stat-total-apps',    s.applications.total);
        setEl('stat-pending-apps',  s.applications.pending);
        setEl('stat-accepted-apps', s.applications.accepted);
      } else {
        // Recruiters fetch their own jobs and their applications
        const [jobsRes, appsRes] = await Promise.all([
          apiFetch('/jobs?limit=100'),
          apiFetch('/applications?limit=100'),
        ]);
        const myJobs = jobsRes.data.jobs.filter(j => j.createdBy?.id === user.id);
        const apps   = appsRes.data.applications;
        setEl('stat-total-jobs',    myJobs.length);
        setEl('stat-total-apps',    apps.length);
        setEl('stat-pending-apps',  apps.filter(a => a.status === 'PENDING').length);
        setEl('stat-accepted-apps', apps.filter(a => a.status === 'ACCEPTED').length);
      }
    } catch (err) {
      console.warn('Stats load failed:', err.message);
    }
  }

  // ── Jobs list ──────────────────────────────────────────────────────────────
  async function loadJobs() {
    const jobsList = document.getElementById('recruiter-jobs-list');
    if (!jobsList) return;

    jobsList.innerHTML = '<p style="color:#6b7280;text-align:center;padding:20px">Đang tải...</p>';

    try {
      const res   = await apiFetch('/jobs?limit=50');
      const jobs  = res.data.jobs;
      const myJobs = user.role === 'ADMIN' ? jobs : jobs.filter(j => j.createdBy?.id === user.id);

      if (myJobs.length === 0) {
        jobsList.innerHTML = `
          <div style="text-align:center;padding:40px;color:#6b7280">
            <div style="font-size:36px;margin-bottom:8px">📋</div>
            <p>Bạn chưa đăng tin tuyển dụng nào.</p>
            <button class="create-job-btn" style="margin-top:12px;padding:10px 20px;background:#10b981;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600">
              + Đăng tin ngay
            </button>
          </div>
        `;
        wireCreateBtns();
        return;
      }

      // ── Safe rendering using data-* attributes (NO inline onclick with user data) ──
      jobsList.innerHTML = myJobs.map(job => `
        <div class="job-row" data-job-id="${job.id}">
          <div class="job-row-left">
            <div class="job-dot-icon" style="background:#d1fae5;font-size:16px">💼</div>
            <div>
              <div class="job-title">${escHtml(job.title)}</div>
              <div class="job-meta-text">📍 ${escHtml(job.location || 'Không xác định')} · 💰 ${job.salary ? (job.salary/1e6).toFixed(0)+'M' : 'Thỏa thuận'}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="job-apps-count">${job._count?.applications ?? 0} ứng viên</span>
            <button class="btn-view-applicants"
              data-job-id="${job.id}"
              data-job-title="${escAttr(job.title)}"
              style="padding:5px 12px;border:1.5px solid #10b981;color:#047857;background:#ecfdf5;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer">
              Xem ứng viên
            </button>
            <button class="btn-delete-job"
              data-job-id="${job.id}"
              style="padding:5px 12px;border:1.5px solid #ef4444;color:#b91c1c;background:#fef2f2;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer">
              Xóa
            </button>
          </div>
        </div>
      `).join('');

      // ── Event delegation — safe, no onclick string injection ──────────────
      jobsList.addEventListener('click', function (e) {
        const viewBtn   = e.target.closest('.btn-view-applicants');
        const deleteBtn = e.target.closest('.btn-delete-job');

        if (viewBtn) {
          const jobId    = parseInt(viewBtn.dataset.jobId);
          const jobTitle = viewBtn.dataset.jobTitle; // already attr-escaped, safe to use as text
          loadJobApplicants(jobId, jobTitle);
        }

        if (deleteBtn) {
          const jobId = parseInt(deleteBtn.dataset.jobId);
          deleteJob(jobId, deleteBtn);
        }
      });

    } catch (err) {
      jobsList.innerHTML = `<p style="color:#e17055;text-align:center;padding:20px">Lỗi: ${escHtml(err.message)}</p>`;
    }
  }

  // ── Recent applications ────────────────────────────────────────────────────
  async function loadRecentApplications() {
    const appsEl = document.getElementById('recruiter-recent-apps');
    if (!appsEl) return;

    try {
      const res  = await apiFetch('/applications?limit=5');
      const apps = res.data.applications;

      if (apps.length === 0) {
        appsEl.innerHTML = '<p style="color:#6b7280;text-align:center;padding:20px">Chưa có ứng viên nào.</p>';
        return;
      }

      appsEl.innerHTML = apps.map(app => `
        <div class="activity-item">
          <div class="activity-dot" style="background:${statusBg(app.status)}">
            <span style="font-size:14px">${statusIcon(app.status)}</span>
          </div>
          <div>
            <div class="activity-text">
              <strong>${escHtml(app.user.fullName)}</strong> ứng tuyển <strong>${escHtml(app.job.title)}</strong>
            </div>
            <div class="activity-time">${new Date(app.createdAt).toLocaleDateString('vi-VN')}</div>
          </div>
          <div style="margin-left:auto">
            <select class="app-status-select" data-app-id="${app.id}"
              style="padding:4px 8px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer">
              <option value="PENDING"  ${app.status==='PENDING'  ? 'selected':''}>⏳ Đang xét</option>
              <option value="ACCEPTED" ${app.status==='ACCEPTED' ? 'selected':''}>✅ Chấp nhận</option>
              <option value="REJECTED" ${app.status==='REJECTED' ? 'selected':''}>❌ Từ chối</option>
            </select>
          </div>
        </div>
      `).join('');

      // Event delegation for status selects
      appsEl.addEventListener('change', function (e) {
        if (e.target.classList.contains('app-status-select')) {
          const appId  = parseInt(e.target.dataset.appId);
          const status = e.target.value;
          updateAppStatus(appId, status);
        }
      });

    } catch (err) {
      console.warn('Recent apps failed:', err.message);
    }
  }

  // ── Load applicants for a specific job ─────────────────────────────────────
  async function loadJobApplicants(jobId, jobTitle) {
    const modal = getOrCreateModal();
    modal.querySelector('.modal-title').textContent = `Ứng viên: ${jobTitle}`;
    const body = modal.querySelector('.modal-body');
    body.innerHTML = '<p style="text-align:center;padding:30px;color:#6b7280">Đang tải...</p>';
    showModal(modal);

    try {
      const res  = await apiFetch(`/applications?jobId=${jobId}&limit=50`);
      const apps = res.data.applications;

      if (apps.length === 0) {
        body.innerHTML = '<p style="text-align:center;padding:30px;color:#6b7280">Chưa có ứng viên ứng tuyển.</p>';
        return;
      }

      body.innerHTML = apps.map(app => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid #f3f4f6;gap:12px">
          <div style="display:flex;align-items:center;gap:12px;flex:1;min-width:0;">
            <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#10b981,#06b6d4);display:flex;align-items:center;justify-content:center;font-weight:700;color:white;flex-shrink:0">
              ${escHtml((app.user.fullName || 'U').charAt(0))}
            </div>
            <div style="min-width:0;">
              <div style="font-weight:700;font-size:14px;color:#111827">${escHtml(app.user.fullName)}</div>
              <div style="font-size:12px;color:#6b7280">${escHtml(app.user.email)}</div>
              ${app.user.disability ? `<div style="font-size:11px;color:#047857;margin-top:2px">♿ ${escHtml(app.user.disability)}</div>` : ''}
            </div>
          </div>
          <select class="app-status-select" data-app-id="${app.id}"
            style="padding:6px 10px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;">
            <option value="PENDING"  ${app.status==='PENDING'  ? 'selected':''}>⏳ Đang xét</option>
            <option value="ACCEPTED" ${app.status==='ACCEPTED' ? 'selected':''}>✅ Chấp nhận</option>
            <option value="REJECTED" ${app.status==='REJECTED' ? 'selected':''}>❌ Từ chối</option>
          </select>
        </div>
      `).join('');

      // Event delegation for status selects inside modal
      body.addEventListener('change', function (e) {
        if (e.target.classList.contains('app-status-select')) {
          const appId  = parseInt(e.target.dataset.appId);
          const status = e.target.value;
          updateAppStatus(appId, status);
        }
      });

    } catch (err) {
      body.innerHTML = `<p style="color:#e17055;text-align:center;padding:20px">${escHtml(err.message)}</p>`;
    }
  }

  // ── Update application status ─────────────────────────────────────────────
  async function updateAppStatus(appId, status) {
    try {
      await apiFetch(`/applications/${appId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      success('Trạng thái đã được cập nhật.');
      await loadStats();
    } catch (err) {
      error(err.message || 'Cập nhật thất bại.');
    }
  }

  // ── Delete job ─────────────────────────────────────────────────────────────
  async function deleteJob(jobId, btn) {
    if (!confirm('Bạn có chắc muốn xóa tin tuyển dụng này?')) return;

    if (btn) { btn.disabled = true; btn.textContent = 'Đang xóa...'; }

    try {
      await apiFetch(`/jobs/${jobId}`, { method: 'DELETE' });
      success('Đã xóa tin tuyển dụng.');
      await loadJobs();
      await loadStats();
    } catch (err) {
      error(err.message || 'Xóa thất bại.');
      if (btn) { btn.disabled = false; btn.textContent = 'Xóa'; }
    }
  }

  // ── Create Job Modal ────────────────────────────────────────────────────────
  function wireCreateBtns() {
    document.querySelectorAll('.create-job-btn').forEach(btn => {
      btn.addEventListener('click', showCreateJobModal);
    });
  }
  wireCreateBtns();

  function showCreateJobModal() {
    const modal = getOrCreateCreateJobModal();
    showModal(modal);
  }

  function getOrCreateCreateJobModal() {
    let modal = document.getElementById('create-job-modal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'create-job-modal';
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-box" style="max-width:540px">
        <div class="modal-header">
          <h3 class="modal-title">Đăng tin tuyển dụng mới</h3>
          <button class="modal-close" aria-label="Đóng">×</button>
        </div>
        <div class="modal-body" style="padding:24px">
          <form id="create-job-form" novalidate>
            <div class="modal-field">
              <label for="job-title">Tên vị trí *</label>
              <input type="text" id="job-title" required placeholder="VD: Senior React Developer" maxlength="200">
            </div>
            <div class="modal-field">
              <label for="job-company">Tên công ty *</label>
              <input type="text" id="job-company" required placeholder="VD: FPT Software" maxlength="200">
            </div>
            <div class="modal-field">
              <label for="job-location">Địa điểm</label>
              <input type="text" id="job-location" placeholder="VD: Hà Nội, Remote..." maxlength="255">
            </div>
            <div class="modal-field">
              <label for="job-salary">Mức lương (VNĐ)</label>
              <input type="number" id="job-salary" placeholder="VD: 25000000" min="0">
            </div>
            <div class="modal-field">
              <label for="job-description">Mô tả công việc *</label>
              <textarea id="job-description" rows="5" required placeholder="Mô tả chi tiết công việc, yêu cầu, quyền lợi..."></textarea>
            </div>
            <button type="submit" id="create-job-submit" style="
              width:100%;padding:12px;background:#10b981;color:white;border:none;
              border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;margin-top:8px;
            ">📢 Đăng tin tuyển dụng</button>
          </form>
        </div>
      </div>
    `;

    // Close handlers
    modal.querySelector('.modal-overlay').addEventListener('click', () => { modal.style.display = 'none'; });
    modal.querySelector('.modal-close').addEventListener('click',   () => { modal.style.display = 'none'; });

    injectModalStyles();
    document.body.appendChild(modal);

    modal.querySelector('#create-job-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      const btn = document.getElementById('create-job-submit');

      const title       = document.getElementById('job-title').value.trim();
      const companyName = document.getElementById('job-company').value.trim();
      const description = document.getElementById('job-description').value.trim();

      if (!title || !companyName || !description) {
        error('Vui lòng điền đầy đủ các trường bắt buộc (*).');
        return;
      }

      btn.disabled = true;
      btn.textContent = '⏳ Đang đăng...';

      try {
        await apiFetch('/jobs', {
          method: 'POST',
          body: JSON.stringify({
            title,
            companyName,
            location:    document.getElementById('job-location').value.trim(),
            salary:      document.getElementById('job-salary').value || null,
            description,
          }),
        });
        success('Tin tuyển dụng đã được đăng! 🎉');
        modal.style.display = 'none';
        this.reset();
        await loadJobs();
        await loadStats();
      } catch (err) {
        error(err.message || 'Đăng tin thất bại.');
      } finally {
        btn.disabled = false;
        btn.textContent = '📢 Đăng tin tuyển dụng';
      }
    });

    return modal;
  }

  // ── Modal helpers ───────────────────────────────────────────────────────────
  function getOrCreateModal() {
    let modal = document.getElementById('applicants-modal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'applicants-modal';
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-box">
        <div class="modal-header">
          <h3 class="modal-title">Ứng viên</h3>
          <button class="modal-close" aria-label="Đóng">×</button>
        </div>
        <div class="modal-body" style="padding:0 24px 24px;max-height:480px;overflow-y:auto"></div>
      </div>
    `;

    modal.querySelector('.modal-overlay').addEventListener('click', () => { modal.style.display = 'none'; });
    modal.querySelector('.modal-close').addEventListener('click',   () => { modal.style.display = 'none'; });

    injectModalStyles();
    document.body.appendChild(modal);
    return modal;
  }

  function showModal(modal) {
    modal.style.display = 'flex';
  }

  function injectModalStyles() {
    if (document.getElementById('recruiter-modal-styles')) return;
    const style = document.createElement('style');
    style.id = 'recruiter-modal-styles';
    style.textContent = `
      #applicants-modal, #create-job-modal {
        display: none;
        position: fixed; inset: 0; z-index: 9000;
        align-items: center; justify-content: center;
      }
      .modal-overlay {
        position: absolute; inset: 0;
        background: rgba(0,0,0,0.45); backdrop-filter: blur(2px);
      }
      .modal-box {
        position: relative; z-index: 1;
        background: white; border-radius: 16px;
        width: 90%; max-width: 600px;
        box-shadow: 0 24px 80px rgba(0,0,0,0.2);
        animation: modalIn 0.25s ease;
      }
      @keyframes modalIn {
        from { opacity:0; transform: scale(0.95); }
        to   { opacity:1; transform: scale(1); }
      }
      .modal-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 20px 24px 16px; border-bottom: 1px solid #e5e7eb;
      }
      .modal-title { font-size: 16px; font-weight: 700; color: #111827; }
      .modal-close {
        width: 32px; height: 32px; border-radius: 8px;
        border: 1.5px solid #e5e7eb; background: none; cursor: pointer;
        font-size: 18px; color: #6b7280; display: flex; align-items: center; justify-content: center;
      }
      .modal-close:hover { background: #f9fafb; color: #111827; }
      .modal-field { margin-bottom: 14px; }
      .modal-field label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 5px; }
      .modal-field input, .modal-field textarea {
        width: 100%; padding: 9px 12px; border: 1.5px solid #e5e7eb; border-radius: 8px;
        font-size: 14px; font-family: 'Inter', sans-serif; outline: none;
        transition: border-color 0.18s;
      }
      .modal-field input:focus, .modal-field textarea:focus { border-color: #10b981; }
      .modal-field textarea { resize: vertical; }
    `;
    document.head.appendChild(style);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────
  function setEl(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function statusBg(s) {
    return { PENDING:'#fef3c7', ACCEPTED:'#d1fae5', REJECTED:'#fee2e2' }[s] || '#f3f4f6';
  }
  function statusIcon(s) {
    return { PENDING:'⏳', ACCEPTED:'✅', REJECTED:'❌' }[s] || '·';
  }
  function escHtml(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  /** Escape a string for safe use in an HTML attribute value (double-quote delimited). */
  function escAttr(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
});
