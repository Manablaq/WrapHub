"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useAccount, useChainId } from "wagmi";
import { sepolia } from "wagmi/chains";

export function SiteHeader() {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const isSepolia = chainId === sepolia.id;

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="brand" href="/">
          <span className="brand-mark">W</span>
          <span className="brand-text">
            <strong>WrapHub</strong>
            <span>Confidential Wrapper Registry</span>
          </span>
        </Link>
        <nav className="site-nav" aria-label="Primary navigation">
          <a href="#registry-explorer">Registry</a>
          <a href="#developer-console">Developer Console</a>
        </nav>
        <div className="header-actions">
          <span className={`network-pill ${isConnected && !isSepolia ? "warning" : ""}`}>
            {isConnected && !isSepolia ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
            <strong>{isConnected && !isSepolia ? "Switch to Sepolia" : "Sepolia"}</strong>
          </span>
          <ConnectButton chainStatus="icon" showBalance={false} />
        </div>
      </div>
    </header>
  );
}
