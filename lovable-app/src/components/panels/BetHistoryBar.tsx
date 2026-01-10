import { History, ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Bet {
  id: string;
  match: string;
  type: string;
  odds: string;
  stake: string;
  status: "won" | "lost" | "pending";
  time: string;
  payout?: string;
}

const mockBets: Bet[] = [
  { id: "1", match: "LAL @ BOS", type: "Spread +2.5", odds: "-110", stake: "$500", status: "pending", time: "2m ago" },
  { id: "2", match: "KC @ BUF", type: "ML KC", odds: "-175", stake: "$1,000", status: "won", time: "15m ago", payout: "$571" },
  { id: "3", match: "GSW @ PHX", type: "O 232.5", odds: "-108", stake: "$750", status: "pending", time: "22m ago" },
  { id: "4", match: "SF @ DET", type: "ML DET", odds: "+115", stake: "$400", status: "lost", time: "1h ago" },
  { id: "5", match: "MIA @ NYK", type: "Spread -1.5", odds: "-110", stake: "$600", status: "won", time: "2h ago", payout: "$545" },
  { id: "6", match: "PHI @ DAL", type: "U 44.5", odds: "-110", stake: "$300", status: "pending", time: "3h ago" },
];

export function BetHistoryBar() {
  const [isExpanded, setIsExpanded] = useState(true);

  const stats = {
    pending: mockBets.filter(b => b.status === "pending").length,
    won: mockBets.filter(b => b.status === "won").length,
    lost: mockBets.filter(b => b.status === "lost").length,
  };

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
            {mockBets.map((bet) => (
              <div
                key={bet.id}
                className={cn(
                  "p-2 border-b border-border/30 cursor-pointer hover:bg-accent/50 transition-colors"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-muted-foreground">{bet.time}</span>
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
                    {bet.stake}
                  </span>
                </div>
                
                {bet.payout && (
                  <div className="text-[10px] text-signal-positive font-mono mt-1">
                    +{bet.payout}
                  </div>
                )}
              </div>
            ))}
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
