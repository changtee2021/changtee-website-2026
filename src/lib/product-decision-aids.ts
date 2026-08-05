import { CATEGORY_CONTEXT } from "@/lib/product-presentation";
import { DEMO_REVIEWS, type ReviewItem } from "@/lib/cms/reviews-demo";
import { siteConfig } from "@/lib/site-config";

export type CompareColumn = {
  id: string;
  name: string;
  /** Link to a child product when available */
  productSlug?: string;
  light: string;
  bestFor: string;
  note: string;
};

export type CompareTable = {
  title: string;
  subtitle: string;
  columns: CompareColumn[];
};

export type BeforeAfterPair = {
  id: string;
  title: string;
  place: string;
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  /** Optional YouTube / short clip */
  videoUrl?: string;
};

export type PrepGuide = {
  title: string;
  intro: string;
  measureTips: string[];
  prepareItems: string[];
};

export type InstallVideoClip = {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  /** Real watch URL when ready; empty = mock → YouTube channel */
  videoUrl?: string;
};

const CTX = "/images/products/context";
const DETAIL = "/images/products/detail";
const GEN = "/images/generated";

const DEFAULT_PREP: PrepGuide = {
  title: "เตรียมอะไรก่อนช่างมาวัด",
  intro:
    "วัดหน้างานฟรีในพื้นที่บริการ — เตรียมข้อมูลคร่าวๆ ช่วยให้ประเมินผ้า ขนาด และใบเสนอราคาได้เร็วขึ้น",
  measureTips: [
    "ถ่ายรูปหน้าต่าง/บานประตูทั้งบานจากระยะกลางห้อง",
    "บอกทิศแดด (เช้า/บ่าย) และว่าต้องการโปร่ง ลดแดด หรือทึบสนิท",
    "ถ้ามีแบบห้องหรือขนาดคร่าวๆ (กว้าง×สูง ซม.) ส่งมาได้เลย — ช่างจะวัดซ้ำหน้างานอยู่ดี",
  ],
  prepareItems: [
    "เคลียร์พื้นที่หน้าต่างให้ช่างเข้าถึงได้ (ย้ายของบังบานชั่วคราว)",
    "มีผู้ตัดสินใจอยู่หน้างานหรือพร้อมคุย LINE ตอนวัด",
    "แจ้งชั้น/ที่จอด/เวลาเข้าอาคารถ้าเป็นคอนโดหรือออฟฟิศ",
    "ถ้ามีโทนเฟอร์นิเจอร์ที่อยากจับคู่ เตรียมรูปหรือตัวอย่างสีไว้",
  ],
};

