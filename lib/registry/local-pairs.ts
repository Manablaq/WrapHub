import type { Address } from "viem";

export type LocalWrapperPairConfig = {
  chainId: number;
  underlyingAddress: Address;
  wrapperAddress: Address;
  symbol: string;
  name: string;
  decimals?: number;
  network: "sepolia" | "mainnet" | string;
  mintAccess: "public" | "restricted" | "unknown";
  hasPublicFaucet: boolean;
  source: string;
  notes?: string;
};

export const LOCAL_WRAPPER_PAIRS: readonly LocalWrapperPairConfig[] = [];
