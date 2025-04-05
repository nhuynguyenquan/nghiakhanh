let transactions = [];

const API_URL = "https://script.google.com/macros/s/AKfycbzaaylyRMuHUrx4UkBS30bGKfQXozCwSaNhJBlKYkDx5tHl-oBghK-kokxMSfTLyJPL/exec";
const TELEGRAM_BOT_TOKEN = "7783089403:AAGNpG6GsdlF7VXVfPTW8Y1xQJEqBahL1PY";
const TELEGRAM_CHAT_ID = "6249154937";

// Lấy dữ liệu từ Google Drive và chỉ giữ bản ghi active
async function fetchTransactions() {
    try {
        let response = await fetch(API_URL);
        let data = await response.json();
        return (data.transactions || []).filter(t => t.status === "active");
    } catch (error) {
        console.error("❌ Lỗi lấy dữ liệu từ Google Drive:", error);
        return [];
    }
}

// Gửi một bản ghi lên Google Drive
async function saveTransaction(transaction) {
    if (!transaction || !transaction.amount || !transaction.type) {
        alert("❌ Dữ liệu không hợp lệ!");
        return;
    }

    try {
        let response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transaction }),
            mode: "no-cors"
        });

        console.log("✅ Gửi bản ghi lên server:", transaction);
    } catch (error) {
        console.error("❌ Lỗi khi gửi dữ liệu:", error);
    }
}

// Hiển thị danh sách giao dịch
function updateUI() {
    let tableBody = document.querySelector("#transaction-table tbody");
    tableBody.innerHTML = "";
    let totalIncome = 0;
    let totalExpense = 0;

    // Lọc và phân loại giao dịch theo loại (thu/chi)
    let incomeTransactions = transactions.filter(t => t.type === "income" && t.status === "active");
    let expenseTransactions = transactions.filter(t => t.type === "expense" && t.status === "active");

    // Sắp xếp các giao dịch theo ngày tháng (từ mới nhất đến cũ nhất)
    incomeTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    expenseTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Thêm các giao dịch thu vào bảng
    incomeTransactions.forEach(t => {
        let row = document.createElement("tr");

        row.innerHTML = `
            <td>${t.amount.toLocaleString("vi-VN")} VND</td>
            <td>Thu</td>
            <td>${t.note}</td>
            <td>${new Date(t.date).toLocaleString("vi-VN")}</td>
            <td>
                <button onclick="editTransaction(${transactions.indexOf(t)})">✏️</button>
                <button onclick="deleteTransaction(${transactions.indexOf(t)})">🗑️</button>
            </td>
        `;

        tableBody.appendChild(row);
        totalIncome += t.amount;
    });

    // Thêm các giao dịch chi vào bảng
    expenseTransactions.forEach(t => {
        let row = document.createElement("tr");

        row.innerHTML = `
            <td>${t.amount.toLocaleString("vi-VN")} VND</td>
            <td>Chi</td>
            <td>${t.note}</td>
            <td>${new Date(t.date).toLocaleString("vi-VN")}</td>
            <td>
                <button onclick="editTransaction(${transactions.indexOf(t)})">✏️</button>
                <button onclick="deleteTransaction(${transactions.indexOf(t)})">🗑️</button>
            </td>
        `;

        tableBody.appendChild(row);
        totalExpense += t.amount;
    });

    // Cập nhật tổng thu chi
    document.getElementById("total-income").textContent = totalIncome.toLocaleString("vi-VN");
    document.getElementById("total-expense").textContent = totalExpense.toLocaleString("vi-VN");
}

// Xử lý thêm giao dịch
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
    resetForm();
    sendToTelegram(transaction);
}

// Xóa giao dịch: chỉ cập nhật trạng thái
async function deleteTransaction(index) {
    if (!confirm("Bạn có chắc muốn xóa giao dịch này?")) return;

    let deletedTransaction = { ...transactions[index], status: "deleted" };

    await saveTransaction(deletedTransaction);
    transactions = await fetchTransactions();
    resetForm();
    updateUI();
}

// Sửa giao dịch: tạo bản ghi mới và đánh dấu bản cũ là deleted
function editTransaction(index) {
    let oldTransaction = transactions[index];

    document.getElementById("amount").value = oldTransaction.amount;
    document.getElementById("type").value = oldTransaction.type;
    document.getElementById("note").value = oldTransaction.note;

    document.getElementById("submit-btn").onclick = async function () {
        let newTransaction = {
            amount: parseInt(document.getElementById("amount").value),
            type: document.getElementById("type").value,
            note: document.getElementById("note").value,
            date: new Date().toISOString(),
            status: "active"
        };

        let deletedTransaction = { ...transactions[index], status: "deleted" };

        await saveTransaction(deletedTransaction);
        await saveTransaction(newTransaction);

        transactions = await fetchTransactions();
        resetForm();
        updateUI();
    };
}

// Reset form sau khi thêm/sửa
function resetForm() {
    document.getElementById("amount").value = "";
    document.getElementById("type").value = "income";
    document.getElementById("note").value = "";
    document.getElementById("submit-btn").onclick = addTransaction;
}

// Gửi thông báo Telegram
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
        if (!data.ok) {
            alert("❌ Gửi Telegram thất bại!");
        }
    })
    .catch(err => console.error("Lỗi gửi Telegram:", err));
}

// Tải dữ liệu khi mở trang
window.onload = async function () {
    transactions = await fetchTransactions();
    updateUI();
    resetForm();
};
