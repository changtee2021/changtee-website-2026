"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Mail, RefreshCw, Search } from "lucide-react";
import type { MarketingSubscriber } from "@/lib/marketing/types";

const SOURCE_LABEL: Record<string, string> = {
  quote: "ขอใบเสนอราคา",
  contact: "ติดต่อเรา",
  fab: "ปุ่มลอย",
  visit: "นัดโรงงาน",
  presentation: "นัดนำเสนอ",
};

function formatWhen(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function SubscribersBoard() {
  const [rows, setRows] = useState<MarketingSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"subscribed" | "unsubscribed" | "all">(
    "subscribed",
  );
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/subscribers");
      const json = (await res.json()) as {
        subscribers?: MarketingSubscriber[];
        error?: string;
      };
      if (!res.ok) throw new Error(json.error || "โหลดไม่สำเร็จ");
      setRows(json.subscribers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "โหลดไม่สำเร็จ");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const id = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (status !== "all" && row.status !== status) return false;
      if (!q) return true;
      return (
        row.email.toLowerCase().includes(q) ||
        (row.fullName || "").toLowerCase().includes(q)
      );
    });
  }, [rows, search, status]);

  const subscribedCount = rows.filter((row) => row.status === "subscribed").length;

  function exportCsv() {
    const live = filtered.filter((row) => row.status === "subscribed");
    const header = "email,name,source,consented_at";
    const body = live
      .map((row) =>
        [
          row.email,
          row.fullName || "",
          SOURCE_LABEL[row.source] || row.source,
          row.consentedAt || row.createdAt,
        ]
          .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([`${header}\n${body}\n`], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `changtee-marketing-emails-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function unsubscribe(id: string) {
    if (!window.confirm("ถอนอีเมลนี้ออกจากรายชื่อข่าวสาร?")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/subscribers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "unsubscribed" }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "ถอนไม่สำเร็จ");
      setRows((prev) =>
        prev.map((row) =>
          row.id === id
            ? {
                ...row,
                status: "unsubscribed",
                unsubscribedAt: new Date().toISOString(),
              }
            : row,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "ถอนไม่สำเร็จ");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-navy">
            เมลลูกค้า (ข่าวสาร)
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted">
            รายชื่อคนที่ติ๊กยอมรับรับข่าวสารแยกจากคำขอใบเสนอราคา ส่งโปรโมชันได้เฉพาะแถวสถานะ
            “รับข่าวสาร” — อย่ายิงจาก Gmail ของร้าน
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-line bg-white px-3 text-sm font-medium text-navy hover:bg-paper"
          >
            <RefreshCw className="size-4" />
            รีเฟรช
          </button>
          <button
            type="button"
            onClick={exportCsv}
            disabled={filtered.every((row) => row.status !== "subscribed")}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-md bg-navy px-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            <Download className="size-4" />
            ส่งออก CSV
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-white px-4 py-3">
          <p className="text-xs text-muted">รับข่าวสารอยู่</p>
          <p className="mt-1 font-display text-2xl font-semibold text-navy">
            {subscribedCount}
          </p>
        </div>
        <div className="rounded-xl border border-line bg-white px-4 py-3">
          <p className="text-xs text-muted">ถอนแล้ว</p>
          <p className="mt-1 font-display text-2xl font-semibold text-navy">
            {rows.length - subscribedCount}
          </p>
        </div>
        <div className="rounded-xl border border-line bg-white px-4 py-3">
          <p className="text-xs text-muted">ทั้งหมด</p>
          <p className="mt-1 font-display text-2xl font-semibold text-navy">
            {rows.length}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="relative min-h-11 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาอีเมลหรือชื่อ"
            className="h-11 w-full rounded-md border border-line bg-white pl-9 pr-3 text-sm outline-none focus:border-navy"
          />
        </label>
        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as "subscribed" | "unsubscribed" | "all")
          }
          className="h-11 rounded-md border border-line bg-white px-3 text-sm"
        >
          <option value="subscribed">รับข่าวสาร</option>
          <option value="unsubscribed">ถอนแล้ว</option>
          <option value="all">ทั้งหมด</option>
        </select>
      </div>

      {error ? (
        <p className="text-sm text-brand-red" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted">กำลังโหลด...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-12 text-center">
          <Mail className="mx-auto size-8 text-muted" />
          <p className="mt-3 text-sm font-medium text-navy">ยังไม่มีเมลในมุมมองนี้</p>
          <p className="mt-1 text-sm text-muted">
            คนที่ติ๊กช่องรับข่าวสารในฟอร์มจะโผล่ที่นี่
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line bg-paper text-xs text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">อีเมล</th>
                <th className="px-4 py-3 font-medium">ชื่อ</th>
                <th className="px-4 py-3 font-medium">แหล่งที่มา</th>
                <th className="px-4 py-3 font-medium">ยอมรับเมื่อ</th>
                <th className="px-4 py-3 font-medium">สถานะ</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-medium text-navy">{row.email}</td>
                  <td className="px-4 py-3 text-ink">{row.fullName || "—"}</td>
                  <td className="px-4 py-3 text-muted">
                    {SOURCE_LABEL[row.source] || row.source}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {formatWhen(row.consentedAt || row.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        row.status === "subscribed"
                          ? "rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800"
                          : "rounded-full bg-paper px-2 py-0.5 text-xs font-medium text-muted"
                      }
                    >
                      {row.status === "subscribed" ? "รับข่าวสาร" : "ถอนแล้ว"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {row.status === "subscribed" ? (
                      <button
                        type="button"
                        disabled={busyId === row.id}
                        onClick={() => void unsubscribe(row.id)}
                        className="min-h-11 rounded-md px-3 text-xs font-medium text-brand-red hover:bg-red-50 disabled:opacity-50"
                      >
                        ถอน
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
