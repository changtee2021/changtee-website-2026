"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Search } from "lucide-react";
import {
  CONTENT_STATUS_LABELS,
  type ContentStatus,
} from "@/lib/cms/content-status";
import {
  BLOG_CATEGORY_LABELS,
  type BlogCategory,
} from "@/lib/cms/blog-demo";
import { useBlogPosts } from "@/lib/cms/demo-store";
import { adminBaseFromPathname, adminHref } from "@/lib/admin-nav";
import {
  DemoBadge,
  FilterChip,
  StatPill,
  StatusBadge,
} from "@/components/admin/cms/CmsShared";

type StatusFilter = ContentStatus | "all";

export function BlogCmsBoard() {
  const pathname = usePathname() || "";
  const basePath = adminBaseFromPathname(pathname);
  const posts = useBlogPosts();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<BlogCategory | "all">(
    "all",
  );
  const [q, setQ] = useState("");

  const counts = useMemo(() => {
    const c = { all: posts.length, published: 0, draft: 0, hidden: 0 };
    for (const p of posts) c[p.status] += 1;
    return c;
  }, [posts]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return posts.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      if (!query) return true;
      return (
        p.title.toLowerCase().includes(query) ||
        p.excerpt.toLowerCase().includes(query) ||
        p.tags.some((t) => t.toLowerCase().includes(query))
      );
    });
  }, [posts, statusFilter, categoryFilter, q]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-navy sm:text-2xl">
              บทความ (คอนเทนต์)
            </h2>
            <p className="mt-1 text-sm text-muted">
              ความรู้ ไอเดีย โปร — ไม่ใช่รูปงานติดตั้ง (ผลงานอยู่เมนูแยก)
              <span className="ml-1">
                <DemoBadge />
              </span>
            </p>
          </div>
          <Link
            href={adminHref(basePath, "/cms/blog/new")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-deep"
          >
            <Plus className="size-4" />
            เขียนบทความ
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatPill label="ทั้งหมด" value={counts.all} />
          <StatPill label="เผยแพร่" value={counts.published} tone="green" />
          <StatPill label="ร่าง" value={counts.draft} tone="amber" />
          <StatPill label="ซ่อน" value={counts.hidden} />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <FilterChip
              active={statusFilter === "all"}
              onClick={() => setStatusFilter("all")}
              label={`ทั้งหมด (${counts.all})`}
            />
            {(Object.keys(CONTENT_STATUS_LABELS) as ContentStatus[]).map((s) => (
              <FilterChip
                key={s}
                active={statusFilter === s}
                onClick={() => setStatusFilter(s)}
                label={CONTENT_STATUS_LABELS[s]}
              />
            ))}
          </div>
          <label className="relative block w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ค้นหาหัวข้อ / แท็ก"
              className="w-full rounded-xl border border-line py-2 pl-9 pr-3 text-sm outline-none focus:border-navy/40"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={categoryFilter === "all"}
            onClick={() => setCategoryFilter("all")}
            label="ทุกหมวด"
          />
          {(Object.keys(BLOG_CATEGORY_LABELS) as BlogCategory[]).map((c) => (
            <FilterChip
              key={c}
              active={categoryFilter === c}
              onClick={() => setCategoryFilter(c)}
              label={BLOG_CATEGORY_LABELS[c]}
            />
          ))}
        </div>

        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#f8fafc] text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">บทความ</th>
                <th className="px-4 py-3 font-medium">หมวด</th>
                <th className="px-4 py-3 font-medium">สถานะ</th>
                <th className="px-4 py-3 font-medium">วันที่</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted">
                    ไม่พบบทความตามตัวกรอง —{" "}
                    <Link
                      href={adminHref(basePath, "/cms/blog/new")}
                      className="font-medium text-brand-red hover:underline"
                    >
                      เขียนบทความ
                    </Link>
                  </td>
                </tr>
              ) : (
                filtered.map((post) => (
                  <tr key={post.id} className="border-t border-line">
                    <td className="px-4 py-3">
                      <Link
                        href={adminHref(basePath, `/cms/blog/${post.id}`)}
                        className="flex items-center gap-3 hover:opacity-90"
                      >
                        <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-paper">
                          <Image
                            src={post.cover}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-navy line-clamp-1">
                            {post.title}
                          </div>
                          <div className="text-xs text-muted line-clamp-1">
                            {post.excerpt}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="rounded-full bg-paper px-2 py-0.5 text-xs text-navy">
                        {BLOG_CATEGORY_LABELS[post.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={post.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-muted">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString("th-TH")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={adminHref(basePath, `/cms/blog/${post.id}`)}
                        className="text-sm font-medium text-brand-red hover:underline"
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
    </div>
  );
}
