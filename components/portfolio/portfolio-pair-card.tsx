"use client";

import { ArrowRight, CheckCircle2, Eye, Star } from "lucide-react";
import { useEffect, useMemo } from "react";
import { formatUnits } from "viem";
import { useAccount, useChainId } from "wagmi";
import { sepolia } from "wagmi/chains";
import { useConfidentialBalanceHandle } from "@/hooks/use-confidential-balance-handle";
import { useErc20Allowance } from "@/hooks/use-erc20-allowance";
import { useErc20Balance } from "@/hooks/use-erc20-balance";
import { useLocalDecryptedBalance } from "@/hooks/use-local-decrypted-balances";
import { useWatchlist } from "@/hooks/use-watchlist";
import type { EnrichedRegistryPair } from "@/lib/registry/types";

const ZERO_HANDLE =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export type PortfolioPairSnapshot = {
  pairId: string;
  hasPublicBalance: boolean;
  hasAllowance: boolean;
  hasEncryptedHandle: boolean;
  hasDecryptedBalance: boolean;
  hasDecryptedPositiveBalance: boolean;
};

function formatCompactTokenAmount(value: bigint, decimals: number) {
  const formatted = formatUnits(value, decimals);
  const [whole, fraction = ""] = formatted.split(".");
  const trimmed = fraction.slice(0, 4).replace(/0+$/, "");
  return trimmed ? `${whole}.${trimmed}` : whole;
}

function getReadinessLabels({
  connected,
  isSepolia,
  pair,
  balance,
  allowance,
  hasDecryptedBalance,
  hasDecryptedPositiveBalance,
}: {
  connected: boolean;
  isSepolia: boolean;
  pair: EnrichedRegistryPair;
  balance: bigint;
  allowance: bigint;
  hasDecryptedBalance: boolean;
  hasDecryptedPositiveBalance: boolean;
}) {
  if (!connected) {
    return ["Connect wallet"];
  }

  if (!isSepolia) {
    return ["Wrong network"];
  }

  const labels = [pair.hasPublicFaucet ? "Ready to mint" : "Restricted mint"];

  if (balance > 0n && allowance < balance) {
    labels.push("Ready to approve");
  }

  if (balance > 0n && allowance > 0n) {
    labels.push("Ready to wrap");
  }

  labels.push("Ready to inspect");
  labels.push(hasDecryptedBalance ? (hasDecryptedPositiveBalance ? "Ready to unwrap" : "No clear balance") : "Decrypt required");

  return labels;
}

export function PortfolioPairCard({
  pair,
  onSnapshot,
}: {
  pair: EnrichedRegistryPair;
  onSnapshot: (snapshot: PortfolioPairSnapshot) => void;
}) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isSepolia = chainId === sepolia.id;
  const balance = useErc20Balance(pair.underlyingAddress, address);
  const allowance = useErc20Allowance(pair.underlyingAddress, address, pair.wrapperAddress);
  const confidentialHandle = useConfidentialBalanceHandle(pair.wrapperAddress, address);
  const decrypted = useLocalDecryptedBalance(address, pair.wrapperAddress);
  const { isWatched, toggleWatched } = useWatchlist();
  const watched = isWatched(pair.id);

  const encryptedHandle = confidentialHandle.handle;
  const hasEncryptedHandle =
    Boolean(encryptedHandle) && encryptedHandle?.toLowerCase() !== ZERO_HANDLE;
  const decryptedValue =
    decrypted.balance?.value !== undefined ? BigInt(decrypted.balance.value) : null;
  const hasDecryptedBalance = decryptedValue !== null;
  const hasDecryptedPositiveBalance = decryptedValue !== null && decryptedValue > 0n;

  const readinessLabels = useMemo(
    () =>
      getReadinessLabels({
        connected: isConnected,
        isSepolia,
        pair,
        balance: balance.balance,
        allowance: allowance.allowance,
        hasDecryptedBalance,
        hasDecryptedPositiveBalance,
      }),
    [
      allowance.allowance,
      balance.balance,
      hasDecryptedBalance,
      hasDecryptedPositiveBalance,
      isConnected,
      isSepolia,
      pair,
    ],
  );

  useEffect(() => {
    onSnapshot({
      pairId: pair.id,
      hasPublicBalance: balance.balance > 0n,
      hasAllowance: allowance.allowance > 0n,
      hasEncryptedHandle,
      hasDecryptedBalance,
      hasDecryptedPositiveBalance,
    });
  }, [
    allowance.allowance,
    balance.balance,
    hasDecryptedBalance,
    hasDecryptedPositiveBalance,
    hasEncryptedHandle,
    onSnapshot,
    pair.id,
  ]);

  return (
    <article className="portfolio-pair-card">
      <div className="portfolio-pair-header">
        <div>
          <span>Official pair</span>
          <h3>{pair.symbol}</h3>
        </div>
        <button
          className={`watch-button ${watched ? "active" : ""}`}
          type="button"
          onClick={() => toggleWatched(pair.id)}
          aria-label={watched ? `Remove ${pair.symbol} from watchlist` : `Add ${pair.symbol} to watchlist`}
          aria-pressed={watched}
          title={watched ? "Remove from watchlist" : "Add to watchlist"}
        >
          <Star size={16} />
        </button>
      </div>

      <div className="portfolio-data-grid">
        <div>
          <span>ERC-20 balance</span>
          <strong>{formatCompactTokenAmount(balance.balance, balance.decimals)}</strong>
        </div>
        <div>
          <span>Wrapper allowance</span>
          <strong>{formatCompactTokenAmount(allowance.allowance, balance.decimals)}</strong>
        </div>
        <div>
          <span>Confidential status</span>
          <strong>
            {hasDecryptedBalance
              ? "Decrypted locally"
              : hasEncryptedHandle
                ? "Encrypted handle available"
                : "Not inspected"}
          </strong>
        </div>
      </div>

      <div className="readiness-list" aria-label={`${pair.symbol} readiness`}>
        {readinessLabels.map((label) => (
          <span className="readiness-chip" key={label}>
            {label === "Ready to unwrap" || label === "Ready to wrap" ? (
              <CheckCircle2 size={13} />
            ) : label === "Ready to inspect" || label === "Decrypt required" ? (
              <Eye size={13} />
            ) : null}
            {label}
          </span>
        ))}
      </div>

      <a className="pair-jump-link" href={`/registry#pair-${pair.id}`}>
        Open pair controls <ArrowRight size={14} />
      </a>
    </article>
  );
}
