"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { CatalogCard } from "@/components/catalog/CatalogCard";
import { ProductCtaCard } from "@/components/products/ProductCtaCard";
import { ProductCertificates } from "@/components/products/ProductCertificates";
import {
  ProductCompareSection,
  ProductInstallVideosSection,
  ProductPrepGuideSection,
  ProductReviewsSection,
} from "@/components/products/ProductDecisionSections";
import {
  ProductLightboxScope,
  ZoomImage,
} from "@/components/products/ProductLightboxScope";
import type { GalleryImage } from "@/components/products/ProductImageLightbox";
import { Reveal } from "@/components/home/Reveal";
import type { ProductCatalogFile } from "@/lib/catalogs";
import {
  ensurePageSections,
  useSectionValues,
} from "@/lib/cms/demo-store";
import type { PortfolioItem } from "@/lib/cms/portfolio-demo";
import {
  PRODUCT_SECTION_DEFAULTS,
  productPageKey,
  seedProductSectionRecords,
} from "@/lib/cms/page-sections";
import type { ProductCertificate } from "@/lib/product-certificates";
import type { ProductCategory, ProductChild, ProductPillar } from "@/lib/product-catalog";
import { childImage, quoteProductType } from "@/lib/product-catalog";
import type { ProductContent } from "@/lib/product-content";
import {
  getCompareTable,
  getInstallVideos,
  getPrepGuide,
  reviewsForCategory,
} from "@/lib/product-decision-aids";
import type { ProductPresentation } from "@/lib/product-presentation";
import { siteConfig } from "@/lib/site-config";

type Props = {
  category: ProductCategory;
  product: ProductChild;
  pillar: ProductPillar | undefined;
  content: ProductContent;
  presentation: ProductPresentation;
  catalog: ProductCatalogFile | undefined;
  related: ProductChild[];
  certificates: ProductCertificate[];
  portfolioWorks: PortfolioItem[];
};

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
      {children}
    </p>
  );
}

