/**
 * Minimal Markdown subset for CMS article bodies.
 *
 * Content is authored in-house, so this deliberately supports only the
 * constructs the blog needs and renders to React elements (never raw HTML).
 * Unsupported: italics, code blocks, nested lists, inline HTML.
 */

export type MdBlock =
  | { kind: "heading"; level: 2 | 3; text: string; id: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "image"; src: string; alt: string; caption: string }
  | { kind: "quote"; text: string }
  | { kind: "table"; head: string[]; rows: string[][] };

const IMAGE_RE = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/;
const HEADING_RE = /^(#{2,3})\s+(.+)$/;
const UL_RE = /^[-*]\s+(.+)$/;
const OL_RE = /^\d+[.)]\s+(.+)$/;
const QUOTE_RE = /^>\s?(.*)$/;

const isTableSeparator = (line: string) => /^\|[\s:|-]+\|?$/.test(line);

/** Thai characters are kept in the anchor; the index guarantees uniqueness. */
function slugify(text: string, index: number): string {
  const base = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
  return base ? `${base}-${index}` : `section-${index}`;
}

function splitRow(line: string): string[] {
  return line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

export function parseMarkdown(body: string): MdBlock[] {
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const blocks: MdBlock[] = [];
  let buffer: string[] = [];
  let headingIndex = 0;
  let i = 0;

  const flushParagraph = () => {
    if (buffer.length === 0) return;
    blocks.push({ kind: "paragraph", text: buffer.join(" ") });
    buffer = [];
  };

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) {
      flushParagraph();
      i += 1;
      continue;
    }

    const image = IMAGE_RE.exec(line);
    if (image) {
      flushParagraph();
      blocks.push({
        kind: "image",
        alt: image[1],
        src: image[2],
        caption: image[3] ?? "",
      });
      i += 1;
      continue;
    }

    const heading = HEADING_RE.exec(line);
    if (heading) {
      flushParagraph();
      headingIndex += 1;
      const text = heading[2].trim();
      blocks.push({
        kind: "heading",
        level: heading[1].length === 2 ? 2 : 3,
        text,
        id: slugify(text, headingIndex),
      });
      i += 1;
      continue;
    }

    if (line.startsWith("|") && isTableSeparator(lines[i + 1]?.trim() ?? "")) {
      flushParagraph();
      const head = splitRow(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(splitRow(lines[i].trim()));
        i += 1;
      }
      blocks.push({ kind: "table", head, rows });
      continue;
    }

    if (QUOTE_RE.test(line)) {
      flushParagraph();
      const parts: string[] = [];
      while (i < lines.length) {
        const quote = QUOTE_RE.exec(lines[i].trim());
        if (!quote) break;
        parts.push(quote[1]);
        i += 1;
      }
      blocks.push({ kind: "quote", text: parts.join(" ").trim() });
      continue;
    }

    if (UL_RE.test(line) || OL_RE.test(line)) {
      flushParagraph();
      const ordered = OL_RE.test(line);
      const items: string[] = [];
      while (i < lines.length) {
        const current = lines[i].trim();
        const item = ordered ? OL_RE.exec(current) : UL_RE.exec(current);
        if (!item) break;
        items.push(item[1]);
        i += 1;
      }
      blocks.push({ kind: "list", ordered, items });
      continue;
    }

    buffer.push(line);
    i += 1;
  }

  flushParagraph();
  return blocks;
}

export function tableOfContents(blocks: MdBlock[]) {
  return blocks.flatMap((block) =>
    block.kind === "heading" && block.level === 2
      ? [{ id: block.id, text: block.text }]
      : [],
  );
}

/** Thai has no word spaces, so character count is the usable proxy. */
export function readingMinutes(body: string): number {
  const characters = body.replace(/\s+/g, "").length;
  return Math.max(1, Math.round(characters / 400));
}
