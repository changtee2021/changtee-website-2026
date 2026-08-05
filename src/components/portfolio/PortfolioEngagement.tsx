"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  trackPortfolioQuoteClick,
  trackPortfolioView,
} from "@/lib/cms/portfolio-analytics";
import { PortfolioShareBar } from "@/components/portfolio/PortfolioShareBar";

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

export function PortfolioQuoteCtas({
  portfolioId,
  slug,
  title,
}: {
  portfolioId: string;
  slug: string;
  title: string;
}) {
  const q = `from=portfolio&slug=${encodeURIComponent(slug)}`;

  return (
    <div className="mt-12 space-y-4">
      <PortfolioShareBar
        portfolioId={portfolioId}
        slug={slug}
        title={title}
      />
      <div className="flex flex-wrap gap-3 rounded-2xl border border-line bg-paper/60 p-5">
        <Link
          href={`/quote?${q}`}
          onClick={() => trackPortfolioQuoteClick(portfolioId)}
          className="rounded-xl bg-brand-red px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          ขอใบเสนอราคา
        </Link>
      </div>
    </div>
  );
}
