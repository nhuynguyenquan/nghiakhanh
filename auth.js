const AUTH_FILE_URL = 'https://script.google.com/macros/s/AKfycbwbb8TxqMBPIVLB_izyJcmImZiMtyoErCYA7mi02Ln633RfWsU8oLSNEAHvLycIHP9UcA/exec';

// Hàm khởi tạo check login khi load
document.addEventListener("DOMContentLoaded", () => {
  checkLogin();
});

// Gửi token và lấy thông tin user
function checkLogin(callback) {
  const token = localStorage.getItem("token") || "";
  fetch(`${AUTH_FILE_URL}?action=verify&token=${token}`)
    .then(res => res.json())
    .then(result => {
      if (result.valid) {
        showStatus(result.id, result.role);
        showLogoutButton();
        hideLoginForm();
        if (callback) callback({ id: result.id, role: result.role });
      } else {
        showLoginForm(callback);
      }
    })
    .catch(() => {
      showLoginForm(callback);
    });
}

// Tạo form đăng nhập động
function showLoginForm(callback) {
  if (document.getElementById("login-form")) return;

  const form = document.createElement("div");
  form.id = "login-form";
  form.innerHTML = `
    <style>
      #login-form {
        position: fixed;
        top: 10px;
        right: 10px;
        background: #fff;
        padding: 10px;
        border: 1px solid #ccc;
        z-index: 9999;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        font-family: sans-serif;
        border-radius: 8px;
        width: 220px;
      }
      #login-form h2 {
        margin-top: 0;
        font-size: 18px;
      }
      #login-form input {
        margin: 5px 0;
        padding: 6px;
        width: 100%;
        box-sizing: border-box;
        display: block;
      }
      #login-form button {
        padding: 6px 10px;
        background: #2b7;
        color: #fff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        width: 100%;
        margin-top: 6px;
      }
      #login-form button:hover {
        background: #1a6;
      }
    </style>
    <h2>Đăng nhập</h2>
    <input type="text" id="id" placeholder="Tên đăng nhập" autocomplete="username" required />
    <input type="password" id="password" placeholder="Mật khẩu" autocomplete="current-password" required />
    <button onclick="login()">Đăng nhập</button>
  `;
  document.body.appendChild(form);
}

// Ẩn form nếu đã đăng nhập
function hideLoginForm() {
  const form = document.getElementById("login-form");
  if (form) form.remove();
}

function setCookie(name, value, days = 7) {
  const expires = new Date(Date.now() + days*864e5).toUTCString();
  document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}

async function login() {
  const id = document.getElementById('id').value.trim();
  const password = document.getElementById('password').value.trim();
  const messageEl = document.getElementById('message');

  if (!id || !password) {
    messageEl.innerText = 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu';
    return;
  }

  messageEl.innerText = 'Đang đăng nhập...';

  try {
    const payload = { action: 'login', id, password };
    const res = await fetch(AUTH_FILE_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    });
    const result = await res.json();

    if (result.success) {
      setCookie('token', result.token);
      setCookie('user_id', id);
      window.location.href = 'dashboard.html';
    } else {
      messageEl.innerText = result.message || 'Đăng nhập thất bại';
    }
  } catch (error) {
    messageEl.innerText = 'Lỗi kết nối. Vui lòng thử lại.';
    console.error(error);
  }
}
// Hiển thị trạng thái người dùng
function showStatus(id, role) {
  let statusEl = document.getElementById("status-info");
  if (!statusEl) {
    statusEl = document.createElement("div");
    statusEl.id = "status-info";
    statusEl.style.position = "fixed";
    statusEl.style.top = "10px";
    statusEl.style.left = "10px";
    statusEl.style.background = "#eee";
    statusEl.style.padding = "6px 10px";
    statusEl.style.borderRadius = "8px";
    statusEl.style.boxShadow = "0 1px 5px rgba(0,0,0,0.2)";
    statusEl.style.zIndex = "9999";
    document.body.appendChild(statusEl);
  }
  statusEl.innerText = `Xin chào ${id} (${role})`;
}

// Tạo nút đăng xuất
function showLogoutButton() {
  let btn = document.getElementById("logout-btn");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "logout-btn";
    btn.innerText = "⎋";
    btn.title = "Đăng xuất";
    btn.style.position = "fixed";
    btn.style.top = "10px";
    btn.style.right = "10px";
    btn.style.background = "#f55";
    btn.style.color = "#fff";
    btn.style.border = "none";
    btn.style.borderRadius = "50%";
    btn.style.width = "32px";
    btn.style.height = "32px";
    btn.style.cursor = "pointer";
    btn.style.boxShadow = "0 1px 5px rgba(0,0,0,0.3)";
    btn.style.zIndex = "9999";
    btn.onclick = () => {
      localStorage.removeItem("token");
      location.reload();
    };
    document.body.appendChild(btn);
  }
}