"use client";

import Image from "next/image";
import { HomePanel } from "@/components/home/HomePanel";
import { Reveal } from "@/components/home/Reveal";
import { CountUp } from "@/components/home/CountUp";
import { EditableSpot } from "@/components/preview/EditableSpot";
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
    {
      valueKey: "stat1Value",
      labelKey: "stat1Label",
      value: values.stat1Value,
      label: values.stat1Label,
    },
    {
      valueKey: "stat2Value",
      labelKey: "stat2Label",
      value: values.stat2Value,
      label: values.stat2Label,
    },
    {
      valueKey: "stat3Value",
      labelKey: "stat3Label",
      value: values.stat3Value,
      label: values.stat3Label,
    },
  ];
  const showroomLabel = values.showroomLabel?.trim() || "โชว์รูม";

  return (
    <HomePanel>
      <div className="grid gap-8 p-7 sm:p-9 md:grid-cols-[0.85fr_0.9fr_1fr] md:items-center md:gap-8 md:p-12">
        <div className="space-y-7">
          {stats.map((stat, i) => (
            <Reveal key={stat.valueKey} delayStep={i}>
              <EditableSpot sectionId="stats" fieldKey={stat.valueKey}>
                <p className="font-display text-3xl font-semibold tracking-tight text-navy md:text-4xl">
                  <CountUp value={stat.value} />
                </p>
              </EditableSpot>
              <EditableSpot sectionId="stats" fieldKey={stat.labelKey}>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {stat.label}
                </p>
              </EditableSpot>
            </Reveal>
          ))}
        </div>

        <Reveal
          delayStep={1}
          className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem]"
        >
          <EditableSpot sectionId="stats" fieldKey="image" label="รูป">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.5rem]">
              <Image
                src={values.image || HOME_SECTION_DEFAULTS.stats.image}
                alt="โชว์รูมช่างตี๋ ผ้าม่าน พร้อมตัวอย่างผ้าให้เลือก"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 320px"
              />
            </div>
          </EditableSpot>
        </Reveal>

        <Reveal delayStep={2}>
          <EditableSpot sectionId="stats" fieldKey="storyTitle">
            <h2 className="font-display text-2xl font-semibold leading-snug text-navy md:text-3xl">
              {values.storyTitle}
            </h2>
          </EditableSpot>
          <EditableSpot sectionId="stats" fieldKey="storyP1">
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {values.storyP1}
            </p>
          </EditableSpot>
          <EditableSpot sectionId="stats" fieldKey="storyP2">
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {values.storyP2}
            </p>
          </EditableSpot>
          <EditableSpot
            sectionId="stats"
            fieldKey="showroomLabel"
            className="mt-5 w-auto"
          >
            <a
              href={siteConfig.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-red transition hover:underline"
              onClick={(e) => {
                if (typeof window !== "undefined" && window.parent !== window) {
                  e.preventDefault();
                }
              }}
            >
              {showroomLabel}
              <span aria-hidden>→</span>
            </a>
          </EditableSpot>
        </Reveal>
      </div>
    </HomePanel>
  );
}
