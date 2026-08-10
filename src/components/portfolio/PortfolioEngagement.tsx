"use client";

import { useEffect } from "react";
import Link from "next/link";
import { EditableSpot } from "@/components/preview/EditableSpot";
import { PortfolioShareBar } from "@/components/portfolio/PortfolioShareBar";
import { useSectionValues } from "@/lib/cms/demo-store";
import {
  trackPortfolioQuoteClick,
  trackPortfolioView,
} from "@/lib/cms/portfolio-analytics";
import { PORTFOLIO_ITEM_SECTION_DEFAULTS } from "@/lib/cms/page-sections/templates";

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
  hideQuoteButton = false,
}: {
  portfolioId: string;
  slug: string;
  title: string;
  /** When quote CTA already sits under the job-spec card */
  hideQuoteButton?: boolean;
}) {
  const q = `from=portfolio&slug=${encodeURIComponent(slug)}`;
  const ctaCms = useSectionValues(
    "portfolioItem",
    "cta",
    PORTFOLIO_ITEM_SECTION_DEFAULTS.cta,
  );

  return (
    <div className="mt-12 space-y-4">
      <PortfolioShareBar
        portfolioId={portfolioId}
        slug={slug}
        title={title}
      />
      {!hideQuoteButton && ctaCms.enabled ? (
        <div className="flex flex-wrap gap-3 rounded-2xl border border-line bg-paper/60 p-5">
          <EditableSpot sectionId="cta" fieldKey="quoteLabel" className="w-auto">
            <Link
              href={`/quote?${q}`}
              onClick={(e) => {
                if (typeof window !== "undefined" && window.parent !== window) {
                  e.preventDefault();
                  return;
                }
                trackPortfolioQuoteClick(portfolioId);
              }}
              className="inline-flex rounded-xl bg-brand-red px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              {ctaCms.values.quoteLabel}
            </Link>
          </EditableSpot>
        </div>
      ) : null}
    </div>
  );
}
