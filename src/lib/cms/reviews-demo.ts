import type { ContentStatus } from "@/lib/cms/content-status";

export type ReviewSource = "google" | "facebook" | "line" | "other";

export const REVIEW_SOURCE_LABELS: Record<ReviewSource, string> = {
  google: "Google",
  facebook: "Facebook",
  line: "LINE",
  other: "อื่นๆ",
};

export type ReviewItem = {
  id: string;
  displayName: string;
  rating: number;
  body: string;
  productHint: string;
  source: ReviewSource;
  sourceUrl: string;
  image: string;
  status: ContentStatus | "pending";
  pinned: boolean;
  sortOrder: number;
  createdAt: string;
};

export const DEMO_REVIEWS: ReviewItem[] = [
  {
    id: "rv-1",
    displayName: "คุณมิ้นท์ — คอนโด พระราม 9",
    rating: 5,
    body: "ทีมงานสุภาพ วัดไซส์ละเอียด ม่านลอนสวยตรงปก ติดตั้งเร็วมากค่ะ",
    productHint: "ผ้าม่าน",
    source: "google",
    sourceUrl: "",
    image: "",
    status: "published",
    pinned: true,
    sortOrder: 1,
    createdAt: "2026-07-10T12:00:00+07:00",
  },
  {
    id: "rv-2",
    displayName: "คุณเอ — สำนักงาน ลาดพร้าว",
    rating: 5,
    body: "ม่านม้วน sunscreen ตัดแสงดี จอคอมไม่สะท้อน ราคาคุยง่าย",
    productHint: "ม่านม้วน",
    source: "line",
    sourceUrl: "",
    image: "",
    status: "published",
    pinned: true,
    sortOrder: 2,
    createdAt: "2026-07-18T15:30:00+07:00",
  },
  {
    id: "rv-3",
    displayName: "คุณบี — บ้าน นนทบุรี",
    rating: 4,
    body: "งานเนี๊ยบ แนะนำผ้าทึบดีมาก รอช่างมาวันนัดนิดหน่อยแต่ผลงานคุ้ม",
    productHint: "ผ้าม่าน",
    source: "facebook",
    sourceUrl: "",
    image: "",
    status: "pending",
    pinned: false,
    sortOrder: 3,
    createdAt: "2026-08-03T09:20:00+07:00",
  },
  {
    id: "rv-4",
    displayName: "คุณโต — คาเฟ่ บางกรวย",
    rating: 5,
    body: "ร้านดูพรีเมียมขึ้นทันทีหลังติดม่านม้วน ลูกค้าชมเยอะ",
    productHint: "ม่านม้วน",
    source: "google",
    sourceUrl: "",
    image: "",
    status: "hidden",
    pinned: false,
    sortOrder: 4,
    createdAt: "2026-06-22T11:00:00+07:00",
  },
];

export function emptyReview(): ReviewItem {
  return {
    id: `rv-${Date.now()}`,
    displayName: "",
    rating: 5,
    body: "",
    productHint: "",
    source: "google",
    sourceUrl: "",
    image: "",
    status: "pending",
    pinned: false,
    sortOrder: 99,
    createdAt: new Date().toISOString(),
  };
}
