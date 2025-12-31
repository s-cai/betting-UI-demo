// Betting view state
const DEMO_PLATFORM = 'fanduel'; // Set by upstream
const DEMO_GAME = 'Lakers vs Warriors'; // Set by upstream
const DEMO_MARKET = 'Moneyline'; // Set by upstream

let currentPlatform = DEMO_PLATFORM;
let selectedAccounts = new Map(); // accountId -> betAmount
let sentBets = []; // Array of {account, amount, status, error}
let betStatusInterval = null;

// Status constants
const STATUS = {
    SENT: 'sent',
    ACKED: 'acked',
    SUCCEEDED: 'succeeded',
    FAILED: 'failed'
};

// Initialize betting page
document.addEventListener('DOMContentLoaded', () => {
    const sendAllBtn = document.getElementById('send-all-btn');
    const newBetBtn = document.getElementById('new-bet-btn');
    const demoBetsBtn = document.getElementById('demo-bets-btn');
    
    // Set display values (set by upstream)
    document.getElementById('platform-display').textContent = 'FanDuel';
    document.getElementById('game-display').textContent = DEMO_GAME;
    document.getElementById('market-display').textContent = DEMO_MARKET;
    
    sendAllBtn.addEventListener('click', handleSendAllBets);
    newBetBtn.addEventListener('click', handleNewBet);
    demoBetsBtn.addEventListener('click', handleLoadDemoBets);
    
    // Load accounts for the demo platform
    loadAccountsForPlatform(DEMO_PLATFORM);
    
    // Setup edit modal (reuse from account management)
    setupEditModal();
});

// Load demo bets (for testing after-bets workflow)
function handleLoadDemoBets() {
    const accounts = accountData[DEMO_PLATFORM] || [];
    
    // Create demo bets with various statuses
    sentBets = [
        {
            account: accounts[0], // John Smith
            amount: 500.00,
            status: STATUS.SUCCEEDED,
            error: null
        },
        {
            account: accounts[1], // Sarah Johnson
            amount: 300.00,
            status: STATUS.SUCCEEDED,
            error: null
        },
        {
            account: accounts[2], // Michael Chen
            amount: 750.00,
            status: STATUS.ACKED,
            error: null
        },
        {
            account: accounts[3], // Emily Davis
            amount: 200.00,
            status: STATUS.FAILED,
            error: 'Insufficient funds'
        }
    ];
    
    // Simulate status updates for the ones that aren't final
    showAfterBetsView();
    
    // Update the ACKED one to SUCCEEDED after a delay
    setTimeout(() => {
        const ackedBet = sentBets.find(bet => bet.status === STATUS.ACKED);
        if (ackedBet) {
            ackedBet.status = STATUS.SUCCEEDED;
            renderSentBets();
            updateTotalSucceeded();
        }
    }, 2000);
}

// Load and display accounts for selected platform
function loadAccountsForPlatform(platformId) {
    const accounts = accountData[platformId] || [];
    const sortedAccounts = sortAccountsByBetSize(accounts);
    
    const container = document.getElementById('accounts-list');
    container.innerHTML = '';
    
    sortedAccounts.forEach(account => {
        const card = createBettingAccountCard(account, platformId);
        container.appendChild(card);
    });
    
    updateTotalBetAmount();
}

// Sort accounts by bet size (min(available cash, limit))
// On-hold and offline accounts go to the end
function sortAccountsByBetSize(accounts) {
    return accounts.sort((a, b) => {
        // On-hold and offline accounts go to the end
        const aProblematic = a.onHold || a.phoneOffline;
        const bProblematic = b.onHold || b.phoneOffline;
        
        if (aProblematic && !bProblematic) return 1;
        if (!aProblematic && bProblematic) return -1;
        
        // Calculate max bet size for each account
        const aMaxBet = calculateMaxBetSize(a);
        const bMaxBet = calculateMaxBetSize(b);
        
        // Sort by max bet size (descending)
        return bMaxBet - aMaxBet;
    });
}

// Calculate max bet size for an account
function calculateMaxBetSize(account) {
    const availableCash = account.balance;
    const limit = account.limit !== null ? account.limit : Infinity;
    return Math.min(availableCash, limit);
}

