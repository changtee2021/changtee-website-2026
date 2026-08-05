"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Eye,
  MousePointerClick,
  Share2,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  portfolioStatsForItems,
  usePortfolioAnalytics,
} from "@/lib/cms/portfolio-analytics";
import { productLabel } from "@/lib/cms/portfolio-demo";
import type { PortfolioItem } from "@/lib/cms/portfolio-demo";
import { DemoBadge, StatPill } from "@/components/admin/cms/CmsShared";
import { adminHref } from "@/lib/admin-nav";

export function PortfolioAnalyticsPanel({
  items,
  basePath,
}: {
  items: PortfolioItem[];
  basePath: string;
}) {
  const store = usePortfolioAnalytics();

  const ranked = useMemo(() => {
    return portfolioStatsForItems(items, store)
      .filter((i) => i.status === "published" || i.views > 0)
      .sort((a, b) => b.views - a.views);
  }, [items, store]);

  const totals = useMemo(() => {
    return ranked.reduce(
      (acc, r) => {
        acc.views += r.views;
        acc.quotes += r.quoteClicks;
        acc.shares += r.shares;
        return acc;
      },
      { views: 0, quotes: 0, shares: 0 },
    );
  }, [ranked]);

  const conv =
    totals.views > 0
      ? Math.round((totals.quotes / totals.views) * 1000) / 10
      : 0;

  const barData = ranked.slice(0, 8).map((r) => ({
    name: r.title.length > 14 ? `${r.title.slice(0, 14)}…` : r.title,
    fullName: r.title,
    ชม: r.views,
    เสนอราคา: r.quoteClicks,
    แชร์: r.shares,
  }));

  const daily = store.daily.map((d) => ({
    ...d,
    label: d.date.slice(5).replace("-", "/"),
  }));

  const top = ranked[0];

  return (
    <section className="space-y-4 rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-navy">
            สถิติผลงาน
          </h3>
          <p className="mt-0.5 text-sm text-muted">
            วัดว่าช่วงนี้ผลงานไหนคนดูเยอะ / กดเสนอราคาเยอะ — ช่วยตัดสินใจลงงานแบบไหนต่อ
            <span className="ml-1">
              <DemoBadge>demo + นับจากเครื่องนี้</DemoBadge>
            </span>
          </p>
        </div>
        {top ? (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-sm">
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-800">
              <TrendingUp className="size-3.5" />
              ผลงานเด่นช่วงนี้
            </div>
            <div className="font-medium text-navy">{top.title}</div>
            <div className="text-xs text-muted">
              {top.views.toLocaleString("th-TH")} ชม. · {top.quoteClicks} เสนอราคา ·{" "}
              {top.conversionRate}% แปลง
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <StatPill label="เข้าชมรวม" value={totals.views.toLocaleString("th-TH")} />
        <StatPill
          label="กดเสนอราคา"
          value={totals.quotes.toLocaleString("th-TH")}
          tone="green"
        />
        <StatPill label="แชร์" value={totals.shares.toLocaleString("th-TH")} />
        <StatPill label="อัตราเสนอราคา" value={`${conv}%`} tone="amber" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-line p-3 sm:p-4">
          <div className="mb-2 text-sm font-medium text-navy">
            แนวโน้ม 14 วัน — ชม. vs เสนอราคา
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={36} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.date ?? ""
                  }
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="views"
                  name="เข้าชม"
                  stroke="#1e3a5f"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="quotes"
                  name="เสนอราคา"
                  stroke="#c0392b"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-line p-3 sm:p-4">
          <div className="mb-2 text-sm font-medium text-navy">
            เปรียบเทียบผลงาน (ชม. / เสนอราคา / แชร์)
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ left: 0, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                <YAxis tick={{ fontSize: 11 }} width={36} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.fullName ?? ""
                  }
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="ชม" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
                <Bar dataKey="เสนอราคา" fill="#c0392b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="แชร์" fill="#06C755" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#f8fafc] text-muted">
            <tr>
              <th className="px-3 py-2.5 font-medium">#</th>
              <th className="px-3 py-2.5 font-medium">ผลงาน</th>
              <th className="px-3 py-2.5 font-medium">
                <span className="inline-flex items-center gap-1">
                  <Eye className="size-3.5" /> ชม.
                </span>
              </th>
              <th className="px-3 py-2.5 font-medium">
                <span className="inline-flex items-center gap-1">
                  <MousePointerClick className="size-3.5" /> เสนอราคา
                </span>
              </th>
              <th className="px-3 py-2.5 font-medium">
                <span className="inline-flex items-center gap-1">
                  <Share2 className="size-3.5" /> แชร์
                </span>
              </th>
              <th className="px-3 py-2.5 font-medium">แปลง %</th>
              <th className="px-3 py-2.5 font-medium" />
            </tr>
          </thead>
          <tbody>
            {ranked.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-muted">
                  ยังไม่มีข้อมูลสถิติ
                </td>
              </tr>
            ) : (
              ranked.map((row, i) => (
                <tr key={row.id} className="border-t border-line">
                  <td className="px-3 py-2.5 text-muted">{i + 1}</td>
                  <td className="px-3 py-2.5">
                    <div className="font-medium text-navy">{row.title}</div>
                    <div className="text-[11px] text-muted">
                      {productLabel(row.productSlug)}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 tabular-nums">
                    {row.views.toLocaleString("th-TH")}
                  </td>
                  <td className="px-3 py-2.5 tabular-nums text-brand-red">
                    {row.quoteClicks}
                  </td>
                  <td className="px-3 py-2.5 tabular-nums">{row.shares}</td>
                  <td className="px-3 py-2.5 tabular-nums">{row.conversionRate}%</td>
                  <td className="px-3 py-2.5 text-right">
                    <Link
                      href={adminHref(basePath, `/cms/portfolio/${row.id}`)}
                      className="text-xs font-medium text-brand-red hover:underline"
                    >
                      แก้ไข
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
