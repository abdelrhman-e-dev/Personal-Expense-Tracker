
// ============================================
// FIREBASE CONFIGURATION
// ============================================
const firebaseConfig = {
  apiKey: "AIzaSyBB2HTC42Q3eT_MqEclLYguKYpcQ15aezU",
  authDomain: "personal-expense-tracker-33a3c.firebaseapp.com",
  databaseURL: "https://personal-expense-tracker-33a3c-default-rtdb.firebaseio.com",
  projectId: "personal-expense-tracker-33a3c",
  storageBucket: "personal-expense-tracker-33a3c.firebasestorage.app",
  messagingSenderId: "244593921276",
  appId: "1:244593921276:web:52306496cf53afd4621b79",
  measurementId: "G-8WLCMNJL5J"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// ============================================
// GLOBAL VARIABLES
// ============================================
let currentUser = null;
let financialData = {
  salary: 0,
  carryOver: 0,
  savings: 0,
  totalSpent: 0
};

let expenses = [];

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================
function showAuthError(message) {
  const errorElement = document.getElementById('authError');
  errorElement.textContent = message;
  errorElement.style.display = 'block';

  // Hide success message if shown
  document.getElementById('authSuccess').style.display = 'none';
}

function showAuthSuccess(message) {
  const successElement = document.getElementById('authSuccess');
  successElement.textContent = message;
  successElement.style.display = 'block';

  // Hide error message if shown
  document.getElementById('authError').style.display = 'none';
}

function showExpenseError(message) {
  const errorElement = document.getElementById('expenseError');
  errorElement.textContent = message;
  errorElement.style.display = 'block';

  // Hide success message if shown
  document.getElementById('expenseSuccess').style.display = 'none';

  // Auto-hide after 5 seconds
  setTimeout(() => {
    errorElement.style.display = 'none';
  }, 5000);
}

function showExpenseSuccess(message) {
  const successElement = document.getElementById('expenseSuccess');
  successElement.textContent = message;
  successElement.style.display = 'block';

  // Hide error message if shown
  document.getElementById('expenseError').style.display = 'none';

  // Auto-hide after 3 seconds
  setTimeout(() => {
    successElement.style.display = 'none';
  }, 3000);
}

// Register a new user
function register() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!email || !password) {
    showAuthError('Please enter both email and password');
    return;
  }

  if (password.length < 6) {
    showAuthError('Password must be at least 6 characters');
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      showAuthSuccess('Registration successful!');
      console.log('User registered:', userCredential.user);

      // Initialize user's financial data in the database
      const userId = userCredential.user.uid;
      const userRef = database.ref('users/' + userId);

      const initialData = {
        salary: 0,
        carryOver: 0,
        savings: 0,
        expenses: {}
      };

      userRef.set(initialData)
        .then(() => {
          console.log('Initial user data set in database');
        })
        .catch((error) => {
          console.error('Error setting initial data:', error);
        });
    })
    .catch((error) => {
      console.error('Registration error:', error);
      showAuthError('Registration failed: ' + error.message);
    });
}

// Login existing user
function login() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();


  if (!email || !password) {
    showAuthError('Please enter both email and password');
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      showAuthSuccess('Login successful!');
      console.log('User logged in:', userCredential.user);
    })
    .catch((error) => {
      console.error('Login error:', error);
      showAuthError('Login failed: ' + error.message);
    });
}

// Logout user
function logout() {
  auth.signOut()
    .then(() => {
      console.log('User logged out');
    })
    .catch((error) => {
      console.error('Logout error:', error);
    });
}

// ============================================
// FINANCIAL DATA FUNCTIONS
// ============================================
function updateSalary() {
  const salaryInput = document.getElementById('salaryInput');
  const salary = parseFloat(salaryInput.value) || 0;

  if (salary < 0) {
    alert('Salary cannot be negative');
    return;
  }

  updateFinancialData('salary', salary);
  salaryInput.value = '';
}

function updateCarryOver() {
  const carryOverInput = document.getElementById('carryOverInput');
  const carryOver = parseFloat(carryOverInput.value) || 0;

  if (carryOver < 0) {
    alert('Carry-over cannot be negative');
    return;
  }

  updateFinancialData('carryOver', carryOver);
  carryOverInput.value = '';
}

function updateSavings() {
  const savingsInput = document.getElementById('savingsInput');
  const savings = parseFloat(savingsInput.value) || 0;

  if (savings < 0) {
    alert('Savings cannot be negative');
    return;
  }

  updateFinancialData('savings', savings);
  savingsInput.value = '';
}

function updateFinancialData(field, value) {
  if (!currentUser) return;

  const userRef = database.ref('users/' + currentUser.uid);
  userRef.update({
    [field]: value
  })
    .then(() => {
      console.log(`${field} updated to ${value}`);
    })
    .catch((error) => {
      console.error(`Error updating ${field}:`, error);
      alert(`Failed to update ${field}. Please try again.`);
    });
}