const PREP_BY_CATEGORY: Record<string, Partial<PrepGuide>> = {
  curtain: {
    intro:
      "ม่านผ้าต้องดูระยะราง ความสูงฝ้า และชั้นผ้า — เตรียมรูปบานและทิศแดดไว้ก่อนนัดวัด",
    measureTips: [
      ...DEFAULT_PREP.measureTips,
      "บอกว่าต้องการชั้นเดียวหรือโปร่ง+ทึบ และสไตล์จีบ/ลอนที่สนใจ",
    ],
  },
  "roller-blinds": {
    intro:
      "ม่านม้วนวัดระยะกล่องม้วนและขอบบานละเอียด — บอกชนิดผ้า (กรองแสง/ทึบ/zebra) ที่สนใจไว้ล่วงหน้าได้",
    measureTips: [
      "ถ่ายรูปบานหน้าต่างและระยะเหนือวงกบ (มีที่ติดกล่องม้วนไหม)",
      "บอกว่าติดในวงกบหรือนอกวงกบ และต้องการบังแสงระดับไหน",
      "ถ้ามีจอคอม/ทีวี แจ้งตำแหน่งเพื่อเลือก sunscreen หรือทึบให้เหมาะ",
    ],
  },
  "venetian-blinds": {
    intro: "มู่ลี่ต้องเช็กองศาใบและความชื้นห้องน้ำ/ครัว — เตรียมรูปบานและความสูงฝ้าไว้",
  },
  "vertical-blinds": {
    intro:
      "ม่านปรับแสงเหมาะบานกว้าง — บอกทิศแสงและว่าต้องการเลื่อนเปิดทางไหนเป็นหลัก",
  },
  "pvc-partition": {
    title: "เตรียมอะไรก่อนช่างมาดูหน้างาน",
    intro:
      "ฉากกั้นต้องดูระยะพื้น–ฝ้าและทิศเปิดใบ — เตรียมแปลนคร่าวๆ หรือรูปมุมห้องที่จะกั้น",
    measureTips: [
      "ถ่ายมุมห้องที่จะกั้นทั้งช่วงกว้างและความสูงฝ้า",
      "บอกว่าต้องการทึบ โปร่ง หรือมีช่องอะคริลิค",
      "แจ้งทิศเปิด–เก็บฉากและจุดที่ต้องเว้นประตู/ทางเดิน",
    ],
  },
  "outdoor-factory": {
    title: "เตรียมอะไรก่อนช่างมาหน้างาน",
    intro:
      "งานนอกอาคาร/โรงงานต้องดูโครงสร้างยึดและสภาพแดดฝน — เตรียมรูปหน้างานและขนาดคร่าวๆ",
    prepareItems: [
      "จัดทางเข้าหน้างานและจุดยึดโครงสร้างให้เข้าถึงได้",
      "มีผู้ดูแลไซต์หรือช่างประจำอยู่ด้วยตอนวัด",
      "แจ้งข้อจำกัดเวลาเข้าพื้นที่/ความสูงนั่งร้าน",
      "ส่งรูปและขนาดคร่าวๆ มาก่อนนัดได้ทาง LINE",
    ],
  },
  motorized: {
    intro:
      "งานมอเตอร์ต้องเช็กไฟ/สวิตช์และน้ำหนักผ้า — เตรียมตำแหน่งปลั๊กและว่าจะใช้รีโมทหรือสมาร์ทโฮม",
    measureTips: [
      "ถ่ายรูปตำแหน่งราง/กล่องม้วนและจุดมีไฟใกล้เคียง",
      "บอกแบรนด์สมาร์ทโฮมที่มีอยู่ (ถ้ามี) หรือใช้รีโมทอย่างเดียว",
      "แจ้งจำนวนบานและว่าต้องการคุมรวมหรือแยกโซน",
    ],
  },
  "print-fabric": {
    intro:
      "งานพิมพ์ต้องไฟล์ลายและความละเอียดภาพ — เตรียมโลโก้/ลาย (AI/PDF/PNG) และขนาดบานโดยประมาณ",
  },
  surface: {
    title: "เตรียมอะไรก่อนช่างมาหน้างาน",
    intro:
      "วอลเปเปอร์/ฟิล์มต้องดูสภาพผนังและกระจก — ถ่ายรูปพื้นที่และบอกขนาดคร่าวๆ ได้",
  },
  service: {
    title: "เตรียมอะไรก่อนช่างมารับงาน",
    intro:
      "งานซัก/ซ่อม — ถ่ายรูปสภาพผืนม่านและบอกชนิดราง/ขนาดคร่าวๆ จะประเมินคิวได้เร็วขึ้น",
    prepareItems: [
      "ถ่ายรูปจุดชำรุดหรือคราบที่ต้องการแก้",
      "แจ้งชนิดม่านและจำนวนบานโดยประมาณ",
      "นัดวันสะดวกรับ–ส่งผืนหรือให้ช่างถอดหน้างาน",
      "เตรียมพื้นที่จอด/เข้าอาคารในวันนัด",
    ],
  },
};

