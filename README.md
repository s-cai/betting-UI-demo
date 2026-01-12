# Betting Odds Comparison Dashboard

A real-time sports betting odds comparison interface built with React, TypeScript, and Tailwind CSS. This application provides a comprehensive dashboard for comparing odds across multiple sportsbooks, tracking bet history, monitoring account status, and receiving real-time notifications.

## Overview

This is a professional-grade betting interface designed for arbitrage betting and odds comparison. The application features a terminal-inspired dark theme with a multi-panel layout optimized for quick decision-making and real-time data monitoring.

## Features

### 🎯 Core Functionality

- **Multi-Sportsbook Odds Comparison**: Compare odds across 8+ sportsbooks (DraftKings, FanDuel, BetMGM, Caesars, PointsBet, Bet365, Unibet, WynnBET)
- **Real-Time Match Tracking**: Live and pre-match games with scores, innings/quarters, and status indicators
- **Multi-Sport Support**: Football (NFL, NCAAF) and Basketball (NBA, NCAAB)
- **Bet History Tracking**: View batch trades (conceptual big trades) with account-level details. Each batch trade represents a game × line × platform combination, showing all accounts that participated in that trade.
- **Account Management**: Comprehensive account management system with platform selection, filtering, and editing capabilities
- **Smart Notifications**: Real-time alerts for arbitrage opportunities, line movements, game events, and account warnings

### 🎨 User Interface

- **Terminal-Inspired Dark Theme**: Professional dark color scheme optimized for extended viewing
- **Responsive Multi-Panel Layout**: 
  - Slim sidebar navigation (56px width)
  - Central odds comparison grid
  - Right-side sports/match panel
  - Collapsible bet history bar
  - Expandable account overview bar
- **Best Odds Highlighting**: Visual indicators for the best available odds across sportsbooks
- **Custom Scrollbars**: Terminal-style thin scrollbars for a professional look
- **Status Indicators**: Color-coded signals for online/limited/offline accounts and bet statuses

## Component Architecture

### Layout Components

#### `Sidebar.tsx`
- **Location**: `src/components/layout/Sidebar.tsx`
- **Purpose**: Main navigation sidebar with 4 sections (Odds Screen, Accounts, Bet History, Settings)
- **Features**:
  - Icon-based navigation with tooltips
  - Active section highlighting
  - System status indicator at bottom
  - Fixed width: 56px (3.5rem)

### Panel Components

#### `SportsPanel.tsx`
- **Location**: `src/components/panels/SportsPanel.tsx`
- **Purpose**: Displays list of matches/games with odds summary
- **Features**:
  - Sport category filtering (Football 🏈, Basketball 🏀)
  - League subcategories: NFL, NCAAF (under Football), NBA, NCAAB (under Basketball)
  - Live/Prematch toggle
  - Match selection with highlighting
  - Each game displayed as a single unit with both teams and game status
  - Best odds indicators per market (spread, moneyline, total)
  - Score display for live games
- **Logo/Emoji Usage**:
  - **Category buttons**: Football and Basketball use emojis (🏈 and 🏀)
  - **League logos**: Only NFL and NBA display official league logos in league selection tabs
  - **NCAA leagues**: NCAAF and NCAAB use emojis (🏈 and 🏀 respectively) in league selection tabs
- **Game Status Indicators**:
  - ⏳ Hourglass emoji for PRE (prematch) games
  - ⏰ Clock emoji for timeout status during LIVE games
  - Red pulsing dot for normal LIVE games
- **Data Structure**: `Match` interface with spread, moneyline, and total odds

#### `OddsComparisonGrid.tsx`
- **Location**: `src/components/panels/OddsComparisonGrid.tsx`
- **Purpose**: Detailed odds comparison table across multiple sportsbooks
- **Features**:
  - Market tabs (Main Lines, Team Markets, First X Innings, etc.)
  - Side-by-side comparison of 6+ sportsbooks
  - Best odds and average odds columns
  - Clickable odds cells for betting actions (opens BettingDialog)
  - "Open" status indicators for available markets
  - Sticky table headers for scrolling

