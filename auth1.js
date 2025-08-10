const AUTH_FILE_URL = 'https://script.google.com/macros/s/AKfycbzPptR4KdWY7u1KcYTo3EF8dcVl9AMFgDcN7KuIxntjYsv9EnflE4ULF2mtkZ7gk1aD/exec';

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
  btn.onclick = () => {
    logout();
  };
  document.body.appendChild(btn);
}
function hideLogoutButton() {
  const btn = document.getElementById('logout-btn');
  if (btn) btn.remove();
}

// Đăng xuất (xóa cookie + localStorage, ẩn UI)
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
    <input type="text" id="login-id" placeholder="Tên đăng nhập hoặc Email" autocomplete="username"
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
    <input type="text" id="register-id" placeholder="Tên đăng nhập hoặc Email" autocomplete="username"
      style="width:100%;padding:8px;margin-bottom:10px;" />
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

// Xử lý đăng nhập
async function login() {
  const id = document.getElementById('login-id')?.value.trim();
  const password = document.getElementById('login-password')?.value.trim();
  const messageEl = document.getElementById('login-message');
  if (!id || !password) {
    messageEl.textContent = 'Vui lòng nhập tên đăng nhập/email và mật khẩu.';
    return;
  }
  messageEl.style.color = 'black';
  messageEl.textContent = 'Đang kiểm tra...';

  try {
    const res = await fetch(AUTH_FILE_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'login', id, password }),
    });
    const result = await res.json();

    if (result.success) {
      setCookie('token', result.token);
      setCookie('user_id', result.id);

      localStorage.setItem('auth', JSON.stringify({
        id: result.id,
        token: result.token,
        role: result.role,
        timestamp: Date.now(),
      }));

      messageEl.style.color = 'green';
      messageEl.textContent = 'Đăng nhập thành công!';
      hideLoginForm();
      showStatus(result.id, result.role);
      showLogoutButton();
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

// Xử lý đăng ký
async function register() {
  const id = document.getElementById('register-id')?.value.trim();
  const password = document.getElementById('register-password')?.value.trim();
  const passwordConfirm = document.getElementById('register-password-confirm')?.value.trim();
  const messageEl = document.getElementById('register-message');

  if (!id || !password || !passwordConfirm) {
    messageEl.textContent = 'Vui lòng nhập đủ thông tin.';
    return;
  }
  if (password !== passwordConfirm) {
    messageEl.textContent = 'Mật khẩu nhập lại không khớp.';
    return;
  }

  messageEl.style.color = 'black';
  messageEl.textContent = 'Đang gửi yêu cầu đăng ký...';

  try {
    const res = await fetch(AUTH_FILE_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'register', id, password }),
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

// Kiểm tra phiên đăng nhập khi load trang
async function checkLogin() {
  const saved = localStorage.getItem('auth');
  if (saved) {
    const { id, token, role, timestamp } = JSON.parse(saved);
    const maxAge = 90 * 24 * 60 * 60 * 1000; // 90 ngày
    if (Date.now() - timestamp < maxAge) {
      hideLoginForm();
      showStatus(id, role);
      showLogoutButton();
      return;
    } else {
      localStorage.removeItem('auth');
    }
  }

  const token = getCookie('token');
  const userId = getCookie('user_id');
  if (!token || !userId) {
    hideStatus();
    hideLogoutButton();
    showLoginForm();
    return;
  }

  try {
    const res = await fetch(`${AUTH_FILE_URL}?action=check_token&id=${encodeURIComponent(userId)}&token=${encodeURIComponent(token)}`);
    const result = await res.json();
    if (result.valid) {
      hideLoginForm();
      showStatus(userId, result.role);
      showLogoutButton();

      localStorage.setItem('auth', JSON.stringify({
        id: userId,
        token,
        role: result.role,
        timestamp: Date.now(),
      }));
    } else {
      logout();
    }
  } catch (e) {
    console.error(e);
    showLoginForm();
  }
}

document.addEventListener('DOMContentLoaded', checkLogin);
