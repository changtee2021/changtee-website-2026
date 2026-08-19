"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  CONTENT_STATUS_LABELS,
  slugifyTh,
  type ContentStatus,
} from "@/lib/cms/content-status";
import {
  BLOG_CATEGORY_LABELS,
  emptyBlogPost,
  type BlogCategory,
  type BlogPost,
} from "@/lib/cms/blog-demo";
import {
  upsertBlogPost,
  useBlogPosts,
  usePortfolioItems,
} from "@/lib/cms/demo-store";
import {
  publishedPortfolio,
  relatedBlog,
} from "@/lib/cms/public-content";
import { adminBaseFromPathname, adminHref } from "@/lib/admin-nav";
import { CmsEditorShell } from "@/components/admin/cms/CmsEditorShell";
import { CmsSitePreview } from "@/components/admin/cms/CmsSitePreview";
import {
  Field,
  SelectField,
  TextArea,
} from "@/components/admin/cms/CmsShared";
import { BlogDetailView } from "@/components/blog/BlogDetailView";
import { Eye } from "lucide-react";

export function BlogEditor({ id }: { id?: string }) {
  const isCreate = !id || id === "new";
  const posts = useBlogPosts();
  const newSeed = useMemo(() => emptyBlogPost(), []);
  const existing = !isCreate ? posts.find((p) => p.id === id) : undefined;
  const initial = existing ?? (isCreate ? newSeed : { ...newSeed, id: id! });

  return (
    <BlogEditorForm
      key={
        existing
          ? `${existing.id}-${existing.updatedAt}`
          : isCreate
            ? newSeed.id
            : `pending-${id}`
      }
      initial={initial}
      isCreate={isCreate}
    />
  );
}

