"use client";

import { DatabaseZap, Eye, LockKeyhole, Network, ShieldCheck, Wallet } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { PortfolioPairCard, type PortfolioPairSnapshot } from "@/components/portfolio/portfolio-pair-card";
import { useWatchlist } from "@/hooks/use-watchlist";
import { shortenAddress } from "@/lib/format";
import { getNetworkOrDefault, getSupportedNetwork } from "@/lib/networks/supported-networks";
import type { EnrichedRegistryPair } from "@/lib/registry/types";

type PortfolioOverviewProps = {
  pairs: readonly EnrichedRegistryPair[];
};

const intelligenceItems = [
  {
    title: "Registry source",
    copy: "Official wrapper registry for the active supported network.",
    icon: DatabaseZap,
  },
  {
    title: "Pair validity",
    copy: "Uses the registry-returned isValid flag.",
    icon: ShieldCheck,
  },
  {
    title: "Wrap path",
    copy: "ERC-20 approve → wrapper.wrap(to, amount).",
    icon: Network,
  },
  {
    title: "Balance privacy",
    copy: "ERC-7984 balances remain encrypted until user-decryption.",
    icon: LockKeyhole,
  },
  {
    title: "Unwrap path",
    copy: "Encrypted unwrap request → public decrypt proof → finalizeUnwrap.",
    icon: Eye,
  },
  {
    title: "Local-only",
    copy: "Clear balances appear only after wallet-authorized decryption.",
    icon: Wallet,
  },
];

