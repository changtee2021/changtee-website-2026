import Image from "next/image";
import Link from "next/link";
import {
  BLOG_CATEGORY_LABELS,
  type BlogPost,
} from "@/lib/cms/blog-demo";
import type { PortfolioItem } from "@/lib/cms/portfolio-demo";
import { productLabel } from "@/lib/cms/portfolio-demo";
import { bodyParagraphs } from "@/lib/cms/public-content";

export function BlogDetailView({
  post,
  related = [],
  relatedWorks = [],
  preview = false,
}: {
  post: BlogPost;
  related?: BlogPost[];
  relatedWorks?: PortfolioItem[];
  preview?: boolean;
}) {
  const paragraphs = bodyParagraphs(post.body);
  const title = post.title.trim() || "หัวข้อบทความ (ยังไม่ใส่)";
  const excerpt = post.excerpt.trim() || (preview ? "ยังไม่มีคำโปรย" : "");
  const cover = post.cover.trim() || "/images/banners/hero-1.png";
  const publishedAt =
    post.publishedAt || (preview ? new Date().toISOString() : null);

  return (
    <article className="pb-16">
      <div className="mx-auto max-w-3xl px-4 pt-10">
        <p className="text-sm text-muted">
          <Link href="/blog" className="hover:text-navy hover:underline">
            บทความ
          </Link>
          <span className="mx-2 opacity-50">/</span>
          <span className="text-brand-red">
            {BLOG_CATEGORY_LABELS[post.category]}
          </span>
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-navy sm:text-4xl">
          {title}
        </h1>
        {excerpt ? (
          <p
            className={`mt-3 text-lg ${preview && !post.excerpt.trim() ? "italic text-muted" : "text-muted"}`}
          >
            {excerpt}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted">
          <span>{post.author || "ทีมช่างตี๋"}</span>
          {publishedAt ? (
            <>
              <span>·</span>
              <time dateTime={publishedAt}>
                {new Date(publishedAt).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </>
          ) : null}
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-4xl px-4">
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-line bg-paper">
          <Image
            src={cover}
            alt={title}
            fill
            className="object-cover"
            sizes="800px"
            priority={!preview}
          />
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-[680px] space-y-5 px-4 text-[17px] leading-relaxed text-ink/90">
        {paragraphs.length > 0 ? (
          paragraphs.map((p) => <p key={p.slice(0, 32)}>{p}</p>)
        ) : preview ? (
          <p className="italic text-muted">ยังไม่มีเนื้อหาบทความ</p>
        ) : null}
      </div>

      {post.tags.length > 0 ? (
        <div className="mx-auto mt-10 flex max-w-[680px] flex-wrap gap-2 px-4">
          {post.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-paper px-3 py-1 text-xs text-muted"
            >
              {t}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mx-auto mt-12 max-w-[680px] px-4">
        <div className="rounded-2xl border border-line bg-paper/60 p-5">
          <p className="text-sm text-navy">
            สนใจติดตั้งสำหรับบ้านคุณ? ขอใบเสนอราคา หรือคุยกับทีมช่างตี๋ได้เลย
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/quote"
              className="rounded-xl bg-brand-red px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              ขอใบเสนอราคา
            </Link>
            <Link
              href="/portfolio"
              className="rounded-xl border border-navy bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:bg-paper"
            >
              ดูผลงานติดตั้ง
            </Link>
          </div>
        </div>
      </div>

      {relatedWorks.length > 0 ? (
        <section className="mx-auto mt-14 max-w-6xl px-4">
          <h2 className="font-display text-xl font-semibold text-navy">
            ผลงานที่เกี่ยวข้อง
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {relatedWorks.map((w) => (
              <Link
                key={w.id}
                href={`/portfolio/${w.slug}`}
                className="flex gap-3 overflow-hidden rounded-xl border border-line bg-white p-3 hover:border-navy/30"
              >
                <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-paper">
                  <Image
                    src={w.image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] text-muted">
                    {productLabel(w.productSlug)}
                  </div>
                  <div className="font-medium text-navy line-clamp-2">
                    {w.title}
                  </div>
                  <div className="text-xs text-brand-red">{w.place}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="mx-auto mt-14 max-w-6xl px-4">
          <h2 className="font-display text-xl font-semibold text-navy">
            บทความในหมวดเดียวกัน
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/blog/${r.slug}`}
                className="overflow-hidden rounded-lg border border-line bg-white hover:border-navy/30"
              >
                <div className="relative aspect-[16/10]">
                  <Image
                    src={r.cover}
                    alt={r.title}
                    fill
                    className="object-cover"
                    sizes="280px"
                  />
                </div>
                <div className="p-3">
                  <div className="font-medium text-navy line-clamp-2">
                    {r.title}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
