"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  ImagePlus,
  Loader2,
  MapPin,
  Plus,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import { slugifyTh } from "@/lib/cms/content-status";
import {
  emptyJobFacts,
  emptyProductLine,
  factsFromPortfolioItem,
  generatePortfolioDraft,
  resolvedProductLines,
  variantOptions,
  type PortfolioDraftImage,
  type PortfolioImageRole,
  type PortfolioJobFacts,
} from "@/lib/cms/portfolio-ai-draft";
import {
  PRODUCT_OPTIONS,
  SPACE_TYPE_LABELS,
  type PortfolioItem,
  type SpaceType,
} from "@/lib/cms/portfolio-demo";
import {
  removePortfolioItem,
  upsertPortfolioItem,
  usePortfolioItems,
} from "@/lib/cms/demo-store";
import { relatedPortfolio } from "@/lib/cms/public-content";
import {
  uploadAdminFile,
  type UploadPrepStatus,
} from "@/lib/cms/admin-upload";
import { adminBaseFromPathname, adminHref } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";
import { CmsModal, Field, SelectField, TextArea } from "@/components/admin/cms/CmsShared";
import { UploadPrepBar } from "@/components/admin/cms/UploadPrepBar";
import { CmsSitePreview } from "@/components/admin/cms/CmsSitePreview";
import { PortfolioDetailView } from "@/components/portfolio/PortfolioDetailView";

function newImage(
  url: string,
  role: PortfolioImageRole = "gallery",
): PortfolioDraftImage {
  return {
    id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    url,
    role,
  };
}

export function PortfolioAiWizard({ id }: { id?: string }) {
  const items = usePortfolioItems();
  const existing =
    id && id !== "new" ? items.find((item) => item.id === id) : undefined;

  return (
    <PortfolioComposer
      key={existing ? `${existing.id}-${existing.updatedAt}` : "new"}
      existing={existing}
      missingEdit={Boolean(id && id !== "new" && !existing)}
    />
  );
}

