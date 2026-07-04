"use client";

import { ExternalLink, Trash2 } from "lucide-react";
import { sepoliaTxUrl, shortenBytes32 } from "@/lib/format";
import { useTransactionHistory, type TransactionAction } from "@/hooks/use-transaction-history";

const actionLabels: Record<TransactionAction, string> = {
  faucet: "Faucet mint",
  approve: "Approve",
  wrap: "Wrap",
  "unwrap-request": "Unwrap request",
  "unwrap-finalize": "Finalize unwrap",
};

export function TransactionTimeline() {
  const { transactions, clearTransactions } = useTransactionHistory();

  return (
    <section className="transaction-timeline" aria-label="Session transaction activity">
      <div className="timeline-header">
        <div>
          <span>Local Session</span>
          <h2>Session Activity</h2>
          <p>Activity is stored locally in this browser with direct Sepolia Etherscan links.</p>
        </div>
        <button
          className="icon-button"
          type="button"
          onClick={clearTransactions}
          disabled={transactions.length === 0}
          title="Clear local transaction history"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="timeline-empty">
          <strong>No session activity yet.</strong>
          <span>Mint, approve, wrap, decrypt, or unwrap to populate this local activity feed.</span>
        </div>
      ) : (
        <div className="timeline-list">
          {transactions.map((tx) => (
            <div className="timeline-item" key={tx.hash}>
              <div>
                <strong>{actionLabels[tx.action]}</strong>
                <span>{tx.symbol}</span>
              </div>
              <code title={tx.hash}>{shortenBytes32(tx.hash)}</code>
              <span className={`timeline-status ${tx.status}`}>{tx.status}</span>
              <a href={sepoliaTxUrl(tx.hash)} target="_blank" rel="noreferrer" title="Open tx">
                <ExternalLink size={15} />
              </a>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
