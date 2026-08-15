/**
 * Pull install photos out of Company Profile SVG/PDF pages
 * and write web-sized JPEGs + a manifest for the portfolio seed.
 *
 *   node scripts/extract-profile-work.mjs
 */
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const root = process.cwd();
const svgDir = "C:/Users/Admin/Downloads/Company Profile 2026";
const pdfCandidates = [
  "C:/Users/Admin/Downloads/Company Profile 2026 (2).pdf",
  path.join(root, "public/_pdf-originals/company-profile-2026.pdf"),
];
const outRoot = path.join(root, "public/images/portfolio");
const manifestPath = path.join(root, ".tmp-profile/portfolio-manifest.json");

/** Real ผลงาน slides from Company Profile 2026 */
export const JOBS = [
  {
    page: 17,
    slug: "eyelet-had-ban-din-resort",
    productSlug: "curtain",
    spaceType: "hotel-resort",
    title: "ม่านตาไก่ หาดบ้านดิน รีสอร์ท",
    summary: "ม่านตาไก่โทนเทา เข้ากับห้องไม้รีสอร์ทกาญจนบุรี โดยไม่แย่งบรรยากาศ",
    detail:
      "ห้องพักไม้ที่หาดบ้านดินต้องการม่านที่ดูเป็นธรรมชาติ ไม่แข็งเหมือนโรงแรมทั่วไป เลยเลือกม่านตาไก่ผ้าทึบโทนเทา ให้ลอนผ้าทิ้งตัวสบายตา\n\nผ้าทึบช่วยบังแดดและให้ความเป็นส่วนตัวตอนกลางคืน ขณะที่สไตล์ตาไก่เข้ากับเฟอร์นิเจอร์ไม้รีสอร์ทได้โดยไม่แย่งบรรยากาศ",
    place: "กาญจนบุรี",
    customerName: "หาดบ้านดิน รีสอร์ท",
    installLocation: "ห้องพักรีสอร์ท",
    tags: ["ม่านตาไก่", "รีสอร์ท"],
    code: "AZ20-26",
  },
  {
    page: 20,
    slug: "pleat-patio-apartment",
    productSlug: "curtain",
    spaceType: "home-condo",
    title: "ม่านจีบ พาทิโอ อพาร์ทเมนท์",
    summary: "ม่านจีบชั้นคู่ผ้าโปร่งคู่ผ้าทึบเทา คุมแสงห้องนอนอพาร์ทเมนท์ได้ทั้งวัน",
    detail:
      "อพาร์ทเมนท์กลางกรุงเทพฯ หน้าต่างโดนแดดเกือบทั้งวัน เลยติดม่านจีบชั้นคู่ ผ้าโปร่งกรองแสงตอนกลางวัน คู่ผ้าทึบเทาปิดมืดตอนนอน\n\nม่านจีบเรียบ ดูแลง่าย เหมาะห้องพักและคอนโดที่อยากได้ทั้งความเป็นส่วนตัวและความเป็นระเบียบ โดยไม่กินพื้นที่หน้าต่าง",
    place: "กรุงเทพฯ",
    customerName: "พาทิโอ อพาร์ทเมนท์",
    installLocation: "ห้องพักอพาร์ทเมนท์",
    tags: ["ม่านจีบ", "อพาร์ทเมนท์", "ผ้าทึบแสง", "ตกแต่งคอนโด"],
    code: "FSW3-6",
  },
  {
    page: 21,
    slug: "pleat-premium-rama2",
    productSlug: "curtain",
    spaceType: "home-condo",
    title: "ม่านจีบ หมู่บ้านซื้อตรง พรีเมียม พระราม 2",
    summary: "ม่านจีบบ้านพักพระราม 2 โทนเรียบ คุมแสงทั้งหลัง ดูแลง่าย",
    detail: "บ้านในหมู่บ้านซื้อตรง พรีเมียม พระราม 2 เลือกม่านจีบเพราะจีบเรียบ เข้ากับบ้านพักสไตล์โมเดิร์น และดูแลง่ายกว่าม่านที่มีลอนซับซ้อน\n\nผ้าทึบช่วยกันแดดบ้านทิศร้อน ลดความร้อนเข้าห้องนั่งเล่นและห้องนอน เป็นงานติดผ้าม่านกรุงเทพฯ ฝั่งพระราม 2 ที่อ้างอิงสไตล์บ้านโครงการได้",
    place: "พระราม 2 กรุงเทพฯ",
    customerName: "หมู่บ้านซื้อตรง พรีเมียม พระราม 2",
    installLocation: "บ้านพักอาศัย",
    tags: ["ม่านจีบ", "บ้าน"],
    code: "AZ20-26",
  },
  {
    page: 22,
    slug: "pleat-town-in-town",
    productSlug: "curtain",
    spaceType: "home-condo",
    title: "ม่านจีบ ทาวน์อินทาวน์ ชมพูมุก",
    summary: "ม่านจีบโทนชมพูมุก แต่งบ้านทาวน์อินทาวน์ให้อุ่นตาโดยไม่ต้องเปลี่ยนเฟอร์นิเจอร์",
    detail: "บ้านทาวน์อินทาวน์เลือกม่านจีบโทนชมพูมุก เพื่อให้ห้องดูนุ่มขึ้นโดยไม่ต้องเปลี่ยนเฟอร์นิเจอร์ทั้งห้อง\n\nจีบเรียบช่วยให้ผ้าทิ้งตัวสวยแม้บานไม่กว้าง และยังคุมแสงได้ถ้าจับคู่ผ้าทึบ เหมาะบ้านในเมืองที่อยากได้ม่านแต่งบ้านกรุงเทพฯ โทนหวานแต่ใช้งานจริง",
    place: "ทาวน์อินทาวน์ กรุงเทพฯ",
    customerName: "ทาวน์อินทาวน์",
    installLocation: "บ้านพักอาศัย",
    tags: ["ม่านจีบ", "บ้าน"],
    code: "",
  },
  {
    page: 25,
    slug: "swave-hansa-svilla",
    productSlug: "curtain",
    spaceType: "home-condo",
    title: "ม่านลอนเทป หรรษา เอสวิลล่า",
    summary: "ม่านลอนเทปบ้านหรรษา เอสวิลล่า ลอนสม่ำเสมอทั้งบาน ดูแพงโดยไม่ใช้ผ้าเยอะเกิน",
    detail: "บ้านพักบางแคเลือกม่านลอนเทปเพราะลอน S-wave เรียงเท่ากันทั้งบาน ดูแพงกว่าม่านจีบทั่วไป โดยไม่ต้องใช้ผ้าเยอะเกิน\n\nเหมาะบ้านโครงการที่อยากได้ม่านแต่งบ้านสไตล์โมเดิร์น เปิด-ปิดลื่น และยังคุมแสงห้องนั่งเล่นได้ทั้งวัน",
    place: "บางแค กรุงเทพฯ",
    customerName: "หมู่บ้านหรรษา เอสวิลล่า",
    installLocation: "บ้านพักอาศัย",
    tags: ["ม่านลอนเทป", "บ้าน"],
    code: "BB12",
  },
  {
    page: 26,
    slug: "swave-pleno-thairamun",
    productSlug: "curtain",
    spaceType: "home-condo",
    title: "ม่านลอนเทป โครงการพลีโน่",
    summary: "ม่านลอนเทปโครงการพลีโน่ ลอนสวยเข้ากับบ้านใหม่ เก็บผ้าชิดข้างได้ดี",
    detail: "บ้านโครงการพลีโน่ ถนนไทยรามัญ ใช้ม่านลอนเทปให้ลอนผ้าสม่ำเสมอ เข้ากับบ้านใหม่โทนเรียบ\n\nลอนเทปเก็บผ้าชิดข้างได้ดี หน้าต่างดูโล่งตอนกลางวัน และยังเป็นสไตล์ที่ลูกค้าบ้านโครงการค้นหาบ่อยเวลาอยากติดผ้าม่านบ้านใหม่กรุงเทพฯ",
    place: "ถนนไทยรามัญ กรุงเทพฯ",
    customerName: "โครงการพลีโน่",
    installLocation: "บ้านโครงการ",
    tags: ["ม่านลอนเทป", "บ้าน"],
    code: "ASW",
  },
  {
    page: 29,
    slug: "roman-khun-sun",
    productSlug: "curtain",
    spaceType: "home-condo",
    title: "ม่านพับ คุณสุน",
    summary: "ม่านพับบานแคบ เก็บผ้าชิดบน ไม่กินพื้นที่หน้าต่าง",
    detail: "หน้าต่างบานแคบหรือทรงสูงติดม่านจีบแล้วผ้าจะดูแน่นเกินไป เลยเลือกม่านพับให้พับเก็บชิดบน ไม่บังบาน\n\nเหมาะบ้านที่อยากได้ม่านแต่งบ้านแบบเรียบ คุมแสงได้ และยังดูเป็นระเบียบแม้พื้นที่หน้าต่างจำกัด",
    place: "กรุงเทพฯ",
    customerName: "คุณสุน",
    installLocation: "บ้านพักอาศัย",
    tags: ["ม่านพับ", "บ้าน"],
    code: "KB280-08",
  },
  {
    page: 32,
    slug: "hospital-chulabhorn",
    productSlug: "curtain",
    spaceType: "hospital",
    title: "ม่านโรงพยาบาล ราชวิทยาลัยจุฬาภรณ์",
    summary: "ม่านโรงพยาบาลราชวิทยาลัยจุฬาภรณ์ เน้นสะอาด ถอดซักได้ ทนการใช้งานทุกวัน",
    detail:
      "สถานพยาบาลต้องการม่านที่ถอดซักได้ สะอาด และไม่รบกวนการทำงานของเจ้าหน้าที่ เลยเลือกม่านโรงพยาบาลมาตรฐานที่ราชวิทยาลัยจุฬาภรณ์ แจ้งวัฒนะ\n\nผ้าทึบพอให้ความเป็นส่วนตัวคนไข้ แต่ยังดูแลง่าย เหมาะงานติดม่านโรงพยาบาลกรุงเทพฯ ที่ต้องทนการใช้งานทุกวัน",
    place: "หลักสี่ กรุงเทพฯ",
    customerName: "โรงพยาบาลราชวิทยาลัยจุฬาภรณ์",
    installLocation: "แจ้งวัฒนะ 5",
    tags: ["ม่านโรงพยาบาล", "สถานพยาบาล"],
    code: "HP4",
  },
  {
    page: 33,
    slug: "hospital-kosen-kmitl",
    productSlug: "curtain",
    spaceType: "education",
    title: "ม่านโรงพยาบาล ตึกโคเซน KMITL",
    summary: "ม่านโรงพยาบาลตึกโคเซน สจล. ห้องพยาบาลในสถานศึกษา ทนเปิด-ปิดบ่อย",
    detail: "ตึกโคเซน สจล. ลาดกระบัง ใช้ม่านโรงพยาบาลในห้องพยาบาลของสถานศึกษา ต้องทนการเปิด-ปิดบ่อยและดูแลความสะอาดได้\n\nเลือกผ้าที่ให้ความเป็นส่วนตัวคนไข้โดยไม่ทำให้ห้องมืดทึบ เหมาะงานม่านสถานศึกษาและม่านห้องพยาบาลในกรุงเทพฯ",
    place: "ลาดกระบัง กรุงเทพฯ",
    customerName: "ตึกโคเซน KMITL",
    installLocation: "ตึกโคเซน",
    tags: ["ม่านโรงพยาบาล", "สถานศึกษา"],
    code: "",
  },
  {
    page: 34,
    slug: "hospital-chitralada",
    productSlug: "curtain",
    spaceType: "hospital",
    title: "ม่านโรงพยาบาล สวนจิตรลดา",
    summary: "ม่านห้องพยาบาลสวนจิตรลดา เน้นสุภาพ เรียบ และใช้งานจริง",
    detail: "ห้องพยาบาลพระราชวังดุสิต สวนจิตรลดา ต้องการม่านที่สุภาพ เรียบ และดูแลง่าย\n\nม่านโรงพยาบาลช่วยกั้นสายตา ให้ความเป็นส่วนตัวขณะรักษา โดยยังเข้ากับอาคารที่ต้องดูเป็นระเบียบตลอดเวลา",
    place: "ดุสิต กรุงเทพฯ",
    customerName: "ห้องพยาบาลพระราชวังดุสิต สวนจิตรลดา",
    installLocation: "ห้องพยาบาล",
    tags: ["ม่านโรงพยาบาล"],
    code: "HP6",
  },
  {
    page: 41,
    slug: "roller-don-mueang",
    productSlug: "roller-blinds",
    spaceType: "office-corp",
    title: "ม่านม้วน สนามบินดอนเมือง",
    summary: "ม่านม้วนกรองแสงโถงผู้โดยสารดอนเมือง กันแดดจัด ยังมองเห็นลานจอดเครื่อง",
    detail:
      "โถงกระจกสนามบินดอนเมืองโดนแดดจัด แต่ยังต้องมองเห็นลานจอดเครื่อง เลยเลือกม่านม้วนกรองแสง ไม่ทึบมืด\n\nม่านม้วนเก็บชิดบน ดูแลง่าย เหมาะพื้นที่สาธารณะที่ใช้งานหนัก และเป็นงานม่านม้วนกรุงเทพฯ ขนาดใหญ่ที่อ้างอิงสเปกอาคารกระจกได้",
    place: "ดอนเมือง กรุงเทพฯ",
    customerName: "สนามบินดอนเมือง",
    installLocation: "โถงผู้โดยสาร",
    tags: ["ม่านม้วน", "สนามบิน"],
    code: "CTR5003",
  },
  {
    page: 42,
    slug: "roller-teenoi-network",
    productSlug: "roller-blinds",
    spaceType: "restaurant-cafe",
    title: "ม่านม้วนเครือสุกี้ตี๋น้อย",
    summary: "ม่านม้วนเครือสุกี้ตี๋น้อย คุมแสงหลายสาขาให้โทนเดียวกัน เช็ดง่าย",
    detail:
      "ร้านอาหารเปิดยาว กระจกหน้าร้านโดนแดดและต้องดูสะอาดทุกสาขา เลยใช้ม่านม้วนชุดเดียวกันทั้งเครือสุกี้ตี๋น้อย ทั้งโกลด์ เมเจอร์ บิ๊กซี อินเด็กซ์ โอโซน โลตัส และสาขา BBQ\n\nม่านม้วนร้านอาหารช่วยลดแสงจ้า ลดความร้อน และยังดูแลง่ายกว่าผ้าม่านที่ซับกลิ่น",
    place: "หลายสาขาทั่วประเทศ",
    customerName: "สุกี้ตี๋น้อย",
    installLocation: "สาขาเครือสุกี้ตี๋น้อย",
    tags: ["ม่านม้วน", "ร้านอาหาร", "ตี๋น้อย"],
    code: "",
  },
  {
    page: 43,
    slug: "roller-teenoi-songprapa",
    productSlug: "roller-blinds",
    spaceType: "restaurant-cafe",
    title: "ม่านม้วน สุกี้ตี๋น้อย สรงประภา",
    summary: "ม่านม้วนสุกี้ตี๋น้อยสรงประภา คุมแสงหน้าร้านโดยไม่บังโต๊ะ",
    detail: "สาขาสรงประภาติดม่านม้วนที่หน้าร้านและโซนรับประทาน เพื่อกันแดดโดยไม่ให้ผ้าไปกินพื้นที่โต๊ะ\n\nม่านม้วนร้านอาหารกรุงเทพฯ แบบนี้ดูแลเช็ดง่าย โทนเรียบ ไม่แย่งบรรยากาศร้าน และยังคุมแสงได้ทั้งวัน",
    place: "สรงประภา กรุงเทพฯ",
    customerName: "สุกี้ตี๋น้อย สรงประภา",
    installLocation: "หน้าร้าน / โซนรับประทาน",
    tags: ["ม่านม้วน", "ร้านอาหาร"],
    code: "WPRB2005",
  },
  {
    page: 44,
    slug: "roller-teenoi-bbq-jas",
    productSlug: "roller-blinds",
    spaceType: "restaurant-cafe",
    title: "ม่านม้วน TEENOI BBQ แจสกรีนวิลเลจ",
    summary: "ม่านม้วนร้านปิ้งย่างแจสกรีนวิลเลจ กันแดด เช็ดง่าย ไม่ซับกลิ่น",
    detail: "ร้านปิ้งย่างมีควัน กลิ่น และแดดหน้าร้าน ผ้าม่านทั่วไปจะเลอะง่าย เลยเลือกม่านม้วนที่ TEENOI BBQ แจสกรีนวิลเลจ คู้เมือง\n\nม้วนเก็บชิด เช็ดทำความสะอาดง่าย เหมาะม่านม้วนร้านอาหารที่อยากคุมแสงโดยไม่ต้องซักผ้าบ่อย",
    place: "คู้เมือง กรุงเทพฯ",
    customerName: "TEENOI BBQ แจสกรีนวิลเลจ",
    installLocation: "ร้านปิ้งย่าง",
    tags: ["ม่านม้วน", "ร้านอาหาร"],
    code: "WPRB2005",
  },
  {
    page: 45,
    slug: "roller-nai-pran-nakhonpathom",
    productSlug: "roller-blinds",
    spaceType: "restaurant-cafe",
    title: "ม่านม้วน นายพรานหมูกะทะ นครปฐม",
    summary: "ม่านม้วนร้านหมูกะทะนครปฐม กันแดดหน้าร้าน โต๊ะไม่ร้อน เช็ดง่าย",
    detail: "ร้านหมูกะทะนายพรานโดนแดดหน้าร้านและมีไอน้ำจากเตา เลยใช้ม่านม้วนแทนผ้าม่านที่ซับกลิ่น\n\nม่านม้วนร้านอาหารช่วยลดแสงจ้า โต๊ะไม่ร้อน และยังเช็ดทำความสะอาดได้เร็วหลังปิดร้าน",
    place: "นครปฐม",
    customerName: "นายพรานหมูกะทะ",
    installLocation: "ร้านอาหาร",
    tags: ["ม่านม้วน", "ร้านอาหาร"],
    code: "WPRB2005",
  },
  {
    page: 46,
    slug: "roller-kosen-kmitl",
    productSlug: "roller-blinds",
    spaceType: "education",
    title: "ม่านม้วน ตึกโคเซน KMITL",
    summary: "ม่านม้วนอาคารเรียนตึกโคเซน สจล. คุมแสงห้องเรียนโดยไม่บังกระดาน",
    detail: "ห้องเรียนและโถงกระจกตึกโคเซน สจล. ต้องการกันแสงจ้าโดยไม่ทำให้ห้องมืดจนต้องเปิดไฟทั้งวัน เลยเลือกม่านม้วนกรองแสง\n\nม้วนเก็บชิด ไม่กินกระดานหรือจอ เหมาะม่านม้วนสถานศึกษาลาดกระบังที่ใช้งานทุกวัน",
    place: "ลาดกระบัง กรุงเทพฯ",
    customerName: "ตึกโคเซน KMITL",
    installLocation: "ตึกโคเซน",
    tags: ["ม่านม้วน", "สถานศึกษา"],
    code: "WPR3009",
  },
  {
    page: 47,
    slug: "roller-tontan-used-car",
    productSlug: "roller-blinds",
    spaceType: "office-corp",
    title: "ม่านม้วน ต้นตาลยูสคาร์",
    summary: "ม่านม้วนโชว์รูมรถมือสองนนทบุรี กันแดดรถ ไม่บังวิวหน้าร้าน",
    detail: "โชว์รูมต้นตาลยูสคาร์ต้องกันแดดไม่ให้รถซีด แต่ลูกค้ายังต้องมองเห็นรถจากภายนอก เลยใช้ม่านม้วนกรองแสง\n\nม่านม้วนโชว์รูมเก็บชิดบน ดูโปร่ง เหมาะพื้นที่กระจกใหญ่ที่อยากลดความร้อนโดยไม่ปิดหน้าร้านทึบ",
    place: "นนทบุรี",
    customerName: "ต้นตาลยูสคาร์",
    installLocation: "โชว์รูม",
    tags: ["ม่านม้วน", "โชว์รูม"],
    code: "WPR5007",
  },
  {
    page: 48,
    slug: "roller-architecture-kmitl",
    productSlug: "roller-blinds",
    spaceType: "education",
    title: "ม่านม้วน คณะสถาปัตยกรรมศาสตร์ KMITL",
    summary: "ม่านม้วนคณะสถาปัตย์ สจล. คุมแสงสตูดิโอโดยไม่บังงานโชว์ผนัง",
    detail: "อาคารคณะสถาปัตยกรรมศาสตร์มีกระจกใหญ่และต้องดูงานสี แสงจ้าจะรบกวน เลยติดม่านม้วนกรองแสง\n\nม้วนเก็บชิด ไม่บังผนังโชว์งาน เหมาะม่านม้วนสถานศึกษาที่อยากได้ทั้งฟังก์ชันและความเรียบ",
    place: "ลาดกระบัง กรุงเทพฯ",
    customerName: "คณะสถาปัตยกรรมศาสตร์ KMITL",
    installLocation: "อาคารคณะ",
    tags: ["ม่านม้วน", "สถานศึกษา"],
    code: "WPR3006",
  },
  {
    page: 54,
    slug: "vertical-pea-chatuchak",
    productSlug: "vertical-blinds",
    spaceType: "government",
    title: "ม่านปรับแสง การไฟฟ้าส่วนภูมิภาค จตุจักร",
    summary: "ม่านปรับแสงสำนักงาน กฟภ. จตุจักร หมุนใบกันแดดได้ทีละโซน",
    detail: "สำนักงานการไฟฟ้าส่วนภูมิภาค จตุจักร มีกระจกยาว แสงเข้าไม่เท่ากันทั้งแถว เลยเลือกม่านปรับแสงที่หมุนใบได้\n\nเหมาะสำนักงานราชการที่อยากกันแสงจอคอมพิวเตอร์ โดยยังมองออกไปข้างนอกได้ และดูแลเป็นแผ่น เปลี่ยนใบได้เมื่อชำรุด",
    place: "จตุจักร กรุงเทพฯ",
    customerName: "การไฟฟ้าส่วนภูมิภาค",
    installLocation: "สำนักงานจตุจักร",
    tags: ["ม่านปรับแสง", "ราชการ"],
    code: "WPRB1002",
  },
  {
    page: 55,
    slug: "vertical-cp-ram-chonburi",
    productSlug: "vertical-blinds",
    spaceType: "office-corp",
    title: "ม่านปรับแสง ซีพีแรม ชลบุรี",
    summary: "ม่านปรับแสงสำนักงานซีพีแรม ชลบุรี คุมแสงห้องประชุมและโต๊ะทำงาน",
    detail: "สำนักงานซีพีแรม ชลบุรี ใช้ม่านปรับแสงกับกระจกยาว เพื่อหมุนใบกันแดดเฉพาะช่วงที่จ้า\n\nม่านปรับแสงสำนักงานช่วยลดแสงสะท้อนจอ โดยไม่ต้องปิดม่านทั้งแผง เหมาะอาคารองค์กรที่ใช้งานทั้งวัน",
    place: "ชลบุรี",
    customerName: "บริษัท ซีพีแรม จำกัด (CP RAM)",
    installLocation: "สำนักงาน",
    tags: ["ม่านปรับแสง", "องค์กร"],
    code: "WPRB1002",
  },
  {
    page: 56,
    slug: "vertical-national-reform",
    productSlug: "vertical-blinds",
    spaceType: "government",
    title: "ม่านปรับแสง สำนักงานราชการแผ่นดิน",
    summary: "ม่านปรับแสงหน่วยงานราชการ เรียบ เป็นระเบียบ คุมแสงได้ละเอียด",
    detail:
      "สำนักงานราชการต้องการม่านที่ดูสุภาพ เป็นระเบียบ และทนการใช้งาน เลยเลือกม่านปรับแสงใบแนวตั้ง\n\nหมุนใบได้ตามแดดแต่ละช่วงวัน เหมาะงานม่านสำนักงานราชการกรุงเทพฯ ที่ต้องดูเรียบร้อยตลอดเวลา",
    place: "กรุงเทพฯ",
    customerName: "สำนักงานราชการแผ่นดิน",
    installLocation: "สำนักงาน",
    tags: ["ม่านปรับแสง", "ราชการ"],
    code: "WPRB1003",
  },
  {
    page: 60,
    slug: "wood-link-weld-chonburi",
    productSlug: "venetian-blinds",
    spaceType: "office-corp",
    title: "มู่ลี่ไม้ Link Weld ชลบุรี",
    summary: "มู่ลี่ไม้โทน Nature White สำนักงานชลบุรี ดูอบอุ่นแต่ยังปรับแสงได้",
    detail:
      "สำนักงานลิงค์เวลด์ ชลบุรี เลือกมู่ลี่ไม้โทน Nature White ให้ห้องดูอบอุ่นกว่ามู่ลี่อลูมิเนียม แต่ยังปรับองศาใบกันแดดได้\n\nเหมาะสำนักงานองค์กรที่อยากได้มู่ลี่ไม้แต่งออฟฟิศ ดูแพง โดยไม่ทำให้ห้องมืดทึบ",
    place: "ชลบุรี",
    customerName: "บริษัท ลิงค์เวลด์ (ประเทศไทย) จำกัด",
    installLocation: "สำนักงาน",
    tags: ["มู่ลี่ไม้", "องค์กร"],
    code: "Nature White",
  },
  {
    page: 61,
    slug: "wood-highway-nakhonnayok",
    productSlug: "venetian-blinds",
    spaceType: "government",
    title: "มู่ลี่ไม้ กรมทางหลวง นครนายก",
    summary: "มู่ลี่ไม้ Dk Walnut สำนักงานกรมทางหลวง โทนเข้มสุภาพ กันแสงจอได้ละเอียด",
    detail: "สำนักงานกรมทางหลวง นครนายก ใช้มู่ลี่ไม้โทน Dk Walnut ให้ดูสุภาพ เข้ากับโต๊ะไม้และโทนอาคารราชการ\n\nปรับใบกันแสงจอได้ละเอียด เหมาะมู่ลี่ไม้สำนักงานที่อยากได้ทั้งความเป็นทางการและการใช้งานจริง",
    place: "นครนายก",
    customerName: "กรมทางหลวง นครนายก",
    installLocation: "สำนักงาน",
    tags: ["มู่ลี่ไม้", "ราชการ"],
    code: "Dk Walnut",
  },
  {
    page: 67,
    slug: "alu-railway-bangkok",
    productSlug: "venetian-blinds",
    spaceType: "government",
    title: "มู่ลี่อลูมิเนียม การรถไฟแห่งประเทศไทย",
    summary: "มู่ลี่อลูมิเนียมการรถไฟฯ เบา ทน เช็ดฝุ่นง่ายในสำนักงานใหญ่",
    detail: "สำนักงานการรถไฟแห่งประเทศไทยเลือกมู่ลี่อลูมิเนียมเพราะเบา ทนความชื้นแอร์ และเช็ดฝุ่นง่ายกว่าผ้าม่าน\n\nปรับใบกันแสงได้ละเอียด เหมาะมู่ลี่อลูมิเนียมสำนักงานราชการกรุงเทพฯ ที่ใช้งานทุกวัน",
    place: "กรุงเทพฯ",
    customerName: "การรถไฟแห่งประเทศไทย",
    installLocation: "สำนักงาน",
    tags: ["มู่ลี่อลูมิเนียม", "ราชการ"],
    code: "6010",
  },
  {
    page: 78,
    slug: "alu-bigc-ratchadamri",
    productSlug: "venetian-blinds",
    spaceType: "office-corp",
    title: "มู่ลี่อลูมิเนียม บิ๊กซี ราชดำริ",
    summary: "มู่ลี่อลูมิเนียมขาวเรียบ บิ๊กซีราชดำริ โปร่ง สะอาด เช็ดง่าย",
    detail: "พื้นที่ร้านและสำนักงานบิ๊กซีราชดำริต้องการม่านที่ดูสะอาด ไม่ซับกลิ่น และเช็ดได้เร็ว เลยเลือกมู่ลี่อลูมิเนียมสีขาวเรียบ\n\nโทนขาวเข้ากับพื้นที่ค้าปลีก ปรับแสงได้โดยไม่ปิดวิว เหมาะงานมู่ลี่อลูมิเนียมกรุงเทพฯ ใจกลางเมือง",
    place: "ราชดำริ กรุงเทพฯ",
    customerName: "บิ๊กซี ราชดำริ",
    installLocation: "พื้นที่ร้าน / สำนักงาน",
    tags: ["มู่ลี่อลูมิเนียม"],
    code: "สีขาวเรียบ",
  },
  {
    page: 79,
    slug: "partition-pantip-ngamwongwan",
    productSlug: "pvc-partition",
    spaceType: "office-corp",
    title: "ฉากกั้นห้อง พันธุ์ทิพย์ งามวงศ์วาน",
    summary: "ฉากกั้นขาวลายไม้ พันธุ์ทิพย์งามวงศ์วาน แบ่งโซนร้านโดยไม่ก่อผนัง",
    detail: "พื้นที่ร้านในพันธุ์ทิพย์งามวงศ์วานต้องการกั้นโซนเร็ว โดยไม่ทุบผนัง เลยใช้ฉากกั้นห้องสีขาวลายไม้\n\nฉากกั้นช่วยบังสายตา ให้ความเป็นส่วนตัว และยังย้ายได้ถ้าปรับผังร้าน เหมาะงานฉากกั้นห้องนนทบุรีในพื้นที่เช่า",
    place: "งามวงศ์วาน นนทบุรี",
    customerName: "พันธุ์ทิพย์ งามวงศ์วาน",
    installLocation: "พื้นที่ร้าน",
    tags: ["ฉากกั้นห้อง"],
    code: "สีขาวลายไม้",
  },
  {
    page: 80,
    slug: "partition-liquor-ngamwongwan",
    productSlug: "pvc-partition",
    spaceType: "government",
    title: "ฉากกั้นห้อง องค์การสุรา",
    summary: "ฉากกั้นสำนักงานองค์การสุรา แบ่งห้องประชุมโดยไม่ต้องก่อสร้าง",
    detail: "สำนักงานองค์การสุรา งามวงศ์วาน ใช้ฉากกั้นสีขาวลายไม้แบ่งโซนทำงานและห้องประชุมโดยไม่ต้องก่อผนัง\n\nติดตั้งเร็ว ดูสุภาพ เหมาะฉากกั้นห้องสำนักงานราชการที่อยากได้ความเป็นส่วนตัวโดยงบไม่บาน",
    place: "งามวงศ์วาน นนทบุรี",
    customerName: "องค์การสุรา",
    installLocation: "สำนักงาน",
    tags: ["ฉากกั้นห้อง", "ราชการ"],
    code: "สีขาวลายไม้",
  },
  {
    page: 84,
    slug: "partition-samwa-village",
    productSlug: "pvc-partition",
    spaceType: "home-condo",
    title: "ฉากกั้นห้อง หมู่บ้านถนนสามวา",
    summary: "ฉากกั้นบ้านคลองสามวา แบ่งห้องเพิ่ม กั้นแอร์ได้โดยไม่ทุบผนัง",
    detail: "บ้านหมู่บ้านถนนสามวาต้องการห้องเพิ่ม เช่น มุมทำงานหรือกั้นแอร์ เลยเลือกฉากกั้นห้องแทนการก่อผนัง\n\nติดตั้งเร็ว ย้ายได้ เหมาะฉากกั้นห้องบ้านพักกรุงเทพฯ ที่อยากแบ่งโซนโดยไม่เสียโครงสร้างเดิม",
    place: "คลองสามวา กรุงเทพฯ",
    customerName: "หมู่บ้านถนนสามวา",
    installLocation: "บ้านพักอาศัย",
    tags: ["ฉากกั้นห้อง", "บ้าน"],
    code: "WPRB1006",
  },
  {
    page: 85,
    slug: "partition-khao-yoi",
    productSlug: "pvc-partition",
    spaceType: "home-condo",
    title: "ฉากกั้นห้อง เขาย้อย เพชรบุรี",
    summary: "ฉากกั้นบ้านเขาย้อย เพชรบุรี แบ่งโซนบ้านโดยไม่ต้องรองานก่อสร้าง",
    detail: "บ้านพักเขาย้อยใช้ฉากกั้นห้องเพื่อแบ่งพื้นที่ใช้สอย โดยไม่ต้องรองานก่อสร้าง\n\nฉากกั้นช่วยกั้นแอร์และบังสายตา เหมาะบ้านต่างจังหวัดที่อยากได้ห้องเพิ่มแบบงบคุมได้",
    place: "เขาย้อย เพชรบุรี",
    customerName: "เขาย้อย",
    installLocation: "บ้านพักอาศัย",
    tags: ["ฉากกั้นห้อง", "บ้าน"],
    code: "WPRB1003",
  },
  {
    page: 87,
    slug: "zip-khlong-sam-wa",
    productSlug: "outdoor-factory",
    spaceType: "home-condo",
    title: "ม่านม้วน Zip blinds คลองสามวา",
    summary: "ม่านม้วนซิปคลองสามวา กันแมลง กันฝนสาด ยังเปิดวิวระเบียงได้",
    detail: "ระเบียงบ้านคลองสามวาโดนแมลงและฝนสาด ผ้าม่านในบ้านช่วยไม่ได้ เลยติดม่านม้วน Zip blinds ซิปสองข้าง\n\nกันแมลง คุมแสง และยังมองออกไปข้างนอกได้ เหมาะม่านภายนอกบ้านกรุงเทพฯ ที่อยากใช้ระเบียงได้จริง",
    place: "คลองสามวา กรุงเทพฯ",
    customerName: "คลองสามวา",
    installLocation: "ระเบียง / นอกอาคาร",
    tags: ["ม่านซิป", "ม่านภายนอก"],
    code: "WPRB1006",
  },
  {
    page: 89,
    slug: "skylight-cp-ram-ladlumkaew",
    productSlug: "outdoor-factory",
    spaceType: "office-corp",
    title: "ม่านม้วนสกายไลท์ ซีพีแรม ลาดหลุมแก้ว",
    summary: "ม่านม้วนสกายไลท์ซีพีแรม ลาดหลุมแก้ว กันแดดหลังคากระจก ลดความร้อนโถง",
    detail: "หลังคากระจกซีพีแรม ลาดหลุมแก้ว ทำให้โถงร้อนและแสงจ้า เลยติดม่านม้วนสกายไลท์แนวนอน\n\nม้วนเก็บได้เมื่อต้องการแสงธรรมชาติ เหมาะม่านม้วนหลังคากระจกโรงงานและสำนักงานที่อยากลดความร้อนโดยไม่ปิดสกายไลท์ถาวร",
    place: "ลาดหลุมแก้ว ปทุมธานี",
    customerName: "ซีพีแรม ลาดหลุมแก้ว",
    installLocation: "สกายไลท์",
    tags: ["สกายไลท์", "ม่านม้วน"],
    code: "WPRB1005",
  },
  {
    page: 100,
    slug: "print-buriram-arena-2025",
    productSlug: "print-fabric",
    spaceType: "office-corp",
    title: "พิมพ์ลาย Colors of Buriram 2025",
    summary: "พิมพ์ลาย Colors of Buriram 2025 ที่สนามช้างอารีนา งานใหญ่ สีตรงจากระยะไกล",
    detail: "งานอีเวนต์ที่สนามช้างอารีนาต้องการผ้าพิมพ์ลายสีตรง ขนาดใหญ่ และติดตั้งตามกำหนด เลยผลิตพิมพ์ลาย Colors of Buriram 2025 ทั้งผืน\n\nเหมาะงานพิมพ์ลายผ้าอีเวนต์ที่ต้องเห็นสีจากระยะไกล และยังอ้างอิงงานสนามกีฬาบุรีรัมย์ได้",
    place: "บุรีรัมย์",
    customerName: "Colors of Buriram 2025 · สนามช้างอารีนา",
    installLocation: "สนามช้างอารีนา",
    tags: ["พิมพ์ลาย", "อีเวนต์"],
    code: "",
  },
  {
    page: 103,
    slug: "noren-bear-house",
    productSlug: "print-fabric",
    spaceType: "restaurant-cafe",
    title: "ม่านญี่ปุ่น ร้านแบร์เฮาส์",
    summary: "ม่านญี่ปุ่นผ้าแคนวาส 9 ออนซ์ ร้านแบร์เฮาส์ หน้าร้านดูเป็นคาเฟ่ทันที",
    detail: "ร้านแบร์เฮาส์ใช้ม่านญี่ปุ่นผ้าแคนวาส 9 ออนซ์ ที่หน้าร้าน เพื่อแบ่งโซนและสร้างบรรยากาศโดยไม่ต้องทำประตูทึบ\n\nผ้าแคนวาสหนาพอให้ทรงสวย เหมาะม่านญี่ปุ่นร้านกาแฟที่อยากได้ทั้งแบรนด์และความเป็นส่วนตัว",
    place: "กรุงเทพฯ",
    customerName: "ร้านแบร์เฮาส์",
    installLocation: "หน้าร้าน",
    tags: ["ม่านญี่ปุ่น", "พิมพ์ลาย"],
    code: "ผ้าแคนวาส 9 ออนซ์",
  },
  {
    page: 104,
    slug: "noren-japanese-restaurants",
    productSlug: "print-fabric",
    spaceType: "restaurant-cafe",
    title: "ม่านญี่ปุ่น ร้านอาหารญี่ปุ่น",
    summary: "ม่านญี่ปุ่นผ้าแคนวาสร้านอาหาร แบ่งโซนครัว-หน้าร้านได้ทันที",
    detail: "ร้านอาหารและร้านน้ำใช้ม่านญี่ปุ่นผ้าแคนวาส 9 ออนซ์ กั้นหน้าร้านหรือปากทางครัว โดยไม่ปิดทึบจนดูอึดอัด\n\nพิมพ์ลายได้ตามแบรนด์ เหมาะม่านญี่ปุ่นร้านอาหารที่อยากได้ทั้งฟังก์ชันและภาพลักษณ์",
    place: "กรุงเทพฯ",
    customerName: "ร้านอาหารญี่ปุ่น",
    installLocation: "หน้าร้าน",
    tags: ["ม่านญี่ปุ่น", "พิมพ์ลาย"],
    code: "ผ้าแคนวาส 9 ออนซ์",
  },
  {
    page: 105,
    slug: "noren-ichikara",
    productSlug: "print-fabric",
    spaceType: "restaurant-cafe",
    title: "ม่านญี่ปุ่น อิชิคะระ",
    summary: "ม่านญี่ปุ่นอิชิคะระ ผ้าแคนวาสหนา ทรงสวย เข้ากับร้านอาหารญี่ปุ่น",
    detail: "ร้านอิชิคะระเลือกม่านญี่ปุ่นผ้าแคนวาส 9 ออนซ์ ให้หน้าร้านดูเป็นร้านอาหารญี่ปุ่นตั้งแต่ทางเข้า\n\nผ้าหนาพอไม่ปลิวง่าย แบ่งโซนได้ และยังพิมพ์ลายเข้ากับแบรนด์ เหมาะม่านหน้าร้านอาหารกรุงเทพฯ",
    place: "กรุงเทพฯ",
    customerName: "อิชิคะระ",
    installLocation: "หน้าร้าน",
    tags: ["ม่านญี่ปุ่น", "พิมพ์ลาย"],
    code: "ผ้าแคนวาส 9 ออนซ์",
  },
  {
    page: 113,
    slug: "print-roller-bbq-plaza",
    productSlug: "print-fabric",
    spaceType: "restaurant-cafe",
    title: "ม่านม้วนพิมพ์ลาย บาร์บีคิวพลาซ่า",
    summary: "ม่านม้วนพิมพ์ลายบาร์บีคิวพลาซ่า กันแดดและโชว์แบรนด์ในผืนเดียว",
    detail: "บาร์บีคิวพลาซ่าใช้ม่านม้วนพิมพ์ลายสีขาว เพื่อกันแดดหน้าร้านและโชว์แบรนด์โดยไม่ต้องติดสติ๊กเกอร์กระจก\n\nม้วนเก็บได้ตอนกลางคืน เช็ดง่าย เหมาะม่านม้วนพิมพ์ลายร้านอาหารที่อยากได้ทั้งฟังก์ชันและภาพลักษณ์",
    place: "กรุงเทพฯ",
    customerName: "บาร์บีคิวพลาซ่า",
    installLocation: "ร้านอาหาร",
    tags: ["ม่านม้วนพิมพ์ลาย", "ร้านอาหาร"],
    code: "WRP2013",
  },
];

