"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Eye, Plus, Sparkles, Trash2 } from "lucide-react";
import {
  CONTENT_STATUS_LABELS,
  slugifyTh,
  type ContentStatus,
} from "@/lib/cms/content-status";
import {
  PRODUCT_OPTIONS,
  SPACE_TYPE_LABELS,
  emptyLineItem,
  emptyPortfolio,
  type PortfolioItem,
  type PortfolioLineItem,
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
  const [seoOpen, setSeoOpen] = useState(
    Boolean(initial.seoTitle || initial.seoDescription),
  );
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  function set<K extends keyof PortfolioItem>(key: K, value: PortfolioItem[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setLine(index: number, key: keyof PortfolioLineItem, value: string) {
    setForm((f) => {
      const lineItems = f.lineItems.map((row, i) =>
        i === index ? { ...row, [key]: value } : row,
      );
      return { ...f, lineItems };
    });
  }

  function addLine() {
    setForm((f) => ({ ...f, lineItems: [...f.lineItems, emptyLineItem()] }));
  }

  function removeLine(index: number) {
    setForm((f) => ({
      ...f,
      lineItems:
        f.lineItems.length <= 1
          ? [emptyLineItem()]
          : f.lineItems.filter((_, i) => i !== index),
    }));
  }

  function parseGallery() {
    return galleryText
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function buildDraft(): PortfolioItem {
    const gallery = parseGallery();
    const image = form.image.trim() || gallery[0] || "";
    return {
      ...form,
      title: form.title.trim(),
      place: form.place.trim(),
      slug: form.slug.trim() || slugifyTh(form.title) || "preview",
      summary: form.summary.trim(),
      detail: form.detail.trim(),
      customerName: form.customerName.trim(),
      installLocation: form.installLocation.trim(),
      installDate: form.installDate.trim(),
      internalNote: form.internalNote.trim(),
      image,
      gallery: gallery.length ? gallery : image ? [image] : [],
      tags: tagText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      lineItems: form.lineItems.map((r) => ({
        productName: r.productName.trim(),
        sku: r.sku.trim(),
        serialOrCode: r.serialOrCode.trim(),
        material: r.material.trim(),
        color: r.color.trim(),
        quantity: r.quantity.trim(),
        notes: r.notes.trim(),
      })),
    };
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.place.trim()) {
      alert("กรอกชื่อผลงานและที่ตั้งให้ครบ");
      return;
    }
    setSaving(true);
    const draft = buildDraft();
    const slug = draft.slug.trim() || slugifyTh(draft.title);
    upsertPortfolioItem({
      ...draft,
      slug,
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
          title={isCreate ? "ลงผลงานใหม่" : "แก้ไขผลงาน"}
          subtitle="เรียงตามลำดับ: ที่ตั้ง → สินค้า/SKU → รูป → ข้อความ → เผยแพร่"
          onPreview={() => setPreviewOpen(true)}
          previewHref={previewHref}
          sidebar={
            <>
              <SelectField
                label="สถานะ"
                value={form.status}
                onChange={(v) => set("status", v as ContentStatus)}
                options={(
                  Object.keys(CONTENT_STATUS_LABELS) as ContentStatus[]
                ).map((k) => ({
                  value: k,
                  label: CONTENT_STATUS_LABELS[k],
                }))}
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
                label="หมวดสินค้าหลัก *"
                value={form.productSlug}
                onChange={(v) => set("productSlug", v)}
                options={PRODUCT_OPTIONS}
              />
              <SelectField
                label="ประเภทสถานที่ *"
                value={form.spaceType}
                onChange={(v) => set("spaceType", v as SpaceType)}
                options={(Object.keys(SPACE_TYPE_LABELS) as SpaceType[]).map(
                  (k) => ({ value: k, label: SPACE_TYPE_LABELS[k] }),
                )}
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
                placeholder="sunscreen, คอนโด"
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
                  {isCreate ? "บันทึกผลงาน" : "บันทึก"}
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
          <div className="space-y-8">
            {/* 1 — Job identity */}
            <EditorSection
              step="1"
              title="งานใคร · ติดตั้งที่ไหน"
              hint="ข้อมูลนี้ช่วย SEO และให้เซลคุยต่อได้ทันที"
            >
              <Field
                label="ชื่อผลงาน *"
                value={form.title}
                onChange={(v) => {
                  set("title", v);
                  if (isCreate || !form.slug) set("slug", slugifyTh(v));
                }}
                placeholder="เช่น ผ้าม่านไฟฟ้า คอนโดสุขุมวิท"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="ที่ตั้ง / โซน *"
                  value={form.place}
                  onChange={(v) => set("place", v)}
                  placeholder="สุขุมวิท กรุงเทพฯ"
                  hint="ไม่ต้องใส่บ้านเลขที่ — โซนพอสำหรับหน้าเว็บ"
                />
                <Field
                  label="พิกัดหน้างาน (ละเอียด)"
                  value={form.installLocation}
                  onChange={(v) => set("installLocation", v)}
                  placeholder="ชั้น 12 ห้องนั่งเล่น บานสูง"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="ชื่อลูกค้า / โครงการ"
                  value={form.customerName}
                  onChange={(v) => set("customerName", v)}
                  placeholder="คุณเอ / โครงการ ABC"
                />
                <Field
                  label="วันที่ติดตั้ง"
                  value={form.installDate}
                  onChange={(v) => set("installDate", v)}
                  placeholder="2026-08-01 หรือ 2026-08"
                  hint="ใช้รูปแบบ YYYY-MM-DD หรือ YYYY-MM"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-navy">
                <input
                  type="checkbox"
                  checked={form.showCustomerName}
                  onChange={(e) => set("showCustomerName", e.target.checked)}
                />
                แสดงชื่อลูกค้าบนหน้าเว็บสาธารณะ
              </label>
            </EditorSection>

            {/* 2 — Line items */}
            <EditorSection
              step="2"
              title="สินค้าที่ใช้ · SKU · Serial"
              hint="เติมให้ครบ — เซลจะไม่ต้องถามสี/รุ่นซ้ำ"
            >
              <div className="space-y-4">
                {form.lineItems.map((row, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-line bg-white p-4"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-navy">
                        รายการที่ {index + 1}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeLine(index)}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted hover:bg-paper hover:text-brand-red"
                      >
                        <Trash2 className="size-3.5" />
                        ลบ
                      </button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field
                        label="ชื่อสินค้า *"
                        value={row.productName}
                        onChange={(v) => setLine(index, "productName", v)}
                        placeholder="ผ้าม่านไฟฟ้า S-Wave"
                      />
                      <Field
                        label="จำนวน"
                        value={row.quantity}
                        onChange={(v) => setLine(index, "quantity", v)}
                        placeholder="1 ชุด / 3 บาน"
                      />
                      <Field
                        label="วัสดุ / เนื้อผ้า"
                        value={row.material}
                        onChange={(v) => setLine(index, "material", v)}
                        placeholder="blackout + sheer"
                      />
                      <Field
                        label="สี / โทน"
                        value={row.color}
                        onChange={(v) => setLine(index, "color", v)}
                        placeholder="ครีม"
                      />
                      <Field
                        label="SKU"
                        value={row.sku}
                        onChange={(v) => setLine(index, "sku", v)}
                        placeholder="MT-CT-SW-01"
                      />
                      <Field
                        label="Serial / โค้ดสินค้า"
                        value={row.serialOrCode}
                        onChange={(v) => setLine(index, "serialOrCode", v)}
                        placeholder="SN-MT-77821"
                      />
                    </div>
                    <div className="mt-3">
                      <Field
                        label="หมายเหตุสำหรับเซล"
                        value={row.notes}
                        onChange={(v) => setLine(index, "notes", v)}
                        placeholder="รีโมท RF / ซ่อนกล่องฝ้า"
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addLine}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-navy/30 px-4 py-2.5 text-sm font-medium text-navy hover:bg-paper"
                >
                  <Plus className="size-4" />
                  เพิ่มรายการสินค้า
                </button>
              </div>
            </EditorSection>

            {/* 3 — Photos */}
            <EditorSection
              step="3"
              title="รูปหน้างาน"
              hint="รูปหลัก + แกลเลอรี — ลูกค้ากดดูภาพใหญ่ได้"
            >
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
                    ใส่ path รูปหลักด้านล่าง
                  </div>
                )}
              </div>
              <Field
                label="รูปหลัก (path หรือ URL) *"
                value={form.image}
                onChange={(v) => set("image", v)}
                hint="ภาพขายหลักของผลงาน"
              />
              <TextArea
                label="แกลเลอรี (หนึ่ง path ต่อบรรทัด)"
                value={galleryText}
                onChange={setGalleryText}
                rows={4}
                hint="รูปเพิ่มจากหน้างาน"
              />
            </EditorSection>

            {/* 4 — Copy + SEO */}
            <EditorSection
              step="4"
              title="ข้อความบนหน้าเว็บ"
              hint="สั้นชัด พอเล่างาน — สเปกสินค้าอยู่ในขั้นที่ 2 แล้ว"
            >
              <TextArea
                label="สรุปสั้น (การ์ด / SEO fallback)"
                value={form.summary}
                onChange={(v) => set("summary", v)}
                rows={2}
                hint="1–2 บรรทัด"
              />
              <TextArea
                label="รายละเอียดหน้างาน"
                value={form.detail}
                onChange={(v) => set("detail", v)}
                rows={5}
                hint="จุดเด่นหน้างาน ปัญหาที่แก้ วิธีติดตั้งสั้น ๆ"
              />
              <TextArea
                label="โน้ตภายในทีม (ไม่โชว์บนเว็บ)"
                value={form.internalNote}
                onChange={(v) => set("internalNote", v)}
                rows={2}
                hint="เช่น ลูกค้าสนใจต่อสมาร์ทโฮมเฟสถัดไป"
              />
              <div className="rounded-xl border border-line bg-paper/40 p-4">
                <button
                  type="button"
                  onClick={() => setSeoOpen((v) => !v)}
                  className="text-sm font-medium text-navy hover:underline"
                >
                  {seoOpen ? "ซ่อน SEO" : "SEO (แนะนำกรอก)"}
                </button>
                {seoOpen ? (
                  <div className="mt-3 space-y-3">
                    <Field
                      label="SEO title (ว่าง = ใช้ชื่อผลงาน)"
                      value={form.seoTitle ?? ""}
                      onChange={(v) => set("seoTitle", v)}
                      placeholder="ผ้าม่านไฟฟ้าคอนโดสุขุมวิท | ช่างตี๋"
                    />
                    <TextArea
                      label="SEO description (ว่าง = ใช้สรุปสั้น)"
                      value={form.seoDescription ?? ""}
                      onChange={(v) => set("seoDescription", v)}
                      rows={2}
                    />
                  </div>
                ) : null}
              </div>
            </EditorSection>
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

function EditorSection({
  step,
  title,
  hint,
  children,
}: {
  step: string;
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-shell/40 p-4 sm:p-5">
      <div className="mb-4 flex items-start gap-3 border-b border-line pb-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">
          {step}
        </span>
        <div>
          <h2 className="font-display text-base font-semibold text-navy">
            {title}
          </h2>
          <p className="mt-0.5 text-xs text-muted">{hint}</p>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
