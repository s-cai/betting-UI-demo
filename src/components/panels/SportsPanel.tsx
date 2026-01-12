import { useState } from "react";
import { cn } from "@/lib/utils";

type SportCategory = "football" | "basketball";
type League = "NFL" | "NCAAF" | "NBA" | "NCAAB";

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  status: string;
  inning?: string;
  timeout?: boolean;
  score?: { home: number; away: number };
  spread: { home: string; away: string; best?: "home" | "away" };
  moneyline: { home: string; away: string; best?: "home" | "away" };
  total: { over: string; under: string; line: string; best?: "over" | "under" };
  league: League;
}

const mockNFLMatches: Match[] = [
  {
    id: "nfl1",
    homeTeam: "KC Chiefs",
    awayTeam: "Buffalo Bills",
    status: "LIVE",
    inning: "Q2 8:42",
    timeout: true,
    score: { home: 14, away: 10 },
    spread: { home: "-3.5", away: "+3.5", best: "away" },
    moneyline: { home: "-175", away: "+155" },
    total: { over: "O 47.5", under: "U 47.5", line: "47.5" },
    league: "NFL",
  },
  {
    id: "nfl2",
    homeTeam: "SF 49ers",
    awayTeam: "Detroit Lions",
    status: "PRE",
    spread: { home: "-2.5", away: "+2.5" },
    moneyline: { home: "-135", away: "+115", best: "away" },
    total: { over: "O 51.5", under: "U 51.5", line: "51.5", best: "over" },
    league: "NFL",
  },
  {
    id: "nfl3",
    homeTeam: "Dallas Cowboys",
    awayTeam: "Philadelphia Eagles",
    status: "PRE",
    spread: { home: "+1.5", away: "-1.5", best: "home" },
    moneyline: { home: "+110", away: "-130" },
    total: { over: "O 48.5", under: "U 48.5", line: "48.5" },
    league: "NFL",
  },
];

const mockNCAAFMatches: Match[] = [
  {
    id: "ncaaf1",
    homeTeam: "Alabama Crimson Tide",
    awayTeam: "Georgia Bulldogs",
    status: "LIVE",
    inning: "Q3 12:00",
    score: { home: 21, away: 17 },
    spread: { home: "-3.5", away: "+3.5", best: "away" },
    moneyline: { home: "-150", away: "+130" },
    total: { over: "O 52.5", under: "U 52.5", line: "52.5" },
    league: "NCAAF",
  },
  {
    id: "ncaaf2",
    homeTeam: "Ohio State Buckeyes",
    awayTeam: "Michigan Wolverines",
    status: "PRE",
    spread: { home: "-4.5", away: "+4.5", best: "away" },
    moneyline: { home: "-180", away: "+155" },
    total: { over: "O 55.5", under: "U 55.5", line: "55.5", best: "over" },
    league: "NCAAF",
  },
];

const mockNBAMatches: Match[] = [
  {
    id: "nba1",
    homeTeam: "LA Lakers",
    awayTeam: "Boston Celtics",
    status: "LIVE",
    inning: "Q3 4:22",
    timeout: true,
    score: { home: 78, away: 82 },
    spread: { home: "+2.5", away: "-2.5", best: "home" },
    moneyline: { home: "+125", away: "-145", best: "home" },
    total: { over: "O 224.5", under: "U 224.5", line: "224.5" },
    league: "NBA",
  },
  {
    id: "nba2",
    homeTeam: "GS Warriors",
    awayTeam: "Phoenix Suns",
    status: "LIVE",
    inning: "Q2 2:15",
    score: { home: 52, away: 48 },
    spread: { home: "-4.5", away: "+4.5", best: "home" },
    moneyline: { home: "-185", away: "+160" },
    total: { over: "O 232.5", under: "U 232.5", line: "232.5", best: "over" },
    league: "NBA",
  },
  {
    id: "nba3",
    homeTeam: "Miami Heat",
    awayTeam: "Milwaukee Bucks",
    status: "PRE",
    spread: { home: "+1.5", away: "-1.5" },
    moneyline: { home: "+105", away: "-125", best: "home" },
    total: { over: "O 218.5", under: "U 218.5", line: "218.5" },
    league: "NBA",
  },
];

