import Image from "next/image";
import { HeroSlider } from "@/components/home/HeroSlider";
import { ProductGrid } from "@/components/home/ProductGrid";
import { WhyUs } from "@/components/home/WhyUs";
import { PortfolioPreview } from "@/components/home/PortfolioPreview";
import { CatalogSection } from "@/components/home/CatalogSection";
import { BlogPreview } from "@/components/home/BlogPreview";
import { ContactCta } from "@/components/home/ContactCta";

export default function HomePage() {
  return (
    <>
      <HeroSlider />

      <div className="bg-white">
        <div className="relative mx-auto max-w-6xl px-3 py-3 sm:px-4 sm:py-4">
          <div className="relative aspect-[16/10] w-full overflow-hidden sm:aspect-[1024/569]">
            <Image
              src="/images/banners/strip.png"
              alt="บริการอื่นๆ ช่างตี๋ — ฟิล์ม วอลเปเปอร์ พิมพ์ผ้า ซักผ้าม่าน"
              fill
              className="object-contain object-center"
              sizes="(max-width: 1152px) 100vw, 1152px"
            />
          </div>
        </div>
      </div>

      <ProductGrid />
      <WhyUs />
      <PortfolioPreview />
      <CatalogSection />
      <BlogPreview />
      <ContactCta />
    </>
  );
}
