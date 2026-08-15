import {
  HOME_SECTION_DEFAULTS,
  HOME_SECTION_DEFS,
  PRODUCT_PAGE_KEY,
  PRODUCT_SECTION_DEFAULTS,
  PRODUCT_SECTION_DEFS,
  type SectionDef,
} from "@/lib/cms/page-sections";
import {
  ABOUT_SECTION_DEFAULTS,
  ABOUT_SECTION_DEFS,
  BLOG_POST_SECTION_DEFAULTS,
  BLOG_POST_SECTION_DEFS,
  CONTACT_SECTION_DEFAULTS,
  CONTACT_SECTION_DEFS,
  PORTFOLIO_ITEM_SECTION_DEFAULTS,
  PORTFOLIO_ITEM_SECTION_DEFS,
} from "@/lib/cms/page-sections/templates";

export type PreviewVariant = {
  key: string;
  label: string;
  livePath: string;
};

export type EditorPageNode = {
  id: string;
  label: string;
  livePath: string;
  status: "editable" | "soon" | "external" | "locked";
  kind: "single" | "template";
  pageKey?: string;
  defs?: SectionDef[];
  defaults?: Record<string, Record<string, string>>;
  uploadFolder?: string;
  revalidate?: string[];
  /** External CMS list path under admin, e.g. /cms/blog */
  externalPath?: string;
  children?: EditorPageNode[];
};

