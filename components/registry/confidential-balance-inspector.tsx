"use client";

import { AlertCircle, CheckCircle2, Eye, Loader2 } from "lucide-react";
import { formatUnits, parseUnits } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { useConfidentialBalanceHandle } from "@/hooks/use-confidential-balance-handle";
import { useDecryptConfidentialBalance } from "@/hooks/use-decrypt-confidential-balance";
import { useUnwrapToken } from "@/hooks/use-unwrap-token";
import { shortenBytes32 } from "@/lib/format";
import { getNetworkOrDefault, txExplorerUrl } from "@/lib/networks/supported-networks";
import type { EnrichedRegistryPair } from "@/lib/registry/types";
import { useTransactionHistory } from "@/hooks/use-transaction-history";
import {
  clearLocalDecryptedBalance,
  recordLocalDecryptedBalance,
} from "@/hooks/use-local-decrypted-balances";
import { getFriendlyUserDecryptionError } from "@/lib/zama/errors";
import { isZeroHandle } from "@/lib/zama/handles";

function formatDecryptedBalance(value: unknown, decimals: number) {
  if (typeof value === "bigint") {
    return formatUnits(value, decimals);
  }

  if (typeof value === "number" || typeof value === "string") {
    return formatUnits(BigInt(value), decimals);
  }

  return null;
}

