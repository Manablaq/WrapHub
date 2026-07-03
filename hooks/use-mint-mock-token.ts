"use client";

import type { Address } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { erc20Abi } from "@/lib/contracts/erc20";

export function useMintMockToken(tokenAddress: Address) {
  const write = useWriteContract();
  const receipt = useWaitForTransactionReceipt({
    hash: write.data,
  });

  return {
    mint: (to: Address, amount: bigint) =>
      write.writeContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "mint",
        args: [to, amount],
      }),
    hash: write.data,
    isPending: write.isPending,
    isConfirming: receipt.isLoading,
    isSuccess: receipt.isSuccess,
    error: write.error ?? receipt.error,
    reset: write.reset,
  };
}
