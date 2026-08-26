import { ANALYTICS_CLICK_LABELS } from "@/lib/analytics/labels";
import type {
  AnalyticsBundle,
  KpiCard,
  LiveViewer,
  NamedCount,
} from "@/lib/admin-analytics-demo";

export type AnalyticsOverviewRaw = {
  visitors: number;
  pageviews: number;
  sessions: number;
  bounceRate: number;
  avgSessionSeconds: number;
  leads: number;
  prev: {
    visitors: number;
    pageviews: number;
    sessions: number;
    bounceRate: number;
    avgSessionSeconds: number;
    leads: number;
  };
  traffic: { label: string; users: number; pageviews: number }[];
  devices: { name: string; value: number }[];
  topPages: { name: string; value: number }[];
  clicks: { name: string; value: number }[];
  sources: { name: string; value: number }[];
  funnel: { step: string; value: number }[];
  liveOnline: number;
  liveRows: {
    path: string;
    device: "mobile" | "desktop" | "tablet";
    referrerHost: string | null;
    occurredAt: string;
  }[];
};

export type AdminAnalyticsPayload = {
  source: "live";
  kpis: KpiCard[];
  traffic: AnalyticsBundle["traffic"];
  devices: NamedCount[];
  topPages: NamedCount[];
  clicks: NamedCount[];
  sources: NamedCount[];
  funnel: { step: string; value: number }[];
  live: { online: number; rows: LiveViewer[] };
};

const PAGE_META: Record<string, string> = {
  "/": "หน้าแรก",
  "/quote": "ขอใบเสนอราคา",
  "/contact": "ติดต่อ",
  "/portfolio": "ผลงาน",
  "/products": "สินค้า",
  "/products/curtain": "ผ้าม่าน",
  "/products/roller-blinds": "ม่านม้วน",
  "/products/venetian-blinds": "มู่ลี่",
  "/about": "เกี่ยวกับเรา",
  "/visit-factory": "เยี่ยมชมโรงงาน",
  "/blog": "บทความ",
  "/careers": "ร่วมงาน",
};

const BOT_UA =
  /bot|crawl|spider|slurp|facebookexternalhit|preview|lighthouse|headless/i;

export function deviceFromUserAgent(ua: string): "mobile" | "desktop" | "tablet" {
  if (/ipad|tablet|playbook|silk/i.test(ua)) return "tablet";
  if (/mobi|iphone|android|ipod|windows phone/i.test(ua)) return "mobile";
  return "desktop";
}

export function isBotUserAgent(ua: string) {
  return BOT_UA.test(ua);
}

export function sanitizeAnalyticsPath(raw: unknown): string | null {
  const value = String(raw || "").trim();
  if (!value.startsWith("/")) return null;
  const path = value.split("?")[0]?.split("#")[0] ?? "";
  if (path.length < 1 || path.length > 200) return null;
  if (path.startsWith("/admin") || path.startsWith("/api") || path.startsWith("/_next")) {
    return null;
  }
  if (path.startsWith("/dev")) return null;
  if (!/^\/[A-Za-z0-9\-._/~%]*$/.test(path)) return null;
  return path;
}

export function sanitizeId(raw: unknown): string | null {
  const value = String(raw || "").trim();
  if (!/^[a-zA-Z0-9_-]{8,64}$/.test(value)) return null;
  return value;
}

export function hostFromRequest(request: Request) {
  const raw =
    request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  return raw.split(",")[0]?.trim().split(":")[0]?.toLowerCase() || null;
}

export function referrerHostFromRequest(request: Request) {
  const raw = request.headers.get("referer") || request.headers.get("referrer") || "";
  try {
    return new URL(raw).hostname.toLowerCase() || null;
  } catch {
    return null;
  }
}

export function bangkokRange(from: string, to: string) {
  const start = `${from}T00:00:00+07:00`;
  const endDate = new Date(`${to}T00:00:00+07:00`);
  endDate.setDate(endDate.getDate() + 1);
  return { from: start, to: endDate.toISOString() };
}

function formatNumber(value: number) {
  return Number(value || 0).toLocaleString("th-TH");
}