const MIN_BYTES = 40 * 1024;
const MIN_EDGE = 280;
const MAX_WIDTH = 1200;
const JPEG_Q = 75;
const MAX_GALLERY = 5;

function hashBuf(buf) {
  return createHash("sha1").update(buf.subarray(0, 4096)).digest("hex");
}

async function toWebJpeg(buf) {
  const img = await loadImage(buf);
  if (img.width < MIN_EDGE || img.height < MIN_EDGE) return null;
  const scale = Math.min(1, MAX_WIDTH / img.width);
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);
  return {
    bytes: await canvas.encode("webp", JPEG_Q),
    width: w,
    height: h,
    srcW: img.width,
    srcH: img.height,
  };
}

function extractFromSvg(svgPath) {
  if (!existsSync(svgPath)) return [];
  const html = readFileSync(svgPath, "utf8");
  const out = [];
  const re = /<image\b[^>]*>/gi;
  let m;
  while ((m = re.exec(html))) {
    const tag = m[0];
    const href = tag.match(
      /(?:xlink:href|href)="data:image\/(jpeg|jpg|png|webp);base64,([^"]+)"/i,
    );
    if (!href) continue;
    const b64 = href[2];
    if (b64.length < 4000) continue;
    out.push(Buffer.from(b64, "base64"));
  }
  return out;
}

