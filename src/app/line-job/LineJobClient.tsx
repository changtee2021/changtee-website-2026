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
  ["เว็บอื่น ๆ", "other", "#D9DDE4"],
] as const;

const DAY_FULL = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
const MONTH_SHORT = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

function dayLabel(day: string, withWeekday = true) {
  const date = new Date(`${day}T00:00:00Z`);
  const base = `${date.getUTCDate()} ${MONTH_SHORT[date.getUTCMonth()]}`;
  return withWeekday ? `${DAY_FULL[date.getUTCDay()]} ${base}` : `${base} ${date.getUTCFullYear() + 543}`;
}

const bangkokDay = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" });
const bangkokClock = new Intl.DateTimeFormat("th-TH", {
  timeZone: "Asia/Bangkok",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function dayKey(iso: string) {
  return bangkokDay.format(new Date(iso));
}

function groupLabel(key: string) {
  const now = Date.now();
  if (key === bangkokDay.format(now)) return "วันนี้";
  if (key === bangkokDay.format(now - 86_400_000)) return "เมื่อวาน";
  return dayLabel(key);
}

function clock(iso: string) {
  return bangkokClock.format(new Date(iso));
}

function stamp(iso: string | null) {
  if (!iso) return "";
  const key = dayKey(iso);
  return `${groupLabel(key)} ${clock(iso)} น.`;
}

function fmt(value: number) {
  return Math.round(value).toLocaleString("th-TH");
}

type Tone = "up" | "down" | "flat";
type Change = { text: string; tone: Tone };

function pct(current: number, previous: number): Change {
  if (previous <= 0) return current > 0 ? { text: "ใหม่", tone: "up" } : { text: "—", tone: "flat" };
  const p = Math.round(((current - previous) / previous) * 100);
  if (p === 0) return { text: "เท่าเดิม", tone: "flat" };
  return p > 0 ? { text: `▲ ${p}%`, tone: "up" } : { text: `▼ ${Math.abs(p)}%`, tone: "down" };
}

function diff(current: number, previous: number, unit: string, digits = 0): Change {
  const d = Number((current - previous).toFixed(digits));
  if (d === 0) return { text: "เท่าเดิม", tone: "flat" };
  const amount = Math.abs(d).toFixed(digits);
  return d > 0 ? { text: `▲ ${amount} ${unit}`, tone: "up" } : { text: `▼ ${amount} ${unit}`, tone: "down" };
}

const TONE_CLASS: Record<Tone, string> = {
  up: "text-[#1E8E5A]",
  down: "text-[#C0392B]",
  flat: "text-[#8A909C]",
};

function leadRate(stats: ReportStats) {
  return stats.visitors > 0 ? (stats.leads / stats.visitors) * 100 : 0;
}

function rowStatus(row: { jobStatus: "done" | null; claimedBy: string | null }) {
  if (row.jobStatus === "done") return { label: "ปิดแล้ว", dot: "bg-[#A3A9B3]", text: "text-[#8A909C]" };
  if (row.claimedBy) return { label: `${row.claimedBy} รับแล้ว`, dot: "bg-[#1E8E5A]", text: "text-[#0B1F3A]" };
  return { label: "รอรับ", dot: "bg-[#C0392B]", text: "text-[#C0392B]" };
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
  const [confirming, setConfirming] = useState(false);

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
    setConfirming(false);
    setLeadId(id);
    window.scrollTo(0, 0);
    api(liff, `/api/line/job?lead=${id}`)
      .then((data) => setJob(data as JobView))
      .catch((err: Error) => setError(err.message === "not_found" ? "ไม่พบงานนี้" : "เปิดรายละเอียดไม่สำเร็จ"));
  }

  function backToList() {
    setLeadId("");
    setJob(null);
    setError("");
    setConfirming(false);
    setTab("jobs");
    setLeads(null);
    window.scrollTo(0, 0);
    if (liff) {
      api(liff, "/api/line/job?section=list")
        .then((data) => setLeads((data as { leads: LeadRow[] }).leads))
        .catch(() => setError("โหลดรายการไม่สำเร็จ"));
    }
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
      setConfirming(false);
    }
  }

  const all = leads ?? [];
  const counts = {
    all: all.length,
    open: all.filter((row) => row.jobStatus !== "done").length,
    done: all.filter((row) => row.jobStatus === "done").length,
  };
  const waiting = all.filter((row) => !row.claimedBy && row.jobStatus !== "done").length;
  const visible = all.filter((row) =>
    filter === "done" ? row.jobStatus === "done" : filter === "open" ? row.jobStatus !== "done" : true,
  );
  const groups: { key: string; rows: LeadRow[] }[] = [];
  for (const row of visible) {
    const key = dayKey(row.createdAt);
    const last = groups[groups.length - 1];
    if (last?.key === key) last.rows.push(row);
    else groups.push({ key, rows: [row] });
  }

  const inDetail = tab === "jobs" && Boolean(leadId);
  const canClose = Boolean(job?.mine && job.jobStatus !== "done");
  const hasActionBar = inDetail && Boolean(job && (job.phone || canClose));

  return (
    <main
      className="mx-auto min-h-screen max-w-md bg-[#F7F6F2] font-sans text-[#0B1F3A]"
      style={{ colorScheme: "light" }}
    >
      <header className="sticky top-0 z-20 border-b border-[#E6E3DC] bg-[#F7F6F2]/95 backdrop-blur">
        <div className="flex h-12 items-center justify-between px-5">
          {inDetail ? (
            <button
              type="button"
              onClick={backToList}
              className="-ml-2 flex min-h-11 items-center gap-1 px-2 text-sm font-semibold"
            >
              <span aria-hidden className="text-lg leading-none">‹</span> รายการทั้งหมด
            </button>
          ) : (
            <p className="text-sm font-semibold tracking-wide">
              ช่างตี๋ <span className="font-normal text-[#8A909C]">/ ทีมต้อนรับ</span>
            </p>
          )}
          <button
            type="button"
            onClick={() => liff?.closeWindow()}
            className="-mr-2 min-h-11 px-2 text-sm text-[#687082]"
          >
            ปิด
          </button>
        </div>

        {!inDetail && (
          <nav className="grid grid-cols-2 px-5" aria-label="หมวด">
            {(
              [
                ["jobs", "อัปเดตสถานะงาน"],
                ["web", "อัปเดตเว็บไซต์"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setTab(key);
                  setError("");
                }}
                aria-current={tab === key ? "page" : undefined}
                className={`relative flex min-h-11 items-center gap-2 text-sm ${
                  tab === key ? "font-semibold text-[#0B1F3A]" : "text-[#8A909C]"
                }`}
              >
                {label}
                {key === "jobs" && waiting > 0 && (
                  <span className="font-modern rounded-sm bg-[#C0392B] px-1.5 text-[11px] font-semibold leading-5 text-white">
                    {waiting}
                  </span>
                )}
                {tab === key && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-[#0B1F3A]" />}
              </button>
            ))}
          </nav>
        )}
      </header>

      <div className={`px-5 pt-5 ${hasActionBar ? "pb-32" : "pb-10"}`}>
        {error && (
          <div role="alert" className="mb-5 border-l-2 border-[#C0392B] bg-white py-3 pl-4 pr-3 text-sm">
            <p className="font-semibold">{error}</p>
            {leadId && (
              <button type="button" onClick={backToList} className="mt-1 min-h-9 text-sm text-[#687082] underline">
                กลับไปรายการทั้งหมด
              </button>
            )}
          </div>
        )}

        {tab === "jobs" && !leadId && (
          <>
            <div className="grid grid-cols-3 border border-[#E6E3DC] bg-white">
              {(
                [
                  ["all", "ทั้งหมด"],
                  ["open", "ยังไม่ปิด"],
                  ["done", "ปิดแล้ว"],
                ] as const
              ).map(([key, label], i) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  aria-pressed={filter === key}
                  className={`flex min-h-14 flex-col items-start justify-center px-3 text-left ${
                    i > 0 ? "border-l border-[#E6E3DC]" : ""
                  } ${filter === key ? "bg-[#0B1F3A] text-white" : "text-[#0B1F3A]"}`}
                >
                  <span className={`text-[11px] ${filter === key ? "text-white/70" : "text-[#8A909C]"}`}>
                    {label}
                  </span>
                  <span className="font-modern text-lg font-semibold leading-6 tabular-nums">
                    {leads ? counts[key] : "–"}
                  </span>
                </button>
              ))}
            </div>

            {leads === null && !error && <ListSkeleton />}
            {leads !== null && visible.length === 0 && (
              <p className="mt-10 text-center text-sm text-[#8A909C]">ไม่มีรายการในหมวดนี้</p>
            )}

            {groups.map((group) => (
              <section key={group.key} className="mt-6">
                <h2 className="flex items-baseline justify-between border-b border-[#0B1F3A] pb-1.5 text-xs font-semibold">
                  {groupLabel(group.key)}
                  <span className="font-modern font-normal text-[#8A909C] tabular-nums">{group.rows.length}</span>
                </h2>
                <ul>
                  {group.rows.map((row) => {
                    const status = rowStatus(row);
                    return (
                      <li key={row.id} className="border-b border-[#E6E3DC]">
                        <button
                          type="button"
                          onClick={() => openLead(row.id)}
                          className="grid min-h-[72px] w-full grid-cols-[3.25rem_1fr_auto] items-center gap-x-3 py-3 text-left active:bg-black/[0.03]"
                        >
                          <span className="font-modern self-start pt-0.5 text-sm tabular-nums text-[#687082]">
                            {clock(row.createdAt)}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-semibold">{row.contactName}</span>
                            <span className="block truncate text-[13px] text-[#687082]">
                              {row.productType}
                              {row.requestedSize ? ` · ${row.requestedSize}` : ""}
                            </span>
                            <span className="font-modern block text-[11px] tracking-wide text-[#A3A9B3]">
                              {row.quoteNo ?? "—"}
                            </span>
                          </span>
                          <span className={`flex items-center gap-1.5 self-start pt-1 text-xs font-semibold ${status.text}`}>
                            <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </>
        )}

        {inDetail && !job && !error && <DetailSkeleton />}

        {inDetail && job && (
          <JobDetail job={job} />
        )}

        {tab === "web" && (
          <>
            <div className="grid grid-cols-2 border border-[#E6E3DC] bg-white">
              {(
                [
                  ["week", "รายสัปดาห์"],
                  ["month", "รายเดือน"],
                ] as const
              ).map(([key, label], i) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    if (period === key) return;
                    setPeriod(key);
                    setReport(null);
                    setError("");
                  }}
                  aria-pressed={period === key}
                  className={`min-h-11 text-sm ${i > 0 ? "border-l border-[#E6E3DC]" : ""} ${
                    period === key ? "bg-[#0B1F3A] font-semibold text-white" : "text-[#687082]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {!report && !error && <ReportSkeleton />}
            {report && <WebReportView report={report} />}
          </>
        )}
      </div>

      {hasActionBar && job && (
        <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-[#E6E3DC] bg-[#F7F6F2] px-5 pb-[max(env(safe-area-inset-bottom),12px)] pt-3">
          <div className={`grid gap-2 ${job.phone && canClose ? "grid-cols-2" : "grid-cols-1"}`}>
            {job.phone && (
              <a
                href={`tel:${job.phone.replace(/[^\d+]/g, "")}`}
                className="flex min-h-12 items-center justify-center border border-[#0B1F3A] bg-white text-sm font-semibold"
              >
                โทรหาลูกค้า
              </a>
            )}
            {canClose &&
              (confirming ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={closeJob}
                  className="min-h-12 bg-[#C0392B] text-sm font-semibold text-white disabled:opacity-60"
                >
                  {busy ? "กำลังบันทึก…" : "ยืนยันปิดงาน"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="min-h-12 bg-[#0B1F3A] text-sm font-semibold text-white"
                >
                  ปิดงาน
                </button>
              ))}
          </div>
          {confirming && !busy && (
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="mt-1 min-h-9 w-full text-xs text-[#687082]"
            >
              ยกเลิก — ยังไม่ปิดงาน
            </button>
          )}
        </div>
      )}
    </main>
  );
}

function JobDetail({ job }: { job: JobView }) {
  const status = rowStatus(job);
  const steps = [
    { label: "รับงาน", done: Boolean(job.claimedBy), detail: job.claimedBy ? `${job.claimedBy} · ${stamp(job.claimedAt)}` : "ยังไม่มีคนรับ" },
    { label: "ปิดงาน", done: job.jobStatus === "done", detail: job.jobStatus === "done" ? stamp(job.jobStatusAt) : "ยังไม่ปิด" },
  ];
  const fields: [string, string | null | undefined][] = [
    ["ลูกค้า", job.contactName],
    ["โทร", job.phone],
    ["สินค้า", job.productType],
    ["ขนาด", job.requestedSize],
    ["ที่ติดตั้ง", job.installAddress],
    ["วันติดตั้ง", job.callbackDate],
  ];
  const shownFields = fields.filter(([, value]) => value && value !== "-");

  return (
    <article>
      <p className="font-modern text-xs tracking-widest text-[#8A909C]">{job.quoteNo ?? "ไม่มีเลขใบเสนอราคา"}</p>
      <h1 className="mt-1 flex items-center gap-2 font-display text-2xl font-semibold">
        <span aria-hidden className={`h-2.5 w-2.5 rounded-full ${status.dot}`} />
        {job.jobStatus === "done" ? "ปิดงานแล้ว" : job.claimedBy ? `${job.claimedBy} กำลังดูแล` : "รอคนรับงาน"}
      </h1>

      <ol className="mt-5 grid grid-cols-2 border-y border-[#E6E3DC]">
        {steps.map((step, i) => (
          <li key={step.label} className={`py-3 ${i > 0 ? "border-l border-[#E6E3DC] pl-4" : "pr-4"}`}>
            <div className="flex items-center gap-2">
              <span
                className={`font-modern flex h-5 w-5 items-center justify-center text-[11px] font-semibold ${
                  step.done ? "bg-[#0B1F3A] text-white" : "border border-[#C9CDD4] text-[#A3A9B3]"
                }`}
              >
                {i + 1}
              </span>
              <span className={`text-sm font-semibold ${step.done ? "" : "text-[#A3A9B3]"}`}>{step.label}</span>
            </div>
            <p className="mt-1 text-xs text-[#687082]">{step.detail}</p>
          </li>
        ))}
      </ol>

      {shownFields.length > 0 && (
        <dl className="mt-6">
          {shownFields.map(([label, value]) => (
            <div key={label} className="grid grid-cols-4 gap-3 border-b border-[#E6E3DC] py-3 text-sm">
              <dt className="text-[#8A909C]">{label}</dt>
              <dd className="col-span-3 font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      )}
      {!job.mine && (
        <p className="mt-6 border-l-2 border-[#E6E3DC] pl-4 text-sm text-[#687082]">
          {job.claimedBy
            ? `ข้อมูลลูกค้าเห็นได้เฉพาะ ${job.claimedBy} ที่รับงานนี้`
            : "ยังไม่มีคนรับงาน กดรับได้จากการ์ดในกลุ่ม LINE"}
        </p>
      )}

      {job.jobStatus === "done" && (
        <p className="mt-6 text-center text-sm text-[#687082]">งานนี้ปิดเรียบร้อยแล้ว</p>
      )}
    </article>
  );
}

function Pulse({ className }: { className: string }) {
  return <span className={`block animate-pulse bg-[#E6E3DC] ${className}`} />;
}

function ListSkeleton() {
  return (
    <div className="mt-6" aria-label="กำลังโหลด">
      <Pulse className="h-3 w-16" />
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="grid grid-cols-[3.25rem_1fr] gap-3 border-b border-[#E6E3DC] py-4">
          <Pulse className="h-3 w-10" />
          <div className="space-y-2">
            <Pulse className="h-3.5 w-2/3" />
            <Pulse className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-3" aria-label="กำลังโหลด">
      <Pulse className="h-3 w-24" />
      <Pulse className="h-7 w-3/4" />
      <Pulse className="mt-6 h-16 w-full" />
      <Pulse className="h-4 w-full" />
      <Pulse className="h-4 w-5/6" />
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="mt-6 space-y-3" aria-label="กำลังโหลด">
      <Pulse className="h-6 w-2/3" />
      <Pulse className="h-3 w-1/3" />
      <div className="grid grid-cols-2 gap-px pt-3">
        {[0, 1, 2, 3].map((i) => (
          <Pulse key={i} className="h-24" />
        ))}
      </div>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h3 className="flex items-baseline justify-between border-b border-[#0B1F3A] pb-1.5 text-xs font-semibold">
        {title}
        {hint && <span className="font-normal text-[#8A909C]">{hint}</span>}
      </h3>
      <div className="pt-3">{children}</div>
    </section>
  );
}

function Kpi({
  label,
  value,
  unit,
  change,
  from,
  inverted = false,
}: {
  label: string;
  value: string;
  unit: string;
  change: Change;
  from: string;
  inverted?: boolean;
}) {
  const changeClass = inverted
    ? change.tone === "up"
      ? "text-[#7FD3A8]"
      : change.tone === "down"
        ? "text-[#F2A59C]"
        : "text-white/60"
    : TONE_CLASS[change.tone];
  return (
    <div className={`flex min-h-[112px] flex-col p-4 ${inverted ? "bg-[#0B1F3A] text-white" : "bg-white"}`}>
      <p className={`text-xs ${inverted ? "text-white/70" : "text-[#687082]"}`}>{label}</p>
      <p className="mt-auto flex items-baseline gap-1">
        <span className="font-modern text-[32px] font-semibold leading-none tabular-nums">{value}</span>
        <span className={`text-xs ${inverted ? "text-white/70" : "text-[#8A909C]"}`}>{unit}</span>
      </p>
      <p className={`font-modern mt-2 text-[11px] font-semibold ${changeClass}`}>
        {change.text}
        {change.text !== "—" && <span className="font-sans font-normal opacity-80"> จาก {from}</span>}
      </p>
    </div>
  );
}

function MeterRow({ label, value, max, change }: { label: string; value: number; max: number; change: Change }) {
  const width = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0;
  return (
    <li className="grid grid-cols-4 items-center gap-3 py-2 text-sm">
      <span className="text-[#3D4656]">{label}</span>
      <span className="col-span-2 flex items-center gap-2">
        <span className="h-1.5 flex-1 bg-[#ECEAE4]">
          <span className="block h-1.5 bg-[#0B1F3A]" style={{ width: `${width}%` }} />
        </span>
        <span className="font-modern w-8 text-right font-semibold tabular-nums">{fmt(value)}</span>
      </span>
      <span className={`font-modern text-right text-xs font-semibold ${TONE_CLASS[change.tone]}`}>{change.text}</span>
    </li>
  );
}

function WebReportView({ report }: { report: WebReport }) {
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
  const mobile = Math.min(100, Math.max(0, Math.round(current.mobileShare)));
  const productMax = Math.max(...current.topProducts.map((product) => product.views), 0);

  return (
    <article className="mt-6">
      <p className="text-xs text-[#8A909C]">changtee-curtain.com</p>
      <h2 className="mt-1 font-display text-2xl font-semibold leading-tight">{labels.title}</h2>
      <p className="mt-1 text-sm text-[#687082]">
        {labels.range} <span className="text-[#A3A9B3]">· {labels.versus}</span>
      </p>

      <Section title="ภาพรวม">
        <div className="grid grid-cols-2 gap-px border border-[#E6E3DC] bg-[#E6E3DC]">
          <Kpi label="คนเข้าเว็บ" value={fmt(current.visitors)} unit="คน" change={pct(current.visitors, previous.visitors)} from={fmt(previous.visitors)} />
          <Kpi label="ดูหน้าเว็บ" value={fmt(current.pageviews)} unit="ครั้ง" change={pct(current.pageviews, previous.pageviews)} from={fmt(previous.pageviews)} />
          <Kpi label="ขอใบเสนอราคา" value={fmt(current.leads)} unit="ราย" change={diff(current.leads, previous.leads, "ราย")} from={fmt(previous.leads)} />
          <Kpi
            label="อัตราขอราคา"
            value={currentRate.toFixed(2)}
            unit="%"
            change={diff(currentRate, previousRate, "จุด", 2)}
            from={`${previousRate.toFixed(2)}%`}
            inverted
          />
        </div>
      </Section>

      <Section title="ลูกค้ากดติดต่อ" hint="คน">
        <ul className="divide-y divide-[#ECEAE4]">
          {contacts.map(([label, value, prev]) => (
            <MeterRow key={label} label={label} value={value} max={contactMax} change={pct(value, prev)} />
          ))}
        </ul>
      </Section>

      <Section title="ช่วงเวลาที่คนเข้าเยอะ" hint="คนเข้าเว็บ">
        {hourMax <= 0 ? (
          <p className="text-sm text-[#8A909C]">ยังไม่มีคนเข้าเว็บในช่วงนี้</p>
        ) : (
          <>
            <p className="text-sm">
              เยอะสุด{" "}
              <span className="font-modern font-semibold text-[#C0392B] tabular-nums">
                {pad(peakHour * 3)}:00–{pad(peakHour * 3 + 3)}:00
              </span>{" "}
              น.
            </p>
            <div className="mt-3 grid h-24 grid-cols-8 items-end gap-1.5 border-b border-[#0B1F3A]">
              {current.hours.map((value, i) => (
                <span
                  key={i}
                  title={`${fmt(value)} คน`}
                  className={i === peakHour ? "bg-[#C0392B]" : "bg-[#C9CFD9]"}
                  style={{ height: `${Math.max(3, Math.round((value / hourMax) * 100))}%` }}
                />
              ))}
            </div>
            <div className="mt-1.5 grid grid-cols-8 gap-1.5">
              {current.hours.map((_, i) => (
                <span
                  key={i}
                  className={`font-modern text-[10px] tabular-nums ${i === peakHour ? "font-semibold text-[#C0392B]" : "text-[#A3A9B3]"}`}
                >
                  {pad(i * 3)}
                </span>
              ))}
            </div>
            {current.peakDay && (
              <p className="mt-3 text-xs text-[#687082]">
                วันที่คนเข้าเยอะสุด{" "}
                <span className="font-semibold text-[#0B1F3A]">{dayLabel(current.peakDay.day)}</span>{" "}
                <span className="font-modern tabular-nums">({fmt(current.peakDay.people)} คน)</span>
              </p>
            )}
          </>
        )}
      </Section>

      <Section title="คนมาจากไหน" hint="คน">
        {current.sourcesTracked === 0 || sourceTotal === 0 ? (
          <p className="text-sm text-[#8A909C]">ยังไม่มีข้อมูลแหล่งที่มาในช่วงนี้ รายงานรอบถัดไปจะเริ่มเห็นตัวเลข</p>
        ) : (
          <>
            <div className="flex h-2 overflow-hidden bg-[#ECEAE4]">
              {SOURCE_ROWS.map(([, key, color]) => {
                const share = (current.sources[key] / sourceTotal) * 100;
                return share > 0 ? <span key={key} style={{ width: `${share}%`, backgroundColor: color }} /> : null;
              })}
            </div>
            <ul className="mt-2 divide-y divide-[#ECEAE4]">
              {SOURCE_ROWS.map(([label, key, color]) => {
                const share = Math.round((current.sources[key] / sourceTotal) * 100);
                const change: Change = sourcesComparable
                  ? pct(current.sources[key], previous.sources[key])
                  : { text: "—", tone: "flat" };
                return (
                  <li key={key} className="grid grid-cols-4 items-center gap-3 py-2 text-sm">
                    <span className="col-span-2 flex items-center gap-2 text-[#3D4656]">
                      <span aria-hidden className="h-2.5 w-2.5 shrink-0" style={{ backgroundColor: color }} />
                      {label}
                    </span>
                    <span className="font-modern flex items-baseline justify-end gap-2 tabular-nums">
                      <span className="text-xs text-[#A3A9B3]">{share}%</span>
                      <span className="font-semibold">{fmt(current.sources[key])}</span>
                    </span>
                    <span className={`font-modern text-right text-xs font-semibold ${TONE_CLASS[change.tone]}`}>
                      {change.text}
                    </span>
                  </li>
                );
              })}
            </ul>
            {current.sourcesTracked < current.sessions * 0.95 && current.sourcesTrackedFrom && (
              <p className="mt-2 text-xs text-[#8A909C]">นับเฉพาะตั้งแต่ {dayLabel(current.sourcesTrackedFrom, false)}</p>
            )}
          </>
        )}

        <div className="mt-5">
          <div className="flex justify-between text-xs text-[#687082]">
            <span>
              มือถือ <span className="font-modern font-semibold text-[#0B1F3A] tabular-nums">{mobile}%</span>
            </span>
            <span>
              คอมพิวเตอร์ / แท็บเล็ต{" "}
              <span className="font-modern font-semibold text-[#0B1F3A] tabular-nums">{100 - mobile}%</span>
            </span>
          </div>
          <div className="mt-1.5 flex h-1.5 bg-[#C9CFD9]">
            <span className="block bg-[#0B1F3A]" style={{ width: `${mobile}%` }} />
          </div>
        </div>
      </Section>

      <Section title="สินค้าที่คนดูมาก" hint="ครั้ง">
        {current.topProducts.length === 0 ? (
          <p className="text-sm text-[#8A909C]">ยังไม่มีคนเปิดหน้าสินค้าในช่วงนี้</p>
        ) : (
          <ol className="divide-y divide-[#ECEAE4]">
            {current.topProducts.map((product, i) => (
              <li key={product.slug} className="grid grid-cols-[1.75rem_1fr_auto] items-center gap-x-3 py-2.5">
                <span className="font-modern text-sm font-semibold tabular-nums text-[#A3A9B3]">{pad(i + 1)}</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm">{product.name}</span>
                  <span className="mt-1 block h-1 bg-[#ECEAE4]">
                    <span
                      className="block h-1 bg-[#5B7DB1]"
                      style={{ width: `${productMax > 0 ? Math.round((product.views / productMax) * 100) : 0}%` }}
                    />
                  </span>
                </span>
                <span className="font-modern text-sm font-semibold tabular-nums">{fmt(product.views)}</span>
              </li>
            ))}
          </ol>
        )}
      </Section>

      <p className="mt-10 border-t border-[#E6E3DC] pt-3 text-xs text-[#A3A9B3]">
        ตัวเลขนับตามเวลาไทย · ▲▼ เทียบกับ{labels.previousName}
      </p>
    </article>
  );
}