// Calculate total available money
function calculateTotalAvailable() {
  return financialData.salary + financialData.carryOver - financialData.savings;
}

// Calculate remaining balance
function calculateRemainingBalance() {
  return calculateTotalAvailable() - financialData.totalSpent;
}

// Update the dashboard display
function updateDashboard() {
  // Update financial values
  document.getElementById('salaryValue').textContent = `$${financialData.salary.toFixed(2)}`;
  document.getElementById('carryOverValue').textContent = `$${financialData.carryOver.toFixed(2)}`;
  document.getElementById('savingsValue').textContent = `$${financialData.savings.toFixed(2)}`;

  // Calculate and update derived values
  const totalAvailable = calculateTotalAvailable();
  const remainingBalance = calculateRemainingBalance();

  document.getElementById('totalAvailable').textContent = `$${totalAvailable.toFixed(2)}`;
  document.getElementById('totalSpent').textContent = `$${financialData.totalSpent.toFixed(2)}`;
  document.getElementById('remainingBalance').textContent = `$${remainingBalance.toFixed(2)}`;

  // Color code the remaining balance
  const remainingBalanceElement = document.getElementById('remainingBalance');
  if (remainingBalance >= 0) {
    remainingBalanceElement.className = 'card-value card-positive';
  } else {
    remainingBalanceElement.className = 'card-value card-negative';
  }
}

// ============================================
// EXPENSE MANAGEMENT FUNCTIONS
// ============================================
function addExpense() {
  if (!currentUser) return;

  const amountInput = document.getElementById('expenseAmount');
  const descriptionInput = document.getElementById('expenseDescription');
  const categoryInput = document.getElementById('expenseCategory');
  const dateInput = document.getElementById('expenseDate');

  const amount = parseFloat(amountInput.value);
  const description = descriptionInput.value.trim();
  const category = categoryInput.value;
  const date = dateInput.value || new Date().toISOString().split('T')[0];

  // Validate inputs
  if (!amount || amount <= 0) {
    showExpenseError('Please enter a valid amount');
    return;
  }

  if (!description) {
    showExpenseError('Please enter a description');
    return;
  }

  // Check if expense exceeds remaining balance
  const remainingBalance = calculateRemainingBalance();
  if (amount > remainingBalance) {
    showExpenseError(`Expense exceeds remaining balance by $${(amount - remainingBalance).toFixed(2)}`);
    return;
  }

  // Create expense object
  const expense = {
    amount: amount,
    description: description,
    category: category,
    date: date,
    createdAt: new Date().toISOString()
  };

  // Save expense to Firebase
  const userRef = database.ref('users/' + currentUser.uid);
  const expensesRef = userRef.child('expenses');
  const newExpenseRef = expensesRef.push();

  newExpenseRef.set(expense)
    .then(() => {
      console.log('Expense added successfully');
      showExpenseSuccess('Expense added successfully!');

      // Clear form inputs
      amountInput.value = '';
      descriptionInput.value = '';
      dateInput.value = '';
    })
    .catch((error) => {
      console.error('Error adding expense:', error);
      showExpenseError('Failed to add expense. Please try again.');
    });
}

function deleteExpense(expenseId) {
  if (!currentUser || !expenseId) return;

  if (!confirm('Are you sure you want to delete this expense?')) {
    return;
  }

  const expenseRef = database.ref('users/' + currentUser.uid + '/expenses/' + expenseId);
  expenseRef.remove()
    .then(() => {
      console.log('Expense deleted successfully');
    })
    .catch((error) => {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense. Please try again.');
    });
}

function clearAllExpenses() {
  if (!currentUser) return;

  if (!confirm('Are you sure you want to delete ALL expenses? This cannot be undone.')) {
    return;
  }

  const expensesRef = database.ref('users/' + currentUser.uid + '/expenses');
  expensesRef.remove()
    .then(() => {
      console.log('All expenses deleted successfully');
      showExpenseSuccess('All expenses cleared!');
    })
    .catch((error) => {
      console.error('Error clearing expenses:', error);
      alert('Failed to clear expenses. Please try again.');
    });
}

function renderExpenses() {
  // Sort expenses by date (newest first)
  expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Get recent 5 expenses
  const recentExpenses = expenses.slice(0, 5);

  // Update recent expenses list
  const recentExpensesList = document.getElementById('recentExpensesList');
  recentExpensesList.innerHTML = '';

  if (recentExpenses.length === 0) {
    recentExpensesList.innerHTML = '<li class="expense-item empty-message">No expenses added yet</li>';
  } else {
    recentExpenses.forEach(expense => {
      const expenseElement = createExpenseElement(expense);
      recentExpensesList.appendChild(expenseElement);
    });
  }

  // Update all expenses list
  const allExpensesList = document.getElementById('allExpensesList');
  allExpensesList.innerHTML = '';

  if (expenses.length === 0) {
    allExpensesList.innerHTML = '<li class="expense-item empty-message">No expenses added yet</li>';
  } else {
    expenses.forEach(expense => {
      const expenseElement = createExpenseElement(expense);
      allExpensesList.appendChild(expenseElement);
    });
  }
}

