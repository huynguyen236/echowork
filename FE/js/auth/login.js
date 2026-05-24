/**
 * EchoWork Login Page Logic
 * Handles: login form submission, tab switching login/register.
 */
document.addEventListener('DOMContentLoaded', function () {
  const { apiFetch } = window.EchoAPI;
  const { setAuth, getUser, isLoggedIn } = window.EchoAuth;
  const { success, error, info } = window.EchoToast;

  // If already logged in, redirect
  if (isLoggedIn()) {
    const user = getUser();
    redirectByRole(user.role);
    return;
  }

  // ── Elements ──────────────────────────────────────────────────────────────
  const loginForm     = document.getElementById('login-form');
  const emailInput    = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const submitBtn     = document.getElementById('login-submit');

  if (!loginForm) return;

  // ── Handle login submit ───────────────────────────────────────────────────
  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email    = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      error('Vui lòng nhập email và mật khẩu.');
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setAuth(res.data.token, res.data.user);
      success(`Chào mừng trở lại, ${res.data.user.fullName}! 👋`);

      // Check redirect param
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');

      setTimeout(() => {
        if (redirect) {
          window.location.href = decodeURIComponent(redirect);
        } else {
          redirectByRole(res.data.user.role);
        }
      }, 800);

    } catch (err) {
      error(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  });

  function setLoading(loading) {
    submitBtn.disabled = loading;
    submitBtn.textContent = loading ? 'Đang đăng nhập...' : 'Đăng nhập';
  }

  function redirectByRole(role) {
    if (role === 'RECRUITER' || role === 'ADMIN') {
      window.location.href = '/recruiter.html';
    } else {
      window.location.href = '/dashboard.html';
    }
  }
});
