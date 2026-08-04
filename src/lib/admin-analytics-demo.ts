/** Demo analytics for Admin Overview — replace with live collector / GA4 later. */

export type DateRangeKey = "today" | "7d" | "30d" | "custom";

export type AnalyticsBundle = {
  kpis: KpiCard[];
  traffic: TrafficPoint[];
  onlineBase: number;
};

export type KpiCard = {
  label: string;
  value: string;
  delta: string;
  up: boolean;
  hint: string;
};

export type TrafficPoint = {
  label: string;
  users: number;
  pageviews: number;
};

export type NamedCount = {
  name: string;
  value: number;
  meta?: string;
};

export type LiveViewer = {
  path: string;
  device: "mobile" | "desktop" | "tablet";
  city: string;
  secondsAgo: number;
};

const traffic7d: TrafficPoint[] = [
  { label: "จ", users: 186, pageviews: 412 },
  { label: "อ", users: 214, pageviews: 498 },
  { label: "พ", users: 198, pageviews: 455 },
  { label: "พฤ", users: 256, pageviews: 610 },
  { label: "ศ", users: 302, pageviews: 742 },
  { label: "ส", users: 268, pageviews: 680 },
  { label: "อา", users: 221, pageviews: 520 },
];

const traffic30d: TrafficPoint[] = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  const wave = Math.sin(i / 3.2) * 40;
  const weekend = i % 7 === 5 || i % 7 === 6 ? 35 : 0;
  const users = Math.round(170 + wave + weekend + (i % 5) * 8);
  return {
    label: `${day}`,
    users,
    pageviews: Math.round(users * 2.35),
  };
});

const trafficToday: TrafficPoint[] = [
  { label: "00", users: 4, pageviews: 9 },
  { label: "03", users: 2, pageviews: 5 },
  { label: "06", users: 12, pageviews: 28 },
  { label: "09", users: 48, pageviews: 112 },
  { label: "12", users: 66, pageviews: 158 },
  { label: "15", users: 72, pageviews: 176 },
  { label: "18", users: 58, pageviews: 140 },
  { label: "21", users: 31, pageviews: 74 },
];

export const demoAnalytics = {
  today: {
    kpis: [
      { label: "ผู้เข้าชม", value: "286", delta: "+12%", up: true, hint: "เทียบเมื่อวาน" },
      { label: "หน้าดู", value: "742", delta: "+9%", up: true, hint: "pageviews" },
      { label: "Session", value: "318", delta: "+6%", up: true, hint: "visits" },
      { label: "Bounce", value: "41%", delta: "-3%", up: true, hint: "ยิ่งต่ำยิ่งดี" },
      { label: "เวลาเฉลี่ย", value: "2:48", delta: "+18s", up: true, hint: "ต่อ session" },
      { label: "Lead ใหม่", value: "7", delta: "+2", up: true, hint: "จากฟอร์มเว็บ" },
    ] satisfies KpiCard[],
    traffic: trafficToday,
    onlineBase: 11,
  },
  "7d": {
    kpis: [
      { label: "ผู้เข้าชม", value: "1,645", delta: "+18%", up: true, hint: "เทียบ 7 วันก่อน" },
      { label: "หน้าดู", value: "3,917", delta: "+14%", up: true, hint: "pageviews" },
      { label: "Session", value: "1,892", delta: "+11%", up: true, hint: "visits" },
      { label: "Bounce", value: "44%", delta: "-2%", up: true, hint: "ยิ่งต่ำยิ่งดี" },
      { label: "เวลาเฉลี่ย", value: "2:36", delta: "+11s", up: true, hint: "ต่อ session" },
      { label: "Lead ใหม่", value: "39", delta: "+8", up: true, hint: "จากฟอร์มเว็บ" },
    ] satisfies KpiCard[],
    traffic: traffic7d,
    onlineBase: 11,
  },
  "30d": {
    kpis: [
      { label: "ผู้เข้าชม", value: "6,420", delta: "+22%", up: true, hint: "เทียบ 30 วันก่อน" },
      { label: "หน้าดู", value: "15,180", delta: "+19%", up: true, hint: "pageviews" },
      { label: "Session", value: "7,105", delta: "+16%", up: true, hint: "visits" },
      { label: "Bounce", value: "46%", delta: "-1%", up: true, hint: "ยิ่งต่ำยิ่งดี" },
      { label: "เวลาเฉลี่ย", value: "2:29", delta: "+8s", up: true, hint: "ต่อ session" },
      { label: "Lead ใหม่", value: "148", delta: "+21", up: true, hint: "จากฟอร์มเว็บ" },
    ] satisfies KpiCard[],
    traffic: traffic30d,
    onlineBase: 11,
  },
} as const;

export const demoDevices: NamedCount[] = [
  { name: "Mobile", value: 68 },
  { name: "Desktop", value: 27 },
  { name: "Tablet", value: 5 },
];

export const demoTopPages: NamedCount[] = [
  { name: "/", value: 1240, meta: "หน้าแรก" },
  { name: "/products/curtain", value: 682, meta: "ผ้าม่าน" },
  { name: "/products/roller-blinds", value: 514, meta: "ม่านม้วน" },
  { name: "/quote", value: 398, meta: "ขอใบเสนอราคา" },
  { name: "/estimate", value: 356, meta: "ประเมินราคา" },
  { name: "/products/venetian-blinds", value: 301, meta: "มู่ลี่" },
  { name: "/portfolio", value: 244, meta: "ผลงาน" },
  { name: "/catalog/wooden-blinds.pdf", value: 128, meta: "แคตตาล็อก" },
];

