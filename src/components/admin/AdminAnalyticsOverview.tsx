"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CalendarRange,
  Clock3,
  Download,
  MonitorSmartphone,
  MousePointerClick,
  Radio,
  Users,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  DEVICE_COLORS,
  RANGE_OPTIONS,
  defaultCustomRange,
  demoAnalytics,
  demoClicks,
  demoDevices,
  demoFunnel,
  demoLiveSeed,
  demoSources,
  demoTopPages,
  getAnalyticsBundle,
  resolvePresetRangeDates,
  type DateRangeKey,
  type LiveViewer,
} from "@/lib/admin-analytics-demo";
import { downloadAnalyticsExcel } from "@/lib/export-analytics-excel";
import { adminHref } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";

type Props = {
  basePath: string;
};

const deviceIconLabel = {
  mobile: "มือถือ",
  desktop: "คอม",
  tablet: "แท็บเล็ต",
} as const;

export function AdminAnalyticsOverview({ basePath }: Props) {
  const initialCustom = defaultCustomRange();
  const [range, setRange] = useState<DateRangeKey>("7d");
  const [customFrom, setCustomFrom] = useState(initialCustom.from);
  const [customTo, setCustomTo] = useState(initialCustom.to);
  const [draftFrom, setDraftFrom] = useState(initialCustom.from);
  const [draftTo, setDraftTo] = useState(initialCustom.to);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [excelStep, setExcelStep] = useState<"pick" | "custom">("pick");
  const [excelFrom, setExcelFrom] = useState(initialCustom.from);
  const [excelTo, setExcelTo] = useState(initialCustom.to);
  const [online, setOnline] = useState<number>(demoAnalytics["7d"].onlineBase);
  const [liveRows, setLiveRows] = useState<LiveViewer[]>(demoLiveSeed);

  const bundle = useMemo(
    () => getAnalyticsBundle(range, customFrom, customTo),
    [range, customFrom, customTo],
  );

  const activeDates = useMemo(() => {
    if (range === "custom") return { from: customFrom, to: customTo };
    return resolvePresetRangeDates(range);
  }, [range, customFrom, customTo]);

  const rangeLabel = useMemo(() => {
    if (range === "custom") return `กำหนดเอง ${customFrom} – ${customTo}`;
    const opt = RANGE_OPTIONS.find((o) => o.key === range);
    return `${opt?.label ?? range} (${activeDates.from} – ${activeDates.to})`;
  }, [range, customFrom, customTo, activeDates]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setOnline((n) => {
        const next = n + (Math.random() > 0.55 ? 1 : -1);
        return Math.min(28, Math.max(4, next));
      });
      setLiveRows((rows) =>
        rows.map((row, i) => ({
          ...row,
          secondsAgo: Math.min(90, row.secondsAgo + 2 + (i % 3)),
          path:
            Math.random() > 0.9
              ? demoTopPages[Math.floor(Math.random() * 5)]!.name
              : row.path,
        })),
      );
    }, 4000);
    return () => window.clearInterval(id);
  }, []);

  const funnelMax = useMemo(
    () => Math.max(...demoFunnel.map((f) => f.value)),
    [],
  );

  function normalizeDatePair(from: string, to: string) {
    if (from > to) return { from: to, to: from };
    return { from, to };
  }

  function openCustomModal() {
    setDraftFrom(range === "custom" ? customFrom : activeDates.from);
    setDraftTo(range === "custom" ? customTo : activeDates.to);
    setCustomModalOpen(true);
  }

  function applyCustomRange() {
    const { from, to } = normalizeDatePair(draftFrom, draftTo);
    setCustomFrom(from);
    setCustomTo(to);
    setDraftFrom(from);
    setDraftTo(to);
    setRange("custom");
    setCustomModalOpen(false);
  }

  function openExcelModal() {
    setExcelStep("pick");
    setExcelFrom(activeDates.from);
    setExcelTo(activeDates.to);
    setExcelModalOpen(true);
  }

  function exportExcelFor(
    key: DateRangeKey,
    fromInput?: string,
    toInput?: string,
  ) {
    let from = activeDates.from;
    let to = activeDates.to;
    let label = rangeLabel;
    let exportBundle = bundle;

    if (key === "custom") {
      const pair = normalizeDatePair(fromInput ?? excelFrom, toInput ?? excelTo);
      from = pair.from;
      to = pair.to;
      label = `กำหนดเอง ${from} – ${to}`;
      exportBundle = getAnalyticsBundle("custom", from, to);
    } else {
      const dates = resolvePresetRangeDates(key);
      from = dates.from;
      to = dates.to;
      const opt = RANGE_OPTIONS.find((o) => o.key === key);
      label = `${opt?.label ?? key} (${from} – ${to})`;
      exportBundle = getAnalyticsBundle(key, from, to);
    }

    downloadAnalyticsExcel({
      rangeLabel: label,
      from,
      to,
      bundle: exportBundle,
      devices: demoDevices,
      topPages: demoTopPages,
      clicks: demoClicks,
      sources: demoSources,
      funnel: demoFunnel,
    });
    setExcelModalOpen(false);
    setExcelStep("pick");
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <section className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-brand-red">
              <Activity className="size-4" />
              Website Analytics
            </div>
            <h2 className="mt-1 font-display text-2xl font-semibold text-navy sm:text-3xl">
              ภาพรวมสถิติเว็บ
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted">
              สถิติการเข้าชม · คลิก · อุปกรณ์ · หน้าฮิต · คนออนไลน์แบบ realtime
              <span className="ml-1 rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-800">
                ข้อมูลตัวอย่าง (demo)
              </span>
            </p>
            <p className="mt-2 text-xs text-muted">
              ช่วงที่แสดง: <span className="font-medium text-navy">{rangeLabel}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex max-w-full flex-wrap rounded-xl border border-line bg-paper p-1">
              {RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => {
                    const dates = resolvePresetRangeDates(opt.key);
                    setRange(opt.key);
                    setDraftFrom(dates.from);
                    setDraftTo(dates.to);
                  }}
                  className={cn(
                    "rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm",
                    range === opt.key
                      ? "bg-navy text-white"
                      : "text-muted hover:text-navy",
                  )}
                >
                  {opt.label}
                </button>
              ))}
              <button
                type="button"
                onClick={openCustomModal}
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm",
                  range === "custom"
                    ? "bg-navy text-white"
                    : "text-muted hover:text-navy",
                )}
              >
                <CalendarRange className="size-3.5" />
                กำหนดเอง
              </button>
            </div>
            <button
              type="button"
              onClick={openExcelModal}
              className="inline-flex items-center gap-1.5 rounded-xl border border-navy bg-white px-4 py-2 text-sm font-medium text-navy hover:bg-paper"
            >
              <Download className="size-4" />
              โหลด Excel
            </button>
            <Link
              href={adminHref(basePath, "/leads")}
              className="rounded-xl bg-brand-red px-4 py-2 text-sm font-medium text-white hover:bg-brand-red-soft"
            >
              ดู Lead
            </Link>
          </div>
        </div>
      </section>

      {/* Custom range popup (view stats) */}
      {customModalOpen ? (
        <Modal
          title="เลือกช่วงเวลา"
          onClose={() => setCustomModalOpen(false)}
        >
          <p className="text-sm text-muted">กำหนดวันที่เพื่อดูสถิติบนหน้านี้</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-xs text-muted">
              จากวันที่
              <input
                type="date"
                value={draftFrom}
                max={draftTo}
                onChange={(e) => setDraftFrom(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-line bg-white px-2.5 py-2 text-sm text-navy"
              />
            </label>
            <label className="text-xs text-muted">
              ถึงวันที่
              <input
                type="date"
                value={draftTo}
                min={draftFrom}
                onChange={(e) => setDraftTo(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-line bg-white px-2.5 py-2 text-sm text-navy"
              />
            </label>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCustomModalOpen(false)}
              className="rounded-lg border border-line px-3 py-2 text-sm text-muted hover:bg-paper"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={applyCustomRange}
              className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-deep"
            >
              ใช้ช่วงนี้
            </button>
          </div>
        </Modal>
      ) : null}

      {/* Excel export period popup */}
      {excelModalOpen ? (
        <Modal
          title="โหลด Excel"
          onClose={() => {
            setExcelModalOpen(false);
            setExcelStep("pick");
          }}
        >
          {excelStep === "pick" ? (
            <>
              <p className="text-sm text-muted">เลือกช่วงเวลาที่ต้องการส่งออก</p>
              <div className="mt-4 grid gap-2">
                {RANGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => exportExcelFor(opt.key)}
                    className="rounded-xl border border-line px-4 py-3 text-left text-sm font-medium text-navy hover:border-navy hover:bg-paper"
                  >
                    {opt.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setExcelStep("custom")}
                  className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-3 text-left text-sm font-medium text-navy hover:border-navy hover:bg-paper"
                >
                  <CalendarRange className="size-4" />
                  กำหนดเอง
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted">เลือกวันที่เริ่ม–สิ้นสุด แล้วกดดาวน์โหลด</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="text-xs text-muted">
                  จากวันที่
                  <input
                    type="date"
                    value={excelFrom}
                    max={excelTo}
                    onChange={(e) => setExcelFrom(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-line bg-white px-2.5 py-2 text-sm text-navy"
                  />
                </label>
                <label className="text-xs text-muted">
                  ถึงวันที่
                  <input
                    type="date"
                    value={excelTo}
                    min={excelFrom}
                    onChange={(e) => setExcelTo(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-line bg-white px-2.5 py-2 text-sm text-navy"
                  />
                </label>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setExcelStep("pick")}
                  className="rounded-lg border border-line px-3 py-2 text-sm text-muted hover:bg-paper"
                >
                  ย้อนกลับ
                </button>
                <button
                  type="button"
                  onClick={() => exportExcelFor("custom", excelFrom, excelTo)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-deep"
                >
                  <Download className="size-4" />
                  ดาวน์โหลด
                </button>
              </div>
            </>
          )}
        </Modal>
      ) : null}

      {/* KPI strip */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {bundle.kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-2xl border border-line bg-white p-4 shadow-sm"
          >
            <div className="text-xs text-muted">{kpi.label}</div>
            <div className="mt-1 flex items-end justify-between gap-2">
              <div className="font-display text-2xl font-semibold text-navy">
                {kpi.value}
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium",
                  kpi.up
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700",
                )}
              >
                {kpi.up ? (
                  <ArrowUpRight className="size-3" />
                ) : (
                  <ArrowDownRight className="size-3" />
                )}
                {kpi.delta}
              </span>
            </div>
            <div className="mt-1 text-[11px] text-muted">{kpi.hint}</div>
          </div>
        ))}
      </section>

      {/* Realtime */}
      <section className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-line bg-navy-deep p-5 text-white shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2 text-sm text-white/70">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
            </span>
            <Radio className="size-4" />
            Realtime — คนดูเว็บตอนนี้
          </div>
          <div className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {online}
          </div>
          <p className="mt-1 text-sm text-white/60">
            active ใน 90 วินาทีล่าสุด · อัปเดตทุก 4 วินาที
          </p>
          <div className="mt-6 grid grid-cols-3 gap-2 text-center">
            {demoDevices.map((d) => (
              <div key={d.name} className="rounded-xl bg-white/10 px-2 py-3">
                <div className="text-lg font-semibold">{d.value}%</div>
                <div className="text-[11px] text-white/55">{d.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm lg:col-span-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="font-display text-base font-semibold text-navy">
              กำลังดูหน้าไหนอยู่
            </h3>
            <span className="text-xs text-muted">live feed</span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="min-w-[480px] w-full text-left text-sm">
              <thead className="bg-paper text-xs text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">หน้า</th>
                  <th className="px-3 py-2 font-medium">อุปกรณ์</th>
                  <th className="px-3 py-2 font-medium">พื้นที่</th>
                  <th className="px-3 py-2 font-medium">ล่าสุด</th>
                </tr>
              </thead>
              <tbody>
                {liveRows.slice(0, 6).map((row, i) => (
                  <tr key={`${row.path}-${i}`} className="border-t border-line">
                    <td className="max-w-[220px] truncate px-3 py-2.5 font-medium text-navy">
                      {row.path}
                    </td>
                    <td className="px-3 py-2.5 text-muted">
                      {deviceIconLabel[row.device]}
                    </td>
                    <td className="px-3 py-2.5 text-muted">{row.city}</td>
                    <td className="px-3 py-2.5 text-muted">{row.secondsAgo}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Traffic + Devices charts */}
      <section className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-base font-semibold text-navy">
                การเข้าชมตามเวลา
              </h3>
              <p className="text-xs text-muted">Users และ Pageviews</p>
            </div>
            <Users className="size-4 text-muted" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bundle.traffic}>
                <defs>
                  <linearGradient id="pv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0b1f3a" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#0b1f3a" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="uv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c8102e" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#c8102e" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5eaf1" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" width={36} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: "#d7dee8",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="pageviews"
                  name="Pageviews"
                  stroke="#0b1f3a"
                  fill="url(#pv)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  name="Users"
                  stroke="#c8102e"
                  fill="url(#uv)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-base font-semibold text-navy">
                อุปกรณ์
              </h3>
              <p className="text-xs text-muted">สัดส่วนผู้เข้าชม</p>
            </div>
            <MonitorSmartphone className="size-4 text-muted" />
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={demoDevices}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={78}
                  paddingAngle={3}
                >
                  {demoDevices.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={
                        DEVICE_COLORS[entry.name as keyof typeof DEVICE_COLORS]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value}%`, "สัดส่วน"]}
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: "#d7dee8",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-1 space-y-1.5 text-sm">
            {demoDevices.map((d) => (
              <li key={d.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted">
                  <span
                    className="size-2.5 rounded-full"
                    style={{
                      background:
                        DEVICE_COLORS[d.name as keyof typeof DEVICE_COLORS],
                    }}
                  />
                  {d.name}
                </span>
                <span className="font-medium text-navy">{d.value}%</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Tables row */}
      <section className="grid gap-4 xl:grid-cols-3">
        <Panel title="หน้าฮิต" subtitle="Top pages">
          <RankList
            rows={demoTopPages.map((p) => ({
              primary: p.name,
              secondary: p.meta,
              value: p.value.toLocaleString("th-TH"),
            }))}
          />
        </Panel>
        <Panel
          title="คลิก / CTA"
          subtitle="ปุ่มที่ถูกกด"
          icon={<MousePointerClick className="size-4 text-muted" />}
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demoClicks} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5eaf1" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={80}
                  tick={{ fontSize: 9 }}
                  stroke="#94a3b8"
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: "#d7dee8",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" name="คลิก" fill="#c8102e" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="แหล่งที่มา" subtitle="Traffic sources">
          <RankList
            rows={demoSources.map((s) => ({
              primary: s.name,
              value: `${s.value}%`,
            }))}
          />
        </Panel>
      </section>

      {/* Funnel + shortcuts */}
      <section className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-semibold text-navy">
                Funnel การซื้อ
              </h3>
              <p className="text-xs text-muted">เข้าเว็บ → สินค้า → ใบเสนอราคา → Lead</p>
            </div>
            <Clock3 className="size-4 text-muted" />
          </div>
          <div className="space-y-3">
            {demoFunnel.map((step, i) => {
              const width = Math.max(12, Math.round((step.value / funnelMax) * 100));
              return (
                <div key={step.step}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-muted">
                      {i + 1}. {step.step}
                    </span>
                    <span className="font-medium text-navy">
                      {step.value.toLocaleString("th-TH")}
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-paper">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-navy to-brand-red"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="font-display text-base font-semibold text-navy">
            ทางลัดงานหลังบ้าน
          </h3>
          <p className="mt-1 text-xs text-muted">จัดการคอนเทนต์และ lead</p>
          <div className="mt-4 space-y-2">
            {[
              { href: "/leads", label: "คำขอใบเสนอราคา", ready: true },
              { href: "/subscribers", label: "เมลลูกค้า", ready: true },
              { href: "/visits", label: "นัดเยี่ยมชมโรงงาน", ready: true },
              { href: "/presentations", label: "นัดนำเสนอสินค้า", ready: true },
              { href: "/editor/home", label: "Page Editor", ready: true },
              { href: "/cms/hero-slides", label: "สไลด์หน้าแรก", ready: true },
              { href: "/cms/portfolio", label: "ผลงาน", ready: true },
              { href: "/cms/blog", label: "บทความ", ready: true },
              { href: "/cms/reviews", label: "รีวิว", ready: true },
              { href: "/settings", label: "ตั้งค่าระบบ", ready: true },
            ].map((item) =>
              item.ready ? (
                <Link
                  key={item.href}
                  href={adminHref(basePath, item.href)}
                  className="flex items-center justify-between rounded-xl border border-line px-3 py-2.5 text-sm hover:border-navy/30 hover:bg-paper"
                >
                  <span className="font-medium text-navy">{item.label}</span>
                  <span className="text-xs text-brand-red">เปิด →</span>
                </Link>
              ) : (
                <div
                  key={item.href}
                  className="flex items-center justify-between rounded-xl border border-dashed border-line px-3 py-2.5 text-sm text-muted"
                >
                  <span>{item.label}</span>
                  <span className="text-[11px]">เร็วๆ นี้</span>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Website build status — keep in sync with public site */}
      <section className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="font-display text-base font-semibold text-navy">
              สถานะเว็บไซต์ (อัปเดตล่าสุด)
            </h3>
            <p className="mt-1 text-xs text-muted">
              สิ่งที่ออนไลน์บนหน้าเว็บแล้ว และส่วนที่แก้จากแอดมินได้
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
            Visual CMS + ยืนยันการเปลี่ยน
          </span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-xl border border-line bg-paper/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              หน้าสาธารณะ
            </p>
            <ul className="mt-3 space-y-2 text-sm text-navy/90">
              <li>· หน้าแรก — Hero, สินค้า, ผลงาน, ขั้นตอน, รีวิว, สถิติ, CTA</li>
              <li>· แคตตาล็อกสินค้า 7 เสา + หน้ารายละเอียดรุ่น</li>
              <li>
                · หน้ารายละเอียด: จุดเด่น, สเปก, สไตล์ห้อง, คลิปติดตั้ง, ผลงาน,
                รุ่นอื่น, ตารางเทียบ, FAQ, CTA
              </li>
              <li>· ผลงาน / บทความ / ขอใบเสนอราคา / เกี่ยวกับเรา</li>
            </ul>
          </div>
          <div className="rounded-xl border border-line bg-paper/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              แก้ในแอดมินได้แล้ว
            </p>
            <ul className="mt-3 space-y-2 text-sm text-navy/90">
              <li>
                ·{" "}
                <Link
                  href={adminHref(basePath, "/editor/home")}
                  className="font-medium text-brand-red hover:underline"
                >
                  Page Editor
                </Link>{" "}
                — หน้าแรก / เกี่ยวกับเรา / ติดต่อ / เทมเพลตสินค้า·บทความ·ผลงาน
              </li>
              <li>· สไลด์หน้าแรก / ผลงาน / บทความ / รีวิว (รายการ)</li>
              <li>· Lead คำขอใบเสนอราคา + ตั้งค่าบริษัท</li>
            </ul>
          </div>
          <div className="rounded-xl border border-line bg-paper/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              ยังล็อกในโค้ด / แผนถัดไป
            </p>
            <ul className="mt-3 space-y-2 text-sm text-navy/90">
              <li>· เลย์เอาต์ทุก section (ไม่ให้ลากย้ายโครง)</li>
              <li>· รูปสไตล์ห้อง / คลิปวิดีโอ / ตารางเทียบ / FAQ ต่อรุ่น</li>
              <li>· Feature strip, Services, Catalog บนหน้าแรก</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-line bg-white p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="font-display text-lg font-semibold text-navy">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-paper hover:text-navy"
            aria-label="ปิด"
          >
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
  icon,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h3 className="font-display text-base font-semibold text-navy">{title}</h3>
          {subtitle ? <p className="text-xs text-muted">{subtitle}</p> : null}
        </div>
        {icon}
      </div>
      {children}
    </div>
  );
}

function RankList({
  rows,
}: {
  rows: { primary: string; secondary?: string; value: string }[];
}) {
  return (
    <ul className="divide-y divide-line">
      {rows.map((row, i) => (
        <li key={row.primary} className="flex items-center gap-3 py-2.5 text-sm">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-paper text-[11px] font-semibold text-muted">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium text-navy">{row.primary}</div>
            {row.secondary ? (
              <div className="truncate text-xs text-muted">{row.secondary}</div>
            ) : null}
          </div>
          <div className="shrink-0 font-semibold text-navy">{row.value}</div>
        </li>
      ))}
    </ul>
  );
}
