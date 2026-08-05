"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductSectionsVisualPreview } from "@/components/admin/cms/ProductSectionsVisualPreview";
import { SectionDraftProvider } from "@/components/admin/cms/section-draft-context";
import { VisualSectionEditorShell } from "@/components/admin/cms/VisualSectionEditorShell";
import { ensurePageSections } from "@/lib/cms/demo-store";
import { portfolioForProduct } from "@/lib/cms/public-content";
import {
  PRODUCT_PAGE_KEY,
  PRODUCT_SECTION_DEFAULTS,
  PRODUCT_SECTION_DEFS,
  seedProductSectionRecords,
} from "@/lib/cms/page-sections";
import {
  PRODUCT_PILLARS,
  productCatalog,
} from "@/lib/product-catalog";
import { getProductContent } from "@/lib/product-content";
import { getProductPresentation } from "@/lib/product-presentation";

/** Flat list of every sellable product for preview sampling */
const allProducts = productCatalog.flatMap((c) =>
  c.children.map((child) => ({
    category: c,
    product: child,
  })),
);

export function ProductPagesCmsBoard() {
  const [previewKey, setPreviewKey] = useState(
    () =>
      allProducts[0]
        ? `${allProducts[0].category.slug}/${allProducts[0].product.slug}`
        : "",
  );

  const preview = useMemo(
    () =>
      allProducts.find(
        (p) => `${p.category.slug}/${p.product.slug}` === previewKey,
      ) ?? allProducts[0],
    [previewKey],
  );

  useEffect(() => {
    ensurePageSections(seedProductSectionRecords());
  }, []);

  const presentation = useMemo(() => {
    if (!preview) return null;
    return getProductPresentation(
      preview.category.slug,
      preview.product.slug,
    );
  }, [preview]);

  const content = useMemo(() => {
    if (!preview) return null;
    return getProductContent(preview.category.slug, preview.product.slug);
  }, [preview]);

  const related = useMemo(() => {
    if (!preview) return [];
    return preview.category.children
      .filter((c) => c.slug !== preview.product.slug)
      .slice(0, 3);
  }, [preview]);

  const portfolioWorks = useMemo(() => {
    if (!preview) return [];
    return portfolioForProduct(
      preview.category.slug,
      preview.product.name,
      undefined,
      3,
    );
  }, [preview]);

  const pillar = preview
    ? PRODUCT_PILLARS.find((p) => p.id === preview.category.pillar)
    : undefined;

  const toolbar = (
    <label className="flex max-w-full items-center gap-2 text-sm">
      <span className="shrink-0 text-muted">พรีวิวด้วย</span>
      <select
        value={previewKey}
        onChange={(e) => setPreviewKey(e.target.value)}
        className="max-w-[220px] truncate rounded-full border border-line bg-white px-3 py-2 text-sm font-medium text-navy outline-none focus:border-navy/40 sm:max-w-xs"
      >
        {allProducts.map((p) => (
          <option
            key={`${p.category.slug}/${p.product.slug}`}
            value={`${p.category.slug}/${p.product.slug}`}
          >
            {p.category.name} · {p.product.name}
          </option>
        ))}
      </select>
    </label>
  );

  if (!presentation || !preview || !content) {
    return (
      <div className="rounded-2xl border border-line bg-white p-6 text-sm text-muted">
        ไม่พบสินค้าในแคตตาล็อก
      </div>
    );
  }

  return (
    <SectionDraftProvider
      key={PRODUCT_PAGE_KEY}
      pageKey={PRODUCT_PAGE_KEY}
      defs={PRODUCT_SECTION_DEFS}
      defaults={PRODUCT_SECTION_DEFAULTS}
    >
      <VisualSectionEditorShell
        title="หน้าสินค้า — แก้จากพรีวิว"
        description="พรีวิวเหมือนหน้าจริงทั้งหน้า — จุดที่มีกรอบแก้ได้ / จุดล็อกแก้ไม่ได้ · ข้อความที่แก้ใช้กับสินค้าทุกตัว"
        uploadFolder="product-sections"
        toolbar={toolbar}
      >
        <ProductSectionsVisualPreview
          category={preview.category}
          product={preview.product}
          pillar={pillar}
          content={content}
          presentation={presentation}
          related={related}
          portfolioWorks={portfolioWorks}
        />
      </VisualSectionEditorShell>
    </SectionDraftProvider>
  );
}
