let transactions = [];

const API_URL = "https://script.google.com/macros/s/AKfycbwlSCJS2MDQKbtKxneIhkkLZbCkEn3SXqebCdjVSnKDcTu7A71eYf6D4NdSSHj3J_ca/exec";
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
        let response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transaction })
        });

        let result = await response.text();
        console.log("Phản hồi từ server:", result);
    } catch (error) {
        console.error("❌ Lỗi ghi dữ liệu:", error);
    }
}

function updateUI() {
    let tableBody = document.getElementById("transaction-table-body");
    let totalIncome = 0;
    let totalExpense = 0;

    tableBody.innerHTML = "";
    transactions.forEach((t, index) => {
        let row = document.createElement("tr");

        row.innerHTML = `
            <td>${new Date(t.date).toLocaleString("vi-VN")}</td>
            <td>${t.amount.toLocaleString("vi-VN")} VND</td>
            <td>${t.type === "income" ? "Thu" : "Chi"}</td>
            <td>${t.note}</td>
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

    let transaction = { amount: parseInt(amount), type, note, date: new Date().toISOString() };

    await saveTransaction(transaction);
    transactions = await fetchTransactions();
    updateUI();
    sendToTelegram(transaction);
    document.getElementById("amount").value = "";
    document.getElementById("note").value = "";
}

function sendToTelegram(transaction) {
    let message = `📌 *Giao dịch mới*:\n💰 *Số tiền:* ${transaction.amount.toLocaleString("vi-VN")} VND\n📂 *Loại:* ${transaction.type === "income" ? "Thu nhập" : "Chi tiêu"}\n📝 *Mô tả:* ${transaction.note}`;

    let url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    let data = {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "Markdown"
    };

    fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.ok) {
            console.log("✅ Đã gửi Telegram");
        } else {
            alert("❌ Gửi Telegram thất bại!");
        }
    })
    .catch(error => console.error("Lỗi gửi Telegram:", error));
}

async function deleteTransaction(index) {
    transactions.splice(index, 1);
    await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions })
    });
    transactions = await fetchTransactions();
    updateUI();
}

function editTransaction(index) {
    let t = transactions[index];
    let newAmount = prompt("Nhập số tiền mới:", t.amount);
    let newNote = prompt("Nhập mô tả mới:", t.note);

    if (newAmount && !isNaN(newAmount)) {
        transactions[index].amount = parseInt(newAmount);
    }
    if (newNote) {
        transactions[index].note = newNote;
    }

    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions })
    }).then(() => {
        updateUI();
    }).catch(error => console.error("Lỗi cập nhật:", error));
}

window.onload = async function () {
    transactions = await fetchTransactions();
    updateUI();
};
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

    await saveAllTransactions(); // Lưu lại tất cả sau khi chỉnh sửa
    updateUI();
}
async function deleteTransaction(index) {
    if (confirm("Bạn có chắc muốn xóa giao dịch này?")) {
        transactions.splice(index, 1);
        await saveAllTransactions(); // Lưu lại sau khi xóa
        updateUI();
    }
}

