"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Home, Menu, X } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { useLockBodyScroll } from "@/lib/use-lock-body-scroll";
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
import { QuotePill } from "@/components/layout/QuotePill";
import { useI18n } from "@/lib/i18n/use-i18n";
import type { MessageKey } from "@/lib/i18n/index";

const mainNav = [
  { href: "/", labelKey: "nav.home", home: true },
  { href: "/products", labelKey: "nav.products", mega: true },
  { href: "/portfolio", labelKey: "nav.portfolio", portfolio: true },
  { href: "/blog", labelKey: "nav.blog", stories: true },
  { href: "/contact", labelKey: "nav.about", about: true },
] as const;

const STORIES_NAV = [
  { href: "/blog", labelKey: "nav.blog" },
  { href: "/learn", labelKey: "nav.learn" },
] as const;

function desktopNavItems(translate: (key: MessageKey) => string) {
  return mainNav.map((item) =>
    "mega" in item && item.mega ? (
      <DesktopDisclosure
        key={item.href}
        href={item.href}
        label={translate(item.labelKey)}
        panelClassName="w-[min(40rem,calc(100vw-2rem))] p-4"
      >
        {(close) => <ProductsMegaPanel onNavigate={close} />}
      </DesktopDisclosure>
    ) : "portfolio" in item && item.portfolio ? (
      <DesktopDisclosure
        key={item.href}
        href={item.href}
        label={translate(item.labelKey)}
      >
        {(close) => <PortfolioNavPanel onNavigate={close} />}
      </DesktopDisclosure>
    ) : "about" in item && item.about ? (
      <DesktopDisclosure
        key={item.href}
        href={item.href}
        label={translate(item.labelKey)}
      >
        {(close) => <AboutNavPanel onNavigate={close} />}
      </DesktopDisclosure>
    ) : "stories" in item && item.stories ? (
      <DesktopDisclosure
        key={item.href}
        href={item.href}
        label={translate(item.labelKey)}
      >
        {(close) => <StoriesNavPanel onNavigate={close} />}
      </DesktopDisclosure>
    ) : (
      <Link
        key={item.href}
        href={item.href}
        className="inline-flex items-center gap-1.5 px-4 py-3 text-sm font-normal hover:bg-white/10"
      >
        {"home" in item && item.home ? <Home className="h-4 w-4" /> : null}
        {translate(item.labelKey)}
      </Link>
    ),
  );
}

/** Match HomePanel / page content column */
const shellPad = "px-6 sm:px-10 lg:px-16";
const contentCol = "mx-auto w-full max-w-5xl";

