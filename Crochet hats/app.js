document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("orderForm").addEventListener("submit", placeOrder);
});

// Store user credentials in memory for simplicity (in a real app, this should be done in a database)
let users = {};
let userAddress = "123 Main St, Roodepoort";  // For illustration
let resetCodes = {};
let orders = [];
const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123' };

function register() {
    let newUsername = document.getElementById("newUsername").value;
    let newEmail = document.getElementById("newEmail").value;
    let newPassword = document.getElementById("newPassword").value;
    
    // Password validation with regular expression
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!newUsername || !newEmail || !newPassword) {
        alert("Please fill in all fields.");
        return;
    }

    if (!emailRegex.test(newEmail)) {
        alert("Please enter a valid email address.");
        return;
    }

    if (!passwordRegex.test(newPassword)) {
        alert("Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.");
        return;
    }

    users[newUsername] = { password: newPassword, email: newEmail };
    alert("Registration successful! Please log in.");
    document.getElementById("registerPage").style.display = "none";
    document.getElementById("loginPage").style.display = "block";
}

function showRegister() {
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("registerPage").style.display = "block";
}

function showLogin() {
    document.getElementById("registerPage").style.display = "none";
    document.getElementById("loginPage").style.display = "block";
}

function login() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    
    if (users[username] && users[username].password === password) {
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("orderPage").style.display = "block";
        document.getElementById("userAddress").innerText = userAddress;  // Display user address
    } else {
        alert("Invalid username or password. Please register if you don't have an account.");
    }
}

function forgotPassword() {
    const email = prompt("Enter your registered email to reset your password:");
    if (!email) return;
    // Find user by email
    let foundUser = null;
    for (const username in users) {
        if (users[username].email === email) {
            foundUser = username;
            break;
        }
    }
    if (foundUser) {
        // Generate a 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        resetCodes[email] = { code, username: foundUser };
        alert(`A reset code has been sent to your email: ${email}\n(For demo, your code is: ${code})`);
        // Prompt for code and new password
        const enteredCode = prompt("Enter the reset code sent to your email:");
        if (enteredCode === code) {
            const newPassword = prompt("Enter your new password:");
            // Password validation
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(newPassword)) {
                alert("Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.");
                return;
            }
            users[foundUser].password = newPassword;
            alert("Password reset successful! You can now log in with your new password.");
        } else {
            alert("Incorrect code. Please try again.");
        }
    } else {
        alert("Email not found. Please register or try again.");
    }
}

function forgotUsername() {
    const email = prompt("Enter your registered email to retrieve your username:");
    if (!email) return;
    let foundUser = null;
    for (const username in users) {
        if (users[username].email === email) {
            foundUser = username;
            break;
        }
    }
    if (foundUser) {
        alert(`Your username is: ${foundUser}`);
    } else {
        alert("Email not found. Please register or try again.");
    }
}

function updateDeliveryFee() {
    let deliveryMethod = document.getElementById("deliveryMethod").value;
    let fee = 0;
    if (deliveryMethod === "delivery") {
        fee = 60;
        document.getElementById("pepStore").style.display = "block";
    } else {
        document.getElementById("pepStore").style.display = "none";
    }
    document.getElementById("deliveryFee").innerText = `Delivery Fee: R${fee}`;
}

function togglePaymentForm() {
    let paymentMethod = document.getElementById("paymentMethod").value;
    if (paymentMethod === "online") {
        document.getElementById("cardDetails").style.display = "block";
    } else {
        document.getElementById("cardDetails").style.display = "none";
    }
}

function showAdminLogin() {
    hideAllPages();
    document.getElementById('adminLoginPage').style.display = 'block';
}

function adminLogin() {
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        showAdminOrders();
    } else {
        alert('Invalid admin credentials.');
    }
}

function showAdminOrders() {
    hideAllPages();
    document.getElementById('adminOrdersPage').style.display = 'block';
    renderOrdersTable();
}

function logoutAdmin() {
    hideAllPages();
    document.getElementById('loginPage').style.display = 'block';
}

function renderOrdersTable() {
    const tbody = document.getElementById('ordersTable').querySelector('tbody');
    tbody.innerHTML = '';
    orders.forEach(order => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${order.customerName}</td>
            <td>${order.hatColor}</td>
            <td>${order.hatQuantity}</td>
            <td>${order.selectedHat || ''}</td>
            <td>${order.deliveryMethod}</td>
            <td>${order.deliveryInfo}</td>
            <td>${order.paymentMethod}</td>
        `;
        tbody.appendChild(tr);
    });
}

function hideAllPages() {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
}

// Update placeOrder to save order
function placeOrder(event) {
    event.preventDefault();
    let customerName = document.getElementById("customerName").value;
    let hatColor = document.getElementById("hatColor").value;
    let hatQuantity = document.getElementById("hatQuantity").value;
    let deliveryMethod = document.getElementById("deliveryMethod").value;
    let paymentMethod = document.getElementById("paymentMethod").value;
    let pepStore = document.getElementById("pepStoreName").value;
    let selectedHat = localStorage.getItem("selectedHat");
    let address = userAddress;

    let deliveryInfo = '';
    if (deliveryMethod === "delivery" && pepStore) {
        deliveryInfo = `Pep Store: ${pepStore}`;
    } else if (deliveryMethod === "pickup") {
        deliveryInfo = `Pick Up at: ${address}`;
    }

    // Save order
    orders.push({
        customerName,
        hatColor,
        hatQuantity,
        selectedHat,
        deliveryMethod,
        deliveryInfo,
        paymentMethod
    });

    let receipt = `--- Order Receipt ---\n`;
    receipt += `Name: ${customerName}\n`;
    receipt += `Hat Color: ${hatColor}\n`;
    receipt += `Quantity: ${hatQuantity}\n`;
    if (selectedHat) receipt += `Hat Model: ${selectedHat}\n`;
    receipt += `Delivery Method: ${deliveryMethod}`;
    if (deliveryMethod === "delivery" && pepStore) {
        receipt += ` (Pep Store: ${pepStore})\n`;
    } else if (deliveryMethod === "pickup") {
        receipt += ` (Pick Up at: ${address})\n`;
    } else {
        receipt += `\n`;
    }
    receipt += `Payment Method: ${paymentMethod}\n`;
    receipt += `---------------------`;

    document.getElementById("orderDetails").innerText = receipt;
    document.getElementById("orderPage").style.display = "none";
    document.getElementById("confirmationPage").style.display = "block";
}

function restart() {
    document.getElementById("confirmationPage").style.display = "none";
    document.getElementById("orderPage").style.display = "block";
}

function downloadReceiptPDF() {
    // Check if jsPDF is loaded
    if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
        alert('PDF library not loaded.');
        return;
    }
    // Use jsPDF
    const doc = new (window.jspdf ? window.jspdf.jsPDF : window.jsPDF)();
    const receiptText = document.getElementById("orderDetails").innerText;
    doc.setFont("courier", "normal");
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(receiptText, 180);
    doc.text(lines, 10, 20);
    doc.save("order_receipt.pdf");
}
