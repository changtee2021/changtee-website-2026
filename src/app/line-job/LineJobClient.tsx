"use client";

import { useCallback, useEffect, useState } from "react";

type Liff = {
  init(config: { liffId: string }): Promise<void>;
  isLoggedIn(): boolean;
  login(): void;
  getIDToken(): string | null;
  closeWindow(): void;
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

const SDK_URL = "https://static.line-scdn.net/liff/edge/2/sdk.js";

const STEPS = [
  { key: "claimed", label: "รับงานแล้ว" },
  { key: "done", label: "ปิดงาน" },
] as const;

const NEXT_ACTION = {
  claimed: { status: "done", label: "🏁 ปิดงาน" },
} as const;

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
  const [leadId, setLeadId] = useState("");
  const [job, setJob] = useState<JobView | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const call = useCallback(
    async (sdk: Liff, id: string, init?: RequestInit) => {
      const token = sdk.getIDToken();
      const res = await fetch(`/api/line/job${init?.method === "POST" ? "" : `?lead=${id}`}`, {
        ...init,
        headers: {
          ...(init?.body ? { "Content-Type": "application/json" } : {}),
          Authorization: `Bearer ${token ?? ""}`,
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(String(data.error ?? res.status));
      return data as JobView;
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!liffId) throw new Error("ยังไม่ได้ตั้งค่า LIFF ID");
        const id = new URLSearchParams(window.location.search).get("lead") ?? "";
        if (!id) throw new Error("ไม่พบรหัสงาน");
        const sdk = await loadSdk();
        await sdk.init({ liffId });
        if (!sdk.isLoggedIn()) {
          sdk.login();
          return;
        }
        const data = await call(sdk, id);
        if (cancelled) return;
        setLiff(sdk);
        setLeadId(id);
        setJob(data);
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : "";
          setError(msg === "not_found" ? "ไม่พบงานนี้ หรือยังไม่มีคนรับงาน" : msg || "เปิดหน้านี้ไม่สำเร็จ");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [liffId, call]);

  async function advance(status: string) {
    if (!liff || busy) return;
    setBusy(true);
    setError("");
    try {
      const data = await call(liff, leadId, {
        method: "POST",
        body: JSON.stringify({ lead: leadId, status }),
      });
      setJob(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(
        msg === "forbidden"
          ? "เฉพาะคนที่รับงานนี้เท่านั้นที่อัปเดตได้"
          : msg === "closed"
            ? "งานนี้ปิดไปแล้ว"
            : "อัปเดตไม่สำเร็จ ลองใหม่อีกครั้ง",
      );
    } finally {
      setBusy(false);
    }
  }

  const current = job ? (job.jobStatus ?? "claimed") : "claimed";
  const currentIndex = STEPS.findIndex((s) => s.key === current);
  const action = job?.mine && current !== "done" ? NEXT_ACTION[current as keyof typeof NEXT_ACTION] : null;

  return (
    <main className="mx-auto min-h-screen max-w-md bg-slate-100 p-4 text-slate-900">
      <div className="rounded-2xl bg-white p-5 shadow">
        <h1 className="text-lg font-bold">
          อัปเดตสถานะงาน {job?.quoteNo ? `· ${job.quoteNo}` : ""}
        </h1>

        {!job && !error && <p className="mt-4 text-slate-500">กำลังโหลด…</p>}
        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-rose-700">
            {error}
          </p>
        )}

        {job && (
          <>
            <p className="mt-2 text-sm text-slate-600">
              ผู้รับงาน: <strong>{job.claimedBy}</strong> · {formatTime(job.claimedAt)} น.
            </p>

            <ol className="mt-4 space-y-2">
              {STEPS.map((step, i) => (
                <li
                  key={step.key}
                  className={`flex min-h-11 items-center gap-3 rounded-lg px-3 ${
                    i <= currentIndex ? "bg-emerald-50 text-emerald-800" : "bg-slate-50 text-slate-400"
                  }`}
                >
                  <span aria-hidden>{i <= currentIndex ? "✅" : "⚪"}</span>
                  <span className="font-medium">{step.label}</span>
                  {i === currentIndex && job.jobStatusAt && (
                    <span className="ml-auto text-xs">{formatTime(job.jobStatusAt)} น.</span>
                  )}
                </li>
              ))}
            </ol>

            {job.mine ? (
              <dl className="mt-4 space-y-1 text-sm">
                <div><dt className="inline text-slate-500">ลูกค้า: </dt><dd className="inline font-semibold">{job.contactName}</dd></div>
                <div><dt className="inline text-slate-500">สินค้า: </dt><dd className="inline font-semibold">{job.productType} {job.requestedSize}</dd></div>
                <div><dt className="inline text-slate-500">ที่ติดตั้ง: </dt><dd className="inline font-semibold">{job.installAddress}</dd></div>
                {job.callbackDate && (
                  <div><dt className="inline text-slate-500">วันติดตั้ง: </dt><dd className="inline font-semibold">{job.callbackDate}</dd></div>
                )}
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
              <p className="mt-4 text-sm text-slate-500">
                งานนี้ {job.claimedBy} รับไปแล้ว ดูข้อมูลลูกค้าและอัปเดตได้เฉพาะผู้รับงาน
              </p>
            )}

            {action && (
              <button
                type="button"
                disabled={busy}
                onClick={() => advance(action.status)}
                className="mt-4 min-h-12 w-full rounded-lg bg-emerald-600 text-base font-bold text-white disabled:opacity-50"
              >
                {busy ? "กำลังบันทึก…" : action.label}
              </button>
            )}

            {current === "done" && (
              <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-center font-semibold text-emerald-800">
                🎉 งานนี้ปิดเรียบร้อยแล้ว
              </p>
            )}

            <button
              type="button"
              onClick={() => liff?.closeWindow()}
              className="mt-3 min-h-11 w-full rounded-lg bg-slate-200 font-medium"
            >
              กลับไปที่แชท
            </button>
          </>
        )}
      </div>
    </main>
  );
}
