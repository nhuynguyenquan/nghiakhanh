let transactions = [];
const API_URL = "https://script.google.com/macros/s/AKfycbzaaylyRMuHUrx4UkBS30bGKfQXozCwSaNhJBlKYkDx5tHl-oBghK-kokxMSfTLyJPL/exec";
const TELEGRAM_BOT_TOKEN = "7783089403:AAGNpG6GsdlF7VXVfPTW8Y1xQJEqBahL1PY";
const TELEGRAM_CHAT_ID = "6249154937";

async function fetchTransactions() {
  try {
    let response = await fetch(API_URL);
    let data = await response.json();
    return data.transactions || [];
  } catch (error) {
    console.error("❌ Lỗi lấy dữ liệu từ Google Drive:", error);
    return [];
  }
}

async function saveTransaction(transaction) {
  if (!transaction || !transaction.amount || !transaction.type) {
    alert("❌ Dữ liệu không hợp lệ!");
    return;
  }
  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transaction }),
      mode: "no-cors"
    });
  } catch (error) {
    console.error("❌ Lỗi khi gửi dữ liệu:", error);
  }
}

async function saveAllTransactions() {
  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactions }),
      mode: "no-cors"
    });
  } catch (err) {
    console.error("Lỗi khi lưu toàn bộ:", err);
  }
}

function updateUI() {
  let tableBody = document.querySelector("#transaction-table tbody");
  tableBody.innerHTML = "";
  let totalIncome = 0, totalExpense = 0;

  transactions.filter(t => t.status === "active").forEach((t, index) => {
    let row = document.createElement("tr");
    row.innerHTML = `
      <td>${t.amount.toLocaleString("vi-VN")} VND</td>
      <td>${t.type === "income" ? "Thu" : "Chi"}</td>
      <td>${t.note}</td>
      <td>${new Date(t.date).toLocaleString("vi-VN")}</td>
      <td>
        <button onclick="editTransaction(${index})">✏️</button>
        <button onclick="deleteTransaction(${index})">🗑️</button>
      </td>
    `;
    tableBody.appendChild(row);
    if (t.type === "income") totalIncome += t.amount;
    else totalExpense += t.amount;
  });

  document.getElementById("total-income").textContent = totalIncome.toLocaleString("vi-VN");
  document.getElementById("total-expense").textContent = totalExpense.toLocaleString("vi-VN");
}

async function addTransaction() {
  let amount = document.getElementById("amount").value;
  let type = document.getElementById("type").value;
  let note = document.getElementById("note").value;

  if (!amount || isNaN(amount)) {
    alert("Vui lòng nhập số tiền hợp lệ!");
    return;
  }

  let transaction = {
    amount: parseInt(amount),
    type,
    note,
    date: new Date().toISOString(),
    status: "active"
  };

  await saveTransaction(transaction);
  transactions = await fetchTransactions();
  updateUI();
  sendToTelegram(transaction);
  resetForm();
}

function editTransaction(index) {
  let t = transactions[index];
  document.getElementById("amount").value = t.amount;
  document.getElementById("type").value = t.type;
  document.getElementById("note").value = t.note;

  document.getElementById("submit-btn").onclick = async function () {
    transactions[index] = {
      amount: parseInt(document.getElementById("amount").value),
      type: document.getElementById("type").value,
      note: document.getElementById("note").value,
      date: new Date().toISOString(),
      status: "active"
    };
    await saveAllTransactions();
    updateUI();
    resetForm();
  };
}

async function deleteTransaction(index) {
  if (!confirm("Bạn có chắc muốn xóa giao dịch này?")) return;

  transactions[index].status = "deleted";
  await saveAllTransactions();
  updateUI();
}

function sendToTelegram(transaction) {
  let message = `📌 *Giao dịch mới*:\n💰 *Số tiền:* ${transaction.amount.toLocaleString("vi-VN")} VND\n📂 *Loại:* ${transaction.type === "income" ? "Thu nhập" : "Chi tiêu"}\n📝 *Mô tả:* ${transaction.note}`;
  fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "Markdown"
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.ok) alert("✅ Giao dịch đã gửi lên Telegram!");
    else alert("❌ Gửi thất bại, kiểm tra lại token!");
  })
  .catch(err => console.error("Lỗi gửi Telegram:", err));
}

function resetForm() {
  document.getElementById("amount").value = "";
  document.getElementById("type").value = "income";
  document.getElementById("note").value = "";
  document.getElementById("submit-btn").onclick = addTransaction;
}

window.onload = async function () {
  transactions = await fetchTransactions();
  updateUI();
};