const AUTH_FILE_URL = 'https://script.google.com/macros/s/AKfycbw7pUKmPCq7WY9_bdqiALzOOkFF3x7eurzRUrJu8HxvUyoPwH0g4Y7XMUUiIzDUEgBZ1A/exec';

// Cookie helpers
function getCookie(name) {
  const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
  return v ? decodeURIComponent(v[2]) : '';
}
function setCookie(name, value, days = 90) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}
function deleteCookie(name) {
  document.cookie = `${name}=; max-age=0; path=/`;
}

// Hiển thị trạng thái đăng nhập
function showStatus(id, role) {
  let el = document.getElementById('status-info');
  if (!el) {
    el = document.createElement('div');
    el.id = 'status-info';
    el.style = `
      position:fixed;top:10px;left:10px;background:#eee;padding:6px 12px;
      border-radius:8px;box-shadow:0 1px 5px rgba(0,0,0,0.2);
      font-family:sans-serif;z-index:9999;
    `;
    document.body.appendChild(el);
  }
  el.textContent = `Xin chào ${id} (${role})`;
  setTimeout(() => el.remove(), 10000);
}
function hideStatus() {
  const el = document.getElementById('status-info');
  if (el) el.remove();
}

// Hiển thị nút đăng xuất
function showLogoutButton() {
  if (document.getElementById('logout-btn')) return;
  const btn = document.createElement('button');
  btn.id = 'logout-btn';
  btn.textContent = '⎋';
  btn.title = 'Đăng xuất';
  btn.style = `
    position:fixed;top:10px;right:10px;width:32px;height:32px;
    border-radius:50%;background:#f55;color:#fff;border:none;
    cursor:pointer;box-shadow:0 1px 5px rgba(0,0,0,0.3);z-index:9999;
  `;
  btn.onclick = () => logout();
  document.body.appendChild(btn);
}
function hideLogoutButton() {
  const btn = document.getElementById('logout-btn');
  if (btn) btn.remove();
}

// Đăng xuất
function logout() {
  deleteCookie('token');
  deleteCookie('user_id');
  localStorage.removeItem('auth');
  hideStatus();
  hideLogoutButton();
  showLoginForm();
}

// Hiển thị form đăng nhập
function showLoginForm() {
  if (document.getElementById('login-form')) return;

  const form = document.createElement('div');
  form.id = 'login-form';
  form.style = `
    position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);
    background:#fff;padding:20px;border:1px solid #ccc;border-radius:10px;
    box-shadow:0 2px 10px rgba(0,0,0,0.2);z-index:10000;width:300px;
    font-family:sans-serif;
  `;

  form.innerHTML = `
    <h2 style="margin:0 0 10px;">Đăng nhập</h2>
    <input type="text" id="login-id" placeholder="Email" autocomplete="username"
      style="width:100%;padding:8px;margin-bottom:10px;" />
    <input type="password" id="login-password" placeholder="Mật khẩu" autocomplete="current-password"
      style="width:100%;padding:8px;margin-bottom:10px;" />
    <button id="login-submit" style="width:100%;padding:10px;background:#28a745;
      color:#fff;border:none;border-radius:5px;cursor:pointer;">Đăng nhập</button>
    <p id="login-message" style="color:red;min-height:18px;margin-top:10px;"></p>
    <p style="margin-top:10px;">Chưa có tài khoản? <span id="show-register" style="color:#007bff;cursor:pointer;text-decoration:underline;">Đăng ký</span></p>
  `;

  document.body.appendChild(form);

  form.querySelector('#login-submit').onclick = login;
  form.querySelector('#show-register').onclick = () => {
    hideLoginForm();
    showRegisterForm();
  };
}
function hideLoginForm() {
  const form = document.getElementById('login-form');
  if (form) form.remove();
}

// Hiển thị form đăng ký
function showRegisterForm() {
  if (document.getElementById('register-form')) return;

  const form = document.createElement('div');
  form.id = 'register-form';
  form.style = `
    position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);
    background:#fff;padding:20px;border:1px solid #ccc;border-radius:10px;
    box-shadow:0 2px 10px rgba(0,0,0,0.2);z-index:10000;width:300px;
    font-family:sans-serif;
  `;

  form.innerHTML = `
    <h2 style="margin:0 0 10px;">Đăng ký</h2>
    <input type="text" id="register-id" placeholder="Email" autocomplete="username"
      style="width:100%;padding:8px;margin-bottom:10px;" />
    <button id="request-otp" style="width:100%;padding:10px;background:#007bff;color:#fff;border:none;border-radius:5px;cursor:pointer;">Gửi mã OTP</button>
    <input type="text" id="register-otp" placeholder="Nhập mã OTP" style="width:100%;padding:8px;margin:10px 0;" />
    <input type="password" id="register-password" placeholder="Mật khẩu"
      style="width:100%;padding:8px;margin-bottom:10px;" />
    <input type="password" id="register-password-confirm" placeholder="Nhập lại mật khẩu"
      style="width:100%;padding:8px;margin-bottom:10px;" />
    <button id="register-submit" style="width:100%;padding:10px;background:#007bff;
      color:#fff;border:none;border-radius:5px;cursor:pointer;">Đăng ký</button>
    <p id="register-message" style="color:red;min-height:18px;margin-top:10px;"></p>
    <p style="margin-top:10px;">Đã có tài khoản? <span id="show-login" style="color:#007bff;cursor:pointer;text-decoration:underline;">Đăng nhập</span></p>
  `;

  document.body.appendChild(form);

  form.querySelector('#request-otp').onclick = requestOTP;
  form.querySelector('#register-submit').onclick = register;
  form.querySelector('#show-login').onclick = () => {
    hideRegisterForm();
    showLoginForm();
  };
}
function hideRegisterForm() {
  const form = document.getElementById('register-form');
  if (form) form.remove();
}