function PortfolioComposer({
  existing,
  missingEdit,
}: {
  existing?: PortfolioItem;
  missingEdit?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const basePath = adminBaseFromPathname(pathname);
  const allItems = usePortfolioItems();
  const listHref = adminHref(basePath, "/cms/portfolio");
  const isEdit = Boolean(existing);

  const [facts, setFacts] = useState<PortfolioJobFacts>(() =>
    existing ? factsFromPortfolioItem(existing) : emptyJobFacts(),
  );
  const [summary, setSummary] = useState(existing?.summary ?? "");
  const [detail, setDetail] = useState(existing?.detail ?? "");
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadPrepStatus | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const productLines = resolvedProductLines(facts);

  const draft = useMemo(
    () =>
      buildLiveDraft(facts, {
        summary,
        detail,
        status: existing?.status === "published" ? "published" : "draft",
        existing,
      }),
    [facts, summary, detail, existing],
  );

  const related = useMemo(
    () => relatedPortfolio(draft, allItems),
    [draft, allItems],
  );

  function patchFacts(partial: Partial<PortfolioJobFacts>) {
    setFacts((f) => ({ ...f, ...partial }));
  }

  function setProductLines(lines: PortfolioJobFacts["productLines"]) {
    const next = lines.length ? lines : [emptyProductLine()];
    patchFacts({
      productLines: next,
      productSlug: next[0]!.productSlug,
      variantSlug: next[0]!.variantSlug,
    });
  }

  function patchProductLine(
    id: string,
    partial: Partial<{ productSlug: string; variantSlug: string }>,
  ) {
    setProductLines(
      productLines.map((line) => {
        if (line.id !== id) return line;
        const productSlug = partial.productSlug ?? line.productSlug;
        const variantSlug =
          partial.productSlug && partial.productSlug !== line.productSlug
            ? (variantOptions(productSlug)[0]?.value ?? "")
            : (partial.variantSlug ?? line.variantSlug);
        return { ...line, productSlug, variantSlug };
      }),
    );
  }

  function addProductLine() {
    const used = new Set(productLines.map((line) => line.productSlug));
    const nextCat =
      PRODUCT_OPTIONS.find((opt) => !used.has(opt.value))?.value ??
      PRODUCT_OPTIONS[0]?.value ??
      "curtain";
    setProductLines([...productLines, emptyProductLine(nextCat)]);
  }

  function setImages(images: PortfolioDraftImage[]) {
    patchFacts({ images });
  }

  function removeImage(id: string) {
    const next = facts.images.filter((img) => img.id !== id);
    if (next.length && !next.some((img) => img.role === "cover")) {
      next[0] = { ...next[0]!, role: "cover" };
    }
    setImages(next);
  }

  function setCover(id: string) {
    setImages(
      facts.images.map((img) => ({
        ...img,
        role: img.id === id ? "cover" : "gallery",
      })),
    );
  }

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (!list.length) return;
    setUploadError(null);
    setUploading(true);
    const added: PortfolioDraftImage[] = [];
    const failed: string[] = [];
    let current = facts.images;
    try {
      for (let i = 0; i < list.length; i += 1) {
        const file = list[i]!;
        const prefix =
          list.length > 1 ? `รูป ${i + 1}/${list.length} — ` : "";
        try {
          const url = await uploadAdminFile(file, "portfolio", (status) => {
            setUploadStatus({
              ...status,
              label: `${prefix}${status.label}`,
            });
          });
          const role: PortfolioImageRole =
            current.length === 0 ? "cover" : "gallery";
          const next = newImage(url, role);
          added.push(next);
          current = [...current, next];
          setImages(current);
        } catch (e) {
          const reason = e instanceof Error ? e.message : "อัปโหลดไม่สำเร็จ";
          failed.push(`${file.name} (${reason})`);
        }
      }
      if (failed.length) {
        const kept =
          added.length > 0
            ? `อัปได้ ${added.length} รูปแล้ว ใช้รูปที่ขึ้นไปก่อนได้ — `
            : "";
        setUploadError(
          `${kept}อัปไม่ได้ ${failed.length} รูป: ${failed.join(" · ")}`,
        );
      }
    } finally {
      setUploading(false);
      setUploadStatus(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function missingForPublish(): string | null {
    if (!facts.place.trim()) return "ใส่สถานที่ที่โชว์บนเว็บ";
    if (!productLines.some((line) => line.productSlug)) return "เลือกสินค้า";
    if (facts.images.length === 0) return "ใส่รูปอย่างน้อย 1 รูป";
    if (!facts.jobTitle.trim() && !facts.customerLabel.trim()) {
      return "ใส่ชื่องาน หรือชื่อลูกค้า เพื่อตั้งหัวข้อบนเว็บ";
    }
    return null;
  }

  async function writeCaption() {
    const err = missingForPublish();
    if (err && !facts.productSlug) {
      alert(err);
      return;
    }
    setGenerating(true);
    await new Promise((r) => window.setTimeout(r, 350));
    const next = generatePortfolioDraft(
      {
        ...facts,
        jobTitle: facts.jobTitle.trim(),
        place: facts.place.trim(),
      },
      { id: existing?.id ?? draft.id },
    );
    if (!facts.jobTitle.trim()) {
      patchFacts({ jobTitle: next.title });
    }
    setSummary(next.summary);
    setDetail(next.detail);
    setGenerating(false);
  }

  async function save(status: "draft" | "published") {
    const err = missingForPublish();
    if (err) {
      alert(err);
      return;
    }
    setSaving(true);
    const item = buildLiveDraft(facts, {
      summary:
        summary.trim() ||
        generatePortfolioDraft(facts, { id: existing?.id ?? draft.id }).summary,
      detail:
        detail.trim() ||
        generatePortfolioDraft(facts, { id: existing?.id ?? draft.id }).detail,
      status,
      existing,
    });
    try {
      const result = await upsertPortfolioItem({
        ...item,
        updatedAt: new Date().toISOString(),
      });
      if (!result.ok) {
        alert(
          result.error ||
            "บันทึกขึ้นเซิร์ฟเวอร์ไม่สำเร็จ — ผลงานยังอยู่บนเครื่องนี้ แต่ยังไม่ขึ้นเว็บออนไลน์",
        );
        return;
      }
      router.push(listHref);
    } finally {
      setSaving(false);
    }
  }

  async function removeWork() {
    if (!existing) return;
    setSaving(true);
    try {
      const result = await removePortfolioItem(existing.id);
      if (!result.ok) {
        alert(
          result.error ||
            "ลบจากเซิร์ฟเวอร์ไม่สำเร็จ — ลองอีกครั้งหรือเช็คการล็อกอินแอดมิน",
        );
        return;
      }
      router.push(listHref);
    } finally {
      setSaving(false);
    }
  }

  if (missingEdit) {
    return (
      <div className="mx-auto max-w-5xl space-y-3">
        <Link
          href={listHref}
          className="inline-flex min-h-11 items-center gap-1 text-sm text-muted hover:text-navy sm:min-h-9"
        >
          <ArrowLeft className="size-4" />
          กลับรายการผลงาน
        </Link>
        <p className="text-sm text-muted">ไม่พบผลงานนี้</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-28">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={listHref}
            className="inline-flex min-h-11 items-center gap-1 text-sm text-muted hover:text-navy sm:min-h-9"
          >
            <ArrowLeft className="size-4" />
            กลับรายการผลงาน
          </Link>
          <h1 className="mt-2 font-display text-xl font-semibold text-navy sm:text-2xl">
            {isEdit ? "แก้ไขผลงาน" : "ลงผลงาน"}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted">
            กรอกเท่าที่โชว์บนหน้าเว็บ โยนรูปเข้าไป แล้วให้ระบบเขียนแคปชัน — จากนั้นพรีวิวแล้วเผยแพร่
          </p>
        </div>
      </div>

      <section className="space-y-4 rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6">
        <div>
          <h2 className="font-display text-lg font-semibold text-navy">
            ข้อมูลที่โชว์บนเว็บ
          </h2>
          <p className="mt-1 text-sm text-muted">
            ตรงกับการ์ดผลงานและหน้ารายละเอียด — ลูกค้าเห็นชื่องาน สถานที่ และสินค้า
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="ชื่อลูกค้า / โครงการ"
            value={facts.customerLabel}
            onChange={(v) => patchFacts({ customerLabel: v })}
            placeholder="หาดบ้านดิน รีสอร์ท / คุณสุน"
          />
          <Field
            label="ชื่องานบนเว็บ"
            value={facts.jobTitle}
            onChange={(v) => patchFacts({ jobTitle: v })}
            placeholder="ว่างไว้ได้ — กดให้ AI ตั้งให้"
            hint="ตัวอย่างจริง: ม่านตาไก่ หาดบ้านดิน รีสอร์ท"
          />
          <Field
            label="สถานที่ *"
            value={facts.place}
            onChange={(v) => patchFacts({ place: v })}
            placeholder="กาญจนบุรี / พระราม 5 นนทบุรี"
          />
          <SelectField
            label="ประเภทพื้นที่"
            value={facts.spaceType}
            onChange={(v) => patchFacts({ spaceType: v as SpaceType })}
            options={(Object.keys(SPACE_TYPE_LABELS) as SpaceType[]).map(
              (k) => ({ value: k, label: SPACE_TYPE_LABELS[k] }),
            )}
          />
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-navy">สินค้าที่ติดตั้ง *</p>
            <p className="mt-0.5 text-xs text-muted">
              งานหนึ่งจุดติดตั้งได้หลายแบบ เช่น ผ้าม่านกับฉากกั้นห้อง — เรียงเป็นข้อ
            </p>
          </div>
          {productLines.map((line, index) => {
            const variants = variantOptions(line.productSlug);
            return (
              <div
                key={line.id}
                className="flex items-start gap-2 rounded-2xl border border-line bg-paper/40 p-3 sm:gap-3 sm:p-4"
              >
                <p className="w-8 shrink-0 pt-2 text-base font-semibold leading-none text-navy">
                  {index + 1}:
                </p>
                <div className="min-w-0 flex-1">
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
                    <SelectField
                      label="สินค้า *"
                      value={line.productSlug}
                      onChange={(v) =>
                        patchProductLine(line.id, { productSlug: v })
                      }
                      options={PRODUCT_OPTIONS}
                    />
                    <SelectField
                      label="แบบที่ติด"
                      value={line.variantSlug}
                      onChange={(v) =>
                        patchProductLine(line.id, { variantSlug: v })
                      }
                      options={[
                        { value: "", label: "— ไม่ระบุแบบ —" },
                        ...variants,
                      ]}
                    />
                    {productLines.length > 1 ? (
                      <button
                        type="button"
                        onClick={() =>
                          setProductLines(
                            productLines.filter((row) => row.id !== line.id),
                          )
                        }
                        className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 sm:size-9"
                        aria-label={`ลบสินค้า ${index + 1}`}
                        title="ลบ"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    ) : (
                      <span className="hidden sm:block sm:size-9" aria-hidden />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <button
            type="button"
            onClick={addProductLine}
            className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-navy/30 bg-white px-4 text-sm font-medium text-navy hover:border-navy hover:bg-paper sm:min-h-9 sm:w-auto"
          >
            <Plus className="size-4" />
            เพิ่มสินค้า
          </button>
        </div>

        <label className="flex min-h-11 items-center gap-2 text-sm text-navy">
          <input
            type="checkbox"
            checked={facts.showCustomerName}
            onChange={(e) =>
              patchFacts({ showCustomerName: e.target.checked })
            }
          />
          โชว์ชื่อลูกค้าบนหน้าเว็บ
        </label>
      </section>

      <section className="space-y-4 rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-navy">
              รูปผลงาน
            </h2>
            <p className="mt-1 text-sm text-muted">
              โยนเข้าไปกี่รูปก็ได้ รูปแรกเป็นปก — กดดาวเพื่อเปลี่ยนปก ระบบย่อรูปให้อัตโนมัติก่อนอัป
            </p>
          </div>
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-navy px-3 text-sm font-medium text-white hover:bg-navy-deep disabled:opacity-60 sm:min-h-9"
          >
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ImagePlus className="size-4" />
            )}
            เลือกไฟล์
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) void uploadFiles(e.target.files);
            }}
          />
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (e.dataTransfer.files.length) void uploadFiles(e.dataTransfer.files);
          }}
          className={cn(
            "cursor-pointer rounded-2xl border border-dashed px-4 py-8 text-center text-sm transition",
            dragging
              ? "border-navy bg-navy/[0.04] text-navy"
              : "border-line bg-paper/50 text-muted",
          )}
          onClick={() => fileRef.current?.click()}
        >
          ลากรูปมาวางที่นี่ หรือกดเลือกไฟล์ — รองรับหลายรูปพร้อมกัน
        </div>

        {uploadStatus ? (
          <UploadPrepBar
            status={uploadStatus}
            className="rounded-xl border border-line bg-paper px-3 py-3"
          />
        ) : null}

        {uploadError ? (
          <p className="text-xs text-brand-red">{uploadError}</p>
        ) : null}

        {facts.images.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {facts.images.map((img) => {
              const isCover = img.role === "cover";
              return (
                <li
                  key={img.id}
                  className={cn(
                    "overflow-hidden rounded-xl border bg-paper",
                    isCover ? "border-navy ring-2 ring-navy/20" : "border-line",
                  )}
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={img.url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                    {isCover ? (
                      <span className="absolute left-1.5 top-1.5 rounded-full bg-navy px-2 py-0.5 text-[10px] font-medium text-white">
                        ปก
                      </span>
                    ) : null}
                    <div className="absolute right-1 top-1 flex gap-1">
                      <button
                        type="button"
                        onClick={() => setCover(img.id)}
                        className="inline-flex size-9 items-center justify-center rounded-md bg-black/55 text-white hover:bg-black/75"
                        aria-label="ตั้งเป็นปก"
                      >
                        <Star
                          className={cn(
                            "size-3.5",
                            isCover && "fill-amber-300 text-amber-300",
                          )}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="inline-flex size-9 items-center justify-center rounded-md bg-black/55 text-white hover:bg-black/75"
                        aria-label="ลบรูป"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>

      <section className="space-y-4 rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-navy">
              แคปชันบนหน้าเว็บ
            </h2>
            <p className="mt-1 text-sm text-muted">
              สรุปสั้น + รายละเอียด — สไตล์เดียวกับผลงานที่ลงไว้แล้ว เช่น ม่านตาไก่โทนเทา เข้ากับห้องไม้รีสอร์ท
            </p>
          </div>
          <button
            type="button"
            disabled={generating}
            onClick={() => void writeCaption()}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-brand-red px-3 text-sm font-medium text-white hover:bg-brand-red/90 disabled:opacity-60 sm:min-h-9"
          >
            {generating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            ให้ AI เขียนแคปชัน
          </button>
        </div>

        <Field
          label="อยากให้แคปชันพูดถึงอะไร (ไม่บังคับ)"
          value={facts.painPoints}
          onChange={(v) => patchFacts({ painPoints: v })}
          placeholder="แดดจ้า / อยากโปร่งแต่กันสายตา / เข้ากับห้องไม้"
        />

        <TextArea
          label="สรุปสั้น"
          value={summary}
          onChange={setSummary}
          rows={2}
        />
        <TextArea
          label="รายละเอียด"
          value={detail}
          onChange={setDetail}
          rows={5}
        />

        <SiteCardPreview
          title={draft.title}
          place={draft.place}
          space={SPACE_TYPE_LABELS[draft.spaceType]}
          image={draft.image}
          summary={summary}
        />
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-end gap-2">
          {isEdit ? (
            <button
              type="button"
              disabled={saving}
              onClick={() => setConfirmDelete(true)}
              className="mr-auto inline-flex size-11 items-center justify-center rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 disabled:opacity-60 sm:size-9"
              title="ลบผลงาน"
              aria-label="ลบผลงาน"
            >
              <Trash2 className="size-4" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="inline-flex size-11 items-center justify-center rounded-xl border border-navy/20 text-navy hover:bg-paper sm:size-9"
            title="พรีวิวหน้าเว็บ"
            aria-label="พรีวิวหน้าเว็บ"
          >
            <Eye className="size-4" />
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => save("draft")}
            className="inline-flex min-h-11 items-center rounded-xl border border-line px-4 text-sm font-medium text-navy hover:bg-paper disabled:opacity-60 sm:min-h-9"
          >
            บันทึกฉบับร่าง
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => save("published")}
            className="inline-flex min-h-11 items-center rounded-xl bg-navy px-4 text-sm font-medium text-white hover:bg-navy-deep disabled:opacity-60 sm:min-h-9"
          >
            เผยแพร่
          </button>
        </div>
      </div>

      {confirmDelete && existing ? (
        <CmsModal
          title="ยืนยันการลบผลงาน"
          subtitle={existing.title}
          onClose={() => setConfirmDelete(false)}
        >
          <p className="text-sm text-muted">
            ลบแล้วจะหายจากรายการและหน้าเว็บ ต้องการลบรายการนี้ใช่ไหม
          </p>
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="inline-flex min-h-11 items-center rounded-xl border border-line px-4 text-sm font-medium text-navy hover:bg-paper sm:min-h-9"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={removeWork}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-rose-600 px-4 text-sm font-medium text-white hover:bg-rose-700 sm:min-h-9"
            >
              <Trash2 className="size-4" />
              ลบผลงาน
            </button>
          </div>
        </CmsModal>
      ) : null}

      <CmsSitePreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={draft.title || "ผลงาน"}
        status={draft.status}
      >
        <PortfolioDetailView item={draft} related={related} preview />
      </CmsSitePreview>
    </div>
  );
}

function buildLiveDraft(
  facts: PortfolioJobFacts,
  opts: {
    summary: string;
    detail: string;
    status: "draft" | "published";
    existing?: PortfolioItem;
  },
) {
  const generated = generatePortfolioDraft(facts, {
    id: opts.existing?.id,
    status: opts.status,
    pinned: opts.existing?.pinned,
  });
  const title = facts.jobTitle.trim() || generated.title;
  return {
    ...opts.existing,
    ...generated,
    id: opts.existing?.id ?? generated.id,
    slug: opts.existing?.slug || slugifyTh(title) || generated.slug,
    title,
    place: facts.place.trim() || generated.place,
    summary: opts.summary.trim() || generated.summary,
    detail: opts.detail.trim() || generated.detail,
    status: opts.status,
    pinned: opts.existing?.pinned ?? generated.pinned,
    sortOrder: opts.existing?.sortOrder ?? generated.sortOrder,
    seoTitle: opts.existing?.seoTitle ?? "",
    seoDescription: opts.existing?.seoDescription ?? "",
    installLocation: opts.existing?.installLocation ?? generated.installLocation,
    installDate: opts.existing?.installDate ?? generated.installDate,
    lineItems: generated.lineItems.map((row, index) => {
      const prev = opts.existing?.lineItems?.[index];
      if (!prev) return row;
      return {
        ...row,
        serialOrCode: prev.serialOrCode,
        material: prev.material,
        color: prev.color,
        quantity: prev.quantity,
        notes: prev.notes,
      };
    }),
    image: generated.image,
    gallery: generated.gallery,
    customerName: facts.customerLabel.trim(),
    showCustomerName: facts.showCustomerName,
  };
}

function SiteCardPreview({
  title,
  place,
  space,
  image,
  summary,
}: {
  title: string;
  place: string;
  space: string;
  image: string;
  summary: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-paper/40">
      <p className="px-4 pt-3 text-[11px] font-medium text-muted">
        ตัวอย่างการ์ดบนหน้าผลงาน
      </p>
      <div className="m-3 max-w-sm overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-line">
        <div className="relative aspect-[4/3] bg-paper">
          {image ? (
            <Image
              src={image}
              alt=""
              fill
              className="object-cover"
              sizes="320px"
            />
          ) : null}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/70 to-transparent p-3 pt-10">
            <p className="flex items-center gap-1 text-[11px] font-medium text-white/90">
              <MapPin className="size-3 shrink-0 opacity-80" />
              <span className="truncate">{place || "สถานที่"}</span>
            </p>
          </div>
        </div>
        <div className="p-4">
          <p className="truncate text-[11px] text-muted">{space}</p>
          <p className="mt-1.5 font-display text-base font-semibold leading-snug text-navy">
            {title || "ชื่องาน"}
          </p>
          {summary ? (
            <p className="mt-1 line-clamp-2 text-sm text-muted">{summary}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
