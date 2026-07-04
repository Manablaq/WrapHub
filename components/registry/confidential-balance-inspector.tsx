"use client";

import { AlertCircle, CheckCircle2, Eye, Loader2 } from "lucide-react";
import { formatUnits, parseUnits } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { sepolia } from "wagmi/chains";
import { useConfidentialBalanceHandle } from "@/hooks/use-confidential-balance-handle";
import { useDecryptConfidentialBalance } from "@/hooks/use-decrypt-confidential-balance";
import { useUnwrapToken } from "@/hooks/use-unwrap-token";
import { sepoliaTxUrl, shortenBytes32 } from "@/lib/format";
import type { EnrichedRegistryPair } from "@/lib/registry/types";
import { useTransactionHistory } from "@/hooks/use-transaction-history";

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
  const [unwrapAmount, setUnwrapAmount] = useState("");
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const queryClient = useQueryClient();
  const { trackTransaction, updateTransactionStatus } = useTransactionHistory();
  const isSepolia = chainId === sepolia.id;
  const handleRead = useConfidentialBalanceHandle(pair.wrapperAddress, address);
  const decrypt = useDecryptConfidentialBalance({
    wrapperAddress: pair.wrapperAddress,
    handle: handleRead.handle,
  });
  const unwrap = useUnwrapToken(pair.wrapperAddress);
  const processedUnwrapHash = useRef<`0x${string}` | null>(null);

  const decrypted = formatDecryptedBalance(decrypt.decryptedValue, handleRead.decimals);
  const parsedUnwrapAmount = useMemo(() => {
    try {
      return unwrapAmount.trim() ? parseUnits(unwrapAmount.trim(), handleRead.decimals) : 0n;
    } catch {
      return null;
    }
  }, [handleRead.decimals, unwrapAmount]);
  const unwrapAmountError = useMemo(() => {
    if (!unwrapAmount.trim()) {
      return "Enter an unwrap amount.";
    }

    if (parsedUnwrapAmount === null) {
      return "Enter a valid unwrap amount.";
    }

    if (parsedUnwrapAmount <= 0n) {
      return "Amount must be greater than zero.";
    }

    if (typeof decrypt.decryptedValue === "bigint" && parsedUnwrapAmount > decrypt.decryptedValue) {
      return "Amount exceeds the last decrypted confidential balance.";
    }

    return null;
  }, [decrypt.decryptedValue, parsedUnwrapAmount, unwrapAmount]);
  const error = friendlyError(handleRead.error ?? decrypt.error);
  const unwrapError = friendlyError(unwrap.error);
  const isBusy =
    handleRead.isLoading ||
    decrypt.isCheckingPermit ||
    decrypt.isGrantingPermit ||
    decrypt.isDecrypting;
  const isUnwrapping = unwrap.isPending;
  const canUnwrap =
    isConnected &&
    isSepolia &&
    parsedUnwrapAmount !== null &&
    parsedUnwrapAmount > 0n &&
    !unwrapAmountError &&
    !isUnwrapping;

  useEffect(() => {
    const finalizeHash = unwrap.data?.txHash;

    if (!unwrap.isSuccess || !finalizeHash || processedUnwrapHash.current === finalizeHash) {
      return;
    }

    processedUnwrapHash.current = finalizeHash;
    setUnwrapAmount("");
    decrypt.reset();
    void handleRead.refetch();
    void queryClient.invalidateQueries();
  }, [decrypt, handleRead, queryClient, unwrap.data?.txHash, unwrap.isSuccess]);

  useEffect(() => {
    if (unwrap.requestHash) {
      trackTransaction({
        hash: unwrap.requestHash,
        action: "unwrap-request",
        symbol: pair.symbol,
        status: "submitted",
      });
    }

    if (unwrap.finalizeHash) {
      trackTransaction({
        hash: unwrap.finalizeHash,
        action: "unwrap-finalize",
        symbol: pair.symbol,
        status: unwrap.isSuccess ? "confirmed" : "submitted",
      });
    }

    if (unwrap.isSuccess && unwrap.finalizeHash) {
      updateTransactionStatus(unwrap.finalizeHash, "confirmed");
    }

    if (
      unwrap.requestHash &&
      (unwrap.phase === "finalizing" ||
        unwrap.phase === "finalize-submitted" ||
        unwrap.isSuccess)
    ) {
      updateTransactionStatus(unwrap.requestHash, "confirmed");
    }
  }, [
    pair.symbol,
    trackTransaction,
    unwrap.finalizeHash,
    unwrap.isSuccess,
    unwrap.phase,
    unwrap.requestHash,
    updateTransactionStatus,
  ]);

  function submitUnwrap() {
    if (!canUnwrap || parsedUnwrapAmount === null) {
      return;
    }

    unwrap.unwrap(parsedUnwrapAmount);
  }

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

      <div className="unwrap-section">
        <div className="action-panel-header">
          <div>
            <span>Unwrap confidential token</span>
            <strong>Convert ERC-7984 back to ERC-20</strong>
          </div>
        </div>

        {decrypted !== null ? (
          <div className="inline-status success">
            <CheckCircle2 size={15} />
            Last decrypted balance available for validation.
          </div>
        ) : (
          <div className="inline-status">
            Decrypt first for local balance validation, or submit and let the SDK validate before
            unwrapping.
          </div>
        )}

        <label className="amount-field">
          <span>Unwrap amount</span>
          <input
            inputMode="decimal"
            placeholder="0.0"
            value={unwrapAmount}
            onChange={(event) => setUnwrapAmount(event.target.value)}
          />
        </label>

        {unwrapAmount.trim() && unwrapAmountError ? (
          <div className="inline-status warning">
            <AlertCircle size={15} />
            {unwrapAmountError}
          </div>
        ) : null}

        <button
          className="button primary"
          type="button"
          disabled={!canUnwrap}
          onClick={submitUnwrap}
        >
          {isUnwrapping ? <Loader2 className="spin" size={15} /> : null}
          Unwrap to ERC-20
        </button>

        {isUnwrapping ? (
          <div className="inline-status">
            {unwrap.phase === "encrypting" ? "Encrypting unwrap amount..." : null}
            {unwrap.phase === "unwrap-submitted" ? "Unwrap request submitted..." : null}
            {unwrap.phase === "finalizing" ? "Finalizing with public decryption proof..." : null}
            {unwrap.phase === "finalize-submitted" ? "Finalize transaction submitted..." : null}
          </div>
        ) : null}

        {unwrapError ? (
          <div className="inline-status danger">
            <AlertCircle size={15} />
            {unwrapError}
          </div>
        ) : null}

        {unwrap.unwrapHash ? (
          <div className="tx-status">
            <CheckCircle2 size={15} />
            <span>{unwrap.isSuccess ? "Unwrap confirmed" : "Unwrap submitted"}</span>
            <a href={sepoliaTxUrl(unwrap.unwrapHash)} target="_blank" rel="noreferrer">
              View tx
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}
