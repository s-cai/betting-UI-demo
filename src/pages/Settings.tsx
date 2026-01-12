import { User, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Settings() {
  // Mock trader name - in real app this would come from user context/API
  const traderName = "John Trader";
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

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
          </div>
        </div>
      </div>
    </div>
  );
}
