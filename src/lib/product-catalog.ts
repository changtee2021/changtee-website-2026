export type ProductChild = {
  slug: string;
  name: string;
  nameEn?: string;
  summary: string;
  /** Sub-group within outdoor-factory (hub pillars 02 vs 04) */
  group?: "outdoor" | "factory";
};

export type ProductPillarId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type ProductCategory = {
  slug: string;
  name: string;
  nameEn: string;
  summary: string;
  pillar: ProductPillarId;
  /** 4:3 cover for hub / category pages */
  image: string;
  children: ProductChild[];
};

export type ProductPillar = {
  id: ProductPillarId;
  code: string;
  name: string;
  nameEn: string;
  summary: string;
};

/** Company Profile 2026 — 7 service pillars */
export const PRODUCT_PILLARS: ProductPillar[] = [
  {
    id: 1,
    code: "01",
    name: "ม่านภายใน",
    nameEn: "Indoor",
    summary: "ผ้าม่าน ม่านม้วน มู่ลี่ ม่านปรับแสง และฉากกั้นห้อง",
  },
  {
    id: 2,
    code: "02",
    name: "ม่านภายนอก",
    nameEn: "Outdoor",
    summary: "ม่านม้วนภายนอก รางซิป และม่านสกายไลท์",
  },
  {
    id: 3,
    code: "03",
    name: "ม่านไฟฟ้า",
    nameEn: "Motorized",
    summary: "มอเตอร์รีโมท / Wi‑Fi รองรับสมาร์ทโฮม",
  },
  {
    id: 4,
    code: "04",
    name: "ม่านอุตสาหกรรม",
    nameEn: "Industrial",
    summary: "ม่านริ้วพลาสติกสำหรับโรงงานและคลังสินค้า",
  },
  {
    id: 5,
    code: "05",
    name: "บริการพิมพ์ผ้า",
    nameEn: "Print Fabric",
    summary: "ผ้าพิมพ์ ม่านญี่ปุ่น และม่านม้วนพิมพ์ลาย",
  },
  {
    id: 6,
    code: "06",
    name: "ผนังและกระจก",
    nameEn: "Walls & Glass",
    summary: "วอลเปเปอร์และฟิล์มกรองแสงอาคาร",
  },
  {
    id: 7,
    code: "07",
    name: "บริการอื่นๆ",
    nameEn: "Other Services",
    summary: "ซักผ้าม่าน ซ่อมแซม และบริการหลังการขาย",
  },
];

const D = "/images/products/detail";

