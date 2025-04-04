let transactions = [];

const API_URL = "https://script.google.com/macros/s/AKfycbx6jHFO-_OQgvG6rjJ_7p0MmsDA99fQzKYBT9Zk4akmZTVOnTHW_ejGJa5qdWV7wXyw/exec";
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
            body: JSON.stringify({ transaction }) // Gửi từng giao dịch riêng lẻ
        });

        let result = await response.text();
        console.log("Phản hồi từ server:", result);
    } catch (error) {
        console.error("❌ Lỗi ghi dữ liệu:", error);
    }
}

// Cập nhật giao diện
function updateUI() {
    let transactionList = document.getElementById("transaction-list");
    let totalIncome = 0;
    let totalExpense = 0;

    transactionList.innerHTML = "";
    transactions.forEach((t) => {
        let li = document.createElement("li");
        li.textContent = `${t.type === "income" ? "+" : "-"}${t.amount.toLocaleString("vi-VN")} VND - ${t.note}`;
        transactionList.appendChild(li);

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

    let transaction = { amount: parseInt(amount), type, note, date: new Date().toISOString() };

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
