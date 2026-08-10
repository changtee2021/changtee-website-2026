"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  FileUp,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import {
  CONTENT_STATUS_LABELS,
  type ContentStatus,
} from "@/lib/cms/content-status";
import {
  emptyCatalog,
  type CatalogItem,
} from "@/lib/cms/catalogs-demo";
import { convertPdfCatalog } from "@/lib/cms/convert-catalog-pdf";
import {
  removeCatalog,
  upsertCatalog,
  useCatalogs,
} from "@/lib/cms/demo-store";
import { productCatalog } from "@/lib/product-catalog";
import { cn } from "@/lib/utils";
import {
  DemoBadge,
  Field,
  SelectField,
  StatPill,
  StatusBadge,
  TextArea,
} from "@/components/admin/cms/CmsShared";

async function uploadBlob(
  blob: Blob,
  fileName: string,
  folder: string,
): Promise<string> {
  const body = new FormData();
  body.set("file", new File([blob], fileName, { type: blob.type || "application/octet-stream" }));
  body.set("folder", folder);
  const res = await fetch("/api/admin/uploads", {
    method: "POST",
    body,
    credentials: "include",
  });
  const data = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !data.url) throw new Error(data.error || "อัปโหลดไม่สำเร็จ");
  return data.url;
}

export function CatalogsCmsBoard() {
  const catalogs = useCatalogs();
  const [toast, setToast] = useState<string | null>(null);
  const [editing, setEditing] = useState<CatalogItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const ordered = useMemo(
    () => [...catalogs].sort((a, b) => a.sortOrder - b.sortOrder),
    [catalogs],
  );

  const counts = useMemo(() => {
    const c = { all: catalogs.length, published: 0, draft: 0, hidden: 0 };
    for (const item of catalogs) c[item.status] += 1;
    return c;
  }, [catalogs]);

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  }

  function patch(partial: Partial<CatalogItem>) {
    if (!editing) return;
    setEditing({ ...editing, ...partial, updatedAt: new Date().toISOString() });
  }

  function saveEditing() {
    if (!editing) return;
    if (!editing.title.trim()) {
      flash("ใส่ชื่อแคตตาล็อกก่อน");
      return;
    }
    if (!editing.href || !editing.manifestUrl) {
      flash("อัปโหลด PDF ก่อนบันทึก — เพื่อสร้างภาพอ่านออนไลน์และไฟล์ดาวน์โหลด");
      return;
    }
    upsertCatalog({
      ...editing,
      productHref:
        editing.productHref ||
        (editing.productSlug
          ? `/products/${editing.categorySlug}/${editing.productSlug}`
          : `/products/${editing.categorySlug}`),
      updatedAt: new Date().toISOString(),
    });
    setEditing(null);
    flash("บันทึกแคตตาล็อกแล้ว");
  }

  async function onPickPdf(file: File | undefined) {
    if (!file || !editing) return;
    setBusy(true);
    setProgress("กำลังแปลง PDF เป็นภาพ...");
    try {
      const converted = await convertPdfCatalog(file, (done, total) => {
        setProgress(`แปลงหน้า ${done}/${total}...`);
      });

      const folder = `catalogs/${editing.id}`;
      setProgress("กำลังอัปโหลดหน้าภาพ...");
      const pageUrls: Array<{ file: string; width: number; height: number }> = [];
      for (let i = 0; i < converted.pages.length; i++) {
        const page = converted.pages[i]!;
        setProgress(`อัปโหลดภาพหน้า ${i + 1}/${converted.pages.length}...`);
        const url = await uploadBlob(page.blob, page.fileName, folder);
        pageUrls.push({ file: url, width: page.width, height: page.height });
      }

      setProgress("กำลังอัปโหลดไฟล์ดาวน์โหลด PDF...");
      const pdfUrl = await uploadBlob(
        converted.pdfBlob,
        `${editing.id}.pdf`,
        folder,
      );
      const coverUrl = await uploadBlob(
        converted.coverBlob,
        `${editing.id}-cover.jpg`,
        folder,
      );

      const manifest = {
        numPages: converted.numPages,
        pages: pageUrls,
      };
      const manifestBlob = new Blob([JSON.stringify(manifest)], {
        type: "application/json",
      });
      const manifestUrl = await uploadJson(manifestBlob, "manifest.json", folder);

      setEditing({
        ...editing,
        href: pdfUrl,
        coverImage: coverUrl,
        manifestUrl,
        updatedAt: new Date().toISOString(),
      });
      flash(`แปลงสำเร็จ ${converted.numPages} หน้า — กดบันทึกเพื่อเผยแพร่`);
    } catch (e) {
      console.error(e);
      flash(e instanceof Error ? e.message : "แปลง/อัปโหลดไม่สำเร็จ");
    } finally {
      setBusy(false);
      setProgress(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-navy sm:text-2xl">
              แคตตาล็อกสินค้า
            </h2>
            <p className="mt-1 text-sm text-muted">
              อัปโหลด PDF แล้วระบบแปลงเป็นภาพให้อ่านออนไลน์ลื่นๆ — ลูกค้ากดดาวน์โหลดได้เป็น PDF
              <span className="ml-1">
                <DemoBadge />
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const next = emptyCatalog();
              next.sortOrder = ordered.length + 1;
              setEditing(next);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-deep"
          >
            <Plus className="size-4" />
            เพิ่มแคตตาล็อก
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <StatPill label="ทั้งหมด" value={counts.all} />
          <StatPill label="เผยแพร่" value={counts.published} />
          <StatPill label="ร่าง" value={counts.draft} />
          <StatPill label="ซ่อน" value={counts.hidden} />
        </div>
      </section>

      <section className="space-y-3">
        {ordered.map((item) => (
          <article
            key={item.id}
            className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-white p-4 shadow-sm"
          >
            <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-line/40">
              {item.coverImage ? (
                <Image
                  src={item.coverImage}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="112px"
                  unoptimized={item.coverImage.startsWith("http")}
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-navy">{item.title || "(ไม่มีชื่อ)"}</h3>
                <StatusBadge status={item.status} />
              </div>
              <p className="mt-0.5 truncate text-sm text-muted">{item.titleEn}</p>
              <p className="mt-1 text-xs text-muted">
                {item.manifestUrl ? "พร้อมอ่านออนไลน์ (ภาพ)" : "ยังไม่แปลงภาพ"}
                {item.href ? " · มีไฟล์ดาวน์โหลด PDF" : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditing(item)}
                className="rounded-xl border border-line px-3 py-2 text-sm text-navy hover:bg-paper"
              >
                แก้ไข
              </button>
              <button
                type="button"
                onClick={() => {
                  removeCatalog(item.id);
                  flash("ลบแล้ว");
                }}
                className="rounded-xl border border-line p-2 text-muted hover:border-brand-red hover:text-brand-red"
                aria-label="ลบ"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </article>
        ))}
        {ordered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line bg-white p-8 text-center text-sm text-muted">
            ยังไม่มีแคตตาล็อก — กดเพิ่มแล้วอัปโหลด PDF ได้เลย
          </p>
        ) : null}
      </section>

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy/50 p-3 sm:items-center">
          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-6">
            <h3 className="font-display text-lg font-semibold text-navy">
              {editing.title ? `แก้ไข · ${editing.title}` : "แคตตาล็อกใหม่"}
            </h3>

            <div className="mt-4 space-y-3">
              <Field
                label="ชื่อไทย"
                value={editing.title}
                onChange={(v) => patch({ title: v })}
              />
              <Field
                label="ชื่ออังกฤษ"
                value={editing.titleEn}
                onChange={(v) => patch({ titleEn: v })}
              />
              <TextArea
                label="คำอธิบาย"
                value={editing.description}
                onChange={(v) => patch({ description: v })}
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <SelectField
                  label="หมวดสินค้า"
                  value={editing.categorySlug}
                  onChange={(v) =>
                    patch({
                      categorySlug: v,
                      productSlug: "",
                      productHref: `/products/${v}`,
                    })
                  }
                  options={productCatalog.map((c) => ({
                    value: c.slug,
                    label: c.name,
                  }))}
                />
                <SelectField
                  label="สินค้า (ถ้ามี)"
                  value={editing.productSlug ?? ""}
                  onChange={(v) =>
                    patch({
                      productSlug: v || undefined,
                      productHref: v
                        ? `/products/${editing.categorySlug}/${v}`
                        : `/products/${editing.categorySlug}`,
                    })
                  }
                  options={[
                    { value: "", label: "— ทั้งหมวด —" },
                    ...(productCatalog
                      .find((c) => c.slug === editing.categorySlug)
                      ?.children.map((ch) => ({
                        value: ch.slug,
                        label: ch.name,
                      })) ?? []),
                  ]}
                />
              </div>

              <SelectField
                label="สถานะ"
                value={editing.status}
                onChange={(v) => patch({ status: v as ContentStatus })}
                options={(Object.keys(CONTENT_STATUS_LABELS) as ContentStatus[]).map(
                  (s) => ({ value: s, label: CONTENT_STATUS_LABELS[s] }),
                )}
              />

              <div className="rounded-xl border border-dashed border-line bg-paper p-4">
                <p className="text-sm font-medium text-navy">อัปโหลด PDF แคตตาล็อก</p>
                <p className="mt-1 text-xs text-muted">
                  ระบบจะแปลงแต่ละหน้าเป็นภาพสำหรับเปิดดูออนไลน์ และสร้าง PDF บีบอัดสำหรับดาวน์โหลด
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(e) => void onPickPdf(e.target.files?.[0])}
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => fileRef.current?.click()}
                  className={cn(
                    "mt-3 inline-flex items-center gap-2 rounded-xl bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red-soft disabled:opacity-60",
                  )}
                >
                  {busy ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <FileUp className="size-4" />
                  )}
                  {busy ? progress || "กำลังทำงาน..." : "เลือกไฟล์ PDF"}
                </button>
                {editing.href ? (
                  <p className="mt-2 break-all text-xs text-muted">
                    PDF: {editing.href}
                    <br />
                    Manifest: {editing.manifestUrl}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => setEditing(null)}
                className="rounded-xl border border-line px-4 py-2 text-sm text-navy hover:bg-paper"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={saveEditing}
                className="rounded-xl bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-deep disabled:opacity-60"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-navy px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

async function uploadJson(
  blob: Blob,
  fileName: string,
  folder: string,
): Promise<string> {
  const body = new FormData();
  body.set(
    "file",
    new File([blob], fileName, { type: "application/json" }),
  );
  body.set("folder", folder);
  const res = await fetch("/api/admin/uploads", {
    method: "POST",
    body,
    credentials: "include",
  });
  const data = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !data.url) throw new Error(data.error || "อัปโหลด manifest ไม่สำเร็จ");
  return data.url;
}
