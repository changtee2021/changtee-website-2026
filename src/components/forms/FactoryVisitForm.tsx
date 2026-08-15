"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PdpaConsentField } from "@/components/forms/PdpaConsentField";
import {
  isTurnstileEnabled,
  TurnstileField,
} from "@/components/forms/TurnstileField";
import {
  VISIT_PURPOSES,
  VISIT_SESSION_LABELS,
  VISIT_SESSIONS,
} from "@/lib/visits/types";

function todayInputValue() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function FactoryVisitForm() {
  const router = useRouter();
  const minDate = useMemo(() => todayInputValue(), []);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<(typeof VISIT_SESSIONS)[number]>("morning");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const onTurnstile = useCallback((token: string | null) => {
    setTurnstileToken(token);
  }, []);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    if (isTurnstileEnabled() && !turnstileToken) {
      setError("กรุณายืนยันว่าคุณไม่ใช่บอท");
      setPending(false);
      return;
    }

    const payload = {
      fullName: String(formData.get("fullName") || ""),
      phone: String(formData.get("phone") || ""),
      email: String(formData.get("email") || ""),
      lineId: String(formData.get("lineId") || ""),
      businessName: String(formData.get("businessName") || ""),
      visitDate: String(formData.get("visitDate") || ""),
      session,
      visitorCount: Number(formData.get("visitorCount") || 1),
      purpose: String(formData.get("purpose") || ""),
      productInterest: String(formData.get("productInterest") || ""),
      note: String(formData.get("note") || ""),
      pdpaAccepted: formData.get("pdpaAccepted") === "on",
      turnstileToken: turnstileToken || undefined,
    };

    try {
      const res = await fetch("/api/factory-visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "ส่งคำขอไม่สำเร็จ");
      router.push("/thank-you");
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      setPending(false);
    }
  }

  return (
    <form action={onSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="ชื่อ-นามสกุล" name="fullName" autoComplete="name" required />
        <Field label="ชื่อบริษัท/องค์กร (ถ้ามี)" name="businessName" autoComplete="organization" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="เบอร์โทรศัพท์" name="phone" type="tel" autoComplete="tel" required />
        <Field label="อีเมล" name="email" type="email" autoComplete="email" />
      </div>
      <Field label="LINE ID (กรุณากรอก LINE หรืออีเมลอย่างน้อย 1 ช่อง)" name="lineId" />

      <div>
        <span className="mb-2 block text-sm font-medium text-ink">เลือกรอบเยี่ยมชม</span>
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
          <span className="mb-1 block text-sm font-medium text-ink">วันที่ต้องการเข้าเยี่ยมชม</span>
          <input
            name="visitDate"
            type="date"
            min={minDate}
            required
            defaultValue=""
            className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-navy"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">จำนวนผู้เข้าเยี่ยมชม (คน)</span>
          <input
            name="visitorCount"
            type="number"
            min={1}
            max={100}
            defaultValue={1}
            required
            className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-navy"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink">วัตถุประสงค์การเยี่ยมชม</span>
        <select
          name="purpose"
          defaultValue=""
          className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-navy"
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

      <Field label="สินค้าที่สนใจ (ถ้ามี)" name="productInterest" placeholder="เช่น ผ้าม่าน, ม่านม้วน, ม่านไฟฟ้า" />

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink">หมายเหตุเพิ่มเติม</span>
        <textarea
          name="note"
          rows={3}
          placeholder="เช่น ต้องการล่ามภาษา, มีผู้สูงอายุ/ผู้พิการร่วมเยี่ยมชม ฯลฯ"
          className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-navy"
        />
      </label>

      <PdpaConsentField />
      <TurnstileField onToken={onTurnstile} />
      {error ? (
        <p className="text-sm text-brand-red" role="alert" aria-live="polite">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-red-soft disabled:opacity-60 sm:w-auto"
      >
        {pending ? "กำลังส่งคำขอ..." : "ส่งคำขอนัดเยี่ยมชม"}
      </button>
      <p className="text-xs text-muted">
        ทีมงานจะติดต่อกลับเพื่อยืนยันวันเวลาก่อนวันเยี่ยมชมจริง — คำขอนี้ยังไม่ใช่การยืนยันการนัด
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  required,
  type = "text",
  autoComplete,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        inputMode={type === "tel" ? "tel" : undefined}
        className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-navy"
      />
    </label>
  );
}
