"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Home, Menu, X } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { SocialLinks } from "@/components/layout/SocialLinks";
import { SiteSearch } from "@/components/layout/SiteSearch";
import {
  ProductsMegaPanel,
  ProductsMobileLinks,
} from "@/components/products/ProductsMegaMenu";
import {
  PortfolioMobileLinks,
  PortfolioNavPanel,
} from "@/components/portfolio/PortfolioNavMenu";

const mainNav = [
  { href: "/", label: "หน้าแรก", home: true },
  { href: "/products", label: "สินค้า/บริการ", mega: true },
  { href: "/portfolio", label: "ผลงาน", portfolio: true },
  { href: "/blog", label: "บทความ" },
  { href: "/about", label: "เกี่ยวกับเรา" },
] as const;

/** Match HomePanel / page content column */
const shellPad = "px-6 sm:px-10 lg:px-16";
const contentCol = "mx-auto w-full max-w-5xl";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const [navHeight, setNavHeight] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const io = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { threshold: 0 },
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const update = () => setNavHeight(nav.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(nav);
    return () => ro.disconnect();
  }, [open, stuck]);

  return (
    <header>
      {/* Top utility row — scrolls away */}
      <div className="border-b border-line bg-panel">
        <div className={shellPad}>
          <div
            className={`${contentCol} flex items-center justify-between gap-2 py-1.5 sm:py-2`}
          >
            <SocialLinks className="hidden sm:flex" size={28} />

            <Link
              href="/"
              className="mx-auto flex min-w-0 items-center justify-center sm:mx-0"
            >
              <Image
                src="/images/brand/logo.png"
                alt={`${siteConfig.name} ออกแบบ-ติดตั้ง ผ้าม่าน`}
                width={200}
                height={200}
                className="h-12 w-12 object-contain sm:h-16 sm:w-16 md:h-20 md:w-20"
                priority
              />
            </Link>

            <div className="hidden flex-col items-end gap-1 text-right text-sm lg:flex">
              <Link
                href="/quote"
                className="font-semibold text-navy hover:text-brand-red"
              >
                ขอใบเสนอราคา - Quotation
              </Link>
              <a
                href="/brochure/company-profile-2026.pdf"
                className="text-muted hover:text-navy"
              >
                Download Brochure ช่างตี๋ 2026
              </a>
            </div>

            <div className="w-9 shrink-0 lg:hidden" aria-hidden />
          </div>
        </div>
      </div>

      {/* Sentinel: when this leaves the viewport, pin the navy bar */}
      <div ref={sentinelRef} className="h-0 w-full" aria-hidden />

      {/* Spacer keeps layout from jumping when nav becomes fixed */}
      {stuck ? <div style={{ height: navHeight }} aria-hidden /> : null}

      {/* Navy main nav — fixed to top after scrolling past logo */}
      <div
        ref={navRef}
        className={`z-50 bg-navy text-white shadow-md shadow-navy/25 ${
          stuck ? "fixed inset-x-0 top-0" : "relative"
        }`}
      >
        <div className={`${shellPad} hidden lg:block`}>
          <nav className={`${contentCol} flex items-center gap-1`}>
            {stuck ? (
              <Link
                href="/"
                className="mr-2 shrink-0 py-2 pr-2"
                aria-label={`${siteConfig.name} หน้าแรก`}
              >
                <Image
                  src="/images/brand/logo-mark-nav.png"
                  alt=""
                  width={40}
                  height={40}
                  className="h-9 w-9 object-contain"
                />
              </Link>
            ) : null}
            {mainNav.map((item) =>
              "mega" in item && item.mega ? (
                <div key={item.href} className="group relative">
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1 px-4 py-3 text-sm font-medium hover:bg-white/10"
                  >
                    {item.label}
                    <ChevronDown className="h-3.5 w-3.5 opacity-80" />
                  </Link>
                  <div className="invisible absolute left-0 top-full z-50 w-[min(40rem,calc(100vw-2rem))] border border-line bg-panel p-4 text-ink opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
                    <ProductsMegaPanel />
                  </div>
                </div>
              ) : "portfolio" in item && item.portfolio ? (
                <div key={item.href} className="group relative">
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1 px-4 py-3 text-sm font-medium hover:bg-white/10 group-hover:bg-white/10"
                  >
                    {item.label}
                    <ChevronDown className="h-3.5 w-3.5 opacity-80" />
                  </Link>
                  <div className="invisible absolute left-0 top-full z-50 border border-line bg-panel text-ink opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
                    <PortfolioNavPanel />
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center gap-1.5 px-4 py-3 text-sm font-medium hover:bg-white/10"
                >
                  {"home" in item && item.home ? (
                    <Home className="h-4 w-4" />
                  ) : null}
                  {item.label}
                </Link>
              ),
            )}
            <div className="ml-auto flex items-center gap-2 py-2">
              <SiteSearch className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/10" />
              <Link
                href="/quote"
                className="rounded-md bg-brand-red px-3 py-1.5 text-sm font-semibold hover:bg-brand-red-soft"
              >
                ขอใบเสนอราคา
              </Link>
            </div>
          </nav>
        </div>

        <div className={`${shellPad} lg:hidden`}>
          <div
            className={`${contentCol} flex items-center justify-between gap-2 py-2`}
          >
            <div className="flex min-w-0 items-center gap-2">
              {stuck ? (
                <Link
                  href="/"
                  className="shrink-0"
                  aria-label={`${siteConfig.name} หน้าแรก`}
                >
                  <Image
                    src="/images/brand/logo-mark-nav.png"
                    alt=""
                    width={36}
                    height={36}
                    className="h-8 w-8 object-contain"
                  />
                </Link>
              ) : null}
              <button
                type="button"
                className="inline-flex shrink-0 rounded-md border border-white/30 p-2 text-white"
                aria-label="เมนู"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
            <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 sm:gap-2">
              <SiteSearch className="inline-flex shrink-0 items-center justify-center rounded-md p-2 text-white hover:bg-white/10" />
              <Link
                href="/quote"
                className="truncate rounded-md bg-brand-red px-2.5 py-1.5 text-[11px] font-semibold hover:bg-brand-red-soft sm:px-3 sm:text-xs"
              >
                ขอราคา
              </Link>
            </div>
          </div>
        </div>

        {open ? (
          <div className="max-h-[70vh] overflow-y-auto border-t border-white/15 bg-navy lg:hidden">
            <div className={shellPad}>
              <div className={`${contentCol} flex flex-col py-2`}>
                {mainNav.map((item) =>
                  "mega" in item && item.mega ? (
                    <div key={item.href} className="border-b border-white/10">
                      <button
                        type="button"
                        className="flex w-full items-center justify-between py-3 text-left text-sm font-medium text-white"
                        onClick={() => setProductsOpen((v) => !v)}
                        aria-expanded={productsOpen}
                      >
                        {item.label}
                        <ChevronDown
                          className={`h-4 w-4 transition ${productsOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                      {productsOpen ? (
                        <ProductsMobileLinks onNavigate={() => setOpen(false)} />
                      ) : null}
                    </div>
                  ) : "portfolio" in item && item.portfolio ? (
                    <div key={item.href} className="border-b border-white/10">
                      <button
                        type="button"
                        className="flex w-full items-center justify-between py-3 text-left text-sm font-medium text-white"
                        onClick={() => setPortfolioOpen((v) => !v)}
                        aria-expanded={portfolioOpen}
                      >
                        {item.label}
                        <ChevronDown
                          className={`h-4 w-4 transition ${portfolioOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                      {portfolioOpen ? (
                        <PortfolioMobileLinks onNavigate={() => setOpen(false)} />
                      ) : null}
                    </div>
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="border-b border-white/10 py-3 text-sm font-medium text-white"
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ),
                )}
                <Link
                  href="/contact"
                  className="border-b border-white/10 py-3 text-sm text-white"
                  onClick={() => setOpen(false)}
                >
                  ติดต่อเรา
                </Link>
                <Link
                  href="/quote"
                  className="py-3 text-sm font-semibold text-white"
                  onClick={() => setOpen(false)}
                >
                  ขอใบเสนอราคา
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
