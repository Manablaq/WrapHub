"use client";

import { RefreshCcw, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PairCard } from "@/components/registry/pair-card";
import { RegistryHealth } from "@/components/registry/registry-health";
import { Reveal } from "@/components/ui/reveal";
import {
  filterRegistryPairs,
  registryFilters,
  type RegistryFilter,
} from "@/lib/registry/filters";
import { useRegistryPairs } from "@/hooks/use-registry-pairs";
import { useWatchlist } from "@/hooks/use-watchlist";
import type { EnrichedRegistryPair } from "@/lib/registry/types";

function sortPairsForDisplay(pairs: EnrichedRegistryPair[]) {
  return [...pairs].sort((a, b) => {
    const aScore =
      (a.classification === "known-official" ? 0 : a.classification === "registry-unknown" ? 3 : 5) +
      (a.validity === "valid" ? 0 : a.validity === "validation-unavailable" ? 2 : 4);
    const bScore =
      (b.classification === "known-official" ? 0 : b.classification === "registry-unknown" ? 3 : 5) +
      (b.validity === "valid" ? 0 : b.validity === "validation-unavailable" ? 2 : 4);

    if (aScore !== bScore) {
      return aScore - bScore;
    }

    return a.displaySymbol.localeCompare(b.displaySymbol);
  });
}

export function RegistryExplorer() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<RegistryFilter>("all");
  const {
    pairs,
    health,
    isLoading,
    isRegistryLoading,
    isValidityLoading,
    error,
    refetch,
    activeNetwork,
    isUnsupportedNetwork,
  } = useRegistryPairs();
  const { watchedPairIds } = useWatchlist(activeNetwork.chainId);
  const visibleFilters = useMemo(
    () =>
      activeNetwork.supportsPublicFaucet
        ? registryFilters
        : registryFilters.filter((item) => item.id !== "faucet"),
    [activeNetwork.supportsPublicFaucet],
  );

  const filteredPairs = useMemo(
    () => sortPairsForDisplay(filterRegistryPairs(pairs, filter, search, watchedPairIds)),
    [filter, pairs, search, watchedPairIds],
  );

  useEffect(() => {
    if (!activeNetwork.supportsPublicFaucet && filter === "faucet") {
      setFilter("all");
    }
  }, [activeNetwork.supportsPublicFaucet, filter]);

  return (
    <section className="registry-section" id="registry-explorer">
      <div className="section-header">
        <div>
          <span className="section-kicker">Registry Console</span>
          <h2>Official wrapper pairs, ready for action</h2>
          <p>
            Browse every pair returned by the active official registry. Known metadata enriches
            labels and faucet access while the live registry remains the source of truth.
          </p>
          {activeNetwork.environment === "mainnet" ? (
            <span className="real-asset-pill">Real Asset Mode</span>
          ) : null}
          {activeNetwork.environment === "mainnet" ? (
            <p className="mainnet-safety-copy">
              Ethereum Mainnet uses real assets. Verify token addresses and amounts before
              approving, wrapping, or unwrapping.
            </p>
          ) : null}
          {isUnsupportedNetwork ? (
            <p className="mainnet-safety-copy">
              Switch to Sepolia or Ethereum Mainnet to transact. The console is showing Sepolia by
              default.
            </p>
          ) : null}
        </div>
        <div className="registry-address">
          {activeNetwork.name} registry
          <code>{activeNetwork.registryAddress}</code>
        </div>
      </div>

      <Reveal>
        <RegistryHealth health={health} activeNetwork={activeNetwork} />
      </Reveal>

      <div className="toolbar">
        <label className="search-box">
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search symbol, name, address, status"
          />
        </label>
        <button className="button secondary" type="button" onClick={() => refetch()}>
          <RefreshCcw size={16} />
          {isLoading ? "Reading" : "Refresh"}
        </button>
      </div>

      <div className="filter-tabs" role="tablist" aria-label="Registry filters">
        {visibleFilters.map((item) => (
          <button
            className={item.id === filter ? "active" : undefined}
            key={item.id}
            onClick={() => setFilter(item.id)}
            role="tab"
            aria-selected={item.id === filter}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="error-panel">
          <strong>
            Registry read failed on {activeNetwork.name}. Check RPC connectivity and refresh.
          </strong>
          <details>
            <summary>Error details</summary>
            <span>{error.message.split("\n")[0]}</span>
          </details>
        </div>
      ) : null}

      {!error && isRegistryLoading ? (
        <div className="empty-state">Loading official {activeNetwork.name} registry pairs...</div>
      ) : null}

      {!error && !isRegistryLoading && filteredPairs.length === 0 ? (
        <div className="empty-state">No registry pairs match the current filters.</div>
      ) : null}

      <div className="pair-grid" aria-busy={isValidityLoading}>
        {filteredPairs.map((pair) => (
          <Reveal className="pair-reveal" key={pair.id}>
            <PairCard pair={pair} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
