import { Activity, ArrowRight, Code2, DatabaseZap, LayoutDashboard, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { ConfidentialFlowEngine } from "@/components/landing/confidential-flow-engine";
import { Reveal } from "@/components/ui/reveal";
import { addressExplorerUrl, getDefaultNetwork } from "@/lib/networks/supported-networks";

const defaultNetwork = getDefaultNetwork();

const previewCards = [
  {
    title: "Portfolio",
    description: "Review active holdings and wallet readiness across official wrapper pairs.",
    href: "/portfolio",
    icon: LayoutDashboard,
  },
  {
    title: "Registry",
    description: "Open the full registry console for faucet, approve, wrap, decrypt, and unwrap.",
    href: "/registry",
    icon: DatabaseZap,
  },
  {
    title: "Activity",
    description: "Inspect local session transactions with filters and network-specific Etherscan links.",
    href: "/activity",
    icon: Activity,
  },
  {
    title: "Developer Console",
    description: "Review registry integration details, function names, and protocol addresses.",
    href: "/developer-console",
    icon: Code2,
  },
];

export default function Home() {
  return (
    <div className="page-flow">
      <Reveal as="section" className="hero-section landing-hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Confidential Wrapper Console</p>
            <h1>Private token flows, verified across official networks.</h1>
            <p className="hero-lede">
              WrapHub helps users discover official ERC-20 ↔ ERC-7984 wrapper pairs, convert
              supported assets into confidential balances, inspect balances locally, and unwrap
              through encrypted settlement on Sepolia and Ethereum Mainnet.
            </p>
            <div className="hero-actions">
              <Link className="primary-link" href="/registry">
                Launch Console <ArrowRight size={18} />
              </Link>
              <Link className="secondary-link" href="/how-it-works">
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
              href={addressExplorerUrl(defaultNetwork.registryAddress, defaultNetwork.chainId)}
              target="_blank"
              rel="noreferrer"
            >
              {defaultNetwork.registryAddress}
            </a>
            <div className="command-metrics">
              <div>
                <span>Registry source</span>
                <strong>Official registry</strong>
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

      <Reveal as="section" className="how-it-works" ariaLabel="WrapHub product areas">
        <div className="landing-section-header">
          <p className="eyebrow">Product surface</p>
          <h2>Choose the workspace you need.</h2>
          <p>
            Start with the registry console, monitor connected-wallet readiness, or inspect local
            session activity and integration details.
          </p>
        </div>
        <div className="feature-row how-card-grid">
          {previewCards.map((feature) => {
            const Icon = feature.icon;
            return (
              <Reveal as="article" className="feature-card how-card" key={feature.title}>
                <Icon size={22} />
                <div>
                  <h2>{feature.title}</h2>
                  <p>{feature.description}</p>
                  <Link className="card-link" href={feature.href}>
                    Open <ArrowRight size={14} />
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Reveal>
    </div>
  );
}
