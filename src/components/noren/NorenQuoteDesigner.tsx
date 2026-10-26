"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Columns3,
  ImagePlus,
  Loader2,
  Plus,
  Redo2,
  Send,
  Share2,
  Trash2,
  Undo2,
} from "lucide-react";
import { MarketingConsentField } from "@/components/forms/MarketingConsentField";
import { PdpaConsentField } from "@/components/forms/PdpaConsentField";
import { TurnstileField, isTurnstileEnabled } from "@/components/forms/TurnstileField";
import {
  NorenCustomerFields,
  emptyNorenCustomer,
  fieldClass,
  type NorenCustomer,
} from "@/components/noren/NorenCustomerFields";
import { NorenSendQuote, type NorenSendPayload } from "@/components/noren/NorenSendQuote";
import { NorenShareDialog } from "@/components/noren/NorenShareDialog";
import { NorenShareView } from "@/components/noren/NorenShareView";
import { NorenImageStage } from "@/components/noren/NorenImageStage";
import { fmt, miniSvg } from "@/components/noren/noren-svg";
import { layerId, newLayer } from "@/lib/noren/layers";
import type { NorenDesignPayload } from "@/lib/noren/inbox";
import { renderNorenPreview } from "@/lib/noren/preview-image";
import { localizedHref } from "@/lib/i18n/locale";
import { NOREN_QUOTE_PATH } from "@/lib/product-catalog";
import {
  MAX_SITE_FILES,
  prepareSiteFile,
  putToSignedUrl,
  readJsonResponse,
  requestSiteUploadTicket,
} from "@/lib/leads/site-media";
import { thankYouHref } from "@/lib/leads/quote-no";
import { useI18n } from "@/lib/i18n/use-i18n";
import {
  formatBaht,
  norenEstimate,
  norenLine,
  pieceSizeLabel,
  type NorenPiece,
} from "@/lib/noren/pricing";
import { toStorageRef } from "@/lib/security/lead-media";
import { buildNorenShareUrl, readNorenShareHash } from "@/lib/noren/share";

function newPiece(partial?: Partial<NorenPiece>): NorenPiece {
  return {
    id: partial?.id ?? "piece-1",
    name: "หน้าร้าน",
    widthCm: 87,
    heightCm: 59,
    panels: 3,
    qty: 1,
    color: "",
    top: "loop",
    note: "",
    ...partial,
  };
}

function looksLikeMapsUrl(value: string) {
  const v = value.trim().toLowerCase();
  if (!v) return true;
  return (
    (v.includes("google.") && v.includes("maps")) ||
    v.includes("maps.app.goo.gl") ||
    v.includes("goo.gl/maps")
  );
}

function normalizeMapsUrl(value: string) {
  const v = value.trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  if (/^(maps\.app\.goo\.gl|goo\.gl\/maps|www\.google\.[^/]+\/maps)/i.test(v)) {
    return `https://${v}`;
  }
  return v;
}

async function fileToDataUrl(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((ok, no) => {
      const el = new Image();
      el.onload = () => ok(el);
      el.onerror = () => no(new Error("open"));
      el.src = url;
    });
    const max = 1400;
    const sc = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(img.naturalWidth * sc));
    c.height = Math.max(1, Math.round(img.naturalHeight * sc));
    c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height);
    const keepAlpha = /png|webp|gif|svg/.test(file.type);
    return {
      url: keepAlpha ? c.toDataURL("image/png") : c.toDataURL("image/jpeg", 0.86),
      w: c.width,
      h: c.height,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function dataUrlToFile(dataUrl: string, name: string) {
  const comma = dataUrl.indexOf(",");
  if (comma < 0) return null;
  const head = dataUrl.slice(0, comma);
  const body = dataUrl.slice(comma + 1);
  const mime = head.match(/^data:([^;,]+)/)?.[1] || "image/jpeg";
  const bin = head.includes(";base64") ? atob(body) : decodeURIComponent(body);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) arr[i] = bin.charCodeAt(i);
  return new File([arr], name, { type: mime });
}

