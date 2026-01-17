import { User, Moon, Sun, Bell, Info, ChevronDown, ChevronRight } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type League = "NCAAF" | "NFL" | "NBA" | "NCAAB";

interface NCAAFAlertConfig {
  // Game conditions
  timeout: { enabled: boolean; types: { media: boolean; coachChallenge: boolean } };
  review: { enabled: boolean; types: { flagrantFoul: boolean; technicalFoul: boolean; other: boolean } };
  overtime: { enabled: boolean };
  intermission: { enabled: boolean; types: { halftime: boolean; endOfQuarter: boolean } };
  delay: { enabled: boolean; types: { weather: boolean; hazardous: boolean } };
  injury: { enabled: boolean; starterOnly: boolean };
  ejection: { enabled: boolean };
  
  // Betting conditions
  closingLineMovement: { enabled: boolean; markets: { spread: boolean; total: boolean; moneyline: boolean } };
  upsetAlert: { 
    enabled: boolean; 
    pointThreshold: number; 
    checkpoints: { halftime: boolean; timeout16: boolean; timeout12: boolean; timeout8: boolean; timeout4: boolean } 
  };
  totalDeviation: { enabled: boolean; threshold: number };
  underdogBecomesFavorite: { enabled: boolean; minOddsChange: number };
}

const defaultNCAAFConfig: NCAAFAlertConfig = {
  timeout: { enabled: true, types: { media: true, coachChallenge: true } },
  review: { enabled: true, types: { flagrantFoul: true, technicalFoul: true, other: true } },
  overtime: { enabled: true },
  intermission: { enabled: true, types: { halftime: true, endOfQuarter: true } },
  delay: { enabled: true, types: { weather: true, hazardous: true } },
  injury: { enabled: true, starterOnly: false },
  ejection: { enabled: true },
  closingLineMovement: { enabled: true, markets: { spread: true, total: true, moneyline: true } },
  upsetAlert: { 
    enabled: true, 
    pointThreshold: 10, 
    checkpoints: { halftime: true, timeout16: true, timeout12: true, timeout8: true, timeout4: true } 
  },
  totalDeviation: { enabled: true, threshold: 15 },
  underdogBecomesFavorite: { enabled: true, minOddsChange: 400 },
};

