"use client";

import { DatabaseZap } from "lucide-react";
import type { Address } from "viem";
import { useMemo } from "react";
import { useReadContract, useReadContracts } from "wagmi";
import { AddressActions } from "@/components/registry/address-actions";
import { erc20MetadataAbi } from "@/lib/contracts/erc20";
import { registryAbi, type RegistryPair } from "@/lib/contracts/registry";
import { SUPPORTED_NETWORKS, type SupportedChainId } from "@/lib/networks/supported-networks";
import { enrichRegistryPair, mergeLocalRegistryPairs } from "@/lib/registry/enrich";
import type { EnrichedRegistryPair } from "@/lib/registry/types";

type NetworkMatrixEntry = {
  chainId: SupportedChainId;
  wrapperAddress: Address;
  underlyingAddress: Address;
  symbol: string;
  name: string;
  decimals: string;
  faucet: string;
  source: string;
};

type MatrixRow = {
  key: string;
  symbol: string;
  name: string;
  decimals: string;
  entries: Partial<Record<SupportedChainId, NetworkMatrixEntry>>;
};

function registryPairsForNetwork(data: unknown, chainId: SupportedChainId) {
  const rawPairs = (Array.isArray(data) ? data : []) as readonly RegistryPair[];
  const officialPairs = rawPairs.map((pair) => {
    const validation =
      typeof pair.isValid === "boolean"
        ? ({ status: "success", isValid: pair.isValid, source: "registry-list" } as const)
        : ({ status: "unavailable" } as const);

    return enrichRegistryPair(pair, validation, chainId);
  });

  return mergeLocalRegistryPairs(officialPairs, chainId);
}

function pairSource(pair: EnrichedRegistryPair) {
  if (pair.isLocalPair) {
    return "Local config";
  }

  if (pair.metadataStatus === "known-official" || pair.metadataStatus === "local-config") {
    return "Onchain registry + metadata enrichment";
  }

  return "Onchain registry";
}

function entrySource(pair: EnrichedRegistryPair, hasLiveMetadata: boolean) {
  if (pair.metadataSource === "known-official") {
    return "Onchain registry + metadata enrichment";
  }

  if (pair.metadataSource === "local-config") {
    return "Local config";
  }

  if (hasLiveMetadata) {
    return "Onchain token metadata";
  }

  return pairSource(pair);
}

function matrixKey(entry: NetworkMatrixEntry) {
  return entry.symbol === "Unknown" ? `${entry.chainId}:${entry.wrapperAddress}` : entry.symbol;
}

function AddressCell({
  address,
  chainId,
}: {
  address?: Address;
  chainId: SupportedChainId;
}) {
  if (!address) {
    return <span className="muted-cell">Not listed</span>;
  }

  return (
    <div className="matrix-address-cell">
      <code>{address}</code>
      <AddressActions address={address} chainId={chainId} />
    </div>
  );
}

