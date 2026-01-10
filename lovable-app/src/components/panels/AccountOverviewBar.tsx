import { ChevronUp, ChevronDown, Wifi, WifiOff, AlertTriangle, DollarSign } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Account {
  id: string;
  platform: string;
  balance: string;
  status: "online" | "limited" | "offline";
  device: string;
}

const mockAccounts: Account[] = [
  { id: "1", platform: "DraftKings", balance: "$12,450", status: "online", device: "iPhone 15 Pro" },
  { id: "2", platform: "FanDuel", balance: "$8,320", status: "online", device: "Pixel 8" },
  { id: "3", platform: "BetMGM", balance: "$5,180", status: "limited", device: "Galaxy S24" },
  { id: "4", platform: "Caesars", balance: "$15,890", status: "online", device: "iPhone 14" },
  { id: "5", platform: "PointsBet", balance: "$3,200", status: "offline", device: "OnePlus 12" },
  { id: "6", platform: "Bet365", balance: "$22,100", status: "online", device: "iPhone 15" },
  { id: "7", platform: "Unibet", balance: "$6,750", status: "online", device: "Pixel 7" },
  { id: "8", platform: "WynnBET", balance: "$4,500", status: "limited", device: "Galaxy S23" },
];

export function AccountOverviewBar() {
  const [isExpanded, setIsExpanded] = useState(true);

  const stats = {
    online: mockAccounts.filter(a => a.status === "online").length,
    limited: mockAccounts.filter(a => a.status === "limited").length,
    offline: mockAccounts.filter(a => a.status === "offline").length,
    totalBalance: mockAccounts.reduce((sum, a) => sum + parseFloat(a.balance.replace(/[$,]/g, "")), 0),
  };

  return (
    <div className={cn(
      "bg-panel border-t border-panel-border transition-all duration-200",
      isExpanded ? "h-32" : "h-10"
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
              ${stats.totalBalance.toLocaleString()}
            </span>
            <span className="text-[10px] text-muted-foreground">Total Balance</span>
          </div>
          
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-signal-online" />
              <span className="font-mono">{stats.online}</span>
              <span className="text-muted-foreground">Online</span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-signal-warning" />
              <span className="font-mono">{stats.limited}</span>
              <span className="text-muted-foreground">Limited</span>
            </div>
            <div className="flex items-center gap-1.5">
              <WifiOff className="w-3.5 h-3.5 text-signal-offline" />
              <span className="font-mono">{stats.offline}</span>
              <span className="text-muted-foreground">Offline</span>
            </div>
          </div>
        </div>
        
        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </div>

      {/* Account Grid */}
      {isExpanded && (
        <div className="px-4 pb-3 overflow-x-auto terminal-scrollbar">
          <div className="flex gap-2">
            {mockAccounts.map((account) => (
              <div
                key={account.id}
                className={cn(
                  "shrink-0 w-36 p-2 rounded border transition-all cursor-pointer hover:bg-accent/50",
                  account.status === "online" && "border-signal-online/30 bg-signal-positive-muted/30",
                  account.status === "limited" && "border-signal-warning/30 bg-signal-warning-muted/30",
                  account.status === "offline" && "border-signal-offline/30 bg-muted/30"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium truncate">{account.platform}</span>
                  <span className={cn(
                    "status-dot",
                    account.status === "online" && "status-online",
                    account.status === "limited" && "status-limited",
                    account.status === "offline" && "status-offline"
                  )} />
                </div>
                <div className={cn(
                  "text-sm font-mono font-medium",
                  account.status === "online" && "text-signal-positive",
                  account.status === "limited" && "text-signal-warning",
                  account.status === "offline" && "text-muted-foreground"
                )}>
                  {account.balance}
                </div>
                <div className="text-[10px] text-muted-foreground truncate mt-0.5">
                  {account.device}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
