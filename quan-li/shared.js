if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => {
        console.log('✅ Service Worker registered:', reg);
      })
      .catch(err => {
        console.error('❌ Failed to register Service Worker:', err);
      });
  });

  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data && event.data.type === 'NEW_VERSION_AVAILABLE') {
      showUpdateModal();
    }
  });
}

function showUpdateModal() {
  // Nếu modal đã tồn tại thì hiển thị
  if (document.getElementById('update-modal')) {
    document.getElementById('update-modal').style.display = 'flex';
    return;
  }

  const modal = document.createElement('div');
  modal.id = 'update-modal';
  modal.style = `
    display: flex;
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.4);
    justify-content: center;
    align-items: center;
    z-index: 9999;
  `;

  modal.innerHTML = `
    <div style="background:white; padding:20px 30px; border-radius:10px; text-align:center; max-width:90%; box-shadow:0 4px 12px rgba(0,0,0,0.2)">
      <h3 style="margin-bottom:10px; color:#2c3e50">🔄 Có bản cập nhật mới</h3>
      <p style="margin-bottom:20px; color:#555">Bạn có muốn tải lại trang để cập nhật?</p>
      <button id="update-confirm" style="padding:10px 20px; margin-right:10px; background:#28a745; color:white; border:none; border-radius:5px;">Cập nhật</button>
      <button id="update-cancel" style="padding:10px 20px; background:#ccc; border:none; border-radius:5px;">Đóng</button>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('update-confirm').onclick = () => location.reload();
  document.getElementById('update-cancel').onclick = () => {
    modal.style.display = 'none';
  };
}
