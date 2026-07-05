"use client";

import type { Address } from "viem";
import { useReadContracts } from "wagmi";
import { erc20Abi } from "@/lib/contracts/erc20";

export function useErc20Balance(tokenAddress: Address, accountAddress?: Address, chainId?: number) {
  const result = useReadContracts({
    contracts: [
      {
        address: tokenAddress,
        abi: erc20Abi,
        chainId,
        functionName: "balanceOf",
        args: [accountAddress ?? "0x0000000000000000000000000000000000000000"],
      },
      {
        address: tokenAddress,
        abi: erc20Abi,
        chainId,
        functionName: "decimals",
      },
    ],
    query: {
      enabled: Boolean(accountAddress),
      refetchInterval: 20_000,
    },
  });

  const balanceResult = result.data?.[0];
  const decimalsResult = result.data?.[1];

  return {
    ...result,
    balance: balanceResult?.status === "success" ? balanceResult.result : 0n,
    decimals: decimalsResult?.status === "success" ? decimalsResult.result : 18,
  };
}
