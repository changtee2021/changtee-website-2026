import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogDetail } from "@/components/blog/BlogDetail";
import { JsonLd } from "@/components/seo/JsonLd";
import { getArticleJsonLd } from "@/lib/article-jsonld";
import {
  loadBlogPosts,
  loadPublishedBlogSlugs,
} from "@/lib/cms/cms-public-load";
import { getBlogBySlug } from "@/lib/cms/public-content";
import { pageMetadata } from "@/lib/seo/meta";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return loadPublishedBlogSlugs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
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
  const { slug } = await params;
  if (!slug) notFound();
  const posts = await loadBlogPosts();
  const post = getBlogBySlug(slug, posts);

  return (
    <>
      {post ? <JsonLd data={getArticleJsonLd(post)} /> : null}
      <BlogDetail slug={slug} />
    </>
  );
}
