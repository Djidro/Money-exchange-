document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const transferForm = document.getElementById('transferForm');
    const paymentInstructions = document.getElementById('paymentInstructions');
    const whatsappBtn = document.getElementById('whatsappBtn');
    const newTransferBtn = document.getElementById('newTransferBtn');
    const methodSelect = document.getElementById('method');
    const bankDetails = document.getElementById('bankDetails');
    const amountInput = document.getElementById('amount');
    const feeElement = document.getElementById('fee');
    const totalElement = document.getElementById('total');
    const rwfAmountElement = document.getElementById('rwfAmount');
    const totalToPayElement = document.getElementById('totalToPay');
    const historyTable = document.getElementById('historyTable').getElementsByTagName('tbody')[0];
    const clearHistoryBtn = document.getElementById('clearHistory');
    const adminWhatsApp = document.getElementById('adminWhatsApp');
    const bankAccount = document.getElementById('bankAccount');
    const exchangeRate = document.getElementById('exchangeRate');
    const saveSettingsBtn = document.getElementById('saveSettings');
    const lightThemeBtn = document.getElementById('lightTheme');
    const darkThemeBtn = document.getElementById('darkTheme');
    const adminPassword = document.getElementById('adminPassword');
    const adminLoginBtn = document.getElementById('adminLogin');
    const adminContent = document.getElementById('adminContent');
    const adminTable = document.getElementById('adminTable').getElementsByTagName('tbody')[0];
    
    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show active tab content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            
            // Refresh history table when history tab is clicked
            if (tabId === 'history') {
                loadHistory();
            }
        });
    });
    
    // Transfer method change
    methodSelect.addEventListener('change', function() {
        if (this.value === 'bank') {
            bankDetails.classList.remove('hidden');
        } else {
            bankDetails.classList.add('hidden');
        }
    });
    
    // Amount calculation
    amountInput.addEventListener('input', calculateAmounts);
    
    function calculateAmounts() {
        const amount = parseFloat(amountInput.value) || 0;
        const fee = 2; // Fixed fee of 2 OMR
        const total = amount + fee;
        const rate = parseFloat(exchangeRate.value) || 3600;
        const rwfAmount = amount * rate;
        
        feeElement.textContent = fee.toFixed(2);
        totalElement.textContent = total.toFixed(2);
        rwfAmountElement.textContent = rwfAmount.toLocaleString();
    }
    
    // Form submission
    transferForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const senderName = document.getElementById('senderName').value;
        const senderEmail = document.getElementById('senderEmail').value;
        const recipientName = document.getElementById('recipientName').value;
        const amount = parseFloat(amountInput.value);
        const method = methodSelect.value;
        const bankName = document.getElementById('bankName')?.value || '';
        const accountNumber = document.getElementById('accountNumber')?.value || '';
        const fee = 2;
        const total = amount + fee;
        const rate = parseFloat(exchangeRate.value) || 3600;
        const rwfAmount = amount * rate;
        
        // Create transfer object
        const transfer = {
            id: Date.now(),
            date: new Date().toLocaleString(),
            senderName,
            senderEmail,
            recipientName,
            amount,
            method,
            bankName,
            accountNumber,
            fee,
            total,
            rwfAmount,
            status: 'Pending',
            reference: 'TR-' + Math.random().toString(36).substr(2, 9).toUpperCase()
        };
        
        // Save to history
        saveTransfer(transfer);
        
        // Show payment instructions
        totalToPayElement.textContent = total.toFixed(2);
        transferForm.classList.add('hidden');
        paymentInstructions.classList.remove('hidden');
        
        // Send email (simulated)
        sendEmailReceipt(transfer);
    });
    
    // New transfer button
    newTransferBtn.addEventListener('click', function() {
        transferForm.reset();
        paymentInstructions.classList.add('hidden');
        transferForm.classList.remove('hidden');
        bankDetails.classList.add('hidden');
    });
    
    // WhatsApp button
    whatsappBtn.addEventListener('click', function() {
        const transfer = getLastTransfer();
        if (transfer) {
            const whatsappNumber = adminWhatsApp.value || '+96878440900';
            const message = `New Transfer Request%0A%0A` +
                           `Sender: ${transfer.senderName}%0A` +
                           `Amount: ${transfer.amount} OMR%0A` +
                           `Recipient: ${transfer.recipientName}%0A` +
                           `Method: ${transfer.method.toUpperCase()}%0A` +
                           `Total to collect: ${transfer.total} OMR%0A` +
                           `Reference: ${transfer.reference}`;
            
            window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
        }
    });
    
    // History functions
    function saveTransfer(transfer) {
        let history = JSON.parse(localStorage.getItem('transferHistory') || '[]');
        history.push(transfer);
        localStorage.setItem('transferHistory', JSON.stringify(history));
    }
    
    function getLastTransfer() {
        const history = JSON.parse(localStorage.getItem('transferHistory') || '[]');
        return history.length > 0 ? history[history.length - 1] : null;
    }
    
    function loadHistory() {
        const history = JSON.parse(localStorage.getItem('transferHistory') || '[]');
        historyTable.innerHTML = '';
        
        history.forEach(transfer => {
            const row = historyTable.insertRow();
            row.innerHTML = `
                <td>${transfer.date}</td>
                <td>${transfer.recipientName}</td>
                <td>${transfer.amount.toFixed(2)}</td>
                <td>${transfer.status}</td>
            `;
        });
    }
    
    // Clear history
    clearHistoryBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear all history?')) {
            localStorage.removeItem('transferHistory');
            loadHistory();
        }
    });
    
    // Settings
    saveSettingsBtn.addEventListener('click', function() {
        localStorage.setItem('adminWhatsApp', adminWhatsApp.value);
        localStorage.setItem('bankAccount', bankAccount.value);
        alert('Settings saved!');
    });
    
    // Load saved settings
    function loadSettings() {
        adminWhatsApp.value = localStorage.getItem('adminWhatsApp') || '+96878440900';
        bankAccount.value = localStorage.getItem('bankAccount') || '0204060924001';
    }
    
    // Theme switcher
    lightThemeBtn.addEventListener('click', function() {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    });
    
    darkThemeBtn.addEventListener('click', function() {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    });
    
    // Load theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
    
    // Admin login
    adminLoginBtn.addEventListener('click', function() {
        // In a real app, use proper authentication
        if (adminPassword.value === 'admin123') {
            adminContent.classList.remove('hidden');
            loadAdminData();
        } else {
            alert('Incorrect password');
        }
    });
    
    // Load admin data
    function loadAdminData() {
        const history = JSON.parse(localStorage.getItem('transferHistory') || '[]');
        adminTable.innerHTML = '';
        
        history.forEach(transfer => {
            const row = adminTable.insertRow();
            row.innerHTML = `
                <td>${transfer.date}</td>
                <td>${transfer.senderName}</td>
                <td>${transfer.recipientName}</td>
                <td>${transfer.amount.toFixed(2)} OMR</td>
                <td>${transfer.method.toUpperCase()}</td>
                <td>${transfer.status}</td>
                <td>
                    <button class="btn small-btn complete-btn" data-id="${transfer.id}">Complete</button>
                </td>
            `;
        });
        
        // Add event listeners to complete buttons
        document.querySelectorAll('.complete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                completeTransfer(id);
            });
        });
    }
    
    // Complete transfer
    function completeTransfer(id) {
        let history = JSON.parse(localStorage.getItem('transferHistory') || '[]');
        history = history.map(transfer => {
            if (transfer.id === id) {
                return {...transfer, status: 'Completed'};
            }
            return transfer;
        });
        
        localStorage.setItem('transferHistory', JSON.stringify(history));
        loadAdminData();
    }
    
    // Simulated email function
    function sendEmailReceipt(transfer) {
        // In a real app, you would use an email service API
        console.log('Email sent to:', transfer.senderEmail);
        console.log('Transfer details:', transfer);
    }
    
    // Initialize
    calculateAmounts();
    loadSettings();
    loadHistory();
});
