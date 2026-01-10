import { BarChart3, Users, History, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const sections = [
  { id: "odds", icon: BarChart3, label: "Odds Screen" },
  { id: "accounts", icon: Users, label: "Accounts" },
  { id: "history", icon: History, label: "Bet History" },
  { id: "settings", icon: Settings, label: "Settings" },
];

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <aside className="w-sidebar bg-sidebar border-r border-sidebar-border flex flex-col items-center py-4 shrink-0">
      <div className="mb-8">
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-primary-foreground" />
        </div>
      </div>
      
      <nav className="flex flex-col gap-1 flex-1">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          
          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={cn(
                "w-10 h-10 rounded-md flex items-center justify-center transition-all duration-150",
                "hover:bg-sidebar-accent group relative",
                isActive && "bg-sidebar-accent text-sidebar-primary"
              )}
              title={section.label}
            >
              <Icon 
                className={cn(
                  "w-5 h-5",
                  isActive ? "text-sidebar-primary" : "text-sidebar-foreground"
                )} 
              />
              
              {/* Tooltip */}
              <span className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                {section.label}
              </span>
            </button>
          );
        })}
      </nav>
      
      <div className="mt-auto">
        <div className="w-2 h-2 rounded-full status-online" title="System Online" />
      </div>
    </aside>
  );
}
