"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PdpaConsentField } from "@/components/forms/PdpaConsentField";
import { companyInquiryTypes } from "@/lib/about-content";

export function CompanyContactForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    const payload = {
      source: "contact" as const,
      fullName: String(formData.get("fullName") || ""),
      phone: String(formData.get("phone") || ""),
      lineId: String(formData.get("lineId") || ""),
      email: String(formData.get("email") || ""),
      companyName: String(formData.get("companyName") || ""),
      jobTitle: String(formData.get("jobTitle") || ""),
      inquiryType: String(formData.get("inquiryType") || ""),
      message: String(formData.get("message") || ""),
      pdpaAccepted: formData.get("pdpaAccepted") === "on",
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
      <Field label="ชื่อบริษัท / องค์กร" name="companyName" required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="ชื่อผู้ติดต่อ" name="fullName" required />
        <Field label="ตำแหน่ง" name="jobTitle" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="เบอร์โทร" name="phone" required />
        <Field label="อีเมล" name="email" type="email" required />
      </div>
      <Field label="LINE ID (ถ้ามี)" name="lineId" />
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink">เรื่องที่ติดต่อ</span>
        <select
          name="inquiryType"
          required
          defaultValue=""
          className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-navy"
        >
          <option value="" disabled>
            เลือกหัวข้อ
          </option>
          {companyInquiryTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink">รายละเอียด</span>
        <textarea
          name="message"
          rows={4}
          placeholder="บอกโปรเจกต์ จำนวนสาขา ช่วงเวลาที่ต้องการติดต่อกลับ ฯลฯ"
          className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-navy"
        />
      </label>
      <PdpaConsentField />
      {error ? <p className="text-sm text-brand-red">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-red-soft disabled:opacity-60"
      >
        {pending ? "กำลังส่ง..." : "ส่งข้อความถึงเรา"}
      </button>
      <p className="text-xs text-muted">
        ต้องการใบเสนอราคาสำหรับบ้าน/คอนโด?{" "}
        <a href="/quote" className="font-medium text-navy underline">
          ไปที่ฟอร์มขอใบเสนอราคา
        </a>
      </p>
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
        className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-navy"
      />
    </label>
  );
}
