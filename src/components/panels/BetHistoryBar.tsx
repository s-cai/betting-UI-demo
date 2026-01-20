import { History, ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock } from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useBetHistory, type League, type Bet } from "@/contexts/BetHistoryContext";

// League logo URLs
const leagueLogos: Record<"NFL" | "NBA", string> = {
  NFL: "https://cdn.freebiesupply.com/logos/large/2x/nfl-1-logo-png-transparent.png",
  NBA: "https://upload.wikimedia.org/wikipedia/en/thumb/0/03/National_Basketball_Association_logo.svg/512px-National_Basketball_Association_logo.svg.png",
};

// Platform logo map - same as OddsComparisonGrid and Accounts
// Use base URL for GitHub Pages compatibility
const getLogoPath = (logoName: string) => `${import.meta.env.BASE_URL}resources/${logoName}`;
const platformLogoMap: Record<string, string> = {
  "DraftKings": getLogoPath("draftkings-logo.svg"),
  "FanDuel": getLogoPath("fanduel-logo.svg"),
  "BetMGM": getLogoPath("betmgm-logo.svg"),
  "Caesars": getLogoPath("caesars-logo.svg"),
  "PointsBet": getLogoPath("pointsbet-logo.svg"),
  "Bet365": getLogoPath("bet365-logo.svg"),
  "Unibet": getLogoPath("unibet-logo.svg"),
  "WynnBET": getLogoPath("wynnbet-logo.svg"),
};

const LeagueLogo = ({ league, className = "w-3 h-3" }: { league?: League; className?: string }) => {
  if (!league) return null;
  
  if (league === "NFL" || league === "NBA") {
    const logoUrl = leagueLogos[league];
    return (
      <img 
        src={logoUrl} 
        alt={league} 
        className={cn("object-contain max-w-full max-h-full", className)}
        style={{ imageRendering: 'auto' }}
        loading="lazy"
      />
    );
  }
  
  // For emojis, use text size instead of width/height
  const emojiSize = className.includes("w-2.5") ? "text-[10px]" : className.includes("w-3") ? "text-xs" : "text-sm";
  return (
    <span className={emojiSize}>
      {league === "NCAAF" ? "🏈" : "🏀"}
    </span>
  );
};


const formatTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

interface BatchTrade {
  key: string;
  match: string;
  type: string;
  odds: string;
  platform?: string;
  timestamp: number;
  totalStake: number;
  totalSucceeded: number;
  accountCount: number;
  status: "won" | "lost" | "pending";
  league?: League;
  awayTeam?: string;
  homeTeam?: string;
  bets: Bet[]; // Add bets array to calculate counts
}

