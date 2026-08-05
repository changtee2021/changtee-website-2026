"use client";

import Image from "next/image";
import { EditableSpot } from "@/components/admin/cms/EditableSpot";
import { LockedSpot } from "@/components/admin/cms/LockedSpot";
import { useSectionDraft } from "@/components/admin/cms/section-draft-context";
import type { PortfolioItem } from "@/lib/cms/portfolio-demo";
import type { ProductCategory, ProductChild, ProductPillar } from "@/lib/product-catalog";
import { childImage } from "@/lib/product-catalog";
import type { ProductContent } from "@/lib/product-content";
import {
  getCompareTable,
  getInstallVideos,
  getPrepGuide,
  reviewsForCategory,
} from "@/lib/product-decision-aids";
import type { ProductPresentation } from "@/lib/product-presentation";
import { siteConfig } from "@/lib/site-config";

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
      {children}
    </p>
  );
}

export function ProductSectionsVisualPreview({
  category,
  product,
  pillar,
  content,
  presentation,
  related,
  portfolioWorks,
}: {
  category: ProductCategory;
  product: ProductChild;
  pillar?: ProductPillar;
  content: ProductContent;
  presentation: ProductPresentation;
  related: ProductChild[];
  portfolioWorks: PortfolioItem[];
}) {
  const { getValues } = useSectionDraft();
  const benefits = getValues("benefits");
  const style = getValues("style");
  const cta = getValues("cta");
  const { assets } = presentation;

  const cards = presentation.benefitCards.slice(0, 3).map((b, i) => {
    const n = i + 1;
    return {
      label: benefits[`card${n}Label`]?.trim() || b.label,
      detail: benefits[`card${n}Detail`]?.trim() || b.detail,
      image: benefits[`card${n}Image`]?.trim() || b.image,
      labelKey: `card${n}Label`,
      detailKey: `card${n}Detail`,
      imageKey: `card${n}Image`,
    };
  });

  const thumbs = [
    { src: assets.texture, alt: "พื้นผิว", caption: "พื้นผิว" },
    { src: assets.lifestyle, alt: "บรรยากาศ", caption: "บรรยากาศห้อง" },
    { src: assets.context, alt: "บริบทห้อง", caption: "บริบทห้อง" },
  ].filter((t) => t.src);

  const reviews = reviewsForCategory(category.slug, category.name, 2);
  const installVideos = getInstallVideos(category.slug).slice(0, 2);
  const prepGuide = getPrepGuide(category.slug);
  const compareTable = getCompareTable(category.slug);

  return (
    <article className="bg-white text-ink">
      <div className="px-3 py-6 sm:px-4 sm:py-8">
        {/* Hero / product sheet */}
        <LockedSpot reason="ข้อมูลสินค้าจากระบบ">
          <nav className="text-xs text-muted">
            <ol className="flex flex-wrap items-center gap-x-1.5">
              <li>สินค้า/บริการ</li>
              {pillar ? (
                <>
                  <li>/</li>
                  <li>{pillar.name}</li>
                </>
              ) : null}
              <li>/</li>
              <li>{category.name}</li>
              <li>/</li>
              <li className="font-medium text-navy">{product.name}</li>
            </ol>
          </nav>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
            <div className="space-y-3">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-paper">
                <Image
                  src={assets.hero}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="480px"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {thumbs.map((t) => (
                  <div key={t.src}>
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-paper sm:aspect-[4/3]">
                      <Image
                        src={t.src}
                        alt={t.alt}
                        fill
                        className="object-cover"
                        sizes="120px"
                      />
                    </div>
                    <p className="mt-1 text-center text-[10px] text-muted">
                      {t.caption}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <SectionLabel>Product sheet</SectionLabel>
              <h1 className="mt-2 font-display text-2xl font-semibold text-navy sm:text-3xl">
                {product.name}
              </h1>
              {product.nameEn ? (
                <p className="mt-1 text-sm text-muted">{product.nameEn}</p>
              ) : null}
              <p className="mt-3 text-sm leading-relaxed text-ink/90">
                {content.tagline}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {content.suitableFor.slice(0, 4).map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-line bg-paper/80 px-2.5 py-0.5 text-[11px] font-medium text-navy"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <ul className="mt-5 space-y-0 border-y border-line">
                {content.highlights.slice(0, 4).map((h) => (
                  <li
                    key={h}
                    className="flex items-start gap-2 border-b border-line py-2.5 text-sm text-navy last:border-0"
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-red" />
                    {h}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-brand-red px-5 py-2.5 text-xs font-semibold text-white">
                  ขอใบเสนอราคา
                </span>
                <span className="rounded-full border border-navy/20 bg-paper px-5 py-2.5 text-xs font-semibold text-navy">
                  ดูผลงาน{category.name}
                </span>
              </div>
            </div>
          </div>
        </LockedSpot>

        {/* Benefits — editable */}
        <section className="mt-14">
          <EditableSpot sectionId="benefits" fieldKey="eyebrow">
            <SectionLabel>{benefits.eyebrow || "Key benefits"}</SectionLabel>
          </EditableSpot>
          <EditableSpot sectionId="benefits" fieldKey="heading" className="mt-2">
            <h2 className="font-display text-2xl font-semibold text-navy sm:text-3xl">
              {benefits.heading || "จุดเด่นที่สัมผัสได้"}
            </h2>
          </EditableSpot>
          <div className="mt-6 grid gap-3 sm:grid-cols-3 sm:gap-4">
            {cards.map((c) => (
              <div key={c.imageKey} className="space-y-2">
                <EditableSpot sectionId="benefits" fieldKey={c.imageKey} label="รูป">
                  <div className="relative aspect-[8/5] overflow-hidden rounded-2xl bg-paper">
                    {c.image ? (
                      <Image
                        src={c.image}
                        alt={c.label}
                        fill
                        className="object-cover"
                        sizes="200px"
                      />
                    ) : null}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/80 to-transparent p-3">
                      <p className="text-sm font-semibold text-white">{c.label}</p>
                      <p className="mt-0.5 line-clamp-2 text-[11px] text-white/90">
                        {c.detail}
                      </p>
                    </div>
                  </div>
                </EditableSpot>
                <EditableSpot sectionId="benefits" fieldKey={c.labelKey} label="หัวข้อ">
                  <p className="text-sm font-semibold text-navy">{c.label}</p>
                </EditableSpot>
                <EditableSpot
                  sectionId="benefits"
                  fieldKey={c.detailKey}
                  label="รายละเอียด"
                >
                  <p className="text-xs text-muted">{c.detail}</p>
                </EditableSpot>
              </div>
            ))}
          </div>
        </section>

        {/* Spec sheet condensed */}
        <LockedSpot reason="สเปกจากระบบสินค้า" className="mt-14">
          <section className="rounded-2xl border border-line px-5 py-6 sm:px-8">
            <SectionLabel>Product sheet</SectionLabel>
            <h2 className="mt-1 font-display text-xl font-semibold text-navy">
              {product.name}
            </h2>
            <dl className="mt-4">
              {presentation.specs.slice(0, 5).map((s) => (
                <div
                  key={s.label}
                  className="grid grid-cols-[7rem_1fr] gap-3 border-b border-line py-2.5 text-sm"
                >
                  <dt className="font-semibold text-navy">{s.label}</dt>
                  <dd className="text-muted">{s.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {presentation.materials.slice(0, 2).map((m) => (
                <div
                  key={m.title}
                  className="flex gap-3 rounded-xl border border-line p-2.5"
                >
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-paper">
                    <Image src={m.image} alt={m.title} fill className="object-cover" sizes="56px" />
                  </div>
                  <div className="min-w-0 self-center">
                    <p className="text-sm font-semibold text-navy">{m.title}</p>
                    <p className="line-clamp-2 text-xs text-muted">{m.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </LockedSpot>

        {/* Style consultant */}
        <section className="mt-14">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
            <LockedSpot reason="รูปจากระบบสินค้า">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-paper sm:aspect-[4/5]">
                <Image
                  src={assets.lifestyle}
                  alt={`ตัวอย่างห้อง ${product.name}`}
                  fill
                  className="object-cover"
                  sizes="400px"
                />
              </div>
            </LockedSpot>
            <div>
              <EditableSpot sectionId="style" fieldKey="eyebrow">
                <SectionLabel>
                  {style.eyebrow || "Style consultant"}
                </SectionLabel>
              </EditableSpot>
              <EditableSpot sectionId="style" fieldKey="heading" className="mt-2">
                <h2 className="font-display text-2xl font-semibold text-navy sm:text-3xl">
                  {style.heading || "เหมาะกับห้องสไตล์ไหน?"}
                </h2>
              </EditableSpot>
              <EditableSpot sectionId="style" fieldKey="intro" className="mt-3">
                <p className="text-sm leading-relaxed text-muted">
                  {style.intro?.trim() || presentation.consultantIntro}
                </p>
              </EditableSpot>
              <LockedSpot reason="ขั้นตอนจากระบบสินค้า" className="mt-6">
                <div className="space-y-0 border-t border-line">
                  {presentation.consultantSteps.slice(0, 3).map((step, i) => (
                    <div key={step.title} className="border-b border-line py-3">
                      <div className="flex gap-3">
                        <span className="font-display text-lg font-semibold text-brand-red">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <p className="font-semibold text-navy">{step.title}</p>
                          <p className="mt-1 line-clamp-2 text-xs text-muted">
                            {step.body}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </LockedSpot>
            </div>
          </div>

          <EditableSpot sectionId="style" fieldKey="stylesHeading" className="mt-10">
            <h3 className="text-sm font-semibold text-navy">
              {style.stylesHeading || "สไตล์ห้องที่ทีมงานแนะนำ"}
            </h3>
          </EditableSpot>
          <LockedSpot reason="รูปสไตล์จากระบบสินค้า" className="mt-4">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {presentation.roomStyles.slice(0, 3).map((s) => (
                <div
                  key={s.id}
                  className="overflow-hidden rounded-2xl border border-line"
                >
                  <div className="relative aspect-[4/3] bg-paper">
                    <Image
                      src={s.image}
                      alt={s.name}
                      fill
                      className="object-cover"
                      sizes="140px"
                    />
                  </div>
                  <div className="p-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                      {s.nameEn}
                    </p>
                    <p className="font-display text-sm font-semibold text-navy">
                      {s.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </LockedSpot>
        </section>

        <LockedSpot reason="ข้อความคงที่" className="mt-14">
          <section className="rounded-2xl bg-paper/80 px-5 py-10 text-center sm:px-10">
            <SectionLabel>Why it works</SectionLabel>
            <h2 className="mt-3 font-display text-xl font-semibold text-navy sm:text-2xl">
              เลือกให้เข้าห้อง — ไม่ใช่แค่เลือกผ้าสวย
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted">
              ช่างตี๋ช่วยจับคู่ชนิดม่าน ทิศแดด และสไตล์ห้องจากหน้างานจริง
            </p>
          </section>
        </LockedSpot>

        {reviews.length > 0 ? (
          <LockedSpot reason="แก้ที่เมนูรีวิว" className="mt-14">
            <SectionLabel>Reviews</SectionLabel>
            <h2 className="mt-2 font-display text-xl font-semibold text-navy">
              รีวิวจากลูกค้า{category.name}
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-line bg-paper/40 p-4"
                >
                  <p className="text-sm font-semibold text-navy">{r.displayName}</p>
                  <p className="mt-2 line-clamp-3 text-xs text-muted">{r.body}</p>
                </div>
              ))}
            </div>
          </LockedSpot>
        ) : null}

        {installVideos.length > 0 ? (
          <LockedSpot reason="คลิปจากระบบสินค้า" className="mt-14">
            <SectionLabel>Install videos</SectionLabel>
            <h2 className="mt-2 font-display text-xl font-semibold text-navy">
              คลิปติดตั้ง{category.name}
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {installVideos.map((v) => (
                <div key={v.id} className="overflow-hidden rounded-xl border border-line">
                  <div className="relative aspect-video bg-paper">
                    {v.thumbnail ? (
                      <Image
                        src={v.thumbnail}
                        alt={v.title}
                        fill
                        className="object-cover"
                        sizes="200px"
                      />
                    ) : null}
                  </div>
                  <p className="p-2 text-xs font-medium text-navy">{v.title}</p>
                </div>
              ))}
            </div>
          </LockedSpot>
        ) : null}

        <LockedSpot reason="แก้ที่เมนูผลงาน" className="mt-14">
          <SectionLabel>Install gallery</SectionLabel>
          <h2 className="mt-2 font-display text-xl font-semibold text-navy">
            ตัวอย่างผลงานติดตั้ง{category.name}
          </h2>
          {portfolioWorks.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {portfolioWorks.map((w) => (
                <div
                  key={w.id}
                  className="overflow-hidden rounded-2xl border border-line"
                >
                  <div className="relative aspect-[4/3] bg-paper">
                    <Image
                      src={w.image}
                      alt={w.title}
                      fill
                      className="object-cover"
                      sizes="180px"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-[11px] text-muted">{w.place}</p>
                    <p className="text-sm font-semibold text-navy">{w.title}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-2xl border border-dashed border-line bg-paper/50 px-4 py-6 text-center text-sm text-muted">
              ยังไม่มีเคสในหมวดนี้บนหน้าเว็บ
            </p>
          )}
        </LockedSpot>

        {related.length > 0 ? (
          <LockedSpot reason="รุ่นอื่นจากแคตตาล็อก" className="mt-14">
            <SectionLabel>You might also like</SectionLabel>
            <h2 className="mt-2 font-display text-xl font-semibold text-navy">
              รุ่นอื่นในหมวด{category.name}
            </h2>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {related.slice(0, 3).map((r) => (
                <div
                  key={r.slug}
                  className="overflow-hidden rounded-2xl border border-line"
                >
                  <div className="relative aspect-[4/5] bg-paper">
                    <Image
                      src={childImage(category, r)}
                      alt={r.name}
                      fill
                      className="object-cover"
                      sizes="140px"
                    />
                  </div>
                  <div className="p-2.5">
                    <p className="text-sm font-semibold text-navy">{r.name}</p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-muted">
                      {r.summary}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </LockedSpot>
        ) : null}

        {compareTable ? (
          <LockedSpot reason="ตารางเปรียบเทียบจากระบบ" className="mt-14">
            <SectionLabel>Compare</SectionLabel>
            <h2 className="mt-2 font-display text-xl font-semibold text-navy">
              {compareTable.title}
            </h2>
            <p className="mt-2 text-sm text-muted">{compareTable.subtitle}</p>
          </LockedSpot>
        ) : null}

        <LockedSpot reason="FAQ จากระบบสินค้า" className="mt-14">
          <SectionLabel>FAQ</SectionLabel>
          <h2 className="mt-2 font-display text-xl font-semibold text-navy">
            คำถามที่พบบ่อยเกี่ยวกับ{product.name}
          </h2>
          {prepGuide ? (
            <p className="mt-3 text-xs text-muted">
              คู่มือเตรียมหน้างาน: {prepGuide.title}
            </p>
          ) : null}
          <div className="mt-4 space-y-0 border-t border-line">
            {content.faqs.slice(0, 3).map((f) => (
              <div key={f.q} className="border-b border-line py-3">
                <p className="text-sm font-semibold text-navy">{f.q}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted">{f.a}</p>
              </div>
            ))}
          </div>
        </LockedSpot>

        {/* CTA */}
        <section className="mt-10 rounded-2xl border border-line bg-paper/70 px-5 py-6 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <LockedSpot reason="ชื่อสินค้าอัตโนมัติ">
                <h2 className="font-display text-lg font-semibold text-navy sm:text-xl">
                  สนใจ{product.name}?
                </h2>
              </LockedSpot>
              <EditableSpot sectionId="cta" fieldKey="subtitle" className="mt-1">
                <p className="text-sm text-muted">{cta.subtitle}</p>
              </EditableSpot>
              <LockedSpot reason="เบอร์โทรจากตั้งค่าร้าน" className="mt-2">
                <p className="text-xs text-muted">
                  โทร{" "}
                  <span className="font-medium text-navy">
                    {siteConfig.phoneDisplay}
                  </span>
                </p>
              </LockedSpot>
            </div>
            <LockedSpot reason="ปุ่มระบบ">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-brand-red px-5 py-2.5 text-xs font-semibold text-white">
                  ขอใบเสนอราคา
                </span>
                <span className="rounded-full border border-line bg-white px-5 py-2.5 text-xs font-semibold text-navy">
                  ดูผลงาน
                </span>
                <span className="rounded-full border border-line bg-white px-5 py-2.5 text-xs font-semibold text-navy">
                  คุยทาง LINE
                </span>
              </div>
            </LockedSpot>
          </div>
        </section>
      </div>
    </article>
  );
}
