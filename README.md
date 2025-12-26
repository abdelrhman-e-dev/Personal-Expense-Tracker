# 💰 Personal Expense Tracker

A web-based application that helps you manage your monthly finances by tracking expenses, savings, salary, and carry-over balances with real-time synchronization using Firebase.

---

## 🚀 Features

- 🔐 User authentication (Register / Login) using Firebase Authentication  
- 💵 Monthly salary tracking  
- 🔁 Carry-over balance from previous months  
- ➕ Add expenses and savings from the same form  
- 📉 Remaining balance updates automatically  
- 📊 Separate tracking for:
  - Expenses
  - Savings  
- 🌙 Dark mode (saved in `localStorage`)  
- 🔄 Real-time sync with Firebase Realtime Database  
- 📅 Date-based expense tracking (ready for monthly comparisons)  
- 📱 Accessible from any device (mobile / desktop)  

---

## 🧠 Financial Logic

- **Salary** → Used only for current month spending  
- **Carry-Over** → Savings from the previous month (not added to salary)  
- **Savings** → Added as a special type of expense  
- **Remaining Balance Formula**:


```text
Remaining Balance =
Salary + Carry-Over - Total Expenses - Total Savings
Savings reduce available cash but remain visible as stored money.
``` 
