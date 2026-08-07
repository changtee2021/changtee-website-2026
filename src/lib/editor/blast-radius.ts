import { DEMO_BLOG } from "@/lib/cms/blog-demo";
import { DEMO_PORTFOLIO } from "@/lib/cms/portfolio-demo";
import { findPage, flattenPages } from "@/lib/editor/page-registry";
import { productCatalog } from "@/lib/product-catalog";

/** Rough count of public URLs affected when publishing a pageKey */
export function blastRadiusForPageKey(pageKey: string): {
  count: number;
  label: string;
  samplePaths: string[];
} {
  const node =
    flattenPages().find((p) => p.pageKey === pageKey) ||
    findPage(pageKey);

  if (!node) {
    return { count: 1, label: "1 หน้า", samplePaths: [] };
  }

  if (node.kind === "single") {
    return {
      count: 1,
      label: "1 หน้า",
      samplePaths: [node.livePath],
    };
  }

  if (pageKey === "product") {
    const paths = productCatalog.flatMap((c) =>
      c.children.map((child) => `/products/${c.slug}/${child.slug}`),
    );
    return {
      count: paths.length,
      label: `${paths.length} หน้าสินค้า`,
      samplePaths: paths.slice(0, 3),
    };
  }

  if (pageKey === "blogPost") {
    const paths = DEMO_BLOG.filter((p) => p.status === "published").map(
      (p) => `/blog/${p.slug}`,
    );
    return {
      count: Math.max(paths.length, 1),
      label: `${Math.max(paths.length, 1)}+ หน้าบทความ`,
      samplePaths: paths.slice(0, 3),
    };
  }

  if (pageKey === "portfolioItem") {
    const paths = DEMO_PORTFOLIO.filter((p) => p.status === "published").map(
      (p) => `/portfolio/${p.slug}`,
    );
    return {
      count: Math.max(paths.length, 1),
      label: `${Math.max(paths.length, 1)}+ หน้าผลงาน`,
      samplePaths: paths.slice(0, 3),
    };
  }

  return {
    count: 0,
    label: "หลายหน้า (เทมเพลต)",
    samplePaths: [node.livePath],
  };
}
