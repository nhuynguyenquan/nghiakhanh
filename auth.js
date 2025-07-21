// ✅ CẤU HÌNH
const API_URL = 'https://script.google.com/macros/s/AKfycbwbb8TxqMBPIVLB_izyJcmImZiMtyoErCYA7mi02Ln633RfWsU8oLSNEAHvLycIHP9UcA/exec';

// ✅ TẠO FORM ĐĂNG NHẬP
function createLoginForm() {
  const formHTML = `
    <div id="login-wrapper" style="position:fixed;top:0;left:0;width:100%;height:100%;background:#fff;display:flex;align-items:center;justify-content:center;z-index:9999;">
      <div style="max-width:300px;width:100%;padding:20px;border:1px solid #ccc;border-radius:10px;text-align:center;font-family:sans-serif;">
        <h2>Đăng nhập</h2>
        <input type="text" id="id" placeholder="Tên đăng nhập" required style="width:100%;margin:5px 0;padding:10px;" />
        <input type="password" id="password" placeholder="Mật khẩu" required style="width:100%;margin:5px 0;padding:10px;" autocomplete="current-password" />
        <button onclick="login()" style="width:100%;padding:10px;margin-top:10px;">Đăng nhập</button>
        <p id="message" style="color:red;margin-top:10px;"></p>
      </div>
    </div>
  `;
  const div = document.createElement('div');
  div.innerHTML = formHTML;
  document.body.appendChild(div);
}

// ✅ XỬ LÝ COOKIE
function setCookie(name, value, days = 7) {
  const d = new Date();
  d.setTime(d.getTime() + days * 86400000);
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}
function getCookie(name) {
  return document.cookie.split('; ').find(row => row.startsWith(name + '='))?.split('=')[1];
}
function deleteCookie(name) {
  document.cookie = name + '=; Max-Age=0; path=/';
}

// ✅ KIỂM TRA ĐĂNG NHẬP
async function checkLogin() {
  const token = getCookie('token');
  const id = getCookie('user_id');
  if (!token || !id) {
    createLoginForm();
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'check_token', token, id }),
    });
    const result = await res.json();
    if (!result.success) {
      deleteCookie('token');
      deleteCookie('user_id');
      createLoginForm();
    }
  } catch (err) {
    console.error('Kết nối lỗi:', err);
    createLoginForm();
  }
}

// ✅ ĐĂNG NHẬP
async function login() {
  const id = document.getElementById('id').value.trim();
  const password = document.getElementById('password').value.trim();
  if (!id || !password) return;

  const payload = { action: 'login', id, password };
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (result.success) {
      setCookie('token', result.token);
      setCookie('user_id', result.id);
      document.getElementById('login-wrapper').remove();
      if (window.location.pathname.includes('login') || window.location.pathname === '/' || window.location.pathname === '/index.html') {
        window.location.href = 'dashboard.html';
      } else {
        location.reload();
      }
    } else {
      document.getElementById('message').innerText = result.message || 'Đăng nhập thất bại.';
    }
  } catch (err) {
    document.getElementById('message').innerText = 'Lỗi kết nối máy chủ.';
  }
}

// ✅ CHẠY KHI TẢI TRANG
document.addEventListener('DOMContentLoaded', checkLogin);
