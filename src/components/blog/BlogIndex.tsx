"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BLOG_CATEGORY_LABELS,
  type BlogCategory,
} from "@/lib/cms/blog-demo";
import { publishedBlog } from "@/lib/cms/public-content";
import { useBlogPosts } from "@/lib/cms/demo-store";
import { cn } from "@/lib/utils";

export function BlogIndex() {
  const posts = useBlogPosts();
  const published = useMemo(() => publishedBlog(posts), [posts]);
  const [category, setCategory] = useState<BlogCategory | "all">("all");

  const filtered = useMemo(() => {
    if (category === "all") return published;
    return published.filter((p) => p.category === category);
  }, [published, category]);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-navy">บทความ</h1>
      <div className="mt-2 h-1 w-16 bg-brand-red" />
      <p className="mt-3 max-w-2xl text-muted">
        ความรู้เรื่องม่าน ไอเดียแต่งบ้าน และเคล็ดลับดูแล — คอนเทนต์ให้อ่าน ไม่ใช่รูปงานติดตั้ง
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Chip active={category === "all"} onClick={() => setCategory("all")}>
          ทั้งหมด
        </Chip>
        {(Object.keys(BLOG_CATEGORY_LABELS) as BlogCategory[]).map((c) => (
          <Chip
            key={c}
            active={category === c}
            onClick={() => setCategory(c)}
          >
            {BLOG_CATEGORY_LABELS[c]}
          </Chip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted">ไม่พบบทความในหมวดนี้</p>
      ) : (
        <>
          {featured ? (
            <Link
              href={`/blog/${featured.slug}`}
              className="mt-8 grid overflow-hidden rounded-2xl border border-line bg-white transition hover:border-navy/30 sm:grid-cols-2"
            >
              <div className="relative aspect-[16/10] sm:aspect-auto sm:min-h-[260px]">
                <Image
                  src={featured.cover}
                  alt={featured.title}
                  fill
                  className="object-cover"
                  sizes="560px"
                  priority
                />
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-8">
                <span className="text-xs font-medium text-brand-red">
                  {BLOG_CATEGORY_LABELS[featured.category]}
                </span>
                <h2 className="mt-2 font-display text-2xl font-semibold text-navy">
                  {featured.title}
                </h2>
                <p className="mt-3 text-sm text-muted">{featured.excerpt}</p>
                {featured.publishedAt ? (
                  <p className="mt-4 text-xs text-muted">
                    {new Date(featured.publishedAt).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                ) : null}
              </div>
            </Link>
          ) : null}

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="overflow-hidden rounded-lg border border-line bg-white transition hover:border-navy/30 hover:shadow-sm"
              >
                <div className="relative aspect-[16/10]">
                  <Image
                    src={post.cover}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="360px"
                  />
                </div>
                <div className="p-4">
                  <span className="text-[11px] font-medium text-brand-red">
                    {BLOG_CATEGORY_LABELS[post.category]}
                  </span>
                  <h2 className="mt-1 font-semibold text-navy">{post.title}</h2>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-sm transition-colors",
        active
          ? "border-navy bg-navy text-white"
          : "border-line bg-white text-ink hover:border-navy/30",
      )}
    >
      {children}
    </button>
  );
}
