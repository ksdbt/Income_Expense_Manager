const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');
const form = document.getElementById('form');
const transList = document.getElementById('trans');
const balanceDisplay = document.getElementById('balance');
const incAmtDisplay = document.getElementById('inc-amt');
const expAmtDisplay = document.getElementById('exp-amt');
const myChart = document.getElementById('myChart').getContext('2d');

let transactions = [];
let balance = 0;
let chartInstance = null; // Store the chart instance
let currentUser  = null; // Store the current logged-in user

// Function to load transactions for the current user
function loadTransactions() {
    if (currentUser ) {
        transactions = JSON.parse(localStorage.getItem(currentUser )).transactions || [];
    }
}

// Function to save transactions for the current user
function saveTransactions() {
    if (currentUser ) {
        const userData = JSON.parse(localStorage.getItem(currentUser ));
        userData.transactions = transactions;
        localStorage.setItem(currentUser , JSON.stringify(userData));
    }
}

// Function to update the transaction list and balance
function updateTransactionList() {
    transList.innerHTML = '';
    transactions.forEach((transaction, index) => {
        const li = document.createElement('li');
        li.innerHTML = `${transaction.desc}: ₹${transaction.amount.toFixed(2)} <button class="delete-btn" onclick="deleteTransaction(${index})">X</button>`;
        transList.appendChild(li);
    });
}

function updateBalance() {
    balance = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);
    balanceDisplay.innerText = `₹ ${balance.toFixed(2)}`;
    incAmtDisplay.innerText = `₹ ${transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0).toFixed(2)}`;
    expAmtDisplay.innerText = `₹ ${transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0).toFixed(2)}`;
    renderChart();
}

function renderChart() {
    const income = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0);

    // If the chart instance already exists, destroy it before creating a new one
    if (chartInstance) {
        chartInstance.destroy();
    }

    // Create a new chart instance
    chartInstance = new Chart(myChart, {
        type: 'bar',
        data: {
            labels: ['Income', 'Expense'],
            datasets: [{
                label: 'Amount',
                data: [income, Math.abs(expense)],
                backgroundColor: ['#28a745', '#dc3545'],
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

loginBtn.addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Check if the user exists and the password is correct
    const userData = JSON.parse(localStorage.getItem(username));
    if (userData && userData.password === password) {
        currentUser  = username; // Set the current user
        loadTransactions(); // Load transactions for the current user
        document.getElementById('auth').style.display = 'none';
        document.getElementById('ledger').style.display = 'block';
        alert("To add income, just enter the amount as it is. For expenses, enter the amount with a negative sign (e.g., -100).");
        updateTransactionList(); // Show the transaction list if there are any
        updateBalance(); // Update balance display
    } else {
        alert("Incorrect username or password.");
    }
});

logoutBtn.addEventListener('click', () => {
    currentUser  = null; // Clear the current user
    document.getElementById('auth').style.display = 'block';
    document.getElementById('ledger').style.display = 'none';
    transList.innerHTML = ''; // Clear the displayed transaction list
    balanceDisplay.innerText = '₹ 0.00'; // Reset balance display
    incAmtDisplay .innerText = '₹ 0.00'; // Reset income display
    expAmtDisplay.innerText = '₹ 0.00'; // Reset expense display
    if (chartInstance) {
        chartInstance.destroy(); // Destroy the chart instance
    }

    // Reset the username and password fields
    document.getElementById('username').value = ''; // Clear username field
    document.getElementById('password').value = ''; // Clear password field
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const desc = document.getElementById('desc').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const transaction = { desc, amount };
    transactions.push(transaction);
    saveTransactions(); // Save transactions to localStorage
    updateTransactionList();
    updateBalance();
    form.reset();
});

function deleteTransaction(index) {
    if (confirm("Are you sure you want to delete this transaction?")) {
        transactions.splice(index, 1);
        saveTransactions(); // Update localStorage
        updateTransactionList();
        updateBalance();
    }
}

// Call this function when the page loads
window.onload = function() {
    const username = document.getElementById('username').value;
    if (username) {
        currentUser   = username; // Set the current user
        loadTransactions(); // Load transactions for the current user
        if (transactions.length > 0) {
            document.getElementById('auth').style.display = 'none';
            document.getElementById('ledger').style.display = 'block';
            updateTransactionList();
            updateBalance();
        }
    }
};

// Function to handle user signup
signupBtn.addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Check if the username already exists
    if (localStorage.getItem(username)) {
        alert("Username already exists. Please choose a different username.");
    } else {
        // Create a new user object
        const userData = {
            password: password,
            transactions: []
        };
        localStorage.setItem(username, JSON.stringify(userData));
        alert("Signup successful! You can now log in.");
    }
});
