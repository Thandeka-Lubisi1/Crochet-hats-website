document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("orderForm").addEventListener("submit", placeOrder);
});

// Remove in-memory users and orders
let userAddress = "123 Main St, Roodepoort";  // For illustration
let resetCodes = {};
const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123' };

// Firebase references
const db = firebase.database();
const auth = firebase.auth();

function register() {
    let newEmail = document.getElementById("newEmail").value;
    let newPassword = document.getElementById("newPassword").value;
    // Password validation with regular expression
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newEmail || !newPassword) {
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
    auth.createUserWithEmailAndPassword(newEmail, newPassword)
        .then(() => {
            alert("Registration successful! Please log in.");
            document.getElementById("registerPage").style.display = "none";
            document.getElementById("loginPage").style.display = "block";
        })
        .catch(error => {
            alert(error.message);
        });
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
    let email = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            document.getElementById("loginPage").style.display = "none";
            document.getElementById("orderPage").style.display = "block";
            document.getElementById("userAddress").innerText = userAddress;
        })
        .catch(error => {
            alert("Invalid email or password. Please register if you don't have an account.");
        });
}

function forgotPassword() {
    const email = prompt("Enter your registered email to reset your password:");
    if (!email) return;
    auth.sendPasswordResetEmail(email)
        .then(() => {
            alert("A password reset email has been sent to: " + email);
        })
        .catch(error => {
            alert("Email not found or error sending reset email.");
        });
}

function forgotUsername() {
    alert("Forgot Username is not supported with email/password login. Please use your email to log in.");
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
    db.ref('orders').once('value', snapshot => {
        const orders = [];
        snapshot.forEach(child => {
            orders.push(child.val());
        });
        renderOrdersTable(orders);
    });
}

function logoutAdmin() {
    hideAllPages();
    document.getElementById('loginPage').style.display = 'block';
}

function renderOrdersTable(orders) {
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

// Update placeOrder to save order in Firebase
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
    // Save order to Firebase
    db.ref('orders').push({
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
