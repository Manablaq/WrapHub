import { registryReadSnippet } from "@/lib/registry/snippets";

export function DeveloperPanel() {
  return (
    <details className="developer-panel" id="developer-mode">
      <summary>Developer mode: registry read snippet</summary>
      <pre>
        <code>{registryReadSnippet}</code>
      </pre>
    </details>
  );
}
