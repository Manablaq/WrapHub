import type { Address } from "viem";
import { enrichRegistryPair } from "@/lib/registry/enrich";
import { knownPairs, resolveKnownPairFromRegistryAddresses } from "@/lib/tokens/known-pairs";

const SYSTEM_SENTINEL = "0x0000000000000000000000000000000000000001" as const satisfies Address;
const UNKNOWN_ADDRESS = "0x6AB54988261AEC573a2CA13cF802d3B1114f864C" as const satisfies Address;
const UNKNOWN_WRAPPER = "0x13F7d34A4f0102734F19E3Ff16e068Fe194B28c4" as const satisfies Address;

export type MetadataCheckResult = {
  name: string;
  passed: boolean;
  detail: string;
};

export function runRegistryMetadataChecks(): MetadataCheckResult[] {
  const knownDirect = knownPairs.map((pair) => {
    const resolved = resolveKnownPairFromRegistryAddresses(
      pair.underlyingAddress,
      pair.wrapperAddress,
    );

    return {
      name: `metadata direct match: ${pair.symbol}`,
      passed:
        resolved.metadata?.symbol === pair.symbol &&
        resolved.underlyingAddress.toLowerCase() === pair.underlyingAddress.toLowerCase() &&
        resolved.wrapperAddress.toLowerCase() === pair.wrapperAddress.toLowerCase() &&
        !resolved.wasReturnedReversed,
      detail: `${pair.underlyingAddress} -> ${pair.wrapperAddress}`,
    };
  });

  const knownReversed = knownPairs.map((pair) => {
    const resolved = resolveKnownPairFromRegistryAddresses(
      pair.wrapperAddress,
      pair.underlyingAddress,
    );

    return {
      name: `metadata reversed match: ${pair.symbol}`,
      passed:
        resolved.metadata?.symbol === pair.symbol &&
        resolved.underlyingAddress.toLowerCase() === pair.underlyingAddress.toLowerCase() &&
        resolved.wrapperAddress.toLowerCase() === pair.wrapperAddress.toLowerCase() &&
        resolved.wasReturnedReversed,
      detail: `${pair.wrapperAddress} -> ${pair.underlyingAddress}`,
    };
  });

  const unknownPair = enrichRegistryPair(
    {
      tokenAddress: UNKNOWN_ADDRESS,
      confidentialTokenAddress: UNKNOWN_WRAPPER,
      isValid: true,
    },
    { status: "success", isValid: true, source: "registry-list" },
  );

  const systemPair = enrichRegistryPair(
    {
      tokenAddress: SYSTEM_SENTINEL,
      confidentialTokenAddress: UNKNOWN_WRAPPER,
      isValid: true,
    },
    { status: "success", isValid: true, source: "registry-list" },
  );

  return [
    ...knownDirect,
    ...knownReversed,
    {
      name: "unknown pair classification",
      passed: unknownPair.classification === "registry-unknown",
      detail: `${unknownPair.underlyingAddress} -> ${unknownPair.wrapperAddress}`,
    },
    {
      name: "system pair classification",
      passed: systemPair.classification === "system",
      detail: `${systemPair.underlyingAddress} -> ${systemPair.wrapperAddress}`,
    },
  ];
}
