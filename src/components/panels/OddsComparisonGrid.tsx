import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import type { Match } from "./SportsPanel";
import { BettingDialog } from "./BettingDialog";

interface OddsComparisonGridProps {
  match: Match | null;
}

interface BookOdds {
  book: string;
  logo: string; // Logo path or text fallback
  logoPath?: string; // Path to logo image
  hasOpen?: boolean;
  spread: { away: string; home: string; best?: boolean };
  moneyline: { away: string; home: string; best?: boolean };
  total: { over: string; under: string; best?: boolean };
}

// Map book names to logo paths
// Use base URL for GitHub Pages compatibility
const getLogoPath = (logoName: string) => `${import.meta.env.BASE_URL}resources/${logoName}`;
const bookLogoMap: Record<string, string> = {
  "DraftKings": getLogoPath("draftkings-logo.svg"),
  "FanDuel": getLogoPath("fanduel-logo.svg"),
  "BetMGM": getLogoPath("betmgm-logo.svg"),
  "Caesars": getLogoPath("caesars-logo.svg"),
  "PointsBet": getLogoPath("pointsbet-logo.svg"),
  "Bet365": getLogoPath("bet365-logo.svg"),
  "Unibet": getLogoPath("unibet-logo.svg"),
  "WynnBET": getLogoPath("wynnbet-logo.svg"),
};

const mockBookOdds: BookOdds[] = [
  { book: "DraftKings", logo: "DK", logoPath: bookLogoMap["DraftKings"], hasOpen: true, spread: { away: "+1.5 (-195)", home: "-1.5 (+160)" }, moneyline: { away: "+123", home: "-140", best: true }, total: { over: "-103", under: "+100" } },
  { book: "FanDuel", logo: "FD", logoPath: bookLogoMap["FanDuel"], spread: { away: "+1 (-129)", home: "-1 (+105)" }, moneyline: { away: "+102", home: "-119" }, total: { over: "-108", under: "-112" } },
  { book: "BetMGM", logo: "M", logoPath: bookLogoMap["BetMGM"], spread: { away: "+1 (-125)", home: "-1 (+100)", best: true }, moneyline: { away: "+100", home: "-120" }, total: { over: "-105", under: "-115", best: true } },
  { book: "Caesars", logo: "C", logoPath: bookLogoMap["Caesars"], spread: { away: "+1.5 (-180)", home: "-1.5 (+150)" }, moneyline: { away: "+100", home: "-125" }, total: { over: "-110", under: "-110" } },
  { book: "PointsBet", logo: "PB", logoPath: bookLogoMap["PointsBet"], spread: { away: "+1.5 (-175)", home: "-1.5 (+145)" }, moneyline: { away: "+100", home: "-120" }, total: { over: "-112", under: "-108" } },
  { book: "Bet365", logo: "365", logoPath: bookLogoMap["Bet365"], spread: { away: "+1.5 (-210)", home: "-1.5 (+160)" }, moneyline: { away: "+110", home: "-126" }, total: { over: "-110", under: "-110" } },
  { book: "Unibet", logo: "UB", logoPath: bookLogoMap["Unibet"], spread: { away: "-1.5 (+150)", home: "+1.5 (-170)" }, moneyline: { away: "+109", home: "-125" }, total: { over: "-102", under: "-105" } },
  { book: "WynnBET", logo: "WB", logoPath: bookLogoMap["WynnBET"], spread: { away: "+1.5 (-155)", home: "-1.5 (+130)" }, moneyline: { away: "+100", home: "-130" }, total: { over: "-112", under: "-108" } },
];