const COMPARE_BY_CATEGORY: Record<string, CompareTable> = {
  "roller-blinds": {
    title: "เทียบชนิดม่านม้วน",
    subtitle: "เลือกตามระดับแสงและการใช้งานประจำวัน",
    columns: [
      {
        id: "sheer",
        name: "กรองแสง (Sunscreen)",
        productSlug: "standard",
        light: "ลดแดด ยังมองออกนอกได้",
        bestFor: "ออฟฟิศ · คาเฟ่ · ห้องนั่งเล่น",
        note: "จอคอมสะท้อนน้อย ไม่อึดอัด",
      },
      {
        id: "blackout",
        name: "ทึบแสง (Blackout)",
        productSlug: "standard",
        light: "มืดสนิท/เกือบสนิท",
        bestFor: "ห้องนอน · ห้องฉายภาพ",
        note: "ความเป็นส่วนตัวสูง",
      },
      {
        id: "zebra",
        name: "Zebra / Magic Screen",
        productSlug: "zebra",
        light: "สลับโปร่ง–ทึบในผืนเดียว",
        bestFor: "คอนโด · ห้องที่อยากปรับแสงบ่อย",
        note: "คุมบรรยากาศได้ละเอียด",
      },
      {
        id: "print",
        name: "พิมพ์ลาย",
        productSlug: "print",
        light: "ตามผ้าฐานที่เลือก",
        bestFor: "แบรนด์ · โปรเจกต์เฉพาะ",
        note: "ลายตามไฟล์ของคุณ",
      },
    ],
  },
  curtain: {
    title: "เทียบสไตล์ผ้าม่าน",
    subtitle: "เลือกรูปแบบจีบ/ลอนให้เข้าห้อง",
    columns: [
      {
        id: "s-wave",
        name: "ม่านลอน",
        productSlug: "s-wave",
        light: "โปร่งหรือทึบตามผ้า",
        bestFor: "บ้านโมเดิร์น · โรงแรม",
        note: "ลอนสม่ำเสมอ ดูพรีเมียม",
      },
      {
        id: "pleat",
        name: "ม่านจีบ",
        productSlug: "pleat",
        light: "โปร่งหรือทึบตามผ้า",
        bestFor: "บ้านทั่วไป · งานคลาสสิก",
        note: "ใช้งานแพร่หลาย ดูแลง่าย",
      },
      {
        id: "eyelet",
        name: "ม่านตาไก่",
        productSlug: "eyelet",
        light: "โปร่งหรือทึบตามผ้า",
        bestFor: "ห้องที่อยากลอนธรรมชาติ",
        note: "ร้อยรางง่าย บรรยากาศสบาย",
      },
      {
        id: "roman",
        name: "ม่านพับ",
        productSlug: "roman",
        light: "คุมแสงดีเมื่อพับลง",
        bestFor: "บานแคบ · ทรงสูง",
        note: "ประหยัดข้างบาน",
      },
    ],
  },
  "venetian-blinds": {
    title: "เทียบชนิดมู่ลี่",
    subtitle: "เลือกวัสดุให้เข้าความชื้นและสไตล์ห้อง",
    columns: [
      {
        id: "wood",
        name: "มู่ลี่ไม้",
        productSlug: "wood",
        light: "ปรับองศาละเอียด",
        bestFor: "ห้องนั่งเล่น · ห้องทำงาน",
        note: "โทนอบอุ่น หรู",
      },
      {
        id: "aluminium",
        name: "มู่ลี่อลูมิเนียม",
        productSlug: "aluminium",
        light: "ปรับองศาละเอียด",
        bestFor: "ครัว · ห้องชื้น",
        note: "เบา เช็ดง่าย ทนชื้น",
      },
      {
        id: "bamboo",
        name: "มู่ลี่ไม้ไผ่",
        productSlug: "bamboo",
        light: "กรองแสงธรรมชาติ",
        bestFor: "รีสอร์ต · มินิมอล",
        note: "ผิวสัมผัสธรรมชาติ",
      },
    ],
  },
  "vertical-blinds": {
    title: "จุดเด่นม่านปรับแสง",
    subtitle: "เหมาะบานกว้างที่อยากคุมทิศทางแสง",
    columns: [
      {
        id: "standard",
        name: "ใบปรับแสงมาตรฐาน",
        productSlug: "standard",
        light: "หมุนองศา + เลื่อนเปิดได้",
        bestFor: "ออฟฟิศ · โชว์รูม · บานกระจกใหญ่",
        note: "คุมแสงละเอียดทั้งวัน",
      },
      {
        id: "motor",
        name: "ระบบมอเตอร์ (คู่หมวดไฟฟ้า)",
        productSlug: undefined,
        light: "คุมด้วยรีโมท/แอป",
        bestFor: "บานสูง · ใช้งานบ่อย",
        note: "ดูรุ่นในหมวดผ้าม่านไฟฟ้า",
      },
    ],
  },
  "pvc-partition": {
    title: "เทียบฉากกั้น PVC",
    subtitle: "เลือกระดับโปร่ง–ทึบตามการแบ่งพื้นที่",
    columns: [
      {
        id: "solid",
        name: "ฉากทึบ",
        productSlug: "solid",
        light: "ทึบ แบ่งสัดส่วนชัด",
        bestFor: "ห้องเปลี่ยนเสื้อผ้า · มุมส่วนตัว",
        note: "ความเป็นส่วนตัวสูง",
      },
      {
        id: "japanese",
        name: "ฉากญี่ปุ่น",
        productSlug: "japanese",
        light: "โปร่งเบา มีลาย",
        bestFor: "ร้านอาหาร · มุมตกแต่ง",
        note: "บรรยากาศนุ่มนวล",
      },
      {
        id: "euro",
        name: "ฉากยูโร",
        productSlug: "euro",
        light: "ช่องอะคริลิคทั้งใบ",
        bestFor: "โชว์สินค้า · ทางเดิน",
        note: "โปร่งแต่แบ่งโซนได้",
      },
      {
        id: "usa",
        name: "ฉาก USA",
        productSlug: "usa",
        light: "ช่องอะคริลิคเป็นระยะ",
        bestFor: "ออฟฟิศ · คลินิก",
        note: "สมดุลโปร่ง–ทึบ",
      },
    ],
  },
  "outdoor-factory": {
    title: "เทียบงานนอกอาคาร / โรงงาน",
    subtitle: "เลือกตามแดดฝนและโครงสร้างหน้างาน",
    columns: [
      {
        id: "outdoor-roller",
        name: "ม่านม้วนภายนอก",
        productSlug: "outdoor-roller",
        light: "ลดแดดด้านนอก",
        bestFor: "ระเบียง · คาเฟ่เปิดโล่ง",
        note: "กันแดดก่อนเข้าบ้าน",
      },
      {
        id: "zip-blind",
        name: "ม่านซิป",
        productSlug: "zip-blind",
        light: "ปิดด้านข้างได้ดี",
        bestFor: "ระเบียงที่โดนลม",
        note: "เก็บขอบแน่นกว่าม้วนทั่วไป",
      },
      {
        id: "skylight",
        name: "ม่านสกายไลท์",
        productSlug: "skylight",
        light: "คุมแสงจากหลังคา",
        bestFor: "ช่องแสงบนสูง",
        note: "ลดร้อนจากด้านบน",
      },
      {
        id: "pvc-strip",
        name: "ม่านริ้ว PVC",
        productSlug: "pvc-strip",
        light: "กั้นฝุ่น/เย็น ผ่านได้",
        bestFor: "โรงงาน · ห้องเย็น",
        note: "ทางเข้าออกถี่",
      },
    ],
  },
  motorized: {
    title: "เทียบระบบมอเตอร์",
    subtitle: "เลือกคู่กับชนิดม่านที่มีอยู่หรือที่จะติดใหม่",
    columns: [
      {
        id: "curtain",
        name: "ผ้าม่านไฟฟ้า",
        productSlug: "curtain",
        light: "ตามชั้นผ้า",
        bestFor: "บานกว้าง · ห้องนอนใหญ่",
        note: "เปิด-ปิดนุ่ม ไม่ดึงมือ",
      },
      {
        id: "roller",
        name: "ม่านม้วนไฟฟ้า",
        productSlug: "roller",
        light: "ตามชนิดผ้าม้วน",
        bestFor: "หลายบานคุมรวม",
        note: "รีโมท/สมาร์ทโฮม",
      },
      {
        id: "vertical",
        name: "ม่านปรับแสงไฟฟ้า",
        productSlug: "vertical",
        light: "ปรับองศาด้วยมอเตอร์",
        bestFor: "ออฟฟิศบานสูง",
        note: "คุมแสงละเอียดทุกวัน",
      },
    ],
  },
  "print-fabric": {
    title: "เทียบงานพิมพ์",
    subtitle: "เลือกฐานผ้าและการใช้งาน",
    columns: [
      {
        id: "print",
        name: "ผ้าพิมพ์",
        productSlug: "print",
        light: "ตามผ้าฐาน",
        bestFor: "ตัดเย็บม่าน · งานตกแต่ง",
        note: "ลายตามไฟล์",
      },
      {
        id: "noren",
        name: "ม่านญี่ปุ่น (Noren)",
        productSlug: "noren",
        light: "โปร่งช่วงล่าง",
        bestFor: "หน้าร้าน · ประตูทางเข้า",
        note: "พิมพ์โลโก้/ลายได้",
      },
      {
        id: "print-roller",
        name: "ม่านม้วนพิมพ์ลาย",
        productSlug: "print-roller",
        light: "ตามผ้าฐานม้วน",
        bestFor: "แบรนด์ · อีเวนต์",
        note: "ติดตั้งเหมือนม่านม้วน",
      },
    ],
  },
  surface: {
    title: "เทียบงานพื้นผิว",
    subtitle: "ผนังหรือกระจก — คนละโจทย์",
    columns: [
      {
        id: "wallpaper",
        name: "วอลเปเปอร์",
        productSlug: "wallpaper",
        light: "—",
        bestFor: "ผนังห้อง · โทนห้อง",
        note: "ม้วนมาตรฐานหรือพิมพ์ลาย",
      },
      {
        id: "window-film",
        name: "ฟิล์มอาคาร",
        productSlug: "window-film",
        light: "ลดร้อน / กัน UV",
        bestFor: "กระจกบ้าน · ออฟฟิศ",
        note: "ไม่กินพื้นที่ในห้อง",
      },
    ],
  },
  service: {
    title: "บริการหลังติดตั้ง",
    subtitle: "ดูแลผืนม่านให้อยู่ในสภาพดี",
    columns: [
      {
        id: "washing",
        name: "ซักผ้าม่าน",
        productSlug: "washing",
        light: "—",
        bestFor: "ม่านใช้งานนาน · มีคราบ",
        note: "ถอด–ซัก–แขวนครบ",
      },
      {
        id: "repair",
        name: "ซ่อมแซมผ้าม่าน",
        productSlug: "repair",
        light: "—",
        bestFor: "รางพัง · ผ้าขาด · ปรับความยาว",
        note: "แก้จากงานเดิมได้",
      },
    ],
  },
};

