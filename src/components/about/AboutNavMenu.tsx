"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/use-i18n";
import type { MessageKey } from "@/lib/i18n/messages";

export const ABOUT_NAV_ITEMS: { href: string; labelKey: MessageKey }[] = [
  { href: "/contact", labelKey: "about.contact" },
  { href: "/visit-factory", labelKey: "about.factory" },
  { href: "/visit-factory?mode=presentation", labelKey: "about.presentation" },
  { href: "/careers", labelKey: "about.careers" },
];

export function AboutNavPanel({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useI18n();
  return (
    <div className="min-w-[12rem] py-1">
      {ABOUT_NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className="block px-4 py-2.5 text-sm text-ink hover:bg-paper hover:text-navy"
        >
          {t(item.labelKey)}
        </Link>
      ))}
    </div>
  );
}

export function AboutMobileLinks({ onNavigate }: { onNavigate: () => void }) {
  const { t } = useI18n();
  return (
    <div className="space-y-0.5 pb-3 pl-2">
      {ABOUT_NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className="flex min-h-11 items-center py-2 text-sm text-white/90 hover:text-white"
        >
          {t(item.labelKey)}
        </Link>
      ))}
    </div>
  );
}
