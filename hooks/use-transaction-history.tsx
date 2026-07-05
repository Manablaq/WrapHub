"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_CHAIN_ID } from "@/lib/networks/supported-networks";

const STORAGE_KEY = "wraphub.transactionHistory";

export type TransactionAction =
  | "faucet"
  | "approve"
  | "wrap"
  | "unwrap-request"
  | "unwrap-finalize";

export type TrackedTransaction = {
  hash: `0x${string}`;
  chainId: number;
  action: TransactionAction;
  symbol: string;
  status: "submitted" | "confirmed";
  createdAt: number;
  updatedAt: number;
};

type TransactionHistoryContextValue = {
  transactions: TrackedTransaction[];
  trackTransaction: (tx: Omit<TrackedTransaction, "createdAt" | "updatedAt">) => void;
  updateTransactionStatus: (
    hash: `0x${string}`,
    status: TrackedTransaction["status"],
    chainId?: number,
  ) => void;
  clearTransactions: () => void;
};

const TransactionHistoryContext = createContext<TransactionHistoryContextValue | null>(null);

function readStoredTransactions() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? (JSON.parse(stored) as Array<Partial<TrackedTransaction>>) : [];

    return parsed.map((transaction) => ({
      ...transaction,
      chainId: transaction.chainId ?? DEFAULT_CHAIN_ID,
    })) as TrackedTransaction[];
  } catch {
    return [];
  }
}

export function TransactionHistoryProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<TrackedTransaction[]>([]);

  useEffect(() => {
    setTransactions(readStoredTransactions());
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const trackTransaction = useCallback(
    (tx: Omit<TrackedTransaction, "createdAt" | "updatedAt">) => {
      setTransactions((current) => {
        const now = Date.now();
        const existing = current.find((item) => item.hash === tx.hash && item.chainId === tx.chainId);

        if (existing) {
          return current.map((item) =>
            item.hash === tx.hash && item.chainId === tx.chainId
              ? { ...item, ...tx, updatedAt: now }
              : item,
          );
        }

        return [{ ...tx, createdAt: now, updatedAt: now }, ...current].slice(0, 30);
      });
    },
    [],
  );

  const updateTransactionStatus = useCallback(
    (hash: `0x${string}`, status: TrackedTransaction["status"], chainId?: number) => {
      setTransactions((current) =>
        current.map((item) =>
          item.hash === hash && (chainId === undefined || item.chainId === chainId)
            ? { ...item, status, updatedAt: Date.now() }
            : item,
        ),
      );
    },
    [],
  );

  const clearTransactions = useCallback(() => setTransactions([]), []);

  const value = useMemo(
    () => ({ transactions, trackTransaction, updateTransactionStatus, clearTransactions }),
    [clearTransactions, trackTransaction, transactions, updateTransactionStatus],
  );

  return (
    <TransactionHistoryContext.Provider value={value}>
      {children}
    </TransactionHistoryContext.Provider>
  );
}

export function useTransactionHistory() {
  const value = useContext(TransactionHistoryContext);

  if (!value) {
    throw new Error("useTransactionHistory must be used within TransactionHistoryProvider");
  }

  return value;
}
