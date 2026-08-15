/**
 * Template / page section defs beyond home + product.
 * Live pages wire EditableSpot; registry marks these pageKeys as editable.
 */
import type { PageSectionRecord, SectionDef } from "@/lib/cms/page-sections";

export const ABOUT_SECTION_DEFS: SectionDef[] = [
  {
    id: "hero",
    label: "Hero เกี่ยวกับเรา",
    description: "หัวข้อ + คำโปรย + รูป",
    fields: [
      { type: "text", key: "eyebrow", label: "ป้ายเล็ก", maxLength: 40 },
      { type: "text", key: "title", label: "หัวข้อ", maxLength: 80 },
      { type: "textarea", key: "lead", label: "คำโปรย" },
      { type: "textarea", key: "body", label: "รายละเอียด" },
      {
        type: "image",
        key: "image",
        label: "รูป Hero",
        aspectClassName: "aspect-[4/5]",
      },
    ],
  },
  {
    id: "oneStop",
    label: "ONE STOP SERVICE",
    description: "บล็อกบริการครบวงจร",
    fields: [
      { type: "text", key: "subtitle", label: "ป้ายเล็ก", maxLength: 40 },
      { type: "text", key: "title", label: "หัวข้อ", maxLength: 60 },
      { type: "textarea", key: "body", label: "รายละเอียด" },
      {
        type: "image",
        key: "image",
        label: "รูป",
        aspectClassName: "aspect-[4/5]",
      },
    ],
  },
];

export const CONTACT_SECTION_DEFS: SectionDef[] = [
  {
    id: "header",
    label: "หัวข้อหน้าติดต่อ",
    description: "ที่อยู่/เบอร์โทรยังดึงจากตั้งค่าบริษัท — แก้ที่นี่ไม่ได้",
    fields: [
      { type: "text", key: "title", label: "หัวข้อ", maxLength: 60 },
      { type: "textarea", key: "subtitle", label: "คำโปรย" },
    ],
  },
];

export const BLOG_POST_SECTION_DEFS: SectionDef[] = [
  {
    id: "cta",
    label: "CTA ท้ายบทความ",
    description: "เทมเพลต — แก้ครั้งเดียวมีผลทุกบทความ",
    fields: [
      { type: "textarea", key: "body", label: "ข้อความ CTA" },
      {
        type: "text",
        key: "quoteLabel",
        label: "ปุ่มขอใบเสนอราคา",
        maxLength: 40,
      },
      {
        type: "text",
        key: "productsLabel",
        label: "ปุ่มดูสินค้า",
        maxLength: 40,
      },
    ],
  },
  {
    id: "related",
    label: "หัวข้อบล็อกที่เกี่ยวข้อง",
    description: "เทมเพลตหัวข้อรายการด้านล่าง",
    fields: [
      {
        type: "text",
        key: "postsHeading",
        label: "หัวข้อบทความอื่น",
        maxLength: 60,
      },
      {
        type: "textarea",
        key: "postsIntro",
        label: "คำโปรยใต้หัวข้อบทความอื่น",
      },
      {
        type: "text",
        key: "worksHeading",
        label: "หัวข้อผลงานที่เกี่ยวข้อง",
        maxLength: 60,
      },
      {
        type: "textarea",
        key: "worksIntro",
        label: "คำโปรยใต้หัวข้อผลงาน",
      },
      {
        type: "text",
        key: "videosHeading",
        label: "หัวข้อคลิปติดตั้ง",
        maxLength: 60,
      },
      {
        type: "textarea",
        key: "videosIntro",
        label: "คำโปรยใต้หัวข้อคลิป",
      },
    ],
  },
];

export const PORTFOLIO_ITEM_SECTION_DEFS: SectionDef[] = [
  {
    id: "cta",
    label: "CTA ท้ายผลงาน",
    description: "เทมเพลต — แก้ครั้งเดียวมีผลทุกผลงาน",
    fields: [
      {
        type: "text",
        key: "quoteLabel",
        label: "ปุ่มขอใบเสนอราคา",
        maxLength: 40,
      },
    ],
  },
  {
    id: "related",
    label: "ผลงานใกล้เคียง",
    description: "หัวข้อรายการผลงานใกล้เคียง",
    fields: [
      {
        type: "text",
        key: "heading",
        label: "หัวข้อผลงานใกล้เคียง",
        maxLength: 60,
      },
      {
        type: "text",
        key: "postsHeading",
        label: "หัวข้อบทความที่เกี่ยวข้อง",
        maxLength: 60,
      },
      {
        type: "text",
        key: "learnHeading",
        label: "หัวข้อห้องเรียนรู้ที่เกี่ยวข้อง",
        maxLength: 60,
      },
    ],
  },
];

