import { useState } from "react";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import type { Match } from "./SportsPanel";
import { BettingDialog } from "./BettingDialog";

interface OddsComparisonGridProps {
  match: Match | null;
}

interface BookOdds {
  book: string;
  logo: string;
  hasOpen?: boolean;
  spread: { away: string; home: string; best?: boolean };
  moneyline: { away: string; home: string; best?: boolean };
  total: { over: string; under: string; best?: boolean };
}

const mockBookOdds: BookOdds[] = [
  { book: "DraftKings", logo: "DK", hasOpen: true, spread: { away: "+1.5 (-195)", home: "-1.5 (+160)" }, moneyline: { away: "+123", home: "-140", best: true }, total: { over: "-103", under: "+100" } },
  { book: "Pinnacle", logo: "P", spread: { away: "-1.5 (+150)", home: "+1.5 (-170)" }, moneyline: { away: "+109", home: "-125" }, total: { over: "-102", under: "-105" } },
  { book: "FanDuel", logo: "FD", spread: { away: "+1 (-129)", home: "-1 (+105)" }, moneyline: { away: "+102", home: "-119" }, total: { over: "-108", under: "-112" } },
  { book: "BetMGM", logo: "M", spread: { away: "+1 (-125)", home: "-1 (+100)", best: true }, moneyline: { away: "+100", home: "-120" }, total: { over: "-105", under: "-115", best: true } },
  { book: "Caesars", logo: "C", spread: { away: "+1.5 (-180)", home: "-1.5 (+150)" }, moneyline: { away: "+100", home: "-125" }, total: { over: "-110", under: "-110" } },
  { book: "PointsBet", logo: "PB", spread: { away: "+1.5 (-175)", home: "-1.5 (+145)" }, moneyline: { away: "+100", home: "-120" }, total: { over: "-112", under: "-108" } },
  { book: "Bet365", logo: "365", spread: { away: "+1.5 (-210)", home: "-1.5 (+160)" }, moneyline: { away: "+110", home: "-126" }, total: { over: "-110", under: "-110" } },
  { book: "Betway", logo: "BW", spread: { away: "+1.5 (-155)", home: "-1.5 (+130)" }, moneyline: { away: "+100", home: "-130" }, total: { over: "-112", under: "-108" } },
];

const marketTabs = ["Main Lines", "Team Markets", "First X Innings", "Innings", "Batter Props", "Pitcher Props"];

// Get team logo emoji based on league (same as SportsPanel)
const getTeamLogoEmoji = (league: string): string => {
  if (league === "NFL" || league === "NCAAF") {
    return "🏈";
  } else if (league === "NBA" || league === "NCAAB") {
    return "🏀";
  }
  return "📊"; // fallback
};

