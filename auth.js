const AUTH_FILE_URL = 'https://script.google.com/macros/s/AKfycbwbb8TxqMBPIVLB_izyJcmImZiMtyoErCYA7mi02Ln633RfWsU8oLSNEAHvLycIHP9UcA/exec';

// Cookie Helpers
function getCookie(name) {
  const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
  return v ? decodeURIComponent(v[2]) : '';
}
function setCookie(name, value, days = 7) {
  const expires = new Date(Date.now() + days*864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}
function deleteCookie(name) {
  document.cookie = `${name}=; max-age=0; path=/`;
}

// Hiển thị trạng thái user
function showStatus(id, role) {
  let el = document.getElementById('status-info');
  if (!el) {
    el = document.createElement('div');
    el.id = 'status-info';
    el.style = `position:fixed;top:10px;left:10px;background:#eee;padding:6px 12px;
                border-radius:8px;box-shadow:0 1px 5px rgba(0,0,0,0.2);
                font-family:sans-serif;z-index:9999`;
    document.body.appendChild(el);
  }
  el.textContent = `Xin chào ${id} (${role})`;
}
function hideStatus() {
  const el = document.getElementById('status-info');
  if (el) el.remove();
}

// Nút đăng xuất
function showLogoutButton() {
  if (document.getElementById('logout-btn')) return;
  const btn = document.createElement('button');
  btn.id = 'logout-btn';
  btn.textContent = '⎋';
  btn.title = 'Đăng xuất';
  btn.style = `position:fixed;top:10px;right:10px;width:32px;height:32px;
               border-radius:50%;background:#f55;color:#fff;border:none;
               cursor:pointer;box-shadow:0 1px 5px rgba(0,0,0,0.3);z-index:9999`;
  btn.onclick = () => {
    deleteCookie('token');
    deleteCookie('user_id');
    hideStatus();
    hideLogoutButton();
    showLoginForm();
  };
  document.body.appendChild(btn);
}
function hideLogoutButton() {
  const btn = document.getElementById('logout-btn');
  if (btn) btn.remove();
}

// Tạo form đăng nhập
function showLoginForm() {
  if (document.getElementById('login-form')) return;

  const form = document.createElement('div');
  form.id = 'login-form';
  form.style = `position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);
                background:#fff;padding:20px;border:1px solid #ccc;border-radius:10px;
                box-shadow:0 2px 10px rgba(0,0,0,0.2);z-index:10000;width:300px;
                font-family:sans-serif`;

  form.innerHTML = `
    <h2 style="margin:0 0 10px;">Đăng nhập</h2>
    <input type="text" id="login-id" placeholder="Tên đăng nhập" autocomplete="username"
           style="width:100%;padding:8px;margin-bottom:10px;" />
    <input type="password" id="login-password" placeholder="Mật khẩu" autocomplete="current-password"
           style="width:100%;padding:8px;margin-bottom:10px;" />
    <button id="login-submit" style="width:100%;padding:10px;background:#28a745;
            color:#fff;border:none;border-radius:5px;cursor:pointer;">Đăng nhập</button>
    <p id="login-message" style="color:red;min-height:18px;margin-top:10px;"></p>
  `;

  document.body.appendChild(form);

  form.querySelector('#login-submit').onclick = login;
}

// Ẩn form đăng nhập
function hideLoginForm() {
  const form = document.getElementById('login-form');
  if (form) form.remove();
}

// Xử lý login
async function login() {
  const id = document.getElementById('login-id')?.value.trim();
  const password = document.getElementById('login-password')?.value.trim();
  const messageEl = document.getElementById('login-message');
  if (!id || !password) {
    messageEl.textContent = 'Vui lòng nhập tên và mật khẩu.';
    return;
  }
  messageEl.textContent = 'Đang kiểm tra...';

  try {
    const res = await fetch(AUTH_FILE_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'login', id, password })
    });
    const result = await res.json();

    if (result.success) {
      setCookie('token', result.token);
      setCookie('user_id', result.id);
      messageEl.style.color = 'green';
      messageEl.textContent = 'Đăng nhập thành công!';
      hideLoginForm();
      showStatus(result.id, result.role);
      showLogoutButton();
    } else {
      messageEl.style.color = 'red';
      messageEl.textContent = result.message || 'Đăng nhập thất bại';
    }
  } catch (e) {
    console.error(e);
    messageEl.textContent = 'Lỗi kết nối. Vui lòng thử lại.';
  }
}

// Kiểm tra khi load trang
async function checkLogin() {
  const token = getCookie('token');
  if (!token) {
    hideStatus();
    hideLogoutButton();
    showLoginForm();
    return;
  }
  try {
    const res = await fetch(`${AUTH_FILE_URL}?action=check_token&id=${getCookie('user_id')}&token=${encodeURIComponent(token)}`);
    const result = await res.json();

    if (result.valid) {
      hideLoginForm();
      showStatus(result.id, result.role);
      showLogoutButton();
    } else {
      deleteCookie('token');
      deleteCookie('user_id');
      showLoginForm();
    }
  } catch (e) {
    console.error(e);
    showLoginForm();
  }
}

// Khởi động
document.addEventListener('DOMContentLoaded', checkLogin);
