export type NorenLayerBox = { x: number; y: number; wd: number; cl: number; cr: number; ct: number; cb: number };

export type NorenLayer = NorenLayerBox & {
  id: string;
  url: string;
  w: number;
  h: number;
  r: number;
  fx: boolean;
  fy: boolean;
  small?: NorenLayerBox;
};

export type CropEdge = "L" | "R" | "T" | "B" | "TL" | "TR" | "BL" | "BR";

export function layerId() {
  return Math.random().toString(36).slice(2, 10);
}

export function smallWidth(W: number, H: number, w: number, h: number) {
  return Math.min(W * 0.62, H * 0.7 * (w / (h || 1)));
}

export function fullWidth(W: number, H: number, w: number, h: number) {
  return Math.max(W, H * (w / (h || 1)));
}

export function newLayer(W: number, H: number, url: string, w: number, h: number, full: boolean): NorenLayer {
  return {
    id: layerId(),
    url,
    w,
    h,
    x: W / 2,
    y: H / 2,
    wd: full ? fullWidth(W, H, w, h) : smallWidth(W, H, w, h),
    r: 0,
    fx: false,
    fy: false,
    cl: 0,
    cr: 0,
    ct: 0,
    cb: 0,
  };
}

export function layerFrame(l: NorenLayer) {
  const iw = l.w || 1;
  const ih = l.h || 1;
  const fullW = +l.wd || 0;
  const fullH = (fullW * ih) / iw;
  let cl = Math.max(0, +l.cl || 0);
  let cr = Math.max(0, +l.cr || 0);
  let ct = Math.max(0, +l.ct || 0);
  let cb = Math.max(0, +l.cb || 0);
  if (cl + cr > 0.94) {
    const k = 0.94 / (cl + cr);
    cl *= k;
    cr *= k;
  }
  if (ct + cb > 0.94) {
    const k = 0.94 / (ct + cb);
    ct *= k;
    cb *= k;
  }
  const visW = fullW * (1 - cl - cr);
  const visH = fullH * (1 - ct - cb);
  const ox = ((cl - cr) * fullW) / 2;
  const oy = ((ct - cb) * fullH) / 2;
  const rad = ((l.r || 0) * Math.PI) / 180;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return {
    fullW,
    fullH,
    visW,
    visH,
    cl,
    cr,
    ct,
    cb,
    left: -fullW / 2 + cl * fullW,
    top: -fullH / 2 + ct * fullH,
    vx: l.x + ox * c - oy * s,
    vy: l.y + ox * s + oy * c,
  };
}

export function layerBounds(l: NorenLayer) {
  const g = layerFrame(l);
  const rad = ((l.r || 0) * Math.PI) / 180;
  const c = Math.abs(Math.cos(rad));
  const s = Math.abs(Math.sin(rad));
  const bw = g.visW * c + g.visH * s;
  const bh = g.visW * s + g.visH * c;
  return { L: g.vx - bw / 2, R: g.vx + bw / 2, T: g.vy - bh / 2, B: g.vy + bh / 2, bw, bh };
}

function layerTransform(l: NorenLayer) {
  const sx = l.fx ? -1 : 1;
  const sy = l.fy ? -1 : 1;
  return `translate(${l.x} ${l.y}) rotate(${l.r || 0})${sx === 1 && sy === 1 ? "" : ` scale(${sx} ${sy})`}`;
}

/** Crop is expressed as fractions of the source image; edges always keep at least 6% visible. */
export function applyLayerCrop(l: NorenLayer, edge: CropEdge, lx: number, ly: number): NorenLayer {
  const fw = l.wd;
  const fh = (l.wd * (l.h || 1)) / (l.w || 1);
  const lim = (v: number, other: number) => +Math.max(0, Math.min(1 - (+other || 0) - 0.06, v)).toFixed(4);
  const next = { ...l };
  if (edge.includes("L")) next.cl = lim((lx + fw / 2) / fw, l.cr);
  if (edge.includes("R")) next.cr = lim((fw / 2 - lx) / fw, l.cl);
  if (edge.includes("T")) next.ct = lim((ly + fh / 2) / fh, l.cb);
  if (edge.includes("B")) next.cb = lim((fh / 2 - ly) / fh, l.ct);
  return next;
}

