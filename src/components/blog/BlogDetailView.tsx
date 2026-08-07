"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { EditableSpot } from "@/components/preview/EditableSpot";
import { BLOG_CATEGORY_LABELS, type BlogPost } from "@/lib/cms/blog-demo";
import type { PortfolioItem } from "@/lib/cms/portfolio-demo";
import { productLabel } from "@/lib/cms/portfolio-demo";
import { useSectionValues } from "@/lib/cms/demo-store";
import {
  parseMarkdown,
  readingMinutes,
  tableOfContents,
  type MdBlock,
} from "@/lib/cms/markdown";
import { BLOG_POST_SECTION_DEFAULTS } from "@/lib/cms/page-sections/templates";

const INLINE_RE = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let index = 0;
  let match: RegExpExecArray | null;

  INLINE_RE.lastIndex = 0;
  while ((match = INLINE_RE.exec(text)) !== null) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));

    if (match[1]) {
      nodes.push(
        <strong
          key={`${keyPrefix}-b${index}`}
          className="font-semibold text-navy"
        >
          {match[1]}
        </strong>,
      );
    } else {
      const href = match[3];
      const label = match[2];
      nodes.push(
        href.startsWith("/") ? (
          <Link
            key={`${keyPrefix}-l${index}`}
            href={href}
            className="text-brand-red underline underline-offset-2 hover:opacity-80"
          >
            {label}
          </Link>
        ) : (
          <a
            key={`${keyPrefix}-l${index}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-red underline underline-offset-2 hover:opacity-80"
          >
            {label}
          </a>
        ),
      );
    }

    cursor = INLINE_RE.lastIndex;
    index += 1;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

function Block({ block, index }: { block: MdBlock; index: number }) {
  const key = `b${index}`;

  switch (block.kind) {
    case "heading":
      return block.level === 2 ? (
        <h2
          id={block.id}
          className="scroll-mt-24 pt-4 font-display text-2xl font-bold text-navy"
        >
          {block.text}
        </h2>
      ) : (
        <h3
          id={block.id}
          className="scroll-mt-24 pt-2 font-display text-xl font-semibold text-navy"
        >
          {block.text}
        </h3>
      );

    case "paragraph":
      return <p>{renderInline(block.text, key)}</p>;

    case "list": {
      const items = block.items.map((item, n) => (
        <li key={`${key}-i${n}`} className="pl-1">
          {renderInline(item, `${key}-i${n}`)}
        </li>
      ));
      return block.ordered ? (
        <ol className="list-decimal space-y-2 pl-6 marker:text-brand-red">
          {items}
        </ol>
      ) : (
        <ul className="list-disc space-y-2 pl-6 marker:text-brand-red">
          {items}
        </ul>
      );
    }

    case "image":
      return (
        <figure className="my-8">
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-line bg-paper">
            <Image
              src={block.src}
              alt={block.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 680px"
            />
          </div>
          {block.caption ? (
            <figcaption className="mt-2 text-center text-sm text-muted">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      );

    case "quote":
      return (
        <blockquote className="border-l-4 border-brand-red bg-paper/60 py-3 pr-4 pl-5 text-ink/80 italic">
          {renderInline(block.text, key)}
        </blockquote>
      );

    case "table":
      return (
        <div className="my-6 overflow-x-auto rounded-xl border border-line">
          <table className="w-full border-collapse text-left text-[15px]">
            <thead className="bg-paper">
              <tr>
                {block.head.map((cell, n) => (
                  <th
                    key={`${key}-h${n}`}
                    className="px-4 py-3 font-semibold text-navy"
                  >
                    {renderInline(cell, `${key}-h${n}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={`${key}-r${r}`} className="border-t border-line">
                  {row.map((cell, c) => (
                    <td
                      key={`${key}-r${r}c${c}`}
                      className="px-4 py-3 align-top"
                    >
                      {renderInline(cell, `${key}-r${r}c${c}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    default:
      return null;
  }
}

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
  const blocks = parseMarkdown(post.body);
  const toc = tableOfContents(blocks);
  const minutes = readingMinutes(post.body);
  const title = post.title.trim() || "หัวข้อบทความ (ยังไม่ใส่)";
  const excerpt = post.excerpt.trim() || (preview ? "ยังไม่มีคำโปรย" : "");
  const cover = post.cover.trim() || "/images/banners/hero-1.png";
  const publishedAt =
    post.publishedAt || (preview ? new Date().toISOString() : null);
  const showUpdated =
    Boolean(publishedAt) &&
    Boolean(post.updatedAt) &&
    new Date(post.updatedAt).getTime() - new Date(publishedAt!).getTime() >
      86_400_000;

  const ctaCms = useSectionValues(
    "blogPost",
    "cta",
    BLOG_POST_SECTION_DEFAULTS.cta,
  );
  const relatedCms = useSectionValues(
    "blogPost",
    "related",
    BLOG_POST_SECTION_DEFAULTS.related,
  );

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

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
              <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
            </>
          ) : null}
          {showUpdated ? (
            <>
              <span>·</span>
              <span>อัปเดต {formatDate(post.updatedAt)}</span>
            </>
          ) : null}
          <span>·</span>
          <span>อ่าน {minutes} นาที</span>
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

      {toc.length >= 3 ? (
        <nav
          aria-label="หัวข้อในบทความ"
          className="mx-auto mt-10 max-w-[680px] px-4"
        >
          <div className="rounded-2xl border border-line bg-paper/60 p-5">
            <p className="text-sm font-semibold text-navy">หัวข้อในบทความ</p>
            <ol className="mt-3 space-y-2 text-sm">
              {toc.map((entry, n) => (
                <li key={entry.id} className="flex gap-2">
                  <span className="text-brand-red">{n + 1}.</span>
                  <a
                    href={`#${entry.id}`}
                    className="text-ink/80 hover:text-brand-red hover:underline"
                  >
                    {entry.text}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>
      ) : null}

      <div className="mx-auto mt-10 max-w-[680px] space-y-5 px-4 text-[17px] leading-relaxed text-ink/90">
        {blocks.length > 0 ? (
          blocks.map((block, index) => (
            <Block key={`block-${index}`} block={block} index={index} />
          ))
        ) : preview ? (
          <p className="italic text-muted">ยังไม่มีเนื้อหาบทความ</p>
        ) : null}
      </div>

      {post.tags.length > 0 ? (
        <div className="mx-auto mt-10 flex max-w-[680px] flex-wrap gap-2 px-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-paper px-3 py-1 text-xs text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      {ctaCms.enabled ? (
        <div className="mx-auto mt-12 max-w-[680px] px-4">
          <div className="rounded-2xl border border-line bg-paper/60 p-5">
            <EditableSpot sectionId="cta" fieldKey="body">
              <p className="text-sm text-navy">{ctaCms.values.body}</p>
            </EditableSpot>
            <div className="mt-4 flex flex-wrap gap-3">
              <EditableSpot
                sectionId="cta"
                fieldKey="quoteLabel"
                className="w-auto"
              >
                <Link
                  href="/quote"
                  className="inline-flex rounded-xl bg-brand-red px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                  onClick={(e) => {
                    if (
                      typeof window !== "undefined" &&
                      window.parent !== window
                    ) {
                      e.preventDefault();
                    }
                  }}
                >
                  {ctaCms.values.quoteLabel}
                </Link>
              </EditableSpot>
              <EditableSpot
                sectionId="cta"
                fieldKey="productsLabel"
                className="w-auto"
              >
                <Link
                  href="/products"
                  className="inline-flex rounded-xl border border-navy bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:bg-paper"
                  onClick={(e) => {
                    if (
                      typeof window !== "undefined" &&
                      window.parent !== window
                    ) {
                      e.preventDefault();
                    }
                  }}
                >
                  {ctaCms.values.productsLabel}
                </Link>
              </EditableSpot>
            </div>
          </div>
        </div>
      ) : null}

      {related.length > 0 && relatedCms.enabled ? (
        <section className="mx-auto mt-14 max-w-6xl px-4">
          <EditableSpot sectionId="related" fieldKey="postsHeading">
            <h2 className="font-display text-xl font-semibold text-navy">
              {relatedCms.values.postsHeading}
            </h2>
          </EditableSpot>
          <EditableSpot sectionId="related" fieldKey="postsIntro">
            <p className="mt-1 text-sm text-muted">
              {relatedCms.values.postsIntro}
            </p>
          </EditableSpot>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/blog/${item.slug}`}
                className="overflow-hidden rounded-lg border border-line bg-white hover:border-navy/30"
              >
                <div className="relative aspect-[16/10]">
                  <Image
                    src={item.cover}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="280px"
                  />
                </div>
                <div className="p-3">
                  <span className="text-[11px] font-medium text-brand-red">
                    {BLOG_CATEGORY_LABELS[item.category]}
                  </span>
                  <div className="mt-1 font-medium text-navy line-clamp-2">
                    {item.title}
                  </div>
                  {item.excerpt ? (
                    <p className="mt-1 line-clamp-2 text-xs text-muted">
                      {item.excerpt}
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {relatedWorks.length > 0 && relatedCms.enabled ? (
        <section className="mx-auto mt-14 max-w-6xl px-4">
          <EditableSpot sectionId="related" fieldKey="worksHeading">
            <h2 className="font-display text-xl font-semibold text-navy">
              {relatedCms.values.worksHeading}
            </h2>
          </EditableSpot>
          <EditableSpot sectionId="related" fieldKey="worksIntro">
            <p className="mt-1 text-sm text-muted">
              {relatedCms.values.worksIntro}
            </p>
          </EditableSpot>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {relatedWorks.map((work) => (
              <Link
                key={work.id}
                href={`/portfolio/${work.slug}`}
                className="overflow-hidden rounded-xl border border-line bg-white hover:border-navy/30"
              >
                <div className="relative aspect-[16/10]">
                  <Image
                    src={work.image}
                    alt={work.title}
                    fill
                    className="object-cover"
                    sizes="360px"
                  />
                </div>
                <div className="p-3">
                  <div className="text-[11px] text-muted">
                    {productLabel(work.productSlug)}
                  </div>
                  <div className="mt-1 font-medium text-navy line-clamp-2">
                    {work.title}
                  </div>
                  <div className="mt-1 text-xs text-brand-red">{work.place}</div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-4">
            <Link
              href="/portfolio"
              className="text-sm font-medium text-brand-red hover:underline"
            >
              ดูผลงานติดตั้งทั้งหมด →
            </Link>
          </div>
        </section>
      ) : null}
    </article>
  );
}
