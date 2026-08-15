"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useBlogPosts, usePortfolioItems } from "@/lib/cms/demo-store";
import { buildSearchIndex, entryTypeLabel, searchSite } from "@/lib/site-search";

export function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const portfolioItems = usePortfolioItems();
  const blogPosts = useBlogPosts();
  const index = useMemo(
    () => buildSearchIndex(portfolioItems, blogPosts),
    [portfolioItems, blogPosts],
  );
  const results = useMemo(() => searchSite(index, query, 20), [index, query]);

  return (
    <div className="mt-6">
      <form action="/search" method="get" className="flex gap-2">
        <label className="sr-only" htmlFor="site-search-q">
          คำค้นหา
        </label>
        <input
          id="site-search-q"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="ค้นหาสินค้า ผลงาน หรือบทความ…"
          className="min-w-0 flex-1 rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-navy"
        />
        <button
          type="submit"
          className="rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white"
        >
          ค้นหา
        </button>
      </form>

      {!query ? (
        <p className="mt-8 text-sm text-muted">พิมพ์คำที่ต้องการค้นหา เช่น ม่านม้วน หรือ คอนโด</p>
      ) : results.length === 0 ? (
        <p className="mt-8 text-sm text-muted">
          ไม่พบผลลัพธ์ที่ตรงกับ “{query}” —{" "}
          <Link href="/quote" className="font-semibold text-brand-red hover:underline">
            ขอใบเสนอราคา
          </Link>
        </p>
      ) : (
        <ul className="mt-8 space-y-2">
          {results.map((r) => (
            <li key={`${r.type}-${r.href}`}>
              <Link
                href={r.href}
                className="flex items-center gap-3 rounded-xl border border-line bg-panel px-3 py-3 hover:bg-shell"
              >
                <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-line/40">
                  {r.image ? (
                    <Image src={r.image} alt="" fill className="object-cover" sizes="56px" />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-navy">{r.title}</span>
                  {r.subtitle ? (
                    <span className="block truncate text-xs text-muted">{r.subtitle}</span>
                  ) : null}
                </span>
                <span className="shrink-0 text-[10px] font-semibold text-navy">
                  {entryTypeLabel(r.type)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
