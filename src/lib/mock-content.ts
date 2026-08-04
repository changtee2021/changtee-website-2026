import { DEMO_BLOG } from "@/lib/cms/blog-demo";
import { DEMO_PORTFOLIO } from "@/lib/cms/portfolio-demo";

export const heroSlides = [
  {
    src: "/images/banners/hero-1.png",
    alt: "ม่านม้วน ช่างตี๋ — เริ่มต้น 550฿ ตร.เมตร",
    title: "ROLLER BLIND",
    subtitle: "ม่านม้วน",
    price: "เริ่มต้น 550฿ ตร.เมตร",
    badge: "บริการ วัดหน้างาน ฟรี!!",
    href: "/products/roller-blinds",
  },
  {
    src: "/images/banners/hero-2.png",
    alt: "มู่ลี่ไม้ ช่างตี๋ — เริ่มต้น 1,690฿ ตร.เมตร",
    title: "WOODEN VENETIAN BLIND",
    subtitle: "มู่ลี่ไม้",
    price: "เริ่มต้น 1,690฿ ตร.เมตร",
    badge: "บริการ วัดหน้างาน ฟรี!!",
    href: "/products/venetian-blinds",
  },
  {
    src: "/images/banners/hero-3.png",
    alt: "มู่ลี่อลูมิเนียม ช่างตี๋ — เริ่มต้น 550฿ ตร.เมตร",
    title: "ALUMINUM VENETIAN BLIND",
    subtitle: "มู่ลี่อลูมิเนียม",
    price: "เริ่มต้น 550฿ ตร.เมตร",
    badge: "บริการ วัดหน้างาน ฟรี!!",
    href: "/products/venetian-blinds",
  },
  {
    src: "/images/banners/hero-4.png",
    alt: "ม่านปรับแสง ช่างตี๋ — เริ่มต้น 550฿ ตร.เมตร",
    title: "VERTICAL BLIND",
    subtitle: "ม่านปรับแสง",
    price: "เริ่มต้น 550฿ ตร.เมตร",
    badge: "บริการ วัดหน้างาน ฟรี!!",
    href: "/products/vertical-blinds",
  },
  {
    src: "/images/banners/hero-5.png",
    alt: "ผ้าม่าน ช่างตี๋ — เริ่มต้น 1,500฿ ตร.เมตร",
    title: "CURTAIN",
    subtitle: "ผ้าม่าน",
    price: "เริ่มต้น 1,500฿ ตร.เมตร",
    badge: "บริการ วัดหน้างาน ฟรี!!",
    href: "/products/curtain",
  },
  {
    src: "/images/banners/hero-6.png",
    alt: "ฉากกั้นห้อง PVC ช่างตี๋ — เริ่มต้น 790฿ ตร.เมตร",
    title: "PVC FOLDING DOOR",
    subtitle: "ฉากกั้นห้อง กั้นแอร์",
    price: "เริ่มต้น 790฿ ตร.เมตร",
    badge: "บริการ วัดหน้างาน ฟรี!!",
    href: "/products/pvc-partition",
  },
];

export const homeProductTiles = [
  { name: "ผ้าม่าน", href: "/products/curtain", image: "/images/products/p1.png" },
  { name: "ม่านม้วน", href: "/products/roller-blinds", image: "/images/products/p2.png" },
  { name: "มู่ลี่", href: "/products/venetian-blinds", image: "/images/products/p3.png" },
  { name: "ม่านปรับแสง", href: "/products/vertical-blinds", image: "/images/products/p4.png" },
  { name: "ฉากกั้นห้อง", href: "/products/pvc-partition", image: "/images/products/p5.png" },
  { name: "ม่านพิมพ์ลาย", href: "/products/curtain/print", image: "/images/products/print-curtain.png" },
  { name: "วอลเปเปอร์/ฟิล์ม", href: "/products/surface", image: "/images/products/p7.png" },
  { name: "มู่ลี่อลูมิเนียม", href: "/products/venetian-blinds/aluminium", image: "/images/products/venetian-aluminium.png" },
];

export const whyItems = [
  {
    title: "ฟรี",
    desc: "เข้าวัดหน้างานฟรี ให้คำปรึกษาและออกแบบฟังก์ชัน",
    image: "/images/why/free.png",
  },
  {
    title: "ทันใจ",
    desc: "มีโรงงานและทีมติดตั้งเอง ทำงานไว ควบคุมคุณภาพได้",
    image: "/images/why/fast.png",
  },
  {
    title: "มั่นใจ",
    desc: "รับประกันงานติดตั้ง 1 ปีเต็ม พร้อมบริการหลังการขาย",
    image: "/images/why/trust.png",
  },
];

export const portfolioMock = DEMO_PORTFOLIO.filter(
  (item) => item.status === "published",
).map(({ title, place, summary, image, tags }) => ({
  title,
  place,
  summary,
  image,
  tags,
}));

export const blogMock = DEMO_BLOG.filter((post) => post.status === "published").map(
  ({ title, excerpt, cover }) => ({
    title,
    excerpt,
    image: cover,
  }),
);
