"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import {
  CONTENT_STATUS_LABELS,
  type ContentStatus,
} from "@/lib/cms/content-status";
import {
  emptyHeroSlide,
  type HeroSlide,
} from "@/lib/cms/hero-slides-demo";
import { upsertHeroSlide, useHeroSlides } from "@/lib/cms/demo-store";
import { adminBaseFromPathname, adminHref } from "@/lib/admin-nav";
import { CmsEditorShell } from "@/components/admin/cms/CmsEditorShell";
import { CmsSitePreview } from "@/components/admin/cms/CmsSitePreview";
import { CmsImageUpload } from "@/components/admin/cms/CmsImageUpload";
import { CmsLinkPicker } from "@/components/admin/cms/CmsLinkPicker";
import { Field, SelectField } from "@/components/admin/cms/CmsShared";
import { HeroSlider } from "@/components/home/HeroSlider";

export function HeroSlideEditor({ id }: { id?: string }) {
  const isCreate = !id || id === "new";
  const slides = useHeroSlides();
  const newSeed = useMemo(() => emptyHeroSlide(), []);
  const existing = !isCreate ? slides.find((p) => p.id === id) : undefined;
  const initial = existing ?? (isCreate ? newSeed : { ...newSeed, id: id! });

  return (
    <HeroSlideEditorForm
      key={
        existing
          ? `${existing.id}-${existing.updatedAt}`
          : isCreate
            ? newSeed.id
            : `pending-${id}`
      }
      initial={initial}
      isCreate={isCreate}
      allSlides={slides}
    />
  );
}

function HeroSlideEditorForm({
  initial,
  isCreate,
  allSlides,
}: {
  initial: HeroSlide;
  isCreate: boolean;
  allSlides: HeroSlide[];
}) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const basePath = adminBaseFromPathname(pathname);
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  function set<K extends keyof HeroSlide>(key: K, value: HeroSlide[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.src.trim()) {
      alert("อัปโหลดรูปสไลด์ก่อนบันทึก");
      return;
    }
    setSaving(true);
    upsertHeroSlide({
      ...form,
      src: form.src.trim(),
      alt: form.alt.trim() || form.title.trim() || form.subtitle.trim(),
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      price: form.price.trim(),
      badge: form.badge.trim(),
      href: form.href.trim() || "/products",
      updatedAt: new Date().toISOString(),
    });
    router.push(adminHref(basePath, "/cms/hero-slides"));
  }

  const listHref = adminHref(basePath, "/cms/hero-slides");

  const previewSlides = useMemo(() => {
    const draft: HeroSlide = {
      ...form,
      src: form.src.trim() || "/images/banners/hero-1.png",
      href: form.href.trim() || "/products",
      status: "published",
    };
    const others = allSlides.filter(
      (s) => s.id !== draft.id && s.status === "published",
    );
    return [draft, ...others].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [form, allSlides]);

  return (
    <>
      <form onSubmit={submit}>
        <CmsEditorShell
          backHref={listHref}
          backLabel="กลับรายการสไลด์"
          title={isCreate ? "เพิ่มสไลด์หน้าแรก" : "แก้ไขสไลด์หน้าแรก"}
          subtitle="อัปโหลดรูปแบนเนอร์ · เลือกลิงก์หน้าเว็บหรือใส่ URL เอง"
          onPreview={() => setPreviewOpen(true)}
          previewHref="/"
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
                hint="หรือลากเรียงในหน้ารายการ"
              />
              <CmsLinkPicker
                value={form.href}
                onChange={(href) => set("href", href)}
              />
              <div className="flex flex-col gap-2 border-t border-line pt-4">
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
                  {isCreate ? "เพิ่มสไลด์" : "บันทึก"}
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
            <CmsImageUpload
              value={form.src}
              folder="hero"
              aspectClassName="aspect-[16/9]"
              onChange={(url) => set("src", url)}
            />
            <Field
              label="ข้อความ alt (เข้าถึงได้)"
              value={form.alt}
              onChange={(v) => set("alt", v)}
              placeholder="ม่านม้วน ช่างตี๋ — เริ่มต้น 550฿"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="หัวข้อ (EN)"
                value={form.title}
                onChange={(v) => set("title", v)}
                placeholder="ROLLER BLIND"
              />
              <Field
                label="หัวข้อย่อย (TH)"
                value={form.subtitle}
                onChange={(v) => set("subtitle", v)}
                placeholder="ม่านม้วน"
              />
              <Field
                label="ราคา / ข้อความราคา"
                value={form.price}
                onChange={(v) => set("price", v)}
                placeholder="เริ่มต้น 550฿ ตร.เมตร"
              />
              <Field
                label="ป้าย (badge)"
                value={form.badge}
                onChange={(v) => set("badge", v)}
                placeholder="บริการ วัดหน้างาน ฟรี!!"
              />
            </div>
          </div>
        </CmsEditorShell>
      </form>

      <CmsSitePreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={form.title || form.subtitle || "สไลด์หน้าแรก"}
        status={form.status}
      >
        <HeroSlider slides={previewSlides} />
      </CmsSitePreview>
    </>
  );
}
