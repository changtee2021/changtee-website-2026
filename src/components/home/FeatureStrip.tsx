"use client";

import { BadgeCheck, Ruler, Truck } from "lucide-react";
import { Reveal } from "@/components/home/Reveal";
import { useI18n } from "@/lib/i18n/use-i18n";
import type { MessageKey } from "@/lib/i18n/messages";

const ITEMS: { title: MessageKey; icon: typeof Ruler }[] = [
  { title: "home.why.measure.title", icon: Ruler },
  { title: "home.why.fast.title", icon: Truck },
  { title: "home.why.warranty.title", icon: BadgeCheck },
];

export function FeatureStrip() {
  const { t } = useI18n();
  return (
    <ul className="inline-flex flex-wrap items-center gap-y-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-md sm:px-6">
      {ITEMS.map((item, i) => {
        const Icon = item.icon;
        return (
          <Reveal
            key={item.title}
            as="li"
            delayStep={i}
            className={
              i > 0
                ? "ml-4 flex items-center gap-2.5 border-l border-white/30 pl-4 sm:ml-6 sm:pl-6"
                : "flex items-center gap-2.5"
            }
          >
            <Icon className="size-5 shrink-0 text-white" strokeWidth={1.75} aria-hidden />
            <span className="text-sm font-semibold text-white sm:text-base">
              {t(item.title)}
            </span>
          </Reveal>
        );
      })}
    </ul>
  );
}
