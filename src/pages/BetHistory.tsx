import { useState, useMemo, useEffect, useRef } from "react";
import { History, CheckCircle, XCircle, Clock, Filter, Search, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBetHistory, type Bet, type League } from "@/contexts/BetHistoryContext";
import { Input } from "@/components/ui/input";

// League logo URLs - same as SportsPanel
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

const LeagueLogo = ({ league, className = "w-4 h-4" }: { league?: League; className?: string }) => {
  if (!league) return null;
  
  // Only NFL and NBA have logos, others use emojis
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
  
  // NCAAF and NCAAB use emojis
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

// Batch Trade represents a conceptual big trade: game x line x platform
interface BatchTrade {
  key: string; // Unique identifier: match|type|odds|platform|timeWindow
  match: string;
  type: string;
  odds: string;
  platform: string;
  timestamp: number; // Earliest timestamp in the batch
  bets: Bet[]; // All individual account bets in this batch
  totalStake: number;
  totalSucceeded: number;
  accountCount: number;
  status: "won" | "lost" | "pending"; // Aggregate status
  league?: League;
  awayTeam?: string;
  homeTeam?: string;
}

export function BetHistory() {
  const { bets } = useBetHistory();
  // Load persisted filter states from localStorage
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "won" | "lost">(() => {
    const saved = localStorage.getItem('betting-ui-history-status-filter');
    if (saved && ["all", "pending", "won", "lost"].includes(saved)) {
      return saved as "all" | "pending" | "won" | "lost";
    }
    return "all";
  });
  const [searchQuery, setSearchQuery] = useState(() => {
    return localStorage.getItem('betting-ui-history-search-query') || "";
  });
  
  // Refs for scroll containers
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  
  // Persist filter states
  useEffect(() => {
    localStorage.setItem('betting-ui-history-status-filter', statusFilter);
  }, [statusFilter]);
  
  useEffect(() => {
    if (searchQuery) {
      localStorage.setItem('betting-ui-history-search-query', searchQuery);
    } else {
      localStorage.removeItem('betting-ui-history-search-query');
    }
  }, [searchQuery]);
  
  // Group bets into batch trades (game x line x platform)
  // Each batch trade represents a conceptual big trade spread across multiple accounts
  const batchTrades = useMemo(() => {
    const groups: Map<string, Bet[]> = new Map();
    
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
        bets: batchBets,
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

  // Filter batch trades
  const filteredBatchTrades = useMemo(() => {
    return batchTrades.filter(trade => {
      if (statusFilter !== "all" && trade.status !== statusFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          trade.match.toLowerCase().includes(query) ||
          trade.type.toLowerCase().includes(query) ||
          trade.platform.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [batchTrades, statusFilter, searchQuery]);

  // Select batch trade - try to restore from localStorage, otherwise use first
  const [selectedBatchTrade, setSelectedBatchTrade] = useState<BatchTrade | null>(() => {
    const savedKey = localStorage.getItem('betting-ui-history-selected-trade');
    if (savedKey && filteredBatchTrades.length > 0) {
      const savedTrade = filteredBatchTrades.find(t => t.key === savedKey);
      if (savedTrade) {
        return savedTrade;
      }
    }
    if (filteredBatchTrades.length > 0) {
      return filteredBatchTrades[0];
    }
    return null;
  });
  
  // Persist selected batch trade
  useEffect(() => {
    if (selectedBatchTrade) {
      localStorage.setItem('betting-ui-history-selected-trade', selectedBatchTrade.key);
    } else {
      localStorage.removeItem('betting-ui-history-selected-trade');
    }
  }, [selectedBatchTrade]);
  
  // Restore scroll positions on mount
  useEffect(() => {
    const savedLeftScroll = localStorage.getItem('betting-ui-history-left-scroll');
    const savedRightScroll = localStorage.getItem('betting-ui-history-right-scroll');
    
    if (savedLeftScroll && leftScrollRef.current) {
      leftScrollRef.current.scrollTop = parseInt(savedLeftScroll, 10);
    }
    
    if (savedRightScroll && rightScrollRef.current) {
      rightScrollRef.current.scrollTop = parseInt(savedRightScroll, 10);
    }
  }, []);
  
  // Save scroll positions
  const handleLeftScroll = () => {
    if (leftScrollRef.current) {
      localStorage.setItem('betting-ui-history-left-scroll', leftScrollRef.current.scrollTop.toString());
    }
  };
  
  const handleRightScroll = () => {
    if (rightScrollRef.current) {
      localStorage.setItem('betting-ui-history-right-scroll', rightScrollRef.current.scrollTop.toString());
    }
  };

  // Update selected batch trade when filters change
  useEffect(() => {
    if (filteredBatchTrades.length > 0) {
      setSelectedBatchTrade(prev => {
        const currentStillAvailable = prev && filteredBatchTrades.some(t => t.key === prev.key);
        if (!currentStillAvailable) {
          return filteredBatchTrades[0];
        }
        return prev;
      });
    } else {
      setSelectedBatchTrade(null);
    }
  }, [filteredBatchTrades]);

  // Group batch trades by date
  const groupedBatchTrades = useMemo(() => {
    const groups: Record<string, BatchTrade[]> = {};
    filteredBatchTrades.forEach(trade => {
      const date = new Date(trade.timestamp).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(trade);
    });
    return groups;
  }, [filteredBatchTrades]);


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
        {/* Left Side - Batch Trade Listing (Scrollable) */}
        <div className="w-96 border-r border-[hsl(var(--border))] flex flex-col shrink-0">
          <div 
            ref={leftScrollRef}
            onScroll={handleLeftScroll}
            className="flex-1 overflow-y-auto terminal-scrollbar p-4"
          >
            {Object.keys(groupedBatchTrades).length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No batch trades found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedBatchTrades).map(([date, dateTrades]) => (
                  <div key={date}>
                    <div className="text-xs font-semibold text-muted-foreground mb-2 px-2 sticky top-0 bg-background py-1">
                      {date}
                    </div>
                    <div className="space-y-2">
                      {dateTrades.map((trade) => (
                        <div
                          key={trade.key}
                          onClick={() => setSelectedBatchTrade(trade)}
                          className={cn(
                            "bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-md p-3 hover:bg-accent/50 transition-colors cursor-pointer",
                            selectedBatchTrade?.key === trade.key && "bg-accent border-primary"
                          )}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(trade.status)}
                            {trade.league && <LeagueLogo league={trade.league} className="w-3.5 h-3.5" />}
                            {(trade.awayTeam || trade.homeTeam) ? (
                              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                {trade.awayTeam && <span className="font-semibold text-sm text-foreground truncate">{trade.awayTeam}</span>}
                                {trade.awayTeam && trade.homeTeam && <span className="text-xs text-muted-foreground">@</span>}
                                {trade.homeTeam && <span className="font-semibold text-sm text-foreground truncate">{trade.homeTeam}</span>}
                              </div>
                            ) : (
                              <span className="font-semibold text-sm text-foreground truncate flex-1">{trade.match}</span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mb-1">{trade.type} • {trade.odds}</div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-xs font-medium text-primary">{trade.platform}</span>
                            <span className="text-muted-foreground">{formatTimeAgo(trade.timestamp)}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-xs text-muted-foreground">{trade.accountCount} accounts</span>
                            <span className={cn(
                              "font-mono text-xs",
                              trade.status === "won" && "text-[hsl(var(--signal-positive))]",
                              trade.status === "lost" && "text-[hsl(var(--signal-negative))]"
                            )}>
                              ${trade.totalSucceeded.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / ${trade.totalStake.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
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

        {/* Right Side - After-Bet View (Reused from BettingDialog) */}
        <div 
          ref={rightScrollRef}
          onScroll={handleRightScroll}
          className="flex-1 overflow-y-auto terminal-scrollbar p-6"
        >
          {selectedBatchTrade ? (
            <div className="max-w-5xl">
              {/* Match Info Header with Platform at Top Level */}
              <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-md p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {selectedBatchTrade.league && <LeagueLogo league={selectedBatchTrade.league} className="w-4 h-4" />}
                    <h2 className="text-xl font-semibold text-foreground">{selectedBatchTrade.match}</h2>
                  </div>
                  {selectedBatchTrade.platform && platformLogoMap[selectedBatchTrade.platform] && (
                    <img 
                      src={platformLogoMap[selectedBatchTrade.platform]} 
                      alt={`${selectedBatchTrade.platform} Logo`} 
                      className="h-10 w-auto object-contain"
                      loading="lazy"
                    />
                  )}
                </div>
                {(selectedBatchTrade.awayTeam || selectedBatchTrade.homeTeam) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    {selectedBatchTrade.awayTeam && <span>{selectedBatchTrade.awayTeam}</span>}
                    {selectedBatchTrade.awayTeam && selectedBatchTrade.homeTeam && <span>@</span>}
                    {selectedBatchTrade.homeTeam && <span>{selectedBatchTrade.homeTeam}</span>}
                  </div>
                )}
                <div className="text-sm text-muted-foreground mb-2">{selectedBatchTrade.type} • {selectedBatchTrade.odds}</div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(selectedBatchTrade.timestamp).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <span>{formatTimeAgo(selectedBatchTrade.timestamp)}</span>
                </div>
              </div>

              {/* After Bet View Header - Total Succeeded / Total Sent (Reused from BettingDialog) */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[hsl(var(--border))]">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-muted-foreground">Total Succeeded:</span>
                  <span className="text-2xl font-bold font-mono text-primary">
                    ${selectedBatchTrade.totalSucceeded.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / ${selectedBatchTrade.totalStake.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Account Bets Grid - Reusing After-Bet View Style from BettingDialog */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedBatchTrade.bets.map((bet) => {
                  const initials = bet.accountName?.split(' ').map(n => n[0]).join('') || '?';
                  const getBetStatusIcon = (status: Bet['status']) => {
                    switch (status) {
                      case "won":
                        return '✓✓';
                      case "lost":
                        return '✕';
                      case "pending":
                        return '✓';
                      default:
                        return '';
                    }
                  };
                  const getBetStatusText = (status: Bet['status']) => {
                    switch (status) {
                      case "won":
                        return 'Bet won';
                      case "lost":
                        return 'Bet failed';
                      case "pending":
                        return 'Bet pending';
                      default:
                        return '';
                    }
                  };
                  const getBetStatusColor = (status: Bet['status']) => {
                    switch (status) {
                      case "won":
                        return 'text-[hsl(var(--signal-positive))]';
                      case "lost":
                        return 'text-[hsl(var(--signal-negative))]';
                      case "pending":
                        return 'text-[hsl(var(--signal-warning))]';
                      default:
                        return 'text-muted-foreground';
                    }
                  };
                  
                  return (
                    <div
                      key={bet.id}
                      className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-md p-4 relative"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold shrink-0">
                            {initials}
                          </div>
                          <div className="font-semibold text-foreground">{bet.accountName || 'Unknown Account'}</div>
                        </div>
                        <div className="text-lg font-bold font-mono text-primary">
                          ${bet.stake.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>

                      <div className={cn("flex items-center gap-2 mb-2", getBetStatusColor(bet.status))}>
                        <span className="text-xl font-bold">{getBetStatusIcon(bet.status)}</span>
                        <span className="text-sm font-medium">{getBetStatusText(bet.status)}</span>
                      </div>

                      {bet.timing !== undefined && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Time:</span>
                          <span className="font-mono font-semibold">
                            {(bet.timing / 1000).toFixed(2)}s
                          </span>
                        </div>
                      )}

                      {bet.status === "lost" && bet.error && (
                        <div className="mt-2 space-y-2">
                          <div className="text-xs text-[hsl(var(--signal-negative))] bg-[hsl(var(--signal-negative))]/10 px-2 py-1 rounded">
                            {bet.error}
                          </div>
                          {bet.errorScreenshot && (
                            <div className="mt-2">
                              <div className="text-xs text-muted-foreground mb-1">Phone Screenshot:</div>
                              <img
                                src={bet.errorScreenshot}
                                alt="Error screenshot"
                                className="max-w-full h-auto rounded border border-[hsl(var(--border))]"
                                style={{ maxHeight: '300px' }}
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {bet.status === "won" && bet.payout && (
                        <div className="mt-2">
                          <div className="text-xs text-muted-foreground mb-1">Payout:</div>
                          <div className="text-sm font-semibold font-mono text-[hsl(var(--signal-positive))]">
                            +${bet.payout.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <History className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-sm">Select a batch trade to view account details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
