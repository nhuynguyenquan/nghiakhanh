const API_URL_KHO = "https://script.google.com/macros/s/AKfycbwKX-Dle5vDmaWvA9Uocl4liQHvRdBDLl7XcL6LR2ADj9S9oeWXH17w-H6dG6GcE6kg/exec"; 
let khoData = {
  items: [],
  logs: []
};

async function fetchKhoData() {
  try {
    let res = await fetch(API_URL_KHO);
    let data = await res.json();
    khoData = data || { items: [], logs: [] };
    renderUI();
  } catch (err) {
    console.error("Lỗi tải dữ liệu kho:", err);
  }
}

async function saveKhoData() {
  try {
    await fetch(API_URL_KHO, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(khoData),
    });
  } catch (err) {
    console.error("Lỗi lưu dữ liệu kho:", err);
  }
}

function addItem() {
  const name = document.getElementById("itemName").value.trim();
  const qty = parseInt(document.getElementById("itemQty").value);
  if (!name || isNaN(qty)) return alert("Vui lòng nhập đầy đủ tên và số lượng!");

  let existing = khoData.items.find(i => i.name === name);
  if (existing) return alert("Mặt hàng đã tồn tại!");

  khoData.items.push({ name, qty });
  khoData.logs.push({ time: new Date().toISOString(), action: `➕ Thêm hàng: ${name} - SL: ${qty}` });
  saveKhoData();
  renderUI();
}

function updateStock() {
  const name = document.getElementById("itemSelect").value;
  const change = parseInt(document.getElementById("qtyChange").value);
  const type = document.getElementById("actionType").value;
  if (!name || isNaN(change)) return alert("Vui lòng chọn hàng và số lượng!");

  let item = khoData.items.find(i => i.name === name);
  if (!item) return alert("Không tìm thấy hàng trong kho!");

  if (type === "import") item.qty += change;
  else {
    if (item.qty < change) return alert("Không đủ hàng để xuất!");
    item.qty -= change;
  }

  khoData.logs.push({
    time: new Date().toISOString(),
    action: `${type === "import" ? "📥 Nhập" : "📤 Xuất"} hàng: ${name} - SL: ${change}`
  });

  saveKhoData();
  renderUI();
}

function renderUI() {
  const itemSelect = document.getElementById("itemSelect");
  const stockList = document.getElementById("stockList");
  const logHistory = document.getElementById("logHistory");

  itemSelect.innerHTML = "";
  stockList.innerHTML = "";
  logHistory.innerHTML = "";

  khoData.items.forEach(item => {
    itemSelect.innerHTML += `<option value="${item.name}">${item.name}</option>`;
    stockList.innerHTML += `<li>${item.name}: ${item.qty}</li>`;
  });

  [...khoData.logs].reverse().forEach(log => {
    logHistory.innerHTML += `<div class="log-entry">🕓 ${new Date(log.time).toLocaleString("vi-VN")}: ${log.action}</div>`;
  });
}

window.onload = fetchKhoData;
