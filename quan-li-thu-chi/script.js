let transactions = [];

const API_URL = "https://script.google.com/macros/s/AKfycbzaaylyRMuHUrx4UkBS30bGKfQXozCwSaNhJBlKYkDx5tHl-oBghK-kokxMSfTLyJPL/exec";
const TELEGRAM_BOT_TOKEN = "7783089403:AAGNpG6GsdlF7VXVfPTW8Y1xQJEqBahL1PY";
const TELEGRAM_CHAT_ID = "6249154937";

// Fetch giao dịch từ Google Drive
async function fetchTransactions() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        return data.transactions?.filter(t => t.status === "active") || [];
    } catch (err) {
        console.error("❌ Lỗi khi fetch:", err);
        return [];
    }
}

// Gửi giao dịch lên Google Drive
async function saveTransaction(transaction) {
    try {
        await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transaction }),
        });
    } catch (err) {
        console.error("❌ Gửi dữ liệu thất bại:", err);
    }
}

// Cập nhật giao diện
function updateUI() {
    const tableBody = document.querySelector("#transaction-table tbody");
    tableBody.innerHTML = "";
    let totalIncome = 0;
    let totalExpense = 0;

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

// Thêm giao dịch
async function addTransaction() {
    const amount = parseInt(document.getElementById("amount").value);
    const type = document.getElementById("type").value;
    const note = document.getElementById("note").value;

    if (!amount || isNaN(amount)) {
        alert("❗ Vui lòng nhập số tiền hợp lệ!");
        return;
    }

    const transaction = {
        amount,
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

// Chỉnh sửa giao dịch
function editTransaction(index) {
    const t = transactions[index];
    document.getElementById("amount").value = t.amount;
    document.getElementById("type").value = t.type;
    document.getElementById("note").value = t.note;

    document.getElementById("submit-btn").onclick = async () => {
        // Đánh dấu bản ghi cũ là deleted
        transactions[index].status = "deleted";
        await saveTransaction(transactions[index]);

        // Ghi bản ghi mới
        const newTransaction = {
            amount: parseInt(document.getElementById("amount").value),
            type: document.getElementById("type").value,
            note: document.getElementById("note").value,
            date: new Date().toISOString(),
            status: "active"
        };

        await saveTransaction(newTransaction);
        transactions = await fetchTransactions();
        updateUI();
        resetForm();
        sendToTelegram(newTransaction);
    };
}

// Xóa giao dịch (chỉ đổi trạng thái)
async function deleteTransaction(index) {
    if (!confirm("Bạn chắc chắn muốn xóa giao dịch này?")) return;
    transactions[index].status = "deleted";
    await saveTransaction(transactions[index]);
    transactions = await fetchTransactions();
    updateUI();
}

// Gửi Telegram
function sendToTelegram(transaction) {
    const message = `📌 *Giao dịch mới*:\n💰 *Số tiền:* ${transaction.amount.toLocaleString("vi-VN")} VND\n📂 *Loại:* ${transaction.type === "income" ? "Thu nhập" : "Chi tiêu"}\n📝 *Mô tả:* ${transaction.note}`;

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
            if (data.ok) {
                alert("✅ Gửi Telegram thành công!");
            } else {
                alert("❌ Gửi Telegram thất bại!");
            }
        })
        .catch(err => console.error("Telegram error:", err));
}

// Reset form
function resetForm() {
    document.getElementById("amount").value = "";
    document.getElementById("type").value = "income";
    document.getElementById("note").value = "";
    document.getElementById("submit-btn").onclick = addTransaction;
}

// Load khi mở trang
window.onload = async () => {
    transactions = await fetchTransactions();
    updateUI();
    resetForm();
};
