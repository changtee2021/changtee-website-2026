import type { ContentStatus } from "@/lib/cms/content-status";

export type HeroSlide = {
  id: string;
  src: string;
  alt: string;
  title: string;
  subtitle: string;
  price: string;
  badge: string;
  href: string;
  status: ContentStatus;
  sortOrder: number;
  updatedAt: string;
};

export const DEMO_HERO_SLIDES: HeroSlide[] = [
  {
    id: "hs-1",
    src: "/images/generated/ct-hero-living.webp",
    alt: "ผ้าม่านลอนเทปห้องนั่งเล่น ผลงานช่างตี๋",
    title: "CURTAIN",
    subtitle: "ผ้าม่านบ้าน",
    price: "เริ่มต้น 1,500฿ ตร.เมตร",
    badge: "วัดหน้างานฟรี",
    href: "/products/curtain",
    status: "published",
    sortOrder: 1,
    updatedAt: "2026-08-05T10:00:00+07:00",
  },
  {
    id: "hs-2",
    src: "/images/generated/ct-pf-office.webp",
    alt: "ม่านม้วน sunscreen สำนักงาน ผลงานช่างตี๋",
    title: "ROLLER BLIND",
    subtitle: "ม่านม้วนออฟฟิศ",
    price: "เริ่มต้น 550฿ ตร.เมตร",
    badge: "วัดหน้างานฟรี",
    href: "/products/roller-blinds",
    status: "published",
    sortOrder: 2,
    updatedAt: "2026-08-05T10:00:00+07:00",
  },
  {
    id: "hs-3",
    src: "/images/generated/ct-pf-condo.webp",
    alt: "ผ้าม่านทึบแสงห้องนอนคอนโด ผลงานช่างตี๋",
    title: "BLACKOUT CURTAIN",
    subtitle: "ผ้าม่านทึบแสงคอนโด",
    price: "เริ่มต้น 1,500฿ ตร.เมตร",
    badge: "วัดหน้างานฟรี",
    href: "/products/curtain",
    status: "published",
    sortOrder: 3,
    updatedAt: "2026-08-05T10:00:00+07:00",
  },
  {
    id: "hs-4",
    src: "/images/generated/ct-pf-cafe.webp",
    alt: "ม่านม้วนกันแดดร้านคาเฟ่ ผลงานช่างตี๋",
    title: "SUNSCREEN BLIND",
    subtitle: "ม่านม้วนร้านคาเฟ่",
    price: "เริ่มต้น 550฿ ตร.เมตร",
    badge: "วัดหน้างานฟรี",
    href: "/products/roller-blinds",
    status: "published",
    sortOrder: 4,
    updatedAt: "2026-08-05T10:00:00+07:00",
  },
  {
    id: "hs-5",
    src: "/images/banners/hero-2.png",
    alt: "มู่ลี่ไม้ ช่างตี๋ — เริ่มต้น 1,690฿ ตร.เมตร",
    title: "WOODEN VENETIAN BLIND",
    subtitle: "มู่ลี่ไม้",
    price: "เริ่มต้น 1,690฿ ตร.เมตร",
    badge: "วัดหน้างานฟรี",
    href: "/products/venetian-blinds",
    status: "draft",
    sortOrder: 5,
    updatedAt: "2026-08-01T10:00:00+07:00",
  },
  {
    id: "hs-6",
    src: "/images/banners/hero-6.png",
    alt: "ฉากกั้นห้อง PVC ช่างตี๋ — เริ่มต้น 790฿ ตร.เมตร",
    title: "PVC FOLDING DOOR",
    subtitle: "ฉากกั้นห้อง กั้นแอร์",
    price: "เริ่มต้น 790฿ ตร.เมตร",
    badge: "วัดหน้างานฟรี",
    href: "/products/pvc-partition",
    status: "draft",
    sortOrder: 6,
    updatedAt: "2026-08-01T10:00:00+07:00",
  },
];

export function emptyHeroSlide(): HeroSlide {
  return {
    id: `hs-${Date.now()}`,
    src: "/images/banners/hero-1.png",
    alt: "",
    title: "",
    subtitle: "",
    price: "",
    badge: "บริการ วัดหน้างาน ฟรี!!",
    href: "/products",
    status: "draft",
    sortOrder: 99,
    updatedAt: new Date().toISOString(),
  };
}

export function publishedHeroSlides(slides: HeroSlide[] = DEMO_HERO_SLIDES) {
  return slides
    .filter((s) => s.status === "published")
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
