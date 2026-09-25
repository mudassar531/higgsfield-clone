"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type AccountUser = { email: string; credits: number };

type AccountValue = {
  user: AccountUser | null;
  ready: boolean;
  setCredits: (credits: number) => void;
};

const AccountContext = createContext<AccountValue | null>(null);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    function load() {
      fetch("/api/me")
        .then((r) => r.json())
        .then((d) => {
          if (cancelled) return;
          setUser(d.user ? { email: d.user.email, credits: d.user.credits } : null);
        })
        .finally(() => {
          if (!cancelled) setReady(true);
        });
    }
    load();
    window.addEventListener("nova:refresh-me", load);
    return () => {
      cancelled = true;
      window.removeEventListener("nova:refresh-me", load);
    };
  }, []);

  return (
    <AccountContext.Provider
      value={{
        user,
        ready,
        setCredits: (credits) => setUser((current) => (current ? { ...current, credits } : current)),
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const value = useContext(AccountContext);
  if (!value) throw new Error("useAccount requires AccountProvider");
  return value;
}
