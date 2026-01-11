import { CONFIG } from './config.js';

async function callAPI(action, payload = {}) {
  const res = await fetch(CONFIG.API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      shopId: CONFIG.SHOP_ID,
      action,
      ...payload
    })
  });
  return res.json();
}

export const API = {
  login: (u, p) => callAPI('login', { username: u, password: p }),
  verify: token => callAPI('verify', { accessToken: token }),
  getMenu: () => callAPI('getMenu'),
  order: data => callAPI('order', data),
  logout: token => callAPI('logout', { accessToken: token })
};
