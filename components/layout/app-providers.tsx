"use client";

import { RainbowKitProvider, darkTheme, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ZamaProvider } from "@zama-fhe/react-sdk";
import { mainnet as zamaMainnet, sepolia as zamaSepolia } from "@zama-fhe/sdk/chains";
import { web } from "@zama-fhe/sdk/web";
import { useState, type ReactNode } from "react";
import { http } from "viem";
import { WagmiProvider } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { TransactionHistoryProvider } from "@/hooks/use-transaction-history";
import { getPrimaryRpcUrl, SUPPORTED_NETWORKS } from "@/lib/networks/supported-networks";
import { createZamaWagmiV2Config } from "@/lib/zama/wagmi-v2-adapter";
import { ConnectionErrorBoundary } from "@/components/layout/connection-error-boundary";

const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

const config = getDefaultConfig({
  appName: "WrapHub",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "wraphub-local",
  chains: [sepolia, mainnet],
  transports: {
    [sepolia.id]: http(getPrimaryRpcUrl(SUPPORTED_NETWORKS[0], alchemyKey)),
    [mainnet.id]: http(getPrimaryRpcUrl(SUPPORTED_NETWORKS[1], alchemyKey)),
  },
  ssr: true,
});

const zamaConfig = createZamaWagmiV2Config({
  chains: [zamaSepolia, zamaMainnet],
  wagmiConfig: config,
  relayers: { [zamaSepolia.id]: web(), [zamaMainnet.id]: web() },
});

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ConnectionErrorBoundary>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <ZamaProvider config={zamaConfig}>
            <RainbowKitProvider
              modalSize="compact"
              theme={darkTheme({
                accentColor: "#58d3c2",
                accentColorForeground: "#031210",
                borderRadius: "small",
                fontStack: "system",
              })}
            >
              <TransactionHistoryProvider>{children}</TransactionHistoryProvider>
            </RainbowKitProvider>
          </ZamaProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ConnectionErrorBoundary>
  );
}
