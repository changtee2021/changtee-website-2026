import Image from "next/image";
import { Download, Eye, FileText } from "lucide-react";
import type { ProductCatalogFile } from "@/lib/catalogs";

type Props = {
  catalog: ProductCatalogFile;
  compact?: boolean;
};

export function CatalogCard({ catalog, compact = false }: Props) {
  const cover = catalog.coverImage;

  return (
    <article
      className={`rounded-2xl border border-line bg-white ${
        compact ? "p-4" : "p-5 md:p-6"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`relative shrink-0 overflow-hidden rounded-xl border border-line bg-paper ${
            compact ? "h-16 w-12" : "h-28 w-20 sm:h-32 sm:w-24"
          }`}
        >
          {cover ? (
            <Image
              src={cover}
              alt={`ปก ${catalog.title}`}
              fill
              className="object-cover object-top"
              sizes="96px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-navy text-white">
              <FileText className="h-6 w-6" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-navy">{catalog.title}</h3>
          <p className="text-xs text-muted">{catalog.titleEn}</p>
          {!compact ? (
            <p className="mt-2 text-sm leading-6 text-muted">{catalog.description}</p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={catalog.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-navy px-3 py-2 text-xs font-semibold text-white hover:bg-navy/90"
            >
              <Eye className="h-3.5 w-3.5" />
              เปิดดู PDF
            </a>
            <a
              href={catalog.href}
              download
              className="inline-flex items-center gap-1.5 rounded-md bg-brand-red px-3 py-2 text-xs font-semibold text-white hover:bg-brand-red-soft"
            >
              <Download className="h-3.5 w-3.5" />
              ดาวน์โหลด
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
