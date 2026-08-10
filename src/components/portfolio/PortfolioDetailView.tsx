"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, ZoomIn } from "lucide-react";
import { EditableSpot } from "@/components/preview/EditableSpot";
import {
  SPACE_TYPE_LABELS,
  hasPortfolioSpecs,
  productLabel,
  type PortfolioItem,
} from "@/lib/cms/portfolio-demo";
import { useSectionValues } from "@/lib/cms/demo-store";
import { PORTFOLIO_ITEM_SECTION_DEFAULTS } from "@/lib/cms/page-sections/templates";
import { bodyParagraphs } from "@/lib/cms/public-content";
import { trackPortfolioQuoteClick } from "@/lib/cms/portfolio-analytics";
import {
  PortfolioQuoteCtas,
  PortfolioViewTracker,
} from "@/components/portfolio/PortfolioEngagement";
import { PortfolioShareBar } from "@/components/portfolio/PortfolioShareBar";
import { ProductImageLightbox } from "@/components/products/ProductImageLightbox";
import { cn } from "@/lib/utils";

function formatInstallDate(raw: string) {
  if (!raw.trim()) return null;
  // Accept YYYY-MM or YYYY-MM-DD
  const m = raw.trim().match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
  if (!m) return raw.trim();
  const d = new Date(
    Number(m[1]),
    Number(m[2]) - 1,
    m[3] ? Number(m[3]) : 1,
  );
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    ...(m[3] ? { day: "numeric" as const } : {}),
  });
}

