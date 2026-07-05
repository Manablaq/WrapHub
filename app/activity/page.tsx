import { TransactionTimeline } from "@/components/registry/transaction-timeline";
import { Reveal } from "@/components/ui/reveal";

export default function ActivityPage() {
  return (
    <main className="page-flow page-shell">
      <section className="activity-page">
        <div className="section-header">
          <div>
            <span className="section-kicker">Session Activity</span>
            <h1>Local transaction operations.</h1>
            <p>
              Review submitted and confirmed wallet actions stored locally in this browser, with
              direct Sepolia Etherscan links.
            </p>
          </div>
        </div>
        <Reveal>
          <TransactionTimeline />
        </Reveal>
      </section>
    </main>
  );
}
