import { ArrowDown, CheckCircle2 } from "lucide-react";

const steps = ["Faucet", "Approve", "Wrap", "Decrypt", "Unwrap"];

export function GuidedWorkflow() {
  return (
    <section className="guided-workflow" aria-label="Guided workflow">
      <div>
        <span>Guided Workflow</span>
        <h2>Fastest test path: cUSDCMock</h2>
        <p>
          Use the public mock faucet, mint and wrap <strong>0.01</strong>, inspect the
          confidential balance locally, then unwrap <strong>0.005</strong> back to ERC-20.
        </p>
      </div>
      <div className="workflow-steps">
        {steps.map((step, index) => (
          <div className="workflow-step" key={step}>
            <CheckCircle2 size={15} />
            <span>{step}</span>
            {index < steps.length - 1 ? <ArrowDown size={14} /> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
