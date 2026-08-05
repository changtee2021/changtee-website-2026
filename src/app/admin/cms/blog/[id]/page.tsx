import type { Metadata } from "next";
import { BlogEditor } from "@/components/admin/BlogEditor";

export const metadata: Metadata = {
  title: "แก้ไขบทความ",
  robots: { index: false, follow: false },
};

export default async function AdminBlogEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BlogEditor id={id} />;
}
