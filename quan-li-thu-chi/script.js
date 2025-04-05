let transactions = [];

const API_URL = "https://script.google.com/macros/s/AKfycbykxCnHGKiuYqgTYhzs0F3ARDsYmd3Xw08V474W-I6nldhLcT-tS7MVj2P8LNS5hcD-/exec";
const TELEGRAM_BOT_TOKEN = "7783089403:AAGNpG6GsdlF7VXVfPTW8Y1xQJEqBahL1PY";
const TELEGRAM_CHAT_ID = "6249154937";

// Lấy dữ liệu từ Google Drive
async function fetchTransactions() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        return data.transactions || [];
    } catch (error) {
        console.error("❌ Lỗi lấy dữ liệu từ Google Drive:", error);
        return [];
    }
}

// Lưu toàn bộ dữ liệu
async function saveAllTransactions() {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transactions })
        });

        const result = await response.text();
        console.log("📁 Đã lưu toàn bộ giao dịch:", result);
        return true;
    } catch (error) {
        console.error("❌ Lỗi khi lưu toàn bộ giao dịch:", error);
        alert("❌ Không thể lưu dữ liệu! Vui lòng kiểm tra lại.");
        return false;
    }
}

// Lưu 1 giao dịch mới
async function saveTransaction(transaction) {
    if (!transaction || !transaction.amount || !transaction.type) {
        alert("❌ Dữ liệu không hợp lệ!");
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transaction })
        });

        const result = await response.text();
        console.log("✅ Đã lưu giao dịch mới:", result);
    } catch (error) {
        console.error("❌ Lỗi ghi dữ liệu:", error);
    }
}

// Thêm giao dịch
async function addTransaction() {
    const amount = document.getElementById("amount").value;
    const type = document.getElementById("type").value;
    const note = document.getElementById("note").value;

    if (!amount || isNaN(amount)) {
        alert("Vui lòng nhập số tiền hợp lệ!");
        return;
    }

    const transaction = {
        amount: parseInt(amount),
        type,
        note,
        date: new Date().toISOString()
    };

    await saveTransaction(transaction);
    transactions = await fetchTransactions();
    updateUI();
    sendToTelegram(transaction);

    document.getElementById("amount").value = "";
    document.getElementById("note").value = "";
}

// Gửi thông báo Telegram
function sendToTelegram(transaction) {
    const message = `📌 *Giao dịch mới*:\n💰 *Số tiền:* ${transaction.amount.toLocaleString("vi-VN")} VND\n📂 *Loại:* ${transaction.type === "income" ? "Thu nhập" : "Chi tiêu"}\n📝 *Mô tả:* ${transaction.note}`;

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    fetch(url, {
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
        if (data.ok) {
            console.log("✅ Đã gửi Telegram");
        } else {
            alert("❌ Gửi Telegram thất bại!");
        }
    })
    .catch(error => console.error("Lỗi gửi Telegram:", error));
}

// Hiển thị danh sách giao dịch
function updateUI() {
    const tableBody = document.querySelector("#transaction-table tbody");
    let totalIncome = 0;
    let totalExpense = 0;

    tableBody.innerHTML = "";
    transactions.forEach((t, index) => {
        const row = document.createElement("tr");

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

// Sửa giao dịch
async function editTransaction(index) {
    const t = transactions[index];
    const newAmount = prompt("Số tiền mới:", t.amount);
    const newNote = prompt("Ghi chú mới:", t.note);
    const newType = prompt("Loại (income/expense):", t.type);

    if (!newAmount || isNaN(newAmount) || !["income", "expense"].includes(newType)) {
        alert("❌ Dữ liệu không hợp lệ!");
        return;
    }

    transactions[index] = {
        ...t,
        amount: parseInt(newAmount),
        note: newNote,
        type: newType
    };

    const saved = await saveAllTransactions();
    if (saved) alert("✅ Đã lưu thay đổi thành công!");
    updateUI();
}

// Xoá giao dịch
async function deleteTransaction(index) {
    if (confirm("Bạn có chắc muốn xóa giao dịch này?")) {
        transactions.splice(index, 1);
        const saved = await saveAllTransactions();
        if (saved) alert("✅ Đã xoá và lưu giao dịch thành công!");
        updateUI();
    }
}

// Khi mở trang
window.onload = async function () {
    transactions = await fetchTransactions();
    updateUI();
};
