"use client";

import { useCallback, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  Building2,
  Check,
  Clock,
  Files,
  Loader2,
  Presentation,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { PdpaConsentField } from "@/components/forms/PdpaConsentField";
import {
  VisitDocumentsField,
  revokeVisitDocs,
  type VisitDocItem,
} from "@/components/forms/VisitDocumentsField";
import { readJsonResponse } from "@/lib/leads/site-media";
import { attachVisitDocuments } from "@/lib/visits/visit-media";
import { MarketingConsentField } from "@/components/forms/MarketingConsentField";
import {
  isTurnstileEnabled,
  TurnstileField,
} from "@/components/forms/TurnstileField";
import {
  COMPANY_INDUSTRIES,
  LEGAL_ENTITY_TYPES,
  PRESENTATION_PRODUCTS,
  PRESENTATION_VENUES,
  type PresentationVenueId,
} from "@/lib/visits/presentation";
import {
  VISIT_SESSION_LABELS,
  VISIT_SESSIONS,
} from "@/lib/visits/types";
import { cn } from "@/lib/utils";

function todayInputValue() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function ProductPresentationForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const minDate = useMemo(() => todayInputValue(), []);
  const [pending, setPending] = useState(false);
  const [pendingLabel, setPendingLabel] = useState("กำลังส่งคำขอ...");
  const [error, setError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [session, setSession] = useState<(typeof VISIT_SESSIONS)[number]>("morning");
  const [venue, setVenue] = useState<PresentationVenueId>("company");
  const [products, setProducts] = useState<string[]>([]);
  const [documents, setDocuments] = useState<VisitDocItem[]>([]);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const onTurnstile = useCallback((token: string | null) => {
    setTurnstileToken(token);
  }, []);

  const allProductsSelected = products.length === PRESENTATION_PRODUCTS.length;

  function toggleProduct(name: string) {
    setProducts((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name],
    );
  }

  function toggleAllProducts() {
    setProducts(allProductsSelected ? [] : [...PRESENTATION_PRODUCTS]);
  }

  async function onSubmit(formData: FormData) {
    setPending(true);
    setPendingLabel("กำลังส่งคำขอ...");
    setError(null);

    if (isTurnstileEnabled() && !turnstileToken) {
      setError("กรุณายืนยันว่าคุณไม่ใช่บอท");
      setPending(false);
      return;
    }
    if (products.length === 0) {
      setError("กรุณาเลือกสินค้าที่อยากให้พรีเซนต์อย่างน้อย 1 รายการ");
      setPending(false);
      return;
    }

    if (documents.length === 0) {
      setError("กรุณาแนบ Company Profile หรือนามบัตร");
      setPending(false);
      return;
    }

    formData.set("bookingKind", "product-presentation");
    formData.set("session", session);
    formData.set("presentationVenue", venue);
    formData.set("pdpaAccepted", formData.get("pdpaAccepted") === "on" ? "true" : "false");
    if (turnstileToken) formData.set("turnstileToken", turnstileToken);
    formData.delete("products");
    for (const name of products) formData.append("products", name);

    try {
      setPendingLabel("กำลังอัปโหลดไฟล์...");
      await attachVisitDocuments(
        formData,
        documents.map((item) => item.file),
      );
      setPendingLabel("กำลังส่งคำขอ...");
      const res = await fetch("/api/factory-visits", {
        method: "POST",
        body: formData,
      });
      const json = await readJsonResponse<{ error?: string }>(res);
      if (!res.ok) throw new Error(json.error || "ส่งคำขอไม่สำเร็จ");
      formRef.current?.reset();
      setSession("morning");
      setVenue("company");
      setProducts([]);
      revokeVisitDocs(documents);
      setDocuments([]);
      setTurnstileToken(null);
      setSuccessOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setPending(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(new FormData(event.currentTarget));
  }

  return (
    <>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-xl border border-navy/15 bg-paper px-4 py-3 text-sm leading-relaxed text-navy">
          ฟอร์มนี้รับเฉพาะนิติบุคคลและองค์กร หากเป็นบ้านพักอาศัยหรือคอนโดส่วนตัว
          กรุณาใช้หน้า{" "}
          <a href="/quote" className="font-semibold underline underline-offset-2">
            ขอใบเสนอราคา
          </a>
        </div>

        <div className="divide-y divide-line">
        <Section title="ข้อมูลนิติบุคคล" icon={Building2}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="ชื่อบริษัทตามหนังสือรับรอง"
              name="businessName"
              autoComplete="organization"
              required
            />
            <SelectField
              label="ประเภทนิติบุคคล"
              name="legalEntityType"
              options={LEGAL_ENTITY_TYPES}
              placeholder="เลือกประเภท"
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="เลขทะเบียนนิติบุคคล"
              name="taxId"
              inputMode="numeric"
              placeholder="13 หลัก เช่น 0105551234567"
              required
            />
            <SelectField
              label="ประเภทธุรกิจ"
              name="industry"
              options={COMPANY_INDUSTRIES}
              placeholder="เลือกประเภทธุรกิจ"
              required
            />
          </div>
          <label className="block">
            <span className="mb-1 flex gap-1 text-sm font-medium text-ink">
              ที่อยู่สำนักงาน
              <span className="text-brand-red">*</span>
            </span>
            <textarea
              name="officeAddress"
              rows={2}
              required
              placeholder="บ้านเลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด"
              className="w-full rounded-xl border border-line bg-field px-3 py-2.5 text-sm outline-none focus:border-navy"
            />
          </label>
        </Section>

        <Section title="ผู้ติดต่อจากบริษัท" icon={UserRound}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ชื่อ-นามสกุล" name="fullName" autoComplete="name" required />
            <Field
              label="ตำแหน่ง"
              name="contactPosition"
              autoComplete="organization-title"
              placeholder="เช่น ผู้จัดการฝ่ายจัดซื้อ, ฝ่ายอาคาร"
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ฝ่าย / แผนก" name="department" placeholder="ไม่บังคับ" />
            <Field label="เบอร์โทรศัพท์" name="phone" type="tel" autoComplete="tel" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="อีเมลบริษัท" name="email" type="email" autoComplete="email" required />
            <Field label="LINE ID" name="lineId" placeholder="ไม่บังคับ" />
          </div>
        </Section>

        <Section title="นัดนำเสนอ" icon={Presentation}>
          <div>
            <span className="mb-2 flex gap-1 text-sm font-medium text-ink">
              สถานที่นำเสนอ
              <span className="text-brand-red">*</span>
            </span>
            <div className="grid gap-3">
              {PRESENTATION_VENUES.map((item) => (
                <label
                  key={item.id}
                  className={cn(
                    "flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition",
                    venue === item.id
                      ? "border-navy bg-paper"
                      : "border-line bg-white hover:border-navy/40",
                  )}
                >
                  <input
                    type="radio"
                    name="venueRadio"
                    value={item.id}
                    checked={venue === item.id}
                    onChange={() => setVenue(item.id)}
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-navy">{item.label}</span>
                    <span className="block text-xs text-muted">{item.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {venue === "company" ? (
            <label className="block">
              <span className="mb-1 flex gap-1 text-sm font-medium text-ink">
                ที่อยู่ที่ต้องการให้ทีมเข้าพบ
                <span className="text-brand-red">*</span>
              </span>
              <textarea
                name="venueAddress"
                rows={2}
                required
                placeholder="ถ้าต่างจากสำนักงาน ให้ระบุอาคาร / ชั้น / จุดนัดพบ"
                className="w-full rounded-xl border border-line bg-field px-3 py-2.5 text-sm outline-none focus:border-navy"
              />
            </label>
          ) : null}

          <div>
            <span className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink">
              <Clock className="size-3.5 shrink-0 text-brand-red" aria-hidden />
              เลือกรอบเวลา
              <span className="text-brand-red">*</span>
            </span>
            <div className="grid gap-3 sm:grid-cols-2">
              {VISIT_SESSIONS.map((s) => (
                <label
                  key={s}
                  className={cn(
                    "flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition",
                    session === s
                      ? "border-navy bg-paper"
                      : "border-line bg-white hover:border-navy/40",
                  )}
                >
                  <input
                    type="radio"
                    name="sessionRadio"
                    value={s}
                    checked={session === s}
                    onChange={() => setSession(s)}
                    required
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-navy">
                      {s === "morning" ? "รอบเช้า" : "รอบบ่าย"}
                    </span>
                    <span className="block text-xs text-muted">
                      {VISIT_SESSION_LABELS[s]}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 flex gap-1 text-sm font-medium text-ink">
                วันที่ต้องการ
                <span className="text-brand-red">*</span>
              </span>
              <input
                name="visitDate"
                type="date"
                min={minDate}
                required
                className="w-full rounded-xl border border-line bg-field px-3 py-2.5 text-sm outline-none focus:border-navy"
              />
            </label>
            <label className="block">
              <span className="mb-1 flex gap-1 text-sm font-medium text-ink">
                จำนวนผู้เข้าร่วม (คน)
                <span className="text-brand-red">*</span>
              </span>
              <input
                name="visitorCount"
                type="number"
                min={1}
                max={40}
                defaultValue={2}
                required
                className="w-full rounded-xl border border-line bg-field px-3 py-2.5 text-sm outline-none focus:border-navy"
              />
            </label>
          </div>

          <div>
            <span className="mb-2 flex gap-1 text-sm font-medium text-ink">
              สินค้าที่อยากให้พรีเซนต์
              <span className="text-brand-red">*</span>
            </span>
            <p className="mb-3 text-xs text-muted">เลือกได้มากกว่า 1 รายการ หรือเลือกทั้งหมด</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={toggleAllProducts}
                aria-pressed={allProductsSelected}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-full border px-3 text-xs font-semibold transition sm:min-h-9",
                  allProductsSelected
                    ? "border-navy bg-navy text-white"
                    : "border-navy/40 bg-paper text-navy hover:border-navy",
                )}
              >
                {allProductsSelected ? "ยกเลิกทั้งหมด" : "เลือกทั้งหมด"}
              </button>
              {PRESENTATION_PRODUCTS.map((name) => {
                const checked = products.includes(name);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggleProduct(name)}
                    aria-pressed={checked}
                    className={cn(
                      "inline-flex min-h-11 items-center rounded-full border px-3 text-xs font-medium transition sm:min-h-9",
                      checked
                        ? "border-navy bg-navy text-white"
                        : "border-line bg-white text-navy hover:border-navy/40",
                    )}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
        </Section>

        <Section title="เอกสารและหมายเหตุ" icon={Files}>
          <VisitDocumentsField files={documents} onFiles={setDocuments} />
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink">
              หมายเหตุเพิ่มเติม
              <span className="ml-1 text-xs font-normal text-muted">(ไม่บังคับ)</span>
            </span>
            <textarea
              name="note"
              rows={3}
              placeholder="เช่น ห้องประชุมชั้น 12, ต้องมีใบเข้าอาคาร, จอดรถอาคาร B"
              className="w-full rounded-xl border border-line bg-field px-3 py-2 text-sm outline-none focus:border-navy"
            />
          </label>
        </Section>
        </div>

        <PdpaConsentField />
        <MarketingConsentField />
        <TurnstileField onToken={onTurnstile} />
        {error ? (
          <p className="text-sm text-brand-red" role="alert" aria-live="polite">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-red-soft disabled:opacity-60 sm:w-auto"
        >
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {pending ? pendingLabel : "ส่งคำขอนัดนำเสนอ"}
        </button>
        <p className="text-xs text-muted">
          ทีมงานจะโทรยืนยันวันเวลาก่อนเข้าพบ — คำขอนี้ยังไม่ใช่การยืนยันการนัด
        </p>
      </form>

      {successOpen ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 sm:items-center sm:p-4">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="ปิดข้อความ"
            onClick={() => setSuccessOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="presentation-success-title"
            className="relative z-10 w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl sm:p-6"
          >
            <button
              type="button"
              onClick={() => setSuccessOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-2 text-muted hover:bg-paper hover:text-navy"
              aria-label="ปิด"
            >
              <X className="size-5" />
            </button>
            <div className="flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <Check className="size-6" aria-hidden />
            </div>
            <h3
              id="presentation-success-title"
              className="mt-4 font-display text-lg font-semibold text-navy sm:text-xl"
            >
              ได้รับคำขอนัดนำเสนอแล้ว
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              ขอบคุณที่ให้ความสนใจ ทีมงานจะติดต่อกลับเพื่อยืนยันวันเวลาภายใน 1 วันทำการ
              และจะไม่เดินทางเข้าพบโดยไม่ยืนยันล่วงหน้า
            </p>
            <button
              type="button"
              onClick={() => setSuccessOpen(false)}
              className="mt-5 min-h-11 w-full rounded-full border border-line px-4 py-2.5 text-sm font-semibold text-navy hover:bg-paper"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 py-6 first:pt-0 last:pb-0">
      <h3 className="flex items-center gap-1.5 text-sm font-semibold text-navy">
        <Icon className="size-3.5 shrink-0 text-brand-red" aria-hidden />
        {title}
      </h3>
      {children}
    </section>
  );
}

function Field({
  label,
  name,
  required,
  type = "text",
  autoComplete,
  placeholder,
  inputMode,
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  inputMode?: "tel" | "numeric";
}) {
  return (
    <label className="block">
      <span className="mb-1 flex gap-1 text-sm font-medium text-ink">
        {label}
        {required ? <span className="text-brand-red">*</span> : null}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        inputMode={inputMode ?? (type === "tel" ? "tel" : undefined)}
                className="w-full rounded-xl border border-line bg-field px-3 py-2.5 text-sm outline-none focus:border-navy"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  options: readonly string[];
  placeholder: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex gap-1 text-sm font-medium text-ink">
        {label}
        {required ? <span className="text-brand-red">*</span> : null}
      </span>
      <select
        name={name}
        defaultValue=""
        required={required}
                className="w-full rounded-xl border border-line bg-field px-3 py-2.5 text-sm outline-none focus:border-navy"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

