import { CONFIG } from './config.js';

async function callAPI(action, payload = {}) {
  const res = await fetch(CONFIG.API_URL, {
    method: 'POST',
    
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
  order: data => callAPI('order', data),
  logout: token => callAPI('logout', { accessToken: token }),
  getMenu: () => callAPI('getMenu'),
  saveMenu: (name, price) => callAPI('saveMenu', { name, price }),
  deleteMenu: id => callAPI('deleteMenu', { id }),
  order: data => callAPI('order', data),
  getOrders: () => callAPI('getOrders')
};
