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
      }
      #login-form input {
        margin: 5px 0;
        padding: 6px;
        width: 160px;
        display: block;
      }
      #login-form button {
        padding: 6px 10px;
        background: #2b7;
        color: #fff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      #login-form button:hover {
        background: #1a6;
      }
    </style>
    <input type="text" id="username" placeholder="Tài khoản" autocomplete="username" />
    <input type="password" id="password" placeholder="Mật khẩu" autocomplete="current-password" />
    <button onclick="handleLogin()">Đăng nhập</button>
  `;
  document.body.appendChild(form);
}

// Ẩn form nếu đã đăng nhập
function hideLoginForm() {
  const form = document.getElementById("login-form");
  if (form) form.remove();
}

// Gửi yêu cầu đăng nhập
function handleLogin() {
  const id = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();

  fetch(AUTH_FILE_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "login",
      id,
      pass
    })
  })
    .then(res => res.json())
    .then(result => {
      if (result.valid) {
        localStorage.setItem("token", result.token);
        hideLoginForm();
        showStatus(id, result.role);
        showLogoutButton();
        if (typeof checkLoginCallback === "function") checkLoginCallback({ id, role: result.role });
      } else {
        alert("Sai tài khoản hoặc mật khẩu");
      }
    })
    .catch(() => alert("Lỗi đăng nhập"));
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