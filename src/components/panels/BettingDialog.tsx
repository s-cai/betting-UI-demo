import { useState, useEffect, useMemo, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Match } from "./SportsPanel";
import { useBetHistory } from "@/contexts/BetHistoryContext";
import { useAccounts } from "@/contexts/AccountsContext";
import type { Account } from "@/pages/Accounts";

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
  betId?: string; // Store the bet ID from history for updates
  startTime: number; // When this specific bet was sent
  completionTime?: number; // When this specific bet completed (SUCCEEDED or FAILED)
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

const platformNames: Record<string, string> = {
  fanduel: 'FanDuel',
  betmgm: 'BetMGM',
  draftkings: 'DraftKings',
  caesars: 'Caesars',
  pointsbet: 'PointsBet',
  bet365: 'Bet365',
  unibet: 'Unibet',
  wynnbet: 'WynnBET',
  'fan duel': 'FanDuel',
  'bet mgm': 'BetMGM'
};

// Map platform display name to platform ID
function getPlatformId(platformName: string): string {
  const normalized = platformName.toLowerCase().replace(/\s+/g, '');
  if (normalized.includes('fanduel') || normalized.includes('fan') || normalized.includes('fd')) {
    return 'fanduel';
  }
  if (normalized.includes('betmgm') || normalized.includes('mgm')) {
    return 'betmgm';
  }
  if (normalized.includes('draftkings') || normalized.includes('draft') || normalized.includes('dk')) {
    return 'draftkings';
  }
  if (normalized.includes('caesars') || normalized.includes('caesar')) {
    return 'caesars';
  }
  if (normalized.includes('pointsbet') || normalized.includes('points')) {
    return 'pointsbet';
  }
  if (normalized.includes('bet365') || normalized.includes('365')) {
    return 'bet365';
  }
  if (normalized.includes('unibet') || normalized.includes('uni')) {
    return 'unibet';
  }
  if (normalized.includes('wynnbet') || normalized.includes('wynn')) {
    return 'wynnbet';
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
  const { bets, addBet, updateBet } = useBetHistory();
  const [selectedAccounts, setSelectedAccounts] = useState<Map<string, number>>(new Map());
  const [betAmountInputs, setBetAmountInputs] = useState<Map<string, string>>(new Map()); // Store raw input strings
  const [distributionTotal, setDistributionTotal] = useState<string>('');
  const [sentBets, setSentBets] = useState<SentBet[]>([]);
  const [viewMode, setViewMode] = useState<'before' | 'after'>('before');
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const recentBetIdsRef = useRef<Map<string, string>>(new Map()); // Track accountId -> betId for recently added bets
  const betsRef = useRef(bets); // Track latest bets to avoid stale closures
  const elapsedTimeIntervalsRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map()); // Track per-account intervals
  const distributionInputRef = useRef<HTMLInputElement>(null); // Ref for distribution input to auto-focus

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

  // Update bets ref when bets change
  useEffect(() => {
    betsRef.current = bets;
  }, [bets]);

  const { accounts } = useAccounts();
  const platformId = getPlatformId(platform);
  const platformAccounts = useMemo(() => accounts[platformId] || [], [accounts, platformId]);
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
    // Prevent selecting offline accounts
    const account = platformAccounts.find(acc => acc.id === accountId);
    if (account?.phoneOffline) {
      return;
    }
    
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

    // Store the raw input string for free-form typing - allow empty string and partial numbers
    setBetAmountInputs(prev => {
      const newMap = new Map(prev);
      newMap.set(accountId, value);
      return newMap;
    });

    // Parse and update the actual bet amount only if we have a valid number
    const maxBet = calculateMaxBetSize(account);
    const betAmount = value === '' ? 0 : parseFloat(value);
    
    // Only update if we have a valid number (not NaN)
    if (!isNaN(betAmount)) {
      const clampedAmount = Math.min(Math.max(0, betAmount), maxBet);
      setSelectedAccounts(prev => {
        const newMap = new Map(prev);
        if (clampedAmount > 0 || value === '') {
          newMap.set(accountId, clampedAmount);
        } else {
          newMap.set(accountId, 0); // Keep 0 instead of deleting to maintain selection
        }
        return newMap;
      });
    }
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
    // Filter to only include accounts with the tag that are not offline
    const accountsWithTag = platformAccounts.filter(acc => acc.tags.includes(tag) && !acc.phoneOffline);
    if (accountsWithTag.length === 0) return;

    // Check if all accounts with this tag are already selected
    const allSelected = accountsWithTag.every(acc => selectedAccounts.has(acc.id));

    const shouldSelect = !allSelected;

    accountsWithTag.forEach(account => {
      handleAccountToggle(account.id, shouldSelect);
    });
  };

  // Helper function to round to 2 significant digits (preferred)
  const roundTo2SignificantDigits = (value: number): number => {
    if (value === 0) return 0;
    const magnitude = Math.pow(10, Math.floor(Math.log10(Math.abs(value))));
    const normalized = value / magnitude;
    const rounded = Math.round(normalized * 10) / 10; // Round to 2 sig digits
    return rounded * magnitude;
  };

  // Helper function to round to 3 significant digits (fallback when 2 is impossible)
  const roundTo3SignificantDigits = (value: number): number => {
    if (value === 0) return 0;
    const magnitude = Math.pow(10, Math.floor(Math.log10(Math.abs(value))));
    const normalized = value / magnitude;
    const rounded = Math.round(normalized * 100) / 100; // Round to 3 sig digits
    return rounded * magnitude;
  };

  // Shared distribution logic
  const performDistribution = (totalAmount: number) => {
    if (!totalAmount || totalAmount <= 0) return;

    const selectedAccountIds = Array.from(selectedAccounts.keys());
    if (selectedAccountIds.length === 0) return;

    const accountsWithMax = selectedAccountIds.map(accountId => {
      const account = platformAccounts.find(acc => acc.id === accountId);
      if (!account) return null;
      return { accountId, maxBet: calculateMaxBetSize(account) };
    }).filter(item => item !== null) as { accountId: string; maxBet: number }[];

    if (accountsWithMax.length === 0) return;

    const basePerAccount = totalAmount / accountsWithMax.length;
    let remaining = totalAmount;
    const distribution = new Map<string, number>();

    // First pass: assign with noise (variation of ±15% from average)
    // Prioritize 2 significant digits
    accountsWithMax.forEach(({ accountId, maxBet }) => {
      const noiseFactor = 1 + (Math.random() - 0.5) * 0.3;
      let amt = basePerAccount * noiseFactor;
      amt = Math.min(amt, maxBet);
      amt = roundTo2SignificantDigits(amt); // Prioritize 2 sig digits
      amt = Math.max(amt, 0.01);
      distribution.set(accountId, amt);
      remaining -= amt;
    });

    // Second pass: distribute remaining with noise
    if (remaining > 0.01) {
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
          const noiseFactor = 1 + (Math.random() - 0.5) * 0.3;
          let canAdd = Math.min(perRemaining * noiseFactor, maxBet - currentAmount);
          canAdd = roundTo2SignificantDigits(canAdd); // Prioritize 2 sig digits
          if (canAdd > 0.01) {
            const newAmount = roundTo2SignificantDigits(currentAmount + canAdd); // Prioritize 2 sig digits
            distribution.set(accountId, Math.min(newAmount, maxBet));
            remaining -= (newAmount - currentAmount);
            distributed = true;
          }
        });

        if (!distributed) break;
      }
    }

    // Final pass: ensure total matches
    // Try to use 2 significant digits first, fall back to 3 if necessary
    const currentTotal = Array.from(distribution.values()).reduce((sum, val) => sum + val, 0);
    const difference = totalAmount - currentTotal;
    if (Math.abs(difference) > 0.01) {
      const lastAccountId = accountsWithMax[accountsWithMax.length - 1].accountId;
      const lastAmount = distribution.get(lastAccountId) || 0;
      
      // First try with 2 significant digits
      let adjusted = roundTo2SignificantDigits(lastAmount + difference);
      const maxBet = accountsWithMax[accountsWithMax.length - 1].maxBet;
      adjusted = Math.min(Math.max(adjusted, 0.01), maxBet);
      
      // Check if 2 sig digits achieves the target total (within tolerance)
      const newTotal = Array.from(distribution.entries()).reduce((sum, [id, val]) => {
        return sum + (id === lastAccountId ? adjusted : val);
      }, 0);
      
      // If 2 sig digits doesn't work well enough, allow 3 sig digits for this adjustment
      if (Math.abs(totalAmount - newTotal) > 0.01) {
        adjusted = roundTo3SignificantDigits(lastAmount + difference);
        adjusted = Math.min(Math.max(adjusted, 0.01), maxBet);
      }
      
      distribution.set(lastAccountId, adjusted);
    }

    setSelectedAccounts(distribution);
    setBetAmountInputs(prev => {
      const newMap = new Map(prev);
      distribution.forEach((amt, accountId) => {
        newMap.set(accountId, amt.toFixed(2));
      });
      return newMap;
    });
    setDistributionTotal('');
  };

  const handlePredefinedTotal = (amount: number) => {
    performDistribution(amount);
  };

  const handleDistribute = () => {
    const totalAmount = parseFloat(distributionTotal);
    performDistribution(totalAmount);
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
              const completionTime = Date.now();
              const timing = completionTime - b.startTime;
              
              // Stop the elapsed time interval for this account
              const interval = elapsedTimeIntervalsRef.current.get(bet.account.id);
              if (interval) {
                clearInterval(interval);
                elapsedTimeIntervalsRef.current.delete(bet.account.id);
              }
              
              // Failure rate: 20% failure, 80% success
              if (Math.random() > 0.2) {
                const updatedBet = { ...b, status: STATUS.SUCCEEDED, error: null, completionTime };
                
                // Update bet in history to "won" status with timing
                const betId = bet.betId || recentBetIdsRef.current.get(bet.account.id);
                if (betId) {
                  // Calculate payout based on odds
                  let payout = bet.amount;
                  if (odds.startsWith('+')) {
                    payout = bet.amount + (bet.amount * parseFloat(odds) / 100);
                  } else {
                    payout = bet.amount + (bet.amount * 100 / Math.abs(parseFloat(odds)));
                  }
                  
                  updateBet(betId, {
                    status: "won",
                    payout: Math.round(payout * 100) / 100,
                    timing: timing
                  });
                }
                
                return updatedBet;
              } else {
                const errorMessage = getRandomErrorMessage();
                const errorScreenshot = generateErrorScreenshot(errorMessage, bet.amount, bet.account.name);
                const updatedBet = { ...b, status: STATUS.FAILED, error: errorMessage, errorScreenshot: errorScreenshot, completionTime };
                
                // Update bet in history to "lost" status with error and timing
                const betId = bet.betId || recentBetIdsRef.current.get(bet.account.id);
                if (betId) {
                  updateBet(betId, {
                    status: "lost",
                    error: errorMessage,
                    errorScreenshot: errorScreenshot,
                    timing: timing
                  });
                }
                
                return updatedBet;
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
    
    // Create sent bets array and add all bets to history immediately
    const newSentBets: SentBet[] = [];
    const matchName = formatMatchName();
    const betType = formatBetType();
    const platformName = platformNames[platformId] || platform;
    recentBetIdsRef.current.clear(); // Clear previous tracking
    
    const sendTime = Date.now();
    selectedAccounts.forEach((amount, accountId) => {
      const account = platformAccounts.find(acc => acc.id === accountId);
      if (account && amount > 0) {
        // Add bet to history immediately with "pending" status
        addBet({
          match: matchName,
          type: betType,
          odds: odds,
          stake: amount,
          status: "pending",
          platform: platformName,
          accountName: account.name,
          league: match?.league,
          awayTeam: match?.awayTeam,
          homeTeam: match?.homeTeam,
        });
        
        // Store sent bet with start time - we'll find the bet ID after state updates
        newSentBets.push({
          account: account,
          amount: amount,
          status: STATUS.SENT,
          error: null,
          startTime: sendTime
        });
      }
    });
    
    setSentBets(newSentBets);
    setViewMode('after');
    
    // Find bet IDs after a short delay to allow state to update
    setTimeout(() => {
      // Use ref to get latest bets (avoid stale closure)
      const latestBets = betsRef.current;
      const updatedSentBets = newSentBets.map(sentBet => {
        // Find the most recent pending bet matching this account and criteria
        const matchingBets = latestBets.filter(b => 
          b.accountName === sentBet.account.name &&
          b.match === matchName &&
          b.type === betType &&
          b.odds === odds &&
          b.platform === platformName &&
          Math.abs(b.stake - sentBet.amount) < 0.01 && // Account for floating point
          b.status === "pending"
        );
        // Get the most recent one (highest timestamp)
        const foundBet = matchingBets.sort((a, b) => b.timestamp - a.timestamp)[0];
        
        if (foundBet) {
          recentBetIdsRef.current.set(sentBet.account.id, foundBet.id);
        }
        
        return {
          ...sentBet,
          betId: foundBet?.id
        };
      });
      
      setSentBets(updatedSentBets);
      
      // Now simulate status updates with the correct bet IDs
      simulateBetStatusUpdates(updatedSentBets);
    }, 200);
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
    
    // Don't reset sentBets or viewMode if there are sent bets - keep after-bet view
    // Only reset selection and inputs for new bets
    setSelectedAccounts(new Map());
    setBetAmountInputs(new Map());
    setDistributionTotal('');
    // Keep sentBets and viewMode to preserve after-bet view
    onClose();
  };


  // Reset state when dialog opens or key props change
  useEffect(() => {
    if (isOpen) {
      // Reset state when dialog opens
      setSentBets([]);
      setViewMode('before');
      recentBetIdsRef.current.clear();
      // Clear any existing timeouts
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      timeoutRefs.current = [];
      // Clear all elapsed time intervals
      elapsedTimeIntervalsRef.current.forEach(interval => clearInterval(interval));
      elapsedTimeIntervalsRef.current.clear();
      
      // Default to select all accounts (excluding offline accounts)
      const allAccountsMap = new Map<string, number>();
      const allInputsMap = new Map<string, string>();
      platformAccounts.forEach(account => {
        // Only select accounts that are not offline
        if (!account.phoneOffline) {
          allAccountsMap.set(account.id, 0);
          allInputsMap.set(account.id, '');
        }
      });
      setSelectedAccounts(allAccountsMap);
      setBetAmountInputs(allInputsMap);
      setDistributionTotal('');
      
      // Reload predefined totals from localStorage when dialog opens
      setPredefinedTotals(loadPredefinedTotals());
      
      // Auto-focus distribution input after a short delay to ensure dialog is rendered
      setTimeout(() => {
        distributionInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, match?.id, platform, market, side, odds, platformAccounts]);

  // Handle ESC key to close dialog
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup timeouts and intervals on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      elapsedTimeIntervalsRef.current.forEach(interval => clearInterval(interval));
      elapsedTimeIntervalsRef.current.clear();
    };
  }, []);

  // Update elapsed time per account when in after-bet view
  useEffect(() => {
    if (viewMode === 'after' && sentBets.length > 0) {
      // Start intervals for all bets that haven't completed
      sentBets.forEach(bet => {
        if (bet.status !== STATUS.SUCCEEDED && bet.status !== STATUS.FAILED) {
          // Only start if not already running
          if (!elapsedTimeIntervalsRef.current.has(bet.account.id)) {
            const interval = setInterval(() => {
              setSentBets(prev => prev.map(b => {
                if (b.account.id === bet.account.id && b.status !== STATUS.SUCCEEDED && b.status !== STATUS.FAILED) {
                  // Force re-render to update elapsed time display
                  return { ...b };
                }
                return b;
              }));
            }, 100);
            elapsedTimeIntervalsRef.current.set(bet.account.id, interval);
          }
        }
      });
      
      return () => {
        elapsedTimeIntervalsRef.current.forEach(interval => clearInterval(interval));
        elapsedTimeIntervalsRef.current.clear();
      };
    } else {
      elapsedTimeIntervalsRef.current.forEach(interval => clearInterval(interval));
      elapsedTimeIntervalsRef.current.clear();
    }
  }, [viewMode, sentBets]);

  // Auto-close after-bet view 3 seconds after all bets are sent and successful
  useEffect(() => {
    if (viewMode === 'after' && sentBets.length > 0) {
      // Check if all bets are done (either SUCCEEDED or FAILED)
      const allDone = sentBets.every(bet => 
        bet.status === STATUS.SUCCEEDED || bet.status === STATUS.FAILED
      );
      
      // Check if all bets succeeded
      const allSucceeded = sentBets.every(bet => bet.status === STATUS.SUCCEEDED);
      
      if (allDone && allSucceeded) {
        const closeTimeout = setTimeout(() => {
          handleClose();
        }, 3000);
        timeoutRefs.current.push(closeTimeout);
        
        return () => {
          clearTimeout(closeTimeout);
        };
      }
    }
  }, [viewMode, sentBets, handleClose]);

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
            disabled={account.phoneOffline}
            className="w-4 h-4"
          />
          <Input
            type="text"
            inputMode="decimal"
            id={`bet-input-${account.id}`}
            value={betAmountInputs.get(account.id) || ''}
            onChange={(e) => {
              // Only allow numbers, decimal point, and empty string
              const value = e.target.value;
              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                handleBetAmountChange(account.id, value);
              }
            }}
            onBlur={() => handleBetAmountBlur(account.id)}
            disabled={!isSelected || account.phoneOffline}
            placeholder={`Max: $${maxBet.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            className="flex-1 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
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
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">
              {viewMode === 'after' ? 'Bet Status' : 'Place Bet'}
            </h2>
          </div>
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
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-[hsl(var(--border))]">
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
                    ref={distributionInputRef}
                    id="distribution-total"
                    type="number"
                    step="0.01"
                    min="0"
                    value={distributionTotal}
                    onChange={(e) => setDistributionTotal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        handleDistribute();
                      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        handleDistribute();
                        // Small delay to ensure distribution completes before sending
                        setTimeout(() => {
                          handleSendAllBets();
                        }, 50);
                      }
                    }}
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
                
                {/* Predefined Total Buttons */}
                <div className="flex items-center gap-2 flex-wrap mt-3">
                  <span className="text-xs text-muted-foreground">Quick amounts:</span>
                  {predefinedTotals.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handlePredefinedTotal(amount)}
                      className="px-3 py-1.5 text-xs font-medium bg-[hsl(var(--muted))] text-foreground rounded-md hover:bg-[hsl(var(--muted))]/80 transition-all border border-[hsl(var(--border))]"
                    >
                      ${amount.toLocaleString()}
                    </button>
                  ))}
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
                  // Calculate elapsed time: use completionTime if available, otherwise current time
                  const elapsedTime = bet.completionTime 
                    ? bet.completionTime - bet.startTime
                    : Date.now() - bet.startTime;
                  
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

                      <div className={cn("flex items-center gap-2 mb-2", getStatusColor(bet.status))}>
                        <span className="text-xl font-bold">{getStatusIcon(bet.status)}</span>
                        <span className="text-sm font-medium">{getStatusText(bet.status)}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Time:</span>
                        <span className="font-mono font-semibold">
                          {(elapsedTime / 1000).toFixed(2)}s
                        </span>
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