/** Pages whose hero is a full-bleed image — header floats transparently on top */
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
  const { t } = useI18n();
  const hasFullBleedHero = FULL_BLEED_HERO_PATHS.has(pathname);
  const [open, setOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [storiesOpen, setStoriesOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const [navHeight, setNavHeight] = useState(0);
  const reducedMotion = useReducedMotion();
  const navRef = useRef<HTMLDivElement>(null);
  const floatHeader = hasFullBleedHero && !stuck;
  const overlay = floatHeader && !open;
  const pinNav = stuck;

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const enter = 48;
      const exit = 16;
      setStuck((prev) => (prev ? y > exit : y > enter));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

  useLockBodyScroll(open);

  return (
    <header
      className={
        floatHeader
          ? "pointer-events-none fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top,0px)]"
          : undefined
      }
    >
      {overlay ? (
        <div className="pointer-events-auto hidden border-b border-white/15 bg-transparent lg:block">
          <div className={shellPad}>
            <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2 py-1.5 sm:py-2">
              <Link
                href="/"
                className="flex shrink-0 items-center justify-self-start"
              >
                <Image
                  src="/images/brand/logo-mark-white.png"
                  alt={`${siteConfig.name} ออกแบบ-ติดตั้ง ผ้าม่าน`}
                  width={200}
                  height={200}
                  className="h-10 w-10 object-contain md:h-12 md:w-12"
                  priority
                />
              </Link>

              <nav className="flex min-w-0 items-center gap-1 text-white">
                {desktopNavItems(t)}
              </nav>

              <div className="ml-auto flex items-center justify-end justify-self-end text-sm">
                <div className="inline-flex h-11 items-center">
                  <SiteSearch className="mr-1 inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/10" />
                  <QuotePill label={t("nav.quote")} className="bg-transparent text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {stuck && !hasFullBleedHero ? <div style={{ height: navHeight }} aria-hidden /> : null}

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
        <div className={`${shellPad} ${overlay ? "hidden" : "hidden lg:block"}`}>
          <nav className={`${contentCol} flex items-center gap-1`}>
            {pinNav ? (
              <Link
                href="/"
                className="mr-2 shrink-0 py-2 pr-2"
                aria-label={`${siteConfig.name} ${t("nav.homeAria")}`}
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
            {desktopNavItems(t)}
            {pinNav ? (
              <SiteSearch className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/10" />
            ) : null}
            <div className="ml-auto flex items-center gap-2 py-2">
              {!pinNav ? (
                <>
                  <SiteSearch className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/10" />
                  {overlay ? null : <QuotePill label={t("nav.quote")} />}
                </>
              ) : (
                <div className="inline-flex h-11 items-center">
                  <BrochureLink
                    slide
                    className="bg-transparent text-white"
                    fillClassName="bg-white"
                    hoverLabelClassName="group-hover:text-navy-solid group-focus-visible:text-navy-solid"
                    iconClassName="text-navy-solid"
                  >
                    Brochure ช่างตี๋
                  </BrochureLink>
                  <span aria-hidden className="mx-3 h-5 w-px shrink-0 bg-white/55" />
                  <QuotePill label={t("nav.quote")} className="bg-transparent text-white" />
                </div>
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
                aria-label={`${siteConfig.name} ${t("nav.homeAria")}`}
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
                aria-label={t("nav.menu")}
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
            <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 sm:gap-2">
              <SiteSearch className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-white hover:bg-white/10" />
              {overlay ? null : <QuotePill label={t("nav.quoteShort")} />}
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
                        {t(item.labelKey)}
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
                        {t(item.labelKey)}
                        <ChevronDown
                          className={`h-4 w-4 transition ${portfolioOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                      {portfolioOpen ? (
                        <PortfolioMobileLinks onNavigate={() => setOpen(false)} />
                      ) : null}
                    </div>
                  ) : "stories" in item && item.stories ? (
                    <div key={item.href}>
                      <button
                        type="button"
                        className="flex min-h-12 w-full items-center justify-between py-3 text-left text-sm font-medium text-white"
                        onClick={() => setStoriesOpen((v) => !v)}
                        aria-expanded={storiesOpen}
                      >
                        {t(item.labelKey)}
                        <ChevronDown
                          className={`h-4 w-4 transition ${storiesOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                      {storiesOpen ? (
                        <StoriesMobileLinks onNavigate={() => setOpen(false)} />
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
                        {t(item.labelKey)}
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
                      {t(item.labelKey)}
                    </Link>
                  ),
                )}
                <Link
                  href="/quote"
                  className="flex min-h-12 items-center py-3 text-sm font-semibold text-white"
                  onClick={() => setOpen(false)}
                >
                  {t("nav.quote")}
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
  const reducedMotion = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!wrapRef.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <Link
        href={href}
        className="inline-flex items-center px-4 py-3 text-sm font-normal hover:bg-white/10"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {label}
      </Link>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={reducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{
              duration: reducedMotion ? 0 : 0.28,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute left-0 top-full z-50 overflow-hidden"
          >
            <div
              className={`rounded-lg border border-line bg-panel text-ink shadow-lg ${panelClassName}`}
            >
              {children(() => setOpen(false))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function StoriesNavPanel({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useI18n();
  return (
    <div className="min-w-[12rem] py-1">
      {STORIES_NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className="block px-4 py-2.5 text-sm text-ink hover:bg-paper hover:text-navy"
        >
          {t(item.labelKey)}
        </Link>
      ))}
    </div>
  );
}

function StoriesMobileLinks({ onNavigate }: { onNavigate: () => void }) {
  const { t } = useI18n();
  return (
    <div className="space-y-0.5 pb-3 pl-2">
      {STORIES_NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className="flex min-h-11 items-center py-2 text-sm text-white/90 hover:text-white"
        >
          {t(item.labelKey)}
        </Link>
      ))}
    </div>
  );
}
