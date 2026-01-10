import { createContext, useContext, useState, ReactNode } from "react";
import { Account, accountData } from "@/pages/Accounts";

interface AccountsContextType {
  accounts: Record<string, Account[]>;
  setAccounts: React.Dispatch<React.SetStateAction<Record<string, Account[]>>>;
  updateAccount: (platformId: string, accountId: string, updatedAccount: Account) => void;
}

const AccountsContext = createContext<AccountsContextType | undefined>(undefined);

export function AccountsProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Record<string, Account[]>>(accountData);

  const updateAccount = (platformId: string, accountId: string, updatedAccount: Account) => {
    setAccounts(prev => ({
      ...prev,
      [platformId]: prev[platformId].map(acc => 
        acc.id === accountId ? updatedAccount : acc
      )
    }));
  };

  return (
    <AccountsContext.Provider value={{ accounts, setAccounts, updateAccount }}>
      {children}
    </AccountsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAccounts() {
  const context = useContext(AccountsContext);
  if (context === undefined) {
    throw new Error("useAccounts must be used within an AccountsProvider");
  }
  return context;
}
