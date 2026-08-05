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

export function relatedBlog(post: BlogPost, posts: BlogPost[] = DEMO_BLOG, limit = 3) {
  return publishedBlog(posts)
    .filter((p) => p.id !== post.id && p.category === post.category)
    .slice(0, limit);
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
