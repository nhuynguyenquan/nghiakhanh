export const MODULES = [
  {
    id: 'menu',
    title: '🍽 Menu',
    render: el => el.innerHTML = '<h3>Quản lý menu</h3>'
  },
  {
    id: 'orders',
    title: '📋 Đơn hàng',
    render: el => el.innerHTML = '<h3>Danh sách đơn</h3>'
  },
  {
    id: 'settings',
    title: '⚙️ Cài đặt',
    render: el => el.innerHTML = '<h3>Cài đặt quán</h3>'
  }
];
