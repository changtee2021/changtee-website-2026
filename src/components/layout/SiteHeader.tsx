"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Home, Menu, X } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { useLockBodyScroll } from "@/lib/use-lock-body-scroll";
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
import {
  AboutMobileLinks,
  AboutNavPanel,
} from "@/components/about/AboutNavMenu";
import { BrochureLink } from "@/components/catalog/BrochureLink";

const mainNav = [
  { href: "/", label: "หน้าแรก", home: true },
  { href: "/products", label: "สินค้า/บริการ", mega: true },
  { href: "/portfolio", label: "ผลงาน", portfolio: true },
  { href: "/learn", label: "ห้องเรียนรู้" },
  { href: "/blog", label: "บทความ" },
  { href: "/contact", label: "เกี่ยวกับเรา", about: true },
] as const;

/** Match HomePanel / page content column */
const shellPad = "px-6 sm:px-10 lg:px-16";
const contentCol = "mx-auto w-full max-w-5xl";

/** Pages whose hero is a full-bleed image — header floats transparently on top, like the homepage */
const FULL_BLEED_HERO_PATHS = new Set([
  "/",
  "/learn",
  "/about",
  "/contact",
  "/blog",
  "/portfolio",
  "/products",
  "/visit-factory",
]);

export function SiteHeader() {
  const pathname = usePathname();
  return <SiteHeaderBar key={pathname} pathname={pathname} />;
}