export const PAGE_TREE: EditorPageNode[] = [
  {
    id: "main",
    label: "หน้าหลัก",
    livePath: "/",
    status: "locked",
    kind: "single",
    children: [
      {
        id: "home",
        label: "หน้าแรก",
        livePath: "/",
        status: "editable",
        kind: "single",
        pageKey: "home",
        defs: HOME_SECTION_DEFS,
        defaults: HOME_SECTION_DEFAULTS,
        uploadFolder: "home-sections",
        revalidate: ["/"],
      },
      {
        id: "about",
        label: "เกี่ยวกับเรา",
        livePath: "/contact",
        status: "editable",
        kind: "single",
        pageKey: "about",
        defs: ABOUT_SECTION_DEFS,
        defaults: ABOUT_SECTION_DEFAULTS,
        uploadFolder: "about-sections",
        revalidate: ["/contact", "/about"],
      },
      {
        id: "contact",
        label: "เกี่ยวกับเรา · ติดต่อ",
        livePath: "/contact",
        status: "editable",
        kind: "single",
        pageKey: "contact",
        defs: CONTACT_SECTION_DEFS,
        defaults: CONTACT_SECTION_DEFAULTS,
        uploadFolder: "contact-sections",
        revalidate: ["/contact"],
      },
      {
        id: "quote",
        label: "ขอใบเสนอราคา",
        livePath: "/quote",
        status: "soon",
        kind: "single",
        pageKey: "quote",
        revalidate: ["/quote"],
      },
    ],
  },
  {
    id: "products",
    label: "สินค้า",
    livePath: "/products",
    status: "locked",
    kind: "single",
    children: [
      {
        id: "products.hub",
        label: "รวมสินค้า",
        livePath: "/products",
        status: "soon",
        kind: "single",
        pageKey: "productsHub",
        revalidate: ["/products"],
      },
      {
        id: "products.category",
        label: "หมวดสินค้า",
        livePath: "/products/[category]",
        status: "soon",
        kind: "template",
        pageKey: "category",
        revalidate: ["/products"],
      },
      {
        id: "products.detail",
        label: "หน้าสินค้า",
        livePath: "/products/[category]/[slug]",
        status: "editable",
        kind: "template",
        pageKey: PRODUCT_PAGE_KEY,
        defs: PRODUCT_SECTION_DEFS,
        defaults: PRODUCT_SECTION_DEFAULTS,
        uploadFolder: "product-sections",
        revalidate: ["/products"],
      },
    ],
  },
  {
    id: "content",
    label: "เนื้อหา",
    livePath: "/blog",
    status: "locked",
    kind: "single",
    children: [
      {
        id: "learn",
        label: "ห้องเรียนรู้",
        livePath: "/learn",
        status: "locked",
        kind: "single",
      },
      {
        id: "blog.index",
        label: "หน้ารวมบทความ",
        livePath: "/blog",
        status: "soon",
        kind: "single",
        pageKey: "blogIndex",
        revalidate: ["/blog"],
      },
      {
        id: "blog.post",
        label: "เทมเพลตบทความ",
        livePath: "/blog/[slug]",
        status: "editable",
        kind: "template",
        pageKey: "blogPost",
        defs: BLOG_POST_SECTION_DEFS,
        defaults: BLOG_POST_SECTION_DEFAULTS,
        uploadFolder: "blog-template",
        revalidate: ["/blog"],
      },
      {
        id: "portfolio.index",
        label: "หน้ารวมผลงาน",
        livePath: "/portfolio",
        status: "soon",
        kind: "single",
        pageKey: "portfolioIndex",
        revalidate: ["/portfolio"],
      },
      {
        id: "portfolio.item",
        label: "เทมเพลตผลงาน",
        livePath: "/portfolio/[slug]",
        status: "editable",
        kind: "template",
        pageKey: "portfolioItem",
        defs: PORTFOLIO_ITEM_SECTION_DEFS,
        defaults: PORTFOLIO_ITEM_SECTION_DEFAULTS,
        uploadFolder: "portfolio-template",
        revalidate: ["/portfolio"],
      },
      {
        id: "cms.blog",
        label: "จัดการบทความ",
        livePath: "/blog",
        status: "external",
        kind: "single",
        externalPath: "/cms/blog",
      },
      {
        id: "cms.portfolio",
        label: "จัดการผลงาน",
        livePath: "/portfolio",
        status: "external",
        kind: "single",
        externalPath: "/cms/portfolio",
      },
      {
        id: "cms.hero",
        label: "สไลด์หน้าแรก",
        livePath: "/",
        status: "external",
        kind: "single",
        externalPath: "/cms/hero-slides",
      },
      {
        id: "cms.reviews",
        label: "รีวิว",
        livePath: "/",
        status: "external",
        kind: "single",
        externalPath: "/cms/reviews",
      },
    ],
  },
  {
    id: "system",
    label: "ระบบ",
    livePath: "/404",
    status: "locked",
    kind: "single",
    children: [
      {
        id: "error.404",
        label: "404",
        livePath: "/missing",
        status: "locked",
        kind: "single",
      },
      {
        id: "error.500",
        label: "500",
        livePath: "/500",
        status: "locked",
        kind: "single",
      },
      {
        id: "legal.privacy",
        label: "นโยบายความเป็นส่วนตัว",
        livePath: "/privacy",
        status: "locked",
        kind: "single",
      },
    ],
  },
];

export function flattenPages(
  nodes: EditorPageNode[] = PAGE_TREE,
): EditorPageNode[] {
  const out: EditorPageNode[] = [];
  for (const node of nodes) {
    out.push(node);
    if (node.children?.length) out.push(...flattenPages(node.children));
  }
  return out;
}

export function findPage(id: string): EditorPageNode | null {
  return flattenPages().find((n) => n.id === id) ?? null;
}

export function getEditablePages(): EditorPageNode[] {
  return flattenPages().filter((n) => n.status === "editable" && n.pageKey);
}

export function resolveEditorPageId(segments: string[] | undefined): string {
  if (!segments?.length) return "home";
  return segments.join(".");
}

export function editorPathForPageId(pageId: string, basePath = "/admin"): string {
  const rest = pageId.replace(/\./g, "/");
  const prefix = basePath ? `${basePath}/editor` : "/editor";
  return `${prefix}/${rest}`;
}

export function isPageEditorEnabled(): boolean {
  const raw = process.env.NEXT_PUBLIC_PAGE_EDITOR_ENABLED;
  if (raw === "0" || raw === "false") return false;
  return true;
}
