import { getCategory } from "@/lib/product-catalog";
import { createServiceSupabase } from "@/lib/supabase/server";

export type ReportPeriod = "week" | "month";

/** Bangkok calendar days; `to` is exclusive. */
export type DayRange = { from: string; to: string };

export type ReportWindow = {
  period: ReportPeriod;
  sentOn: string;
  current: DayRange;
  previous: DayRange;
};

export type WebReportStats = {
  visitors: number;
  pageviews: number;
  sessions: number;
  leads: number;
  contacts: { line: number; phone: number; quote: number; facebook: number };
  hours: number[];
  peakDay: { day: string; people: number } | null;
  mobileShare: number;
  sourcesTracked: number;
  sourcesTrackedFrom: string | null;
  sources: { search: number; ai: number; direct: number; social: number; other: number };
  topProducts: { slug: string; views: number }[];
};

/** First day the tracker stored the visitor's real referrer. */
const SOURCE_TRACKING_SINCE = "2026-10-19";

const DAY_SHORT = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
const DAY_FULL = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
const MONTH_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];
const MONTH_FULL = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

const NAVY = "#0B1F3A";
const RED = "#C0392B";
const UP = "#1E8E5A";
const MUTED = "#6B7280";
const INK = "#111827";
const SOFT = "#F4F6F9";
const BAR = "#CBD5E1";
const SOURCE_COLORS = ["#0B1F3A", "#7C3AED", "#5B7DB1", "#A9BCD8", "#E3E8F0"];

function parseDay(day: string) {
  return new Date(`${day}T00:00:00Z`);
}

function formatDay(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(day: string, days: number) {
  const date = parseDay(day);
  date.setUTCDate(date.getUTCDate() + days);
  return formatDay(date);
}

function firstOfMonth(day: string, monthOffset: number) {
  const date = parseDay(day);
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + monthOffset);
  return formatDay(date);
}

export function isReportDay(value: string | null): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(parseDay(value).getTime()));
}

export function bangkokToday(now = new Date()) {
  return formatDay(new Date(now.getTime() + 7 * 60 * 60 * 1000));
}

/** Weekly = the Monday–Sunday before `today`; monthly = the calendar month before `today`. */
export function reportWindow(period: ReportPeriod, today: string): ReportWindow {
  if (period === "week") {
    const monday = addDays(today, -((parseDay(today).getUTCDay() + 6) % 7));
    return {
      period,
      sentOn: today,
      current: { from: addDays(monday, -7), to: monday },
      previous: { from: addDays(monday, -14), to: addDays(monday, -7) },
    };
  }
  const first = firstOfMonth(today, 0);
  return {
    period,
    sentOn: today,
    current: { from: firstOfMonth(first, -1), to: first },
    previous: { from: firstOfMonth(first, -2), to: firstOfMonth(first, -1) },
  };
}

type RawStats = {
  visitors?: unknown;
  pageviews?: unknown;
  sessions?: unknown;
  leads?: unknown;
  contacts?: Record<string, unknown>;
  hours?: unknown[];
  peakDay?: { day?: unknown; people?: unknown } | null;
  mobileShare?: unknown;
  sourcesTracked?: unknown;
  sourcesTrackedFrom?: unknown;
  sources?: Record<string, unknown>;
  topProducts?: Record<string, unknown>[];
};

