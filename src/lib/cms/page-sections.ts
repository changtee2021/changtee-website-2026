/**
 * Locked-layout Section CMS — edit text/images only; layout stays in React.
 * Stored in local demo-store until Supabase changtee_web is wired.
 */

export type SectionFieldType = "text" | "textarea" | "image" | "link";

export type SectionFieldDef = {
  type: SectionFieldType;
  key: string;
  label: string;
  maxLength?: number;
  aspectClassName?: string;
  /** Hint under the field */
  hint?: string;
};

export type SectionDef = {
  id: string;
  label: string;
  description: string;
  fields: SectionFieldDef[];
};

export type PageSectionRecord = {
  pageKey: string;
  sectionId: string;
  enabled: boolean;
  values: Record<string, string>;
  updatedAt: string;
};

export function sectionStoreKey(pageKey: string, sectionId: string) {
  return `${pageKey}::${sectionId}`;
}

/** Homepage modules (layout locked in src/components/home/*) */
export const HOME_SECTION_DEFS: SectionDef[] = [
  {
    id: "products",
    label: "กริดสินค้า",
    description: "รูป 8 ช่อง + ลิงก์ไปหมวด/รุ่น — โครงกริดล็อกไว้",
    fields: [
      {
        type: "text",
        key: "allLinkLabel",
        label: "ข้อความลิงก์ดูทั้งหมด",
        maxLength: 40,
      },
      { type: "image", key: "tile1Image", label: "รูป 1 — ผ้าม่าน", aspectClassName: "aspect-[3/4]" },
      { type: "text", key: "tile1Name", label: "ชื่อ 1", maxLength: 40 },
      { type: "link", key: "tile1Href", label: "ลิงก์ 1" },
      { type: "image", key: "tile2Image", label: "รูป 2 — ม่านม้วน", aspectClassName: "aspect-[3/4]" },
      { type: "text", key: "tile2Name", label: "ชื่อ 2", maxLength: 40 },
      { type: "link", key: "tile2Href", label: "ลิงก์ 2" },
      { type: "image", key: "tile3Image", label: "รูป 3 — มู่ลี่", aspectClassName: "aspect-[3/4]" },
      { type: "text", key: "tile3Name", label: "ชื่อ 3", maxLength: 40 },
      { type: "link", key: "tile3Href", label: "ลิงก์ 3" },
      { type: "image", key: "tile4Image", label: "รูป 4 — ม่านปรับแสง", aspectClassName: "aspect-[3/4]" },
      { type: "text", key: "tile4Name", label: "ชื่อ 4", maxLength: 40 },
      { type: "link", key: "tile4Href", label: "ลิงก์ 4" },
      { type: "image", key: "tile5Image", label: "รูป 5 — ฉากกั้น", aspectClassName: "aspect-[3/4]" },
      { type: "text", key: "tile5Name", label: "ชื่อ 5", maxLength: 40 },
      { type: "link", key: "tile5Href", label: "ลิงก์ 5" },
      { type: "image", key: "tile6Image", label: "รูป 6 — พิมพ์ลาย", aspectClassName: "aspect-[3/4]" },
      { type: "text", key: "tile6Name", label: "ชื่อ 6", maxLength: 40 },
      { type: "link", key: "tile6Href", label: "ลิงก์ 6" },
      { type: "image", key: "tile7Image", label: "รูป 7 — วอล/ฟิล์ม", aspectClassName: "aspect-[3/4]" },
      { type: "text", key: "tile7Name", label: "ชื่อ 7", maxLength: 40 },
      { type: "link", key: "tile7Href", label: "ลิงก์ 7" },
      { type: "image", key: "tile8Image", label: "รูป 8", aspectClassName: "aspect-[3/4]" },
      { type: "text", key: "tile8Name", label: "ชื่อ 8", maxLength: 40 },
      { type: "link", key: "tile8Href", label: "ลิงก์ 8" },
    ],
  },
  {
    id: "portfolio",
    label: "ผลงานติดตั้ง",
    description: "หัวข้อบล็อกผลงานหน้าแรก (รายการดึงจาก CMS ผลงาน)",
    fields: [
      { type: "text", key: "title", label: "หัวข้อ", maxLength: 60 },
      { type: "textarea", key: "subtitle", label: "คำโปรย" },
    ],
  },
  {
    id: "howItWorks",
    label: "ขั้นตอนเริ่มต้น",
    description: "บล็อก How it works — หัวข้อ + 3 สเต็ป",
    fields: [
      { type: "text", key: "titleLine1", label: "หัวข้อบรรทัด 1", maxLength: 50 },
      { type: "text", key: "titleLine2", label: "หัวข้อบรรทัด 2", maxLength: 50 },
      { type: "textarea", key: "intro", label: "คำอธิบายซ้าย" },
      { type: "text", key: "step1Title", label: "Step 1 — หัวข้อ", maxLength: 50 },
      { type: "textarea", key: "step1Desc", label: "Step 1 — รายละเอียด" },
      { type: "text", key: "step2Title", label: "Step 2 — หัวข้อ", maxLength: 50 },
      { type: "textarea", key: "step2Desc", label: "Step 2 — รายละเอียด" },
      { type: "text", key: "step3Title", label: "Step 3 — หัวข้อ", maxLength: 50 },
      { type: "textarea", key: "step3Desc", label: "Step 3 — รายละเอียด" },
    ],
  },
  {
    id: "stats",
    label: "ตัวเลข + เรื่องราว",
    description: "สถิติ 3 แถว + รูป + เรื่องโรงงาน",
    fields: [
      { type: "text", key: "stat1Value", label: "ตัวเลข 1", maxLength: 20 },
      { type: "textarea", key: "stat1Label", label: "คำอธิบาย 1" },
      { type: "text", key: "stat2Value", label: "ตัวเลข 2", maxLength: 20 },
      { type: "textarea", key: "stat2Label", label: "คำอธิบาย 2" },
      { type: "text", key: "stat3Value", label: "ตัวเลข 3", maxLength: 20 },
      { type: "textarea", key: "stat3Label", label: "คำอธิบาย 3" },
      {
        type: "image",
        key: "image",
        label: "รูปกลาง",
        aspectClassName: "aspect-[4/5]",
      },
      { type: "text", key: "storyTitle", label: "หัวข้อเรื่องราว", maxLength: 80 },
      { type: "textarea", key: "storyP1", label: "ย่อหน้า 1" },
      { type: "textarea", key: "storyP2", label: "ย่อหน้า 2" },
      {
        type: "text",
        key: "showroomLabel",
        label: "ลิงก์โชว์รูม (ข้อความ)",
        maxLength: 40,
        hint: "เปิด Google Maps ร้านจาก site config",
      },
    ],
  },
  {
    id: "contactCta",
    label: "CTA ท้ายหน้า",
    description: "บล็อกอยากรู้ราคา / ทัก LINE",
    fields: [
      { type: "text", key: "titleLine1", label: "หัวข้อบรรทัด 1", maxLength: 50 },
      { type: "text", key: "titleLine2", label: "หัวข้อบรรทัด 2", maxLength: 50 },
      { type: "textarea", key: "body", label: "ข้อความอธิบาย" },
      { type: "text", key: "quoteLabel", label: "ปุ่มขอใบเสนอราคา", maxLength: 40 },
      { type: "text", key: "lineLabel", label: "ปุ่ม LINE", maxLength: 40 },
      {
        type: "image",
        key: "image",
        label: "รูปด้านขวา",
        aspectClassName: "aspect-[4/3]",
      },
    ],
  },
];