export function PortfolioOverview({ pairs }: PortfolioOverviewProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const activeNetwork = getSupportedNetwork(chainId) ?? getNetworkOrDefault();
  const isSupportedNetwork = Boolean(getSupportedNetwork(chainId));
  const { watchedCount } = useWatchlist(activeNetwork.chainId);
  const [snapshots, setSnapshots] = useState<Record<string, PortfolioPairSnapshot>>({});

  const knownOfficialPairs = useMemo(
    () =>
      pairs.filter(
        (pair) => pair.classification === "known-official" && pair.chainId === activeNetwork.chainId,
      ),
    [activeNetwork.chainId, pairs],
  );

  const handleSnapshot = useCallback((snapshot: PortfolioPairSnapshot) => {
    setSnapshots((current) => {
      const previous = current[snapshot.pairId];

      if (
        previous?.hasPublicBalance === snapshot.hasPublicBalance &&
        previous?.hasAllowance === snapshot.hasAllowance &&
        previous?.hasEncryptedHandle === snapshot.hasEncryptedHandle &&
        previous?.hasDecryptedBalance === snapshot.hasDecryptedBalance &&
        previous?.hasDecryptedPositiveBalance === snapshot.hasDecryptedPositiveBalance
      ) {
        return current;
      }

      return { ...current, [snapshot.pairId]: snapshot };
    });
  }, []);

  const snapshotList = Object.values(snapshots);
  const portfolioPairs = knownOfficialPairs.filter((pair) => {
    const snapshot = snapshots[pair.id];

    return (
      snapshot?.hasPublicBalance ||
      snapshot?.hasAllowance ||
      snapshot?.hasEncryptedHandle ||
      snapshot?.hasDecryptedPositiveBalance
    );
  });
  const hasBalanceCount = snapshotList.filter((snapshot) => snapshot.hasPublicBalance).length;
  const hasAllowanceCount = snapshotList.filter((snapshot) => snapshot.hasAllowance).length;
  const encryptedHandleCount = snapshotList.filter((snapshot) => snapshot.hasEncryptedHandle).length;
  const decryptedPositiveCount = snapshotList.filter(
    (snapshot) => snapshot.hasDecryptedPositiveBalance,
  ).length;

  return (
    <section className="portfolio-section" id="portfolio" aria-label="Portfolio Overview">
      <div className="section-header portfolio-header">
        <div>
          <span className="section-kicker">Portfolio Overview</span>
          <h2>Active wallet positions first</h2>
          <p>
            Active wallet positions first, with a readiness monitor for supported official pairs.
            Watchlist status is useful for navigation, but it is not counted as a holding.
          </p>
        </div>
        <div className="portfolio-wallet-card">
          <span>Connected wallet</span>
          <strong>{isConnected && address ? shortenAddress(address, 8, 6) : "Not connected"}</strong>
          <small>
            {isConnected && !isSupportedNetwork
              ? "Switch to a supported network"
              : `Active network: ${activeNetwork.name}`}
          </small>
        </div>
      </div>

      {!isConnected ? (
        <div className="portfolio-empty">
          Connect a wallet to view active holdings.
        </div>
      ) : null}

      <div className="portfolio-stat-grid">
        <div>
          <span>Active holdings</span>
          <strong>{isConnected ? portfolioPairs.length : "-"}</strong>
        </div>
        <div>
          <span>ERC-20 balance &gt; 0</span>
          <strong>{isConnected ? hasBalanceCount : "-"}</strong>
        </div>
        <div>
          <span>Allowance &gt; 0</span>
          <strong>{isConnected ? hasAllowanceCount : "-"}</strong>
        </div>
        <div>
          <span>Encrypted handles</span>
          <strong>{isConnected ? encryptedHandleCount : "-"}</strong>
        </div>
        <div>
          <span>Locally decrypted pairs</span>
          <strong>{isConnected ? decryptedPositiveCount : "-"}</strong>
        </div>
        <div>
          <span>Watched pairs</span>
          <strong>{watchedCount}</strong>
        </div>
      </div>

      <div className="portfolio-note">
        Confidential balances require local user-decryption before clear values are visible.
      </div>

      {isConnected && portfolioPairs.length === 0 ? (
        <div className="portfolio-empty">
          No active holdings yet. Mint or receive ERC-20, wrap into ERC-7984, or inspect a
          confidential balance to populate this view.
        </div>
      ) : null}

      <section className="active-holdings" aria-label="Active Holdings">
        <div className="panel-heading">
          <span>Active Holdings</span>
          <h2>Pairs where this wallet has a detected position</h2>
        </div>

        {portfolioPairs.length > 0 ? (
          <div className="portfolio-position-grid">
            {portfolioPairs.map((pair) => {
            const snapshot = snapshots[pair.id];
            const labels = [
              snapshot?.hasPublicBalance ? "ERC-20 balance" : null,
              snapshot?.hasAllowance ? "Wrapper allowance" : null,
              snapshot?.hasEncryptedHandle ? "Encrypted handle" : null,
              snapshot?.hasDecryptedPositiveBalance ? "Decrypted locally" : null,
            ].filter((label): label is string => Boolean(label));

            return (
              <article className="portfolio-position-card" key={pair.id}>
                <div>
                  <span>Active holding</span>
                  <h3>{pair.displaySymbol}</h3>
                </div>
                <div className="readiness-list">
                  {labels.map((label) => (
                    <span className="readiness-chip" key={label}>
                      {label}
                    </span>
                  ))}
                </div>
                  <a className="pair-jump-link" href={`/registry#pair-${pair.id}`}>
                    Open pair controls
                  </a>
              </article>
            );
            })}
          </div>
        ) : null}
      </section>

      <section className="readiness-monitor" id="readiness-monitor" aria-label="Readiness Monitor">
        <div className="panel-heading">
          <span>Official Pair Readiness</span>
          <h2>All official pairs and their next available actions</h2>
        </div>
        <div className="portfolio-pair-grid">
          {knownOfficialPairs.map((pair) => (
            <PortfolioPairCard pair={pair} key={pair.id} onSnapshot={handleSnapshot} />
          ))}
        </div>
      </section>

      <section className="protocol-intelligence" aria-label="Protocol Intelligence">
        <div className="panel-heading">
          <span>Protocol Intelligence</span>
          <h2>How WrapHub maps wallet actions to protocol mechanics</h2>
        </div>
        <div className="intelligence-grid">
          {intelligenceItems.map((item) => {
            const Icon = item.icon;
            return (
              <div className="intelligence-card" key={item.title}>
                <Icon size={18} />
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.copy}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </section>
  );
}
