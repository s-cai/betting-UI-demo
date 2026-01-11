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
const loadBetsFromStorage = (): Bet[] => {
  try {
    const saved = localStorage.getItem('betting-ui-bet-history');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Ignore errors
  }
  // Return mock bets as initial data with full details
  // Each bet group has multiple accounts to demonstrate after-bet view
  const baseTime = Date.now();
  return [
    // LAL @ BOS - Spread +2.5 -110 (3 accounts, all pending)
    { id: "1", match: "LAL @ BOS", type: "Spread +2.5", odds: "-110", stake: 500, status: "pending", timestamp: baseTime - 120000, platform: "DraftKings", accountName: "John Smith", league: "NBA" as League, awayTeam: "LA Lakers", homeTeam: "Boston Celtics" },
    { id: "1a", match: "LAL @ BOS", type: "Spread +2.5", odds: "-110", stake: 750, status: "pending", timestamp: baseTime - 119500, platform: "FanDuel", accountName: "Sarah Johnson", league: "NBA" as League, awayTeam: "LA Lakers", homeTeam: "Boston Celtics" },
    { id: "1b", match: "LAL @ BOS", type: "Spread +2.5", odds: "-110", stake: 400, status: "pending", timestamp: baseTime - 119000, platform: "BetMGM", accountName: "Michael Chen", league: "NBA" as League, awayTeam: "LA Lakers", homeTeam: "Boston Celtics" },
    
    // KC @ BUF - ML KC -175 (4 accounts, all won)
    { id: "2", match: "KC @ BUF", type: "ML KC", odds: "-175", stake: 1000, status: "won", timestamp: baseTime - 900000, payout: 571, platform: "FanDuel", accountName: "Sarah Johnson", league: "NFL" as League, awayTeam: "KC Chiefs", homeTeam: "Buffalo Bills" },
    { id: "2a", match: "KC @ BUF", type: "ML KC", odds: "-175", stake: 800, status: "won", timestamp: baseTime - 899500, payout: 457, platform: "DraftKings", accountName: "Jennifer Taylor", league: "NFL" as League, awayTeam: "KC Chiefs", homeTeam: "Buffalo Bills" },
    { id: "2b", match: "KC @ BUF", type: "ML KC", odds: "-175", stake: 1200, status: "won", timestamp: baseTime - 899000, payout: 686, platform: "BetMGM", accountName: "Robert Williams", league: "NFL" as League, awayTeam: "KC Chiefs", homeTeam: "Buffalo Bills" },
    { id: "2c", match: "KC @ BUF", type: "ML KC", odds: "-175", stake: 600, status: "won", timestamp: baseTime - 898500, payout: 343, platform: "Caesars", accountName: "Alexander Hamilton", league: "NFL" as League, awayTeam: "KC Chiefs", homeTeam: "Buffalo Bills" },
    
    // GSW @ PHX - O 232.5 -108 (3 accounts, all pending)
    { id: "3", match: "GSW @ PHX", type: "O 232.5", odds: "-108", stake: 750, status: "pending", timestamp: baseTime - 1320000, platform: "BetMGM", accountName: "Michael Chen", league: "NBA" as League, awayTeam: "GS Warriors", homeTeam: "Phoenix Suns" },
    { id: "3a", match: "GSW @ PHX", type: "O 232.5", odds: "-108", stake: 500, status: "pending", timestamp: baseTime - 1319500, platform: "FanDuel", accountName: "Thomas Anderson", league: "NBA" as League, awayTeam: "GS Warriors", homeTeam: "Phoenix Suns" },
    { id: "3b", match: "GSW @ PHX", type: "O 232.5", odds: "-108", stake: 900, status: "pending", timestamp: baseTime - 1319000, platform: "DraftKings", accountName: "Kevin Thompson", league: "NBA" as League, awayTeam: "GS Warriors", homeTeam: "Phoenix Suns" },
    
    // SF @ DET - ML DET +115 (4 accounts, mix of won/lost)
    { id: "4", match: "SF @ DET", type: "ML DET", odds: "+115", stake: 400, status: "lost", timestamp: baseTime - 3600000, platform: "Caesars", accountName: "Emily Davis", league: "NFL" as League, awayTeam: "SF 49ers", homeTeam: "Detroit Lions" },
    { id: "4a", match: "SF @ DET", type: "ML DET", odds: "+115", stake: 600, status: "won", timestamp: baseTime - 3599500, payout: 690, platform: "FanDuel", accountName: "Maria Rodriguez", league: "NFL" as League, awayTeam: "SF 49ers", homeTeam: "Detroit Lions" },
    { id: "4b", match: "SF @ DET", type: "ML DET", odds: "+115", stake: 350, status: "lost", timestamp: baseTime - 3599000, platform: "BetMGM", accountName: "Lisa Anderson", league: "NFL" as League, awayTeam: "SF 49ers", homeTeam: "Detroit Lions" },
    { id: "4c", match: "SF @ DET", type: "ML DET", odds: "+115", stake: 550, status: "won", timestamp: baseTime - 3598500, payout: 633, platform: "DraftKings", accountName: "Christopher Brown", league: "NFL" as League, awayTeam: "SF 49ers", homeTeam: "Detroit Lions" },
    
    // MIA @ NYK - Spread -1.5 -110 (3 accounts, all won)
    { id: "5", match: "MIA @ NYK", type: "Spread -1.5", odds: "-110", stake: 600, status: "won", timestamp: baseTime - 7200000, payout: 545, platform: "PointsBet", accountName: "Thomas Anderson", league: "NBA" as League, awayTeam: "Miami Heat", homeTeam: "Milwaukee Bucks" },
    { id: "5a", match: "MIA @ NYK", type: "Spread -1.5", odds: "-110", stake: 800, status: "won", timestamp: baseTime - 7199500, payout: 727, platform: "FanDuel", accountName: "Daniel Kim", league: "NBA" as League, awayTeam: "Miami Heat", homeTeam: "Milwaukee Bucks" },
    { id: "5b", match: "MIA @ NYK", type: "Spread -1.5", odds: "-110", stake: 450, status: "won", timestamp: baseTime - 7199000, payout: 409, platform: "BetMGM", accountName: "Victoria Sterling", league: "NBA" as League, awayTeam: "Miami Heat", homeTeam: "Milwaukee Bucks" },
    
    // PHI @ DAL - U 44.5 -110 (4 accounts, all pending)
    { id: "6", match: "PHI @ DAL", type: "U 44.5", odds: "-110", stake: 300, status: "pending", timestamp: baseTime - 10800000, platform: "Bet365", accountName: "Maria Rodriguez", league: "NFL" as League, awayTeam: "Philadelphia Eagles", homeTeam: "Dallas Cowboys" },
    { id: "6a", match: "PHI @ DAL", type: "U 44.5", odds: "-110", stake: 500, status: "pending", timestamp: baseTime - 10799500, platform: "FanDuel", accountName: "Ryan O'Connor", league: "NFL" as League, awayTeam: "Philadelphia Eagles", homeTeam: "Dallas Cowboys" },
    { id: "6b", match: "PHI @ DAL", type: "U 44.5", odds: "-110", stake: 400, status: "pending", timestamp: baseTime - 10799000, platform: "Caesars", accountName: "Nathaniel Black", league: "NFL" as League, awayTeam: "Philadelphia Eagles", homeTeam: "Dallas Cowboys" },
    { id: "6c", match: "PHI @ DAL", type: "U 44.5", odds: "-110", stake: 650, status: "pending", timestamp: baseTime - 10798500, platform: "DraftKings", accountName: "Patricia Garcia", league: "NFL" as League, awayTeam: "Philadelphia Eagles", homeTeam: "Dallas Cowboys" },
  ];
};

export function BetHistoryProvider({ children }: { children: ReactNode }) {
  const [bets, setBets] = useState<Bet[]>(loadBetsFromStorage);

  // Save to localStorage whenever bets change
  const saveBets = (newBets: Bet[]) => {
    setBets(newBets);
    try {
      localStorage.setItem('betting-ui-bet-history', JSON.stringify(newBets));
    } catch {
      // Ignore errors
    }
  };

  const addBet = (betData: Omit<Bet, 'id' | 'timestamp'>) => {
    const newBet: Bet = {
      ...betData,
      id: `bet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    saveBets([newBet, ...bets]);
  };

  const updateBet = (betId: string, updates: Partial<Bet>) => {
    saveBets(bets.map(bet => bet.id === betId ? { ...bet, ...updates } : bet));
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
