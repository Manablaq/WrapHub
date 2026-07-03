"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import type { Address } from "viem";
import { sepoliaAddressUrl } from "@/lib/format";

export function AddressActions({ address }: { address: Address }) {
  const [copied, setCopied] = useState(false);

  async function copyAddress() {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="address-actions">
      <button className="icon-button" type="button" onClick={copyAddress} title="Copy address">
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
      <a
        className="icon-button"
        href={sepoliaAddressUrl(address)}
        target="_blank"
        rel="noreferrer"
        title="Open on Sepolia Etherscan"
      >
        <ExternalLink size={16} />
      </a>
    </div>
  );
}