export const HOME_SECTION_DEFAULTS: Record<string, Record<string, string>> = {
  products: {
    allLinkLabel: "ดูสินค้าทั้งหมด",
    tile1Image: "/images/products/p1.png",
    tile1Name: "ผ้าม่าน",
    tile1Href: "/products/curtain",
    tile2Image: "/images/products/p2.png",
    tile2Name: "ม่านม้วน",
    tile2Href: "/products/roller-blinds",
    tile3Image: "/images/products/p3.png",
    tile3Name: "มู่ลี่",
    tile3Href: "/products/venetian-blinds",
    tile4Image: "/images/products/p4.png",
    tile4Name: "ม่านปรับแสง",
    tile4Href: "/products/vertical-blinds",
    tile5Image: "/images/products/p5.png",
    tile5Name: "ฉากกั้นห้อง",
    tile5Href: "/products/pvc-partition",
    tile6Image: "/images/products/print-curtain.png",
    tile6Name: "ม่านพิมพ์ลาย",
    tile6Href: "/products/curtain/print",
    tile7Image: "/images/products/p7.png",
    tile7Name: "วอลเปเปอร์/ฟิล์ม",
    tile7Href: "/products/surface",
    tile8Image: "/images/products/venetian-aluminium.png",
    tile8Name: "มู่ลี่อลูมิเนียม",
    tile8Href: "/products/venetian-blinds/aluminium",
  },
  portfolio: {
    title: "ผลงานติดตั้งจริง",
    subtitle: "บ้าน คอนโด ร้านค้า ออฟฟิศ — กดดูรายละเอียดได้เลย",
  },
  howItWorks: {
    titleLine1: "เพิ่งเริ่มเลือกผ้าม่าน?",
    titleLine2: "เริ่มตรงนี้ได้เลย",
    intro:
      "ไม่ต้องรู้เรื่องผ้าม่านมาก่อนก็ได้ บอกแค่ห้องไหน อยากได้แบบไหน ที่เหลือเราช่วยดูให้",
    step1Title: "คุยแล้วออกแบบให้",
    step1Desc:
      "บอกห้องที่อยากติดและสไตล์ที่ชอบ เราช่วยเลือกผ้ากับแบบม่านให้เหมาะกับการใช้งานจริง",
    step2Title: "เข้าวัดหน้างานฟรี",
    step2Desc:
      "ทีมเข้าไปวัดพื้นที่จริงอย่างละเอียด สรุปราคาให้ชัดก่อนตัดสินใจ ไม่มีค่าใช้จ่าย",
    step3Title: "ส่งและติดตั้งให้จบ",
    step3Desc:
      "ผลิตที่โรงงานเราเอง ส่งตรงเวลา ช่างติดตั้งเก็บงานเรียบร้อย พร้อมรับประกัน 1 ปี",
  },
  stats: {
    stat1Value: "1,000+",
    stat1Label:
      "ลูกค้าที่ไว้ใจให้เราดูแล ตั้งแต่บ้านหลังเล็กจนถึงโปรเจกต์องค์กร",
    stat2Value: "10,000+",
    stat2Label: "งานติดตั้งที่ผ่านมือทีมช่างของเราเอง ทุกผืนตรวจก่อนส่งมอบ",
    stat3Value: "77",
    stat3Label: "จังหวัดที่เราพร้อมเดินทางไปติดตั้งให้ถึงหน้างาน",
    image: "/images/generated/ct-showroom.webp",
    storyTitle: "จากโรงงานคลองสามวา ถึงหน้าต่างบ้านคุณ",
    storyP1:
      "เราเริ่มจากร้านผ้าม่านเล็กๆ ที่รับงานเองทุกขั้นตอน วันนี้ยังทำแบบเดิม คือวัดเอง เย็บเอง ติดตั้งเอง เพราะอยากรู้ว่างานที่ส่งถึงลูกค้าเป็นยังไง",
    storyP2:
      "แวะมาที่โชว์รูมได้ มีตัวอย่างผ้าให้จับของจริง เทียบสีกับแสงในห้อง แล้วค่อยตัดสินใจ ไม่ต้องรีบ",
    showroomLabel: "โชว์รูม",
  },
  contactCta: {
    titleLine1: "อยากรู้ราคาคร่าวๆ ก่อน?",
    titleLine2: "ทักมาถามได้เลย",
    body: "ส่งรูปห้องหรือขนาดหน้าต่างมาทาง LINE เราตีราคาเบื้องต้นให้ก่อนได้ ถ้าสนใจค่อยนัดวัดหน้างานฟรี",
    quoteLabel: "ขอใบเสนอราคาฟรี",
    lineLabel: "แอดไลน์คุยกับเรา",
    image: "/images/generated/ct-showroom.webp",
  },
};

