import type { Address } from "viem";

export function shortenAddress(address: Address, head = 6, tail = 4) {
  return `${address.slice(0, head)}...${address.slice(-tail)}`;
}

export function shortenBytes32(value: `0x${string}`, head = 10, tail = 8) {
  return `${value.slice(0, head)}...${value.slice(-tail)}`;
}
