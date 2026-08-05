"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { FileBadge2, X } from "lucide-react";
import type { ProductCertificate } from "@/lib/product-certificates";

export function ProductCertificates({
  certificates,
}: {
  certificates: ProductCertificate[];
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = certificates.find((c) => c.id === activeId) ?? null;

  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setActiveId(null);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  if (certificates.length === 0) return null;

  return (
    <div className="mt-8 border-t border-line pt-6">
      <div className="flex items-center gap-2">
        <FileBadge2 className="size-4 text-brand-red" />
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          Certificates
        </p>
      </div>
      <h3 className="mt-1 text-sm font-semibold text-navy">
        ใบรับรอง / มาตรฐาน (ตัวอย่าง)
      </h3>
      <p className="mt-1 text-xs text-muted">
        กดดูใบเซอร์ — ไฟล์จริงจะอัปโหลดแทนม็อกนี้ภายหลัง
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {certificates.map((cert) => (
          <button
            key={cert.id}
            type="button"
            onClick={() => setActiveId(cert.id)}
            className="group overflow-hidden rounded-xl border border-line bg-white text-left transition hover:border-navy/30 hover:shadow-sm"
          >
            <div className="relative aspect-[3/4] bg-paper">
              <Image
                src={cert.thumbSrc}
                alt={cert.title}
                fill
                className="object-cover transition group-hover:scale-[1.02]"
                sizes="160px"
              />
            </div>
            <div className="p-2.5">
              <p className="line-clamp-2 text-xs font-semibold text-navy">
                {cert.title}
              </p>
              <p className="mt-0.5 text-[10px] text-muted">{cert.code}</p>
            </div>
          </button>
        ))}
      </div>

      {active ? (
        <div
          className="fixed inset-0 z-[85] flex items-center justify-center bg-navy/80 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          onClick={() => setActiveId(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                  Certificate
                </p>
                <h4 className="mt-0.5 font-semibold text-navy">{active.title}</h4>
                <p className="text-xs text-muted">
                  {active.code} · {active.issuer}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveId(null)}
                className="rounded-full p-1.5 text-muted hover:bg-paper hover:text-navy"
                aria-label="ปิด"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="relative mx-auto aspect-[3/4] max-h-[60vh] w-full bg-paper">
              <Image
                src={active.fullSrc}
                alt={active.title}
                fill
                className="object-contain p-3"
                sizes="512px"
              />
            </div>
            <p className="border-t border-line px-4 py-3 text-xs leading-relaxed text-muted sm:px-5">
              {active.note}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
