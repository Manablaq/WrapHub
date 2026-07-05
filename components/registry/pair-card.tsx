"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Info,
  LockKeyhole,
  ShieldCheck,
  Star,
  TestTube2,
} from "lucide-react";
import { AddressActions } from "@/components/registry/address-actions";
import { ConfidentialBalanceInspector } from "@/components/registry/confidential-balance-inspector";
import { PairActionPanel } from "@/components/registry/pair-action-panel";
import { useWatchlist } from "@/hooks/use-watchlist";
import { shortenAddress } from "@/lib/format";
import type { EnrichedRegistryPair } from "@/lib/registry/types";

function validityClass(pair: EnrichedRegistryPair) {
  if (pair.validity === "valid") {
    return "success";
  }

  if (pair.validity === "revoked") {
    return "danger";
  }

  return "warning";
}

function validityLabel(pair: EnrichedRegistryPair) {
  if (pair.validity === "valid") {
    return "Valid";
  }

  if (pair.validity === "revoked") {
    return "Revoked / invalid";
  }

  if (pair.validity === "validation-read-failed") {
    return "Validation read failed";
  }

  return "Validation unavailable";
}

function classificationBadge(pair: EnrichedRegistryPair) {
  if (pair.classification === "system") {
    return (
      <span className="badge warning">
        <Info size={13} /> System / placeholder
      </span>
    );
  }

  if (pair.classification === "registry-unknown") {
    return (
      <span className="badge warning">
        <AlertTriangle size={13} /> Registry-returned unknown
      </span>
    );
  }

  return (
    <span className="badge success">
      <ShieldCheck size={13} /> Known official wrapper
    </span>
  );
}

export function PairCard({ pair }: { pair: EnrichedRegistryPair }) {
  const { isWatched, toggleWatched } = useWatchlist();
  const watched = isWatched(pair.id);
  const cardTone =
    pair.validity === "revoked"
      ? "invalid"
      : pair.classification === "known-official"
        ? "trusted"
        : pair.classification;

  return (
    <article className={`pair-card ${cardTone}`} id={`pair-${pair.id}`}>
      <div className="pair-card-header">
        <div className="token-title">
          <span>{pair.classification === "known-official" ? "Official wrapper pair" : "Registry pair"}</span>
          <h3>{pair.symbol}</h3>
          <p>{pair.name}</p>
        </div>
        <div className="badge-stack">
          <button
            className={`watch-button ${watched ? "active" : ""}`}
            type="button"
            onClick={() => toggleWatched(pair.id)}
            aria-label={watched ? `Remove ${pair.symbol} from watchlist` : `Add ${pair.symbol} to watchlist`}
            aria-pressed={watched}
            title={watched ? "Remove from watchlist" : "Add to watchlist"}
          >
            <Star size={14} />
            Watch
          </button>
          {classificationBadge(pair)}
          <span className={`badge ${validityClass(pair)}`}>
            {pair.validity === "valid" && <CheckCircle2 size={13} />}
            {pair.validity !== "valid" && <AlertTriangle size={13} />}
            {validityLabel(pair)}
          </span>
          {pair.hasPublicFaucet ? (
            <span className="badge success">
              <TestTube2 size={13} /> Public mock faucet
            </span>
          ) : pair.mintAccess === "restricted" ? (
            <span className="badge warning">
              <LockKeyhole size={13} /> Restricted mint
            </span>
          ) : (
            <span className="badge warning">
              <AlertTriangle size={13} /> Faucet unknown
            </span>
          )}
        </div>
      </div>

      <div className="address-list">
        <div className="address-row">
          <span>ERC-7984 wrapper</span>
          <code title={pair.wrapperAddress}>{shortenAddress(pair.wrapperAddress, 10, 8)}</code>
          <AddressActions address={pair.wrapperAddress} />
        </div>
        <div className="address-row">
          <span>Underlying ERC-20</span>
          <code title={pair.underlyingAddress}>
            {shortenAddress(pair.underlyingAddress, 10, 8)}
          </code>
          <AddressActions address={pair.underlyingAddress} />
        </div>
      </div>

      {pair.metadataStatus === "unknown" && !pair.isSystemPair ? (
        <div className="inline-status warning">
          Registry returned this pair, but local official metadata is not available. It remains
          visible because registry coverage is the source of truth.
        </div>
      ) : null}

      {pair.isSystemPair ? (
        <div className="inline-status warning">
          Registry returned a placeholder or system pair. WrapHub keeps it visible for complete
          registry coverage.
        </div>
      ) : null}

      {pair.wasReturnedReversed ? (
        <div className="inline-status warning">
          Registry addresses were returned in reversed order and normalized for display.
        </div>
      ) : null}

      {pair.validity === "validation-read-failed" || pair.validity === "validation-unavailable" ? (
        <div className="inline-status warning">
          Pair validation could not be confirmed from the registry read.
          {pair.validationError ? ` ${pair.validationError}` : ""}
        </div>
      ) : null}

      <PairActionPanel pair={pair} />
      <ConfidentialBalanceInspector pair={pair} />
    </article>
  );
}
