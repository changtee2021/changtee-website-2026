"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { HomePanel, PanelHeading } from "@/components/home/HomePanel";
import {
  BLOG_CATEGORY_LABELS,
  type BlogCategory,
  type BlogPost,
} from "@/lib/cms/blog-demo";
import { publishedBlog } from "@/lib/cms/public-content";
import { useBlogPosts } from "@/lib/cms/demo-store";

const STARTER_COUNT = 5;

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function BlogPreview() {
  const posts = useBlogPosts();
  const published = useMemo(() => publishedBlog(posts), [posts]);

  const featured = published[0];
  const sideStack = published.slice(1, 4);
  const starter = useMemo(() => {
    const preferred = new Set<BlogCategory>(["choose", "care", "fabric"]);
    const primary = published.filter((p) => preferred.has(p.category));
    const pool = primary.length >= STARTER_COUNT ? primary : published;
    return pool.slice(0, STARTER_COUNT);
  }, [published]);

  if (!featured) return null;

  return (
    <HomePanel tone="clear">
      <div className="py-7 sm:py-9 md:py-12">
        <PanelHeading
          title="บทความจากทีมช่างตี๋"
          align="start"
          action={
            <Link
              href="/blog"
              className="text-sm font-semibold text-brand-red hover:underline"
            >
              อ่านทั้งหมด →
            </Link>
          }
        />

        <section className="mt-8 grid gap-4 lg:grid-cols-12 lg:gap-5">
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
              />
            </div>
            <div className="flex flex-1 flex-col p-5 sm:p-6">
              <span className="text-xs font-medium text-brand-red">
                {BLOG_CATEGORY_LABELS[featured.category]}
              </span>
              <h3 className="mt-2 font-display text-xl font-semibold text-navy sm:text-2xl">
                {featured.title}
              </h3>
              <p className="mt-3 line-clamp-3 text-sm text-muted">
                {featured.excerpt}
              </p>
              <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                {formatDate(featured.publishedAt) ? (
                  <p className="text-xs text-muted">
                    {formatDate(featured.publishedAt)}
                  </p>
                ) : (
                  <span />
                )}
                <span className="shrink-0 text-sm font-semibold text-brand-red transition group-hover:translate-x-0.5">
                  →
                </span>
              </div>
            </div>
          </Link>

          <div className="flex flex-col gap-3 lg:col-span-4">
            {sideStack.map((post) => (
              <HorizontalCard key={post.id} post={post} />
            ))}
          </div>

          <aside className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-line lg:col-span-3">
            <h3 className="font-display text-sm font-semibold tracking-wide text-navy">
              เริ่มจากตรงนี้
            </h3>
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
      </div>
    </HomePanel>
  );
}

function HorizontalCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-1 items-stretch gap-3 overflow-hidden rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-line transition hover:ring-navy/25 sm:p-3"
    >
      <div className="relative h-20 w-24 shrink-0 self-start overflow-hidden rounded-lg sm:h-24 sm:w-28">
        <Image
          src={post.cover}
          alt={post.title}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
          sizes="112px"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-[11px] font-medium text-brand-red">
          {BLOG_CATEGORY_LABELS[post.category]}
        </span>
        <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-navy">
          {post.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs text-muted">{post.excerpt}</p>
        <span className="mt-auto self-end pt-2 text-sm font-semibold text-brand-red transition group-hover:translate-x-0.5">
          →
        </span>
      </div>
    </Link>
  );
}
