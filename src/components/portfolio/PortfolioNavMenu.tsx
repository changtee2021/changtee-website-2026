"use client";

import Link from "next/link";
import { PORTFOLIO_NAV_ITEMS } from "@/lib/cms/portfolio-demo";

export function PortfolioNavPanel({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="min-w-[14rem] py-1">
      {PORTFOLIO_NAV_ITEMS.map((item) => (
        <Link
          key={`${item.label}-${item.href}`}
          href={item.href}
          onClick={onNavigate}
          className="block px-4 py-2.5 text-sm text-ink hover:bg-paper hover:text-navy"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export function PortfolioMobileLinks({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="space-y-0.5 pb-3 pl-2">
      {PORTFOLIO_NAV_ITEMS.map((item) => (
        <Link
          key={`${item.label}-${item.href}`}
          href={item.href}
          onClick={onNavigate}
          className="flex min-h-11 items-center py-2 text-sm text-white/90 hover:text-white"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
