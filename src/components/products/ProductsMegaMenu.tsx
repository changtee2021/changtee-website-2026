"use client";

import Link from "next/link";
import { useState } from "react";
import { PRODUCT_PILLARS, hubItemsForPillar } from "@/lib/product-catalog";
import { cn } from "@/lib/utils";

export function ProductsMegaPanel({ onNavigate }: { onNavigate?: () => void }) {
  const [active, setActive] = useState<(typeof PRODUCT_PILLARS)[number]["id"]>(1);
  const items = hubItemsForPillar(active);

  return (
    <div className="grid gap-4 lg:grid-cols-[11rem_1fr]">
      <div className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
        {PRODUCT_PILLARS.map((p) => (
          <button
            key={p.id}
            type="button"
            onMouseEnter={() => setActive(p.id)}
            onFocus={() => setActive(p.id)}
            onClick={() => setActive(p.id)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-2 text-left text-sm transition",
              active === p.id
                ? "bg-navy text-white"
                : "text-navy hover:bg-paper",
            )}
          >
            <span className="font-semibold">
              {p.code} {p.name}
            </span>
          </button>
        ))}
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs text-muted">
            {PRODUCT_PILLARS.find((p) => p.id === active)?.summary}
          </p>
          <Link
            href={`/products#pillar-${active}`}
            onClick={onNavigate}
            className="shrink-0 text-xs font-medium text-brand-red hover:underline"
          >
            ดูกลุ่มนี้
          </Link>
        </div>
        <div className="grid max-h-[min(22rem,50vh)] grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="rounded-md px-3 py-2 hover:bg-paper"
            >
              <div className="text-sm font-semibold text-navy">{item.name}</div>
              {item.nameEn ? (
                <div className="text-[11px] text-muted">{item.nameEn}</div>
              ) : null}
              <div className="line-clamp-1 text-xs text-muted">{item.summary}</div>
            </Link>
          ))}
        </div>
        <div className="mt-3 border-t border-line pt-3">
          <Link
            href="/products"
            onClick={onNavigate}
            className="text-sm font-semibold text-brand-red hover:underline"
          >
            ดูสินค้าทั้งหมด →
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Compact list for mobile accordion */
export function ProductsMobileLinks({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="pb-3 pl-2">
      <Link
        href="/products"
        className="flex min-h-11 items-center rounded-md px-2 py-2 text-sm font-medium text-white/90 hover:bg-white/10"
        onClick={onNavigate}
      >
        ดูทั้งหมด (7 กลุ่ม)
      </Link>
      {PRODUCT_PILLARS.map((p) => (
        <div key={p.id} className="border-t border-white/25">
          <Link
            href={`/products#pillar-${p.id}`}
            className="block px-2 py-2 text-xs font-semibold tracking-wide text-brand-red"
            onClick={onNavigate}
          >
            {p.code} {p.name}
          </Link>
          <div className="space-y-0.5 pb-2">
            {hubItemsForPillar(p.id).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-11 items-center rounded-md px-2 py-2 text-sm text-white/85 hover:bg-white/10"
                onClick={onNavigate}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