const mockNCAABMatches: Match[] = [
  {
    id: "ncaab1",
    homeTeam: "Duke Blue Devils",
    awayTeam: "North Carolina Tar Heels",
    status: "LIVE",
    inning: "2H 12:30",
    score: { home: 45, away: 52 },
    spread: { home: "+3.5", away: "-3.5", best: "home" },
    moneyline: { home: "+140", away: "-165" },
    total: { over: "O 145.5", under: "U 145.5", line: "145.5" },
    league: "NCAAB",
  },
  {
    id: "ncaab2",
    homeTeam: "Kentucky Wildcats",
    awayTeam: "Kansas Jayhawks",
    status: "PRE",
    spread: { home: "-2.5", away: "+2.5", best: "away" },
    moneyline: { home: "-135", away: "+115" },
    total: { over: "O 152.5", under: "U 152.5", line: "152.5", best: "over" },
    league: "NCAAB",
  },
];

interface SportsPanelProps {
  onMatchSelect: (match: Match) => void;
  selectedMatchId?: string;
}

// League logo URLs - only NFL and NBA have logos, others use emojis
// Using reliable CDN sources
const leagueLogos: Record<"NFL" | "NBA", string> = {
  NFL: "https://cdn.freebiesupply.com/logos/large/2x/nfl-1-logo-png-transparent.png",
  NBA: "https://cdn.freebiesupply.com/logos/large/2x/nba-2-logo-png-transparent.png",
};

