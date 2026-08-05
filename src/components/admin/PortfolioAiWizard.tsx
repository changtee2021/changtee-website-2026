"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  ImagePlus,
  Loader2,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import {
  CONTENT_STATUS_LABELS,
  type ContentStatus,
} from "@/lib/cms/content-status";
import {
  MOCK_PORTFOLIO_IMAGES,
  PORTFOLIO_PATTERNS,
  TH_PROVINCES,
  emptyJobFacts,
  generatePortfolioDraft,
  patternLabel,
  variantOptions,
  type PortfolioDraftImage,
  type PortfolioDraftTone,
  type PortfolioImageRole,
  type PortfolioJobFacts,
  type PortfolioPatternId,
} from "@/lib/cms/portfolio-ai-draft";
import {
  PRODUCT_OPTIONS,
  SPACE_TYPE_LABELS,
  type PortfolioItem,
  type SpaceType,
} from "@/lib/cms/portfolio-demo";
import {
  upsertPortfolioItem,
  usePortfolioItems,
} from "@/lib/cms/demo-store";
import { relatedPortfolio } from "@/lib/cms/public-content";
import { adminBaseFromPathname, adminHref } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";
import {
  DemoBadge,
  Field,
  SelectField,
  TextArea,
} from "@/components/admin/cms/CmsShared";
import { CmsSitePreview } from "@/components/admin/cms/CmsSitePreview";
import { PortfolioDetailView } from "@/components/portfolio/PortfolioDetailView";

type Step = 1 | 2 | 3 | 4;

const STEPS: { n: Step; label: string }[] = [
  { n: 1, label: "แพทเทิร์น" },
  { n: 2, label: "ข้อมูล + รูป" },
  { n: 3, label: "ร่าง AI" },
  { n: 4, label: "ยืนยัน" },
];

function newImage(url: string, role: PortfolioImageRole = "gallery"): PortfolioDraftImage {
  return { id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, url, role };
}

