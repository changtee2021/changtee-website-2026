import { childImage, productCatalog } from "@/lib/product-catalog";
import {
  SPACE_TYPE_LABELS,
  productLabel,
  type PortfolioItem,
} from "@/lib/cms/portfolio-demo";
import { BLOG_CATEGORY_LABELS, type BlogPost } from "@/lib/cms/blog-demo";
import { publishedBlog, publishedPortfolio } from "@/lib/cms/public-content";

export type SearchEntryType = "product" | "portfolio" | "blog";

export type SearchEntry = {
  type: SearchEntryType;
  title: string;
  subtitle?: string;
  keywords: string[];
  href: string;
  image?: string;
};

const ENTRY_TYPE_LABELS: Record<SearchEntryType, string> = {
  product: "สินค้า",
  portfolio: "ผลงาน",
  blog: "บทความ",
};

export function entryTypeLabel(type: SearchEntryType): string {
  return ENTRY_TYPE_LABELS[type];
}

/** Products come from a static catalog — build once, reuse across renders. */
const PRODUCT_ENTRIES: SearchEntry[] = productCatalog.flatMap((category) => {
  const categoryEntry: SearchEntry = {
    type: "product",
    title: category.name,
    subtitle: category.nameEn,
    keywords: [category.nameEn, category.summary],
    href: `/products/${category.slug}`,
    image: category.image,
  };
  const childEntries: SearchEntry[] = category.children.map((child) => ({
    type: "product",
    title: child.name,
    subtitle: category.name,
    keywords: [child.nameEn, child.summary, category.name, category.nameEn].filter(
      (v): v is string => Boolean(v),
    ),
    href: `/products/${category.slug}/${child.slug}`,
    image: childImage(category, child),
  }));
  return [categoryEntry, ...childEntries];
});

function portfolioEntries(items: PortfolioItem[]): SearchEntry[] {
  return publishedPortfolio(items).map((item) => ({
    type: "portfolio",
    title: item.title,
    subtitle: item.place,
    keywords: [
      item.place,
      item.installLocation,
      item.customerName,
      productLabel(item.productSlug),
      SPACE_TYPE_LABELS[item.spaceType],
      ...item.tags,
    ].filter(Boolean),
    href: `/portfolio/${item.slug}`,
    image: item.image,
  }));
}

function blogEntries(posts: BlogPost[]): SearchEntry[] {
  return publishedBlog(posts).map((post) => ({
    type: "blog",
    title: post.title,
    subtitle: BLOG_CATEGORY_LABELS[post.category],
    keywords: [BLOG_CATEGORY_LABELS[post.category], post.excerpt, ...post.tags],
    href: `/blog/${post.slug}`,
    image: post.cover,
  }));
}

/** Merge products (static) + portfolio + blog (CMS-editable) into one index. */
export function buildSearchIndex(
  portfolioItems: PortfolioItem[],
  blogPosts: BlogPost[],
): SearchEntry[] {
  return [
    ...PRODUCT_ENTRIES,
    ...portfolioEntries(portfolioItems),
    ...blogEntries(blogPosts),
  ];
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function scoreEntry(entry: SearchEntry, query: string): number {
  const title = normalize(entry.title);
  const haystack = normalize(
    [entry.title, entry.subtitle ?? "", ...entry.keywords].join(" "),
  );

  let score = 0;
  if (title === query) score += 100;
  else if (title.startsWith(query)) score += 60;
  else if (title.includes(query)) score += 40;

  if (haystack.includes(query)) score += 20;

  for (const token of query.split(" ").filter((t) => t.length >= 2)) {
    if (haystack.includes(token)) score += 5;
  }

  return score;
}

/** Rank entries against a free-text query; best match first. */
export function searchSite(
  entries: SearchEntry[],
  query: string,
  limit = 6,
): SearchEntry[] {
  const q = normalize(query);
  if (!q) return [];

  return entries
    .map((entry) => ({ entry, score: scoreEntry(entry, q) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.entry);
}
