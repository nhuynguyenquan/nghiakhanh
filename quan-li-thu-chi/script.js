let transactions = [];

function addTransaction() {
    let amount = document.getElementById("amount").value;
    let type = document.getElementById("type").value;
    let note = document.getElementById("note").value;

    if (amount === "" || isNaN(amount)) {
        alert("Vui lòng nhập số tiền hợp lệ!");
        return;
    }

    let transaction = { amount: parseInt(amount), type, note };
    transactions.push(transaction);
    updateUI();
    saveToLocalStorage();
    sendToTelegram(transaction);
}

function updateUI() {
    let transactionList = document.getElementById("transaction-list");
    let totalIncome = 0;
    let totalExpense = 0;

    transactionList.innerHTML = "";

    transactions.forEach((t, index) => {
        let li = document.createElement("li");
        li.textContent = `${t.type === "income" ? "+" : "-"}${t.amount.toLocaleString("vi-VN")} VND - ${t.note}`;
        transactionList.appendChild(li);

        if (t.type === "income") totalIncome += t.amount;
        else totalExpense += t.amount;
    });

    document.getElementById("total-income").textContent = totalIncome.toLocaleString("vi-VN");
    document.getElementById("total-expense").textContent = totalExpense.toLocaleString("vi-VN");
}

function saveToLocalStorage() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

function loadFromLocalStorage() {
    let savedData = localStorage.getItem("transactions");
    if (savedData) {
        transactions = JSON.parse(savedData);
        updateUI();
    }
}

window.onload = loadFromLocalStorage;
const TELEGRAM_BOT_TOKEN = "7783089403:AAGNpG6GsdlF7VXVfPTW8Y1xQJEqBahL1PY";
const TELEGRAM_CHAT_ID = "6249154937"; 

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
