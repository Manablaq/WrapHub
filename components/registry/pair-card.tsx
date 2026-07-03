import { AlertTriangle, CheckCircle2, LockKeyhole, TestTube2 } from "lucide-react";
import { AddressActions } from "@/components/registry/address-actions";
import { ConfidentialBalanceInspector } from "@/components/registry/confidential-balance-inspector";
import { PairActionPanel } from "@/components/registry/pair-action-panel";
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

export function PairCard({ pair }: { pair: EnrichedRegistryPair }) {
  return (
    <article className="pair-card">
      <div className="pair-card-header">
        <div className="token-title">
          <h3>{pair.symbol}</h3>
          <p>{pair.name}</p>
        </div>
        <div className="badge-stack">
          <span className={`badge ${validityClass(pair)}`}>
            {pair.validity === "valid" && <CheckCircle2 size={13} />}
            {pair.validity !== "valid" && <AlertTriangle size={13} />}
            {pair.validity}
          </span>
          {pair.hasPublicFaucet ? (
            <span className="badge success">
              <TestTube2 size={13} /> Faucet
            </span>
          ) : (
            <span className="badge warning">
              <LockKeyhole size={13} /> Restricted
            </span>
          )}
        </div>
      </div>

      <div className="address-list">
        <div className="address-row">
          <span>Wrapper</span>
          <code title={pair.wrapperAddress}>{shortenAddress(pair.wrapperAddress, 10, 8)}</code>
          <AddressActions address={pair.wrapperAddress} />
        </div>
        <div className="address-row">
          <span>Underlying</span>
          <code title={pair.underlyingAddress}>
            {shortenAddress(pair.underlyingAddress, 10, 8)}
          </code>
          <AddressActions address={pair.underlyingAddress} />
        </div>
      </div>

      <PairActionPanel pair={pair} />
      <ConfidentialBalanceInspector pair={pair} />
    </article>
  );
}
