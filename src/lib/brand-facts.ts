import { aboutSmartMotor } from "@/lib/about-content";
import { PRODUCT_PILLARS, productCatalog } from "@/lib/product-catalog";
import { siteConfig } from "@/lib/site-config";

/**
 * Verifiable brand facts for AI / answer engines (llms.txt, JSON-LD, FAQ).
 * Every claim here must already be stated elsewhere on the site — never add
 * certifications, ratings, or prices that the business has not confirmed.
 */
export const brandFacts = {
  experienceYears: "10",
  installWarranty: "1 ปี",
  motorWarranty: "5 ปี",
  fastestInstall: "1–2 วัน",
  serviceArea: "ทั่วประเทศไทย",
  customers: "1,000+",
  installs: "10,000+",
} as const;

export const brandKnowsAbout = [
  "ผ้าม่าน",
  "ม่านม้วน",
  "มู่ลี่",
  "ม่านปรับแสง",
  "ฉากกั้นห้อง PVC",
  "ม่านไฟฟ้า",
  "ม่านภายนอก",
  "ม่านริ้วพลาสติก PVC",
  "ผ้าพิมพ์ลาย",
  "วอลเปเปอร์",
  "ฟิล์มอาคาร",
  "ซักและซ่อมผ้าม่าน",
  "Curtains",
  "Roller blinds",
  "Venetian blinds",
  "Vertical blinds",
  "Motorized blinds",
  "Window coverings",
] as const;

export type BrandFaq = { q: string; a: string; href?: string };

const pillarList = PRODUCT_PILLARS.map((p) => p.name).join(" · ");

export const BRAND_FAQS: BrandFaq[] = [
  {
    q: "ช่างตี๋ ผ้าม่าน (Changtee Phaman) คือใคร?",
    a: `${siteConfig.name} (${siteConfig.nameEn}) คือ ${siteConfig.positioning} ที่ดูแลงานม่านครบวงจร ตั้งแต่วัดหน้างาน ออกแบบ ผลิตที่โรงงานของเราเอง จนติดตั้งโดยช่างมืออาชีพ ตัวตนของเราคือ ช่าง + งานฝีมือ + ประสบการณ์ และคอนเซป “${siteConfig.concept}” จากประสบการณ์กว่า ${brandFacts.experienceYears} ปี`,
    href: "/contact",
  },
  {
    q: "ช่างตี๋วัดหน้างานฟรีไหม?",
    a: "วัดหน้างานฟรี ทั้งบ้าน คอนโด และโปรเจกต์องค์กร เลือกวันเวลาที่สะดวก ทีมงานไปวัดให้ถึงที่ แล้วส่งใบเสนอราคาตามขนาดและรุ่นที่เลือก",
    href: "/quote",
  },
  {
    q: "สั่งแล้วติดตั้งได้เร็วแค่ไหน?",
    a: `เร็วสุด ${brandFacts.fastestInstall} หลังยืนยันงาน เพราะมีโรงงานผลิตและทีมช่างของเราเอง ระยะเวลาจริงขึ้นกับรุ่นสินค้า จำนวนบาน และพื้นที่ติดตั้ง`,
  },
  {
    q: "รับประกันงานอย่างไร?",
    a: `รับประกันงานติดตั้ง ${brandFacts.installWarranty} เต็ม และรับประกันมอเตอร์ม่านไฟฟ้า ${brandFacts.motorWarranty} หลังติดตั้งแล้วมีปัญหา ทักมาทาง LINE ${siteConfig.lineId} ได้เลย`,
  },
  {
    q: "ช่างตี๋มีสินค้าและบริการอะไรบ้าง?",
    a: `บริการครบ 7 กลุ่ม: ${pillarList} เช่น ผ้าม่านลอน ม่านจีบ ม่านม้วน มู่ลี่ไม้ ม่านปรับแสง ฉากกั้นห้อง PVC ม่านไฟฟ้าสมาร์ทโฮม ม่านรางซิป ผ้าพิมพ์ลาย วอลเปเปอร์ และฟิล์มอาคาร`,
    href: "/products",
  },
  {
    q: "ผ้าม่านราคาเท่าไร?",
    a: "ราคาขึ้นกับขนาดหน้าต่าง ชนิดผ้าหรือวัสดุ ระบบราง และมอเตอร์ (ถ้ามี) เราจึงวัดหน้างานฟรีก่อน แล้วส่งใบเสนอราคาที่ตรงกับงานจริง ไม่ต้องเดาราคา",
    href: "/quote",
  },
  {
    q: "ให้บริการพื้นที่ไหน มีโชว์รูมไหม?",
    a: `ติดตั้ง${brandFacts.serviceArea} มีโชว์รูมให้ดูผ้าและแบบจริงที่ ${siteConfig.address.line1} ${siteConfig.address.line2} ${siteConfig.address.city} ${siteConfig.hours}`,
    href: "/contact",
  },
  {
    q: "รับงานองค์กร ร้านค้า หรือหน่วยงานราชการไหม?",
    a: "รับ ทั้งร้านอาหาร คาเฟ่ ออฟฟิศ โรงงาน หน่วยงานราชการ และสถานศึกษา งานหลายสาขาประสานทีมเดียวจบ นิติบุคคลนัดให้ทีมเข้าพรีเซนต์สินค้า หรือนัดเยี่ยมชมโรงงานได้",
    href: "/visit-factory",
  },
  {
    q: "ม่านไฟฟ้าของช่างตี๋รองรับสมาร์ทโฮมไหม?",
    a: `รองรับ ทั้งรีโมทและ Wi‑Fi เชื่อมต่อแบรนด์ ${aboutSmartMotor.brands} รับประกันมอเตอร์ ${brandFacts.motorWarranty}`,
    href: "/products/motorized",
  },
  {
    q: "ติดต่อช่างตี๋ได้ทางไหน?",
    a: `LINE ${siteConfig.lineId} หรือโทร ${siteConfig.phoneDisplay} ${siteConfig.hours} หรือกรอกขอใบเสนอราคาบนเว็บไซต์`,
    href: "/quote",
  },
];

export function brandFaqJsonLd(base: string): Record<string, unknown> {
  return {
    "@type": "FAQPage",
    "@id": `${base}/#faq`,
    mainEntity: BRAND_FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** schema.org OfferCatalog of every service category + item on the site. */
export function brandOfferCatalog(base: string): Record<string, unknown> {
  return {
    "@type": "OfferCatalog",
    name: "สินค้าและบริการช่างตี๋ ผ้าม่าน",
    itemListElement: productCatalog.map((cat) => ({
      "@type": "OfferCatalog",
      name: cat.name,
      alternateName: cat.nameEn,
      url: `${base}/products/${cat.slug}`,
      itemListElement: cat.children.map((child) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: child.name,
          ...(child.nameEn ? { alternateName: child.nameEn } : {}),
          description: child.summary,
          url: `${base}/products/${cat.slug}/${child.slug}`,
        },
      })),
    })),
  };
}
