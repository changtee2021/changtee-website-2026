"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import {
  DEMO_COMPANY_SETTINGS,
  type CompanySettings,
} from "@/lib/admin-settings";
import { adminHref } from "@/lib/admin-nav";

type CompanySettingsBoardProps = {
  basePath: string;
};

export function CompanySettingsBoard({ basePath }: CompanySettingsBoardProps) {
  const [form, setForm] = useState<CompanySettings>(DEMO_COMPANY_SETTINGS);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function set<K extends keyof CompanySettings>(key: K, value: CompanySettings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSavedAt(new Date().toLocaleString("th-TH"));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
        <Link
          href={adminHref(basePath, "/settings")}
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-navy"
        >
          <ArrowLeft className="size-4" />
          ตั้งค่าระบบ
        </Link>
        <h2 className="mt-3 font-display text-xl font-semibold text-navy sm:text-2xl">
          ข้อมูลบริษัท / ติดต่อ
        </h2>
        <p className="mt-1 text-sm text-muted">
          ใช้แสดงบนเว็บและเอกสาร — บันทึกในหน้านี้ (demo) รอเชื่อม{" "}
          <code className="text-xs">site_settings</code>
        </p>
      </section>

      <form
        onSubmit={onSave}
        className="space-y-4 rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="ชื่อบริษัท"
            value={form.companyName}
            onChange={(v) => set("companyName", v)}
          />
          <Field
            label="ชื่อทางการค้า (EN)"
            value={form.tradeName}
            onChange={(v) => set("tradeName", v)}
          />
          <label className="text-xs text-muted sm:col-span-2">
            ที่อยู่
            <textarea
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm text-navy"
            />
          </label>
          <Field label="เบอร์โทร" value={form.phone} onChange={(v) => set("phone", v)} />
          <Field label="LINE ID" value={form.lineId} onChange={(v) => set("lineId", v)} />
          <Field
            label="อีเมลติดต่อ"
            value={form.email}
            onChange={(v) => set("email", v)}
          />
          <Field
            label="เวลาทำการ"
            value={form.hours}
            onChange={(v) => set("hours", v)}
          />
          <Field
            label="ลิงก์แผนที่"
            value={form.mapUrl}
            onChange={(v) => set("mapUrl", v)}
            className="sm:col-span-2"
          />
          <Field label="USP / สโลแกน" value={form.usp} onChange={(v) => set("usp", v)} />
          <label className="text-xs text-muted">
            การรับประกัน (ปี)
            <input
              type="number"
              min={0}
              value={form.warrantyYears}
              onChange={(e) => set("warrantyYears", Number(e.target.value) || 0)}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm text-navy"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <p className="text-xs text-muted">
            {savedAt ? `บันทึก demo ล่าสุด: ${savedAt}` : "ยังไม่ได้บันทึกในรอบนี้"}
          </p>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-deep"
          >
            <Save className="size-4" />
            บันทึก (demo)
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <label className={`text-xs text-muted ${className || ""}`}>
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm text-navy"
      />
    </label>
  );
}
