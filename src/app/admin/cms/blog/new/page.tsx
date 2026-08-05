import type { Metadata } from "next";
import { BlogEditor } from "@/components/admin/BlogEditor";

export const metadata: Metadata = {
  title: "เขียนบทความ",
  robots: { index: false, follow: false },
};

export default function AdminBlogNewPage() {
  return <BlogEditor />;
}
