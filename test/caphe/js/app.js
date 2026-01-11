import { API } from './api.js';

export const MODULES = [
  {
    id: 'menu',
    title: '🍽 Menu',
    render: async el => {
      el.innerHTML = `
        <h3>Menu</h3>
        <input id="mName" placeholder="Tên món">
        <input id="mPrice" type="number" placeholder="Giá">
        <button id="addMenu">➕ Thêm</button>
        <ul id="menuList"></ul>
      `;

      async function load() {
        const res = await API.getMenu();
        const ul = el.querySelector('#menuList');
        ul.innerHTML = '';
        res.data.forEach(m => {
          const li = document.createElement('li');
          li.innerHTML = `${m.name} - ${m.price}đ
            <button data-id="${m.id}">❌</button>`;
          li.querySelector('button').onclick = async () => {
            await API.deleteMenu(m.id);
            load();
          };
          ul.appendChild(li);
        });
      }

      el.querySelector('#addMenu').onclick = async () => {
        await API.saveMenu(
          el.querySelector('#mName').value,
          el.querySelector('#mPrice').value
        );
        load();
      };

      load();
    }
  },
  ,
{
  id: 'orders',
  title: '📋 Đơn hàng (Realtime)',
  render: el => {
    el.innerHTML = `<h3>Đơn hàng</h3><ul id="orders"></ul>`;

    async function load() {
      const res = await API.getOrders();
      const ul = el.querySelector('#orders');
      ul.innerHTML = '';
      res.data.forEach(o => {
        const li = document.createElement('li');
        li.innerHTML = `
          🕒 ${o.time} | Bàn ${o.table}
          <pre>${JSON.stringify(o.items)}</pre>
        `;
        ul.appendChild(li);
      });
    }

    load();
    const timer = setInterval(load, 3000);

    el.onremove = () => clearInterval(timer);
  }
}
];
