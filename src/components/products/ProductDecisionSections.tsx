import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/home/Reveal";
import type { ReviewItem } from "@/lib/cms/reviews-demo";
import {
  REVIEW_SOURCE_LABELS,
  reviewProductLabel,
} from "@/lib/cms/reviews-demo";
import type {
  CompareTable,
  InstallVideoClip,
  PrepGuide,
} from "@/lib/product-decision-aids";
import {
  GOOGLE_REVIEWS_URL,
  YOUTUBE_CHANNEL_URL,
} from "@/lib/product-decision-aids";
import type { ReactNode } from "react";

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
      {children}
    </p>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5 text-amber-500" aria-label={`${rating} จาก 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? "opacity-100" : "opacity-25"}>
          ★
        </span>
      ))}
    </span>
  );
}

export function ProductCompareSection({
  categorySlug,
  currentProductSlug,
  table,
}: {
  categorySlug: string;
  currentProductSlug: string;
  table: CompareTable;
}) {
  return (
    <Reveal className="mt-16 sm:mt-20">
      <section>
        <SectionLabel>Compare</SectionLabel>
        <h2 className="mt-2 font-display text-2xl font-semibold text-navy sm:text-3xl">
          {table.title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">{table.subtitle}</p>

        <div className="mt-6 -mx-1 overflow-x-auto px-1">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wider text-muted">
                <th className="py-3 pr-4 font-semibold">ตัวเลือก</th>
                <th className="py-3 pr-4 font-semibold">คุมแสง</th>
                <th className="py-3 pr-4 font-semibold">เหมาะกับ</th>
                <th className="py-3 font-semibold">จุดเด่น</th>
              </tr>
            </thead>
            <tbody>
              {table.columns.map((col) => {
                const active =
                  col.productSlug != null &&
                  col.productSlug === currentProductSlug;
                const href = col.productSlug
                  ? `/products/${categorySlug}/${col.productSlug}`
                  : null;
                return (
                  <tr
                    key={col.id}
                    className={`border-b border-line/80 ${
                      active ? "bg-paper/80" : ""
                    }`}
                  >
                    <td className="py-3.5 pr-4 align-top">
                      {href && !active ? (
                        <Link
                          href={href}
                          className="font-semibold text-navy hover:text-brand-red"
                        >
                          {col.name}
                        </Link>
                      ) : (
                        <span className="font-semibold text-navy">
                          {col.name}
                          {active ? (
                            <span className="ml-2 rounded-full bg-navy px-2 py-0.5 text-[10px] font-medium text-white">
                              รุ่นนี้
                            </span>
                          ) : null}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 pr-4 align-top text-muted">{col.light}</td>
                    <td className="py-3.5 pr-4 align-top text-muted">
                      {col.bestFor}
                    </td>
                    <td className="py-3.5 align-top text-muted">{col.note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </Reveal>
  );
}

export function ProductPrepGuideSection({
  guide,
  nested = false,
}: {
  guide: PrepGuide;
  /** Render under FAQ heading without outer Reveal / big title */
  nested?: boolean;
}) {
  const body = (
    <div
      className={
        nested
          ? "rounded-2xl border border-line bg-paper/50 px-5 py-6 sm:px-6 sm:py-7"
          : "rounded-2xl border border-line bg-paper/50 px-5 py-8 sm:px-8 sm:py-10"
      }
    >
      {nested ? (
        <h3 className="font-display text-lg font-semibold text-navy sm:text-xl">
          {guide.title}
        </h3>
      ) : (
        <>
          <SectionLabel>Before we visit</SectionLabel>
          <h2 className="mt-2 font-display text-2xl font-semibold text-navy sm:text-3xl">
            {guide.title}
          </h2>
        </>
      )}
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        {guide.intro}
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2 md:gap-8">
        <div>
          <h4 className="text-sm font-semibold text-navy">
            ข้อมูลที่ช่วยประเมินเร็วขึ้น
          </h4>
          <ul className="mt-3 space-y-2.5">
            {guide.measureTips.map((tip) => (
              <li key={tip} className="flex gap-2 text-sm text-navy/90">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-red" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-navy">
            วันนัดวัด — เตรียมหน้างาน
          </h4>
          <ul className="mt-3 space-y-2.5">
            {guide.prepareItems.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-navy/90">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-navy" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  if (nested) return body;

  return <Reveal className="mt-16 sm:mt-20">{body}</Reveal>;
}

export function ProductReviewsSection({
  reviews,
}: {
  reviews: ReviewItem[];
  /** @deprecated kept for call-site compat */
  categoryName?: string;
}) {
  if (reviews.length === 0) return null;

  return (
    <Reveal className="mt-16 sm:mt-20">
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <SectionLabel>Reviews</SectionLabel>
            <h2 className="mt-2 font-display text-2xl font-semibold text-navy sm:text-3xl">
              รีวิวจากลูกค้า
            </h2>
          </div>
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-navy hover:bg-paper"
          >
            ดูบน Google Maps →
          </a>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {reviews.map((r) => (
            <blockquote
              key={r.id}
              className="flex flex-col rounded-2xl border border-line bg-white px-5 py-5"
            >
              <Stars rating={r.rating} />
              <p className="mt-3 flex-1 text-sm leading-relaxed text-navy/90">
                “{r.body}”
              </p>
              <footer className="mt-4 border-t border-line pt-3">
                <p className="text-sm font-semibold text-navy">{r.displayName}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {reviewProductLabel(r.productSlug) ||
                    r.productHint ||
                    "ทั่วไป"}{" "}
                  · {REVIEW_SOURCE_LABELS[r.source]}
                </p>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>
    </Reveal>
  );
}

export function ProductInstallVideosSection({
  categoryName,
  clips,
}: {
  categoryName: string;
  clips: InstallVideoClip[];
}) {
  if (clips.length === 0) return null;

  return (
    <Reveal className="mt-16 sm:mt-20">
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <SectionLabel>Install videos</SectionLabel>
            <h2 className="mt-2 font-display text-2xl font-semibold text-navy sm:text-3xl">
              คลิปสั้นติดตั้ง{categoryName}
            </h2>
          </div>
          <a
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-navy hover:bg-paper"
          >
            ดูบน YouTube →
          </a>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {clips.slice(0, 3).map((clip) => {
            const href = clip.videoUrl?.trim() || YOUTUBE_CHANNEL_URL;
            return (
              <a
                key={clip.id}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="group overflow-hidden rounded-2xl border border-line transition hover:border-navy/25"
              >
                <div className="relative aspect-video bg-paper">
                  <Image
                    src={clip.thumbnail}
                    alt={clip.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.02]"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-navy/15 transition group-hover:bg-navy/25" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex size-12 items-center justify-center rounded-full bg-white/95 text-brand-red shadow-md transition group-hover:scale-105 sm:size-14">
                      <svg
                        viewBox="0 0 24 24"
                        className="ml-0.5 size-5 fill-current sm:size-6"
                        aria-hidden
                      >
                        <path d="M8 5v14l11-7L8 5z" />
                      </svg>
                    </span>
                  </span>
                  <span className="absolute bottom-2 right-2 rounded bg-navy/85 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-white">
                    {clip.duration}
                  </span>
                </div>
                <div className="px-3 py-3 sm:px-4">
                  <p className="text-sm font-semibold text-navy group-hover:text-brand-red">
                    {clip.title}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      </section>
    </Reveal>
  );
}
