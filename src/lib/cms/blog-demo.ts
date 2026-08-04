import type { ContentStatus } from "@/lib/cms/content-status";

export type BlogCategory =
  | "choose"
  | "care"
  | "ideas"
  | "motor"
  | "promo";

export const BLOG_CATEGORY_LABELS: Record<BlogCategory, string> = {
  choose: "เลือกม่าน",
  care: "ดูแลผ้าม่าน",
  ideas: "ไอเดียแต่งบ้าน",
  motor: "ม่านมอเตอร์",
  promo: "โปร & ข่าว",
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  cover: string;
  category: BlogCategory;
  tags: string[];
  author: string;
  status: ContentStatus;
  publishedAt: string | null;
  seoTitle: string;
  seoDescription: string;
  updatedAt: string;
};

export const DEMO_BLOG: BlogPost[] = [
  {
    id: "bl-1",
    title: "การดูแลผ้าม่านอย่างถูกวิธี",
    slug: "curtain-care-tips",
    excerpt: "เคล็ดลับยืดอายุผ้าม่านและคงความสวยหลังติดตั้ง",
    body: "เช็ดฝุ่นเบาๆ เป็นประจำ หลีกเลี่ยงซักถี่เกินไป และเลือกบริการซักมืออาชีพเมื่อคราบฝัง\n\nแนะนำเปิดม่านช่วงเช้าให้ผ้าได้ระบายความชื้น",
    cover: "/images/mock/curtain-living.jpg",
    category: "care",
    tags: ["ดูแลผ้าม่าน", "อายุการใช้งาน"],
    author: "ทีมช่างตี๋",
    status: "published",
    publishedAt: "2026-06-15T09:00:00+07:00",
    seoTitle: "",
    seoDescription: "",
    updatedAt: "2026-06-15T09:00:00+07:00",
  },
  {
    id: "bl-2",
    title: "ฉากกั้นห้องช่วยประหยัดค่าไฟได้จริงหรือไม่?",
    slug: "pvc-partition-save-energy",
    excerpt: "อธิบายการใช้ฉากกั้นแอร์และเลือกแบบให้เหมาะงาน",
    body: "ฉากกั้นช่วยลดพื้นที่ที่ต้องปรับอากาศ ทำให้แอร์ทำงานน้อยลง โดยเฉพาะห้องโถงกว้าง\n\nเลือกฉากทึบหรือแบบมีช่องตามการใช้งานจริง",
    cover: "/images/mock/portfolio-1.png",
    category: "choose",
    tags: ["ฉากกั้น", "ประหยัดไฟ"],
    author: "ทีมช่างตี๋",
    status: "published",
    publishedAt: "2026-07-01T10:00:00+07:00",
    seoTitle: "",
    seoDescription: "",
    updatedAt: "2026-07-01T10:00:00+07:00",
  },
  {
    id: "bl-3",
    title: "สไตล์บ้านของคุณเหมาะกับผ้าม่านแบบไหน?",
    slug: "which-curtain-style",
    excerpt: "คู่มือเลือกม่านลอน ม่านจีบ ม่านม้วน ให้เข้ากับบ้าน",
    body: "บ้านโมเดิร์นมักเข้ากับม่านลอนหรือม่านม้วน ส่วนบ้านคลาสสิกเหมาะม่านจีบ\n\nลองจับคู่โทนผ้ากับเฟอร์นิเจอร์หลักของห้อง",
    cover: "/images/banners/hero-5.png",
    category: "ideas",
    tags: ["เลือกม่าน", "สไตล์"],
    author: "ทีมช่างตี๋",
    status: "draft",
    publishedAt: null,
    seoTitle: "",
    seoDescription: "",
    updatedAt: "2026-08-02T16:00:00+07:00",
  },
];

export function emptyBlogPost(): BlogPost {
  return {
    id: `bl-${Date.now()}`,
    title: "",
    slug: "",
    excerpt: "",
    body: "",
    cover: "/images/banners/hero-1.png",
    category: "choose",
    tags: [],
    author: "ทีมช่างตี๋",
    status: "draft",
    publishedAt: null,
    seoTitle: "",
    seoDescription: "",
    updatedAt: new Date().toISOString(),
  };
}