export function BetHistoryBar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const { bets } = useBetHistory();

  // Group bets into batch trades (same logic as BetHistory.tsx)
  const batchTrades = useMemo(() => {
    const groups: Map<string, typeof bets> = new Map();
    
    bets.forEach(bet => {
      // Create a key based on match, type, odds, platform, and rounded timestamp (2 minute window)
      const timeWindow = Math.floor(bet.timestamp / 120000) * 120000;
      const platform = bet.platform || 'Unknown';
      const key = `${bet.match}|${bet.type}|${bet.odds}|${platform}|${timeWindow}`;
      
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(bet);
    });
    
    // Convert groups to BatchTrade objects
    const trades: BatchTrade[] = [];
    groups.forEach((batchBets, key) => {
      const firstBet = batchBets[0];
      const totalStake = batchBets.reduce((sum, bet) => sum + bet.stake, 0);
      const totalSucceeded = batchBets
        .filter(bet => bet.status === "won" || bet.status === "pending")
        .reduce((sum, bet) => sum + bet.stake, 0);
      
      // Determine aggregate status: if any pending, it's pending; else if any won, it's won; else lost
      let aggregateStatus: "won" | "lost" | "pending" = "lost";
      if (batchBets.some(b => b.status === "pending")) {
        aggregateStatus = "pending";
      } else if (batchBets.some(b => b.status === "won")) {
        aggregateStatus = "won";
      }
      
      trades.push({
        key,
        match: firstBet.match,
        type: firstBet.type,
        odds: firstBet.odds,
        platform: firstBet.platform || 'Unknown',
        timestamp: Math.min(...batchBets.map(b => b.timestamp)),
        totalStake,
        totalSucceeded,
        accountCount: batchBets.length,
        status: aggregateStatus,
        league: firstBet.league,
        awayTeam: firstBet.awayTeam,
        homeTeam: firstBet.homeTeam,
        bets: batchBets, // Store bets array for status counts
      });
    });
    
    return trades.sort((a, b) => b.timestamp - a.timestamp);
  }, [bets]);

  // Get today's batch trades (filtered by noon-to-noon boundary, sorted by timestamp)
  const todaysBatchTrades = useMemo(() => {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Set boundary at noon (12:00:00)
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
    
    return batchTrades.filter(trade => {
      const tradeTime = trade.timestamp;
      return tradeTime >= periodStart && tradeTime < periodEnd;
    });
  }, [batchTrades]);

  const stats = useMemo(() => {
    return {
      pending: bets.filter(b => b.status === "pending").length,
      won: bets.filter(b => b.status === "won").length,
      lost: bets.filter(b => b.status === "lost").length,
    };
  }, [bets]);

  return (
    <div className={cn(
      "bg-panel border-l border-panel-border transition-all duration-200 flex flex-col shrink-0",
      isExpanded ? "w-panel-sm" : "w-10"
    )}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-2 hover:bg-accent flex items-center justify-center border-b border-panel-border"
      >
        {isExpanded ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {isExpanded ? (
        <>
          {/* Header */}
          <div className="panel-header flex items-center gap-2">
            <History className="w-3.5 h-3.5" />
            <span>Today's Bets</span>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-panel-border text-[10px]">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-signal-warning" />
              <span>{stats.pending}</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-signal-positive" />
              <span>{stats.won}</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="w-3 h-3 text-signal-negative" />
              <span>{stats.lost}</span>
            </div>
          </div>

          {/* Bet List */}
          <div className="flex-1 overflow-y-auto terminal-scrollbar min-h-0">
            {todaysBatchTrades.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-xs">
                No bets today
              </div>
            ) : (
              todaysBatchTrades.map((trade) => (
                <div
                  key={trade.key}
                  className="p-2 border-b border-border/30"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-muted-foreground">{formatTimeAgo(trade.timestamp)}</span>
                    {trade.status === "won" && <CheckCircle className="w-3 h-3 text-signal-positive" />}
                    {trade.status === "lost" && <XCircle className="w-3 h-3 text-signal-negative" />}
                    {trade.status === "pending" && <Clock className="w-3 h-3 text-signal-warning animate-pulse-glow" />}
                  </div>
                  
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {trade.league && <LeagueLogo league={trade.league} className="w-3 h-3" />}
                      <span className="text-xs font-medium truncate">{trade.match}</span>
                    </div>
                    {trade.platform && platformLogoMap[trade.platform] && (
                      <img
                        src={platformLogoMap[trade.platform]}
                        alt={`${trade.platform} Logo`}
                        className="h-3.5 w-auto object-contain shrink-0"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{trade.type} • {trade.odds}</div>
                  
                  {/* Account Status Summary with Color Coding */}
                  {trade.bets && (
                    <div className="flex items-center gap-2 mt-1.5 px-1.5 py-1 rounded bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
                      <span className="text-[10px] text-muted-foreground">{trade.accountCount} accounts:</span>
                      <div className="flex items-center gap-1.5">
                        {trade.bets.filter(b => b.status === "won").length > 0 && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[hsl(var(--signal-positive))]/20">
                            <CheckCircle className="w-2.5 h-2.5 text-[hsl(var(--signal-positive))]" />
                            <span className="text-[10px] font-medium text-[hsl(var(--signal-positive))]">
                              {trade.bets.filter(b => b.status === "won").length}
                            </span>
                          </div>
                        )}
                        {trade.bets.filter(b => b.status === "lost").length > 0 && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[hsl(var(--signal-negative))]/20">
                            <XCircle className="w-2.5 h-2.5 text-[hsl(var(--signal-negative))]" />
                            <span className="text-[10px] font-medium text-[hsl(var(--signal-negative))]">
                              {trade.bets.filter(b => b.status === "lost").length}
                            </span>
                          </div>
                        )}
                        {trade.bets.filter(b => b.status === "pending").length > 0 && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[hsl(var(--signal-warning))]/20">
                            <Clock className="w-2.5 h-2.5 text-[hsl(var(--signal-warning))]" />
                            <span className="text-[10px] font-medium text-[hsl(var(--signal-warning))]">
                              {trade.bets.filter(b => b.status === "pending").length}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-end mt-1.5 text-[10px]">
                    <span className={cn(
                      "font-mono text-xs",
                      trade.status === "won" && "text-signal-positive",
                      trade.status === "lost" && "text-signal-negative"
                    )}>
                      ${trade.totalSucceeded.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / ${trade.totalStake.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center pt-4 gap-3">
          <History className="w-4 h-4 text-muted-foreground" />
          <div className="flex flex-col items-center gap-1 text-[10px]">
            <span className="text-signal-warning">{stats.pending}</span>
            <span className="text-signal-positive">{stats.won}</span>
            <span className="text-signal-negative">{stats.lost}</span>
          </div>
        </div>
      )}
    </div>
  );
}
