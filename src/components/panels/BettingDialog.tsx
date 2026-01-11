import { useState, useEffect, useMemo, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Match } from "./SportsPanel";
import { useBetHistory } from "@/contexts/BetHistoryContext";

const STATUS = {
  SENT: 'sent',
  ACKED: 'acked',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed'
} as const;

type BetStatus = typeof STATUS[keyof typeof STATUS];

interface SentBet {
  account: Account;
  amount: number;
  status: BetStatus;
  error: string | null;
  errorScreenshot?: string;
}

interface Account {
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

interface BettingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match | null;
  platform: string;
  market: string;
  side: string;
  odds: string;
}

// Account data - same as in Accounts.tsx
const accountData: Record<string, Account[]> = {
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
  ]
};

const platformNames: Record<string, string> = {
  fanduel: 'FanDuel',
  betmgm: 'BetMGM',
  draftkings: 'DraftKings',
  'fan duel': 'FanDuel',
  'bet mgm': 'BetMGM'
};

// Map platform display name to platform ID
function getPlatformId(platformName: string): string {
  const normalized = platformName.toLowerCase().replace(/\s+/g, '');
  if (normalized.includes('fanduel') || normalized.includes('fan') || normalized.includes('fd')) {
    return 'fanduel';
  }
  if (normalized.includes('betmgm') || normalized.includes('mgm') || normalized.includes('m')) {
    return 'betmgm';
  }
  if (normalized.includes('draftkings') || normalized.includes('draft') || normalized.includes('dk')) {
    return 'draftkings';
  }
  return normalized;
}

function calculateMaxBetSize(account: Account): number {
  const availableCash = account.balance;
  const limit = account.limit !== null ? account.limit : Infinity;
  return Math.min(availableCash, limit);
}

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
      
      const aMaxBet = calculateMaxBetSize(a);
      const bMaxBet = calculateMaxBetSize(b);
      return bMaxBet - aMaxBet;
    });
  };
  
  return {
    unlimited: sortWithinGroup(unlimited),
    limited: sortWithinGroup(limited)
  };
}

