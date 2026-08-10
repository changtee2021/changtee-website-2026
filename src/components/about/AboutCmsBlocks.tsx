"use client";

import Image from "next/image";
import { EditableSpot } from "@/components/preview/EditableSpot";
import { useSectionValues } from "@/lib/cms/demo-store";
import { ABOUT_SECTION_DEFAULTS } from "@/lib/cms/page-sections/templates";
import { siteConfig } from "@/lib/site-config";

export function AboutHeroCms() {
  const { values, enabled } = useSectionValues(
    "about",
    "hero",
    ABOUT_SECTION_DEFAULTS.hero,
  );
  if (!enabled) return null;

  return (
    <section className="px-6 pb-3 pt-3 sm:px-10 sm:pb-4 sm:pt-4 lg:px-16">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[var(--radius-panel)] bg-navy text-white md:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-center p-7 sm:p-10 md:p-12">
          <EditableSpot sectionId="hero" fieldKey="eyebrow">
            <p className="text-xs font-semibold tracking-[0.18em] text-white/55 uppercase">
              {values.eyebrow} · {siteConfig.nameEn}
            </p>
          </EditableSpot>
          <EditableSpot sectionId="hero" fieldKey="title">
            <h1 className="mt-4 font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-[2.75rem]">
              {values.title}
            </h1>
          </EditableSpot>
          <EditableSpot sectionId="hero" fieldKey="lead">
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-brand-red-soft sm:text-base">
              {values.lead}
            </p>
          </EditableSpot>
          <EditableSpot sectionId="hero" fieldKey="body">
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/70">
              {values.body}
            </p>
          </EditableSpot>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#company-contact"
              className="inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-navy transition hover:bg-white/90"
            >
              ติดต่อสำหรับองค์กร
            </a>
            <a
              href="/quote"
              className="inline-flex rounded-full border border-white/35 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              ขอใบเสนอราคา
            </a>
          </div>
        </div>
        <EditableSpot sectionId="hero" fieldKey="image" label="รูป">
          <div className="relative min-h-[280px] md:min-h-full">
            <Image
              src={values.image || ABOUT_SECTION_DEFAULTS.hero.image}
              alt={values.title}
              fill
              priority
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
          </div>
        </EditableSpot>
      </div>
    </section>
  );
}

export function AboutOneStopCms({
  children,
}: {
  children: React.ReactNode;
}) {
  const { values, enabled } = useSectionValues(
    "about",
    "oneStop",
    ABOUT_SECTION_DEFAULTS.oneStop,
  );
  if (!enabled) return null;

  return (
    <>
      <div className="grid gap-8 p-7 sm:p-9 md:grid-cols-2 md:items-center md:gap-10 md:p-12">
        <div>
          <EditableSpot sectionId="oneStop" fieldKey="subtitle">
            <p className="text-xs font-semibold tracking-[0.16em] text-brand-red uppercase">
              {values.subtitle}
            </p>
          </EditableSpot>
          <EditableSpot sectionId="oneStop" fieldKey="title">
            <h2 className="mt-2 font-display text-2xl font-semibold text-navy md:text-3xl">
              {values.title}
            </h2>
          </EditableSpot>
          <EditableSpot sectionId="oneStop" fieldKey="body">
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {values.body}
            </p>
          </EditableSpot>
          {children}
        </div>
        <EditableSpot sectionId="oneStop" fieldKey="image" label="รูป">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl sm:aspect-[5/4] md:aspect-auto md:min-h-[360px]">
            <Image
              src={values.image || ABOUT_SECTION_DEFAULTS.oneStop.image}
              alt="ช่างตี๋กำลังติดตั้งผ้าม่าน"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
          </div>
        </EditableSpot>
      </div>
    </>
  );
}
