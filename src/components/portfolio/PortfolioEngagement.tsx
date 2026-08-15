"use client";

import { useEffect } from "react";
import { trackPortfolioView } from "@/lib/cms/portfolio-analytics";

/** Fire a view once when the public detail page mounts. */
export function PortfolioViewTracker({
  portfolioId,
  enabled = true,
}: {
  portfolioId: string;
  enabled?: boolean;
}) {
  useEffect(() => {
    if (!enabled || !portfolioId) return;
    trackPortfolioView(portfolioId);
  }, [portfolioId, enabled]);
  return null;
}
