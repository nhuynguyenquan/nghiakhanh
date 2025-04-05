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

    // Đánh dấu bản ghi là đã xóa
    transactions[index].status = "deleted";

    // Gửi bản ghi đã cập nhật (status: deleted) lên server
    await saveTransaction(transactions[index]);

    // Làm mới danh sách từ server
    transactions = await fetchTransactions();

    // Cập nhật lại giao diện
    updateUI();
}

// Chỉnh sửa giao dịch
function editTransaction(index) {
    let oldTransaction = transactions[index];
    
    // Gán dữ liệu cũ lên form
    document.getElementById("amount").value = oldTransaction.amount;
    document.getElementById("type").value = oldTransaction.type;
    document.getElementById("note").value = oldTransaction.note;

    // Khi nhấn "Thêm", tạo bản ghi mới và đánh dấu bản ghi cũ là đã xóa
    document.getElementById("submit-btn").onclick = async function () {
        // Tạo bản ghi mới với dữ liệu mới
        let newTransaction = {
            amount: parseInt(document.getElementById("amount").value),
            type: document.getElementById("type").value,
            note: document.getElementById("note").value,
            date: new Date().toISOString(),
            status: "active"
        };

        // Đánh dấu bản ghi cũ là đã xóa
        transactions[index].status = "deleted";

        // Gửi bản ghi cũ (đã đánh dấu deleted) lên
        await saveTransaction(transactions[index]);

        // Gửi bản ghi mới (active) lên
        await saveTransaction(newTransaction);

        // Cập nhật lại danh sách
        transactions = await fetchTransactions();
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

    transactions
        .filter(t => t.status !== "deleted") // 🧠 Chỉ hiển thị bản ghi chưa bị xóa
        .forEach((t, index) => {
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
        status: "active" // 🆕 Thêm trường status
    };

    await saveTransaction(transaction);
    transactions = await fetchTransactions(); // Làm mới danh sách
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
