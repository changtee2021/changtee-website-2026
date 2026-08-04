import Image from "next/image";
import type { Metadata } from "next";
import { portfolioMock } from "@/lib/mock-content";

export const metadata: Metadata = {
  title: "Sale Gallery",
  description: "แกลเลอรีสินค้าและโปรโมชันจากโชว์รูมช่างตี๋",
};

const gallery = [
  ...portfolioMock.map((p) => p.image),
  "/images/banners/hero-1.png",
  "/images/banners/hero-2.png",
  "/images/banners/hero-3.png",
  "/images/mock/film.png",
  "/images/mock/showroom.png",
  "/images/mock/portfolio-banner.png",
];

export default function SaleGalleryPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-navy">Sale Gallery</h1>
      <div className="mt-2 h-1 w-16 bg-brand-red" />
      <p className="mt-3 text-muted">แกลเลอรีรูปจากโชว์รูมและผลงาน — mockup สำหรับพัฒนา UI</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {gallery.map((src, i) => (
          <div key={`${src}-${i}`} className="relative aspect-square overflow-hidden rounded-lg border border-line">
            <Image src={src} alt={`Sale gallery ${i + 1}`} fill className="object-cover" sizes="280px" />
          </div>
        ))}
      </div>
    </div>
  );
}
