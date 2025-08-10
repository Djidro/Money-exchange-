// Exchange rates data
let exchangeRates = {
    rwanda: 3600,
    uganda: 900,
    tanzania: 6200,
    burundi: 500,
    drc: 5000,
    kenya: 350
};

// Currency codes
const currencyCodes = {
    rwanda: 'RWF',
    uganda: 'UGX',
    tanzania: 'TZS',
    burundi: 'BIF',
    drc: 'CDF',
    kenya: 'KES'
};

// Transactions storage
let transactions = [];

// Admin password (change this for security)
const ADMIN_PASSWORD = 'admin123';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    showHome();
});

// Load data from localStorage
function loadData() {
    try {
        const savedRates = localStorage.getItem('exchangeRates');
        if (savedRates) {
            exchangeRates = JSON.parse(savedRates);
            updateRatesDisplay();
        }

        const savedTransactions = localStorage.getItem('transactions');
        if (savedTransactions) {
            transactions = JSON.parse(savedTransactions);
            updateTransactionsList();
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Save data to localStorage
function saveData() {
    try {
        localStorage.setItem('exchangeRates', JSON.stringify(exchangeRates));
        localStorage.setItem('transactions', JSON.stringify(transactions));
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// Navigation functions
function showHome() {
    hideAllSections();
    document.getElementById('homePage').style.display = 'block';
}

function showTransferForm() {
    hideAllSections();
    document.getElementById('transferForm').classList.add('active');
}

function showAdmin() {
    hideAllSections();
    document.getElementById('adminPanel').classList.add('active');
    loadAdminRates();
}

function hideAllSections() {
    document.getElementById('homePage').style.display = 'none';
    document.getElementById('transferForm').classList.remove('active');
    document.getElementById('adminPanel').classList.remove('active');
}

// Toggle receiver fields based on payment method
function toggleReceiverFields() {
    const paymentMethod = document.getElementById('paymentMethod').value;
    const simCardFields = document.getElementById('simCardFields');
    const bankFields = document.getElementById('bankFields');

    // Hide both first
    simCardFields.classList.add('hidden');
    bankFields.classList.add('hidden');

    // Clear required attributes
    clearRequiredFields();

    if (paymentMethod === 'simcard') {
        simCardFields.classList.remove('hidden');
        document.getElementById('receiverName').required = true;
        document.getElementById('receiverContact').required = true;
    } else if (paymentMethod === 'bank') {
        bankFields.classList.remove('hidden');
        document.getElementById('bankName').required = true;
        document.getElementById('bankHolderName').required = true;
        document.getElementById('bankAccountNumber').required = true;
    }
}

function clearRequiredFields() {
    const fields = ['receiverName', 'receiverContact', 'bankName', 'bankHolderName', 'bankAccountNumber'];
    fields.forEach(fieldId => {
        document.getElementById(fieldId).required = false;
    });
}

// Update calculation based on amount and country
function updateCalculation() {
    const amount = parseFloat(document.getElementById('amount').value) || 0;
    const country = document.getElementById('country').value;
    const resultDiv = document.getElementById('calculationResult');
    const receiveAmountSpan = document.getElementById('receiveAmount');
    const totalAmountSpan = document.getElementById('totalAmount');

    if (amount > 0 && country && exchangeRates[country]) {
        const rate = exchangeRates[country];
        const receiveAmount = amount * rate;
        const serviceFee = 2;
        const totalToPay = amount + serviceFee;

        receiveAmountSpan.textContent = `Receiver will get: ${receiveAmount.toLocaleString()} ${currencyCodes[country]}`;
        totalAmountSpan.textContent = totalToPay.toFixed(2);
        resultDiv.classList.remove('hidden');
    } else {
        resultDiv.classList.add('hidden');
    }
}

// Submit transfer form
function submitTransfer(event) {
    event.preventDefault();
    
    try {
        const formData = new FormData(event.target);
        const transferData = Object.fromEntries(formData);
        
        // Validate required fields
        if (!validateTransferForm(transferData)) {
            return;
        }
        
        // Add calculation data
        const amount = parseFloat(transferData.amount);
        const rate = exchangeRates[transferData.country];
        const receiveAmount = amount * rate;
        const totalAmount = amount + 2;
        
        transferData.receiveAmount = receiveAmount;
        transferData.serviceFee = 2;
        transferData.totalAmount = totalAmount;
        transferData.rate = rate;
        transferData.currency = currencyCodes[transferData.country];
        transferData.timestamp = new Date().toISOString();
        transferData.id = Date.now().toString();

        // Add to transactions
        transactions.unshift(transferData);
        saveData();

        // Send WhatsApp message
        sendWhatsAppMessage(transferData);

        // Show success message
        showSuccessMessage('Transfer request submitted successfully! We will process your transfer immediately after payment confirmation.');
        
        // Reset form
        resetTransferForm(event.target);
        
        // Go back to home after delay
        setTimeout(() => {
            showHome();
        }, 2000);
        
    } catch (error) {
        console.error('Error submitting transfer:', error);
        showErrorMessage('An error occurred while submitting your transfer. Please try again.');
    }
}

function validateTransferForm(data) {
    if (!data.senderName || !data.senderContact || !data.country || !data.paymentMethod || !data.amount) {
        showErrorMessage('Please fill in all required fields.');
        return false;
    }

    if (parseFloat(data.amount) < 1) {
        showErrorMessage('Amount must be at least 1 OMR.');
        return false;
    }

    if (data.paymentMethod === 'simcard' && (!data.receiverName || !data.receiverContact)) {
        showErrorMessage('Please fill in receiver details for mobile money transfer.');
        return false;
    }

    if (data.paymentMethod === 'bank' && (!data.bankName || !data.bankHolderName || !data.bankAccountNumber)) {
        showErrorMessage('Please fill in all bank details for bank transfer.');
        return false;
    }

    return true;
}

function resetTransferForm(form) {
    form.reset();
    document.getElementById('calculationResult').classList.add('hidden');
    document.getElementById('simCardFields').classList.add('hidden');
    document.getElementById('bankFields').classList.add('hidden');
    clearRequiredFields();
}

function showSuccessMessage(message) {
    const existingMessage = document.querySelector('.success-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.textContent = message;
    
    const form = document.getElementById('transferForm');
    form.insertBefore(messageDiv, form.firstChild);
}

function showErrorMessage(message) {
    const existingMessage = document.querySelector('.error-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = 'error-message';
    messageDiv.textContent = message;
    
    const form = document.getElementById('transferForm');
    form.insertBefore(messageDiv, form.firstChild);
}

// Send WhatsApp message
function sendWhatsAppMessage(data) {
    const phoneNumber = '96878440900';
    
    let receiverDetails = '';
    if (data.paymentMethod === 'simcard') {
        receiverDetails = `Receiver: ${data.receiverName}\nReceiver Contact: ${data.receiverContact}`;
    } else {
        receiverDetails = `Bank: ${data.bankName}\nAccount Holder: ${data.bankHolderName}\nAccount Number: ${data.bankAccountNumber}`;
    }

    const message = `*NEW MONEY TRANSFER REQUEST*

*Sender Details:*
Name: ${data.senderName}
Contact: ${data.senderContact}

*Transfer Details:*
Amount Sent: ${data.amount} OMR
Destination: ${data.country.toUpperCase()}
Exchange Rate: 1 OMR = ${data.rate} ${data.currency}
Receiver Gets: ${data.receiveAmount.toLocaleString()} ${data.currency}
Service Fee: ${data.serviceFee} OMR
Total to Pay: ${data.totalAmount} OMR

*${data.paymentMethod === 'simcard' ? 'Mobile Money' : 'Bank Transfer'} Details:*
${receiverDetails}

*Payment Method:* ${data.paymentMethod.toUpperCase()}
*Transaction ID:* ${data.id}
*Time:* ${new Date(data.timestamp).toLocaleString()}

Please send payment to: 0204060924001`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Admin functions
function adminLogin() {
    const password = document.getElementById('adminPassword').value;
    if (password === ADMIN_PASSWORD) {
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminContent').classList.add('active');
        loadAdminRates();
        updateTransactionsList();
    } else {
        alert('Incorrect password!');
        document.getElementById('adminPassword').value = '';
    }
}

function adminLogout() {
    document.getElementById('adminLogin').style.display = 'block';
    document.getElementById('adminContent').classList.remove('active');
    document.getElementById('adminPassword').value = '';
}

function loadAdminRates() {
    document.getElementById('adminRateRwanda').value = exchangeRates.rwanda;
    document.getElementById('adminRateUganda').value = exchangeRates.uganda;
    document.getElementById('adminRateTanzania').value = exchangeRates.tanzania;
    document.getElementById('adminRateBurundi').value = exchangeRates.burundi;
    document.getElementById('adminRateDrc').value = exchangeRates.drc;
    document.getElementById('adminRateKenya').value = exchangeRates.kenya;
}

function updateRates() {
    try {
        const newRates = {
            rwanda: parseFloat(document.getElementById('adminRateRwanda').value) || exchangeRates.rwanda,
            uganda: parseFloat(document.getElementById('adminRateUganda').value) || exchangeRates.uganda,
            tanzania: parseFloat(document.getElementById('adminRateTanzania').value) || exchangeRates.tanzania,
            burundi: parseFloat(document.getElementById('adminRateBurundi').value) || exchangeRates.burundi,
            drc: parseFloat(document.getElementById('adminRateDrc').value) || exchangeRates.drc,
            kenya: parseFloat(document.getElementById('adminRateKenya').value) || exchangeRates.kenya
        };

        // Validate rates
        for (const [country, rate] of Object.entries(newRates)) {
            if (rate <= 0 || isNaN(rate)) {
                alert(`Invalid rate for ${country}. Please enter a positive number.`);
                return;
            }
        }

        exchangeRates = newRates;
        saveData();
        updateRatesDisplay();
        alert('Exchange rates updated successfully!');
    } catch (error) {
        console.error('Error updating rates:', error);
        alert('Error updating rates. Please try again.');
    }
}

function updateRatesDisplay() {
    document.getElementById('rate-rwanda').textContent = exchangeRates.rwanda.toLocaleString();
    document.getElementById('rate-uganda').textContent = exchangeRates.uganda.toLocaleString();
    document.getElementById('rate-tanzania').textContent = exchangeRates.tanzania.toLocaleString();
    document.getElementById('rate-burundi').textContent = exchangeRates.burundi.toLocaleString();
    document.getElementById('rate-drc').textContent = exchangeRates.drc.toLocaleString();
    document.getElementById('rate-kenya').textContent = exchangeRates.kenya.toLocaleString();
}

function updateTransactionsList() {
    const transactionsList = document.getElementById('transactionsList');
    
    if (transactions.length === 0) {
        transactionsList.innerHTML = '<p>No transactions yet.</p>';
        return;
    }

    let html = '<table>';
    html += '<tr><th>Date</th><th>Sender</th><th>Contact</th><th>Amount</th><th>Country</th><th>Method</th><th>Status</th></tr>';
    
    transactions.slice(0, 20).forEach(transaction => {
        const date = new Date(transaction.timestamp).toLocaleDateString();
        const time = new Date(transaction.timestamp).toLocaleTimeString();
        
        html += `<tr>
            <td>${date}<br><small>${time}</small></td>
            <td>${transaction.senderName}</td>
            <td>${transaction.senderContact}</td>
            <td>${transaction.amount} OMR<br><small>Gets: ${transaction.receiveAmount.toLocaleString()} ${transaction.currency}</small></td>
            <td>${transaction.country.toUpperCase()}</td>
            <td>${transaction.paymentMethod.toUpperCase()}</td>
            <td><span style="color: orange; font-weight: bold;">Pending</span></td>
        </tr>`;
    });
    
    html += '</table>';
    transactionsList.innerHTML = html;
}

// Utility functions
function formatCurrency(amount, currency) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount) + ' ' + currency;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// Auto-save form data as user types (for better UX)
function autoSaveFormData() {
    const form = document.getElementById('moneyTransferForm');
    if (!form) return;

    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            sessionStorage.setItem('transferFormData', JSON.stringify(data));
        });
    });
}

// Restore form data on page load
function restoreFormData() {
    const savedData = sessionStorage.getItem('transferFormData');
    if (!savedData) return;

    try {
        const data = JSON.parse(savedData);
        const form = document.getElementById('moneyTransferForm');
        
        for (const [key, value] of Object.entries(data)) {
            const input = form.querySelector(`[name="${key}"]`);
            if (input && value) {
                input.value = value;
            }
        }
        
        // Trigger change events to update UI
        if (data.paymentMethod) {
            toggleReceiverFields();
        }
        if (data.amount && data.country) {
            updateCalculation();
        }
    } catch (error) {
        console.error('Error restoring form data:', error);
    }
}

// Clear saved form data after successful submission
function clearSavedFormData() {
    sessionStorage.removeItem('transferFormData');
}

// Enhanced form validation
function validatePhoneNumber(phone) {
    // Basic phone number validation (adjust regex as needed)
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,15}$/;
    return phoneRegex.test(phone);
}

function validateAmount(amount) {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0 && num <= 10000; // Max limit of 10,000 OMR
}

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize auto-save
    setTimeout(autoSaveFormData, 1000);
    
    // Restore form data
    setTimeout(restoreFormData, 500);
    
    // Add enter key support for admin login
    const adminPasswordInput = document.getElementById('adminPassword');
    if (adminPasswordInput) {
        adminPasswordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                adminLogin();
            }
        });
    }
});

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        exchangeRates,
        currencyCodes,
        updateCalculation,
        validatePhoneNumber,
        validateAmount,
        formatCurrency
    };
}