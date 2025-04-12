let transactions = [];

const API_URL = "https://script.google.com/macros/s/AKfycbzaaylyRMuHUrx4UkBS30bGKfQXozCwSaNhJBlKYkDx5tHl-oBghK-kokxMSfTLyJPL/exec";
const TELEGRAM_BOT_TOKEN = "7783089403:AAGNpG6GsdlF7VXVfPTW8Y1xQJEqBahL1PY";
const TELEGRAM_CHAT_ID = "6249154937"; 
let currentPage = 1;
const itemsPerPage = 20;

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

// Ghi dữ liệu vào Google Drive
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

        let result = await response.json();
        console.log("✅ Server phản hồi:", result);
    } catch (error) {
        console.error("❌ Lỗi khi gửi dữ liệu:", error);
    }
}

// Cập nhật giao diện với phân trang và sắp xếp
function updateUI() {
    const tableBody = document.querySelector("#transaction-table tbody");
    let totalIncome = 0;
    let totalExpense = 0;

    const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginated = sorted.slice(start, end);

    tableBody.innerHTML = "";

    paginated.forEach((t, index) => {
        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${t.amount.toLocaleString("vi-VN")} VND</td>
            <td>${t.type === "income" ? "Thu" : "Chi"}</td>
            <td>${t.note}</td>
            <td>${new Date(t.date).toLocaleString("vi-VN")}</td>
            <td>
                <button onclick="editTransaction(${index + start})">✏️</button>
                <button onclick="deleteTransaction(${index + start})">🗑️</button>
            </td>
        `;
        tableBody.appendChild(row);

        if (t.type === "income") totalIncome += t.amount;
        else totalExpense += t.amount;
    });

    document.getElementById("total-income").textContent = totalIncome.toLocaleString("vi-VN");
    document.getElementById("total-expense").textContent = totalExpense.toLocaleString("vi-VN");
    renderPagination(sorted.length);
}

function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const container = document.getElementById("pagination") || createPaginationContainer();
    container.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.className = i === currentPage ? "active-page" : "";
        btn.onclick = () => {
            currentPage = i;
            updateUI();
        };
        container.appendChild(btn);
    }
}

function createPaginationContainer() {
    const container = document.createElement("div");
    container.id = "pagination";
    container.style.textAlign = "center";
    container.style.marginBottom = "2rem";
    document.body.insertBefore(container, document.getElementById("transaction-chart"));
    return container;
}

async function deleteTransaction(index) {
    if (!confirm("Bạn có chắc muốn xóa giao dịch này?")) return;

    transactions.splice(index, 1);
    await saveAllTransactions();
    updateUI();
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
            date: new Date().toISOString()
        };
        await saveAllTransactions();
        updateUI();
        resetForm();
    };
}

async function saveAllTransactions() {
    try {
        let response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            mode: "no-cors" ,
            body: JSON.stringify({ transactions })
        });
        let result = await response.text();
        console.log("Lưu toàn bộ:", result);
    } catch (err) {
        console.error("Lỗi khi lưu toàn bộ:", err);
    }
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
    resetForm();
}

function resetForm() {
    document.getElementById("amount").value = "";
    document.getElementById("type").value = "income";
    document.getElementById("note").value = "";
    document.getElementById("submit-btn").onclick = addTransaction;
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
            alert("✅ Giao dịch đã gửi lên Telegram!");
        } else {
            alert("❌ Gửi thất bại, kiểm tra lại token!");
        }
    })
    .catch(error => console.error("Lỗi gửi Telegram:", error));
}

window.onload = async function () {
    transactions = await fetchTransactions();
    updateUI();
    document.getElementById("submit-btn").onclick = addTransaction;
};
