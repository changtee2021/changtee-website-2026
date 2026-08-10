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
  /** Present when clip maps to a YouTube video — used for in-page embed */
  youtubeId?: string;
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

/** Official channel @ช่างตี๋-ผ้าม่าน — watch URLs for product install sections */
export function ytWatch(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

export function ytThumb(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function ytEmbed(id: string, autoplay = false): string {
  const q = autoplay ? "?autoplay=1&rel=0" : "?rel=0";
  return `https://www.youtube.com/embed/${id}${q}`;
}

export function youtubeIdFromUrl(url?: string | null): string | null {
  if (!url?.trim()) return null;
  try {
    const u = new URL(url.trim());
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id || null;
    }
    if (u.pathname.startsWith("/shorts/")) {
      return u.pathname.split("/")[2] || null;
    }
    return u.searchParams.get("v");
  } catch {
    return null;
  }
}

export function clipYoutubeId(clip: InstallVideoClip): string | null {
  return clip.youtubeId ?? youtubeIdFromUrl(clip.videoUrl);
}

function clips(
  categorySlug: string,
  items: (Omit<InstallVideoClip, "thumbnail"> & { youtubeId?: string })[],
): InstallVideoClip[] {
  return items.map((item) => {
    const youtubeId = item.youtubeId;
    const videoUrl = item.videoUrl ?? (youtubeId ? ytWatch(youtubeId) : undefined);
    return {
      ...item,
      youtubeId,
      videoUrl,
      thumbnail: youtubeId
        ? ytThumb(youtubeId)
        : `${VID}/${categorySlug}/${item.id}.png`,
    };
  });
}

/** Homepage featured strip — popular install clips (play in-page) */
const FEATURED_INSTALL_VIDEOS: InstallVideoClip[] = clips("pvc-partition", [
  {
    id: "dual-open",
    youtubeId: "CWqrHGLg1gg",
    title: "ติดตั้งฉากกั้นห้องเปิด 2 ฝั่ง — เสร็จใน 1 ชม.ครึ่ง",
    duration: "2:43",
  },
  {
    id: "dual-two-hours",
    youtubeId: "Wa_Mwy_8BfA",
    title: "ฉากกั้นห้องเปิด 2 ด้าน — เสร็จงานภายใน 2 ชม.",
    duration: "2:46",
  },
  {
    id: "big-three",
    youtubeId: "hNHpIwwKMjk",
    title: "ฉากกั้นห้องงานใหญ่ 3 ชุด ในเวลา 2 ชม.",
    duration: "1:16",
  },
  {
    id: "door-size",
    youtubeId: "_k3l3TtBgIo",
    title: "ติดตั้งฉากกั้นห้องขนาดเท่าประตู — เสร็จใน 1 ชม.",
    duration: "1:28",
  },
  {
    id: "diy-guide",
    youtubeId: "ECMg71YqBPo",
    title: "วิธีการติดฉากกั้นห้องด้วยตัวเอง",
    duration: "10:44",
  },
  {
    id: "cpram",
    youtubeId: "DeJcmZMPYQk",
    title: "ติดตั้งฉากกั้นแอร์ PVC ที่ CPRAM",
    duration: "6:26",
  },
  {
    id: "rail-eyelet",
    youtubeId: "9vMnFY3EBo8",
    title: "ติดตั้งราวม่านและม่านตาไก่ง่ายๆ",
    duration: "1:16",
  },
  {
    id: "eyelet-pleat",
    youtubeId: "Wa7L9clgpLU",
    title: "ติดตั้งม่านตาไก่ / ม่านจีบ — ลาดกระบัง",
    duration: "6:56",
  },
  {
    id: "roman-pleat",
    youtubeId: "4jcs6axKWaI",
    title: "ติดตั้งม่านพับ ม่านจีบรางโชว์ — อ่างทอง",
    duration: "4:40",
  },
  {
    id: "school-building",
    youtubeId: "GWwXLjqo6nA",
    title: "ติดตั้งม่านม้วนทั้งอาคาร — Mandarin School",
    duration: "5:26",
  },
  {
    id: "office-factory",
    youtubeId: "5nQ-ObgI-is",
    title: "ติดม่านม้วน ม่านบังแสง ออฟฟิศ/โรงงาน",
    duration: "1:41",
  },
  {
    id: "motor-roller",
    youtubeId: "AOwHaZTt8mU",
    title: "ติดตั้งม่านม้วนไฟฟ้า",
    duration: "1:51",
  },
]);

const INSTALL_VIDEOS_BY_CATEGORY: Record<string, InstallVideoClip[]> = {
  curtain: clips("curtain", [
    {
      id: "rail-eyelet",
      youtubeId: "9vMnFY3EBo8",
      title: "ติดตั้งราวม่านและม่านตาไก่ง่ายๆ",
      duration: "1:16",
    },
    {
      id: "eyelet-pleat",
      youtubeId: "Wa7L9clgpLU",
      title: "ติดตั้งม่านตาไก่ / ม่านจีบ — ลาดกระบัง",
      duration: "6:56",
    },
    {
      id: "roman-pleat",
      youtubeId: "4jcs6axKWaI",
      title: "ติดตั้งม่านพับ ม่านจีบรางโชว์ — อ่างทอง",
      duration: "4:40",
    },
  ]),
  "roller-blinds": clips("roller-blinds", [
    {
      id: "school-building",
      youtubeId: "GWwXLjqo6nA",
      title: "ติดตั้งม่านม้วนทั้งอาคาร — Mandarin School",
      duration: "5:26",
    },
    {
      id: "office-factory",
      youtubeId: "5nQ-ObgI-is",
      title: "ติดม่านม้วน ม่านบังแสง ออฟฟิศ/โรงงาน",
      duration: "1:41",
    },
    {
      id: "motor-roller",
      youtubeId: "AOwHaZTt8mU",
      title: "ติดตั้งม่านม้วนไฟฟ้า",
      duration: "1:51",
    },
  ]),
  "venetian-blinds": clips("venetian-blinds", [
    {
      id: "wood-review",
      youtubeId: "_z6e6y6S2mc",
      title: "มู่ลี่ไม้ + ระบบเชือกวน — รีวิวโดยช่างตี๋",
      duration: "4:30",
    },
    {
      id: "install-two",
      youtubeId: "vINi0csLmkc",
      title: "ติดตั้งมู่ลี่ 2 ชุดใน 1 ชม. — คู้บอน",
      duration: "4:15",
    },
  ]),
  "vertical-blinds": clips("vertical-blinds", [
    {
      id: "six-sets",
      youtubeId: "twKZR-UY1E8",
      title: "ติดตั้งม่านปรับแสง 6 ชุด ใน 2 ชั่วโมง",
      duration: "1:10",
    },
  ]),
  "pvc-partition": clips("pvc-partition", [
    {
      id: "door-size",
      youtubeId: "_k3l3TtBgIo",
      title: "ติดตั้งฉากกั้นห้องขนาดเท่าประตู — เสร็จใน 1 ชม.",
      duration: "1:28",
    },
    {
      id: "diy-guide",
      youtubeId: "ECMg71YqBPo",
      title: "วิธีการติดฉากกั้นห้องด้วยตัวเอง",
      duration: "10:44",
    },
    {
      id: "cpram",
      youtubeId: "DeJcmZMPYQk",
      title: "ติดตั้งฉากกั้นแอร์ PVC ที่ CPRAM",
      duration: "6:26",
    },
  ]),
  "outdoor-factory": clips("outdoor-factory", [
    {
      id: "office-factory",
      youtubeId: "5nQ-ObgI-is",
      title: "ติดม่านม้วน ม่านบังแสง ออฟฟิศ/โรงงาน",
      duration: "1:41",
    },
    {
      id: "cpram",
      youtubeId: "DeJcmZMPYQk",
      title: "ฉากกั้นแอร์ PVC งานโรงงาน — CPRAM",
      duration: "6:26",
    },
    {
      id: "school-building",
      youtubeId: "GWwXLjqo6nA",
      title: "ม่านม้วนงานใหญ่ทั้งอาคาร",
      duration: "5:26",
    },
  ]),
  motorized: clips("motorized", [
    {
      id: "motor-demo",
      youtubeId: "bcs3VRxkyOE",
      title: "ม่านม้วนไฟฟ้า — ใช้ง่าย ติดตั้งสะดวก",
      duration: "0:35",
    },
    {
      id: "motor-install",
      youtubeId: "AOwHaZTt8mU",
      title: "ติดตั้งม่านม้วนไฟฟ้า",
      duration: "1:51",
    },
  ]),
  "print-fabric": clips("print-fabric", [
    {
      id: "harajuku-screen",
      youtubeId: "yGFOS4NqeUw",
      title: "ผ้าม่านญี่ปุ่น / ผ้าม่านสกรีน — Harajuku Thailand",
      duration: "8:09",
    },
    {
      id: "harajuku-vertical",
      youtubeId: "emKvAwIulnw",
      title: "ติดตั้งผ้าม่านญี่ปุ่น (มุมมองแนวตั้ง)",
      duration: "8:09",
    },
  ]),
  // No matching channel videos yet — section hidden until clips are added
  surface: [],
  service: [],
};

export function getInstallVideos(categorySlug: string): InstallVideoClip[] {
  return INSTALL_VIDEOS_BY_CATEGORY[categorySlug] ?? [];
}

export function getFeaturedInstallVideos(limit = 3): InstallVideoClip[] {
  return FEATURED_INSTALL_VIDEOS.slice(0, limit);
}

/** Match install clips to blog keywords (same product hints as portfolio). */
export function installVideosForText(haystack: string, limit = 3): InstallVideoClip[] {
  const hay = haystack.toLowerCase();
  const productHints: { slug: string; keywords: string[] }[] = [
    { slug: "curtain", keywords: ["ผ้าม่าน", "ม่านลอน", "ม่านจีบ", "ม่านตาไก่", "ทึบแสง", "blackout"] },
    { slug: "roller-blinds", keywords: ["ม่านม้วน", "sunscreen", "เมจิก", "zebra"] },
    { slug: "motorized", keywords: ["ม่านไฟฟ้า", "มอเตอร์", "รีโมท"] },
    { slug: "venetian-blinds", keywords: ["มู่ลี่"] },
    { slug: "vertical-blinds", keywords: ["ม่านปรับแสง"] },
    { slug: "pvc-partition", keywords: ["ฉากกั้น"] },
    { slug: "print-fabric", keywords: ["พิมพ์ลาย", "สกรีน", "ม่านญี่ปุ่น"] },
    { slug: "outdoor-factory", keywords: ["ม่านภายนอก", "zip", "โรงงาน"] },
  ];

  const preferred = productHints.filter((h) =>
    h.keywords.some((k) => hay.includes(k.toLowerCase())),
  );

  const seen = new Set<string>();
  const out: InstallVideoClip[] = [];
  for (const hint of preferred) {
    for (const clip of getInstallVideos(hint.slug)) {
      const key = clipYoutubeId(clip) ?? clip.id;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(clip);
      if (out.length >= limit) return out;
    }
  }

  if (out.length >= limit) return out;
  for (const clip of getFeaturedInstallVideos(limit)) {
    const key = clipYoutubeId(clip) ?? clip.id;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(clip);
    if (out.length >= limit) break;
  }
  return out;
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