function SiteHeaderBar({ pathname }: { pathname: string }) {
  const hasFullBleedHero = FULL_BLEED_HERO_PATHS.has(pathname);
  const [open, setOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const [navHeight, setNavHeight] = useState(0);
  const reducedMotion = useReducedMotion();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const floatHeader = hasFullBleedHero && !stuck;
  const overlay = floatHeader && !open;
  const pinNav = stuck;

  useEffect(() => {
    if (!hasFullBleedHero) return;
    const onScroll = () => {
      const y = window.scrollY;
      setStuck((prev) => (prev ? y > 20 : y > 64));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hasFullBleedHero]);

  useEffect(() => {
    if (hasFullBleedHero) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const io = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { threshold: 0 },
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, [hasFullBleedHero]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const update = () => setNavHeight(nav.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(nav);
    return () => ro.disconnect();
  }, [open, stuck]);

  useLockBodyScroll(open);

  return (
    <header
      className={
        floatHeader
          ? "pointer-events-none fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top,0px)]"
          : undefined
      }
    >
      {/* Top utility row — scrolls away */}
      <div
        className={`pointer-events-auto hidden lg:block ${
          overlay
            ? "border-b border-white/15 bg-transparent"
            : hasFullBleedHero
              ? "hidden"
              : "border-b border-line bg-panel"
        }`}
      >
        <div className={shellPad}>
          <div
            className={`${overlay ? "w-full" : contentCol} flex items-center justify-between gap-2 py-1.5 sm:py-2`}
          >
            <SocialLinks className="flex" size={28} />

            <Link
              href="/"
              className="flex min-w-0 items-center justify-center"
            >
              <Image
                src="/images/brand/logo.png"
                alt={`${siteConfig.name} ออกแบบ-ติดตั้ง ผ้าม่าน`}
                width={200}
                height={200}
                className="h-16 w-16 object-contain drop-shadow-md md:h-20 md:w-20"
                priority
              />
            </Link>

            <div
              className={`flex flex-col items-end gap-1 text-right text-sm ${
                overlay ? "text-white" : ""
              }`}
            >
              {overlay ? null : (
                <Link
                  href="/quote"
                  className="font-semibold text-navy hover:text-brand-red"
                >
                  ขอใบเสนอราคา - Quotation
                </Link>
              )}
              <BrochureLink
                className={overlay ? "text-white/75 hover:text-white" : "text-muted hover:text-navy"}
              >
                Download Brochure ช่างตี๋ 2026
              </BrochureLink>
            </div>
          </div>
        </div>
      </div>

      {/* Sentinel: when this leaves the viewport, pin the navy bar */}
      {hasFullBleedHero ? null : <div ref={sentinelRef} className="h-0 w-full" aria-hidden />}

      {/* Spacer keeps layout from jumping when nav becomes fixed */}
      {stuck && !hasFullBleedHero ? <div style={{ height: navHeight }} aria-hidden /> : null}

      {/* Navy main nav — overlay on home; pinned menu bar when scrolled */}
      <div
        ref={navRef}
        className={`pointer-events-auto z-50 text-white ${
          overlay
            ? "bg-transparent"
            : pinNav
              ? "animate-header-slide-down fixed inset-x-0 top-0 bg-navy pt-[env(safe-area-inset-top,0px)] shadow-md shadow-navy/25"
              : "relative bg-navy shadow-md shadow-navy/25 max-lg:pt-[env(safe-area-inset-top,0px)]"
        }`}
      >
        <div className={`${shellPad} hidden lg:block`}>
          <nav
            className={`${overlay ? "w-full" : contentCol} flex items-center gap-1 ${
              overlay ? "[&>a:first-child]:pl-0 [&>div:first-child_a]:pl-0" : ""
            }`}
          >
            {pinNav ? (
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
                <DesktopDisclosure
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  panelClassName="w-[min(40rem,calc(100vw-2rem))] p-4"
                >
                  {(close) => <ProductsMegaPanel onNavigate={close} />}
                </DesktopDisclosure>
              ) : "portfolio" in item && item.portfolio ? (
                <DesktopDisclosure
                  key={item.href}
                  href={item.href}
                  label={item.label}
                >
                  {(close) => <PortfolioNavPanel onNavigate={close} />}
                </DesktopDisclosure>
              ) : "about" in item && item.about ? (
                <DesktopDisclosure
                  key={item.href}
                  href={item.href}
                  label={item.label}
                >
                  {(close) => <AboutNavPanel onNavigate={close} />}
                </DesktopDisclosure>
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
              {overlay ? null : (
                <Link
                  href="/quote"
                  className="rounded-md bg-brand-red px-3 py-1.5 text-sm font-semibold hover:bg-brand-red-soft"
                >
                  ขอใบเสนอราคา
                </Link>
              )}
            </div>
          </nav>
        </div>

        <div className={`${shellPad} lg:hidden`}>
          <div
            className={`${contentCol} flex items-center justify-between gap-2 py-2`}
          >
            <div className="flex min-w-0 items-center gap-2">
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
                  priority
                />
              </Link>
              <button
                type="button"
                className="inline-flex size-11 shrink-0 items-center justify-center text-white"
                aria-label="เมนู"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
            <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 sm:gap-2">
              <SiteSearch className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-white hover:bg-white/10" />
              {overlay ? null : (
                <Link
                  href="/quote"
                  className="inline-flex min-h-11 items-center rounded-md bg-brand-red px-3 text-sm font-semibold hover:bg-brand-red-soft"
                >
                  ขอราคา
                </Link>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              key="mobile-nav"
              className="overflow-hidden lg:hidden"
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{
                duration: reducedMotion ? 0 : 0.36,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="max-h-[min(70vh,calc(100dvh-8.5rem-env(safe-area-inset-bottom,0px)))] overflow-y-auto border-t border-white/15 bg-navy">
            <div className={shellPad}>
              <div className={`${contentCol} flex flex-col py-2`}>
                {mainNav.map((item) =>
                  "mega" in item && item.mega ? (
                    <div key={item.href}>
                      <button
                        type="button"
                        className="flex min-h-12 w-full items-center justify-between py-3 text-left text-sm font-medium text-white"
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
                    <div key={item.href}>
                      <button
                        type="button"
                        className="flex min-h-12 w-full items-center justify-between py-3 text-left text-sm font-medium text-white"
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
                  ) : "about" in item && item.about ? (
                    <div key={item.href}>
                      <button
                        type="button"
                        className="flex min-h-12 w-full items-center justify-between py-3 text-left text-sm font-medium text-white"
                        onClick={() => setAboutOpen((v) => !v)}
                        aria-expanded={aboutOpen}
                      >
                        {item.label}
                        <ChevronDown
                          className={`h-4 w-4 transition ${aboutOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                      {aboutOpen ? (
                        <AboutMobileLinks onNavigate={() => setOpen(false)} />
                      ) : null}
                    </div>
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex min-h-12 items-center py-3 text-sm font-medium text-white"
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ),
                )}
                <Link
                  href="/quote"
                  className="flex min-h-12 items-center py-3 text-sm font-semibold text-white"
                  onClick={() => setOpen(false)}
                >
                  ขอใบเสนอราคา
                </Link>
              </div>
            </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </header>
  );
}

function DesktopDisclosure({
  href,
  label,
  children,
  panelClassName = "",
}: {
  href: string;
  label: string;
  children: (close: () => void) => React.ReactNode;
  panelClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <div className="inline-flex items-stretch">
        <Link
          href={href}
          className="inline-flex items-center px-4 py-3 text-sm font-medium hover:bg-white/10"
        >
          {label}
        </Link>
        <button
          type="button"
          className="inline-flex items-center pr-3 hover:bg-white/10"
          aria-expanded={open}
          aria-haspopup="true"
          aria-label={`เปิดเมนู${label}`}
          onClick={() => setOpen((v) => !v)}
        >
          <ChevronDown className={`h-3.5 w-3.5 opacity-80 transition ${open ? "rotate-180" : ""}`} />
        </button>
      </div>
      {open ? (
        <div
          className={`absolute left-0 top-full z-50 border border-line bg-panel text-ink shadow-lg ${panelClassName}`}
        >
          {children(() => setOpen(false))}
        </div>
      ) : null}
    </div>
  );
}
