let transactions = [];

function addTransaction() {
    let amount = document.getElementById("amount").value;
    let type = document.getElementById("type").value;
    let note = document.getElementById("note").value;

    if (amount === "" || isNaN(amount)) {
        alert("Vui lòng nhập số tiền hợp lệ!");
        return;
    }

    let transaction = { amount: parseInt(amount), type, note,date: new Date().toISOString() };
    transactions.push(transaction);
    updateUI();
    saveToLocalStorage();
    sendToTelegram(transaction);
    generateChart();
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
function generateChart() {
    let monthlyData = {}; // Lưu tổng tiền thu/chi từng tháng
    let currentYear = new Date().getFullYear();

    // Khởi tạo dữ liệu cho từng tháng (1-12)
    for (let i = 1; i <= 12; i++) {
        monthlyData[i] = { income: 0, expense: 0 };
    }

    // Xử lý dữ liệu từ danh sách giao dịch
    transactions.forEach(tran => {
        let month = new Date(tran.date).getMonth() + 1; // Lấy tháng (1-12)
        if (tran.type === "income") {
            monthlyData[month].income += tran.amount;
        } else {
            monthlyData[month].expense += tran.amount;
        }
    });

    // Chuẩn bị dữ liệu cho biểu đồ
    let labels = Object.keys(monthlyData).map(m => `Tháng ${m}`);
    let incomeData = Object.values(monthlyData).map(m => m.income);
    let expenseData = Object.values(monthlyData).map(m => m.expense);

    // Tạo hoặc cập nhật biểu đồ
    let ctx = document.getElementById("transactionChart").getContext("2d");
    if (window.transactionChart) {
        window.transactionChart.destroy();
    }

    window.transactionChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Thu nhập",
                    backgroundColor: "green",
                    data: incomeData
                },
                {
                    label: "Chi tiêu",
                    backgroundColor: "red",
                    data: expenseData
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "top" }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}
const API_URL = "https://script.google.com/macros/s/AKfycbx6jHFO-_OQgvG6rjJ_7p0MmsDA99fQzKYBT9Zk4akmZTVOnTHW_ejGJa5qdWV7wXyw/exec";

// Lấy dữ liệu từ Google Drive
async function fetchTransactions() {
    try {
        let response = await fetch(API_URL);
        if (!response.ok) throw new Error("Lỗi khi tải dữ liệu!");

        let data = await response.json();
        return data.transactions || [];
    } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
        return [];
    }
}


// Ghi dữ liệu vào Google Drive
async function saveTransaction(transaction) {
    let transactions = await fetchTransactions();
    transactions.push(transaction);

    try {
        let response = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ transactions }),
            headers: { "Content-Type": "application/json" }
        });

        let result = await response.text();
        console.log("Phản hồi từ server:", result);
    } catch (error) {
        console.error("Lỗi ghi dữ liệu:", error);
    }
}

async function loadTransactions() {
    let transactions = await fetchTransactions();
    let transactionList = document.getElementById("transaction-list");
    transactionList.innerHTML = "";

    transactions.forEach(t => {
        let li = document.createElement("li");
        li.textContent = `${t.type === "income" ? "+" : "-"}${t.amount.toLocaleString("vi-VN")} VND - ${t.note}`;
        transactionList.appendChild(li);
    });
}

// Gọi hàm khi tải trang
window.onload = async function () {
    transactions = await fetchTransactions();
    updateUI();
    generateChart();
};
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
    transactions = await fetchTransactions(); // Cập nhật dữ liệu từ Drive
    updateUI();
    generateChart();
}

