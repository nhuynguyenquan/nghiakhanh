import { API } from './api.js';

export async function checkLogin() {
  const token = localStorage.getItem('access_token');
  if (!token) return false;

  const res = await API.verify(token);
  return res.ok;
}

export function saveToken(res) {
  localStorage.setItem('access_token', res.accessToken);
  localStorage.setItem('expires_at', Date.now() + res.expiresIn * 1000);
}

export function logout() {
  localStorage.clear();
  location.href = 'login.html';
}
