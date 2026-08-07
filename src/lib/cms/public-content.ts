import {
  DEMO_BLOG,
  BLOG_CATEGORY_LABELS,
  type BlogPost,
} from "@/lib/cms/blog-demo";
import {
  DEMO_PORTFOLIO,
  SPACE_TYPE_LABELS,
  productLabel,
  type PortfolioItem,
} from "@/lib/cms/portfolio-demo";

export function publishedPortfolio(items: PortfolioItem[] = DEMO_PORTFOLIO) {
  return items
    .filter((i) => i.status === "published")
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function publishedBlog(posts: BlogPost[] = DEMO_BLOG) {
  return posts
    .filter((p) => p.status === "published")
    .sort((a, b) => {
      const da = a.publishedAt ? Date.parse(a.publishedAt) : 0;
      const db = b.publishedAt ? Date.parse(b.publishedAt) : 0;
      return db - da;
    });
}

export function getPortfolioBySlug(
  slug: string,
  items: PortfolioItem[] = DEMO_PORTFOLIO,
): PortfolioItem | undefined {
  return publishedPortfolio(items).find((i) => i.slug === slug);
}

export function getBlogBySlug(
  slug: string,
  posts: BlogPost[] = DEMO_BLOG,
): BlogPost | undefined {
  return publishedBlog(posts).find((p) => p.slug === slug);
}

export function relatedPortfolio(
  item: PortfolioItem,
  items: PortfolioItem[] = DEMO_PORTFOLIO,
  limit = 3,
) {
  return publishedPortfolio(items)
    .filter((i) => i.id !== item.id && i.productSlug === item.productSlug)
    .slice(0, limit);
}

/** Install cases for a product category (and optional variant name match in tags/title) */
export function portfolioForProduct(
  categorySlug: string,
  productName?: string,
  items: PortfolioItem[] = DEMO_PORTFOLIO,
  limit = 3,
) {
  const published = publishedPortfolio(items);
  const byCategory = published.filter((i) => i.productSlug === categorySlug);
  if (!productName) return byCategory.slice(0, limit);

  const name = productName.trim();
  const scored = byCategory
    .map((i) => {
      const hay = `${i.title} ${i.summary} ${i.tags.join(" ")}`;
      const hit =
        hay.includes(name) ||
        (name.includes("ลอน") && hay.includes("ลอน")) ||
        (name.includes("ทึบ") && hay.includes("ทึบ"));
      return { i, score: hit ? 2 : 1 };
    })
    .sort((a, b) => b.score - a.score);
  return scored.map((s) => s.i).slice(0, limit);
}

function tagOverlapScore(a: string[], b: string[]) {
  if (!a.length || !b.length) return 0;
  const setB = new Set(b);
  return a.reduce((score, tag) => score + (setB.has(tag) ? 1 : 0), 0);
}

/** Prefer same category + shared tags; fill with recent posts if needed. */
export function relatedBlog(
  post: BlogPost,
  posts: BlogPost[] = DEMO_BLOG,
  limit = 3,
) {
  const others = publishedBlog(posts).filter((p) => p.id !== post.id);
  const scored = others
    .map((p) => {
      const sameCategory = p.category === post.category ? 3 : 0;
      const tags = tagOverlapScore(post.tags, p.tags) * 2;
      const titleHit =
        post.tags.some((tag) => p.title.includes(tag) || p.excerpt.includes(tag))
          ? 1
          : 0;
      return { p, score: sameCategory + tags + titleHit };
    })
    .sort((a, b) => b.score - a.score || Date.parse(b.p.publishedAt ?? "0") - Date.parse(a.p.publishedAt ?? "0"));

  return scored.slice(0, limit).map((s) => s.p);
}

/**
 * Portfolio installs related to a blog article — match product keywords in
 * title/tags/body, then fall back to recent published works.
 */
export function portfolioForBlog(
  post: BlogPost,
  items: PortfolioItem[] = DEMO_PORTFOLIO,
  limit = 3,
) {
  const hay = `${post.title} ${post.excerpt} ${post.tags.join(" ")} ${post.body}`.toLowerCase();
  const published = publishedPortfolio(items);

  const productHints: { slug: string; keywords: string[] }[] = [
    { slug: "curtain", keywords: ["ผ้าม่าน", "ม่านลอน", "ม่านจีบ", "ทึบแสง", "เนื้อผ้า", "blackout"] },
    { slug: "roller-blinds", keywords: ["ม่านม้วน", "sunscreen", "เมจิก", "zebra"] },
    { slug: "motorized", keywords: ["ม่านไฟฟ้า", "มอเตอร์", "รีโมท"] },
    { slug: "venetian-blinds", keywords: ["มู่ลี่"] },
    { slug: "pvc-partition", keywords: ["ฉากกั้น"] },
    { slug: "surface", keywords: ["ฟิล์ม", "วอลเปเปอร์"] },
    { slug: "outdoor-factory", keywords: ["ม่านภายนอก", "zip"] },
  ];

  const preferredSlugs = new Set(
    productHints
      .filter((h) => h.keywords.some((k) => hay.includes(k.toLowerCase())))
      .map((h) => h.slug),
  );

  const scored = published
    .map((item) => {
      const productHit = preferredSlugs.has(item.productSlug) ? 3 : 0;
      const tagHit = item.tags.some((t) => hay.includes(t.toLowerCase())) ? 2 : 0;
      const titleHit = post.tags.some((t) => item.title.includes(t)) ? 1 : 0;
      return { item, score: productHit + tagHit + titleHit };
    })
    .sort((a, b) => b.score - a.score || a.item.sortOrder - b.item.sortOrder);

  const related = scored.filter((s) => s.score > 0).map((s) => s.item);
  if (related.length >= limit) return related.slice(0, limit);
  const ids = new Set(related.map((i) => i.id));
  return [
    ...related,
    ...published.filter((i) => !ids.has(i.id)),
  ].slice(0, limit);
}

export function portfolioTaxonomyLabel(item: PortfolioItem) {
  return {
    product: productLabel(item.productSlug),
    space: SPACE_TYPE_LABELS[item.spaceType],
    place: item.place,
  };
}

export function blogCategoryLabel(post: BlogPost) {
  return BLOG_CATEGORY_LABELS[post.category];
}

/** Split plain body into paragraphs (blank-line separated). */
export function bodyParagraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
