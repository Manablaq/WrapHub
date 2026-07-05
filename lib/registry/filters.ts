import type { EnrichedRegistryPair } from "./types";

export type RegistryFilter =
  | "all"
  | "watched"
  | "valid"
  | "faucet"
  | "restricted"
  | "unknown-revoked";

export const registryFilters: Array<{ id: RegistryFilter; label: string }> = [
  { id: "all", label: "All pairs" },
  { id: "watched", label: "Watched" },
  { id: "valid", label: "Valid only" },
  { id: "faucet", label: "Public mock faucet" },
  { id: "restricted", label: "Restricted mint" },
  { id: "unknown-revoked", label: "Unknown / System" },
];

export function filterRegistryPairs(
  pairs: readonly EnrichedRegistryPair[],
  filter: RegistryFilter,
  search: string,
  watchedPairIds: readonly string[] = [],
) {
  const normalizedSearch = search.trim().toLowerCase();
  const watchedSet = new Set(watchedPairIds);

  return pairs.filter((pair) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "watched" && watchedSet.has(pair.id)) ||
      (filter === "valid" && pair.validity === "valid") ||
      (filter === "faucet" && pair.hasPublicFaucet) ||
      (filter === "restricted" && pair.mintAccess === "restricted") ||
      (filter === "unknown-revoked" &&
        (pair.validity !== "valid" || pair.classification !== "known-official"));

    if (!matchesFilter) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    return [
      pair.symbol,
      pair.name,
      pair.displaySymbol,
      pair.displayName,
      pair.wrapperSymbol,
      pair.wrapperName,
      pair.underlyingSymbol,
      pair.underlyingName,
      pair.wrapperAddress,
      pair.underlyingAddress,
      pair.validity,
      pair.mintAccess,
      pair.classification,
      pair.metadataSource,
      pair.validationSource,
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalizedSearch);
  });
}