export function NorenQuoteDesigner() {
  const router = useRouter();
  const { locale } = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);
  const replacing = useRef(false);
  const [pieces, setPieces] = useState<NorenPiece[]>(() => [newPiece()]);
  const [past, setPast] = useState<NorenPiece[][]>([]);
  const [future, setFuture] = useState<NorenPiece[][]>([]);
  const [cur, setCur] = useState(0);
  const [askOpen, setAskOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareBusy, setShareBusy] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [viewOpen, setViewOpen] = useState(false);
  const [mode, setMode] = useState<"design" | "send">("design");
  const [overview, setOverview] = useState(false);
  const [pieceOpen, setPieceOpen] = useState(true);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const onTurnstile = useCallback((token: string | null) => setTurnstileToken(token), []);
  const [cust, setCust] = useState<NorenCustomer>(emptyNorenCustomer);

  useEffect(() => {
    let alive = true;
    void readNorenShareHash().then((shared) => {
      if (!alive || !shared?.length) return;
      setPieces(shared);
      setCur(0);
      setViewOpen(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const closeShare = useCallback(() => setShareOpen(false), []);
  const piece = pieces[cur] ?? pieces[0];
  const estimate = useMemo(() => norenEstimate(pieces), [pieces]);
  const shop = cust.contactName.trim() ? `ม่าน${cust.contactName.trim()}` : "ม่านของคุณ";

  function patchPiece(next: Partial<NorenPiece>) {
    setPieces((all) => all.map((p, i) => (i === cur ? { ...p, ...next } : p)));
  }

  function remember() {
    setPast((list) => [...list.slice(-29), pieces]);
    setFuture([]);
  }

  function undo() {
    const prev = past[past.length - 1];
    if (!prev) return;
    setFuture((list) => [...list, pieces]);
    setPast((list) => list.slice(0, -1));
    setPieces(prev);
    setCur((i) => Math.min(i, prev.length - 1));
  }

  function redo() {
    const next = future[future.length - 1];
    if (!next) return;
    setPast((list) => [...list, pieces]);
    setFuture((list) => list.slice(0, -1));
    setPieces(next);
    setCur((i) => Math.min(i, next.length - 1));
  }

  function addPiece() {
    const src = pieces[cur];
    remember();
    setPieces((all) => [
      ...all,
      newPiece({
        id: `piece-${layerId()}`,
        name: `ชุด ${all.length + 1}`,
        widthCm: src?.widthCm,
        heightCm: src?.heightCm,
        panels: src?.panels,
        color: src?.color,
        top: src?.top,
      }),
    ]);
    setCur(pieces.length);
  }

  function removePiece(index: number) {
    if (pieces.length < 2) return;
    remember();
    setPieces((all) => all.filter((_, i) => i !== index));
    setCur((i) => Math.min(i, pieces.length - 2));
  }

  async function onGraphic(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    const replace = replacing.current;
    replacing.current = false;
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const img = await fileToDataUrl(file);
      setOverview(false);
      const layers = piece.layers ?? [];
      const sel = layers.find((l) => l.id === piece.isel) ?? layers[0];
      remember();
      if (replace && sel) {
        const swapped = { ...sel, url: img.url, w: img.w, h: img.h, cl: 0, cr: 0, ct: 0, cb: 0 };
        patchPiece({ layers: layers.map((l) => (l.id === sel.id ? swapped : l)) });
        return;
      }
      const W = Math.max(20, piece.widthCm);
      const H = Math.max(20, piece.heightCm);
      const layer = newLayer(W, H, img.url, img.w, img.h, piece.place === "full");
      patchPiece({ layers: [...layers, layer], isel: layer.id });
    } catch {
      setError("เปิดภาพไม่สำเร็จ");
    }
  }

  async function sharePreview() {
    setShareBusy(true);
    setError(null);
    try {
      const url = await buildNorenShareUrl(pieces);
      window.history.replaceState(null, "", url);
      setShareUrl(url);
      setShareOpen(true);
    } catch {
      setError("สร้างลิงก์แชร์ไม่สำเร็จ");
    } finally {
      setShareBusy(false);
    }
  }

  function startNewDesign() {
    setPieces([newPiece()]);
    setPast([]);
    setFuture([]);
    setCur(0);
    setShareOpen(false);
    setViewOpen(false);
    setOverview(false);
    setShareUrl("");
    window.history.replaceState(null, "", localizedHref(locale, NOREN_QUOTE_PATH));
  }

  function requestedSize() {
    return pieces
      .map((p) => `${p.name} ${pieceSizeLabel(p)} · ${p.top === "loop" ? "หูคอกระเช้า" : "สอดราง"}`)
      .join("\n");
  }

  function quoteNote() {
    const lines = [
      `ประมาณการหน้าร้าน (ยังไม่ใช่ใบเสนอราคาทางการ)`,
      `ตร.ม.ละ 1,300 บาท · ขั้นต่ำ 1 ตร.ม./ชุด`,
      `ก่อน VAT ${formatBaht(estimate.exVat)} บาท · VAT 7% ${formatBaht(estimate.vat)} บาท · รวม ${formatBaht(estimate.total)} บาท`,
      ...pieces.flatMap((p) => {
        const line = norenLine(p);
        return [
          `${p.name}: ${formatBaht(line.amount)} บาท (${line.m2.toFixed(2)} ตร.ม. × ${line.qty} ชุด)`,
          p.note.trim() ? `โน้ต ${p.name}: ${p.note.trim()}` : "",
        ];
      }),
      cust.note.trim(),
    ];
    return lines.filter(Boolean).join("\n");
  }

  async function submitLead(opts: {
    requestedSize: string;
    note: string;
    files: File[];
    design: NorenDesignPayload;
  }) {
    setError(null);
    if (!cust.pdpaAccepted) {
      setError("กรุณายอมรับนโยบายความเป็นส่วนตัว");
      return;
    }
    if (isTurnstileEnabled() && !turnstileToken) {
      setError("กรุณายืนยันว่าคุณไม่ใช่บอท");
      return;
    }
    const mapUrl = normalizeMapsUrl(cust.installMapUrl);
    if (mapUrl && !looksLikeMapsUrl(mapUrl)) {
      setError("ลิงก์ Google Maps ไม่ถูกต้อง");
      return;
    }

    setPending(true);
    const form = new FormData();
    form.set("source", "quote");
    form.set("contactName", cust.contactName.trim());
    form.set("jobTitle", cust.jobTitle.trim());
    form.set("phone", cust.phone.trim());
    form.set("lineId", cust.sameLineAsPhone ? cust.phone.trim() : cust.lineId.trim());
    form.set("email", cust.email.trim());
    form.set("contactType", cust.contactType);
    form.set("businessName", cust.businessName.trim());
    form.set("taxId", cust.taxId.trim());
    form.set("callbackDate", cust.callbackDate || new Date().toISOString().slice(0, 10));
    form.set("referralSource", cust.referralSource);
    form.set("productType", "ม่านญี่ปุ่น");
    form.set("requestedSize", opts.requestedSize);
    form.set("note", opts.note);
    form.set("norenDesign", JSON.stringify(opts.design));
    form.set("pdpaAccepted", cust.pdpaAccepted ? "on" : "");
    form.set("marketingOptIn", cust.marketingOptIn ? "on" : "");
    if (turnstileToken) form.set("turnstileToken", turnstileToken);
    const address = cust.installAddress.trim();
    form.set("installAddress", mapUrl ? `${address}\nGoogle Maps: ${mapUrl}` : address);
    form.set("billingAddress", cust.sameBilling ? address : cust.billingAddress.trim());

    try {
      for (const file of opts.files.slice(0, MAX_SITE_FILES)) {
        const prepared = await prepareSiteFile(file);
        const ticket = await requestSiteUploadTicket({
          file: prepared,
          turnstileToken,
        });
        if (ticket.mode === "direct") {
          form.append("siteImage", prepared, prepared.name);
          continue;
        }
        await putToSignedUrl(ticket, prepared);
        form.append("siteMediaRef", toStorageRef(ticket.path));
        form.append("siteMediaName", prepared.name);
      }

      const res = await fetch("/api/leads", { method: "POST", body: form });
      const json = await readJsonResponse<{ error?: string; quoteNo?: string | null }>(res);
      if (!res.ok) throw new Error(json.error || "ส่งแบบฟอร์มไม่สำเร็จ");
      router.push(thankYouHref(json.quoteNo, locale));
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      setPending(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const uploads: File[] = [];
    for (const [i, p] of pieces.entries()) {
      if (uploads.length >= MAX_SITE_FILES) break;
      const preview = await renderNorenPreview(p, shop, `ภาพรวม-${i + 1}-${p.name || "noren"}.jpg`);
      if (preview) uploads.push(preview);
    }
    const designPieces: NorenDesignPayload["pieces"] = [];
    for (const p of pieces) {
      const layers: NorenDesignPayload["pieces"][number]["layers"] = [];
      (p.layers ?? []).forEach((l, i) => {
        const ext = l.url.startsWith("data:image/png") ? "png" : l.url.startsWith("data:image/webp") ? "webp" : "jpg";
        const file = uploads.length < MAX_SITE_FILES ? dataUrlToFile(l.url, `${p.name || "noren"}-${i + 1}.${ext}`) : null;
        if (!file) return;
        layers.push({
          file: uploads.length,
          w: l.w,
          h: l.h,
          x: l.x,
          y: l.y,
          wd: l.wd,
          r: l.r,
          fx: l.fx,
          fy: l.fy,
          cl: l.cl,
          cr: l.cr,
          ct: l.ct,
          cb: l.cb,
        });
        uploads.push(file);
      });
      designPieces.push({
        name: p.name,
        W: p.widthCm,
        H: p.heightCm,
        N: p.panels,
        qty: p.qty,
        bg: p.color,
        top: p.top,
        note: p.note,
        layers,
      });
    }
    await submitLead({
      requestedSize: requestedSize(),
      note: quoteNote(),
      files: uploads,
      design: { kind: "noren-design", pieces: designPieces },
    });
  }

  async function onSendSubmit(payload: NorenSendPayload) {
    const files = [
      ...payload.site.map((file, i) => new File([file], `site-${i + 1}-${file.name}`, { type: file.type })),
      ...payload.art.map((file, i) => new File([file], `graphic-${i + 1}-${file.name}`, { type: file.type })),
    ];
    await submitLead({
      requestedSize: payload.sizes
        .map((s) => `${s.width}x${s.height} จำนวน ${s.qty} ชุด`)
        .join("\n"),
      note: [
        "โหมด: ส่งแบบมาให้เราทำราคา",
        payload.fulfill === "install" ? "รวมติดตั้ง" : "รับของเอง",
        payload.site.length ? `ภาพหน้างาน ${payload.site.length} ไฟล์` : "",
        payload.art.length ? `ภาพกราฟิก ${payload.art.length} ไฟล์` : "",
        cust.note.trim(),
      ]
        .filter(Boolean)
        .join("\n"),
      files,
      design: {
        kind: "noren-send",
        pieces: payload.sizes.map((s, i) => ({
          name: `ขนาด ${i + 1}`,
          W: Number(s.width) || 0,
          H: Number(s.height) || 0,
          N: 1,
          qty: Number(s.qty) || 1,
          bg: "",
          top: "loop",
          note: "",
          layers: [],
        })),
      },
    });
  }

  if (!piece) return null;

  const modeTabs = (
        <div
          className="flex w-full max-w-[320px] rounded-full bg-paper p-1"
          role="tablist"
          aria-label="โหมดขอราคา"
        >
          {(
            [
              ["design", "ออกแบบเอง"],
              ["send", "ส่งแบบมาให้เรา"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={mode === id}
              onClick={() => {
                setMode(id);
                setAskOpen(false);
                setError(null);
              }}
              className={`h-11 flex-1 rounded-full text-sm font-semibold ${
                mode === id ? "bg-white text-navy shadow-sm" : "bg-transparent text-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
  );

  return (
    <div>
      {mode === "send" && !viewOpen ? (
        <>
        <div className="mb-4">{modeTabs}</div>
        <NorenSendQuote
          cust={cust}
          onCust={setCust}
          pending={pending}
          error={error}
          onTurnstile={onTurnstile}
          onSubmit={(payload) => void onSendSubmit(payload)}
        />
        </>
      ) : (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
      <aside className="flex flex-col rounded-2xl border border-line bg-white lg:sticky lg:top-24">
        <div className="p-4 pb-0 sm:p-5 sm:pb-0">
          {modeTabs}
          <button
            type="button"
            onClick={() => {
              replacing.current = false;
              fileRef.current?.click();
            }}
            className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-red px-4 text-sm font-semibold text-white hover:bg-brand-red-soft"
          >
            <ImagePlus className="size-5" aria-hidden />
            อัปโหลดภาพ/โลโก้
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onGraphic} />
        </div>
        <button
          type="button"
          onClick={() => setPieceOpen((on) => !on)}
          aria-expanded={pieceOpen}
          className="mt-3 flex h-12 w-full items-center gap-2 border-t border-line px-4 text-left text-sm font-semibold text-navy sm:px-5"
        >
          <Columns3 className="size-4 shrink-0" aria-hidden />
          <span className="min-w-0 flex-1 truncate">ผืนนี้ · {piece.name}</span>
          <ChevronDown className={`size-5 shrink-0 transition-transform ${pieceOpen ? "rotate-180" : ""}`} aria-hidden />
        </button>
        {pieceOpen ? (
        <div className="px-4 pb-4 sm:px-5">
        <label className="block text-sm">
          <span className="font-medium text-ink">ชื่อจุด</span>
          <input
            className={fieldClass}
            value={piece.name}
            onChange={(e) => patchPiece({ name: e.target.value || "ชุด" })}
            placeholder="เช่น หน้าร้าน / ห้องครัว"
          />
        </label>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <NumField label="กว้าง (ซม.)" value={piece.widthCm} min={30} max={400} onChange={(v) => patchPiece({ widthCm: v })} />
          <NumField label="ยาว (ซม.)" value={piece.heightCm} min={20} max={250} onChange={(v) => patchPiece({ heightCm: v })} />
          <NumField label="แบ่งผ้า" value={piece.panels} min={1} max={12} step={1} onChange={(v) => patchPiece({ panels: v })} />
          <NumField label="จำนวนชุด" value={piece.qty} min={1} max={99} step={1} onChange={(v) => patchPiece({ qty: v })} />
        </div>
        <div className="mt-3">
          <p className="text-sm font-medium text-ink">สีผ้า</p>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="color"
              value={/^#[0-9A-Fa-f]{6}$/.test(piece.color) ? piece.color : "#F4E6D4"}
              onChange={(e) => patchPiece({ color: e.target.value.toUpperCase() })}
              className="size-11 rounded-lg border border-line bg-field p-1"
              aria-label="เลือกสีผ้า"
            />
            <input
              className={fieldClass + " mt-0"}
              value={piece.color}
              maxLength={7}
              onChange={(e) => {
                let v = e.target.value.trim();
                if (v && v[0] !== "#") v = `#${v}`;
                patchPiece({ color: v.toUpperCase() });
              }}
              placeholder="#RRGGBB"
            />
            <button
              type="button"
              onClick={() => patchPiece({ color: "" })}
              className={`h-11 shrink-0 rounded-lg border px-3 text-sm ${piece.color ? "border-line text-navy" : "border-navy bg-navy text-white"}`}
            >
              ไม่มีสี
            </button>
          </div>
        </div>
        <div className="mt-3">
          <p className="text-sm font-medium text-ink">ด้านบน</p>
          <div className="mt-1 flex gap-2">
            {(["loop", "rod"] as const).map((top) => (
              <button
                key={top}
                type="button"
                onClick={() => patchPiece({ top })}
                className={`h-11 flex-1 rounded-lg border text-sm font-semibold ${
                  piece.top === top ? "border-navy bg-navy text-white" : "border-line bg-paper text-navy"
                }`}
              >
                {top === "loop" ? "หูคอกระเช้า" : "สอดราง"}
              </button>
            ))}
          </div>
        </div>
        <label className="mt-3 block text-sm">
          <span className="font-medium text-ink">โน้ตของผืนนี้</span>
          <textarea
            className={fieldClass}
            rows={2}
            value={piece.note}
            onChange={(e) => patchPiece({ note: e.target.value })}
            placeholder="เช่น โลโก้อยู่ผืนกลาง ชายผ้าห่างพื้น"
          />
        </label>
        </div>
        ) : null}
        <div className="mt-auto border-t border-line p-4 sm:px-5">
          <div className="flex items-baseline justify-between gap-3 font-display text-navy">
            <span>ราคารวม {estimate.qty} ชุด</span>
            <b className="text-xl text-brand-red">{formatBaht(estimate.exVat)} บาท</b>
          </div>
          <p className="mt-1 text-xs text-muted">
            ตร.ม.ละ 1,300 บาท · ขั้นต่ำ 1 ตร.ม./ชุด · ยังไม่รวม VAT
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={shareBusy}
              onClick={() => void sharePreview()}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-navy hover:bg-paper disabled:opacity-60"
            >
              {shareBusy ? <Loader2 className="size-4 animate-spin" /> : <Share2 className="size-4" />}
              แชร์พรีวิว
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setAskOpen(true);
              }}
              className="inline-flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg bg-brand-red px-3 text-sm font-semibold text-white hover:bg-brand-red-soft"
            >
              <Send className="size-4 shrink-0" aria-hidden />
              ส่งขอใบเสนอราคา
            </button>
          </div>
        </div>
      </aside>

      <div className="rounded-2xl border border-line bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg font-semibold text-navy">Preview</h2>
          {overview ? null : (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={undo}
                disabled={!past.length}
                className="grid size-11 place-items-center rounded-full text-navy hover:bg-paper disabled:opacity-30"
                title="ย้อนกลับ"
                aria-label="ย้อนกลับ"
              >
                <Undo2 className="size-5" />
              </button>
              <button
                type="button"
                onClick={redo}
                disabled={!future.length}
                className="grid size-11 place-items-center rounded-full text-navy hover:bg-paper disabled:opacity-30"
                title="ทำซ้ำ"
                aria-label="ทำซ้ำ"
              >
                <Redo2 className="size-5" />
              </button>
            </div>
          )}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1">
            {pieces.map((p, i) => (
              <div
                key={p.id}
                className={`flex shrink-0 items-center overflow-hidden rounded-xl border ${
                  i === cur && !overview ? "border-navy bg-white" : "border-line bg-paper"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setCur(i);
                    setOverview(false);
                  }}
                  className="px-3 py-2 text-left text-sm"
                >
                  <span className="block font-medium text-navy">{p.name}</span>
                  <span className="block text-xs text-muted">
                    {fmt(p.widthCm)}×{fmt(p.heightCm)}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => removePiece(i)}
                  disabled={pieces.length < 2}
                  className="grid size-10 place-items-center text-brand-red disabled:opacity-30"
                  aria-label={`ลบ ${p.name}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addPiece}
              className="grid size-11 shrink-0 place-items-center rounded-xl text-navy"
              aria-label="เพิ่มชุด"
            >
              <Plus className="size-5" />
            </button>
          </div>
          <button
            type="button"
            aria-pressed={overview}
            onClick={() => setOverview((on) => !on)}
            className={`h-11 shrink-0 rounded-lg px-3.5 text-sm font-semibold ${
              overview ? "bg-navy text-white" : "border border-line bg-paper text-navy"
            }`}
          >
            ภาพรวม
          </button>
        </div>
        {overview ? (
          <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] items-end gap-4 rounded-xl bg-[repeating-conic-gradient(#0000_0_25%,#0b1f3a0d_0_50%)] bg-[length:16px_16px] p-3 text-navy">
            {pieces.map((p, i) => {
              const line = norenLine(p);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setCur(i);
                    setOverview(false);
                  }}
                  className={`flex min-w-0 flex-col gap-2 rounded-lg p-2 text-left ${
                    i === cur ? "ring-2 ring-brand-red" : ""
                  }`}
                >
                  <span className="block font-medium text-navy">{p.name}</span>
                  <span className="block text-xs text-muted">{pieceSizeLabel(p)}</span>
                  <div
                    className="flex items-end justify-center"
                    dangerouslySetInnerHTML={{ __html: miniSvg(p) }}
                  />
                  <small className="text-left text-xs text-muted">
                    {formatBaht(line.amount)} บาท
                  </small>
                </button>
              );
            })}
          </div>
        ) : (
          <NorenImageStage
            key={piece.id}
            piece={piece}
            shop={shop}
            onPatch={patchPiece}
            onRemember={remember}
            onReplace={() => {
              replacing.current = true;
              fileRef.current?.click();
            }}
          />
        )}
      </div>

      <NorenShareDialog
        open={shareOpen}
        url={shareUrl}
        pieces={pieces}
        estimate={estimate}
        onClose={closeShare}
        onNewDesign={startNewDesign}
      />
      <NorenShareView
        open={viewOpen}
        pieces={pieces}
        estimate={estimate}
        shop={shop}
        onNewDesign={startNewDesign}
      />

      {askOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-navy/50 p-0 sm:place-items-center sm:p-4">
          <form
            onSubmit={onSubmit}
            className="max-h-[92dvh] w-full overflow-auto rounded-t-2xl bg-white p-5 sm:max-w-2xl sm:rounded-2xl"
          >
            <section className="rounded-xl bg-paper p-3">
              <h3 className="font-display text-lg font-semibold text-navy">Preview</h3>
              <div className="mt-2 flex gap-3 overflow-x-auto">
                {pieces.map((p) => {
                  const line = norenLine(p);
                  return (
                    <div key={p.id} className="min-w-32 flex-1">
                      <b className="block text-sm text-navy">{p.name}</b>
                      <span className="block text-xs text-muted">{pieceSizeLabel(p)}</span>
                      <div dangerouslySetInnerHTML={{ __html: miniSvg(p) }} />
                      <small className="mt-1.5 block text-left text-xs text-muted">
                        {formatBaht(line.amount)} บาท
                      </small>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 space-y-1 rounded-xl border border-line bg-white px-3 py-2 text-sm text-muted">
                <div className="flex justify-between">
                  <span>ราคาก่อน VAT</span>
                  <b className="text-navy">{formatBaht(estimate.exVat)} บาท</b>
                </div>
                <div className="flex justify-between">
                  <span>VAT 7%</span>
                  <b className="text-navy">{formatBaht(estimate.vat)} บาท</b>
                </div>
                <div className="flex justify-between border-t border-line pt-1.5 font-display text-base font-semibold text-navy">
                  <span>รวมทั้งสิ้น</span>
                  <b className="text-brand-red">{formatBaht(estimate.total)} บาท</b>
                </div>
              </div>
            </section>

            <h3 className="mt-5 font-display text-lg font-semibold text-navy">รายละเอียดผู้ขอราคา</h3>
            <div className="mt-3">
              <NorenCustomerFields cust={cust} onChange={setCust} compact />
              <label className="mt-3 block text-sm">
                <span className="font-medium text-ink">
                  วันที่ต้องการสินค้า <span className="text-brand-red">*</span>
                </span>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().slice(0, 10)}
                  className={fieldClass}
                  value={cust.callbackDate}
                  onChange={(e) => setCust({ ...cust, callbackDate: e.target.value })}
                />
              </label>
            </div>
            <div className="mt-4 space-y-3">
              <PdpaConsentField
                checked={cust.pdpaAccepted}
                onChange={(v) => setCust({ ...cust, pdpaAccepted: v })}
              />
              <MarketingConsentField
                checked={cust.marketingOptIn}
                onChange={(v) => setCust({ ...cust, marketingOptIn: v })}
              />
              <TurnstileField onToken={onTurnstile} />
            </div>
            {error ? <p className="mt-3 text-sm text-brand-red">{error}</p> : null}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setAskOpen(false)}
                className="h-11 flex-1 rounded-lg border border-line text-sm text-navy"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={pending}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-brand-red text-sm font-semibold text-white hover:bg-brand-red-soft disabled:opacity-60"
              >
                {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                {pending ? "กำลังส่ง..." : "ส่งคำขอ"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
      )}
    </div>
  );
}

function NumField({
  label,
  value,
  min,
  max,
  step = 0.5,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-ink">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        inputMode="decimal"
        className={fieldClass}
        value={Number.isFinite(value) ? value : ""}
        onChange={(e) => {
          const next = Number(e.target.value);
          if (!next || next < 0) return;
          onChange(next);
        }}
      />
    </label>
  );
}

