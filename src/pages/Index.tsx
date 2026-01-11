import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { NotificationsPanel } from "@/components/panels/NotificationsPanel";
import { SportsPanel, type Match, allMatches } from "@/components/panels/SportsPanel";
import { OddsComparisonGrid } from "@/components/panels/OddsComparisonGrid";
import { BetHistoryBar } from "@/components/panels/BetHistoryBar";
import { AccountOverviewBar } from "@/components/panels/AccountOverviewBar";
import { Accounts } from "./Accounts";
import { Settings } from "./Settings";

const Index = () => {
  // Load persisted state from localStorage
  const [activeSection, setActiveSection] = useState(() => {
    const saved = localStorage.getItem('betting-ui-active-section');
    return saved || "odds";
  });
  
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(() => {
    const saved = localStorage.getItem('betting-ui-selected-match');
    if (saved) {
      try {
        const matchData = JSON.parse(saved);
        // Find the match in allMatches to ensure it's up to date
        const foundMatch = allMatches.find(m => m.id === matchData.id);
        return foundMatch || matchData;
      } catch {
        return null;
      }
    }
    return null;
  });

  // Persist activeSection changes
  useEffect(() => {
    localStorage.setItem('betting-ui-active-section', activeSection);
  }, [activeSection]);

  // Persist selectedMatch changes
  useEffect(() => {
    if (selectedMatch) {
      localStorage.setItem('betting-ui-selected-match', JSON.stringify(selectedMatch));
    } else {
      localStorage.removeItem('betting-ui-selected-match');
    }
  }, [selectedMatch]);

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Slim Sidebar - 4 sections */}
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Section - Content varies by active section */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {activeSection === "accounts" ? (
            /* Accounts View */
            <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
              <Accounts />
            </div>
          ) : activeSection === "settings" ? (
            /* Settings View */
            <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
              <Settings />
            </div>
          ) : activeSection === "history" ? (
            /* Bet History View - TBD, for now show placeholder */
            <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden items-center justify-center">
              <div className="text-muted-foreground">Bet History View - Coming Soon</div>
            </div>
          ) : (
            /* Default Odds View */
            <div className="flex-1 flex min-h-0">
              {/* Center Area - Notifications + Odds Grid */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Notifications/Alerts Panel (replaces chart) */}
                <NotificationsPanel />

                {/* Odds Comparison Grid */}
                <OddsComparisonGrid match={selectedMatch} />
              </div>

              {/* Right Side - Sports Panel (match list) */}
              <SportsPanel 
                onMatchSelect={setSelectedMatch} 
                selectedMatchId={selectedMatch?.id}
              />
            </div>
          )}

          {/* Bet History Bar (Right) - Always visible on all pages */}
          <BetHistoryBar />
        </div>

        {/* Account Overview Bar (Bottom) - Always visible */}
        <AccountOverviewBar />
      </div>
    </div>
  );
};

export default Index;
