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
    const distributeBtn = document.getElementById('distribute-btn');
    
    // Set display values (set by upstream)
    document.getElementById('platform-display').textContent = 'FanDuel';
    document.getElementById('game-display').textContent = DEMO_GAME;
    document.getElementById('market-display').textContent = DEMO_MARKET;
    
    sendAllBtn.addEventListener('click', handleSendAllBets);
    newBetBtn.addEventListener('click', handleNewBet);
    demoBetsBtn.addEventListener('click', handleLoadDemoBets);
    distributeBtn.addEventListener('click', handleDistributeBets);
    
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


// Handle distribute bets
function handleDistributeBets() {
    const totalAmount = parseFloat(document.getElementById('distribution-total').value);
    if (!totalAmount || totalAmount <= 0) {
        alert('Please enter a valid total amount to distribute');
        return;
    }
    
    // Get all selected accounts (checked checkboxes)
    const selectedAccountIds = [];
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
        const accountId = checkbox.id.replace('bet-checkbox-', '');
        selectedAccountIds.push(accountId);
    });
    
    if (selectedAccountIds.length === 0) {
        alert('Please select at least one account to distribute bets across');
        return;
    }
    
    // Get accounts and their max bet sizes
    const accountsWithMax = selectedAccountIds.map(accountId => {
        const account = findAccountById(accountId);
        if (!account) return null;
        const maxBet = calculateMaxBetSize(account);
        return { account, accountId, maxBet };
    }).filter(item => item !== null);
    
    if (accountsWithMax.length === 0) return;
    
    // Distribute evenly, respecting max bet limits
    const perAccount = totalAmount / accountsWithMax.length;
    let remaining = totalAmount;
    const distribution = new Map();
    
    // First pass: assign up to max for each account
    accountsWithMax.forEach(({ accountId, maxBet }) => {
        const amount = Math.min(perAccount, maxBet);
        distribution.set(accountId, amount);
        remaining -= amount;
    });
    
    // Second pass: distribute remaining to accounts that haven't hit their max
    if (remaining > 0) {
        let iterations = 0;
        const maxIterations = 100; // Safety limit
        
        while (remaining > 0.01 && iterations < maxIterations) {
            iterations++;
            const availableAccounts = accountsWithMax.filter(({ accountId, maxBet }) => {
                const currentAmount = distribution.get(accountId) || 0;
                return currentAmount < maxBet;
            });
            
            if (availableAccounts.length === 0) break;
            
            const perRemaining = remaining / availableAccounts.length;
            let distributed = false;
            
            availableAccounts.forEach(({ accountId, maxBet }) => {
                const currentAmount = distribution.get(accountId) || 0;
                const canAdd = Math.min(perRemaining, maxBet - currentAmount);
                if (canAdd > 0.01) {
                    distribution.set(accountId, currentAmount + canAdd);
                    remaining -= canAdd;
                    distributed = true;
                }
            });
            
            if (!distributed) break;
        }
    }
    
    // Apply distribution to UI
    distribution.forEach((amount, accountId) => {
        selectedAccounts.set(accountId, amount);
        const input = document.getElementById(`bet-input-${accountId}`);
        const checkbox = document.getElementById(`bet-checkbox-${accountId}`);
        if (input && checkbox) {
            input.value = amount.toFixed(2);
            input.disabled = false;
            checkbox.checked = true;
        }
    });
    
    // Update tag button states
    updateTagButtonStates();
    
    updateTotalBetAmount();
    updateSendButton();
}

// Load and display accounts for selected platform
function loadAccountsForPlatform(platformId) {
    const accounts = accountData[platformId] || [];
    const groupedAccounts = groupAccountsByType(accounts);
    
    const container = document.getElementById('accounts-list');
    container.innerHTML = '';
    
    // Render unlimited accounts group
    if (groupedAccounts.unlimited.length > 0) {
        const groupContainer = createAccountGroup(groupedAccounts.unlimited, platformId);
        container.appendChild(groupContainer);
    }
    
    // Render limited accounts group
    if (groupedAccounts.limited.length > 0) {
        const groupContainer = createAccountGroup(groupedAccounts.limited, platformId);
        container.appendChild(groupContainer);
    }
    
    // Update tag buttons
    updateTagButtons(platformId);
    
    updateTotalBetAmount();
}

// Get unique tags for a platform
function getUniqueTagsForPlatform(platformId) {
    const accounts = accountData[platformId] || [];
    const tagSet = new Set();
    
    accounts.forEach(account => {
        if (account.tags && account.tags.length > 0) {
            account.tags.forEach(tag => tagSet.add(tag));
        }
    });
    
    return Array.from(tagSet).sort();
}

// Update tag buttons for current platform
function updateTagButtons(platformId) {
    const tagButtonsContainer = document.getElementById('tag-buttons');
    tagButtonsContainer.innerHTML = '';
    
    const tags = getUniqueTagsForPlatform(platformId);
    
    if (tags.length === 0) {
        const noTagsMsg = document.createElement('span');
        noTagsMsg.textContent = 'No tags available for this platform';
        noTagsMsg.style.color = '#6c757d';
        noTagsMsg.style.fontStyle = 'italic';
        tagButtonsContainer.appendChild(noTagsMsg);
        return;
    }
    
    tags.forEach(tag => {
        const tagButton = document.createElement('button');
        tagButton.type = 'button';
        tagButton.className = 'tag-button';
        tagButton.textContent = tag;
        tagButton.dataset.tag = tag;
        tagButton.addEventListener('click', () => handleTagSelection(tag, tagButton));
        tagButtonsContainer.appendChild(tagButton);
    });
}