#### `BettingDialog.tsx`
- **Location**: `src/components/panels/BettingDialog.tsx`
- **Purpose**: Modal dialog for placing bets across multiple accounts
- **Features**:
  - **Pre-filled Information**: Automatically populated with:
    - Game name (from selected match)
    - Platform (from clicked odds column)
    - Market type (Moneyline, Spread, Total)
    - Side (away/home, over/under)
    - Default odds (from clicked odds cell)
  - **Before Bet View**:
    - Account selection with checkboxes
    - Bet amount inputs for each selected account
    - Tag-based account selection (color-coded tags)
    - Distribution tool: Enter total amount and distribute across selected accounts
    - Total bet size calculation
    - "Send All Bets" button
  - **After Bet View**:
    - Status progression tracking: SENT → ACKED → SUCCEEDED/FAILED
    - Real-time status updates with staggered timing
    - Total succeeded vs total sent amount display
    - Individual bet cards showing:
      - Account name and avatar
      - Bet amount
      - Status icon and text
      - Error messages for failed bets
    - Status indicators:
      - ✓ (gray) - Sent to phone
      - ✓ (green) - Acknowledged by phone
      - ✓✓ (green) - Bet succeeded
      - ✕ (red) - Bet failed (with error message)
  - **Failure Rate**: 40% failure rate, 60% success rate for testing
  - **Error Messages**: Random error messages for failed bets (Insufficient funds, Bet limit exceeded, Connection timeout, etc.)

#### `NotificationsPanel.tsx`
- **Location**: `src/components/panels/NotificationsPanel.tsx`
- **Purpose**: Real-time alerts and notifications
- **Features**:
  - Filter by type (All, Opportunities, Alerts, Warnings)
  - Color-coded notification types:
    - **Opportunity**: Green (arbitrage, best odds)
    - **Alert**: Red (line movements, important changes)
    - **Warning**: Yellow (account limits, game pauses)
    - **Info**: Gray (game events, half-time)
  - Grid layout (2 columns)
  - Match context display
  - Time-based sorting

#### `BetHistoryBar.tsx`
- **Location**: `src/components/panels/BetHistoryBar.tsx`
- **Purpose**: Recent betting activity tracker
- **Features**:
  - Collapsible sidebar (240px expanded, 40px collapsed)
  - Status statistics (pending/won/lost counts)
  - Bet details: match, type, odds, stake, payout
  - Status icons with animations
  - Color-coded status indicators

#### `BetHistory.tsx` (Bet History Page)
- **Location**: `src/pages/BetHistory.tsx`
- **Purpose**: Full bet history view with batch trade mental model
- **Mental Model**: 
  - **Conceptual Level**: Big batch trades (game × line × platform)
  - **Implementation Level**: Multiple accounts on the same platform making the same bet
  - When placing a bet, a large amount is spread across many accounts on the same platform
  - Accounts are implementation details of conceptual big trades
- **Features**:
  - **Left Sidebar**: Lists batch trades (not individual account bets)
    - Each item represents one batch trade: game × line × platform
    - Shows aggregate info: total stake, account count, aggregate status
    - Grouped by date
  - **Right Panel**: Detail view showing all accounts in the selected batch trade
    - Reuses the after-bet view from `BettingDialog` for consistency
    - Shows match info with platform at top level
    - Displays "Total Succeeded / Total Sent" across all accounts
    - Grid of account cards showing:
      - Account name and avatar (initials)
      - Individual bet amount
      - Status icon and text (✓✓ won, ✕ failed, ✓ pending)
      - Error screenshots for failed bets
      - Payout information for won bets
  - **Filtering**: Filter batch trades by status (all/pending/won/lost) and search
  - **Statistics**: Counts batch trades (not individual account bets)

#### `AccountOverviewBar.tsx`
- **Location**: `src/components/panels/AccountOverviewBar.tsx`
- **Purpose**: Multi-platform account balance and status aggregation
- **Features**:
  - Expandable/collapsible bar (auto height when expanded, 40px when collapsed)
  - **Header Summary**:
    - Total balance across all platforms and accounts
    - Total account counts by status (online/limited/offline)
  - **Platform Summary Cards**: One card per platform showing:
    - Platform logo and name
    - **Online Accounts**: Balance and count for accounts that are not phone offline and not on hold
    - **Limited Accounts**: Balance and count for accounts that are on hold
    - **Offline Accounts**: Balance and count for accounts with phone offline status
    - Each status shows formatted dollar balance and account count in parentheses
  - **Real-time Updates**: Automatically recalculates when account data changes in the Accounts page
  - **Data Source**: Aggregates from all demo accounts defined in `Accounts.tsx`
  - **Status Logic**:
    - **Online**: `!phoneOffline && !onHold` (green indicator)
    - **Limited**: `onHold === true` (yellow/warning indicator)
    - **Offline**: `phoneOffline === true` (gray indicator)
  - **Supported Platforms**: FanDuel, BetMGM, DraftKings, Caesars, PointsBet, Bet365, Unibet, WynnBET