// Create betting account card
function createBettingAccountCard(account, platformId) {
    const card = document.createElement('div');
    card.className = 'betting-account-card';
    card.dataset.accountId = account.id;
    card.dataset.platformId = platformId;
    
    if (account.phoneOffline) {
        card.classList.add('phone-offline');
    }
    
    const maxBet = calculateMaxBetSize(account);
    
    // Header
    const header = document.createElement('div');
    header.className = 'betting-account-header';
    
    const avatar = document.createElement('div');
    avatar.className = 'account-avatar';
    avatar.textContent = account.name.split(' ').map(n => n[0]).join('');
    
    const info = document.createElement('div');
    info.className = 'betting-account-info';
    
    const name = document.createElement('div');
    name.className = 'betting-account-name';
    name.textContent = account.name;
    
    const balance = document.createElement('div');
    balance.className = 'betting-account-balance';
    balance.textContent = `Balance: $${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    const status = document.createElement('div');
    status.className = 'betting-account-status';
    
    if (account.onHold) {
        const holdBadge = document.createElement('span');
        holdBadge.className = 'status-badge';
        holdBadge.textContent = '🚫';
        holdBadge.title = 'Account On Hold';
        status.appendChild(holdBadge);
    }
    
    if (account.limit !== null) {
        const limit = document.createElement('div');
        limit.className = 'betting-account-limit';
        limit.textContent = `Limit: $${account.limit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        info.appendChild(limit);
    }
    
    info.appendChild(name);
    info.appendChild(balance);
    info.appendChild(status);
    
    header.appendChild(avatar);
    header.appendChild(info);
    
    // Bet size input
    const betInputContainer = document.createElement('div');
    betInputContainer.className = 'bet-size-input-container';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `bet-checkbox-${account.id}`;
    checkbox.addEventListener('change', (e) => handleAccountSelection(account.id, e.target.checked));
    
    const betInput = document.createElement('input');
    betInput.type = 'number';
    betInput.className = 'bet-size-input';
    betInput.id = `bet-input-${account.id}`;
    betInput.step = '0.01';
    betInput.min = '0';
    betInput.max = maxBet.toFixed(2);
    betInput.placeholder = `Max: $${maxBet.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    betInput.disabled = true;
    betInput.addEventListener('input', () => handleBetAmountChange(account.id, betInput.value));
    
    const maxBetLabel = document.createElement('div');
    maxBetLabel.className = 'max-bet-size';
    maxBetLabel.textContent = `Max bet: $${maxBet.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    betInputContainer.appendChild(checkbox);
    betInputContainer.appendChild(betInput);
    
    card.appendChild(header);
    card.appendChild(betInputContainer);
    card.appendChild(maxBetLabel);
    
    // Right-click handler
    card.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        openEditModal(account, platformId);
    });
    
    return card;
}

// Handle account selection
function handleAccountSelection(accountId, isSelected) {
    const betInput = document.getElementById(`bet-input-${accountId}`);
    betInput.disabled = !isSelected;
    
    if (!isSelected) {
        betInput.value = '';
        selectedAccounts.delete(accountId);
    } else {
        betInput.focus();
    }
    
    updateTotalBetAmount();
    updateSendButton();
}

// Handle bet amount change
function handleBetAmountChange(accountId, amount) {
    const account = findAccountById(accountId);
    if (!account) return;
    
    const maxBet = calculateMaxBetSize(account);
    const betAmount = parseFloat(amount) || 0;
    
    if (betAmount > maxBet) {
        const input = document.getElementById(`bet-input-${accountId}`);
        input.value = maxBet.toFixed(2);
        selectedAccounts.set(accountId, maxBet);
    } else if (betAmount > 0) {
        selectedAccounts.set(accountId, betAmount);
    } else {
        selectedAccounts.delete(accountId);
    }
    
    updateTotalBetAmount();
    updateSendButton();
}

