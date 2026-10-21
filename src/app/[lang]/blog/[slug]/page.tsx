import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogDetailView } from "@/components/blog/BlogDetailView";
import { JsonLd } from "@/components/seo/JsonLd";
import { ThaiTextScope } from "@/components/i18n/ThaiTextScope";
import { sectionThaiText } from "@/lib/i18n/content/thai-text/sections.server";
import { getArticleJsonLd } from "@/lib/article-jsonld";
import { normalizeContentSlug } from "@/lib/cms/content-status";
import {
  loadBlogPosts,
  loadPortfolioItems,
  loadPublishedBlogSlugs,
} from "@/lib/cms/cms-public-load";
import {
  getBlogBySlug,
  portfolioForBlog,
  relatedBlog,
} from "@/lib/cms/public-content";
import { langFromParams } from "@/lib/i18n/lang-param";
import { pageMetadata } from "@/lib/seo/meta";

export const revalidate = 120;
export const dynamicParams = true;

type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateStaticParams() {
  return loadPublishedBlogSlugs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = normalizeContentSlug((await params).slug);
  const locale = await langFromParams(params);
  const posts = await loadBlogPosts();
  const post = getBlogBySlug(slug, posts);
  if (!post) return { title: "บทความ" };
  const pageText = sectionThaiText("blog", locale, post.slug);
  const thaiTitle = post.seoTitle || post.title;
  const thaiDescription = post.seoDescription || post.excerpt;
  const title =
    pageText?.[thaiTitle] ??
    pageText?.[`${thaiTitle} | ช่างตี๋ ผ้าม่าน`]?.replace(/\s*\|[^|]*$/, "") ??
    thaiTitle;
  const description = pageText?.[thaiDescription] ?? thaiDescription;
  const base = pageMetadata({
    title,
    description,
    path: `/blog/${post.slug}`,
    image: post.cover,
    type: "article",
    locale,
    translationScope: "cms",
  });
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt || post.publishedAt || undefined,
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const slug = normalizeContentSlug((await params).slug);
  if (!slug) notFound();
  const locale = await langFromParams(params);
  const posts = await loadBlogPosts();
  const post = getBlogBySlug(slug, posts);
  if (!post) notFound();
  const works = await loadPortfolioItems();

  return (
    <>
      <JsonLd data={getArticleJsonLd(post)} />
      <ThaiTextScope locale={locale} pack={sectionThaiText("blog", locale, post.slug)}>
        <BlogDetailView
          post={post}
          related={relatedBlog(post, posts, 3)}
          relatedWorks={portfolioForBlog(post, works, 3)}
        />
      </ThaiTextScope>
    </>
  );
}
