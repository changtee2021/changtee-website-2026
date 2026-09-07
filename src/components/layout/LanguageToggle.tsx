"use client";

import { useI18n } from "@/lib/i18n/use-i18n";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t("lang.switch")}
      className={cn(
        "inline-flex min-h-9 shrink-0 items-center rounded-full border border-white/20 bg-white/10 p-0.5 text-[11px] font-semibold leading-none text-white/70",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setLocale("th")}
        className={cn(
          "min-h-8 min-w-8 rounded-full px-2 transition",
          locale === "th"
            ? "bg-white text-navy"
            : "hover:text-white",
        )}
        aria-pressed={locale === "th"}
      >
        {t("lang.th")}
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={cn(
          "min-h-8 min-w-8 rounded-full px-2 transition",
          locale === "en"
            ? "bg-white text-navy"
            : "hover:text-white",
        )}
        aria-pressed={locale === "en"}
      >
        {t("lang.en")}
      </button>
    </div>
  );
}
