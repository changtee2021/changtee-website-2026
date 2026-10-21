import type { Metadata } from "next";
import { BlogIndex } from "@/components/blog/BlogIndex";
import { pageMetadata } from "@/lib/seo/meta";
import { langFromParams } from "@/lib/i18n/lang-param";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const locale = await langFromParams(params);
  return pageMetadata({
    title: "บทความ",
    description: "บทความความรู้เรื่องผ้าม่าน การดูแล และการเลือกม่านให้เหมาะกับบ้าน",
    path: "/blog",
    locale,
    translationScope: "cms",
  });
}

export default function BlogPage() {
  return <BlogIndex />;
}
