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

/** Thai consonants / vowels → Latin so public URLs stay ASCII (avoids 404s).
 * Combining marks must be quoted (or \\u escaped) — they are not valid JS identifiers. */
const THAI_TO_LATIN: Record<string, string> = {
  ก: "k",
  ข: "kh",
  ฃ: "kh",
  ค: "kh",
  ฅ: "kh",
  ฆ: "kh",
  ง: "ng",
  จ: "j",
  ฉ: "ch",
  ช: "ch",
  ซ: "s",
  ฌ: "ch",
  ญ: "y",
  ฎ: "d",
  ฏ: "t",
  ฐ: "th",
  ฑ: "th",
  ฒ: "th",
  ณ: "n",
  ด: "d",
  ต: "t",
  ถ: "th",
  ท: "th",
  ธ: "th",
  น: "n",
  บ: "b",
  ป: "p",
  ผ: "ph",
  ฝ: "f",
  พ: "ph",
  ฟ: "f",
  ภ: "ph",
  ม: "m",
  ย: "y",
  ร: "r",
  ฤ: "rue",
  ล: "l",
  ฦ: "lue",
  ว: "w",
  ศ: "s",
  ษ: "s",
  ส: "s",
  ห: "h",
  ฬ: "l",
  อ: "o",
  ฮ: "h",
  ะ: "a",
  "\u0E31": "a",
  า: "a",
  ำ: "am",
  "\u0E34": "i",
  "\u0E35": "i",
  "\u0E36": "ue",
  "\u0E37": "ue",
  "\u0E38": "u",
  "\u0E39": "u",
  เ: "e",
  แ: "ae",
  โ: "o",
  ใ: "ai",
  ไ: "ai",
  "\u0E47": "",
  "\u0E4C": "",
  "\u0E48": "",
  "\u0E49": "",
  "\u0E4A": "",
  "\u0E4B": "",
  ๆ: "",
  ฯ: "",
  "\u0E50": "0",
  "\u0E51": "1",
  "\u0E52": "2",
  "\u0E53": "3",
  "\u0E54": "4",
  "\u0E55": "5",
  "\u0E56": "6",
  "\u0E57": "7",
  "\u0E58": "8",
  "\u0E59": "9",
};

function romanizeThaiChars(input: string): string {
  return [...input]
    .map((ch) => THAI_TO_LATIN[ch] ?? ch)
    .join("");
}

export function normalizeContentSlug(slug: string | undefined | null): string {
  if (!slug) return "";
  try {
    return decodeURIComponent(slug).trim();
  } catch {
    return slug.trim();
  }
}

export function slugifyTh(input: string): string {
  return romanizeThaiChars(input)
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}
