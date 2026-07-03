import type { Address } from "viem";

export function shortenAddress(address: Address, head = 6, tail = 4) {
  return `${address.slice(0, head)}...${address.slice(-tail)}`;
}

export function sepoliaAddressUrl(address: Address) {
  return `https://sepolia.etherscan.io/address/${address}`;
}

export function sepoliaTxUrl(hash: `0x${string}`) {
  return `https://sepolia.etherscan.io/tx/${hash}`;
}
