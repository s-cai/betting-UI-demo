import { History, ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock } from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useBetHistory } from "@/contexts/BetHistoryContext";

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

export function BetHistoryBar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const { bets } = useBetHistory();

  // Get recent bets (last 6, sorted by timestamp)
  const recentBets = useMemo(() => {
    return [...bets]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 6);
  }, [bets]);

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
            {recentBets.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-xs">
                No bets yet
              </div>
            ) : (
              recentBets.map((bet) => (
                <div
                  key={bet.id}
                  className={cn(
                    "p-2 border-b border-border/30 cursor-pointer hover:bg-accent/50 transition-colors"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-muted-foreground">{formatTimeAgo(bet.timestamp)}</span>
                    {bet.status === "won" && <CheckCircle className="w-3 h-3 text-signal-positive" />}
                    {bet.status === "lost" && <XCircle className="w-3 h-3 text-signal-negative" />}
                    {bet.status === "pending" && <Clock className="w-3 h-3 text-signal-warning animate-pulse-glow" />}
                  </div>
                  
                  <div className="text-xs font-medium mb-0.5">{bet.match}</div>
                  <div className="text-[11px] text-muted-foreground">{bet.type}</div>
                  
                  <div className="flex items-center justify-between mt-1.5 text-[10px]">
                    <span className="font-mono">{bet.odds}</span>
                    <span className={cn(
                      "font-mono",
                      bet.status === "won" && "text-signal-positive",
                      bet.status === "lost" && "text-signal-negative line-through"
                    )}>
                      ${bet.stake.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  {bet.payout && (
                    <div className="text-[10px] text-signal-positive font-mono mt-1">
                      +${bet.payout.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  )}
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
