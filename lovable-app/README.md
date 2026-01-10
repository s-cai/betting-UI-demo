# Betting Odds Comparison Dashboard

A real-time sports betting odds comparison interface built with React, TypeScript, and Tailwind CSS. This application provides a comprehensive dashboard for comparing odds across multiple sportsbooks, tracking bet history, monitoring account status, and receiving real-time notifications.

## Overview

This is a professional-grade betting interface designed for arbitrage betting and odds comparison. The application features a terminal-inspired dark theme with a multi-panel layout optimized for quick decision-making and real-time data monitoring.

## Features

### 🎯 Core Functionality

- **Multi-Sportsbook Odds Comparison**: Compare odds across 8+ sportsbooks (DraftKings, FanDuel, BetMGM, Caesars, PointsBet, Bet365, Betway, Pinnacle)
- **Real-Time Match Tracking**: Live and pre-match games with scores, innings/quarters, and status indicators
- **Multi-Sport Support**: Football (NFL, NCAAF) and Basketball (NBA, NCAAB)
- **Bet History Tracking**: View recent bets with status indicators (won/lost/pending) and payout information
- **Account Management**: Monitor multiple betting account balances and statuses across platforms
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
  - **League logos**: Only NFL and NBA display official league logos
  - **NCAA leagues**: NCAAF and NCAAB use emojis (🏈 and 🏀 respectively)
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
  - Clickable odds cells for betting actions
  - "Open" status indicators for available markets
  - Sticky table headers for scrolling

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

#### `AccountOverviewBar.tsx`
- **Location**: `src/components/panels/AccountOverviewBar.tsx`
- **Purpose**: Multi-account balance and status overview
- **Features**:
  - Expandable/collapsible bar (128px expanded, 40px collapsed)
  - Total balance across all accounts
  - Account status counts (online/limited/offline)
  - Individual account cards with:
    - Platform name
    - Balance display
    - Status indicator dots
    - Device information
  - Color-coded by status (green/yellow/gray)

### UI Components

The application uses shadcn/ui components built on Radix UI primitives:

- **Toast System**: Custom toast notifications (`toast.tsx`, `toaster.tsx`)
- **Tooltips**: Contextual help tooltips (`tooltip.tsx`)
- **Form Elements**: Input, textarea, label, select components
- **Layout**: Separator, skeleton, progress indicators
- **Utilities**: Aspect ratio, collapsible, breadcrumb components

## Implementation Details

### State Management

- **Local State**: React `useState` hooks for component-level state
- **Routing**: React Router for navigation (currently single-page with 404 handler)
- **Data Fetching**: TanStack Query (React Query) configured for future API integration
- **Theme**: CSS custom properties (CSS variables) for theming

### Data Flow

1. **Match Selection**: User clicks match in `SportsPanel` → updates `selectedMatch` state in `Index.tsx`
2. **Odds Display**: `OddsComparisonGrid` receives `selectedMatch` prop and displays detailed odds
3. **Notifications**: Filtered by type using local state in `NotificationsPanel`
4. **Account Status**: Calculated from mock data arrays in `AccountOverviewBar`

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
- Modern web browser

### Installation

```bash
cd lovable-app
npm install
```

### Development

```bash
npm run dev
```

The application will start on **http://localhost:8080**

### Build

```bash
npm run build
```

Output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
lovable-app/
├── public/                 # Static assets
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── layout/         # Layout components
│   │   │   └── Sidebar.tsx
│   │   ├── panels/         # Main feature panels
│   │   │   ├── AccountOverviewBar.tsx
│   │   │   ├── BetHistoryBar.tsx
│   │   │   ├── NotificationsPanel.tsx
│   │   │   ├── OddsComparisonGrid.tsx
│   │   │   └── SportsPanel.tsx
│   │   └── ui/             # shadcn/ui components
│   ├── hooks/              # Custom React hooks
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/                # Utility functions
│   │   └── utils.ts
│   ├── pages/              # Page components
│   │   ├── Index.tsx       # Main dashboard
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

## Future Enhancements

Potential areas for expansion:

- **Real-time Data**: WebSocket integration for live odds updates
- **Bet Placement**: Integration with sportsbook APIs
- **Arbitrage Calculator**: Automatic ROI calculations
- **Account Management**: Full CRUD operations for accounts
- **Historical Analysis**: Betting performance analytics
- **Multi-language Support**: Internationalization
- **Mobile Responsive**: Optimized mobile layout
- **Dark/Light Theme Toggle**: Theme switching capability

## License

This project is part of a betting UI demo system.
