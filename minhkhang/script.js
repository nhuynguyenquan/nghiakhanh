const SCRIPT_URL = 'https://script.google.com/macros/s/PASTE_YOUR_DEPLOY_URL_HERE/exec';

async function login() {
  const id = document.getElementById('id').value.trim();
  const password = document.getElementById('password').value.trim();

  const hash = await sha256(password);

  fetch(`${SCRIPT_URL}?action=login`, {
    method: 'POST',
    body: JSON.stringify({ id, password: hash }),
    headers: { 'Content-Type': 'application/json' }
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        sessionStorage.setItem('id', data.id);
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('role', data.role);
        alert('Đăng nhập thành công');
        window.location.href = 'dashboard.html';
      } else {
        alert('Đăng nhập thất bại: ' + data.message);
      }
    });
}

function checkLogin() {
  const id = sessionStorage.getItem('id');
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('role');

  if (!id || !token) {
    window.location.href = 'login.html';
    return;
  }

  fetch(`${SCRIPT_URL}?action=check`, {
    method: 'POST',
    body: JSON.stringify({ id, token }),
    headers: { 'Content-Type': 'application/json' }
  })
    .then(res => res.json())
    .then(data => {
      if (!data.valid) {
        window.location.href = 'login.html';
      } else {
        document.getElementById('username').innerText = id;
        if (role === 'admin') {
          document.getElementById('adminPanel').style.display = 'block';
        }
      }
    });
}

function logout() {
  const id = sessionStorage.getItem('id');
  fetch(`${SCRIPT_URL}?action=logout`, {
    method: 'POST',
    body: JSON.stringify({ id }),
    headers: { 'Content-Type': 'application/json' }
  }).then(() => {
    sessionStorage.clear();
    window.location.href = 'login.html';
  });
}

// Mã hóa SHA-256 cho mật khẩu
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
