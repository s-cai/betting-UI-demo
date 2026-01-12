import { useState, useEffect, useMemo } from "react";
import { X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAccounts } from "@/contexts/AccountsContext";

export interface Account {
  id: string;
  name: string;
  balance: number;
  limit: number | null;
  phoneOffline: boolean;
  onHold: boolean;
  tags: string[];
  backupCash: number;
  notes: string;
}

interface Platform {
  id: string;
  name: string;
  logo: string;
}

// Use base URL for GitHub Pages compatibility
const getLogoPath = (logoName: string) => `${import.meta.env.BASE_URL}resources/${logoName}`;

// eslint-disable-next-line react-refresh/only-export-components
export const platforms: Platform[] = [
  { id: 'fanduel', name: 'FanDuel', logo: getLogoPath('fanduel-logo.svg') },
  { id: 'betmgm', name: 'BetMGM', logo: getLogoPath('betmgm-logo.svg') },
  { id: 'draftkings', name: 'DraftKings', logo: getLogoPath('draftkings-logo.svg') },
  { id: 'caesars', name: 'Caesars', logo: getLogoPath('caesars-logo.svg') },
  { id: 'pointsbet', name: 'PointsBet', logo: getLogoPath('pointsbet-logo.svg') },
  { id: 'bet365', name: 'Bet365', logo: getLogoPath('bet365-logo.svg') },
  { id: 'unibet', name: 'Unibet', logo: getLogoPath('unibet-logo.svg') },
  { id: 'wynnbet', name: 'WynnBET', logo: getLogoPath('wynnbet-logo.svg') }
];

