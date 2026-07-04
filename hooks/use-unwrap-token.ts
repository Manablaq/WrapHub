"use client";

import { useUnshield } from "@zama-fhe/react-sdk";
import { useState } from "react";
import type { Address } from "viem";

export type UnwrapPhase = "idle" | "encrypting" | "unwrap-submitted" | "finalizing" | "finalize-submitted";

export function useUnwrapToken(wrapperAddress: Address) {
  const [phase, setPhase] = useState<UnwrapPhase>("idle");
  const [requestHash, setRequestHash] = useState<`0x${string}` | undefined>();
  const [finalizeHash, setFinalizeHash] = useState<`0x${string}` | undefined>();
  const unshield = useUnshield(wrapperAddress, {
    onSuccess: () => {
      setPhase("idle");
    },
    onError: () => {
      setPhase("idle");
    },
  });

  return {
    unwrap: (amount: bigint) => {
      setPhase("encrypting");
      unshield.mutate({
        amount,
        onUnwrapSubmitted: (txHash) => {
          setRequestHash(txHash);
          setPhase("unwrap-submitted");
        },
        onFinalizing: () => setPhase("finalizing"),
        onFinalizeSubmitted: (txHash) => {
          setPhase("finalize-submitted");
          setFinalizeHash(txHash);
        },
      });
    },
    data: unshield.data,
    requestHash,
    finalizeHash,
    unwrapHash: finalizeHash ?? requestHash,
    phase,
    isPending: unshield.isPending,
    isSuccess: unshield.isSuccess,
    error: unshield.error,
    reset: () => {
      setPhase("idle");
      setRequestHash(undefined);
      setFinalizeHash(undefined);
      unshield.reset();
    },
  };
}
