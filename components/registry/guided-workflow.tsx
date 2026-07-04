import { ArrowRight, CheckCircle2 } from "lucide-react";

const steps = [
  "Public mock faucet",
  "Approve wrapper",
  "Wrap confidentially",
  "Inspect balance",
  "Unwrap",
];

export function GuidedWorkflow() {
  return (
    <section className="guided-workflow" aria-label="Guided workflow">
      <div>
        <span>Guided Workflow</span>
        <h2>Fastest test path: cUSDCMock</h2>
        <p>
          Use <strong>0.01</strong> for wrap and <strong>0.005</strong> for unwrap when testing.
          The flow exercises every production action without leaving Sepolia.
        </p>
      </div>
      <div className="workflow-steps">
        {steps.map((step, index) => (
          <div className="workflow-step" key={step}>
            <CheckCircle2 size={15} />
            <span>{step}</span>
            {index < steps.length - 1 ? <ArrowRight className="workflow-arrow" size={14} /> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
