import { registryReadSnippet } from "@/lib/registry/snippets";

export function DeveloperPanel() {
  return (
    <details className="developer-panel" id="developer-console">
      <summary>Developer Console: registry integration details</summary>
      <pre>
        <code>{registryReadSnippet}</code>
      </pre>
    </details>
  );
}