export function OddsComparisonGrid({ match }: OddsComparisonGridProps) {
  const [bettingDialog, setBettingDialog] = useState<{
    isOpen: boolean;
    platform: string;
    market: string;
    side: string;
    odds: string;
  }>({
    isOpen: false,
    platform: '',
    market: '',
    side: '',
    odds: ''
  });

  const handleOddsClick = (platform: string, market: string, side: string, odds: string) => {
    setBettingDialog({
      isOpen: true,
      platform,
      market,
      side,
      odds
    });
  };

  if (!match) {
    return (
      <div className="flex-1 flex items-center justify-center bg-panel">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Select a match to view detailed odds</p>
          <p className="text-xs mt-1">Click on any game from the right panel</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-panel overflow-hidden">
      {/* Match Header */}
      <div className="panel-header flex items-center gap-3 border-b border-panel-border">
        <span className="text-sm text-muted-foreground">All odds for</span>
        <span className="font-medium text-foreground">
          {match.awayTeam} vs {match.homeTeam}
        </span>
        {/* Game Status */}
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
          <span className="text-xs font-medium text-muted-foreground">
            {match.status === "LIVE" 
              ? match.timeout 
                ? `Timeout - ${match.inning || "LIVE"}`
                : match.inning || "LIVE"
              : match.status}
          </span>
          {match.score && (
            <span className="text-xs font-mono text-muted-foreground">
              {match.score.away} - {match.score.home}
            </span>
          )}
        </div>
        <Info className="w-3.5 h-3.5 text-muted-foreground" />
      </div>

      {/* Market Tabs */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-panel-border bg-panel-header overflow-x-auto">
        {marketTabs.map((tab, idx) => (
          <button
            key={tab}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap transition-colors",
              idx === 0
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Odds Grid */}
      <div className="flex-1 overflow-auto terminal-scrollbar">
        <table className="data-table w-full">
          <thead className="sticky top-0 z-10">
            {/* Market Headers */}
            <tr className="bg-panel-header">
              <th className="w-28 text-left">Moneyline</th>
              <th className="text-center">Best Odds</th>
              <th className="text-center">Avg Odds</th>
              {mockBookOdds.slice(0, 6).map((odds) => (
                <th key={odds.book} className="text-center w-16">
                  <div className="flex items-center justify-center gap-1">
                    <span className="w-5 h-5 bg-muted rounded text-[10px] font-bold flex items-center justify-center">
                      {odds.logo}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Away Team Row */}
            <tr className="hover:bg-accent/30 border-b border-border/30">
              <td className="text-xs font-medium">
                <div className="flex items-center gap-2">
                  {mockBookOdds[0].hasOpen && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-signal-positive-muted text-signal-positive rounded">Open</span>
                  )}
                  <div className="w-4 h-4 bg-muted rounded flex items-center justify-center shrink-0">
                    <span className="text-[8px] text-muted-foreground">{getTeamLogoEmoji(match.league)}</span>
                  </div>
                  {match.awayTeam}
                </div>
              </td>
              <td className="text-center">
                <button className="odds-cell odds-cell-best font-mono text-sm px-3">
                  +123
                </button>
              </td>
              <td className="text-center">
                <span className="text-xs font-mono text-muted-foreground">+102</span>
              </td>
              {mockBookOdds.slice(0, 6).map((odds) => (
                <td key={odds.book} className="text-center">
                  <button 
                    onClick={() => handleOddsClick(odds.book, 'Moneyline', 'away', odds.moneyline.away)}
                    className={cn(
                      "odds-cell font-mono text-xs",
                      odds.moneyline.best && "odds-cell-best"
                    )}
                  >
                    {odds.moneyline.away}
                  </button>
                </td>
              ))}
            </tr>
            
            {/* Home Team Row */}
            <tr className="hover:bg-accent/30 border-b border-border/30">
              <td className="text-xs font-medium">
                <div className="flex items-center gap-2">
                  {mockBookOdds[0].hasOpen && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-signal-positive-muted text-signal-positive rounded">Open</span>
                  )}
                  <div className="w-4 h-4 bg-muted rounded flex items-center justify-center shrink-0">
                    <span className="text-[8px] text-muted-foreground">{getTeamLogoEmoji(match.league)}</span>
                  </div>
                  {match.homeTeam}
                </div>
              </td>
              <td className="text-center">
                <button className="odds-cell font-mono text-sm px-3">
                  -119
                </button>
              </td>
              <td className="text-center">
                <span className="text-xs font-mono text-muted-foreground">-126</span>
              </td>
              {mockBookOdds.slice(0, 6).map((odds) => (
                <td key={odds.book} className="text-center">
                  <button 
                    onClick={() => handleOddsClick(odds.book, 'Moneyline', 'home', odds.moneyline.home)}
                    className="odds-cell font-mono text-xs"
                  >
                    {odds.moneyline.home}
                  </button>
                </td>
              ))}
            </tr>

            {/* Spread Section */}
            <tr className="bg-panel-header/50">
              <td colSpan={9} className="text-xs font-medium py-2">
                <div className="flex items-center gap-2">
                  Spread
                  <span className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground">Alts ▾</span>
                </div>
              </td>
            </tr>

            {/* Away Spread Row */}
            <tr className="hover:bg-accent/30 border-b border-border/30">
              <td className="text-xs font-medium">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 bg-signal-positive-muted text-signal-positive rounded">Open</span>
                  <div className="w-4 h-4 bg-muted rounded flex items-center justify-center shrink-0">
                    <span className="text-[8px] text-muted-foreground">{getTeamLogoEmoji(match.league)}</span>
                  </div>
                  {match.awayTeam}
                </div>
              </td>
              <td className="text-center">
                <button className="odds-cell odds-cell-best font-mono text-xs px-2">
                  +1 (-125)
                </button>
              </td>
              <td className="text-center">
                <span className="text-xs font-mono text-muted-foreground">+1.5 (-195)</span>
              </td>
              {mockBookOdds.slice(0, 6).map((odds) => (
                <td key={odds.book} className="text-center">
                  <button 
                    onClick={() => handleOddsClick(odds.book, 'Spread', 'away', odds.spread.away)}
                    className={cn(
                      "odds-cell font-mono text-[10px]",
                      odds.spread.best && "odds-cell-best"
                    )}
                  >
                    {odds.spread.away}
                  </button>
                </td>
              ))}
            </tr>

            {/* Home Spread Row */}
            <tr className="hover:bg-accent/30 border-b border-border/30">
              <td className="text-xs font-medium">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 bg-signal-positive-muted text-signal-positive rounded">Open</span>
                  <div className="w-4 h-4 bg-muted rounded flex items-center justify-center shrink-0">
                    <span className="text-[8px] text-muted-foreground">{getTeamLogoEmoji(match.league)}</span>
                  </div>
                  {match.homeTeam}
                </div>
              </td>
              <td className="text-center">
                <button className="odds-cell font-mono text-xs px-2">
                  -1 (+129)
                </button>
              </td>
              <td className="text-center">
                <span className="text-xs font-mono text-muted-foreground">-1.5 (+150)</span>
              </td>
              {mockBookOdds.slice(0, 6).map((odds) => (
                <td key={odds.book} className="text-center">
                  <button 
                    onClick={() => handleOddsClick(odds.book, 'Spread', 'home', odds.spread.home)}
                    className="odds-cell font-mono text-[10px]"
                  >
                    {odds.spread.home}
                  </button>
                </td>
              ))}
            </tr>

            {/* Total Section */}
            <tr className="bg-panel-header/50">
              <td colSpan={9} className="text-xs font-medium py-2">
                Total
              </td>
            </tr>

            {/* Over Row */}
            <tr className="hover:bg-accent/30 border-b border-border/30">
              <td className="text-xs font-medium">Over {match.total.line}</td>
              <td className="text-center">
                <button className="odds-cell odds-cell-best font-mono text-xs px-2">
                  -102
                </button>
              </td>
              <td className="text-center">
                <span className="text-xs font-mono text-muted-foreground">-107</span>
              </td>
              {mockBookOdds.slice(0, 6).map((odds) => (
                <td key={odds.book} className="text-center">
                  <button 
                    onClick={() => handleOddsClick(odds.book, 'Total', 'over', odds.total.over)}
                    className={cn(
                      "odds-cell font-mono text-xs",
                      odds.total.best && "odds-cell-best"
                    )}
                  >
                    {odds.total.over}
                  </button>
                </td>
              ))}
            </tr>

            {/* Under Row */}
            <tr className="hover:bg-accent/30">
              <td className="text-xs font-medium">Under {match.total.line}</td>
              <td className="text-center">
                <button className="odds-cell font-mono text-xs px-2">
                  -105
                </button>
              </td>
              <td className="text-center">
                <span className="text-xs font-mono text-muted-foreground">-109</span>
              </td>
              {mockBookOdds.slice(0, 6).map((odds) => (
                <td key={odds.book} className="text-center">
                  <button 
                    onClick={() => handleOddsClick(odds.book, 'Total', 'under', odds.total.under)}
                    className="odds-cell font-mono text-xs"
                  >
                    {odds.total.under}
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Betting Dialog */}
      <BettingDialog
        isOpen={bettingDialog.isOpen}
        onClose={() => setBettingDialog({ ...bettingDialog, isOpen: false })}
        match={match}
        platform={bettingDialog.platform}
        market={bettingDialog.market}
        side={bettingDialog.side}
        odds={bettingDialog.odds}
      />
    </div>
  );
}
