"use client";

import Image from "next/image";
import { MessageCircle, Ruler, Truck } from "lucide-react";
import { BlogPreview } from "@/components/home/BlogPreview";
import { CatalogSection } from "@/components/home/CatalogSection";
import { ClientsLogos } from "@/components/home/ClientsLogos";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { Hero } from "@/components/home/Hero";
import { HomeInstallVideosSection } from "@/components/home/HomeInstallVideosSection";
import { HomePanel } from "@/components/home/HomePanel";
import { Testimonials } from "@/components/home/Testimonials";
import { EditableSpot } from "@/components/admin/cms/EditableSpot";
import { LockedSpot } from "@/components/admin/cms/LockedSpot";
import { useSectionDraft } from "@/components/admin/cms/section-draft-context";
import { usePortfolioItems } from "@/lib/cms/demo-store";
import { publishedPortfolio } from "@/lib/cms/public-content";
import { HOME_SECTION_DEFAULTS } from "@/lib/cms/page-sections";
import { siteConfig } from "@/lib/site-config";
import { useMemo } from "react";

const HOW_STEP_ICONS = [MessageCircle, Ruler, Truck] as const;

export function HomeSectionsVisualPreview() {
  const { getValues } = useSectionDraft();
  const products = getValues("products");
  const portfolio = getValues("portfolio");
  const how = getValues("howItWorks");
  const stats = getValues("stats");
  const cta = getValues("contactCta");
  const portfolioStored = usePortfolioItems();
  const portfolioItems = useMemo(
    () => publishedPortfolio(portfolioStored).slice(0, 4),
    [portfolioStored],
  );

  const tiles = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
    name: products[`tile${n}Name`] ?? "",
    image:
      products[`tile${n}Image`] ||
      HOME_SECTION_DEFAULTS.products[`tile${n}Image`],
    imageKey: `tile${n}Image`,
    nameKey: `tile${n}Name`,
  }));

  return (
    <div className="bg-shell pb-3 text-ink sm:pb-4">
      <LockedSpot reason="แก้ที่เมนูสไลด์หน้าแรก">
        <Hero />
      </LockedSpot>

      <LockedSpot reason="เนื้อหาคงที่">
        <FeatureStrip />
      </LockedSpot>

      {/* Product grid — matches live ProductGrid */}
      <HomePanel tone="clear">
        <div className="px-1 py-4 sm:px-2 sm:py-6 md:py-8">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {tiles.map((t) => (
              <div key={t.imageKey} className="space-y-1">
                <EditableSpot sectionId="products" fieldKey={t.imageKey} label="รูป">
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-paper">
                    {t.image ? (
                      <Image
                        src={t.image}
                        alt={t.name}
                        fill
                        className="object-cover"
                        sizes="160px"
                      />
                    ) : null}
                  </div>
                </EditableSpot>
                <EditableSpot sectionId="products" fieldKey={t.nameKey} label="ชื่อ">
                  <p className="truncate px-0.5 text-[11px] font-medium text-navy">
                    {t.name || "—"}
                  </p>
                </EditableSpot>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <EditableSpot sectionId="products" fieldKey="allLinkLabel">
              <span className="text-sm font-semibold text-brand-red">
                {products.allLinkLabel}
              </span>
            </EditableSpot>
          </div>
        </div>
      </HomePanel>

      {/* Portfolio — real-like carousel + editable headings */}
      <HomePanel tone="clear">
        <div className="px-1 py-4 sm:px-2 sm:py-6 md:py-8">
          <div className="mb-6">
            <EditableSpot sectionId="portfolio" fieldKey="title">
              <h2 className="font-display text-2xl font-semibold text-navy md:text-3xl">
                {portfolio.title}
              </h2>
            </EditableSpot>
            <EditableSpot sectionId="portfolio" fieldKey="subtitle" className="mt-2">
              <p className="text-sm text-muted">{portfolio.subtitle}</p>
            </EditableSpot>
          </div>
          <LockedSpot reason="แก้ที่เมนูผลงาน">
            <div className="no-scrollbar flex gap-4 overflow-x-auto pb-1">
              {portfolioItems.map((item) => (
                <div
                  key={item.slug}
                  className="w-[220px] shrink-0 rounded-[1.25rem] bg-paper p-3 sm:w-[260px]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[1rem] bg-line/40">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="260px"
                    />
                  </div>
                  <div className="px-1 pb-1 pt-3">
                    <h3 className="text-sm font-semibold text-navy">{item.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-muted">
                      {item.summary}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-sm font-semibold text-brand-red">
              ดูผลงานทั้งหมด
            </p>
          </LockedSpot>
        </div>
      </HomePanel>

      <LockedSpot reason="แก้ที่เมนู CMS หน้าแรก (คลิปติดตั้ง)">
        <HomeInstallVideosSection />
      </LockedSpot>

      {/* Logos + stats/story — one panel (matches live StatsStory) */}
      <HomePanel>
        <LockedSpot reason="รูปโลโก้ลูกค้า">
          <div className="overflow-hidden pt-5 sm:pt-7">
            <ClientsLogos />
          </div>
        </LockedSpot>
        <div className="grid gap-8 p-7 pt-4 sm:p-9 sm:pt-5 md:grid-cols-[0.85fr_0.9fr_1fr] md:items-center md:gap-8 md:p-12 md:pt-6">
          <div className="space-y-7">
            {[1, 2, 3].map((n) => (
              <div key={n}>
                <EditableSpot sectionId="stats" fieldKey={`stat${n}Value`}>
                  <p className="font-display text-3xl font-semibold tracking-tight text-navy md:text-4xl">
                    {stats[`stat${n}Value`]}
                  </p>
                </EditableSpot>
                <EditableSpot
                  sectionId="stats"
                  fieldKey={`stat${n}Label`}
                  className="mt-1.5"
                >
                  <p className="text-sm leading-relaxed text-muted">
                    {stats[`stat${n}Label`]}
                  </p>
                </EditableSpot>
              </div>
            ))}
          </div>
          <EditableSpot sectionId="stats" fieldKey="image" label="รูปกลาง">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-paper">
              <Image
                src={siteConfig.showroomImage}
                alt="โชว์รูม"
                fill
                className="object-cover"
                sizes="280px"
              />
            </div>
          </EditableSpot>
          <div>
            <EditableSpot sectionId="stats" fieldKey="storyTitle">
              <h2 className="font-display text-2xl font-semibold leading-snug text-navy md:text-3xl">
                {stats.storyTitle}
              </h2>
            </EditableSpot>
            <EditableSpot sectionId="stats" fieldKey="storyP1" className="mt-4">
              <p className="text-sm leading-relaxed text-muted">{stats.storyP1}</p>
            </EditableSpot>
            <EditableSpot sectionId="stats" fieldKey="storyP2" className="mt-4">
              <p className="text-sm leading-relaxed text-muted">{stats.storyP2}</p>
            </EditableSpot>
            <EditableSpot sectionId="stats" fieldKey="showroomLabel" className="mt-5">
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-red">
                {stats.showroomLabel || "โชว์รูม"}
                <span aria-hidden>→</span>
              </span>
            </EditableSpot>
          </div>
        </div>
      </HomePanel>

      <LockedSpot reason="แก้ที่เมนูรีวิว">
        <Testimonials />
      </LockedSpot>

      {/* How it works — live layout */}
      <HomePanel>
        <div className="grid gap-10 p-7 sm:p-9 md:grid-cols-[0.95fr_1.05fr] md:gap-12 md:p-12">
          <div>
            <span
              aria-hidden
              className="block font-display text-6xl leading-none text-navy/10 select-none"
            >
              &ldquo;&nbsp;&rdquo;
            </span>
            <EditableSpot sectionId="howItWorks" fieldKey="titleLine1" className="mt-4">
              <h2 className="font-display text-3xl font-semibold leading-tight text-navy md:text-4xl">
                {how.titleLine1}
              </h2>
            </EditableSpot>
            <EditableSpot sectionId="howItWorks" fieldKey="titleLine2">
              <p className="font-display text-3xl font-semibold leading-tight text-navy md:text-4xl">
                {how.titleLine2}
              </p>
            </EditableSpot>
            <EditableSpot sectionId="howItWorks" fieldKey="intro" className="mt-4">
              <p className="max-w-sm text-sm leading-relaxed text-muted">{how.intro}</p>
            </EditableSpot>
          </div>
          <ol className="relative">
            <span
              aria-hidden
              className="absolute top-3 bottom-3 left-[11px] w-px bg-line md:left-[13px]"
            />
            {[1, 2, 3].map((n, i) => {
              const Icon = HOW_STEP_ICONS[i] ?? MessageCircle;
              const isLast = n === 3;
              return (
                <li
                  key={n}
                  className={`relative flex gap-4 ${isLast ? "pb-0" : "pb-6"}`}
                >
                  <span
                    aria-hidden
                    className="relative z-10 mt-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-brand-red bg-paper md:mt-1 md:h-7 md:w-7"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-red md:h-2 md:w-2" />
                  </span>
                  <div
                    className={`min-w-0 flex-1 ${isLast ? "" : "border-b border-line pb-6"}`}
                  >
                    <p className="font-display text-sm font-semibold text-brand-red">
                      Step {n}
                    </p>
                    <div className="mt-1.5 flex items-start gap-2.5">
                      <span
                        aria-hidden
                        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-red/10 text-brand-red"
                      >
                        <Icon className="h-4 w-4" strokeWidth={2} />
                      </span>
                      <div className="min-w-0">
                        <EditableSpot
                          sectionId="howItWorks"
                          fieldKey={`step${n}Title`}
                        >
                          <h3 className="font-semibold text-navy">
                            {how[`step${n}Title`]}
                          </h3>
                        </EditableSpot>
                        <EditableSpot
                          sectionId="howItWorks"
                          fieldKey={`step${n}Desc`}
                          className="mt-1.5"
                        >
                          <p className="text-sm leading-relaxed text-muted">
                            {how[`step${n}Desc`]}
                          </p>
                        </EditableSpot>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </HomePanel>

      <LockedSpot reason="แก้ที่เมนูแคตตาล็อก">
        <CatalogSection />
      </LockedSpot>

      <LockedSpot reason="แก้ที่เมนูบทความ">
        <BlogPreview />
      </LockedSpot>

      {/* Contact CTA — live layout */}
      <HomePanel tone="navy">
        <div className="grid gap-8 p-7 sm:p-9 md:grid-cols-2 md:items-center md:gap-10 md:p-12">
          <div>
            <EditableSpot sectionId="contactCta" fieldKey="titleLine1">
              <h2 className="font-display text-2xl font-semibold leading-snug md:text-3xl">
                {cta.titleLine1}
              </h2>
            </EditableSpot>
            <EditableSpot sectionId="contactCta" fieldKey="titleLine2">
              <p className="font-display text-2xl font-semibold leading-snug md:text-3xl">
                {cta.titleLine2}
              </p>
            </EditableSpot>
            <EditableSpot sectionId="contactCta" fieldKey="body" className="mt-4">
              <p className="max-w-md text-sm leading-relaxed text-white/70">
                {cta.body}
              </p>
            </EditableSpot>
            <div className="mt-7 flex flex-wrap gap-3">
              <EditableSpot sectionId="contactCta" fieldKey="quoteLabel">
                <span className="inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-navy">
                  {cta.quoteLabel}
                </span>
              </EditableSpot>
              <EditableSpot sectionId="contactCta" fieldKey="lineLabel">
                <span className="inline-block rounded-full bg-[#06C755] px-6 py-3 text-sm font-semibold text-white">
                  {cta.lineLabel}
                </span>
              </EditableSpot>
            </div>
            <LockedSpot reason="ที่อยู่จากตั้งค่าร้าน" className="mt-8">
              <div className="space-y-1.5 text-sm text-white/70">
                <p>
                  {siteConfig.address.line1} {siteConfig.address.line2}{" "}
                  {siteConfig.address.city}
                </p>
                <p>{siteConfig.hours}</p>
                <p>
                  โทร{" "}
                  <span className="font-semibold text-white">
                    {siteConfig.phoneDisplay}
                  </span>
                </p>
              </div>
            </LockedSpot>
          </div>
          <EditableSpot sectionId="contactCta" fieldKey="image" label="รูป">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-white/10">
              <Image
                src={siteConfig.showroomImage}
                alt="โชว์รูม"
                fill
                className="object-cover"
                sizes="400px"
              />
            </div>
          </EditableSpot>
        </div>
      </HomePanel>
    </div>
  );
}