export function PortfolioAiWizard() {
  const router = useRouter();
  const pathname = usePathname() || "";
  const basePath = adminBaseFromPathname(pathname);
  const allItems = usePortfolioItems();
  const listHref = adminHref(basePath, "/cms/portfolio");
  const manualHref = adminHref(basePath, "/cms/portfolio/new?mode=manual");

  const [step, setStep] = useState<Step>(1);
  const [facts, setFacts] = useState<PortfolioJobFacts>(() => emptyJobFacts());
  const [draft, setDraft] = useState<PortfolioItem | null>(null);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishStatus, setPublishStatus] = useState<ContentStatus>("draft");
  const [pinned, setPinned] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const variants = useMemo(
    () => variantOptions(facts.productSlug),
    [facts.productSlug],
  );

  function patchFacts(partial: Partial<PortfolioJobFacts>) {
    setFacts((f) => ({ ...f, ...partial }));
  }

  function setImages(images: PortfolioDraftImage[]) {
    patchFacts({ images });
  }

  function updateImage(id: string, partial: Partial<PortfolioDraftImage>) {
    setImages(
      facts.images.map((img) => (img.id === id ? { ...img, ...partial } : img)),
    );
  }

  function removeImage(id: string) {
    setImages(facts.images.filter((img) => img.id !== id));
  }

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (!list.length) return;
    setUploadError(null);
    setUploading(true);
    const added: PortfolioDraftImage[] = [];
    try {
      for (const file of list) {
        const body = new FormData();
        body.set("file", file);
        body.set("folder", "portfolio");
        const res = await fetch("/api/admin/uploads", {
          method: "POST",
          body,
          credentials: "include",
        });
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !data.url) {
          throw new Error(data.error || "อัปโหลดไม่สำเร็จ");
        }
        const role: PortfolioImageRole =
          facts.images.length + added.length === 0 ? "cover" : "gallery";
        added.push(newImage(data.url, role));
      }
      setImages([...facts.images, ...added]);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function addMockImage(url: string) {
    const role: PortfolioImageRole =
      facts.images.length === 0 ? "cover" : "gallery";
    setImages([...facts.images, newImage(url, role)]);
  }

  function validateStep2(): string | null {
    if (!facts.province.trim()) return "เลือกจังหวัด";
    if (!facts.productSlug) return "เลือกสินค้า";
    if (!facts.installDate) return "ใส่วันที่ติดตั้ง";
    if (facts.images.length === 0) return "อัปโหลดหรือเลือกรูปอย่างน้อย 1 รูป";
    if (facts.patternId === "before-after") {
      const hasBefore = facts.images.some((i) => i.role === "before");
      const hasAfter = facts.images.some((i) => i.role === "after");
      if (!hasBefore || !hasAfter) {
        return "แพทเทิร์น Before/After ต้องติดป้ายรูปอย่างน้อย 1 ก่อน และ 1 หลัง";
      }
    }
    return null;
  }

  async function runGenerate() {
    const err = validateStep2();
    if (err) {
      alert(err);
      return;
    }
    setGenerating(true);
    // Small delay so the UI feels like “AI working” in demo mode
    await new Promise((r) => window.setTimeout(r, 450));
    const next = generatePortfolioDraft(facts, {
      id: draft?.id,
      status: publishStatus,
      pinned,
    });
    setDraft(next);
    setGenerating(false);
    setStep(3);
  }

  function confirmPublish() {
    if (!draft) return;
    if (!draft.title.trim() || !draft.place.trim()) {
      alert("ชื่อผลงานและที่ตั้งต้องมี");
      return;
    }
    setSaving(true);
    upsertPortfolioItem({
      ...draft,
      status: publishStatus,
      pinned,
      updatedAt: new Date().toISOString(),
    });
    router.push(listHref);
  }

  const related = draft ? relatedPortfolio(draft, allItems) : [];

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={listHref}
            className="inline-flex items-center gap-1 text-sm text-muted hover:text-navy"
          >
            <ArrowLeft className="size-4" />
            กลับรายการผลงาน
          </Link>
          <h1 className="mt-2 font-display text-xl font-semibold text-navy sm:text-2xl">
            ลงผลงานด้วยตัวช่วย AI
          </h1>
          <p className="mt-1 text-sm text-muted">
            เลือกรูปแบบ → ใส่ข้อเท็จจริง + รูป → ให้ระบบจัดเนื้อหา → ยืนยันก่อนลง{" "}
            <DemoBadge>demo — จัดเนื้อหาแบบเทมเพลต (ยังไม่ต่อ LLM)</DemoBadge>
          </p>
        </div>
        <Link
          href={manualHref}
          className="rounded-xl border border-line px-3 py-2 text-sm text-navy hover:bg-paper"
        >
          ใช้ฟอร์มเต็มแทน
        </Link>
      </div>

      <ol className="flex flex-wrap gap-2">
        {STEPS.map((s) => (
          <li key={s.n}>
            <button
              type="button"
              onClick={() => {
                if (s.n < step || (s.n === 3 && draft) || s.n === step) {
                  setStep(s.n);
                }
              }}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium sm:text-sm",
                step === s.n
                  ? "border-navy bg-navy text-white"
                  : step > s.n
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-line bg-white text-muted",
              )}
            >
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full text-[11px]",
                  step === s.n
                    ? "bg-white/20"
                    : step > s.n
                      ? "bg-emerald-200 text-emerald-900"
                      : "bg-paper",
                )}
              >
                {step > s.n ? <Check className="size-3" /> : s.n}
              </span>
              {s.label}
            </button>
          </li>
        ))}
      </ol>

      {step === 1 ? (
        <section className="space-y-4 rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6">
          <h2 className="font-display text-lg font-semibold text-navy">
            เลือกแพทเทิร์นเลย์เอาต์
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {PORTFOLIO_PATTERNS.map((p) => {
              const active = facts.patternId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => patchFacts({ patternId: p.id })}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition",
                    active
                      ? "border-navy bg-navy/[0.04] ring-2 ring-navy/20"
                      : "border-line hover:border-navy/30",
                  )}
                >
                  <PatternSketch id={p.id} active={active} />
                  <div className="mt-3 font-display font-semibold text-navy">
                    {p.name}
                  </div>
                  <p className="mt-1 text-sm text-muted">{p.description}</p>
                  <p className="mt-2 text-[11px] text-brand-red">เหมาะกับ: {p.bestFor}</p>
                </button>
              );
            })}
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-4 py-2.5 text-sm font-medium text-white hover:bg-navy-deep"
            >
              ถัดไป
              <ArrowRight className="size-4" />
            </button>
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="space-y-5 rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6">
          <div>
            <h2 className="font-display text-lg font-semibold text-navy">
              ข้อเท็จจริงหน้างาน + รูป
            </h2>
            <p className="mt-1 text-sm text-muted">
              แพทเทิร์น: {patternLabel(facts.patternId)} — AI จะไม่แต่งข้อมูลที่คุณไม่ได้ใส่
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="จังหวัด *"
              value={facts.province}
              onChange={(v) => patchFacts({ province: v })}
              options={TH_PROVINCES.map((p) => ({ value: p, label: p }))}
            />
            <Field
              label="อำเภอ / ย่าน"
              value={facts.district}
              onChange={(v) => patchFacts({ district: v })}
              placeholder="ลาดกระบัง / พระราม 5"
            />
            <SelectField
              label="ประเภทพื้นที่ *"
              value={facts.spaceType}
              onChange={(v) => patchFacts({ spaceType: v as SpaceType })}
              options={(Object.keys(SPACE_TYPE_LABELS) as SpaceType[]).map(
                (k) => ({ value: k, label: SPACE_TYPE_LABELS[k] }),
              )}
            />
            <Field
              label="วันที่ติดตั้ง *"
              type="date"
              value={facts.installDate}
              onChange={(v) => patchFacts({ installDate: v })}
            />
            <SelectField
              label="สินค้าหลัก *"
              value={facts.productSlug}
              onChange={(v) =>
                patchFacts({
                  productSlug: v,
                  variantSlug: variantOptions(v)[0]?.value ?? "",
                })
              }
              options={PRODUCT_OPTIONS}
            />
            <SelectField
              label="รุ่น / SKU"
              value={facts.variantSlug}
              onChange={(v) => patchFacts({ variantSlug: v })}
              options={[
                { value: "", label: "— ไม่ระบุ —" },
                ...variants,
              ]}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Field
                label="ชื่อลูกค้า / โครงการ"
                value={facts.customerLabel}
                onChange={(v) => patchFacts({ customerLabel: v })}
                placeholder="คุณเอ / โครงการ B"
              />
              <label className="flex items-center gap-2 text-sm text-navy">
                <input
                  type="checkbox"
                  checked={facts.showCustomerName}
                  onChange={(e) =>
                    patchFacts({ showCustomerName: e.target.checked })
                  }
                />
                อนุญาตให้โชว์ชื่อในบทความ
              </label>
            </div>
            <SelectField
              label="โทนภาษา"
              value={facts.tone}
              onChange={(v) => patchFacts({ tone: v as PortfolioDraftTone })}
              options={[
                { value: "friendly", label: "เป็นกันเอง" },
                { value: "formal", label: "ทางการ" },
                { value: "sales", label: "เน้นขาย / CTA" },
              ]}
            />
          </div>

          <Field
            label="ขนาด / จำนวนโดยประมาณ"
            value={facts.approxSizeNote}
            onChange={(v) => patchFacts({ approxSizeNote: v })}
            placeholder="เช่น ห้องนั่งเล่น 3 บาน / ทั้งชั้น 12 ชุด"
          />
          <Field
            label="ปัญหาเดิม / โจทย์ลูกค้า"
            value={facts.painPoints}
            onChange={(v) => patchFacts({ painPoints: v })}
            placeholder="แดดจ้า มองจากข้างบ้าน อยากโปร่งแต่กันสายตา"
          />
          <TextArea
            label="หมายเหตุจากช่าง (ภาษาพูดก็ได้)"
            value={facts.notesFromStaff}
            onChange={(v) => patchFacts({ notesFromStaff: v })}
            rows={3}
            hint="ระบบจะจัดเป็นประโยคอ่านง่ายในขั้นถัดไป"
          />

          <div className="space-y-3 border-t border-line pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-medium text-navy">รูปหน้างาน *</h3>
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-3 py-2 text-sm font-medium text-white hover:bg-navy-deep disabled:opacity-60"
              >
                {uploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ImagePlus className="size-4" />
                )}
                อัปโหลดรูป
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) void uploadFiles(e.target.files);
                }}
              />
            </div>
            {uploadError ? (
              <p className="text-xs text-brand-red">{uploadError}</p>
            ) : null}

            {facts.images.length === 0 ? (
              <div className="rounded-xl border border-dashed border-line bg-paper/60 px-4 py-8 text-center text-sm text-muted">
                ยังไม่มีรูป — อัปโหลด หรือเลือกรูปตัวอย่างด้านล่าง
              </div>
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {facts.images.map((img) => (
                  <li
                    key={img.id}
                    className="overflow-hidden rounded-xl border border-line bg-paper"
                  >
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={img.url}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="200px"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="absolute right-1 top-1 rounded-md bg-black/55 p-1 text-white hover:bg-black/75"
                        aria-label="ลบรูป"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                    <div className="p-2">
                      <select
                        value={img.role}
                        onChange={(e) =>
                          updateImage(img.id, {
                            role: e.target.value as PortfolioImageRole,
                          })
                        }
                        className="w-full rounded-lg border border-line bg-white px-2 py-1 text-[11px] text-navy"
                      >
                        <option value="cover">ปก</option>
                        <option value="gallery">แกลเลอรี</option>
                        <option value="before">ก่อนติดตั้ง</option>
                        <option value="after">หลังติดตั้ง</option>
                      </select>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div>
              <p className="mb-2 text-[11px] text-muted">
                รูปตัวอย่าง (demo ถ้ายังอัปโหลดไม่ได้)
              </p>
              <div className="flex flex-wrap gap-2">
                {MOCK_PORTFOLIO_IMAGES.map((url) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => addMockImage(url)}
                    className="relative size-14 overflow-hidden rounded-lg border border-line hover:border-navy/40"
                    title="เพิ่มรูปนี้"
                  >
                    <Image src={url} alt="" fill className="object-cover" sizes="56px" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-between gap-2 border-t border-line pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-xl border border-line px-4 py-2.5 text-sm text-navy hover:bg-paper"
            >
              กลับ
            </button>
            <button
              type="button"
              disabled={generating}
              onClick={() => void runGenerate()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-red px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-red/90 disabled:opacity-60"
            >
              {generating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Wand2 className="size-4" />
              )}
              ให้ AI จัดเนื้อหา
            </button>
          </div>
        </section>
      ) : null}

      {step === 3 && draft ? (
        <section className="space-y-4 rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold text-navy">
                ตรวจร่างที่ระบบจัดให้
              </h2>
              <p className="mt-1 text-sm text-muted">
                แก้ข้อความได้ก่อนยืนยัน — หรือสร้างใหม่ด้วยโทน/แพทเทิร์นอื่น
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-navy/20 bg-paper px-3 py-2 text-sm font-medium text-navy hover:bg-white"
              >
                <Eye className="size-4" />
                พรีวิวหน้าเว็บ
              </button>
              <button
                type="button"
                disabled={generating}
                onClick={() => void runGenerate()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-sm text-navy hover:bg-paper disabled:opacity-60"
              >
                <Sparkles className="size-4" />
                สร้างร่างใหม่
              </button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
            <div className="space-y-3">
              <Field
                label="ชื่อผลงาน"
                value={draft.title}
                onChange={(v) => setDraft({ ...draft, title: v })}
              />
              <Field
                label="ที่ตั้ง (แสดงบนเว็บ)"
                value={draft.place}
                onChange={(v) => setDraft({ ...draft, place: v })}
              />
              <Field
                label="Slug"
                value={draft.slug}
                onChange={(v) => setDraft({ ...draft, slug: v })}
                hint={`/portfolio/${draft.slug || "..."}`}
              />
              <TextArea
                label="สรุปสั้น"
                value={draft.summary}
                onChange={(v) => setDraft({ ...draft, summary: v })}
                rows={2}
              />
              <TextArea
                label="รายละเอียด"
                value={draft.detail}
                onChange={(v) => setDraft({ ...draft, detail: v })}
                rows={8}
              />
              <Field
                label="แท็ก (คั่นด้วยจุลภาค)"
                value={draft.tags.join(", ")}
                onChange={(v) =>
                  setDraft({
                    ...draft,
                    tags: v
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  })
                }
              />
            </div>
            <aside className="space-y-3 rounded-xl border border-line bg-paper/50 p-3">
              <p className="text-xs font-medium text-navy">ปรับก่อนสร้างใหม่</p>
              <SelectField
                label="แพทเทิร์น"
                value={facts.patternId}
                onChange={(v) =>
                  patchFacts({ patternId: v as PortfolioPatternId })
                }
                options={PORTFOLIO_PATTERNS.map((p) => ({
                  value: p.id,
                  label: p.name,
                }))}
              />
              <SelectField
                label="โทนภาษา"
                value={facts.tone}
                onChange={(v) => patchFacts({ tone: v as PortfolioDraftTone })}
                options={[
                  { value: "friendly", label: "เป็นกันเอง" },
                  { value: "formal", label: "ทางการ" },
                  { value: "sales", label: "เน้นขาย" },
                ]}
              />
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-line bg-white">
                {draft.image ? (
                  <Image
                    src={draft.image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="280px"
                  />
                ) : null}
              </div>
              <p className="text-[11px] text-muted">
                แกลเลอรี {draft.gallery.length} รูป
              </p>
            </aside>
          </div>

          <div className="flex flex-wrap justify-between gap-2 border-t border-line pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-xl border border-line px-4 py-2.5 text-sm text-navy hover:bg-paper"
            >
              กลับแก้ข้อมูล
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-4 py-2.5 text-sm font-medium text-white hover:bg-navy-deep"
            >
              ไปยืนยัน
              <ArrowRight className="size-4" />
            </button>
          </div>
        </section>
      ) : null}

      {step === 4 && draft ? (
        <section className="space-y-4 rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6">
          <h2 className="font-display text-lg font-semibold text-navy">
            ยืนยันก่อนลงผลงาน
          </h2>
          <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-line bg-paper sm:aspect-square">
              <Image
                src={draft.image}
                alt=""
                fill
                className="object-cover"
                sizes="140px"
              />
            </div>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[11px] text-muted">ชื่อ</dt>
                <dd className="font-medium text-navy">{draft.title}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-muted">ที่ตั้ง</dt>
                <dd className="text-navy">{draft.place}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-muted">แพทเทิร์น</dt>
                <dd className="text-navy">{patternLabel(facts.patternId)}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-muted">สินค้า / SKU</dt>
                <dd className="text-navy">
                  {PRODUCT_OPTIONS.find((p) => p.value === facts.productSlug)
                    ?.label ?? facts.productSlug}
                  {facts.variantSlug ? ` / ${facts.variantSlug}` : ""}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-muted">วันที่ติดตั้ง</dt>
                <dd className="text-navy">{facts.installDate || "—"}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-muted">รูป</dt>
                <dd className="text-navy">{draft.gallery.length} รูป</dd>
              </div>
            </dl>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField
              label="สถานะเมื่อบันทึก"
              value={publishStatus}
              onChange={(v) => setPublishStatus(v as ContentStatus)}
              options={(Object.keys(CONTENT_STATUS_LABELS) as ContentStatus[]).map(
                (k) => ({ value: k, label: CONTENT_STATUS_LABELS[k] }),
              )}
            />
            <label className="flex items-end gap-2 pb-2 text-sm text-navy">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
              />
              ปักหมุดหน้าแรก
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-1 rounded-xl border border-line px-4 py-2.5 text-sm text-navy hover:bg-paper"
            >
              <X className="size-4" />
              กลับแก้ร่าง
            </button>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-navy/20 px-4 py-2.5 text-sm font-medium text-navy hover:bg-paper"
              >
                <Eye className="size-4" />
                พรีวิว
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={confirmPublish}
                className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-4 py-2.5 text-sm font-medium text-white hover:bg-navy-deep disabled:opacity-60"
              >
                <Check className="size-4" />
                ยืนยันลงผลงาน
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {draft ? (
        <CmsSitePreview
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          title={draft.title || "ผลงาน"}
          status={publishStatus}
        >
          <PortfolioDetailView item={draft} related={related} preview />
        </CmsSitePreview>
      ) : null}
    </div>
  );
}

function PatternSketch({
  id,
  active,
}: {
  id: PortfolioPatternId;
  active: boolean;
}) {
  const bar = active ? "bg-navy/25" : "bg-line";
  const block = active ? "bg-navy/15" : "bg-paper";
  if (id === "before-after") {
    return (
      <div className="grid grid-cols-2 gap-1.5">
        <div className={cn("aspect-[4/3] rounded-md", block)} />
        <div className={cn("aspect-[4/3] rounded-md", bar)} />
        <div className={cn("col-span-2 h-2 rounded", bar)} />
        <div className={cn("col-span-2 h-2 w-2/3 rounded", block)} />
      </div>
    );
  }
  if (id === "corp") {
    return (
      <div className="space-y-1.5">
        <div className={cn("h-10 rounded-md", bar)} />
        <div className="grid grid-cols-3 gap-1">
          <div className={cn("h-6 rounded", block)} />
          <div className={cn("h-6 rounded", block)} />
          <div className={cn("h-6 rounded", block)} />
        </div>
        <div className={cn("h-2 rounded", bar)} />
      </div>
    );
  }
  if (id === "short") {
    return (
      <div className="space-y-1.5">
        <div className={cn("h-12 rounded-md", bar)} />
        <div className={cn("h-2 w-4/5 rounded", block)} />
        <div className="flex gap-1">
          <div className={cn("h-4 w-10 rounded-full", block)} />
          <div className={cn("h-4 w-10 rounded-full", block)} />
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      <div className={cn("h-14 rounded-md", bar)} />
      <div className="grid grid-cols-3 gap-1">
        <div className={cn("aspect-square rounded", block)} />
        <div className={cn("aspect-square rounded", block)} />
        <div className={cn("aspect-square rounded", block)} />
      </div>
      <div className={cn("h-2 rounded", bar)} />
    </div>
  );
}
