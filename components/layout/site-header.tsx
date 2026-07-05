"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useAccount, useChainId } from "wagmi";
import { getNetworkOrDefault, getSupportedNetwork } from "@/lib/networks/supported-networks";

export function SiteHeader() {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const activeNetwork = getSupportedNetwork(chainId);
  const displayNetwork = activeNetwork ?? getNetworkOrDefault();
  const isUnsupported = isConnected && !activeNetwork;

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="brand" href="/">
          <span className="brand-mark">W</span>
          <span className="brand-text">
            <strong>WrapHub</strong>
            <span>Confidential wrapper console</span>
          </span>
        </Link>
        <nav className="site-nav" aria-label="Primary navigation">
          <Link href="/">Home</Link>
          <Link href="/how-it-works">How it works</Link>
          <Link href="/portfolio">Portfolio</Link>
          <Link href="/registry">Registry</Link>
          <Link href="/activity">Activity</Link>
          <Link href="/developer-console">Developer Console</Link>
        </nav>
        <div className="header-actions">
          <span className={`network-pill ${isUnsupported ? "warning" : ""}`}>
            {isUnsupported ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
            <strong>{isUnsupported ? "Switch network" : displayNetwork.shortName}</strong>
          </span>
          <ConnectButton chainStatus="icon" showBalance={false} />
        </div>
      </div>
    </header>
  );
}
