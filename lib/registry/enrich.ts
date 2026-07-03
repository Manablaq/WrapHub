import type { Address } from "viem";
import { getKnownPair } from "@/lib/tokens/known-pairs";
import type { EnrichedRegistryPair, RegistryHealth } from "./types";

export function pairId(underlyingAddress: Address, wrapperAddress: Address) {
  return `${underlyingAddress.toLowerCase()}-${wrapperAddress.toLowerCase()}`;
}

export function enrichRegistryPair(
  underlyingAddress: Address,
  wrapperAddress: Address,
  isValid: boolean | null,
): EnrichedRegistryPair {
  const metadata = getKnownPair(underlyingAddress, wrapperAddress) ?? null;
  const validity = isValid === null ? "unknown" : isValid ? "valid" : "revoked";

  return {
    id: pairId(underlyingAddress, wrapperAddress),
    underlyingAddress,
    wrapperAddress,
    isValid,
    validity,
    metadata,
    metadataStatus: metadata ? "known" : "unknown",
    symbol: metadata?.symbol ?? "Unknown ERC-7984",
    name: metadata?.name ?? "Registry pair without local metadata",
    hasPublicFaucet: metadata?.hasPublicFaucet ?? false,
    mintAccess: metadata?.mintAccess ?? "unknown",
  };
}

export function getRegistryHealth(pairs: readonly EnrichedRegistryPair[]): RegistryHealth {
  return {
    totalPairs: pairs.length,
    validPairs: pairs.filter((pair) => pair.validity === "valid").length,
    revokedPairs: pairs.filter((pair) => pair.validity === "revoked").length,
    unknownValidityPairs: pairs.filter((pair) => pair.validity === "unknown").length,
    publicFaucetPairs: pairs.filter((pair) => pair.hasPublicFaucet).length,
    restrictedPairs: pairs.filter((pair) => pair.mintAccess === "restricted").length,
    metadataKnownPairs: pairs.filter((pair) => pair.metadataStatus === "known").length,
    metadataUnknownPairs: pairs.filter((pair) => pair.metadataStatus === "unknown").length,
  };
}
