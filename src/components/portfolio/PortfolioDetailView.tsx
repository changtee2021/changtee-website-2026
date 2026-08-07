"use client";

import Image from "next/image";
import Link from "next/link";
import { EditableSpot } from "@/components/preview/EditableSpot";
import {
  SPACE_TYPE_LABELS,
  productLabel,
  type PortfolioItem,
} from "@/lib/cms/portfolio-demo";
import { useSectionValues } from "@/lib/cms/demo-store";
import { PORTFOLIO_ITEM_SECTION_DEFAULTS } from "@/lib/cms/page-sections/templates";
import { bodyParagraphs } from "@/lib/cms/public-content";
import {
  PortfolioQuoteCtas,
  PortfolioViewTracker,
} from "@/components/portfolio/PortfolioEngagement";
import { PortfolioShareBar } from "@/components/portfolio/PortfolioShareBar";

export function PortfolioDetailView({
  item,
  related = [],
  preview = false,
}: {
  item: PortfolioItem;
  related?: PortfolioItem[];
  /** Softer link behavior / placeholder copy in admin preview */
  preview?: boolean;
}) {
  const ctaCms = useSectionValues(
    "portfolioItem",
    "cta",
    PORTFOLIO_ITEM_SECTION_DEFAULTS.cta,
  );
  const relatedCms = useSectionValues(
    "portfolioItem",
    "related",
    PORTFOLIO_ITEM_SECTION_DEFAULTS.related,
  );

  const gallery = Array.from(
    new Set(
      (item.gallery.length ? item.gallery : [item.image]).filter(Boolean),
    ),
  );
  const paragraphs = bodyParagraphs(item.detail || item.summary);
  const title = item.title.trim() || "ชื่อผลงาน (ยังไม่ใส่)";
  const place = item.place.trim() || "ที่ตั้ง (ยังไม่ใส่)";
  const image = item.image.trim() || "/images/mock/curtain-living.jpg";

  return (
    <article>
      {!preview ? <PortfolioViewTracker portfolioId={item.id} /> : null}
      <div className="relative aspect-[21/9] min-h-[220px] w-full bg-paper sm:min-h-[320px]">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          sizes="100vw"
          priority={!preview}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-4 pb-6 sm:pb-10">
          <p className="text-sm text-white/90">
            <Link href="/portfolio" className="hover:underline">
              ผลงาน
            </Link>
            <span className="mx-2 opacity-60">/</span>
            {productLabel(item.productSlug)}
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold text-white sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-white/90 sm:text-base">{place}</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-navy px-3 py-1 text-xs font-medium text-white">
            {productLabel(item.productSlug)}
          </span>
          <span className="rounded-full bg-paper px-3 py-1 text-xs text-navy">
            {SPACE_TYPE_LABELS[item.spaceType]}
          </span>
          <span className="rounded-full border border-line px-3 py-1 text-xs text-muted">
            {place}
          </span>
          {item.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-paper px-3 py-1 text-xs text-muted"
            >
              {t}
            </span>
          ))}
        </div>

        {item.summary ? (
          <p className="mt-6 max-w-3xl text-lg text-ink/90">{item.summary}</p>
        ) : preview ? (
          <p className="mt-6 max-w-3xl text-lg text-muted italic">
            ยังไม่มีสรุปสั้น
          </p>
        ) : null}

        <div className="mt-6 max-w-3xl space-y-4 text-muted">
          {paragraphs.length > 0 ? (
            paragraphs.map((p) => <p key={p.slice(0, 24)}>{p}</p>)
          ) : preview ? (
            <p className="italic">ยังไม่มีรายละเอียดหน้างาน</p>
          ) : null}
        </div>

        {gallery.length > 1 ? (
          <section className="mt-12">
            <h2 className="font-display text-xl font-semibold text-navy">
              รูปจากหน้างาน
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((src) => (
                <div
                  key={src}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg border border-line bg-paper"
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="360px"
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {preview ? (
          <div className="mt-12 space-y-4">
            <PortfolioShareBar
              portfolioId={item.id}
              slug={item.slug || "preview"}
              title={title}
            />
            <div className="flex flex-wrap gap-3 rounded-2xl border border-line bg-paper/60 p-5">
              <EditableSpot
                sectionId="cta"
                fieldKey="quoteLabel"
                className="w-auto"
              >
                <span className="inline-flex rounded-xl bg-brand-red px-5 py-2.5 text-sm font-semibold text-white">
                  {ctaCms.values.quoteLabel}
                </span>
              </EditableSpot>
            </div>
          </div>
        ) : (
          <PortfolioQuoteCtas
            portfolioId={item.id}
            slug={item.slug}
            title={title}
          />
        )}

        {related.length > 0 && relatedCms.enabled ? (
          <section className="mt-14">
            <EditableSpot sectionId="related" fieldKey="heading">
              <h2 className="font-display text-xl font-semibold text-navy">
                {relatedCms.values.heading}
              </h2>
            </EditableSpot>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/portfolio/${r.slug}`}
                  className="overflow-hidden rounded-lg border border-line bg-white hover:border-navy/30"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={r.image}
                      alt={r.title}
                      fill
                      className="object-cover"
                      sizes="280px"
                    />
                  </div>
                  <div className="p-3">
                    <div className="font-medium text-navy">{r.title}</div>
                    <div className="text-xs text-brand-red">{r.place}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </article>
  );
}
