"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Eye, ImageIcon, MapPin, Trash2, X } from "lucide-react";
import { PdpaConsentField } from "@/components/forms/PdpaConsentField";
import {
  CONTACT_TYPES,
  PRODUCT_TYPES,
  REFERRAL_SOURCES,
  productTypeThumb,
} from "@/lib/leads/types";

const MAX_SITE_IMAGES = 10;

type SiteImageItem = {
  id: string;
  file: File;
  previewUrl: string;
};

type PreviewState = {
  contactName: string;
  jobTitle: string;
  phone: string;
  lineId: string;
  contactType: string;
  businessName: string;
  installAddress: string;
  installMapUrl: string;
  billingAddress: string;
  taxId: string;
  email: string;
  productType: string;
  requestedSize: string;
  callbackDate: string;
  referralSource: string;
  note: string;
  sameBilling: boolean;
  sameLineAsPhone: boolean;
};

const emptyPreview: PreviewState = {
  contactName: "",
  jobTitle: "",
  phone: "",
  lineId: "",
  contactType: "",
  businessName: "",
  installAddress: "",
  installMapUrl: "",
  billingAddress: "",
  taxId: "",
  email: "",
  productType: "",
  requestedSize: "",
  callbackDate: "",
  referralSource: "",
  note: "",
  sameBilling: true,
  sameLineAsPhone: false,
};

function normalizeMapsUrl(value: string) {
  const v = value.trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  if (
    /^(maps\.app\.goo\.gl|goo\.gl\/maps|www\.google\.[^/]+\/maps)/i.test(v)
  ) {
    return `https://${v}`;
  }
  return v;
}

function looksLikeMapsUrl(value: string) {
  const v = value.trim().toLowerCase();
  if (!v) return true;
  return (
    (v.includes("google.") && v.includes("maps")) ||
    v.includes("maps.app.goo.gl") ||
    v.includes("goo.gl/maps")
  );
}

function resolveProductType(raw: string | null): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if ((PRODUCT_TYPES as readonly string[]).includes(trimmed)) return trimmed;
  if (trimmed.includes("ภายนอก") || trimmed.includes("อุตสาหกรรม")) {
    return "ม่านภายนอก/อุตสาหกรรม";
  }
  if (trimmed.includes("พิมพ์")) return "อื่นๆ";
  if (trimmed.includes("วอลเปเปอร์")) return "วอลเปเปอร์";
  if (trimmed.includes("ฟิล์ม")) return "ฟิล์มอาคาร";
  if (trimmed.includes("ซัก") || trimmed.includes("ซ่อม")) return "อื่นๆ";
  return "";
}