// eslint-disable-next-line react-refresh/only-export-components
export const accountData: Record<string, Account[]> = {
  fanduel: [
    { id: 'fd1', name: 'John Smith', balance: 1250.50, limit: null, phoneOffline: false, onHold: false, tags: ['VIP', 'Premium'], backupCash: 5000.00, notes: 'High-value customer, prefers football bets' },
    { id: 'fd2', name: 'Sarah Johnson', balance: 850.25, limit: 500.00, phoneOffline: false, onHold: false, tags: ['New'], backupCash: 2000.00, notes: 'New account, monitor activity' },
    { id: 'fd3', name: 'Michael Chen', balance: 2100.75, limit: null, phoneOffline: true, onHold: false, tags: ['Premium'], backupCash: 10000.00, notes: 'Phone disconnected, investigate' },
    { id: 'fd4', name: 'Emily Davis', balance: 450.00, limit: 200.00, phoneOffline: false, onHold: true, tags: [], backupCash: 1000.00, notes: 'Account on hold pending verification' },
    { id: 'fd5', name: 'Thomas Anderson', balance: 3500.00, limit: null, phoneOffline: false, onHold: false, tags: ['VIP', 'Active'], backupCash: 20000.00, notes: 'Very active bettor, high volume' },
    { id: 'fd6', name: 'Maria Rodriguez', balance: 980.00, limit: 1500.00, phoneOffline: false, onHold: false, tags: ['Premium'], backupCash: 4000.00, notes: 'Regular customer, prefers basketball' },
    { id: 'fd7', name: 'Kevin Thompson', balance: 2200.50, limit: null, phoneOffline: false, onHold: false, tags: ['VIP'], backupCash: 12000.00, notes: 'Top tier customer, excellent track record' },
    { id: 'fd8', name: 'Jessica White', balance: 650.75, limit: 800.00, phoneOffline: false, onHold: false, tags: ['New', 'Active'], backupCash: 2500.00, notes: 'New account, showing good activity' },
    { id: 'fd9', name: 'Daniel Kim', balance: 1800.25, limit: null, phoneOffline: false, onHold: false, tags: ['Premium', 'Active'], backupCash: 7500.00, notes: 'Consistent bettor, multiple sports' },
    { id: 'fd10', name: 'Rachel Green', balance: 420.00, limit: 300.00, phoneOffline: false, onHold: false, tags: ['New'], backupCash: 1500.00, notes: 'Recently opened account' },
    { id: 'fd11', name: 'Mark Johnson', balance: 2750.00, limit: null, phoneOffline: true, onHold: false, tags: ['VIP', 'Premium'], backupCash: 15000.00, notes: 'Phone offline, check connection' },
    { id: 'fd12', name: 'Sophia Martinez', balance: 1100.50, limit: 1200.00, phoneOffline: false, onHold: false, tags: ['Premium'], backupCash: 3500.00, notes: 'Steady customer, prefers baseball' },
    { id: 'fd13', name: 'Ryan O\'Connor', balance: 1950.00, limit: null, phoneOffline: false, onHold: false, tags: ['VIP', 'Active'], backupCash: 9000.00, notes: 'High activity, multiple bets daily' },
    { id: 'fd14', name: 'Olivia Brown', balance: 750.25, limit: 1000.00, phoneOffline: false, onHold: true, tags: ['Warning'], backupCash: 2000.00, notes: 'Account on hold for review' },
    { id: 'fd15', name: 'William Taylor', balance: 3200.75, limit: null, phoneOffline: false, onHold: false, tags: ['VIP', 'Premium', 'Active'], backupCash: 18000.00, notes: 'Premium customer, excellent standing' }
  ],
  betmgm: [
    { id: 'mgm1', name: 'Robert Williams', balance: 3200.00, limit: null, phoneOffline: false, onHold: false, tags: ['VIP', 'Active'], backupCash: 15000.00, notes: 'Top customer, frequent bettor' },
    { id: 'mgm2', name: 'Lisa Anderson', balance: 675.50, limit: 1000.00, phoneOffline: false, onHold: false, tags: ['Premium'], backupCash: 3000.00, notes: 'Prefers basketball and baseball' },
    { id: 'mgm3', name: 'David Martinez', balance: 1200.25, limit: null, phoneOffline: true, onHold: false, tags: ['New'], backupCash: 5000.00, notes: 'Phone offline for 2 days' }
  ],
  draftkings: [
    { id: 'dk1', name: 'Jennifer Taylor', balance: 890.00, limit: null, phoneOffline: false, onHold: false, tags: ['VIP', 'Premium', 'Active'], backupCash: 8000.00, notes: 'Very active, multiple daily bets' },
    { id: 'dk2', name: 'Christopher Brown', balance: 1500.75, limit: 2000.00, phoneOffline: false, onHold: false, tags: ['Premium'], backupCash: 6000.00, notes: 'Conservative bettor, low risk tolerance' },
    { id: 'dk3', name: 'Amanda Wilson', balance: 525.50, limit: 500.00, phoneOffline: false, onHold: true, tags: ['Warning'], backupCash: 1500.00, notes: 'Account flagged for review' },
    { id: 'dk4', name: 'James Lee', balance: 2100.00, limit: null, phoneOffline: true, onHold: false, tags: ['Premium'], backupCash: 12000.00, notes: 'Phone offline, check connectivity' },
    { id: 'dk5', name: 'Patricia Garcia', balance: 750.25, limit: null, phoneOffline: false, onHold: false, tags: ['New'], backupCash: 2500.00, notes: 'New account setup last week' }
  ],
  caesars: [
    { id: 'cz1', name: 'Alexander Hamilton', balance: 15890.00, limit: null, phoneOffline: false, onHold: false, tags: ['VIP', 'Premium', 'Active'], backupCash: 50000.00, notes: 'High roller, frequent large bets' },
    { id: 'cz2', name: 'Victoria Sterling', balance: 4200.50, limit: null, phoneOffline: false, onHold: false, tags: ['Premium'], backupCash: 15000.00, notes: 'Regular customer, prefers horse racing' },
    { id: 'cz3', name: 'Nathaniel Black', balance: 2750.25, limit: 5000.00, phoneOffline: false, onHold: false, tags: ['Active'], backupCash: 10000.00, notes: 'Active bettor, multiple sports' },
    { id: 'cz4', name: 'Isabella Rose', balance: 1800.75, limit: null, phoneOffline: true, onHold: false, tags: ['Premium'], backupCash: 8000.00, notes: 'Phone offline, needs attention' },
    { id: 'cz5', name: 'Benjamin Grant', balance: 3200.00, limit: null, phoneOffline: false, onHold: false, tags: ['VIP', 'Active'], backupCash: 20000.00, notes: 'Top tier customer, excellent standing' },
    { id: 'cz6', name: 'Charlotte Moore', balance: 950.50, limit: 1500.00, phoneOffline: false, onHold: false, tags: ['New'], backupCash: 3000.00, notes: 'New account, monitor activity' },
    { id: 'cz7', name: 'Henry Ford', balance: 5100.25, limit: null, phoneOffline: false, onHold: false, tags: ['VIP', 'Premium'], backupCash: 25000.00, notes: 'Very active, high volume customer' }
  ],
  pointsbet: [
    { id: 'pb1', name: 'Emma Watson', balance: 3200.00, limit: null, phoneOffline: false, onHold: false, tags: ['Premium', 'Active'], backupCash: 12000.00, notes: 'Regular bettor, prefers live betting' },
    { id: 'pb2', name: 'Lucas Martinez', balance: 1850.75, limit: 2500.00, phoneOffline: false, onHold: false, tags: ['Active'], backupCash: 6000.00, notes: 'Active customer, multiple daily bets' },
    { id: 'pb3', name: 'Grace Chen', balance: 750.50, limit: 1000.00, phoneOffline: true, onHold: false, tags: ['New'], backupCash: 2500.00, notes: 'Phone offline, check connection' },
    { id: 'pb4', name: 'Oliver Stone', balance: 2200.25, limit: null, phoneOffline: false, onHold: false, tags: ['Premium'], backupCash: 8000.00, notes: 'Steady customer, prefers football' },
    { id: 'pb5', name: 'Lily Anderson', balance: 450.00, limit: 500.00, phoneOffline: false, onHold: true, tags: ['Warning'], backupCash: 1500.00, notes: 'Account on hold for verification' }
  ],
  bet365: [
    { id: 'b3651', name: 'George Washington', balance: 22100.00, limit: null, phoneOffline: false, onHold: false, tags: ['VIP', 'Premium', 'Active'], backupCash: 75000.00, notes: 'Top customer, very high volume' },
    { id: 'b3652', name: 'Martha Jefferson', balance: 8500.50, limit: null, phoneOffline: false, onHold: false, tags: ['VIP', 'Premium'], backupCash: 30000.00, notes: 'High-value customer, excellent track record' },
    { id: 'b3653', name: 'Thomas Adams', balance: 4200.75, limit: 10000.00, phoneOffline: false, onHold: false, tags: ['Premium', 'Active'], backupCash: 15000.00, notes: 'Active bettor, multiple sports' },
    { id: 'b3654', name: 'Abigail Franklin', balance: 1800.25, limit: null, phoneOffline: false, onHold: false, tags: ['Premium'], backupCash: 7000.00, notes: 'Regular customer, prefers basketball' },
    { id: 'b3655', name: 'John Quincy', balance: 3200.00, limit: null, phoneOffline: true, onHold: false, tags: ['VIP'], backupCash: 18000.00, notes: 'Phone offline, investigate' },
    { id: 'b3656', name: 'Eleanor Roosevelt', balance: 1950.50, limit: 3000.00, phoneOffline: false, onHold: false, tags: ['Active'], backupCash: 5000.00, notes: 'Active account, monitor closely' },
    { id: 'b3657', name: 'Franklin Pierce', balance: 2750.75, limit: null, phoneOffline: false, onHold: false, tags: ['Premium', 'Active'], backupCash: 11000.00, notes: 'Consistent bettor, good standing' },
    { id: 'b3658', name: 'Harriet Tubman', balance: 1100.00, limit: 2000.00, phoneOffline: false, onHold: false, tags: ['New'], backupCash: 3500.00, notes: 'New account, showing promise' }
  ],
  unibet: [
    { id: 'ub1', name: 'Sophie Laurent', balance: 6750.00, limit: null, phoneOffline: false, onHold: false, tags: ['VIP', 'Premium', 'Active'], backupCash: 25000.00, notes: 'Very active, multiple daily bets' },
    { id: 'ub2', name: 'Pierre Dubois', balance: 3200.50, limit: null, phoneOffline: false, onHold: false, tags: ['Premium'], backupCash: 12000.00, notes: 'Regular customer, prefers soccer' },
    { id: 'ub3', name: 'Marie Leclerc', balance: 1850.25, limit: 3000.00, phoneOffline: false, onHold: false, tags: ['Active'], backupCash: 6000.00, notes: 'Active bettor, good activity' },
    { id: 'ub4', name: 'Jean Moreau', balance: 950.75, limit: 1500.00, phoneOffline: true, onHold: false, tags: ['New'], backupCash: 3000.00, notes: 'Phone offline, check status' },
    { id: 'ub5', name: 'Camille Bernard', balance: 2200.00, limit: null, phoneOffline: false, onHold: false, tags: ['Premium', 'Active'], backupCash: 8000.00, notes: 'Steady customer, multiple sports' },
    { id: 'ub6', name: 'Antoine Martin', balance: 1400.50, limit: null, phoneOffline: false, onHold: false, tags: ['Active'], backupCash: 4500.00, notes: 'Active account, monitor activity' }
  ],
  wynnbet: [
    { id: 'wb1', name: 'Steven Wynn', balance: 4500.00, limit: null, phoneOffline: false, onHold: false, tags: ['VIP', 'Premium'], backupCash: 20000.00, notes: 'Premium customer, high value' },
    { id: 'wb2', name: 'Jennifer Las Vegas', balance: 2200.75, limit: 5000.00, phoneOffline: false, onHold: false, tags: ['Premium', 'Active'], backupCash: 9000.00, notes: 'Active bettor, prefers casino games' },
    { id: 'wb3', name: 'Michael Casino', balance: 1800.50, limit: null, phoneOffline: false, onHold: false, tags: ['Active'], backupCash: 7000.00, notes: 'Regular customer, steady activity' },
    { id: 'wb4', name: 'Sarah Bellagio', balance: 950.25, limit: 2000.00, phoneOffline: true, onHold: false, tags: ['New'], backupCash: 3000.00, notes: 'Phone offline, needs attention' },
    { id: 'wb5', name: 'David Strip', balance: 3200.00, limit: null, phoneOffline: false, onHold: false, tags: ['VIP', 'Active'], backupCash: 15000.00, notes: 'Top tier customer, excellent standing' },
    { id: 'wb6', name: 'Amanda Resort', balance: 1250.75, limit: null, phoneOffline: false, onHold: false, tags: ['Premium'], backupCash: 5000.00, notes: 'Good customer, monitor closely' }
  ]
};