export function Settings() {
  // Mock trader name - in real app this would come from user context/API
  const traderName = "John Trader";
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [ncaafConfig, setNcaafConfig] = useState<NCAAFAlertConfig>(defaultNCAAFConfig);
  const [expandedLeagues, setExpandedLeagues] = useState<Record<League, boolean>>({
    NCAAF: false,
    NFL: false,
    NBA: false,
    NCAAB: false,
  });

  // Load predefined totals from localStorage
  const loadPredefinedTotals = (): number[] => {
    try {
      const saved = localStorage.getItem('betting-ui-predefined-totals');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.every((n: unknown) => typeof n === 'number' && n > 0)) {
          return parsed;
        }
      }
    } catch {
      // Ignore errors
    }
    return [500, 1500, 4000, 10000]; // Default values
  };

  const [predefinedTotals, setPredefinedTotals] = useState<number[]>(loadPredefinedTotals);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLeague = (league: League) => {
    setExpandedLeagues(prev => ({
      ...prev,
      [league]: !prev[league]
    }));
  };

  return (
    <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto terminal-scrollbar p-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>

          {/* Settings Content */}
          <div className="space-y-6">
            {/* Trader Information Section */}
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Trader Information</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Trader Name
                  </label>
                  <div className="text-base text-foreground font-medium">
                    {traderName}
                  </div>
                </div>
              </div>
            </div>

            {/* Betting Preferences */}
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <Info className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Betting Preferences</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-3 block">
                    Predefined Total Amounts (for quick distribution)
                  </label>
                  <div className="space-y-2">
                    {predefinedTotals.map((amount, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Label htmlFor={`predefined-total-${index}`} className="text-sm w-20">
                          Amount {index + 1}:
                        </Label>
                        <Input
                          id={`predefined-total-${index}`}
                          type="number"
                          step="100"
                          min="0"
                          value={amount}
                          onChange={(e) => {
                            const newValue = parseFloat(e.target.value) || 0;
                            const newTotals = [...predefinedTotals];
                            newTotals[index] = newValue;
                            setPredefinedTotals(newTotals);
                            localStorage.setItem('betting-ui-predefined-totals', JSON.stringify(newTotals));
                          }}
                          className="w-32"
                        />
                        <span className="text-sm text-muted-foreground">${amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    These amounts will appear as quick buttons in the betting dialog for fast distribution.
                  </p>
                </div>
              </div>
            </div>

            {/* Appearance Settings */}
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-md p-6">
              <div className="flex items-center gap-3 mb-4">
                {mounted && theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-primary" />
                ) : (
                  <Sun className="w-5 h-5 text-primary" />
                )}
                <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-3 block">
                    Theme
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setTheme('light')}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-md border transition-all",
                        mounted && theme === 'light'
                          ? "bg-accent border-primary text-foreground"
                          : "bg-[hsl(var(--card))] border-[hsl(var(--border))] text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                      )}
                    >
                      <Sun className="w-4 h-4" />
                      <span>Light</span>
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-md border transition-all",
                        mounted && theme === 'dark'
                          ? "bg-accent border-primary text-foreground"
                          : "bg-[hsl(var(--card))] border-[hsl(var(--border))] text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                      )}
                    >
                      <Moon className="w-4 h-4" />
                      <span>Dark</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts Configuration */}
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Alerts Configuration</h2>
              </div>
              
              <div className="space-y-4">
                {/* NCAA Football Section */}
                <Collapsible open={expandedLeagues.NCAAF} onOpenChange={() => toggleLeague("NCAAF")}>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center gap-2 mb-2 hover:bg-accent/50 rounded-md p-2 -m-2 transition-colors">
                      {expandedLeagues.NCAAF ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                      <h3 className="text-base font-semibold text-foreground">NCAA Football</h3>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4">
                    <div className="mb-4 p-3 bg-signal-warning-muted border border-signal-warning/30 rounded-md">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-signal-warning mt-0.5 shrink-0" />
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">Demo Feature:</span> This is a demo feature only for now. Your choices won't be reflected in the alerts page.
                        </p>
                      </div>
                    </div>

                    {/* Game Conditions */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-foreground border-b border-[hsl(var(--border))] pb-2">
                        Game Conditions
                      </h4>

                      {/* Timeout */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Label htmlFor="timeout-enabled" className="text-sm font-medium text-foreground cursor-pointer">
                            Timeout
                          </Label>
                          <input
                            type="checkbox"
                            id="timeout-enabled"
                            checked={ncaafConfig.timeout.enabled}
                            onChange={(e) => setNcaafConfig({
                              ...ncaafConfig,
                              timeout: { ...ncaafConfig.timeout, enabled: e.target.checked }
                            })}
                            className="w-4 h-4 rounded border-[hsl(var(--border))] text-primary focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        {ncaafConfig.timeout.enabled && (
                          <div className="ml-6 space-y-2">
                            <div className="flex items-center gap-3">
                              <Label htmlFor="timeout-media" className="text-xs text-muted-foreground cursor-pointer">
                                Media timeout
                              </Label>
                              <input
                                type="checkbox"
                                id="timeout-media"
                                checked={ncaafConfig.timeout.types.media}
                                onChange={(e) => setNcaafConfig({
                                  ...ncaafConfig,
                                  timeout: {
                                    ...ncaafConfig.timeout,
                                    types: { ...ncaafConfig.timeout.types, media: e.target.checked }
                                  }
                                })}
                                className="w-4 h-4 rounded border-[hsl(var(--border))] text-primary focus:ring-2 focus:ring-primary"
                              />
                            </div>
                            <div className="flex items-center gap-3">
                              <Label htmlFor="timeout-coach" className="text-xs text-muted-foreground cursor-pointer">
                                Coach's challenge timeout
                              </Label>
                              <input
                                type="checkbox"
                                id="timeout-coach"
                                checked={ncaafConfig.timeout.types.coachChallenge}
                                onChange={(e) => setNcaafConfig({
                                  ...ncaafConfig,
                                  timeout: {
                                    ...ncaafConfig.timeout,
                                    types: { ...ncaafConfig.timeout.types, coachChallenge: e.target.checked }
                                  }
                                })}
                                className="w-4 h-4 rounded border-[hsl(var(--border))] text-primary focus:ring-2 focus:ring-primary"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Review */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Label htmlFor="review-enabled" className="text-sm font-medium text-foreground cursor-pointer">
                            Referee Review
                          </Label>
                          <input
                            type="checkbox"
                            id="review-enabled"
                            checked={ncaafConfig.review.enabled}
                            onChange={(e) => setNcaafConfig({
                              ...ncaafConfig,
                              review: { ...ncaafConfig.review, enabled: e.target.checked }
                            })}
                            className="w-4 h-4 rounded border-[hsl(var(--border))] text-primary focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        {ncaafConfig.review.enabled && (
                          <div className="ml-6 space-y-2">
                            <div className="flex items-center gap-3">
                              <Label htmlFor="review-flagrant" className="text-xs text-muted-foreground cursor-pointer">
                                Flagrant foul review
                              </Label>
                              <input
                                type="checkbox"
                                id="review-flagrant"
                                checked={ncaafConfig.review.types.flagrantFoul}
                                onChange={(e) => setNcaafConfig({
                                  ...ncaafConfig,
                                  review: {
                                    ...ncaafConfig.review,
                                    types: { ...ncaafConfig.review.types, flagrantFoul: e.target.checked }
                                  }
                                })}
                                className="w-4 h-4 rounded border-[hsl(var(--border))] text-primary focus:ring-2 focus:ring-primary"
                              />
                            </div>
                            <div className="flex items-center gap-3">
                              <Label htmlFor="review-technical" className="text-xs text-muted-foreground cursor-pointer">
                                Technical foul review
                              </Label>
                              <input
                                type="checkbox"
                                id="review-technical"
                                checked={ncaafConfig.review.types.technicalFoul}
                                onChange={(e) => setNcaafConfig({
                                  ...ncaafConfig,
                                  review: {
                                    ...ncaafConfig.review,
                                    types: { ...ncaafConfig.review.types, technicalFoul: e.target.checked }
                                  }
                                })}
                                className="w-4 h-4 rounded border-[hsl(var(--border))] text-primary focus:ring-2 focus:ring-primary"
                              />
                            </div>
                            <div className="flex items-center gap-3">
                              <Label htmlFor="review-other" className="text-xs text-muted-foreground cursor-pointer">
                                Other reviews
                              </Label>
                              <input
                                type="checkbox"
                                id="review-other"
                                checked={ncaafConfig.review.types.other}
                                onChange={(e) => setNcaafConfig({
                                  ...ncaafConfig,
                                  review: {
                                    ...ncaafConfig.review,
                                    types: { ...ncaafConfig.review.types, other: e.target.checked }
                                  }
                                })}
                                className="w-4 h-4 rounded border-[hsl(var(--border))] text-primary focus:ring-2 focus:ring-primary"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Overtime */}
                      <div className="flex items-center gap-3">
                        <Label htmlFor="overtime-enabled" className="text-sm font-medium text-foreground cursor-pointer">
                          Overtime (tied at end of regulation)
                        </Label>
                        <input
                          type="checkbox"
                          id="overtime-enabled"
                          checked={ncaafConfig.overtime.enabled}
                          onChange={(e) => setNcaafConfig({
                            ...ncaafConfig,
                            overtime: { enabled: e.target.checked }
                          })}
                          className="w-4 h-4 rounded border-[hsl(var(--border))] text-primary focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      {/* Intermission */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Label htmlFor="intermission-enabled" className="text-sm font-medium text-foreground cursor-pointer">
                            Intermission
                          </Label>
                          <input
                            type="checkbox"
                            id="intermission-enabled"
                            checked={ncaafConfig.intermission.enabled}
                            onChange={(e) => setNcaafConfig({
                              ...ncaafConfig,
                              intermission: { ...ncaafConfig.intermission, enabled: e.target.checked }
                            })}
                            className="w-4 h-4 rounded border-[hsl(var(--border))] text-primary focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        {ncaafConfig.intermission.enabled && (
                          <div className="ml-6 space-y-2">
                            <div className="flex items-center gap-3">
                              <Label htmlFor="intermission-ht" className="text-xs text-muted-foreground cursor-pointer">
                                Halftime
                              </Label>
                              <input
                                type="checkbox"
                                id="intermission-ht"
                                checked={ncaafConfig.intermission.types.halftime}
                                onChange={(e) => setNcaafConfig({
                                  ...ncaafConfig,
                                  intermission: {
                                    ...ncaafConfig.intermission,
                                    types: { ...ncaafConfig.intermission.types, halftime: e.target.checked }
                                  }
                                })}
                                className="w-4 h-4 rounded border-[hsl(var(--border))] text-primary focus:ring-2 focus:ring-primary"
                              />
                            </div>
                            <div className="flex items-center gap-3">
                              <Label htmlFor="intermission-quarter" className="text-xs text-muted-foreground cursor-pointer">
                                End of quarter
                              </Label>
                              <input
                                type="checkbox"
                                id="intermission-quarter"
                                checked={ncaafConfig.intermission.types.endOfQuarter}
                                onChange={(e) => setNcaafConfig({
                                  ...ncaafConfig,
                                  intermission: {
                                    ...ncaafConfig.intermission,
                                    types: { ...ncaafConfig.intermission.types, endOfQuarter: e.target.checked }
                                  }
                                })}
                                className="w-4 h-4 rounded border-[hsl(var(--border))] text-primary focus:ring-2 focus:ring-primary"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Delay */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Label htmlFor="delay-enabled" className="text-sm font-medium text-foreground cursor-pointer">
                            Game Delay
                          </Label>
                          <input
                            type="checkbox"
                            id="delay-enabled"
                            checked={ncaafConfig.delay.enabled}
                            onChange={(e) => setNcaafConfig({
                              ...ncaafConfig,
                              delay: { ...ncaafConfig.delay, enabled: e.target.checked }
                            })}
                            className="w-4 h-4 rounded border-[hsl(var(--border))] text-primary focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        {ncaafConfig.delay.enabled && (
                          <div className="ml-6 space-y-2">
                            <div className="flex items-center gap-3">
                              <Label htmlFor="delay-weather" className="text-xs text-muted-foreground cursor-pointer">
                                Weather delay
                              </Label>
                              <input
                                type="checkbox"
                                id="delay-weather"
                                checked={ncaafConfig.delay.types.weather}
                                onChange={(e) => setNcaafConfig({
                                  ...ncaafConfig,
                                  delay: {
                                    ...ncaafConfig.delay,
                                    types: { ...ncaafConfig.delay.types, weather: e.target.checked }
                                  }
                                })}
                                className="w-4 h-4 rounded border-[hsl(var(--border))] text-primary focus:ring-2 focus:ring-primary"
                              />
                            </div>
                            <div className="flex items-center gap-3">
                              <Label htmlFor="delay-hazardous" className="text-xs text-muted-foreground cursor-pointer">
                                Hazardous conditions (e.g., field conditions)
                              </Label>
                              <input
                                type="checkbox"
                                id="delay-hazardous"
                                checked={ncaafConfig.delay.types.hazardous}
                                onChange={(e) => setNcaafConfig({
                                  ...ncaafConfig,
                                  delay: {
                                    ...ncaafConfig.delay,
                                    types: { ...ncaafConfig.delay.types, hazardous: e.target.checked }
                                  }
                                })}
                                className="w-4 h-4 rounded border-[hsl(var(--border))] text-primary focus:ring-2 focus:ring-primary"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Injury */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Label htmlFor="injury-enabled" className="text-sm font-medium text-foreground cursor-pointer">
                            Player Injury
                          </Label>
                          <input
                            type="checkbox"
                            id="injury-enabled"
                            checked={ncaafConfig.injury.enabled}
                            onChange={(e) => setNcaafConfig({
                              ...ncaafConfig,
                              injury: { ...ncaafConfig.injury, enabled: e.target.checked }
                            })}
                            className="w-4 h-4 rounded border-[hsl(var(--border))] text-primary focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        {ncaafConfig.injury.enabled && (
                          <div className="ml-6">
                            <div className="flex items-center gap-3">
                              <Label htmlFor="injury-starter" className="text-xs text-muted-foreground cursor-pointer">
                                Starter out for game only
                              </Label>
                              <input
                                type="checkbox"
                                id="injury-starter"
                                checked={ncaafConfig.injury.starterOnly}
                                onChange={(e) => setNcaafConfig({
                                  ...ncaafConfig,
                                  injury: { ...ncaafConfig.injury, starterOnly: e.target.checked }
                                })}
                                className="w-4 h-4 rounded border-[hsl(var(--border))] text-primary focus:ring-2 focus:ring-primary"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Ejection */}
                      <div className="flex items-center gap-3">
                        <Label htmlFor="ejection-enabled" className="text-sm font-medium text-foreground cursor-pointer">
                          Player Ejection / Disqualification
                        </Label>
                        <input
                          type="checkbox"
                          id="ejection-enabled"
                          checked={ncaafConfig.ejection.enabled}
                          onChange={(e) => setNcaafConfig({
                            ...ncaafConfig,
                            ejection: { enabled: e.target.checked }
                          })}
                          className="w-4 h-4 rounded border-[hsl(var(--border))] text-primary focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>

                    {/* Betting Conditions */}
                    <div className="space-y-4 mt-6">
                      <h4 className="text-sm font-medium text-foreground border-b border-[hsl(var(--border))] pb-2">
                        Betting Conditions
                      </h4>

                      {/* Moneyline Subsection */}
                      <div className="space-y-3 pl-4 border-l-2 border-[hsl(var(--border))]">
                        <h5 className="text-xs font-semibold text-foreground uppercase tracking-wide">
                          Moneyline
                        </h5>
                        
                        {/* Closing Line Movement - Moneyline */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <Label htmlFor="closing-ml-enabled" className="text-sm font-medium text-foreground cursor-pointer">
                              Closing Line Movement
                            </Label>
                            <input
                              type="checkbox"
                              id="closing-ml-enabled"
                              checked={ncaafConfig.closingLineMovement.enabled && ncaafConfig.closingLineMovement.markets.moneyline}
                              onChange={(e) => setNcaafConfig({
                                ...ncaafConfig,
                                closingLineMovement: {
                                  ...ncaafConfig.closingLineMovement,
                                  enabled: e.target.checked || ncaafConfig.closingLineMovement.markets.spread || ncaafConfig.closingLineMovement.markets.total,
                                  markets: { ...ncaafConfig.closingLineMovement.markets, moneyline: e.target.checked }
                                }
                              })}
                              className="w-4 h-4 rounded border-[hsl(var(--border))] text-primary focus:ring-2 focus:ring-primary"
                            />
                          </div>
                        </div>

                        {/* Underdog Becomes Favorite */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <Label htmlFor="underdog-fav-enabled" className="text-sm font-medium text-foreground cursor-pointer">
                              Underdog Becomes Favorite
                            </Label>
                            <input
                              type="checkbox"
                              id="underdog-fav-enabled"
                              checked={ncaafConfig.underdogBecomesFavorite.enabled}
                              onChange={(e) => setNcaafConfig({
                                ...ncaafConfig,
                                underdogBecomesFavorite: { ...ncaafConfig.underdogBecomesFavorite, enabled: e.target.checked }
                              })}
                              className="w-4 h-4 rounded border-[hsl(var(--border))] text-primary focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          {ncaafConfig.underdogBecomesFavorite.enabled && (
                            <div className="ml-6">
                              <div className="flex items-center gap-3">
                                <Label htmlFor="underdog-fav-threshold" className="text-xs text-muted-foreground">
                                  Minimum odds change
                                </Label>
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    id="underdog-fav-threshold"
                                    value={ncaafConfig.underdogBecomesFavorite.minOddsChange}
                                    onChange={(e) => setNcaafConfig({
                                      ...ncaafConfig,
                                      underdogBecomesFavorite: {
                                        ...ncaafConfig.underdogBecomesFavorite,
                                        minOddsChange: parseInt(e.target.value) || 400
                                      }
                                    })}
                                    className="w-20 h-8 text-xs"
                                    min="1"
                                  />
                                  <span className="text-xs text-muted-foreground">points</span>
                                </div>
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-1 ml-0">
                                Alerts when underdog (e.g., +{ncaafConfig.underdogBecomesFavorite.minOddsChange}) becomes favorite (e.g., -100)
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Spread Subsection */}
                      <div className="space-y-3 pl-4 border-l-2 border-[hsl(var(--border))]">
                        <h5 className="text-xs font-semibold text-foreground uppercase tracking-wide">
                          Spread
                        </h5>
                        
                        {/* Closing Line Movement - Spread */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <Label htmlFor="closing-spread-enabled" className="text-sm font-medium text-foreground cursor-pointer">
                              Closing Line Movement
                            </Label>
                            <input
                              type="checkbox"
                              id="closing-spread-enabled"
                              checked={ncaafConfig.closingLineMovement.enabled && ncaafConfig.closingLineMovement.markets.spread}
                              onChange={(e) => setNcaafConfig({
                                ...ncaafConfig,
                                closingLineMovement: {
                                  ...ncaafConfig.closingLineMovement,
                                  enabled: e.target.checked || ncaafConfig.closingLineMovement.markets.moneyline || ncaafConfig.closingLineMovement.markets.total,
                                  markets: { ...ncaafConfig.closingLineMovement.markets, spread: e.target.checked }
                                }
                              })}
                              className="w-4 h-4 rounded border-[hsl(var(--border))] text-primary focus:ring-2 focus:ring-primary"
                            />
                          </div>
                        </div>

                        {/* Upset Alert */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <Label htmlFor="upset-enabled" className="text-sm font-medium text-foreground cursor-pointer">
                              Upset Alert
                            </Label>
                            <input
                              type="checkbox"
                              id="upset-enabled"
                              checked={ncaafConfig.upsetAlert.enabled}
                              onChange={(e) => setNcaafConfig({
                                ...ncaafConfig,
                                upsetAlert: { ...ncaafConfig.upsetAlert, enabled: e.target.checked }
                              })}
                              className="w-4 h-4 rounded border-[hsl(var(--border))] text-primary focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          {ncaafConfig.upsetAlert.enabled && (
                            <div className="ml-6 space-y-3">
                              <div className="flex items-center gap-3">
                                <Label htmlFor="upset-threshold" className="text-xs text-muted-foreground">
                                  Point underdog threshold
                                </Label>
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    id="upset-threshold"
                                    value={ncaafConfig.upsetAlert.pointThreshold}
                                    onChange={(e) => setNcaafConfig({
                                      ...ncaafConfig,
                                      upsetAlert: {
                                        ...ncaafConfig.upsetAlert,
                                        pointThreshold: parseInt(e.target.value) || 10
                                      }
                                    })}
                                    className="w-20 h-8 text-xs"
                                    min="1"
                                  />
                                  <span className="text-xs text-muted-foreground">points</span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground block">Alert checkpoints:</Label>
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-3">
                                    <Label htmlFor="upset-ht" className="text-xs text-muted-foreground cursor-pointer">
                                      Halftime
                                    </Label>
                                    <input
                                      type="checkbox"
                                      id="upset-ht"
                                      checked={ncaafConfig.upsetAlert.checkpoints.halftime}
                                      onChange={(e) => setNcaafConfig({
                                        ...ncaafConfig,
                                        upsetAlert: {
                                          ...ncaafConfig.upsetAlert,
                                          checkpoints: { ...ncaafConfig.upsetAlert.checkpoints, halftime: e.target.checked }
                                        }
                                      })}
                                      className="w-4 h-4 rounded border-[hsl(var(--border))] text-primary focus:ring-2 focus:ring-primary"
                                    />
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Label htmlFor="upset-16" className="text-xs text-muted-foreground cursor-pointer">
                                      16 min timeout
                                    </Label>
                                    <input
                                      type="checkbox"
                                      id="upset-16"
                                      checked={ncaafConfig.upsetAlert.checkpoints.timeout16}
                                      onChange={(e) => setNcaafConfig({
                                        ...ncaafConfig,
                                        upsetAlert: {
                                          ...ncaafConfig.upsetAlert,
                                          checkpoints: { ...ncaafConfig.upsetAlert.checkpoints, timeout16: e.target.checked }
                                        }
                                      })}
                                      className="w-4 h-4 rounded border-[hsl(var(--border))] text-primary focus:ring-2 focus:ring-primary"
                                    />
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Label htmlFor="upset-12" className="text-xs text-muted-foreground cursor-pointer">
                                      12 min timeout
                                    </Label>
                                    <input
                                      type="checkbox"
                                      id="upset-12"
                                      checked={ncaafConfig.upsetAlert.checkpoints.timeout12}
                                      onChange={(e) => setNcaafConfig({
                                        ...ncaafConfig,
                                        upsetAlert: {
                                          ...ncaafConfig.upsetAlert,
                                          checkpoints: { ...ncaafConfig.upsetAlert.checkpoints, timeout12: e.target.checked }
                                        }
                                      })}
                                      className="w-4 h-4 rounded border-[hsl(var(--border))] text-primary focus:ring-2 focus:ring-primary"
                                    />
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Label htmlFor="upset-8" className="text-xs text-muted-foreground cursor-pointer">
                                      8 min timeout
                                    </Label>
                                    <input
                                      type="checkbox"
                                      id="upset-8"
                                      checked={ncaafConfig.upsetAlert.checkpoints.timeout8}
                                      onChange={(e) => setNcaafConfig({
                                        ...ncaafConfig,
                                        upsetAlert: {
                                          ...ncaafConfig.upsetAlert,
                                          checkpoints: { ...ncaafConfig.upsetAlert.checkpoints, timeout8: e.target.checked }
                                        }
                                      })}
                                      className="w-4 h-4 rounded border-[hsl(var(--border))] text-primary focus:ring-2 focus:ring-primary"
                                    />
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Label htmlFor="upset-4" className="text-xs text-muted-foreground cursor-pointer">
                                      4 min timeout
                                    </Label>
                                    <input
                                      type="checkbox"
                                      id="upset-4"
                                      checked={ncaafConfig.upsetAlert.checkpoints.timeout4}
                                      onChange={(e) => setNcaafConfig({
                                        ...ncaafConfig,
                                        upsetAlert: {
                                          ...ncaafConfig.upsetAlert,
                                          checkpoints: { ...ncaafConfig.upsetAlert.checkpoints, timeout4: e.target.checked }
                                        }
                                      })}
                                      className="w-4 h-4 rounded border-[hsl(var(--border))] text-primary focus:ring-2 focus:ring-primary"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Total Subsection */}
                      <div className="space-y-3 pl-4 border-l-2 border-[hsl(var(--border))]">
                        <h5 className="text-xs font-semibold text-foreground uppercase tracking-wide">
                          Total
                        </h5>
                        
                        {/* Closing Line Movement - Total */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <Label htmlFor="closing-total-enabled" className="text-sm font-medium text-foreground cursor-pointer">
                              Closing Line Movement
                            </Label>
                            <input
                              type="checkbox"
                              id="closing-total-enabled"
                              checked={ncaafConfig.closingLineMovement.enabled && ncaafConfig.closingLineMovement.markets.total}
                              onChange={(e) => setNcaafConfig({
                                ...ncaafConfig,
                                closingLineMovement: {
                                  ...ncaafConfig.closingLineMovement,
                                  enabled: e.target.checked || ncaafConfig.closingLineMovement.markets.moneyline || ncaafConfig.closingLineMovement.markets.spread,
                                  markets: { ...ncaafConfig.closingLineMovement.markets, total: e.target.checked }
                                }
                              })}
                              className="w-4 h-4 rounded border-[hsl(var(--border))] text-primary focus:ring-2 focus:ring-primary"
                            />
                          </div>
                        </div>

                        {/* Total Deviation */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <Label htmlFor="total-dev-enabled" className="text-sm font-medium text-foreground cursor-pointer">
                              Total Deviation from Pregame Closing
                            </Label>
                            <input
                              type="checkbox"
                              id="total-dev-enabled"
                              checked={ncaafConfig.totalDeviation.enabled}
                              onChange={(e) => setNcaafConfig({
                                ...ncaafConfig,
                                totalDeviation: { ...ncaafConfig.totalDeviation, enabled: e.target.checked }
                              })}
                              className="w-4 h-4 rounded border-[hsl(var(--border))] text-primary focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          {ncaafConfig.totalDeviation.enabled && (
                            <div className="ml-6">
                              <div className="flex items-center gap-3">
                                <Label htmlFor="total-dev-threshold" className="text-xs text-muted-foreground">
                                  Deviation threshold
                                </Label>
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    id="total-dev-threshold"
                                    value={ncaafConfig.totalDeviation.threshold}
                                    onChange={(e) => setNcaafConfig({
                                      ...ncaafConfig,
                                      totalDeviation: {
                                        ...ncaafConfig.totalDeviation,
                                        threshold: parseInt(e.target.value) || 15
                                      }
                                    })}
                                    className="w-20 h-8 text-xs"
                                    min="1"
                                  />
                                  <span className="text-xs text-muted-foreground">points</span>
                                </div>
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-1 ml-0">
                                Alerts when total deviates ±{ncaafConfig.totalDeviation.threshold} points from pregame closing
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Other Leagues - Coming Soon */}
                {(["NFL", "NBA", "NCAAB"] as League[]).map((league) => (
                  <Collapsible key={league} open={expandedLeagues[league]} onOpenChange={() => toggleLeague(league)}>
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center gap-2 hover:bg-accent/50 rounded-md p-2 -m-2 transition-colors">
                        {expandedLeagues[league] ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                        <h3 className="text-base font-semibold text-foreground">{league}</h3>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="p-4 bg-muted/30 border border-[hsl(var(--border))] rounded-md mt-2">
                        <p className="text-sm text-muted-foreground italic">Coming soon</p>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
