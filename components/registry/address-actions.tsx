"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import type { Address } from "viem";
import { addressExplorerUrl, getNetworkOrDefault } from "@/lib/networks/supported-networks";

export function AddressActions({ address, chainId }: { address: Address; chainId?: number }) {
  const [copied, setCopied] = useState(false);
  const network = getNetworkOrDefault(chainId);

  async function copyAddress() {
    try {
      if (!navigator.clipboard) {
        return;
      }

      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="address-actions">
      <button
        className="icon-button"
        type="button"
        onClick={copyAddress}
        aria-label="Copy address"
        title="Copy address"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
      <a
        className="icon-button"
        href={addressExplorerUrl(address, chainId)}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open address on ${network.name} Etherscan`}
        title={`Open on ${network.name} Etherscan`}
      >
        <ExternalLink size={16} />
      </a>
    </div>
  );
}