function BlogEditorForm({
  initial,
  isCreate,
}: {
  initial: BlogPost;
  isCreate: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const basePath = adminBaseFromPathname(pathname);
  const allPosts = useBlogPosts();
  const works = usePortfolioItems();
  const [form, setForm] = useState(initial);
  const [tagText, setTagText] = useState(initial.tags.join(", "));
  const [seoOpen, setSeoOpen] = useState(
    Boolean(initial.seoTitle || initial.seoDescription),
  );
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  function set<K extends keyof BlogPost>(key: K, value: BlogPost[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function buildDraft(): BlogPost {
    return {
      ...form,
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      body: form.body.trim(),
      slug: form.slug.trim() || slugifyTh(form.title) || "preview",
      tags: tagText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.excerpt.trim()) {
      alert("กรอกหัวข้อและคำโปรยให้ครบ");
      return;
    }
    setSaving(true);
    const slug = form.slug.trim() || slugifyTh(form.title);
    const publishedAt =
      form.status === "published"
        ? form.publishedAt || new Date().toISOString()
        : form.publishedAt;
    try {
      const result = await upsertBlogPost({
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
      if (!result.ok) {
        alert(
          result.error ||
            "บันทึกขึ้นเซิร์ฟเวอร์ไม่สำเร็จ — บทความยังอยู่บนเครื่องนี้ แต่ยังไม่ขึ้นเว็บออนไลน์",
        );
        return;
      }
      router.push(adminHref(basePath, "/cms/blog"));
    } finally {
      setSaving(false);
    }
  }

  const listHref = adminHref(basePath, "/cms/blog");
  const previewHref =
    form.slug && form.status === "published" ? `/blog/${form.slug}` : undefined;
  const draft = buildDraft();

  return (
    <>
    <form onSubmit={submit}>
      <CmsEditorShell
        backHref={listHref}
        backLabel="กลับรายการบทความ"
        title={isCreate ? "เขียนบทความ" : "แก้ไขบทความ"}
        subtitle="คอนเทนต์ให้ความรู้ — หัวข้อกับเนื้อหานำ รูปปกเป็นตัวประกอบ"
        onPreview={() => setPreviewOpen(true)}
        previewHref={previewHref}
        sidebar={
          <>
            <SelectField
              label="สถานะ"
              value={form.status}
              onChange={(v) => set("status", v as ContentStatus)}
              options={(Object.keys(CONTENT_STATUS_LABELS) as ContentStatus[]).map(
                (k) => ({ value: k, label: CONTENT_STATUS_LABELS[k] }),
              )}
            />
            <SelectField
              label="หมวดคอนเทนต์ *"
              value={form.category}
              onChange={(v) => set("category", v as BlogCategory)}
              options={(Object.keys(BLOG_CATEGORY_LABELS) as BlogCategory[]).map(
                (k) => ({ value: k, label: BLOG_CATEGORY_LABELS[k] }),
              )}
            />
            <Field
              label="ผู้เขียน"
              value={form.author}
              onChange={(v) => set("author", v)}
            />
            <Field
              label="Slug (URL)"
              value={form.slug}
              onChange={(v) => set("slug", v)}
              hint={`/blog/${form.slug || "..."}`}
            />
            <Field
              label="แท็กหัวข้อ (คั่นด้วยจุลภาค)"
              value={tagText}
              onChange={setTagText}
              placeholder="เลือกม่าน, ประหยัดไฟ"
            />

            <div className="border-t border-line pt-3">
              <button
                type="button"
                onClick={() => setSeoOpen((o) => !o)}
                className="text-xs font-medium text-navy hover:underline"
              >
                {seoOpen ? "ซ่อนรายละเอียด SEO" : "รายละเอียด SEO"}
              </button>
              {seoOpen ? (
                <div className="mt-3 space-y-3">
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
              ) : null}
            </div>

            <div className="flex flex-col gap-2 border-t border-line pt-4">
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-navy/20 bg-paper px-4 py-2.5 text-sm font-medium text-navy hover:bg-white"
              >
                <Eye className="size-4" />
                ดูพรีวิว
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-navy px-4 py-2.5 text-sm font-medium text-white hover:bg-navy-deep disabled:opacity-60"
              >
                {isCreate ? "บันทึกบทความ" : "บันทึก"}
              </button>
              <button
                type="button"
                onClick={() => router.push(listHref)}
                className="rounded-xl border border-line px-4 py-2 text-sm text-navy hover:bg-paper"
              >
                ยกเลิก
              </button>
            </div>
          </>
        }
      >
        <div className="space-y-4">
          <Field
            label="หัวข้อ *"
            value={form.title}
            onChange={(v) => {
              set("title", v);
              if (isCreate || !form.slug) set("slug", slugifyTh(v));
            }}
            placeholder="เช่น การดูแลผ้าม่านอย่างถูกวิธี"
          />
          <TextArea
            label="คำโปรย (excerpt) *"
            value={form.excerpt}
            onChange={(v) => set("excerpt", v)}
            rows={2}
            hint="1–2 บรรทัด สำหรับการ์ดและ SEO"
          />

          <div className="overflow-hidden rounded-xl border border-line">
            {form.cover ? (
              <div className="relative aspect-[16/10] bg-paper">
                <Image
                  src={form.cover}
                  alt="cover"
                  fill
                  className="object-cover"
                  sizes="800px"
                />
              </div>
            ) : null}
          </div>
          <Field
            label="รูปปก (path หรือ URL)"
            value={form.cover}
            onChange={(v) => set("cover", v)}
            hint="แนวนอนประมาณ 16:10"
          />

          <TextArea
            label="เนื้อหาบทความ"
            value={form.body}
            onChange={(v) => set("body", v)}
            rows={14}
            hint="ขึ้นบรรทัดใหม่ได้ · คั่นย่อหน้าด้วยบรรทัดว่าง · รอบถัดไปมี editor เต็ม"
          />

          <div className="rounded-xl border border-dashed border-line bg-paper/50 p-3 text-xs text-muted">
            แนะนำท้ายบท: เชิญขอใบเสนอราคา หรือคุย LINE @chang-tee —
            และลิงก์ไปผลงานที่เกี่ยวข้อง
          </div>
        </div>
      </CmsEditorShell>
    </form>

    <CmsSitePreview
      open={previewOpen}
      onClose={() => setPreviewOpen(false)}
      title={draft.title || "บทความ"}
      status={draft.status}
    >
      <BlogDetailView
        post={draft}
        related={relatedBlog(draft, allPosts)}
        relatedWorks={publishedPortfolio(works).slice(0, 2)}
        preview
      />
    </CmsSitePreview>
    </>
  );
}