// Update total bet amount display
function updateTotalBetAmount() {
    let total = 0;
    selectedAccounts.forEach(amount => {
        total += amount;
    });
    
    const totalElement = document.getElementById('total-bet-amount');
    totalElement.textContent = `$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Update send button state
function updateSendButton() {
    const sendBtn = document.getElementById('send-all-btn');
    sendBtn.disabled = selectedAccounts.size === 0;
}

// Find account by ID
function findAccountById(accountId) {
    for (const platformId in accountData) {
        const account = accountData[platformId].find(acc => acc.id === accountId);
        if (account) return account;
    }
    return null;
}

// Handle send all bets
function handleSendAllBets() {
    if (selectedAccounts.size === 0) return;
    
    // Create sent bets array
    sentBets = [];
    selectedAccounts.forEach((amount, accountId) => {
        const account = findAccountById(accountId);
        if (account) {
            sentBets.push({
                account: account,
                amount: amount,
                status: STATUS.SENT,
                error: null
            });
        }
    });
    
    // Switch to after-bets view
    showAfterBetsView();
    
    // Simulate status updates
    simulateBetStatusUpdates();
}

// Show after-bets view
function showAfterBetsView() {
    document.getElementById('before-bets-view').style.display = 'none';
    document.getElementById('after-bets-view').style.display = 'block';
    
    const totalSent = sentBets.reduce((sum, bet) => sum + bet.amount, 0);
    document.getElementById('total-sent-amount').textContent = `$${totalSent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    renderSentBets();
    updateTotalSucceeded();
}

// Render sent bets
function renderSentBets() {
    const container = document.getElementById('sent-bets-list');
    container.innerHTML = '';
    
    sentBets.forEach((bet, index) => {
        const card = createSentBetCard(bet, index);
        container.appendChild(card);
    });
}

// Create sent bet card
function createSentBetCard(bet, index) {
    const card = document.createElement('div');
    card.className = 'sent-bet-card';
    
    const header = document.createElement('div');
    header.className = 'sent-bet-header';
    
    const name = document.createElement('div');
    name.className = 'sent-bet-name';
    name.textContent = bet.account.name;
    
    const amount = document.createElement('div');
    amount.className = 'sent-bet-amount';
    amount.textContent = `$${bet.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    header.appendChild(name);
    header.appendChild(amount);
    
    const status = document.createElement('div');
    status.className = 'sent-bet-status';
    
    const statusIcon = document.createElement('div');
    statusIcon.className = `status-icon ${bet.status}`;
    statusIcon.innerHTML = getStatusIcon(bet.status);
    
    const statusText = document.createElement('span');
    statusText.className = 'status-text';
    statusText.textContent = getStatusText(bet.status);
    
    status.appendChild(statusIcon);
    status.appendChild(statusText);
    
    // Error tooltip for failed bets
    if (bet.status === STATUS.FAILED && bet.error) {
        const errorTooltip = document.createElement('div');
        errorTooltip.className = 'error-tooltip';
        errorTooltip.textContent = bet.error;
        card.appendChild(errorTooltip);
    }
    
    card.appendChild(header);
    card.appendChild(status);
    
    return card;
}

// Get status icon (WhatsApp-like)
function getStatusIcon(status) {
    switch (status) {
        case STATUS.SENT:
            return '✓'; // Grey single check
        case STATUS.ACKED:
            return '✓'; // Green single check
        case STATUS.SUCCEEDED:
            return '✓✓'; // Green double check
        case STATUS.FAILED:
            return '✕'; // Red cross
        default:
            return '';
    }
}

// Get status text
function getStatusText(status) {
    switch (status) {
        case STATUS.SENT:
            return 'Sent to phone';
        case STATUS.ACKED:
            return 'Acknowledged by phone';
        case STATUS.SUCCEEDED:
            return 'Bet succeeded';
        case STATUS.FAILED:
            return 'Bet failed';
        default:
            return '';
    }
}

// Simulate bet status updates
function simulateBetStatusUpdates() {
    let updateIndex = 0;
    
    betStatusInterval = setInterval(() => {
        if (updateIndex >= sentBets.length) {
            clearInterval(betStatusInterval);
            return;
        }
        
        const bet = sentBets[updateIndex];
        
        // Simulate status progression
        if (bet.status === STATUS.SENT) {
            bet.status = STATUS.ACKED;
        } else if (bet.status === STATUS.ACKED) {
            // 80% success rate
            if (Math.random() > 0.2) {
                bet.status = STATUS.SUCCEEDED;
            } else {
                bet.status = STATUS.FAILED;
                bet.error = getRandomErrorMessage();
            }
        }
        
        renderSentBets();
        updateTotalSucceeded();
        
        updateIndex++;
    }, 1500); // Update every 1.5 seconds
}

// Get random error message
function getRandomErrorMessage() {
    const errors = [
        'Insufficient funds',
        'Bet limit exceeded',
        'Connection timeout',
        'Invalid bet amount',
        'Account temporarily unavailable',
        'Network error'
    ];
    return errors[Math.floor(Math.random() * errors.length)];
}

// Update total succeeded amount
function updateTotalSucceeded() {
    const succeeded = sentBets
        .filter(bet => bet.status === STATUS.SUCCEEDED)
        .reduce((sum, bet) => sum + bet.amount, 0);
    
    const totalSent = sentBets.reduce((sum, bet) => sum + bet.amount, 0);
    
    document.getElementById('succeeded-amount').textContent = `$${succeeded.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Handle new bet
function handleNewBet() {
    // Clear sent bets
    sentBets = [];
    selectedAccounts.clear();
    
    if (betStatusInterval) {
        clearInterval(betStatusInterval);
        betStatusInterval = null;
    }
    
    // Switch back to before-bets view
    document.getElementById('before-bets-view').style.display = 'block';
    document.getElementById('after-bets-view').style.display = 'none';
    
    // Reload accounts
    if (currentPlatform) {
        loadAccountsForPlatform(currentPlatform);
    }
}

// Setup edit modal (reuse from account management)
function setupEditModal() {
    const closeBtn = document.querySelector('.close');
    const cancelBtn = document.getElementById('cancel-edit');
    const editForm = document.getElementById('edit-form');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeEditModal);
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeEditModal);
    }
    if (editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveAccountChanges(e);
            // Reload accounts if we're in betting view
            if (currentPlatform) {
                loadAccountsForPlatform(currentPlatform);
            }
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('edit-modal');
        if (e.target === modal) {
            closeEditModal();
        }
    });
}

