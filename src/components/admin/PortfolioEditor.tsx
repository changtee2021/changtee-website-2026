"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Eye, Sparkles } from "lucide-react";
import {
  CONTENT_STATUS_LABELS,
  slugifyTh,
  type ContentStatus,
} from "@/lib/cms/content-status";
import {
  PRODUCT_OPTIONS,
  SPACE_TYPE_LABELS,
  emptyPortfolio,
  type PortfolioItem,
  type SpaceType,
} from "@/lib/cms/portfolio-demo";
import {
  upsertPortfolioItem,
  usePortfolioItems,
} from "@/lib/cms/demo-store";
import { relatedPortfolio } from "@/lib/cms/public-content";
import { adminBaseFromPathname, adminHref } from "@/lib/admin-nav";
import { CmsEditorShell } from "@/components/admin/cms/CmsEditorShell";
import { CmsSitePreview } from "@/components/admin/cms/CmsSitePreview";
import {
  Field,
  SelectField,
  TextArea,
} from "@/components/admin/cms/CmsShared";
import { PortfolioDetailView } from "@/components/portfolio/PortfolioDetailView";

function galleryToText(item: PortfolioItem) {
  return (item.gallery.length ? item.gallery : [item.image])
    .filter(Boolean)
    .join("\n");
}

export function PortfolioEditor({ id }: { id?: string }) {
  const isCreate = !id || id === "new";
  const items = usePortfolioItems();
  const newSeed = useMemo(() => emptyPortfolio(), []);
  const existing = !isCreate ? items.find((p) => p.id === id) : undefined;
  const initial = existing ?? (isCreate ? newSeed : { ...newSeed, id: id! });

  return (
    <PortfolioEditorForm
      key={
        existing
          ? `${existing.id}-${existing.updatedAt}`
          : isCreate
            ? newSeed.id
            : `pending-${id}`
      }
      initial={initial}
      isCreate={isCreate}
    />
  );
}

