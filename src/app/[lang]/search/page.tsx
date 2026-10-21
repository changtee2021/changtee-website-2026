import type { Metadata } from "next";
import { Suspense } from "react";
import { pageMetadata } from "@/lib/seo/meta";
import { langFromParams } from "@/lib/i18n/lang-param";
import { SearchResults } from "@/components/search/SearchResults";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const locale = await langFromParams(params);
  return pageMetadata({
    title: "ค้นหา",
    description: "ค้นหาสินค้า ผลงาน และบทความของช่างตี๋ ผ้าม่าน",
    path: "/search",
    robots: { index: false, follow: true },
    locale,
  });
}

export default function SearchPage() {
  return (
    <div className="mx-auto w-full max-w-site px-6 py-10 sm:px-10 lg:px-16">
      <h1 className="font-display text-2xl font-semibold text-navy">ค้นหา</h1>
      <Suspense fallback={<p className="mt-6 text-sm text-muted">กำลังค้นหา…</p>}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