function ctxPair(
  slug: string,
  title: string,
  place: string,
  afterOverride?: string,
): BeforeAfterPair {
  const ctx = CATEGORY_CONTEXT[slug];
  const before = ctx?.room ?? `${CTX}/${slug}/room.png`;
  const after =
    afterOverride ?? ctx?.living ?? `${CTX}/${slug}/living.png`;
  return {
    id: `${slug}-ba-1`,
    title,
    place,
    beforeImage: before,
    afterImage: after,
    beforeLabel: "มุมห้อง / ก่อนจัดแสง",
    afterLabel: "หลังติดตั้ง",
  };
}

const BEFORE_AFTER_BY_CATEGORY: Record<string, BeforeAfterPair[]> = {
  curtain: [
    ctxPair("curtain", "บ้านติดม่านลอนชั้นคู่", "นนทบุรี"),
    {
      id: "curtain-ba-2",
      title: "ห้องนั่งเล่นโทนครีม",
      place: "กรุงเทพฯ",
      beforeImage: `${CTX}/curtain/room.png`,
      afterImage: `${GEN}/ct-pf-home.webp`,
      beforeLabel: "ก่อนติดตั้ง",
      afterLabel: "หลังติดตั้ง",
    },
  ],
  "roller-blinds": [
    {
      id: "roller-ba-1",
      title: "ออฟฟิศม่านม้วน sunscreen",
      place: "ลาดกระบัง",
      beforeImage: `${CTX}/roller-blinds/room.png`,
      afterImage: `${GEN}/ct-pf-office.webp`,
      beforeLabel: "ก่อนติดตั้ง",
      afterLabel: "หลังติดตั้ง",
    },
    {
      id: "roller-ba-2",
      title: "คาเฟ่คุมแสงด้วยม่านม้วน",
      place: "บางกรวย",
      beforeImage: `${DETAIL}/roller-blinds/standard.png`,
      afterImage: `${GEN}/ct-pf-cafe.webp`,
      beforeLabel: "ตัวอย่างผ้า/รุ่น",
      afterLabel: "งานติดตั้งจริง",
    },
  ],
  "venetian-blinds": [
    ctxPair("venetian-blinds", "มู่ลี่ปรับองศาแสง", "กรุงเทพฯ"),
  ],
  "vertical-blinds": [
    ctxPair("vertical-blinds", "ม่านปรับแสงบานกว้าง", "โปรเจกต์องค์กร"),
  ],
  "pvc-partition": [
    ctxPair("pvc-partition", "ฉากกั้นแบ่งโซน", "กรุงเทพฯ"),
  ],
  "outdoor-factory": [
    ctxPair("outdoor-factory", "ม่านภายนอก / โรงงาน", "หน้างานลูกค้า"),
  ],
  motorized: [
    ctxPair("motorized", "ม่านระบบมอเตอร์", "บ้านพักอาศัย"),
  ],
  "print-fabric": [
    ctxPair("print-fabric", "งานพิมพ์ลายตามแบรนด์", "หน้าร้าน"),
  ],
  surface: [ctxPair("surface", "งานพื้นผิวห้อง", "บ้านพักอาศัย")],
  service: [
    {
      id: "service-ba-1",
      title: "ดูแลผืนม่านให้อยู่ในสภาพดี",
      place: "บริการหลังติดตั้ง",
      beforeImage: `${CTX}/service/room.png`,
      afterImage: `${CTX}/service/living.png`,
      beforeLabel: "สภาพก่อนดูแล",
      afterLabel: "หลังดูแล",
    },
  ],
};

