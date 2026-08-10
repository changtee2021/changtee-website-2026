"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BLOG_CATEGORY_LABELS,
  type BlogCategory,
  type BlogPost,
} from "@/lib/cms/blog-demo";
import { publishedBlog } from "@/lib/cms/public-content";
import { useBlogPosts } from "@/lib/cms/demo-store";

/** Business-priority order for homepage sections */
const CATEGORY_ORDER: BlogCategory[] = [
  "choose",
  "fabric",
  "care",
  "motor",
  "ideas",
  "trend",
  "promo",
];

const PER_CATEGORY_PREVIEW = 3;
const STARTER_COUNT = 5;

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function BlogIndex() {
  const posts = useBlogPosts();
  const published = useMemo(() => publishedBlog(posts), [posts]);
  const [expanded, setExpanded] = useState<Partial<Record<BlogCategory, boolean>>>(
    {},
  );

  const featured = published[0];
  const sideStack = published.slice(1, 4);
  const starter = useMemo(() => {
    const preferred = new Set<BlogCategory>(["choose", "care", "fabric"]);
    const primary = published.filter((p) => preferred.has(p.category));
    const pool = primary.length >= STARTER_COUNT ? primary : published;
    return pool.slice(0, STARTER_COUNT);
  }, [published]);

  const categorySections = useMemo(() => {
    return CATEGORY_ORDER.map((cat) => {
      const items = published.filter((p) => p.category === cat);
      return { cat, items, preview: items.slice(0, PER_CATEGORY_PREVIEW) };
    }).filter((s) => s.items.length > 0);
  }, [published]);

  return (
    <div className="bg-shell pb-16">
      <section className="border-b border-line/70 bg-white">
        <div className="mx-auto max-w-5xl px-6 sm:px-10 lg:px-16 py-10 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Knowledge · อ่านก่อนตัดสินใจ
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-navy sm:text-4xl">
            บทความ
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            ความรู้เรื่องม่าน ไอเดียแต่งบ้าน และเคล็ดลับดูแล
          </p>
          <p className="mt-2 text-sm font-medium text-navy">
            {published.length} บทความ
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 sm:px-10 lg:px-16 pt-8">
        {published.length === 0 ? (
          <p className="mt-10 text-center text-sm text-muted">ยังไม่มีบทความ</p>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              แนะนำให้อ่าน
            </p>

            <section className="mt-3 grid gap-4 lg:grid-cols-12 lg:gap-5">
              {featured ? (
                <Link
                  href={`/blog/${featured.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-line transition hover:ring-navy/25 lg:col-span-5"
                >
                  <div className="relative aspect-[16/10] w-full">
                    <Image
                      src={featured.cover}
                      alt={featured.title}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-[1.02]"
                      sizes="(max-width: 1024px) 100vw, 420px"
                      priority
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <span className="text-xs font-medium text-brand-red">
                      {BLOG_CATEGORY_LABELS[featured.category]}
                    </span>
                    <h2 className="mt-2 font-display text-xl font-semibold text-navy sm:text-2xl">
                      {featured.title}
                    </h2>
                    <p className="mt-3 line-clamp-3 text-sm text-muted">
                      {featured.excerpt}
                    </p>
                    {formatDate(featured.publishedAt) ? (
                      <p className="mt-auto pt-4 text-xs text-muted">
                        {formatDate(featured.publishedAt)}
                      </p>
                    ) : null}
                  </div>
                </Link>
              ) : null}

              <div className="flex flex-col gap-3 lg:col-span-4">
                {sideStack.map((post) => (
                  <HorizontalCard key={post.id} post={post} />
                ))}
              </div>

              <aside className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-line lg:col-span-3">
                <h2 className="font-display text-sm font-semibold tracking-wide text-navy">
                  เริ่มจากตรงนี้
                </h2>
                <p className="mt-1 text-xs text-muted">
                  คู่มือช่วยตัดสินใจที่อ่านก่อนคุ้ม
                </p>
                <ol className="mt-5 space-y-4">
                  {starter.map((post, i) => (
                    <li key={post.id}>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="group flex gap-3"
                      >
                        <span className="w-7 shrink-0 font-display text-2xl font-bold leading-none text-line transition group-hover:text-brand-red">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[11px] font-medium text-brand-red">
                            {BLOG_CATEGORY_LABELS[post.category]}
                          </span>
                          <span className="mt-0.5 block text-sm font-semibold leading-snug text-navy group-hover:underline">
                            {post.title}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </aside>
            </section>

            <div className="mt-14 space-y-12">
              <div className="border-b border-line pb-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  แยกตามหมวด
                </p>
                <h2 className="mt-1 font-display text-xl font-semibold text-navy">
                  เลือกอ่านตามสิ่งที่อยากรู้
                </h2>
              </div>
              {categorySections.map(({ cat, items, preview }) => {
                const isOpen = !!expanded[cat];
                const shown = isOpen ? items : preview;
                return (
                  <section key={cat} id={`cat-${cat}`}>
                    <SectionHeading
                      title={BLOG_CATEGORY_LABELS[cat]}
                      count={items.length}
                      actionLabel={
                        items.length > PER_CATEGORY_PREVIEW
                          ? isOpen
                            ? "ย่อ"
                            : "ดูทั้งหมด"
                          : undefined
                      }
                      onAction={
                        items.length > PER_CATEGORY_PREVIEW
                          ? () =>
                              setExpanded((prev) => ({
                                ...prev,
                                [cat]: !prev[cat],
                              }))
                          : undefined
                      }
                    />
                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {shown.map((post) => (
                        <GridCard key={post.id} post={post} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SectionHeading({
  title,
  count,
  actionLabel,
  onAction,
}: {
  title: string;
  count?: number;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-line pb-3">
      <div>
        <h2 className="font-display text-xl font-semibold text-navy">{title}</h2>
        {typeof count === "number" ? (
          <p className="mt-0.5 text-xs text-muted">{count} บทความ</p>
        ) : null}
      </div>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="shrink-0 text-sm font-medium text-brand-red hover:underline"
        >
          {actionLabel} →
        </button>
      ) : null}
    </div>
  );
}

function HorizontalCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-1 items-start gap-3 overflow-hidden rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-line transition hover:ring-navy/25 sm:p-3"
    >
      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg sm:h-24 sm:w-28">
        <Image
          src={post.cover}
          alt={post.title}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
          sizes="112px"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-start">
        <span className="text-[11px] font-medium text-brand-red">
          {BLOG_CATEGORY_LABELS[post.category]}
        </span>
        <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-navy">
          {post.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs text-muted">{post.excerpt}</p>
      </div>
    </Link>
  );
}

function GridCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-line transition hover:ring-navy/25"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={post.cover}
          alt={post.title}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.02]"
          sizes="360px"
        />
      </div>
      <div className="p-4 sm:p-5">
        <span className="text-[11px] font-medium text-brand-red">
          {BLOG_CATEGORY_LABELS[post.category]}
        </span>
        <h3 className="mt-1.5 font-display text-base font-semibold leading-snug text-navy group-hover:text-brand-red">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
          {post.excerpt}
        </p>
      </div>
    </Link>
  );
}