export function NetworkAddressMatrix() {
  const sepoliaRegistryRead = useReadContract({
    address: SUPPORTED_NETWORKS[0].registryAddress,
    abi: registryAbi,
    functionName: "getTokenConfidentialTokenPairs",
    chainId: SUPPORTED_NETWORKS[0].chainId,
    query: {
      refetchInterval: 60_000,
    },
  });
  const mainnetRegistryRead = useReadContract({
    address: SUPPORTED_NETWORKS[1].registryAddress,
    abi: registryAbi,
    functionName: "getTokenConfidentialTokenPairs",
    chainId: SUPPORTED_NETWORKS[1].chainId,
    query: {
      refetchInterval: 60_000,
    },
  });

  const pairs = useMemo(() => {
    return [
      ...registryPairsForNetwork(sepoliaRegistryRead.data ?? [], SUPPORTED_NETWORKS[0].chainId),
      ...registryPairsForNetwork(mainnetRegistryRead.data ?? [], SUPPORTED_NETWORKS[1].chainId),
    ];
  }, [mainnetRegistryRead.data, sepoliaRegistryRead.data]);

  const metadataReads = useReadContracts({
    contracts: pairs.flatMap((pair) => [
      {
        address: pair.wrapperAddress,
        abi: erc20MetadataAbi,
        functionName: "symbol",
        chainId: pair.chainId,
      },
      {
        address: pair.wrapperAddress,
        abi: erc20MetadataAbi,
        functionName: "name",
        chainId: pair.chainId,
      },
      {
        address: pair.wrapperAddress,
        abi: erc20MetadataAbi,
        functionName: "decimals",
        chainId: pair.chainId,
      },
    ]),
    query: {
      enabled: pairs.length > 0,
      refetchInterval: 60_000,
    },
  });

  const rows = useMemo<MatrixRow[]>(() => {
    const rowMap = new Map<string, MatrixRow>();

    pairs.forEach((pair, pairIndex) => {
      const metadataOffset = pairIndex * 3;
      const symbolResult = metadataReads.data?.[metadataOffset];
      const nameResult = metadataReads.data?.[metadataOffset + 1];
      const decimalsResult = metadataReads.data?.[metadataOffset + 2];
      const symbol =
        pair.metadata?.symbol ??
        (symbolResult?.status === "success" && typeof symbolResult.result === "string"
          ? symbolResult.result
          : "Unknown");
      const name =
        pair.metadata?.name ??
        (nameResult?.status === "success" && typeof nameResult.result === "string"
          ? nameResult.result
          : "Unknown ERC-7984 token");
      const decimals =
        decimalsResult?.status === "success" ? String(decimalsResult.result) : "Unknown";
      const hasLiveMetadata = Boolean(
        symbolResult?.status === "success" ||
          nameResult?.status === "success" ||
          decimalsResult?.status === "success",
      );
      const network = SUPPORTED_NETWORKS.find((item) => item.chainId === pair.chainId);
      const entry: NetworkMatrixEntry = {
        chainId: pair.chainId as SupportedChainId,
        wrapperAddress: pair.wrapperAddress,
        underlyingAddress: pair.underlyingAddress,
        symbol,
        name,
        decimals,
        faucet:
          pair.hasPublicFaucet && network?.supportsPublicFaucet
            ? "Sepolia public mock"
            : "No public faucet",
        source: entrySource(pair, hasLiveMetadata),
      };
      const key = matrixKey(entry);
      const existing = rowMap.get(key) ?? {
        key,
        symbol,
        name,
        decimals,
        entries: {},
      };

      existing.entries[entry.chainId] = entry;
      if (existing.symbol === "Unknown" && symbol !== "Unknown") {
        existing.symbol = symbol;
      }
      if (existing.name === "Unknown ERC-7984 token" && name !== "Unknown ERC-7984 token") {
        existing.name = name;
      }
      if (existing.decimals === "Unknown" && decimals !== "Unknown") {
        existing.decimals = decimals;
      }

      rowMap.set(key, existing);
    });

    return [...rowMap.values()].sort((a, b) => a.symbol.localeCompare(b.symbol));
  }, [metadataReads.data, pairs]);

  return (
    <section className="network-address-matrix" aria-labelledby="network-address-matrix-title">
      <div className="action-panel-header">
        <div>
          <span>Network Address Matrix</span>
          <strong id="network-address-matrix-title">Wrapper and underlying addresses by network</strong>
        </div>
        <DatabaseZap size={18} />
      </div>
      <p>
        Registry reads are primary. Metadata only enriches labels, and missing network entries stay
        marked as not listed.
      </p>
      <div className="matrix-network-status">
        <span>
          Sepolia registry: {sepoliaRegistryRead.error ? "Unavailable" : sepoliaRegistryRead.isLoading ? "Loading" : "Available"}
        </span>
        <span>
          Ethereum Mainnet registry:{" "}
          {mainnetRegistryRead.error ? "Unavailable" : mainnetRegistryRead.isLoading ? "Loading" : "Available"}
        </span>
      </div>

      <div className="matrix-table-wrap">
        <table className="matrix-table">
          <thead>
            <tr>
              <th>Token / Symbol</th>
              <th>Name</th>
              <th>Decimals</th>
              <th>Sepolia wrapper</th>
              <th>Sepolia underlying</th>
              <th>Ethereum Mainnet wrapper</th>
              <th>Ethereum Mainnet underlying</th>
              <th>Faucet availability</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9}>No registry pairs are loaded yet for the supported networks.</td>
              </tr>
            ) : null}
            {rows.map((row) => {
              const sepoliaEntry = row.entries[11155111];
              const mainnetEntry = row.entries[1];
              return (
                <tr key={row.key}>
                  <td>{row.symbol}</td>
                  <td>{row.name}</td>
                  <td>{row.decimals}</td>
                  <td>
                    <AddressCell address={sepoliaEntry?.wrapperAddress} chainId={11155111} />
                  </td>
                  <td>
                    <AddressCell address={sepoliaEntry?.underlyingAddress} chainId={11155111} />
                  </td>
                  <td>
                    <AddressCell address={mainnetEntry?.wrapperAddress} chainId={1} />
                  </td>
                  <td>
                    <AddressCell address={mainnetEntry?.underlyingAddress} chainId={1} />
                  </td>
                  <td>
                    {[sepoliaEntry?.faucet, mainnetEntry?.faucet]
                      .filter((value): value is string => Boolean(value))
                      .join(" / ") || "Not listed"}
                  </td>
                  <td>
                    {[sepoliaEntry?.source, mainnetEntry?.source]
                      .filter((value): value is string => Boolean(value))
                      .join(" / ") || "Unknown"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
