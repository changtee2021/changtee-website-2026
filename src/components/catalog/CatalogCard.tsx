"use client";

import { useState } from "react";
import Image from "next/image";
import { FileText } from "lucide-react";
import type { ProductCatalogFile } from "@/lib/catalogs";
import { CatalogFlipbookModal } from "@/components/catalog/CatalogFlipbookModal";

type Props = {
  catalog: ProductCatalogFile;
  compact?: boolean;
};

export function CatalogCard({ catalog, compact = false }: Props) {
  const cover = catalog.coverImage;
  const [open, setOpen] = useState(false);
  const fileName = `${catalog.id}.pdf`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group block w-full rounded-[1.25rem] bg-white p-3 text-left shadow-sm ring-1 ring-line transition hover:ring-navy/20"
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1rem] bg-line/40">
          {cover ? (
            <Image
              src={cover}
              alt={`ปก ${catalog.title}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              sizes={compact ? "280px" : "(max-width: 640px) 78vw, 300px"}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-navy text-white">
              <FileText className="h-8 w-8" />
            </div>
          )}
        </div>

        <div className={`px-1 ${compact ? "pb-1 pt-3" : "pb-1 pt-4"}`}>
          <h3
            className={`font-semibold text-navy ${
              compact ? "text-sm" : "text-base"
            }`}
          >
            {catalog.title}
          </h3>
          {!compact ? (
            <p className="mt-1 line-clamp-2 text-sm text-muted">
              {catalog.description}
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-muted">{catalog.titleEn}</p>
          )}
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="truncate text-xs text-muted">
              {compact ? "PDF" : catalog.titleEn}
            </span>
            <span className="shrink-0 rounded-full bg-navy px-4 py-1.5 text-xs font-semibold text-white transition group-hover:bg-brand-red">
              เปิดดู
            </span>
          </div>
        </div>
      </button>

      {open ? (
        <CatalogFlipbookModal
          fileUrl={catalog.href}
          fileName={fileName}
          title={catalog.title}
          catalogId={catalog.id}
          manifestUrl={catalog.manifestUrl}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
