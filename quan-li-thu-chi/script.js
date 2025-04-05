let transactions = [];

const API_URL = "https://script.google.com/macros/s/AKfycbzaaylyRMuHUrx4UkBS30bGKfQXozCwSaNhJBlKYkDx5tHl-oBghK-kokxMSfTLyJPL/exec";
const TELEGRAM_BOT_TOKEN = "7783089403:AAGNpG6GsdlF7VXVfPTW8Y1xQJEqBahL1PY";
const TELEGRAM_CHAT_ID = "6249154937"; 

// Lấy dữ liệu từ Google Drive
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
            mode: "no-cors" // Thử tắt kiểm tra CORS 
        });

        let result = await response.json();
        console.log("✅ Server phản hồi:", result);
    } catch (error) {
        console.error("❌ Lỗi khi gửi dữ liệu:", error);
    }
}

// Cập nhật giao diện
// Cập nhật giao diện
function updateUI() {
    let tableBody = document.querySelector("#transaction-table tbody");
    tableBody.innerHTML = "";
    let totalIncome = 0;
    let totalExpense = 0;

    // Lọc chỉ giao dịch có trạng thái 'active'
    let activeTransactions = transactions.filter(t => t.status === "active");

    activeTransactions.forEach((t, index) => {
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

// Xóa giao dịch và chỉ cập nhật trạng thái
async function deleteTransaction(index) {
    if (!confirm("Bạn có chắc muốn xóa giao dịch này?")) return;

    // Chỉ thay đổi trạng thái thành 'deleted', không xóa hoàn toàn.
    transactions[index].status = "deleted";
    
    await saveAllTransactions(); // Ghi lại toàn bộ danh sách (bao gồm các thay đổi trạng thái)
    updateUI();
}

// Chỉnh sửa giao dịch
function editTransaction(index) {
    let t = transactions[index];
    document.getElementById("amount").value = t.amount;
    document.getElementById("type").value = t.type;
    document.getElementById("note").value = t.note;

    // Ghi đè lại giao dịch khi nhấn "Thêm"
    document.getElementById("submit-btn").onclick = async function () {
        transactions[index] = {
            amount: parseInt(document.getElementById("amount").value),
            type: document.getElementById("type").value,
            note: document.getElementById("note").value,
            date: new Date().toISOString(),
            status: transactions[index].status // Giữ nguyên trạng thái cũ (đã xóa hoặc chưa)
        };

        // Cập nhật chỉ giao dịch bị thay đổi
        await updateTransaction(transactions[index]);
        updateUI();
        resetForm();
    };
}

// Cập nhật chỉ giao dịch đã thay đổi
function updateUI() {
    let tableBody = document.querySelector("#transaction-table tbody");
    tableBody.innerHTML = "";
    let totalIncome = 0;
    let totalExpense = 0;

    // Lọc chỉ giao dịch có trạng thái 'active'
    let activeTransactions = transactions.filter(t => t.status === "active");

    activeTransactions.forEach((t, index) => {
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
// Thêm giao dịch
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
        status: "active"  // Mặc định trạng thái là active khi thêm giao dịch
    };

    await saveTransaction(transaction);
    transactions = await fetchTransactions(); // Cập nhật từ Google Drive
    updateUI();
    sendToTelegram(transaction);
}

// Gửi thông báo Telegram
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

// Tải danh sách khi mở trang
window.onload = async function () {
    transactions = await fetchTransactions();
    updateUI();
};
// Ghi lại toàn bộ danh sách giao dịch vào Google Drive
async function saveAllTransactions() {
    try {
        let response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transactions }) // Gửi toàn bộ danh sách giao dịch
        });
        let result = await response.text();
        console.log("Lưu toàn bộ:", result);
    } catch (err) {
        console.error("Lỗi khi lưu toàn bộ:", err);
    }
}
