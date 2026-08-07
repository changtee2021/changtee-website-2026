"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { PdpaConsentField } from "@/components/forms/PdpaConsentField";
import {
  isTurnstileEnabled,
  TurnstileField,
} from "@/components/forms/TurnstileField";

type Props = {
  source?: "quote" | "contact" | "fab";
  productInterest?: string;
  submitLabel?: string;
};

export function LeadForm({
  source = "quote",
  productInterest,
  submitLabel = "ส่งข้อมูล",
}: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      source,
      fullName: String(formData.get("fullName") || ""),
      phone: String(formData.get("phone") || ""),
      lineId: String(formData.get("lineId") || ""),
      email: String(formData.get("email") || ""),
      message: String(formData.get("message") || ""),
      productInterest: productInterest || String(formData.get("productInterest") || ""),
      pdpaAccepted: formData.get("pdpaAccepted") === "on",
      turnstileToken: turnstileToken || undefined,
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "ส่งข้อมูลไม่สำเร็จ");
      router.push("/thank-you");
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      setPending(false);
    }
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <Field label="ชื่อ-นามสกุล" name="fullName" required />
      <Field label="เบอร์โทร" name="phone" required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="LINE ID" name="lineId" />
        <Field label="อีเมล" name="email" type="email" />
      </div>
      {!productInterest ? (
        <Field label="สินค้าที่สนใจ" name="productInterest" />
      ) : null}
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink">รายละเอียดเพิ่มเติม</span>
        <textarea
          name="message"
          rows={4}
          className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-navy"
        />
      </label>
      <PdpaConsentField />
      <TurnstileField onToken={onTurnstile} />
      {error ? <p className="text-sm text-brand-red">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-brand-red px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "กำลังส่ง..." : submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  required,
  type = "text",
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-navy"
      />
    </label>
  );
}
