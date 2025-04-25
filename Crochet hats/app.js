document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("orderForm").addEventListener("submit", placeOrder);
});

// Store user credentials in memory for simplicity (in a real app, this should be done in a database)
let users = {};
let userAddress = "123 Main St, Roodepoort";  // For illustration

function register() {
    let newUsername = document.getElementById("newUsername").value;
    let newPassword = document.getElementById("newPassword").value;
    
    // Password validation with regular expression
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    if (!newUsername || !newPassword) {
        alert("Please fill in both fields.");
        return;
    }

    if (!passwordRegex.test(newPassword)) {
        alert("Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.");
        return;
    }

    users[newUsername] = newPassword;
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
    
    if (users[username] && users[username] === password) {
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("orderPage").style.display = "block";
        document.getElementById("userAddress").innerText = userAddress;  // Display user address
    } else {
        alert("Invalid username or password. Please register if you don't have an account.");
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

function placeOrder(event) {
    event.preventDefault();
    let hatColor = document.getElementById("hatColor").value;
    let deliveryMethod = document.getElementById("deliveryMethod").value;
    let paymentMethod = document.getElementById("paymentMethod").value;
    let pepStore = document.getElementById("pepStoreName").value;
    let selectedHat = localStorage.getItem("selectedHat");

    if (!selectedHat) {
        alert("Please select a hat before ordering.");
        return;
    }

    let orderDetails = `You ordered a ${hatColor} hat (Model: ${selectedHat}). \nDelivery: ${deliveryMethod} ${pepStore ? `to ${pepStore}` : ""}. \nPayment: ${paymentMethod}.`;

    document.getElementById("orderDetails").innerText = orderDetails;
    document.getElementById("orderPage").style.display = "none";
    document.getElementById("confirmationPage").style.display = "block";
}

function restart() {
    document.getElementById("confirmationPage").style.display = "none";
    document.getElementById("orderPage").style.display = "block";
}
