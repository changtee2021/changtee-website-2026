"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Search, X } from "lucide-react";
import { useBlogPosts, usePortfolioItems } from "@/lib/cms/demo-store";
import { buildSearchIndex, entryTypeLabel, searchSite } from "@/lib/site-search";

export function SiteSearch({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const portfolioItems = usePortfolioItems();
  const blogPosts = useBlogPosts();

  const index = useMemo(
    () => buildSearchIndex(portfolioItems, blogPosts),
    [portfolioItems, blogPosts],
  );

  const results = useMemo(() => searchSite(index, query), [index, query]);

  function close() {
    setOpen(false);
    setQuery("");
  }

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function go(href: string) {
    close();
    router.push(href);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (results[0]) go(results[0].href);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="ค้นหา"
        className={className}
      >
        <Search className="h-4 w-4" aria-hidden />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[70] flex items-start justify-center bg-navy/50 px-4 pt-20 backdrop-blur-sm sm:pt-28"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => close()}
          >
            <motion.div
              className="relative w-full max-w-xl"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => close()}
                  aria-label="ปิดการค้นหา"
                  className="inline-flex size-10 items-center justify-center rounded-full bg-brand-red text-white shadow-lg transition hover:bg-brand-red-soft"
                >
                  <X className="size-5" aria-hidden />
                </button>
              </div>

              <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
                <form
                  onSubmit={onSubmit}
                  className="flex items-center gap-1 border-b border-line px-2 sm:gap-1.5 sm:px-3"
                >
                  <Search
                    className="ml-2 size-4 shrink-0 text-muted sm:ml-1"
                    aria-hidden
                  />
                  <input
                    ref={inputRef}
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="ค้นหาสินค้า ผลงาน หรือบทความ…"
                    className="min-w-0 flex-1 bg-transparent py-4 pl-2 pr-1 text-sm text-ink outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
                  />
                  {query.trim() ? (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        inputRef.current?.focus();
                      }}
                      aria-label="ล้างคำค้นหา"
                      className="mr-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-shell hover:text-navy"
                    >
                      <X className="size-4" aria-hidden />
                    </button>
                  ) : null}
                </form>

                <div className="max-h-[60vh] overflow-y-auto p-2">
                  {query.trim() === "" ? (
                    <p className="px-3 py-6 text-center text-sm text-muted">
                      พิมพ์ชื่อสินค้า สถานที่ หรือคำที่สนใจ เช่น &ldquo;ม่านม้วน&rdquo; หรือ
                      &ldquo;คอนโด สุขุมวิท&rdquo;
                    </p>
                  ) : results.length === 0 ? (
                    <p className="px-3 py-6 text-center text-sm text-muted">
                      ไม่พบผลลัพธ์ที่ตรงกับ &ldquo;{query}&rdquo; ลองคำอื่น หรือ{" "}
                      <Link
                        href="/quote"
                        onClick={() => close()}
                        className="font-semibold text-brand-red hover:underline"
                      >
                        ทักแอดมิน
                      </Link>
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-1">
                      {results.map((r, i) => (
                        <li key={`${r.type}-${r.href}`}>
                          <Link
                            href={r.href}
                            onClick={() => close()}
                            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-shell ${
                              i === 0 ? "bg-shell/70" : ""
                            }`}
                          >
                            <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-line/40">
                              {r.image ? (
                                <Image
                                  src={r.image}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  sizes="44px"
                                />
                              ) : null}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-navy">
                                {r.title}
                              </span>
                              {r.subtitle ? (
                                <span className="block truncate text-xs text-muted">
                                  {r.subtitle}
                                </span>
                              ) : null}
                            </span>
                            <span className="shrink-0 rounded-full bg-navy/5 px-2 py-0.5 text-[10px] font-semibold text-navy">
                              {entryTypeLabel(r.type)}
                            </span>
                            <ArrowRight className="size-3.5 shrink-0 text-muted" aria-hidden />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
