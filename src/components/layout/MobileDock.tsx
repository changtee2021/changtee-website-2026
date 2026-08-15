"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, type TouchEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FileText, Images, MessageCircle, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";
import { IconRoller } from "@/components/icons/product-line-icons";

const itemClass =
  "flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1 py-1.5 text-navy transition active:scale-95";

export function MobileDock() {
  const pathname = usePathname();
  const router = useRouter();
  const reduced = useReducedMotion();
  const onProducts = pathname.startsWith("/products");
  const onPortfolio = pathname.startsWith("/portfolio");
  const onQuote = pathname.startsWith("/quote");
  const browse: "products" | "portfolio" | null = onPortfolio
    ? "portfolio"
    : onProducts
      ? "products"
      : null;

  const touchX = useRef<number | null>(null);
  function onToggleTouchStart(e: TouchEvent) {
    touchX.current = e.touches[0]?.clientX ?? null;
  }
  function onToggleTouchEnd(e: TouchEvent) {
    if (touchX.current === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) < 28) return;
    router.push(dx < 0 ? "/portfolio" : "/products");
  }

  return (
    <nav
      data-print-hide
      aria-label="เมนูล่าง"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] lg:hidden"
    >
      <div className="pointer-events-auto mx-auto flex max-w-md items-stretch gap-0.5 rounded-full border border-white/70 bg-white/55 px-1.5 py-1 shadow-[0_8px_32px_rgba(11,31,58,0.16)] backdrop-blur-xl">
        <div
          className="relative flex min-w-[7.75rem] flex-[1.7] rounded-full bg-navy/8 p-0.5"
          onTouchStart={onToggleTouchStart}
          onTouchEnd={onToggleTouchEnd}
        >
          {browse ? (
            <motion.span
              layoutId={reduced ? undefined : "dock-browse-pill"}
              className="absolute inset-y-0.5 w-[calc(50%-2px)] rounded-full bg-white shadow-sm"
              initial={false}
              animate={{ left: browse === "portfolio" ? "calc(50% + 1px)" : "2px" }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 420, damping: 34, mass: 0.7 }
              }
              aria-hidden
            />
          ) : null}
          <Link
            href="/products"
            aria-current={onProducts ? "page" : undefined}
            className={cn(
              "relative z-10 flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1 text-navy",
              onProducts && "font-bold",
            )}
          >
            <IconRoller className="size-5" />
            <span className="text-[10px] font-semibold leading-tight">สินค้า</span>
          </Link>
          <Link
            href="/portfolio"
            aria-current={onPortfolio ? "page" : undefined}
            className={cn(
              "relative z-10 flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1 text-navy",
              onPortfolio && "font-bold",
            )}
          >
            <Images className="size-4" strokeWidth={2.1} aria-hidden />
            <span className="text-[10px] font-semibold leading-tight">ผลงาน</span>
          </Link>
        </div>

        <a href={`tel:${siteConfig.phoneTel}`} className={itemClass}>
          <Phone className="size-5" strokeWidth={2.1} aria-hidden />
          <span className="text-[10px] font-semibold leading-tight">โทรเลย</span>
        </a>
        <a
          href={siteConfig.lineUrl}
          target="_blank"
          rel="noreferrer"
          className={itemClass}
        >
          <MessageCircle
            className="size-5 text-[#06C755]"
            strokeWidth={2.1}
            aria-hidden
          />
          <span className="text-[10px] font-semibold leading-tight">LINE</span>
        </a>
        <Link
          href="/quote"
          aria-current={onQuote ? "page" : undefined}
          className={cn(
            itemClass,
            "bg-brand-red text-white shadow-sm",
            onQuote && "bg-brand-red-soft",
          )}
        >
          <FileText className="size-5" strokeWidth={2.1} aria-hidden />
          <span className="text-[10px] font-semibold leading-tight">ขอราคา</span>
        </Link>
      </div>
    </nav>
  );
}