function createExpenseElement(expense) {
  const li = document.createElement('li');
  li.className = 'expense-item';
  li.dataset.id = expense.id;

  // Format date for display
  const dateObj = new Date(expense.date);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Determine category class
  const categoryClass = 'category-' + expense.category.toLowerCase();

  li.innerHTML = `
                <div class="expense-details">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span class="expense-amount">$${expense.amount.toFixed(2)}</span>
                        <span>${expense.description}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px; margin-top: 5px;">
                        <span class="expense-category ${categoryClass}">${expense.category}</span>
                        <span style="font-size: 0.9rem; color: #888;">${formattedDate}</span>
                    </div>
                </div>
                <button onclick="deleteExpense('${expense.id}')" class="btn-danger">Delete</button>
            `;

  return li;
}

// ============================================
// DARK MODE FUNCTIONALITY
// ============================================
function initDarkMode() {
  const isDarkMode = localStorage.getItem('darkMode') === 'enabled';
  const darkModeToggle = document.getElementById('darkModeToggle');
  const darkModeText = document.getElementById('darkModeText');

  if (isDarkMode) {
    document.body.classList.add('dark-mode');
    darkModeText.textContent = '☀️ Light';
  } else {
    document.body.classList.remove('dark-mode');
    darkModeText.textContent = '🌙 Dark';
  }

  // Toggle dark mode
  darkModeToggle.addEventListener('click', () => {
    const isDarkMode = document.body.classList.toggle('dark-mode');

    if (isDarkMode) {
      localStorage.setItem('darkMode', 'enabled');
      darkModeText.textContent = '☀️ Light';
    } else {
      localStorage.setItem('darkMode', 'disabled');
      darkModeText.textContent = '🌙 Dark';
    }
  });
}

// ============================================
// FIREBASE REAL-TIME LISTENERS
// ============================================
function setupDatabaseListeners() {
  if (!currentUser) return;

  const userRef = database.ref('users/' + currentUser.uid);

  // Listen for financial data changes
  userRef.on('value', (snapshot) => {
    const userData = snapshot.val();

    if (userData) {
      // Update financial data
      financialData.salary = userData.salary || 0;
      financialData.carryOver = userData.carryOver || 0;
      financialData.savings = userData.savings || 0;

      // Update expenses
      expenses = [];
      financialData.totalSpent = 0;

      if (userData.expenses) {
        Object.keys(userData.expenses).forEach(expenseId => {
          const expense = userData.expenses[expenseId];
          expense.id = expenseId;
          expenses.push(expense);
          financialData.totalSpent += expense.amount;
        });
      }

      // Update UI
      updateDashboard();
      renderExpenses();
    }
  }, (error) => {
    console.error('Database error:', error);
  });
}

// ============================================
// INITIALIZATION AND AUTH STATE LISTENER
// ============================================
function initApp() {
  // Initialize dark mode
  initDarkMode();

  // Set default date to today
  document.getElementById('expenseDate').valueAsDate = new Date();

  // Set up event listeners
  document.getElementById('logoutBtn').addEventListener('click', logout);

  // Listen for auth state changes
  auth.onAuthStateChanged((user) => {
    currentUser = user;

    if (user) {
      // User is signed in
      console.log('User is signed in:', user.email);

      // Update UI for signed-in state
      document.getElementById('userEmail').textContent = user.email;
      document.getElementById('userInfo').style.display = 'flex';
      document.getElementById('mainContent').style.display = 'block';
      document.getElementById('authContent').style.display = 'none';

      // Set up database listeners
      setupDatabaseListeners();
    } else {
      // User is signed out
      console.log('User is signed out');

      // Update UI for signed-out state
      document.getElementById('userInfo').style.display = 'none';
      document.getElementById('mainContent').style.display = 'none';
      document.getElementById('authContent').style.display = 'flex';

      // Clear any error/success messages
      document.getElementById('authError').style.display = 'none';
      document.getElementById('authSuccess').style.display = 'none';

      // Clear local data
      financialData = {
        salary: 0,
        carryOver: 0,
        savings: 0,
        totalSpent: 0
      };
      expenses = [];

      // Reset dashboard
      updateDashboard();
      renderExpenses();
    }
  });
}

// Initialize the app when the page loads
window.addEventListener('DOMContentLoaded', initApp);
