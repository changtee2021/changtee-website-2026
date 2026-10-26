"use client";

import { useEffect, useRef, useState, type DragEvent, type FormEvent } from "react";
import { Calendar, ImageIcon, Loader2, PenLine, Plus, Ruler, Trash2, UserRound } from "lucide-react";
import { MarketingConsentField } from "@/components/forms/MarketingConsentField";
import { PdpaConsentField } from "@/components/forms/PdpaConsentField";
import { TurnstileField } from "@/components/forms/TurnstileField";
import {
  NorenCustomerFields,
  fieldClass,
  type NorenCustomer,
} from "@/components/noren/NorenCustomerFields";
import { MAX_SITE_FILES } from "@/lib/leads/site-media";

export type NorenSendSize = { width: number; height: number; qty: number };
export type NorenSendPayload = {
  sizes: NorenSendSize[];
  site: File[];
  art: File[];
  fulfill: "pickup" | "install";
};

type SizeRow = { id: string; width: string; height: string; qty: string };
type PhotoItem = { id: string; file: File; url: string };

const MAX_SIZE_ROWS = 20;
const MAX_BAG = 10;

function newRow(partial?: Partial<SizeRow>): SizeRow {
  return {
    id: partial?.id ?? `size-${Date.now()}`,
    width: "",
    height: "",
    qty: "1",
    ...partial,
  };
}

function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

