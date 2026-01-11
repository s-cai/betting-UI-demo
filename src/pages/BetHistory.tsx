import { useState, useMemo, useEffect } from "react";
import { History, CheckCircle, XCircle, Clock, Filter, Search, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBetHistory, type Bet, type League } from "@/contexts/BetHistoryContext";
import { Input } from "@/components/ui/input";

// League logo URLs - same as SportsPanel
const leagueLogos: Record<"NFL" | "NBA", string> = {
  NFL: "https://cdn.freebiesupply.com/logos/large/2x/nfl-1-logo-png-transparent.png",
  NBA: "https://cdn.freebiesupply.com/logos/large/2x/nba-2-logo-png-transparent.png",
};

const LeagueLogo = ({ league, className = "w-4 h-4" }: { league?: League; className?: string }) => {
  if (!league) return null;
  
  // Only NFL and NBA have logos, others use emojis
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
  
  // NCAAF and NCAAB use emojis
  return (
    <span className={className}>
      {league === "NCAAF" ? "🏈" : "🏀"}
    </span>
  );
};

// Get team logo emoji based on league
const getTeamLogoEmoji = (league?: League): string => {
  if (!league) return "📊";
  if (league === "NFL" || league === "NCAAF") {
    return "🏈";
  } else if (league === "NBA" || league === "NCAAB") {
    return "🏀";
  }
  return "📊";
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

export function BetHistory() {
  const { bets } = useBetHistory();
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "won" | "lost">("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Get filtered and sorted bets for selection
  const filteredBets = useMemo(() => {
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
    return [...filtered].sort((a, b) => b.timestamp - a.timestamp);
  }, [bets, statusFilter, searchQuery]);
  
  // Select first bet by default, or maintain selection if it's still in filtered list
  const [selectedBet, setSelectedBet] = useState<Bet | null>(() => {
    if (filteredBets.length > 0) {
      return filteredBets[0];
    }
    return null;
  });
  
  // Update selected bet when filters change
  useEffect(() => {
    if (filteredBets.length > 0) {
      // If current selection is still in filtered list, keep it; otherwise select first
      const currentSelectedStillAvailable = selectedBet && filteredBets.some(b => b.id === selectedBet.id);
      if (!currentSelectedStillAvailable) {
        setSelectedBet(filteredBets[0]);
      }
    } else {
      setSelectedBet(null);
    }
  }, [filteredBets]);

  // Group bets by date (using filteredBets)
  const groupedBets = useMemo(() => {
    // Group by date
    const groups: Record<string, Bet[]> = {};
    filteredBets.forEach(bet => {
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
  }, [filteredBets]);

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

      {/* Bet List and Details View - Side by Side */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Side - Bet Listing (Scrollable) */}
        <div className="w-96 border-r border-[hsl(var(--border))] flex flex-col shrink-0">
          <div className="flex-1 overflow-y-auto terminal-scrollbar p-4">
            {Object.keys(groupedBets).length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No bets found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedBets).map(([date, dateBets]) => (
                  <div key={date}>
                    <div className="text-xs font-semibold text-muted-foreground mb-2 px-2 sticky top-0 bg-background py-1">
                      {date}
                    </div>
                    <div className="space-y-2">
                      {dateBets.map((bet) => (
                        <div
                          key={bet.id}
                          onClick={() => setSelectedBet(bet)}
                          className={cn(
                            "bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-md p-3 hover:bg-accent/50 transition-colors cursor-pointer",
                            selectedBet?.id === bet.id && "bg-accent border-primary"
                          )}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(bet.status)}
                            {bet.league && <LeagueLogo league={bet.league} className="w-3.5 h-3.5" />}
                            <span className="font-semibold text-sm text-foreground truncate flex-1">{bet.match}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mb-1">{bet.type}</div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono text-foreground">
                              ${bet.stake.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-muted-foreground">{formatTimeAgo(bet.timestamp)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Bet Details */}
        <div className="flex-1 overflow-y-auto terminal-scrollbar p-6">
          {selectedBet ? (
            <div className="max-w-3xl">
              <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-md p-6">
              <div className="flex items-start justify-between mb-6 pb-4 border-b border-[hsl(var(--border))]">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(selectedBet.status)}
                      {selectedBet.league && <LeagueLogo league={selectedBet.league} className="w-5 h-5" />}
                      <h2 className="text-xl font-semibold text-foreground">{selectedBet.match}</h2>
                    </div>
                    {(selectedBet.awayTeam || selectedBet.homeTeam) && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        {selectedBet.league && (
                          <div className="w-4 h-4 bg-muted rounded flex items-center justify-center shrink-0">
                            <span className="text-[8px] text-muted-foreground">{getTeamLogoEmoji(selectedBet.league)}</span>
                          </div>
                        )}
                        {selectedBet.awayTeam && <span>{selectedBet.awayTeam}</span>}
                        {selectedBet.awayTeam && selectedBet.homeTeam && <span>@</span>}
                        {selectedBet.homeTeam && <span>{selectedBet.homeTeam}</span>}
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground mb-1">{selectedBet.type}</div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(selectedBet.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <span>{formatTimeAgo(selectedBet.timestamp)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-2xl font-bold text-foreground mb-1">
                    ${selectedBet.stake.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-muted-foreground">Stake</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Odds</div>
                  <div className="text-lg font-semibold text-foreground">{selectedBet.odds}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Status</div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedBet.status)}
                    <span className="text-lg font-semibold capitalize text-foreground">{selectedBet.status}</span>
                  </div>
                </div>
                {selectedBet.platform && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Platform</div>
                    <div className="text-lg font-semibold text-foreground">{selectedBet.platform}</div>
                  </div>
                )}
                {selectedBet.accountName && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Account</div>
                    <div className="text-lg font-semibold text-foreground">{selectedBet.accountName}</div>
                  </div>
                )}
                {selectedBet.payout && selectedBet.status === "won" && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Payout</div>
                    <div className="text-lg font-semibold font-mono text-[hsl(var(--signal-positive))]">
                      +${selectedBet.payout.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Bet ID</div>
                  <div className="text-sm font-mono text-foreground">{selectedBet.id}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Potential Return</div>
                  <div className="text-sm font-mono text-foreground">
                    {selectedBet.status === "pending" ? "Calculating..." : selectedBet.payout ? `$${(selectedBet.stake + selectedBet.payout).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${selectedBet.stake.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </div>
                </div>
              </div>

              {selectedBet.errorScreenshot && (
                <div className="mt-6 pt-6 border-t border-[hsl(var(--border))]">
                  <div className="text-sm font-semibold text-muted-foreground mb-3">Error Screenshot</div>
                  <img
                    src={selectedBet.errorScreenshot}
                    alt="Error screenshot"
                    className="max-w-full h-auto rounded border border-[hsl(var(--border))]"
                  />
                </div>
              )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <History className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-sm">Select a bet to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
