import { ArrowRight, DatabaseZap, ShieldCheck, WalletCards } from "lucide-react";
import Link from "next/link";
import { RegistryExplorer } from "@/components/registry/registry-explorer";
import { OFFICIAL_REGISTRY_ADDRESS } from "@/lib/contracts/registry";

const featureCards = [
  {
    title: "Official Registry",
    description: "Reads Sepolia pairs directly from Zama's deployed registry contract.",
    icon: DatabaseZap,
  },
  {
    title: "Sepolia Guarded",
    description: "Wallet actions stay scoped to the supported Sepolia deployment.",
    icon: ShieldCheck,
  },
  {
    title: "Wrapper Console",
    description: "Mint, approve, wrap, decrypt, and unwrap from one focused interface.",
    icon: WalletCards,
  },
];

export default function Home() {
  return (
    <div>
      <section className="hero-section">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Official ERC-20 ↔ ERC-7984 wrapper console</p>
            <h1>WrapHub</h1>
            <p className="hero-lede">
              Confidential wrapper operations for official Sepolia pairs, from registry discovery
              through encrypted balance inspection and unwrap settlement.
            </p>
            <div className="hero-actions">
              <Link className="primary-link" href="#registry-explorer">
                Explore Registry <ArrowRight size={18} />
              </Link>
              <a
                className="secondary-link"
                href={`https://sepolia.etherscan.io/address/${OFFICIAL_REGISTRY_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
              >
                View Registry
              </a>
            </div>
          </div>
          <div className="hero-panel" aria-label="Registry details">
            <span>Official Sepolia Registry</span>
            <code>{OFFICIAL_REGISTRY_ADDRESS}</code>
            <div className="hero-panel-grid">
              <div>
                <strong>8</strong>
                <span>Known official pairs</span>
              </div>
              <div>
                <strong>7</strong>
                <span>Public faucet mocks</span>
              </div>
              <div>
                <strong>1</strong>
                <span>Restricted mint pair</span>
              </div>
            </div>
          </div>
        </div>
        <div className="feature-row">
          {featureCards.map((feature) => {
            const Icon = feature.icon;
            return (
              <div className="feature-card" key={feature.title}>
                <Icon size={22} />
                <div>
                  <h2>{feature.title}</h2>
                  <p>{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <RegistryExplorer />
    </div>
  );
}
