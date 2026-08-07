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

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return loadPublishedBlogSlugs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const posts = await loadBlogPosts();
  const post = getBlogBySlug(slug, posts);
  if (!post) return { title: "บทความ" };
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      images: [post.cover],
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
