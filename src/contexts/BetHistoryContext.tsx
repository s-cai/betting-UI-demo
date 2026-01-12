import { createContext, useContext, useState, ReactNode } from "react";

export type League = "NFL" | "NCAAF" | "NBA" | "NCAAB";

export interface Bet {
  id: string;
  match: string;
  type: string;
  odds: string;
  stake: number; // Changed to number for easier calculations
  status: "won" | "lost" | "pending";
  timestamp: number; // Store as timestamp for sorting
  payout?: number;
  platform?: string;
  accountName?: string;
  error?: string; // Error message for failed bets
  errorScreenshot?: string; // For issue #4
  league?: League; // For issue #8
  awayTeam?: string; // For issue #8
  homeTeam?: string; // For issue #8
  timing?: number; // Time in milliseconds from send to completion (per account)
}

interface BetHistoryContextType {
  bets: Bet[];
  addBet: (bet: Omit<Bet, 'id' | 'timestamp'>) => void;
  updateBet: (betId: string, updates: Partial<Bet>) => void;
}

const BetHistoryContext = createContext<BetHistoryContextType | undefined>(undefined);

// Load bets from localStorage on init
const BET_HISTORY_VERSION = '2.3'; // Increment to force reload demo data (per-account timing, no pending bets)
const loadBetsFromStorage = (): Bet[] => {
  try {
    // Check version - if it doesn't match, clear old data and use demo data
    const savedVersion = localStorage.getItem('betting-ui-bet-history-version');
    const saved = localStorage.getItem('betting-ui-bet-history');
    
    if (savedVersion === BET_HISTORY_VERSION && saved) {
      return JSON.parse(saved);
    }
    
    // Version mismatch or no saved data - clear and use demo data
    localStorage.removeItem('betting-ui-bet-history');
    localStorage.setItem('betting-ui-bet-history-version', BET_HISTORY_VERSION);
  } catch {
    // Ignore errors
  }
  // Return mock bets as initial data with full details
  // Each bet group represents a batch event on game x line x platform
  // All bets in a group have the same match, type, odds, and platform
  // All bets have timing data (in milliseconds) and no pending bets
  const baseTime = Date.now();
  return [
    // KC @ BUF - ML KC -175 - FanDuel (batch with 4 accounts, all won)
    { id: "2", match: "KC @ BUF", type: "ML KC", odds: "-175", stake: 1000, status: "won", timestamp: baseTime - 900000, payout: 571, platform: "FanDuel", accountName: "Sarah Johnson", league: "NFL" as League, awayTeam: "KC Chiefs", homeTeam: "Buffalo Bills", timing: 1850 },
    { id: "2a", match: "KC @ BUF", type: "ML KC", odds: "-175", stake: 800, status: "won", timestamp: baseTime - 899500, payout: 457, platform: "FanDuel", accountName: "Maria Rodriguez", league: "NFL" as League, awayTeam: "KC Chiefs", homeTeam: "Buffalo Bills", timing: 2100 },
    { id: "2b", match: "KC @ BUF", type: "ML KC", odds: "-175", stake: 1200, status: "won", timestamp: baseTime - 899000, payout: 686, platform: "FanDuel", accountName: "Ryan O'Connor", league: "NFL" as League, awayTeam: "KC Chiefs", homeTeam: "Buffalo Bills", timing: 1650 },
    { id: "2c", match: "KC @ BUF", type: "ML KC", odds: "-175", stake: 600, status: "won", timestamp: baseTime - 898500, payout: 343, platform: "FanDuel", accountName: "Kevin Thompson", league: "NFL" as League, awayTeam: "KC Chiefs", homeTeam: "Buffalo Bills", timing: 1920 },
    
    // KC @ BUF - ML KC -175 - DraftKings (batch with 3 accounts, all won)
    { id: "2d", match: "KC @ BUF", type: "ML KC", odds: "-175", stake: 900, status: "won", timestamp: baseTime - 898000, payout: 514, platform: "DraftKings", accountName: "Jennifer Taylor", league: "NFL" as League, awayTeam: "KC Chiefs", homeTeam: "Buffalo Bills", timing: 1780 },
    { id: "2e", match: "KC @ BUF", type: "ML KC", odds: "-175", stake: 700, status: "won", timestamp: baseTime - 897500, payout: 400, platform: "DraftKings", accountName: "John Smith", league: "NFL" as League, awayTeam: "KC Chiefs", homeTeam: "Buffalo Bills", timing: 2030 },
    { id: "2f", match: "KC @ BUF", type: "ML KC", odds: "-175", stake: 550, status: "won", timestamp: baseTime - 897000, payout: 314, platform: "DraftKings", accountName: "Patricia Garcia", league: "NFL" as League, awayTeam: "KC Chiefs", homeTeam: "Buffalo Bills", timing: 1890 },
    
    // SF @ DET - ML DET +115 - FanDuel (batch with 4 accounts, mix of won/lost)
    { id: "4", match: "SF @ DET", type: "ML DET", odds: "+115", stake: 600, status: "won", timestamp: baseTime - 3600000, payout: 690, platform: "FanDuel", accountName: "Maria Rodriguez", league: "NFL" as League, awayTeam: "SF 49ers", homeTeam: "Detroit Lions", timing: 2150 },
    { id: "4a", match: "SF @ DET", type: "ML DET", odds: "+115", stake: 550, status: "won", timestamp: baseTime - 3599500, payout: 633, platform: "FanDuel", accountName: "Christopher Brown", league: "NFL" as League, awayTeam: "SF 49ers", homeTeam: "Detroit Lions", timing: 1980 },
    { id: "4b", match: "SF @ DET", type: "ML DET", odds: "+115", stake: 400, status: "lost", timestamp: baseTime - 3599000, platform: "FanDuel", accountName: "Emily Davis", league: "NFL" as League, awayTeam: "SF 49ers", homeTeam: "Detroit Lions", error: "Insufficient funds", errorScreenshot: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iIzFhMWExYSIvPjx0ZXh0IHg9IjE1MCIgeT0iMjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbnN1ZmZpY2llbnQgZnVuZHM8L3RleHQ+PC9zdmc+", timing: 3200 },
    { id: "4c", match: "SF @ DET", type: "ML DET", odds: "+115", stake: 350, status: "lost", timestamp: baseTime - 3598500, platform: "FanDuel", accountName: "Lisa Anderson", league: "NFL" as League, awayTeam: "SF 49ers", homeTeam: "Detroit Lions", error: "Bet limit exceeded", errorScreenshot: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iIzFhMWExYSIvPjx0ZXh0IHg9IjE1MCIgeT0iMjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5CZXQgbGltaXQgZXhjZWVkZWQ8L3RleHQ+PC9zdmc+", timing: 2850 },
    
    // SF @ DET - ML DET +115 - DraftKings (batch with 3 accounts, all won)
    { id: "4d", match: "SF @ DET", type: "ML DET", odds: "+115", stake: 700, status: "won", timestamp: baseTime - 3598000, payout: 805, platform: "DraftKings", accountName: "Jennifer Taylor", league: "NFL" as League, awayTeam: "SF 49ers", homeTeam: "Detroit Lions", timing: 1720 },
    { id: "4e", match: "SF @ DET", type: "ML DET", odds: "+115", stake: 500, status: "won", timestamp: baseTime - 3597500, payout: 575, platform: "DraftKings", accountName: "John Smith", league: "NFL" as League, awayTeam: "SF 49ers", homeTeam: "Detroit Lions", timing: 1950 },
    { id: "4f", match: "SF @ DET", type: "ML DET", odds: "+115", stake: 450, status: "won", timestamp: baseTime - 3597000, payout: 518, platform: "DraftKings", accountName: "Kevin Thompson", league: "NFL" as League, awayTeam: "SF 49ers", homeTeam: "Detroit Lions", timing: 2080 },
    
    // MIA @ NYK - Spread -1.5 -110 - FanDuel (batch with 3 accounts, all won)
    { id: "5", match: "MIA @ NYK", type: "Spread -1.5", odds: "-110", stake: 800, status: "won", timestamp: baseTime - 7200000, payout: 727, platform: "FanDuel", accountName: "Daniel Kim", league: "NBA" as League, awayTeam: "Miami Heat", homeTeam: "Milwaukee Bucks", timing: 1870 },
    { id: "5a", match: "MIA @ NYK", type: "Spread -1.5", odds: "-110", stake: 600, status: "won", timestamp: baseTime - 7199500, payout: 545, platform: "FanDuel", accountName: "Thomas Anderson", league: "NBA" as League, awayTeam: "Miami Heat", homeTeam: "Milwaukee Bucks", timing: 2010 },
    { id: "5b", match: "MIA @ NYK", type: "Spread -1.5", odds: "-110", stake: 450, status: "won", timestamp: baseTime - 7199000, payout: 409, platform: "FanDuel", accountName: "Victoria Sterling", league: "NBA" as League, awayTeam: "Miami Heat", homeTeam: "Milwaukee Bucks", timing: 1760 },
    
    // LAL @ BOS - Spread +2.5 -110 - DraftKings (batch with 3 accounts, all won)
    { id: "1", match: "LAL @ BOS", type: "Spread +2.5", odds: "-110", stake: 500, status: "won", timestamp: baseTime - 120000, payout: 455, platform: "DraftKings", accountName: "John Smith", league: "NBA" as League, awayTeam: "LA Lakers", homeTeam: "Boston Celtics", timing: 1940 },
    { id: "1a", match: "LAL @ BOS", type: "Spread +2.5", odds: "-110", stake: 750, status: "won", timestamp: baseTime - 119500, payout: 682, platform: "DraftKings", accountName: "Jennifer Taylor", league: "NBA" as League, awayTeam: "LA Lakers", homeTeam: "Boston Celtics", timing: 1820 },
    { id: "1b", match: "LAL @ BOS", type: "Spread +2.5", odds: "-110", stake: 400, status: "won", timestamp: baseTime - 119000, payout: 364, platform: "DraftKings", accountName: "Christopher Brown", league: "NBA" as League, awayTeam: "LA Lakers", homeTeam: "Boston Celtics", timing: 2060 },
    
    // LAL @ BOS - Spread +2.5 -110 - FanDuel (batch with 3 accounts, all won)
    { id: "1c", match: "LAL @ BOS", type: "Spread +2.5", odds: "-110", stake: 600, status: "won", timestamp: baseTime - 118500, payout: 545, platform: "FanDuel", accountName: "Sarah Johnson", league: "NBA" as League, awayTeam: "LA Lakers", homeTeam: "Boston Celtics", timing: 1790 },
    { id: "1d", match: "LAL @ BOS", type: "Spread +2.5", odds: "-110", stake: 850, status: "won", timestamp: baseTime - 118000, payout: 773, platform: "FanDuel", accountName: "Thomas Anderson", league: "NBA" as League, awayTeam: "LA Lakers", homeTeam: "Boston Celtics", timing: 1910 },
    { id: "1e", match: "LAL @ BOS", type: "Spread +2.5", odds: "-110", stake: 450, status: "won", timestamp: baseTime - 117500, payout: 409, platform: "FanDuel", accountName: "Daniel Kim", league: "NBA" as League, awayTeam: "LA Lakers", homeTeam: "Boston Celtics", timing: 2130 },
    
    // GSW @ PHX - O 232.5 -108 - BetMGM (batch with 3 accounts, all won)
    { id: "3", match: "GSW @ PHX", type: "O 232.5", odds: "-108", stake: 750, status: "won", timestamp: baseTime - 1320000, payout: 694, platform: "BetMGM", accountName: "Michael Chen", league: "NBA" as League, awayTeam: "GS Warriors", homeTeam: "Phoenix Suns", timing: 1680 },
    { id: "3a", match: "GSW @ PHX", type: "O 232.5", odds: "-108", stake: 500, status: "won", timestamp: baseTime - 1319500, payout: 463, platform: "BetMGM", accountName: "Robert Williams", league: "NBA" as League, awayTeam: "GS Warriors", homeTeam: "Phoenix Suns", timing: 1990 },
    { id: "3b", match: "GSW @ PHX", type: "O 232.5", odds: "-108", stake: 900, status: "won", timestamp: baseTime - 1319000, payout: 833, platform: "BetMGM", accountName: "Lisa Anderson", league: "NBA" as League, awayTeam: "GS Warriors", homeTeam: "Phoenix Suns", timing: 1840 },
    
    // PHI @ DAL - U 44.5 -110 - DraftKings (batch with 4 accounts, all won)
    { id: "6", match: "PHI @ DAL", type: "U 44.5", odds: "-110", stake: 650, status: "won", timestamp: baseTime - 10800000, payout: 591, platform: "DraftKings", accountName: "Patricia Garcia", league: "NFL" as League, awayTeam: "Philadelphia Eagles", homeTeam: "Dallas Cowboys", timing: 1770 },
    { id: "6a", match: "PHI @ DAL", type: "U 44.5", odds: "-110", stake: 500, status: "won", timestamp: baseTime - 10799500, payout: 455, platform: "DraftKings", accountName: "Jennifer Taylor", league: "NFL" as League, awayTeam: "Philadelphia Eagles", homeTeam: "Dallas Cowboys", timing: 2020 },
    { id: "6b", match: "PHI @ DAL", type: "U 44.5", odds: "-110", stake: 400, status: "won", timestamp: baseTime - 10799000, payout: 364, platform: "DraftKings", accountName: "Christopher Brown", league: "NFL" as League, awayTeam: "Philadelphia Eagles", homeTeam: "Dallas Cowboys", timing: 1880 },
    { id: "6c", match: "PHI @ DAL", type: "U 44.5", odds: "-110", stake: 300, status: "won", timestamp: baseTime - 10798500, payout: 273, platform: "DraftKings", accountName: "John Smith", league: "NFL" as League, awayTeam: "Philadelphia Eagles", homeTeam: "Dallas Cowboys", timing: 1960 },
    
    // PHI @ DAL - U 44.5 -110 - FanDuel (batch with 3 accounts, all won)
    { id: "6d", match: "PHI @ DAL", type: "U 44.5", odds: "-110", stake: 550, status: "won", timestamp: baseTime - 10798000, payout: 500, platform: "FanDuel", accountName: "Ryan O'Connor", league: "NFL" as League, awayTeam: "Philadelphia Eagles", homeTeam: "Dallas Cowboys", timing: 1810 },
    { id: "6e", match: "PHI @ DAL", type: "U 44.5", odds: "-110", stake: 450, status: "won", timestamp: baseTime - 10797500, payout: 409, platform: "FanDuel", accountName: "Maria Rodriguez", league: "NFL" as League, awayTeam: "Philadelphia Eagles", homeTeam: "Dallas Cowboys", timing: 2040 },
    { id: "6f", match: "PHI @ DAL", type: "U 44.5", odds: "-110", stake: 350, status: "won", timestamp: baseTime - 10797000, payout: 318, platform: "FanDuel", accountName: "Thomas Anderson", league: "NFL" as League, awayTeam: "Philadelphia Eagles", homeTeam: "Dallas Cowboys", timing: 1900 },
  ];
};

export function BetHistoryProvider({ children }: { children: ReactNode }) {
  const [bets, setBets] = useState<Bet[]>(loadBetsFromStorage);

  const addBet = (betData: Omit<Bet, 'id' | 'timestamp'>) => {
    const newBet: Bet = {
      ...betData,
      id: `bet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    // Use functional update to ensure we get the latest bets state
    setBets(prevBets => {
      const updatedBets = [newBet, ...prevBets];
      try {
        localStorage.setItem('betting-ui-bet-history', JSON.stringify(updatedBets));
        localStorage.setItem('betting-ui-bet-history-version', BET_HISTORY_VERSION);
      } catch {
        // Ignore errors
      }
      return updatedBets;
    });
  };

  const updateBet = (betId: string, updates: Partial<Bet>) => {
    // Use functional update to ensure we get the latest bets state
    setBets(prevBets => {
      const updatedBets = prevBets.map(bet => bet.id === betId ? { ...bet, ...updates } : bet);
      try {
        localStorage.setItem('betting-ui-bet-history', JSON.stringify(updatedBets));
        localStorage.setItem('betting-ui-bet-history-version', BET_HISTORY_VERSION);
      } catch {
        // Ignore errors
      }
      return updatedBets;
    });
  };

  return (
    <BetHistoryContext.Provider value={{ bets, addBet, updateBet }}>
      {children}
    </BetHistoryContext.Provider>
  );
}

export function useBetHistory() {
  const context = useContext(BetHistoryContext);
  if (context === undefined) {
    throw new Error("useBetHistory must be used within a BetHistoryProvider");
  }
  return context;
}
