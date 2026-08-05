"use client";

import Image from "next/image";
import Link from "next/link";
import { HomePanel } from "@/components/home/HomePanel";
import { Reveal } from "@/components/home/Reveal";
import { useSectionValues } from "@/lib/cms/demo-store";
import { HOME_SECTION_DEFAULTS } from "@/lib/cms/page-sections";
import { siteConfig } from "@/lib/site-config";

export function ContactCta() {
  const { values, enabled } = useSectionValues(
    "home",
    "contactCta",
    HOME_SECTION_DEFAULTS.contactCta,
  );
  if (!enabled) return null;

  return (
    <HomePanel tone="navy">
      <div className="grid gap-8 p-7 sm:p-9 md:grid-cols-2 md:items-center md:gap-10 md:p-12">
        <Reveal>
          <h2 className="font-display text-2xl font-semibold leading-snug md:text-3xl">
            {values.titleLine1}
            <span className="block">{values.titleLine2}</span>
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
            {values.body}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/quote"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-navy transition hover:bg-white/90"
            >
              {values.quoteLabel}
            </Link>
            <a
              href={siteConfig.lineUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-[#06C755] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110"
            >
              {values.lineLabel}
            </a>
          </div>

          <div className="mt-8 space-y-1.5 text-sm text-white/70">
            <p>
              {siteConfig.address.line1} {siteConfig.address.line2}{" "}
              {siteConfig.address.city}
            </p>
            <p>{siteConfig.hours}</p>
            <p>
              โทร{" "}
              <a href={`tel:${siteConfig.phoneTel}`} className="font-semibold text-white">
                {siteConfig.phoneDisplay}
              </a>
            </p>
          </div>
        </Reveal>

        <Reveal delayStep={1} className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem]">
          <Image
            src={values.image || HOME_SECTION_DEFAULTS.contactCta.image}
            alt="โชว์รูมช่างตี๋ ผ้าม่าน"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 520px"
          />
        </Reveal>
      </div>
    </HomePanel>
  );
}
