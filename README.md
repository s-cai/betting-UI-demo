# Batch Betting System - UI Demo

A front-end demo of a batch betting system that manages accounts across multiple sports betting platforms (FanDuel, BetMGM, DraftKings).

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

## Getting Started

1. Open `index.html` in a web browser
2. The demo will display sample accounts for all three platforms
3. Hover over account cards to see additional information
4. Right-click any account card to edit its details

## File Structure

```
mock-betting-UI/
├── index.html          # Main HTML structure
├── styles.css          # Styling and layout
├── script.js           # JavaScript functionality and sample data
├── resources/
│   ├── fanduel-logo.svg
│   ├── betmgm-logo.svg
│   ├── draftkings-logo.svg
│   └── README          # Original requirements
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

