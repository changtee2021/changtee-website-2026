import Image from "next/image";
import Link from "next/link";
import { Quote, Star } from "lucide-react";
import { HomePanel } from "@/components/home/HomePanel";
import { Reveal } from "@/components/home/Reveal";
import {
  DEMO_REVIEWS,
  reviewProductLabel,
  type ReviewItem,
} from "@/lib/cms/reviews-demo";

const featured = DEMO_REVIEWS.filter((r) => r.status === "published")
  .sort((a, b) => a.sortOrder - b.sortOrder)
  .slice(0, 3);

export function Testimonials() {
  if (featured.length === 0) return null;

  return (
    <HomePanel tone="clear">
      <div className="px-1 py-4 sm:px-2 sm:py-6 md:py-8">
        <div className="grid gap-8 md:grid-cols-2 md:items-start md:gap-10">
          <Reveal className="relative pb-12 pr-12 md:sticky md:top-20 md:pb-16 md:pr-16">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem]">
              <Image
                src="/images/generated/ct-review-1.webp"
                alt="รายละเอียดผ้าม่านที่ติดตั้งจริง"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 460px"
              />
            </div>
            <div className="absolute bottom-0 right-0 h-32 w-32 overflow-hidden rounded-[1.25rem] ring-8 ring-shell sm:h-40 sm:w-40 md:h-44 md:w-44">
              <Image
                src="/images/generated/ct-review-2.webp"
                alt="มุมห้องอาหารที่ติดผ้าม่านโปร่ง"
                fill
                className="object-cover"
                sizes="180px"
              />
            </div>
            <span className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-navy">
              <Quote className="h-4 w-4" aria-hidden />
            </span>
          </Reveal>

          <div className="flex flex-col gap-4">
            {featured.map((review, i) => (
              <Reveal key={review.id} delayStep={i}>
                <ReviewCard review={review} />
              </Reveal>
            ))}

            <Reveal delayStep={featured.length}>
              <Link
                href="/portfolio"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy-deep sm:w-auto"
              >
                ดูผลงานและรีวิวเพิ่มเติม →
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </HomePanel>
  );
}

function ReviewCard({ review }: { review: ReviewItem }) {
  return (
    <article className="rounded-[1.5rem] bg-paper p-6 md:p-7">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy font-display text-sm font-semibold text-white">
          {review.displayName.slice(0, 1)}
        </span>
        <span>
          <span className="block font-semibold text-navy">{review.displayName}</span>
          <span
            className="mt-1 flex gap-0.5"
            aria-label={`ให้คะแนน ${review.rating} จาก 5`}
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

      <p className="mt-5 text-sm leading-relaxed text-ink/90 md:text-base">
        &ldquo;{review.body}&rdquo;
      </p>
      {review.productSlug || review.productHint ? (
        <p className="mt-2 text-sm text-muted">
          งานที่ทำ:{" "}
          {reviewProductLabel(review.productSlug) || review.productHint}
        </p>
      ) : null}
    </article>
  );
}