function formatDuration(seconds: number) {
  const total = Math.max(0, Math.round(seconds || 0));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function deltaOf(current: number, previous: number, kind: "count" | "pp" = "count") {
  if (previous <= 0 && current <= 0) {
    return { delta: "—", up: true };
  }
  if (previous <= 0) {
    return { delta: "ใหม่", up: true };
  }
  const diff = current - previous;
  const up = kind === "pp" ? diff <= 0 : diff >= 0;
  if (kind === "pp") {
    const sign = diff > 0 ? "+" : "";
    return { delta: `${sign}${diff.toFixed(1).replace(/\.0$/, "")}pp`, up };
  }
  const pct = Math.round((diff / previous) * 100);
  const sign = pct > 0 ? "+" : "";
  return { delta: `${sign}${pct}%`, up };
}

function pageMeta(path: string) {
  if (PAGE_META[path]) return PAGE_META[path];
  if (path.startsWith("/products/")) return "สินค้า";
  if (path.startsWith("/portfolio/")) return "ผลงาน";
  if (path.startsWith("/blog/")) return "บทความ";
  if (path.endsWith(".pdf")) return "แคตตาล็อก";
  return undefined;
}

function toPercents(rows: { name: string; value: number }[]): NamedCount[] {
  const total = rows.reduce((sum, row) => sum + Number(row.value || 0), 0);
  if (!total) return [];
  return rows.map((row) => ({
    name: row.name,
    value: Math.round((Number(row.value || 0) / total) * 100),
  }));
}

function clickLabel(name: string) {
  return name in ANALYTICS_CLICK_LABELS
    ? ANALYTICS_CLICK_LABELS[name as keyof typeof ANALYTICS_CLICK_LABELS]
    : name;
}

function liveCity(referrerHost: string | null) {
  if (!referrerHost) return "ตรง";
  if (/google|bing|yahoo/.test(referrerHost)) return "ค้นหา";
  if (/facebook|instagram|tiktok|line\.me/.test(referrerHost)) return "โซเชียล";
  return referrerHost;
}

export function toAdminAnalyticsPayload(raw: AnalyticsOverviewRaw): AdminAnalyticsPayload {
  const prev = raw?.prev ?? {
    visitors: 0,
    pageviews: 0,
    sessions: 0,
    bounceRate: 0,
    avgSessionSeconds: 0,
    leads: 0,
  };
  const safe = raw ?? {
    visitors: 0,
    pageviews: 0,
    sessions: 0,
    bounceRate: 0,
    avgSessionSeconds: 0,
    leads: 0,
    prev,
    traffic: [],
    devices: [],
    topPages: [],
    clicks: [],
    sources: [],
    funnel: [],
    liveOnline: 0,
    liveRows: [],
  };
  const visitors = deltaOf(safe.visitors, prev.visitors);
  const pageviews = deltaOf(safe.pageviews, prev.pageviews);
  const sessions = deltaOf(safe.sessions, prev.sessions);
  const bounce = deltaOf(Number(safe.bounceRate || 0), Number(prev.bounceRate || 0), "pp");
  const duration = deltaOf(safe.avgSessionSeconds, prev.avgSessionSeconds);
  const leads = deltaOf(safe.leads, prev.leads);

  const now = Date.now();
  const liveRows: LiveViewer[] = (safe.liveRows || []).slice(0, 8).map((row) => ({
    path: row.path,
    device: row.device,
    city: liveCity(row.referrerHost),
    secondsAgo: Math.max(
      0,
      Math.round((now - new Date(row.occurredAt).getTime()) / 1000),
    ),
  }));

  const devices = toPercents(safe.devices || []);
  const filledDevices: NamedCount[] =
    devices.length > 0
      ? devices
      : [
          { name: "Mobile", value: 0 },
          { name: "Desktop", value: 0 },
          { name: "Tablet", value: 0 },
        ];

  return {
    source: "live",
    kpis: [
      {
        label: "ผู้เข้าชม",
        value: formatNumber(safe.visitors),
        delta: visitors.delta,
        up: visitors.up,
        hint: "เทียบช่วงก่อนหน้า",
      },
      {
        label: "หน้าดู",
        value: formatNumber(safe.pageviews),
        delta: pageviews.delta,
        up: pageviews.up,
        hint: "pageviews",
      },
      {
        label: "Session",
        value: formatNumber(safe.sessions),
        delta: sessions.delta,
        up: sessions.up,
        hint: "visits",
      },
      {
        label: "Bounce",
        value: `${Number(safe.bounceRate || 0)}%`,
        delta: bounce.delta,
        up: bounce.up,
        hint: "ยิ่งต่ำยิ่งดี",
      },
      {
        label: "เวลาเฉลี่ย",
        value: formatDuration(safe.avgSessionSeconds),
        delta: duration.delta,
        up: duration.up,
        hint: "ต่อ session",
      },
      {
        label: "Lead ใหม่",
        value: formatNumber(safe.leads),
        delta: leads.delta,
        up: leads.up,
        hint: "จากฟอร์มเว็บ",
      },
    ],
    traffic: safe.traffic || [],
    devices: filledDevices,
    topPages: (safe.topPages || []).map((page) => ({
      name: page.name,
      value: page.value,
      meta: pageMeta(page.name),
    })),
    clicks: (safe.clicks || []).map((click) => ({
      name: clickLabel(click.name),
      value: click.value,
    })),
    sources: toPercents(safe.sources || []),
    funnel: safe.funnel || [],
    live: {
      online: Number(safe.liveOnline || 0),
      rows: liveRows,
    },
  };
}
