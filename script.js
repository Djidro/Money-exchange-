document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const homeBtn = document.getElementById('homeBtn');
    const historyBtn = document.getElementById('historyBtn');
    const adminBtn = document.getElementById('adminBtn');
    const transferSection = document.getElementById('transferSection');
    const historySection = document.getElementById('historySection');
    const adminSection = document.getElementById('adminSection');
    const transferForm = document.getElementById('transferForm');
    const adminForm = document.getElementById('adminForm');
    const adminPanel = document.getElementById('adminPanel');
    const amountInput = document.getElementById('amount');
    const transferMethod = document.getElementById('transferMethod');
    const receiverDetails = document.getElementById('receiverDetails');
    const mobileMoneyFields = document.getElementById('mobileMoneyFields');
    const bankFields = document.getElementById('bankFields');
    const paymentInstructions = document.getElementById('paymentInstructions');
    const paymentConfirmed = document.getElementById('paymentConfirmed');
    const submitBtn = document.getElementById('submitBtn');
    const receiverAmount = document.getElementById('receiverAmount');
    const totalAmount = document.getElementById('totalAmount');
    const paymentAmount = document.getElementById('paymentAmount');
    const currentRate = document.getElementById('currentRate');
    const updateRateBtn = document.getElementById('updateRateBtn');
    const newRate = document.getElementById('newRate');
    const transactionTable = document.getElementById('transactionTable').getElementsByTagName('tbody')[0];
    const adminTransactionTable = document.getElementById('adminTransactionTable').getElementsByTagName('tbody')[0];

    // State
    let exchangeRate = 3600; // Default rate: 1 OMR = 3600 RWF
    const transferFee = 2; // Fixed fee in OMR
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    let adminTransactions = JSON.parse(localStorage.getItem('adminTransactions')) || [];
    const adminCredentials = { username: "admin", password: "admin123" };
    const whatsappNumber = "+96878440900"; // Your WhatsApp number

    // Initialize
    loadSavedRate();
    updateRateDisplay();
    loadTransactionHistory();
    loadAdminTransactionHistory();
    startRatePolling(); // Begin checking for rate updates

    // Navigation
    homeBtn.addEventListener('click', () => showSection('transfer'));
    historyBtn.addEventListener('click', () => showSection('history'));
    adminBtn.addEventListener('click', () => showSection('admin'));

    function showSection(section) {
        homeBtn.classList.remove('active');
        historyBtn.classList.remove('active');
        adminBtn.classList.remove('active');
        
        transferSection.classList.remove('active-section');
        historySection.classList.remove('active-section');
        adminSection.classList.remove('active-section');
        
        if (section === 'transfer') {
            homeBtn.classList.add('active');
            transferSection.classList.add('active-section');
        } else if (section === 'history') {
            historyBtn.classList.add('active');
            historySection.classList.add('active-section');
        } else if (section === 'admin') {
            adminBtn.classList.add('active');
            adminSection.classList.add('active-section');
        }
    }

    // Rate Management
    function loadSavedRate() {
        const savedRate = localStorage.getItem('exchangeRate');
        if (savedRate) {
            exchangeRate = parseFloat(savedRate);
            currentRate.textContent = exchangeRate;
            newRate.value = exchangeRate;
        }
    }

    function startRatePolling() {
        // Check for rate changes every 3 seconds
        setInterval(() => {
            const savedRate = localStorage.getItem('exchangeRate');
            if (savedRate && parseFloat(savedRate) !== exchangeRate) {
                exchangeRate = parseFloat(savedRate);
                currentRate.textContent = exchangeRate;
                newRate.value = exchangeRate;
                updateRateDisplay(); // Update calculations if amount is entered
            }
        }, 3000);
    }

    // Transfer Form Logic
    amountInput.addEventListener('input', updateRateDisplay);
    
    transferMethod.addEventListener('change', function() {
        const method = this.value;
        receiverDetails.classList.remove('hidden');
        
        if (method === 'mtn' || method === 'airtel') {
            mobileMoneyFields.classList.remove('hidden');
            bankFields.classList.add('hidden');
        } else if (method === 'bank') {
            bankFields.classList.remove('hidden');
            mobileMoneyFields.classList.add('hidden');
        } else {
            receiverDetails.classList.add('hidden');
        }
    });

    paymentConfirmed.addEventListener('change', function() {
        submitBtn.disabled = !this.checked;
    });

    transferForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const senderName = document.getElementById('senderName').value;
        const senderEmail = document.getElementById('senderEmail').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const method = document.getElementById('transferMethod').value;
        const receiverName = method === 'bank' ? 
            document.getElementById('accountHolder').value : 
            document.getElementById('receiverName').value;
        const receiverContact = method === 'bank' ? 
            '' : document.getElementById('receiverPhone').value;
        const bankName = method === 'bank' ? document.getElementById('bankName').value : '';
        const accountNumber = method === 'bank' ? document.getElementById('accountNumber').value : '';
        
        // Create transaction
        const transaction = {
            id: Date.now(),
            date: new Date().toLocaleString(),
            senderName,
            senderEmail,
            amount,
            fee: transferFee,
            total: amount + transferFee,
            method,
            receiverName,
            receiverContact,
            bankName,
            accountNumber,
            status: 'Pending',
            rate: exchangeRate,
            receivedAmount: amount * exchangeRate
        };
        
        // Save transaction
        transactions.push(transaction);
        adminTransactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        localStorage.setItem('adminTransactions', JSON.stringify(adminTransactions));
        
        // Send WhatsApp notification
        sendWhatsAppNotification(transaction);
        
        // Complete form reset
        resetTransferForm();
        
        // Update history
        loadTransactionHistory();
        loadAdminTransactionHistory();
        
        alert('Transfer submitted successfully! We will process it once payment is confirmed.');
    });

    function resetTransferForm() {
        transferForm.reset();
        receiverDetails.classList.add('hidden');
        mobileMoneyFields.classList.add('hidden');
        bankFields.classList.add('hidden');
        paymentInstructions.classList.add('hidden');
        submitBtn.disabled = true;
        paymentConfirmed.checked = false;
        transferMethod.selectedIndex = 0;
        receiverAmount.textContent = '0';
        totalAmount.textContent = '0';
        paymentAmount.textContent = '0';
    }

    // Admin Functions
    adminForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;
        
        if (username === adminCredentials.username && password === adminCredentials.password) {
            adminPanel.classList.remove('hidden');
            this.reset();
        } else {
            alert('Invalid credentials');
        }
    });

    updateRateBtn.addEventListener('click', function() {
        const rate = parseFloat(newRate.value);
        if (rate && rate > 0) {
            exchangeRate = rate;
            currentRate.textContent = rate;
            localStorage.setItem('exchangeRate', rate.toString());
            alert('Exchange rate updated successfully! All users will see this new rate.');
        } else {
            alert('Please enter a valid rate');
        }
    });

    // Helper Functions
    function updateRateDisplay() {
        const amount = parseFloat(amountInput.value) || 0;
        const total = amount + transferFee;
        
        receiverAmount.textContent = (amount * exchangeRate).toLocaleString();
        totalAmount.textContent = total.toFixed(2);
        paymentAmount.textContent = total.toFixed(2);
        
        if (amount > 0) {
            paymentInstructions.classList.remove('hidden');
        } else {
            paymentInstructions.classList.add('hidden');
        }
    }

    function loadTransactionHistory() {
        transactionTable.innerHTML = '';
        
        if (transactions.length === 0) {
            const row = transactionTable.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 4;
            cell.textContent = 'No transactions found';
            cell.style.textAlign = 'center';
            return;
        }
        
        transactions.forEach(transaction => {
            const row = transactionTable.insertRow();
            row.insertCell(0).textContent = transaction.date;
            row.insertCell(1).textContent = transaction.receiverName;
            row.insertCell(2).textContent = transaction.amount.toFixed(2);
            
            const statusCell = row.insertCell(3);
            statusCell.textContent = transaction.status;
            
            if (transaction.status === 'Completed') {
                statusCell.style.color = '#2ecc71';
            } else if (transaction.status === 'Pending') {
                statusCell.style.color = '#f39c12';
            } else {
                statusCell.style.color = '#e74c3c';
            }
        });
    }

    function loadAdminTransactionHistory() {
        adminTransactionTable.innerHTML = '';
        
        if (adminTransactions.length === 0) {
            const row = adminTransactionTable.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 5;
            cell.textContent = 'No transactions found';
            cell.style.textAlign = 'center';
            return;
        }
        
        adminTransactions.forEach(transaction => {
            const row = adminTransactionTable.insertRow();
            row.insertCell(0).textContent = transaction.date;
            row.insertCell(1).textContent = transaction.senderName;
            row.insertCell(2).textContent = transaction.receiverName;
            row.insertCell(3).textContent = transaction.amount.toFixed(2);
            
            let methodText = '';
            if (transaction.method === 'mtn') methodText = 'MTN Mobile';
            else if (transaction.method === 'airtel') methodText = 'Airtel Money';
            else methodText = 'Bank Transfer';
            
            row.insertCell(4).textContent = methodText;
        });
    }

    function sendWhatsAppNotification(transaction) {
        const formattedDate = new Date(transaction.date).toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).replace(',', '');

        const message = `💰 *Money Transfer Notification* 
        
*Sender Details:*
   - Name: ${transaction.senderName}
   - Email: ${transaction.senderEmail}
   
💸 *Transaction Details:*
   - Amount Sent: ${transaction.amount} OMR
   - Exchange Rate: 1 OMR = ${transaction.rate} RWF
   - Amount Received: ${transaction.receivedAmount.toLocaleString()} RWF
   - Transfer Fee: ${transaction.fee} OMR
   - Total Paid: ${transaction.total} OMR
   
*Receiver Details:*
   - Name: ${transaction.receiverName}
   ${transaction.method === 'bank' ? 
     `- Bank: ${transaction.bankName}\n   - Account: ${transaction.accountNumber}` : 
     `   - Phone: ${transaction.receiverContact}\n   - Method: ${transaction.method === 'mtn' ? 'MTN Mobile Money' : 'Airtel Money'}`}
   
📅 Transaction Date: ${formattedDate}`;

        const formattedPhone = whatsappNumber.replace(/\D/g, '');
        const encodedMessage = encodeURIComponent(message.trim());
        const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
        
        window.open(whatsappUrl, '_blank');
    }
});