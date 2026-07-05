import type { Address } from "viem";
import { getNetworkOrDefault } from "@/lib/networks/supported-networks";
import { LOCAL_WRAPPER_PAIRS } from "@/lib/registry/local-pairs";
import type { LocalWrapperPairConfig } from "@/lib/registry/local-pairs";
import { resolveKnownPairFromRegistryAddresses } from "@/lib/tokens/known-pairs";
import type {
  EnrichedRegistryPair,
  OnchainTokenMetadata,
  PairClassification,
  PairMetadataSource,
  PairValidity,
  RegistryHealth,
  RegistryValidationSource,
} from "./types";

export function pairId(chainId: number, underlyingAddress: Address, wrapperAddress: Address) {
  return `${chainId}-${underlyingAddress.toLowerCase()}-${wrapperAddress.toLowerCase()}`;
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

function normalizePairKey(chainId: number, underlyingAddress: Address, wrapperAddress: Address) {
  return `${chainId}:${underlyingAddress.toLowerCase()}:${wrapperAddress.toLowerCase()}`;
}

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
  chainId: number,
): EnrichedRegistryPair {
  const network = getNetworkOrDefault(chainId);
  const registryTokenAddress = (rawPair.tokenAddress ?? rawPair.token) as Address;
  const registryConfidentialTokenAddress = (rawPair.confidentialTokenAddress ??
    rawPair.confidentialToken) as Address;
  const resolution = resolveKnownPairFromRegistryAddresses(
    registryTokenAddress,
    registryConfidentialTokenAddress,
    network.chainId,
  );
  const { metadata, underlyingAddress, wrapperAddress, wasReturnedReversed } = resolution;
  const systemPair = isSystemAddress(registryTokenAddress) || isSystemAddress(registryConfidentialTokenAddress);
  const validity = getValidity(validation);
  const classification: PairClassification = systemPair
    ? "system"
    : metadata
      ? "known-official"
      : "registry-unknown";
  const metadataSource: PairMetadataSource = metadata ? "known-official" : "unknown";
  const symbol = metadata?.symbol ?? (systemPair ? "System pair" : "Unknown ERC-7984");
  const name =
    metadata?.name ??
    (systemPair ? "Registry placeholder or system entry" : "Registry pair without metadata");

  return {
    id: pairId(network.chainId, underlyingAddress, wrapperAddress),
    chainId: network.chainId,
    networkName: network.name,
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
    metadataSource,
    classification,
    wasReturnedReversed,
    isSystemPair: systemPair,
    isLocalPair: false,
    symbol,
    name,
    wrapperSymbol: metadata?.symbol,
    wrapperName: metadata?.name,
    wrapperDecimals: undefined,
    underlyingSymbol: undefined,
    underlyingName: undefined,
    underlyingDecimals: undefined,
    displaySymbol: symbol,
    displayName: name,
    hasPublicFaucet: metadata?.hasPublicFaucet ?? false,
    mintAccess: metadata?.mintAccess ?? "unknown",
  };
}

function localPairToEnrichedPair(localPair: LocalWrapperPairConfig): EnrichedRegistryPair {
  const network = getNetworkOrDefault(localPair.chainId);

  return {
    id: pairId(network.chainId, localPair.underlyingAddress, localPair.wrapperAddress),
    chainId: network.chainId,
    networkName: network.name,
    registryTokenAddress: localPair.underlyingAddress,
    registryConfidentialTokenAddress: localPair.wrapperAddress,
    underlyingAddress: localPair.underlyingAddress,
    wrapperAddress: localPair.wrapperAddress,
    isValid: null,
    validity: "validation-unavailable",
    validationSource: "unavailable",
    metadata: null,
    metadataStatus: "local-config",
    metadataSource: "local-config",
    classification: "local-custom",
    wasReturnedReversed: false,
    isSystemPair: false,
    isLocalPair: true,
    localConfig: localPair,
    symbol: localPair.symbol,
    name: localPair.name,
    wrapperSymbol: localPair.symbol,
    wrapperName: localPair.name,
    wrapperDecimals: localPair.decimals,
    displaySymbol: localPair.symbol,
    displayName: localPair.name,
    hasPublicFaucet: localPair.hasPublicFaucet,
    mintAccess: localPair.mintAccess,
  };
}

