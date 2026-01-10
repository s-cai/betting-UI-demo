import { Bell, AlertTriangle, TrendingUp, Clock, Settings, Info } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "alert" | "opportunity" | "info" | "warning";
  title: string;
  message: string;
  time: string;
  match?: string;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "opportunity",
    title: "Arbitrage Detected",
    message: "LAL @ BOS spread arbitrage +2.1% ROI",
    time: "2s ago",
    match: "LAL @ BOS",
  },
  {
    id: "2",
    type: "warning",
    title: "Game Paused",
    message: "MIA @ NYK - Timeout called",
    time: "15s ago",
    match: "MIA @ NYK",
  },
  {
    id: "3",
    type: "alert",
    title: "Line Movement",
    message: "KC @ BUF spread moved from -3 to -4.5",
    time: "1m ago",
    match: "KC @ BUF",
  },
  {
    id: "4",
    type: "info",
    title: "Half-time",
    message: "GSW @ PHX entering half-time break",
    time: "2m ago",
    match: "GSW @ PHX",
  },
  {
    id: "5",
    type: "opportunity",
    title: "Best Odds Available",
    message: "DAL ML +145 on DraftKings (best market)",
    time: "3m ago",
    match: "DAL @ DEN",
  },
  {
    id: "6",
    type: "warning",
    title: "Account Limit Warning",
    message: "BetMGM account approaching daily limit",
    time: "5m ago",
  },
];

const typeStyles = {
  alert: {
    icon: AlertTriangle,
    bg: "bg-signal-negative-muted",
    text: "text-signal-negative",
    border: "border-signal-negative/30",
  },
  opportunity: {
    icon: TrendingUp,
    bg: "bg-signal-positive-muted",
    text: "text-signal-positive",
    border: "border-signal-positive/30",
  },
  warning: {
    icon: Clock,
    bg: "bg-signal-warning-muted",
    text: "text-signal-warning",
    border: "border-signal-warning/30",
  },
  info: {
    icon: Info,
    bg: "bg-accent",
    text: "text-muted-foreground",
    border: "border-border",
  },
};

export function NotificationsPanel() {
  const [filter, setFilter] = useState<"all" | "opportunity" | "alert" | "warning">("all");

  const filteredNotifications = filter === "all" 
    ? mockNotifications 
    : mockNotifications.filter(n => n.type === filter);

  return (
    <div className="h-[280px] flex flex-col bg-panel border-b border-panel-border shrink-0">
      {/* Header with Title and Controls */}
      <div className="panel-header flex items-center justify-between border-b border-panel-border">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <span className="font-medium">Alerts</span>
          <span className="text-signal-positive text-[10px] font-mono bg-signal-positive-muted px-1.5 py-0.5 rounded">
            {mockNotifications.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Settings className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground cursor-pointer" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-panel-border bg-panel-header">
        {[
          { key: "all", label: "All" },
          { key: "opportunity", label: "Opportunities" },
          { key: "alert", label: "Alerts" },
          { key: "warning", label: "Warnings" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as typeof filter)}
            className={cn(
              "px-2.5 py-1 text-[10px] font-medium rounded transition-colors",
              filter === tab.key
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto terminal-scrollbar p-2">
        <div className="grid grid-cols-2 gap-2">
          {filteredNotifications.map((notification) => {
            const style = typeStyles[notification.type];
            const Icon = style.icon;
            
            return (
              <div
                key={notification.id}
                className={cn(
                  "p-2.5 rounded border cursor-pointer transition-all duration-150",
                  "hover:bg-accent/50",
                  style.bg,
                  style.border
                )}
              >
                <div className="flex items-start gap-2">
                  <Icon className={cn("w-3.5 h-3.5 mt-0.5 shrink-0", style.text)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn("text-xs font-medium truncate", style.text)}>
                        {notification.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {notification.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight truncate">
                      {notification.message}
                    </p>
                    {notification.match && (
                      <span className="inline-block mt-1 text-[10px] font-mono text-foreground/70 bg-background/50 px-1.5 py-0.5 rounded">
                        {notification.match}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
