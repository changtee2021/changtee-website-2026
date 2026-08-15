"use client";

import Image from "next/image";
import Link from "next/link";
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
    <section className="relative bg-navy text-white">
      <div className="relative min-h-[100dvh] w-full overflow-hidden">
        <EditableSpot sectionId="hero" fieldKey="image" label="รูป">
          <div className="absolute inset-0">
            <Image
              src={values.image || ABOUT_SECTION_DEFAULTS.hero.image}
              alt={values.title}
              fill
              priority
              className="object-cover object-[58%_center] sm:object-[62%_center]"
              sizes="100vw"
            />
          </div>
        </EditableSpot>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-navy/60 via-navy/20 to-navy/85 sm:bg-gradient-to-r sm:from-navy/80 sm:via-navy/35 sm:to-navy/10" />

        <div className="relative z-[1] flex h-full min-h-[100dvh] flex-col justify-end px-6 pb-16 pt-28 sm:px-10 sm:pb-20 sm:pt-40 lg:px-16">
          <div className="max-w-xl">
            <EditableSpot sectionId="hero" fieldKey="eyebrow">
              <p className="text-xs font-semibold tracking-[0.18em] text-white/70 uppercase">
                {values.eyebrow} · {siteConfig.nameEn}
              </p>
            </EditableSpot>
            <EditableSpot sectionId="hero" fieldKey="title">
              <h1 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-[2.9rem]">
                {values.title}
              </h1>
            </EditableSpot>
            <EditableSpot sectionId="hero" fieldKey="lead">
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/90 sm:text-base">
                {values.lead}
              </p>
            </EditableSpot>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#company-contact"
                className="inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-navy transition hover:bg-white/90"
              >
                ติดต่อเรา
              </a>
              <Link
                href="/visit-factory"
                className="inline-flex rounded-full border border-white/35 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                เยี่ยมชมโรงงาน
              </Link>
              <Link
                href="/careers"
                className="inline-flex rounded-full border border-white/35 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                ร่วมงานกับเรา
              </Link>
            </div>
          </div>
        </div>
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
