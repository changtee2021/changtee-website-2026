import Image from "next/image";
import Link from "next/link";
import {
  PRODUCT_PILLARS,
  hubItemsForPillar,
  productCatalog,
} from "@/lib/product-catalog";
import { PageHero } from "@/components/ui/page-hero";
import { ProductHeroCovers } from "@/components/products/ProductHeroCovers";

const HERO_COVERS = PRODUCT_PILLARS.flatMap((p) => hubItemsForPillar(p.id));

export function ProductsHub() {
  return (
    <div>
      <PageHero
        image="/images/generated/ct-hero-products.webp"
        imageAlt="ผนังโชว์รูมช่างตี๋ แสดงตัวอย่างม่านม้วน มู่ลี่ไม้ ม่านปรับแสง และผ้าม่าน"
        eyebrow="Product & Service"
        title="Chang Tee products & services"
        description="แบ่งเป็น 7 กลุ่มบริการ ตามการใช้งานจริง — เลือกกลุ่มแล้วดูรุ่นย่อยได้ทันที"
        aside={<ProductHeroCovers items={HERO_COVERS} />}
        align="bottom"
      />

      <div className="mx-auto max-w-5xl px-6 sm:px-10 lg:px-16 py-10 sm:py-12">
        <nav
          aria-label="ข้ามไปกลุ่มสินค้า"
          className="flex gap-2 overflow-x-auto pb-1"
        >
          {PRODUCT_PILLARS.map((p) => (
            <a
              key={p.id}
              href={`#pillar-${p.id}`}
              className="shrink-0 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-navy hover:border-navy/40"
            >
              {p.code} {p.name}
            </a>
          ))}
        </nav>

        <div className="mt-10 space-y-14">
          {PRODUCT_PILLARS.map((pillar) => {
            const items = hubItemsForPillar(pillar.id);
            return (
              <section
                key={pillar.id}
                id={`pillar-${pillar.id}`}
                className="scroll-mt-24"
              >
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-brand-red">
                      {pillar.code} · {pillar.nameEn}
                    </p>
                    <h2 className="mt-1 font-display text-2xl font-semibold text-navy">
                      {pillar.name}
                    </h2>
                    <p className="mt-1 max-w-xl text-sm text-muted">
                      {pillar.summary}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition hover:border-navy/30 hover:shadow-md"
                    >
                      <div className="relative aspect-[4/3] bg-paper">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover transition duration-300 group-hover:scale-[1.03]"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-navy group-hover:text-brand-red">
                          {item.name}
                        </h3>
                        {item.nameEn ? (
                          <p className="mt-0.5 text-xs text-muted">{item.nameEn}</p>
                        ) : null}
                        <div className="mt-2 h-px w-8 bg-brand-red" aria-hidden />
                        <p className="mt-2 line-clamp-2 text-sm text-muted">
                          {item.summary}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Full index */}
        <section className="mt-16 rounded-2xl border border-line bg-paper/50 p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold text-navy">
            รายการหมวดทั้งหมด
          </h2>
          <p className="mt-1 text-sm text-muted">
            ลิงก์ตรงไปหน้ารวมแต่ละหมวด
          </p>
          <ul className="mt-4 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {productCatalog.map((cat) => (
              <li key={cat.slug} className="border-b border-line">
                <Link
                  href={`/products/${cat.slug}`}
                  className="group flex items-center justify-between py-3 text-sm"
                >
                  <span className="min-w-0">
                    <span className="block font-medium text-navy group-hover:text-brand-red">
                      {cat.name}
                    </span>
                    <span className="block text-xs text-muted">{cat.nameEn}</span>
                  </span>
                  <span className="text-xs text-muted">
                    {cat.children.length} รายการ
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/quote"
            className="rounded-full bg-brand-red px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-red-soft"
          >
            ขอใบเสนอราคา
          </Link>
          <Link
            href="/portfolio"
            className="rounded-full border border-navy px-5 py-2.5 text-sm font-semibold text-navy hover:bg-paper"
          >
            ดูผลงานติดตั้ง
          </Link>
        </div>
      </div>
    </div>
  );
}