// Only Main Lines tab is shown - other tabs removed per issue #22

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
  
  // Ref for scroll container
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Restore scroll position on mount or when match changes
  useEffect(() => {
    const savedScroll = localStorage.getItem(`betting-ui-odds-scroll-${match?.id || 'none'}`);
    if (savedScroll && scrollContainerRef.current) {
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        if (scrollContainerRef.current) {
          const scrollPosition = parseInt(savedScroll, 10);
          scrollContainerRef.current.scrollTop = scrollPosition;
        }
      }, 0);
    }
  }, [match?.id]);
  
  // Save scroll position on scroll
  const handleScroll = () => {
    if (scrollContainerRef.current && match) {
      localStorage.setItem(`betting-ui-odds-scroll-${match.id}`, scrollContainerRef.current.scrollTop.toString());
    }
  };

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


      {/* Odds Grid */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-auto terminal-scrollbar"
      >
        <table className="data-table w-full" style={{ tableLayout: 'fixed' }}>
          <thead className="sticky top-0 z-10">
            {/* Column Headers */}
            <tr className="bg-panel-header">
              <th className="text-left" style={{ width: '14%' }}>Team</th>
              <th className="text-center" style={{ width: '9%' }}>Close Odds</th>
              <th className="text-center" style={{ width: '9%' }}>Best Odds</th>
              {mockBookOdds.map((odds) => (
                <th key={odds.book} className="text-center px-1" style={{ width: '8.5%' }}>
                  <div className="flex items-center justify-center gap-0.5">
                    {odds.logoPath ? (
                      <img 
                        src={odds.logoPath} 
                        alt={`${odds.book} Logo`} 
                        className="h-7 w-auto object-contain max-w-[60px]"
                        style={{ imageRendering: 'auto' }}
                        loading="lazy"
                        onError={(e) => {
                          // Fallback to text if image fails to load
                          const target = e.target as HTMLImageElement;
                          const parent = target.parentElement;
                          if (parent && !parent.querySelector('.logo-fallback')) {
                            target.style.display = 'none';
                            const fallback = document.createElement('span');
                            fallback.className = 'logo-fallback w-6 h-6 bg-muted rounded text-xs font-bold flex items-center justify-center';
                            fallback.textContent = odds.logo;
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    ) : (
                      <span className="w-6 h-6 bg-muted rounded text-xs font-bold flex items-center justify-center">
                        {odds.logo}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Moneyline Section */}
            <tr className="bg-[hsl(var(--panel-header))] border-t border-b border-[hsl(var(--border))]">
              <td colSpan={9} className="text-sm font-semibold uppercase tracking-wide py-2.5 px-4 text-foreground">
                Moneyline
              </td>
            </tr>

            {/* Away Team Row */}
            <tr className="hover:bg-accent/30 border-b border-border/30">
              <td className="text-xs font-medium pl-6">
                {match.awayTeam}
              </td>
              <td className="text-center">
                <span className="text-xs font-mono text-muted-foreground">+102</span>
              </td>
              <td className="text-center">
                <button className="odds-cell odds-cell-best font-mono text-sm px-3">
                  +123
                </button>
              </td>
              {mockBookOdds.map((odds) => (
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
              <td className="text-xs font-medium pl-6">
                {match.homeTeam}
              </td>
              <td className="text-center">
                <span className="text-xs font-mono text-muted-foreground">-126</span>
              </td>
              <td className="text-center">
                <button className="odds-cell font-mono text-sm px-3">
                  -119
                </button>
              </td>
              {mockBookOdds.map((odds) => (
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
            <tr className="bg-[hsl(var(--panel-header))] border-t border-b border-[hsl(var(--border))]">
              <td colSpan={9} className="text-sm font-semibold uppercase tracking-wide py-2.5 px-4 text-foreground">
                <div className="flex items-center gap-2">
                  Spread
                  <span className="text-[10px] font-normal normal-case text-muted-foreground cursor-pointer hover:text-foreground">Alts ▾</span>
                </div>
              </td>
            </tr>

            {/* Away Spread Row */}
            <tr className="hover:bg-accent/30 border-b border-border/30">
              <td className="text-xs font-medium pl-6">
                {match.awayTeam}
              </td>
              <td className="text-center">
                <span className="text-xs font-mono text-muted-foreground">+1.5 (-195)</span>
              </td>
              <td className="text-center">
                <button className="odds-cell odds-cell-best font-mono text-xs px-2">
                  +1 (-125)
                </button>
              </td>
              {mockBookOdds.map((odds) => (
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
              <td className="text-xs font-medium pl-6">
                {match.homeTeam}
              </td>
              <td className="text-center">
                <span className="text-xs font-mono text-muted-foreground">-1.5 (+150)</span>
              </td>
              <td className="text-center">
                <button className="odds-cell font-mono text-xs px-2">
                  -1 (+129)
                </button>
              </td>
              {mockBookOdds.map((odds) => (
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
            <tr className="bg-[hsl(var(--panel-header))] border-t border-b border-[hsl(var(--border))]">
              <td colSpan={9} className="text-sm font-semibold uppercase tracking-wide py-2.5 px-4 text-foreground">
                Total
              </td>
            </tr>

            {/* Over Row */}
            <tr className="hover:bg-accent/30 border-b border-border/30">
              <td className="text-xs font-medium pl-6">Over {match.total.line}</td>
              <td className="text-center">
                <span className="text-xs font-mono text-muted-foreground">-107</span>
              </td>
              <td className="text-center">
                <button className="odds-cell odds-cell-best font-mono text-xs px-2">
                  -102
                </button>
              </td>
              {mockBookOdds.map((odds) => (
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
              <td className="text-xs font-medium pl-6">Under {match.total.line}</td>
              <td className="text-center">
                <span className="text-xs font-mono text-muted-foreground">-109</span>
              </td>
              <td className="text-center">
                <button className="odds-cell font-mono text-xs px-2">
                  -105
                </button>
              </td>
              {mockBookOdds.map((odds) => (
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
