// auth.js

const AUTH_API = 'https://script.google.com/macros/s/AKfycbwbb8TxqMBPIVLB_izyJcmImZiMtyoErCYA7mi02Ln633RfWsU8oLSNEAHvLycIHP9UcA/exec'; // thay bằng URL Web App của bạn

function setCookie(name, value, days = 1) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires}`;
}
function getCookie(name) {
  return document.cookie.split('; ').find(row => row.startsWith(name + '='))?.split('=')[1];
}
function deleteCookie(name) {
  document.cookie = name + '=; max-age=0; path=/';
}

function logout() {
  deleteCookie('token');
  deleteCookie('user_id');
  location.reload();
}

async function checkLogin(callbackWhenLoggedIn) {
  const token = getCookie('token');
  const id = getCookie('user_id');

  if (!token || !id) {
    showLoginForm(callbackWhenLoggedIn);
    return;
  }

  const res = await fetch(`${AUTH_API}?action=check_token&id=${id}&token=${token}`);
  const result = await res.json();
  if (result.valid) {
    callbackWhenLoggedIn({ id, role: result.role });
  } else {
    logout();
  }
}

function showLoginForm(callbackWhenLoggedIn) {
  const container = document.createElement('div');
  container.innerHTML = `
    <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:#fff; z-index:9999; display:flex; align-items:center; justify-content:center; flex-direction:column; font-family:sans-serif;">
      <h2>Đăng nhập</h2>
      <input type="text" id="login_id" placeholder="Tên đăng nhập" style="padding:8px; margin:4px; width:200px;" />
      <input type="password" id="login_password" placeholder="Mật khẩu" style="padding:8px; margin:4px; width:200px;" />
      <button onclick="submitLogin()" style="padding:8px 16px; margin-top:8px;">Đăng nhập</button>
      <p id="login_error" style="color:red"></p>
    </div>
  `;
  document.body.appendChild(container);
  window.submitLogin = async function () {
    const id = document.getElementById('login_id').value.trim();
    const password = document.getElementById('login_password').value.trim();
    if (!id || !password) return;

    const payload = { action: 'login', id, password };
    const res = await fetch(AUTH_API, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    const result = await res.json();

    if (result.success) {
      setCookie('token', result.token);
      setCookie('user_id', result.id);
      container.remove(); // Xóa form
      callbackWhenLoggedIn({ id: result.id, role: result.role });
    } else {
      document.getElementById('login_error').innerText = result.message;
    }
  }
}
checkLogin((user) => {
    document.getElementById("status").innerText = `Xin chào ${user.id} (${user.role})`;
  });