#### `Accounts.tsx` (Account Management Page)
- **Location**: `src/pages/Accounts.tsx`
- **Purpose**: Full-featured account management interface
- **Access**: Click the Accounts icon (Users) in the left sidebar
- **Features**:
  - **Platform Selection**: Left sidebar allows switching between platforms (FanDuel, BetMGM, DraftKings, Caesars, PointsBet, Bet365, Unibet, WynnBET)
  - **Single Platform View**: Displays accounts for only the selected platform at a time
  - **Account Cards**: Each account displays:
    - Holder full name with avatar (initials)
    - Cash balance (in green, monospace font)
    - Betting limits (for limited accounts, displayed in red)
    - Visual indicators:
      - **Phone Offline**: Entire card is greyed out with grayscale filter
      - **On Hold**: 🚫 emoji badge displayed
      - **Colored Tags**: Visual tags with color coding (VIP, Premium, New, Active, Warning)
  - **Account Grouping**: Accounts are visually grouped by:
    - Unlimited accounts (no betting limit)
    - Limited accounts (with betting limits)
    - Within each group, sorted by tradability (tradable accounts first, then offline/on-hold)
    - Then sorted by balance (descending)
  - **Interactive Features**:
    - **Hover Tooltip**: When hovering over an account card, displays:
      - Backup cash in the bank
      - Custom notes
    - **Right-Click Edit**: Right-click any account card to open an edit modal where you can modify:
      - Cash balance
      - Betting limits (leave empty for unlimited)
      - On hold status (checkbox)
      - Custom colored labels/tags (comma-separated)
      - Custom notes
  - **Filtering System**:
    - **Tag Filtering**: Dynamic tag filters showing only tags available for the selected platform
      - Tags are color-coded to match account card tag colors
      - Multiple tag selection supported
      - Selected tags show checkmark indicator
    - **Limit Status Filtering**: Filter by account limit status
      - All Accounts (default)
      - Unlimited Only
      - Limited Only
    - **Clear Filters**: Button to reset all filters
  - **Layout**:
    - Left sidebar (256px) with platform selection and filters
    - Main content area showing filtered accounts in a responsive grid
    - Right side maintains the Bet History Bar for quick reference

### UI Components

The application uses shadcn/ui components built on Radix UI primitives:

- **Toast System**: Custom toast notifications (`toast.tsx`, `toaster.tsx`)
- **Tooltips**: Contextual help tooltips (`tooltip.tsx`)
- **Form Elements**: Input, textarea, label, select components
- **Layout**: Separator, skeleton, progress indicators
- **Utilities**: Aspect ratio, collapsible, breadcrumb components

## Implementation Details

### Batch Trade Mental Model

The application uses a **batch trade mental model** for bet history:

- **Conceptual Level**: Big batch trades represent a single decision to bet on a game × line × platform combination
  - Example: "GSW @ Phoenix Suns, O 232.5, -108, DraftKings" is one batch trade
  - This represents the user's conceptual decision to place this bet

- **Implementation Level**: Each batch trade is spread across multiple accounts on the same platform
  - A large bet amount is distributed across many accounts
  - Each account makes the same bet (same game, line, odds, platform) but with different amounts
  - Accounts are implementation details - they're how we execute the conceptual big trade

- **Bet History Display**:
  - **List View**: Shows batch trades (not individual account bets)
    - Each item = one batch trade (game × line × platform)
    - Shows aggregate: total stake, account count, aggregate status
  - **Detail View**: When clicking a batch trade, shows all accounts in that batch
    - Reuses the after-bet view from BettingDialog for consistency
    - Shows each account's individual bet amount and status
    - Displays total succeeded / total sent across all accounts

This mental model matches how users think: they make big trades, which are then spread across accounts for execution.

### State Management

- **Local State**: React `useState` hooks for component-level state
- **Routing**: React Router for navigation (currently single-page with 404 handler)
- **Data Fetching**: TanStack Query (React Query) configured for future API integration
- **Theme**: CSS custom properties (CSS variables) for theming

