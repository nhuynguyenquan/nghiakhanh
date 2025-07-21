// Hàm đọc cookie
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

// Hàm ghi cookie
function setCookie(name, value, days = 1) {
  const d = new Date();
  d.setTime(d.getTime() + days * 86400000);
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${d.toUTCString()}`;
}

// Hàm xóa cookie
function deleteCookie(name) {
  document.cookie = `${name}=; Max-Age=0; path=/`;
}

// Gửi yêu cầu xác thực
function checkLogin(callback) {
  const token = getCookie("token");
  const id = getCookie("id");

  if (!token || !id) {
    showLoginForm();
    return;
  }

  fetch("https://script.google.com/macros/s/AKfycbxxx/exec", {
    method: "POST",
    body: JSON.stringify({ action: "check", id, token }),
    headers: { "Content-Type": "application/json" },
  })
    .then(res => res.json())
    .then(data => {
      if (data.valid) {
        renderLoginStatus(data);
        callback && callback(data);
      } else {
        showLoginForm();
      }
    })
    .catch(() => showLoginForm());
}

// Hiển thị form đăng nhập nếu chưa đăng nhập
function showLoginForm() {
  const html = `
    <div id="loginOverlay" style="position:fixed;top:0;left:0;right:0;bottom:0;z-index:999;background:#fff;display:flex;align-items:center;justify-content:center;flex-direction:column">
      <h2>Đăng nhập</h2>
      <input id="login_id" placeholder="ID" />
      <input id="login_pw" type="password" placeholder="Password" />
      <button onclick="submitLogin()">Đăng nhập</button>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", html);
}

function submitLogin() {
  const id = document.getElementById("login_id").value.trim();
  const password = document.getElementById("login_pw").value.trim();

  fetch("https://script.google.com/macros/s/AKfycbxxx/exec", {
    method: "POST",
    body: JSON.stringify({ action: "login", id, password }),
    headers: { "Content-Type": "application/json" },
  })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        setCookie("token", data.token);
        setCookie("id", data.id);
        document.getElementById("loginOverlay")?.remove();
        renderLoginStatus(data);
        location.reload(); // Reload để áp dụng role nếu cần
      } else {
        alert("Sai ID hoặc mật khẩu");
      }
    });
}

// Render nút đăng xuất & thông tin user
function renderLoginStatus(user) {
  // Góc trái trạng thái
  const status = document.createElement("div");
  status.style.position = "fixed";
  status.style.top = "10px";
  status.style.left = "10px";
  status.style.background = "#eee";
  status.style.padding = "5px 10px";
  status.style.borderRadius = "5px";
  status.style.zIndex = "1000";
  status.innerText = `👋 Xin chào ${user.id} (${user.role})`;
  document.body.appendChild(status);

  // Góc phải nút logout
  const logoutBtn = document.createElement("button");
  logoutBtn.innerText = "Đăng xuất";
  logoutBtn.style.position = "fixed";
  logoutBtn.style.top = "10px";
  logoutBtn.style.right = "10px";
  logoutBtn.style.padding = "5px 10px";
  logoutBtn.style.zIndex = "1000";
  logoutBtn.onclick = () => {
    deleteCookie("token");
    deleteCookie("id");
    location.reload();
  };
  document.body.appendChild(logoutBtn);

  // Ẩn/hiện menu theo role
  document.querySelectorAll("[data-role]").forEach(el => {
    el.style.display = (el.dataset.role === user.role || user.role === "admin") ? "" : "none";
  });
}

checkLogin((user) => {
    document.getElementById("status").innerText = `Xin chào ${user.id} (${user.role})`;
  });