/** Product page modules — one set shared by every product detail page */
export const PRODUCT_PAGE_KEY = "product";

export const PRODUCT_SECTION_DEFS: SectionDef[] = [
  {
    id: "benefits",
    label: "จุดเด่น (Key benefits)",
    description: "หัวข้อ + 3 การ์ด (รูปยังใช้จากระบบสินค้า / แก้ข้อความได้)",
    fields: [
      { type: "text", key: "eyebrow", label: "ป้ายเล็ก (EN)", maxLength: 40 },
      { type: "text", key: "heading", label: "หัวข้อหลัก", maxLength: 60 },
      { type: "text", key: "card1Label", label: "การ์ด 1 — หัวข้อ", maxLength: 40 },
      { type: "textarea", key: "card1Detail", label: "การ์ด 1 — รายละเอียด" },
      {
        type: "image",
        key: "card1Image",
        label: "การ์ด 1 — รูป",
        aspectClassName: "aspect-[8/5]",
        hint: "ว่าง = ใช้รูปจากระบบสินค้า",
      },
      { type: "text", key: "card2Label", label: "การ์ด 2 — หัวข้อ", maxLength: 40 },
      { type: "textarea", key: "card2Detail", label: "การ์ด 2 — รายละเอียด" },
      {
        type: "image",
        key: "card2Image",
        label: "การ์ด 2 — รูป",
        aspectClassName: "aspect-[8/5]",
        hint: "ว่าง = ใช้รูปจากระบบสินค้า",
      },
      { type: "text", key: "card3Label", label: "การ์ด 3 — หัวข้อ", maxLength: 40 },
      { type: "textarea", key: "card3Detail", label: "การ์ด 3 — รายละเอียด" },
      {
        type: "image",
        key: "card3Image",
        label: "การ์ด 3 — รูป",
        aspectClassName: "aspect-[8/5]",
        hint: "ว่าง = ใช้รูปจากระบบสินค้า",
      },
    ],
  },
  {
    id: "style",
    label: "Style consultant",
    description: "หัวข้อและคำโปรยบล็อกสไตล์ห้อง (สเต็ป/รูปสไตล์ยังตามระบบสินค้า)",
    fields: [
      { type: "text", key: "eyebrow", label: "ป้ายเล็ก (EN)", maxLength: 40 },
      { type: "text", key: "heading", label: "หัวข้อ", maxLength: 60 },
      { type: "textarea", key: "intro", label: "คำโปรย / intro" },
      { type: "text", key: "stylesHeading", label: "หัวข้อแถวสไตล์แนะนำ", maxLength: 60 },
    ],
  },
  {
    id: "cta",
    label: "แถบ CTA ท้ายหน้า",
    description: "ข้อความใต้หัวข้อสนใจ{ชื่อสินค้า}",
    fields: [
      {
        type: "textarea",
        key: "subtitle",
        label: "ข้อความรอง",
        hint: "หัวข้อหลักใช้ชื่อสินค้าอัตโนมัติ เช่น สนใจม่านม้วน?",
      },
    ],
  },
];

