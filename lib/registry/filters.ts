import type { EnrichedRegistryPair } from "./types";

export type RegistryFilter = "all" | "valid" | "faucet" | "restricted" | "unknown-revoked";

export const registryFilters: Array<{ id: RegistryFilter; label: string }> = [
  { id: "all", label: "All pairs" },
  { id: "valid", label: "Valid only" },
  { id: "faucet", label: "Faucet-supported" },
  { id: "restricted", label: "Restricted" },
  { id: "unknown-revoked", label: "Unknown / revoked" },
];

export function filterRegistryPairs(
  pairs: readonly EnrichedRegistryPair[],
  filter: RegistryFilter,
  search: string,
) {
  const normalizedSearch = search.trim().toLowerCase();

  return pairs.filter((pair) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "valid" && pair.validity === "valid") ||
      (filter === "faucet" && pair.hasPublicFaucet) ||
      (filter === "restricted" && pair.mintAccess === "restricted") ||
      (filter === "unknown-revoked" &&
        (pair.validity !== "valid" || pair.metadataStatus === "unknown"));

    if (!matchesFilter) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    return [
      pair.symbol,
      pair.name,
      pair.wrapperAddress,
      pair.underlyingAddress,
      pair.validity,
      pair.mintAccess,
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalizedSearch);
  });
}
