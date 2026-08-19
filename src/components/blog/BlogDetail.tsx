"use client";

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
    return (
      <p className="px-4 py-16 text-center text-sm text-muted">
        ไม่พบบทความนี้ หรือยังไม่ได้เผยแพร่ขึ้นเซิร์ฟเวอร์
      </p>
    );
  }

  return (
    <BlogDetailView
      post={post}
      related={relatedBlog(post, posts, 3)}
      relatedWorks={portfolioForBlog(post, works, 3)}
    />
  );
}
