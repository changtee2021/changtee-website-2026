"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { SectionDraftProvider } from "@/components/admin/cms/section-draft-context";
import { EditorCanvas } from "@/components/admin/editor/EditorCanvas";
import { PageEditorShell } from "@/components/admin/editor/PageEditorShell";
import { DEMO_BLOG } from "@/lib/cms/blog-demo";
import { DEMO_PORTFOLIO } from "@/lib/cms/portfolio-demo";
import { PRODUCT_PAGE_KEY } from "@/lib/cms/page-sections";
import type { DeviceKey } from "@/lib/editor/protocol";
import type { EditorPageNode } from "@/lib/editor/page-registry";
import { seedSectionsForPageKey } from "@/lib/editor/seed-page-sections";
import { productCatalog } from "@/lib/product-catalog";

const allProducts = productCatalog.flatMap((c) =>
  c.children.map((child) => ({
    category: c,
    product: child,
  })),
);

const publishedBlogSlugs = DEMO_BLOG.filter(
  (p) => p.status === "published" && p.slug,
).map((p) => ({ slug: p.slug, title: p.title }));

const publishedPortfolioSlugs = DEMO_PORTFOLIO.filter(
  (p) => p.status === "published" && p.slug,
).map((p) => ({ slug: p.slug, title: p.title }));

function PreviewSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  options: { value: string; label: string }[];
}) {
  if (options.length === 0) return null;
  return (
    <label className="hidden max-w-full items-center gap-2 text-sm md:flex">
      <span className="shrink-0 text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="max-w-[220px] truncate rounded-full border border-line bg-white px-3 py-1.5 text-sm font-medium text-navy outline-none focus:border-navy/40"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function PageEditorApp({
  page,
  basePath,
  siteUrl,
}: {
  page: EditorPageNode;
  basePath: string;
  siteUrl: string;
}) {
  const [productKey, setProductKey] = useState(
    () =>
      allProducts[0]
        ? `${allProducts[0].category.slug}/${allProducts[0].product.slug}`
        : "",
  );
  const [blogSlug, setBlogSlug] = useState(
    () => publishedBlogSlugs[0]?.slug ?? "",
  );
  const [portfolioSlug, setPortfolioSlug] = useState(
    () => publishedPortfolioSlugs[0]?.slug ?? "",
  );
  const [device, setDevice] = useState<DeviceKey>("desktop");

  useEffect(() => {
    if (page.pageKey) seedSectionsForPageKey(page.pageKey);
  }, [page.pageKey]);

  const livePath = useMemo(() => {
    if (page.pageKey === PRODUCT_PAGE_KEY && productKey) {
      return `/products/${productKey}`;
    }
    if (page.pageKey === "blogPost" && blogSlug) {
      return `/blog/${blogSlug}`;
    }
    if (page.pageKey === "portfolioItem" && portfolioSlug) {
      return `/portfolio/${portfolioSlug}`;
    }
    if (page.livePath.includes("[")) {
      return "/";
    }
    return page.livePath;
  }, [
    page.pageKey,
    page.livePath,
    productKey,
    blogSlug,
    portfolioSlug,
  ]);

  if (page.status !== "editable" || !page.pageKey || !page.defs || !page.defaults) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center gap-3 bg-[#eef2f7] p-6 text-center">
        <p className="font-display text-lg font-semibold text-navy">
          {page.label}
        </p>
        <p className="max-w-md text-sm text-muted">
          {page.status === "soon"
            ? "หน้านี้อยู่ในแผน — ยังไม่มีจุดแก้ไขในระบบ"
            : page.status === "external"
              ? "หน้านี้แก้ผ่านรายการคอนเทนต์ ใช้ลิงก์ในผังเว็บ"
              : "หน้านี้ยังแก้ไขใน Page Editor ไม่ได้"}
        </p>
        <a
          href={basePath || "/admin"}
          className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white"
        >
          กลับหลังบ้าน
        </a>
      </div>
    );
  }

  let toolbar: ReactNode = null;
  if (page.pageKey === PRODUCT_PAGE_KEY) {
    toolbar = (
      <PreviewSelect
        label="พรีวิวด้วย"
        value={productKey}
        onChange={setProductKey}
        options={allProducts.map((p) => ({
          value: `${p.category.slug}/${p.product.slug}`,
          label: `${p.category.name} · ${p.product.name}`,
        }))}
      />
    );
  } else if (page.pageKey === "blogPost") {
    toolbar = (
      <PreviewSelect
        label="พรีวิวด้วย"
        value={blogSlug}
        onChange={setBlogSlug}
        options={publishedBlogSlugs.map((p) => ({
          value: p.slug,
          label: p.title,
        }))}
      />
    );
  } else if (page.pageKey === "portfolioItem") {
    toolbar = (
      <PreviewSelect
        label="พรีวิวด้วย"
        value={portfolioSlug}
        onChange={setPortfolioSlug}
        options={publishedPortfolioSlugs.map((p) => ({
          value: p.slug,
          label: p.title,
        }))}
      />
    );
  }

  return (
    <SectionDraftProvider
      key={page.pageKey}
      pageKey={page.pageKey}
      defs={page.defs}
      defaults={page.defaults}
    >
      <PageEditorShell
        page={page}
        basePath={basePath}
        siteUrl={siteUrl}
        toolbar={toolbar}
        device={device}
        onDeviceChange={setDevice}
      >
        <EditorCanvas
          key={`${page.pageKey}::${livePath}`}
          siteUrl={siteUrl}
          livePath={livePath}
          pageKey={page.pageKey}
          device={device}
        />
      </PageEditorShell>
    </SectionDraftProvider>
  );
}
