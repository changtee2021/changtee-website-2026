"use client";

import Image from "next/image";
import { HomePanel } from "@/components/home/HomePanel";
import { Reveal } from "@/components/home/Reveal";
import { CountUp } from "@/components/home/CountUp";
import { useSectionValues } from "@/lib/cms/demo-store";
import { HOME_SECTION_DEFAULTS } from "@/lib/cms/page-sections";
import { siteConfig } from "@/lib/site-config";

export function StatsStory() {
  const { values, enabled } = useSectionValues(
    "home",
    "stats",
    HOME_SECTION_DEFAULTS.stats,
  );
  if (!enabled) return null;

  const stats = [
    { value: values.stat1Value, label: values.stat1Label },
    { value: values.stat2Value, label: values.stat2Label },
    { value: values.stat3Value, label: values.stat3Label },
  ];
  const paragraphs = [values.storyP1, values.storyP2].filter(Boolean);
  const showroomLabel = values.showroomLabel?.trim() || "โชว์รูม";

  return (
    <HomePanel>
      <div className="grid gap-8 p-7 sm:p-9 md:grid-cols-[0.85fr_0.9fr_1fr] md:items-center md:gap-8 md:p-12">
        <div className="space-y-7">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delayStep={i}>
              <p className="font-display text-3xl font-semibold tracking-tight text-navy md:text-4xl">
                <CountUp value={stat.value} />
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{stat.label}</p>
            </Reveal>
          ))}
        </div>

        <Reveal delayStep={1} className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem]">
          <Image
            src={values.image || HOME_SECTION_DEFAULTS.stats.image}
            alt="โชว์รูมช่างตี๋ ผ้าม่าน พร้อมตัวอย่างผ้าให้เลือก"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 320px"
          />
        </Reveal>

        <Reveal delayStep={2}>
          <h2 className="font-display text-2xl font-semibold leading-snug text-navy md:text-3xl">
            {values.storyTitle}
          </h2>
          {paragraphs.map((text) => (
            <p key={text} className="mt-4 text-sm leading-relaxed text-muted">
              {text}
            </p>
          ))}
          <a
            href={siteConfig.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-red transition hover:underline"
          >
            {showroomLabel}
            <span aria-hidden>→</span>
          </a>
        </Reveal>
      </div>
    </HomePanel>
  );
}
