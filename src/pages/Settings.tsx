import { User } from "lucide-react";
import { cn } from "@/lib/utils";

export function Settings() {
  // Mock trader name - in real app this would come from user context/API
  const traderName = "John Trader";

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

            {/* Placeholder for future settings */}
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-md p-6">
              <div className="text-center text-muted-foreground py-8">
                <p className="text-sm">Additional settings coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
