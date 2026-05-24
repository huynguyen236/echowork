/**
 * EchoWork API Helper
 * Centralized fetch wrapper with auto-auth, auto-logout on 401, and error handling.
 */

// Allow the API base URL to be overridden at deploy time via a global variable.
// In production, set window.ECHO_API_BASE before this script loads.
const API_BASE = (typeof window !== 'undefined' && window.ECHO_API_BASE)
  ? window.ECHO_API_BASE
  : 'http://localhost:3000/api';

/**
 * Handle a 401 Unauthorized response — clear auth and redirect to login.
 * Avoids a redirect loop if we're already on the login page.
 */
function handleUnauthorized() {
  if (window.EchoAuth) {
    window.EchoAuth.clearAuth();
  } else {
    localStorage.removeItem('echo_token');
    localStorage.removeItem('echo_user');
  }
  if (!window.location.pathname.includes('login.html')) {
    const current = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/login.html?redirect=${current}&reason=session_expired`;
  }
}

/**
 * Make an authenticated API request.
 * Automatically attaches the JWT token and handles 401 auto-logout.
 * @param {string} endpoint - e.g. '/jobs' or '/auth/login'
 * @param {object} options  - fetch options (method, body, etc.)
 * @returns {Promise<object>} - parsed JSON response data
 * @throws {Error} with .message from server or network
 */
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('echo_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    // Auto-logout on 401 Unauthorized (expired or invalid token)
    if (response.status === 401) {
      handleUnauthorized();
      const err = new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      err.status = 401;
      throw err;
    }

    const data = await response.json();

    if (!response.ok) {
      const err = new Error(data.message || `HTTP ${response.status}`);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    if (err.status) throw err; // re-throw API errors (including 401)
    throw new Error('Không thể kết nối tới máy chủ. Vui lòng thử lại.');
  }
}

/**
 * Upload a file using FormData (no Content-Type header — browser sets it with boundary).
 * Automatically handles 401 auto-logout.
 */
async function apiUpload(endpoint, formData, method = 'POST') {
  const token = localStorage.getItem('echo_token');

  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: formData,
  });

  // Auto-logout on 401
  if (response.status === 401) {
    handleUnauthorized();
    const err = new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    err.status = 401;
    throw err;
  }

  const data = await response.json();
  if (!response.ok) {
    const err = new Error(data.message || `HTTP ${response.status}`);
    err.status = response.status;
    throw err;
  }
  return data;
}

window.EchoAPI = { apiFetch, apiUpload, API_BASE };
