export type ContentStatus = "draft" | "published" | "hidden";

export const CONTENT_STATUS_LABELS: Record<ContentStatus, string> = {
  draft: "ร่าง",
  published: "เผยแพร่",
  hidden: "ซ่อน",
};

export const CONTENT_STATUS_STYLES: Record<ContentStatus, string> = {
  draft: "bg-amber-50 text-amber-800",
  published: "bg-emerald-50 text-emerald-700",
  hidden: "bg-paper text-muted",
};

export function slugifyTh(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\w\u0E00-\u0E7F\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}
