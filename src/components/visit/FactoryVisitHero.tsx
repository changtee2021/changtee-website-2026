"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type MouseEvent, type TouchEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { revealEase } from "@/components/home/Reveal";
import { parseVisitMode, visitModeHref } from "@/lib/visits/modes";
import { siteConfig } from "@/lib/site-config";

const SLIDES = [
  {
    src: "/images/factory/visit-01-production.png",
    alt: "ไลน์ผลิตมู่ลี่ในโรงงานช่างตี๋ ทีมงานประกอบที่สถานีแนวตั้ง",
  },
  {
    src: "/images/factory/visit-02-blinds.png",
    alt: "มู่ลี่อลูมิเนียมบนโต๊ะผลิตในโรงงานช่างตี๋",
  },
  {
    src: "/images/factory/visit-03-assembly.png",
    alt: "สถานีประกอบมู่ลี่ไม้ในโรงงานผลิตช่างตี๋",
  },
  {
    src: "/images/factory/visit-04-warehouse.png",
    alt: "คลังวัสดุบัวเชิงและไม้ตกแต่งในโรงงานช่างตี๋",
  },
  {
    src: "/images/factory/visit-05-stations.png",
    alt: "พื้นที่ประกอบมู่ลี่หลายสถานีในโรงงานช่างตี๋",
  },
  {
    src: "/images/factory/visit-06-line.png",
    alt: "ทีมงานผลิตมู่ลี่บนไลน์โรงงานช่างตี๋",
  },
] as const;

export function FactoryVisitHero() {
  const searchParams = useSearchParams();
  const mode = parseVisitMode(searchParams.get("mode"));
  const isPresentation = mode === "product-presentation";
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [hoverPaused, setHoverPaused] = useState(false);
  const len = SLIDES.length;
  const safeIndex = index % len;
  const paused = hoverPaused || !!reduced;

  useEffect(() => {
    if (len <= 1 || paused) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % len), 5500);
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

  function scrollToForm(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    document.getElementById("visit-form")?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
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
        {SLIDES.map((item, i) => (
          <div
            key={item.src}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === safeIndex
                ? "z-[1] opacity-100"
                : "pointer-events-none z-0 opacity-0"
            }`}
            aria-hidden={i !== safeIndex}
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              priority={i === 0}
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>
        ))}

        <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-navy/60 via-navy/20 to-navy/85 sm:bg-gradient-to-r sm:from-navy/80 sm:via-navy/35 sm:to-navy/15" />

        <div className="absolute inset-0 z-[3] flex flex-col justify-end px-6 pb-28 pt-28 sm:justify-center sm:px-10 sm:pb-16 sm:pt-32 lg:px-16">
          <div className="max-w-xl">
            <motion.p
              {...enter(0)}
              className="text-xs font-semibold tracking-[0.18em] text-white/70 uppercase"
            >
              {isPresentation ? "Product Presentation" : "Factory Visit"} ·{" "}
              {siteConfig.nameEn}
            </motion.p>
            <motion.h1
              {...enter(1)}
              className="mt-3 font-modern text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl lg:text-[3.25rem]"
            >
              {isPresentation ? "Book a Product Presentation" : "Book a Factory Visit"}
            </motion.h1>
            <p className="mt-2 font-sans text-lg font-normal leading-snug text-white/90 sm:text-xl">
              {isPresentation ? "นัดนำเสนอสินค้า" : "นัดเยี่ยมชมโรงงานเรา"}
            </p>
            <motion.p
              {...enter(2)}
              className="mt-4 max-w-lg text-sm leading-relaxed text-white/85 sm:text-base"
            >
              {isPresentation
                ? "สำหรับนิติบุคคลและองค์กร ทีมงานเข้าพบที่บริษัท หรือนัดพรีเซนต์ที่โชว์รูม — ใช้เวลาประมาณ 45–60 นาที"
                : "ดูขั้นตอนการผลิตผ้าม่านจริง เลือกตัวอย่างเนื้อผ้า และพูดคุยกับทีมงานที่โรงงาน — เลือกรอบเช้าหรือรอบเย็นที่สะดวก"}
            </motion.p>
            <motion.div {...enter(3)} className="mt-7 flex flex-wrap gap-3">
              <a
                href={visitModeHref(mode)}
                onClick={scrollToForm}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-navy transition hover:bg-white/90"
              >
                {isPresentation ? "ส่งคำขอนัดนำเสนอ" : "ส่งคำขอนัดเยี่ยมชม"}
              </a>
              <a
                href={
                  isPresentation
                    ? visitModeHref("factory-visit")
                    : visitModeHref("product-presentation")
                }
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {isPresentation ? "สลับไปนัดเยี่ยมชม" : "นัดนำเสนอสินค้า"}
              </a>
              {isPresentation ? null : (
                <a
                  href={siteConfig.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  ดูแผนที่โรงงาน
                </a>
              )}
            </motion.div>
          </div>
        </div>

        {len > 1 ? (
          <div className="absolute bottom-20 left-6 z-[4] flex items-center sm:bottom-6 sm:left-10 lg:left-16">
            {SLIDES.map((slide, i) => (
              <button
                key={slide.src}
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
    </section>
  );
}
