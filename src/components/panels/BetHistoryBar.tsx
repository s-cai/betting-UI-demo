import { History, ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock } from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useBetHistory, type League } from "@/contexts/BetHistoryContext";

// League logo URLs
const leagueLogos: Record<"NFL" | "NBA", string> = {
  NFL: "https://cdn.freebiesupply.com/logos/large/2x/nfl-1-logo-png-transparent.png",
  NBA: "https://cdn.freebiesupply.com/logos/large/2x/nba-2-logo-png-transparent.png",
};

const LeagueLogo = ({ league, className = "w-3 h-3" }: { league?: League; className?: string }) => {
  if (!league) return null;
  
  if (league === "NFL" || league === "NBA") {
    const logoUrl = leagueLogos[league];
    return (
      <img 
        src={logoUrl} 
        alt={league} 
        className={cn("object-contain", className)}
        style={{ imageRendering: 'auto' }}
        loading="lazy"
      />
    );
  }
  
  return (
    <span className={className}>
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
      });
    });
    
    return trades.sort((a, b) => b.timestamp - a.timestamp);
  }, [bets]);

  // Get recent batch trades (last 6, sorted by timestamp)
  const recentBatchTrades = useMemo(() => {
    return batchTrades.slice(0, 6);
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
            <span>Recent Bets</span>
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
          <div className="flex-1 overflow-y-auto terminal-scrollbar">
            {recentBatchTrades.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-xs">
                No bets yet
              </div>
            ) : (
              recentBatchTrades.map((trade) => (
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
                  
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {trade.league && <LeagueLogo league={trade.league} className="w-3 h-3" />}
                    <span className="text-xs font-medium truncate">{trade.match}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">{trade.type} • {trade.odds}</div>
                  
                  <div className="flex items-center justify-between mt-1.5 text-[10px]">
                    <span className="text-muted-foreground">{trade.accountCount} accounts</span>
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
