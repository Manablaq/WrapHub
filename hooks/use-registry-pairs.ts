"use client";

import { useMemo } from "react";
import { useAccount, useChainId, useReadContract, useReadContracts } from "wagmi";
import { erc20MetadataAbi } from "@/lib/contracts/erc20";
import { registryAbi, type RegistryPair } from "@/lib/contracts/registry";
import { getNetworkOrDefault, getSupportedNetwork } from "@/lib/networks/supported-networks";
import {
  applyOnchainMetadata,
  enrichRegistryPair,
  getRegistryHealth,
  mergeLocalRegistryPairs,
} from "@/lib/registry/enrich";

export function useRegistryPairs() {
  const { isConnected } = useAccount();
  const connectedChainId = useChainId();
  const supportedConnectedNetwork = getSupportedNetwork(connectedChainId);
  const activeNetwork = isConnected
    ? supportedConnectedNetwork ?? getNetworkOrDefault()
    : getNetworkOrDefault();
  const registryRead = useReadContract({
    address: activeNetwork.registryAddress,
    abi: registryAbi,
    chainId: activeNetwork.chainId,
    functionName: "getTokenConfidentialTokenPairs",
    query: {
      enabled: Boolean(activeNetwork),
      refetchInterval: 30_000,
    },
  });

  const rawPairs = useMemo(
    () => (registryRead.data ?? []) as readonly RegistryPair[],
    [registryRead.data],
  );

  const basePairs = useMemo(
    () => {
      const officialPairs = rawPairs.map((pair) => {
        const validation =
          typeof pair.isValid === "boolean"
            ? ({ status: "success", isValid: pair.isValid, source: "registry-list" } as const)
            : ({ status: "unavailable" } as const);

        return enrichRegistryPair(pair, validation, activeNetwork.chainId);
      });

      return mergeLocalRegistryPairs(officialPairs, activeNetwork.chainId);
    },
    [activeNetwork.chainId, rawPairs],
  );

  const metadataRead = useReadContracts({
    contracts: basePairs.flatMap((pair) => [
      {
        address: pair.wrapperAddress,
        abi: erc20MetadataAbi,
        chainId: pair.chainId,
        functionName: "symbol",
      },
      {
        address: pair.wrapperAddress,
        abi: erc20MetadataAbi,
        chainId: pair.chainId,
        functionName: "name",
      },
      {
        address: pair.wrapperAddress,
        abi: erc20MetadataAbi,
        chainId: pair.chainId,
        functionName: "decimals",
      },
      {
        address: pair.underlyingAddress,
        abi: erc20MetadataAbi,
        chainId: pair.chainId,
        functionName: "symbol",
      },
      {
        address: pair.underlyingAddress,
        abi: erc20MetadataAbi,
        chainId: pair.chainId,
        functionName: "name",
      },
      {
        address: pair.underlyingAddress,
        abi: erc20MetadataAbi,
        chainId: pair.chainId,
        functionName: "decimals",
      },
    ]),
    query: {
      enabled: basePairs.length > 0,
      refetchInterval: 60_000,
    },
  });

  const pairs = useMemo(
    () =>
      basePairs.map((pair, index) => {
        const offset = index * 6;
        const wrapperSymbol = metadataRead.data?.[offset];
        const wrapperName = metadataRead.data?.[offset + 1];
        const wrapperDecimals = metadataRead.data?.[offset + 2];
        const underlyingSymbol = metadataRead.data?.[offset + 3];
        const underlyingName = metadataRead.data?.[offset + 4];
        const underlyingDecimals = metadataRead.data?.[offset + 5];

        return applyOnchainMetadata(pair, {
          wrapperSymbol:
            wrapperSymbol?.status === "success" && typeof wrapperSymbol.result === "string"
              ? wrapperSymbol.result
              : undefined,
          wrapperName:
            wrapperName?.status === "success" && typeof wrapperName.result === "string"
              ? wrapperName.result
              : undefined,
          wrapperDecimals:
            wrapperDecimals?.status === "success" ? Number(wrapperDecimals.result) : undefined,
          underlyingSymbol:
            underlyingSymbol?.status === "success" && typeof underlyingSymbol.result === "string"
              ? underlyingSymbol.result
              : undefined,
          underlyingName:
            underlyingName?.status === "success" && typeof underlyingName.result === "string"
              ? underlyingName.result
              : undefined,
          underlyingDecimals:
            underlyingDecimals?.status === "success" ? Number(underlyingDecimals.result) : undefined,
        });
      }),
    [basePairs, metadataRead.data],
  );

  const health = useMemo(() => getRegistryHealth(pairs), [pairs]);

  return {
    pairs,
    health,
    isLoading: registryRead.isLoading,
    isRegistryLoading: registryRead.isLoading,
    isValidityLoading: metadataRead.isLoading,
    error: registryRead.error,
    refetch: registryRead.refetch,
    activeNetwork,
    isUnsupportedNetwork: isConnected && !supportedConnectedNetwork,
  };
}
