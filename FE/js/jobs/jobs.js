/**
 * EchoWork Jobs Page Logic (index.html)
 * Dynamically loads jobs from the API, handles search and apply.
 */
document.addEventListener('DOMContentLoaded', async function () {
  const { apiFetch } = window.EchoAPI;
  const { updateHeaderAuth, getUser, isLoggedIn } = window.EchoAuth;
  const { success, error, info, warn } = window.EchoToast;

  // Update header with auth state
  updateHeaderAuth();

  // ── State ──────────────────────────────────────────────────────────────────
  let currentPage    = 1;
  let currentSearch  = '';
  let currentLocation = '';
  let totalPages     = 1;
  let isLoading      = false;

  // ── Elements ───────────────────────────────────────────────────────────────
  const jobsContainer  = document.getElementById('jobs-container');
  const searchInput    = document.getElementById('hero-search-input');
  const searchBtn      = document.getElementById('hero-search-btn');
  const paginationEl   = document.getElementById('jobs-pagination');
  const jobCountEl     = document.getElementById('jobs-count');

  if (!jobsContainer) return;

  // ── Load jobs ──────────────────────────────────────────────────────────────
  async function loadJobs(page = 1) {
    if (isLoading) return;
    isLoading = true;

    jobsContainer.innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:#6b7280">
        <div style="font-size:32px;margin-bottom:12px;animation:spin 1s linear infinite;display:inline-block">⟳</div>
        <p>Đang tải việc làm...</p>
      </div>
    `;

    try {
      const params = new URLSearchParams({ page, limit: 8 });
      if (currentSearch)   params.set('search', currentSearch);
      if (currentLocation) params.set('location', currentLocation);

      const res = await apiFetch(`/jobs?${params}`);
      const { jobs, pagination } = res.data;

      currentPage = pagination.page;
      totalPages  = pagination.totalPages;

      if (jobCountEl) {
        jobCountEl.textContent = `${pagination.total} việc làm`;
      }

      renderJobs(jobs);
      renderPagination(pagination);

    } catch (err) {
      jobsContainer.innerHTML = `
        <div style="text-align:center;padding:60px 20px;color:#e17055">
          <div style="font-size:40px;margin-bottom:12px">⚠️</div>
          <p>${err.message}</p>
          <button onclick="loadJobs()" style="margin-top:12px;padding:8px 20px;background:#00b894;color:white;border:none;border-radius:8px;cursor:pointer">Thử lại</button>
        </div>
      `;
    } finally {
      isLoading = false;
    }
  }

  // ── Render job cards ────────────────────────────────────────────────────────
  function renderJobs(jobs) {
    if (!jobs || jobs.length === 0) {
      jobsContainer.innerHTML = `
        <div style="text-align:center;padding:60px 20px;color:#6b7280">
          <div style="font-size:48px;margin-bottom:12px">🔍</div>
          <p>Không tìm thấy việc làm phù hợp.</p>
          <p style="font-size:13px;margin-top:6px">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
        </div>
      `;
      return;
    }

    jobsContainer.innerHTML = jobs.map(job => renderJobCard(job)).join('');

    // Wire apply buttons
    jobsContainer.querySelectorAll('.apply-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        applyToJob(parseInt(this.dataset.jobId), this);
      });
    });
  }

  function renderJobCard(job) {
    const salary = job.salary
      ? `💰 ${(job.salary / 1000000).toFixed(0)} triệu`
      : '💰 Thỏa thuận';

    const location = job.location ? `📍 ${job.location}` : '';
    const appCount = job._count?.applications ?? 0;
    const companyInitial = (job.companyName || 'C').charAt(0).toUpperCase();
    const colors = ['#00b894','#0984e3','#6c5ce7','#e17055','#fdcb6e','#00cec9'];
    const color  = colors[job.id % colors.length];

    const user    = getUser();
    const canApply = user && user.role === 'CANDIDATE';
    const applyBtn = canApply
      ? `<button class="btn btn-primary apply-btn" data-job-id="${job.id}">Ứng tuyển</button>`
      : user
        ? `<button class="btn btn-outline" disabled title="Chỉ ứng viên mới ứng tuyển được">Ứng tuyển</button>`
        : `<a href="login.html?redirect=${encodeURIComponent(window.location.pathname)}" class="btn btn-primary">Đăng nhập để ứng tuyển</a>`;

    return `
      <div class="job-card">
        <div class="job-info">
          <div class="job-logo" style="background:${color}1a;border-radius:10px;display:flex;align-items:center;justify-content:center;width:48px;height:48px;font-size:18px;font-weight:800;color:${color}">
            ${companyInitial}
          </div>
          <div class="job-details">
            <h3 style="font-size:15px;font-weight:700;margin-bottom:4px">${escHtml(job.title)}</h3>
            <p class="job-company" style="color:#6b7280;font-size:13px;margin-bottom:6px">${escHtml(job.companyName)}</p>
            <div class="job-meta" style="display:flex;gap:12px;flex-wrap:wrap;font-size:12px;color:#6b7280">
              ${salary ? `<span>${salary}</span>` : ''}
              ${location ? `<span>${location}</span>` : ''}
              <span>👥 ${appCount} ứng viên</span>
            </div>
          </div>
        </div>
        ${applyBtn}
      </div>
    `;
  }

  // ── Apply to job ────────────────────────────────────────────────────────────
  async function applyToJob(jobId, btn) {
    if (!isLoggedIn()) {
      window.location.href = `login.html?redirect=${encodeURIComponent(window.location.href)}`;
      return;
    }

    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Đang ứng tuyển...';

    try {
      await apiFetch('/applications', {
        method: 'POST',
        body: JSON.stringify({ jobId }),
      });
      success('Ứng tuyển thành công! 🎉');
      btn.textContent = '✅ Đã ứng tuyển';
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-outline');
    } catch (err) {
      if (err.status === 409) {
        warn('Bạn đã ứng tuyển vị trí này rồi.');
        btn.textContent = '✅ Đã ứng tuyển';
      } else {
        error(err.message || 'Ứng tuyển thất bại.');
        btn.disabled = false;
        btn.textContent = original;
      }
    }
  }

  // ── Pagination ──────────────────────────────────────────────────────────────
  function renderPagination(pagination) {
    if (!paginationEl) return;
    const { page, totalPages: total } = pagination;

    const pageNumbers = paginationEl.querySelector('.page-numbers');
    const prevBtn = paginationEl.querySelector('.page-prev');
    const nextBtn = paginationEl.querySelector('.page-next');

    if (prevBtn) prevBtn.disabled = page <= 1;
    if (nextBtn) nextBtn.disabled = page >= total;

    if (pageNumbers) {
      pageNumbers.innerHTML = '';
      const start = Math.max(1, page - 2);
      const end   = Math.min(total, page + 2);

      for (let i = start; i <= end; i++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = i;
        btn.className = 'page-btn' + (i === page ? ' active' : '');
        btn.setAttribute('role', 'listitem');
        btn.addEventListener('click', () => loadJobs(i));
        pageNumbers.appendChild(btn);
      }
    }

    if (prevBtn) {
      prevBtn.onclick = () => { if (currentPage > 1) loadJobs(currentPage - 1); };
    }
    if (nextBtn) {
      nextBtn.onclick = () => { if (currentPage < totalPages) loadJobs(currentPage + 1); };
    }
  }

  // ── Search ─────────────────────────────────────────────────────────────────
  let searchDebounce;
  function doSearch() {
    if (searchInput) currentSearch = searchInput.value.trim();
    currentPage = 1;
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => loadJobs(1), 400);
  }

  if (searchInput) {
    searchInput.addEventListener('input', doSearch);
    searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
  }
  if (searchBtn) searchBtn.addEventListener('click', doSearch);

  // Location filter pills
  document.querySelectorAll('.pill-tag input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', function () {
      const label = this.closest('.pill-tag').textContent.trim();
      if (this.checked) {
        currentLocation = label;
      } else if (currentLocation === label) {
        currentLocation = '';
      }
      loadJobs(1);
    });
  });

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function escHtml(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // Expose for pagination retry button
  window.loadJobs = loadJobs;

  // ── Initial load ────────────────────────────────────────────────────────────
  await loadJobs(1);
});
