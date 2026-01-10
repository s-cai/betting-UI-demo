import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { NotificationsPanel } from "@/components/panels/NotificationsPanel";
import { SportsPanel, type Match } from "@/components/panels/SportsPanel";
import { OddsComparisonGrid } from "@/components/panels/OddsComparisonGrid";
import { BetHistoryBar } from "@/components/panels/BetHistoryBar";
import { AccountOverviewBar } from "@/components/panels/AccountOverviewBar";

const Index = () => {
  const [activeSection, setActiveSection] = useState("odds");
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Slim Sidebar - 4 sections */}
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Section */}
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

          {/* Bet History Bar (Far Right) */}
          <BetHistoryBar />
        </div>

        {/* Account Overview Bar (Bottom) */}
        <AccountOverviewBar />
      </div>
    </div>
  );
};

export default Index;
