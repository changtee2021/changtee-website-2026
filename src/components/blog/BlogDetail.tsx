"use client";

import { notFound } from "next/navigation";
import {
  getBlogBySlug,
  publishedPortfolio,
  relatedBlog,
} from "@/lib/cms/public-content";
import { useBlogPosts, usePortfolioItems } from "@/lib/cms/demo-store";
import { BlogDetailView } from "@/components/blog/BlogDetailView";

export function BlogDetail({ slug }: { slug: string }) {
  const posts = useBlogPosts();
  const works = usePortfolioItems();
  const post = getBlogBySlug(slug, posts);
  if (!post) {
    notFound();
  }

  return (
    <BlogDetailView
      post={post}
      related={relatedBlog(post, posts)}
      relatedWorks={publishedPortfolio(works).slice(0, 2)}
    />
  );
}
