import type { Address } from "viem";
import type { KnownPairMetadata } from "@/lib/tokens/known-pairs";

export type PairValidity = "valid" | "revoked" | "unknown";

export type EnrichedRegistryPair = {
  id: string;
  underlyingAddress: Address;
  wrapperAddress: Address;
  isValid: boolean | null;
  validity: PairValidity;
  metadata: KnownPairMetadata | null;
  metadataStatus: "known" | "unknown";
  symbol: string;
  name: string;
  hasPublicFaucet: boolean;
  mintAccess: "public" | "restricted" | "unknown";
};

export type RegistryHealth = {
  totalPairs: number;
  validPairs: number;
  revokedPairs: number;
  unknownValidityPairs: number;
  publicFaucetPairs: number;
  restrictedPairs: number;
  metadataKnownPairs: number;
  metadataUnknownPairs: number;
};
