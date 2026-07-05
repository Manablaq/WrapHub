import type { SupportedNetwork } from "@/lib/networks/supported-networks";
import type { RegistryHealth as RegistryHealthModel } from "@/lib/registry/types";

const sepoliaCards: Array<{ label: string; value: keyof RegistryHealthModel }> = [
  { label: "Total registry pairs", value: "totalPairs" },
  { label: "Known official", value: "knownOfficialPairs" },
  { label: "Valid pairs", value: "validPairs" },
  { label: "Revoked / invalid", value: "revokedPairs" },
  { label: "Validation unknown", value: "validationUnknownPairs" },
  { label: "Validation failed", value: "validationReadFailedPairs" },
  { label: "Public mock faucet", value: "publicFaucetPairs" },
  { label: "Restricted mint", value: "restrictedMintPairs" },
  { label: "Unknown / system", value: "unknownSystemPairs" },
  { label: "Local config pairs", value: "localConfigPairs" },
];

const mainnetCards: Array<{ label: string; value: keyof RegistryHealthModel }> = [
  { label: "Mainnet pairs", value: "mainnetPairs" },
  { label: "Valid pairs", value: "validPairs" },
  { label: "Metadata available", value: "metadataAvailablePairs" },
  { label: "Metadata unavailable", value: "metadataUnavailablePairs" },
  { label: "Local config pairs", value: "localConfigPairs" },
  { label: "No public faucet", value: "noPublicFaucetPairs" },
  { label: "Validation unknown", value: "validationUnknownPairs" },
  { label: "Validation failed", value: "validationReadFailedPairs" },
];

export function RegistryHealth({
  health,
  activeNetwork,
}: {
  health: RegistryHealthModel;
  activeNetwork?: SupportedNetwork;
}) {
  const cards = activeNetwork?.environment === "mainnet" ? mainnetCards : sepoliaCards;

  return (
    <section className="registry-status" aria-label="Registry status">
      <div className="panel-heading">
        <span>Registry Status</span>
        <h2>
          Live coverage from the official {activeNetwork?.name ?? "supported network"} registry
        </h2>
      </div>
      {activeNetwork ? (
        <div className="registry-network-strip">
          <span>Active network</span>
          <strong>{activeNetwork.name}</strong>
          <code>{activeNetwork.registryAddress}</code>
          {activeNetwork.environment === "mainnet" ? (
            <small>Real Asset Mode · no public faucet</small>
          ) : null}
        </div>
      ) : null}
      <div className="health-grid">
        {cards.map((card) => (
          <div className="health-card" key={card.value}>
            <span>{card.label}</span>
            <strong>{health[card.value]}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