function rgbaToJpeg(img) {
  const { width, height, data, kind } = img;
  if (!width || !height || width < MIN_EDGE || height < MIN_EDGE) return null;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(width, height);
  const dst = imageData.data;
  if (kind === 2 || (data && data.length === width * height * 3)) {
    for (let i = 0, j = 0; i < dst.length; i += 4, j += 3) {
      dst[i] = data[j];
      dst[i + 1] = data[j + 1];
      dst[i + 2] = data[j + 2];
      dst[i + 3] = 255;
    }
  } else if (data && data.length === width * height) {
    for (let i = 0, j = 0; i < dst.length; i += 4, j += 1) {
      dst[i] = dst[i + 1] = dst[i + 2] = data[j];
      dst[i + 3] = 255;
    }
  } else if (data && data.length >= width * height * 4) {
    dst.set(data.subarray(0, width * height * 4));
  } else {
    return null;
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas.encode("jpeg", 90);
}

async function extractFromPdfPage(pdf, pageNum, OPS) {
  const page = await pdf.getPage(pageNum);
  const opList = await page.getOperatorList();
  const names = [];
  for (let i = 0; i < opList.fnArray.length; i++) {
    const fn = opList.fnArray[i];
    if (
      fn === OPS.paintImageXObject ||
      fn === OPS.paintInlineImageXObject ||
      fn === OPS.paintImageXObjectRepeat
    ) {
      const name = opList.argsArray[i]?.[0];
      if (typeof name === "string") names.push(name);
    }
  }
  // Fallback: walk known image object keys
  const keys = new Set(names);
  try {
    for (const key of Object.keys(page.objs._objs || {})) {
      if (/img|image|g_/i.test(key) || key.startsWith("img_")) keys.add(key);
    }
  } catch {
    /* ignore */
  }

  const bufs = [];
  for (const name of keys) {
    const img = await new Promise((resolve) => {
      try {
        page.objs.get(name, resolve);
        setTimeout(() => resolve(null), 800);
      } catch {
        resolve(null);
      }
    });
    if (!img || !img.width) continue;
    try {
      const jpeg = await rgbaToJpeg(img);
      if (jpeg && jpeg.length >= MIN_BYTES) bufs.push(Buffer.from(jpeg));
    } catch {
      /* skip */
    }
  }
  page.cleanup();
  return bufs;
}

async function brochureFallback(page) {
  const file = path.join(
    root,
    "public/brochure/company-profile-2026/pages",
    `page-${String(page).padStart(3, "0")}.jpg`,
  );
  if (!existsSync(file)) return [];
  return [readFileSync(file)];
}

async function main() {
  mkdirSync(outRoot, { recursive: true });
  mkdirSync(path.dirname(manifestPath), { recursive: true });

  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(
    path.join(root, "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"),
  ).href;

  const pdfPath = pdfCandidates.find((p) => existsSync(p));
  let pdf = null;
  if (pdfPath) {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(readFileSync(pdfPath)),
    });
    pdf = await loadingTask.promise;
    console.log("PDF", pdfPath, "pages", pdf.numPages);
  }

  const manifest = [];

  for (const job of JOBS) {
    const dir = path.join(outRoot, job.slug);
    mkdirSync(dir, { recursive: true });

    let raw = extractFromSvg(path.join(svgDir, `${job.page}.svg`));
    let source = raw.length ? "svg" : "";
    if (!raw.length && pdf) {
      raw = await extractFromPdfPage(pdf, job.page, pdfjsLib.OPS);
      if (raw.length) source = "pdf";
    }
    if (!raw.length) {
      raw = await brochureFallback(job.page);
      source = raw.length ? "brochure-page" : "none";
    }

    const seen = new Set();
    const photos = [];
    for (const buf of raw) {
      if (buf.length < MIN_BYTES) continue;
      const h = hashBuf(buf);
      if (seen.has(h)) continue;
      seen.add(h);
      try {
        const web = await toWebJpeg(buf);
        if (!web) continue;
        photos.push(web);
      } catch {
        /* skip corrupt */
      }
    }

    photos.sort((a, b) => b.srcW * b.srcH - a.srcW * a.srcH);
    const picked = photos.slice(0, MAX_GALLERY);
    const files = [];
    picked.forEach((p, i) => {
      const name = `${String(i + 1).padStart(2, "0")}.webp`;
      writeFileSync(path.join(dir, name), p.bytes);
      files.push(`/images/portfolio/${job.slug}/${name}`);
    });

    console.log(
      `p${String(job.page).padStart(3, "0")} ${job.slug}  ${source}  ${files.length} photos`,
    );
    manifest.push({
      ...job,
      source,
      image: files[0] || `/brochure/company-profile-2026/pages/page-${String(job.page).padStart(3, "0")}.jpg`,
      gallery: files.length ? files : [
        `/brochure/company-profile-2026/pages/page-${String(job.page).padStart(3, "0")}.jpg`,
      ],
    });
  }

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log("Wrote", manifestPath);
}

await main();
