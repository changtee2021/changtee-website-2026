"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Plus, Search } from "lucide-react";
import {
  CONTENT_STATUS_LABELS,
  slugifyTh,
  type ContentStatus,
} from "@/lib/cms/content-status";
import {
  BLOG_CATEGORY_LABELS,
  DEMO_BLOG,
  emptyBlogPost,
  type BlogCategory,
  type BlogPost,
} from "@/lib/cms/blog-demo";
import {
  CmsModal,
  DemoBadge,
  Field,
  FilterChip,
  SelectField,
  StatPill,
  StatusBadge,
  TextArea,
} from "@/components/admin/cms/CmsShared";

type StatusFilter = ContentStatus | "all";

export function BlogCmsBoard() {
  const [posts, setPosts] = useState<BlogPost[]>(DEMO_BLOG);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<BlogCategory | "all">(
    "all",
  );
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

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

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }

  function upsert(next: BlogPost) {
    setPosts((prev) => {
      const idx = prev.findIndex((p) => p.id === next.id);
      if (idx === -1) return [next, ...prev];
      const copy = [...prev];
      copy[idx] = next;
      return copy;
    });
    setEditing(null);
    setCreating(false);
    flash(creating ? "เพิ่มบทความแล้ว (demo)" : "บันทึกบทความแล้ว (demo)");
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-navy sm:text-2xl">
              บทความ
            </h2>
            <p className="mt-1 text-sm text-muted">
              เขียนสั้น อ่านง่าย ช่วย SEO และพาลูกค้าไปประเมินราคา
              <span className="ml-1">
                <DemoBadge />
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setCreating(true);
              setEditing(emptyBlogPost());
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-deep"
          >
            <Plus className="size-4" />
            เขียนบทความ
          </button>
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
                    ไม่พบบทความตามตัวกรอง
                  </td>
                </tr>
              ) : (
                filtered.map((post) => (
                  <tr key={post.id} className="border-t border-line">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
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
                      </div>
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
                      <button
                        type="button"
                        className="text-sm font-medium text-brand-red hover:underline"
                        onClick={() => {
                          setCreating(false);
                          setEditing(post);
                        }}
                      >
                        แก้ไข
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {editing ? (
        <BlogFormModal
          post={editing}
          isCreate={creating}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSave={upsert}
        />
      ) : null}

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-navy px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function BlogFormModal({
  post,
  isCreate,
  onClose,
  onSave,
}: {
  post: BlogPost;
  isCreate: boolean;
  onClose: () => void;
  onSave: (post: BlogPost) => void;
}) {
  const [form, setForm] = useState(post);
  const [tagText, setTagText] = useState(post.tags.join(", "));

  function set<K extends keyof BlogPost>(key: K, value: BlogPost[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.excerpt.trim()) {
      alert("กรอกหัวข้อและบทคัดย่อให้ครบ");
      return;
    }
    const slug = form.slug.trim() || slugifyTh(form.title);
    const publishedAt =
      form.status === "published"
        ? form.publishedAt || new Date().toISOString()
        : form.publishedAt;
    onSave({
      ...form,
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      body: form.body.trim(),
      slug,
      tags: tagText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      publishedAt,
      updatedAt: new Date().toISOString(),
    });
  }

  return (
    <CmsModal
      title={isCreate ? "เขียนบทความ" : "แก้ไขบทความ"}
      subtitle="เขียนสั้น ชัด มี CTA ท้ายบทก็พอ"
      onClose={onClose}
      wide
    >
      <form onSubmit={submit} className="space-y-4 pb-2">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="หัวข้อ *"
            value={form.title}
            onChange={(v) => {
              set("title", v);
              if (isCreate || !form.slug) set("slug", slugifyTh(v));
            }}
            className="sm:col-span-2"
          />
          <Field label="Slug" value={form.slug} onChange={(v) => set("slug", v)} />
          <SelectField
            label="หมวด"
            value={form.category}
            onChange={(v) => set("category", v as BlogCategory)}
            options={(Object.keys(BLOG_CATEGORY_LABELS) as BlogCategory[]).map(
              (k) => ({ value: k, label: BLOG_CATEGORY_LABELS[k] }),
            )}
          />
          <SelectField
            label="สถานะ"
            value={form.status}
            onChange={(v) => set("status", v as ContentStatus)}
            options={(Object.keys(CONTENT_STATUS_LABELS) as ContentStatus[]).map(
              (k) => ({ value: k, label: CONTENT_STATUS_LABELS[k] }),
            )}
          />
          <Field
            label="ผู้เขียน"
            value={form.author}
            onChange={(v) => set("author", v)}
          />
          <Field
            label="รูปปก (path)"
            value={form.cover}
            onChange={(v) => set("cover", v)}
            className="sm:col-span-2"
          />
          <TextArea
            label="บทคัดย่อ *"
            value={form.excerpt}
            onChange={(v) => set("excerpt", v)}
            rows={2}
            className="sm:col-span-2"
            hint="1–2 บรรทัด สำหรับการ์ดและ SEO"
          />
          <TextArea
            label="เนื้อหา"
            value={form.body}
            onChange={(v) => set("body", v)}
            rows={8}
            className="sm:col-span-2"
            hint="ขึ้นบรรทัดใหม่ได้ · รอบถัดไปจะมี editor เต็ม"
          />
          <Field
            label="แท็ก (คั่นด้วยจุลภาค)"
            value={tagText}
            onChange={setTagText}
            className="sm:col-span-2"
          />
          <Field
            label="SEO title (ว่าง = ใช้หัวข้อ)"
            value={form.seoTitle}
            onChange={(v) => set("seoTitle", v)}
          />
          <Field
            label="SEO description"
            value={form.seoDescription}
            onChange={(v) => set("seoDescription", v)}
          />
        </div>

        <div className="rounded-xl border border-dashed border-line bg-paper/50 p-3 text-xs text-muted">
          แนะนำท้ายบท: เชิญประเมินราคาฟรี หรือคุย LINE @chang-tee
        </div>

        <div className="flex justify-end gap-2 border-t border-line pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-line px-4 py-2 text-sm text-navy hover:bg-paper"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="rounded-xl bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-deep"
          >
            {isCreate ? "บันทึกบทความ" : "บันทึก"}
          </button>
        </div>
      </form>
    </CmsModal>
  );
}
