import { ArrowRight, DatabaseZap, Eye, Repeat2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { ConfidentialFlowEngine } from "@/components/landing/confidential-flow-engine";
import { RegistryExplorer } from "@/components/registry/registry-explorer";
import { Reveal } from "@/components/ui/reveal";
import { OFFICIAL_REGISTRY_ADDRESS } from "@/lib/contracts/registry";

const howItWorksCards = [
  {
    title: "Discover",
    description: "Read official ERC-20 ↔ ERC-7984 pairs directly from the Sepolia registry.",
    icon: DatabaseZap,
  },
  {
    title: "Wrap",
    description: "Mint supported public mocks, approve wrappers, and convert ERC-20 into confidential balances.",
    icon: Repeat2,
  },
  {
    title: "Inspect",
    description: "Use EIP-712 user-decryption to inspect your ERC-7984 balance locally.",
    icon: Eye,
  },
  {
    title: "Unwrap",
    description: "Settle confidential balances back to ERC-20 through Zama's encrypted request/finalize flow.",
    icon: ShieldCheck,
  },
];

export default function Home() {
  return (
    <div className="page-flow">
      <Reveal as="section" className="hero-section landing-hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Confidential Wrapper Console</p>
            <h1>Private token flows, verified on Sepolia.</h1>
            <p className="hero-lede">
              WrapHub helps users discover official ERC-20 ↔ ERC-7984 wrapper pairs, convert
              public test assets into confidential balances, inspect balances locally, and unwrap
              through encrypted settlement.
            </p>
            <div className="hero-actions">
              <Link className="primary-link" href="#registry-explorer">
                Launch App <ArrowRight size={18} />
              </Link>
              <Link className="secondary-link" href="#how-it-works">
                How it works
              </Link>
            </div>
            <div className="hero-proof-row" aria-label="Product capabilities">
              <span>Official registry source</span>
              <span>Local-only decrypt</span>
              <span>Encrypted settlement</span>
            </div>
          </div>
          <div className="hero-panel command-card" aria-label="WrapHub registry command card">
            <div className="command-card-top">
              <span>Confidential Flow Engine</span>
              <strong>ERC-20 to ERC-7984</strong>
            </div>
            <ConfidentialFlowEngine />
            <a
              className="registry-command-address"
              href={`https://sepolia.etherscan.io/address/${OFFICIAL_REGISTRY_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
            >
              {OFFICIAL_REGISTRY_ADDRESS}
            </a>
            <div className="command-metrics">
              <div>
                <span>Registry source</span>
                <strong>Official Sepolia registry</strong>
              </div>
              <div>
                <span>Known official pairs</span>
                <strong>8</strong>
              </div>
              <div>
                <span>Public mock faucets</span>
                <strong>7</strong>
              </div>
              <div>
                <span>Confidential balance</span>
                <strong>Local-only decrypt</strong>
              </div>
            </div>
            <div className="command-card-footer">
              <ShieldCheck size={16} />
              <span>Registry is source of truth. Metadata only enriches presentation.</span>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="how-it-works" id="how-it-works" ariaLabel="How WrapHub works">
        <div className="landing-section-header">
          <p className="eyebrow">How it works</p>
          <h2>From public test assets to confidential balances.</h2>
          <p>
            WrapHub turns the official wrapper registry into a focused workflow for discovery,
            wrapping, local inspection, and encrypted settlement.
          </p>
        </div>
        <div className="feature-row how-card-grid">
          {howItWorksCards.map((feature) => {
            const Icon = feature.icon;
            return (
              <Reveal as="article" className="feature-card how-card" key={feature.title}>
                <Icon size={22} />
                <div>
                  <h2>{feature.title}</h2>
                  <p>{feature.description}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Reveal>

      <RegistryExplorer />
    </div>
  );
}
