import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { readingLinks } from "@/lib/seo/focus-guides";

/** Contextual internal links from a product page into the matching guides. */
export function ReadingLinks({
  categorySlug,
  productSlug,
}: {
  categorySlug: string;
  productSlug?: string;
}) {
  const links = readingLinks(categorySlug, productSlug);
  if (links.length === 0) return null;

  return (
    <section className="mt-12" aria-labelledby="reading-links-heading">
      <h2
        id="reading-links-heading"
        className="font-display text-xl font-semibold text-navy"
      >
        อ่านก่อนตัดสินใจ
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        บทความจากหน้างานจริง ใช้อ่านคู่กับสินค้านี้ก่อนนัดวัด
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {links.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex min-h-11 items-center rounded-xl border border-line bg-white px-4 py-3 text-sm font-medium text-navy transition hover:border-navy/30"
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
