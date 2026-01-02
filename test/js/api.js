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