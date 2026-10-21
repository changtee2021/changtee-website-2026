"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ChevronDown, Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n/use-i18n";
import {
  LOCALES,
  LOCALE_META,
  localizedHref,
  stripLocalePrefix,
} from "@/lib/i18n/locale";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, t } = useI18n();
  const pathname = usePathname() || "/";
  const bare = stripLocalePrefix(pathname);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointer(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`${t("lang.switch")}: ${LOCALE_META[locale].nativeLabel}`}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 text-[11px] font-medium leading-none text-white/85 transition hover:bg-white/16 hover:text-white active:bg-white/20"
      >
        <Globe className="size-3.5" aria-hidden />
        <span>{LOCALE_META[locale].nativeLabel}</span>
        <ChevronDown
          className={cn("size-3 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open ? (
        <ul
          id={menuId}
          aria-label={t("lang.switch")}
          className="absolute bottom-full left-0 z-50 mb-2 w-48 overflow-hidden rounded-2xl border border-line bg-white py-1.5 text-navy shadow-[0_12px_40px_rgba(11,31,58,0.22)] dark:border-white/10 dark:bg-[#1a2433] dark:text-white"
        >
          {LOCALES.map((id) => {
            const active = locale === id;
            return (
              <li key={id}>
                <Link
                  href={localizedHref(id, bare)}
                  hrefLang={LOCALE_META[id].hreflang}
                  lang={LOCALE_META[id].htmlLang}
                  aria-current={active ? "true" : undefined}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex min-h-11 items-center justify-between gap-3 px-4 text-sm transition hover:bg-paper dark:hover:bg-white/8",
                    active && "font-semibold",
                  )}
                >
                  <span>{LOCALE_META[id].nativeLabel}</span>
                  {active ? (
                    <Check className="size-4 text-brand-red" aria-hidden />
                  ) : (
                    <span className="text-[11px] text-muted">
                      {LOCALE_META[id].shortLabel}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