export const ABOUT_SECTION_DEFAULTS: Record<string, Record<string, string>> = {
  hero: {
    eyebrow: "เกี่ยวกับเรา",
    title: "A curtain maker who understands you",
    lead:
      "เราเชื่อว่าผ้าม่านไม่ใช่แค่ของตกแต่ง แต่คือองค์ประกอบสำคัญที่สะท้อนตัวตนและไลฟ์สไตล์ของเจ้าของบ้าน",
    body:
      "ช่างตี๋ใส่ใจตั้งแต่ต้นทาง — รับฟังความต้องการ วิเคราะห์แสง ทิศทางลม และบรรยากาศของห้อง เพื่อออกแบบม่านที่สวยและใช้งานได้จริง เพราะสำหรับเรา งานที่ดีไม่ใช่แค่ติดตั้งเสร็จ แต่ต้องทำให้คุณรู้สึก “ใช่” ทุกครั้งที่มองเห็น",
    image: "/images/generated/ct-hero-about.webp",
  },
  oneStop: {
    subtitle: "CURTAIN & BLINDS",
    title: "ONE STOP SERVICE",
    body: "วัดหน้างานฟรี · ออกแบบ · ผลิตที่โรงงานเรา · ติดตั้งโดยช่างมืออาชีพ · รับประกันงานติดตั้ง 1 ปีเต็ม",
    image: "/images/about/installing.webp",
  },
};

export const CONTACT_SECTION_DEFAULTS: Record<string, Record<string, string>> = {
  header: {
    title: "เกี่ยวกับเรา",
    subtitle: "โชว์รูมจริง วัดหน้างานฟรี — คุยแบบ ดูผ้า ขอใบเสนอราคา จบในที่เดียว",
  },
};

export const BLOG_POST_SECTION_DEFAULTS: Record<
  string,
  Record<string, string>
> = {
  cta: {
    body: "อยากให้ช่วยดูว่าบ้านคุณเหมาะกับแบบไหน ทักมาคุยได้เลย เราวัดหน้างานให้ฟรี",
    quoteLabel: "ขอใบเสนอราคา",
    productsLabel: "ดูสินค้าทั้งหมด",
  },
  related: {
    postsHeading: "บทความอื่นที่น่าสนใจ",
    postsIntro:
      "เลือกอ่านต่อจากเนื้อหาใกล้เคียง หรือหัวข้อที่ช่วยตัดสินใจได้มากขึ้น",
    worksHeading: "ผลงานติดตั้งที่เกี่ยวข้อง",
    worksIntro: "ดูตัวอย่างงานจริงที่ใกล้กับเนื้อหาบทความนี้",
    videosHeading: "คลิปติดตั้งจริง",
    videosIntro: "ดูงานหน้างานจาก YouTube — กดเล่นได้เลยในเว็บ",
  },
};

export const PORTFOLIO_ITEM_SECTION_DEFAULTS: Record<
  string,
  Record<string, string>
> = {
  cta: {
    quoteLabel: "ขอใบเสนอราคา",
  },
  related: {
    heading: "ผลงานใกล้เคียง",
    postsHeading: "บทความที่เกี่ยวข้อง",
    learnHeading: "ห้องเรียนรู้ที่เกี่ยวข้อง",
  },
};

function seedFromDefs(
  pageKey: string,
  defs: SectionDef[],
  defaults: Record<string, Record<string, string>>,
): PageSectionRecord[] {
  const now = new Date().toISOString();
  return defs.map((def) => ({
    pageKey,
    sectionId: def.id,
    enabled: true,
    values: { ...(defaults[def.id] ?? {}) },
    updatedAt: now,
  }));
}

export function seedAboutSectionRecords() {
  return seedFromDefs("about", ABOUT_SECTION_DEFS, ABOUT_SECTION_DEFAULTS);
}

export function seedContactSectionRecords() {
  return seedFromDefs("contact", CONTACT_SECTION_DEFS, CONTACT_SECTION_DEFAULTS);
}

export function seedBlogPostSectionRecords() {
  return seedFromDefs(
    "blogPost",
    BLOG_POST_SECTION_DEFS,
    BLOG_POST_SECTION_DEFAULTS,
  );
}

export function seedPortfolioItemSectionRecords() {
  return seedFromDefs(
    "portfolioItem",
    PORTFOLIO_ITEM_SECTION_DEFS,
    PORTFOLIO_ITEM_SECTION_DEFAULTS,
  );
}