// Handle tag-based selection
function handleTagSelection(tag, tagButton) {
    const accounts = accountData[currentPlatform] || [];
    const accountsWithTag = accounts.filter(account => 
        account.tags && account.tags.includes(tag)
    );
    
    if (accountsWithTag.length === 0) return;
    
    // Check if all accounts with this tag are already selected
    const allSelected = accountsWithTag.every(account => {
        const checkbox = document.getElementById(`bet-checkbox-${account.id}`);
        return checkbox && checkbox.checked;
    });
    
    // Toggle selection: if all selected, deselect all; otherwise select all
    const shouldSelect = !allSelected;
    
    accountsWithTag.forEach(account => {
        const checkbox = document.getElementById(`bet-checkbox-${account.id}`);
        const betInput = document.getElementById(`bet-input-${account.id}`);
        
        if (checkbox) {
            checkbox.checked = shouldSelect;
            
            if (betInput) {
                betInput.disabled = !shouldSelect;
                
                if (!shouldSelect) {
                    betInput.value = '';
                    selectedAccounts.delete(account.id);
                } else {
                    betInput.focus();
                }
            }
        }
    });
    
    // Update all tag button states
    updateTagButtonStates();
    
    updateTotalBetAmount();
    updateSendButton();
}

// Group accounts by unlimited vs limited, then by tradability
function groupAccountsByType(accounts) {
    const unlimited = [];
    const limited = [];
    
    accounts.forEach(account => {
        if (account.limit === null) {
            unlimited.push(account);
        } else {
            limited.push(account);
        }
    });
    
    // Sort each group: tradable unlimited, tradable limited, then offline/on-hold
    const sortWithinGroup = (group) => {
        return group.sort((a, b) => {
            const aTradable = !a.phoneOffline && !a.onHold;
            const bTradable = !b.phoneOffline && !b.onHold;
            
            // Tradable accounts first
            if (aTradable && !bTradable) return -1;
            if (!aTradable && bTradable) return 1;
            
            // Within tradable, sort by max bet size
            if (aTradable && bTradable) {
                const aMaxBet = calculateMaxBetSize(a);
                const bMaxBet = calculateMaxBetSize(b);
                return bMaxBet - aMaxBet;
            }
            
            // Offline/on-hold at the end, sort by max bet size
            const aMaxBet = calculateMaxBetSize(a);
            const bMaxBet = calculateMaxBetSize(b);
            return bMaxBet - aMaxBet;
        });
    };
    
    return {
        unlimited: sortWithinGroup(unlimited),
        limited: sortWithinGroup(limited)
    };
}

// Create visual group container for accounts
function createAccountGroup(accounts, platformId) {
    const groupContainer = document.createElement('div');
    groupContainer.className = 'account-group';
    
    accounts.forEach(account => {
        const card = createBettingAccountCard(account, platformId);
        groupContainer.appendChild(card);
    });
    
    return groupContainer;
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
    
    // Update tag button states
    updateTagButtonStates();
    
    updateTotalBetAmount();
    updateSendButton();
}

// Update tag button active states based on current selections
function updateTagButtonStates() {
    const accounts = accountData[currentPlatform] || [];
    const tagButtons = document.querySelectorAll('.tag-button');
    
    tagButtons.forEach(tagButton => {
        const tag = tagButton.dataset.tag;
        const accountsWithTag = accounts.filter(account => 
            account.tags && account.tags.includes(tag)
        );
        
        if (accountsWithTag.length === 0) {
            tagButton.classList.remove('active');
            return;
        }
        
        // Check if all accounts with this tag are selected
        const allSelected = accountsWithTag.every(account => {
            const checkbox = document.getElementById(`bet-checkbox-${account.id}`);
            return checkbox && checkbox.checked;
        });
        
        // Tag button is active if all accounts with that tag are selected
        tagButton.classList.toggle('active', allSelected);
    });
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
    // First phase: Update all bets from SENT to ACKED
    // Stagger the ACKED updates slightly for visual effect
    sentBets.forEach((bet, index) => {
        setTimeout(() => {
            if (bet.status === STATUS.SENT) {
                bet.status = STATUS.ACKED;
                renderSentBets();
                updateTotalSucceeded();
            }
        }, 500 + (index * 200)); // Stagger by 200ms per bet
    });
    
    // Second phase: After all bets are ACKED, continue to SUCCEEDED/FAILED
    // Wait for all ACKED updates to complete, then start final phase
    const ackDelay = 500 + (sentBets.length * 200) + 1000; // Wait for all ACKs + 1 second
    
    setTimeout(() => {
        // Process each bet from ACKED to final status
        sentBets.forEach((bet, index) => {
            if (bet.status === STATUS.ACKED) {
                // Random delay for each bet's final status (1-3 seconds)
                const finalDelay = 1000 + Math.random() * 2000;
                
                setTimeout(() => {
                    // 85% success rate, 15% failure rate
                    if (Math.random() > 0.15) {
                        bet.status = STATUS.SUCCEEDED;
                    } else {
                        bet.status = STATUS.FAILED;
                        bet.error = getRandomErrorMessage();
                    }
                    
                    renderSentBets();
                    updateTotalSucceeded();
                }, finalDelay);
            }
        });
    }, ackDelay);
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
    
    // Clear distribution input
    document.getElementById('distribution-total').value = '';
    
    // Switch back to before-bets view
    document.getElementById('before-bets-view').style.display = 'block';
    document.getElementById('after-bets-view').style.display = 'none';
    
    // Reload accounts (this will also reset tag buttons)
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

