const SERVER_URL = 'https://script.google.com/macros/s/AKfycbwbb8TxqMBPIVLB_izyJcmImZiMtyoErCYA7mi02Ln633RfWsU8oLSNEAHvLycIHP9UcA/exec';
const TOKEN_NAME = 'auth_token';

// Hiển thị trạng thái và nút đăng xuất ở góc trái
function showStatus(user) {
  let statusDiv = document.getElementById('auth-status');
  if (!statusDiv) {
    statusDiv = document.createElement('div');
    statusDiv.id = 'auth-status';
    statusDiv.style.position = 'fixed';
    statusDiv.style.top = '10px';
    statusDiv.style.left = '10px';
    statusDiv.style.zIndex = 9999;
    document.body.appendChild(statusDiv);
  }

  statusDiv.innerHTML = `
    <span>Xin chào <b>${user.id}</b> (${user.role})</span>
    <button id="logout-btn" style="margin-left:10px;">Đăng xuất</button>
  `;
  document.getElementById("logout-btn").onclick = () => logout();
}

// Hiển thị form đăng nhập nếu chưa đăng nhập
function showLoginForm() {
  if (document.getElementById("login-form")) return;
  const form = document.createElement('form');
  form.id = "login-form";
  form.innerHTML = `
    <div style="position:fixed;top:30%;left:50%;transform:translate(-50%,-50%);background:#fff;padding:20px;box-shadow:0 0 10px #ccc;z-index:9999">
      <h3>Đăng nhập</h3>
      <input id="user" placeholder="Tài khoản" required style="margin-bottom:10px;width:100%"><br>
      <input id="pass" type="password" placeholder="Mật khẩu" required style="margin-bottom:10px;width:100%"><br>
      <button type="submit" style="width:100%">Đăng nhập</button>
    </div>
  `;
  form.onsubmit = async (e) => {
    e.preventDefault();
    const username = document.getElementById("user").value;
    const password = document.getElementById("pass").value;
    try {
      const res = await fetch(SERVER_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'login', user: username, pass: password }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem(TOKEN_NAME, data.token);
        form.remove();
        checkLogin(onLoginSuccess);
      } else {
        alert(data.error || "Đăng nhập thất bại");
      }
    } catch (err) {
      alert("Lỗi kết nối");
    }
  };
  document.body.appendChild(form);
}

// Đăng xuất và reload lại
function logout() {
  localStorage.removeItem(TOKEN_NAME);
  location.reload();
}

// Kiểm tra đăng nhập và gọi callback nếu hợp lệ
function checkLogin(callback) {
  const token = localStorage.getItem(TOKEN_NAME);
  if (!token) {
    showLoginForm();
    return;
  }

  fetch(`${SERVER_URL}?action=verify&token=${token}`)
    .then(r => r.json())
    .then(data => {
      if (data.valid) {
        showStatus(data);
        document.querySelectorAll("[class^='role-']").forEach(el => {
          if (!el.classList.contains(`role-${data.role}`)) el.style.display = 'none';
        });
        callback && callback(data);
      } else {
        localStorage.removeItem(TOKEN_NAME);
        showLoginForm();
      }
    })
    .catch(() => {
      localStorage.removeItem(TOKEN_NAME);
      showLoginForm();
    });
}

// Có thể gọi ở bất kỳ trang nào:
function onLoginSuccess(user) {
  console.log("Đăng nhập thành công:", user);
  // Tuỳ ý xử lý thêm sau khi đăng nhập
}

window.addEventListener("DOMContentLoaded", () => checkLogin(onLoginSuccess));
