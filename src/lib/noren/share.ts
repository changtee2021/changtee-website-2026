import { layerId, newLayer, type NorenLayer } from "@/lib/noren/layers";
import { type NorenPiece } from "@/lib/noren/pricing";

type SharePiece = {
  name: string;
  W: number;
  H: number;
  N: number;
  qty: number;
  bg: string;
  top: "loop" | "rod";
  note: string;
  place?: "center" | "full";
  layers?: Array<Omit<NorenLayer, "id" | "small">>;
  /** Single cover image from links made before layers existed. */
  img?: string;
};

function b64url(buf: ArrayBuffer | Uint8Array) {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i += 1) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64bin(s: string) {
  let raw = s.replace(/-/g, "+").replace(/_/g, "/");
  while (raw.length % 4) raw += "=";
  const bin = atob(raw);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

async function zipStr(str: string) {
  if (typeof CompressionStream === "undefined") {
    return b64url(new TextEncoder().encode(str));
  }
  const cs = new CompressionStream("deflate");
  const buf = await new Response(new Blob([str]).stream().pipeThrough(cs)).arrayBuffer();
  return b64url(buf);
}

async function unzipStr(s: string) {
  if (typeof DecompressionStream === "undefined") {
    return new TextDecoder().decode(b64bin(s));
  }
  const ds = new DecompressionStream("deflate");
  const buf = await new Response(new Blob([b64bin(s)]).stream().pipeThrough(ds)).arrayBuffer();
  return new TextDecoder().decode(buf);
}

function shrinkImg(dataUrl: string) {
  return new Promise<string>((ok) => {
    if (!dataUrl || !dataUrl.startsWith("data:")) return ok("");
    const im = new Image();
    im.onload = () => {
      const max = 480;
      const sc = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight));
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(im.naturalWidth * sc));
      c.height = Math.max(1, Math.round(im.naturalHeight * sc));
      c.getContext("2d")?.drawImage(im, 0, 0, c.width, c.height);
      ok(dataUrl.startsWith("data:image/jpeg") ? c.toDataURL("image/jpeg", 0.62) : c.toDataURL("image/webp", 0.7));
    };
    im.onerror = () => ok("");
    im.src = dataUrl;
  });
}

function num(v: unknown, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function readLayer(raw: Partial<NorenLayer>): NorenLayer | null {
  if (typeof raw?.url !== "string" || !raw.url.startsWith("data:image/")) return null;
  return {
    id: layerId(),
    url: raw.url,
    w: Math.max(1, num(raw.w, 1)),
    h: Math.max(1, num(raw.h, 1)),
    x: num(raw.x, 0),
    y: num(raw.y, 0),
    wd: Math.max(0.5, num(raw.wd, 10)),
    r: num(raw.r, 0),
    fx: !!raw.fx,
    fy: !!raw.fy,
    cl: num(raw.cl, 0),
    cr: num(raw.cr, 0),
    ct: num(raw.ct, 0),
    cb: num(raw.cb, 0),
  };
}

function toSharePiece(piece: NorenPiece, layers: NorenLayer[]): SharePiece {
  return {
    name: piece.name,
    W: piece.widthCm,
    H: piece.heightCm,
    N: piece.panels,
    qty: piece.qty,
    bg: piece.color,
    top: piece.top === "rod" ? "rod" : "loop",
    note: piece.note,
    place: piece.place === "full" ? "full" : "center",
    layers: layers.map((l) => ({
      url: l.url,
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
    })),
  };
}

function fromSharePiece(raw: SharePiece, index: number): NorenPiece {
  const W = Number(raw.W) || 87;
  const H = Number(raw.H) || 59;
  const layers = Array.isArray(raw.layers)
    ? raw.layers.map(readLayer).filter((l): l is NorenLayer => !!l)
    : [];
  if (!layers.length && raw.img?.startsWith("data:image/")) {
    layers.push(newLayer(W, H, raw.img, W, H, true));
  }
  return {
    layers,
    isel: layers[0]?.id,
    place: raw.place === "full" ? "full" : "center",
    id: `piece-${index + 1}`,
    name: String(raw.name || "ชุด").trim() || "ชุด",
    widthCm: Number(raw.W) || 87,
    heightCm: Number(raw.H) || 59,
    panels: Math.max(1, Math.round(Number(raw.N) || 3)),
    qty: Math.max(1, Math.round(Number(raw.qty) || 1)),
    color: typeof raw.bg === "string" ? raw.bg : "",
    top: raw.top === "rod" ? "rod" : "loop",
    note: typeof raw.note === "string" ? raw.note : "",
  };
}

export async function buildNorenShareUrl(pieces: NorenPiece[]) {
  const slim = [];
  for (const piece of pieces) {
    const layers: NorenLayer[] = [];
    for (const l of piece.layers ?? []) {
      const url = await shrinkImg(l.url);
      if (url) layers.push({ ...l, url });
    }
    slim.push(toSharePiece(piece, layers));
  }
  const token = await zipStr(JSON.stringify({ pieces: slim }));
  const url = new URL(window.location.href);
  url.hash = `v=${token}`;
  return url.toString();
}

export async function readNorenShareHash(hash = window.location.hash): Promise<NorenPiece[] | null> {
  if (!hash.startsWith("#v=")) return null;
  try {
    const data = JSON.parse(await unzipStr(hash.slice(3))) as { pieces?: SharePiece[] };
    if (!Array.isArray(data.pieces) || data.pieces.length === 0) return null;
    return data.pieces.map((piece, index) => fromSharePiece(piece, index));
  } catch {
    return null;
  }
}
