"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "wraphub.watchlist";
const WATCHLIST_EVENT = "wraphub.watchlistChanged";

function readWatchlist() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [];
  }
}

function writeWatchlist(ids: readonly string[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event(WATCHLIST_EVENT));
}

export function useWatchlist() {
  const [watchedPairIds, setWatchedPairIds] = useState<string[]>([]);

  useEffect(() => {
    setWatchedPairIds(readWatchlist());

    const handleChange = () => setWatchedPairIds(readWatchlist());
    window.addEventListener("storage", handleChange);
    window.addEventListener(WATCHLIST_EVENT, handleChange);

    return () => {
      window.removeEventListener("storage", handleChange);
      window.removeEventListener(WATCHLIST_EVENT, handleChange);
    };
  }, []);

  const watchedSet = useMemo(() => new Set(watchedPairIds), [watchedPairIds]);

  const isWatched = useCallback((pairId: string) => watchedSet.has(pairId), [watchedSet]);

  const toggleWatched = useCallback((pairId: string) => {
    const current = readWatchlist();
    const next = current.includes(pairId)
      ? current.filter((item) => item !== pairId)
      : [pairId, ...current];
    writeWatchlist(next);
    setWatchedPairIds(next);
  }, []);

  return {
    watchedPairIds,
    watchedCount: watchedPairIds.length,
    isWatched,
    toggleWatched,
  };
}
