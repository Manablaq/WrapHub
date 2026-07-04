import { registryReadSnippet } from "@/lib/registry/snippets";

export function DeveloperPanel() {
  return (
    <details className="developer-panel" id="developer-console">
      <summary>
        <span>Developer Console</span>
        <strong>Registry integration details</strong>
      </summary>
      <p>
        Contract calls, validation assumptions, and Zama SDK flow references used by the console.
      </p>
      <pre>
        <code>{registryReadSnippet}</code>
      </pre>
    </details>
  );
}
