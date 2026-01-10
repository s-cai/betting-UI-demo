import { useState } from "react";
import { cn } from "@/lib/utils";

type Sport = "baseball" | "football" | "basketball";

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  status: string;
  inning?: string;
  score?: { home: number; away: number };
  spread: { home: string; away: string; best?: "home" | "away" };
  moneyline: { home: string; away: string; best?: "home" | "away" };
  total: { over: string; under: string; line: string; best?: "over" | "under" };
}

const mockBaseballMatches: Match[] = [
  {
    id: "bb1",
    homeTeam: "St. Louis Cardinals",
    awayTeam: "Atlanta Braves",
    status: "LIVE",
    inning: "2nd inning",
    score: { home: 1, away: 3 },
    spread: { home: "+1.5", away: "-1.5", best: "away" },
    moneyline: { home: "+138", away: "-120" },
    total: { over: "O 11.5", under: "U 11.5", line: "11.5", best: "over" },
  },
  {
    id: "bb2",
    homeTeam: "Cincinnati Reds",
    awayTeam: "Philadelphia Phillies",
    status: "LIVE",
    inning: "2nd inning",
    score: { home: 2, away: 0 },
    spread: { home: "+1.5", away: "-1.5" },
    moneyline: { home: "-170", away: "+104", best: "away" },
    total: { over: "O 12.5", under: "U 12.5", line: "12.5" },
  },
  {
    id: "bb3",
    homeTeam: "Tampa Bay Rays",
    awayTeam: "Boston Red Sox",
    status: "LIVE",
    inning: "2nd inning",
    score: { home: 2, away: 1 },
    spread: { home: "-1.5", away: "+1.5" },
    moneyline: { home: "-129", away: "-220", best: "home" },
    total: { over: "O 10.5", under: "U 10.5", line: "10.5" },
  },
  {
    id: "bb4",
    homeTeam: "Washington Nationals",
    awayTeam: "Pittsburgh Pirates",
    status: "LIVE",
    inning: "1st inning",
    score: { home: 1, away: 0 },
    spread: { home: "+2", away: "-2" },
    moneyline: { home: "-114", away: "+191", best: "away" },
    total: { over: "O 11", under: "U 11", line: "11" },
  },
  {
    id: "bb5",
    homeTeam: "Miami Marlins",
    awayTeam: "New York Mets",
    status: "PRE",
    spread: { home: "+1.5", away: "-1.5" },
    moneyline: { home: "-141", away: "+160", best: "away" },
    total: { over: "O 0.5", under: "U 0.5", line: "0.5" },
  },
  {
    id: "bb6",
    homeTeam: "Seattle Mariners",
    awayTeam: "Cleveland Guardians",
    status: "PRE",
    spread: { home: "-1.5", away: "+1.5" },
    moneyline: { home: "-121", away: "-204", best: "home" },
    total: { over: "O 8.5", under: "U 8.5", line: "8.5" },
  },
];

const mockFootballMatches: Match[] = [
  {
    id: "fb1",
    homeTeam: "KC Chiefs",
    awayTeam: "Buffalo Bills",
    status: "LIVE",
    inning: "Q2 8:42",
    score: { home: 14, away: 10 },
    spread: { home: "-3.5", away: "+3.5", best: "away" },
    moneyline: { home: "-175", away: "+155" },
    total: { over: "O 47.5", under: "U 47.5", line: "47.5" },
  },
  {
    id: "fb2",
    homeTeam: "SF 49ers",
    awayTeam: "Detroit Lions",
    status: "PRE",
    spread: { home: "-2.5", away: "+2.5" },
    moneyline: { home: "-135", away: "+115", best: "away" },
    total: { over: "O 51.5", under: "U 51.5", line: "51.5", best: "over" },
  },
];

const mockBasketballMatches: Match[] = [
  {
    id: "bk1",
    homeTeam: "LA Lakers",
    awayTeam: "Boston Celtics",
    status: "LIVE",
    inning: "Q3 4:22",
    score: { home: 78, away: 82 },
    spread: { home: "+2.5", away: "-2.5", best: "home" },
    moneyline: { home: "+125", away: "-145", best: "home" },
    total: { over: "O 224.5", under: "U 224.5", line: "224.5" },
  },
  {
    id: "bk2",
    homeTeam: "GS Warriors",
    awayTeam: "Phoenix Suns",
    status: "LIVE",
    inning: "Q2 2:15",
    score: { home: 52, away: 48 },
    spread: { home: "-4.5", away: "+4.5", best: "home" },
    moneyline: { home: "-185", away: "+160" },
    total: { over: "O 232.5", under: "U 232.5", line: "232.5", best: "over" },
  },
];