function groupAccountsByType(accounts: Account[]) {
  const unlimited: Account[] = [];
  const limited: Account[] = [];
  
  accounts.forEach(account => {
    if (account.limit === null) {
      unlimited.push(account);
    } else {
      limited.push(account);
    }
  });
  
  const sortWithinGroup = (group: Account[]) => {
    return group.sort((a, b) => {
      const aTradable = !a.phoneOffline && !a.onHold;
      const bTradable = !b.phoneOffline && !b.onHold;
      
      if (aTradable && !bTradable) return -1;
      if (!aTradable && bTradable) return 1;
      
      return b.balance - a.balance;
    });
  };
  
  return {
    unlimited: sortWithinGroup(unlimited),
    limited: sortWithinGroup(limited)
  };
}

interface EditModalProps {
  account: Account | null;
  platformId: string;
  onClose: () => void;
  onSave: (account: Account, platformId: string) => void;
}

function EditModal({ account, platformId, onClose, onSave }: EditModalProps) {
  const [formData, setFormData] = useState({
    balance: account?.balance.toString() || '0',
    limit: account?.limit?.toString() || '',
    onHold: account?.onHold || false,
    tags: account?.tags.join(', ') || '',
    notes: account?.notes || ''
  });

  // Update form data when account changes
  useEffect(() => {
    if (account) {
      setFormData({
        balance: account.balance.toString(),
        limit: account.limit?.toString() || '',
        onHold: account.onHold,
        tags: account.tags.join(', ') || '',
        notes: account.notes || ''
      });
    }
  }, [account]);

  if (!account) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedAccount: Account = {
      ...account,
      balance: parseFloat(formData.balance) || 0,
      limit: formData.limit ? parseFloat(formData.limit) : null,
      onHold: formData.onHold,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [],
      notes: formData.notes
    };
    onSave(updatedAccount, platformId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-md w-[90%] max-w-[500px] shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="bg-[hsl(var(--panel-header))] px-6 py-4 border-b border-[hsl(var(--border))] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Edit Account</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Holder Full Name</Label>
              <Input id="edit-name" value={account.name} readOnly className="bg-muted/50" />
            </div>
            
            <div>
              <Label htmlFor="edit-balance">Cash Balance ($)</Label>
              <Input
                id="edit-balance"
                type="number"
                step="0.01"
                min="0"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-limit">Betting Limit ($)</Label>
              <Input
                id="edit-limit"
                type="number"
                step="0.01"
                min="0"
                value={formData.limit}
                onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                placeholder="Leave empty for unlimited"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-on-hold"
                checked={formData.onHold}
                onChange={(e) => setFormData({ ...formData, onHold: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="edit-on-hold">Account On Hold</Label>
            </div>
            
            <div>
              <Label htmlFor="edit-tags">Colored Tags (comma-separated)</Label>
              <Input
                id="edit-tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g., VIP, Premium, New"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-notes">Custom Notes</Label>
              <Textarea
                id="edit-notes"
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
          
          <div className="flex gap-2 justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Accounts() {
  const { accounts, updateAccount } = useAccounts();
  const [editingAccount, setEditingAccount] = useState<{ account: Account; platformId: string } | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>(platforms[0].id);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [showLimited, setShowLimited] = useState<boolean | null>(null); // null = all, true = limited only, false = unlimited only

  const handleSaveAccount = (updatedAccount: Account, platformId: string) => {
    updateAccount(platformId, updatedAccount.id, updatedAccount);
  };

  const handleAccountRightClick = (e: React.MouseEvent, account: Account, platformId: string) => {
    e.preventDefault();
    setEditingAccount({ account, platformId });
  };

  const renderAccountCard = (account: Account, platformId: string) => {
    const initials = account.name.split(' ').map(n => n[0]).join('');
    
    return (
      <Tooltip key={account.id}>
        <TooltipTrigger asChild>
          <div
            onContextMenu={(e) => handleAccountRightClick(e, account, platformId)}
            className={cn(
              "bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-md p-5 cursor-pointer transition-all hover:bg-accent/50 hover:border-primary",
              account.phoneOffline && "opacity-50 grayscale"
            )}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground mb-1">{account.name}</div>
                <div className="flex items-center gap-2 flex-wrap">
                  {account.onHold && (
                    <span className="text-lg" title="Account On Hold">🚫</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="font-mono text-xl font-bold text-[hsl(var(--signal-positive))] mb-1">
              ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            
            {account.limit !== null && (
              <div className="font-mono text-sm text-[hsl(var(--signal-negative))] mb-2">
                Limit: ${account.limit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            )}
            
            {account.tags && account.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {account.tags.map(tag => (
                  <span
                    key={tag}
                    className={cn(
                      "px-2 py-0.5 rounded text-xs font-semibold uppercase",
                      tag.toLowerCase() === 'vip' && "bg-[hsl(var(--signal-warning))] text-[hsl(var(--background))]",
                      tag.toLowerCase() === 'premium' && "bg-primary text-primary-foreground",
                      tag.toLowerCase() === 'new' && "bg-[hsl(var(--signal-positive))] text-white",
                      tag.toLowerCase() === 'active' && "bg-primary text-primary-foreground",
                      tag.toLowerCase() === 'warning' && "bg-[hsl(var(--signal-warning))] text-white"
                    )}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1.5">
            <div>
              <span className="font-semibold">Backup Cash:</span>{" "}
              <span className="font-mono">
                ${account.backupCash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="font-semibold">Notes:</span> {account.notes || 'No notes'}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  };

  // Get unique tags from accounts in the selected platform only
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    const platformAccounts = accounts[selectedPlatform] || [];
    platformAccounts.forEach(account => {
      account.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [accounts, selectedPlatform]);

  // Filter accounts based on selected platform, tags, and limit status
  const filteredAccounts = useMemo(() => {
    let platformAccounts = accounts[selectedPlatform] || [];
    
    // Filter by tags
    if (selectedTags.size > 0) {
      platformAccounts = platformAccounts.filter(account =>
        account.tags.some(tag => selectedTags.has(tag))
      );
    }
    
    // Filter by limit status
    if (showLimited !== null) {
      if (showLimited) {
        platformAccounts = platformAccounts.filter(account => account.limit !== null);
      } else {
        platformAccounts = platformAccounts.filter(account => account.limit === null);
      }
    }
    
    return platformAccounts;
  }, [accounts, selectedPlatform, selectedTags, showLimited]);

  // Calculate totals for the current platform
  const platformTotals = useMemo(() => {
    const totalBalance = filteredAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalBackupCash = filteredAccounts.reduce((sum, acc) => sum + acc.backupCash, 0);
    const totalAccounts = filteredAccounts.length;
    return { totalBalance, totalBackupCash, totalAccounts };
  }, [filteredAccounts]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tag)) {
        newSet.delete(tag);
      } else {
        newSet.add(tag);
      }
      return newSet;
    });
  };

  const getTagColors = (tag: string) => {
    const tagLower = tag.toLowerCase();
    if (tagLower === 'vip') {
      return "bg-[hsl(var(--signal-warning))] text-[hsl(var(--background))] border-[hsl(var(--signal-warning))]";
    } else if (tagLower === 'premium') {
      return "bg-primary text-primary-foreground border-primary";
    } else if (tagLower === 'new') {
      return "bg-[hsl(var(--signal-positive))] text-white border-[hsl(var(--signal-positive))]";
    } else if (tagLower === 'active') {
      return "bg-primary text-primary-foreground border-primary";
    } else if (tagLower === 'warning') {
      return "bg-[hsl(var(--signal-warning))] text-white border-[hsl(var(--signal-warning))]";
    }
    return "bg-[hsl(var(--card))] text-muted-foreground border-[hsl(var(--border))]";
  };

  const renderPlatformSection = () => {
    const platform = platforms.find(p => p.id === selectedPlatform);
    if (!platform) return null;
    
    if (filteredAccounts.length === 0) {
      return (
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-md p-8">
          <div className="text-center text-muted-foreground">No accounts match the selected filters</div>
        </div>
      );
    }

    const grouped = groupAccountsByType(filteredAccounts);

    return (
      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-md p-8 mb-8">
        <div className="flex items-center gap-5 mb-6 pb-4 border-b border-[hsl(var(--border))]">
          <img src={platform.logo} alt={`${platform.name} Logo`} className="h-[60px] w-auto object-contain" />
          <h2 className="text-2xl font-semibold text-foreground">{platform.name}</h2>
        </div>
        
        {/* Platform Totals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-[hsl(var(--panel-bg))] rounded-md border border-[hsl(var(--panel-border))]">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Total Accounts
            </div>
            <div className="text-2xl font-bold text-foreground">{platformTotals.totalAccounts}</div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Total Balance
            </div>
            <div className="text-2xl font-bold font-mono text-[hsl(var(--signal-positive))]">
              ${platformTotals.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Total Backup Cash
            </div>
            <div className="text-2xl font-bold font-mono text-[hsl(var(--signal-positive))]">
              ${platformTotals.totalBackupCash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          {grouped.unlimited.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5 bg-[hsl(var(--panel-bg))] rounded-md border border-[hsl(var(--panel-border))]">
              {grouped.unlimited.map(account => renderAccountCard(account, platform.id))}
            </div>
          )}
          
          {grouped.limited.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5 bg-[hsl(var(--panel-bg))] rounded-md border border-[hsl(var(--panel-border))]">
              {grouped.limited.map(account => renderAccountCard(account, platform.id))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 min-h-0 flex overflow-hidden">
      {/* Left Sidebar - Platform Selection & Filters */}
      <div className="w-64 bg-[hsl(var(--panel-bg))] border-r border-[hsl(var(--panel-border))] flex flex-col shrink-0">
        {/* Platform Selection */}
        <div className="p-4 border-b border-[hsl(var(--panel-border))]">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
            <Filter className="w-3.5 h-3.5" />
            Platform
          </div>
          <div className="space-y-2">
            {platforms.map(platform => (
              <button
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-md border transition-all text-left",
                  selectedPlatform === platform.id
                    ? "bg-accent border-primary text-foreground"
                    : "bg-[hsl(var(--card))] border-[hsl(var(--border))] text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <img src={platform.logo} alt={`${platform.name} Logo`} className="h-8 w-auto object-contain" />
                <span className="font-medium">{platform.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex-1 overflow-y-auto terminal-scrollbar p-4 space-y-6">
          {/* Limit Status Filter */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Limit Status
            </div>
            <div className="space-y-2">
              <button
                onClick={() => setShowLimited(null)}
                className={cn(
                  "w-full px-3 py-2 text-sm rounded-md border transition-all text-left",
                  showLimited === null
                    ? "bg-accent border-primary text-foreground"
                    : "bg-[hsl(var(--card))] border-[hsl(var(--border))] text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                All Accounts
              </button>
              <button
                onClick={() => setShowLimited(false)}
                className={cn(
                  "w-full px-3 py-2 text-sm rounded-md border transition-all text-left",
                  showLimited === false
                    ? "bg-accent border-primary text-foreground"
                    : "bg-[hsl(var(--card))] border-[hsl(var(--border))] text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                Unlimited Only
              </button>
              <button
                onClick={() => setShowLimited(true)}
                className={cn(
                  "w-full px-3 py-2 text-sm rounded-md border transition-all text-left",
                  showLimited === true
                    ? "bg-accent border-primary text-foreground"
                    : "bg-[hsl(var(--card))] border-[hsl(var(--border))] text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                Limited Only
              </button>
            </div>
          </div>

          {/* Tag Filters */}
          {availableTags.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Tags
              </div>
              <div className="space-y-2">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "w-full px-3 py-2 text-sm rounded-md border transition-all text-left flex items-center justify-between font-semibold uppercase",
                      getTagColors(tag),
                      selectedTags.has(tag)
                        ? "opacity-100"
                        : "opacity-50 hover:opacity-75"
                    )}
                  >
                    <span>{tag}</span>
                    {selectedTags.has(tag) && (
                      <span className="text-current">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear Filters */}
          {(selectedTags.size > 0 || showLimited !== null) && (
            <button
              onClick={() => {
                setSelectedTags(new Set());
                setShowLimited(null);
              }}
              className="w-full px-3 py-2 text-sm rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-all"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto terminal-scrollbar p-6">
          <div className="max-w-[1400px] mx-auto">
            {renderPlatformSection()}
          </div>
        </div>
      </div>
      
      {editingAccount && (
        <EditModal
          account={editingAccount.account}
          platformId={editingAccount.platformId}
          onClose={() => setEditingAccount(null)}
          onSave={handleSaveAccount}
        />
      )}
    </div>
  );
}
