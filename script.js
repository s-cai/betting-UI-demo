// Sample account data
const accountData = {
    fanduel: [
        {
            id: 'fd1',
            name: 'John Smith',
            balance: 1250.50,
            limit: null,
            phoneOffline: false,
            onHold: false,
            tags: ['VIP', 'Premium'],
            backupCash: 5000.00,
            notes: 'High-value customer, prefers football bets'
        },
        {
            id: 'fd2',
            name: 'Sarah Johnson',
            balance: 850.25,
            limit: 500.00,
            phoneOffline: false,
            onHold: false,
            tags: ['New'],
            backupCash: 2000.00,
            notes: 'New account, monitor activity'
        },
        {
            id: 'fd3',
            name: 'Michael Chen',
            balance: 2100.75,
            limit: null,
            phoneOffline: true,
            onHold: false,
            tags: ['Premium'],
            backupCash: 10000.00,
            notes: 'Phone disconnected, investigate'
        },
        {
            id: 'fd4',
            name: 'Emily Davis',
            balance: 450.00,
            limit: 200.00,
            phoneOffline: false,
            onHold: true,
            tags: [],
            backupCash: 1000.00,
            notes: 'Account on hold pending verification'
        }
    ],
    betmgm: [
        {
            id: 'mgm1',
            name: 'Robert Williams',
            balance: 3200.00,
            limit: null,
            phoneOffline: false,
            onHold: false,
            tags: ['VIP', 'Active'],
            backupCash: 15000.00,
            notes: 'Top customer, frequent bettor'
        },
        {
            id: 'mgm2',
            name: 'Lisa Anderson',
            balance: 675.50,
            limit: 1000.00,
            phoneOffline: false,
            onHold: false,
            tags: ['Premium'],
            backupCash: 3000.00,
            notes: 'Prefers basketball and baseball'
        },
        {
            id: 'mgm3',
            name: 'David Martinez',
            balance: 1200.25,
            limit: null,
            phoneOffline: true,
            onHold: false,
            tags: ['New'],
            backupCash: 5000.00,
            notes: 'Phone offline for 2 days'
        }
    ],
    draftkings: [
        {
            id: 'dk1',
            name: 'Jennifer Taylor',
            balance: 890.00,
            limit: null,
            phoneOffline: false,
            onHold: false,
            tags: ['VIP', 'Premium', 'Active'],
            backupCash: 8000.00,
            notes: 'Very active, multiple daily bets'
        },
        {
            id: 'dk2',
            name: 'Christopher Brown',
            balance: 1500.75,
            limit: 2000.00,
            phoneOffline: false,
            onHold: false,
            tags: ['Premium'],
            backupCash: 6000.00,
            notes: 'Conservative bettor, low risk tolerance'
        },
        {
            id: 'dk3',
            name: 'Amanda Wilson',
            balance: 525.50,
            limit: 500.00,
            phoneOffline: false,
            onHold: true,
            tags: ['Warning'],
            backupCash: 1500.00,
            notes: 'Account flagged for review'
        },
        {
            id: 'dk4',
            name: 'James Lee',
            balance: 2100.00,
            limit: null,
            phoneOffline: true,
            onHold: false,
            tags: ['Premium'],
            backupCash: 12000.00,
            notes: 'Phone offline, check connectivity'
        },
        {
            id: 'dk5',
            name: 'Patricia Garcia',
            balance: 750.25,
            limit: null,
            phoneOffline: false,
            onHold: false,
            tags: ['New'],
            backupCash: 2500.00,
            notes: 'New account setup last week'
        }
    ]
};

const platforms = [
    { id: 'fanduel', name: 'FanDuel', logo: 'resources/fanduel-logo.svg' },
    { id: 'betmgm', name: 'BetMGM', logo: 'resources/betmgm-logo.svg' },
    { id: 'draftkings', name: 'DraftKings', logo: 'resources/draftkings-logo.svg' }
];

let currentEditingAccount = null;
let currentEditingPlatform = null;

