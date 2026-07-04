import { LockKeyhole, ShieldCheck } from "lucide-react";

export function ConfidentialFlowEngine() {
  return (
    <div className="flow-engine" aria-label="Confidential flow engine">
      <div className="flow-engine-orbit orbit-one" />
      <div className="flow-engine-orbit orbit-two" />
      <div className="flow-engine-core">
        <ShieldCheck size={28} />
        <LockKeyhole size={18} />
      </div>

      <div className="flow-node flow-node-left">
        <span>ERC-20</span>
        <strong>Public asset</strong>
      </div>
      <div className="flow-node flow-node-right">
        <span>ERC-7984</span>
        <strong>Confidential balance</strong>
      </div>
      <div className="flow-node flow-node-bottom">
        <span>Local decrypt</span>
        <strong>EIP-712</strong>
      </div>
      <div className="flow-chip">FHE</div>

      <svg className="flow-lines" viewBox="0 0 560 420" role="presentation" aria-hidden="true">
        <defs>
          <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(88, 211, 194, 0)" />
            <stop offset="48%" stopColor="rgba(155, 231, 221, 0.9)" />
            <stop offset="100%" stopColor="rgba(110, 231, 168, 0)" />
          </linearGradient>
          <filter id="flowGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          className="flow-path flow-path-main"
          d="M86 204 C170 118 248 118 280 204 C312 290 390 290 474 204"
        />
        <path className="flow-path flow-path-return" d="M474 224 C384 326 176 326 86 224" />
        <circle className="flow-particle particle-one" r="5" />
        <circle className="flow-particle particle-two" r="4" />
        <circle className="flow-particle particle-three" r="3.5" />
      </svg>
    </div>
  );
}
