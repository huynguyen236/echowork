/**
 * EchoWork Auth Helpers
 * Manages JWT token and user data in localStorage.
 */

const TOKEN_KEY = 'echo_token';
const USER_KEY  = 'echo_user';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function isLoggedIn() {
  return !!getToken() && !isTokenExpired();
}

/**
 * Decode a JWT payload without a library (base64 decode of the middle segment).
 * Returns null if the token is malformed.
 * @param {string} token
 * @returns {object|null}
 */
function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Check whether the stored JWT has expired (client-side, no signature verification).
 * @returns {boolean}
 */
function isTokenExpired() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return true;
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;
  // exp is in seconds; Date.now() is in ms
  return Date.now() >= payload.exp * 1000;
}

/**
 * Protect a page — redirect to login if not authenticated.
 * Optionally restrict to specific roles.
 * @param {string[]} roles - allowed roles, e.g. ['RECRUITER', 'ADMIN']
 */
function requireAuth(roles = []) {
  const token = getToken();
  const user  = getUser();

  if (!token || !user || isTokenExpired()) {
    clearAuth(); // clean up stale data
    const current = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/login.html?redirect=${current}`;
    return false;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    // Use EchoToast if available, otherwise fall back to console warning
    if (window.EchoToast) {
      window.EchoToast.error('Bạn không có quyền truy cập trang này.');
    }
    window.location.href = '/index.html';
    return false;
  }

  return true;
}

/**
 * Logout — clear storage and redirect.
 */
function logout() {
  clearAuth();
  window.location.href = '/login.html';
}

/**
 * Update header auth buttons based on login state.
 * Call this on every page that has the standard header.
 */
function updateHeaderAuth() {
  const user = getUser();
  const authBtnsEl = document.querySelector('.auth-btns');
  if (!authBtnsEl) return;

  if (user && !isTokenExpired()) {
    const roleLabel = { CANDIDATE: 'Ứng viên', RECRUITER: 'Nhà tuyển dụng', ADMIN: 'Admin' }[user.role] || user.role;
    const dashHref = user.role === 'RECRUITER' || user.role === 'ADMIN'
      ? '/recruiter.html'
      : '/dashboard.html';

    authBtnsEl.innerHTML = `
      <a href="${dashHref}" class="btn btn-outline" style="display:inline-flex;align-items:center;gap:6px;">
        <span style="font-size:16px">👤</span>
        <span>${escHtml(user.fullName || roleLabel)}</span>
      </a>
      <button onclick="window.EchoAuth.logout()" class="btn btn-primary">Đăng xuất</button>
    `;
  } else {
    authBtnsEl.innerHTML = `
      <a href="login.html" class="btn btn-outline">Đăng nhập</a>
      <a href="register.html" class="btn btn-primary">Đăng ký</a>
    `;
  }
}

/** Minimal HTML escaper for safe DOM rendering of user data in the header. */
function escHtml(str) {
  return String(str || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

window.EchoAuth = {
  getToken, getUser, setAuth, clearAuth,
  isLoggedIn, isTokenExpired, decodeToken,
  requireAuth, logout, updateHeaderAuth,
};
