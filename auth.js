const AUTH_FILE_URL = 'https://script.google.com/macros/s/AKfycbwbb8TxqMBPIVLB_izyJcmImZiMtyoErCYA7mi02Ln633RfWsU8oLSNEAHvLycIHP9UcA/exec';

// Helper: lấy cookie theo tên
function getCookie(name) {
  const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
  return v ? decodeURIComponent(v[2]) : '';
}

// Helper: set cookie (mặc định 7 ngày)
function setCookie(name, value, days = 7) {
  const expires = new Date(Date.now() + days*864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

// Helper: xóa cookie
function deleteCookie(name) {
  document.cookie = name + '=; max-age=0; path=/';
}

// Hiển thị trạng thái user góc trái trên
function showStatus(id, role) {
  let el = document.getElementById('status-info');
  if (!el) {
    el = document.createElement('div');
    el.id = 'status-info';
    el.style.position = 'fixed';
    el.style.top = '10px';
    el.style.left = '10px';
    el.style.background = '#eee';
    el.style.padding = '6px 12px';
    el.style.borderRadius = '8px';
    el.style.boxShadow = '0 1px 5px rgba(0,0,0,0.2)';
    el.style.fontFamily = 'sans-serif';
    el.style.zIndex = '9999';
    document.body.appendChild(el);
  }
  el.textContent = `Xin chào ${id} (${role})`;
}

// Ẩn trạng thái user
function hideStatus() {
  const el = document.getElementById('status-info');
  if (el) el.remove();
}

// Tạo nút đăng xuất góc phải trên
function showLogoutButton() {
  if (document.getElementById('logout-btn')) return;
  const btn = document.createElement('button');
  btn.id = 'logout-btn';
  btn.textContent = '⎋'; // biểu tượng logout
  btn.title = 'Đăng xuất';
  btn.style.position = 'fixed';
  btn.style.top = '10px';
  btn.style.right = '10px';
  btn.style.width = '32px';
  btn.style.height = '32px';
  btn.style.borderRadius = '50%';
  btn.style.backgroundColor = '#f55';
  btn.style.color = '#fff';
  btn.style.border = 'none';
  btn.style.cursor = 'pointer';
  btn.style.boxShadow = '0 1px 5px rgba(0,0,0,0.3)';
  btn.style.zIndex = '9999';
  btn.onclick = () => {
    deleteCookie('token');
    deleteCookie('user_id');
    hideStatus();
    hideLogoutButton();
    showLoginForm();
  };
  document.body.appendChild(btn);
}

// Ẩn nút đăng xuất
function hideLogoutButton() {
  const btn = document.getElementById('logout-btn');
  if (btn) btn.remove();
}

// Tạo form đăng nhập động
function showLoginForm() {
  if (document.getElementById('login-form')) return;

  const form = document.createElement('div');
  form.id = 'login-form';
  form.style.position = 'fixed';
  form.style.top = '50%';
  form.style.left = '50%';
  form.style.transform = 'translate(-50%, -50%)';
  form.style.background = '#fff';
  form.style.padding = '20px';
  form.style.border = '1px solid #ccc';
  form.style.borderRadius = '10px';
  form.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
  form.style.zIndex = '10000';
  form.style.fontFamily = 'sans-serif';
  form.style.width = '300px';
  form.innerHTML = `
    <h2 style="margin-top:0;margin-bottom:10px;">Đăng nhập</h2>
    <input type="text" id="login-id" placeholder="Tên đăng nhập" autocomplete="username" style="width:100%;padding:8px;margin-bottom:10px;" />
    <input type="password" id="login-password" placeholder="Mật khẩu" autocomplete="current-password" style="width:100%;padding:8px;margin-bottom:10px;" />
    <button id="login-submit" style="width:100%;padding:10px;background:#28a745;color:#fff;border:none;border-radius:5px;cursor:pointer;">Đăng nhập</button>
    <p id="login-message" style="color:red;min-height:18px;margin-top:10px;"></p>
  `;

  document.body.appendChild(form);

  form.querySelector('#login-submit').onclick = async () => {
    const idInput = form.querySelector('#login-id');
    const passInput = form.querySelector('#login-password');
    const messageEl = form.querySelector('#login-message');

    const id = idInput.value.trim();
    const password = passInput.value.trim();

    if (!id || !password) {
      messageEl.textContent = 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu';
      return;
    }

    messageEl.textContent = 'Đang đăng nhập...';

    try {
      const res = await fetch(AUTH_FILE_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'login', id, password })
      });
      const result = await res.json();

      if (result.success) {
        setCookie('token', result.token);
        setCookie('user_id', id);
        messageEl.style.color = 'green';
        messageEl.textContent = 'Đăng nhập thành công!';

        hideLoginForm();
        showStatus(id, result.role);
        showLogoutButton();
      } else {
        messageEl.style.color = 'red';
        messageEl.textContent = result.message || 'Đăng nhập thất bại';
      }
    } catch (e) {
      messageEl.style.color = 'red';
      messageEl.textContent = 'Lỗi kết nối. Vui lòng thử lại.';
      console.error(e);
    }
  };
}

// Ẩn form đăng nhập
function hideLoginForm() {
  const form = document.getElementById('login-form');
  if (form) form.remove();
}

// Kiểm tra đăng nhập khi load trang
async function checkLogin() {
  const token = getCookie('token');
  if (!token) {
    hideStatus();
    hideLogoutButton();
    showLoginForm();
    return;
  }
  try {
    const res = await fetch(`${AUTH_FILE_URL}?action=verify&token=${encodeURIComponent(token)}`);
    const result = await res.json();

    if (result.valid) {
      hideLoginForm();
      showStatus(result.id, result.role);
      showLogoutButton();
    } else {
      deleteCookie('token');
      deleteCookie('user_id');
      hideStatus();
      hideLogoutButton();
      showLoginForm();
    }
  } catch(e) {
    console.error(e);
    hideStatus();
    hideLogoutButton();
    showLoginForm();
  }
}

// Tự động chạy khi load script
document.addEventListener('DOMContentLoaded', () => {
  checkLogin();
});
