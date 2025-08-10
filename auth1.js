const AUTH_FILE_URL = 'https://script.google.com/macros/s/AKfycbw-Z_Cq_sSIcMaJ-zTy4TM4X7zT-QZ3D0hI4oSldoqXCvOznRDfTpahwDIz3i1w6nhxcQ/exec';

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
  btn.onclick = () => logout();
  document.body.appendChild(btn);
}
function hideLogoutButton() {
  const btn = document.getElementById('logout-btn');
  if (btn) btn.remove();
}

// Hiển thị nút đổi mật khẩu
function showChangePasswordButton() {
  if (document.getElementById('change-password-btn')) return;
  const btn = document.createElement('button');
  btn.id = 'change-password-btn';
  btn.textContent = 'Đổi mật khẩu';
  btn.style = `
    position: fixed; bottom: 10px; right: 10px; padding: 8px 12px;
    border-radius: 5px; background: #007bff; color: white; border: none; cursor: pointer;
    z-index: 9999;
  `;
  btn.onclick = () => showChangePasswordForm();
  document.body.appendChild(btn);
}
function hideChangePasswordButton() {
  const btn = document.getElementById('change-password-btn');
  if (btn) btn.remove();
}

// Đăng xuất
function logout() {
  deleteCookie('token');
  deleteCookie('user_id'); // lưu id, không phải email
  localStorage.removeItem('auth');
  hideStatus();
  hideLogoutButton();
  hideChangePasswordButton();
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
    box-shadow:0 2px 10px rgba(0,0,0,0.2);z-index:10000;width:320px;
    font-family:sans-serif;
  `;

  form.innerHTML = `
    <h2 style="margin:0 0 10px;">Đăng ký</h2>
    <input type="text" id="register-id" placeholder="Tên đăng nhập (id)" autocomplete="username"
      style="width:100%;padding:8px;margin-bottom:10px;" />
    <input type="email" id="register-email" placeholder="Email" autocomplete="email"
      style="width:100%;padding:8px;margin-bottom:10px;" />
    <input type="password" id="register-password" placeholder="Mật khẩu"
      style="width:100%;padding:8px;margin-bottom:10px;" />
    <input type="password" id="register-password-confirm" placeholder="Nhập lại mật khẩu"
      style="width:100%;padding:8px;margin-bottom:10px;" />
    <button id="register-submit" style="width:100%;padding:10px;background:#007bff;
      color:#fff;border:none;border-radius:5px;cursor:pointer;">Gửi mã OTP</button>
    <p id="register-message" style="color:red;min-height:18px;margin-top:10px;"></p>
    <p style="margin-top:10px;">Đã có tài khoản? <span id="show-login" style="color:#007bff;cursor:pointer;text-decoration:underline;">Đăng nhập</span></p>
  `;

  document.body.appendChild(form);

  form.querySelector('#register-submit').onclick = sendOtpForRegister;
  form.querySelector('#show-login').onclick = () => {
    hideRegisterForm();
    showLoginForm();
  };
}
function hideRegisterForm() {
  const form = document.getElementById('register-form');
  if (form) form.remove();
}

// Form nhập OTP
function showRegisterOtpForm(id, email, password) {
  if (document.getElementById('register-otp-form')) return;

  const form = document.createElement('div');
  form.id = 'register-otp-form';
  form.style = `
    position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);
    background:#fff;padding:20px;border:1px solid #ccc;border-radius:10px;
    box-shadow:0 2px 10px rgba(0,0,0,0.2);z-index:10000;width:300px;
    font-family:sans-serif;
  `;

  form.innerHTML = `
    <h2 style="margin:0 0 10px;">Nhập mã OTP</h2>
    <p>Đã gửi mã xác nhận đến email: <strong>${email}</strong></p>
    <input type="text" id="register-otp" placeholder="Nhập mã OTP" style="width:100%;padding:8px;margin-bottom:10px;" />
    <button id="register-otp-submit" style="width:100%;padding:10px;background:#007bff;color:#fff;border:none;border-radius:5px;cursor:pointer;">Xác nhận đăng ký</button>
    <p id="register-otp-message" style="color:red;min-height:18px;margin-top:10px;"></p>
    <p style="margin-top:10px;">
      <span id="cancel-register-otp" style="color:#007bff;cursor:pointer;text-decoration:underline;">Hủy</span>
    </p>
  `;

  document.body.appendChild(form);

  form.querySelector('#register-otp-submit').onclick = () => verifyOtpForRegister(id, email, password);
  form.querySelector('#cancel-register-otp').onclick = () => {
    hideRegisterOtpForm();
    showRegisterForm();
  };
}
function hideRegisterOtpForm() {
  const form = document.getElementById('register-otp-form');
  if (form) form.remove();
}

// Hiển thị form đổi mật khẩu
function showChangePasswordForm() {
  if (document.getElementById('change-password-form')) return;

  const form = document.createElement('div');
  form.id = 'change-password-form';
  form.style = `
    position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);
    background:#fff;padding:20px;border:1px solid #ccc;border-radius:10px;
    box-shadow:0 2px 10px rgba(0,0,0,0.2);z-index:10000;width:320px;
    font-family:sans-serif;
  `;

  form.innerHTML = `
    <h2 style="margin:0 0 10px;">Đổi mật khẩu</h2>
    <input type="password" id="old-password" placeholder="Mật khẩu cũ" style="width:100%;padding:8px;margin-bottom:10px;" />
    <input type="password" id="new-password" placeholder="Mật khẩu mới" style="width:100%;padding:8px;margin-bottom:10px;" />
    <input type="password" id="confirm-new-password" placeholder="Nhập lại mật khẩu mới" style="width:100%;padding:8px;margin-bottom:10px;" />
    <button id="change-password-submit" style="width:100%;padding:10px;background:#007bff;color:#fff;border:none;border-radius:5px;cursor:pointer;">Xác nhận đổi mật khẩu</button>
    <p id="change-password-message" style="color:red;min-height:18px;margin-top:10px;"></p>
    <p style="margin-top:10px;">
      <span id="cancel-change-password" style="color:#007bff;cursor:pointer;text-decoration:underline;">Hủy</span>
    </p>
  `;

  document.body.appendChild(form);

  form.querySelector('#change-password-submit').onclick = changePassword;
  form.querySelector('#cancel-change-password').onclick = () => {
    hideChangePasswordForm();
  };
}
function hideChangePasswordForm() {
  const form = document.getElementById('change-password-form');
  if (form) form.remove();
}

// Xử lý đăng nhập
async function login() {
  const id = document.getElementById('login-id')?.value.trim().toLowerCase();
  const password = document.getElementById('login-password')?.value.trim();
  const messageEl = document.getElementById('login-message');
  if (!id || !password) {
    messageEl.textContent = 'Vui lòng nhập tên đăng nhập và mật khẩu.';
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
      showChangePasswordButton();
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

// Gửi mã OTP khi đăng ký
async function sendOtpForRegister() {
  const id = document.getElementById('register-id')?.value.trim().toLowerCase();
  const email = document.getElementById('register-email')?.value.trim().toLowerCase();
  const password = document.getElementById('register-password')?.value.trim();
  const passwordConfirm = document.getElementById('register-password-confirm')?.value.trim();
  const messageEl = document.getElementById('register-message');

  if (!id || !email || !password || !passwordConfirm) {
    messageEl.textContent = 'Vui lòng nhập đủ thông tin.';
    return;
  }
  if (password !== passwordConfirm) {
    messageEl.textContent = 'Mật khẩu nhập lại không khớp.';
    return;
  }

  messageEl.style.color = 'black';
  messageEl.textContent = 'Đang gửi mã OTP...';

  try {
    const res = await fetch(AUTH_FILE_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'request_otp', id, email }),
    });
    const result = await res.json();

    if (result.success) {
      messageEl.style.color = 'green';
      messageEl.textContent = 'Đã gửi mã xác nhận tới email. Vui lòng kiểm tra email.';
      setTimeout(() => {
        hideRegisterForm();
        showRegisterOtpForm(id, email, password);
      }, 1500);
    } else {
      messageEl.style.color = 'red';
      messageEl.textContent = result.message || 'Gửi mã OTP thất bại.';
    }
  } catch (e) {
    console.error(e);
    messageEl.style.color = 'red';
    messageEl.textContent = 'Lỗi kết nối, vui lòng thử lại.';
  }
}

// Xác nhận OTP và đăng ký
async function verifyOtpForRegister(id, email, password) {
  const otp = document.getElementById('register-otp')?.value.trim();
  const messageEl = document.getElementById('register-otp-message');

  if (!otp) {
    messageEl.textContent = 'Vui lòng nhập mã OTP.';
    return;
  }

  messageEl.style.color = 'black';
  messageEl.textContent = 'Đang xác nhận...';

  try {
    const res = await fetch(AUTH_FILE_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'verify_otp', id, email, otp, password }),
    });
    const result = await res.json();

    if (result.success) {
      messageEl.style.color = 'green';
      messageEl.textContent = 'Đăng ký thành công, bạn có thể đăng nhập ngay.';
      setTimeout(() => {
        hideRegisterOtpForm();
        showLoginForm();
      }, 2000);
    } else {
      messageEl.style.color = 'red';
      messageEl.textContent = result.message || 'Xác nhận OTP thất bại.';
    }
  } catch (e) {
    console.error(e);
    messageEl.style.color = 'red';
    messageEl.textContent = 'Lỗi kết nối, vui lòng thử lại.';
  }
}

// Kiểm tra token còn hiệu lực không
async function verifyToken(id, token) {
  if (!id || !token) return false;
  try {
    const res = await fetch(AUTH_FILE_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'verify_token', id, token }),
    });
    const result = await res.json();
    return result.success === true;
  } catch {
    return false;
  }
}

// Đổi mật khẩu
async function changePassword() {
  const oldPassword = document.getElementById('old-password')?.value.trim();
  const newPassword = document.getElementById('new-password')?.value.trim();
  const confirmNewPassword = document.getElementById('confirm-new-password')?.value.trim();
  const messageEl = document.getElementById('change-password-message');

  if (!oldPassword || !newPassword || !confirmNewPassword) {
    messageEl.textContent = 'Vui lòng nhập đủ thông tin.';
    return;
  }
  if (newPassword !== confirmNewPassword) {
    messageEl.textContent = 'Mật khẩu mới không khớp.';
    return;
  }

  const auth = JSON.parse(localStorage.getItem('auth') || '{}');
  if (!auth.id || !auth.token) {
    messageEl.textContent = 'Bạn cần đăng nhập trước.';
    return;
  }

  messageEl.style.color = 'black';
  messageEl.textContent = 'Đang xử lý...';

  try {
    const res = await fetch(AUTH_FILE_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'change_password',
        id: auth.id,
        token: auth.token,
        oldPassword,
        newPassword
      }),
    });
    const result = await res.json();

    if (result.success) {
      messageEl.style.color = 'green';
      messageEl.textContent = 'Đổi mật khẩu thành công.';
      setTimeout(() => {
        hideChangePasswordForm();
      }, 2000);
    } else {
      messageEl.style.color = 'red';
      messageEl.textContent = result.message || 'Đổi mật khẩu thất bại.';
    }
  } catch (e) {
    console.error(e);
    messageEl.style.color = 'red';
    messageEl.textContent = 'Lỗi kết nối, vui lòng thử lại.';
  }
}

// Khởi động kiểm tra đăng nhập (gọi lúc trang load)
async function initAuth() {
  const auth = JSON.parse(localStorage.getItem('auth') || '{}');
  if (auth.id && auth.token) {
    const valid = await verifyToken(auth.id, auth.token);
    if (valid) {
      hideLoginForm();
      showStatus(auth.id, auth.role);
      showLogoutButton();
      showChangePasswordButton();
      return;
    }
  }
  logout();
  showLoginForm();
}

window.onload = () => {
  initAuth();
};
