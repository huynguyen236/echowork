/**
 * EchoWork CV Builder Logic
 * Create, update, and download PDF CV.
 */
document.addEventListener('DOMContentLoaded', async function () {
  const { apiFetch } = window.EchoAPI;
  const { requireAuth, getUser, updateHeaderAuth } = window.EchoAuth;
  const { success, error, info } = window.EchoToast;

  // Auth guard — candidates only
  if (!requireAuth(['CANDIDATE'])) return;

  updateHeaderAuth();

  const user = getUser();

  // ── State ──────────────────────────────────────────────────────────────────
  let currentCvId = null;
  const params = new URLSearchParams(window.location.search);
  const cvIdParam      = params.get('id');
  const templateParam  = params.get('template') || 'default';

  // ── Elements ───────────────────────────────────────────────────────────────
  const form          = document.getElementById('cv-form');
  const summaryEl     = document.getElementById('cv-summary');
  const educationEl   = document.getElementById('cv-education');
  const experienceEl  = document.getElementById('cv-experience');
  const skillsEl      = document.getElementById('cv-skills');
  const templateEl    = document.getElementById('cv-template');
  const saveBtn       = document.getElementById('cv-save-btn');
  const downloadBtn   = document.getElementById('cv-download-btn');
  const statusEl      = document.getElementById('cv-status');
  const cvIdDisplay   = document.getElementById('cv-id-display');
  const userNameEl    = document.getElementById('cv-user-name');

  if (userNameEl) userNameEl.textContent = user.fullName;

  // Set template from URL param
  if (templateEl && templateParam) {
    templateEl.value = templateParam;
  }

  // ── Load existing CV if ?id= given ────────────────────────────────────────
  if (cvIdParam) {
    await loadCV(parseInt(cvIdParam));
  }

  // ── Load CV from API ────────────────────────────────────────────────────────
  async function loadCV(cvId) {
    try {
      setStatus('loading', 'Đang tải CV...');
      const res = await apiFetch(`/cv/${cvId}`);
      const cv  = res.data;

      currentCvId = cv.id;
      if (cvIdDisplay) cvIdDisplay.textContent = `CV #${cv.id}`;

      // Fill form fields
      if (summaryEl)    summaryEl.value    = cv.summary    || '';
      if (templateEl)   templateEl.value   = cv.template   || 'default';

      // Education, experience, skills may be JSON arrays or plain strings
      if (educationEl)  educationEl.value  = formatForTextarea(cv.education);
      if (experienceEl) experienceEl.value = formatForTextarea(cv.experience);
      if (skillsEl)     skillsEl.value     = formatForTextarea(cv.skills);

      setStatus('ready', `CV #${cv.id} đã được tải.`);
      if (downloadBtn) downloadBtn.disabled = false;

    } catch (err) {
      setStatus('error', err.message || 'Không thể tải CV.');
    }
  }

  // ── Save CV ────────────────────────────────────────────────────────────────
  // NOTE: Only one listener is wired — to the form submit event.
  // The save button is type="submit" inside the form, so it triggers this.
  // We do NOT add a separate click listener on saveBtn to avoid double-submit.
  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      await saveCV();
    });
  }

  async function saveCV() {
    const payload = {
      summary:    summaryEl    ? summaryEl.value.trim()    : '',
      education:  educationEl  ? educationEl.value.trim()  : '',
      experience: experienceEl ? experienceEl.value.trim() : '',
      skills:     skillsEl     ? skillsEl.value.trim()     : '',
      template:   templateEl   ? templateEl.value          : 'default',
    };

    if (!payload.summary && !payload.education && !payload.experience && !payload.skills) {
      error('Vui lòng điền ít nhất một thông tin vào CV.');
      return;
    }

    setSaveLoading(true);
    setStatus('loading', 'Đang lưu CV...');

    try {
      let res;
      if (currentCvId) {
        // Update existing CV
        res = await apiFetch(`/cv/${currentCvId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        success('CV đã được cập nhật! ✅');
      } else {
        // Create new CV
        res = await apiFetch('/cv', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        currentCvId = res.data.id;
        if (cvIdDisplay) cvIdDisplay.textContent = `CV #${currentCvId}`;
        // Update URL without reloading
        window.history.replaceState({}, '', `?id=${currentCvId}`);
        success('CV đã được tạo thành công! 🎉');
      }

      if (downloadBtn) downloadBtn.disabled = false;
      setStatus('ready', `CV #${currentCvId} đã lưu lúc ${new Date().toLocaleTimeString('vi-VN')}.`);

    } catch (err) {
      error(err.message || 'Lưu CV thất bại.');
      setStatus('error', err.message);
    } finally {
      setSaveLoading(false);
    }
  }

  // ── Download PDF ───────────────────────────────────────────────────────────
  if (downloadBtn) {
    downloadBtn.addEventListener('click', async function () {
      if (!currentCvId) {
        error('Vui lòng lưu CV trước khi tải về.');
        return;
      }

      this.disabled = true;
      this.textContent = '⏳ Đang tạo PDF...';
      info('Đang tạo PDF, vui lòng chờ...', 6000);

      try {
        const token = localStorage.getItem('echo_token');
        const url = `${window.EchoAPI.API_BASE}/cv/download/${currentCvId}`;

        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || 'Tạo PDF thất bại.');
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = `CV-EchoWork-${user.fullName.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(objectUrl);

        success('PDF đã được tải xuống! 📄');

      } catch (err) {
        error(err.message || 'Không thể tải PDF.');
      } finally {
        this.disabled = false;
        this.textContent = '📥 Tải PDF';
      }
    });
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function formatForTextarea(value) {
    if (!value) return '';
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map(item => {
          if (typeof item === 'string') return item;
          return Object.values(item).filter(Boolean).join(' | ');
        }).join('\n');
      }
    } catch {}
    return value;
  }

  function setStatus(type, msg) {
    if (!statusEl) return;
    const icons = { loading: '⏳', ready: '✅', error: '❌' };
    statusEl.textContent = `${icons[type] || ''} ${msg}`;
    statusEl.className = `cv-status cv-status-${type}`;
  }

  function setSaveLoading(loading) {
    if (!saveBtn) return;
    saveBtn.disabled = loading;
    saveBtn.textContent = loading ? '💾 Đang lưu...' : '💾 Lưu CV';
  }
});