/** Match PortfolioIndex area parsing — last token of place string */
function placeArea(place: string): string {
  const parts = place.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "อื่นๆ";
  return parts[parts.length - 1]!;
}

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

  const gallery = useMemo(
    () =>
      Array.from(
        new Set(
          (item.gallery.length ? item.gallery : [item.image]).filter(Boolean),
        ),
      ),
    [item.gallery, item.image],
  );

  const lightboxImages = useMemo(
    () =>
      gallery.map((src, i) => ({
        src,
        alt: `${item.title.trim() || "ผลงาน"} — รูปที่ ${i + 1}`,
      })),
    [gallery, item.title],
  );

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const paragraphs = bodyParagraphs(item.detail || item.summary);
  const title = item.title.trim() || "ชื่อผลงาน (ยังไม่ใส่)";
  const place = item.place.trim() || "ที่ตั้ง (ยังไม่ใส่)";
  const image = item.image.trim() || "/images/mock/curtain-living.jpg";
  const showSpecs = hasPortfolioSpecs(item);
  const installDateLabel = formatInstallDate(item.installDate);
  const publicCustomer =
    item.showCustomerName && item.customerName.trim()
      ? item.customerName.trim()
      : null;

  const coverIndex = Math.max(0, gallery.indexOf(image));
  const areaKey = placeArea(place);

  return (
    <article>
      {!preview ? <PortfolioViewTracker portfolioId={item.id} /> : null}

      <div className="relative aspect-[21/9] min-h-[220px] w-full bg-paper sm:min-h-[320px]">
        <button
          type="button"
          onClick={() => setLightboxIndex(coverIndex >= 0 ? coverIndex : 0)}
          className="group absolute inset-0 text-left"
          aria-label={`ดูภาพใหญ่: ${title}`}
        >
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.01]"
            sizes="100vw"
            priority={!preview}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/55 to-transparent" />
          <span className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm opacity-90 transition group-hover:bg-white/25">
            <ZoomIn className="size-3.5" aria-hidden />
            ดูภาพใหญ่
          </span>
        </button>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto max-w-5xl px-6 sm:px-10 lg:px-16 pb-6 sm:pb-10">
          <p className="pointer-events-auto text-sm text-white/90">
            <Link href="/portfolio" className="hover:underline">
              ผลงาน
            </Link>
            <span className="mx-2 opacity-60">/</span>
            <Link
              href={`/portfolio?product=${encodeURIComponent(item.productSlug)}`}
              className="hover:underline"
            >
              {productLabel(item.productSlug)}
            </Link>
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold text-white sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-white/90 sm:text-base">
            <MapPin className="size-4 shrink-0 opacity-80" aria-hidden />
            <Link
              href={`/portfolio?area=${encodeURIComponent(areaKey)}`}
              className="hover:underline"
            >
              {place}
            </Link>
            {item.installLocation.trim() ? (
              <span className="opacity-80">· {item.installLocation.trim()}</span>
            ) : null}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 sm:px-10 lg:px-16 py-10">
        <div className="max-w-3xl">
          <div className="flex flex-wrap gap-2">
            <FactPill
              href={`/portfolio?product=${encodeURIComponent(item.productSlug)}`}
              tone="navy"
            >
              {productLabel(item.productSlug)}
            </FactPill>
            <FactPill
              href={`/portfolio?space=${encodeURIComponent(item.spaceType)}`}
              tone="paper"
            >
              {SPACE_TYPE_LABELS[item.spaceType]}
            </FactPill>
            <FactPill
              href={`/portfolio?area=${encodeURIComponent(areaKey)}`}
              tone="outline"
            >
              {place}
            </FactPill>
            {item.tags.map((t) => (
              <FactPill
                key={t}
                href={`/portfolio?q=${encodeURIComponent(t)}`}
                tone="paper"
              >
                {t}
              </FactPill>
            ))}
          </div>

          {item.summary ? (
            <p className="mt-6 text-lg text-ink/90">{item.summary}</p>
          ) : preview ? (
            <p className="mt-6 text-lg italic text-muted">ยังไม่มีสรุปสั้น</p>
          ) : null}

          <div className="mt-6 space-y-4 text-muted">
            {paragraphs.length > 0 ? (
              paragraphs.map((p) => <p key={p.slice(0, 24)}>{p}</p>)
            ) : preview ? (
              <p className="italic">ยังไม่มีรายละเอียดหน้างาน</p>
            ) : null}
          </div>
        </div>

        {gallery.length > 0 ? (
          <section className="mt-12 max-w-4xl">
            <h2 className="font-display text-xl font-semibold text-navy">
              รูปจากหน้างาน
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {gallery.map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  type="button"
                  onClick={() => setLightboxIndex(i)}
                  className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-line bg-paper text-left"
                  aria-label={`ดูภาพใหญ่ รูปที่ ${i + 1}`}
                >
                  <Image
                    src={src}
                    alt={`${title} — รูปที่ ${i + 1}`}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    sizes="360px"
                  />
                  <span className="pointer-events-none absolute bottom-2 right-2 flex size-8 items-center justify-center rounded-full bg-navy/55 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
                    <ZoomIn className="size-4" aria-hidden />
                  </span>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {showSpecs ? (
          <section className="mt-10 max-w-3xl">
            <JobFactsCard
              item={item}
              publicCustomer={publicCustomer}
              installDateLabel={installDateLabel}
              place={place}
              areaKey={areaKey}
              preview={preview}
              quoteLabel={ctaCms.values.quoteLabel}
              showQuote={ctaCms.enabled}
            />
          </section>
        ) : null}

        {preview && item.internalNote.trim() ? (
          <div className="mt-6 max-w-3xl rounded-2xl border border-dashed border-amber-300 bg-amber-50/80 p-4 text-sm text-amber-950">
            <p className="text-xs font-semibold uppercase tracking-wider">
              โน้ตภายใน (ไม่โชว์บนเว็บ)
            </p>
            <p className="mt-2 whitespace-pre-wrap">{item.internalNote}</p>
          </div>
        ) : null}

        {preview ? (
          <div className="mt-12 space-y-4">
            <PortfolioShareBar
              portfolioId={item.id}
              slug={item.slug || "preview"}
              title={title}
            />
          </div>
        ) : (
          <PortfolioQuoteCtas
            portfolioId={item.id}
            slug={item.slug}
            title={title}
            hideQuoteButton={showSpecs && ctaCms.enabled}
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

      <ProductImageLightbox
        images={lightboxImages}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onIndexChange={setLightboxIndex}
      />
    </article>
  );
}

function FactPill({
  href,
  tone,
  children,
}: {
  href: string;
  tone: "navy" | "paper" | "outline";
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium transition hover:opacity-90",
        tone === "navy" && "bg-navy text-white",
        tone === "paper" && "bg-paper text-navy hover:bg-navy/10",
        tone === "outline" &&
          "border border-line text-muted hover:border-navy/30 hover:text-navy",
      )}
    >
      {children}
    </Link>
  );
}

function JobFactsCard({
  item,
  publicCustomer,
  installDateLabel,
  place,
  areaKey,
  preview,
  quoteLabel,
  showQuote,
}: {
  item: PortfolioItem;
  publicCustomer: string | null;
  installDateLabel: string | null;
  place: string;
  areaKey: string;
  preview: boolean;
  quoteLabel: string;
  showQuote: boolean;
}) {
  const rows: {
    label: string;
    value: string;
    href?: string;
  }[] = [
    publicCustomer
      ? { label: "ลูกค้า / โครงการ", value: publicCustomer }
      : null,
    {
      label: "พื้นที่ติดตั้ง",
      value: place,
      href: `/portfolio?area=${encodeURIComponent(areaKey)}`,
    },
    item.installLocation.trim()
      ? {
          label: "พิกัดหน้างาน",
          value: item.installLocation.trim(),
          href: `/portfolio?q=${encodeURIComponent(item.installLocation.trim())}`,
        }
      : null,
    {
      label: "ประเภทสถานที่",
      value: SPACE_TYPE_LABELS[item.spaceType],
      href: `/portfolio?space=${encodeURIComponent(item.spaceType)}`,
    },
    {
      label: "หมวดสินค้าหลัก",
      value: productLabel(item.productSlug),
      href: `/products/${item.productSlug}`,
    },
    installDateLabel
      ? { label: "ติดตั้งเมื่อ", value: installDateLabel }
      : null,
  ].filter(Boolean) as { label: string; value: string; href?: string }[];

  const specs = item.lineItems.filter(
    (r) =>
      r.productName.trim() ||
      r.sku.trim() ||
      r.material.trim() ||
      r.color.trim() ||
      r.serialOrCode.trim(),
  );

  const quoteHref = `/quote?from=portfolio&slug=${encodeURIComponent(item.slug || "preview")}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
      <div className="border-b border-line bg-navy px-5 py-4 text-white">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
          สเปกงานติดตั้ง
        </p>
        <h2 className="mt-1 font-display text-lg font-semibold">
          อ้างอิงสินค้าที่ใช้จริง
        </h2>
      </div>

      <dl className="divide-y divide-line px-5">
        {rows.map((r) => (
          <div
            key={r.label}
            className="grid grid-cols-[7.5rem_1fr] gap-3 py-3 text-sm"
          >
            <dt className="text-muted">{r.label}</dt>
            <dd className="font-medium text-navy">
              {r.href ? (
                <Link
                  href={r.href}
                  className="inline-flex items-center gap-1 hover:text-brand-red hover:underline"
                >
                  {r.value}
                  <ArrowUpRight className="size-3.5 shrink-0 opacity-50" />
                </Link>
              ) : (
                r.value
              )}
            </dd>
          </div>
        ))}
      </dl>

      {specs.length > 0 ? (
        <div className="border-t border-line px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            สินค้าในงานนี้
          </p>
          <ul className="mt-3 space-y-3">
            {specs.map((row, i) => (
              <li
                key={`${row.sku}-${row.productName}-${i}`}
                className="rounded-xl bg-shell px-3.5 py-3"
              >
                <p className="font-semibold text-navy">
                  {row.productName.trim() || "สินค้า (ยังไม่ตั้งชื่อ)"}
                </p>
                <div className="mt-2 grid gap-1.5 text-xs text-muted sm:grid-cols-2">
                  {row.material.trim() ? (
                    <p>
                      <span className="text-navy/50">วัสดุ </span>
                      {row.material}
                    </p>
                  ) : null}
                  {row.color.trim() ? (
                    <p>
                      <span className="text-navy/50">สี/โทน </span>
                      {row.color}
                    </p>
                  ) : null}
                  {row.sku.trim() ? (
                    <p>
                      <span className="text-navy/50">SKU </span>
                      <span className="font-mono text-navy">{row.sku}</span>
                    </p>
                  ) : null}
                  {row.serialOrCode.trim() ? (
                    <p>
                      <span className="text-navy/50">Serial/โค้ด </span>
                      <span className="font-mono text-navy">
                        {row.serialOrCode}
                      </span>
                    </p>
                  ) : null}
                  {row.quantity.trim() ? (
                    <p>
                      <span className="text-navy/50">จำนวน </span>
                      {row.quantity}
                    </p>
                  ) : null}
                  {row.notes.trim() ? (
                    <p className="sm:col-span-2">
                      <span className="text-navy/50">หมายเหตุ </span>
                      {row.notes}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>

          {showQuote ? (
            <div className="mt-4">
              {preview ? (
                <EditableSpot
                  sectionId="cta"
                  fieldKey="quoteLabel"
                  className="w-auto"
                >
                  <span className="inline-flex w-full items-center justify-center rounded-xl bg-brand-red px-5 py-3 text-sm font-semibold text-white sm:w-auto">
                    {quoteLabel}
                  </span>
                </EditableSpot>
              ) : (
                <Link
                  href={quoteHref}
                  onClick={() => trackPortfolioQuoteClick(item.id)}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-brand-red px-5 py-3 text-sm font-semibold text-white hover:opacity-90 sm:w-auto"
                >
                  {quoteLabel}
                </Link>
              )}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="border-t border-line px-5 py-4">
          <p className="text-sm text-muted">
            ยังไม่มีรายการสินค้าในสเปก — เติมในแอดมินได้
          </p>
          {showQuote ? (
            <div className="mt-4">
              {preview ? (
                <span className="inline-flex rounded-xl bg-brand-red px-5 py-3 text-sm font-semibold text-white">
                  {quoteLabel}
                </span>
              ) : (
                <Link
                  href={quoteHref}
                  onClick={() => trackPortfolioQuoteClick(item.id)}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-brand-red px-5 py-3 text-sm font-semibold text-white hover:opacity-90 sm:w-auto"
                >
                  {quoteLabel}
                </Link>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
