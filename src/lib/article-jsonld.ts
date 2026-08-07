import type { BlogPost } from "@/lib/cms/blog-demo";
import { BLOG_CATEGORY_LABELS } from "@/lib/cms/blog-demo";
import { siteConfig } from "@/lib/site-config";

/** Article + BreadcrumbList JSON-LD for a blog detail page. */
export function getArticleJsonLd(post: BlogPost): Record<string, unknown> {
  const base = siteConfig.url.replace(/\/$/, "");
  const url = `${base}/blog/${post.slug}`;
  const cover = post.cover.trim() || "/images/banners/hero-1.png";

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: post.title,
        description: post.seoDescription || post.excerpt,
        image: [cover.startsWith("http") ? cover : `${base}${cover}`],
        articleSection: BLOG_CATEGORY_LABELS[post.category],
        keywords: post.tags.join(", "),
        datePublished: post.publishedAt ?? undefined,
        dateModified: post.updatedAt || post.publishedAt || undefined,
        inLanguage: "th-TH",
        author: {
          "@type": "Organization",
          name: siteConfig.name,
          url: base,
        },
        // Spelled out rather than referencing the homepage @id, which is not
        // part of this page's graph.
        publisher: {
          "@type": "Organization",
          "@id": `${base}/#organization`,
          name: siteConfig.legalName,
          url: base,
          logo: {
            "@type": "ImageObject",
            url: `${base}/images/brand/logo-mark.png`,
          },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "หน้าแรก", item: base },
          {
            "@type": "ListItem",
            position: 2,
            name: "บทความ",
            item: `${base}/blog`,
          },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
    ],
  };
}