// Initialize the page
function init() {
    const container = document.getElementById('platforms-container');
    
    if (!container) {
        console.error('Container not found!');
        return;
    }
    
    console.log('Initializing with platforms:', platforms);
    
    platforms.forEach(platform => {
        const accounts = accountData[platform.id] || [];
        console.log(`Platform ${platform.id} has ${accounts.length} accounts`);
        const platformSection = createPlatformSection(platform, accounts);
        container.appendChild(platformSection);
    });
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
    
    // Sort each group: tradable (not offline, not on-hold) first, then offline/on-hold
    const sortWithinGroup = (group) => {
        return group.sort((a, b) => {
            const aTradable = !a.phoneOffline && !a.onHold;
            const bTradable = !b.phoneOffline && !b.onHold;
            
            // Tradable accounts first
            if (aTradable && !bTradable) return -1;
            if (!aTradable && bTradable) return 1;
            
            // Within same tradability status, sort by balance (descending)
            return b.balance - a.balance;
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
        const card = createAccountCard(account, platformId);
        groupContainer.appendChild(card);
    });
    
    return groupContainer;
}

// Create platform section
function createPlatformSection(platform, accounts) {
    const section = document.createElement('div');
    section.className = 'platform-section';
    
    const header = document.createElement('div');
    header.className = 'platform-header';
    
    const logo = document.createElement('img');
    logo.src = platform.logo;
    logo.alt = `${platform.name} Logo`;
    logo.className = 'platform-logo';
    
    header.appendChild(logo);
    
    const grid = document.createElement('div');
    grid.className = 'accounts-grid';
    
    if (accounts.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = '<p>No accounts available</p>';
        grid.appendChild(emptyState);
    } else {
        const groupedAccounts = groupAccountsByType(accounts);
        
        // Render unlimited accounts group
        if (groupedAccounts.unlimited.length > 0) {
            const groupContainer = createAccountGroup(groupedAccounts.unlimited, platform.id);
            grid.appendChild(groupContainer);
        }
        
        // Render limited accounts group
        if (groupedAccounts.limited.length > 0) {
            const groupContainer = createAccountGroup(groupedAccounts.limited, platform.id);
            grid.appendChild(groupContainer);
        }
    }
    
    section.appendChild(header);
    section.appendChild(grid);
    
    return section;
}

// Create account card
function createAccountCard(account, platformId) {
    const card = document.createElement('div');
    card.className = 'account-card';
    card.dataset.accountId = account.id;
    card.dataset.platformId = platformId;
    
    if (account.phoneOffline) {
        card.classList.add('phone-offline');
    }
    
    // Avatar
    const header = document.createElement('div');
    header.className = 'account-header';
    
    const avatar = document.createElement('div');
    avatar.className = 'account-avatar';
    avatar.textContent = account.name.split(' ').map(n => n[0]).join('');
    
    const info = document.createElement('div');
    info.className = 'account-info';
    
    const name = document.createElement('div');
    name.className = 'account-name';
    name.textContent = account.name;
    
    const status = document.createElement('div');
    status.className = 'account-status';
    
    if (account.onHold) {
        const holdBadge = document.createElement('span');
        holdBadge.className = 'status-badge';
        holdBadge.textContent = '🚫';
        holdBadge.title = 'Account On Hold';
        status.appendChild(holdBadge);
    }
    
    info.appendChild(name);
    info.appendChild(status);
    
    header.appendChild(avatar);
    header.appendChild(info);
    
    // Balance
    const balance = document.createElement('div');
    balance.className = 'account-balance';
    balance.textContent = `$${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    // Limit
    let limit = null;
    if (account.limit !== null) {
        limit = document.createElement('div');
        limit.className = 'account-limit';
        limit.textContent = `Limit: $${account.limit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    
    card.appendChild(header);
    card.appendChild(balance);
    
    if (limit !== null) {
        card.appendChild(limit);
    }
    
    // Tags
    if (account.tags && account.tags.length > 0) {
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'account-tags';
        
        account.tags.forEach(tagText => {
            const tag = document.createElement('span');
            tag.className = `tag ${tagText.toLowerCase()}`;
            tag.textContent = tagText;
            tagsContainer.appendChild(tag);
        });
        
        card.appendChild(tagsContainer);
    }
    
    // Tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'account-tooltip';
    
    const backupCash = document.createElement('div');
    backupCash.className = 'tooltip-section';
    backupCash.innerHTML = `<span class="tooltip-label">Backup Cash:</span>$${account.backupCash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    const notes = document.createElement('div');
    notes.className = 'tooltip-section';
    notes.innerHTML = `<span class="tooltip-label">Notes:</span>${account.notes || 'No notes'}`;
    
    tooltip.appendChild(backupCash);
    tooltip.appendChild(notes);
    
    card.appendChild(tooltip);
    
    // Right-click handler
    card.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        openEditModal(account, platformId);
    });
    
    return card;
}

// Open edit modal
function openEditModal(account, platformId) {
    currentEditingAccount = account;
    currentEditingPlatform = platformId;
    
    const modal = document.getElementById('edit-modal');
    document.getElementById('edit-name').value = account.name;
    document.getElementById('edit-balance').value = account.balance;
    document.getElementById('edit-limit').value = account.limit || '';
    document.getElementById('edit-on-hold').checked = account.onHold;
    document.getElementById('edit-tags').value = account.tags ? account.tags.join(', ') : '';
    document.getElementById('edit-notes').value = account.notes || '';
    
    modal.style.display = 'block';
}

// Close edit modal
function closeEditModal() {
    const modal = document.getElementById('edit-modal');
    modal.style.display = 'none';
    currentEditingAccount = null;
    currentEditingPlatform = null;
}

// Save account changes
function saveAccountChanges(e) {
    e.preventDefault();
    
    if (!currentEditingAccount || !currentEditingPlatform) return;
    
    // Update account data
    currentEditingAccount.balance = parseFloat(document.getElementById('edit-balance').value) || 0;
    const limitValue = document.getElementById('edit-limit').value;
    currentEditingAccount.limit = limitValue ? parseFloat(limitValue) : null;
    currentEditingAccount.onHold = document.getElementById('edit-on-hold').checked;
    
    const tagsValue = document.getElementById('edit-tags').value.trim();
    currentEditingAccount.tags = tagsValue ? tagsValue.split(',').map(t => t.trim()).filter(t => t) : [];
    currentEditingAccount.notes = document.getElementById('edit-notes').value;
    
    // Re-render based on which page we're on
    const container = document.getElementById('platforms-container');
    if (container) {
        // Account management page
        container.innerHTML = '';
        init();
    }
    // For betting page, the reload will be handled by betting.js
    
    closeEditModal();
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing...');
    console.log('Account data:', accountData);
    console.log('Platforms:', platforms);
    
    try {
        init();
        console.log('Initialization complete');
    } catch (error) {
        console.error('Error during initialization:', error);
    }
    
    // Modal close handlers
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
        editForm.addEventListener('submit', saveAccountChanges);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('edit-modal');
        if (e.target === modal) {
            closeEditModal();
        }
    });
});

