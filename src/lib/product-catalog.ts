export type ProductChild = {
  slug: string;
  name: string;
  summary: string;
};

export type ProductCategory = {
  slug: string;
  name: string;
  nameEn: string;
  summary: string;
  children: ProductChild[];
};

/** Deep IA aligned with legacy site + Company Profile 2026 */
export const productCatalog: ProductCategory[] = [
  {
    slug: "curtain",
    name: "ผ้าม่าน",
    nameEn: "Curtain",
    summary: "ม่านลอน ม่านจีบ ม่านพับ ม่านตาไก่ และงานคัสตอมครบวงจร",
    children: [
      { slug: "s-wave", name: "ม่านลอน", summary: "ลอนสวยสม่ำเสมอ ดูพรีเมียม" },
      { slug: "pleat", name: "ม่านจีบ", summary: "คลาสสิก ใช้งานแพร่หลาย" },
      { slug: "roman", name: "ม่านพับ", summary: "เหมาะหน้าต่างบานแคบ/ทรงสูง" },
      { slug: "eyelet", name: "ม่านตาไก่", summary: "ลอนธรรมชาติ ร้อยรางง่าย" },
      { slug: "hospital", name: "ม่านโรงพยาบาล", summary: "เน้นความสะอาดและมาตรฐานสถานพยาบาล" },
      { slug: "print", name: "ม่านพิมพ์ลาย", summary: "พิมพ์ลายตามดีไซน์" },
      { slug: "motorized", name: "ผ้าม่านไฟฟ้า", summary: "ควบคุมด้วยมอเตอร์/สมาร์ทโฮม" },
    ],
  },
  {
    slug: "roller-blinds",
    name: "ม่านม้วน",
    nameEn: "Roller Blinds",
    summary: "ม่านม้วนทั่วไป มอเตอร์ เมจิกสกรีน และพิมพ์ลาย",
    children: [
      { slug: "standard", name: "ม่านม้วน", summary: "เรียบหรู ประหยัดพื้นที่" },
      { slug: "motorized", name: "ม่านม้วนไฟฟ้า", summary: "มอเตอร์และสมาร์ทโฮม" },
      { slug: "zebra", name: "ม่านม้วนเมจิกสกรีน", summary: "ปรับแสงแบบ zebra" },
      { slug: "print", name: "ม่านม้วนพิมพ์ลาย", summary: "พิมพ์ลายตามแบรนด์/โปรเจกต์" },
    ],
  },
  {
    slug: "venetian-blinds",
    name: "มู่ลี่",
    nameEn: "Venetian Blinds",
    summary: "มู่ลี่ไม้ อลูมิเนียม ไม้ไผ่ และระบบมอเตอร์",
    children: [
      { slug: "wood", name: "มู่ลี่ไม้", summary: "อบอุ่น หรูหรา ปรับองศาแสงได้" },
      { slug: "aluminium", name: "มู่ลี่อลูมิเนียม", summary: "เบา ทนชื้น เช็ดง่าย" },
      { slug: "bamboo", name: "มู่ลี่ไม้ไผ่", summary: "ธรรมชาติ มินิมอล/รีสอร์ต" },
      { slug: "roman-shade", name: "มู่ลี่โรมัน", summary: "โรมันเชดสำหรับงานตกแต่ง" },
      { slug: "panel", name: "พาแนล", summary: "Panel blinds แบ่งพื้นที่" },
    ],
  },
  {
    slug: "vertical-blinds",
    name: "ม่านปรับแสง",
    nameEn: "Vertical Blinds",
    summary: "ใบแนวตั้งปรับองศาได้ เหมาะอาคารสำนักงานและบานใหญ่",
    children: [
      { slug: "standard", name: "ม่านปรับแสง", summary: "ควบคุมทิศทางแสงละเอียด" },
    ],
  },
  {
    slug: "pvc-partition",
    name: "ฉากกั้นห้อง",
    nameEn: "PVC Folding Door",
    summary: "ฉากทึบ ญี่ปุ่น ยูโร USA กั้นแอร์ ประหยัดพลังงาน",
    children: [
      { slug: "solid", name: "ฉากกั้นทึบ", summary: "แบ่งสัดส่วนชัดเจน" },
      { slug: "japanese", name: "ฉากญี่ปุ่น", summary: "ลายญี่ปุ่นโปร่งเบา" },
      { slug: "euro", name: "ฉากยูโร", summary: "ช่องอะคริลิคทั้งใบ" },
      { slug: "usa", name: "ฉาก USA", summary: "ช่องอะคริลิคเป็นระยะ" },
    ],
  },
  {
    slug: "motorized",
    name: "ม่านไฟฟ้า",
    nameEn: "Motorized",
    summary: "มอเตอร์รีโมท/Wi‑Fi รองรับสมาร์ทโฮม",
    children: [
      { slug: "curtain", name: "ผ้าม่านไฟฟ้า", summary: "เปิด-ปิดอัตโนมัติ" },
      { slug: "roller", name: "ม่านม้วนไฟฟ้า", summary: "ควบคุมสะดวกทุกวัน" },
    ],
  },
  {
    slug: "surface",
    name: "วอลเปเปอร์และฟิล์ม",
    nameEn: "Wallpaper & Film",
    summary: "ตกแต่งผนังและกรองแสงอาคาร",
    children: [
      { slug: "wallpaper", name: "วอลเปเปอร์", summary: "ม้วนและพิมพ์ลาย" },
      { slug: "window-film", name: "ฟิล์มอาคาร", summary: "ลดร้อน กัน UV" },
    ],
  },
  {
    slug: "outdoor-factory",
    name: "ม่านภายนอกและอุตสาหกรรม",
    nameEn: "Outdoor & Factory",
    summary: "ม่านม้วนภายนอก รางซิป สกายไลท์ ม่านริ้วพลาสติก",
    children: [
      { slug: "outdoor-roller", name: "ม่านม้วนภายนอก", summary: "กันแดด ฝน สาด" },
      { slug: "zip-blind", name: "ม่านรางซิป", summary: "ขอบซิปแน่น ไร้ช่องว่าง" },
      { slug: "skylight", name: "ม่านสกายไลท์", summary: "บังแดดช่องแสงหลังคา" },
      { slug: "pvc-strip", name: "ม่านริ้วพลาสติก", summary: "โรงงาน คลัง ห้องเย็น" },
    ],
  },
  {
    slug: "service",
    name: "บริการ",
    nameEn: "Service",
    summary: "ซักผ้าม่าน ซ่อมแซม และบริการหลังการขาย",
    children: [
      { slug: "washing", name: "ซักผ้าม่าน", summary: "ดูแลผืนม่านให้อยู่ในสภาพดี" },
      { slug: "repair", name: "ซ่อมแซมผ้าม่าน", summary: "แก้ไขและปรับแต่งงานเดิม" },
    ],
  },
];

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
