import type { RegistryHealth as RegistryHealthModel } from "@/lib/registry/types";

const cards: Array<{ label: string; value: keyof RegistryHealthModel }> = [
  { label: "Total pairs", value: "totalPairs" },
  { label: "Valid pairs", value: "validPairs" },
  { label: "Revoked pairs", value: "revokedPairs" },
  { label: "Public faucets", value: "publicFaucetPairs" },
  { label: "Restricted", value: "restrictedPairs" },
  { label: "Metadata known", value: "metadataKnownPairs" },
];

export function RegistryHealth({ health }: { health: RegistryHealthModel }) {
  return (
    <div className="health-grid" aria-label="Registry health">
      {cards.map((card) => (
        <div className="health-card" key={card.value}>
          <span>{card.label}</span>
          <strong>{health[card.value]}</strong>
        </div>
      ))}
    </div>
  );
}
