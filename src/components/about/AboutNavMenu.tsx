"use client";

import Link from "next/link";

export const ABOUT_NAV_ITEMS = [
  { href: "/contact", label: "ติดต่อ" },
  { href: "/visit-factory", label: "เยี่ยมชมโรงงาน" },
  { href: "/careers", label: "ร่วมงานกับเรา" },
] as const;

export function AboutNavPanel({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="min-w-[12rem] py-1">
      {ABOUT_NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
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

export function AboutMobileLinks({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="space-y-0.5 pb-3 pl-2">
      {ABOUT_NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
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
