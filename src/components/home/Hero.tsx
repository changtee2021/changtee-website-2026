"use client";

import Image from "next/image";
import Link from "next/link";
import { createElement, useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useHeroSlides } from "@/lib/cms/demo-store";
import { publishedHeroSlides } from "@/lib/cms/hero-slides-demo";
import { revealEase } from "@/components/home/Reveal";
import { siteConfig } from "@/lib/site-config";
import { heroCategoryIcon } from "@/components/home/hero-category-icons";

function categorySlugFromSlide(href: string, title: string, subtitle: string) {
  const parts = href.split("/").filter(Boolean);
  if (parts[0] === "products" && parts[1]) return parts[1];

  const text = `${title} ${subtitle}`.toLowerCase();
  if (/ม่านม้วน|roller|sunscreen|zebra/.test(text)) return "roller-blinds";
  if (/มู่ลี่|venetian/.test(text)) return "venetian-blinds";
  if (/ปรับแสง|vertical/.test(text)) return "vertical-blinds";
  if (/ฉาก|pvc/.test(text)) return "pvc-partition";
  if (/ไฟฟ้า|motor/.test(text)) return "motorized";
  if (/วอล|ฟิล์ม|surface/.test(text)) return "surface";
  if (/พิมพ์|print/.test(text)) return "print-fabric";
  if (/ภายนอก|outdoor/.test(text)) return "outdoor-factory";
  if (/ผ้าม่าน|curtain/.test(text)) return "curtain";
  return "";
}

function HeroSlideIcon({
  href,
  title,
  subtitle,
}: {
  href: string;
  title: string;
  subtitle: string;
}) {
  const slug = categorySlugFromSlide(href, title, subtitle);
  return (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#eef2f7]">
      {createElement(heroCategoryIcon(slug), { className: "size-8 text-navy" })}
    </span>
  );
}

const FALLBACK = {
  src: "/images/generated/ct-hero-living.webp",
  alt: "ผ้าม่านห้องนั่งเล่น ผลงานช่างตี๋",
};

export function Hero() {
  const stored = useHeroSlides();
  const slides = useMemo(() => publishedHeroSlides(stored), [stored]);
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [hoverPaused, setHoverPaused] = useState(false);

  const len = slides.length;
  const safeIndex = len > 0 ? index % len : 0;
  const active = len > 0 ? slides[safeIndex] : null;
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

          <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-navy/55 via-navy/15 to-navy/80 sm:bg-gradient-to-r sm:from-navy/75 sm:via-navy/30 sm:to-navy/20" />

          <div className="absolute inset-0 z-[3] flex flex-col justify-end px-6 pb-28 pt-28 sm:justify-center sm:px-10 sm:pb-16 sm:pt-32 lg:px-16">
            <div className="max-w-2xl">
              <motion.p
                {...enter(0)}
                className="text-xs font-semibold tracking-[0.18em] text-white/70 uppercase"
              >
                {siteConfig.nameEn} · ผลิตเอง ติดตั้งเอง
              </motion.p>

              <motion.h1
                {...enter(1)}
                className="mt-3 font-modern text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl lg:text-[3.25rem]"
              >
                A beautiful home
                <span className="block">starts with the right curtains</span>
              </motion.h1>
              <p className="mt-2 font-sans text-lg font-normal leading-snug text-white/90 sm:text-xl">
                แต่งบ้านให้สวย เริ่มที่ผ้าม่านที่ใช่
              </p>

              <motion.div {...enter(2)} className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/portfolio"
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-navy transition hover:bg-white/90"
                >
                  ดูผลงานติดตั้ง
                </Link>
                <Link
                  href="/quote"
                  className="inline-flex items-center justify-center rounded-full border border-white/50 px-6 py-3 text-sm font-semibold text-white transition hover:border-brand-red/50 hover:bg-brand-red/35"
                >
                  ขอใบเสนอราคา
                </Link>
              </motion.div>
            </div>
          </div>

          {active ? (
            <Link
              href={active.href || "/products"}
              className="absolute bottom-24 right-4 z-[4] hidden max-w-[18rem] items-center gap-3 rounded-2xl bg-white/95 px-3 py-2.5 text-navy shadow-lg backdrop-blur sm:bottom-10 sm:right-10 sm:flex lg:right-16"
            >
              <HeroSlideIcon
                href={active.href || ""}
                title={active.title}
                subtitle={active.subtitle}
              />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">
                  {active.subtitle || active.title}
                </span>
                {active.price ? (
                  <span className="mt-0.5 block truncate text-xs text-muted">
                    {active.price}
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 text-xs font-semibold text-brand-red">
                ดูสินค้า →
              </span>
            </Link>
          ) : null}

          {len > 1 ? (
            <div className="absolute bottom-20 left-6 z-[4] flex items-center sm:bottom-6 sm:left-10 lg:left-16">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`ไปสไลด์ ${i + 1}`}
                  aria-current={i === safeIndex ? "true" : undefined}
                  onClick={() => setIndex(i)}
                  className="flex h-11 w-11 items-center justify-center"
                >
                  <span
                    className={`rounded-full transition-all duration-300 ${
                      i === safeIndex ? "h-1.5 w-6 bg-white" : "h-1.5 w-1.5 bg-white/45"
                    }`}
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
