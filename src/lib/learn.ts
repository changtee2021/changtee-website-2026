export type LearnRoomId = "fabric" | "partition" | "motor";

export type LearnSheetKind = "lesson" | "video";

export type LearnSheet = {
  slug: string;
  room: LearnRoomId;
  title: string;
  summary: string;
  minutes: number;
  kind: LearnSheetKind;
  cover: string;
  shareLine: string;
  productHref?: string;
  videoSrc?: string;
  videoDuration?: string;
};

export const LEARN_ROOMS: {
  id: LearnRoomId;
  label: string;
  title: string;
  blurb: string;
}[] = [
  {
    id: "fabric",
    label: "ผ้า",
    title: "ความรู้เรื่องผ้า",
    blurb: "หน้าผ้า ทิศทางลาย และทำไมม่านสูงบ้านคุณต้องต่อผืนหรือหมุนผ้า",
  },
  {
    id: "partition",
    label: "ฉากกั้น",
    title: "ฉากกั้นห้อง",
    blurb: "รูปแบบเปิด-ปิด 5 แบบ ที่เซลใช้คุยหน้างาน",
  },
  {
    id: "motor",
    label: "มอเตอร์",
    title: "คลิปสอนติดมอเตอร์",
    blurb: "ช่างตี๋สอนติดตั้งจริง มู่ลี่อลูมิเนียม มู่ลี่ไม้ และม่านม้วน",
  },
];

export const LEARN_SHEETS: LearnSheet[] = [
  {
    slug: "fabric",
    room: "fabric",
    title: "ความรู้เรื่องผ้าสำหรับงานผ้าม่าน",
    summary: "หน้าแคบ-หน้ากว้าง ทิศทางลาย และ 3 กรณีตัดเย็บที่คนทั่วไปไม่ค่อยถูกบอก",
    minutes: 3,
    kind: "lesson",
    cover: "/images/learn/learn-cover-fabric.jpg",
    shareLine:
      "เรื่องหน้าผ้ากับลายผ้า — อ่านแล้วจะรู้ว่าทำไมม่านสูงบ้านคุณต่อผืนหรือหมุนผ้า",
    productHref: "/products/curtain",
  },
  {
    slug: "partition-open",
    room: "partition",
    title: "รูปแบบการเปิด-ปิดฉากกั้นห้อง",
    summary: "เปิดด้านเดียว อิสระ หรือแยกกลาง — เลือกแบบให้ตรงการใช้งาน",
    minutes: 2,
    kind: "lesson",
    cover: "/images/learn/learn-cover-partition.jpg",
    shareLine:
      "รูปแบบเปิด-ปิดฉากกั้น 5 แบบ — กดดูแล้วรู้ว่าบานบ้านคุณควรเปิดแบบไหน",
    productHref: "/products/pvc-partition",
  },
  {
    slug: "motor-aluminium",
    room: "motor",
    title: "ติดตั้งมอเตอร์ มู่ลี่อลูมิเนียม",
    summary: "คลิปสอนโดยช่างตี๋ — ขั้นตอนติดตั้งมอเตอร์บนมู่ลี่อลูมิเนียม",
    minutes: 8,
    kind: "video",
    cover: "/images/learn/learn-cover-aluminium.jpg",
    shareLine: "คลิปสอนติดตั้งมอเตอร์มู่ลี่อลูมิเนียม โดยช่างตี๋",
    productHref: "/products/venetian-blinds/aluminium",
    videoSrc: "/videos/learn/motor-aluminium.mp4",
    videoDuration: "7:55",
  },
  {
    slug: "motor-wood",
    room: "motor",
    title: "ติดตั้งมอเตอร์ มู่ลี่ไม้",
    summary: "คลิปสอนโดยช่างตี๋ — ขั้นตอนติดตั้งมอเตอร์บนมู่ลี่ไม้",
    minutes: 6,
    kind: "video",
    cover: "/images/learn/learn-hero-wood.jpg",
    shareLine: "คลิปสอนติดตั้งมอเตอร์มู่ลี่ไม้ โดยช่างตี๋",
    productHref: "/products/venetian-blinds/wood",
    videoSrc: "/videos/learn/motor-wood.mp4",
    videoDuration: "6:22",
  },
  {
    slug: "motor-roller",
    room: "motor",
    title: "ติดตั้งมอเตอร์ ม่านม้วน",
    summary: "คลิปสอนโดยช่างตี๋ — ขั้นตอนติดตั้งมอเตอร์บนม่านม้วน",
    minutes: 8,
    kind: "video",
    cover: "/images/learn/learn-hero-roller.jpg",
    shareLine: "คลิปสอนติดตั้งมอเตอร์ม่านม้วน โดยช่างตี๋",
    productHref: "/products/roller-blinds",
    videoSrc: "/videos/learn/motor-roller.mp4",
    videoDuration: "8:27",
  },
];

export function learnSheetBySlug(slug: string): LearnSheet | undefined {
  return LEARN_SHEETS.find((s) => s.slug === slug);
}

export function sheetsInRoom(room: LearnRoomId): LearnSheet[] {
  return LEARN_SHEETS.filter((s) => s.room === room);
}

export function roomById(id: LearnRoomId) {
  return LEARN_ROOMS.find((r) => r.id === id);
}
