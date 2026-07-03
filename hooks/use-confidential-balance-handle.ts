"use client";

import type { Address } from "viem";
import { useReadContracts } from "wagmi";
import { erc7984Abi } from "@/lib/contracts/erc7984";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

export function useConfidentialBalanceHandle(wrapperAddress: Address, accountAddress?: Address) {
  const result = useReadContracts({
    contracts: [
      {
        address: wrapperAddress,
        abi: erc7984Abi,
        functionName: "confidentialBalanceOf",
        args: [accountAddress ?? ZERO_ADDRESS],
      },
      {
        address: wrapperAddress,
        abi: erc7984Abi,
        functionName: "decimals",
      },
    ],
    query: {
      enabled: Boolean(accountAddress),
      refetchInterval: 20_000,
    },
  });

  const handleResult = result.data?.[0];
  const decimalsResult = result.data?.[1];

  return {
    ...result,
    handle: handleResult?.status === "success" ? handleResult.result : undefined,
    decimals: decimalsResult?.status === "success" ? decimalsResult.result : 6,
  };
}