/** Deep IA — pillars + categories + children (Company Profile 2026) */
export const productCatalog: ProductCategory[] = [
  {
    slug: "curtain",
    name: "ผ้าม่าน",
    nameEn: "Curtains",
    summary: "ม่านลอน ม่านจีบ ม่านพับ ม่านตาไก่ และงานคัสตอมครบวงจร",
    pillar: 1,
    image: `${D}/curtain/s-wave.png`,
    children: [
      { slug: "s-wave", name: "ม่านลอน", nameEn: "Wave Fold", summary: "ลอนสวยสม่ำเสมอ ดูพรีเมียม" },
      { slug: "pleat", name: "ม่านจีบ", nameEn: "Pinch Pleat", summary: "คลาสสิก ใช้งานแพร่หลาย" },
      { slug: "roman", name: "ม่านพับ", nameEn: "Roman Blind", summary: "เหมาะหน้าต่างบานแคบ/ทรงสูง" },
      { slug: "eyelet", name: "ม่านตาไก่", nameEn: "Eyelet Curtain", summary: "ลอนธรรมชาติ ร้อยรางง่าย" },
      { slug: "waterfall", name: "ม่านน้ำตก", nameEn: "Waterfall Curtain", summary: "ชั้นผ้าไหลพริ้ว สวยหรู" },
      { slug: "tab-top", name: "ม่านคอกระเช้า", nameEn: "Tab Top", summary: "ห่วงผ้าคล้องราง โทนบ้านอบอุ่น" },
      { slug: "louis", name: "ม่านหลุยส์", nameEn: "Swag & Tail", summary: "งานตกแต่งคลาสสิก ประดับหัวม่าน" },
      { slug: "hospital", name: "ม่านโรงพยาบาล", nameEn: "Hospital Cubicle Curtain", summary: "เน้นความสะอาดและมาตรฐานสถานพยาบาล" },
      { slug: "print", name: "ม่านพิมพ์ลาย", nameEn: "Printed Curtain", summary: "พิมพ์ลายตามดีไซน์" },
      { slug: "motorized", name: "ผ้าม่านไฟฟ้า", nameEn: "Motorized Curtain", summary: "ควบคุมด้วยมอเตอร์/สมาร์ทโฮม" },
    ],
  },
  {
    slug: "roller-blinds",
    name: "ม่านม้วน",
    nameEn: "Roller Blinds",
    summary: "ม่านม้วนทั่วไป มอเตอร์ เมจิกสกรีน และพิมพ์ลาย",
    pillar: 1,
    image: `${D}/roller-blinds/standard.png`,
    children: [
      { slug: "standard", name: "ม่านม้วน", nameEn: "Roller Blind", summary: "เรียบหรู ประหยัดพื้นที่" },
      { slug: "motorized", name: "ม่านม้วนไฟฟ้า", nameEn: "Motorized Roller Blind", summary: "มอเตอร์และสมาร์ทโฮม" },
      { slug: "zebra", name: "ม่านม้วนเมจิกสกรีน", nameEn: "Zebra Blind", summary: "ปรับแสงแบบ zebra" },
      { slug: "print", name: "ม่านม้วนพิมพ์ลาย", nameEn: "Printed Roller Blind", summary: "พิมพ์ลายตามแบรนด์/โปรเจกต์" },
    ],
  },
  {
    slug: "venetian-blinds",
    name: "มู่ลี่",
    nameEn: "Venetian Blinds",
    summary: "มู่ลี่ไม้ อลูมิเนียม ไม้ไผ่ และระบบมอเตอร์",
    pillar: 1,
    image: `${D}/venetian-blinds/wood.png`,
    children: [
      { slug: "wood", name: "มู่ลี่ไม้", nameEn: "Wooden Venetian Blind", summary: "อบอุ่น หรูหรา ปรับองศาแสงได้" },
      { slug: "aluminium", name: "มู่ลี่อลูมิเนียม", nameEn: "Aluminium Venetian Blind", summary: "เบา ทนชื้น เช็ดง่าย" },
      { slug: "bamboo", name: "มู่ลี่ไม้ไผ่", nameEn: "Bamboo Blind", summary: "ธรรมชาติ มินิมอล/รีสอร์ต" },
      { slug: "roman-shade", name: "มู่ลี่โรมัน", nameEn: "Roman Shade", summary: "โรมันเชดสำหรับงานตกแต่ง" },
    ],
  },
  {
    slug: "vertical-blinds",
    name: "ม่านปรับแสง",
    nameEn: "Vertical Blinds",
    summary: "ใบแนวตั้งปรับองศาได้ เหมาะอาคารสำนักงานและบานใหญ่",
    pillar: 1,
    image: `${D}/vertical-blinds/standard.png`,
    children: [
      { slug: "standard", name: "ม่านปรับแสง", nameEn: "Vertical Blind", summary: "ควบคุมทิศทางแสงละเอียด" },
    ],
  },
  {
    slug: "pvc-partition",
    name: "ฉากกั้นห้อง",
    nameEn: "Folding Partition",
    summary: "ฉากทึบ ญี่ปุ่น ยูโร USA กั้นแอร์ ประหยัดพลังงาน",
    pillar: 1,
    image: `${D}/pvc-partition/solid.png`,
    children: [
      { slug: "solid", name: "ฉากกั้นทึบ", nameEn: "Solid Partition", summary: "แบ่งสัดส่วนชัดเจน" },
      { slug: "japanese", name: "ฉากญี่ปุ่น", nameEn: "Japanese Partition", summary: "ลายญี่ปุ่นโปร่งเบา" },
      { slug: "euro", name: "ฉากยูโร", nameEn: "Euro Partition", summary: "ช่องอะคริลิคทั้งใบ" },
      { slug: "usa", name: "ฉาก USA", nameEn: "USA Partition", summary: "ช่องอะคริลิคเป็นระยะ" },
    ],
  },
  {
    slug: "outdoor-factory",
    name: "ม่านภายนอกและอุตสาหกรรม",
    nameEn: "Outdoor & Industrial",
    summary: "ม่านม้วนภายนอก รางซิป สกายไลท์ ม่านริ้วพลาสติก",
    pillar: 2,
    image: `${D}/outdoor-factory/outdoor-roller.png`,
    children: [
      {
        slug: "outdoor-roller",
        name: "ม่านม้วนภายนอก",
        nameEn: "Outdoor Roller Blind",
        summary: "กันแดด ฝน สาด",
        group: "outdoor",
      },
      {
        slug: "zip-blind",
        name: "ม่านรางซิป",
        nameEn: "Zip Track Blind",
        summary: "ขอบซิปแน่น ไร้ช่องว่าง",
        group: "outdoor",
      },
      {
        slug: "skylight",
        name: "ม่านสกายไลท์",
        nameEn: "Skylight Blind",
        summary: "บังแดดช่องแสงหลังคา",
        group: "outdoor",
      },
      {
        slug: "pvc-strip",
        name: "ม่านริ้วพลาสติก",
        nameEn: "PVC Strip Curtain",
        summary: "โรงงาน คลัง ห้องเย็น",
        group: "factory",
      },
    ],
  },
  {
    slug: "motorized",
    name: "ม่านไฟฟ้า",
    nameEn: "Motorized Blinds",
    summary: "มอเตอร์รีโมท/Wi‑Fi รองรับสมาร์ทโฮม",
    pillar: 3,
    image: `${D}/motorized/curtain.png`,
    children: [
      { slug: "curtain", name: "ผ้าม่านไฟฟ้า", nameEn: "Motorized Curtain", summary: "เปิด-ปิดอัตโนมัติ" },
      { slug: "roller", name: "ม่านม้วนไฟฟ้า", nameEn: "Motorized Roller Blind", summary: "ควบคุมสะดวกทุกวัน" },
      { slug: "vertical", name: "ม่านปรับแสงไฟฟ้า", nameEn: "Motorized Vertical Blind", summary: "ปรับองศาและเปิด-ปิดด้วยมอเตอร์" },
      { slug: "wood", name: "มู่ลี่ไม้ไฟฟ้า", nameEn: "Motorized Wooden Blind", summary: "มู่ลี่ไม้ระบบมอเตอร์" },
      { slug: "aluminium", name: "มู่ลี่อลูมิเนียมไฟฟ้า", nameEn: "Motorized Aluminium Blind", summary: "มู่ลี่อลูมิเนียมระบบมอเตอร์" },
    ],
  },
  {
    slug: "print-fabric",
    name: "บริการพิมพ์ผ้า",
    nameEn: "Custom Print",
    summary: "ผ้าพิมพ์ ม่านญี่ปุ่น และม่านม้วนพิมพ์ลาย",
    pillar: 5,
    image: `${D}/print-fabric/print.png`,
    children: [
      { slug: "print", name: "ผ้าพิมพ์", nameEn: "Printed Fabric", summary: "พิมพ์ลายตามดีไซน์ แบรนด์ หรือโปรเจกต์" },
      { slug: "noren", name: "ม่านญี่ปุ่น", nameEn: "Noren", summary: "ม่านประตูสไตล์ญี่ปุ่น พิมพ์โลโก้/ลายได้" },
      { slug: "print-roller", name: "ม่านม้วนพิมพ์ลาย", nameEn: "Printed Roller Blind", summary: "ม่านม้วนพิมพ์กราฟิกตามสั่ง" },
    ],
  },
  {
    slug: "surface",
    name: "วอลเปเปอร์และฟิล์ม",
    nameEn: "Wallpaper & Film",
    summary: "ตกแต่งผนังและกรองแสงอาคาร",
    pillar: 6,
    image: `${D}/surface/wallpaper.png`,
    children: [
      { slug: "wallpaper", name: "วอลเปเปอร์", nameEn: "Wallpaper", summary: "ม้วนและพิมพ์ลาย" },
      { slug: "window-film", name: "ฟิล์มอาคาร", nameEn: "Window Film", summary: "ลดร้อน กัน UV" },
    ],
  },
  {
    slug: "service",
    name: "บริการ",
    nameEn: "After-sales Service",
    summary: "ซักผ้าม่าน ซ่อมแซม และบริการหลังการขาย",
    pillar: 7,
    image: `${D}/service/washing.png`,
    children: [
      { slug: "washing", name: "ซักผ้าม่าน", nameEn: "Curtain Cleaning", summary: "ดูแลผืนม่านให้อยู่ในสภาพดี" },
      { slug: "repair", name: "ซ่อมแซมผ้าม่าน", nameEn: "Curtain Repair", summary: "แก้ไขและปรับแต่งงานเดิม" },
    ],
  },
];

