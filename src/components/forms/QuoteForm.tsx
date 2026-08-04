"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { PdpaConsentField } from "@/components/forms/PdpaConsentField";
import {
  CONTACT_TYPES,
  PRODUCT_TYPES,
  REFERRAL_SOURCES,
} from "@/lib/leads/types";

type PreviewState = {
  contactName: string;
  jobTitle: string;
  phone: string;
  contactType: string;
  businessName: string;
  installAddress: string;
  billingAddress: string;
  taxId: string;
  email: string;
  productType: string;
  requestedSize: string;
  callbackDate: string;
  referralSource: string;
  note: string;
  siteImageName: string;
  sameBilling: boolean;
};

const emptyPreview: PreviewState = {
  contactName: "",
  jobTitle: "",
  phone: "",
  contactType: "",
  businessName: "",
  installAddress: "",
  billingAddress: "",
  taxId: "",
  email: "",
  productType: "",
  requestedSize: "",
  callbackDate: "",
  referralSource: "",
  note: "",
  siteImageName: "",
  sameBilling: true,
};

export function QuoteForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewState>(() => ({
    ...emptyPreview,
    callbackDate: new Date().toISOString().slice(0, 10),
    sameBilling: true,
  }));

  const sizeLines = useMemo(
    () =>
      preview.requestedSize
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean),
    [preview.requestedSize],
  );

  function update<K extends keyof PreviewState>(key: K, value: PreviewState[K]) {
    setPreview((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    if (preview.sameBilling) {
      formData.set("billingAddress", "เดียวกับที่อยู่");
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

  return (
    <form action={onSubmit} className="space-y-6" encType="multipart/form-data">
      <input type="hidden" name="source" value="quote" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Form — below preview on mobile */}
        <div className="order-2 grid min-w-0 gap-4 md:grid-cols-2 lg:order-1 xl:grid-cols-3">
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
            className="md:col-span-2"
            value={preview.businessName}
            onChange={(v) => update("businessName", v)}
          />

          <TextArea
            label="ที่อยู่ สำหรับ ส่งของ หรือ ติดตั้ง"
            name="installAddress"
            required
            className="md:col-span-2 xl:col-span-2"
            value={preview.installAddress}
            onChange={(v) => update("installAddress", v)}
          />
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
              label="ที่อยู่ สำหรับ ทำใบเสนอราคา"
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

          <Select
            label="ประเภทสินค้า"
            name="productType"
            required
            options={PRODUCT_TYPES}
            value={preview.productType}
            onChange={(v) => update("productType", v)}
          />

          <div className="md:col-span-2 xl:col-span-2">
            <label className="block text-sm">
              <span className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-medium text-ink">
                <span className="inline-flex gap-1">
                  ขนาดที่ต้องการ (กว้างxสูง เซ็นติเมตร)
                </span>
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
              <span className="mt-1 block text-xs text-muted">
                กรอก 1 ขนาดต่อ 1 บรรทัด ในรูปแบบ กว้างxสูง เช่น 150x200
              </span>
            </label>
          </div>

          <label className="block text-sm">
            <span className="mb-1 flex gap-1 font-medium text-ink">แนบภาพหน้างาน</span>
            <input
              type="file"
              name="siteImage"
              accept="image/*,.pdf"
              onChange={(e) =>
                update("siteImageName", e.target.files?.[0]?.name || "")
              }
              className="max-w-full min-w-0 w-full rounded-lg border border-line bg-white px-2 py-2 text-sm file:mr-2 file:rounded-md file:border-0 file:bg-paper file:px-2 file:py-1.5 file:text-xs sm:file:mr-3 sm:file:px-3 sm:file:text-sm"
            />
          </label>
          <Field
            label="วันที่สะดวกให้ติดต่อกลับ"
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
            <p className="text-sm text-brand-red md:col-span-2 xl:col-span-3">{error}</p>
          ) : null}

          <div className="md:col-span-2 xl:col-span-3">
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

        {/* Live preview — first on mobile */}
        <aside className="order-1 min-w-0 lg:sticky lg:top-6 lg:order-2 lg:self-start">
          <div className="overflow-hidden rounded-xl border border-line bg-white">
            <div className="bg-brand-red px-4 py-3 text-sm font-semibold text-white">
              พรีวิวสรุปคำขอใบเสนอราคา
            </div>
            <div className="max-h-[50vh] space-y-3 overflow-y-auto p-4 text-sm lg:max-h-none lg:overflow-visible">
              <PreviewRow label="ชื่อผู้ติดต่อ" value={preview.contactName} />
              <PreviewRow label="ตำแหน่งงาน" value={preview.jobTitle} />
              <PreviewRow label="เบอร์โทรศัพท์" value={preview.phone} />
              <PreviewRow label="ประเภทผู้ติดต่อ" value={preview.contactType} />
              <PreviewRow label="ชื่อธุรกิจ" value={preview.businessName} />
              <PreviewRow label="E-mail" value={preview.email} />
              <PreviewRow label="ประเภทสินค้า" value={preview.productType} />
              <PreviewRow
                label="ที่อยู่ติดตั้ง/ส่งของ"
                value={preview.installAddress}
              />
              <PreviewRow
                label="ที่อยู่ใบเสนอราคา"
                value={
                  preview.sameBilling
                    ? preview.installAddress
                      ? "เดียวกับที่อยู่ติดตั้ง"
                      : ""
                    : preview.billingAddress
                }
              />
              <PreviewRow label="เลขผู้เสียภาษี" value={preview.taxId} />
              <PreviewRow label="วันที่สะดวกติดต่อ" value={preview.callbackDate} />
              <PreviewRow label="หาเราเจอจาก" value={preview.referralSource} />
              <PreviewRow
                label="แนบภาพหน้างาน"
                value={preview.siteImageName || ""}
              />

              <div>
                <div className="text-xs text-muted">
                  ขนาดที่ต้องการ ({sizeLines.length} รายการ)
                </div>
                {sizeLines.length === 0 ? (
                  <div className="mt-1 text-ink/40">-</div>
                ) : (
                  <ol className="mt-1 list-decimal space-y-1 pl-5 text-ink">
                    {sizeLines.map((line, i) => (
                      <li key={`${line}-${i}`}>{line}</li>
                    ))}
                  </ol>
                )}
              </div>

              <PreviewRow label="หมายเหตุ" value={preview.note} />
            </div>
            <div className="border-t border-line bg-paper px-4 py-3 text-xs text-muted">
              ตรวจทานข้อมูลก่อนกดส่งแบบฟอร์ม — ทีมงานจะติดต่อกลับตามช่องทางที่ให้ไว้
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}

function PreviewRow({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-0.5 whitespace-pre-wrap text-ink">
        {value?.trim() ? value : <span className="text-ink/40">-</span>}
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
  value,
  onChange,
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  className?: string;
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
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-line bg-white px-3 py-2 outline-none focus:border-navy"
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
