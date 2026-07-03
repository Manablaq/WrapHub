"use client";

import { AlertCircle, CheckCircle2, Eye, Loader2 } from "lucide-react";
import { formatUnits } from "viem";
import { useAccount, useChainId } from "wagmi";
import { sepolia } from "wagmi/chains";
import { useConfidentialBalanceHandle } from "@/hooks/use-confidential-balance-handle";
import { useDecryptConfidentialBalance } from "@/hooks/use-decrypt-confidential-balance";
import { shortenBytes32 } from "@/lib/format";
import type { EnrichedRegistryPair } from "@/lib/registry/types";

function formatDecryptedBalance(value: unknown, decimals: number) {
  if (typeof value === "bigint") {
    return formatUnits(value, decimals);
  }

  if (typeof value === "number" || typeof value === "string") {
    return formatUnits(BigInt(value), decimals);
  }

  return null;
}

function friendlyError(error: Error | null | undefined) {
  if (!error) {
    return null;
  }

  const message = error.message.split("\n")[0] ?? "Decryption failed.";

  if (message.toLowerCase().includes("user rejected")) {
    return "Signature rejected in wallet.";
  }

  return message;
}

export function ConfidentialBalanceInspector({ pair }: { pair: EnrichedRegistryPair }) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isSepolia = chainId === sepolia.id;
  const handleRead = useConfidentialBalanceHandle(pair.wrapperAddress, address);
  const decrypt = useDecryptConfidentialBalance({
    wrapperAddress: pair.wrapperAddress,
    handle: handleRead.handle,
  });

  const decrypted = formatDecryptedBalance(decrypt.decryptedValue, handleRead.decimals);
  const error = friendlyError(handleRead.error ?? decrypt.error);
  const isBusy =
    handleRead.isLoading ||
    decrypt.isCheckingPermit ||
    decrypt.isGrantingPermit ||
    decrypt.isDecrypting;

  return (
    <div className="confidential-panel">
      <div className="action-panel-header">
        <div>
          <span>Confidential Balance Inspector</span>
          <strong>Decrypt your ERC-7984 balance</strong>
        </div>
      </div>

      {!isConnected ? (
        <div className="action-notice">Connect a wallet to inspect your confidential balance.</div>
      ) : null}
      {isConnected && !isSepolia ? (
        <div className="action-notice warning">
          Switch to Sepolia before reading or decrypting confidential balances.
        </div>
      ) : null}

      <div className="handle-row">
        <span>Encrypted handle</span>
        <code title={handleRead.handle}>
          {handleRead.handle ? shortenBytes32(handleRead.handle) : "Not loaded"}
        </code>
      </div>

      <button
        className="button secondary"
        type="button"
        disabled={!isConnected || !isSepolia || !handleRead.handle || isBusy}
        onClick={() => void decrypt.decrypt()}
      >
        {isBusy ? <Loader2 className="spin" size={15} /> : <Eye size={15} />}
        Decrypt my ERC-7984 balance
      </button>

      <div className="inline-status">
        EIP-712 signature authorizes local user-decryption. The clear balance is not posted
        on-chain.
      </div>

      {error ? (
        <div className="inline-status danger">
          <AlertCircle size={15} />
          {error}
        </div>
      ) : null}

      {decrypted !== null ? (
        <div className="decrypt-result">
          <CheckCircle2 size={16} />
          <div>
            <span>Decrypted balance</span>
            <strong>{decrypted}</strong>
            {decrypt.lastDecryptedAt ? (
              <small>Last decrypted {decrypt.lastDecryptedAt.toLocaleTimeString()}</small>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
