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
}

interface BetHistoryContextType {
  bets: Bet[];
  addBet: (bet: Omit<Bet, 'id' | 'timestamp'>) => void;
  updateBet: (betId: string, updates: Partial<Bet>) => void;
}

const BetHistoryContext = createContext<BetHistoryContextType | undefined>(undefined);

// Load bets from localStorage on init
const BET_HISTORY_VERSION = '2.2'; // Increment to force reload demo data (error messages for failed bets)
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
  const baseTime = Date.now();
  return [
    // LAL @ BOS - Spread +2.5 -110 - DraftKings (batch with 3 accounts, all pending)
    { id: "1", match: "LAL @ BOS", type: "Spread +2.5", odds: "-110", stake: 500, status: "pending", timestamp: baseTime - 120000, platform: "DraftKings", accountName: "John Smith", league: "NBA" as League, awayTeam: "LA Lakers", homeTeam: "Boston Celtics" },
    { id: "1a", match: "LAL @ BOS", type: "Spread +2.5", odds: "-110", stake: 750, status: "pending", timestamp: baseTime - 119500, platform: "DraftKings", accountName: "Jennifer Taylor", league: "NBA" as League, awayTeam: "LA Lakers", homeTeam: "Boston Celtics" },
    { id: "1b", match: "LAL @ BOS", type: "Spread +2.5", odds: "-110", stake: 400, status: "pending", timestamp: baseTime - 119000, platform: "DraftKings", accountName: "Christopher Brown", league: "NBA" as League, awayTeam: "LA Lakers", homeTeam: "Boston Celtics" },
    
    // LAL @ BOS - Spread +2.5 -110 - FanDuel (batch with 3 accounts, all pending)
    { id: "1c", match: "LAL @ BOS", type: "Spread +2.5", odds: "-110", stake: 600, status: "pending", timestamp: baseTime - 118500, platform: "FanDuel", accountName: "Sarah Johnson", league: "NBA" as League, awayTeam: "LA Lakers", homeTeam: "Boston Celtics" },
    { id: "1d", match: "LAL @ BOS", type: "Spread +2.5", odds: "-110", stake: 850, status: "pending", timestamp: baseTime - 118000, platform: "FanDuel", accountName: "Thomas Anderson", league: "NBA" as League, awayTeam: "LA Lakers", homeTeam: "Boston Celtics" },
    { id: "1e", match: "LAL @ BOS", type: "Spread +2.5", odds: "-110", stake: 450, status: "pending", timestamp: baseTime - 117500, platform: "FanDuel", accountName: "Daniel Kim", league: "NBA" as League, awayTeam: "LA Lakers", homeTeam: "Boston Celtics" },
    
    // KC @ BUF - ML KC -175 - FanDuel (batch with 4 accounts, all won)
    { id: "2", match: "KC @ BUF", type: "ML KC", odds: "-175", stake: 1000, status: "won", timestamp: baseTime - 900000, payout: 571, platform: "FanDuel", accountName: "Sarah Johnson", league: "NFL" as League, awayTeam: "KC Chiefs", homeTeam: "Buffalo Bills" },
    { id: "2a", match: "KC @ BUF", type: "ML KC", odds: "-175", stake: 800, status: "won", timestamp: baseTime - 899500, payout: 457, platform: "FanDuel", accountName: "Maria Rodriguez", league: "NFL" as League, awayTeam: "KC Chiefs", homeTeam: "Buffalo Bills" },
    { id: "2b", match: "KC @ BUF", type: "ML KC", odds: "-175", stake: 1200, status: "won", timestamp: baseTime - 899000, payout: 686, platform: "FanDuel", accountName: "Ryan O'Connor", league: "NFL" as League, awayTeam: "KC Chiefs", homeTeam: "Buffalo Bills" },
    { id: "2c", match: "KC @ BUF", type: "ML KC", odds: "-175", stake: 600, status: "won", timestamp: baseTime - 898500, payout: 343, platform: "FanDuel", accountName: "Kevin Thompson", league: "NFL" as League, awayTeam: "KC Chiefs", homeTeam: "Buffalo Bills" },
    
    // KC @ BUF - ML KC -175 - DraftKings (batch with 3 accounts, all won)
    { id: "2d", match: "KC @ BUF", type: "ML KC", odds: "-175", stake: 900, status: "won", timestamp: baseTime - 898000, payout: 514, platform: "DraftKings", accountName: "Jennifer Taylor", league: "NFL" as League, awayTeam: "KC Chiefs", homeTeam: "Buffalo Bills" },
    { id: "2e", match: "KC @ BUF", type: "ML KC", odds: "-175", stake: 700, status: "won", timestamp: baseTime - 897500, payout: 400, platform: "DraftKings", accountName: "John Smith", league: "NFL" as League, awayTeam: "KC Chiefs", homeTeam: "Buffalo Bills" },
    { id: "2f", match: "KC @ BUF", type: "ML KC", odds: "-175", stake: 550, status: "won", timestamp: baseTime - 897000, payout: 314, platform: "DraftKings", accountName: "Patricia Garcia", league: "NFL" as League, awayTeam: "KC Chiefs", homeTeam: "Buffalo Bills" },
    
    // GSW @ PHX - O 232.5 -108 - BetMGM (batch with 3 accounts, all pending)
    { id: "3", match: "GSW @ PHX", type: "O 232.5", odds: "-108", stake: 750, status: "pending", timestamp: baseTime - 1320000, platform: "BetMGM", accountName: "Michael Chen", league: "NBA" as League, awayTeam: "GS Warriors", homeTeam: "Phoenix Suns" },
    { id: "3a", match: "GSW @ PHX", type: "O 232.5", odds: "-108", stake: 500, status: "pending", timestamp: baseTime - 1319500, platform: "BetMGM", accountName: "Robert Williams", league: "NBA" as League, awayTeam: "GS Warriors", homeTeam: "Phoenix Suns" },
    { id: "3b", match: "GSW @ PHX", type: "O 232.5", odds: "-108", stake: 900, status: "pending", timestamp: baseTime - 1319000, platform: "BetMGM", accountName: "Lisa Anderson", league: "NBA" as League, awayTeam: "GS Warriors", homeTeam: "Phoenix Suns" },
    
    // SF @ DET - ML DET +115 - FanDuel (batch with 4 accounts, mix of won/lost)
    { id: "4", match: "SF @ DET", type: "ML DET", odds: "+115", stake: 600, status: "won", timestamp: baseTime - 3600000, payout: 690, platform: "FanDuel", accountName: "Maria Rodriguez", league: "NFL" as League, awayTeam: "SF 49ers", homeTeam: "Detroit Lions" },
    { id: "4a", match: "SF @ DET", type: "ML DET", odds: "+115", stake: 550, status: "won", timestamp: baseTime - 3599500, payout: 633, platform: "FanDuel", accountName: "Christopher Brown", league: "NFL" as League, awayTeam: "SF 49ers", homeTeam: "Detroit Lions" },
    { id: "4b", match: "SF @ DET", type: "ML DET", odds: "+115", stake: 400, status: "lost", timestamp: baseTime - 3599000, platform: "FanDuel", accountName: "Emily Davis", league: "NFL" as League, awayTeam: "SF 49ers", homeTeam: "Detroit Lions", error: "Insufficient funds", errorScreenshot: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iIzFhMWExYSIvPjx0ZXh0IHg9IjE1MCIgeT0iMjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbnN1ZmZpY2llbnQgZnVuZHM8L3RleHQ+PC9zdmc+" },
    { id: "4c", match: "SF @ DET", type: "ML DET", odds: "+115", stake: 350, status: "lost", timestamp: baseTime - 3598500, platform: "FanDuel", accountName: "Lisa Anderson", league: "NFL" as League, awayTeam: "SF 49ers", homeTeam: "Detroit Lions", error: "Bet limit exceeded", errorScreenshot: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iIzFhMWExYSIvPjx0ZXh0IHg9IjE1MCIgeT0iMjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5CZXQgbGltaXQgZXhjZWVkZWQ8L3RleHQ+PC9zdmc+" },
    
    // SF @ DET - ML DET +115 - DraftKings (batch with 3 accounts, all won)
    { id: "4d", match: "SF @ DET", type: "ML DET", odds: "+115", stake: 700, status: "won", timestamp: baseTime - 3598000, payout: 805, platform: "DraftKings", accountName: "Jennifer Taylor", league: "NFL" as League, awayTeam: "SF 49ers", homeTeam: "Detroit Lions" },
    { id: "4e", match: "SF @ DET", type: "ML DET", odds: "+115", stake: 500, status: "won", timestamp: baseTime - 3597500, payout: 575, platform: "DraftKings", accountName: "John Smith", league: "NFL" as League, awayTeam: "SF 49ers", homeTeam: "Detroit Lions" },
    { id: "4f", match: "SF @ DET", type: "ML DET", odds: "+115", stake: 450, status: "won", timestamp: baseTime - 3597000, payout: 518, platform: "DraftKings", accountName: "Kevin Thompson", league: "NFL" as League, awayTeam: "SF 49ers", homeTeam: "Detroit Lions" },
    
    // MIA @ NYK - Spread -1.5 -110 - FanDuel (batch with 3 accounts, all won)
    { id: "5", match: "MIA @ NYK", type: "Spread -1.5", odds: "-110", stake: 800, status: "won", timestamp: baseTime - 7200000, payout: 727, platform: "FanDuel", accountName: "Daniel Kim", league: "NBA" as League, awayTeam: "Miami Heat", homeTeam: "Milwaukee Bucks" },
    { id: "5a", match: "MIA @ NYK", type: "Spread -1.5", odds: "-110", stake: 600, status: "won", timestamp: baseTime - 7199500, payout: 545, platform: "FanDuel", accountName: "Thomas Anderson", league: "NBA" as League, awayTeam: "Miami Heat", homeTeam: "Milwaukee Bucks" },
    { id: "5b", match: "MIA @ NYK", type: "Spread -1.5", odds: "-110", stake: 450, status: "won", timestamp: baseTime - 7199000, payout: 409, platform: "FanDuel", accountName: "Victoria Sterling", league: "NBA" as League, awayTeam: "Miami Heat", homeTeam: "Milwaukee Bucks" },
    
    // PHI @ DAL - U 44.5 -110 - DraftKings (batch with 4 accounts, all pending)
    { id: "6", match: "PHI @ DAL", type: "U 44.5", odds: "-110", stake: 650, status: "pending", timestamp: baseTime - 10800000, platform: "DraftKings", accountName: "Patricia Garcia", league: "NFL" as League, awayTeam: "Philadelphia Eagles", homeTeam: "Dallas Cowboys" },
    { id: "6a", match: "PHI @ DAL", type: "U 44.5", odds: "-110", stake: 500, status: "pending", timestamp: baseTime - 10799500, platform: "DraftKings", accountName: "Jennifer Taylor", league: "NFL" as League, awayTeam: "Philadelphia Eagles", homeTeam: "Dallas Cowboys" },
    { id: "6b", match: "PHI @ DAL", type: "U 44.5", odds: "-110", stake: 400, status: "pending", timestamp: baseTime - 10799000, platform: "DraftKings", accountName: "Christopher Brown", league: "NFL" as League, awayTeam: "Philadelphia Eagles", homeTeam: "Dallas Cowboys" },
    { id: "6c", match: "PHI @ DAL", type: "U 44.5", odds: "-110", stake: 300, status: "pending", timestamp: baseTime - 10798500, platform: "DraftKings", accountName: "John Smith", league: "NFL" as League, awayTeam: "Philadelphia Eagles", homeTeam: "Dallas Cowboys" },
    
    // PHI @ DAL - U 44.5 -110 - FanDuel (batch with 3 accounts, all pending)
    { id: "6d", match: "PHI @ DAL", type: "U 44.5", odds: "-110", stake: 550, status: "pending", timestamp: baseTime - 10798000, platform: "FanDuel", accountName: "Ryan O'Connor", league: "NFL" as League, awayTeam: "Philadelphia Eagles", homeTeam: "Dallas Cowboys" },
    { id: "6e", match: "PHI @ DAL", type: "U 44.5", odds: "-110", stake: 450, status: "pending", timestamp: baseTime - 10797500, platform: "FanDuel", accountName: "Maria Rodriguez", league: "NFL" as League, awayTeam: "Philadelphia Eagles", homeTeam: "Dallas Cowboys" },
    { id: "6f", match: "PHI @ DAL", type: "U 44.5", odds: "-110", stake: 350, status: "pending", timestamp: baseTime - 10797000, platform: "FanDuel", accountName: "Thomas Anderson", league: "NFL" as League, awayTeam: "Philadelphia Eagles", homeTeam: "Dallas Cowboys" },
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