export function ConfidentialBalanceInspector({ pair }: { pair: EnrichedRegistryPair }) {
  const [unwrapAmount, setUnwrapAmount] = useState("");
  const [mainnetUnwrapConfirmed, setMainnetUnwrapConfirmed] = useState(false);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const queryClient = useQueryClient();
  const { trackTransaction, updateTransactionStatus } = useTransactionHistory();
  const pairNetwork = getNetworkOrDefault(pair.chainId);
  const isPairNetwork = chainId === pair.chainId;
  const isMainnetPair = pairNetwork.environment === "mainnet";
  const handleRead = useConfidentialBalanceHandle(pair.wrapperAddress, address, pair.chainId);
  const decrypt = useDecryptConfidentialBalance({
    wrapperAddress: pair.wrapperAddress,
    handle: handleRead.handle,
  });
  const unwrap = useUnwrapToken(pair.wrapperAddress);
  const processedUnwrapHash = useRef<`0x${string}` | null>(null);

  const decrypted = formatDecryptedBalance(decrypt.decryptedValue, handleRead.decimals);
  const hasZeroHandle = isZeroHandle(handleRead.handle);
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
  const error = hasZeroHandle
    ? null
    : getFriendlyUserDecryptionError(handleRead.error ?? decrypt.error);
  const unwrapError = getFriendlyUserDecryptionError(unwrap.error, "Unwrap failed. Check wallet, network, or relayer connectivity.");
  const isBusy =
    handleRead.isLoading ||
    decrypt.isCheckingPermit ||
    decrypt.isGrantingPermit ||
    decrypt.isDecrypting;
  const isUnwrapping = unwrap.isPending;
  const canWriteMainnet = !isMainnetPair || mainnetUnwrapConfirmed;
  const canUnwrap =
    isConnected &&
    isPairNetwork &&
    canWriteMainnet &&
    parsedUnwrapAmount !== null &&
    parsedUnwrapAmount > 0n &&
    !unwrapAmountError &&
    !isUnwrapping;
  const canDecrypt =
    isConnected && isPairNetwork && Boolean(handleRead.handle) && !hasZeroHandle && !isBusy;

  useEffect(() => {
    const finalizeHash = unwrap.data?.txHash;

    if (!unwrap.isSuccess || !finalizeHash || processedUnwrapHash.current === finalizeHash) {
      return;
    }

    processedUnwrapHash.current = finalizeHash;
    setUnwrapAmount("");
    if (address) {
      clearLocalDecryptedBalance(pair.chainId, address, pair.wrapperAddress);
    }
    decrypt.reset();
    void handleRead.refetch();
    void queryClient.invalidateQueries();
  }, [
    address,
    decrypt,
    handleRead,
    pair.chainId,
    pair.wrapperAddress,
    queryClient,
    unwrap.data?.txHash,
    unwrap.isSuccess,
  ]);

  useEffect(() => {
    if (unwrap.requestHash) {
      trackTransaction({
        hash: unwrap.requestHash,
        chainId: pair.chainId,
        action: "unwrap-request",
        symbol: pair.displaySymbol,
        status: "submitted",
      });
    }

    if (unwrap.finalizeHash) {
      trackTransaction({
        hash: unwrap.finalizeHash,
        chainId: pair.chainId,
        action: "unwrap-finalize",
        symbol: pair.displaySymbol,
        status: unwrap.isSuccess ? "confirmed" : "submitted",
      });
    }

    if (unwrap.isSuccess && unwrap.finalizeHash) {
      updateTransactionStatus(unwrap.finalizeHash, "confirmed", pair.chainId);
    }

    if (
      unwrap.requestHash &&
      (unwrap.phase === "finalizing" ||
        unwrap.phase === "finalize-submitted" ||
        unwrap.isSuccess)
    ) {
      updateTransactionStatus(unwrap.requestHash, "confirmed", pair.chainId);
    }
  }, [
    pair.displaySymbol,
    pair.chainId,
    trackTransaction,
    unwrap.finalizeHash,
    unwrap.isSuccess,
    unwrap.phase,
    unwrap.requestHash,
    updateTransactionStatus,
  ]);

  useEffect(() => {
    if (!address || unwrap.isSuccess || typeof decrypt.decryptedValue !== "bigint") {
      return;
    }

    recordLocalDecryptedBalance({
      chainId: pair.chainId,
      accountAddress: address,
      wrapperAddress: pair.wrapperAddress,
      value: decrypt.decryptedValue.toString(),
      decimals: handleRead.decimals,
    });
  }, [
    address,
    decrypt.decryptedValue,
    handleRead.decimals,
    pair.chainId,
    pair.wrapperAddress,
    unwrap.isSuccess,
  ]);

  function submitUnwrap() {
    if (!canUnwrap || parsedUnwrapAmount === null) {
      return;
    }

    unwrap.unwrap(parsedUnwrapAmount);
  }

  function submitDecrypt() {
    if (!canDecrypt) {
      return;
    }

    void decrypt.decrypt();
  }

  return (
    <div className="confidential-panel">
      <div className="action-panel-header">
        <div>
          <span>Confidential Balance Inspector</span>
          <strong>Inspect your ERC-7984 balance locally</strong>
        </div>
      </div>

      {!isConnected ? (
        <div className="action-notice">Connect a wallet to inspect your confidential balance.</div>
      ) : null}
      {isConnected && !isPairNetwork ? (
        <div className="action-notice warning">
          Switch to {pair.networkName} before reading or decrypting confidential balances.
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
        disabled={!canDecrypt}
        onClick={submitDecrypt}
      >
        {isBusy ? <Loader2 className="spin" size={15} /> : <Eye size={15} />}
        Decrypt my ERC-7984 balance
      </button>

      {isConnected && isPairNetwork && hasZeroHandle ? (
        <div className="inline-status">
          No encrypted balance detected for this wallet on this token.
        </div>
      ) : null}

      <div className="inline-status">
        EIP-712 authorization enables local user-decryption. The clear balance is never posted
        on-chain by WrapHub.
      </div>

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
            <strong>Settle ERC-7984 back to ERC-20</strong>
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

        {isMainnetPair ? (
          <>
            <div className="action-notice warning">
              Ethereum Mainnet unwraps move real assets back to the ERC-20 token. Verify the amount
              before continuing.
            </div>
            <label className="mainnet-confirmation">
              <input
                type="checkbox"
                checked={mainnetUnwrapConfirmed}
                onChange={(event) => setMainnetUnwrapConfirmed(event.target.checked)}
              />
              <span>
                I understand Ethereum Mainnet uses real assets, and I have verified the token
                address and amount.
              </span>
            </label>
          </>
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
            <span>{unwrapError.message}</span>
            {unwrapError.details && unwrapError.details !== unwrapError.message ? (
              <details>
                <summary>Error details</summary>
                <span>{unwrapError.details}</span>
              </details>
            ) : null}
          </div>
        ) : null}

        {unwrap.unwrapHash ? (
          <div className="tx-status">
            <CheckCircle2 size={15} />
            <span>{unwrap.isSuccess ? "Unwrap confirmed" : "Unwrap submitted"}</span>
            <a href={txExplorerUrl(unwrap.unwrapHash, pair.chainId)} target="_blank" rel="noreferrer">
              View tx
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}
