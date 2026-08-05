"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const len = slides.length;
  const safeIndex = len > 0 ? index % len : 0;

  useEffect(() => {
    if (len <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % len);
    }, 5500);
    return () => window.clearInterval(id);
  }, [len]);

  if (len === 0) {
    return (
      <section className="flex aspect-[16/9] max-h-[420px] items-center justify-center bg-navy text-sm text-white/70">
        ยังไม่มีสไลด์หน้าแรกที่เผยแพร่
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-navy">
      <div className="relative aspect-[3/4] w-full max-h-[70vh] sm:aspect-[16/9] sm:max-h-[560px] md:max-h-[620px]">
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
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-navy hover:bg-white sm:left-3 sm:p-2 md:left-6"
              onClick={() =>
                setIndex((i) => (i - 1 + slides.length) % slides.length)
              }
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="สไลด์ถัดไป"
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-navy hover:bg-white sm:right-3 sm:p-2 md:right-6"
              onClick={() => setIndex((i) => (i + 1) % slides.length)}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {slides.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`ไปสไลด์ ${i + 1}`}
                  className={`h-2 w-2 rounded-full ${
                    i === safeIndex ? "bg-white" : "bg-white/45"
                  }`}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
