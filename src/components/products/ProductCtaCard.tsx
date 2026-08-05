import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function ProductCtaCard({
  productLabel,
  productItem,
  catalogHref,
  portfolioHref,
  subtitle,
}: {
  /** Maps to quote form productType when it matches PRODUCT_TYPES */
  productLabel: string;
  /** Specific SKU / child name — prefilled into note */
  productItem?: string;
  catalogHref?: string | null;
  /** e.g. /portfolio?product=curtain */
  portfolioHref?: string | null;
  subtitle?: string;
}) {
  const quoteParams = new URLSearchParams();
  if (productLabel) quoteParams.set("product", productLabel);
  if (productItem) quoteParams.set("item", productItem);
  const quoteHref = quoteParams.toString()
    ? `/quote?${quoteParams.toString()}`
    : "/quote";
  const interestName = (productItem || productLabel).trim();

  return (
    <section className="mt-12 rounded-2xl border border-line bg-paper/70 px-5 py-6 sm:px-8 sm:py-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold text-navy sm:text-xl">
            {interestName ? `สนใจ${interestName}?` : "สนใจสินค้านี้?"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {subtitle?.trim() ||
              "นัดวัดหน้างานหรือขอใบเสนอราคา — ทีมงานติดต่อกลับให้"}
          </p>
          <p className="mt-2 text-xs text-muted">
            โทร{" "}
            <a
              href={`tel:${siteConfig.phoneTel}`}
              className="font-medium text-navy hover:underline"
            >
              {siteConfig.phoneDisplay}
            </a>
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:shrink-0 sm:flex-row sm:items-center">
          <Link
            href={quoteHref}
            className="rounded-full bg-brand-red px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-red-soft"
          >
            ขอใบเสนอราคา
          </Link>
          {portfolioHref ? (
            <Link
              href={portfolioHref}
              className="rounded-full border border-line bg-white px-5 py-2.5 text-center text-sm font-semibold text-navy hover:bg-white/80"
            >
              ดูผลงาน
            </Link>
          ) : null}
          <a
            href={siteConfig.lineUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-line bg-white px-5 py-2.5 text-center text-sm font-semibold text-navy hover:bg-white/80"
          >
            คุยทาง LINE
          </a>
          {catalogHref ? (
            <a
              href={catalogHref}
              download
              className="rounded-full border border-line bg-white px-5 py-2.5 text-center text-sm font-semibold text-navy hover:bg-white/80"
            >
              ดาวน์โหลดแคตตาล็อก
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
