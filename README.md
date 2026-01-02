# Batch Betting System - UI Demo

A front-end demo of a batch betting system that manages accounts across multiple sports betting platforms (FanDuel, BetMGM, DraftKings).

## Overview

This repo creates a front-end demo of a batch betting system across multiple sports betting platforms.

For each betting platform our system controls many separate user accounts. On trading opportunities we may send the same bet with different amounts to selected accounts for the same platform.

## Features

### Account Management View

- **Platform Sections**: Each betting platform (FanDuel, BetMGM, DraftKings) is displayed with its logo and associated accounts
- **Account Cards**: Each account displays:
  - Holder full name
  - Cash balance (in green)
  - Betting limits (for limited accounts, displayed in red)
  - Visual indicators:
    - **Phone Offline**: Entire card is greyed out
    - **On Hold**: 🚫 emoji badge displayed
    - **Colored Tags**: Visual tags (VIP, Premium, New, Active, Warning)

### Account Display & Grouping

Accounts are displayed with visual grouping by unlimited vs limited accounts. Within each group, accounts are organized as:
- Tradable accounts (not offline, not on-hold) first
- Offline and on-hold accounts at the end

### Interactive Features

- **Hover Tooltip**: When hovering over an account card, displays:
  - Backup cash in the bank
  - Custom notes
- **Right-Click Edit**: Right-click any account card to open an edit modal where you can modify:
  - Cash balance
  - Betting limits
  - On hold status
  - Custom colored labels/tags
  - Custom notes

### Batch Betting View

#### Before Bets

When entering the betting view, the platform, game, and market are already known. Odds are associated but can be optionally overridden.

- All accounts for the platform are listed, grouped by unlimited vs limited accounts, with tradable accounts first and offline/on-hold accounts at the end
- Accounts are sorted by bet size (=min(available cash, limit)) within each group
- The right-click and edit feature works the same as in account management

**Bet Entry:**

- **Individual Entry**: Select an account and enter its bet amount directly
- **Tag-Based Selection**: Select all accounts with a specific tag (e.g., VIP, Premium, New) with one click. Available tags for the current platform are displayed as clickable buttons
- **Distribution**: Select multiple accounts, enter a total amount, and click "Distribute" to automatically distribute the total across selected accounts. After distribution, bet amounts can still be customized individually
- All options are always available in a unified interface
- Total bet size is displayed at the top and updates in real-time
- Click "Send All Bets" button to send all bets

#### After Bets

- Bet sizes are no longer editable
- Only accounts for which bets were sent are displayed in a focused area
- For each bet sent, the amount and current status are displayed using WhatsApp-like status icons:
  - **Sent to phone**: Grey single check mark ✓
  - **Acknowledged by phone**: Green single check mark ✓
  - **Phone succeeded making the bet**: Green double check mark ✓✓
  - **Phone failed**: Red cross ✕
- Real-time update of total succeeded amount out of total bet (e.g., $3500 / $5000)
- Hover over failed bets to see error messages returned by phone

## Getting Started

1. Open `index.html` in a web browser for the Account Management view
2. Open `betting.html` in a web browser for the Betting View
3. The demo will display sample accounts for all three platforms
4. Hover over account cards to see additional information
5. Right-click any account card to edit its details

## File Structure

```
mock-betting-UI/
├── index.html          # Account Management HTML structure
├── betting.html        # Betting View HTML structure
├── styles.css          # Account Management styling and layout
├── betting.css         # Betting View styling
├── script.js           # JavaScript functionality and sample data
├── betting.js          # Betting view JavaScript logic
├── resources/
│   ├── fanduel-logo.svg
│   ├── betmgm-logo.svg
│   └── draftkings-logo.svg
└── README.md           # This file
```

## Technologies Used

- HTML5
- CSS3 (with modern features like CSS Grid, Flexbox, gradients)
- Vanilla JavaScript (no dependencies)

## Browser Support

Works in all modern browsers that support:
- CSS Grid
- Flexbox
- ES6 JavaScript features

## Notes

- The logos are placeholder SVGs. Replace them with official logos from each platform's media kit if needed.
- Sample account data is included in `script.js` for demonstration purposes.
- All changes made through the edit modal are saved to the in-memory data structure and will persist until the page is refreshed.