function cropImg(l: NorenLayer, hit: boolean) {
  const g = layerFrame(l);
  const vx = g.cl * l.w;
  const vy = g.ct * l.h;
  const vw = (1 - g.cl - g.cr) * l.w;
  const vh = (1 - g.ct - g.cb) * l.h;
  const target = hit
    ? `<rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="#fff" fill-opacity="0" data-id="${l.id}" style="cursor:move"/>`
    : "";
  return `<svg x="${g.left}" y="${g.top}" width="${g.visW}" height="${g.visH}" viewBox="${vx} ${vy} ${vw} ${vh}" preserveAspectRatio="none" overflow="hidden">${target}<image href="${l.url}" x="0" y="0" width="${l.w}" height="${l.h}" pointer-events="none"/></svg>`;
}

export function layersArt(layers: NorenLayer[] | undefined, W: number, H: number, clipId: string, hit = false) {
  if (!layers?.length) return "";
  const body = layers.map((l) => `<g transform="${layerTransform(l)}">${cropImg(l, hit)}</g>`).join("");
  return `<defs><clipPath id="${clipId}"><rect width="${W}" height="${H}"/></clipPath></defs><g clip-path="url(#${clipId})">${body}</g>`;
}

function cropChrome(l: NorenLayer, W: number) {
  const g = layerFrame(l);
  const t = Math.max(1.15, W * 0.016);
  const L = g.left;
  const T = g.top;
  const R = L + g.visW;
  const B = T + g.visH;
  const hit = `<rect data-id="${l.id}" x="${-g.fullW / 2}" y="${-g.fullH / 2}" width="${g.fullW}" height="${g.fullH}" fill="none" pointer-events="all"/>`;
  const mask = `<mask id="nc-cropm" maskUnits="userSpaceOnUse"><rect x="${-g.fullW / 2}" y="${-g.fullH / 2}" width="${g.fullW}" height="${g.fullH}" fill="#fff"/><rect x="${L}" y="${T}" width="${g.visW}" height="${g.visH}" fill="#000"/></mask>`;
  const ghost = `<image href="${l.url}" x="${-g.fullW / 2}" y="${-g.fullH / 2}" width="${g.fullW}" height="${g.fullH}" preserveAspectRatio="none" mask="url(#nc-cropm)" opacity=".55" pointer-events="none"/>`;
  const box = `<rect x="${L}" y="${T}" width="${g.visW}" height="${g.visH}" fill="none" stroke="#E94E3A" stroke-width="${t * 0.12}" pointer-events="none"/>`;
  const handles: Array<[CropEdge, number, number]> = [
    ["L", L, (T + B) / 2],
    ["R", R, (T + B) / 2],
    ["T", (L + R) / 2, T],
    ["B", (L + R) / 2, B],
    ["TL", L, T],
    ["TR", R, T],
    ["BL", L, B],
    ["BR", R, B],
  ];
  const dots = handles
    .map(
      ([k, x, y]) =>
        `<rect data-crop="${k}" data-id="${l.id}" x="${x - t / 2}" y="${y - t / 2}" width="${t}" height="${t}" fill="#FFF8EE" stroke="#E94E3A" stroke-width="${t * 0.16}"/>`,
    )
    .join("");
  return hit + mask + ghost + box + dots;
}

function dimLines(l: NorenLayer, W: number, H: number) {
  const b = layerBounds(l);
  const my = (b.T + b.B) / 2;
  const mx = (b.L + b.R) / 2;
  const k = 0.65;
  const stroke = `stroke="#3A6073" stroke-width=".16" fill="none" pointer-events="none"`;
  const hln = (x1: number, x2: number, y: number) =>
    `<path d="M${x1} ${y}H${x2}M${x1} ${y - k}v${k * 2}M${x2} ${y - k}v${k * 2}" ${stroke}/>`;
  const vln = (x: number, y1: number, y2: number) =>
    `<path d="M${x} ${y1}V${y2}M${x - k} ${y1}h${k * 2}M${x - k} ${y2}h${k * 2}" ${stroke}/>`;
  return hln(0, b.L, my) + hln(b.R, W, my) + vln(mx, 0, b.T) + vln(mx, b.B, H);
}

