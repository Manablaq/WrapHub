"use client";

import { RefreshCcw, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { DeveloperPanel } from "@/components/registry/developer-panel";
import { GuidedWorkflow } from "@/components/registry/guided-workflow";
import { PairCard } from "@/components/registry/pair-card";
import { RegistryHealth } from "@/components/registry/registry-health";
import { TransactionTimeline } from "@/components/registry/transaction-timeline";
import { Reveal } from "@/components/ui/reveal";
import { OFFICIAL_REGISTRY_ADDRESS } from "@/lib/contracts/registry";
import {
  filterRegistryPairs,
  registryFilters,
  type RegistryFilter,
} from "@/lib/registry/filters";
import { useRegistryPairs } from "@/hooks/use-registry-pairs";
import type { EnrichedRegistryPair } from "@/lib/registry/types";

function sortPairsForReview(pairs: EnrichedRegistryPair[]) {
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

    return a.symbol.localeCompare(b.symbol);
  });
}

export function RegistryExplorer() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<RegistryFilter>("all");
  const { pairs, health, isLoading, isRegistryLoading, isValidityLoading, error, refetch } =
    useRegistryPairs();

  const filteredPairs = useMemo(
    () => sortPairsForReview(filterRegistryPairs(pairs, filter, search)),
    [filter, pairs, search],
  );

  return (
    <section className="registry-section" id="registry-explorer">
      <div className="section-header">
        <div>
          <span className="section-kicker">Registry Console</span>
          <h2>Official wrapper pairs, ready for action</h2>
          <p>
            Browse every pair returned by the official Sepolia registry. Known metadata enriches
            labels and faucet access while the live registry remains the source of truth.
          </p>
        </div>
        <div className="registry-address">
          Official registry
          <code>{OFFICIAL_REGISTRY_ADDRESS}</code>
        </div>
      </div>

      <Reveal>
        <GuidedWorkflow />
      </Reveal>
      <Reveal>
        <TransactionTimeline />
      </Reveal>
      <Reveal>
        <RegistryHealth health={health} />
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
        {registryFilters.map((item) => (
          <button
            className={item.id === filter ? "active" : undefined}
            key={item.id}
            onClick={() => setFilter(item.id)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="error-panel">
          Registry read failed: {error.message}. Confirm your wallet or RPC can read Sepolia, then
          refresh the console.
        </div>
      ) : null}

      {!error && isRegistryLoading ? (
        <div className="empty-state">Loading official Sepolia registry pairs...</div>
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

      <Reveal>
        <DeveloperPanel />
      </Reveal>
    </section>
  );
}
