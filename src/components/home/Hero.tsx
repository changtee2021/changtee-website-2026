"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useHeroSlides } from "@/lib/cms/demo-store";
import { publishedHeroSlides } from "@/lib/cms/hero-slides-demo";
import { revealEase } from "@/components/home/Reveal";
import { siteConfig } from "@/lib/site-config";

const FALLBACK = {
  src: "/images/generated/ct-hero-living.webp",
  alt: "ผ้าม่านห้องนั่งเล่น ผลงานช่างตี๋",
};

export function Hero() {
  const stored = useHeroSlides();
  const slides = useMemo(() => publishedHeroSlides(stored), [stored]);
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);

  const len = slides.length;
  const safeIndex = len > 0 ? index % len : 0;
  const active = len > 0 ? slides[safeIndex] : null;

  useEffect(() => {
    if (len <= 1) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % len), 6000);
    return () => window.clearInterval(id);
  }, [len]);

  function enter(step: number) {
    if (reduced) return undefined;
    return {
      initial: { opacity: 0, y: 18 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.55, ease: revealEase, delay: step * 0.08 },
    };
  }

  return (
    <section className="px-3 pb-3 pt-3 sm:px-4 sm:pb-4 sm:pt-4">
      <div className="mx-auto w-full max-w-6xl rounded-[var(--radius-panel)] bg-navy text-white">
        <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-[1fr_1fr] md:items-center md:gap-6 md:p-10 lg:p-12">
          <div className="md:pr-4">
            <motion.p
              {...enter(0)}
              className="text-xs font-semibold tracking-[0.18em] text-white/60 uppercase"
            >
              {siteConfig.nameEn} · ผลิตเอง ติดตั้งเอง
            </motion.p>

            <motion.h1
              {...enter(1)}
              className="mt-4 font-display text-3xl font-semibold leading-[1.2] sm:text-4xl lg:text-[2.9rem]"
            >
              แต่งบ้านให้สวย
              <span className="block">เริ่มที่ผ้าม่านที่ใช่</span>
            </motion.h1>

            <motion.p
              {...enter(2)}
              className="mt-5 max-w-md text-sm leading-relaxed text-white/70 sm:text-base"
            >
              ทักมาคุยได้เลย เราวัดหน้างานให้ฟรี ออกแบบ ตัดเย็บ
              และติดตั้งด้วยทีมของเราเอง ดูแลทั้งบ้าน คอนโด ร้านค้า และออฟฟิศ
            </motion.p>

            <motion.div {...enter(3)} className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/quote"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-navy transition hover:bg-white/90"
              >
                ขอใบเสนอราคาฟรี
              </Link>
              <Link
                href="/portfolio"
                className="inline-flex items-center justify-center rounded-full border border-white/35 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                ดูผลงานติดตั้ง
              </Link>
            </motion.div>
          </div>

          <motion.div
            {...(reduced
              ? {}
              : {
                  initial: { opacity: 0, y: 22, scale: 0.98 },
                  animate: { opacity: 1, y: 0, scale: 1 },
                  transition: { duration: 0.6, ease: revealEase, delay: 0.32 },
                })}
            className="relative"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-white/10 md:-mr-4 md:-my-2 lg:-mr-8">
              {/* One image at a time — stacking every slide was crashing light browsers */}
              <Image
                key={active?.id ?? "fallback"}
                src={active?.src ?? FALLBACK.src}
                alt={active?.alt || active?.subtitle || FALLBACK.alt}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 560px"
              />
            </div>

            {active ? (
              <Link
                href={active.href || "/products"}
                className="mt-4 flex items-center justify-between gap-3 rounded-full bg-white/10 px-5 py-3 text-sm backdrop-blur transition hover:bg-white/15 md:absolute md:bottom-4 md:left-4 md:mt-0 md:bg-white md:text-navy md:hover:bg-white"
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold">
                    {active.subtitle || active.title}
                  </span>
                  {active.price ? (
                    <span className="block truncate text-xs text-white/70 md:text-muted">
                      {active.price}
                    </span>
                  ) : null}
                </span>
                <span className="shrink-0 text-xs font-semibold">ดูสินค้า →</span>
              </Link>
            ) : null}

            {len > 1 ? (
              <div className="mt-4 flex justify-center gap-1.5 md:justify-end">
                {slides.map((slide, i) => (
                  <button
                    key={slide.id}
                    type="button"
                    aria-label={`ไปสไลด์ ${i + 1}`}
                    onClick={() => setIndex(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === safeIndex ? "w-6 bg-white" : "w-1.5 bg-white/40"
                    }`}
                  />
                ))}
              </div>
            ) : null}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
