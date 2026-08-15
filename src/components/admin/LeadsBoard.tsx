"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CalendarRange,
  Download,
  Eye,
  ImagePlus,
  ListFilter,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { LeadSiteImages } from "@/components/admin/LeadSiteImages";
import { DEMO_LEADS } from "@/lib/leads/leads-demo";
import { downloadLeadsExcel } from "@/lib/export-leads-excel";
import { leadImageRefs } from "@/lib/security/lead-media";
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_STYLES,
  PRODUCT_TYPES,
  type LeadStatus,
  type QuoteLead,
} from "@/lib/leads/types";
import { DEMO_STAFF, getSalesStaff } from "@/lib/admin-users";
import {
  defaultCustomRange,
  RANGE_OPTIONS,
  resolvePresetRangeDates,
  toDateInputValue,
  type DateRangeKey,
} from "@/lib/admin-analytics-demo";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: LEAD_STATUS_STYLES.new.chart,
  contacted: LEAD_STATUS_STYLES.contacted.chart,
  quoted: LEAD_STATUS_STYLES.quoted.chart,
  won: LEAD_STATUS_STYLES.won.chart,
  cancelled: LEAD_STATUS_STYLES.cancelled.chart,
};

const PRODUCT_CHART_COLORS = [
  "#0b1f3a",
  "#c8102e",
  "#2563eb",
  "#059669",
  "#d97706",
  "#7c3aed",
  "#0891b2",
  "#be185d",
];

function dayKey(iso: string): string {
  const d = new Date(iso);
  return toDateInputValue(d);
}

function inDateRange(iso: string, from: string, to: string): boolean {
  if (!from && !to) return true;
  const key = dayKey(iso);
  if (from && key < from) return false;
  if (to && key > to) return false;
  return true;
}

