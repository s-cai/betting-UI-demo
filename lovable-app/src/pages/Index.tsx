import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { NotificationsPanel } from "@/components/panels/NotificationsPanel";
import { SportsPanel, type Match } from "@/components/panels/SportsPanel";
import { OddsComparisonGrid } from "@/components/panels/OddsComparisonGrid";
import { BetHistoryBar } from "@/components/panels/BetHistoryBar";
import { AccountOverviewBar } from "@/components/panels/AccountOverviewBar";
import { Accounts } from "./Accounts";
import { Settings } from "./Settings";

const Index = () => {
  const [activeSection, setActiveSection] = useState("odds");
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

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
