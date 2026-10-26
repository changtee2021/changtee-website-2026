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

type WebReport = {
  current: {
    title: string;
    range: string;
    versus: string;
    visitors: number;
    pageviews: number;
    sessions: number;
    leads: number;
    contacts: { line: number; phone: number; quote: number; facebook: number };
    mobileShare: number;
    topProducts: { slug: string; views: number }[];
  };
  previous: { visitors: number; pageviews: number; leads: number };
};

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

function changeText(current: number, previous: number) {
  if (previous <= 0) return current > 0 ? "ใหม่" : "—";
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return "เท่าเดิม";
  return pct > 0 ? `▲ ${pct}%` : `▼ ${Math.abs(pct)}%`;
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
        const id = new URLSearchParams(window.location.search).get("lead") ?? "";
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
            {report && (
              <div className="rounded-2xl bg-white p-5 shadow">
                <h2 className="text-lg font-bold">{report.current.title}</h2>
                <p className="text-sm text-slate-500">
                  {report.current.range} · {report.current.versus}
                </p>
                <dl className="mt-4 grid grid-cols-2 gap-3">
                  <Stat label="ผู้เข้าชม" value={report.current.visitors} change={changeText(report.current.visitors, report.previous.visitors)} />
                  <Stat label="การเปิดหน้า" value={report.current.pageviews} change={changeText(report.current.pageviews, report.previous.pageviews)} />
                  <Stat label="เซสชัน" value={report.current.sessions} />
                  <Stat label="ใบเสนอราคา" value={report.current.leads} change={changeText(report.current.leads, report.previous.leads)} />
                </dl>
                <p className="mt-4 text-sm text-slate-600">
                  ติดต่อ: LINE {report.current.contacts.line} · โทร {report.current.contacts.phone} · ฟอร์ม{" "}
                  {report.current.contacts.quote} · ดูจากมือถือ {report.current.mobileShare}%
                </p>
                {report.current.topProducts.length > 0 && (
                  <ol className="mt-3 space-y-1 text-sm">
                    {report.current.topProducts.map((product, i) => (
                      <li key={product.slug} className="flex justify-between">
                        <span>
                          {i + 1}. {product.slug}
                        </span>
                        <span className="text-slate-500">{product.views}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )}
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

function Stat({ label, value, change }: { label: string; value: number; change?: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-xl font-bold">{value.toLocaleString("th-TH")}</dd>
      {change && <p className="text-xs text-slate-500">{change}</p>}
    </div>
  );
}
