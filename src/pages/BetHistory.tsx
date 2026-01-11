import { useState, useMemo } from "react";
import { History, CheckCircle, XCircle, Clock, Filter, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBetHistory, type Bet } from "@/contexts/BetHistoryContext";
import { Input } from "@/components/ui/input";

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

export function BetHistory() {
  const { bets } = useBetHistory();
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "won" | "lost">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Group bets by date
  const groupedBets = useMemo(() => {
    const filtered = bets.filter(bet => {
      if (statusFilter !== "all" && bet.status !== statusFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          bet.match.toLowerCase().includes(query) ||
          bet.type.toLowerCase().includes(query) ||
          bet.platform?.toLowerCase().includes(query) ||
          bet.accountName?.toLowerCase().includes(query)
        );
      }
      return true;
    });

    // Sort by timestamp (newest first)
    const sorted = [...filtered].sort((a, b) => b.timestamp - a.timestamp);

    // Group by date
    const groups: Record<string, Bet[]> = {};
    sorted.forEach(bet => {
      const date = new Date(bet.timestamp).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(bet);
    });

    return groups;
  }, [bets, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: bets.length,
      pending: bets.filter(b => b.status === "pending").length,
      won: bets.filter(b => b.status === "won").length,
      lost: bets.filter(b => b.status === "lost").length,
      totalStake: bets.reduce((sum, b) => sum + b.stake, 0),
      totalPayout: bets.filter(b => b.status === "won" && b.payout).reduce((sum, b) => sum + (b.payout || 0), 0),
    };
  }, [bets]);

  const getStatusIcon = (status: Bet['status']) => {
    switch (status) {
      case "won":
        return <CheckCircle className="w-4 h-4 text-[hsl(var(--signal-positive))]" />;
      case "lost":
        return <XCircle className="w-4 h-4 text-[hsl(var(--signal-negative))]" />;
      case "pending":
        return <Clock className="w-4 h-4 text-[hsl(var(--signal-warning))] animate-pulse" />;
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="bg-[hsl(var(--panel-header))] border-b border-[hsl(var(--border))] px-6 py-4 shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <History className="w-5 h-5 text-foreground" />
          <h1 className="text-xl font-semibold text-foreground">Bet History</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-md p-3">
            <div className="text-xs text-muted-foreground mb-1">Total Bets</div>
            <div className="text-lg font-bold text-foreground">{stats.total}</div>
          </div>
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-md p-3">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Pending
            </div>
            <div className="text-lg font-bold text-[hsl(var(--signal-warning))]">{stats.pending}</div>
          </div>
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-md p-3">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Won
            </div>
            <div className="text-lg font-bold text-[hsl(var(--signal-positive))]">{stats.won}</div>
          </div>
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-md p-3">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              Lost
            </div>
            <div className="text-lg font-bold text-[hsl(var(--signal-negative))]">{stats.lost}</div>
          </div>
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-md p-3">
            <div className="text-xs text-muted-foreground mb-1">Total Payout</div>
            <div className="text-lg font-bold font-mono text-[hsl(var(--signal-positive))]">
              ${stats.totalPayout.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Status:</span>
            {(["all", "pending", "won", "lost"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded transition-colors capitalize",
                  statusFilter === status
                    ? "bg-accent text-foreground"
                    : "bg-[hsl(var(--card))] text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="flex-1 min-w-[200px] max-w-md">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search bets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bet List */}
      <div className="flex-1 overflow-y-auto terminal-scrollbar p-6">
        {Object.keys(groupedBets).length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No bets found</p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-6">
            {Object.entries(groupedBets).map(([date, dateBets]) => (
              <div key={date}>
                <div className="text-sm font-semibold text-muted-foreground mb-3 px-2">
                  {date}
                </div>
                <div className="space-y-2">
                  {dateBets.map((bet) => (
                    <div
                      key={bet.id}
                      className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-md p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(bet.status)}
                            <span className="font-semibold text-foreground">{bet.match}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(bet.timestamp)}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground mb-1">{bet.type}</div>
                          {bet.platform && (
                            <div className="text-xs text-muted-foreground">
                              Platform: {bet.platform}
                              {bet.accountName && ` • Account: ${bet.accountName}`}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-sm font-semibold text-foreground mb-1">
                            ${bet.stake.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className="text-xs text-muted-foreground">Odds: {bet.odds}</div>
                          {bet.payout && bet.status === "won" && (
                            <div className="text-xs font-mono text-[hsl(var(--signal-positive))] mt-1">
                              +${bet.payout.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          )}
                        </div>
                      </div>
                      {bet.errorScreenshot && (
                        <div className="mt-3 pt-3 border-t border-[hsl(var(--border))]">
                          <div className="text-xs text-muted-foreground mb-2">Error Screenshot:</div>
                          <img
                            src={bet.errorScreenshot}
                            alt="Error screenshot"
                            className="max-w-full h-auto rounded border border-[hsl(var(--border))]"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