export function QuoteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);
  const siteFileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [siteImages, setSiteImages] = useState<SiteImageItem[]>([]);
  const [preview, setPreview] = useState<PreviewState>(() => {
    const product = resolveProductType(searchParams.get("product"));
    const item = searchParams.get("item")?.trim() ?? "";
    return {
      ...emptyPreview,
      callbackDate: new Date().toISOString().slice(0, 10),
      sameBilling: true,
      productType: product,
      note: item ? `สนใจ: ${item}` : "",
    };
  });

  useEffect(() => {
    return () => {
      siteImages.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- revoke on unmount only
  }, []);

  const sizeLines = useMemo(
    () =>
      preview.requestedSize
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean),
    [preview.requestedSize],
  );

  const productThumb = productTypeThumb(preview.productType);
  const lineDisplay = preview.sameLineAsPhone
    ? preview.phone.trim()
      ? `${preview.phone.trim()} (เดียวกับเบอร์)`
      : ""
    : preview.lineId;
  const billingDisplay = preview.sameBilling
    ? preview.installAddress
      ? "เดียวกับที่อยู่ติดตั้ง"
      : ""
    : preview.billingAddress;

  function update<K extends keyof PreviewState>(key: K, value: PreviewState[K]) {
    setPreview((prev) => ({ ...prev, [key]: value }));
  }

  function addSiteFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    const room = MAX_SITE_IMAGES - siteImages.length;
    if (room <= 0) {
      setError(`แนบได้สูงสุด ${MAX_SITE_IMAGES} ภาพ`);
      return;
    }
    const next: SiteImageItem[] = [];
    for (const file of Array.from(fileList).slice(0, room)) {
      if (!/^image\/(jpeg|png|webp)$/.test(file.type)) continue;
      next.push({
        id: `site-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }
    if (next.length) setSiteImages((prev) => [...prev, ...next]);
    if (siteFileRef.current) siteFileRef.current.value = "";
  }

  function removeSiteImage(id: string) {
    setSiteImages((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    const mapUrl = normalizeMapsUrl(preview.installMapUrl);
    if (mapUrl && !looksLikeMapsUrl(mapUrl)) {
      setError("ลิงก์ Google Maps ไม่ถูกต้อง — วางลิงก์จากแอปแผนที่หรือเบราว์เซอร์");
      setPending(false);
      setSheetOpen(false);
      return;
    }

    if (preview.sameBilling) {
      formData.set("billingAddress", "เดียวกับที่อยู่");
    }

    const lineId = preview.sameLineAsPhone
      ? preview.phone.trim()
      : preview.lineId.trim();
    formData.set("lineId", lineId);

    const address = preview.installAddress.trim();
    const installWithMap = mapUrl
      ? `${address}\nGoogle Maps: ${mapUrl}`
      : address;
    formData.set("installAddress", installWithMap);

    formData.delete("siteImage");
    for (const item of siteImages) {
      formData.append("siteImage", item.file, item.file.name);
    }

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        body: formData,
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "ส่งแบบฟอร์มไม่สำเร็จ");
      router.push("/thank-you");
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      setPending(false);
    }
  }

  function requestFormSubmit() {
    const form = formRef.current;
    if (!form) return;
    if (!form.checkValidity()) {
      setSheetOpen(false);
      window.setTimeout(() => form.reportValidity(), 80);
      return;
    }
    form.requestSubmit();
  }

  const summary = (
    <QuoteSummary
      preview={preview}
      productThumb={productThumb}
      lineDisplay={lineDisplay}
      billingDisplay={billingDisplay}
      sizeLines={sizeLines}
      siteImages={siteImages}
    />
  );

  return (
    <>
      <form ref={formRef} action={onSubmit} className="space-y-6">
        <input type="hidden" name="source" value="quote" />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <p className="text-sm font-semibold text-navy md:col-span-2 xl:col-span-3">
              ข้อมูลลูกค้า / ผู้ติดต่อ
            </p>

            <Field
              label="ชื่อผู้ติดต่อ"
              name="contactName"
              required
              value={preview.contactName}
              onChange={(v) => update("contactName", v)}
            />
            <Field
              label="ตำแหน่งงาน"
              name="jobTitle"
              value={preview.jobTitle}
              onChange={(v) => update("jobTitle", v)}
            />
            <Field
              label="เบอร์โทรศัพท์"
              name="phone"
              required
              value={preview.phone}
              onChange={(v) => update("phone", v)}
            />
            <div className="space-y-2">
              <Field
                label="LINE ID"
                name="lineId"
                disabled={preview.sameLineAsPhone}
                placeholder={
                  preview.sameLineAsPhone
                    ? preview.phone.trim() || "ใช้เบอร์โทร"
                    : "@changtee หรือเบอร์โทร"
                }
                value={preview.sameLineAsPhone ? "" : preview.lineId}
                onChange={(v) => update("lineId", v)}
              />
              <label className="flex items-start gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={preview.sameLineAsPhone}
                  onChange={(e) => update("sameLineAsPhone", e.target.checked)}
                />
                <span>ใช้แอดไลน์เดียวกับเบอร์โทร</span>
              </label>
            </div>

            <Select
              label="ประเภทผู้ติดต่อ"
              name="contactType"
              required
              options={CONTACT_TYPES}
              value={preview.contactType}
              onChange={(v) => update("contactType", v)}
            />
            <Field
              label="ชื่อธุรกิจ"
              name="businessName"
              placeholder="ตัวอย่าง : บริษัท ช่างตี๋ จำกัด เป็นต้น"
              className="md:col-span-2 xl:col-span-2"
              value={preview.businessName}
              onChange={(v) => update("businessName", v)}
            />

            <div className="space-y-2 md:col-span-2 xl:col-span-2">
              <TextArea
                label="ที่อยู่ สำหรับ ส่งของ หรือ ติดตั้ง"
                name="installAddress"
                required
                value={preview.installAddress}
                onChange={(v) => update("installAddress", v)}
              />
              <label className="block text-sm">
                <span className="mb-1 flex items-center gap-1.5 font-medium text-ink">
                  <MapPin className="size-3.5 text-brand-red" />
                  ลิงก์ Google Maps
                  <span className="font-normal text-muted">(ถ้ามี)</span>
                </span>
                <input
                  type="text"
                  inputMode="url"
                  autoComplete="off"
                  placeholder="https://maps.app.goo.gl/... หรือวางลิงก์จาก Google Maps"
                  value={preview.installMapUrl}
                  onChange={(e) => update("installMapUrl", e.target.value)}
                  className="w-full rounded-lg border border-line bg-white px-3 py-2 outline-none focus:border-navy"
                />
                <span className="mt-1 block text-xs text-muted">
                  เปิด Google Maps → แชร์ → คัดลอกลิงก์ แล้ววางที่นี่
                </span>
              </label>
            </div>
            <Field
              label="เลขผู้เสียภาษี"
              name="taxId"
              value={preview.taxId}
              onChange={(v) => update("taxId", v)}
            />

            <Field
              label="E-mail"
              name="email"
              type="email"
              required
              placeholder="สำหรับส่งใบเสนอราคา"
              value={preview.email}
              onChange={(v) => update("email", v)}
            />
            <div className="space-y-2 md:col-span-2">
              <TextArea
                label="ที่อยู่ สำหรับ ออกใบเสนอราคา"
                name="billingAddress"
                disabled={preview.sameBilling}
                placeholder={preview.sameBilling ? "เดียวกับที่อยู่" : undefined}
                value={preview.sameBilling ? "" : preview.billingAddress}
                onChange={(v) => update("billingAddress", v)}
              />
              <label className="flex items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={preview.sameBilling}
                  onChange={(e) => update("sameBilling", e.target.checked)}
                />
                ใช้ที่อยู่เดียวกับที่อยู่ติดตั้ง/ส่งของ
              </label>
            </div>

            <div className="md:col-span-2 xl:col-span-3">
              <div className="my-1 flex items-center gap-3">
                <div className="h-px flex-1 bg-line" />
                <span className="shrink-0 text-xs font-semibold tracking-wide text-navy">
                  ข้อมูลสินค้าที่สนใจ
                </span>
                <div className="h-px flex-1 bg-line" />
              </div>
            </div>

            <div className="flex items-end gap-3 md:col-span-2 xl:col-span-3">
              <div
                className="relative mb-0.5 aspect-[4/3] w-36 shrink-0 overflow-hidden rounded-xl border border-line bg-paper sm:w-44 md:w-52"
                aria-hidden={!productThumb}
              >
                {productThumb ? (
                  <Image
                    src={productThumb}
                    alt={preview.productType}
                    fill
                    className="object-cover object-center"
                    sizes="208px"
                    priority
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-muted">
                    <ImageIcon className="size-4 opacity-60 sm:size-5" />
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1 sm:max-w-sm">
                <Select
                  label="ประเภทสินค้า"
                  name="productType"
                  required
                  options={PRODUCT_TYPES}
                  value={preview.productType}
                  onChange={(v) => update("productType", v)}
                />
              </div>
            </div>

            <div className="md:col-span-2 xl:col-span-2">
              <label className="block text-sm">
                <span className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-medium text-ink">
                  <span>ขนาดที่ต้องการ (กว้างxสูง เซ็นติเมตร)</span>
                  <span className="rounded bg-paper px-2 py-0.5 text-[11px] font-normal text-brand-red">
                    1 ขนาด ต่อ 1 บรรทัด
                  </span>
                </span>
                <textarea
                  name="requestedSize"
                  rows={5}
                  value={preview.requestedSize}
                  onChange={(e) => update("requestedSize", e.target.value)}
                  placeholder={"ตัวอย่าง\n150x200\n180x220\n300x250"}
                  className="w-full rounded-lg border border-line bg-white px-3 py-2 outline-none focus:border-navy"
                />
              </label>
            </div>

            <div className="space-y-2 md:col-span-2 xl:col-span-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-ink">
                  แนบภาพหน้างาน
                  {siteImages.length > 0 ? (
                    <span className="ml-1 font-normal text-muted">
                      ({siteImages.length}/{MAX_SITE_IMAGES})
                    </span>
                  ) : null}
                </span>
                <button
                  type="button"
                  disabled={siteImages.length >= MAX_SITE_IMAGES}
                  onClick={() => siteFileRef.current?.click()}
                  className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-navy hover:bg-paper disabled:opacity-50"
                >
                  เพิ่มรูป
                </button>
              </div>
              <input
                ref={siteFileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => addSiteFiles(e.target.files)}
              />
              {siteImages.length === 0 ? (
                <button
                  type="button"
                  onClick={() => siteFileRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line bg-paper/50 px-3 py-6 text-xs text-muted hover:border-navy/30"
                >
                  <ImageIcon className="size-5 opacity-60" />
                  เลือกรูปหน้างาน (หลายรูปได้)
                </button>
              ) : (
                <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {siteImages.map((item) => (
                    <li
                      key={item.id}
                      className="relative aspect-square overflow-hidden rounded-lg border border-line bg-paper"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.previewUrl}
                        alt={item.file.name}
                        className="size-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeSiteImage(item.id)}
                        className="absolute right-1 top-1 rounded-md bg-black/60 p-1 text-white hover:bg-brand-red"
                        aria-label={`ลบ ${item.file.name}`}
                        title="ลบรูป"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Field
              label="วันที่อยากติดตั้ง"
              name="callbackDate"
              type="date"
              value={preview.callbackDate}
              onChange={(v) => update("callbackDate", v)}
            />
            <Select
              label="หาเราเจอจากที่ไหน"
              name="referralSource"
              required
              options={REFERRAL_SOURCES}
              value={preview.referralSource}
              onChange={(v) => update("referralSource", v)}
            />

            <TextArea
              label="หมายเหตุ"
              name="note"
              className="md:col-span-2 xl:col-span-3"
              rows={3}
              value={preview.note}
              onChange={(v) => update("note", v)}
            />

            <div className="md:col-span-2 xl:col-span-3">
              <PdpaConsentField />
            </div>

            {error ? (
              <p className="text-sm text-brand-red md:col-span-2 xl:col-span-3">
                {error}
              </p>
            ) : null}

            {/* Mobile: preview first, then submit lives in sheet */}
            <div className="flex flex-col gap-2 md:col-span-2 xl:col-span-3 lg:hidden">
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-navy bg-white px-6 py-3 text-sm font-semibold text-navy hover:bg-paper"
              >
                <Eye className="h-4 w-4" />
                พรีวิวตรวจสอบรายละเอียด
              </button>
              <p className="text-center text-xs text-muted">
                ตรวจทานสรุปคำขอก่อนส่งแบบฟอร์ม
              </p>
            </div>

            {/* Desktop: submit on form */}
            <div className="hidden md:col-span-2 xl:col-span-3 lg:block">
              <button
                type="submit"
                disabled={pending}
                className="inline-flex items-center gap-2 rounded-md bg-brand-red px-8 py-3 text-sm font-semibold text-white hover:bg-brand-red-soft disabled:opacity-60"
              >
                <Check className="h-4 w-4" />
                {pending ? "กำลังส่ง..." : "ส่งแบบฟอร์ม"}
              </button>
            </div>
          </div>

          {/* Desktop sticky preview */}
          <aside className="hidden min-w-0 lg:sticky lg:top-6 lg:block lg:self-start">
            <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
              <div className="bg-brand-red px-4 py-3 text-sm font-semibold text-white">
                พรีวิวสรุปคำขอใบเสนอราคา
              </div>
              <div className="max-h-[calc(100vh-8rem)] min-w-0 overflow-y-auto overflow-x-hidden p-4">
                {summary}
              </div>
              <div className="border-t border-line bg-paper px-4 py-3 text-xs text-muted">
                ตรวจทานข้อมูลก่อนกดส่ง — ทีมงานจะติดต่อกลับตามช่องทางที่ให้ไว้
              </div>
            </div>
          </aside>
        </div>
      </form>

      {/* Mobile preview sheet */}
      {sheetOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 lg:hidden">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="ปิดพรีวิว"
            onClick={() => setSheetOpen(false)}
          />
          <div className="relative z-10 flex max-h-[88vh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div>
                <h3 className="font-display text-base font-semibold text-navy">
                  ตรวจสอบรายละเอียด
                </h3>
                <p className="text-xs text-muted">สรุปคำขอใบเสนอราคาก่อนส่ง</p>
              </div>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="rounded-lg p-2 text-muted hover:bg-paper hover:text-navy"
                aria-label="ปิด"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="min-w-0 overflow-y-auto overflow-x-hidden px-4 py-4">
              {summary}
            </div>

            {error ? (
              <p className="px-4 pb-2 text-sm text-brand-red">{error}</p>
            ) : null}

            <div className="sticky bottom-0 flex flex-col gap-2 border-t border-line bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                disabled={pending}
                onClick={requestFormSubmit}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-red px-6 py-3 text-sm font-semibold text-white hover:bg-brand-red-soft disabled:opacity-60"
              >
                <Check className="h-4 w-4" />
                {pending ? "กำลังส่ง..." : "ยืนยันส่งแบบฟอร์ม"}
              </button>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="w-full rounded-md border border-line px-6 py-2.5 text-sm text-navy hover:bg-paper"
              >
                กลับไปแก้ไข
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function QuoteSummary({
  preview,
  productThumb,
  lineDisplay,
  billingDisplay,
  sizeLines,
  siteImages,
}: {
  preview: PreviewState;
  productThumb: string | null;
  lineDisplay: string;
  billingDisplay: string;
  sizeLines: string[];
  siteImages: SiteImageItem[];
}) {
  return (
    <div className="space-y-3 text-sm">
      <SummarySection title="ผู้ติดต่อ">
        <PreviewRow label="ชื่อ" value={preview.contactName} />
        <PreviewRow label="ตำแหน่ง" value={preview.jobTitle} />
        <PreviewRow label="ประเภท" value={preview.contactType} />
        <PreviewRow label="ธุรกิจ" value={preview.businessName} />
        <PreviewRow label="เบอร์โทร" value={preview.phone} />
        <PreviewRow label="LINE" value={lineDisplay} />
        <PreviewRow label="E-mail" value={preview.email} />
        <PreviewRow label="เลขผู้เสียภาษี" value={preview.taxId} />
      </SummarySection>

      <SummarySection title="ที่อยู่">
        <PreviewRow label="ติดตั้ง / ส่งของ" value={preview.installAddress} />
        <PreviewRow label="Google Maps" value={preview.installMapUrl} link />
        <PreviewRow label="ออกใบเสนอราคา" value={billingDisplay} />
      </SummarySection>

      <SummarySection title="สินค้า">
        <div className="flex items-start gap-3">
          {productThumb ? (
            <div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-lg border border-line bg-paper sm:w-28">
              <Image
                src={productThumb}
                alt=""
                fill
                className="object-cover object-center"
                sizes="112px"
              />
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-muted">ประเภทสินค้า</p>
            <p className="mt-0.5 break-words font-medium leading-snug text-navy">
              {preview.productType.trim() || (
                <span className="font-normal text-ink/35">-</span>
              )}
            </p>
          </div>
        </div>

        <div>
          <p className="text-[11px] text-muted">
            แนบภาพหน้างาน
            {siteImages.length > 0 ? (
              <span className="ml-1 text-ink">({siteImages.length} ไฟล์)</span>
            ) : null}
          </p>
          {siteImages.length === 0 ? (
            <p className="mt-0.5 text-ink/35">-</p>
          ) : (
            <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-5">
              {siteImages.map((item) => (
                <div
                  key={item.id}
                  className="relative aspect-square overflow-hidden rounded-lg border border-line bg-paper"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.previewUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-[11px] text-muted">
            ขนาดที่ต้องการ ({sizeLines.length})
          </p>
          {sizeLines.length === 0 ? (
            <p className="mt-0.5 text-ink/35">-</p>
          ) : (
            <ol className="mt-1 list-decimal space-y-0.5 pl-5 leading-snug text-ink">
              {sizeLines.map((line, i) => (
                <li key={`${line}-${i}`} className="break-words">
                  {line}
                </li>
              ))}
            </ol>
          )}
        </div>
      </SummarySection>

      <SummarySection title="อื่นๆ">
        <PreviewRow label="วันที่อยากติดตั้ง" value={preview.callbackDate} />
        <PreviewRow label="หาเราเจอจาก" value={preview.referralSource} />
        <PreviewRow label="หมายเหตุ" value={preview.note} />
      </SummarySection>
    </div>
  );
}

function SummarySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-line/80 bg-paper/40 p-3 sm:p-3.5">
      <h4 className="mb-2.5 text-[11px] font-semibold tracking-wide text-brand-red">
        {title}
      </h4>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function PreviewRow({
  label,
  value,
  link,
}: {
  label: string;
  value?: string;
  link?: boolean;
}) {
  const text = value?.trim() ?? "";
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <div className="text-[11px] leading-snug text-muted">{label}</div>
      <div className="min-w-0 break-words text-sm leading-snug text-ink">
        {!text ? (
          <span className="text-ink/35">-</span>
        ) : link && /^https?:\/\//i.test(text) ? (
          <a
            href={text}
            target="_blank"
            rel="noreferrer"
            className="break-all text-brand-red underline-offset-2 hover:underline"
          >
            {text}
          </a>
        ) : (
          <span className="whitespace-pre-wrap">{text}</span>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  required,
  type = "text",
  placeholder,
  className = "",
  disabled,
  value,
  onChange,
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1 flex gap-1 font-medium text-ink">
        {label}
        {required ? <span className="text-brand-red">*</span> : null}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-line bg-white px-3 py-2 outline-none focus:border-navy disabled:bg-paper"
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  required,
  placeholder,
  className = "",
  rows = 3,
  disabled,
  value,
  onChange,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  rows?: number;
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1 flex gap-1 font-medium text-ink">
        {label}
        {required ? <span className="text-brand-red">*</span> : null}
      </span>
      <textarea
        name={name}
        required={required}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-line bg-white px-3 py-2 outline-none focus:border-navy disabled:bg-paper"
      />
    </label>
  );
}

function Select({
  label,
  name,
  required,
  options,
  value,
  onChange,
}: {
  label: string;
  name: string;
  required?: boolean;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 flex gap-1 font-medium text-ink">
        {label}
        {required ? <span className="text-brand-red">*</span> : null}
      </span>
      <select
        name={name}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-line bg-white px-3 py-2 outline-none focus:border-navy"
      >
        <option value="" disabled>
          กรุณาเลือก...
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}
