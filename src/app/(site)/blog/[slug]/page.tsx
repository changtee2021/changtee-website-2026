import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogDetailView } from "@/components/blog/BlogDetailView";
import { JsonLd } from "@/components/seo/JsonLd";
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
import { pageMetadata } from "@/lib/seo/meta";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return loadPublishedBlogSlugs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = normalizeContentSlug((await params).slug);
  const posts = await loadBlogPosts();
  const post = getBlogBySlug(slug, posts);
  if (!post) return { title: "บทความ" };
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const base = pageMetadata({
    title,
    description,
    path: `/blog/${post.slug}`,
    image: post.cover,
    type: "article",
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
  const posts = await loadBlogPosts();
  const post = getBlogBySlug(slug, posts);
  if (!post) notFound();
  const works = await loadPortfolioItems();

  return (
    <>
      <JsonLd data={getArticleJsonLd(post)} />
      <BlogDetailView
        post={post}
        related={relatedBlog(post, posts, 3)}
        relatedWorks={portfolioForBlog(post, works, 3)}
      />
    </>
  );
}