export function NorenSendQuote({
  cust,
  onCust,
  pending,
  error,
  onTurnstile,
  onSubmit,
}: {
  cust: NorenCustomer;
  onCust: (next: NorenCustomer) => void;
  pending: boolean;
  error: string | null;
  onTurnstile: (token: string | null) => void;
  onSubmit: (payload: NorenSendPayload) => void;
}) {
  const [rows, setRows] = useState<SizeRow[]>(() => [newRow({ id: "size-1" })]);
  const [site, setSite] = useState<PhotoItem[]>([]);
  const [art, setArt] = useState<PhotoItem[]>([]);
  const [fulfill, setFulfill] = useState<"pickup" | "install">("pickup");
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      site.forEach((p) => URL.revokeObjectURL(p.url));
      art.forEach((p) => URL.revokeObjectURL(p.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- revoke on unmount only
  }, []);

  function patchRow(id: string, patch: Partial<SizeRow>) {
    setRows((all) => all.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addRow() {
    if (rows.length >= MAX_SIZE_ROWS) {
      setLocalError("เพิ่มได้สูงสุด 20 ขนาด");
      return;
    }
    setRows((all) => [...all, newRow({ id: `size-${all.length + 1}` })]);
  }

  function removeRow(id: string) {
    if (rows.length <= 1) {
      setLocalError("ต้องเหลืออย่างน้อย 1 ขนาด");
      return;
    }
    setRows((all) => all.filter((r) => r.id !== id));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);
    const filled = rows
      .map((r) => ({
        width: Number(r.width),
        height: Number(r.height),
        qty: Math.max(1, Math.round(Number(r.qty) || 1)),
      }))
      .filter((r) => r.width > 0 || r.height > 0);
    if (!filled.length) {
      setLocalError("กรุณากรอกอย่างน้อย 1 ขนาด");
      return;
    }
    if (filled.some((r) => !(r.width > 0) || !(r.height > 0) || !(r.qty >= 1))) {
      setLocalError("กรอกกว้าง ยาว และจำนวนชุดให้ครบ");
      return;
    }
    if (!cust.callbackDate) {
      setLocalError(fulfill === "pickup" ? "กรุณาเลือกวันที่อยากรับของ" : "กรุณาเลือกวันที่อยากติดตั้ง");
      return;
    }
    const files = [...site, ...art];
    if (files.length > MAX_SITE_FILES) {
      setLocalError(`แนบได้สูงสุด ${MAX_SITE_FILES} ภาพ รวมหน้างานและกราฟิก`);
      return;
    }
    onSubmit({
      sizes: filled,
      site: site.map((p) => p.file),
      art: art.map((p) => p.file),
      fulfill,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
      <aside className="rounded-2xl border border-line bg-white p-4 sm:p-5 lg:sticky lg:top-24">
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-navy">
          <UserRound className="size-5" aria-hidden />
          ข้อมูลลูกค้า
        </h2>
        <NorenCustomerFields cust={cust} onChange={onCust} />
      </aside>

      <div className="space-y-4">
        <PhotoDrop
          title="แนบภาพหน้างาน"
          hint={`รูปสถานที่จริง ลากวางได้หลายภาพ สูงสุด ${MAX_BAG} ภาพ`}
          icon={ImageIcon}
          items={site}
          onChange={setSite}
          max={MAX_BAG}
          onError={setLocalError}
        />
        <PhotoDrop
          title="แนบภาพกราฟิก"
          hint={`ลายหรือโลโก้ที่จะพิมพ์ ลากวางได้หลายภาพ สูงสุด ${MAX_BAG} ภาพ`}
          icon={PenLine}
          items={art}
          onChange={setArt}
          max={MAX_BAG}
          onError={setLocalError}
        />

        <section className="rounded-xl border border-line bg-paper p-4">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-navy">
            <Ruler className="size-5" aria-hidden />
            ขนาดที่ต้องการ
          </h2>
          <p className="mt-1 text-xs text-muted">1 ขนาด ต่อ 1 แถว ช่องว่างไม่นับ</p>
          <div className="mt-3 hidden grid-cols-[28px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_44px] gap-2 text-xs text-muted sm:grid">
            <span className="text-center">#</span>
            <span>กว้าง (ซม.)</span>
            <span>ยาว (ซม.)</span>
            <span>จำนวนชุด</span>
            <span />
          </div>
          <div className="mt-1 space-y-2">
            {rows.map((row, index) => (
              <div
                key={row.id}
                className="grid grid-cols-[28px_minmax(0,1fr)_minmax(0,1fr)_minmax(64px,.75fr)_44px] items-end gap-2"
              >
                <span className="grid h-11 place-items-center text-sm text-muted">{index + 1}</span>
                <label className="block text-sm">
                  <span className="font-medium text-ink sm:sr-only">กว้าง (ซม.)</span>
                  <input
                    type="number"
                    min={1}
                    max={400}
                    step={0.5}
                    inputMode="decimal"
                    className={fieldClass}
                    value={row.width}
                    onChange={(e) => patchRow(row.id, { width: e.target.value })}
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-medium text-ink sm:sr-only">ยาว (ซม.)</span>
                  <input
                    type="number"
                    min={1}
                    max={250}
                    step={0.5}
                    inputMode="decimal"
                    className={fieldClass}
                    value={row.height}
                    onChange={(e) => patchRow(row.id, { height: e.target.value })}
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-medium text-ink sm:sr-only">จำนวนชุด</span>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    step={1}
                    inputMode="numeric"
                    className={fieldClass}
                    value={row.qty}
                    onChange={(e) => patchRow(row.id, { qty: e.target.value })}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  disabled={rows.length <= 1}
                  className="grid size-11 place-items-center rounded-lg text-brand-red disabled:opacity-35"
                  aria-label={`ลบขนาดที่ ${index + 1}`}
                >
                  <Trash2 className="size-5" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addRow}
            className="mt-2 inline-flex h-11 items-center gap-1.5 rounded-lg border border-dashed border-line px-3.5 text-sm font-semibold text-navy hover:border-navy hover:bg-white"
          >
            <Plus className="size-4" aria-hidden />
            เพิ่มขนาด
          </button>
        </section>

        <section className="rounded-xl border border-line bg-paper p-4">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-navy">
            <Calendar className="size-5" aria-hidden />
            วันที่รับของ / หรือติดตั้ง
          </h2>
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="รับของหรือติดตั้ง">
            {(["pickup", "install"] as const).map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => setFulfill(kind)}
                className={`h-11 min-w-28 rounded-lg border px-4 text-sm font-semibold ${
                  fulfill === kind ? "border-navy bg-navy text-white" : "border-line bg-white text-navy"
                }`}
              >
                {kind === "pickup" ? "รับของเอง" : "รวมติดตั้ง"}
              </button>
            ))}
          </div>
          <label className="mt-3 block text-sm">
            <span className="font-medium text-ink">
              {fulfill === "pickup" ? "วันที่อยากรับของ" : "วันที่อยากติดตั้ง"}{" "}
              <span className="text-brand-red">*</span>
            </span>
            <input
              type="date"
              required
              min={todayYmd()}
              className={fieldClass}
              value={cust.callbackDate}
              onChange={(e) => onCust({ ...cust, callbackDate: e.target.value })}
            />
          </label>
        </section>

        <div className="space-y-3">
          <PdpaConsentField
            checked={cust.pdpaAccepted}
            onChange={(v) => onCust({ ...cust, pdpaAccepted: v })}
          />
          <MarketingConsentField
            checked={cust.marketingOptIn}
            onChange={(v) => onCust({ ...cust, marketingOptIn: v })}
          />
          <TurnstileField onToken={onTurnstile} />
        </div>

        {localError || error ? (
          <p className="text-sm text-brand-red">{localError || error}</p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-red text-sm font-semibold text-white hover:bg-brand-red-soft disabled:opacity-60"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {pending ? "กำลังส่ง..." : "ส่งขอใบเสนอราคา"}
        </button>
      </div>
    </form>
  );
}

function PhotoDrop({
  title,
  hint,
  icon: Icon,
  items,
  onChange,
  max,
  onError,
}: {
  title: string;
  hint: string;
  icon: typeof ImageIcon;
  items: PhotoItem[];
  onChange: (next: PhotoItem[]) => void;
  max: number;
  onError: (msg: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const depth = useRef(0);
  const [drag, setDrag] = useState(false);

  function addFiles(list: FileList | File[] | null) {
    if (!list) return;
    const files = Array.from(list).filter((f) => f.type.startsWith("image/"));
    if (!files.length) {
      onError("เลือกไฟล์รูป");
      return;
    }
    onError(null);
    const room = max - items.length;
    if (room <= 0) {
      onError(`แนบได้สูงสุด ${max} ภาพ`);
      return;
    }
    const next: PhotoItem[] = [];
    for (const file of files.slice(0, room)) {
      if (file.size > 8 * 1024 * 1024) {
        onError("ภาพใหญ่เกิน 8 MB");
        continue;
      }
      next.push({
        id: `pic-${Date.now()}-${next.length}`,
        file,
        url: URL.createObjectURL(file),
      });
    }
    if (next.length) onChange([...items, ...next]);
    if (inputRef.current) inputRef.current.value = "";
  }

  function remove(id: string) {
    const hit = items.find((p) => p.id === id);
    if (hit) URL.revokeObjectURL(hit.url);
    onChange(items.filter((p) => p.id !== id));
  }

  function onDragEnter(e: DragEvent) {
    e.preventDefault();
    depth.current += 1;
    if (Array.from(e.dataTransfer.types).includes("Files")) setDrag(true);
  }
  function onDragLeave(e: DragEvent) {
    e.preventDefault();
    depth.current -= 1;
    if (depth.current <= 0) {
      depth.current = 0;
      setDrag(false);
    }
  }
  function onDragOver(e: DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }
  function onDrop(e: DragEvent) {
    e.preventDefault();
    depth.current = 0;
    setDrag(false);
    addFiles(e.dataTransfer.files);
  }

  return (
    <section className="rounded-xl border border-line bg-paper p-4">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-navy">
        <Icon className="size-5" aria-hidden />
        {title}
      </h2>
      <p className="mt-1 text-xs text-muted">{hint}</p>
      <div
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={`mt-3 flex flex-wrap items-center gap-2.5 rounded-xl border border-dashed p-3 ${
          drag ? "border-navy bg-navy/5" : "border-line bg-white"
        }`}
      >
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={items.length >= max}
          className="grid size-[72px] shrink-0 place-items-center rounded-xl border border-line bg-white text-muted hover:border-navy hover:text-navy disabled:opacity-40"
          aria-label="เลือกภาพ"
        >
          <Plus className="size-7" />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => addFiles(e.target.files)}
        />
        {items.length ? (
          <ul className="grid min-w-40 flex-1 grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2">
            {items.map((item) => (
              <li key={item.id} className="flex min-w-0 flex-col gap-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt=""
                  className="h-24 w-full rounded-lg border border-line object-cover"
                />
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  className="h-11 rounded-lg border border-line bg-white text-sm text-brand-red"
                >
                  ลบ
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
