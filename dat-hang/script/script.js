let order = [];

// 
function sanitizeInput(input) {
    return input.replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
}

// 
function addToOrder() {
    let food = document.getElementById("food").value;
    let quantity = document.getElementById("quantity").value;
    let price = document.querySelector("#food option:checked").getAttribute("data-price");

    if (!food || !quantity || !price) {
        alert("Vui lòng chọn món và nhập số lượng!");
        return;
    }

    quantity = parseInt(quantity);
    price = parseInt(price);

    // Kiểm tra số lượng hợp lệ
    if (isNaN(quantity) || quantity <= 0) {
        alert("Số lượng phải là số nguyên dương!");
        return;
    }

    // 
    food = sanitizeInput(food);

    // Thêm vào giỏ hàng
    order.push({ food, quantity, price });
    displayOrder();
    document.getElementById("orderForm").reset(); // Reset form sau khi thêm
}

// 
function displayOrder() {
    let orderList = document.getElementById("orderList");
    orderList.innerHTML = '';
    let total = 0;

    order.forEach((item, index) => {
        let li = document.createElement('li');
        let itemTotalPrice = item.price * item.quantity;

        li.textContent = `${item.food} - Số lượng: ${item.quantity} - Giá: ${itemTotalPrice.toLocaleString("vi-VN")} VND`;

        // 
        let deleteButton = document.createElement('button');
        deleteButton.textContent = "Xóa";
        deleteButton.onclick = function() {
            removeItem(index);
        };

        li.appendChild(deleteButton);
        orderList.appendChild(li);
        total += itemTotalPrice;
    });

    // 
    document.getElementById("totalPrice").innerText = `Tổng tiền: ${total.toLocaleString("vi-VN")} VND`;
}

// 
function removeItem(index) {
    order.splice(index, 1);
    displayOrder();
}

// 
document.getElementById("name").addEventListener("input", function() {
    localStorage.setItem("customer_name", this.value);
});
document.getElementById("phone").addEventListener("input", function() {
    localStorage.setItem("customer_phone", this.value);
});

// 
window.onload = function() {
    document.getElementById("name").value = localStorage.getItem("customer_name") || "";
    document.getElementById("phone").value = localStorage.getItem("customer_phone") || "";
};

// 
const encodedToken = "Nzc4MzA4OTQwM0FBR05wRzZHc2RsRjdWWFZGUFQ4WThZMVhRSkVxQmFoTDFQWQ=="; 
const botToken = atob(encodedToken); // Giải mã khi sử dụng
const chatID = "6249154937"; 

// 
function sendToTelegram() {
    let name = document.getElementById("name").value;
    let phone = document.getElementById("phone").value;

    if (!name || !phone) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    let message = `📌 Đơn hàng mới:\n👤 Khách hàng: ${sanitizeInput(name)}\n📞 SĐT: ${sanitizeInput(phone)}\n\nMón đã đặt:\n`;
    let total = 0;

    order.forEach(item => {
        let itemTotalPrice = item.price * item.quantity;
        message += `🍽️ Món: ${item.food}\n🔢 Số lượng: ${item.quantity}\n💰 Giá: ${itemTotalPrice.toLocaleString("vi-VN")} VND\n\n`;
        total += itemTotalPrice;
    });

    message += `🎯 Tổng tiền: ${total.toLocaleString("vi-VN")} VND`;

    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatID, text: message })
    })
    .then(response => response.json())
    .then(data => {
        if (data.ok) {
            alert("✅ Đơn hàng đã gửi!");
            document.getElementById("orderForm").reset();
            order = [];
            displayOrder();
        } else {
            alert("❌ Gửi thất bại, vui lòng thử lại!");
        }
    })
    .catch(error => {
        alert("❌ Lỗi mạng, vui lòng thử lại!");
        console.error(error);
    });
}

// 
function updatePrice() {
    let selectedFood = document.getElementById("food").selectedOptions[0];
    let price = selectedFood.getAttribute("data-price");
    let quantity = document.getElementById("quantity").value;

    let totalPrice = price * quantity;
    document.getElementById("priceDisplay").innerText = totalPrice.toLocaleString("vi-VN") + " VND";
}
