"use client";

import { PortfolioOverview } from "@/components/portfolio/portfolio-overview";
import { Reveal } from "@/components/ui/reveal";
import { useRegistryPairs } from "@/hooks/use-registry-pairs";

export function PortfolioSection() {
  const { pairs, isRegistryLoading, error } = useRegistryPairs();

  return (
    <Reveal>
      <PortfolioOverview pairs={pairs} />
      {isRegistryLoading ? (
        <div className="portfolio-empty">Loading portfolio and readiness data...</div>
      ) : null}
      {error ? (
        <div className="portfolio-empty warning">
          Portfolio and readiness data are unavailable until the Sepolia registry can be read.
        </div>
      ) : null}
    </Reveal>
  );
}