interface SportsPanelProps {
  onMatchSelect: (match: Match) => void;
  selectedMatchId?: string;
}

export function SportsPanel({ onMatchSelect, selectedMatchId }: SportsPanelProps) {
  const [activeSport, setActiveSport] = useState<Sport>("baseball");
  
  const matches = activeSport === "baseball" 
    ? mockBaseballMatches 
    : activeSport === "football" 
    ? mockFootballMatches 
    : mockBasketballMatches;

  const sportCounts = {
    baseball: mockBaseballMatches.length,
    football: mockFootballMatches.length,
    basketball: mockBasketballMatches.length,
  };

  const getSportLabel = (sport: Sport) => {
    switch (sport) {
      case "baseball": return "MLB";
      case "football": return "NFL";
      case "basketball": return "NBA";
    }
  };

  return (
    <div className="w-[420px] flex flex-col bg-panel border-l border-panel-border shrink-0">
      {/* Live Now / Prematch Toggle */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-panel-border">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-signal-negative text-white rounded">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            Live Now
          </button>
          <button className="px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground">
            Prematch
          </button>
        </div>
      </div>

      {/* Sport Tabs */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-panel-border">
        {(["baseball", "football", "basketball"] as Sport[]).map((sport) => (
          <button
            key={sport}
            onClick={() => setActiveSport(sport)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded transition-colors",
              activeSport === sport
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            {sport === "baseball" && "Baseball"}
            {sport === "football" && "Football"}
            {sport === "basketball" && "Tennis"}
            <span className="ml-1.5 text-[10px] text-muted-foreground">
              ({sportCounts[sport]})
            </span>
          </button>
        ))}
        <div className="ml-auto text-xs text-muted-foreground">
          Best odds for <span className="text-foreground font-medium">{activeSport === "baseball" ? "Baseball" : activeSport === "football" ? "Football" : "Basketball"}</span>
        </div>
      </div>

      {/* League Header */}
      <div className="px-3 py-2 bg-panel-header border-b border-panel-border">
        <span className="text-xs font-medium">{getSportLabel(activeSport)}</span>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-12 gap-1 px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b border-panel-border bg-panel-header/50">
        <div className="col-span-5">Team</div>
        <div className="col-span-2 text-center">Spread</div>
        <div className="col-span-2 text-center">Moneyline</div>
        <div className="col-span-3 text-center">Total</div>
      </div>

      {/* Match List */}
      <div className="flex-1 overflow-y-auto terminal-scrollbar">
        {matches.map((match, idx) => {
          const prevMatch = matches[idx - 1];
          const showInning = !prevMatch || prevMatch.inning !== match.inning;
          
          return (
            <div key={match.id}>
              {/* Inning/Quarter Header */}
              {match.inning && showInning && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-background/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-signal-negative animate-pulse" />
                  <span className="text-[10px] text-muted-foreground">{match.inning}</span>
                </div>
              )}
              
              <div
                onClick={() => onMatchSelect(match)}
                className={cn(
                  "grid grid-cols-12 gap-1 px-3 py-2 border-b border-border/30 cursor-pointer transition-colors",
                  "hover:bg-accent/50",
                  selectedMatchId === match.id && "bg-accent"
                )}
              >
                {/* Team Info */}
                <div className="col-span-5 flex items-center gap-2">
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium truncate">{match.homeTeam}</span>
                      {match.score && (
                        <span className="text-xs font-mono text-muted-foreground">{match.score.home}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Spread */}
                <div className="col-span-2 flex items-center justify-center">
                  <div className={cn(
                    "odds-cell text-center text-[11px] w-full",
                    match.spread.best === "home" && "odds-cell-best"
                  )}>
                    {match.spread.home}
                  </div>
                </div>

                {/* Moneyline */}
                <div className="col-span-2 flex items-center justify-center">
                  <div className={cn(
                    "odds-cell text-center text-[11px] w-full",
                    match.moneyline.best === "home" && "odds-cell-best"
                  )}>
                    {match.moneyline.home}
                  </div>
                </div>

                {/* Total */}
                <div className="col-span-3 flex items-center justify-center">
                  <div className={cn(
                    "odds-cell text-center text-[11px] w-full",
                    match.total.best === "over" && "odds-cell-best"
                  )}>
                    {match.total.over}
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