export const PRODUCT_SECTION_DEFAULTS: Record<string, Record<string, string>> = {
  benefits: {
    eyebrow: "Key benefits",
    heading: "จุดเด่นที่สัมผัสได้",
    card1Label: "",
    card1Detail: "",
    card1Image: "",
    card2Label: "",
    card2Detail: "",
    card2Image: "",
    card3Label: "",
    card3Detail: "",
    card3Image: "",
  },
  style: {
    eyebrow: "Style consultant",
    heading: "เหมาะกับห้องสไตล์ไหน?",
    intro: "",
    stylesHeading: "สไตล์ห้องที่ทีมงานแนะนำ",
  },
  cta: {
    subtitle: "นัดวัดหน้างานหรือขอใบเสนอราคา — ทีมงานติดต่อกลับให้",
  },
};

/** Shared page key for every product detail CMS section */
export function productPageKey() {
  return PRODUCT_PAGE_KEY;
}

export function mergeSectionValues(
  defaults: Record<string, string>,
  stored?: Record<string, string> | null,
): Record<string, string> {
  return { ...defaults, ...(stored ?? {}) };
}

export function seedHomeSectionRecords(): PageSectionRecord[] {
  const now = new Date().toISOString();
  return HOME_SECTION_DEFS.map((def) => ({
    pageKey: "home",
    sectionId: def.id,
    enabled: true,
    values: { ...(HOME_SECTION_DEFAULTS[def.id] ?? {}) },
    updatedAt: now,
  }));
}

export function seedProductSectionRecords(): PageSectionRecord[] {
  const now = new Date().toISOString();
  return PRODUCT_SECTION_DEFS.map((def) => ({
    pageKey: PRODUCT_PAGE_KEY,
    sectionId: def.id,
    enabled: true,
    values: { ...(PRODUCT_SECTION_DEFAULTS[def.id] ?? {}) },
    updatedAt: now,
  }));
}
