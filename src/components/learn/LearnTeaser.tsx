"use client";

import Link from "next/link";
import { LEARN_SHEETS } from "@/lib/learn";
import { HomePanel } from "@/components/home/HomePanel";
import { useI18n } from "@/lib/i18n/use-i18n";

export function LearnTeaser() {
  const { t } = useI18n();
  const preview = LEARN_SHEETS.slice(0, 3);

  return (
    <HomePanel tone="clear">
      <div className="px-1 py-6 sm:px-2 sm:py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-brand-red uppercase">
              {t("home.learnEyebrow")}
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-navy md:text-3xl">
              {t("home.learnTitle")}
            </h2>
            <p className="mt-2 max-w-lg text-sm text-muted">
              {t("home.learnBody")}
            </p>
          </div>
          <Link
            href="/learn"
            className="text-sm font-semibold text-brand-red hover:underline"
          >
            {t("home.learnMore")}
          </Link>
        </div>
        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {preview.map((sheet) => (
            <li key={sheet.slug}>
              <Link
                href={`/learn/${sheet.slug}`}
                className="block rounded-2xl border border-line bg-white px-4 py-4 hover:border-navy/25"
              >
                <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">
                  {sheet.kind === "video" ? t("home.learnVideo") : t("home.learnSheet")}
                </p>
                <p className="mt-1 font-semibold text-navy">{sheet.title}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </HomePanel>
  );
}
