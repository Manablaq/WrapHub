import { DeveloperPanel } from "@/components/registry/developer-panel";
import { Reveal } from "@/components/ui/reveal";
import { OFFICIAL_REGISTRY_ADDRESS } from "@/lib/contracts/registry";

export default function DeveloperConsolePage() {
  return (
    <main className="page-flow page-shell">
      <section className="developer-console-page">
        <div className="section-header">
          <div>
            <span className="section-kicker">Developer Console</span>
            <h1>Registry integration details.</h1>
            <p>
              Technical references for the official Sepolia wrapper registry, validation behavior,
              wrapper calls, and Zama SDK flows used by WrapHub.
            </p>
          </div>
          <div className="registry-address">
            Official registry
            <code>{OFFICIAL_REGISTRY_ADDRESS}</code>
          </div>
        </div>
        <Reveal>
          <DeveloperPanel />
        </Reveal>
      </section>
    </main>
  );
}
