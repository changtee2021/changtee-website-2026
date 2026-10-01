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
    <ul className="flex flex-wrap items-center">
      {ITEMS.map((item, i) => {
        const Icon = item.icon;
        return (
          <Reveal
            key={item.title}
            as="li"
            delayStep={i}
            className={
              i > 0
                ? "ml-5 flex items-center gap-2.5 border-l border-white/80 pl-5 sm:ml-7 sm:pl-7"
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