/** Google Business / Maps reviews — showroom pin */
export const GOOGLE_REVIEWS_URL = siteConfig.mapsUrl;

export const YOUTUBE_CHANNEL_URL =
  siteConfig.social.find((s) => s.label === "YouTube")?.href ??
  "https://www.youtube.com/";

const VID = "/images/products/videos";

function clips(
  categorySlug: string,
  items: Omit<InstallVideoClip, "thumbnail">[],
): InstallVideoClip[] {
  return items.map((item) => ({
    ...item,
    thumbnail: `${VID}/${categorySlug}/${item.id}.png`,
  }));
}

const INSTALL_VIDEOS_BY_CATEGORY: Record<string, InstallVideoClip[]> = {
  curtain: clips("curtain", [
    {
      id: "install-rail",
      title: "ติดตั้งรางและแขวนม่านผ้า",
      duration: "0:48",
    },
    {
      id: "adjust-fold",
      title: "จัดลอน/จีบให้สวยหลังติด",
      duration: "0:36",
    },
    {
      id: "final-check",
      title: "ตรวจเปิด-ปิดและเก็บงาน",
      duration: "0:22",
    },
  ]),
  "roller-blinds": clips("roller-blinds", [
    {
      id: "install-cassette",
      title: "ติดกล่องม้วนและปรับระดับ",
      duration: "0:42",
    },
    {
      id: "demo-light",
      title: "ทดลองเปิด-ปิดคุมแสงม่านม้วน",
      duration: "0:28",
    },
    {
      id: "final-check",
      title: "เช็กขอบม้วนและเก็บงาน",
      duration: "0:20",
    },
  ]),
  "venetian-blinds": clips("venetian-blinds", [
    {
      id: "install-headrail",
      title: "ติดตั้งรางหัวมู่ลี่",
      duration: "0:40",
    },
    {
      id: "tilt-demo",
      title: "ปรับองศาใบตัดแสง",
      duration: "0:25",
    },
    {
      id: "final-check",
      title: "ทดสอบยก-ลดและเก็บงาน",
      duration: "0:22",
    },
  ]),
  "vertical-blinds": clips("vertical-blinds", [
    {
      id: "install-track",
      title: "ติดรางม่านปรับแสงบานกว้าง",
      duration: "0:45",
    },
    {
      id: "vane-demo",
      title: "หมุนใบและเลื่อนเปิด-ปิด",
      duration: "0:30",
    },
    {
      id: "final-check",
      title: "ตรวจแนวใบและเก็บงาน",
      duration: "0:21",
    },
  ]),
  "pvc-partition": clips("pvc-partition", [
    {
      id: "install-track",
      title: "ติดรางฉากกั้น PVC",
      duration: "0:50",
    },
    {
      id: "fold-demo",
      title: "พับเก็บและกางฉากกั้น",
      duration: "0:32",
    },
    {
      id: "final-check",
      title: "เช็กแนวพับและความลื่น",
      duration: "0:24",
    },
  ]),
  "outdoor-factory": clips("outdoor-factory", [
    {
      id: "install-outdoor",
      title: "ติดตั้งม่านภายนอก/รางซิป",
      duration: "0:55",
    },
    {
      id: "weather-demo",
      title: "ทดสอบกาง-เก็บหน้างานจริง",
      duration: "0:34",
    },
    {
      id: "final-check",
      title: "ตรวจจุดยึดและเก็บงาน",
      duration: "0:26",
    },
  ]),
  motorized: clips("motorized", [
    {
      id: "install-motor",
      title: "ติดตั้งมอเตอร์และทดสอบลิมิต",
      duration: "0:52",
    },
    {
      id: "remote-demo",
      title: "คุมด้วยรีโมท/ซีนเปิด-ปิด",
      duration: "0:30",
    },
    {
      id: "final-check",
      title: "ตั้งจุดหยุดและส่งมอบ",
      duration: "0:24",
    },
  ]),
  "print-fabric": clips("print-fabric", [
    {
      id: "hang-print",
      title: "แขวนม่านพิมพ์ลายตามจุดมอง",
      duration: "0:38",
    },
    {
      id: "align-pattern",
      title: "จัดแนวลายให้ตรงบาน",
      duration: "0:27",
    },
    {
      id: "final-check",
      title: "ตรวจลายและเก็บงาน",
      duration: "0:20",
    },
  ]),
  surface: clips("surface", [
    {
      id: "wallpaper-install",
      title: "ติดวอลเปเปอร์เก็บขอบ",
      duration: "0:44",
    },
    {
      id: "film-install",
      title: "ติดฟิล์มกระจกไล่ฟอง",
      duration: "0:40",
    },
    {
      id: "final-check",
      title: "ตรวจรอยต่อและเก็บงาน",
      duration: "0:22",
    },
  ]),
  service: clips("service", [
    {
      id: "take-down",
      title: "ถอดม่านเตรียมซัก/ซ่อม",
      duration: "0:35",
    },
    {
      id: "rehang",
      title: "ติดกลับและจัดทรงม่าน",
      duration: "0:33",
    },
    {
      id: "final-check",
      title: "ตรวจเปิด-ปิดหลังดูแล",
      duration: "0:18",
    },
  ]),
};

