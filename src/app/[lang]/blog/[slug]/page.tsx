import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogDetailView } from "@/components/blog/BlogDetailView";
import { JsonLd } from "@/components/seo/JsonLd";
import { ThaiTextScope } from "@/components/i18n/ThaiTextScope";
import { getArticleJsonLd } from "@/lib/article-jsonld";
import { normalizeContentSlug } from "@/lib/cms/content-status";
import {
  loadBlogPosts,
  loadPortfolioItems,
  loadPublishedBlogSlugs,
} from "@/lib/cms/cms-public-load";
import {
  getBlogBySlug,
  portfolioForBlog,
  relatedBlog,
} from "@/lib/cms/public-content";
import { langFromParams } from "@/lib/i18n/lang-param";
import type { Locale } from "@/lib/i18n/locale";
import { pageMetadata } from "@/lib/seo/meta";
import {
  blogIndexableLocales,
  sectionThaiText,
} from "@/lib/i18n/content/thai-text/sections.server";
import type { BlogPost } from "@/lib/cms/blog-demo";

function blogCopy(post: BlogPost, locale: Locale) {
  const pageText = sectionThaiText("blog", locale, post.slug);
  const thaiTitle = post.seoTitle || post.title;
  const thaiDescription = post.seoDescription || post.excerpt;
  return {
    title:
      pageText?.[thaiTitle] ??
      pageText?.[`${thaiTitle} | ช่างตี๋ ผ้าม่าน`]?.replace(/\s*\|[^|]*$/, "") ??
      thaiTitle,
    description: pageText?.[thaiDescription] ?? thaiDescription,
  };
}

export const revalidate = 120;
export const dynamicParams = true;

type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateStaticParams() {
  return loadPublishedBlogSlugs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = normalizeContentSlug((await params).slug);
  const locale = await langFromParams(params);
  const posts = await loadBlogPosts();
  const post = getBlogBySlug(slug, posts);
  if (!post) return { title: "บทความ" };
  const { title, description } = blogCopy(post, locale);
  const base = pageMetadata({
    title,
    description,
    path: `/blog/${post.slug}`,
    image: post.cover,
    type: "article",
    locale,
    indexable: blogIndexableLocales(post.slug),
  });
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt || post.publishedAt || undefined,
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const slug = normalizeContentSlug((await params).slug);
  if (!slug) notFound();
  const locale = await langFromParams(params);
  const posts = await loadBlogPosts();
  const post = getBlogBySlug(slug, posts);
  if (!post) notFound();
  const works = await loadPortfolioItems();

  return (
    <>
      <JsonLd
        data={getArticleJsonLd(post, locale, {
          headline: blogCopy(post, locale).title,
          description: blogCopy(post, locale).description,
        })}
      />
      <ThaiTextScope locale={locale} pack={sectionThaiText("blog", locale, post.slug)}>
        <BlogDetailView
          post={post}
          related={relatedBlog(post, posts, 3)}
          relatedWorks={portfolioForBlog(post, works, 3)}
        />
      </ThaiTextScope>
    </>
  );
}
