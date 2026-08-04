import Image from "next/image";
import Link from "next/link";
import { portfolioMock } from "@/lib/mock-content";

export function PortfolioPreview() {
  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-bold text-navy sm:text-2xl md:text-3xl">
              ผลงานการติดตั้งของช่างตี๋
            </h2>
            <div className="mt-2 h-1 w-16 bg-brand-red" />
          </div>
          <Link
            href="/portfolio"
            className="shrink-0 text-sm font-semibold text-brand-red hover:underline"
          >
            รวมผลงาน
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {portfolioMock.map((item) => (
            <article key={item.title} className="overflow-hidden rounded-lg border border-line bg-white">
              <div className="relative aspect-[4/3]">
                <Image src={item.image} alt={item.title} fill className="object-cover" sizes="280px" />
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag) => (
                    <span key={tag} className="rounded bg-paper px-2 py-0.5 text-[11px] text-muted">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="mt-2 font-semibold text-navy">{item.title}</h3>
                <p className="mt-1 text-xs text-brand-red">{item.place}</p>
                <p className="mt-2 line-clamp-3 text-sm text-muted">{item.summary}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
