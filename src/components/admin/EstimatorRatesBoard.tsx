"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calculator, Save } from "lucide-react";
import {
  DEMO_ESTIMATOR,
  previewEstimate,
  type EstimatorSettings,
} from "@/lib/cms/estimator-demo";
import { adminHref } from "@/lib/admin-nav";
import { cn, formatBaht } from "@/lib/utils";
import { DemoBadge, Field, SelectField, TextArea } from "@/components/admin/cms/CmsShared";

type Tab = "rates" | "multipliers" | "preview";

type EstimatorRatesBoardProps = {
  basePath: string;
};

export function EstimatorRatesBoard({ basePath }: EstimatorRatesBoardProps) {
  const [settings, setSettings] = useState<EstimatorSettings>(DEMO_ESTIMATOR);
  const [tab, setTab] = useState<Tab>("rates");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [preview, setPreview] = useState({
    productSlug: DEMO_ESTIMATOR.rates[0]?.productSlug ?? "curtain",
    widthCm: 200,
    heightCm: 250,
    quantity: 1,
    fabricBoth: false,
    motorized: false,
    upcountry: false,
  });

  const result = useMemo(
    () => previewEstimate(settings, preview),
    [settings, preview],
  );

  function save() {
    setSavedAt(new Date().toLocaleString("th-TH"));
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
        <Link
          href={adminHref(basePath, "/settings")}
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-navy"
        >
          <ArrowLeft className="size-4" />
          ตั้งค่าระบบ
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-navy sm:text-2xl">
              อัตราประเมินราคา
            </h2>
            <p className="mt-1 text-sm text-muted">
              ตั้งเรทสำหรับหน้า <code className="text-xs">/estimate</code> — แสดงเป็นช่วงราคา
              ไม่ใช่ราคาสุดท้าย
              <span className="ml-1">
                <DemoBadge />
              </span>
            </p>
          </div>
          <label className="inline-flex items-center gap-2 rounded-xl border border-line bg-paper px-3 py-2 text-sm text-navy">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) =>
                setSettings((s) => ({ ...s, enabled: e.target.checked }))
              }
            />
            เปิดเครื่องคิดบนเว็บ
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {(
            [
              ["rates", "อัตราฐาน"],
              ["multipliers", "ตัวคูณ / ส่วนเพิ่ม"],
              ["preview", "ทดสอบคำนวณ"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-sm",
                tab === key
                  ? "border-navy bg-navy text-white"
                  : "border-line bg-paper text-ink hover:border-navy/30",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {tab === "rates" ? (
        <section className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6">
          <p className="mb-4 text-sm text-muted">
            หน่วยหลัก: <strong className="text-navy">บาท / ตร.ม.</strong> · ขั้นต่ำต่องานช่วยกันช่วงราคาต่ำเกินจริง
          </p>
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#f8fafc] text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">ประเภทสินค้า</th>
                  <th className="px-4 py-3 font-medium">บาท/ตร.ม.</th>
                  <th className="px-4 py-3 font-medium">ขั้นต่ำ (บาท)</th>
                  <th className="px-4 py-3 font-medium">ใช้ในเครื่องคิด</th>
                </tr>
              </thead>
              <tbody>
                {settings.rates.map((row, idx) => (
                  <tr key={row.productSlug} className="border-t border-line">
                    <td className="px-4 py-3 font-medium text-navy">
                      {row.productName}
                      <div className="text-[11px] font-normal text-muted">
                        {row.productSlug}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={0}
                        value={row.basePerSqm}
                        onChange={(e) => {
                          const v = Number(e.target.value) || 0;
                          setSettings((s) => {
                            const rates = [...s.rates];
                            rates[idx] = { ...rates[idx], basePerSqm: v };
                            return { ...s, rates };
                          });
                        }}
                        className="w-28 rounded-lg border border-line px-2 py-1.5 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={0}
                        value={row.minJob}
                        onChange={(e) => {
                          const v = Number(e.target.value) || 0;
                          setSettings((s) => {
                            const rates = [...s.rates];
                            rates[idx] = { ...rates[idx], minJob: v };
                            return { ...s, rates };
                          });
                        }}
                        className="w-28 rounded-lg border border-line px-2 py-1.5 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={row.enabled}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setSettings((s) => {
                            const rates = [...s.rates];
                            rates[idx] = { ...rates[idx], enabled: checked };
                            return { ...s, rates };
                          });
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === "multipliers" ? (
        <section className="space-y-4 rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm text-muted">
            ตัวคูณทับราคา mid ก่อนแตกช่วงต่ำ–สูง (เช่น โปร่ง+ทึบ = ×1.35)
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <NumMul
              label="โปร่ง + ทึบ (×)"
              value={settings.multipliers.fabricBoth}
              onChange={(v) =>
                setSettings((s) => ({
                  ...s,
                  multipliers: { ...s.multipliers, fabricBoth: v },
                }))
              }
            />
            <NumMul
              label="มีมอเตอร์ (×)"
              value={settings.multipliers.motorized}
              onChange={(v) =>
                setSettings((s) => ({
                  ...s,
                  multipliers: { ...s.multipliers, motorized: v },
                }))
              }
            />
            <NumMul
              label="ต่างจังหวัด (×)"
              value={settings.multipliers.upcountry}
              onChange={(v) =>
                setSettings((s) => ({
                  ...s,
                  multipliers: { ...s.multipliers, upcountry: v },
                }))
              }
            />
            <NumMul
              label="ปัดเศษ (บาท)"
              value={settings.multipliers.roundTo}
              step={50}
              onChange={(v) =>
                setSettings((s) => ({
                  ...s,
                  multipliers: { ...s.multipliers, roundTo: v },
                }))
              }
            />
            <NumMul
              label="ช่วงต่ำ (× ของ mid)"
              value={settings.multipliers.rangeLow}
              onChange={(v) =>
                setSettings((s) => ({
                  ...s,
                  multipliers: { ...s.multipliers, rangeLow: v },
                }))
              }
            />
            <NumMul
              label="ช่วงสูง (× ของ mid)"
              value={settings.multipliers.rangeHigh}
              onChange={(v) =>
                setSettings((s) => ({
                  ...s,
                  multipliers: { ...s.multipliers, rangeHigh: v },
                }))
              }
            />
          </div>
          <TextArea
            label="ข้อความใต้ผลลัพธ์ (disclaimer)"
            value={settings.note}
            onChange={(v) => setSettings((s) => ({ ...s, note: v }))}
            rows={3}
          />
        </section>
      ) : null}

      {tab === "preview" ? (
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3 rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
            <h3 className="flex items-center gap-2 font-display text-base font-semibold text-navy">
              <Calculator className="size-4" />
              ใส่ขนาดทดสอบ
            </h3>
            <SelectField
              label="ประเภทสินค้า"
              value={preview.productSlug}
              onChange={(v) => setPreview((p) => ({ ...p, productSlug: v }))}
              options={settings.rates.map((r) => ({
                value: r.productSlug,
                label: r.productName,
              }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="กว้าง (ซม.)"
                type="number"
                value={preview.widthCm}
                onChange={(v) =>
                  setPreview((p) => ({ ...p, widthCm: Number(v) || 0 }))
                }
              />
              <Field
                label="สูง (ซม.)"
                type="number"
                value={preview.heightCm}
                onChange={(v) =>
                  setPreview((p) => ({ ...p, heightCm: Number(v) || 0 }))
                }
              />
            </div>
            <Field
              label="จำนวนชุด"
              type="number"
              value={preview.quantity}
              onChange={(v) =>
                setPreview((p) => ({ ...p, quantity: Number(v) || 1 }))
              }
            />
            <label className="flex items-center gap-2 text-sm text-navy">
              <input
                type="checkbox"
                checked={preview.fabricBoth}
                onChange={(e) =>
                  setPreview((p) => ({ ...p, fabricBoth: e.target.checked }))
                }
              />
              โปร่ง + ทึบ
            </label>
            <label className="flex items-center gap-2 text-sm text-navy">
              <input
                type="checkbox"
                checked={preview.motorized}
                onChange={(e) =>
                  setPreview((p) => ({ ...p, motorized: e.target.checked }))
                }
              />
              มอเตอร์
            </label>
            <label className="flex items-center gap-2 text-sm text-navy">
              <input
                type="checkbox"
                checked={preview.upcountry}
                onChange={(e) =>
                  setPreview((p) => ({ ...p, upcountry: e.target.checked }))
                }
              />
              ต่างจังหวัด
            </label>
          </div>

          <div className="rounded-2xl border border-navy/15 bg-gradient-to-br from-navy to-navy-deep p-5 text-white shadow-sm sm:p-6">
            <p className="text-sm text-white/70">ช่วงราคาประมาณการ</p>
            {!result.enabled || !settings.enabled ? (
              <p className="mt-4 text-sm text-amber-200">
                เครื่องคิดปิดอยู่ หรือประเภทนี้ถูกปิดในตารางอัตรา
              </p>
            ) : (
              <>
                <p className="mt-2 font-display text-3xl font-semibold tracking-tight">
                  {formatBaht(result.min)} – {formatBaht(result.max)}
                </p>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-white/10 px-3 py-2">
                    <dt className="text-white/60">พื้นที่</dt>
                    <dd className="font-medium">{result.sqm} ตร.ม.</dd>
                  </div>
                  <div className="rounded-xl bg-white/10 px-3 py-2">
                    <dt className="text-white/60">กลาง (mid)</dt>
                    <dd className="font-medium">{formatBaht(result.mid)}</dd>
                  </div>
                </dl>
                <p className="mt-4 text-xs leading-relaxed text-white/65">
                  {settings.note}
                </p>
              </>
            )}
          </div>
        </section>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white px-5 py-4 shadow-sm">
        <p className="text-xs text-muted">
          {savedAt
            ? `บันทึก demo ล่าสุด: ${savedAt}`
            : "ยังไม่ได้บันทึกในรอบนี้ — รอบถัดไปจะเชื่อมตาราง estimator_rates"}
        </p>
        <button
          type="button"
          onClick={save}
          className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-deep"
        >
          <Save className="size-4" />
          บันทึก (demo)
        </button>
      </div>
    </div>
  );
}

function NumMul({
  label,
  value,
  onChange,
  step = 0.05,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <label className="block text-xs text-muted">
      {label}
      <input
        type="number"
        step={step}
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm text-navy"
      />
    </label>
  );
}
