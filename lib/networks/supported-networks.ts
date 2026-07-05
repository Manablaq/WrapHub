import type { Address } from "viem";

export const SEPOLIA_CHAIN_ID = 11155111;
export const MAINNET_CHAIN_ID = 1;

export type SupportedChainId = typeof SEPOLIA_CHAIN_ID | typeof MAINNET_CHAIN_ID;

export type SupportedNetwork = {
  chainId: SupportedChainId;
  name: string;
  shortName: string;
  registryAddress: Address;
  explorerBaseUrl: string;
  alchemyRpcUrl: (alchemyKey: string) => string;
  fallbackRpcUrls: readonly string[];
  supportsPublicFaucet: boolean;
  environment: "testnet" | "mainnet";
};

export const SUPPORTED_NETWORKS = [
  {
    chainId: SEPOLIA_CHAIN_ID,
    name: "Sepolia",
    shortName: "Sepolia",
    registryAddress: "0x2f0750Bbb0A246059d80e94c454586a7F27a128e",
    explorerBaseUrl: "https://sepolia.etherscan.io",
    alchemyRpcUrl: (alchemyKey: string) =>
      `https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}`,
    fallbackRpcUrls: ["https://ethereum-sepolia-rpc.publicnode.com"],
    supportsPublicFaucet: true,
    environment: "testnet",
  },
  {
    chainId: MAINNET_CHAIN_ID,
    name: "Ethereum Mainnet",
    shortName: "Mainnet",
    registryAddress: "0xeb5015fF021DB115aCe010f23F55C2591059bBA0",
    explorerBaseUrl: "https://etherscan.io",
    alchemyRpcUrl: (alchemyKey: string) => `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    fallbackRpcUrls: ["https://ethereum-rpc.publicnode.com", "https://cloudflare-eth.com"],
    supportsPublicFaucet: false,
    environment: "mainnet",
  },
] as const satisfies readonly SupportedNetwork[];

export const DEFAULT_CHAIN_ID = SEPOLIA_CHAIN_ID satisfies SupportedChainId;
export const SUPPORTED_CHAIN_IDS = SUPPORTED_NETWORKS.map((network) => network.chainId);

export function getSupportedNetwork(chainId?: number | null) {
  return SUPPORTED_NETWORKS.find((network) => network.chainId === chainId) ?? null;
}

export function getDefaultNetwork() {
  return SUPPORTED_NETWORKS[0];
}

export function getNetworkOrDefault(chainId?: number | null) {
  return getSupportedNetwork(chainId) ?? getDefaultNetwork();
}

export function isSupportedChainId(chainId?: number | null): chainId is SupportedChainId {
  return Boolean(getSupportedNetwork(chainId));
}

export function addressExplorerUrl(address: Address, chainId?: number | null) {
  const network = getNetworkOrDefault(chainId);
  return `${network.explorerBaseUrl}/address/${address}`;
}

export function txExplorerUrl(hash: `0x${string}`, chainId?: number | null) {
  const network = getNetworkOrDefault(chainId);
  return `${network.explorerBaseUrl}/tx/${hash}`;
}

export function getRpcUrls(network: SupportedNetwork, alchemyKey?: string) {
  return [
    ...(alchemyKey ? [network.alchemyRpcUrl(alchemyKey)] : []),
    ...network.fallbackRpcUrls,
  ];
}

export function getPrimaryRpcUrl(network: SupportedNetwork, alchemyKey?: string) {
  return getRpcUrls(network, alchemyKey)[0];
}

export function getRpcStrategyLabel(alchemyKey?: string) {
  return alchemyKey
    ? "Alchemy primary HTTP"
    : "Explicit public HTTP";
}