function PortfolioEditorForm({
  initial,
  isCreate,
}: {
  initial: PortfolioItem;
  isCreate: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const basePath = adminBaseFromPathname(pathname);
  const allItems = usePortfolioItems();
  const [form, setForm] = useState(initial);
  const [tagText, setTagText] = useState(initial.tags.join(", "));
  const [galleryText, setGalleryText] = useState(galleryToText(initial));
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  function set<K extends keyof PortfolioItem>(key: K, value: PortfolioItem[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function buildDraft(): PortfolioItem {
    const gallery = galleryText
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);
    const image = form.image.trim() || gallery[0] || "";
    return {
      ...form,
      title: form.title.trim(),
      place: form.place.trim(),
      slug: form.slug.trim() || slugifyTh(form.title) || "preview",
      summary: form.summary.trim(),
      detail: form.detail.trim(),
      image,
      gallery: gallery.length ? gallery : image ? [image] : [],
      tags: tagText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.place.trim()) {
      alert("กรอกชื่อผลงานและที่ตั้งให้ครบ");
      return;
    }
    setSaving(true);
    const slug = form.slug.trim() || slugifyTh(form.title);
    const gallery = galleryText
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);
    const image = form.image.trim() || gallery[0] || "";
    upsertPortfolioItem({
      ...form,
      title: form.title.trim(),
      place: form.place.trim(),
      slug,
      summary: form.summary.trim(),
      detail: form.detail.trim(),
      image,
      gallery: gallery.length ? gallery : image ? [image] : [],
      tags: tagText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      updatedAt: new Date().toISOString(),
    });
    router.push(adminHref(basePath, "/cms/portfolio"));
  }

  const listHref = adminHref(basePath, "/cms/portfolio");
  const aiHref = adminHref(basePath, "/cms/portfolio/new");
  const previewHref =
    form.slug && form.status === "published"
      ? `/portfolio/${form.slug}`
      : undefined;
  const draft = buildDraft();

  return (
    <>
    <form onSubmit={submit}>
      <CmsEditorShell
        backHref={listHref}
        backLabel="กลับรายการผลงาน"
        title={isCreate ? "ลงผลงาน (ฟอร์มเต็ม)" : "แก้ไขผลงาน"}
        subtitle={
          isCreate
            ? "ฟอร์มละเอียด — หรือใช้ตัวช่วย AI จากหน้าลงผลงานใหม่"
            : "รูปงานติดตั้งจริงก่อน — สรุปสั้นๆ พอ ไม่ต้องเขียนยาว"
        }
        onPreview={() => setPreviewOpen(true)}
        previewHref={previewHref}
        sidebar={
          <>
            <SelectField
              label="สถานะ"
              value={form.status}
              onChange={(v) => set("status", v as ContentStatus)}
              options={(Object.keys(CONTENT_STATUS_LABELS) as ContentStatus[]).map(
                (k) => ({ value: k, label: CONTENT_STATUS_LABELS[k] }),
              )}
            />
            <Field
              label="ลำดับแสดง"
              type="number"
              value={form.sortOrder}
              onChange={(v) => set("sortOrder", Number(v) || 0)}
            />
            <label className="flex items-center gap-2 text-sm text-navy">
              <input
                type="checkbox"
                checked={form.pinned}
                onChange={(e) => set("pinned", e.target.checked)}
              />
              ปักหมุดหน้าแรก
            </label>
            <div className="border-t border-line pt-4" />
            <SelectField
              label="ประเภทสินค้า *"
              value={form.productSlug}
              onChange={(v) => set("productSlug", v)}
              options={PRODUCT_OPTIONS}
            />
            <SelectField
              label="ประเภทลูกค้า / สถานที่ *"
              value={form.spaceType}
              onChange={(v) => set("spaceType", v as SpaceType)}
              options={(Object.keys(SPACE_TYPE_LABELS) as SpaceType[]).map(
                (k) => ({ value: k, label: SPACE_TYPE_LABELS[k] }),
              )}
            />
            <Field
              label="ที่ตั้ง *"
              value={form.place}
              onChange={(v) => set("place", v)}
              placeholder="พระราม 5 นนทบุรี"
              hint="ไม่ต้องใส่บ้านเลขที่ — โซนพอ"
            />
            <Field
              label="Slug (URL)"
              value={form.slug}
              onChange={(v) => set("slug", v)}
              hint={`/portfolio/${form.slug || "..."}`}
            />
            <Field
              label="แท็กเพิ่ม (คั่นด้วยจุลภาค)"
              value={tagText}
              onChange={setTagText}
              placeholder="sunscreen, ลอนเทป"
            />
            <div className="flex flex-col gap-2 border-t border-line pt-4">
              {isCreate ? (
                <Link
                  href={aiHref}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-brand-red/30 bg-brand-red/5 px-4 py-2.5 text-sm font-medium text-brand-red hover:bg-brand-red/10"
                >
                  <Sparkles className="size-4" />
                  ใช้ตัวช่วย AI แทน
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-navy/20 bg-paper px-4 py-2.5 text-sm font-medium text-navy hover:bg-white"
              >
                <Eye className="size-4" />
                ดูพรีวิว
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-navy px-4 py-2.5 text-sm font-medium text-white hover:bg-navy-deep disabled:opacity-60"
              >
                {isCreate ? "เพิ่มผลงาน" : "บันทึก"}
              </button>
              <button
                type="button"
                onClick={() => router.push(listHref)}
                className="rounded-xl border border-line px-4 py-2 text-sm text-navy hover:bg-paper"
              >
                ยกเลิก
              </button>
            </div>
          </>
        }
      >
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-dashed border-line bg-paper/50">
            {form.image ? (
              <div className="relative aspect-[16/9] bg-paper">
                <Image
                  src={form.image}
                  alt="cover"
                  fill
                  className="object-cover"
                  sizes="800px"
                />
              </div>
            ) : (
              <div className="flex aspect-[16/9] items-center justify-center text-sm text-muted">
                ใส่ path รูปหลักด้านล่าง — รอบถัดไปอัปโหลดไฟล์ได้
              </div>
            )}
          </div>

          <Field
            label="รูปหลัก (path หรือ URL) *"
            value={form.image}
            onChange={(v) => set("image", v)}
            hint="รูปหน้างาน / ช่างติดตั้ง — เป็นภาพขายหลักของผลงาน"
          />
          <TextArea
            label="แกลเลอรี (หนึ่ง path ต่อบรรทัด)"
            value={galleryText}
            onChange={setGalleryText}
            rows={3}
            hint="รูปเพิ่มจากหน้างาน — แสดงในหน้ารายละเอียด"
          />

          <Field
            label="ชื่อผลงาน *"
            value={form.title}
            onChange={(v) => {
              set("title", v);
              if (isCreate || !form.slug) set("slug", slugifyTh(v));
            }}
            placeholder="เช่น ผ้าม่านลอนเทป ห้องนั่งเล่น"
          />
          <TextArea
            label="สรุปสั้น (การ์ด)"
            value={form.summary}
            onChange={(v) => set("summary", v)}
            rows={2}
            hint="1–2 บรรทัด พอสำหรับการ์ดรายการ"
          />
          <TextArea
            label="รายละเอียดหน้างาน"
            value={form.detail}
            onChange={(v) => set("detail", v)}
            rows={5}
            hint="ผ้าอะไร / ชั้นผ้า / จุดเด่น — สั้นชัด ไม่ต้องเป็นบทความ"
          />
        </div>
      </CmsEditorShell>
    </form>

    <CmsSitePreview
      open={previewOpen}
      onClose={() => setPreviewOpen(false)}
      title={draft.title || "ผลงาน"}
      status={draft.status}
    >
      <PortfolioDetailView
        item={draft}
        related={relatedPortfolio(draft, allItems)}
        preview
      />
    </CmsSitePreview>
    </>
  );
}
