/** Old CMS paths (Mongo-style slug + 24-char id) → new App Router URLs. */

const MONGO_ID_SUFFIX = /\/[a-f0-9]{24}$/i;

const KNOWN_APP_PREFIXES = [
  "/products/",
  "/blog/",
  "/portfolio/",
  "/learn/",
  "/admin/",
  "/api/",
  "/quote",
  "/contact",
  "/careers",
  "/visit-factory",
  "/search",
  "/thank-you",
  "/privacy",
  "/cookies",
  "/terms",
] as const;

function decodePathname(pathname: string): string {
  let path = pathname;
  try {
    if (path.includes("%")) path = decodeURIComponent(path);
  } catch {
    /* keep pathname */
  }
  return path;
}

function isKnownAppPath(path: string): boolean {
  if (path === "/" || path === "/products") return true;
  return KNOWN_APP_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(prefix),
  );
}

type LegacyRule = { match: (path: string) => boolean; destination: string };

/** Most specific rules first — slug keywords and known legacy document ids. */
const LEGACY_RULES: LegacyRule[] = [
  {
    match: (p) =>
      p.includes("60ff6a36e68a7c5a4ca8c54e") || p.startsWith("/หน้าแรก/"),
    destination: "/",
  },
  {
    match: (p) =>
      p.includes("610e26deafee180012845be9") || p.startsWith("/ผลงาน/"),
    destination: "/portfolio",
  },
  {
    match: (p) =>
      p.includes("68c0e9ae557b0b00135630b4") || p.startsWith("/ผ้าม่านไฟฟ้า/"),
    destination: "/products/motorized/curtain",
  },
  {
    match: (p) =>
      p.includes("610dfefb2060c70012e264c2") ||
      p.includes("ม่านพับ") ||
      (/roman/i.test(p) && /blind/i.test(p)),
    destination: "/products/curtain/roman",
  },
  {
    match: (p) => p.includes("ม่านจีบ") || /pleat/i.test(p),
    destination: "/products/curtain/pleat",
  },
  {
    match: (p) => p.includes("ม่านลอน") || /wave/i.test(p) || /s-wave/i.test(p),
    destination: "/products/curtain/s-wave",
  },
  {
    match: (p) => p.includes("ม่านตาไก่") || /eyelet/i.test(p),
    destination: "/products/curtain/eyelet",
  },
  {
    match: (p) =>
      p.includes("ม่านม้วน") ||
      (/roller/i.test(p) && /blind/i.test(p)),
    destination: "/products/roller-blinds",
  },
  {
    match: (p) =>
      p.includes("มู่ลี่") ||
      /venetian/i.test(p) ||
      (/wood/i.test(p) && /blind/i.test(p)),
    destination: "/products/venetian-blinds",
  },
  {
    match: (p) => p.includes("ม่านปรับแสง") || /vertical/i.test(p),
    destination: "/products/vertical-blinds",
  },
  {
    match: (p) => p.includes("ม่านไฟฟ้า") || /motor/i.test(p),
    destination: "/products/motorized",
  },
  {
    match: (p) => p.includes("ฉากกั้น") || /partition/i.test(p),
    destination: "/products/pvc-partition",
  },
  {
    match: (p) => p.includes("วอลเปเปอร์") || /wallpaper/i.test(p),
    destination: "/products/surface/wallpaper",
  },
  {
    match: (p) => p.includes("ฟิล์ม") || /window.?film/i.test(p),
    destination: "/products/surface/window-film",
  },
  {
    match: (p) => p.includes("ผ้าม่าน") || /curtain/i.test(p),
    destination: "/products/curtain",
  },
];

/**
 * Resolve a legacy CMS pathname to a new site path, or null if not legacy.
 * Used from middleware (Unicode paths bypass next.config redirects on Vercel).
 */
export function legacyCmsRedirect(pathname: string): string | null {
  const path = decodePathname(pathname);

  // Never rewrite valid App Router marketing URLs (e.g. /products/curtain/roman).
  if (isKnownAppPath(path)) return null;

  for (const rule of LEGACY_RULES) {
    if (rule.match(path)) return rule.destination;
  }

  if (MONGO_ID_SUFFIX.test(path)) {
    return "/products";
  }

  return null;
}