function num(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export async function fetchWebReportStats(range: DayRange): Promise<WebReportStats> {
  return fetchWebReportStatsBetween({
    from: `${range.from}T00:00:00+07:00`,
    to: `${range.to}T00:00:00+07:00`,
  });
}

/** ISO timestamps; `to` is exclusive. */
export type TimeRange = { from: string; to: string };

export async function fetchWebReportStatsBetween(range: TimeRange): Promise<WebReportStats> {
  const supabase = createServiceSupabase();
  const { data, error } = await supabase.rpc("line_report_stats", {
    p_from: range.from,
    p_to: range.to,
  });
  if (error) throw new Error(error.message);

  const raw = (data ?? {}) as RawStats;
  const hours = Array.isArray(raw.hours) ? raw.hours.map(num) : [];
  return {
    visitors: num(raw.visitors),
    pageviews: num(raw.pageviews),
    sessions: num(raw.sessions),
    leads: num(raw.leads),
    contacts: {
      line: num(raw.contacts?.line),
      phone: num(raw.contacts?.phone),
      quote: num(raw.contacts?.quote),
      facebook: num(raw.contacts?.facebook),
    },
    hours: Array.from({ length: 8 }, (_, i) => hours[i] ?? 0),
    peakDay: raw.peakDay?.day ? { day: String(raw.peakDay.day), people: num(raw.peakDay.people) } : null,
    mobileShare: num(raw.mobileShare),
    sourcesTracked: num(raw.sourcesTracked),
    sourcesTrackedFrom: raw.sourcesTrackedFrom ? String(raw.sourcesTrackedFrom) : null,
    sources: {
      search: num(raw.sources?.search),
      ai: num(raw.sources?.ai),
      direct: num(raw.sources?.direct),
      social: num(raw.sources?.social),
      other: num(raw.sources?.other),
    },
    topProducts: Array.isArray(raw.topProducts)
      ? raw.topProducts.map((row) => ({
          slug: String(row.slug ?? ""),
          views: num(row.views),
        }))
      : [],
  };
}

function fmt(value: number) {
  return Math.round(value).toLocaleString("th-TH");
}

function beYear(date: Date) {
  return date.getUTCFullYear() + 543;
}

function dayMonth(day: string) {
  const date = parseDay(day);
  return `${date.getUTCDate()} ${MONTH_SHORT[date.getUTCMonth()]}`;
}

function shortRange(range: DayRange) {
  const start = parseDay(range.from);
  const end = parseDay(addDays(range.to, -1));
  return start.getUTCMonth() === end.getUTCMonth()
    ? `${start.getUTCDate()} – ${end.getUTCDate()} ${MONTH_SHORT[end.getUTCMonth()]}`
    : `${dayMonth(range.from)} – ${dayMonth(addDays(range.to, -1))}`;
}

function weekRangeLabel(range: DayRange) {
  const startDay = range.from;
  const endDay = addDays(range.to, -1);
  const start = parseDay(startDay);
  const end = parseDay(endDay);
  const startPart =
    start.getUTCMonth() === end.getUTCMonth()
      ? `${DAY_SHORT[start.getUTCDay()]} ${start.getUTCDate()}`
      : `${DAY_SHORT[start.getUTCDay()]} ${dayMonth(startDay)}${beYear(start) === beYear(end) ? "" : ` ${beYear(start)}`}`;
  return `${startPart} – ${DAY_SHORT[end.getUTCDay()]} ${dayMonth(endDay)} ${beYear(end)}`;
}

function longDay(day: string) {
  const date = parseDay(day);
  return `${DAY_FULL[date.getUTCDay()]} ${dayMonth(day)}`;
}

function longDayWithYear(day: string) {
  return `${dayMonth(day)} ${beYear(parseDay(day))}`;
}

export function reportLabels(window: ReportWindow) {
  if (window.period === "week") {
    return {
      title: "สรุปเว็บรายสัปดาห์",
      range: weekRangeLabel(window.current),
      versus: `เทียบ ${shortRange(window.previous)}`,
      previousName: "สัปดาห์ก่อน",
    };
  }
  const month = parseDay(window.current.from);
  const prev = parseDay(window.previous.from);
  const lastDay = parseDay(addDays(window.current.to, -1)).getUTCDate();
  return {
    title: `สรุปเว็บเดือน${MONTH_FULL[month.getUTCMonth()]}`,
    range: `1 – ${lastDay} ${MONTH_SHORT[month.getUTCMonth()]} ${beYear(month)}`,
    versus: `เทียบ ${MONTH_SHORT[prev.getUTCMonth()]} ${beYear(prev)}`,
    previousName: "เดือนก่อน",
  };
}

export const MAX_CUSTOM_REPORT_DAYS = 93;

export type LiveReport = {
  current: TimeRange;
  previous: TimeRange;
  /** Whether the window reaches the current moment, so numbers still move. */
  live: boolean;
  labels: ReturnType<typeof reportLabels>;
};

function bangkokMidnight(day: string) {
  return `${day}T00:00:00+07:00`;
}

function bangkokClock(ms: number) {
  return new Date(ms + 7 * 60 * 60 * 1000).toISOString().slice(11, 16);
}

/** Today so far vs yesterday up to the same clock time — a fair comparison mid-day. */
export function todayReport(nowMs = Date.now()): LiveReport {
  const today = bangkokToday(new Date(nowMs));
  const yesterday = addDays(today, -1);
  const date = parseDay(today);
  return {
    current: { from: bangkokMidnight(today), to: new Date(nowMs).toISOString() },
    previous: { from: bangkokMidnight(yesterday), to: new Date(nowMs - 86_400_000).toISOString() },
    live: true,
    labels: {
      title: "สรุปเว็บวันนี้",
      range: `${DAY_SHORT[date.getUTCDay()]} ${dayMonth(today)} ${beYear(date)} · ถึง ${bangkokClock(nowMs)} น.`,
      versus: "เทียบเมื่อวานช่วงเวลาเดียวกัน",
      previousName: "เมื่อวานช่วงเวลาเดียวกัน",
    },
  };
}

/**
 * Picked days `from`–`to` (inclusive) vs the same number of days right before.
 * A range ending today is cut at now, and the comparison is cut at the same offset.
 */
export function customRangeReport(from: string, to: string, nowMs = Date.now()): LiveReport | null {
  const today = bangkokToday(new Date(nowMs));
  if (from > to || to > today) return null;
  const days = Math.round((parseDay(to).getTime() - parseDay(from).getTime()) / 86_400_000) + 1;
  if (days > MAX_CUSTOM_REPORT_DAYS) return null;

  const end = addDays(to, 1);
  const prevFrom = addDays(from, -days);
  const live = to === today;
  const currentTo = live ? new Date(nowMs).toISOString() : bangkokMidnight(end);
  const previousTo = live ? new Date(nowMs - days * 86_400_000).toISOString() : bangkokMidnight(from);
  const single = days === 1;
  const fromDate = parseDay(from);
  return {
    current: { from: bangkokMidnight(from), to: currentTo },
    previous: { from: bangkokMidnight(prevFrom), to: previousTo },
    live,
    labels: {
      title: single ? `สรุปเว็บวัน${DAY_FULL[fromDate.getUTCDay()]}` : `สรุปเว็บ ${days} วัน`,
      range: single
        ? `${DAY_SHORT[fromDate.getUTCDay()]} ${dayMonth(from)} ${beYear(fromDate)}${live ? ` · ถึง ${bangkokClock(nowMs)} น.` : ""}`
        : `${weekRangeLabel({ from, to: end })}${live ? ` · ถึง ${bangkokClock(nowMs)} น.` : ""}`,
      versus: single ? `เทียบ ${dayMonth(prevFrom)}` : `เทียบ ${shortRange({ from: prevFrom, to: from })}`,
      previousName: single ? "วันก่อนหน้า" : `${days} วันก่อนหน้า`,
    },
  };
}

type Tone = "up" | "down" | "flat";
type Change = { text: string; tone: Tone };

function pctChange(current: number, previous: number): Change {
  if (previous <= 0) return current > 0 ? { text: "ใหม่", tone: "up" } : { text: "—", tone: "flat" };
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return { text: "เท่าเดิม", tone: "flat" };
  return pct > 0 ? { text: `▲ ${pct}%`, tone: "up" } : { text: `▼ ${Math.abs(pct)}%`, tone: "down" };
}

function diffChange(current: number, previous: number, unit: string, digits = 0): Change {
  const diff = Number((current - previous).toFixed(digits));
  if (diff === 0) return { text: "เท่าเดิม", tone: "flat" };
  const amount = Math.abs(diff).toFixed(digits);
  return diff > 0 ? { text: `▲ ${amount} ${unit}`, tone: "up" } : { text: `▼ ${amount} ${unit}`, tone: "down" };
}

function toneColor(tone: Tone, onDark = false) {
  if (tone === "up") return onDark ? "#7FE0AE" : UP;
  if (tone === "down") return onDark ? "#F5A3A3" : RED;
  return onDark ? "#C9D3E3" : MUTED;
}

type FlexNode = Record<string, unknown>;

function text(value: string, options: FlexNode = {}): FlexNode {
  return { type: "text", text: value, ...options };
}

function box(layout: "vertical" | "horizontal" | "baseline", contents: FlexNode[], options: FlexNode = {}): FlexNode {
  return { type: "box", layout, contents, ...options };
}

function sectionTitle(title: string, hint: string): FlexNode {
  return box("horizontal", [
    text(title, { size: "xs", color: MUTED, weight: "bold", flex: 1 }),
    text(hint, { size: "xxs", color: MUTED, align: "end", flex: 1 }),
  ]);
}

function divider(): FlexNode {
  return { type: "separator", margin: "lg", color: "#E5E7EB" };
}

function kpiCell(label: string, value: string, unit: string, change: Change, from: string, highlight = false): FlexNode {
  return box(
    "vertical",
    [
      text(label, { size: "xxs", color: highlight ? "#C9D3E3" : MUTED }),
      {
        type: "text",
        margin: "xs",
        contents: [
          { type: "span", text: value, size: "xl", weight: "bold", color: highlight ? "#FFFFFF" : NAVY },
          { type: "span", text: ` ${unit}`, size: "xxs", color: highlight ? "#C9D3E3" : MUTED },
        ],
      },
      text(change.tone === "flat" && change.text === "—" ? "—" : `${change.text} จาก ${from}`, {
        size: "xxs",
        weight: "bold",
        color: toneColor(change.tone, highlight),
        wrap: true,
        margin: "xs",
      }),
    ],
    {
      flex: 1,
      backgroundColor: highlight ? NAVY : SOFT,
      cornerRadius: "md",
      paddingAll: "10px",
    },
  );
}

function meterRow(label: string, value: number, max: number, change: Change): FlexNode {
  const width = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0;
  return box(
    "horizontal",
    [
      text(label, { size: "xs", color: INK, flex: 3 }),
      box(
        "vertical",
        width > 0
          ? [box("vertical", [], { width: `${width}%`, height: "8px", backgroundColor: NAVY, cornerRadius: "4px" })]
          : [],
        { flex: 5, height: "8px", backgroundColor: SOFT, cornerRadius: "4px" },
      ),
      text(fmt(value), { size: "xs", weight: "bold", color: NAVY, align: "end", flex: 2 }),
      text(change.text, { size: "xxs", weight: "bold", color: toneColor(change.tone), align: "end", flex: 2 }),
    ],
    { alignItems: "center", spacing: "sm" },
  );
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function hoursSection(stats: WebReportStats): FlexNode[] {
  const max = Math.max(...stats.hours, 0);
  const peak = stats.hours.indexOf(max);
  const nodes: FlexNode[] = [sectionTitle("ช่วงเวลาที่คนเข้าเยอะ", "คนเข้าเว็บ")];
  if (max <= 0) {
    nodes.push(text("ยังไม่มีคนเข้าเว็บในช่วงนี้", { size: "xs", color: MUTED }));
    return nodes;
  }
  nodes.push({
    type: "text",
    size: "sm",
    weight: "bold",
    color: NAVY,
    contents: [
      { type: "span", text: "คนเข้าเยอะสุด " },
      { type: "span", text: `${pad2(peak * 3)}:00 – ${pad2(peak * 3 + 3)}:00 น.`, color: RED },
    ],
  });
  nodes.push(
    box(
      "horizontal",
      stats.hours.map((value, i) =>
        box("vertical", [], {
          flex: 1,
          height: `${Math.max(3, Math.round((value / max) * 56))}px`,
          backgroundColor: i === peak ? RED : BAR,
          cornerRadius: "3px",
        }),
      ),
      { height: "56px", alignItems: "flex-end", spacing: "xs", margin: "sm" },
    ),
  );
  nodes.push(
    box(
      "horizontal",
      stats.hours.map((_, i) => text(pad2(i * 3), { size: "xxs", color: MUTED, align: "center", flex: 1 })),
      { spacing: "xs" },
    ),
  );
  if (stats.peakDay) {
    nodes.push(
      text(`วันที่คนเข้าเยอะสุด: ${longDay(stats.peakDay.day)} (${fmt(stats.peakDay.people)} คน)`, {
        size: "xxs",
        color: MUTED,
        align: "center",
        wrap: true,
        margin: "sm",
      }),
    );
  }
  return nodes;
}

function sourcesSection(current: WebReportStats, previous: WebReportStats): FlexNode[] {
  const nodes: FlexNode[] = [sectionTitle("คนมาจากไหน", "คน · เทียบ")];
  const rows: [string, keyof WebReportStats["sources"]][] = [
    ["Google / ค้นหา", "search"],
    ["AI (ChatGPT ฯลฯ)", "ai"],
    ["เข้าตรง", "direct"],
    ["โซเชียล / LINE", "social"],
    ["เว็บอื่น ๆ", "other"],
  ];
  const total = rows.reduce((sum, [, key]) => sum + current.sources[key], 0);

  if (current.sourcesTracked === 0 || total === 0) {
    nodes.push(
      text(`เริ่มเก็บข้อมูลส่วนนี้ตั้งแต่ ${longDayWithYear(SOURCE_TRACKING_SINCE)} รายงานรอบถัดไปจะเริ่มเห็นตัวเลข`, {
        size: "xs",
        color: MUTED,
        wrap: true,
      }),
    );
  } else {
    const shares = rows.map(([, key]) => Math.round((current.sources[key] / total) * 100));
    nodes.push(
      box(
        "horizontal",
        shares.flatMap((share, i) =>
          share > 0 ? [box("vertical", [], { width: `${share}%`, height: "10px", backgroundColor: SOURCE_COLORS[i] })] : [],
        ),
        { height: "10px", cornerRadius: "5px", backgroundColor: SOFT, margin: "sm" },
      ),
    );
    const comparable = previous.sourcesTracked > 0;
    rows.forEach(([label, key], i) => {
      const change = comparable ? pctChange(current.sources[key], previous.sources[key]) : { text: "—", tone: "flat" as Tone };
      nodes.push(
        box(
          "horizontal",
          [
            box("vertical", [], {
              width: "8px",
              height: "8px",
              flex: 0,
              backgroundColor: SOURCE_COLORS[i],
              cornerRadius: "2px",
              borderWidth: i === rows.length - 1 ? "1px" : undefined,
              borderColor: i === rows.length - 1 ? BAR : undefined,
            }),
            text(label, { size: "xs", color: INK, flex: 5 }),
            text(`${shares[i]}%`, { size: "xxs", color: MUTED, align: "end", flex: 2 }),
            text(fmt(current.sources[key]), { size: "xs", weight: "bold", color: NAVY, align: "end", flex: 2 }),
            text(change.text, { size: "xxs", weight: "bold", color: toneColor(change.tone), align: "end", flex: 2 }),
          ],
          { alignItems: "center", spacing: "sm" },
        ),
      );
    });
    if (current.sourcesTracked < current.sessions * 0.95 && current.sourcesTrackedFrom) {
      nodes.push(
        text(`นับเฉพาะตั้งแต่ ${longDayWithYear(current.sourcesTrackedFrom)}`, { size: "xxs", color: MUTED, wrap: true }),
      );
    }
  }

  nodes.push(
    text(`เข้าจากมือถือ ${fmt(current.mobileShare)}% · คอมพิวเตอร์/แท็บเล็ต ${fmt(Math.max(0, 100 - current.mobileShare))}%`, {
      size: "xxs",
      color: MUTED,
      align: "center",
      wrap: true,
      margin: "sm",
    }),
  );
  return nodes;
}

function productsSection(stats: WebReportStats): FlexNode[] {
  const nodes: FlexNode[] = [sectionTitle("สินค้าที่คนดูมาก", "ครั้ง")];
  if (!stats.topProducts.length) {
    nodes.push(text("ยังไม่มีคนเปิดหน้าสินค้าในช่วงนี้", { size: "xs", color: MUTED }));
    return nodes;
  }
  stats.topProducts.forEach((product, i) => {
    nodes.push(
      box(
        "horizontal",
        [
          box("vertical", [text(String(i + 1), { size: "xxs", weight: "bold", color: NAVY, align: "center" })], {
            width: "18px",
            height: "18px",
            flex: 0,
            cornerRadius: "9px",
            backgroundColor: SOFT,
            justifyContent: "center",
          }),
          text(getCategory(product.slug)?.name ?? product.slug, { size: "xs", color: INK, flex: 1 }),
          text(fmt(product.views), { size: "xxs", color: MUTED, align: "end", flex: 0 }),
        ],
        { alignItems: "center", spacing: "sm" },
      ),
    );
  });
  return nodes;
}

function rate(stats: WebReportStats) {
  return stats.visitors > 0 ? (stats.leads / stats.visitors) * 100 : 0;
}

export function webReportMessage(window: ReportWindow, current: WebReportStats, previous: WebReportStats) {
  const labels = reportLabels(window);
  const currentRate = rate(current);
  const previousRate = rate(previous);
  const contactRows: [string, number, number][] = [
    ["กด LINE", current.contacts.line, previous.contacts.line],
    ["กดโทร", current.contacts.phone, previous.contacts.phone],
    ["กดขอราคา", current.contacts.quote, previous.contacts.quote],
    ["Facebook", current.contacts.facebook, previous.contacts.facebook],
  ];
  const contactMax = Math.max(...contactRows.map(([, value]) => value), 0);

  const visitorsChange = pctChange(current.visitors, previous.visitors);
  const pageviewsChange = pctChange(current.pageviews, previous.pageviews);
  const leadsChange = diffChange(current.leads, previous.leads, "ราย");
  const rateChange = diffChange(currentRate, previousRate, "จุด", 2);

  const body: FlexNode[] = [
    sectionTitle("ภาพรวม", labels.versus),
    box(
      "horizontal",
      [
        kpiCell("คนเข้าเว็บ", fmt(current.visitors), "คน", visitorsChange, fmt(previous.visitors)),
        kpiCell("ดูหน้าเว็บ", fmt(current.pageviews), "ครั้ง", pageviewsChange, fmt(previous.pageviews)),
      ],
      { spacing: "sm", margin: "sm" },
    ),
    box(
      "horizontal",
      [
        kpiCell("ขอใบเสนอราคา", fmt(current.leads), "ราย", leadsChange, fmt(previous.leads)),
        kpiCell("อัตราขอราคา", currentRate.toFixed(2), "%", rateChange, `${previousRate.toFixed(2)}%`, true),
      ],
      { spacing: "sm", margin: "sm" },
    ),
    divider(),
    sectionTitle("ลูกค้ากดติดต่อ", "คน · เทียบ"),
    ...contactRows.map(([label, value, prev]) => meterRow(label, value, contactMax, pctChange(value, prev))),
    divider(),
    ...hoursSection(current),
    divider(),
    ...sourcesSection(current, previous),
    divider(),
    ...productsSection(current),
    text(`ตัวเลขนับตามเวลาไทย · ▲▼ เทียบกับ${labels.previousName}`, {
      size: "xxs",
      color: MUTED,
      align: "center",
      wrap: true,
      margin: "lg",
    }),
  ];

  return {
    type: "flex",
    altText: `${labels.title} ${labels.range} · คนเข้าเว็บ ${fmt(current.visitors)} คน · ขอราคา ${fmt(current.leads)} ราย`.slice(0, 400),
    contents: {
      type: "bubble",
      size: "mega",
      header: box(
        "vertical",
        [
          text("ช่างตี๋ ผ้าม่าน · changtee-curtain.com", { size: "xxs", color: "#F3D2D0" }),
          text(labels.title, { size: "lg", weight: "bold", color: "#FFFFFF", wrap: true, margin: "sm" }),
          box(
            "horizontal",
            [
              box("vertical", [text(labels.range, { size: "xs", color: "#FFFFFF" })], {
                flex: 0,
                backgroundColor: "#FFFFFF1F",
                cornerRadius: "xl",
                paddingStart: "10px",
                paddingEnd: "10px",
                paddingTop: "4px",
                paddingBottom: "4px",
              }),
            ],
            { margin: "md" },
          ),
        ],
        { backgroundColor: NAVY, paddingAll: "16px" },
      ),
      body: box("vertical", body, { spacing: "sm", paddingAll: "14px" }),
      styles: {
        header: { separator: false },
        body: { separator: true, separatorColor: RED },
      },
    },
  };
}
