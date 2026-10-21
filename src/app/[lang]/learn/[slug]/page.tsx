import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LearnSheetView } from "@/components/learn/LearnSheetView";
import { LEARN_ENABLED, LEARN_SHEETS, learnSheetBySlug } from "@/lib/learn";
import { pageMetadata } from "@/lib/seo/meta";
import { langFromParams } from "@/lib/i18n/lang-param";

export function generateStaticParams() {
  if (!LEARN_ENABLED) return [];
  return LEARN_SHEETS.map((sheet) => ({ slug: sheet.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const locale = await langFromParams(params);
  const { slug } = await params;
  const sheet = LEARN_ENABLED ? learnSheetBySlug(slug) : undefined;
  if (!sheet) return {};
  return pageMetadata({
    title: sheet.title,
    description: sheet.summary,
    path: `/learn/${sheet.slug}`,
    image: sheet.cover,
    locale,
    translationScope: "cms",
  });
}

export default async function LearnSheetPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  await langFromParams(params);
  const { slug } = await params;
  const sheet = LEARN_ENABLED ? learnSheetBySlug(slug) : undefined;
  if (!sheet) notFound();
  return <LearnSheetView sheet={sheet} />;
}
