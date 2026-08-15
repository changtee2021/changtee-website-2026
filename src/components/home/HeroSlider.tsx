"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useHeroSlides } from "@/lib/cms/demo-store";
import {
  publishedHeroSlides,
  type HeroSlide,
} from "@/lib/cms/hero-slides-demo";

export function HeroSlider({
  slides: slidesProp,
}: {
  /** Override for admin preview (includes unpublished draft). */
  slides?: HeroSlide[];
}) {
  const stored = useHeroSlides();
  const slides = useMemo(() => {
    if (slidesProp?.length) {
      return [...slidesProp].sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return publishedHeroSlides(stored);
  }, [slidesProp, stored]);

  const [index, setIndex] = useState(0);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const len = slides.length;
  const safeIndex = len > 0 ? index % len : 0;
  const paused = hoverPaused || userPaused || reduceMotion;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (len <= 1 || paused || reduceMotion) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % len);
    }, 5500);
    return () => window.clearInterval(id);
  }, [len, paused, reduceMotion]);

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

  if (len === 0) {
    return (
      <section className="flex aspect-[16/9] max-h-[420px] items-center justify-center bg-navy text-sm text-white/70">
        ยังไม่มีสไลด์หน้าแรกที่เผยแพร่
      </section>
    );
  }

  return (
    <section
      className="relative overflow-hidden bg-navy"
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
    >
      <div
        className="relative aspect-[3/4] w-full max-h-[70vh] sm:aspect-[16/9] sm:max-h-[560px] md:max-h-[620px]"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {slides.map((item, i) => (
          <Link
            key={item.id}
            href={item.href || "/products"}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === safeIndex
                ? "z-[1] opacity-100"
                : "pointer-events-none z-0 opacity-0"
            }`}
            aria-hidden={i !== safeIndex}
            tabIndex={i === safeIndex ? 0 : -1}
          >
            <Image
              src={item.src}
              alt={item.alt || item.title || item.subtitle}
              fill
              priority={i === 0}
              className="object-cover object-center"
              sizes="100vw"
            />
          </Link>
        ))}

        {slides.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="สไลด์ก่อนหน้า"
              className="absolute left-2 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-navy hover:bg-white sm:left-3 md:left-6"
              onClick={() =>
                setIndex((i) => (i - 1 + slides.length) % slides.length)
              }
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="สไลด์ถัดไป"
              className="absolute right-2 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-navy hover:bg-white sm:right-3 md:right-6"
              onClick={() => setIndex((i) => (i + 1) % slides.length)}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center">
              {slides.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`ไปสไลด์ ${i + 1}`}
                  aria-current={i === safeIndex ? "true" : undefined}
                  className="flex h-11 w-11 items-center justify-center"
                  onClick={() => setIndex(i)}
                >
                  <span
                    className={`rounded-full ${
                      i === safeIndex ? "h-2 w-2 bg-white" : "h-2 w-2 bg-white/45"
                    }`}
                  />
                </button>
              ))}
              <button
                type="button"
                aria-label={userPaused || reduceMotion ? "เล่นสไลด์อัตโนมัติ" : "หยุดสไลด์อัตโนมัติ"}
                className="ml-1 flex size-11 items-center justify-center rounded-full bg-white/80 text-navy hover:bg-white"
                onClick={() => setUserPaused((v) => !v)}
              >
                {userPaused || reduceMotion ? (
                  <Play className="h-3 w-3" />
                ) : (
                  <Pause className="h-3 w-3" />
                )}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