export function layerChrome(l: NorenLayer, W: number, H: number, opts: { crop: boolean; dim: boolean }) {
  const g = layerFrame(l);
  const r = Math.max(0.9, W * 0.014);
  const box = opts.crop
    ? cropChrome(l, W)
    : `<rect x="${g.left}" y="${g.top}" width="${g.visW}" height="${g.visH}" fill="none" stroke="#E94E3A" stroke-width="${r * 0.12}" stroke-dasharray="${r * 0.5} ${r * 0.35}" pointer-events="none"/>`;
  const dot = opts.crop
    ? ""
    : `<circle data-h="1" data-id="${l.id}" cx="${g.left + g.visW}" cy="${g.top + g.visH}" r="${r}" fill="#E94E3A" stroke="#FFF8EE" stroke-width="${r * 0.2}" style="cursor:nwse-resize"/>`;
  return (opts.dim ? dimLines(l, W, H) : "") + `<g transform="${layerTransform(l)}">${box}${dot}</g>`;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((ok, no) => {
    const im = new Image();
    im.onload = () => ok(im);
    im.onerror = () => no(new Error("img"));
    im.src = src;
  });
}

function trimAlpha(c: HTMLCanvasElement) {
  const ctx = c.getContext("2d");
  if (!ctx) return c;
  const w = c.width;
  const h = c.height;
  const d = ctx.getImageData(0, 0, w, h).data;
  let L = w;
  let R = -1;
  let T = h;
  let B = -1;
  for (let y = 0; y < h; y += 1) {
    for (let i = 0; i < w; i += 1) {
      if (d[(y * w + i) * 4 + 3] > 10) {
        if (i < L) L = i;
        if (i > R) R = i;
        if (y < T) T = y;
        if (y > B) B = y;
      }
    }
  }
  if (R < 0) return null;
  const pad = 2;
  const x0 = Math.max(0, L - pad);
  const y0 = Math.max(0, T - pad);
  const nw = Math.min(w, R + 1 + pad) - x0;
  const nh = Math.min(h, B + 1 + pad) - y0;
  if (nw >= w - 2 && nh >= h - 2) return c;
  const o = document.createElement("canvas");
  o.width = nw;
  o.height = nh;
  o.getContext("2d")?.drawImage(c, x0, y0, nw, nh, 0, 0, nw, nh);
  return o;
}

/**
 * Flood-fills from the border, clearing pixels close to the averaged corner colour.
 * Runs locally because the site CSP blocks CDN-hosted ML background removers.
 */
export async function removeLayerBackground(l: NorenLayer): Promise<NorenLayer> {
  const im = await loadImage(l.url);
  const max = 1600;
  const sc = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight));
  const w = Math.max(1, Math.round(im.naturalWidth * sc));
  const h = Math.max(1, Math.round(im.naturalHeight * sc));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(im, 0, 0, w, h);
  const imd = ctx.getImageData(0, 0, w, h);
  const d = imd.data;
  const corners = [0, w - 1, (h - 1) * w, h * w - 1];
  const bg = [0, 1, 2].map((ch) => corners.reduce((sum, i) => sum + d[i * 4 + ch], 0) / 4);
  const thr = 42;
  const near = (i: number) =>
    Math.abs(d[i * 4] - bg[0]) + Math.abs(d[i * 4 + 1] - bg[1]) + Math.abs(d[i * 4 + 2] - bg[2]) < thr;
  const seen = new Uint8Array(w * h);
  const q: number[] = [];
  for (let i = 0; i < w; i += 1) q.push(i, (h - 1) * w + i);
  for (let j = 1; j < h - 1; j += 1) q.push(j * w, j * w + w - 1);
  while (q.length) {
    const i = q.pop()!;
    if (i < 0 || i >= w * h || seen[i] || !near(i)) continue;
    seen[i] = 1;
    d[i * 4 + 3] = 0;
    q.push(i - 1, i + 1, i - w, i + w);
  }
  ctx.putImageData(imd, 0, 0);
  const t = trimAlpha(c);
  if (!t) throw new Error("empty");
  return {
    ...l,
    url: t.toDataURL("image/png"),
    w: t.width,
    h: t.height,
    cl: 0,
    cr: 0,
    ct: 0,
    cb: 0,
    wd: (+l.wd || 1) * (t.width / c.width),
  };
}
