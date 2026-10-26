"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  Copy,
  Crop,
  Crosshair,
  Eraser,
  EllipsisVertical,
  FlipHorizontal2,
  FlipVertical2,
  Loader2,
  Replace,
  RotateCw,
  Ruler,
  Trash2,
} from "lucide-react";
import { clothSvg, fmt } from "@/components/noren/noren-svg";
import {
  applyLayerCrop,
  layerBounds,
  layerFrame,
  layerId,
  removeLayerBackground,
  smallWidth,
  fullWidth,
  type CropEdge,
  type NorenLayer,
} from "@/lib/noren/layers";
import type { NorenPiece } from "@/lib/noren/pricing";

type Gap = "L" | "R" | "T" | "B";

type Hud = {
  x: number;
  y: number;
  flip: boolean;
  dims: Array<{ k: Gap; x: number; y: number; val: number }>;
};

type Drag = {
  mode: "move" | "resize" | "crop";
  edge: CropEdge;
  l: NorenLayer;
  sx: number;
  sy: number;
  d0: number;
};

const HUD_W = 44;

export function NorenImageStage({
  piece,
  shop,
  onPatch,
  onRemember,
  onReplace,
}: {
  piece: NorenPiece;
  shop: string;
  onPatch: (next: Partial<NorenPiece>) => void;
  onRemember: () => void;
  onReplace: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const [crop, setCrop] = useState(false);
  const [dim, setDim] = useState(false);
  const [more, setMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [hud, setHud] = useState<Hud | null>(null);

  const layers = piece.layers ?? [];
  const sel = layers.find((l) => l.id === piece.isel) ?? layers[0] ?? null;
  const W = Math.max(20, piece.widthCm);
  const H = Math.max(20, piece.heightCm);
  const html = clothSvg(piece, shop, { edit: { crop, dim } });

  function setLayer(next: NorenLayer) {
    onPatch({ layers: layers.map((l) => (l.id === next.id ? next : l)), isel: next.id });
  }

  function say(text: string) {
    setNotice(text);
    window.setTimeout(() => setNotice((cur) => (cur === text ? "" : cur)), 2400);
  }

  const place = useCallback(() => {
    const root = rootRef.current;
    const svg = stageRef.current?.querySelector("svg");
    const ctm = svg?.getScreenCTM();
    if (!root || !ctm || !sel) {
      setHud(null);
      return;
    }
    const box = root.getBoundingClientRect();
    const px = (x: number, y: number) => {
      const q = new DOMPoint(x, y).matrixTransform(ctm);
      return { x: q.x - box.left, y: q.y - box.top };
    };
    const b = layerBounds(sel);
    const tr = px(b.R, b.T);
    const tl = px(b.L, b.T);
    const hudH = hudRef.current?.offsetHeight ?? 0;
    const floor = px(0, H).y - hudH;
    const flip = tr.x + 8 + HUD_W > box.width;
    const x = flip ? Math.max(0, tl.x - 8 - HUD_W) : tr.x + 8;
    const y = Math.max(0, Math.min(tr.y, floor));
    const my = (b.T + b.B) / 2;
    const mx = (b.L + b.R) / 2;
    const spots: Array<[Gap, number, number, number]> = [
      ["L", b.L / 2, my, b.L],
      ["R", b.R + (W - b.R) * 0.62, my, W - b.R],
      ["T", mx, b.T / 2, b.T],
      ["B", mx, (b.B + H) / 2, H - b.B],
    ];
    const dims = dim ? spots.map(([k, sx, sy, val]) => ({ k, ...px(sx, sy), val })) : [];
    setHud({ x, y, flip, dims });
  }, [sel, dim, W, H]);

  useLayoutEffect(() => {
    place();
  }, [place, html]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => place());
    ro.observe(el);
    return () => ro.disconnect();
  }, [place]);

  useEffect(() => {
    if (!more) return;
    const close = (e: globalThis.PointerEvent) => {
      if (!(e.target as Element | null)?.closest("[data-noren-hud]")) setMore(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [more]);

  function clothPoint(e: PointerEvent) {
    const ctm = stageRef.current?.querySelector("svg")?.getScreenCTM();
    if (!ctm) return null;
    return new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    const t = e.target as Element;
    const id = t.getAttribute?.("data-id");
    const l = id ? layers.find((x) => x.id === id) : undefined;
    const pt = clothPoint(e);
    if (!l || !pt) return;
    e.preventDefault();
    onRemember();
    if (piece.isel !== l.id) onPatch({ isel: l.id });
    const edge = t.getAttribute("data-crop") as CropEdge | null;
    drag.current = {
      mode: edge ? "crop" : t.getAttribute("data-h") ? "resize" : "move",
      edge: edge ?? "L",
      l,
      sx: pt.x,
      sy: pt.y,
      d0: Math.hypot(pt.x - l.x, pt.y - l.y) || 1,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d) return;
    const pt = clothPoint(e);
    if (!pt) return;
    const l = d.l;
    if (d.mode === "crop") {
      const dx = pt.x - l.x;
      const dy = pt.y - l.y;
      const rad = (-(l.r || 0) * Math.PI) / 180;
      const c = Math.cos(rad);
      const s = Math.sin(rad);
      setLayer(applyLayerCrop(l, d.edge, dx * c - dy * s, dx * s + dy * c));
      return;
    }
    if (d.mode === "resize") {
      setLayer({ ...l, wd: Math.max(0.5, (l.wd * Math.hypot(pt.x - l.x, pt.y - l.y)) / d.d0) });
      return;
    }
    const next = { ...l, x: l.x + pt.x - d.sx, y: l.y + pt.y - d.sy };
    const g = layerFrame(next);
    if (Math.abs(g.vx - W / 2) < 0.6) next.x += W / 2 - g.vx;
    if (Math.abs(g.vy - H / 2) < 0.6) next.y += H / 2 - g.vy;
    setLayer(next);
  }

  function endDrag() {
    drag.current = null;
  }

  function centerX(l: NorenLayer) {
    return { ...l, x: l.x + W / 2 - layerFrame(l).vx };
  }

  function centerY(l: NorenLayer) {
    return { ...l, y: l.y + H / 2 - layerFrame(l).vy };
  }

  function toggleFull() {
    if (!sel) return;
    onRemember();
    if (piece.place === "full") {
      const s = sel.small;
      const back: NorenLayer = s
        ? { ...sel, ...s, small: undefined }
        : { ...sel, wd: smallWidth(W, H, sel.w, sel.h), x: W / 2, y: H / 2, cl: 0, cr: 0, ct: 0, cb: 0 };
      onPatch({ place: "center", layers: layers.map((l) => (l.id === sel.id ? back : l)) });
      return;
    }
    const full: NorenLayer = {
      ...sel,
      small: { x: sel.x, y: sel.y, wd: sel.wd, cl: sel.cl, cr: sel.cr, ct: sel.ct, cb: sel.cb },
      wd: fullWidth(W, H, sel.w, sel.h),
      x: W / 2,
      y: H / 2,
      cl: 0,
      cr: 0,
      ct: 0,
      cb: 0,
    };
    onPatch({ place: "full", layers: layers.map((l) => (l.id === sel.id ? full : l)) });
  }

  async function removeBackground() {
    if (!sel || busy) return;
    onRemember();
    setBusy(true);
    say("กำลังลบพื้นหลัง…");
    try {
      setLayer(await removeLayerBackground(sel));
      say("ลบพื้นหลังแล้ว");
    } catch {
      say("ลบพื้นหลังไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  function tool(action: "cc" | "ch" | "cv" | "fx" | "fy" | "r9" | "dup" | "rep") {
    setMore(false);
    if (!sel) return;
    if (action === "rep") {
      onReplace();
      return;
    }
    onRemember();
    if (action === "dup") {
      const copy = { ...sel, id: layerId(), x: sel.x + 2, y: sel.y + 2 };
      onPatch({ layers: [...layers, copy], isel: copy.id });
      return;
    }
    if (action === "cc") setLayer(centerY(centerX(sel)));
    else if (action === "ch") setLayer(centerX(sel));
    else if (action === "cv") setLayer(centerY(sel));
    else if (action === "fx") setLayer({ ...sel, fx: !sel.fx });
    else if (action === "fy") setLayer({ ...sel, fy: !sel.fy });
    else if (action === "r9") setLayer({ ...sel, r: ((sel.r || 0) + 90) % 360 });
  }

  function deleteLayer() {
    if (!sel) return;
    onRemember();
    const rest = layers.filter((l) => l.id !== sel.id);
    setCrop(false);
    onPatch({ layers: rest, isel: rest[0]?.id });
  }

  function setGap(k: Gap, raw: string) {
    const v = Number(raw);
    if (!sel || raw === "" || Number.isNaN(v)) return;
    const b = layerBounds(sel);
    const mx = (b.L + b.R) / 2;
    const my = (b.T + b.B) / 2;
    if (k === "L") setLayer({ ...sel, x: sel.x + v + b.bw / 2 - mx });
    else if (k === "R") setLayer({ ...sel, x: sel.x + W - v - b.bw / 2 - mx });
    else if (k === "T") setLayer({ ...sel, y: sel.y + v + b.bh / 2 - my });
    else setLayer({ ...sel, y: sel.y + H - v - b.bh / 2 - my });
  }

  const hudBtn =
    "grid size-11 place-items-center rounded-lg text-navy hover:bg-paper aria-pressed:bg-navy aria-pressed:text-white disabled:opacity-50";
  const menuItem = "flex h-11 w-full items-center gap-2.5 rounded-lg px-3 text-left text-sm text-navy hover:bg-paper";

  return (
    <div ref={rootRef} className="relative mt-3">
      <div
        ref={stageRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={`min-h-[320px] select-none rounded-xl bg-[repeating-conic-gradient(#0000_0_25%,#0b1f3a0d_0_50%)] bg-[length:16px_16px] p-4 text-navy ${
          layers.length ? "touch-none" : ""
        }`}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {sel && hud ? (
        <div
          ref={hudRef}
          data-noren-hud
          className="absolute z-20 flex w-11 flex-col items-center gap-0.5 rounded-xl border border-line bg-white p-0 shadow-lg"
          style={{ left: hud.x, top: hud.y }}
        >
          <button
            type="button"
            onClick={toggleFull}
            aria-pressed={piece.place === "full"}
            className="h-11 w-11 rounded-lg text-[11px] font-semibold leading-tight text-navy hover:bg-paper aria-pressed:bg-navy aria-pressed:text-white"
            title={piece.place === "full" ? "กลับเป็นภาพเล็ก" : "เต็มผืน"}
          >
            {piece.place === "full" ? "ภาพเล็ก" : "เต็มผืน"}
          </button>
          <button
            type="button"
            onClick={() => setMore((on) => !on)}
            aria-expanded={more}
            aria-pressed={more}
            className={hudBtn}
            title="เครื่องมือเพิ่มเติม"
            aria-label="เครื่องมือเพิ่มเติม"
          >
            <EllipsisVertical className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setMore(false);
              setCrop((on) => {
                if (!on) say("ลากขอบเพื่อตัดภาพ");
                return !on;
              });
            }}
            aria-pressed={crop}
            className={hudBtn}
            title="ตัดภาพ"
            aria-label="ตัดภาพ"
          >
            <Crop className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => void removeBackground()}
            disabled={busy}
            className={hudBtn}
            title="ลบพื้นหลัง"
            aria-label="ลบพื้นหลัง"
          >
            {busy ? <Loader2 className="size-5 animate-spin" /> : <Eraser className="size-5" />}
          </button>
          <button
            type="button"
            onClick={() => {
              setMore(false);
              setDim((on) => !on);
            }}
            aria-pressed={dim}
            className={hudBtn}
            title="เส้นวัดระยะ"
            aria-label="เส้นวัดระยะ"
          >
            <Ruler className="size-5" />
          </button>
          <button
            type="button"
            onClick={deleteLayer}
            className={`${hudBtn} text-brand-red`}
            title="ลบภาพ"
            aria-label="ลบภาพ"
          >
            <Trash2 className="size-5" />
          </button>

          {more ? (
            <div
              className={`absolute top-0 w-52 rounded-xl border border-line bg-white p-1 shadow-lg ${
                hud.flip ? "right-full mr-1.5" : "left-full ml-1.5"
              }`}
              role="menu"
            >
              <button type="button" role="menuitem" className={menuItem} onClick={() => tool("cc")}>
                <Crosshair className="size-4" /> กึ่งกลางผืน
              </button>
              <button type="button" role="menuitem" className={menuItem} onClick={() => tool("ch")}>
                <AlignCenterVertical className="size-4" /> กึ่งกลางแนวนอน
              </button>
              <button type="button" role="menuitem" className={menuItem} onClick={() => tool("cv")}>
                <AlignCenterHorizontal className="size-4" /> กึ่งกลางแนวตั้ง
              </button>
              <button type="button" role="menuitem" className={menuItem} onClick={() => tool("fx")}>
                <FlipHorizontal2 className="size-4" /> กลับซ้าย–ขวา
              </button>
              <button type="button" role="menuitem" className={menuItem} onClick={() => tool("fy")}>
                <FlipVertical2 className="size-4" /> กลับบน–ล่าง
              </button>
              <button type="button" role="menuitem" className={menuItem} onClick={() => tool("r9")}>
                <RotateCw className="size-4" /> หมุน 90°
              </button>
              <button type="button" role="menuitem" className={menuItem} onClick={() => tool("rep")}>
                <Replace className="size-4" /> แทนที่รูป
              </button>
              <button type="button" role="menuitem" className={menuItem} onClick={() => tool("dup")}>
                <Copy className="size-4" /> ทำซ้ำภาพ
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {sel && hud
        ? hud.dims.map((d) => (
            <DimInput
              key={d.k}
              gap={d.k}
              value={d.val}
              x={d.x}
              y={d.y}
              onFocus={onRemember}
              onChange={(v) => setGap(d.k, v)}
            />
          ))
        : null}

      <p className="mt-2 min-h-5 text-center text-xs text-muted" aria-live="polite">
        {notice ||
          (!sel
            ? ""
            : crop
              ? "ลากจุดที่ขอบเพื่อตัดภาพ · กดปุ่มตัดภาพอีกครั้งเมื่อเสร็จ"
              : "ลากเพื่อย้าย · ลากจุดแดงมุมขวาล่างเพื่อย่อ/ขยาย")}
      </p>
    </div>
  );
}

const GAP_LABEL: Record<Gap, string> = { L: "ระยะซ้าย", R: "ระยะขวา", T: "ระยะบน", B: "ระยะล่าง" };

function DimInput({
  gap,
  value,
  x,
  y,
  onFocus,
  onChange,
}: {
  gap: Gap;
  value: number;
  x: number;
  y: number;
  onFocus: () => void;
  onChange: (v: string) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <input
      type="number"
      step="0.1"
      inputMode="decimal"
      aria-label={`${GAP_LABEL[gap]} (ซม.)`}
      title={`${GAP_LABEL[gap]} (ซม.)`}
      value={draft ?? fmt(value)}
      onFocus={() => {
        setDraft(fmt(value));
        onFocus();
      }}
      onBlur={() => setDraft(null)}
      onChange={(e) => {
        setDraft(e.target.value);
        onChange(e.target.value);
      }}
      className="absolute z-10 h-8 w-16 rounded-md border border-[#3A6073] bg-white/95 px-1 text-center text-xs font-semibold text-[#3A6073] shadow-sm"
      style={{ left: x - 32, top: y - 16 }}
    />
  );
}