export function getInstallVideos(categorySlug: string): InstallVideoClip[] {
  return INSTALL_VIDEOS_BY_CATEGORY[categorySlug] ?? [];
}

export function getCompareTable(categorySlug: string): CompareTable | null {
  return COMPARE_BY_CATEGORY[categorySlug] ?? null;
}

export function getPrepGuide(categorySlug: string): PrepGuide {
  const override = PREP_BY_CATEGORY[categorySlug];
  if (!override) return DEFAULT_PREP;
  return {
    title: override.title ?? DEFAULT_PREP.title,
    intro: override.intro ?? DEFAULT_PREP.intro,
    measureTips: override.measureTips ?? DEFAULT_PREP.measureTips,
    prepareItems: override.prepareItems ?? DEFAULT_PREP.prepareItems,
  };
}

export function getBeforeAfterPairs(categorySlug: string): BeforeAfterPair[] {
  const list = BEFORE_AFTER_BY_CATEGORY[categorySlug];
  if (list?.length) return list.slice(0, 2);
  return [ctxPair(categorySlug, "ตัวอย่างก่อน–หลังติดตั้ง", "งานช่างตี๋")].slice(
    0,
    2,
  );
}

export function reviewsForCategory(
  categorySlug: string,
  _categoryName: string,
  limit = 3,
): ReviewItem[] {
  const published = DEMO_REVIEWS.filter((r) => r.status === "published").sort(
    (a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return a.sortOrder - b.sortOrder;
    },
  );

  const matched = published.filter((r) => r.productSlug === categorySlug);
  /** Prefer category-matched reviews; if fewer than 2, fill with pinned/general */
  if (matched.length >= limit) return matched.slice(0, limit);
  const extras = published.filter(
    (r) => r.productSlug !== categorySlug && (!r.productSlug || r.pinned),
  );
  return [...matched, ...extras].slice(0, limit);
}
