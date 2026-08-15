import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LearnSheetView } from "@/components/learn/LearnSheetView";
import { LEARN_SHEETS, learnSheetBySlug } from "@/lib/learn";
import { pageMetadata } from "@/lib/seo/meta";

export function generateStaticParams() {
  return LEARN_SHEETS.map((sheet) => ({ slug: sheet.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sheet = learnSheetBySlug(slug);
  if (!sheet) return {};
  return pageMetadata({
    title: sheet.title,
    description: sheet.summary,
    path: `/learn/${sheet.slug}`,
    image: sheet.cover,
  });
}

export default async function LearnSheetPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sheet = learnSheetBySlug(slug);
  if (!sheet) notFound();
  return <LearnSheetView sheet={sheet} />;
}
