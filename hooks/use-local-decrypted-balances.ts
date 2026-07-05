"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Address } from "viem";

const STORAGE_KEY = "wraphub.decryptedBalances.session";
const DECRYPTED_BALANCE_EVENT = "wraphub.decryptedBalanceChanged";

export type LocalDecryptedBalance = {
  accountAddress: Address;
  wrapperAddress: Address;
  value: string;
  decimals: number;
  updatedAt: number;
};

function entryKey(accountAddress: Address, wrapperAddress: Address) {
  return `${accountAddress.toLowerCase()}:${wrapperAddress.toLowerCase()}`;
}

function readEntries() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as Record<string, LocalDecryptedBalance>) : {};
  } catch {
    return {};
  }
}

function writeEntries(entries: Record<string, LocalDecryptedBalance>) {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  window.dispatchEvent(new Event(DECRYPTED_BALANCE_EVENT));
}

export function recordLocalDecryptedBalance(entry: Omit<LocalDecryptedBalance, "updatedAt">) {
  if (typeof window === "undefined") {
    return;
  }

  const entries = readEntries();
  entries[entryKey(entry.accountAddress, entry.wrapperAddress)] = {
    ...entry,
    updatedAt: Date.now(),
  };
  writeEntries(entries);
}

export function clearLocalDecryptedBalance(accountAddress: Address, wrapperAddress: Address) {
  if (typeof window === "undefined") {
    return;
  }

  const entries = readEntries();
  delete entries[entryKey(accountAddress, wrapperAddress)];
  writeEntries(entries);
}

export function useLocalDecryptedBalance(accountAddress?: Address, wrapperAddress?: Address) {
  const [entries, setEntries] = useState<Record<string, LocalDecryptedBalance>>({});

  useEffect(() => {
    setEntries(readEntries());

    const handleChange = () => setEntries(readEntries());
    window.addEventListener("storage", handleChange);
    window.addEventListener(DECRYPTED_BALANCE_EVENT, handleChange);

    return () => {
      window.removeEventListener("storage", handleChange);
      window.removeEventListener(DECRYPTED_BALANCE_EVENT, handleChange);
    };
  }, []);

  const balance = useMemo(() => {
    if (!accountAddress || !wrapperAddress) {
      return null;
    }

    return entries[entryKey(accountAddress, wrapperAddress)] ?? null;
  }, [accountAddress, entries, wrapperAddress]);

  const clearAccountBalances = useCallback((account: Address) => {
    const current = readEntries();
    const accountPrefix = `${account.toLowerCase()}:`;
    const next = Object.fromEntries(
      Object.entries(current).filter(([key]) => !key.startsWith(accountPrefix)),
    );
    writeEntries(next);
    setEntries(next);
  }, []);

  return {
    balance,
    entries,
    clearAccountBalances,
  };
}
