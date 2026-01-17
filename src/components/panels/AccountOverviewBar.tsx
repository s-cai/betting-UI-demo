import { ChevronUp, ChevronDown, Wifi, WifiOff, DollarSign, TrendingDown } from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { platforms, Account } from "@/pages/Accounts";
import { useAccounts } from "@/contexts/AccountsContext";

interface PlatformSummary {
  platformId: string;
  platformName: string;
  logo: string;
  online: { balance: number; count: number };
  offline: { balance: number; count: number };
  limitDownCount: number; // Count of accounts whose limit decreased in last 24 hours
}

function getAccountStatus(account: Account): "online" | "offline" {
  if (account.phoneOffline) return "offline";
  // Limited accounts (onHold) are now counted as online
  return "online";
}

export function AccountOverviewBar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const { accounts } = useAccounts();

  const platformSummaries = useMemo<PlatformSummary[]>(() => {
    const now = Date.now();
    const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
    
    return platforms.map(platform => {
      const platformAccounts = accounts[platform.id] || [];
      
      const summary: PlatformSummary = {
        platformId: platform.id,
        platformName: platform.name,
        logo: platform.logo,
        online: { balance: 0, count: 0 },
        offline: { balance: 0, count: 0 },
        limitDownCount: 0
      };

      platformAccounts.forEach(account => {
        const status = getAccountStatus(account);
        summary[status].balance += account.balance;
        summary[status].count += 1;
        
        // Count accounts whose limit decreased in the last 24 hours
        if (account.limitChangedAt && account.limitChangedAt >= twentyFourHoursAgo) {
          summary.limitDownCount += 1;
        }
      });

      return summary;
    });
  }, [accounts]);

  const totalStats = useMemo(() => {
    let online = 0;
    let offline = 0;
    let totalBalance = 0;

    platformSummaries.forEach(summary => {
      online += summary.online.count;
      offline += summary.offline.count;
      totalBalance += summary.online.balance + summary.offline.balance;
    });

    return { online, offline, totalBalance };
  }, [platformSummaries]);

  return (
    <div className={cn(
      "bg-panel border-t border-panel-border transition-all duration-200",
      isExpanded ? "h-auto" : "h-10"
    )}>
      {/* Toggle Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-10 px-4 flex items-center justify-between cursor-pointer hover:bg-accent/30"
      >
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-signal-positive" />
            <span className="text-sm font-mono font-medium text-signal-positive">
              ${totalStats.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-muted-foreground">Total Balance</span>
          </div>
          
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-signal-online" />
              <span className="font-mono">{totalStats.online}</span>
              <span className="text-muted-foreground">Online</span>
            </div>
            <div className="flex items-center gap-1.5">
              <WifiOff className="w-3.5 h-3.5 text-signal-offline" />
              <span className="font-mono">{totalStats.offline}</span>
              <span className="text-muted-foreground">Offline</span>
            </div>
          </div>
        </div>
        
        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </div>

      {/* Platform Summary Grid */}
      {isExpanded && (
        <div className="px-4 pb-3 overflow-x-auto terminal-scrollbar">
          <div className="flex gap-2">
            {platformSummaries.map((summary) => {
              const totalBalance = summary.online.balance + summary.offline.balance;
              return (
                <div
                  key={summary.platformId}
                  className="shrink-0 w-48 p-3 rounded border border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-all hover:bg-accent/50"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <img 
                      src={summary.logo} 
                      alt={`${summary.platformName} Logo`} 
                      className="h-6 w-auto object-contain"
                    />
                    <span className="text-xs font-mono font-semibold text-signal-positive">
                      ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {/* Online (includes limited accounts) */}
                    {summary.online.count > 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <Wifi className="w-3 h-3 text-signal-online" />
                          <span className="text-muted-foreground">Online:</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-signal-positive font-medium">
                            ${summary.online.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className="text-muted-foreground">({summary.online.count})</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Offline */}
                    {summary.offline.count > 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <WifiOff className="w-3 h-3 text-signal-offline" />
                          <span className="text-muted-foreground">Offline:</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-muted-foreground font-medium">
                            ${summary.offline.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className="text-muted-foreground">({summary.offline.count})</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Limit Down (last 24 hours) */}
                    {summary.limitDownCount > 0 && (
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-[hsl(var(--border))]">
                        <div className="flex items-center gap-1.5">
                          <TrendingDown className="w-3 h-3 text-[hsl(var(--signal-warning))]" />
                          <span className="text-muted-foreground">Limit ↓ (24h):</span>
                        </div>
                        <span className="font-mono text-[hsl(var(--signal-warning))] font-medium">
                          {summary.limitDownCount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
