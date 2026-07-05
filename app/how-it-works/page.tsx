import { DatabaseZap, Eye, LockKeyhole, Network, Repeat2, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

const workflowCards = [
  {
    title: "Discover",
    description: "Read official ERC-20 ↔ ERC-7984 pairs directly from supported registries.",
    icon: DatabaseZap,
  },
  {
    title: "Wrap",
    description:
      "Mint supported public mocks, approve wrappers, and convert ERC-20 into confidential balances.",
    icon: Repeat2,
  },
  {
    title: "Inspect",
    description: "Use EIP-712 user-decryption to inspect your ERC-7984 balance locally.",
    icon: Eye,
  },
  {
    title: "Unwrap",
    description:
      "Settle confidential balances back to ERC-20 through Zama's encrypted request/finalize flow.",
    icon: ShieldCheck,
  },
];

const protocolItems = [
  {
    title: "Registry source",
    copy: "Official wrapper registry for each supported network.",
    icon: DatabaseZap,
  },
  {
    title: "Wrap path",
    copy: "ERC-20 approve → wrapper.wrap(to, amount).",
    icon: Network,
  },
  {
    title: "Balance privacy",
    copy: "ERC-7984 balances remain encrypted until user-decryption.",
    icon: LockKeyhole,
  },
  {
    title: "Local-only clear values",
    copy: "Clear balances are shown only after wallet-authorized decryption.",
    icon: Eye,
  },
];

export default function HowItWorksPage() {
  return (
    <main className="page-flow">
      <Reveal as="section" className="how-it-works page-section" ariaLabel="How WrapHub works">
        <div className="landing-section-header">
          <p className="eyebrow">How it works</p>
          <h1>From public test assets to confidential balances.</h1>
          <p>
            WrapHub turns the official wrapper registry into a focused workflow for discovery,
            wrapping, local inspection, and encrypted settlement.
          </p>
        </div>

        <div className="feature-row how-card-grid">
          {workflowCards.map((feature) => {
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

        <section className="protocol-intelligence" aria-label="Protocol Intelligence summary">
          <div className="panel-heading">
            <span>Protocol Intelligence</span>
            <h2>Mechanics behind the console</h2>
          </div>
          <div className="intelligence-grid">
            {protocolItems.map((item) => {
              const Icon = item.icon;
              return (
                <div className="intelligence-card" key={item.title}>
                  <Icon size={18} />
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.copy}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </Reveal>
    </main>
  );
}
