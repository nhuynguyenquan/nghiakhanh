if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => {
        console.log('✅ Service Worker đã được đăng ký:', reg);
      })
      .catch(err => {
        console.error('❌ Lỗi đăng ký Service Worker:', err);
      });
  });

  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data && event.data.type === 'NEW_VERSION_AVAILABLE') {
      showUpdateModal();
    }
  });
}

function showUpdateModal() {
  const modal = document.getElementById('update-modal');
  if (modal) modal.style.display = 'flex';
}