### Data Flow

1. **Match Selection**: User clicks match in `SportsPanel` → updates `selectedMatch` state in `Index.tsx`
2. **Odds Display**: `OddsComparisonGrid` receives `selectedMatch` prop and displays detailed odds
3. **Betting Flow**:
   - User clicks on any odds cell in `OddsComparisonGrid`
   - `BettingDialog` opens with pre-filled game, platform, market, side, and odds
   - User selects accounts and enters bet amounts (or uses distribution tool)
   - User clicks "Send All Bets"
   - Dialog switches to "After Bet View" showing status progression
   - Status updates: SENT → ACKED → SUCCEEDED/FAILED (with 40% failure rate)
   - User can close dialog to return to odds view
4. **Notifications**: Filtered by type using local state in `NotificationsPanel`
5. **Account Status**: 
   - Account data managed in `AccountsContext` (React Context)
   - `AccountOverviewBar` aggregates account data from the shared context
   - Updates automatically when accounts are edited in the Accounts page
   - Calculates per-platform summaries for online/limited/offline statuses

### Styling System

#### Custom CSS Variables
- **Signal Colors**: Positive (green), Negative (red), Warning (yellow), Info (blue)
- **Odds Colors**: Best odds highlighting with custom background
- **Panel System**: Consistent panel backgrounds, borders, and headers
- **Sidebar**: Dedicated color scheme for navigation

#### Tailwind Configuration
- Custom spacing: `sidebar` (3.5rem), `panel-sm` (240px), `panel-md` (280px), `panel-lg` (320px)
- Custom animations: `pulse-glow`, `slide-in-right`, `slide-in-up`
- Custom keyframes for accordion and transitions
- Monospace font (JetBrains Mono) for odds and numbers

#### Utility Classes
- `.terminal-scrollbar`: Custom scrollbar styling
- `.odds-cell`: Clickable odds display cells
- `.odds-cell-best`: Highlighting for best odds
- `.panel` / `.panel-header`: Consistent panel styling
- `.status-dot` / `.status-online` / `.status-limited` / `.status-offline`: Status indicators

### Type Definitions

#### `Match` Interface
```typescript
interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  status: string;
  inning?: string;
  score?: { home: number; away: number };
  spread: { home: string; away: string; best?: "home" | "away" };
  moneyline: { home: string; away: string; best?: "home" | "away" };
  total: { over: string; under: string; line: string; best?: "over" | "under" };
}
```

#### `BookOdds` Interface
```typescript
interface BookOdds {
  book: string;
  logo: string;
  hasOpen?: boolean;
  spread: { away: string; home: string; best?: boolean };
  moneyline: { away: string; home: string; best?: boolean };
  total: { over: string; under: string; best?: boolean };
}
```

## Tech Stack

### Core
- **React 18**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **React Router**: Client-side routing

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing
- **Custom CSS Variables**: Theme system
- **Google Fonts**: Inter (sans-serif) and JetBrains Mono (monospace)

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **shadcn/ui**: Pre-built component system
- **class-variance-authority**: Component variants
- **clsx & tailwind-merge**: Conditional class utilities

### Data & State
- **TanStack Query**: Server state management
- **React Hooks**: Local state management

### Development
- **ESLint**: Code linting
- **TypeScript ESLint**: TypeScript-specific linting
- **SWC**: Fast React refresh

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Modern web browser (see Browser Support section below)

### Installation

1. Install dependencies:
```bash
npm install
```

### Running the Application

1. Start the development server:
```bash
npm run dev
```

2. The application will start on **http://localhost:8080**

3. Open your browser and navigate to the URL

4. You'll see the main dashboard with:
   - **Odds Screen** (default): Compare odds across multiple sportsbooks
   - **Accounts**: Click the Users icon in the left sidebar to manage accounts
   - **Bet History**: View recent betting activity
   - **Settings**: Access application settings

## Deployment

### GitHub Pages

This application is automatically deployed to GitHub Pages using GitHub Actions.

