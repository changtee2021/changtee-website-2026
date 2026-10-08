"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useHeroSlides } from "@/lib/cms/demo-store";
import { publishedHeroSlides } from "@/lib/cms/hero-slides-demo";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { revealEase } from "@/components/home/Reveal";
import { useI18n } from "@/lib/i18n/use-i18n";
import { siteConfig } from "@/lib/site-config";

const FALLBACK = {
  src: "/images/generated/ct-hero-living.webp",
  alt: "ผ้าม่านห้องนั่งเล่น ผลงานช่างตี๋",
};

export function Hero() {
  const { t } = useI18n();
  const stored = useHeroSlides();
  const slides = useMemo(() => publishedHeroSlides(stored), [stored]);
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [hoverPaused, setHoverPaused] = useState(false);

  const len = slides.length;
  const safeIndex = len > 0 ? index % len : 0;
  const paused = hoverPaused || !!reduced;

  useEffect(() => {
    if (len <= 1 || paused) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % len), 6000);
    return () => window.clearInterval(id);
  }, [len, paused]);

  const touchStartX = useRef<number | null>(null);
  function onTouchStart(e: TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }
  function onTouchEnd(e: TouchEvent) {
    if (len <= 1 || touchStartX.current === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40) return;
    setIndex((i) => (dx < 0 ? (i + 1) % len : (i - 1 + len) % len));
  }

  function enter(step: number) {
    if (reduced) return undefined;
    return {
      initial: { opacity: 0, y: 18 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.55, ease: revealEase, delay: step * 0.08 },
    };
  }

  return (
    <section className="relative bg-navy text-white">
      <div
        className="relative min-h-[100dvh] w-full overflow-hidden"
        onMouseEnter={() => setHoverPaused(true)}
        onMouseLeave={() => setHoverPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="absolute inset-0">
          {(len > 0 ? slides : [{ id: "fallback", src: FALLBACK.src, alt: FALLBACK.alt }]).map(
            (item, i) => (
              <div
                key={item.id}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  i === safeIndex
                    ? "z-[1] opacity-100"
                    : "pointer-events-none z-0 opacity-0"
                }`}
                aria-hidden={i !== safeIndex}
              >
                <Image
                  src={item.src}
                  alt={item.alt || FALLBACK.alt}
                  fill
                  priority={i === 0}
                  className="object-cover object-center"
                  sizes="100vw"
                />
              </div>
            ),
          )}

          <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-navy/55 via-navy/10 to-navy/85 sm:bg-gradient-to-r sm:from-navy/70 sm:via-navy/20 sm:to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] hidden h-2/5 bg-gradient-to-t from-navy-deep/80 to-transparent sm:block" />

          <div className="absolute inset-0 z-[3] flex flex-col justify-end px-6 pb-8 pt-28 sm:px-10 sm:pb-10 lg:px-16">
            <div className="max-w-2xl">
              <motion.p
                {...enter(0)}
                className="mb-4 flex items-center gap-3 text-xs font-semibold tracking-[0.22em] text-white/85 uppercase sm:text-sm"
              >
                <span aria-hidden className="h-px w-8 bg-white/60" />
                {siteConfig.concept}
              </motion.p>
              <motion.h1
                {...enter(1)}
                className="font-display text-[clamp(2.5rem,7vw,4.75rem)] font-light leading-[1.08] tracking-tight text-balance drop-shadow-[0_2px_24px_rgba(7,21,38,0.35)]"
              >
                {t("home.title")}
              </motion.h1>
            </div>
            <motion.div {...enter(2)} className="mt-8 max-w-5xl">
              <FeatureStrip />
            </motion.div>
            {len > 1 ? (
              <div className="mt-3 flex items-center gap-4">
                <span
                  aria-hidden
                  className="font-modern text-xs tabular-nums tracking-[0.18em] text-white/80"
                >
                  {String(safeIndex + 1).padStart(2, "0")}
                  <span className="text-white/45"> / {String(len).padStart(2, "0")}</span>
                </span>
                <div className="flex items-center">
                  {slides.map((slide, i) => (
                    <button
                      key={slide.id}
                      type="button"
                      aria-label={`ไปสไลด์ ${i + 1}`}
                      aria-current={i === safeIndex ? "true" : undefined}
                      onClick={() => setIndex(i)}
                      className="flex h-11 w-9 items-center justify-center"
                    >
                      <span
                        className={`h-0.5 w-full rounded-full transition-all duration-500 ${
                          i === safeIndex ? "bg-white" : "bg-white/35"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
