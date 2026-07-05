"use client";

import { Check, Copy, ExternalLink, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { shortenBytes32 } from "@/lib/format";
import { getNetworkOrDefault, txExplorerUrl } from "@/lib/networks/supported-networks";
import { useTransactionHistory, type TransactionAction } from "@/hooks/use-transaction-history";

const actionLabels: Record<TransactionAction, string> = {
  faucet: "Faucet mint",
  approve: "Approve",
  wrap: "Wrap",
  "unwrap-request": "Unwrap request",
  "unwrap-finalize": "Finalize unwrap",
};

type ActivityFilter = "all" | "mint" | "approve" | "wrap" | "unwrap";

const activityFilters: Array<{ id: ActivityFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "mint", label: "Mint" },
  { id: "approve", label: "Approve" },
  { id: "wrap", label: "Wrap" },
  { id: "unwrap", label: "Unwrap" },
];

function matchesActivityFilter(action: TransactionAction, filter: ActivityFilter) {
  if (filter === "all") {
    return true;
  }

  if (filter === "mint") {
    return action === "faucet";
  }

  if (filter === "unwrap") {
    return action === "unwrap-request" || action === "unwrap-finalize";
  }

  return action === filter;
}

function relativeTimestamp(timestamp: number, currentTime: number) {
  const diffSeconds = Math.max(0, Math.floor((currentTime - timestamp) / 1000));

  if (diffSeconds < 60) {
    return "Just now";
  }

  const diffMinutes = Math.floor(diffSeconds / 60);

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function TransactionTimeline() {
  const { transactions, clearTransactions } = useTransactionHistory();
  const [filter, setFilter] = useState<ActivityFilter>("all");
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const filteredTransactions = useMemo(
    () => transactions.filter((tx) => matchesActivityFilter(tx.action, filter)),
    [filter, transactions],
  );

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  async function copyAllTxLinks() {
    const links = filteredTransactions
      .map((tx) => txExplorerUrl(tx.hash, tx.chainId))
      .join("\n");

    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API unavailable");
      }

      await navigator.clipboard.writeText(links);
      setCopied(true);
      setCopyFailed(false);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopyFailed(true);
      window.setTimeout(() => setCopyFailed(false), 2200);
    }
  }

  return (
    <section
      className="transaction-timeline"
      id="session-activity"
      aria-label="Session transaction activity"
    >
      <div className="timeline-header">
        <div>
          <span>Local Session</span>
          <h2>Session Activity</h2>
          <p>Activity is stored locally in this browser with network-specific Etherscan links.</p>
        </div>
        <div className="timeline-actions">
          <button
            className="icon-button"
            type="button"
            onClick={copyAllTxLinks}
            disabled={filteredTransactions.length === 0}
            aria-label="Copy all visible transaction links"
            title="Copy all visible transaction links"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
          <button
            className="icon-button"
            type="button"
            onClick={clearTransactions}
            disabled={transactions.length === 0}
            aria-label="Clear local transaction history"
            title="Clear local transaction history"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="activity-filter-tabs" role="tablist" aria-label="Activity filters">
        {activityFilters.map((item) => (
          <button
            className={item.id === filter ? "active" : undefined}
            key={item.id}
            onClick={() => setFilter(item.id)}
            role="tab"
            aria-selected={item.id === filter}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      {transactions.length === 0 ? (
        <div className="timeline-empty">
          <strong>No session activity yet.</strong>
          <span>Mint, approve, wrap, or unwrap to populate this local activity feed.</span>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="timeline-empty">
          <strong>No activity for this filter.</strong>
          <span>Switch filters or continue working with a wrapper pair.</span>
        </div>
      ) : copyFailed ? (
        <div className="timeline-empty warning">
          <strong>Could not copy transaction links.</strong>
          <span>Your browser did not allow clipboard access.</span>
        </div>
      ) : (
        <div className="timeline-list">
          {filteredTransactions.map((tx) => (
            <div className="timeline-item" key={tx.hash}>
              <div>
                <strong>{actionLabels[tx.action]}</strong>
                <span>
                  {tx.symbol} · {getNetworkOrDefault(tx.chainId).shortName} ·{" "}
                  {relativeTimestamp(tx.updatedAt, now)}
                </span>
              </div>
              <code title={tx.hash}>{shortenBytes32(tx.hash)}</code>
              <span className={`timeline-status ${tx.status}`}>{tx.status}</span>
              <a
                href={txExplorerUrl(tx.hash, tx.chainId)}
                target="_blank"
                rel="noreferrer"
                title="Open tx"
              >
                <ExternalLink size={15} />
              </a>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
