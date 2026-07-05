"use client";

import type { Address } from "viem";
import { useReadContract } from "wagmi";
import { erc20Abi } from "@/lib/contracts/erc20";

export function useErc20Allowance(
  tokenAddress: Address,
  ownerAddress: Address | undefined,
  spenderAddress: Address,
  chainId?: number,
) {
  const result = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    chainId,
    functionName: "allowance",
    args: [ownerAddress ?? "0x0000000000000000000000000000000000000000", spenderAddress],
    query: {
      enabled: Boolean(ownerAddress),
      refetchInterval: 20_000,
    },
  });

  return {
    ...result,
    allowance: result.data ?? 0n,
  };
}
