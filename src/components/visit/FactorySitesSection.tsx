import { VISIT_SITES } from "@/lib/visits/types";

export function FactorySitesSection() {
  return (
    <section className="mb-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        3 Production Sites
      </p>
      <h2 className="mt-2 font-display text-xl font-semibold text-navy sm:text-2xl">
        โรงงานแยก 3 สถานที่ตามไลน์ผลิต
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        แต่ละไลน์ผลิตอยู่คนละสถานที่ — ระบุไว้ให้ท่านเลือกดูตามสินค้าที่สนใจ
        ทีมงานจะนัดสถานที่ตามที่เลือกในฟอร์มด้านล่าง
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {VISIT_SITES.map((site) => (
          <article
            key={site.id}
            className="flex flex-col rounded-2xl border border-line bg-white p-4"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white">
              {site.no}
            </span>
            <h3 className="mt-3 font-modern text-base font-semibold text-navy">
              {site.titleEn}
            </h3>
            <p className="mt-1 text-sm font-medium text-ink">{site.titleTh}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted">{site.products}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
