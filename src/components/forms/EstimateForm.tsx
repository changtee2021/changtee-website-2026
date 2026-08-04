"use client";

import { useMemo, useState } from "react";
import { productCatalog } from "@/lib/product-catalog";
import { formatBaht } from "@/lib/utils";
import { LeadForm } from "@/components/forms/LeadForm";

type Range = { min: number; max: number; sqm: number; note: string };

export function EstimateForm() {
  const [range, setRange] = useState<Range | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [payload, setPayload] = useState<Record<string, unknown> | null>(null);

  const categories = useMemo(
    () => productCatalog.map((c) => ({ value: c.slug, label: c.name })),
    [],
  );

  async function onEstimate(formData: FormData) {
    setPending(true);
    setError(null);
    const body = {
      productType: String(formData.get("productType") || ""),
      widthCm: Number(formData.get("widthCm") || 0),
      heightCm: Number(formData.get("heightCm") || 0),
      quantity: Number(formData.get("quantity") || 1),
      fabricLayer: String(formData.get("fabricLayer") || "na"),
      motorized: formData.get("motorized") === "on",
      area: String(formData.get("area") || "bkk"),
    };

    try {
      const res = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { error?: string } & Range;
      if (!res.ok) throw new Error(json.error || "คำนวณไม่สำเร็จ");
      setRange({ min: json.min, max: json.max, sqm: json.sqm, note: json.note });
      setPayload(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-2 lg:gap-8">
      <form
        action={onEstimate}
        className="min-w-0 space-y-4 rounded-2xl border border-line bg-white p-4 sm:p-6"
      >
        <h2 className="font-display text-lg font-semibold text-navy sm:text-xl">
          คำนวณช่วงราคา
        </h2>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">ประเภทสินค้า</span>
          <select
            name="productType"
            required
            className="w-full rounded-xl border border-line px-3 py-2"
            defaultValue={categories[0]?.value}
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <Num label="กว้าง (ซม.)" name="widthCm" defaultValue={200} />
          <Num label="สูง (ซม.)" name="heightCm" defaultValue={250} />
        </div>
        <Num label="จำนวนชุด/หน้าต่าง" name="quantity" defaultValue={1} />
        <label className="block text-sm">
          <span className="mb-1 block font-medium">ชั้นผ้า</span>
          <select name="fabricLayer" className="w-full rounded-xl border border-line px-3 py-2" defaultValue="na">
            <option value="na">ไม่ระบุ</option>
            <option value="sheer">ผ้าโปร่ง</option>
            <option value="blackout">ผ้าทึบ</option>
            <option value="both">โปร่ง + ทึบ</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">พื้นที่ติดตั้ง</span>
          <select name="area" className="w-full rounded-xl border border-line px-3 py-2" defaultValue="bkk">
            <option value="bkk">กรุงเทพฯ / ปริมณฑล</option>
            <option value="upcountry">ต่างจังหวัด</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" name="motorized" />
          ระบบมอเตอร์ / ม่านไฟฟ้า
        </label>
        {error ? <p className="text-sm text-brand-red">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "กำลังคำนวณ..." : "ดูช่วงราคา"}
        </button>
      </form>

      <div className="min-w-0 rounded-2xl border border-line bg-paper p-4 sm:p-6">
        {range ? (
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted">ช่วงราคาประมาณการ</div>
              <div className="mt-1 break-words font-display text-2xl font-semibold text-navy sm:text-3xl">
                {formatBaht(range.min)} – {formatBaht(range.max)}
              </div>
              <p className="mt-2 text-sm text-muted">
                พื้นที่ประมาณ {range.sqm} ตร.ม. · {range.note}
              </p>
            </div>
            <div className="rounded-xl border border-line bg-white p-4">
              <h3 className="font-semibold text-navy">รับราคาเป๊ะ / ให้ทีมติดต่อกลับ</h3>
              <p className="mt-1 text-sm text-muted">กรอกช่องทางติดต่ออย่างน้อย LINE หรืออีเมล</p>
              <div className="mt-4">
                <LeadForm
                  source="estimate"
                  productInterest={String(payload?.productType || "")}
                  estimatePayload={payload ?? undefined}
                  submitLabel="ส่งเพื่อรับราคาเป๊ะ"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-64 flex-col justify-center">
            <h2 className="font-display text-xl font-semibold text-navy">ผลลัพธ์จะแสดงที่นี่</h2>
            <p className="mt-2 text-sm text-muted">
              คำนวณช่วงราคาก่อน แล้วค่อยกรอกข้อมูลเพื่อให้เซลล์เสนอราคาแม่นยำ
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Num({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: number;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      <input
        type="number"
        name={name}
        required
        min={1}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-line px-3 py-2"
      />
    </label>
  );
}
