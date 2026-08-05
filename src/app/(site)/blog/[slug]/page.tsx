import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogDetail } from "@/components/blog/BlogDetail";
import { DEMO_BLOG } from "@/lib/cms/blog-demo";
import { getBlogBySlug, publishedBlog } from "@/lib/cms/public-content";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return publishedBlog(DEMO_BLOG).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogBySlug(slug, DEMO_BLOG);
  if (!post) return { title: "บทความ" };
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    openGraph: { images: [post.cover] },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  if (!slug) notFound();
  return <BlogDetail slug={slug} />;
}