export function mergeLocalRegistryPairs(
  officialPairs: readonly EnrichedRegistryPair[],
  chainId: number,
): EnrichedRegistryPair[] {
  if (LOCAL_WRAPPER_PAIRS.length === 0) {
    return [...officialPairs];
  }

  const network = getNetworkOrDefault(chainId);
  const merged = [...officialPairs];
  const officialPairIndex = new Map(
    officialPairs.map((pair, index) => [
      normalizePairKey(pair.chainId, pair.underlyingAddress, pair.wrapperAddress),
      index,
    ]),
  );

  for (const localPair of LOCAL_WRAPPER_PAIRS.filter((pair) => pair.chainId === network.chainId)) {
    const key = normalizePairKey(
      localPair.chainId,
      localPair.underlyingAddress,
      localPair.wrapperAddress,
    );
    const existingIndex = officialPairIndex.get(key);

    if (existingIndex === undefined) {
      merged.push(localPairToEnrichedPair(localPair));
      continue;
    }

    const existingPair = merged[existingIndex];
    if (!existingPair) {
      continue;
    }

    merged[existingIndex] = {
      ...existingPair,
      localConfig: localPair,
      symbol: existingPair.metadataStatus === "unknown" ? localPair.symbol : existingPair.symbol,
      name: existingPair.metadataStatus === "unknown" ? localPair.name : existingPair.name,
      wrapperSymbol:
        existingPair.metadataStatus === "unknown"
          ? localPair.symbol
          : existingPair.wrapperSymbol,
      wrapperName:
        existingPair.metadataStatus === "unknown" ? localPair.name : existingPair.wrapperName,
      wrapperDecimals:
        existingPair.metadataStatus === "unknown"
          ? localPair.decimals
          : existingPair.wrapperDecimals,
      displaySymbol:
        existingPair.metadataStatus === "unknown"
          ? localPair.symbol
          : existingPair.displaySymbol,
      displayName:
        existingPair.metadataStatus === "unknown" ? localPair.name : existingPair.displayName,
      hasPublicFaucet:
        existingPair.metadataStatus === "unknown"
          ? localPair.hasPublicFaucet
          : existingPair.hasPublicFaucet,
      mintAccess:
        existingPair.metadataStatus === "unknown" ? localPair.mintAccess : existingPair.mintAccess,
      metadataStatus:
        existingPair.metadataStatus === "unknown" ? "local-config" : existingPair.metadataStatus,
      metadataSource:
        existingPair.metadataStatus === "unknown" ? "local-config" : existingPair.metadataSource,
    };
  }

  return merged;
}

export function applyOnchainMetadata(
  pair: EnrichedRegistryPair,
  onchainMetadata: OnchainTokenMetadata,
): EnrichedRegistryPair {
  const hasOnchainMetadata = Boolean(
    onchainMetadata.wrapperSymbol ||
      onchainMetadata.wrapperName ||
      onchainMetadata.underlyingSymbol ||
      onchainMetadata.underlyingName ||
      onchainMetadata.wrapperDecimals !== undefined ||
      onchainMetadata.underlyingDecimals !== undefined,
  );

  if (!hasOnchainMetadata) {
    return pair;
  }

  if (pair.metadataSource === "known-official" || pair.metadataSource === "local-config") {
    return {
      ...pair,
      ...onchainMetadata,
    };
  }

  const displaySymbol =
    onchainMetadata.wrapperSymbol ?? onchainMetadata.underlyingSymbol ?? pair.displaySymbol;
  const displayName =
    onchainMetadata.wrapperName ?? onchainMetadata.underlyingName ?? pair.displayName;

  return {
    ...pair,
    ...onchainMetadata,
    symbol: displaySymbol,
    name: displayName,
    displaySymbol,
    displayName,
    metadataSource: "onchain-token-metadata",
  };
}

export function getRegistryHealth(pairs: readonly EnrichedRegistryPair[]): RegistryHealth {
  return {
    totalPairs: pairs.filter((pair) => !pair.isLocalPair).length,
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
    localConfigPairs: pairs.filter((pair) => pair.isLocalPair).length,
    metadataAvailablePairs: pairs.filter((pair) => pair.metadataSource !== "unknown").length,
    metadataUnavailablePairs: pairs.filter((pair) => pair.metadataSource === "unknown").length,
    noPublicFaucetPairs: pairs.filter((pair) => !pair.hasPublicFaucet).length,
    mainnetPairs: pairs.filter((pair) => pair.chainId === 1).length,
  };
}
