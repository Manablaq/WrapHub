"use client";

import { AlertCircle, CheckCircle2, ExternalLink, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { useAccount, useChainId } from "wagmi";
import { sepolia } from "wagmi/chains";
import { useApproveWrapper } from "@/hooks/use-approve-wrapper";
import { useErc20Allowance } from "@/hooks/use-erc20-allowance";
import { useErc20Balance } from "@/hooks/use-erc20-balance";
import { useMintMockToken } from "@/hooks/use-mint-mock-token";
import { useWrapToken } from "@/hooks/use-wrap-token";
import { sepoliaTxUrl } from "@/lib/format";
import type { EnrichedRegistryPair } from "@/lib/registry/types";

function formatTokenAmount(value: bigint, decimals: number) {
  const formatted = formatUnits(value, decimals);
  const [whole, fraction = ""] = formatted.split(".");
  const trimmedFraction = fraction.slice(0, 6).replace(/0+$/, "");
  return trimmedFraction ? `${whole}.${trimmedFraction}` : whole;
}

function getFriendlyError(error: Error | null | undefined) {
  if (!error) {
    return null;
  }

  const message = error.message.split("\n")[0] ?? "Transaction failed.";

  if (message.toLowerCase().includes("user rejected")) {
    return "Transaction rejected in wallet.";
  }

  return message;
}

export function PairActionPanel({ pair }: { pair: EnrichedRegistryPair }) {
  const [amount, setAmount] = useState("");
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isSepolia = chainId === sepolia.id;

  const balance = useErc20Balance(pair.underlyingAddress, address);
  const allowance = useErc20Allowance(pair.underlyingAddress, address, pair.wrapperAddress);
  const mint = useMintMockToken(pair.underlyingAddress);
  const approve = useApproveWrapper(pair.underlyingAddress);
  const wrap = useWrapToken(pair.wrapperAddress);

  const parsedAmount = useMemo(() => {
    try {
      return amount.trim() ? parseUnits(amount.trim(), balance.decimals) : 0n;
    } catch {
      return null;
    }
  }, [amount, balance.decimals]);

  const amountError = useMemo(() => {
    if (!amount.trim()) {
      return "Enter an amount.";
    }

    if (parsedAmount === null) {
      return "Enter a valid token amount.";
    }

    if (parsedAmount <= 0n) {
      return "Amount must be greater than zero.";
    }

    return null;
  }, [amount, parsedAmount]);

  const hasEnoughBalance = parsedAmount !== null && parsedAmount > 0n && balance.balance >= parsedAmount;
  const hasEnoughAllowance =
    parsedAmount !== null && parsedAmount > 0n && allowance.allowance >= parsedAmount;
  const canTransact = isConnected && isSepolia && parsedAmount !== null && parsedAmount > 0n;
  const isBusy =
    mint.isPending ||
    mint.isConfirming ||
    approve.isPending ||
    approve.isConfirming ||
    wrap.isPending ||
    wrap.isConfirming;
  const transactionError = getFriendlyError(mint.error ?? approve.error ?? wrap.error);
  const latestHash = wrap.hash ?? approve.hash ?? mint.hash;

  useEffect(() => {
    if (mint.isSuccess || wrap.isSuccess) {
      void balance.refetch();
    }
  }, [balance, mint.isSuccess, wrap.isSuccess]);

  useEffect(() => {
    if (approve.isSuccess || wrap.isSuccess) {
      void allowance.refetch();
    }
  }, [allowance, approve.isSuccess, wrap.isSuccess]);

  return (
    <div className="action-panel">
      <div className="action-panel-header">
        <div>
          <span>Faucet - Approve - Wrap</span>
          <strong>Wrap ERC-20 into confidential token</strong>
        </div>
      </div>

      {!isConnected ? <div className="action-notice">Connect a wallet to use actions.</div> : null}
      {isConnected && !isSepolia ? (
        <div className="action-notice warning">Switch to Sepolia before sending transactions.</div>
      ) : null}

      <div className="balance-grid">
        <div>
          <span>ERC-20 balance</span>
          <strong>{formatTokenAmount(balance.balance, balance.decimals)}</strong>
        </div>
        <div>
          <span>Wrapper allowance</span>
          <strong>{formatTokenAmount(allowance.allowance, balance.decimals)}</strong>
        </div>
      </div>

      <label className="amount-field">
        <span>Amount</span>
        <input
          inputMode="decimal"
          placeholder="0.0"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>

      {amount.trim() && amountError ? (
        <div className="inline-status warning">
          <AlertCircle size={15} />
          {amountError}
        </div>
      ) : null}

      {canTransact && !hasEnoughBalance ? (
        <div className="inline-status warning">
          <AlertCircle size={15} />
          Balance is lower than the wrap amount.
        </div>
      ) : null}

      <div className="action-buttons">
        <button
          className="button secondary"
          type="button"
          disabled={!canTransact || isBusy || !pair.hasPublicFaucet}
          onClick={() => address && parsedAmount && mint.mint(address, parsedAmount)}
        >
          {mint.isPending || mint.isConfirming ? <Loader2 className="spin" size={15} /> : null}
          {pair.hasPublicFaucet ? "Mint test ERC-20" : "Restricted mint"}
        </button>
        <button
          className="button secondary"
          type="button"
          disabled={!canTransact || isBusy}
          onClick={() => parsedAmount && approve.approve(pair.wrapperAddress, parsedAmount)}
        >
          {approve.isPending || approve.isConfirming ? <Loader2 className="spin" size={15} /> : null}
          Approve wrapper
        </button>
        <button
          className="button primary"
          type="button"
          disabled={!canTransact || isBusy || !hasEnoughBalance || !hasEnoughAllowance}
          onClick={() => address && parsedAmount && wrap.wrap(address, parsedAmount)}
        >
          {wrap.isPending || wrap.isConfirming ? <Loader2 className="spin" size={15} /> : null}
          Wrap into confidential token
        </button>
      </div>

      {canTransact && hasEnoughBalance && !hasEnoughAllowance ? (
        <div className="inline-status">Approve the wrapper before wrapping this amount.</div>
      ) : null}

      {transactionError ? (
        <div className="inline-status danger">
          <AlertCircle size={15} />
          {transactionError}
        </div>
      ) : null}

      {latestHash ? (
        <div className="tx-status">
          <CheckCircle2 size={15} />
          <span>{wrap.isSuccess || approve.isSuccess || mint.isSuccess ? "Confirmed" : "Submitted"}</span>
          <a href={sepoliaTxUrl(latestHash)} target="_blank" rel="noreferrer">
            View tx <ExternalLink size={13} />
          </a>
        </div>
      ) : null}
    </div>
  );
}
