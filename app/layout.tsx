import type { Metadata } from "next";
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";
import { AppProviders } from "@/components/layout/app-providers";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: "WrapHub | Confidential Wrapper Console",
  description:
    "Private token flows for official ERC-20 ↔ ERC-7984 wrapper pairs on Sepolia and Ethereum Mainnet.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <div className="app-shell">
            <SiteHeader />
            <main>{children}</main>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
