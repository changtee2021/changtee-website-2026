"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HomePanel } from "@/components/home/HomePanel";
import { revealEase } from "@/components/home/Reveal";
import { usePortfolioItems } from "@/lib/cms/demo-store";
import { SPACE_TYPE_LABELS, type SpaceType } from "@/lib/cms/portfolio-demo";
import { publishedPortfolio } from "@/lib/cms/public-content";

const TABS: { key: "all" | SpaceType; label: string }[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "home", label: SPACE_TYPE_LABELS.home },
  { key: "condo", label: SPACE_TYPE_LABELS.condo },
  { key: "office", label: SPACE_TYPE_LABELS.office },
  { key: "cafe", label: SPACE_TYPE_LABELS.cafe },
];

export function PortfolioPreview({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
} = {}) {
  const stored = usePortfolioItems();
  const items = useMemo(() => publishedPortfolio(stored), [stored]);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const filtered = useMemo(
    () => (tab === "all" ? items : items.filter((i) => i.spaceType === tab)),
    [items, tab],
  );

  function scrollBy(dir: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(340, el.clientWidth * 0.8), behavior: "smooth" });
  }

  return (
    <HomePanel tone="clear">
      <div className="px-1 py-4 sm:px-2 sm:py-6 md:py-8">
        {title ? (
          <div className="mb-6">
            <h2 className="font-display text-2xl font-semibold text-navy md:text-3xl">
              {title}
            </h2>
            {subtitle ? <p className="mt-2 text-sm text-muted">{subtitle}</p> : null}
          </div>
        ) : null}

        <div className="flex items-center gap-3">
          <div className="no-scrollbar -mx-1 flex flex-1 gap-2 overflow-x-auto px-1 py-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  tab === t.key ? "text-white" : "text-muted hover:text-navy"
                }`}
              >
                {tab === t.key ? (
                  <motion.span
                    layoutId="portfolio-tab"
                    className="absolute inset-0 rounded-full bg-navy"
                    transition={
                      reduced
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 340, damping: 32 }
                    }
                  />
                ) : null}
                <span className="relative">{t.label}</span>
              </button>
            ))}
          </div>

          <div className="hidden shrink-0 gap-2 sm:flex">
            <button
              type="button"
              aria-label="เลื่อนซ้าย"
              onClick={() => scrollBy(-1)}
              className="rounded-full bg-paper p-2.5 text-navy transition hover:bg-navy hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="เลื่อนขวา"
              onClick={() => scrollBy(1)}
              className="rounded-full bg-navy p-2.5 text-white transition hover:bg-navy-deep"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: revealEase }}
          >
            {filtered.length === 0 ? (
              <p className="py-14 text-center text-sm text-muted">
                ยังไม่มีผลงานหมวดนี้ ลองดูหมวดอื่น หรือทักมาคุยกับเราได้เลย
              </p>
            ) : (
              <div
                ref={scrollerRef}
                className="no-scrollbar mt-6 flex gap-4 overflow-x-auto pb-1"
              >
                {filtered.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/portfolio/${item.slug}`}
                    className="group w-[78vw] shrink-0 rounded-[1.25rem] bg-paper p-3 transition hover:bg-line/40 sm:w-[300px]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[1rem] bg-line/40">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        sizes="(max-width: 640px) 78vw, 300px"
                      />
                    </div>
                    <div className="px-1 pb-1 pt-4">
                      <h3 className="font-semibold text-navy">{item.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted">{item.summary}</p>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <span className="text-xs text-muted">{item.place}</span>
                        <span className="rounded-full bg-navy px-4 py-1.5 text-xs font-semibold text-white transition group-hover:bg-brand-red">
                          ดูผลงาน
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex items-center justify-center gap-4">
          <Link
            href="/portfolio"
            className="text-sm font-semibold text-brand-red hover:underline"
          >
            ดูผลงานทั้งหมด
          </Link>
        </div>
      </div>
    </HomePanel>
  );
}
