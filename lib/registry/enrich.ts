import type { Address } from "viem";
import { resolveKnownPairFromRegistryAddresses } from "@/lib/tokens/known-pairs";
import type {
  EnrichedRegistryPair,
  PairClassification,
  PairValidity,
  RegistryHealth,
  RegistryValidationSource,
} from "./types";

export function pairId(underlyingAddress: Address, wrapperAddress: Address) {
  return `${underlyingAddress.toLowerCase()}-${wrapperAddress.toLowerCase()}`;
}

const SYSTEM_SENTINELS = new Set([
  "0x0000000000000000000000000000000000000000",
  "0x0000000000000000000000000000000000000001",
]);

export type RegistryValidationInput =
  | { status: "success"; isValid: boolean; source?: RegistryValidationSource }
  | { status: "unavailable" }
  | { status: "failed"; error?: string };

export type RawRegistryPairLike = {
  tokenAddress?: Address;
  confidentialTokenAddress?: Address;
  token?: Address;
  confidentialToken?: Address;
  isValid?: boolean;
};

function isSystemAddress(address: Address) {
  return SYSTEM_SENTINELS.has(address.toLowerCase());
}

function getValidity(validation: RegistryValidationInput): {
  isValid: boolean | null;
  validity: PairValidity;
  validationSource: RegistryValidationSource;
  validationError?: string;
} {
  if (validation.status === "success") {
    return {
      isValid: validation.isValid,
      validity: validation.isValid ? "valid" : "revoked",
      validationSource: validation.source ?? "registry-list",
    };
  }

  if (validation.status === "failed") {
    return {
      isValid: null,
      validity: "validation-read-failed",
      validationSource: "read-failed",
      validationError: validation.error,
    };
  }

  return {
    isValid: null,
    validity: "validation-unavailable",
    validationSource: "unavailable",
  };
}

export function enrichRegistryPair(
  rawPair: RawRegistryPairLike,
  validation: RegistryValidationInput,
): EnrichedRegistryPair {
  const registryTokenAddress = (rawPair.tokenAddress ?? rawPair.token) as Address;
  const registryConfidentialTokenAddress = (rawPair.confidentialTokenAddress ??
    rawPair.confidentialToken) as Address;
  const resolution = resolveKnownPairFromRegistryAddresses(
    registryTokenAddress,
    registryConfidentialTokenAddress,
  );
  const { metadata, underlyingAddress, wrapperAddress, wasReturnedReversed } = resolution;
  const systemPair = isSystemAddress(registryTokenAddress) || isSystemAddress(registryConfidentialTokenAddress);
  const validity = getValidity(validation);
  const classification: PairClassification = systemPair
    ? "system"
    : metadata
      ? "known-official"
      : "registry-unknown";

  return {
    id: pairId(underlyingAddress, wrapperAddress),
    registryTokenAddress,
    registryConfidentialTokenAddress,
    underlyingAddress,
    wrapperAddress,
    isValid: validity.isValid,
    validity: validity.validity,
    validationSource: validity.validationSource,
    validationError: validity.validationError,
    metadata,
    metadataStatus: metadata ? "known-official" : "unknown",
    classification,
    wasReturnedReversed,
    isSystemPair: systemPair,
    symbol: metadata?.symbol ?? (systemPair ? "System pair" : "Unknown ERC-7984"),
    name: metadata?.name ?? (systemPair ? "Registry placeholder or system entry" : "Registry pair without local metadata"),
    hasPublicFaucet: metadata?.hasPublicFaucet ?? false,
    mintAccess: metadata?.mintAccess ?? "unknown",
  };
}

export function getRegistryHealth(pairs: readonly EnrichedRegistryPair[]): RegistryHealth {
  return {
    totalPairs: pairs.length,
    knownOfficialPairs: pairs.filter((pair) => pair.metadataStatus === "known-official").length,
    validPairs: pairs.filter((pair) => pair.validity === "valid").length,
    revokedPairs: pairs.filter((pair) => pair.validity === "revoked").length,
    validationUnknownPairs: pairs.filter((pair) => pair.validity === "validation-unavailable").length,
    validationReadFailedPairs: pairs.filter((pair) => pair.validity === "validation-read-failed").length,
    publicFaucetPairs: pairs.filter((pair) => pair.hasPublicFaucet).length,
    restrictedMintPairs: pairs.filter((pair) => pair.mintAccess === "restricted").length,
    unknownPairs: pairs.filter((pair) => pair.classification === "registry-unknown").length,
    systemPairs: pairs.filter((pair) => pair.classification === "system").length,
    unknownSystemPairs: pairs.filter(
      (pair) => pair.classification === "registry-unknown" || pair.classification === "system",
    ).length,
  };
}