const LeagueLogo = ({ league, className = "w-4 h-4" }: { league: League; className?: string }) => {
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

export const allMatches: Match[] = [
  ...mockNFLMatches,
  ...mockNCAAFMatches,
  ...mockNBAMatches,
  ...mockNCAABMatches,
];

export function SportsPanel({ onMatchSelect, selectedMatchId }: SportsPanelProps) {
  const [activeCategory, setActiveCategory] = useState<SportCategory>("football");
  const [activeLeague, setActiveLeague] = useState<League | null>(null);
  const [statusFilter, setStatusFilter] = useState<"LIVE" | "PRE" | null>(null);
  
  const getMatchesForLeague = (league: League): Match[] => {
    return allMatches.filter(m => m.league === league);
  };

  // Filter by category first
  const categoryMatches = allMatches.filter(m => {
    if (activeCategory === "football") {
      return m.league === "NFL" || m.league === "NCAAF";
    } else {
      return m.league === "NBA" || m.league === "NCAAB";
    }
  });

  // Then filter by league if selected
  const leagueMatches = activeLeague 
    ? categoryMatches.filter(m => m.league === activeLeague)
    : categoryMatches;

  // Finally filter by status if selected
  const matches = statusFilter
    ? leagueMatches.filter(m => m.status === statusFilter)
    : leagueMatches;

  const getLeagueCounts = (league: League, status: "LIVE" | "PRE" | null): number => {
    const leagueMatches = getMatchesForLeague(league);
    if (status === null) {
      return leagueMatches.length;
    }
    return leagueMatches.filter(m => m.status === status).length;
  };

  const leagueCounts: Record<League, number> = {
    NFL: getLeagueCounts("NFL", statusFilter),
    NCAAF: getLeagueCounts("NCAAF", statusFilter),
    NBA: getLeagueCounts("NBA", statusFilter),
    NCAAB: getLeagueCounts("NCAAB", statusFilter),
  };

  const categoryLeagues: Record<SportCategory, League[]> = {
    football: ["NFL", "NCAAF"],
    basketball: ["NBA", "NCAAB"],
  };

  const handleCategoryChange = (category: SportCategory) => {
    setActiveCategory(category);
    // Reset league filter when changing category to show all leagues
    setActiveLeague(null);
  };

  return (
    <div className="w-[420px] flex flex-col bg-panel border-l border-panel-border shrink-0">
      {/* Sport Category Tabs */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-panel-border">
        <button
          onClick={() => handleCategoryChange("football")}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5",
            activeCategory === "football"
              ? "bg-accent text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          )}
        >
          🏈 Football
        </button>
        <button
          onClick={() => handleCategoryChange("basketball")}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5",
            activeCategory === "basketball"
              ? "bg-accent text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          )}
        >
          🏀 Basketball
        </button>
        <div className="ml-auto text-xs text-muted-foreground">
          Best odds for <span className="text-foreground font-medium">{activeLeague}</span>
        </div>
      </div>

      {/* League Subcategory Tabs */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-panel-border bg-panel-header/30">
        <button
          onClick={() => setActiveLeague(null)}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded transition-colors",
            activeLeague === null
              ? "bg-accent text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          )}
        >
          All
        </button>
        {categoryLeagues[activeCategory].map((league) => (
          <button
            key={league}
            onClick={() => setActiveLeague(league)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5",
              activeLeague === league
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            <LeagueLogo league={league} className="w-3.5 h-3.5" />
            {league}
            <span className="text-[10px] text-muted-foreground">
              ({leagueCounts[league]})
            </span>
          </button>
        ))}
      </div>

      {/* Live Now / Prematch Toggle */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-panel-border">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setStatusFilter(statusFilter === "LIVE" ? null : "LIVE")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors",
              statusFilter === "LIVE"
                ? "bg-signal-negative text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            {statusFilter === "LIVE" && (
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            )}
            Live Now
          </button>
          <button 
            onClick={() => setStatusFilter(statusFilter === "PRE" ? null : "PRE")}
            className={cn(
              "px-2.5 py-1 text-xs font-medium rounded transition-colors",
              statusFilter === "PRE"
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            Prematch
          </button>
        </div>
      </div>

      {/* League Header */}
      <div className="px-3 py-2 bg-panel-header border-b border-panel-border">
        <span className="text-xs font-medium flex items-center gap-1.5">
          {activeLeague ? (
            <>
              <LeagueLogo league={activeLeague} className="w-4 h-4" />
              {activeLeague}
            </>
          ) : (
            <>
              {activeCategory === "football" ? "🏈" : "🏀"} All {activeCategory === "football" ? "Football" : "Basketball"}
            </>
          )}
        </span>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-12 gap-1 px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b border-panel-border bg-panel-header/50">
        <div className="col-span-5">Game</div>
        <div className="col-span-2 text-center">Spread</div>
        <div className="col-span-2 text-center">Moneyline</div>
        <div className="col-span-3 text-center">Total</div>
      </div>

      {/* Match List */}
      <div className="flex-1 overflow-y-auto terminal-scrollbar">
        {matches.map((match) => {
          return (
            <div
              key={match.id}
              onClick={() => onMatchSelect(match)}
              className={cn(
                "mb-2 mx-2 rounded border border-border/30 cursor-pointer transition-colors",
                "hover:bg-accent/50 hover:border-accent",
                selectedMatchId === match.id && "bg-accent border-accent"
              )}
            >
              {/* Game Status Header */}
              <div className="flex items-center justify-between px-3 py-1.5 bg-background/70 rounded-t border-b border-border/20">
                <div className="flex items-center gap-2">
                  {match.status === "LIVE" ? (
                    match.timeout ? (
                      <span className="text-xs">⏰</span>
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-signal-negative animate-pulse" />
                    )
                  ) : (
                    <span className="text-xs">⏳</span>
                  )}
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {match.status === "LIVE" 
                      ? match.timeout 
                        ? `Timeout - ${match.inning || "LIVE"}`
                        : match.inning || "LIVE"
                      : match.status}
                  </span>
                </div>
                {match.score && (
                  <span className="text-sm font-mono font-semibold text-foreground">
                    {match.score.away} - {match.score.home}
                  </span>
                )}
              </div>

              {/* Game Content - Both Teams */}
              <div className="px-3 py-2">
                <div className="grid grid-cols-12 gap-1">
                  {/* Away Team */}
                  <div className="col-span-5 flex items-center gap-2">
                    <span className="text-xs font-medium truncate">{match.awayTeam}</span>
                  </div>
                  <div className="col-span-2 flex items-center justify-center">
                    <div className={cn(
                      "odds-cell text-center text-[11px] w-full",
                      match.spread.best === "away" && "odds-cell-best"
                    )}>
                      {match.spread.away}
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center justify-center">
                    <div className={cn(
                      "odds-cell text-center text-[11px] w-full",
                      match.moneyline.best === "away" && "odds-cell-best"
                    )}>
                      {match.moneyline.away}
                    </div>
                  </div>
                  <div className="col-span-3 flex items-center justify-center">
                    <div className={cn(
                      "odds-cell text-center text-[11px] w-full",
                      match.total.best === "over" && "odds-cell-best"
                    )}>
                      {match.total.over}
                    </div>
                  </div>

                  {/* Home Team */}
                  <div className="col-span-5 flex items-center gap-2">
                    <span className="text-xs font-medium truncate">{match.homeTeam}</span>
                  </div>
                  <div className="col-span-2 flex items-center justify-center">
                    <div className={cn(
                      "odds-cell text-center text-[11px] w-full",
                      match.spread.best === "home" && "odds-cell-best"
                    )}>
                      {match.spread.home}
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center justify-center">
                    <div className={cn(
                      "odds-cell text-center text-[11px] w-full",
                      match.moneyline.best === "home" && "odds-cell-best"
                    )}>
                      {match.moneyline.home}
                    </div>
                  </div>
                  <div className="col-span-3 flex items-center justify-center">
                    <div className={cn(
                      "odds-cell text-center text-[11px] w-full",
                      match.total.best === "under" && "odds-cell-best"
                    )}>
                      {match.total.under}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
