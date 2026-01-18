import { createContext, useContext, useState, ReactNode } from "react";

export type League = "NFL" | "NCAAF" | "NBA" | "NCAAB";

export interface Bet {
  id: string;
  match: string;
  type: string;
  odds: string;
  stake: number; // Changed to number for easier calculations
  status: "won" | "lost" | "pending" | "cancelled";
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

// Helper function to check if bets fall within today's noon-to-noon window
const hasBetsInTodayWindow = (bets: Bet[]): boolean => {
  if (bets.length === 0) return false;
  
  const now = new Date();
  const currentHour = now.getHours();
  const boundary = new Date(now);
  boundary.setHours(12, 0, 0, 0);
  
  let periodStart: number;
  let periodEnd: number;
  
  if (currentHour < 12) {
    // Before noon: show bets from noon yesterday to noon today
    periodStart = boundary.getTime() - (24 * 60 * 60 * 1000); // Noon yesterday
    periodEnd = boundary.getTime(); // Noon today
  } else {
    // At or after noon: show bets from noon today to noon tomorrow
    periodStart = boundary.getTime(); // Noon today
    periodEnd = boundary.getTime() + (24 * 60 * 60 * 1000); // Noon tomorrow
  }
  
  return bets.some(bet => bet.timestamp >= periodStart && bet.timestamp < periodEnd);
};

// Load bets from localStorage on init
const BET_HISTORY_VERSION = '2.6'; // Increment to force reload demo data (added bets for different time periods)
const loadBetsFromStorage = (): Bet[] => {
  try {
    // Check version - if it doesn't match, clear old data and use demo data
    const savedVersion = localStorage.getItem('betting-ui-bet-history-version');
    const saved = localStorage.getItem('betting-ui-bet-history');
    
    if (savedVersion === BET_HISTORY_VERSION && saved) {
      const loadedBets = JSON.parse(saved);
      // If loaded bets don't have any bets in today's window, regenerate demo data
      if (!hasBetsInTodayWindow(loadedBets)) {
        localStorage.removeItem('betting-ui-bet-history');
        localStorage.setItem('betting-ui-bet-history-version', BET_HISTORY_VERSION);
        // Fall through to generate new demo data
      } else {
        return loadedBets;
      }
    } else {
      // Version mismatch or no saved data - clear and use demo data
      localStorage.removeItem('betting-ui-bet-history');
      localStorage.setItem('betting-ui-bet-history-version', BET_HISTORY_VERSION);
    }
  } catch {
    // Ignore errors and fall through to generate demo data
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
    
    // Additional today's bets to make the list scrollable
    // DEN @ LV - ML DEN -140 - BetMGM (batch with 4 accounts, all won) - 4 hours ago
    { id: "7", match: "DEN @ LV", type: "ML DEN", odds: "-140", stake: 850, status: "won", timestamp: baseTime - 14400000, payout: 607, platform: "BetMGM", accountName: "Robert Williams", league: "NFL" as League, awayTeam: "Denver Broncos", homeTeam: "Las Vegas Raiders", timing: 1920 },
    { id: "7a", match: "DEN @ LV", type: "ML DEN", odds: "-140", stake: 650, status: "won", timestamp: baseTime - 14399500, payout: 464, platform: "BetMGM", accountName: "Michael Chen", league: "NFL" as League, awayTeam: "Denver Broncos", homeTeam: "Las Vegas Raiders", timing: 1780 },
    { id: "7b", match: "DEN @ LV", type: "ML DEN", odds: "-140", stake: 500, status: "won", timestamp: baseTime - 14399000, payout: 357, platform: "BetMGM", accountName: "Lisa Anderson", league: "NFL" as League, awayTeam: "Denver Broncos", homeTeam: "Las Vegas Raiders", timing: 2050 },
    { id: "7c", match: "DEN @ LV", type: "ML DEN", odds: "-140", stake: 750, status: "won", timestamp: baseTime - 14398500, payout: 536, platform: "BetMGM", accountName: "David Martinez", league: "NFL" as League, awayTeam: "Denver Broncos", homeTeam: "Las Vegas Raiders", timing: 1890 },
    
    // DEN @ LV - ML DEN -140 - Caesars (batch with 3 accounts, all won) - 4 hours ago
    { id: "7d", match: "DEN @ LV", type: "ML DEN", odds: "-140", stake: 600, status: "won", timestamp: baseTime - 14398000, payout: 429, platform: "Caesars", accountName: "Amanda Wilson", league: "NFL" as League, awayTeam: "Denver Broncos", homeTeam: "Las Vegas Raiders", timing: 1970 },
    { id: "7e", match: "DEN @ LV", type: "ML DEN", odds: "-140", stake: 550, status: "won", timestamp: baseTime - 14397500, payout: 393, platform: "Caesars", accountName: "James Lee", league: "NFL" as League, awayTeam: "Denver Broncos", homeTeam: "Las Vegas Raiders", timing: 1830 },
    { id: "7f", match: "DEN @ LV", type: "ML DEN", odds: "-140", stake: 700, status: "won", timestamp: baseTime - 14397000, payout: 500, platform: "Caesars", accountName: "Patricia Garcia", league: "NFL" as League, awayTeam: "Denver Broncos", homeTeam: "Las Vegas Raiders", timing: 2110 },
    
    // BKN @ MIL - O 225.5 -105 - DraftKings (batch with 4 accounts, all won) - 5 hours ago
    { id: "8", match: "BKN @ MIL", type: "O 225.5", odds: "-105", stake: 750, status: "won", timestamp: baseTime - 18000000, payout: 714, platform: "DraftKings", accountName: "Jennifer Taylor", league: "NBA" as League, awayTeam: "Brooklyn Nets", homeTeam: "Milwaukee Bucks", timing: 1860 },
    { id: "8a", match: "BKN @ MIL", type: "O 225.5", odds: "-105", stake: 600, status: "won", timestamp: baseTime - 17999500, payout: 571, platform: "DraftKings", accountName: "John Smith", league: "NBA" as League, awayTeam: "Brooklyn Nets", homeTeam: "Milwaukee Bucks", timing: 1990 },
    { id: "8b", match: "BKN @ MIL", type: "O 225.5", odds: "-105", stake: 500, status: "won", timestamp: baseTime - 17999000, payout: 476, platform: "DraftKings", accountName: "Christopher Brown", league: "NBA" as League, awayTeam: "Brooklyn Nets", homeTeam: "Milwaukee Bucks", timing: 1740 },
    { id: "8c", match: "BKN @ MIL", type: "O 225.5", odds: "-105", stake: 450, status: "won", timestamp: baseTime - 17998500, payout: 429, platform: "DraftKings", accountName: "Kevin Thompson", league: "NBA" as League, awayTeam: "Brooklyn Nets", homeTeam: "Milwaukee Bucks", timing: 2020 },
    
    // BKN @ MIL - O 225.5 -105 - FanDuel (batch with 3 accounts, all won) - 5 hours ago
    { id: "8d", match: "BKN @ MIL", type: "O 225.5", odds: "-105", stake: 650, status: "won", timestamp: baseTime - 17998000, payout: 619, platform: "FanDuel", accountName: "Sarah Johnson", league: "NBA" as League, awayTeam: "Brooklyn Nets", homeTeam: "Milwaukee Bucks", timing: 1880 },
    { id: "8e", match: "BKN @ MIL", type: "O 225.5", odds: "-105", stake: 550, status: "won", timestamp: baseTime - 17997500, payout: 524, platform: "FanDuel", accountName: "Maria Rodriguez", league: "NBA" as League, awayTeam: "Brooklyn Nets", homeTeam: "Milwaukee Bucks", timing: 1930 },
    { id: "8f", match: "BKN @ MIL", type: "O 225.5", odds: "-105", stake: 400, status: "won", timestamp: baseTime - 17997000, payout: 381, platform: "FanDuel", accountName: "Ryan O'Connor", league: "NBA" as League, awayTeam: "Brooklyn Nets", homeTeam: "Milwaukee Bucks", timing: 2070 },
    
    // CLE @ CHI - Spread +3.5 -110 - BetMGM (batch with 3 accounts, mix won/lost) - 6 hours ago
    { id: "9", match: "CLE @ CHI", type: "Spread +3.5", odds: "-110", stake: 700, status: "won", timestamp: baseTime - 21600000, payout: 636, platform: "BetMGM", accountName: "Thomas Anderson", league: "NBA" as League, awayTeam: "Cleveland Cavaliers", homeTeam: "Chicago Bulls", timing: 1950 },
    { id: "9a", match: "CLE @ CHI", type: "Spread +3.5", odds: "-110", stake: 600, status: "won", timestamp: baseTime - 21599500, payout: 545, platform: "BetMGM", accountName: "Daniel Kim", league: "NBA" as League, awayTeam: "Cleveland Cavaliers", homeTeam: "Chicago Bulls", timing: 1810 },
    { id: "9b", match: "CLE @ CHI", type: "Spread +3.5", odds: "-110", stake: 500, status: "lost", timestamp: baseTime - 21599000, platform: "BetMGM", accountName: "Emily Davis", league: "NBA" as League, awayTeam: "Cleveland Cavaliers", homeTeam: "Chicago Bulls", error: "Connection timeout", errorScreenshot: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iIzFhMWExYSIvPjx0ZXh0IHg9IjE1MCIgeT0iMjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Db25uZWN0aW9uIHRpbWVvdXQ8L3RleHQ+PC9zdmc+", timing: 3100 },
    
    // CLE @ CHI - Spread +3.5 -110 - DraftKings (batch with 4 accounts, all won) - 6 hours ago
    { id: "9c", match: "CLE @ CHI", type: "Spread +3.5", odds: "-110", stake: 800, status: "won", timestamp: baseTime - 21598500, payout: 727, platform: "DraftKings", accountName: "Jennifer Taylor", league: "NBA" as League, awayTeam: "Cleveland Cavaliers", homeTeam: "Chicago Bulls", timing: 1790 },
    { id: "9d", match: "CLE @ CHI", type: "Spread +3.5", odds: "-110", stake: 550, status: "won", timestamp: baseTime - 21598000, payout: 500, platform: "DraftKings", accountName: "John Smith", league: "NBA" as League, awayTeam: "Cleveland Cavaliers", homeTeam: "Chicago Bulls", timing: 2040 },
    { id: "9e", match: "CLE @ CHI", type: "Spread +3.5", odds: "-110", stake: 450, status: "won", timestamp: baseTime - 21597500, payout: 409, platform: "DraftKings", accountName: "Patricia Garcia", league: "NBA" as League, awayTeam: "Cleveland Cavaliers", homeTeam: "Chicago Bulls", timing: 1920 },
    { id: "9f", match: "CLE @ CHI", type: "Spread +3.5", odds: "-110", stake: 350, status: "won", timestamp: baseTime - 21597000, payout: 318, platform: "DraftKings", accountName: "Christopher Brown", league: "NBA" as League, awayTeam: "Cleveland Cavaliers", homeTeam: "Chicago Bulls", timing: 1980 },
    
    // GB @ MIN - ML GB +125 - FanDuel (batch with 4 accounts, all won) - 7 hours ago
    { id: "10", match: "GB @ MIN", type: "ML GB", odds: "+125", stake: 600, status: "won", timestamp: baseTime - 25200000, payout: 750, platform: "FanDuel", accountName: "Sarah Johnson", league: "NFL" as League, awayTeam: "Green Bay Packers", homeTeam: "Minnesota Vikings", timing: 1870 },
    { id: "10a", match: "GB @ MIN", type: "ML GB", odds: "+125", stake: 500, status: "won", timestamp: baseTime - 25199500, payout: 625, platform: "FanDuel", accountName: "Maria Rodriguez", league: "NFL" as League, awayTeam: "Green Bay Packers", homeTeam: "Minnesota Vikings", timing: 2010 },
    { id: "10b", match: "GB @ MIN", type: "ML GB", odds: "+125", stake: 450, status: "won", timestamp: baseTime - 25199000, payout: 563, platform: "FanDuel", accountName: "Ryan O'Connor", league: "NFL" as League, awayTeam: "Green Bay Packers", homeTeam: "Minnesota Vikings", timing: 1760 },
    { id: "10c", match: "GB @ MIN", type: "ML GB", odds: "+125", stake: 400, status: "won", timestamp: baseTime - 25198500, payout: 500, platform: "FanDuel", accountName: "Kevin Thompson", league: "NFL" as League, awayTeam: "Green Bay Packers", homeTeam: "Minnesota Vikings", timing: 1940 },
    
    // GB @ MIN - ML GB +125 - BetMGM (batch with 3 accounts, all won) - 7 hours ago
    { id: "10d", match: "GB @ MIN", type: "ML GB", odds: "+125", stake: 700, status: "won", timestamp: baseTime - 25198000, payout: 875, platform: "BetMGM", accountName: "Robert Williams", league: "NFL" as League, awayTeam: "Green Bay Packers", homeTeam: "Minnesota Vikings", timing: 1820 },
    { id: "10e", match: "GB @ MIN", type: "ML GB", odds: "+125", stake: 550, status: "won", timestamp: baseTime - 25197500, payout: 688, platform: "BetMGM", accountName: "Michael Chen", league: "NFL" as League, awayTeam: "Green Bay Packers", homeTeam: "Minnesota Vikings", timing: 2090 },
    { id: "10f", match: "GB @ MIN", type: "ML GB", odds: "+125", stake: 500, status: "won", timestamp: baseTime - 25197000, payout: 625, platform: "BetMGM", accountName: "Lisa Anderson", league: "NFL" as League, awayTeam: "Green Bay Packers", homeTeam: "Minnesota Vikings", timing: 1900 },
    
    // POR @ UTA - U 228.5 -108 - DraftKings (batch with 3 accounts, all won) - 8 hours ago
    { id: "11", match: "POR @ UTA", type: "U 228.5", odds: "-108", stake: 650, status: "won", timestamp: baseTime - 28800000, payout: 602, platform: "DraftKings", accountName: "Jennifer Taylor", league: "NBA" as League, awayTeam: "Portland Trail Blazers", homeTeam: "Utah Jazz", timing: 1960 },
    { id: "11a", match: "POR @ UTA", type: "U 228.5", odds: "-108", stake: 550, status: "won", timestamp: baseTime - 28799500, payout: 509, platform: "DraftKings", accountName: "John Smith", league: "NBA" as League, awayTeam: "Portland Trail Blazers", homeTeam: "Utah Jazz", timing: 1830 },
    { id: "11b", match: "POR @ UTA", type: "U 228.5", odds: "-108", stake: 450, status: "won", timestamp: baseTime - 28799000, payout: 417, platform: "DraftKings", accountName: "Patricia Garcia", league: "NBA" as League, awayTeam: "Portland Trail Blazers", homeTeam: "Utah Jazz", timing: 2050 },
    
    // POR @ UTA - U 228.5 -108 - FanDuel (batch with 4 accounts, all won) - 8 hours ago
    { id: "11c", match: "POR @ UTA", type: "U 228.5", odds: "-108", stake: 750, status: "won", timestamp: baseTime - 28798500, payout: 694, platform: "FanDuel", accountName: "Sarah Johnson", league: "NBA" as League, awayTeam: "Portland Trail Blazers", homeTeam: "Utah Jazz", timing: 1880 },
    { id: "11d", match: "POR @ UTA", type: "U 228.5", odds: "-108", stake: 600, status: "won", timestamp: baseTime - 28798000, payout: 556, platform: "FanDuel", accountName: "Maria Rodriguez", league: "NBA" as League, awayTeam: "Portland Trail Blazers", homeTeam: "Utah Jazz", timing: 1970 },
    { id: "11e", match: "POR @ UTA", type: "U 228.5", odds: "-108", stake: 500, status: "won", timestamp: baseTime - 28797500, payout: 463, platform: "FanDuel", accountName: "Ryan O'Connor", league: "NBA" as League, awayTeam: "Portland Trail Blazers", homeTeam: "Utah Jazz", timing: 1910 },
    { id: "11f", match: "POR @ UTA", type: "U 228.5", odds: "-108", stake: 400, status: "won", timestamp: baseTime - 28797000, payout: 370, platform: "FanDuel", accountName: "Kevin Thompson", league: "NBA" as League, awayTeam: "Portland Trail Blazers", homeTeam: "Utah Jazz", timing: 2030 },
    
    // NCAAF demo bets - Alabama @ Georgia - ML ALA -150 - FanDuel (batch with 3 accounts, all won) - 2 hours ago
    { id: "ncaaf1", match: "ALA @ UGA", type: "ML ALA", odds: "-150", stake: 750, status: "won", timestamp: baseTime - 7200000, payout: 500, platform: "FanDuel", accountName: "Sarah Johnson", league: "NCAAF" as League, awayTeam: "Alabama Crimson Tide", homeTeam: "Georgia Bulldogs", timing: 1950 },
    { id: "ncaaf1a", match: "ALA @ UGA", type: "ML ALA", odds: "-150", stake: 600, status: "won", timestamp: baseTime - 7199500, payout: 400, platform: "FanDuel", accountName: "Maria Rodriguez", league: "NCAAF" as League, awayTeam: "Alabama Crimson Tide", homeTeam: "Georgia Bulldogs", timing: 2100 },
    { id: "ncaaf1b", match: "ALA @ UGA", type: "ML ALA", odds: "-150", stake: 500, status: "won", timestamp: baseTime - 7199000, payout: 333, platform: "FanDuel", accountName: "Ryan O'Connor", league: "NCAAF" as League, awayTeam: "Alabama Crimson Tide", homeTeam: "Georgia Bulldogs", timing: 1880 },
    
    // Additional bets for 7+ days period - 2 days ago
    { id: "day2-1", match: "HOU @ DAL", type: "ML HOU", odds: "+110", stake: 800, status: "won", timestamp: baseTime - (2 * 24 * 60 * 60 * 1000), payout: 880, platform: "DraftKings", accountName: "John Smith", league: "NFL" as League, awayTeam: "Houston Texans", homeTeam: "Dallas Cowboys", timing: 1920 },
    { id: "day2-1a", match: "HOU @ DAL", type: "ML HOU", odds: "+110", stake: 650, status: "won", timestamp: baseTime - (2 * 24 * 60 * 60 * 1000) + 500, payout: 715, platform: "DraftKings", accountName: "Jennifer Taylor", league: "NFL" as League, awayTeam: "Houston Texans", homeTeam: "Dallas Cowboys", timing: 1850 },
    { id: "day2-1b", match: "HOU @ DAL", type: "ML HOU", odds: "+110", stake: 550, status: "won", timestamp: baseTime - (2 * 24 * 60 * 60 * 1000) + 1000, payout: 605, platform: "DraftKings", accountName: "Christopher Brown", league: "NFL" as League, awayTeam: "Houston Texans", homeTeam: "Dallas Cowboys", timing: 1980 },
    
    // 3 days ago
    { id: "day3-1", match: "LAC @ DEN", type: "Spread -3.5", odds: "-110", stake: 700, status: "won", timestamp: baseTime - (3 * 24 * 60 * 60 * 1000), payout: 636, platform: "FanDuel", accountName: "Sarah Johnson", league: "NFL" as League, awayTeam: "LA Chargers", homeTeam: "Denver Broncos", timing: 1870 },
    { id: "day3-1a", match: "LAC @ DEN", type: "Spread -3.5", odds: "-110", stake: 600, status: "won", timestamp: baseTime - (3 * 24 * 60 * 60 * 1000) + 500, payout: 545, platform: "FanDuel", accountName: "Thomas Anderson", league: "NFL" as League, awayTeam: "LA Chargers", homeTeam: "Denver Broncos", timing: 2010 },
    { id: "day3-1b", match: "LAC @ DEN", type: "Spread -3.5", odds: "-110", stake: 500, status: "lost", timestamp: baseTime - (3 * 24 * 60 * 60 * 1000) + 1000, platform: "FanDuel", accountName: "Emily Davis", league: "NFL" as League, awayTeam: "LA Chargers", homeTeam: "Denver Broncos", error: "Bet limit exceeded", timing: 3100 },
    
    // 5 days ago
    { id: "day5-1", match: "BOS @ MIA", type: "O 220.5", odds: "-105", stake: 750, status: "won", timestamp: baseTime - (5 * 24 * 60 * 60 * 1000), payout: 714, platform: "BetMGM", accountName: "Michael Chen", league: "NBA" as League, awayTeam: "Boston Celtics", homeTeam: "Miami Heat", timing: 1890 },
    { id: "day5-1a", match: "BOS @ MIA", type: "O 220.5", odds: "-105", stake: 600, status: "won", timestamp: baseTime - (5 * 24 * 60 * 60 * 1000) + 500, payout: 571, platform: "BetMGM", accountName: "Robert Williams", league: "NBA" as League, awayTeam: "Boston Celtics", homeTeam: "Miami Heat", timing: 1960 },
    { id: "day5-1b", match: "BOS @ MIA", type: "O 220.5", odds: "-105", stake: 550, status: "won", timestamp: baseTime - (5 * 24 * 60 * 60 * 1000) + 1000, payout: 524, platform: "BetMGM", accountName: "Lisa Anderson", league: "NBA" as League, awayTeam: "Boston Celtics", homeTeam: "Miami Heat", timing: 1820 },
    
    // 10 days ago
    { id: "day10-1", match: "NYG @ PHI", type: "ML PHI", odds: "-120", stake: 850, status: "won", timestamp: baseTime - (10 * 24 * 60 * 60 * 1000), payout: 708, platform: "Caesars", accountName: "Amanda Wilson", league: "NFL" as League, awayTeam: "NY Giants", homeTeam: "Philadelphia Eagles", timing: 1940 },
    { id: "day10-1a", match: "NYG @ PHI", type: "ML PHI", odds: "-120", stake: 700, status: "won", timestamp: baseTime - (10 * 24 * 60 * 60 * 1000) + 500, payout: 583, platform: "Caesars", accountName: "James Lee", league: "NFL" as League, awayTeam: "NY Giants", homeTeam: "Philadelphia Eagles", timing: 1870 },
    { id: "day10-1b", match: "NYG @ PHI", type: "ML PHI", odds: "-120", stake: 600, status: "won", timestamp: baseTime - (10 * 24 * 60 * 60 * 1000) + 1000, payout: 500, platform: "Caesars", accountName: "Patricia Garcia", league: "NFL" as League, awayTeam: "NY Giants", homeTeam: "Philadelphia Eagles", timing: 2010 },
    
    // 20 days ago
    { id: "day20-1", match: "GSW @ LAL", type: "Spread +4.5", odds: "-110", stake: 800, status: "won", timestamp: baseTime - (20 * 24 * 60 * 60 * 1000), payout: 727, platform: "DraftKings", accountName: "Jennifer Taylor", league: "NBA" as League, awayTeam: "GS Warriors", homeTeam: "LA Lakers", timing: 1880 },
    { id: "day20-1a", match: "GSW @ LAL", type: "Spread +4.5", odds: "-110", stake: 650, status: "won", timestamp: baseTime - (20 * 24 * 60 * 60 * 1000) + 500, payout: 591, platform: "DraftKings", accountName: "John Smith", league: "NBA" as League, awayTeam: "GS Warriors", homeTeam: "LA Lakers", timing: 1950 },
    { id: "day20-1b", match: "GSW @ LAL", type: "Spread +4.5", odds: "-110", stake: 550, status: "lost", timestamp: baseTime - (20 * 24 * 60 * 60 * 1000) + 1000, platform: "DraftKings", accountName: "Christopher Brown", league: "NBA" as League, awayTeam: "GS Warriors", homeTeam: "LA Lakers", error: "Insufficient funds", timing: 3200 },
    
    // 45 days ago
    { id: "day45-1", match: "BAL @ PIT", type: "ML BAL", odds: "-140", stake: 900, status: "won", timestamp: baseTime - (45 * 24 * 60 * 60 * 1000), payout: 643, platform: "FanDuel", accountName: "Sarah Johnson", league: "NFL" as League, awayTeam: "Baltimore Ravens", homeTeam: "Pittsburgh Steelers", timing: 1920 },
    { id: "day45-1a", match: "BAL @ PIT", type: "ML BAL", odds: "-140", stake: 750, status: "won", timestamp: baseTime - (45 * 24 * 60 * 60 * 1000) + 500, payout: 536, platform: "FanDuel", accountName: "Maria Rodriguez", league: "NFL" as League, awayTeam: "Baltimore Ravens", homeTeam: "Pittsburgh Steelers", timing: 1860 },
    { id: "day45-1b", match: "BAL @ PIT", type: "ML BAL", odds: "-140", stake: 600, status: "won", timestamp: baseTime - (45 * 24 * 60 * 60 * 1000) + 1000, payout: 429, platform: "FanDuel", accountName: "Ryan O'Connor", league: "NFL" as League, awayTeam: "Baltimore Ravens", homeTeam: "Pittsburgh Steelers", timing: 2030 },
    
    // 60 days ago
    { id: "day60-1", match: "MIL @ PHX", type: "O 230.5", odds: "-108", stake: 850, status: "won", timestamp: baseTime - (60 * 24 * 60 * 60 * 1000), payout: 787, platform: "BetMGM", accountName: "Michael Chen", league: "NBA" as League, awayTeam: "Milwaukee Bucks", homeTeam: "Phoenix Suns", timing: 1910 },
    { id: "day60-1a", match: "MIL @ PHX", type: "O 230.5", odds: "-108", stake: 700, status: "won", timestamp: baseTime - (60 * 24 * 60 * 60 * 1000) + 500, payout: 648, platform: "BetMGM", accountName: "Robert Williams", league: "NBA" as League, awayTeam: "Milwaukee Bucks", homeTeam: "Phoenix Suns", timing: 1970 },
    { id: "day60-1b", match: "MIL @ PHX", type: "O 230.5", odds: "-108", stake: 600, status: "won", timestamp: baseTime - (60 * 24 * 60 * 60 * 1000) + 1000, payout: 556, platform: "BetMGM", accountName: "Lisa Anderson", league: "NBA" as League, awayTeam: "Milwaukee Bucks", homeTeam: "Phoenix Suns", timing: 1840 },
    
    // 75 days ago
    { id: "day75-1", match: "SEA @ SF", type: "ML SF", odds: "-130", stake: 800, status: "won", timestamp: baseTime - (75 * 24 * 60 * 60 * 1000), payout: 615, platform: "Caesars", accountName: "Amanda Wilson", league: "NFL" as League, awayTeam: "Seattle Seahawks", homeTeam: "SF 49ers", timing: 1890 },
    { id: "day75-1a", match: "SEA @ SF", type: "ML SF", odds: "-130", stake: 650, status: "won", timestamp: baseTime - (75 * 24 * 60 * 60 * 1000) + 500, payout: 500, platform: "Caesars", accountName: "James Lee", league: "NFL" as League, awayTeam: "Seattle Seahawks", homeTeam: "SF 49ers", timing: 2020 },
    { id: "day75-1b", match: "SEA @ SF", type: "ML SF", odds: "-130", stake: 550, status: "lost", timestamp: baseTime - (75 * 24 * 60 * 60 * 1000) + 1000, platform: "Caesars", accountName: "Patricia Garcia", league: "NFL" as League, awayTeam: "Seattle Seahawks", homeTeam: "SF 49ers", error: "Connection timeout", timing: 3100 },
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
