"use client";

import { useMemo } from "react";
import { useReadContract, useReadContracts } from "wagmi";
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

  const validityReads = useReadContracts({
    contracts: rawPairs.map((pair) => ({
      address: OFFICIAL_REGISTRY_ADDRESS,
      abi: registryAbi,
      functionName: "isValidTokenConfidentialTokenPair",
      args: [pair.token, pair.confidentialToken] as const,
    })),
    query: {
      enabled: rawPairs.length > 0,
    },
  });

  const pairs = useMemo(
    () =>
      rawPairs.map((pair, index) => {
        const validityResult = validityReads.data?.[index];
        const isValid = validityResult?.status === "success" ? Boolean(validityResult.result) : null;
        return enrichRegistryPair(pair.token, pair.confidentialToken, isValid);
      }),
    [rawPairs, validityReads.data],
  );

  const health = useMemo(() => getRegistryHealth(pairs), [pairs]);

  return {
    pairs,
    health,
    isLoading: registryRead.isLoading || validityReads.isLoading,
    isRegistryLoading: registryRead.isLoading,
    isValidityLoading: validityReads.isLoading,
    error: registryRead.error ?? validityReads.error,
    refetch: registryRead.refetch,
  };
}
