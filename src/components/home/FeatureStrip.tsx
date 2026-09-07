"use client";

import { BadgeCheck, Ruler, Truck } from "lucide-react";
import { Reveal } from "@/components/home/Reveal";
import { useI18n } from "@/lib/i18n/use-i18n";
import type { MessageKey } from "@/lib/i18n/messages";

const ITEMS: { title: MessageKey; desc: MessageKey; icon: typeof Ruler }[] = [
  { title: "home.why.measure.title", desc: "home.why.measure.desc", icon: Ruler },
  { title: "home.why.fast.title", desc: "home.why.fast.desc", icon: Truck },
  { title: "home.why.warranty.title", desc: "home.why.warranty.desc", icon: BadgeCheck },
];

export function FeatureStrip() {
  const { t } = useI18n();
  return (
    <section className="px-6 pb-3 sm:px-10 sm:pb-4 lg:px-16">
      <div className="mx-auto w-full max-w-5xl text-ink">
        <div className="grid sm:grid-cols-3">
          {ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <Reveal
                key={item.title}
                delayStep={i}
                className="flex items-center gap-4 px-6 py-6 sm:px-7"
              >
                <Icon
                  className="h-5 w-5 shrink-0 text-brand-red"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <span className="min-w-0">
                  <span className="block font-semibold text-navy">{t(item.title)}</span>
                  <span className="mt-0.5 block text-sm leading-snug text-muted">
                    {t(item.desc)}
                  </span>
                </span>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
