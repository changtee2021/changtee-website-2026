"use client";

import { useCallback, useEffect, useState } from "react";

type Liff = {
  init(config: { liffId: string }): Promise<void>;
  isLoggedIn(): boolean;
  login(): void;
  getIDToken(): string | null;
  closeWindow(): void;
};

type LeadRow = {
  id: string;
  quoteNo: string | null;
  contactName: string;
  productType: string;
  requestedSize: string | null;
  createdAt: string;
  claimedBy: string | null;
  jobStatus: "done" | null;
};

type JobView = {
  quoteNo: string | null;
  claimedBy: string | null;
  claimedAt: string | null;
  jobStatus: "done" | null;
  jobStatusAt: string | null;
  mine: boolean;
  contactName?: string;
  phone?: string;
  productType?: string;
  requestedSize?: string | null;
  installAddress?: string;
  callbackDate?: string | null;
};

type ReportStats = {
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
  topProducts: { slug: string; name: string; views: number }[];
};

type WebReport = {
  period: "week" | "month";
  labels: { title: string; range: string; versus: string; previousName: string };
  current: ReportStats;
  previous: ReportStats;
};

const SOURCE_ROWS = [
  ["Google / ค้นหา", "search", "#0B1F3A"],
  ["AI (ChatGPT ฯลฯ)", "ai", "#7C3AED"],
  ["เข้าตรง", "direct", "#5B7DB1"],
  ["โซเชียล / LINE", "social", "#A9BCD8"],
  ["เว็บอื่น ๆ", "other", "#E3E8F0"],
] as const;

const DAY_FULL = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
const MONTH_SHORT = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

function dayLabel(day: string, withWeekday = true) {
  const date = new Date(`${day}T00:00:00Z`);
  const base = `${date.getUTCDate()} ${MONTH_SHORT[date.getUTCMonth()]}`;
  return withWeekday ? `${DAY_FULL[date.getUTCDay()]} ${base}` : `${base} ${date.getUTCFullYear() + 543}`;
}

function fmt(value: number) {
  return Math.round(value).toLocaleString("th-TH");
}

type Tone = "up" | "down" | "flat";

function pct(current: number, previous: number): { text: string; tone: Tone } {
  if (previous <= 0) return current > 0 ? { text: "ใหม่", tone: "up" } : { text: "—", tone: "flat" };
  const p = Math.round(((current - previous) / previous) * 100);
  if (p === 0) return { text: "เท่าเดิม", tone: "flat" };
  return p > 0 ? { text: `▲ ${p}%`, tone: "up" } : { text: `▼ ${Math.abs(p)}%`, tone: "down" };
}

function diff(current: number, previous: number, unit: string, digits = 0): { text: string; tone: Tone } {
  const d = Number((current - previous).toFixed(digits));
  if (d === 0) return { text: "เท่าเดิม", tone: "flat" };
  const amount = Math.abs(d).toFixed(digits);
  return d > 0 ? { text: `▲ ${amount} ${unit}`, tone: "up" } : { text: `▼ ${amount} ${unit}`, tone: "down" };
}

const TONE_CLASS: Record<Tone, string> = {
  up: "text-emerald-700",
  down: "text-red-700",
  flat: "text-slate-500",
};

function leadRate(stats: ReportStats) {
  return stats.visitors > 0 ? (stats.leads / stats.visitors) * 100 : 0;
}

const SDK_URL = "https://static.line-scdn.net/liff/edge/2/sdk.js";

function loadSdk(): Promise<Liff> {
  const w = window as unknown as { liff?: Liff };
  if (w.liff) return Promise.resolve(w.liff);
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.onload = () => (w.liff ? resolve(w.liff) : reject(new Error("LIFF SDK missing")));
    script.onerror = () => reject(new Error("LIFF SDK failed to load"));
    document.head.appendChild(script);
  });
}

