"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { heroSlides } from "@/lib/mock-content";

export function HeroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % heroSlides.length);
    }, 5500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="relative overflow-hidden bg-navy">
      <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] md:aspect-[1024/496]">
        {heroSlides.map((item, i) => (
          <Link
            key={item.src}
            href={item.href}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? "opacity-100 z-[1]" : "opacity-0 z-0 pointer-events-none"
            }`}
            aria-hidden={i !== index}
            tabIndex={i === index ? 0 : -1}
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              priority={i === 0}
              className="object-cover object-center sm:object-contain"
              sizes="100vw"
            />
          </Link>
        ))}

        <button
          type="button"
          aria-label="สไลด์ก่อนหน้า"
          className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-navy hover:bg-white sm:left-3 sm:p-2 md:left-6"
          onClick={() => setIndex((i) => (i - 1 + heroSlides.length) % heroSlides.length)}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="สไลด์ถัดไป"
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-navy hover:bg-white sm:right-3 sm:p-2 md:right-6"
          onClick={() => setIndex((i) => (i + 1) % heroSlides.length)}
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {heroSlides.map((item, i) => (
            <button
              key={item.src}
              type="button"
              aria-label={`ไปสไลด์ ${i + 1}`}
              className={`h-2 w-2 rounded-full ${i === index ? "bg-white" : "bg-white/45"}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
