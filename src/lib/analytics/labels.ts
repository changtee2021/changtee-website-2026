export const ANALYTICS_CLICK_LABELS = {
  quote: "ขอใบเสนอราคา",
  line: "LINE OA",
  phone: "โทรหาเซลล์",
  catalog: "ดาวน์โหลดแคตตาล็อก",
  facebook: "Facebook",
  youtube: "YouTube",
  tiktok: "TikTok",
} as const;

export type AnalyticsClickName = keyof typeof ANALYTICS_CLICK_LABELS;
