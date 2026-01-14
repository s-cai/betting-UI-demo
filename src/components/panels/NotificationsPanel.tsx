import { Bell, AlertTriangle, TrendingUp, Clock, Settings, Info } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Match } from "./SportsPanel";
import { allMatches } from "./SportsPanel";

interface Notification {
  id: string;
  type: "alert" | "opportunity" | "info" | "warning";
  title: string;
  message: string;
  time: string;
  match?: string;
  matchId?: string; // Store match ID for direct navigation
}

interface NotificationsPanelProps {
  onMatchSelect?: (match: Match) => void;
  onNavigateToOdds?: () => void;
}

// Helper function to create notifications based on available matches
// These demo alerts match the NCAA configuration options
const createNotificationsFromMatches = (matches: Match[]): Notification[] => {
  const notifications: Notification[] = [];
  
  // Filter for NCAAF matches if available, otherwise use any matches
  const ncaafMatches = matches.filter(m => m.league === "NCAAF");
  const sampleMatches = ncaafMatches.length > 0 ? ncaafMatches.slice(0, 8) : matches.slice(0, 8);
  
  sampleMatches.forEach((match, index) => {
    const matchString = `${match.awayTeam} @ ${match.homeTeam}`;
    const timeAgo = index === 0 ? "2s ago" : index === 1 ? "15s ago" : index === 2 ? "30s ago" : index === 3 ? "1m ago" : index === 4 ? "2m ago" : index === 5 ? "3m ago" : index === 6 ? "4m ago" : "5m ago";
    
    // Generate different types of alerts matching NCAA configs
    if (index === 0) {
      // Timeout - Media timeout
      notifications.push({
        id: `notif-${match.id}-timeout`,
        type: "warning",
        title: "Media Timeout",
        message: `${matchString} - Media timeout called`,
        time: timeAgo,
        match: matchString,
        matchId: match.id,
      });
    } else if (index === 1) {
      // Review - Flagrant foul
      notifications.push({
        id: `notif-${match.id}-review`,
        type: "warning",
        title: "Referee Review",
        message: `${matchString} - Reviewing flagrant foul`,
        time: timeAgo,
        match: matchString,
        matchId: match.id,
      });
    } else if (index === 2) {
      // Closing Line Movement - Spread
      notifications.push({
        id: `notif-${match.id}-line-move`,
        type: "alert",
        title: "Closing Line Movement",
        message: `${matchString} spread moved from -3.0 to -4.5`,
        time: timeAgo,
        match: matchString,
        matchId: match.id,
      });
    } else if (index === 3) {
      // Intermission - Halftime
      notifications.push({
        id: `notif-${match.id}-halftime`,
        type: "info",
        title: "Halftime",
        message: `${matchString} entering halftime break`,
        time: timeAgo,
        match: matchString,
        matchId: match.id,
      });
    } else if (index === 4) {
      // Upset Alert
      notifications.push({
        id: `notif-${match.id}-upset`,
        type: "alert",
        title: "Upset Alert",
        message: `${match.awayTeam} (+12.5) leading at halftime`,
        time: timeAgo,
        match: matchString,
        matchId: match.id,
      });
    } else if (index === 5) {
      // Total Deviation
      notifications.push({
        id: `notif-${match.id}-total-dev`,
        type: "alert",
        title: "Total Deviation",
        message: `${matchString} total at 125.5 (pregame: 140.5, -15)`,
        time: timeAgo,
        match: matchString,
        matchId: match.id,
      });
    } else if (index === 6) {
      // Underdog Becomes Favorite
      notifications.push({
        id: `notif-${match.id}-underdog-fav`,
        type: "opportunity",
        title: "Underdog Becomes Favorite",
        message: `${match.awayTeam} ML moved from +500 to -100`,
        time: timeAgo,
        match: matchString,
        matchId: match.id,
      });
    } else if (index === 7) {
      // Ejection
      notifications.push({
        id: `notif-${match.id}-ejection`,
        type: "warning",
        title: "Player Ejected",
        message: `${matchString} - Player disqualified`,
        time: timeAgo,
        match: matchString,
        matchId: match.id,
      });
    }
  });
  
  // Add a few more alert types if we have more matches
  if (sampleMatches.length > 0) {
    const match = sampleMatches[0];
    const matchString = `${match.awayTeam} @ ${match.homeTeam}`;
    
    // Overtime
    notifications.push({
      id: `notif-${match.id}-overtime`,
      type: "info",
      title: "Overtime",
      message: `${matchString} - Game tied, going to OT`,
      time: "6m ago",
      match: matchString,
      matchId: match.id,
    });
    
    // Delay - Weather
    if (sampleMatches.length > 1) {
      const delayMatch = sampleMatches[1];
      const delayMatchString = `${delayMatch.awayTeam} @ ${delayMatch.homeTeam}`;
      notifications.push({
        id: `notif-${delayMatch.id}-delay`,
        type: "warning",
        title: "Weather Delay",
        message: `${delayMatchString} - Game delayed due to weather`,
        time: "7m ago",
        match: delayMatchString,
        matchId: delayMatch.id,
      });
    }
    
    // Injury
    if (sampleMatches.length > 2) {
      const injuryMatch = sampleMatches[2];
      const injuryMatchString = `${injuryMatch.awayTeam} @ ${injuryMatch.homeTeam}`;
      notifications.push({
        id: `notif-${injuryMatch.id}-injury`,
        type: "warning",
        title: "Starter Injury",
        message: `${injuryMatchString} - Starting QB out for game`,
        time: "8m ago",
        match: injuryMatchString,
        matchId: injuryMatch.id,
      });
    }
    
    // Closing Line Movement - Total
    if (sampleMatches.length > 3) {
      const totalMatch = sampleMatches[3];
      const totalMatchString = `${totalMatch.awayTeam} @ ${totalMatch.homeTeam}`;
      notifications.push({
        id: `notif-${totalMatch.id}-total-move`,
        type: "alert",
        title: "Closing Line Movement",
        message: `${totalMatchString} total moved from 58.5 to 61.0`,
        time: "9m ago",
        match: totalMatchString,
        matchId: totalMatch.id,
      });
    }
  }
  
  return notifications;
};

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

export function NotificationsPanel({ onMatchSelect, onNavigateToOdds }: NotificationsPanelProps) {
  const [filter, setFilter] = useState<"all" | "opportunity" | "alert" | "warning">("all");
  
  // Create notifications from available matches
  const mockNotifications = createNotificationsFromMatches(allMatches);

  const filteredNotifications = filter === "all" 
    ? mockNotifications 
    : mockNotifications.filter(n => n.type === filter);

  const handleNotificationClick = (notification: Notification) => {
    if (notification.matchId && onMatchSelect && allMatches) {
      // Find the match by ID
      const match = allMatches.find((m: Match) => m.id === notification.matchId);
      if (match) {
        onMatchSelect(match);
        // Navigate to odds view if not already there
        if (onNavigateToOdds) {
          onNavigateToOdds();
        }
      }
    }
  };

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
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  "p-2.5 rounded border cursor-pointer transition-all duration-150",
                  "hover:bg-accent/50 hover:scale-[1.02]",
                  notification.matchId && "hover:ring-2 hover:ring-primary/50",
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
