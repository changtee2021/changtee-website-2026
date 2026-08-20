"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, type TouchEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Images, MessageCircle, Phone } from "lucide-react";
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
      <div className="mx-auto flex max-w-md items-center gap-2">
        <div className="pointer-events-auto flex min-w-0 flex-1 items-stretch gap-0.5 rounded-full border border-white/70 bg-white/55 px-1.5 py-1 shadow-[0_8px_32px_rgba(11,31,58,0.16)] backdrop-blur-xl dark:border-line dark:bg-[#1a2433]/90 dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
          <div
            className="relative flex min-w-[7.75rem] flex-[1.7] rounded-full bg-navy/8 p-0.5 dark:bg-white/8"
            onTouchStart={onToggleTouchStart}
            onTouchEnd={onToggleTouchEnd}
          >
            {browse ? (
              <motion.span
                layoutId={reduced ? undefined : "dock-browse-pill"}
                className="absolute inset-y-0.5 w-[calc(50%-2px)] rounded-full bg-white shadow-sm dark:bg-[#0b1f3a]"
                initial={false}
                animate={{
                  left: browse === "portfolio" ? "calc(50% + 1px)" : "2px",
                }}
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
              <span className="text-[10px] font-semibold leading-tight">
                สินค้า
              </span>
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
              <span className="text-[10px] font-semibold leading-tight">
                ผลงาน
              </span>
            </Link>
          </div>

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
        </div>

        <a
          href={`tel:${siteConfig.phoneTel}`}
          aria-label="โทรเลย"
          title="โทรเลย"
          className="pointer-events-auto inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-red text-white shadow-[0_8px_24px_rgba(200,16,46,0.38)] transition hover:bg-brand-red-soft active:scale-95"
        >
          <Phone className="size-6" strokeWidth={2.2} aria-hidden />
        </a>
      </div>
    </nav>
  );
}
