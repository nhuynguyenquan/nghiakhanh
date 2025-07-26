const AUTH_FILE_URL = 'https://script.google.com/macros/s/AKfycbxfMK0ZlElfaHal3xL_6pV-_E4MD-GdAaOUTn-6MQD5fmessV-WpT5EP_tB_3HEHIyF-A/exec';

// Cookie Helpers
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

// Trạng thái đăng nhập
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
  setTimeout(() => el.remove(), 10000); // Tự ẩn sau 10s
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
    localStorage.removeItem('auth');
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

// Form đăng nhập
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
function hideLoginForm() {
  const form = document.getElementById('login-form');
  if (form) form.remove();
}

// Xử lý đăng nhập
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
      body: JSON.stringify({ action: 'login', id, password }),
    });
    const result = await res.json();

    if (result.success) {
      // Lưu cookie
      setCookie('token', result.token);
      setCookie('user_id', result.id);

      // Lưu vào localStorage
      localStorage.setItem('auth', JSON.stringify({
        id: result.id,
        token: result.token,
        role: result.role,
        timestamp: Date.now()
      }));

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
 function requireRole(allowedRoles) {
    const auth = JSON.parse(localStorage.getItem('auth') || '{}');
    const role = auth?.role;

    if (!allowedRoles.includes(role)) {
      document.body.innerHTML = `
        <div style="font-family:sans-serif;padding:40px;text-align:center;color:#b00">
          <h1>🚫 Không có quyền truy cập</h1>
          <p>Trang này chỉ dành cho: <strong>${allowedRoles.join(', ')}</strong></p>
          <p>Liên hệ quản trị viên nếu bạn cần cấp quyền.</p>
        </div>
      `;
    }
  }
// Kiểm tra khi tải trang
async function checkLogin() {
  const saved = localStorage.getItem('auth');
  if (saved) {
    const { id, token, role, timestamp } = JSON.parse(saved);
    const maxAge = 90 * 24 * 60 * 60 * 1000; 
    if (Date.now() - timestamp < maxAge) {
      // Dữ liệu vẫn còn hiệu lực
      hideLoginForm();
      showStatus(id, role);
      showLogoutButton();
      return;
    } else {
      // Hết hạn
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
    const res = await fetch(`${AUTH_FILE_URL}?action=check_token&id=${userId}&token=${encodeURIComponent(token)}`);
    const result = await res.json();
    if (result.valid) {
      hideLoginForm();
      showStatus(userId, result.role);
      showLogoutButton();

      // Lưu vào localStorage
      localStorage.setItem('auth', JSON.stringify({
        id: userId,
        token,
        role: result.role,
        timestamp: Date.now()
      }));
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

document.addEventListener('DOMContentLoaded', checkLogin);
