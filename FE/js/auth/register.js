/**
 * EchoWork Register Page Logic
 */
document.addEventListener('DOMContentLoaded', function () {
  const { apiFetch } = window.EchoAPI;
  const { setAuth, isLoggedIn } = window.EchoAuth;
  const { success, error } = window.EchoToast;

  if (isLoggedIn()) {
    window.location.href = '/dashboard.html';
    return;
  }

  const form         = document.getElementById('register-form');
  const nameInput    = document.getElementById('reg-fullname');
  const emailInput   = document.getElementById('reg-email');
  const passInput    = document.getElementById('reg-password');
  const pass2Input   = document.getElementById('reg-password2');
  const roleSelect   = document.getElementById('reg-role');
  const disabInput   = document.getElementById('reg-disability');
  const submitBtn    = document.getElementById('reg-submit');

  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const fullName   = nameInput.value.trim();
    const email      = emailInput.value.trim();
    const password   = passInput.value;
    const password2  = pass2Input.value;
    const role       = roleSelect.value;
    const disability = disabInput ? disabInput.value.trim() : '';

    // Validation
    if (!fullName || !email || !password) {
      error('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }
    if (password.length < 6) {
      error('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (password !== password2) {
      error('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);

    try {
      // Register
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ fullName, email, password, role, disability }),
      });

      // Auto-login after register
      const loginRes = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setAuth(loginRes.data.token, loginRes.data.user);
      success(`Đăng ký thành công! Chào mừng bạn, ${loginRes.data.user.fullName}! 🎉`);

      setTimeout(() => {
        if (role === 'RECRUITER') {
          window.location.href = '/recruiter.html';
        } else {
          window.location.href = '/dashboard.html';
        }
      }, 900);

    } catch (err) {
      error(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  });

  function setLoading(loading) {
    submitBtn.disabled = loading;
    submitBtn.textContent = loading ? 'Đang xử lý...' : 'Đăng ký';
  }
});
