"use client";

import { useCallback, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Check, Files, Loader2, MapPin, UserRound, X, type LucideIcon } from "lucide-react";
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
import { siteConfig } from "@/lib/site-config";
import {
  VISIT_PURPOSES,
  VISIT_SESSION_LABELS,
  VISIT_SESSIONS,
  VISIT_SITES,
  type VisitSiteId,
} from "@/lib/visits/types";

function todayInputValue() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const factoryAddress = [
  siteConfig.address.line1,
  siteConfig.address.line2,
  siteConfig.address.city,
].join(" ");

export function FactoryVisitForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const minDate = useMemo(() => todayInputValue(), []);
  const [pending, setPending] = useState(false);
  const [pendingLabel, setPendingLabel] = useState("กำลังส่งคำขอ...");
  const [error, setError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [session, setSession] = useState<(typeof VISIT_SESSIONS)[number]>("morning");
  const [visitSites, setVisitSites] = useState<VisitSiteId[]>([]);
  const [documents, setDocuments] = useState<VisitDocItem[]>([]);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const onTurnstile = useCallback((token: string | null) => {
    setTurnstileToken(token);
  }, []);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setPendingLabel("กำลังส่งคำขอ...");
    setError(null);

    if (isTurnstileEnabled() && !turnstileToken) {
      setError("กรุณายืนยันว่าคุณไม่ใช่บอท");
      setPending(false);
      return;
    }

    if (visitSites.length === 0) {
      setError("กรุณาเลือกสถานที่ที่ต้องการเยี่ยมชม");
      setPending(false);
      return;
    }

    if (documents.length === 0) {
      setError("กรุณาแนบ Company Profile หรือนามบัตร");
      setPending(false);
      return;
    }

    formData.set("session", session);
    formData.set("pdpaAccepted", formData.get("pdpaAccepted") === "on" ? "true" : "false");
    if (turnstileToken) formData.set("turnstileToken", turnstileToken);
    formData.delete("visitSites");
    for (const id of visitSites) formData.append("visitSites", id);

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
      setVisitSites([]);
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
        <div className="divide-y divide-line">
        <Section title="ข้อมูลผู้ติดต่อ" icon={UserRound}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="ชื่อ-นามสกุล" name="fullName" autoComplete="name" required />
          <Field
            label="ตำแหน่งผู้ติดต่อ"
            name="contactPosition"
            autoComplete="organization-title"
            placeholder="เช่น ผู้จัดการฝ่ายจัดซื้อ, เจ้าของกิจการ"
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="ชื่อบริษัท/องค์กร"
            name="businessName"
            autoComplete="organization"
            required
          />
          <Field
            label="เลขนิติบุคคล หรือเลขบัตรประชาชน"
            name="taxId"
            inputMode="numeric"
            placeholder="13 หลัก เช่น 1-2345-67890-12-3"
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="เบอร์โทรศัพท์" name="phone" type="tel" autoComplete="tel" required />
          <Field label="อีเมล" name="email" type="email" autoComplete="email" required />
        </div>
        <Field label="LINE ID" name="lineId" required />
        </Section>

        <Section title="สถานที่และรอบเยี่ยมชม" icon={MapPin}>
        <div>
          <span className="mb-2 flex gap-1 text-sm font-medium text-ink">
            ต้องการเยี่ยมชมสถานที่ไหน
            <span className="text-brand-red">*</span>
          </span>
          <p className="mb-3 text-xs text-muted">
            เลือกได้มากกว่า 1 ที่ หรือเลือกไปทั้ง 3 ที่
          </p>
          <label
            className={`mb-3 flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${
              visitSites.length === VISIT_SITES.length
                ? "border-navy bg-paper"
                : "border-line bg-white hover:border-navy/40"
            }`}
          >
            <input
              type="checkbox"
              checked={visitSites.length === VISIT_SITES.length}
              onChange={() =>
                setVisitSites(
                  visitSites.length === VISIT_SITES.length
                    ? []
                    : VISIT_SITES.map((s) => s.id),
                )
              }
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-semibold text-navy">ไปทั้ง 3 ที่</span>
              <span className="block text-xs text-muted">
                นัดเยี่ยมชมครบทั้ง 3 สถานที่ผลิต
              </span>
            </span>
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            {VISIT_SITES.map((site) => {
              const checked = visitSites.includes(site.id);
              return (
                <label
                  key={site.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${
                    checked ? "border-navy bg-paper" : "border-line bg-white hover:border-navy/40"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      setVisitSites((prev) =>
                        prev.includes(site.id)
                          ? prev.filter((id) => id !== site.id)
                          : [...prev, site.id],
                      )
                    }
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-xs font-semibold text-muted">{site.no}</span>
                    <span className="block text-sm font-semibold text-navy">{site.titleEn}</span>
                    <span className="block text-xs text-muted">{site.titleTh}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <span className="mb-2 flex gap-1 text-sm font-medium text-ink">
            เลือกรอบเยี่ยมชม
            <span className="text-brand-red">*</span>
          </span>
          <div className="grid gap-3 sm:grid-cols-2">
            {VISIT_SESSIONS.map((s) => (
              <label
                key={s}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${
                  session === s ? "border-navy bg-paper" : "border-line bg-white hover:border-navy/40"
                }`}
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
                    {s === "morning" ? "รอบเช้า" : "รอบเย็น"}
                  </span>
                  <span className="block text-xs text-muted">{VISIT_SESSION_LABELS[s]}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 flex gap-1 text-sm font-medium text-ink">
              วันที่ต้องการเข้าเยี่ยมชม
              <span className="text-brand-red">*</span>
            </span>
            <input
              name="visitDate"
              type="date"
              min={minDate}
              required
              defaultValue=""
              className="w-full rounded-xl border border-line bg-field px-3 py-2.5 text-sm outline-none focus:border-navy"
            />
          </label>
          <label className="block">
            <span className="mb-1 flex gap-1 text-sm font-medium text-ink">
              จำนวนผู้เข้าเยี่ยมชม (คน)
              <span className="text-brand-red">*</span>
            </span>
            <input
              name="visitorCount"
              type="number"
              min={1}
              max={100}
              defaultValue={1}
              required
              className="w-full rounded-xl border border-line bg-field px-3 py-2.5 text-sm outline-none focus:border-navy"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 flex gap-1 text-sm font-medium text-ink">
            วัตถุประสงค์การเยี่ยมชม
            <span className="text-brand-red">*</span>
          </span>
          <select
            name="purpose"
            defaultValue=""
            required
            className="w-full rounded-xl border border-line bg-field px-3 py-2.5 text-sm outline-none focus:border-navy"
          >
            <option value="" disabled>
              เลือกวัตถุประสงค์
            </option>
            {VISIT_PURPOSES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        <Field
          label="สินค้าที่สนใจ"
          name="productInterest"
          placeholder="เช่น ผ้าม่าน, ม่านม้วน, ม่านไฟฟ้า"
          required
        />
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
            placeholder="เช่น ต้องการล่ามภาษา, มีผู้สูงอายุ/ผู้พิการร่วมเยี่ยมชม ฯลฯ"
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
          {pending ? pendingLabel : "ส่งคำขอนัดเยี่ยมชม"}
        </button>
        <p className="text-xs text-muted">
          ทีมงานจะติดต่อกลับเพื่อยืนยันวันเวลาก่อนวันเยี่ยมชมจริง — คำขอนี้ยังไม่ใช่การยืนยันการนัด
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
            aria-labelledby="visit-success-title"
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
              id="visit-success-title"
              className="mt-4 font-display text-lg font-semibold text-navy sm:text-xl"
            >
              ได้รับคำขอของท่านแล้ว
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              ขอบคุณที่ให้ความสนใจเยี่ยมชมโรงงานช่างตี๋ ผ้าม่าน
              ทีมงานได้รับข้อมูลเรียบร้อยแล้ว และจะติดต่อกลับเพื่อยืนยันวันเวลา
              ภายใน 1 วันทำการ
            </p>
            <div className="mt-4 rounded-xl border border-line bg-paper px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                สถานที่โรงงาน
              </p>
              <p className="mt-1 text-sm leading-relaxed text-navy">{factoryAddress}</p>
              <a
                href={siteConfig.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy/90"
              >
                <MapPin className="size-4" aria-hidden />
                เปิดแผนที่โรงงาน
              </a>
            </div>
            <button
              type="button"
              onClick={() => setSuccessOpen(false)}
              className="mt-5 w-full rounded-full border border-line px-4 py-2.5 text-sm font-semibold text-navy hover:bg-paper"
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