function formatTime(iso: string | null) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("th-TH", {
    timeZone: "Asia/Bangkok",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}

export default function LineJobClient({ liffId }: { liffId: string }) {
  const [liff, setLiff] = useState<Liff | null>(null);
  const [tab, setTab] = useState<"jobs" | "web">("jobs");
  const [leadId, setLeadId] = useState("");
  const [leads, setLeads] = useState<LeadRow[] | null>(null);
  const [filter, setFilter] = useState<"all" | "open" | "done">("all");
  const [job, setJob] = useState<JobView | null>(null);
  const [report, setReport] = useState<WebReport | null>(null);
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const api = useCallback(async (sdk: Liff, path: string, init?: RequestInit) => {
    const res = await fetch(path, {
      ...init,
      headers: {
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${sdk.getIDToken() ?? ""}`,
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(String(data.error ?? res.status));
    return data;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!liffId) throw new Error("ยังไม่ได้ตั้งค่า LIFF ID");
        const sdk = await loadSdk();
        await sdk.init({ liffId });
        if (!sdk.isLoggedIn()) {
          sdk.login();
          return;
        }
        const params = new URLSearchParams(window.location.search);
        const id = params.get("list") === "1" ? "" : (params.get("lead") ?? "");
        if (id) {
          const data = (await api(sdk, `/api/line/job?lead=${id}`)) as JobView;
          if (cancelled) return;
          setJob(data);
          setLeadId(id);
        } else {
          const data = (await api(sdk, "/api/line/job?section=list")) as { leads: LeadRow[] };
          if (cancelled) return;
          setLeads(data.leads);
        }
        setLiff(sdk);
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : "";
          setError(msg === "not_found" ? "ไม่พบงานนี้" : msg || "เปิดหน้านี้ไม่สำเร็จ");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [liffId, api]);

  useEffect(() => {
    if (!liff || tab !== "web" || report) return;
    let cancelled = false;
    api(liff, `/api/line/job?section=web&period=${period}`)
      .then((data) => {
        if (!cancelled) setReport(data as WebReport);
      })
      .catch(() => {
        if (!cancelled) setError("โหลดสรุปเว็บไม่สำเร็จ");
      });
    return () => {
      cancelled = true;
    };
  }, [liff, tab, period, report, api]);

  function openLead(id: string) {
    if (!liff) return;
    setError("");
    setJob(null);
    setLeadId(id);
    api(liff, `/api/line/job?lead=${id}`)
      .then((data) => setJob(data as JobView))
      .catch((err: Error) => setError(err.message === "not_found" ? "ไม่พบงานนี้" : "เปิดรายละเอียดไม่สำเร็จ"));
  }

  async function closeJob() {
    if (!liff || busy) return;
    setBusy(true);
    setError("");
    try {
      const data = await api(liff, "/api/line/job", {
        method: "POST",
        body: JSON.stringify({ lead: leadId, status: "done" }),
      });
      setJob(data as JobView);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(
        msg === "forbidden"
          ? "เฉพาะคนที่รับงานนี้เท่านั้นที่ปิดงานได้"
          : msg === "closed"
            ? "งานนี้ปิดไปแล้ว"
            : "ปิดงานไม่สำเร็จ ลองใหม่อีกครั้ง",
      );
    } finally {
      setBusy(false);
    }
  }

  const visible = (leads ?? []).filter((row) =>
    filter === "done" ? row.jobStatus === "done" : filter === "open" ? row.jobStatus !== "done" : true,
  );

  return (
    <main className="mx-auto min-h-screen max-w-md bg-slate-100 text-slate-900">
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="grid grid-cols-2">
          {(
            [
              ["jobs", "1. อัปเดตสถานะงาน"],
              ["web", "2. อัปเดตเว็บไซต์"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`min-h-12 text-sm font-semibold ${
                tab === key ? "border-b-2 border-slate-900 text-slate-900" : "text-slate-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {error && (
          <p role="alert" className="mb-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </p>
        )}
        {error && leadId && (
          <button
            type="button"
            onClick={() => {
              setLeadId("");
              setJob(null);
              setError("");
            }}
            className="mb-3 min-h-11 w-full rounded-lg bg-white font-medium shadow-sm"
          >
            กลับรายการ
          </button>
        )}

        {tab === "jobs" && !leadId && (
          <>
            <div className="mb-3 flex gap-2">
              {(
                [
                  ["all", "ทั้งหมด"],
                  ["open", "ยังไม่ปิด"],
                  ["done", "ปิดแล้ว"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={`min-h-9 rounded-full px-3 text-sm ${
                    filter === key ? "bg-slate-900 text-white" : "bg-white text-slate-600"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {leads === null && !error && <p className="text-slate-500">กำลังโหลด…</p>}
            {leads !== null && visible.length === 0 && (
              <p className="rounded-xl bg-white p-4 text-center text-slate-500">ไม่มีรายการ</p>
            )}
            <ul className="space-y-2">
              {visible.map((row) => (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => openLead(row.id)}
                    className="flex min-h-16 w-full items-center gap-3 rounded-xl bg-white p-3 text-left shadow-sm"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold">
                        {row.quoteNo ?? "—"} · {row.productType}
                      </span>
                      <span className="block truncate text-sm text-slate-500">
                        {row.contactName}
                        {row.requestedSize ? ` · ${row.requestedSize}` : ""} · {formatTime(row.createdAt)}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${
                        row.jobStatus === "done"
                          ? "bg-slate-200 text-slate-600"
                          : row.claimedBy
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {row.jobStatus === "done" ? "ปิดแล้ว" : row.claimedBy ? `${row.claimedBy}รับงาน` : "รอรับ"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {tab === "jobs" && leadId && (
          <div className="rounded-2xl bg-white p-5 shadow">
            {!job && !error && <p className="text-slate-500">กำลังโหลด…</p>}
            {job && (
              <>
                <div
                  className={`-mx-5 -mt-5 mb-4 rounded-t-2xl px-5 py-4 text-white ${
                    job.jobStatus === "done"
                      ? "bg-slate-500"
                      : job.claimedBy
                        ? "bg-emerald-600"
                        : "bg-amber-500"
                  }`}
                >
                  <p className="text-lg font-bold">
                    {job.jobStatus === "done"
                      ? `🏁 ${job.claimedBy}ปิดงานแล้ว`
                      : job.claimedBy
                        ? `✅ ${job.claimedBy}รับงานแล้ว`
                        : "⏳ ยังไม่มีคนรับงาน"}
                  </p>
                  <p className="text-sm opacity-90">
                    {job.quoteNo} · {formatTime(job.jobStatus === "done" ? job.jobStatusAt : job.claimedAt)} น.
                  </p>
                </div>

                {job.mine || job.contactName ? (
                  <dl className="space-y-1 text-sm">
                    <Row label="ลูกค้า" value={job.contactName} />
                    <Row label="สินค้า" value={`${job.productType ?? ""} ${job.requestedSize ?? ""}`.trim()} />
                    <Row label="ที่ติดตั้ง" value={job.installAddress} />
                    <Row label="วันติดตั้ง" value={job.callbackDate} />
                    {job.phone && (
                      <a
                        href={`tel:${job.phone.replace(/[^\d+]/g, "")}`}
                        className="mt-3 flex min-h-11 items-center justify-center rounded-lg bg-red-600 font-semibold text-white"
                      >
                        โทร {job.phone}
                      </a>
                    )}
                  </dl>
                ) : (
                  <p className="text-sm text-slate-500">ดูข้อมูลลูกค้าได้เฉพาะผู้รับงาน</p>
                )}

                {job.mine && job.jobStatus !== "done" && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={closeJob}
                    className="mt-4 min-h-12 w-full rounded-lg bg-emerald-600 text-base font-bold text-white disabled:opacity-50"
                  >
                    {busy ? "กำลังบันทึก…" : "🏁 ปิดงาน"}
                  </button>
                )}
                {job.jobStatus === "done" && (
                  <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-center font-semibold text-emerald-800">
                    🎉 งานนี้ปิดเรียบร้อยแล้ว
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setLeadId("");
                    setJob(null);
                    setLeads(null);
                    if (liff) {
                      api(liff, "/api/line/job?section=list")
                        .then((data) => setLeads((data as { leads: LeadRow[] }).leads))
                        .catch(() => setError("โหลดรายการไม่สำเร็จ"));
                    }
                  }}
                  className="mt-3 min-h-11 w-full rounded-lg bg-slate-200 font-medium"
                >
                  กลับรายการ
                </button>
              </>
            )}
          </div>
        )}

        {tab === "web" && (
          <>
            <div className="mb-3 flex gap-2">
              {(
                [
                  ["week", "รายสัปดาห์"],
                  ["month", "รายเดือน"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setPeriod(key);
                    setReport(null);
                  }}
                  className={`min-h-9 rounded-full px-3 text-sm ${
                    period === key ? "bg-slate-900 text-white" : "bg-white text-slate-600"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {!report && !error && <p className="text-slate-500">กำลังโหลด…</p>}
            {report && <WebReportCard report={report} />}
          </>
        )}

        <button
          type="button"
          onClick={() => liff?.closeWindow()}
          className="mt-4 min-h-11 w-full text-sm text-slate-500"
        >
          ปิดหน้านี้
        </button>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value || value === "-") return null;
  return (
    <div>
      <dt className="inline text-slate-500">{label}: </dt>
      <dd className="inline font-semibold">{value}</dd>
    </div>
  );
}

function SectionTitle({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="mb-2 flex items-baseline justify-between">
      <h3 className="text-xs font-bold text-slate-500">{title}</h3>
      <span className="text-[11px] text-slate-400">{hint}</span>
    </div>
  );
}

function Kpi({
  label,
  value,
  unit,
  change,
  from,
  highlight = false,
}: {
  label: string;
  value: string;
  unit: string;
  change: { text: string; tone: Tone };
  from: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl p-3 ${highlight ? "bg-[#0B1F3A] text-white" : "bg-slate-50"}`}>
      <p className={`text-[11px] ${highlight ? "text-slate-300" : "text-slate-500"}`}>{label}</p>
      <p className="mt-1">
        <span className={`text-2xl font-bold ${highlight ? "text-white" : "text-[#0B1F3A]"}`}>{value}</span>
        <span className={`ml-1 text-[11px] ${highlight ? "text-slate-300" : "text-slate-500"}`}>{unit}</span>
      </p>
      <p
        className={`mt-1 text-[11px] font-bold ${
          highlight
            ? change.tone === "up"
              ? "text-emerald-300"
              : change.tone === "down"
                ? "text-red-300"
                : "text-slate-300"
            : TONE_CLASS[change.tone]
        }`}
      >
        {change.text === "—" ? "—" : `${change.text} จาก ${from}`}
      </p>
    </div>
  );
}

function WebReportCard({ report }: { report: WebReport }) {
  const { current, previous, labels } = report;
  const currentRate = leadRate(current);
  const previousRate = leadRate(previous);

  const contacts: [string, number, number][] = [
    ["กด LINE", current.contacts.line, previous.contacts.line],
    ["กดโทร", current.contacts.phone, previous.contacts.phone],
    ["กดขอราคา", current.contacts.quote, previous.contacts.quote],
    ["Facebook", current.contacts.facebook, previous.contacts.facebook],
  ];
  const contactMax = Math.max(...contacts.map(([, value]) => value), 0);

  const hourMax = Math.max(...current.hours, 0);
  const peakHour = current.hours.indexOf(hourMax);
  const pad = (n: number) => String(n).padStart(2, "0");

  const sourceTotal = SOURCE_ROWS.reduce((sum, [, key]) => sum + current.sources[key], 0);
  const sourcesComparable = previous.sourcesTracked > 0;

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow">
      <header className="bg-[#0B1F3A] px-5 py-4 text-white">
        <p className="text-[11px] text-[#F3D2D0]">ช่างตี๋ ผ้าม่าน · changtee-curtain.com</p>
        <h2 className="mt-1 text-lg font-bold">{labels.title}</h2>
        <span className="mt-2 inline-block rounded-full bg-white/10 px-3 py-1 text-xs">{labels.range}</span>
      </header>

      <div className="space-y-5 border-t-2 border-[#C0392B] p-4">
        <section>
          <SectionTitle title="ภาพรวม" hint={labels.versus} />
          <div className="grid grid-cols-2 gap-2">
            <Kpi label="คนเข้าเว็บ" value={fmt(current.visitors)} unit="คน" change={pct(current.visitors, previous.visitors)} from={fmt(previous.visitors)} />
            <Kpi label="ดูหน้าเว็บ" value={fmt(current.pageviews)} unit="ครั้ง" change={pct(current.pageviews, previous.pageviews)} from={fmt(previous.pageviews)} />
            <Kpi label="ขอใบเสนอราคา" value={fmt(current.leads)} unit="ราย" change={diff(current.leads, previous.leads, "ราย")} from={fmt(previous.leads)} />
            <Kpi
              label="อัตราขอราคา"
              value={currentRate.toFixed(2)}
              unit="%"
              change={diff(currentRate, previousRate, "จุด", 2)}
              from={`${previousRate.toFixed(2)}%`}
              highlight
            />
          </div>
        </section>

        <section className="border-t border-slate-200 pt-4">
          <SectionTitle title="ลูกค้ากดติดต่อ" hint="คน · เทียบ" />
          <ul className="space-y-2">
            {contacts.map(([label, value, prev]) => {
              const change = pct(value, prev);
              const width = contactMax > 0 ? Math.max(2, Math.round((value / contactMax) * 100)) : 0;
              return (
                <li key={label} className="grid grid-cols-[5rem_1fr_3rem_3.5rem] items-center gap-2 text-xs">
                  <span>{label}</span>
                  <span className="h-2 rounded bg-slate-100">
                    <span className="block h-2 rounded bg-[#0B1F3A]" style={{ width: `${width}%` }} />
                  </span>
                  <span className="text-right font-bold text-[#0B1F3A]">{fmt(value)}</span>
                  <span className={`text-right text-[11px] font-bold ${TONE_CLASS[change.tone]}`}>{change.text}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="border-t border-slate-200 pt-4">
          <SectionTitle title="ช่วงเวลาที่คนเข้าเยอะ" hint="คนเข้าเว็บ" />
          {hourMax <= 0 ? (
            <p className="text-xs text-slate-500">ยังไม่มีคนเข้าเว็บในช่วงนี้</p>
          ) : (
            <>
              <p className="text-sm font-bold text-[#0B1F3A]">
                คนเข้าเยอะสุด{" "}
                <span className="text-[#C0392B]">
                  {pad(peakHour * 3)}:00 – {pad(peakHour * 3 + 3)}:00 น.
                </span>
              </p>
              <div className="mt-2 flex h-14 items-end gap-1">
                {current.hours.map((value, i) => (
                  <span
                    key={i}
                    className={`flex-1 rounded-sm ${i === peakHour ? "bg-[#C0392B]" : "bg-slate-300"}`}
                    style={{ height: `${Math.max(3, Math.round((value / hourMax) * 56))}px` }}
                  />
                ))}
              </div>
              <div className="mt-1 flex gap-1">
                {current.hours.map((_, i) => (
                  <span key={i} className="flex-1 text-center text-[10px] text-slate-400">
                    {pad(i * 3)}
                  </span>
                ))}
              </div>
              {current.peakDay && (
                <p className="mt-2 text-center text-[11px] text-slate-500">
                  วันที่คนเข้าเยอะสุด: {dayLabel(current.peakDay.day)} ({fmt(current.peakDay.people)} คน)
                </p>
              )}
            </>
          )}
        </section>

        <section className="border-t border-slate-200 pt-4">
          <SectionTitle title="คนมาจากไหน" hint="คน · เทียบ" />
          {current.sourcesTracked === 0 || sourceTotal === 0 ? (
            <p className="text-xs text-slate-500">ยังไม่มีข้อมูลแหล่งที่มาในช่วงนี้ รายงานรอบถัดไปจะเริ่มเห็นตัวเลข</p>
          ) : (
            <>
              <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-100">
                {SOURCE_ROWS.map(([, key, color]) => {
                  const share = Math.round((current.sources[key] / sourceTotal) * 100);
                  return share > 0 ? <span key={key} style={{ width: `${share}%`, backgroundColor: color }} /> : null;
                })}
              </div>
              <ul className="mt-2 space-y-1.5">
                {SOURCE_ROWS.map(([label, key, color]) => {
                  const share = Math.round((current.sources[key] / sourceTotal) * 100);
                  const change = sourcesComparable ? pct(current.sources[key], previous.sources[key]) : { text: "—", tone: "flat" as Tone };
                  return (
                    <li key={key} className="grid grid-cols-[0.5rem_1fr_2.5rem_3rem_3.5rem] items-center gap-2 text-xs">
                      <span className="h-2 w-2 rounded-sm border border-slate-200" style={{ backgroundColor: color }} />
                      <span>{label}</span>
                      <span className="text-right text-[11px] text-slate-500">{share}%</span>
                      <span className="text-right font-bold text-[#0B1F3A]">{fmt(current.sources[key])}</span>
                      <span className={`text-right text-[11px] font-bold ${TONE_CLASS[change.tone]}`}>{change.text}</span>
                    </li>
                  );
                })}
              </ul>
              {current.sourcesTracked < current.sessions * 0.95 && current.sourcesTrackedFrom && (
                <p className="mt-1 text-[11px] text-slate-500">นับเฉพาะตั้งแต่ {dayLabel(current.sourcesTrackedFrom, false)}</p>
              )}
            </>
          )}
          <p className="mt-2 text-center text-[11px] text-slate-500">
            เข้าจากมือถือ {fmt(current.mobileShare)}% · คอมพิวเตอร์/แท็บเล็ต {fmt(Math.max(0, 100 - current.mobileShare))}%
          </p>
        </section>

        <section className="border-t border-slate-200 pt-4">
          <SectionTitle title="สินค้าที่คนดูมาก" hint="ครั้ง" />
          {current.topProducts.length === 0 ? (
            <p className="text-xs text-slate-500">ยังไม่มีคนเปิดหน้าสินค้าในช่วงนี้</p>
          ) : (
            <ol className="space-y-1.5">
              {current.topProducts.map((product, i) => (
                <li key={product.slug} className="flex items-center gap-2 text-xs">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-[#0B1F3A]">
                    {i + 1}
                  </span>
                  <span className="flex-1">{product.name}</span>
                  <span className="text-[11px] text-slate-500">{fmt(product.views)}</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <p className="text-center text-[11px] text-slate-400">
          ตัวเลขนับตามเวลาไทย · ▲▼ เทียบกับ{labels.previousName}
        </p>
      </div>
    </article>
  );
}
