"use client";

import Image from "next/image";
import { useState } from "react";
import { Languages, Quote, Star } from "lucide-react";
import { HomePanel } from "@/components/home/HomePanel";
import { Reveal } from "@/components/home/Reveal";
import {
  DEMO_REVIEWS,
  reviewProductLabel,
  type ReviewItem,
} from "@/lib/cms/reviews-demo";
import { useTx } from "@/lib/i18n/use-tx";

const featured = DEMO_REVIEWS.filter((r) => r.status === "published")
  .sort((a, b) => a.sortOrder - b.sortOrder)
  .slice(0, 3);

export function Testimonials() {
  const { tx } = useTx();
  if (featured.length === 0) return null;

  return (
    <HomePanel tone="clear">
      <div className="px-1 py-4 sm:px-2 sm:py-6 md:py-8">
        <div className="grid gap-8 md:grid-cols-2 md:items-stretch md:gap-10">
          <Reveal className="relative flex min-h-[280px] flex-col pb-12 pr-12 md:min-h-0 md:pb-14 md:pr-14">
            <div className="relative min-h-[220px] flex-1 overflow-hidden rounded-[1.25rem]">
              <Image
                src="/images/home/review-install-main.png"
                alt={tx("ช่างตี๋ติดตั้งราวม่านหน้างาน")}
                fill
                className="object-cover object-[center_20%]"
                sizes="(max-width: 768px) 100vw, 460px"
              />
            </div>
            <div className="absolute bottom-0 right-0 z-10 h-32 w-32 overflow-hidden rounded-[1.25rem] ring-8 ring-shell sm:h-40 sm:w-40 md:h-44 md:w-44">
              <Image
                src="/images/home/review-install.png"
                alt={tx("ช่างตี๋ติดตั้งผ้าม่านหน้างาน")}
                fill
                className="object-cover object-center"
                sizes="180px"
              />
            </div>
            <span className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-navy">
              <Quote className="h-4 w-4" aria-hidden />
            </span>
          </Reveal>

          <div className="flex h-full flex-col gap-4">
            {featured.map((review, i) => (
              <Reveal key={review.id} delayStep={i}>
                <ReviewCard review={review} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </HomePanel>
  );
}

/** Reviews are customers' own words: Thai stays the default, translation is opt-in. */
function ReviewCard({ review }: { review: ReviewItem }) {
  const { tx, txf, find, locale } = useTx();
  const [translated, setTranslated] = useState(false);
  const canTranslate = locale !== "th" && Boolean(find(review.body));
  const show = (thai: string) => (translated ? tx(thai) : thai);

  const name = show(review.displayName);
  const initial = review.displayName.slice(0, 1);
  const product = reviewProductLabel(review.productSlug) || review.productHint;

  return (
    <article
      className="rounded-[1.5rem] bg-paper p-6 md:p-7"
      data-keep-thai={translated ? undefined : ""}
    >
      <div className="flex items-center gap-3">
        {review.image ? (
          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-1 ring-line">
            <Image
              src={review.image}
              alt={name}
              fill
              className="object-cover"
              sizes="44px"
            />
          </span>
        ) : (
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy font-display text-sm font-semibold text-white">
            {initial}
          </span>
        )}
        <span>
          <span className="block font-semibold text-navy" lang={translated ? undefined : "th"}>
            {name}
          </span>
          <span
            className="mt-1 flex gap-0.5"
            aria-label={txf("ให้คะแนน {rating} จาก 5", { rating: review.rating })}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < review.rating
                    ? "fill-brand-red text-brand-red"
                    : "text-line"
                }`}
                aria-hidden
              />
            ))}
          </span>
        </span>
      </div>

      <p
        className="mt-5 text-sm leading-relaxed text-ink/90 md:text-base"
        lang={translated ? undefined : "th"}
      >
        &ldquo;{show(review.body)}&rdquo;
      </p>
      {product ? (
        <p className="mt-2 text-sm text-muted">
          {tx("งานที่ทำ:")} {tx(product)}
        </p>
      ) : null}
      {canTranslate ? (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
          <button
            type="button"
            onClick={() => setTranslated((v) => !v)}
            aria-pressed={translated}
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand-red hover:underline"
          >
            <Languages className="size-4" aria-hidden />
            {translated ? tx("ดูต้นฉบับ") : tx("ดูคำแปล")}
          </button>
          {translated ? (
            <span className="text-xs text-muted">
              {tx("แปลโดยระบบจากต้นฉบับภาษาไทย")}
            </span>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
