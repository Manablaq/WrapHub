"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Address } from "viem";

const STORAGE_KEY = "wraphub.decryptedBalances.session";
const DECRYPTED_BALANCE_EVENT = "wraphub.decryptedBalanceChanged";

export type LocalDecryptedBalance = {
  chainId: number;
  accountAddress: Address;
  wrapperAddress: Address;
  value: string;
  decimals: number;
  updatedAt: number;
};

function entryKey(chainId: number, accountAddress: Address, wrapperAddress: Address) {
  return `${chainId}:${accountAddress.toLowerCase()}:${wrapperAddress.toLowerCase()}`;
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
  entries[entryKey(entry.chainId, entry.accountAddress, entry.wrapperAddress)] = {
    ...entry,
    updatedAt: Date.now(),
  };
  writeEntries(entries);
}

export function clearLocalDecryptedBalance(
  chainId: number,
  accountAddress: Address,
  wrapperAddress: Address,
) {
  if (typeof window === "undefined") {
    return;
  }

  const entries = readEntries();
  delete entries[entryKey(chainId, accountAddress, wrapperAddress)];
  writeEntries(entries);
}

export function useLocalDecryptedBalance(
  chainId?: number,
  accountAddress?: Address,
  wrapperAddress?: Address,
) {
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
    if (!chainId || !accountAddress || !wrapperAddress) {
      return null;
    }

    return entries[entryKey(chainId, accountAddress, wrapperAddress)] ?? null;
  }, [accountAddress, chainId, entries, wrapperAddress]);

  const clearAccountBalances = useCallback((account: Address) => {
    const current = readEntries();
    const accountNeedle = `:${account.toLowerCase()}:`;
    const next = Object.fromEntries(
      Object.entries(current).filter(([key]) => !key.includes(accountNeedle)),
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
