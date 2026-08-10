"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { adminHref } from "@/lib/admin-nav";
import {
  builtInSeoDefaults,
  normalizeSeoDefaults,
  type SeoDefaults,
} from "@/lib/seo/seo-defaults";

type SeoSettingsBoardProps = {
  basePath: string;
  initial: SeoDefaults;
};

export function SeoSettingsBoard({
  basePath,
  initial,
}: SeoSettingsBoardProps) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof SeoDefaults>(key: K, value: SeoDefaults[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/seo-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalizeSeoDefaults(form)),
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
        updatedAt?: string;
      } | null;
      if (!res.ok || !data?.ok) {
        setError(data?.error || "บันทึกไม่สำเร็จ");
        return;
      }
      setMessage(
        data.updatedAt
          ? `บันทึกแล้ว · ${new Date(data.updatedAt).toLocaleString("th-TH")}`
          : "บันทึกแล้ว",
      );
    } catch {
      setError("เครือข่ายมีปัญหา — ลองใหม่");
    } finally {
      setSaving(false);
    }
  }

  function resetBuiltIn() {
    setForm(builtInSeoDefaults());
    setMessage(null);
    setError(null);
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
          SEO / Meta เริ่มต้น
        </h2>
        <p className="mt-1 text-sm text-muted">
          ชื่อและคำอธิบายเริ่มต้นของไซต์ + รูปแชร์โซเชียลเมื่อหน้านั้นไม่มีรูปของตัวเอง
          — เก็บใน{" "}
          <code className="text-xs">site_settings.seo.defaults</code>
        </p>
        <p className="mt-2 text-xs text-muted">
          Redirect table / maintenance mode ยังไม่รอบนี้
        </p>
      </section>

      <form
        onSubmit={onSave}
        className="space-y-4 rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6"
      >
        <label className="block text-xs text-muted">
          Default title
          <input
            value={form.defaultTitle}
            onChange={(e) => set("defaultTitle", e.target.value)}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm text-navy"
            required
          />
        </label>
        <label className="block text-xs text-muted">
          Default description
          <textarea
            value={form.defaultDescription}
            onChange={(e) => set("defaultDescription", e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm text-navy"
            required
          />
        </label>
        <label className="block text-xs text-muted">
          Default OG image (path หรือ URL)
          <input
            value={form.ogImage}
            onChange={(e) => set("ogImage", e.target.value)}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm text-navy"
            placeholder="/images/generated/ct-hero-living.webp"
            required
          />
          <span className="mt-1 block text-[11px] text-muted">
            แนะนำภาพแนวนอนประมาณ 1200×630
          </span>
        </label>

        {form.ogImage ? (
          <div className="overflow-hidden rounded-xl border border-line bg-paper">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={form.ogImage}
              alt="OG preview"
              className="max-h-48 w-full object-cover"
            />
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <div className="space-y-1 text-xs">
            {message ? <p className="text-emerald-700">{message}</p> : null}
            {error ? <p className="text-brand-red">{error}</p> : null}
            {!message && !error ? (
              <p className="text-muted">ว่างไว้แล้วระบบใช้ค่าจาก site-config</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={resetBuiltIn}
              className="rounded-xl border border-line px-4 py-2 text-sm text-navy hover:bg-paper"
            >
              คืนค่า built-in
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-deep disabled:opacity-60"
            >
              <Save className="size-4" />
              {saving ? "กำลังบันทึก…" : "บันทึก"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
