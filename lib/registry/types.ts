import type { Address } from "viem";
import type { LocalWrapperPairConfig } from "@/lib/registry/local-pairs";
import type { KnownPairMetadata } from "@/lib/tokens/known-pairs";

export type PairValidity =
  | "valid"
  | "revoked"
  | "validation-unavailable"
  | "validation-read-failed";

export type PairClassification =
  | "known-official"
  | "registry-unknown"
  | "system"
  | "local-custom";

export type RegistryValidationSource =
  | "registry-list"
  | "isConfidentialTokenValid"
  | "unavailable"
  | "read-failed";

export type PairMetadataSource =
  | "known-official"
  | "local-config"
  | "onchain-token-metadata"
  | "unknown";

export type OnchainTokenMetadata = {
  wrapperSymbol?: string;
  wrapperName?: string;
  wrapperDecimals?: number;
  underlyingSymbol?: string;
  underlyingName?: string;
  underlyingDecimals?: number;
};

export type EnrichedRegistryPair = {
  id: string;
  chainId: number;
  networkName: string;
  registryTokenAddress: Address;
  registryConfidentialTokenAddress: Address;
  underlyingAddress: Address;
  wrapperAddress: Address;
  isValid: boolean | null;
  validity: PairValidity;
  validationSource: RegistryValidationSource;
  validationError?: string;
  metadata: KnownPairMetadata | null;
  metadataStatus: "known-official" | "local-config" | "unknown";
  metadataSource: PairMetadataSource;
  classification: PairClassification;
  wasReturnedReversed: boolean;
  isSystemPair: boolean;
  isLocalPair: boolean;
  localConfig?: LocalWrapperPairConfig;
  symbol: string;
  name: string;
  wrapperSymbol?: string;
  wrapperName?: string;
  wrapperDecimals?: number;
  underlyingSymbol?: string;
  underlyingName?: string;
  underlyingDecimals?: number;
  displaySymbol: string;
  displayName: string;
  hasPublicFaucet: boolean;
  mintAccess: "public" | "restricted" | "unknown";
};

export type RegistryHealth = {
  totalPairs: number;
  knownOfficialPairs: number;
  validPairs: number;
  revokedPairs: number;
  validationUnknownPairs: number;
  validationReadFailedPairs: number;
  publicFaucetPairs: number;
  restrictedMintPairs: number;
  unknownPairs: number;
  systemPairs: number;
  unknownSystemPairs: number;
  localConfigPairs: number;
  metadataAvailablePairs: number;
  metadataUnavailablePairs: number;
  noPublicFaucetPairs: number;
  mainnetPairs: number;
};