export function LeadsBoard() {
  const defaults = defaultCustomRange();
  const [leads, setLeads] = useState<QuoteLead[]>([]);
  const [usingDemo, setUsingDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [draftStatus, setDraftStatus] = useState<LeadStatus | "all">("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [draftFrom, setDraftFrom] = useState(defaults.from);
  const [draftTo, setDraftTo] = useState(defaults.to);
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const [rangeKey, setRangeKey] = useState<DateRangeKey>("custom");
  const [selected, setSelected] = useState<QuoteLead | null>(null);
  const [cancelTarget, setCancelTarget] = useState<QuoteLead | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelImageName, setCancelImageName] = useState<string | null>(null);
  const [cancelImageUrl, setCancelImageUrl] = useState<string | null>(null);
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const salesStaff = useMemo(() => getSalesStaff(DEMO_STAFF), []);

  const activeFilterCount = statusFilter !== "all" ? 1 : 0;

  function openFilterPopup() {
    setDraftStatus(statusFilter);
    setFilterOpen(true);
  }

  function applyFilters() {
    setStatusFilter(draftStatus);
    setFilterOpen(false);
  }

  function resetFilters() {
    setDraftStatus("all");
    setStatusFilter("all");
    setFilterOpen(false);
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/leads");
      const json = (await res.json()) as { leads?: QuoteLead[]; error?: string };
      if (!res.ok) throw new Error(json.error || "โหลดไม่สำเร็จ");
      const rows = json.leads || [];
      if (rows.length === 0) {
        setLeads(DEMO_LEADS);
        setUsingDemo(true);
      } else {
        setLeads(rows);
        setUsingDemo(false);
      }
    } catch (err) {
      setLeads(DEMO_LEADS);
      setUsingDemo(true);
      setError(
        err instanceof Error
          ? `${err.message} — แสดงข้อมูลตัวอย่างแทน`
          : "แสดงข้อมูลตัวอย่างแทน",
      );
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

  const dateScoped = useMemo(
    () => leads.filter((l) => inDateRange(l.createdAt, from, to)),
    [leads, from, to],
  );

  const statusCounts = useMemo(() => {
    const map = Object.fromEntries(LEAD_STATUSES.map((s) => [s, 0])) as Record<
      LeadStatus,
      number
    >;
    for (const lead of dateScoped) map[lead.status] += 1;
    return map;
  }, [dateScoped]);

  const productCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const lead of dateScoped) {
      map.set(lead.productType, (map.get(lead.productType) || 0) + 1);
    }
    return map;
  }, [dateScoped]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return dateScoped.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (productFilter !== "all" && l.productType !== productFilter) return false;
      if (!q) return true;
      return (
        l.contactName.toLowerCase().includes(q) ||
        l.phone.toLowerCase().includes(q) ||
        (l.lineId || "").toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        (l.businessName || "").toLowerCase().includes(q)
      );
    });
  }, [dateScoped, statusFilter, productFilter, search]);

  const dailyChart = useMemo(() => {
    const map = new Map<string, number>();
    for (const lead of dateScoped) {
      const key = dayKey(lead.createdAt);
      map.set(key, (map.get(key) || 0) + 1);
    }
    const keys = [...map.keys()].sort();
    return keys.map((k) => {
      const [, m, d] = k.split("-");
      return { label: `${Number(d)}/${Number(m)}`, count: map.get(k) || 0 };
    });
  }, [dateScoped]);

  const statusChart = useMemo(
    () =>
      LEAD_STATUSES.map((s) => ({
        name: LEAD_STATUS_LABELS[s],
        key: s,
        value: statusCounts[s],
      })).filter((x) => x.value > 0),
    [statusCounts],
  );

  const productChart = useMemo(
    () =>
      [...productCounts.entries()]
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
    [productCounts],
  );

  const wonThisMonth = useMemo(() => {
    const now = new Date();
    return dateScoped.filter((l) => {
      if (l.status !== "won") return false;
      const d = new Date(l.updatedAt || l.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [dateScoped]);

  function openCancelPopup(lead: QuoteLead) {
    setCancelTarget(lead);
    setCancelReason(lead.cancelReason || "");
    setCancelImageName(lead.cancelImageName || null);
    setCancelImageUrl(lead.cancelImageUrl || null);
  }

  function closeCancelPopup() {
    setCancelTarget(null);
    setCancelReason("");
    setCancelImageName(null);
    setCancelImageUrl(null);
    setCancelSubmitting(false);
  }

  function onCancelImagePick(file: File | null) {
    if (!file) {
      setCancelImageName(null);
      setCancelImageUrl(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCancelImageName(file.name);
      setCancelImageUrl(typeof reader.result === "string" ? reader.result : null);
    };
    reader.readAsDataURL(file);
  }

  function applyLeadPatch(id: string, patch: Partial<QuoteLead>) {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    );
    if (selected?.id === id) {
      setSelected((s) => (s ? { ...s, ...patch } : s));
    }
  }

  async function changeStatus(id: string, status: LeadStatus) {
    const now = new Date().toISOString();
    const clearCancel =
      status !== "cancelled"
        ? {
            cancelReason: null,
            cancelImageName: null,
            cancelImageUrl: null,
          }
        : {};

    if (usingDemo || id.startsWith("demo-")) {
      applyLeadPatch(id, { status, updatedAt: now, ...clearCancel });
      return;
    }

    const res = await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const json = (await res.json()) as { lead?: QuoteLead; error?: string };
    if (!res.ok) {
      alert(json.error || "อัปเดตไม่สำเร็จ");
      return;
    }
    applyLeadPatch(id, { ...json.lead, ...clearCancel });
  }

  function onStatusSelect(lead: QuoteLead, next: LeadStatus) {
    if (next === "cancelled") {
      openCancelPopup(lead);
      return;
    }
    void changeStatus(lead.id, next);
  }

  async function confirmCancel() {
    if (!cancelTarget) return;
    const reason = cancelReason.trim();
    if (!reason) {
      alert("กรุณาใส่เหตุผลการยกเลิก");
      return;
    }
    setCancelSubmitting(true);
    const now = new Date().toISOString();
    const patch: Partial<QuoteLead> = {
      status: "cancelled",
      cancelReason: reason,
      cancelImageName,
      cancelImageUrl,
      updatedAt: now,
    };

    if (usingDemo || cancelTarget.id.startsWith("demo-")) {
      applyLeadPatch(cancelTarget.id, patch);
      setSelected((s) =>
        s?.id === cancelTarget.id ? { ...s, ...patch } : s,
      );
      closeCancelPopup();
      return;
    }

    try {
      const res = await fetch(`/api/admin/leads/${cancelTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "cancelled",
          cancelReason: reason,
          cancelImageName,
          cancelImageUrl,
        }),
      });
      const json = (await res.json()) as { lead?: QuoteLead; error?: string };
      if (!res.ok) throw new Error(json.error || "อัปเดตไม่สำเร็จ");
      applyLeadPatch(cancelTarget.id, { ...patch, ...json.lead });
      closeCancelPopup();
    } catch (err) {
      // Persist locally so detail still updates even if API lacks cancel fields yet
      applyLeadPatch(cancelTarget.id, patch);
      closeCancelPopup();
      alert(
        err instanceof Error
          ? `${err.message} — บันทึกในหน้านี้แล้ว`
          : "บันทึกในหน้านี้แล้ว",
      );
    }
  }

  function changeAssignee(id: string, assigneeId: string) {
    const staff = salesStaff.find((s) => s.id === assigneeId) || null;
    const next = {
      assigneeId: staff?.id ?? null,
      assigneeName: staff?.fullName ?? null,
      updatedAt: new Date().toISOString(),
    };
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...next } : l)),
    );
    if (selected?.id === id) {
      setSelected((s) => (s ? { ...s, ...next } : s));
    }
  }

  function applyPreset(key: Exclude<DateRangeKey, "custom">) {
    const dates = resolvePresetRangeDates(key);
    setDraftFrom(dates.from);
    setDraftTo(dates.to);
    setFrom(dates.from);
    setTo(dates.to);
    setRangeKey(key);
  }

  function applyDateRange() {
    let a = draftFrom;
    let b = draftTo;
    if (a && b && a > b) {
      const tmp = a;
      a = b;
      b = tmp;
    }
    setFrom(a);
    setTo(b);
    setDraftFrom(a);
    setDraftTo(b);
    setRangeKey("custom");
  }

  function exportExcel() {
    downloadLeadsExcel({
      leads: filtered,
      from,
      to,
      statusFilter:
        statusFilter === "all" ? "ทั้งหมด" : LEAD_STATUS_LABELS[statusFilter],
      productFilter: productFilter === "all" ? "ทั้งหมด" : productFilter,
      isDemo: usingDemo,
    });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <section className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-navy sm:text-2xl">
              จัดการคำขอใบเสนอราคา
            </h2>
            <p className="mt-1 text-sm text-muted">
              ฟิลเตอร์สถานะ · เลือกสินค้าแบบคลิก · ช่วงวันที่ · กราฟสถิติ · โหลด Excel
              {usingDemo ? (
                <span className="ml-1 rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-800">
                  ข้อมูลตัวอย่าง (demo) 10 รายการ
                </span>
              ) : null}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={exportExcel}
              className="inline-flex items-center gap-1.5 rounded-xl border border-navy bg-white px-4 py-2 text-sm font-medium text-navy hover:bg-paper"
            >
              <Download className="size-4" />
              โหลด Excel
            </button>
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-deep"
            >
              <RefreshCw className="size-4" />
              รีเฟรช
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-line bg-paper p-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-2">
          <div className="flex flex-wrap rounded-xl border border-line bg-white p-1">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => applyPreset(opt.key)}
                className={cn(
                  "rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm",
                  rangeKey === opt.key
                    ? "bg-navy text-white"
                    : "text-muted hover:text-navy",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex w-full flex-wrap items-end gap-2 sm:w-auto">
          <label className="min-w-0 flex-1 text-xs text-muted sm:flex-none">
            จากวันที่
            <input
              type="date"
              value={draftFrom}
              max={draftTo || undefined}
              onChange={(e) => {
                setDraftFrom(e.target.value);
                setRangeKey("custom");
              }}
              className="mt-1 block w-full min-w-0 rounded-lg border border-line bg-white px-2.5 py-1.5 text-sm text-navy"
            />
          </label>
          <label className="min-w-0 flex-1 text-xs text-muted sm:flex-none">
            ถึงวันที่
            <input
              type="date"
              value={draftTo}
              min={draftFrom || undefined}
              onChange={(e) => {
                setDraftTo(e.target.value);
                setRangeKey("custom");
              }}
              className="mt-1 block w-full min-w-0 rounded-lg border border-line bg-white px-2.5 py-1.5 text-sm text-navy"
            />
          </label>
          <button
            type="button"
            onClick={applyDateRange}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium",
              rangeKey === "custom"
                ? "bg-navy text-white hover:bg-navy-deep"
                : "border border-navy bg-white text-navy hover:bg-paper",
            )}
          >
            <CalendarRange className="size-3.5" />
            ใช้ช่วงนี้
          </button>
          </div>
          <p className="w-full text-xs text-muted sm:ml-auto sm:w-auto sm:self-center">
            แสดง: {from} – {to} · ผลลัพธ์ {filtered.length} รายการ
          </p>
        </div>
      </section>

      {/* KPI + Lead daily — same row, 2 columns */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "ทั้งหมดในช่วง", value: dateScoped.length },
            { label: "คำขอใหม่", value: statusCounts.new },
            { label: "ส่งใบเสนอราคาแล้ว", value: statusCounts.quoted },
            { label: "สำเร็จเดือนนี้", value: wonThisMonth },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-2xl border border-line bg-white p-4 shadow-sm"
            >
              <div className="text-[11px] leading-snug text-muted sm:text-xs">
                {kpi.label}
              </div>
              <div className="mt-1 font-display text-2xl font-semibold text-navy sm:text-3xl">
                {kpi.value}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <h3 className="font-display text-base font-semibold text-navy">
            Lead รายวัน
          </h3>
          <p className="text-xs text-muted">ตามช่วงวันที่ที่เลือก</p>
          <div className="mt-3 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5eaf1" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" width={28} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, borderColor: "#d7dee8", fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Lead"
                  stroke="#c8102e"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Charts */}
      <section className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <h3 className="font-display text-base font-semibold text-navy">ตามสถานะ</h3>
            <p className="text-xs text-muted">จำนวนคำขอในแต่ละสถานะ</p>
            <div className="mt-3 h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5eaf1" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" width={28} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, borderColor: "#d7dee8", fontSize: 12 }}
                  />
                  <Bar dataKey="value" name="จำนวน" radius={[6, 6, 0, 0]}>
                    {statusChart.map((entry) => (
                      <Cell
                        key={entry.key}
                        fill={STATUS_COLORS[entry.key as LeadStatus]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <h3 className="font-display text-base font-semibold text-navy">ตามสินค้า</h3>
            <p className="text-xs text-muted">สัดส่วนประเภทสินค้า</p>
            <div className="mt-3 h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productChart}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={42}
                    outerRadius={72}
                    paddingAngle={2}
                  >
                    {productChart.map((entry, i) => (
                      <Cell
                        key={entry.name}
                        fill={PRODUCT_CHART_COLORS[i % PRODUCT_CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 12, borderColor: "#d7dee8", fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Filters + table */}
      <section className="space-y-4 rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openFilterPopup}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-medium",
              activeFilterCount > 0
                ? "border-navy bg-navy text-white"
                : "border-line bg-paper text-navy hover:border-navy/30",
            )}
          >
            <ListFilter className="size-4" />
            ฟิลเตอร์
            {activeFilterCount > 0 ? (
              <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[11px]">
                {activeFilterCount}
              </span>
            ) : null}
          </button>

          {statusFilter !== "all" ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-line bg-paper px-2.5 py-1 text-xs text-navy">
              สถานะ: {LEAD_STATUS_LABELS[statusFilter]}
              <button
                type="button"
                aria-label="ล้างฟิลเตอร์สถานะ"
                className="rounded p-0.5 hover:bg-white"
                onClick={() => setStatusFilter("all")}
              >
                <X className="size-3" />
              </button>
            </span>
          ) : null}

          <label className="relative min-w-[200px] flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อ / เบอร์ / อีเมล"
              className="w-full rounded-xl border border-line bg-paper py-2.5 pl-10 pr-3 text-sm text-navy outline-none focus:border-navy"
            />
          </label>
        </div>

        <div>
          <div className="mb-2 text-sm font-semibold text-navy">สินค้า</div>
          <div className="flex flex-wrap gap-2">
            <FilterChip
              active={productFilter === "all"}
              onClick={() => setProductFilter("all")}
              label={`ทั้งหมด (${dateScoped.length})`}
            />
            {PRODUCT_TYPES.map((product) => {
              const count = productCounts.get(product) || 0;
              return (
                <FilterChip
                  key={product}
                  active={productFilter === product}
                  onClick={() => setProductFilter(product)}
                  label={`${product}${count ? ` (${count})` : ""}`}
                />
              );
            })}
          </div>
        </div>

        {loading ? <p className="text-sm text-muted">กำลังโหลด...</p> : null}
        {error ? <p className="text-sm text-brand-red">{error}</p> : null}

        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#f8fafc] text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">วันที่</th>
                <th className="px-4 py-3 font-medium">ชื่อผู้ติดต่อ</th>
                <th className="px-4 py-3 font-medium">เบอร์</th>
                <th className="px-4 py-3 font-medium">สินค้า</th>
                <th className="px-4 py-3 font-medium">แหล่ง</th>
                <th className="px-4 py-3 font-medium">เซลล์ผู้ดูแล</th>
                <th className="px-4 py-3 font-medium">สถานะ</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr className="border-t border-line">
                  <td className="px-4 py-6 text-muted" colSpan={8}>
                    ไม่พบรายการตามฟิลเตอร์
                  </td>
                </tr>
              ) : (
                filtered.map((lead) => (
                  <tr key={lead.id} className="border-t border-line align-top">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-navy">
                        {new Date(lead.createdAt).toLocaleDateString("th-TH")}
                      </div>
                      <div className="text-xs text-muted">
                        {new Date(lead.createdAt).toLocaleTimeString("th-TH", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-navy">{lead.contactName}</div>
                      <div className="text-xs text-muted">{lead.email}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{lead.phone}</td>
                    <td className="px-4 py-3">{lead.productType}</td>
                    <td className="px-4 py-3">
                      {lead.referralSource || lead.source}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={lead.assigneeId || ""}
                        onChange={(e) => changeAssignee(lead.id, e.target.value)}
                        className="max-w-[140px] rounded-lg border border-line px-2 py-1"
                      >
                        <option value="">ยังไม่มอบหมาย</option>
                        {salesStaff.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.fullName}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={lead.status}
                        onChange={(e) =>
                          onStatusSelect(lead, e.target.value as LeadStatus)
                        }
                        className={cn(
                          "rounded-lg border px-2 py-1 text-sm font-medium",
                          LEAD_STATUS_STYLES[lead.status].select,
                        )}
                      >
                        {LEAD_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {LEAD_STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        aria-label="ดูรายละเอียด"
                        title="ดูรายละเอียด"
                        className="inline-flex rounded-lg p-1.5 text-brand-red hover:bg-brand-red/10"
                        onClick={() => setSelected(lead)}
                      >
                        <Eye className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {filterOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            className="absolute inset-0"
            onClick={() => setFilterOpen(false)}
            aria-hidden
          />
          <div className="relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-lg sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold text-navy">
                  ฟิลเตอร์รายการ
                </h2>
                <p className="text-sm text-muted">เลือกสถานะคำขอ</p>
              </div>
              <button
                type="button"
                aria-label="ปิด"
                className="rounded-lg p-1.5 text-muted hover:bg-paper hover:text-navy"
                onClick={() => setFilterOpen(false)}
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-5">
              <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                สถานะ
              </div>
              <div className="flex flex-wrap gap-2">
                <FilterChip
                  active={draftStatus === "all"}
                  onClick={() => setDraftStatus("all")}
                  label={`ทั้งหมด (${dateScoped.length})`}
                />
                {LEAD_STATUSES.map((status) => (
                  <FilterChip
                    key={status}
                    active={draftStatus === status}
                    onClick={() => setDraftStatus(status)}
                    label={`${LEAD_STATUS_LABELS[status]} (${statusCounts[status]})`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-line pt-4">
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-xl border border-line px-4 py-2 text-sm font-medium text-muted hover:text-navy"
              >
                ล้างทั้งหมด
              </button>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="rounded-xl border border-line px-4 py-2 text-sm font-medium text-navy hover:bg-paper"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={applyFilters}
                className="rounded-xl bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-deep"
              >
                ใช้ฟิลเตอร์
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-semibold text-navy">
                  รายละเอียดคำขอ
                </h2>
                <p className="text-sm text-muted">{selected.id}</p>
              </div>
              <button
                type="button"
                className="text-sm text-muted hover:text-navy"
                onClick={() => setSelected(null)}
              >
                ปิด
              </button>
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <Item label="ชื่อผู้ติดต่อ" value={selected.contactName} />
              <Item label="ตำแหน่งงาน" value={selected.jobTitle} />
              <Item label="เบอร์โทรศัพท์" value={selected.phone} />
              <Item label="LINE ID" value={selected.lineId} />
              <Item label="ประเภทผู้ติดต่อ" value={selected.contactType} />
              <Item label="ชื่อธุรกิจ" value={selected.businessName} />
              <Item label="E-mail" value={selected.email} />
              <Item label="เลขผู้เสียภาษี" value={selected.taxId} />
              <Item label="ประเภทสินค้า" value={selected.productType} />
              <Item label="วันที่อยากติดตั้ง" value={selected.callbackDate} />
              <Item label="หาเราเจอจาก" value={selected.referralSource} />
              <Item
                label="เซลล์ผู้ดูแล"
                value={selected.assigneeName || "ยังไม่มอบหมาย"}
              />
              <div>
                <dt className="text-muted">สถานะ</dt>
                <dd className="mt-1">
                  <span
                    className={cn(
                      "inline-flex rounded-lg border px-2.5 py-1 text-sm font-medium",
                      LEAD_STATUS_STYLES[selected.status].select,
                    )}
                  >
                    {LEAD_STATUS_LABELS[selected.status]}
                  </span>
                </dd>
              </div>
              <Item label="ที่อยู่ติดตั้ง" value={selected.installAddress} wide />
              <Item label="ที่อยู่สำหรับออกใบเสนอราคา" value={selected.billingAddress} wide />
              <Item label="ขนาดที่ต้องการ" value={selected.requestedSize} wide />
              <Item label="หมายเหตุ" value={selected.note} wide />
              <Item
                label="แนบภาพหน้างาน"
                value={
                  selected.siteImageUrls?.length || selected.siteImageUrl
                    ? selected.siteImageName ||
                      `${selected.siteImageUrls?.length || 1} ไฟล์`
                    : "No File Upload"
                }
                wide
              />
            </dl>
            <LeadSiteImages refs={leadImageRefs(selected)} />

            {selected.status === "cancelled" ? (
              <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50/60 p-4">
                <div className="text-sm font-semibold text-rose-800">
                  เหตุผลการยกเลิก
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-ink">
                  {selected.cancelReason?.trim() || "-"}
                </p>
                {selected.cancelImageUrl ? (
                  <div className="mt-3">
                    <div className="text-xs text-muted">
                      รูปหลักฐาน: {selected.cancelImageName || "แนบรูป"}
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selected.cancelImageUrl}
                      alt="หลักฐานการยกเลิก"
                      className="mt-2 max-h-48 rounded-lg border border-rose-200 object-contain"
                    />
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-muted">ไม่มีรูปแนบ</p>
                )}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {cancelTarget ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div
            className="absolute inset-0"
            onClick={closeCancelPopup}
            aria-hidden
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-5 shadow-lg sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold text-navy">
                  ยืนยันยกเลิกคำขอ
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {cancelTarget.contactName} · {cancelTarget.productType}
                </p>
              </div>
              <button
                type="button"
                aria-label="ปิด"
                className="rounded-lg p-1.5 text-muted hover:bg-paper hover:text-navy"
                onClick={closeCancelPopup}
              >
                <X className="size-5" />
              </button>
            </div>

            <label className="mt-5 block text-sm text-muted">
              เหตุผลการยกเลิก <span className="text-rose-600">*</span>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
                placeholder="เช่น ลูกค้าเปลี่ยนใจ / งบไม่พอ / ติดต่อไม่ได้ …"
                className="mt-1.5 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-navy"
              />
            </label>

            <div className="mt-4">
              <div className="text-sm text-muted">แนบรูป (ถ้ามี)</div>
              <label className="mt-1.5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-paper px-4 py-6 text-sm text-muted hover:border-navy/40 hover:text-navy">
                <ImagePlus className="size-6" />
                <span>
                  {cancelImageName
                    ? `เลือกแล้ว: ${cancelImageName}`
                    : "คลิกเพื่ออัปโหลดรูป"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    onCancelImagePick(e.target.files?.[0] || null)
                  }
                />
              </label>
              {cancelImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cancelImageUrl}
                  alt="ตัวอย่างรูปยกเลิก"
                  className="mt-3 max-h-40 w-full rounded-lg border border-line object-contain"
                />
              ) : null}
              {cancelImageUrl ? (
                <button
                  type="button"
                  className="mt-2 text-xs text-muted underline hover:text-navy"
                  onClick={() => onCancelImagePick(null)}
                >
                  ลบรูป
                </button>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-line pt-4">
              <button
                type="button"
                onClick={closeCancelPopup}
                className="rounded-xl border border-line px-4 py-2 text-sm font-medium text-navy hover:bg-paper"
              >
                กลับ
              </button>
              <button
                type="button"
                disabled={cancelSubmitting}
                onClick={() => void confirmCancel()}
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
              >
                ยืนยันยกเลิก
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-1.5 text-sm transition-colors",
        active
          ? "border-navy bg-navy text-white"
          : "border-line bg-paper text-ink hover:border-navy/30",
      )}
    >
      {label}
    </button>
  );
}

function Item({
  label,
  value,
  wide,
}: {
  label: string;
  value?: string | null;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-muted">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-wrap text-ink">{value?.trim() || "-"}</dd>
    </div>
  );
}