export const demoClicks: NamedCount[] = [
  { name: "ขอใบเสนอราคา", value: 186 },
  { name: "ประเมินราคา", value: 142 },
  { name: "LINE OA", value: 98 },
  { name: "โทรหาเซลล์", value: 74 },
  { name: "ดาวน์โหลดแคตตาล็อก", value: 61 },
  { name: "Download Brochure", value: 47 },
];

export const demoSources: NamedCount[] = [
  { name: "Organic Search", value: 42 },
  { name: "Direct", value: 24 },
  { name: "Social / LINE", value: 16 },
  { name: "Paid Ads", value: 11 },
  { name: "Referral", value: 7 },
];

export const demoFunnel = [
  { step: "เข้าเว็บ", value: 1645 },
  { step: "ดูสินค้า", value: 892 },
  { step: "ประเมิน / แคตตาล็อก", value: 410 },
  { step: "หน้าใบเสนอราคา", value: 198 },
  { step: "ส่ง Lead สำเร็จ", value: 39 },
];

export const demoLiveSeed: LiveViewer[] = [
  { path: "/products/curtain", device: "mobile", city: "กรุงเทพฯ", secondsAgo: 8 },
  { path: "/quote", device: "desktop", city: "นนทบุรี", secondsAgo: 14 },
  { path: "/", device: "mobile", city: "ชลบุรี", secondsAgo: 21 },
  { path: "/estimate", device: "mobile", city: "ปทุมธานี", secondsAgo: 33 },
  { path: "/products/venetian-blinds/wood", device: "tablet", city: "กรุงเทพฯ", secondsAgo: 41 },
  { path: "/portfolio", device: "desktop", city: "สมุทรปราการ", secondsAgo: 55 },
];

export const DEVICE_COLORS = {
  Mobile: "#0b1f3a",
  Desktop: "#c8102e",
  Tablet: "#5b677a",
} as const;

export const RANGE_OPTIONS: { key: Exclude<DateRangeKey, "custom">; label: string }[] = [
  { key: "today", label: "วันนี้" },
  { key: "7d", label: "7 วัน" },
  { key: "30d", label: "30 วัน" },
];

export function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function defaultCustomRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 13);
  return { from: toDateInputValue(from), to: toDateInputValue(to) };
}

export function resolvePresetRangeDates(key: Exclude<DateRangeKey, "custom">): {
  from: string;
  to: string;
} {
  const to = new Date();
  const from = new Date();
  if (key === "today") {
    return { from: toDateInputValue(to), to: toDateInputValue(to) };
  }
  from.setDate(to.getDate() - (key === "7d" ? 6 : 29));
  return { from: toDateInputValue(from), to: toDateInputValue(to) };
}

function parseDay(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

function daysInclusive(from: Date, to: Date): number {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.max(1, Math.round((b - a) / 86_400_000) + 1);
}

/** Build a demo analytics bundle for an arbitrary date range. */
export function buildCustomAnalyticsBundle(
  fromStr: string,
  toStr: string,
): AnalyticsBundle {
  let from = parseDay(fromStr);
  let to = parseDay(toStr);
  if (!from || !to) {
    const fallback = defaultCustomRange();
    from = parseDay(fallback.from)!;
    to = parseDay(fallback.to)!;
  }
  if (from > to) {
    const tmp = from;
    from = to;
    to = tmp;
  }

  const dayCount = daysInclusive(new Date(from), new Date(to));
  const traffic: TrafficPoint[] = [];
  for (let i = 0; i < dayCount; i++) {
    const day = new Date(from);
    day.setDate(from.getDate() + i);
    const wave = Math.sin(i / 3.2) * 40;
    const weekend = day.getDay() === 0 || day.getDay() === 6 ? 35 : 0;
    const users = Math.round(170 + wave + weekend + (i % 5) * 8);
    traffic.push({
      label: `${day.getDate()}/${day.getMonth() + 1}`,
      users,
      pageviews: Math.round(users * 2.35),
    });
  }

  const totalUsers = traffic.reduce((s, t) => s + t.users, 0);
  const totalPv = traffic.reduce((s, t) => s + t.pageviews, 0);
  const sessions = Math.round(totalUsers * 1.12);
  const leads = Math.max(1, Math.round(dayCount * 1.3));

  return {
    kpis: [
      {
        label: "ผู้เข้าชม",
        value: totalUsers.toLocaleString("th-TH"),
        delta: "+15%",
        up: true,
        hint: `${dayCount} วัน`,
      },
      {
        label: "หน้าดู",
        value: totalPv.toLocaleString("th-TH"),
        delta: "+12%",
        up: true,
        hint: "pageviews",
      },
      {
        label: "Session",
        value: sessions.toLocaleString("th-TH"),
        delta: "+10%",
        up: true,
        hint: "visits",
      },
      {
        label: "Bounce",
        value: "45%",
        delta: "-1%",
        up: true,
        hint: "ยิ่งต่ำยิ่งดี",
      },
      {
        label: "เวลาเฉลี่ย",
        value: "2:32",
        delta: "+9s",
        up: true,
        hint: "ต่อ session",
      },
      {
        label: "Lead ใหม่",
        value: String(leads),
        delta: `+${Math.max(1, Math.round(leads * 0.15))}`,
        up: true,
        hint: "จากฟอร์มเว็บ",
      },
    ],
    traffic,
    onlineBase: 11,
  };
}

export function getAnalyticsBundle(
  range: DateRangeKey,
  customFrom: string,
  customTo: string,
): AnalyticsBundle {
  if (range === "custom") {
    return buildCustomAnalyticsBundle(customFrom, customTo);
  }
  const preset = demoAnalytics[range];
  return {
    kpis: [...preset.kpis],
    traffic: [...preset.traffic],
    onlineBase: preset.onlineBase,
  };
}
