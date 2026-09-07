"use client";

import Link from "next/link";
import type { SpaceType } from "@/lib/cms/portfolio-demo";
import { useI18n } from "@/lib/i18n/use-i18n";
import type { MessageKey } from "@/lib/i18n/messages";

const SPACE_KEYS: SpaceType[] = [
  "restaurant-cafe",
  "home-condo",
  "hotel-resort",
  "office-corp",
  "government",
  "education",
  "hospital",
  "pharmacy",
];

function spaceLabelKey(space: SpaceType): MessageKey {
  return `space.${space}` as MessageKey;
}

export function PortfolioNavPanel({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useI18n();
  return (
    <div className="min-w-[14rem] py-1">
      <Link
        href="/portfolio"
        onClick={onNavigate}
        className="block px-4 py-2.5 text-sm text-ink hover:bg-paper hover:text-navy"
      >
        {t("portfolio.allWorks")}
      </Link>
      {SPACE_KEYS.map((key) => (
        <Link
          key={key}
          href={`/portfolio?space=${encodeURIComponent(key)}`}
          onClick={onNavigate}
          className="block px-4 py-2.5 text-sm text-ink hover:bg-paper hover:text-navy"
        >
          {t(spaceLabelKey(key))}
        </Link>
      ))}
      <Link
        href={`/portfolio?product=roller-blinds&q=${encodeURIComponent("ร้านยา")}`}
        onClick={onNavigate}
        className="block px-4 py-2.5 text-sm text-ink hover:bg-paper hover:text-navy"
      >
        {t("portfolio.pharmacyRoller")}
      </Link>
    </div>
  );
}

export function PortfolioMobileLinks({ onNavigate }: { onNavigate: () => void }) {
  const { t } = useI18n();
  return (
    <div className="space-y-0.5 pb-3 pl-2">
      <Link
        href="/portfolio"
        onClick={onNavigate}
        className="flex min-h-11 items-center py-2 text-sm text-white/90 hover:text-white"
      >
        {t("portfolio.allWorks")}
      </Link>
      {SPACE_KEYS.map((key) => (
        <Link
          key={key}
          href={`/portfolio?space=${encodeURIComponent(key)}`}
          onClick={onNavigate}
          className="flex min-h-11 items-center py-2 text-sm text-white/90 hover:text-white"
        >
          {t(spaceLabelKey(key))}
        </Link>
      ))}
      <Link
        href={`/portfolio?product=roller-blinds&q=${encodeURIComponent("ร้านยา")}`}
        onClick={onNavigate}
        className="flex min-h-11 items-center py-2 text-sm text-white/90 hover:text-white"
      >
        {t("portfolio.pharmacyRoller")}
      </Link>
    </div>
  );
}