// Gửi yêu cầu OTP
async function requestOTP() {
  const email = document.getElementById('register-id').value.trim();
  const messageEl = document.getElementById('register-message');
  if (!email || !email.includes('@')) {
    messageEl.textContent = 'Vui lòng nhập email hợp lệ.';
    return;
  }
  messageEl.style.color = 'black';
  messageEl.textContent = 'Đang gửi mã OTP...';
  try {
    const res = await fetch(AUTH_FILE_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'request_otp', email }),
    });
    const result = await res.json();
    if (result.success) {
      messageEl.style.color = 'green';
      messageEl.textContent = 'Mã OTP đã được gửi đến email của bạn.';
    } else {
      messageEl.style.color = 'red';
      messageEl.textContent = result.message || 'Gửi mã OTP thất bại.';
    }
  } catch (e) {
    console.error(e);
    messageEl.style.color = 'red';
    messageEl.textContent = 'Lỗi kết nối, vui lòng thử lại.';
  }
}

// Xử lý đăng ký với OTP
async function register() {
  const email = document.getElementById('register-id').value.trim();
  const otp = document.getElementById('register-otp').value.trim();
  const password = document.getElementById('register-password').value.trim();
  const passwordConfirm = document.getElementById('register-password-confirm').value.trim();
  const messageEl = document.getElementById('register-message');

  if (!email || !otp || !password || !passwordConfirm) {
    messageEl.textContent = 'Vui lòng nhập đủ thông tin.';
    return;
  }
  if (password !== passwordConfirm) {
    messageEl.textContent = 'Mật khẩu nhập lại không khớp.';
    return;
  }

  messageEl.style.color = 'black';
  messageEl.textContent = 'Đang xác thực...';

  try {
    const res = await fetch(AUTH_FILE_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'verify_otp', email, otp, password }),
    });
    const result = await res.json();
    if (result.success) {
      messageEl.style.color = 'green';
      messageEl.textContent = 'Đăng ký thành công! Bạn có thể đăng nhập ngay.';
      setTimeout(() => {
        hideRegisterForm();
        showLoginForm();
      }, 2000);
    } else {
      messageEl.style.color = 'red';
      messageEl.textContent = result.message || 'Đăng ký thất bại.';
    }
  } catch (e) {
    console.error(e);
    messageEl.style.color = 'red';
    messageEl.textContent = 'Lỗi kết nối, vui lòng thử lại.';
  }
}

// Đăng nhập
async function login() {
  const email = document.getElementById('login-id').value.trim();
  const password = document.getElementById('login-password').value.trim();
  const messageEl = document.getElementById('login-message');

  if (!email || !password) {
    messageEl.textContent = 'Vui lòng nhập email và mật khẩu.';
    return;
  }

  messageEl.style.color = 'black';
  messageEl.textContent = 'Đang đăng nhập...';

  try {
    const res = await fetch(AUTH_FILE_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'login', email, password }),
    });
    const result = await res.json();
    if (result.success) {
      messageEl.style.color = 'green';
      messageEl.textContent = 'Đăng nhập thành công.';
      // Lưu token & user id cookie + localStorage
      setCookie('token', result.token, 7);
      setCookie('user_id', result.email, 7);
      localStorage.setItem('auth', JSON.stringify({ id: result.email, token: result.token, role: result.role }));
      hideLoginForm();
      showStatus(result.email, result.role);
      showLogoutButton();
      // Có thể gọi hàm load dữ liệu user hoặc redirect
    } else {
      messageEl.style.color = 'red';
      messageEl.textContent = result.message || 'Đăng nhập thất bại.';
    }
  } catch (e) {
    console.error(e);
    messageEl.style.color = 'red';
    messageEl.textContent = 'Lỗi kết nối, vui lòng thử lại.';
  }
}

// Kiểm tra trạng thái đăng nhập khi load trang
async function checkAuth() {
  const auth = localStorage.getItem('auth');
  if (!auth) {
    showLoginForm();
    return;
  }
  try {
    const { id, token } = JSON.parse(auth);
    if (!id || !token) {
      showLoginForm();
      return;
    }
    const res = await fetch(AUTH_FILE_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'check_token', email: id, token }),
    });
    const result = await res.json();
    if (result.valid) {
      showStatus(id, result.role || 'user');
      showLogoutButton();
      hideLoginForm();
    } else {
      logout();
      showLoginForm();
    }
  } catch (e) {
    console.error(e);
    showLoginForm();
  }
}

// Tự động chạy kiểm tra đăng nhập khi script load
checkAuth();