**Live Site**: [https://s-cai.github.io/betting-UI-demo/](https://s-cai.github.io/betting-UI-demo/)

**How it works:**
- Every push to the `master` or `main` branch triggers an automatic build and deployment
- The workflow builds the production bundle and deploys it to GitHub Pages
- The site is available at `https://[username].github.io/betting-UI-demo/`

**Manual Deployment:**
You can also trigger a manual deployment by:
1. Going to the "Actions" tab in your GitHub repository
2. Selecting the "Deploy to GitHub Pages" workflow
3. Clicking "Run workflow"

**Local Production Build:**
To test the production build locally:
```bash
npm run build
npm run preview
```

### Using the Application

#### Account Management View

1. Click the **Accounts** icon (Users) in the left sidebar
2. The demo will display sample accounts for all 8 platforms (FanDuel, BetMGM, DraftKings, Caesars, PointsBet, Bet365, Unibet, WynnBET)
3. **Select a Platform**: Use the left sidebar to switch between platforms
4. **Filter Accounts**: Use tag filters or limit status filters to narrow down accounts
5. **View Account Details**: Hover over account cards to see backup cash and notes
6. **Edit Accounts**: Right-click any account card to edit:
   - Cash balance
   - Betting limits
   - On hold status
   - Custom tags
   - Notes
7. **Account Summary**: Check the bottom bar for aggregated account statistics across all platforms

#### Betting View

1. From the **Odds Screen**, select a match from the right panel
2. Click on any odds cell in the comparison grid
3. The **Betting Dialog** will open with pre-filled information:
   - Game name
   - Platform
   - Market type
   - Side (away/home, over/under)
   - Default odds
4. **Select Accounts**:
   - Check individual account checkboxes
   - Or use tag-based selection buttons to select all accounts with a specific tag
5. **Enter Bet Amounts**:
   - Enter amounts individually for each selected account
   - Or use the distribution tool: enter a total amount and click "Distribute"
6. **Send Bets**: Click "Send All Bets" to submit
7. **Track Status**: After sending, view real-time status updates:
   - ✓ (gray) - Sent to phone
   - ✓ (green) - Acknowledged by phone
   - ✓✓ (green) - Bet succeeded
   - ✕ (red) - Bet failed (hover to see error message)

### Build

Build the application for production:

```bash
npm run build
```

Output will be in the `dist/` directory.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
.
├── public/                 # Static assets
│   ├── favicon.ico
│   ├── placeholder.svg
│   ├── robots.txt
│   └── resources/         # Platform logos
│       ├── fanduel-logo.svg
│       ├── betmgm-logo.svg
│       ├── draftkings-logo.svg
│       ├── caesars-logo.svg
│       ├── pointsbet-logo.svg
│       ├── bet365-logo.svg
│       ├── unibet-logo.svg
│       └── wynnbet-logo.svg
├── src/
│   ├── components/
│   │   ├── layout/         # Layout components
│   │   │   └── Sidebar.tsx
│   │   ├── panels/         # Main feature panels
│   │   │   ├── AccountOverviewBar.tsx
│   │   │   ├── BetHistoryBar.tsx
│   │   │   ├── BettingDialog.tsx
│   │   │   ├── NotificationsPanel.tsx
│   │   │   ├── OddsComparisonGrid.tsx
│   │   │   └── SportsPanel.tsx
│   │   └── ui/             # shadcn/ui components
│   ├── contexts/           # React Context providers
│   │   └── AccountsContext.tsx  # Shared account state
│   ├── hooks/              # Custom React hooks
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/                # Utility functions
│   │   └── utils.ts
│   ├── pages/              # Page components
│   │   ├── Index.tsx       # Main dashboard
│   │   ├── Accounts.tsx    # Account management page
│   │   └── NotFound.tsx
│   ├── App.tsx             # Root component
│   ├── main.tsx            # Entry point
│   ├── index.css           # Global styles & theme
│   └── vite-env.d.ts       # Vite type definitions
├── index.html              # HTML entry point
├── package.json
├── tailwind.config.ts      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

## Key Design Decisions

### Layout Philosophy

The application uses a **dashboard-style layout** optimized for information density:

1. **Fixed Sidebar**: Always visible navigation (56px)
2. **Flexible Center**: Odds grid adapts to available space
3. **Fixed Right Panels**: Sports panel (420px) and bet history (240px) for quick reference
4. **Bottom Bar**: Account overview that can collapse to save space

### Color System

- **Terminal Dark Theme**: Low brightness backgrounds (6-8% lightness) to reduce eye strain
- **Signal Colors**: Semantic colors for betting-specific states (positive/negative/warning)
- **Best Odds Highlighting**: Green background with high contrast for quick identification
- **Status Indicators**: Consistent color coding across all components

### Typography

- **Sans-serif (Inter)**: Primary font for UI text
- **Monospace (JetBrains Mono)**: All odds, numbers, and financial data for better alignment and readability

### Performance Considerations

- **Component Lazy Loading**: Ready for code splitting (React.lazy)
- **Optimized Re-renders**: State management at appropriate component levels
- **Efficient Scrolling**: Custom scrollbars and virtual scrolling ready
- **Memoization Ready**: Components structured for React.memo optimization

## Account Management Details

### Account Data Structure

Each account contains:
- **Basic Info**: ID, holder name, platform association
- **Financial**: Cash balance, betting limit (null for unlimited), backup cash
- **Status**: Phone offline status, on-hold flag
- **Metadata**: Tags array, custom notes

### Account Display Logic

1. **Platform Filtering**: Only accounts from the selected platform are displayed
2. **Tag Filtering**: If tags are selected, only accounts with at least one matching tag are shown
3. **Limit Status Filtering**: Filters accounts by whether they have betting limits
4. **Grouping**: Accounts are grouped into unlimited and limited sections
5. **Sorting**: Within each group, accounts are sorted by:
   - Tradability (tradable accounts first)
   - Balance (descending)

### Tag Color System

Tags use consistent color coding throughout the interface:
- **VIP**: Warning yellow background (`--signal-warning`) with dark text
- **Premium**: Primary blue background with white text
- **New**: Positive green background (`--signal-positive`) with white text
- **Active**: Primary blue background with white text
- **Warning**: Warning yellow background with white text

### Editing Accounts

- Right-click any account card to open the edit modal
- Changes are saved to the shared `AccountsContext` state
- **Real-time Updates**: Account edits immediately reflect in:
  - The Accounts page (local view updates)
  - The AccountOverviewBar (aggregates recalculate automatically)
- All account fields are editable except the holder name (read-only)
- Tag editing supports comma-separated values
- Changes persist in memory until page refresh

### Account Summary Logic

The `AccountOverviewBar` component aggregates account data across all platforms:

1. **Data Source**: Reads from `AccountsContext` which is shared with the Accounts page
2. **Per-Platform Aggregation**: For each platform, calculates:
   - **Online**: Sum of balances and count of accounts where `!phoneOffline && !onHold`
   - **Limited**: Sum of balances and count of accounts where `onHold === true`
   - **Offline**: Sum of balances and count of accounts where `phoneOffline === true`
3. **Total Summary**: Header shows combined totals across all platforms
4. **Automatic Updates**: Uses `useMemo` with `accounts` dependency to recalculate when account data changes
5. **Display Format**: Each platform card shows status breakdowns with formatted dollar amounts and account counts

## Browser Support

The application works in all modern browsers that support:
- **ES6+ JavaScript features** (arrow functions, classes, modules, async/await)
- **CSS Grid and Flexbox**
- **CSS Custom Properties** (CSS variables)
- **React 18** features

### Recommended Browsers

- **Chrome/Edge**: 90+ (recommended)
- **Firefox**: 88+
- **Safari**: 14+
- **Opera**: 76+

### Known Limitations

- Internet Explorer is not supported
- Older mobile browsers may have limited functionality

## Notes

- **Platform Logos**: The logos are custom SVG designs matching each platform's brand colors. Replace them with official logos from each platform's media kit if needed for production use.
- **Sample Data**: Demo account data is included in `Accounts.tsx` for demonstration purposes. All accounts are editable via right-click.
- **State Persistence**: Changes made through the edit modal are saved to React Context state and persist until the page is refreshed. For production, integrate with a backend API for persistent storage.
- **Real-time Updates**: Account edits automatically update the Account Overview Bar at the bottom of the screen via React Context.

## Future Enhancements

Potential areas for expansion:

- **Real-time Data**: WebSocket integration for live odds updates
- **Bet Placement**: Integration with sportsbook APIs
- **Arbitrage Calculator**: Automatic ROI calculations
- **Account Persistence**: Backend integration for saving account changes
- **Historical Analysis**: Betting performance analytics
- **Multi-language Support**: Internationalization
- **Mobile Responsive**: Optimized mobile layout
- **Dark/Light Theme Toggle**: Theme switching capability
- **Bet History Integration**: Link placed bets to bet history tracking
- **Real-time Account Updates**: Update account balances after successful bets

## License

This project is part of a betting UI demo system.
