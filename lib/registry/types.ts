import type { Address } from "viem";
import type { KnownPairMetadata } from "@/lib/tokens/known-pairs";

export type PairValidity =
  | "valid"
  | "revoked"
  | "validation-unavailable"
  | "validation-read-failed";

export type PairClassification = "known-official" | "registry-unknown" | "system";

export type RegistryValidationSource =
  | "registry-list"
  | "isConfidentialTokenValid"
  | "unavailable"
  | "read-failed";

export type EnrichedRegistryPair = {
  id: string;
  registryTokenAddress: Address;
  registryConfidentialTokenAddress: Address;
  underlyingAddress: Address;
  wrapperAddress: Address;
  isValid: boolean | null;
  validity: PairValidity;
  validationSource: RegistryValidationSource;
  validationError?: string;
  metadata: KnownPairMetadata | null;
  metadataStatus: "known-official" | "unknown";
  classification: PairClassification;
  wasReturnedReversed: boolean;
  isSystemPair: boolean;
  symbol: string;
  name: string;
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
};