export function ProductDetailView({
  category,
  product,
  pillar,
  content,
  presentation,
  catalog,
  related,
  certificates,
  portfolioWorks,
}: Props) {
  const quoteHref = (() => {
    const p = new URLSearchParams();
    p.set("product", quoteProductType(category, product));
    p.set("item", product.name);
    return `/quote?${p.toString()}`;
  })();

  const portfolioHref = `/portfolio?product=${encodeURIComponent(category.slug)}`;
  const { assets } = presentation;
  const compareTable = getCompareTable(category.slug);
  const prepGuide = getPrepGuide(category.slug);
  const reviews = reviewsForCategory(category.slug, category.name, 3);
  const installVideos = getInstallVideos(category.slug);
  const pageKey = productPageKey();

  useEffect(() => {
    ensurePageSections(seedProductSectionRecords());
  }, []);

  const benefitsCms = useSectionValues(
    pageKey,
    "benefits",
    PRODUCT_SECTION_DEFAULTS.benefits,
  );
  const styleCms = useSectionValues(
    pageKey,
    "style",
    PRODUCT_SECTION_DEFAULTS.style,
  );
  const ctaCms = useSectionValues(pageKey, "cta", PRODUCT_SECTION_DEFAULTS.cta);

  const benefitCards = presentation.benefitCards.map((b, i) => {
    const n = i + 1;
    const label =
      benefitsCms.values[`card${n}Label`]?.trim() || b.label;
    const detail =
      benefitsCms.values[`card${n}Detail`]?.trim() || b.detail;
    const image =
      benefitsCms.values[`card${n}Image`]?.trim() || b.image;
    return { ...b, label, detail, image };
  });

  const lightboxImages: GalleryImage[] = useMemo(() => {
    const list: GalleryImage[] = [
      {
        src: assets.hero,
        alt: `${product.name} ${category.name} — ภาพสินค้าหลัก`,
      },
      {
        src: assets.texture,
        alt: `รายละเอียดพื้นผิววัสดุ — ${product.name}`,
      },
      {
        src: assets.lifestyle,
        alt: `ตัวอย่างการใช้งานในห้องนั่งเล่น — ${product.name}`,
      },
      {
        src: assets.context,
        alt: `มุมห้อง/ห้องนอนที่เหมาะกับ ${product.name}`,
      },
    ];
    for (const b of presentation.benefitCards) {
      if (!list.some((i) => i.src === b.image)) {
        list.push({ src: b.image, alt: `${b.label} — ${product.name}` });
      }
    }
    for (const style of presentation.roomStyles) {
      if (!list.some((i) => i.src === style.image)) {
        list.push({
          src: style.image,
          alt: `สไตล์${style.name} — ${product.name}`,
        });
      }
    }
    for (const m of presentation.materials) {
      if (!list.some((i) => i.src === m.image)) {
        list.push({ src: m.image, alt: `${m.title} — ${product.name}` });
      }
    }
    for (const w of portfolioWorks) {
      if (!list.some((i) => i.src === w.image)) {
        list.push({ src: w.image, alt: `ผลงานติดตั้ง: ${w.title}` });
      }
    }
    return list;
  }, [assets, presentation, product.name, category.name, portfolioWorks]);

  const thumbs = [
    {
      src: assets.texture,
      alt: `รายละเอียดพื้นผิววัสดุ — ${product.name}`,
      caption: "พื้นผิววัสดุ",
    },
    {
      src: assets.lifestyle,
      alt: `ตัวอย่างการใช้งานในห้องนั่งเล่น — ${product.name}`,
      caption: "ห้องนั่งเล่น",
    },
    {
      src: assets.context,
      alt: `มุมห้องที่เหมาะกับ ${product.name}`,
      caption: "มุมห้อง / ห้องนอน",
    },
  ];

  return (
    <ProductLightboxScope images={lightboxImages}>
      <article className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
          <nav aria-label="breadcrumb" className="text-sm text-muted">
            <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
              <li>
                <Link href="/products" className="hover:text-navy">
                  สินค้า/บริการ
                </Link>
              </li>
              {pillar ? (
                <>
                  <li aria-hidden>/</li>
                  <li>
                    <Link
                      href={`/products#pillar-${pillar.id}`}
                      className="hover:text-navy"
                    >
                      {pillar.name}
                    </Link>
                  </li>
                </>
              ) : null}
              <li aria-hidden>/</li>
              <li>
                <Link
                  href={`/products/${category.slug}`}
                  className="hover:text-navy"
                >
                  {category.name}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="font-medium text-navy">{product.name}</li>
            </ol>
          </nav>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-12">
            <Reveal className="space-y-3">
              <ZoomImage
                src={assets.hero}
                alt={`${product.name} ${category.name} — ภาพสินค้าหลัก`}
                className="aspect-[4/3]"
                sizes="(max-width: 1024px) 100vw, 640px"
                priority
              />
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {thumbs.map((t) => (
                  <div key={t.src}>
                    <ZoomImage
                      src={t.src}
                      alt={t.alt}
                      className="aspect-square sm:aspect-[4/3]"
                      rounded="rounded-xl"
                      sizes="200px"
                    />
                    <p className="mt-1.5 text-center text-[11px] font-medium text-muted">
                      {t.caption}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delayStep={1} className="lg:pt-2">
              <SectionLabel>Product sheet</SectionLabel>
              <h1 className="mt-2 font-display text-3xl font-semibold leading-tight text-navy sm:text-4xl">
                {product.name}
              </h1>
              {product.nameEn ? (
                <p className="mt-1 text-sm text-muted">{product.nameEn}</p>
              ) : null}
              <p className="mt-4 text-base leading-relaxed text-ink/90">
                {content.tagline}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {content.suitableFor.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-line bg-paper/80 px-3 py-1 text-xs font-medium text-navy"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <ul className="mt-6 space-y-0 border-y border-line">
                {content.highlights.slice(0, 4).map((h) => (
                  <li
                    key={h}
                    className="flex items-start gap-3 border-b border-line py-3 text-sm text-navy last:border-b-0"
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-red" />
                    {h}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <Link
                  href={quoteHref}
                  className="rounded-full bg-brand-red px-6 py-3 text-center text-sm font-semibold text-white hover:bg-brand-red-soft"
                >
                  ขอใบเสนอราคา
                </Link>
                <Link
                  href={portfolioHref}
                  className="rounded-full border border-navy/20 bg-paper px-6 py-3 text-center text-sm font-semibold text-navy hover:border-navy/40"
                >
                  ดูผลงาน{category.name}
                </Link>
                <a
                  href={siteConfig.lineUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="ปรึกษา LINE"
                  title="ปรึกษา LINE"
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-[#06C755] shadow-sm transition hover:brightness-105"
                >
                  <Image
                    src="/images/social/line.svg"
                    alt=""
                    width={22}
                    height={22}
                    className="size-[22px]"
                  />
                </a>
              </div>
              <p className="mt-3 text-xs text-muted">
                วัดหน้างานฟรี · โทร{" "}
                <a
                  href={`tel:${siteConfig.phoneTel}`}
                  className="font-medium text-navy"
                >
                  {siteConfig.phoneDisplay}
                </a>
              </p>

              <div className="mt-8 space-y-0 border-t border-line">
                <details className="group border-b border-line" open>
                  <summary className="cursor-pointer list-none py-3.5 text-sm font-semibold text-navy [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center justify-between gap-3">
                      รายละเอียดสินค้า
                      <span className="text-muted transition group-open:rotate-45">
                        +
                      </span>
                    </span>
                  </summary>
                  <div className="space-y-3 pb-4 text-sm leading-relaxed text-muted">
                    {content.body.map((p) => (
                      <p key={p.slice(0, 40)}>{p}</p>
                    ))}
                  </div>
                </details>
                <details className="group border-b border-line">
                  <summary className="cursor-pointer list-none py-3.5 text-sm font-semibold text-navy [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center justify-between gap-3">
                      สเปกและวัสดุ
                      <span className="text-muted transition group-open:rotate-45">
                        +
                      </span>
                    </span>
                  </summary>
                  <dl className="space-y-0 pb-4">
                    {presentation.specs.map((s) => (
                      <div
                        key={s.label}
                        className="grid grid-cols-[7rem_1fr] gap-3 border-b border-line/70 py-2.5 text-sm last:border-0"
                      >
                        <dt className="font-medium text-navy">{s.label}</dt>
                        <dd className="text-muted">{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
                {content.care ? (
                  <details className="group border-b border-line">
                    <summary className="cursor-pointer list-none py-3.5 text-sm font-semibold text-navy [&::-webkit-details-marker]:hidden">
                      <span className="flex items-center justify-between gap-3">
                        การดูแลรักษา
                        <span className="text-muted transition group-open:rotate-45">
                          +
                        </span>
                      </span>
                    </summary>
                    <p className="pb-4 text-sm text-muted">{content.care}</p>
                  </details>
                ) : null}
              </div>
            </Reveal>
          </div>

          {benefitsCms.enabled ? (
          <Reveal className="mt-16 sm:mt-20">
          <section>
            <SectionLabel>
              {benefitsCms.values.eyebrow || "Key benefits"}
            </SectionLabel>
            <h2 className="mt-2 font-display text-2xl font-semibold text-navy sm:text-3xl">
              {benefitsCms.values.heading || "จุดเด่นที่สัมผัสได้"}
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-3 sm:gap-4">
              {benefitCards.map((b) => (
                <div key={b.label} className="relative">
                  <ZoomImage
                    src={b.image}
                    alt={`${b.label} — ${product.name}`}
                    className="aspect-[8/5]"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-2xl bg-gradient-to-t from-navy/75 to-transparent p-3 sm:p-4">
                    <p className="font-display text-base font-semibold text-white sm:text-lg">
                      {b.label}
                    </p>
                    <p className="mt-1 text-xs text-white/90 sm:text-sm">
                      {b.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          </Reveal>
          ) : null}

          <Reveal delayStep={1} className="mt-16 sm:mt-20">
          <section>
            <div className="rounded-2xl border border-line px-5 py-8 sm:px-8">
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
                <div>
                  <SectionLabel>Product sheet</SectionLabel>
                  <h2 className="mt-1 font-display text-2xl font-semibold text-navy">
                    {product.name}
                  </h2>
                  <p className="text-sm text-muted">
                    {product.nameEn || category.nameEn} · {category.name}
                  </p>
                </div>
                <p className="text-xs text-muted">{siteConfig.nameEn}</p>
              </div>
              <div className="mt-6 grid gap-8 lg:grid-cols-2">
                <ZoomImage
                  src={assets.hero}
                  alt={product.name}
                  className="aspect-[4/3]"
                  rounded="rounded-xl"
                  sizes="(max-width: 1024px) 100vw, 480px"
                />
                <div>
                  <dl>
                    {presentation.specs.map((s) => (
                      <div
                        key={`sheet-${s.label}`}
                        className="grid grid-cols-[8rem_1fr] gap-4 border-b border-line py-3 text-sm"
                      >
                        <dt className="font-semibold text-navy">{s.label}</dt>
                        <dd className="text-muted">{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted">
                    Materials
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-navy">
                    องค์ประกอบและวัสดุ
                  </h3>
                  <div className="mt-3 space-y-3">
                    {presentation.materials.map((m) => (
                      <div
                        key={m.title}
                        className="flex gap-3 rounded-xl border border-line p-2.5 sm:gap-4 sm:p-3"
                      >
                        <ZoomImage
                          src={m.image}
                          alt={m.title}
                          className="size-16 shrink-0 sm:size-20"
                          rounded="rounded-lg"
                          sizes="80px"
                        />
                        <div className="min-w-0 self-center">
                          <h4 className="text-sm font-semibold text-navy">
                            {m.title}
                          </h4>
                          <p className="mt-0.5 line-clamp-3 text-xs leading-relaxed text-muted">
                            {m.body}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <ProductCertificates certificates={certificates} />
                </div>
              </div>
            </div>
          </section>
          </Reveal>

          <Reveal delayStep={1} className="mt-16 sm:mt-20">
          <section>
            <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-12">
              <div>
                <ZoomImage
                  src={assets.lifestyle}
                  alt={`ตัวอย่างห้องสำหรับ ${product.name} — สไตล์ที่แนะนำ`}
                  className="aspect-[3/4] sm:aspect-[4/5]"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <p className="mt-2 text-center text-xs text-muted">
                  ตัวอย่างห้องที่เหมาะกับ{product.name}
                </p>
              </div>
              <div>
                <SectionLabel>
                  {styleCms.values.eyebrow || "Style consultant"}
                </SectionLabel>
                <h2 className="mt-2 font-display text-2xl font-semibold text-navy sm:text-3xl">
                  {styleCms.values.heading || "เหมาะกับห้องสไตล์ไหน?"}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {styleCms.values.intro?.trim() ||
                    presentation.consultantIntro}
                </p>

                <div className="mt-6 space-y-0 border-t border-line">
                  {presentation.consultantSteps.map((step, i) => (
                    <details
                      key={step.title}
                      className="group border-b border-line"
                      open={i === 0}
                    >
                      <summary className="cursor-pointer list-none py-4 [&::-webkit-details-marker]:hidden">
                        <span className="flex items-start gap-3">
                          <span className="font-display text-lg font-semibold tabular-nums text-brand-red">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="flex-1 pt-0.5 font-semibold text-navy">
                            {step.title}
                          </span>
                        </span>
                      </summary>
                      <p className="pb-4 pl-10 text-sm leading-relaxed text-muted">
                        {step.body}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10">
              <h3 className="text-sm font-semibold text-navy">
                {styleCms.values.stylesHeading ||
                  "สไตล์ห้องที่ทีมงานแนะนำ"}
              </h3>
              <div
                className="mt-4 flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory sm:grid sm:overflow-visible sm:pb-0 sm:snap-none [&::-webkit-scrollbar]:hidden"
                style={{
                  gridTemplateColumns: `repeat(${Math.min(presentation.roomStyles.length || 1, 3)}, minmax(0, 1fr))`,
                }}
              >
                {presentation.roomStyles.map((style) => (
                  <div
                    key={style.id}
                    className="w-[min(78vw,17.5rem)] shrink-0 snap-start overflow-hidden rounded-2xl border border-line sm:w-auto sm:min-w-0"
                  >
                    <ZoomImage
                      src={style.image}
                      alt={`สไตล์${style.name} — ${product.name}`}
                      className="aspect-[4/3]"
                      rounded="rounded-none"
                      sizes="(max-width: 640px) 78vw, 33vw"
                    />
                    <div className="p-3 sm:p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted sm:text-xs">
                        {style.nameEn}
                      </p>
                      <h4 className="mt-0.5 font-display text-base font-semibold text-navy sm:text-lg">
                        {style.name}
                      </h4>
                      <p className="mt-1.5 line-clamp-2 text-xs text-muted sm:text-sm">
                        {style.summary}
                      </p>
                      <ul className="mt-2 hidden space-y-1 md:block">
                        {style.tips.slice(0, 2).map((tip) => (
                          <li
                            key={tip}
                            className="flex gap-1.5 text-xs text-navy/90"
                          >
                            <span className="shrink-0 text-brand-red">·</span>
                            <span className="line-clamp-2">{tip}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {style.bestFor.slice(0, 2).map((b) => (
                          <span
                            key={b}
                            className="rounded-full bg-paper px-2 py-0.5 text-[10px] font-medium text-navy"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          </Reveal>

          <Reveal className="mt-16 sm:mt-20">
            <section className="rounded-2xl bg-paper/80 px-5 py-10 sm:px-10 sm:py-14">
              <div className="mx-auto max-w-2xl text-center">
                <SectionLabel>Why it works</SectionLabel>
                <h2 className="mt-3 font-display text-2xl font-semibold text-navy sm:text-3xl">
                  เลือกให้เข้าห้อง — ไม่ใช่แค่เลือกผ้าสวย
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
                  ช่างตี๋ช่วยจับคู่ชนิดม่าน ทิศแดด และสไตล์ห้องจากหน้างานจริง
                  เพื่อให้คุณเห็นภาพก่อนตัดสินใจผลิตและติดตั้ง
                </p>
              </div>
            </section>
          </Reveal>

          <ProductReviewsSection
            reviews={reviews}
            categoryName={category.name}
          />

          {catalog ? (
            <Reveal className="mt-14">
              <section>
                <h2 className="font-display text-xl font-semibold text-navy">
                  แคตตาล็อก
                </h2>
                <div className="mt-2 h-1 w-14 bg-brand-red" />
                <div className="mt-4">
                  <CatalogCard catalog={catalog} />
                </div>
              </section>
            </Reveal>
          ) : null}

          <ProductInstallVideosSection
            categoryName={category.name}
            clips={installVideos}
          />

          <Reveal className="mt-16 sm:mt-20">
            <section>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <SectionLabel>Install gallery</SectionLabel>
                  <h2 className="mt-2 font-display text-2xl font-semibold text-navy">
                    ตัวอย่างผลงานติดตั้ง{category.name}
                  </h2>
                </div>
                <Link
                  href={portfolioHref}
                  className="shrink-0 rounded-full border border-line px-4 py-2 text-sm font-semibold text-navy hover:bg-paper"
                >
                  ดูผลงานทั้งหมด →
                </Link>
              </div>

              {portfolioWorks.length > 0 ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {portfolioWorks.map((w, i) => (
                    <Reveal key={w.id} delayStep={i} as="article">
                      <Link
                        href={`/portfolio/${w.slug}`}
                        className="group block overflow-hidden rounded-2xl border border-line transition hover:border-navy/25"
                      >
                        <div className="relative aspect-[4/3] bg-paper">
                          <Image
                            src={w.image}
                            alt={`ผลงานติดตั้ง: ${w.title}`}
                            fill
                            className="object-cover transition duration-500 group-hover:scale-[1.03]"
                            sizes="(max-width: 640px) 100vw, 33vw"
                          />
                        </div>
                        <div className="p-4">
                          <p className="text-xs text-muted">{w.place}</p>
                          <div className="mt-0.5 font-semibold text-navy group-hover:text-brand-red">
                            {w.title}
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs text-muted">
                            {w.summary}
                          </p>
                        </div>
                      </Link>
                    </Reveal>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-line bg-paper/50 px-5 py-8 text-center">
                  <p className="text-sm text-muted">
                    ยังไม่มีเคสในหมวดนี้บนหน้าเว็บ — ดูผลงานอื่นของช่างตี๋ได้ที่หน้าผลงาน
                  </p>
                  <Link
                    href={portfolioHref}
                    className="mt-4 inline-flex rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy/90"
                  >
                    ดูผลงาน{category.name}
                  </Link>
                </div>
              )}
            </section>
          </Reveal>

          {related.length > 0 ? (
            <Reveal className="mt-16 sm:mt-20">
              <section>
                <SectionLabel>You might also like</SectionLabel>
                <h2 className="mt-2 font-display text-2xl font-semibold text-navy">
                  รุ่นอื่นในหมวด{category.name}
                </h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {related.map((r) => (
                    <Link
                      key={r.slug}
                      href={`/products/${category.slug}/${r.slug}`}
                      className="group overflow-hidden rounded-2xl border border-line transition hover:border-navy/25"
                    >
                      <div className="relative aspect-[4/5] bg-paper">
                        <Image
                          src={childImage(category, r)}
                          alt={r.name}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-[1.03]"
                          sizes="(max-width: 640px) 100vw, 33vw"
                        />
                      </div>
                      <div className="p-4">
                        <div className="font-semibold text-navy group-hover:text-brand-red">
                          {r.name}
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-muted">
                          {r.summary}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            </Reveal>
          ) : null}

          {compareTable ? (
            <ProductCompareSection
              categorySlug={category.slug}
              currentProductSlug={product.slug}
              table={compareTable}
            />
          ) : null}

          <Reveal className="mt-16 sm:mt-20" as="div">
            <section id="faq">
              <SectionLabel>FAQ</SectionLabel>
              <h2 className="mt-2 font-display text-2xl font-semibold text-navy sm:text-3xl">
                คำถามที่พบบ่อยเกี่ยวกับ{product.name}
              </h2>
              <div className="mt-6">
                <ProductPrepGuideSection guide={prepGuide} nested />
              </div>
              <div className="mt-8 space-y-0 border-t border-line">
                {content.faqs.map((f) => (
                  <details key={f.q} className="group border-b border-line">
                    <summary className="cursor-pointer list-none py-4 text-sm font-semibold text-navy sm:text-base [&::-webkit-details-marker]:hidden">
                      <span className="flex items-center justify-between gap-4">
                        {f.q}
                        <span className="shrink-0 text-muted transition group-open:rotate-45">
                          +
                        </span>
                      </span>
                    </summary>
                    <p className="pb-4 text-sm leading-relaxed text-muted">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          </Reveal>

          <Reveal className="mt-4">
            <ProductCtaCard
              productLabel={quoteProductType(category, product)}
              productItem={product.name}
              catalogHref={catalog?.href}
              portfolioHref={portfolioHref}
              subtitle={ctaCms.values.subtitle}
            />
          </Reveal>
        </div>
      </article>
    </ProductLightboxScope>
  );
}
