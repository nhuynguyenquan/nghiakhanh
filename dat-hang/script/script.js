let order = [];
function sanitizeInput(input) {
    return input.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function addToOrder() {
    let food = document.getElementById("food").value;
    let quantity = document.getElementById("quantity").value;
    let price = document.querySelector("#food option:checked").getAttribute("data-price");

    if (food && quantity && price) {
        food = sanitizeInput(food); //
        quantity = sanitizeInput(quantity); // 
        
        // Thêm món vào giỏ hàng
        order.push({ food, quantity: parseInt(quantity), price: parseInt(price) });
        displayOrder();
        document.getElementById("orderForm").reset(); // Reset form
    } else {
        alert("Vui lòng chọn món và nhập số lượng!");
    }
}

function displayOrder() {
    let orderList = document.getElementById("orderList");
    orderList.innerHTML = ''; // 
    let total = 0; // 

    order.forEach((item, index) => {
        let li = document.createElement('li');
        let itemTotalPrice = item.price * item.quantity; // Tính tổng tiền cho món

        // Hiển thị tên món, số lượng và giá
        li.textContent = `${item.food} - Số lượng: ${item.quantity} - Giá: ${itemTotalPrice.toLocaleString("vi-VN")} VND`;

        // Tạo nút xóa
        let deleteButton = document.createElement('button');
        deleteButton.textContent = "Xóa";
        deleteButton.onclick = function() {
            removeItem(index); // 
        };

        li.appendChild(deleteButton); //
        orderList.appendChild(li); // 

        // 
        total += itemTotalPrice;
    });

    // 
    let totalPrice = document.getElementById("totalPrice");
    totalPrice.innerText = `Tổng tiền: ${total.toLocaleString("vi-VN")} VND`;
}
function removeItem(index) {
    order.splice(index, 1); // 
    displayOrder(); // 
}
// Lưu thông tin khách hàng vào localStorage khi nhập
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
function sanitizeMessage(message) {
    return message.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
const encodedToken = "Nzc4MzA4OTQwM0FBR05wRzZHc2RsRjdWWFZGUFQ4WThZMVhRSkVxQmFoTDFQWQ=="; 
const botToken = atob(encodedToken); 
const chatID = "6249154937";
        function sendToTelegram() {
                let name = document.getElementById("name").value;
                let phone = document.getElementById("phone").value;

                if (!name || !phone) {
                    alert("Vui lòng nhập đầy đủ thông tin!");
                    return;
                }

                let message = `📌 Đơn hàng mới:\n👤 Khách hàng: ${name}\n📞 SĐT: ${phone}\n\nMón đã đặt:\n`;

                let total = 0; //

                order.forEach(item => {
                    let itemTotalPrice = item.price * item.quantity; // Tính tổng tiền cho món
                    message += `🍽️ Món: ${item.food}\n🔢 Số lượng: ${item.quantity}\n💰 Giá: ${itemTotalPrice.toLocaleString("vi-VN")} VND\n\n`;
                    total += itemTotalPrice; // Cộng dồn tổng tiền
                });

                message += `🎯 Tổng tiền: ${total.toLocaleString("vi-VN")} VND`;

                let botToken = "7783089403:AAGNpG6GsdlF7VXVfPTW8Y1xQJEqBahL1PY";  
                let chatID = "6249154937"; // ID chat của bạn

                let url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatID}&text=${encodeURIComponent(message)}`;

                fetch(url).then(response => {
                    if (response.ok) {
                        alert("✅ Đơn hàng đã gửi!");
                        document.getElementById("orderForm").reset();
                        order = [];  // 
                        displayOrder();
                    } else {
                        alert("❌ Gửi thất bại, vui lòng thử lại!");
                    }
                });
            }


function updatePrice() {
    let selectedFood = document.getElementById("food").selectedOptions[0];
    let price = selectedFood.getAttribute("data-price");
    let quantity = document.getElementById("quantity").value;

    let totalPrice = price * quantity;
    document.getElementById("priceDisplay").innerText = totalPrice.toLocaleString("vi-VN") + " VND";
}