export function getPillar(id: ProductPillarId) {
  return PRODUCT_PILLARS.find((p) => p.id === id);
}

export function getCategory(slug: string) {
  return productCatalog.find((c) => c.slug === slug);
}

export function getProduct(categorySlug: string, productSlug: string) {
  const category = getCategory(categorySlug);
  if (!category) return null;
  const product = category.children.find((c) => c.slug === productSlug);
  if (!product) return null;
  return { category, product };
}

export function categoriesForPillar(pillarId: ProductPillarId) {
  return productCatalog.filter((c) => {
    if (pillarId === 2) {
      return c.slug === "outdoor-factory";
    }
    if (pillarId === 4) {
      return false; // factory children surfaced via outdoor-factory
    }
    return c.pillar === pillarId;
  });
}

/** Hub entries for a pillar (categories and/or deep links) */
export type PillarHubItem = {
  href: string;
  name: string;
  nameEn?: string;
  summary: string;
  image: string;
};

export function hubItemsForPillar(pillarId: ProductPillarId): PillarHubItem[] {
  if (pillarId === 2) {
    const cat = getCategory("outdoor-factory");
    if (!cat) return [];
    return cat.children
      .filter((c) => c.group === "outdoor")
      .map((c) => ({
        href: `/products/${cat.slug}/${c.slug}`,
        name: c.name,
        nameEn: c.nameEn,
        summary: c.summary,
        image: childImage(cat, c),
      }));
  }
  if (pillarId === 4) {
    const cat = getCategory("outdoor-factory");
    const child = cat?.children.find((c) => c.slug === "pvc-strip");
    if (!cat || !child) return [];
    return [
      {
        href: `/products/${cat.slug}/${child.slug}`,
        name: child.name,
        nameEn: child.nameEn,
        summary: child.summary,
        image: childImage(cat, child),
      },
    ];
  }
  return productCatalog
    .filter((c) => c.pillar === pillarId)
    .map((c) => ({
      href: `/products/${c.slug}`,
      name: c.name,
      nameEn: c.nameEn,
      summary: c.summary,
      image: c.image,
    }));
}

/** Map catalog category (+ optional child) → /quote PRODUCT_TYPES label */
export function quoteProductType(
  category: ProductCategory,
  child?: ProductChild,
): string {
  switch (category.slug) {
    case "curtain":
      return "ผ้าม่าน";
    case "roller-blinds":
      return "ม่านม้วน";
    case "venetian-blinds":
      return "มู่ลี่";
    case "vertical-blinds":
      return "ม่านปรับแสง";
    case "pvc-partition":
      return "ฉากกั้นห้อง";
    case "outdoor-factory":
      return "ม่านภายนอก/อุตสาหกรรม";
    case "motorized":
      return "ม่านไฟฟ้า";
    case "print-fabric":
      return "อื่นๆ";
    case "surface":
      return child?.slug === "window-film" ? "ฟิล์มอาคาร" : "วอลเปเปอร์";
    case "service":
      return "อื่นๆ";
    default:
      return "อื่นๆ";
  }
}

/** Per-SKU 4:3 catalog photos under /images/products/detail */
export function childImage(category: ProductCategory, child: ProductChild): string {
  return `/images/products/detail/${category.slug}/${child.slug}.png`;
}
