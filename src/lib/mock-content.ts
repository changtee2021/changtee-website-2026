import { DEMO_BLOG } from "@/lib/cms/blog-demo";
import { DEMO_PORTFOLIO } from "@/lib/cms/portfolio-demo";
import {
  DEMO_HERO_SLIDES,
  publishedHeroSlides,
} from "@/lib/cms/hero-slides-demo";
import { publishedBlog, publishedPortfolio } from "@/lib/cms/public-content";

/** @deprecated Prefer useHeroSlides() / publishedHeroSlides — kept for static imports */
export const heroSlides = publishedHeroSlides(DEMO_HERO_SLIDES);

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
    title: "วัดหน้างานฟรี",
    desc: "นัดวันสะดวก เราไปวัดให้ถึงที่ ไม่มีค่าใช้จ่าย",
    image: "/images/why/free.png",
  },
  {
    title: "ผลิตเอง ส่งไว",
    desc: "มีโรงงานและทีมช่างของเราเอง งานเลยไม่ต้องรอนาน",
    image: "/images/why/fast.png",
  },
  {
    title: "รับประกัน 1 ปี",
    desc: "ติดตั้งเสร็จแล้วยังดูแลต่อ มีอะไรทักมาได้เลย",
    image: "/images/why/trust.png",
  },
];

export const homeSteps = [
  {
    title: "คุยแล้วออกแบบให้",
    desc: "บอกห้องที่อยากติดและสไตล์ที่ชอบ เราช่วยเลือกผ้ากับแบบม่านให้เหมาะกับการใช้งานจริง",
  },
  {
    title: "เข้าวัดหน้างานฟรี",
    desc: "ทีมเข้าไปวัดพื้นที่จริงอย่างละเอียด สรุปราคาให้ชัดก่อนตัดสินใจ ไม่มีค่าใช้จ่าย",
  },
  {
    title: "ส่งและติดตั้งให้จบ",
    desc: "ผลิตที่โรงงานเราเอง ส่งตรงเวลา ช่างติดตั้งเก็บงานเรียบร้อย พร้อมรับประกัน 1 ปี",
  },
];

export const homeServices = [
  {
    title: "เลือกแบบผ้าม่าน",
    desc: "ไม่รู้จะเริ่มตรงไหน บอกสไตล์บ้านมา เราช่วยจับคู่ผ้าและโทนสีให้",
    href: "/products/curtain",
  },
  {
    title: "ติดตั้งครบวงจร",
    desc: "วัด ผลิต ติดตั้ง จบในทีมเดียว นัดวันได้ ไม่ต้องประสานหลายเจ้า",
    href: "/quote",
  },
  {
    title: "งานคัสตอมพิเศษ",
    desc: "ม่านม้วน มู่ลี่ ฉากกั้นห้อง หรือขนาดพิเศษ สั่งทำตามหน้างานได้",
    href: "/products",
  },
];

export const homeStats = [
  { value: "1,000+", label: "ลูกค้าที่ไว้ใจให้เราดูแล ตั้งแต่บ้านหลังเล็กจนถึงโปรเจกต์องค์กร" },
  { value: "10,000+", label: "งานติดตั้งที่ผ่านมือทีมช่างของเราเอง ทุกผืนตรวจก่อนส่งมอบ" },
  { value: "77", label: "จังหวัดที่เราพร้อมเดินทางไปติดตั้งให้ถึงหน้างาน" },
];

export const storyBlurb = {
  title: "จากโรงงานคลองสามวา ถึงหน้าต่างบ้านคุณ",
  paragraphs: [
    "เราเริ่มจากร้านผ้าม่านเล็กๆ ที่รับงานเองทุกขั้นตอน วันนี้ยังทำแบบเดิม คือวัดเอง เย็บเอง ติดตั้งเอง เพราะอยากรู้ว่างานที่ส่งถึงลูกค้าเป็นยังไง",
    "แวะมาที่โชว์รูมได้ มีตัวอย่างผ้าให้จับของจริง เทียบสีกับแสงในห้อง แล้วค่อยตัดสินใจ ไม่ต้องรีบ",
  ],
};

export const portfolioMock = publishedPortfolio(DEMO_PORTFOLIO).map((item) => ({
  title: item.title,
  place: item.place,
  summary: item.summary,
  image: item.image,
  tags: item.tags,
  slug: item.slug,
}));

export const blogMock = publishedBlog(DEMO_BLOG).map((post) => ({
  title: post.title,
  excerpt: post.excerpt,
  image: post.cover,
  slug: post.slug,
  category: post.category,
}));
