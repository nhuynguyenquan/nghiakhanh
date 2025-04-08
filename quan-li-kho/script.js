const API_URL = "https://script.google.com/macros/s/AKfycbwf9qaqButXpFvd7P_9DxtdfGAADtkTPwa6EyAkCE8W/dev"; 

let khoData = { stock: {}, history: [] };

// Tải dữ liệu kho
async function loadKho() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    khoData = data;
    updateStockDisplay();
    updateLogDisplay();
    populateItemSelect();
  } catch (err) {
    console.error("❌ Lỗi tải kho:", err);
  }
}

// Ghi giao dịch
async function postTransaction(itemName, qty, action) {
  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemName, qty, action })
    });
    await loadKho(); // Cập nhật lại
  } catch (err) {
    console.error("❌ Lỗi ghi giao dịch:", err);
  }
}

// Xử lý thêm hàng
function addItem() {
  const name = document.getElementById("itemName").value.trim();
  const qty = parseInt(document.getElementById("itemQty").value);
  if (!name || isNaN(qty)) return alert("Vui lòng nhập tên và số lượng hợp lệ");
  postTransaction(name, qty, "import");
}

// Nhập/xuất kho
function updateStock() {
  const item = document.getElementById("itemSelect").value;
  const qty = parseInt(document.getElementById("qtyChange").value);
  const action = document.getElementById("actionType").value;
  if (!item || isNaN(qty)) return alert("Thiếu thông tin");
  postTransaction(item, qty, action);
}

// Hiển thị danh sách tồn kho
function updateStockDisplay() {
  const list = document.getElementById("stockList");
  list.innerHTML = "";
  for (let item in khoData.stock) {
    let li = document.createElement("li");
    li.textContent = `${item}: ${khoData.stock[item]}`;
    list.appendChild(li);
  }
}

// Hiển thị lịch sử giao dịch
function updateLogDisplay() {
  const logDiv = document.getElementById("logHistory");
  logDiv.innerHTML = "";
  khoData.history.slice().reverse().forEach(entry => {
    const div = document.createElement("div");
    div.className = "log-entry";
    div.textContent = `[${new Date(entry.timestamp).toLocaleString("vi-VN")}] ${entry.action === "import" ? "Nhập" : "Xuất"} ${entry.qty} ${entry.itemName}`;
    logDiv.appendChild(div);
  });
}

// Đổ dropdown danh sách hàng
function populateItemSelect() {
  const select = document.getElementById("itemSelect");
  select.innerHTML = "";
  Object.keys(khoData.stock).forEach(item => {
    let option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    select.appendChild(option);
  });
}

// Gọi khi mở trang
window.onload = loadKho;
