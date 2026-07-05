import { NetworkAddressMatrix } from "@/components/developer/network-address-matrix";
import { UniversalBalanceInspector } from "@/components/developer/universal-balance-inspector";
import { DeveloperPanel } from "@/components/registry/developer-panel";
import { Reveal } from "@/components/ui/reveal";
import {
  getRpcStrategyLabel,
  SUPPORTED_NETWORKS,
} from "@/lib/networks/supported-networks";

const alchemyKeyConfigured = Boolean(process.env.NEXT_PUBLIC_ALCHEMY_API_KEY);

export default function DeveloperConsolePage() {
  return (
    <main className="page-flow page-shell">
      <section className="developer-console-page">
        <div className="section-header">
          <div>
            <span className="section-kicker">Developer Console</span>
            <h1>Registry integration details.</h1>
            <p>
              Technical references for supported registries, validation behavior, wrapper calls,
              local configuration, and Zama SDK flows used by WrapHub.
            </p>
          </div>
          <div className="registry-address">
            Supported networks
            <code>Sepolia · Ethereum Mainnet</code>
          </div>
        </div>
        <div className="developer-support-grid">
          <div>
            <span>Registry source</span>
            <strong>Official registries</strong>
            <p>Onchain registry reads remain the primary source for wrapper pair coverage.</p>
          </div>
          <div>
            <span>Extension point</span>
            <strong>Local pair config</strong>
            <p>Custom or development-only pairs can be added without replacing registry data.</p>
          </div>
          <div>
            <span>Universal inspection</span>
            <strong>Any ERC-7984 token</strong>
            <p>Connected wallets can inspect and decrypt balances outside registry membership.</p>
          </div>
          <div>
            <span>Supported network</span>
            <strong>Sepolia and Ethereum Mainnet</strong>
            <p>Clear confidential values require wallet-authorized local user-decryption.</p>
          </div>
        </div>
        <div className="action-notice warning">
          Ethereum Mainnet uses real assets. Verify registry addresses, token addresses, and amounts
          before approving, wrapping, or unwrapping.
        </div>
        <Reveal>
          <section className="supported-networks-panel" aria-label="Supported networks">
            {SUPPORTED_NETWORKS.map((network) => (
              <div key={network.chainId}>
                <span>{network.environment === "mainnet" ? "Real-asset network" : "Test network"}</span>
                <strong>{network.name}</strong>
                <code>{network.registryAddress}</code>
                <p>
                  Public faucet: {network.supportsPublicFaucet ? "Sepolia official mocks only" : "Not available"}
                </p>
                <p>RPC strategy: {getRpcStrategyLabel(alchemyKeyConfigured ? "configured" : undefined)}</p>
              </div>
            ))}
          </section>
        </Reveal>
        <Reveal>
          <NetworkAddressMatrix />
        </Reveal>
        <Reveal>
          <UniversalBalanceInspector />
        </Reveal>
        <Reveal>
          <DeveloperPanel />
        </Reveal>
      </section>
    </main>
  );
}
