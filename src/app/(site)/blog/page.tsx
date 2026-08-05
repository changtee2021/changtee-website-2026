import type { Metadata } from "next";
import { BlogIndex } from "@/components/blog/BlogIndex";

export const metadata: Metadata = {
  title: "บทความ",
  description: "บทความความรู้เรื่องผ้าม่าน การดูแล และการเลือกม่านให้เหมาะกับบ้าน",
};

export default function BlogPage() {
  return <BlogIndex />;
}
