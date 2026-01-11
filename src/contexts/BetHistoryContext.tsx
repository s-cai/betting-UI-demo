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
  return [
    { id: "1", match: "LAL @ BOS", type: "Spread +2.5", odds: "-110", stake: 500, status: "pending", timestamp: Date.now() - 120000, platform: "DraftKings", accountName: "John Smith", league: "NBA" as League, awayTeam: "LA Lakers", homeTeam: "Boston Celtics" },
    { id: "2", match: "KC @ BUF", type: "ML KC", odds: "-175", stake: 1000, status: "won", timestamp: Date.now() - 900000, payout: 571, platform: "FanDuel", accountName: "Sarah Johnson", league: "NFL" as League, awayTeam: "KC Chiefs", homeTeam: "Buffalo Bills" },
    { id: "3", match: "GSW @ PHX", type: "O 232.5", odds: "-108", stake: 750, status: "pending", timestamp: Date.now() - 1320000, platform: "BetMGM", accountName: "Michael Chen", league: "NBA" as League, awayTeam: "GS Warriors", homeTeam: "Phoenix Suns" },
    { id: "4", match: "SF @ DET", type: "ML DET", odds: "+115", stake: 400, status: "lost", timestamp: Date.now() - 3600000, platform: "Caesars", accountName: "Emily Davis", league: "NFL" as League, awayTeam: "SF 49ers", homeTeam: "Detroit Lions" },
    { id: "5", match: "MIA @ NYK", type: "Spread -1.5", odds: "-110", stake: 600, status: "won", timestamp: Date.now() - 7200000, payout: 545, platform: "PointsBet", accountName: "Thomas Anderson", league: "NBA" as League, awayTeam: "Miami Heat", homeTeam: "Milwaukee Bucks" },
    { id: "6", match: "PHI @ DAL", type: "U 44.5", odds: "-110", stake: 300, status: "pending", timestamp: Date.now() - 10800000, platform: "Bet365", accountName: "Maria Rodriguez", league: "NFL" as League, awayTeam: "Philadelphia Eagles", homeTeam: "Dallas Cowboys" },
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
