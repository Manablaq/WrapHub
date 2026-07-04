import type { RegistryHealth as RegistryHealthModel } from "@/lib/registry/types";

const cards: Array<{ label: string; value: keyof RegistryHealthModel }> = [
  { label: "Total registry pairs", value: "totalPairs" },
  { label: "Known official", value: "knownOfficialPairs" },
  { label: "Valid pairs", value: "validPairs" },
  { label: "Revoked / invalid", value: "revokedPairs" },
  { label: "Validation unknown", value: "validationUnknownPairs" },
  { label: "Validation failed", value: "validationReadFailedPairs" },
  { label: "Public mock faucet", value: "publicFaucetPairs" },
  { label: "Restricted mint", value: "restrictedMintPairs" },
  { label: "Unknown / system", value: "unknownSystemPairs" },
];

export function RegistryHealth({ health }: { health: RegistryHealthModel }) {
  return (
    <div className="health-grid" aria-label="Registry status">
      {cards.map((card) => (
        <div className="health-card" key={card.value}>
          <span>{card.label}</span>
          <strong>{health[card.value]}</strong>
        </div>
      ))}
    </div>
  );
}
