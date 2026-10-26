import type { QuoteLead } from "@/lib/leads/types";

export type NorenDesignLayer = {
  /** Index into the lead's uploaded files (siteImageUrls). */
  file: number;
  w: number;
  h: number;
  x: number;
  y: number;
  wd: number;
  r: number;
  fx: boolean;
  fy: boolean;
  cl: number;
  cr: number;
  ct: number;
  cb: number;
};

export type NorenDesignPiece = {
  name: string;
  W: number;
  H: number;
  N: number;
  qty: number;
  bg: string;
  top: "loop" | "rod";
  note: string;
  layers: NorenDesignLayer[];
};

export type NorenDesignPayload = {
  kind: "noren-design" | "noren-send";
  pieces: NorenDesignPiece[];
};

const MAX_DESIGN_CHARS = 40_000;

function num(v: unknown, fallback: number, min = -1e6, max = 1e6) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

function text(v: unknown, max: number) {
  return typeof v === "string" ? v.slice(0, max) : "";
}

/** Validates the client-sent layout; anything malformed is dropped rather than trusted. */
export function parseNorenDesign(raw: unknown): NorenDesignPayload | null {
  if (typeof raw !== "string" || !raw || raw.length > MAX_DESIGN_CHARS) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  const obj = data as { kind?: unknown; pieces?: unknown };
  if (obj.kind !== "noren-design" && obj.kind !== "noren-send") return null;
  if (!Array.isArray(obj.pieces)) return null;
  const pieces = obj.pieces.slice(0, 20).map((p: Record<string, unknown>) => ({
    name: text(p?.name, 80) || "ชุด",
    W: num(p?.W, 87, 1, 2000),
    H: num(p?.H, 59, 1, 2000),
    N: Math.round(num(p?.N, 1, 1, 24)),
    qty: Math.round(num(p?.qty, 1, 1, 999)),
    bg: /^#[0-9A-Fa-f]{6}$/.test(text(p?.bg, 7)) ? text(p?.bg, 7) : "",
    top: p?.top === "rod" ? ("rod" as const) : ("loop" as const),
    note: text(p?.note, 500),
    layers: (Array.isArray(p?.layers) ? p.layers : []).slice(0, 10).map((l: Record<string, unknown>) => ({
      file: Math.round(num(l?.file, -1, -1, 100)),
      w: num(l?.w, 1, 1, 10_000),
      h: num(l?.h, 1, 1, 10_000),
      x: num(l?.x, 0),
      y: num(l?.y, 0),
      wd: num(l?.wd, 10, 0.1, 10_000),
      r: num(l?.r, 0, -360, 360),
      fx: !!l?.fx,
      fy: !!l?.fy,
      cl: num(l?.cl, 0, 0, 1),
      cr: num(l?.cr, 0, 0, 1),
      ct: num(l?.ct, 0, 0, 1),
      cb: num(l?.cb, 0, 0, 1),
    })),
  }));
  return { kind: obj.kind, pieces };
}

export function readNorenDesign(lead: Pick<QuoteLead, "estimatePayload">): NorenDesignPayload | null {
  const p = lead.estimatePayload as Partial<NorenDesignPayload> | null | undefined;
  if (!p || (p.kind !== "noren-design" && p.kind !== "noren-send") || !Array.isArray(p.pieces)) return null;
  return p as NorenDesignPayload;
}

/**
 * Shape matches Easy Noren's project record (index.html `takeInbox`).
 * Layers carry `src` (short-lived signed URL) instead of inline data so the inbox stays small.
 */
export function toEasyNorenJob(lead: QuoteLead, design: NorenDesignPayload, imageUrls: string[]) {
  const no = lead.quoteNo || lead.id.slice(0, 8);
  const created = lead.createdAt.slice(0, 10);
  return {
    id: `web-${lead.id}`,
    name: `${lead.businessName || lead.contactName} · เว็บ`,
    ok: 0,
    sent: 1,
    createdAt: lead.createdAt,
    mode: design.kind === "noren-send" ? "send" : "design",
    note: lead.note || "",
    files: imageUrls,
    o: {
      cust: lead.businessName ? `${lead.businessName} (${lead.contactName})` : lead.contactName,
      phone: lead.phone,
      line: lead.lineId || "",
      email: lead.email,
      src: "เว็บช่างตี๋",
      no,
      job: no,
      quote: no,
      recv: created,
      due: lead.callbackDate || "",
      addr: lead.installAddress,
      bsame: !lead.billingAddress || lead.billingAddress === lead.installAddress ? 1 : 0,
      bill: lead.billingAddress || lead.installAddress,
      ink: "",
      fab: "",
    },
    sets: design.pieces.map((p, i) => ({
      id: `web-${lead.id}-${i + 1}`,
      name: p.name,
      W: p.W,
      H: p.H,
      N: p.N,
      A: 2,
      B: 2,
      lt: 2,
      lm: "print",
      top: p.top,
      rod: 20,
      tw: 5.5,
      th: 9,
      tabs: p.N + 1,
      bg: p.bg || "#F4E6D4",
      clip: 1,
      guides: 0,
      dpi: 300,
      fit: 1,
      qty: p.qty,
      rail: "",
      rc: "",
      nt: p.note,
      layers: p.layers
        .filter((l) => imageUrls[l.file])
        .map((l, k) => ({
          id: `web-${lead.id}-${i + 1}-${k + 1}`,
          aid: `web-${lead.id}-f${l.file}`,
          name: `${p.name} ${k + 1}`,
          src: imageUrls[l.file],
          x: l.x,
          y: l.y,
          wd: l.wd,
          r: l.r,
          fx: l.fx ? 1 : 0,
          fy: l.fy ? 1 : 0,
          cl: l.cl,
          cr: l.cr,
          ct: l.ct,
          cb: l.cb,
          w: l.w,
          h: l.h,
        })),
    })),
  };
}
