import { CONFIG } from './config.js';
export const api = {
  adminLogin(pin) {
    return fetch(CONFIG.API_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'admin_login',
        pin
      })
    }).then(r => r.json());
  },

  getOrders(token) {
    return fetch(CONFIG.API_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'get_orders',
        token
      })
    }).then(r => r.json());
  }
};
async function ensureToken() {
  const expires = +localStorage.getItem('expires_at');
  if (Date.now() < expires - 60000) return;

  const refresh = localStorage.getItem('refresh_token');

  const res = await fetch(CONFIG.API_URL, {
    method: 'POST',
    body: JSON.stringify({
      action: 'refresh',
      refreshToken: refresh
    })
  }).then(r => r.json());

  if (!res.ok) {
    location.href = 'login.html';
    return;
  }

  localStorage.setItem('access_token', res.accessToken);
  localStorage.setItem('expires_at', Date.now() + res.expiresIn * 1000);
}
function logout() {
  localStorage.clear();
  location.href = 'login.html';
}
