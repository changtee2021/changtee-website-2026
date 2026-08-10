import type { Metadata } from "next";
import { BlogIndex } from "@/components/blog/BlogIndex";
import { pageMetadata } from "@/lib/seo/meta";

export const metadata: Metadata = pageMetadata({
  title: "บทความ",
  description: "บทความความรู้เรื่องผ้าม่าน การดูแล และการเลือกม่านให้เหมาะกับบ้าน",
  path: "/blog",
});

export default function BlogPage() {
  return <BlogIndex />;
}
