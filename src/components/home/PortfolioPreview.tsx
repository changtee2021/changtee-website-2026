"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { HomePanel } from "@/components/home/HomePanel";
import { revealEase } from "@/components/home/Reveal";
import { usePortfolioItems } from "@/lib/cms/demo-store";
import { type SpaceType } from "@/lib/cms/portfolio-demo";
import { useI18n } from "@/lib/i18n/use-i18n";
import type { MessageKey } from "@/lib/i18n/messages";
import { publishedPortfolio } from "@/lib/cms/public-content";

const TABS: { key: "all" | SpaceType; labelKey: MessageKey }[] = [
  { key: "all", labelKey: "portfolio.all" },
  { key: "restaurant-cafe", labelKey: "space.restaurant-cafe" },
  { key: "home-condo", labelKey: "space.home-condo" },
  { key: "hotel-resort", labelKey: "space.hotel-resort" },
  { key: "office-corp", labelKey: "space.office-corp" },
  { key: "government", labelKey: "space.government" },
  { key: "education", labelKey: "space.education" },
  { key: "hospital", labelKey: "space.hospital" },
  { key: "pharmacy", labelKey: "space.pharmacy" },
];

export function PortfolioPreview({
  title,
  subtitle,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
} = {}) {
  const { t } = useI18n();
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
            <div className="mt-2 h-0.5 w-12 bg-brand-red" aria-hidden />
            {subtitle ? (
              <p className="mt-3 max-w-xl text-sm text-muted">{subtitle}</p>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-1.5 py-1 sm:gap-2">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`relative rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:px-3.5 sm:py-2 sm:text-sm ${
                tab === item.key ? "text-white" : "text-muted hover:text-navy"
              }`}
            >
              {tab === item.key ? (
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
              <span className="relative whitespace-nowrap">{t(item.labelKey)}</span>
            </button>
          ))}
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
                    className="group flex w-[78vw] shrink-0 flex-col rounded-[1.25rem] bg-paper p-3 transition hover:bg-line/40 sm:w-[300px]"
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
                    <div className="flex flex-1 flex-col px-1 pb-1 pt-4">
                      <h3 className="font-semibold text-navy">{item.title}</h3>
                      <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-muted">
                        {item.summary}
                      </p>
                      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                        <span className="inline-flex min-w-0 items-center gap-1 text-xs text-muted">
                          <MapPin className="size-3 shrink-0 opacity-80" aria-hidden />
                          <span className="truncate">{item.place}</span>
                        </span>
                        <span className="shrink-0 rounded-full bg-navy px-4 py-1.5 text-xs font-semibold text-white transition group-hover:bg-brand-red">
                          {t("home.seeWorkShort")}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="flex gap-2">
            <button
              type="button"
              aria-label={t("common.prev")}
              onClick={() => scrollBy(-1)}
              className="rounded-full bg-paper p-2.5 text-navy transition hover:bg-navy hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={t("common.next")}
              onClick={() => scrollBy(1)}
              className="rounded-full bg-navy p-2.5 text-white transition hover:bg-navy-deep"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <Link
            href="/portfolio"
            className="text-sm font-semibold text-brand-red hover:underline"
          >
            {t("home.seeAllWork")}
          </Link>
        </div>
      </div>
    </HomePanel>
  );
}
