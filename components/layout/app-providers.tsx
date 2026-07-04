"use client";

import { RainbowKitProvider, darkTheme, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ZamaProvider } from "@zama-fhe/react-sdk";
import { sepolia as zamaSepolia } from "@zama-fhe/sdk/chains";
import { web } from "@zama-fhe/sdk/web";
import { useState, type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { sepolia } from "wagmi/chains";
import { TransactionHistoryProvider } from "@/hooks/use-transaction-history";
import { createZamaWagmiV2Config } from "@/lib/zama/wagmi-v2-adapter";

const config = getDefaultConfig({
  appName: "WrapHub",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "wraphub-local",
  chains: [sepolia],
  ssr: true,
});

const zamaConfig = createZamaWagmiV2Config({
  chains: [zamaSepolia],
  wagmiConfig: config,
  relayers: { [zamaSepolia.id]: web() },
});

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
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
  );
}