export function BettingDialog({ isOpen, onClose, match, platform, market, side, odds }: BettingDialogProps) {
  const { addBet } = useBetHistory();
  const [selectedAccounts, setSelectedAccounts] = useState<Map<string, number>>(new Map());
  const [betAmountInputs, setBetAmountInputs] = useState<Map<string, string>>(new Map()); // Store raw input strings
  const [distributionTotal, setDistributionTotal] = useState<string>('');
  const [sentBets, setSentBets] = useState<SentBet[]>([]);
  const [viewMode, setViewMode] = useState<'before' | 'after'>('before');
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  const platformId = getPlatformId(platform);
  const platformAccounts = useMemo(() => accountData[platformId] || [], [platformId]);
  const groupedAccounts = useMemo(() => groupAccountsByType(platformAccounts), [platformAccounts]);

  // Get unique tags for the platform
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    platformAccounts.forEach(account => {
      account.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [platformAccounts]);

  // Calculate total bet amount
  const totalBetAmount = useMemo(() => {
    let total = 0;
    selectedAccounts.forEach(amount => total += amount);
    return total;
  }, [selectedAccounts]);

  // Format game name
  const gameName = match ? `${match.awayTeam} vs ${match.homeTeam}` : '';

  // Format market display name
  const marketDisplay = useMemo(() => {
    if (market === 'Moneyline') return 'Moneyline';
    if (market === 'Spread') {
      // Extract spread line from odds (e.g., "+1.5 (-195)" -> "+1.5")
      const spreadMatch = odds.match(/^([+-]?\d+\.?\d*)/);
      const spreadLine = spreadMatch ? spreadMatch[1] : '';
      const teamName = side === 'away' ? match?.awayTeam : match?.homeTeam;
      return `Spread ${spreadLine} (${teamName})`;
    }
    if (market === 'Total') {
      return side === 'over' ? `Over ${match?.total.line}` : `Under ${match?.total.line}`;
    }
    return market;
  }, [market, side, match, odds]);

  // Format bet type for history
  const formatBetType = (): string => {
    if (market === 'Moneyline') {
      const teamName = side === 'away' ? match?.awayTeam : match?.homeTeam;
      return `ML ${teamName}`;
    }
    if (market === 'Spread') {
      const spreadMatch = odds.match(/^([+-]?\d+\.?\d*)/);
      const spreadLine = spreadMatch ? spreadMatch[1] : '';
      return `Spread ${spreadLine}`;
    }
    if (market === 'Total') {
      return side === 'over' ? `O ${match?.total.line}` : `U ${match?.total.line}`;
    }
    return marketDisplay;
  };

  // Format match name for history
  const formatMatchName = (): string => {
    if (!match) return '';
    return `${match.awayTeam} @ ${match.homeTeam}`;
  };

  const handleAccountToggle = (accountId: string, checked: boolean) => {
    setSelectedAccounts(prev => {
      const newMap = new Map(prev);
      if (checked) {
        // Keep existing amount if already selected
        if (!newMap.has(accountId)) {
          newMap.set(accountId, 0);
        }
        // Initialize input string if not exists
        setBetAmountInputs(prevInputs => {
          const newInputs = new Map(prevInputs);
          if (!newInputs.has(accountId)) {
            newInputs.set(accountId, '');
          }
          return newInputs;
        });
      } else {
        newMap.delete(accountId);
        // Clear input string when unchecked
        setBetAmountInputs(prevInputs => {
          const newInputs = new Map(prevInputs);
          newInputs.delete(accountId);
          return newInputs;
        });
      }
      return newMap;
    });
  };

  const handleBetAmountChange = (accountId: string, value: string) => {
    const account = platformAccounts.find(acc => acc.id === accountId);
    if (!account) return;

    // Store the raw input string for free-form typing
    setBetAmountInputs(prev => {
      const newMap = new Map(prev);
      newMap.set(accountId, value);
      return newMap;
    });

    // Parse and update the actual bet amount
    const maxBet = calculateMaxBetSize(account);
    const betAmount = parseFloat(value) || 0;
    const clampedAmount = Math.min(betAmount, maxBet);

    setSelectedAccounts(prev => {
      const newMap = new Map(prev);
      if (clampedAmount > 0) {
        newMap.set(accountId, clampedAmount);
      } else {
        newMap.set(accountId, 0); // Keep 0 instead of deleting to maintain selection
      }
      return newMap;
    });
  };

  const handleBetAmountBlur = (accountId: string) => {
    // Format the input on blur
    const inputValue = betAmountInputs.get(accountId) || '';
    const betAmount = parseFloat(inputValue) || 0;
    if (betAmount > 0) {
      setBetAmountInputs(prev => {
        const newMap = new Map(prev);
        newMap.set(accountId, betAmount.toFixed(2));
        return newMap;
      });
    }
  };

  const handleTagSelection = (tag: string) => {
    const accountsWithTag = platformAccounts.filter(acc => acc.tags.includes(tag));
    if (accountsWithTag.length === 0) return;

    // Check if all accounts with this tag are already selected
    const allSelected = accountsWithTag.every(acc => selectedAccounts.has(acc.id));

    const shouldSelect = !allSelected;

    accountsWithTag.forEach(account => {
      handleAccountToggle(account.id, shouldSelect);
    });
  };

  const handleDistribute = () => {
    const totalAmount = parseFloat(distributionTotal);
    if (!totalAmount || totalAmount <= 0) return;

    const selectedAccountIds = Array.from(selectedAccounts.keys());
    if (selectedAccountIds.length === 0) return;

    const accountsWithMax = selectedAccountIds.map(accountId => {
      const account = platformAccounts.find(acc => acc.id === accountId);
      if (!account) return null;
      return { accountId, maxBet: calculateMaxBetSize(account) };
    }).filter(item => item !== null) as { accountId: string; maxBet: number }[];

    if (accountsWithMax.length === 0) return;

    const perAccount = totalAmount / accountsWithMax.length;
    let remaining = totalAmount;
    const distribution = new Map<string, number>();

    // First pass: assign up to max for each account
    accountsWithMax.forEach(({ accountId, maxBet }) => {
      const amount = Math.min(perAccount, maxBet);
      distribution.set(accountId, amount);
      remaining -= amount;
    });

    // Second pass: distribute remaining
    if (remaining > 0) {
      let iterations = 0;
      while (remaining > 0.01 && iterations < 100) {
        iterations++;
        const availableAccounts = accountsWithMax.filter(({ accountId, maxBet }) => {
          const currentAmount = distribution.get(accountId) || 0;
          return currentAmount < maxBet;
        });

        if (availableAccounts.length === 0) break;

        const perRemaining = remaining / availableAccounts.length;
        let distributed = false;

        availableAccounts.forEach(({ accountId, maxBet }) => {
          const currentAmount = distribution.get(accountId) || 0;
          const canAdd = Math.min(perRemaining, maxBet - currentAmount);
          if (canAdd > 0.01) {
            distribution.set(accountId, currentAmount + canAdd);
            remaining -= canAdd;
            distributed = true;
          }
        });

        if (!distributed) break;
      }
    }

    // Apply distribution
    setSelectedAccounts(distribution);
    // Update input strings to match distributed amounts
    setBetAmountInputs(prev => {
      const newMap = new Map(prev);
      distribution.forEach((amount, accountId) => {
        newMap.set(accountId, amount.toFixed(2));
      });
      return newMap;
    });
    setDistributionTotal('');
  };

  const getRandomErrorMessage = () => {
    const errors = [
      'Insufficient funds',
      'Bet limit exceeded',
      'Connection timeout',
      'Invalid bet amount',
      'Account temporarily unavailable',
      'Network error'
    ];
    return errors[Math.floor(Math.random() * errors.length)];
  };

  // Generate a mock phone screenshot URL for failed bets
  // In a real app, this would be an actual screenshot from the phone
  const generateErrorScreenshot = (error: string, betAmount: number, accountName: string): string => {
    // Create a data URL for a mock phone screenshot
    // This is a placeholder - in production, this would be an actual screenshot
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Background (phone screen)
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, 400, 800);
      
      // Status bar
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 400, 30);
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.fillText('9:41', 20, 20);
      ctx.fillText('📶 📶 🔋', 350, 20);
      
      // App header
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(0, 30, 400, 50);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(platformNames[platformId] || platform, 20, 55);
      
      // Error message area
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(20, 100, 360, 200);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px Arial';
      ctx.fillText('ERROR', 180, 140);
      ctx.font = '14px Arial';
      const lines = error.match(/.{1,30}/g) || [error];
      lines.forEach((line, i) => {
        ctx.fillText(line, 30, 180 + i * 25);
      });
      
      // Bet details
      ctx.fillStyle = '#333333';
      ctx.fillRect(20, 320, 360, 150);
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.fillText(`Match: ${formatMatchName()}`, 30, 350);
      ctx.fillText(`Type: ${formatBetType()}`, 30, 375);
      ctx.fillText(`Odds: ${odds}`, 30, 400);
      ctx.fillText(`Amount: $${betAmount.toFixed(2)}`, 30, 425);
      ctx.fillText(`Account: ${accountName}`, 30, 450);
    }
    return canvas.toDataURL('image/png');
  };

  const simulateBetStatusUpdates = (bets: SentBet[]) => {
    // Clear any existing timeouts
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current = [];

    // First phase: Update all bets from SENT to ACKED (staggered)
    bets.forEach((bet, index) => {
      const timeout = setTimeout(() => {
        setSentBets(prev => prev.map(b => 
          b.account.id === bet.account.id && b.status === STATUS.SENT
            ? { ...b, status: STATUS.ACKED }
            : b
        ));
      }, 500 + (index * 200));
      timeoutRefs.current.push(timeout);
    });

    // Second phase: After all bets are ACKED, continue to SUCCEEDED/FAILED
    const ackDelay = 500 + (bets.length * 200) + 1000;
    
    const finalTimeout = setTimeout(() => {
      bets.forEach((bet) => {
        const finalDelay = 1000 + Math.random() * 2000;
        const timeout = setTimeout(() => {
          setSentBets(prev => prev.map(b => {
            if (b.account.id === bet.account.id && b.status === STATUS.ACKED) {
              // Increased failure rate: 40% failure, 60% success
              if (Math.random() > 0.4) {
                const updatedBet = { ...b, status: STATUS.SUCCEEDED, error: null };
                
                // Add to bet history when succeeded
                addBet({
                  match: formatMatchName(),
                  type: formatBetType(),
                  odds: odds,
                  stake: bet.amount,
                  status: "pending", // New bets start as pending
                  platform: platformNames[platformId] || platform,
                  accountName: bet.account.name,
                });
                
                return updatedBet;
              } else {
                const errorMessage = getRandomErrorMessage();
                const errorScreenshot = generateErrorScreenshot(errorMessage, bet.amount, bet.account.name);
                
                // Add failed bet to history with screenshot
                addBet({
                  match: formatMatchName(),
                  type: formatBetType(),
                  odds: odds,
                  stake: bet.amount,
                  status: "lost", // Failed bets are marked as lost
                  platform: platformNames[platformId] || platform,
                  accountName: bet.account.name,
                  errorScreenshot: errorScreenshot,
                });
                
                return { ...b, status: STATUS.FAILED, error: errorMessage, errorScreenshot: errorScreenshot };
              }
            }
            return b;
          }));
        }, finalDelay);
        timeoutRefs.current.push(timeout);
      });
    }, ackDelay);
    timeoutRefs.current.push(finalTimeout);
  };

  const handleSendAllBets = () => {
    if (selectedAccounts.size === 0) return;
    
    // Create sent bets array
    const newSentBets: SentBet[] = [];
    selectedAccounts.forEach((amount, accountId) => {
      const account = platformAccounts.find(acc => acc.id === accountId);
      if (account) {
        newSentBets.push({
          account: account,
          amount: amount,
          status: STATUS.SENT,
          error: null
        });
      }
    });
    
    setSentBets(newSentBets);
    setViewMode('after');
    
    // Simulate status updates
    simulateBetStatusUpdates(newSentBets);
  };

  // Function to reset for a new bet (currently unused but kept for future use)
  // const handleNewBet = () => {
  //   // Clear all timeouts
  //   timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
  //   timeoutRefs.current = [];
  //   
  //   // Reset state
  //   setSentBets([]);
  //   setSelectedAccounts(new Map());
  //   setDistributionTotal('');
  //   setViewMode('before');
  // };

  const handleClose = () => {
    // Clear all timeouts
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current = [];
    
    // Reset state when closing
    setSelectedAccounts(new Map());
    setBetAmountInputs(new Map());
    setDistributionTotal('');
    setSentBets([]);
    setViewMode('before');
    onClose();
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  // Calculate total succeeded amount
  const totalSucceeded = useMemo(() => {
    return sentBets
      .filter(bet => bet.status === STATUS.SUCCEEDED)
      .reduce((sum, bet) => sum + bet.amount, 0);
  }, [sentBets]);

  const totalSent = useMemo(() => {
    return sentBets.reduce((sum, bet) => sum + bet.amount, 0);
  }, [sentBets]);

  const getStatusIcon = (status: BetStatus) => {
    switch (status) {
      case STATUS.SENT:
        return '✓';
      case STATUS.ACKED:
        return '✓';
      case STATUS.SUCCEEDED:
        return '✓✓';
      case STATUS.FAILED:
        return '✕';
      default:
        return '';
    }
  };

  const getStatusText = (status: BetStatus) => {
    switch (status) {
      case STATUS.SENT:
        return 'Sent to phone';
      case STATUS.ACKED:
        return 'Acknowledged by phone';
      case STATUS.SUCCEEDED:
        return 'Bet succeeded';
      case STATUS.FAILED:
        return 'Bet failed';
      default:
        return '';
    }
  };

  const getStatusColor = (status: BetStatus) => {
    switch (status) {
      case STATUS.SENT:
        return 'text-muted-foreground';
      case STATUS.ACKED:
        return 'text-[hsl(var(--signal-positive))]';
      case STATUS.SUCCEEDED:
        return 'text-[hsl(var(--signal-positive))]';
      case STATUS.FAILED:
        return 'text-[hsl(var(--signal-negative))]';
      default:
        return 'text-muted-foreground';
    }
  };

  if (!isOpen) return null;

  const renderAccountCard = (account: Account) => {
    const maxBet = calculateMaxBetSize(account);
    const isSelected = selectedAccounts.has(account.id);
    const initials = account.name.split(' ').map(n => n[0]).join('');

    return (
      <div
        key={account.id}
        className={cn(
          "bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-md p-4 transition-all",
          isSelected && "border-primary bg-accent/20",
          account.phoneOffline && "opacity-50 grayscale"
        )}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-foreground mb-1">{account.name}</div>
            <div className="text-sm font-mono text-[hsl(var(--signal-positive))]">
              Balance: ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            {account.limit !== null && (
              <div className="text-xs font-mono text-[hsl(var(--signal-negative))] mt-1">
                Limit: ${account.limit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            )}
            {account.onHold && (
              <span className="text-lg mt-1 inline-block" title="Account On Hold">🚫</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <input
            type="checkbox"
            id={`bet-checkbox-${account.id}`}
            checked={isSelected}
            onChange={(e) => handleAccountToggle(account.id, e.target.checked)}
            className="w-4 h-4"
          />
          <Input
            type="number"
            id={`bet-input-${account.id}`}
            step="0.01"
            min="0"
            max={maxBet.toFixed(2)}
            value={betAmountInputs.get(account.id) || ''}
            onChange={(e) => handleBetAmountChange(account.id, e.target.value)}
            onBlur={() => handleBetAmountBlur(account.id)}
            disabled={!isSelected}
            placeholder={`Max: $${maxBet.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            className="flex-1"
          />
        </div>
        <div className="text-xs text-muted-foreground mt-1 ml-6">
          Max bet: ${maxBet.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={handleClose}>
      <div 
        className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-md w-[95%] max-w-[1400px] max-h-[90vh] flex flex-col shadow-lg" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[hsl(var(--panel-header))] px-6 py-4 border-b border-[hsl(var(--border))] flex items-center justify-between shrink-0">
          <h2 className="text-lg font-semibold text-foreground">Place Bet</h2>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bet Configuration */}
        <div className="px-6 py-4 border-b border-[hsl(var(--border))] shrink-0">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Platform:</span>
              <span className="text-sm font-semibold text-foreground">{platformNames[platformId] || platform}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Game:</span>
              <span className="text-sm font-semibold text-foreground">{gameName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Market:</span>
              <span className="text-sm font-semibold text-foreground">{marketDisplay}</span>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="odds-input" className="text-sm font-medium text-muted-foreground">Odds:</Label>
              <Input
                id="odds-input"
                type="text"
                defaultValue={odds}
                placeholder="e.g., -110, +150"
                className="w-24"
              />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto terminal-scrollbar p-6">
          {viewMode === 'before' ? (
            <>
              {/* Header with Total and Send Button */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[hsl(var(--border))]">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-muted-foreground">Total Bet Size:</span>
                  <span className="text-2xl font-bold font-mono text-primary">
                    ${totalBetAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <button
                  onClick={handleSendAllBets}
                  disabled={selectedAccounts.size === 0}
                  className={cn(
                    "px-6 py-2 bg-primary text-primary-foreground rounded-md font-semibold transition-all",
                    selectedAccounts.size === 0 && "opacity-50 cursor-not-allowed",
                    selectedAccounts.size > 0 && "hover:bg-primary/90"
                  )}
                >
                  Send All Bets
                </button>
              </div>

              {/* Distribution Controls */}
              <div className="bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] rounded-md p-4 mb-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <Label htmlFor="distribution-total" className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                    Distribute Total Amount:
                  </Label>
                  <Input
                    id="distribution-total"
                    type="number"
                    step="0.01"
                    min="0"
                    value={distributionTotal}
                    onChange={(e) => setDistributionTotal(e.target.value)}
                    placeholder="Enter total amount"
                    className="flex-1 min-w-[200px]"
                  />
                  <button
                    onClick={handleDistribute}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-all"
                  >
                    Distribute Across Selected Accounts
                  </button>
                </div>
              </div>

              {/* Tag Selection */}
              {availableTags.length > 0 && (
                <div className="mb-4">
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">Select by Tag:</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleTagSelection(tag)}
                        className={cn(
                          "px-3 py-1.5 text-sm rounded-md border transition-all font-semibold uppercase",
                          "bg-[hsl(var(--card))] border-[hsl(var(--border))] text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Account Lists */}
              <div className="space-y-6">
                {groupedAccounts.unlimited.length > 0 && (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-[hsl(var(--panel-bg))] rounded-md border border-[hsl(var(--panel-border))]">
                      {groupedAccounts.unlimited.map(account => renderAccountCard(account))}
                    </div>
                  </div>
                )}

                {groupedAccounts.limited.length > 0 && (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-[hsl(var(--panel-bg))] rounded-md border border-[hsl(var(--panel-border))]">
                      {groupedAccounts.limited.map(account => renderAccountCard(account))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* After Bet View Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[hsl(var(--border))]">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-muted-foreground">Total Succeeded:</span>
                  <span className="text-2xl font-bold font-mono text-primary">
                    ${totalSucceeded.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / ${totalSent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Sent Bets List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sentBets.map((bet) => {
                  const initials = bet.account.name.split(' ').map(n => n[0]).join('');
                  return (
                    <div
                      key={bet.account.id}
                      className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-md p-4 relative"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold shrink-0">
                            {initials}
                          </div>
                          <div className="font-semibold text-foreground">{bet.account.name}</div>
                        </div>
                        <div className="text-lg font-bold font-mono text-primary">
                          ${bet.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>

                      <div className={cn("flex items-center gap-2", getStatusColor(bet.status))}>
                        <span className="text-xl font-bold">{getStatusIcon(bet.status)}</span>
                        <span className="text-sm font-medium">{getStatusText(bet.status)}</span>
                      </div>

                      {bet.status === STATUS.FAILED && bet.error && (
                        <div className="mt-2 space-y-2">
                          <div className="text-xs text-[hsl(var(--signal-negative))] bg-[hsl(var(--signal-negative))]/10 px-2 py-1 rounded">
                            {bet.error}
                          </div>
                          {bet.errorScreenshot && (
                            <div className="mt-2">
                              <div className="text-xs text-muted-foreground mb-1">Phone Screenshot:</div>
                              <img
                                src={bet.errorScreenshot}
                                alt="Error screenshot"
                                className="max-w-full h-auto rounded border border-[hsl(var(--border))]"
                                style={{ maxHeight: '300px' }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
