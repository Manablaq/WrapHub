"use client";

import { AlertCircle, CheckCircle2, Eye, Loader2, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatUnits, getAddress, isAddress, type Address } from "viem";
import { useAccount, useChainId } from "wagmi";
import { useConfidentialBalanceHandle } from "@/hooks/use-confidential-balance-handle";
import { useDecryptConfidentialBalance } from "@/hooks/use-decrypt-confidential-balance";
import { shortenBytes32 } from "@/lib/format";
import {
  DEFAULT_CHAIN_ID,
  getSupportedNetwork,
  SUPPORTED_NETWORKS,
  type SupportedChainId,
} from "@/lib/networks/supported-networks";
import { getFriendlyUserDecryptionError } from "@/lib/zama/errors";
import { isZeroHandle as isEncryptedHandleZero } from "@/lib/zama/handles";

function formatDecryptedBalance(value: unknown, decimals: number) {
  if (typeof value === "bigint") {
    return formatUnits(value, decimals);
  }

  if (typeof value === "number" || typeof value === "string") {
    return formatUnits(BigInt(value), decimals);
  }

  return null;
}

function UniversalBalanceReader({
  tokenAddress,
  selectedChainId,
}: {
  tokenAddress: Address;
  selectedChainId: SupportedChainId;
}) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const selectedNetwork = getSupportedNetwork(selectedChainId);
  const isSelectedNetwork = chainId === selectedChainId;
  const handleRead = useConfidentialBalanceHandle(tokenAddress, address, selectedChainId);
  const decrypt = useDecryptConfidentialBalance({
    wrapperAddress: tokenAddress,
    handle: handleRead.handle,
  });
  const decrypted = formatDecryptedBalance(decrypt.decryptedValue, handleRead.decimals);
  const isZeroHandle = isEncryptedHandleZero(handleRead.handle);
  const isBusy =
    handleRead.isLoading ||
    decrypt.isCheckingPermit ||
    decrypt.isGrantingPermit ||
    decrypt.isDecrypting;
  const error = isZeroHandle
    ? null
    : getFriendlyUserDecryptionError(handleRead.error ?? decrypt.error);

  function submitDecrypt() {
    if (!isConnected || !isSelectedNetwork || !handleRead.handle || isZeroHandle || isBusy) {
      return;
    }

    void decrypt.decrypt();
  }

  return (
    <div className="universal-inspector-result">
      <div className="handle-row">
        <span>Token</span>
        <code>{tokenAddress}</code>
      </div>
      <div className="handle-row">
        <span>Metadata</span>
        <code>Unknown ERC-7984 token</code>
      </div>
      <div className="handle-row">
        <span>Encrypted handle</span>
        <code title={handleRead.handle}>
          {handleRead.handle ? shortenBytes32(handleRead.handle) : "Not loaded"}
        </code>
      </div>

      {!isConnected ? (
        <div className="action-notice">Connect a wallet to inspect this token balance.</div>
      ) : null}
      {isConnected && !isSelectedNetwork ? (
        <div className="action-notice warning">
          Switch to {selectedNetwork?.name ?? "the selected network"} before decrypting ERC-7984
          balances.
        </div>
      ) : null}
      {isConnected && isSelectedNetwork && isZeroHandle ? (
        <div className="inline-status">
          No encrypted balance detected for this wallet on this token.
        </div>
      ) : null}
      {error ? (
        <div className="inline-status danger">
          <AlertCircle size={15} />
          <span>{error.message}</span>
          {error.details && error.details !== error.message ? (
            <details>
              <summary>Error details</summary>
              <span>{error.details}</span>
            </details>
          ) : null}
        </div>
      ) : null}

      <button
        className="button secondary"
        type="button"
        disabled={!isConnected || !isSelectedNetwork || !handleRead.handle || isZeroHandle || isBusy}
        onClick={submitDecrypt}
      >
        {isBusy ? <Loader2 className="spin" size={15} /> : <Eye size={15} />}
        Decrypt connected-wallet balance
      </button>

      <div className="inline-status">
        Clear values appear only after wallet-authorized user-decryption and stay local to this
        browser session.
      </div>

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

export function UniversalBalanceInspector() {
  const [tokenInput, setTokenInput] = useState("");
  const connectedChainId = useChainId();
  const connectedNetwork = getSupportedNetwork(connectedChainId);
  const [selectedChainId, setSelectedChainId] = useState<SupportedChainId>(
    connectedNetwork?.chainId ?? DEFAULT_CHAIN_ID,
  );
  const normalizedAddress = useMemo<Address | null>(() => {
    const candidate = tokenInput.trim();

    if (!candidate || !isAddress(candidate)) {
      return null;
    }

    return getAddress(candidate);
  }, [tokenInput]);
  const hasInvalidInput = tokenInput.trim().length > 0 && !normalizedAddress;

  useEffect(() => {
    if (connectedNetwork) {
      setSelectedChainId(connectedNetwork.chainId);
    }
  }, [connectedNetwork]);

  return (
    <section className="universal-inspector-panel" aria-labelledby="universal-inspector-title">
      <div className="action-panel-header">
        <div>
          <span>Universal ERC-7984 Balance Inspector</span>
          <strong id="universal-inspector-title">Inspect any connected-wallet ERC-7984 balance</strong>
        </div>
      </div>

      <p>
        This inspector works for any ERC-7984 token address. Registry membership is not required for
        local user-decryption.
      </p>

      <label className="universal-address-field">
        <span>ERC-7984 token contract address</span>
        <div>
          <Search size={15} />
          <input
            type="text"
            value={tokenInput}
            onChange={(event) => setTokenInput(event.target.value)}
            placeholder="0x..."
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </label>

      <div className="network-choice-row" role="group" aria-label="Inspector network">
        {SUPPORTED_NETWORKS.map((network) => (
          <button
            className={network.chainId === selectedChainId ? "active" : undefined}
            key={network.chainId}
            type="button"
            onClick={() => setSelectedChainId(network.chainId)}
          >
            {network.name}
          </button>
        ))}
      </div>

      {getSupportedNetwork(selectedChainId)?.environment === "mainnet" ? (
        <div className="inline-status">
          Reading/decrypting is local and does not move assets. Write actions elsewhere may move
          real assets.
        </div>
      ) : null}

      {hasInvalidInput ? (
        <div className="inline-status warning">Enter a valid ERC-7984 token contract address.</div>
      ) : null}

      {!tokenInput.trim() ? (
        <div className="inline-status">
          Paste an ERC-7984 token address to read the encrypted balance handle for your connected
          wallet.
        </div>
      ) : null}

      {normalizedAddress ? (
        <UniversalBalanceReader tokenAddress={normalizedAddress} selectedChainId={selectedChainId} />
      ) : null}
    </section>
  );
}
