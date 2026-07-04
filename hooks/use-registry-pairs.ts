"use client";

import { useMemo } from "react";
import { useReadContract } from "wagmi";
import { OFFICIAL_REGISTRY_ADDRESS, registryAbi, type RegistryPair } from "@/lib/contracts/registry";
import { enrichRegistryPair, getRegistryHealth } from "@/lib/registry/enrich";

export function useRegistryPairs() {
  const registryRead = useReadContract({
    address: OFFICIAL_REGISTRY_ADDRESS,
    abi: registryAbi,
    functionName: "getTokenConfidentialTokenPairs",
    query: {
      refetchInterval: 30_000,
    },
  });

  const rawPairs = useMemo(
    () => (registryRead.data ?? []) as readonly RegistryPair[],
    [registryRead.data],
  );

  const pairs = useMemo(
    () =>
      rawPairs.map((pair) => {
        const validation =
          typeof pair.isValid === "boolean"
            ? ({ status: "success", isValid: pair.isValid, source: "registry-list" } as const)
            : ({ status: "unavailable" } as const);

        return enrichRegistryPair(pair, validation);
      }),
    [rawPairs],
  );

  const health = useMemo(() => getRegistryHealth(pairs), [pairs]);

  return {
    pairs,
    health,
    isLoading: registryRead.isLoading,
    isRegistryLoading: registryRead.isLoading,
    isValidityLoading: false,
    error: registryRead.error,
    refetch: registryRead.refetch,
  };
}
