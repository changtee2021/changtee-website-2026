import type { ContentStatus } from "@/lib/cms/content-status";

/** Job posting publish state reuses draft/published/hidden semantics as
 *  draft / open / closed so it slots into the generic CMS collection store. */
export type JobPostingStatus = "draft" | "published" | "hidden";

export const JOB_POSTING_STATUS_LABELS: Record<JobPostingStatus, string> = {
  draft: "ร่าง",
  published: "เปิดรับสมัคร",
  hidden: "ปิดรับสมัคร",
};

export const EMPLOYMENT_TYPES = [
  "ประจำ",
  "พาร์ทไทม์",
  "รายวัน",
  "ฝึกงาน",
] as const;

export type JobPosting = {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  salaryRange: string | null;
  headcount: number;
  summary: string;
  /** Plain text, blank-line separated paragraphs (หน้าที่ความรับผิดชอบ) */
  description: string;
  /** Bullet lines (คุณสมบัติผู้สมัคร) */
  requirements: string[];
  status: ContentStatus;
  publishedAt: string | null;
  updatedAt: string;
};

export function emptyJobPosting(): JobPosting {
  return {
    id: `job-${Date.now().toString(36)}`,
    title: "",
    department: "",
    location: "โรงงานช่างตี๋ ผ้าม่าน เขตคลองสามวา กรุงเทพฯ",
    employmentType: EMPLOYMENT_TYPES[0],
    salaryRange: "",
    headcount: 1,
    summary: "",
    description: "",
    requirements: [],
    status: "draft",
    publishedAt: null,
    updatedAt: new Date().toISOString(),
  };
}

export const DEMO_CAREERS: JobPosting[] = [
  {
    id: "job-1",
    title: "ช่างเย็บผ้าม่าน",
    department: "ฝ่ายผลิต",
    location: "โรงงานช่างตี๋ ผ้าม่าน เขตคลองสามวา กรุงเทพฯ",
    employmentType: "ประจำ",
    salaryRange: "400 - 700 บาท/วัน (ตามฝีมือ + ค่าตัดเย็บ)",
    headcount: 3,
    summary: "เย็บผ้าม่าน ม่านจีบ ม่านลอน ตามแบบและขนาดที่กำหนด",
    description:
      "รับผิดชอบงานเย็บผ้าม่านตามใบสั่งงาน ตรวจสอบคุณภาพก่อนส่งมอบ\n\nทำงานร่วมกับทีมตัดผ้าและทีมติดตั้งเพื่อให้งานเสร็จตามกำหนดเวลา",
    requirements: [
      "มีประสบการณ์เย็บผ้าม่านหรือเย็บผ้าทั่วไปอย่างน้อย 1 ปี",
      "ใช้จักรอุตสาหกรรมได้",
      "ละเอียด รอบคอบ ตรงต่อเวลา",
    ],
    status: "published",
    publishedAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
  },
  {
    id: "job-2",
    title: "พนักงานคลังสินค้า/โกดัง",
    department: "ฝ่ายโลจิสติกส์",
    location: "โรงงานช่างตี๋ ผ้าม่าน เขตคลองสามวา กรุงเทพฯ",
    employmentType: "ประจำ",
    salaryRange: "12,000 - 15,000 บาท/เดือน",
    headcount: 2,
    summary: "รับ-จ่ายสินค้า จัดเก็บผ้าและวัสดุ เตรียมของขึ้นรถส่งติดตั้ง",
    description:
      "ดูแลการรับเข้า-เบิกจ่ายผ้าม่านและวัสดุ จัดเรียงสต๊อกให้เป็นระบบ ตรวจนับสินค้าประจำงวด\n\nประสานงานกับทีมขายและทีมติดตั้งเรื่องการจัดของขึ้นรถ",
    requirements: [
      "ยกของหนักได้ ทำงานกลางแจ้ง/ในโกดังได้",
      "มีรถส่วนตัวเดินทางสะดวก",
      "มีประสบการณ์งานคลังสินค้าจะพิจารณาเป็นพิเศษ",
    ],
    status: "published",
    publishedAt: "2026-08-05T00:00:00.000Z",
    updatedAt: "2026-08-05T00:00:00.000Z",
  },
  {
    id: "job-3",
    title: "เซลล์ / ผู้ช่วยฝ่ายขาย",
    department: "ฝ่ายขาย",
    location: "โชว์รูมและออกหน้างานทั่วกรุงเทพฯ/ปริมณฑล",
    employmentType: "ประจำ",
    salaryRange: "ตามตกลง + คอมมิชชั่น",
    headcount: 2,
    summary: "ให้คำปรึกษาลูกค้า วัดหน้างาน ปิดการขาย ดูแลลูกค้าหลังการขาย",
    description:
      "ต้อนรับและให้คำปรึกษาลูกค้าที่โชว์รูม/ทางโทรศัพท์/LINE ออกวัดหน้างานตามนัด เสนอราคาและปิดการขาย\n\nติดตามงานติดตั้งและดูแลลูกค้าหลังการขายให้พึงพอใจ",
    requirements: [
      "บุคลิกดี พูดจาดี ชอบพบปะพูดคุยกับลูกค้า",
      "ขับรถยนต์/มอเตอร์ไซค์ได้ มีใบขับขี่",
      "มีประสบการณ์งานขายหรือขายผ้าม่าน/ของแต่งบ้านจะพิจารณาเป็นพิเศษ",
    ],
    status: "draft",
    publishedAt: null,
    updatedAt: "2026-08-10T00:00:00.000Z",
  },
];
