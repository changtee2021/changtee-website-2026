import {
  DEMO_BLOG,
  BLOG_CATEGORY_LABELS,
  type BlogPost,
} from "@/lib/cms/blog-demo";
import {
  DEMO_PORTFOLIO,
  SPACE_TYPE_LABELS,
  itemHasProduct,
  productLabel,
  type PortfolioItem,
} from "@/lib/cms/portfolio-demo";
import { LEARN_SHEETS, type LearnSheet } from "@/lib/learn";
import { normalizeContentSlug } from "@/lib/cms/content-status";

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
  const needle = normalizeContentSlug(slug);
  return publishedPortfolio(items).find(
    (i) => normalizeContentSlug(i.slug) === needle,
  );
}

export function getBlogBySlug(
  slug: string,
  posts: BlogPost[] = DEMO_BLOG,
): BlogPost | undefined {
  const needle = normalizeContentSlug(slug);
  return publishedBlog(posts).find(
    (p) => normalizeContentSlug(p.slug) === needle,
  );
}

export function relatedPortfolio(
  item: PortfolioItem,
  items: PortfolioItem[] = DEMO_PORTFOLIO,
  limit = 3,
) {
  return publishedPortfolio(items)
    .filter((i) => i.id !== item.id && itemHasProduct(i, item.productSlug))
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
  const byCategory = published.filter((i) => itemHasProduct(i, categorySlug));
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

const PRODUCT_CONTENT_HINTS: { slug: string; keywords: string[] }[] = [
  {
    slug: "curtain",
    keywords: [
      "ผ้าม่าน",
      "ม่านลอน",
      "ม่านจีบ",
      "ม่านตาไก่",
      "ม่านพับ",
      "ทึบแสง",
      "blackout",
      "ลอนเทป",
      "โรงพยาบาล",
    ],
  },
  {
    slug: "roller-blinds",
    keywords: ["ม่านม้วน", "sunscreen", "zebra", "เมจิก"],
  },
  {
    slug: "vertical-blinds",
    keywords: ["ม่านปรับแสง"],
  },
  { slug: "venetian-blinds", keywords: ["มู่ลี่"] },
  { slug: "pvc-partition", keywords: ["ฉากกั้น"] },
  {
    slug: "outdoor-factory",
    keywords: ["ม่านภายนอก", "zip", "ซิป", "สกายไลท์"],
  },
  { slug: "motorized", keywords: ["ม่านไฟฟ้า", "มอเตอร์", "รีโมท"] },
  { slug: "print-fabric", keywords: ["พิมพ์ลาย", "ม่านญี่ปุ่น", "noren"] },
  { slug: "surface", keywords: ["วอลเปเปอร์", "ฟิล์ม"] },
  { slug: "service", keywords: ["ซัก", "ซ่อม"] },
];

const SPACE_CONTENT_HINTS: Record<string, string[]> = {
  hospital: ["โรงพยาบาล", "คลินิก"],
  "restaurant-cafe": ["ร้านอาหาร", "คาเฟ่", "ร้าน"],
  "home-condo": ["คอนโด", "บ้าน", "ห้องนอน"],
  "office-corp": ["ออฟฟิศ", "สำนักงาน", "องค์กร"],
  government: ["ราชการ"],
  education: ["โรงเรียน", "สถานศึกษา"],
  "hotel-resort": ["โรงแรม", "รีสอร์ท"],
};

function portfolioHay(item: PortfolioItem) {
  return [
    item.title,
    item.summary,
    item.detail,
    item.place,
    productLabel(item.productSlug),
    ...item.tags,
  ]
    .join(" ")
    .toLowerCase();
}

/** Blog posts that help a visitor understand this install. */
export function blogForPortfolio(
  item: PortfolioItem,
  posts: BlogPost[] = DEMO_BLOG,
  limit = 3,
) {
  const published = publishedBlog(posts);
  const productWords =
    PRODUCT_CONTENT_HINTS.find((h) => h.slug === item.productSlug)?.keywords ??
    [];
  const spaceWords = SPACE_CONTENT_HINTS[item.spaceType] ?? [];
  const tags = item.tags.map((t) => t.toLowerCase());

  const scored = published
    .map((post) => {
      const hay =
        `${post.title} ${post.excerpt} ${post.tags.join(" ")} ${post.body}`.toLowerCase();
      const productHit = productWords.some((k) => hay.includes(k.toLowerCase()))
        ? 3
        : 0;
      const spaceHit = spaceWords.some((k) => hay.includes(k.toLowerCase()))
        ? 2
        : 0;
      const tagHit = tags.some((t) => hay.includes(t)) ? 2 : 0;
      const titleHit = productWords.some((k) =>
        post.title.toLowerCase().includes(k.toLowerCase()),
      )
        ? 1
        : 0;
      return { post, score: productHit + spaceHit + tagHit + titleHit };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        Date.parse(b.post.publishedAt ?? "0") -
          Date.parse(a.post.publishedAt ?? "0"),
    );

  const related = scored.filter((s) => s.score > 0).map((s) => s.post);
  if (related.length >= limit) return related.slice(0, limit);
  const ids = new Set(related.map((p) => p.id));
  return [
    ...related,
    ...published.filter((p) => !ids.has(p.id)),
  ].slice(0, limit);
}

/** Learn-room sheets that match this install's product. */
export function learnForPortfolio(item: PortfolioItem, limit = 3): LearnSheet[] {
  const hay = portfolioHay(item);
  const scored = LEARN_SHEETS.map((sheet) => {
    let score = 0;
    if (sheet.productHref?.includes(`/${item.productSlug}`)) score += 4;
    if (sheet.room === "fabric" && item.productSlug === "curtain") score += 3;
    if (sheet.room === "fabric" && item.productSlug === "print-fabric") score += 3;
    if (sheet.room === "partition" && item.productSlug === "pvc-partition")
      score += 4;
    if (sheet.room === "motor" && item.productSlug === "motorized") score += 4;
    if (sheet.slug === "motor-roller" && item.productSlug === "roller-blinds")
      score += 4;
    if (
      sheet.slug === "motor-wood" &&
      item.productSlug === "venetian-blinds" &&
      (hay.includes("ไม้") || hay.includes("wood"))
    )
      score += 4;
    if (
      sheet.slug === "motor-aluminium" &&
      item.productSlug === "venetian-blinds" &&
      (hay.includes("อลู") || hay.includes("aluminium"))
    )
      score += 4;
    if (sheet.room === "motor" && item.productSlug === "venetian-blinds")
      score += 2;
    if (
      sheet.slug === "motor-roller" &&
      (item.productSlug === "outdoor-factory" ||
        item.productSlug === "vertical-blinds")
    )
      score += 2;
    if (sheet.room === "fabric" && hay.includes("ผ้า")) score += 1;
    return { sheet, score };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  const picked = scored.slice(0, limit).map((s) => s.sheet);
  if (picked.length > 0) return picked;
  return LEARN_SHEETS.slice(0, limit);
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
