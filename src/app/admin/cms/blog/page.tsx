import type { Metadata } from "next";
import { BlogCmsBoard } from "@/components/admin/BlogCmsBoard";

export const metadata: Metadata = {
  title: "บทความ",
  robots: { index: false, follow: false },
};

export default function AdminBlogCmsPage() {
  return <BlogCmsBoard />;
}
