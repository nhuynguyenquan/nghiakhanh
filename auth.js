const API_URL = 'https://script.google.com/macros/s/AKfycbwbb8TxqMBPIVLB_izyJcmImZiMtyoErCYA7mi02Ln633RfWsU8oLSNEAHvLycIHP9UcA/exec';

// Lấy cookie
function getCookie(name) {
  return document.cookie.split('; ').find(row => row.startsWith(name + '='))?.split('=')[1];
}

// Xóa cookie
function deleteCookie(name) {
  document.cookie = name + "=; max-age=0; path=/";
}

// Đăng xuất và chuyển hướng
function logout() {
  deleteCookie("token");
  deleteCookie("user_id");
  window.location.href = "index.html";
}

// Kiểm tra đăng nhập và trả về thông tin qua callback
function checkLogin(callback) {
  const token = getCookie("token");
  const id = getCookie("user_id");

  if (!token || !id) {
    showLoginForm(); // Nếu chưa có cookie, hiện form login
    return;
  }

  fetch(`${API_URL}?action=check_token&id=${id}&token=${token}`)
    .then(res => res.json())
    .then(result => {
      if (result.valid) {
        showLogoutButton(id, result.role); // Hiện nút logout
        if (callback) callback({ id, ...result });
      } else {
        showLoginForm(); // Token sai thì hiện lại form login
      }
    })
    .catch(() => {
      showLoginForm();
    });
}

// Tạo nút đăng xuất ở góc phải trên
function showLogoutButton(userId, role) {
  const btn = document.createElement("button");
  btn.innerText = `Đăng xuất (${userId})`;
  btn.onclick = logout;
  btn.style.position = "fixed";
  btn.style.top = "10px";
  btn.style.right = "10px";
  btn.style.zIndex = "1000";
  btn.style.padding = "8px 12px";
  btn.style.backgroundColor = "#c33";
  btn.style.color = "white";
  btn.style.border = "none";
  btn.style.borderRadius = "5px";
  btn.style.cursor = "pointer";
  document.body.appendChild(btn);
}

// Hiện form đăng nhập (nếu cần)
function showLoginForm() {
  // Nếu form đã hiện rồi thì không tạo nữa
  if (document.getElementById("login-form")) return;

  const form = document.createElement("form");
  form.id = "login-form";  // ← THÊM DÒNG NÀY
  form.innerHTML = `
    <div style="position: fixed; top: 30%; left: 50%; transform: translate(-50%, -50%);
                background: white; padding: 20px; border: 1px solid #ccc; border-radius: 10px;">
      <h3>Đăng nhập</h3>
      <input type="text" id="user_id" placeholder="User ID" required style="margin-bottom: 10px; width: 100%; padding: 6px;"><br>
      <input type="password" id="password" placeholder="Mật khẩu" required style="margin-bottom: 10px; width: 100%; padding: 6px;"><br>
      <button type="submit">Đăng nhập</button>
    </div>
  `;

  form.onsubmit = async (e) => {
    e.preventDefault();
    const id = form.querySelector("#user_id").value;
    const pass = form.querySelector("#password").value;

    const res = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ action: "login", id, password: pass }),
      headers: { "Content-Type": "application/json" },
    });
    const result = await res.json();

    if (result.success) {
      document.cookie = `token=${result.token}; path=/`;
      document.cookie = `user_id=${id}; path=/`;

      // Ẩn form ngay khi đăng nhập thành công
      form.remove();

      // Reload trang hoặc gọi checkLogin lại để cập nhật UI
      checkLogin();
    } else {
      alert("Sai tài khoản hoặc mật khẩu!");
    }
  };

  document.body.appendChild(form);
}
function checkLogin(callback) {
  const token = getCookie("token");
  const id = getCookie("user_id");

  if (!token || !id) {
    showLoginForm();
    return;
  }

  fetch(`${API_URL}?action=check_token&id=${id}&token=${token}`)
    .then(res => res.json())
    .then(result => {
      if (result.valid) {
        // Ẩn form đăng nhập nếu nó tồn tại
        const loginForm = document.getElementById("login-form");
        if (loginForm) loginForm.remove();

        showLogoutButton(id, result.role);
        if (callback) callback({ id, ...result });
      } else {
        showLoginForm();
      }
    })
    .catch(() => {
      showLoginForm();
    });
}