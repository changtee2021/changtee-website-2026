"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionDraftProvider } from "@/components/admin/cms/section-draft-context";
import { EditorCanvas } from "@/components/admin/editor/EditorCanvas";
import { PageEditorShell } from "@/components/admin/editor/PageEditorShell";
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

export function PageEditorApp({
  page,
  basePath,
  siteUrl,
}: {
  page: EditorPageNode;
  basePath: string;
  siteUrl: string;
}) {
  const [previewKey, setPreviewKey] = useState(
    () =>
      allProducts[0]
        ? `${allProducts[0].category.slug}/${allProducts[0].product.slug}`
        : "",
  );
  const [device, setDevice] = useState<DeviceKey>("desktop");

  useEffect(() => {
    if (page.pageKey) seedSectionsForPageKey(page.pageKey);
  }, [page.pageKey]);

  const livePath = useMemo(() => {
    if (page.pageKey === PRODUCT_PAGE_KEY) {
      return `/products/${previewKey}`;
    }
    return page.livePath.includes("[") ? "/" : page.livePath;
  }, [page.pageKey, page.livePath, previewKey]);

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

  const productToolbar =
    page.pageKey === PRODUCT_PAGE_KEY ? (
      <label className="hidden max-w-full items-center gap-2 text-sm md:flex">
        <span className="shrink-0 text-muted">พรีวิวด้วย</span>
        <select
          value={previewKey}
          onChange={(e) => setPreviewKey(e.target.value)}
          className="max-w-[200px] truncate rounded-full border border-line bg-white px-3 py-1.5 text-sm font-medium text-navy outline-none focus:border-navy/40"
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
    ) : null;

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
        toolbar={productToolbar}
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
