"use client";

import { notFound } from "next/navigation";
import {
  getBlogBySlug,
  portfolioForBlog,
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
      related={relatedBlog(post, posts, 3)}
      relatedWorks={portfolioForBlog(post, works, 3)}
    />
  );
}
