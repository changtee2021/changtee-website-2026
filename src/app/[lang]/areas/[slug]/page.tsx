import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { JsonLd } from "@/components/seo/JsonLd";
import { loadPortfolioItems } from "@/lib/cms/cms-public-load";
import { publishedPortfolio } from "@/lib/cms/public-content";
import { productLabel } from "@/lib/cms/portfolio-demo";
import { langFromParams } from "@/lib/i18n/lang-param";
import { pageMetadata } from "@/lib/seo/meta";
import { siteConfig } from "@/lib/site-config";
import { areaPath, serviceAreaByName, serviceAreas } from "@/lib/service-areas";

export const revalidate = 120;
export const dynamicParams = true;

type Props = { params: Promise<{ lang: string; slug: string }> };

async function loadArea(slug: string) {
  const items = publishedPortfolio(await loadPortfolioItems());
  const name = decodeURIComponent(slug);
  return { items, area: serviceAreaByName(items, name) };
}

export async function generateStaticParams() {
  const items = publishedPortfolio(await loadPortfolioItems());
  return serviceAreas(items).map((area) => ({ slug: area.name }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = await langFromParams(params);
  const { area } = await loadArea(slug);
  if (!area) return { title: "พื้นที่ติดตั้ง" };
  const examples = area.items
    .slice(0, 2)
    .map((item) => item.title)
    .join(", ");
  const description = `ติดตั้งผ้าม่านใน${area.name} โดยช่างตี๋ ${area.items.length} งาน เช่น ${examples} วัดหน้างานฟรี`;
  return pageMetadata({
    title: `ติดตั้งผ้าม่าน ${area.name}`,
    description: description.length <= 160 ? description : `${description.slice(0, 157).trimEnd()}…`,
    path: areaPath(area.name),
    locale,
    translationScope: "cms",
  });
}

export default async function AreaPage({ params }: Props) {
  const { slug } = await params;
  const { area } = await loadArea(slug);
  if (!area) notFound();

  const base = siteConfig.url.replace(/\/$/, "");
  const url = `${base}${areaPath(area.name)}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#page`,
        name: `ติดตั้งผ้าม่าน ${area.name}`,
        url,
        inLanguage: "th",
        about: { "@id": `${base}/#localbusiness` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: area.items.length,
          itemListElement: area.items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.title,
            url: `${base}/portfolio/${item.slug}`,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "หน้าแรก", item: base },
          { "@type": "ListItem", position: 2, name: "พื้นที่ติดตั้ง", item: `${base}/areas` },
          { "@type": "ListItem", position: 3, name: area.name, item: url },
        ],
      },
    ],
  };

  return (
    <div className="bg-shell">
      <JsonLd data={jsonLd} />
      <div className="mx-auto max-w-3xl px-6 py-12 sm:px-10 sm:py-16">
        <p className="text-sm text-muted">
          <Link href="/areas" className="hover:text-navy">
            พื้นที่ติดตั้ง
          </Link>
        </p>
        <h1 className="mt-2 font-display text-3xl font-normal tracking-tight text-navy sm:text-4xl">
          ติดตั้งผ้าม่าน {area.name}
        </h1>
        <p className="mt-4 text-base leading-7 text-ink/80">
          ช่างตี๋มีผลงานติดตั้งที่เผยแพร่ใน{area.name} {area.items.length} งาน
          วัดหน้างานฟรี ผลิตที่โรงงานของเรา แล้วติดตั้งโดยทีมช่างของเราเอง
        </p>
        <ul className="mt-8 space-y-4">
          {area.items.map((item) => (
            <li key={item.id} className="rounded-2xl border border-line bg-white p-5">
              <Link href={`/portfolio/${item.slug}`} className="font-semibold text-navy hover:text-brand-red">
                {item.title}
              </Link>
              <p className="mt-1 text-sm text-muted">
                {[productLabel(item.productSlug), item.place].filter(Boolean).join(" · ")}
              </p>
              {item.summary ? <p className="mt-2 text-sm leading-6 text-ink/80">{item.summary}</p> : null}
            </li>
          ))}
        </ul>
        <p className="mt-8">
          <Link
            href="/quote"
            className="inline-flex min-h-11 items-center rounded-full bg-navy px-5 text-sm font-semibold text-white hover:bg-navy/90"
          >
            ขอใบเสนอราคา
          </Link>
        </p>
      </div>
    </div>
  );
}
