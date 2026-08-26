/** Old CMS paths (Thai slug + Mongo-style id) → new App Router URLs. */

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

function includesAny(path: string, needles: string[]): boolean {
  return needles.some((n) => path.includes(n));
}

type LegacyRule = { match: (path: string) => boolean; destination: string };

/**
 * Most specific first. Covers old CMS Thai slugs, English CMS leftovers,
 * and Google Ads landing paths seen Aug 2026.
 */
const LEGACY_RULES: LegacyRule[] = [
  {
    match: (p) =>
      p.includes("60ff6a36e68a7c5a4ca8c54e") ||
      p.startsWith("/หน้าแรก/") ||
      p.startsWith("/home/"),
    destination: "/",
  },
  {
    match: (p) =>
      p.includes("610e26deafee180012845be9") ||
      p.startsWith("/ผลงาน/") ||
      p.startsWith("/gallery/"),
    destination: "/portfolio",
  },
  {
    match: (p) =>
      p.includes("ติดต่อเรา") ||
      p.includes("ติดต่อ") ||
      p.startsWith("/contact/") ||
      p.includes("เกี่ยวกับเรา") ||
      p.startsWith("/about/"),
    destination: "/contact",
  },
  {
    match: (p) =>
      includesAny(p, ["ใบเสนอราคา", "ขอราคา", "ประเมินราคา"]) ||
      p.startsWith("/quote/") ||
      p.startsWith("/estimate/"),
    destination: "/quote",
  },
  {
    match: (p) =>
      p.includes("68c0e9ae557b0b00135630b4") ||
      p.startsWith("/ผ้าม่านไฟฟ้า/") ||
      includesAny(p, ["ผ้าม่านไฟฟ้า", "ม่านไฟฟ้าผ้า"]),
    destination: "/products/motorized/curtain",
  },
  {
    match: (p) =>
      includesAny(p, ["ม่านม้วนไฟฟ้า", "ม่านม้วนมอเตอร์"]) ||
      (/roller/i.test(p) && /motor/i.test(p)),
    destination: "/products/motorized/roller",
  },
  {
    match: (p) =>
      includesAny(p, ["ม่านปรับแสงไฟฟ้า", "ม่านปรับแสงมอเตอร์"]),
    destination: "/products/motorized/vertical",
  },
  {
    match: (p) => includesAny(p, ["มู่ลี่ไม้ไฟฟ้า", "มู่ลี่ไม้มอเตอร์"]),
    destination: "/products/motorized/wood",
  },
  {
    match: (p) =>
      includesAny(p, ["มู่ลี่อลูมิเนียมไฟฟ้า", "มู่ลี่อลูมิเนียมมอเตอร์"]),
    destination: "/products/motorized/aluminium",
  },
  {
    match: (p) =>
      includesAny(p, ["ม่านญี่ปุ่น", "ผ้าม่านญี่ปุ่น"]) || /noren/i.test(p),
    destination: "/products/print-fabric/noren",
  },
  {
    match: (p) =>
      p.includes("610dfefb2060c70012e264c2") ||
      includesAny(p, ["ม่านพับ", "ม่านโรมัน"]) ||
      (/roman/i.test(p) && /blind/i.test(p)),
    destination: "/products/curtain/roman",
  },
  {
    match: (p) => includesAny(p, ["ม่านจีบ", "ม่านพินช์"]) || /pleat/i.test(p),
    destination: "/products/curtain/pleat",
  },
  {
    match: (p) =>
      includesAny(p, ["ม่านลอน", "ม่านเอสวาฟ"]) ||
      /s-?wave/i.test(p) ||
      /wave.?fold/i.test(p),
    destination: "/products/curtain/s-wave",
  },
  {
    match: (p) => includesAny(p, ["ม่านตาไก่"]) || /eyelet/i.test(p),
    destination: "/products/curtain/eyelet",
  },
  {
    match: (p) => includesAny(p, ["ม่านน้ำตก"]) || /waterfall/i.test(p),
    destination: "/products/curtain/waterfall",
  },
  {
    match: (p) => includesAny(p, ["ม่านคอกระเช้า"]) || /tab.?top/i.test(p),
    destination: "/products/curtain/tab-top",
  },
  {
    match: (p) => includesAny(p, ["ม่านหลุยส์"]) || /swag/i.test(p),
    destination: "/products/curtain/louis",
  },
  {
    match: (p) =>
      includesAny(p, ["ม่านโรงพยาบาล", "ม่านกั้นเตียง"]) || /hospital/i.test(p),
    destination: "/products/curtain/hospital",
  },
  {
    match: (p) =>
      includesAny(p, ["ม่านม้วนเมจิก", "เมจิกสกรีน", "ม่านซีบร้า"]) ||
      /zebra/i.test(p) ||
      /magic.?screen/i.test(p),
    destination: "/products/roller-blinds/zebra",
  },
  {
    match: (p) =>
      includesAny(p, ["ม่านม้วนพิมพ์ลาย", "ม่านม้วนพิมพ์"]),
    destination: "/products/print-fabric/print-roller",
  },
  {
    match: (p) =>
      includesAny(p, ["ม่านม้วนภายนอก", "ม่านกลางแจ้ง"]) ||
      (/outdoor/i.test(p) && /roller/i.test(p)),
    destination: "/products/outdoor-factory/outdoor-roller",
  },
  {
    match: (p) =>
      includesAny(p, ["ม่านรางซิป", "ม่านซิป"]) || /zip.?blind/i.test(p),
    destination: "/products/outdoor-factory/zip-blind",
  },
  {
    match: (p) =>
      includesAny(p, ["ม่านสกายไลท์", "ม่านหลังคา"]) || /skylight/i.test(p),
    destination: "/products/outdoor-factory/skylight",
  },
  {
    match: (p) =>
      includesAny(p, [
        "ม่านริ้ว",
        "ม่านพีวีซี",
        "ม่านโรงงาน",
        "ม่านอุตสาหกรรม",
      ]) || /pvc.?strip/i.test(p),
    destination: "/products/outdoor-factory/pvc-strip",
  },
  {
    match: (p) =>
      includesAny(p, ["ม่านม้วน"]) ||
      (/roller/i.test(p) && /blind/i.test(p)),
    destination: "/products/roller-blinds",
  },
  {
    match: (p) => includesAny(p, ["มู่ลี่โรมัน", "โรมันเชด"]) || /roman.?shade/i.test(p),
    destination: "/products/venetian-blinds/roman-shade",
  },
  {
    match: (p) => includesAny(p, ["มู่ลี่ไม้ไผ่"]) || /bamboo/i.test(p),
    destination: "/products/venetian-blinds/bamboo",
  },
  {
    match: (p) => includesAny(p, ["มู่ลี่อลูมิเนียม", "มู่ลี่อลู"]),
    destination: "/products/venetian-blinds/aluminium",
  },
  {
    match: (p) => includesAny(p, ["มู่ลี่ไม้"]),
    destination: "/products/venetian-blinds/wood",
  },
  {
    match: (p) =>
      includesAny(p, ["มู่ลี่"]) || /venetian/i.test(p),
    destination: "/products/venetian-blinds",
  },
  {
    match: (p) =>
      includesAny(p, ["ม่านปรับแสง"]) || /vertical/i.test(p),
    destination: "/products/vertical-blinds",
  },
  {
    match: (p) =>
      includesAny(p, [
        "ฉากกั้นแอร์",
        "ฉากกั้นห้องpvc",
        "ฉากกั้นpvc",
        "ฉากกั้นพีวีซี",
      ]),
    destination: "/products/pvc-partition",
  },
  {
    match: (p) => includesAny(p, ["ฉากญี่ปุ่น"]),
    destination: "/products/pvc-partition/japanese",
  },
  {
    match: (p) => includesAny(p, ["ฉากยูโร"]),
    destination: "/products/pvc-partition/euro",
  },
  {
    match: (p) => includesAny(p, ["ฉาก USA", "ฉากusa", "ฉากยูเอสเอ"]),
    destination: "/products/pvc-partition/usa",
  },
  {
    match: (p) =>
      includesAny(p, ["ฉากกั้น", "ฉากกั้นห้อง"]) || /partition/i.test(p),
    destination: "/products/pvc-partition",
  },
  {
    match: (p) =>
      includesAny(p, ["ม่านไฟฟ้า"]) || /motor/i.test(p),
    destination: "/products/motorized",
  },
  {
    match: (p) =>
      includesAny(p, ["ม่านพิมพ์ลาย", "ผ้าพิมพ์", "พิมพ์ผ้า"]) ||
      /print.?fabric/i.test(p),
    destination: "/products/print-fabric",
  },
  {
    match: (p) => includesAny(p, ["วอลเปเปอร์", "วอลล์เปเปอร์"]) || /wallpaper/i.test(p),
    destination: "/products/surface/wallpaper",
  },
  {
    match: (p) =>
      includesAny(p, ["ฟิล์มอาคาร", "ฟิล์มกรองแสง", "ติดฟิล์ม"]) ||
      /window.?film/i.test(p),
    destination: "/products/surface/window-film",
  },
  {
    match: (p) => includesAny(p, ["ซักผ้าม่าน", "ซักม่าน"]),
    destination: "/products/service/washing",
  },
  {
    match: (p) => includesAny(p, ["ซ่อมผ้าม่าน", "ซ่อมม่าน"]),
    destination: "/products/service/repair",
  },
  {
    match: (p) =>
      includesAny(p, ["บทความ", "บล็อก"]) || p.startsWith("/blog/"),
    destination: "/blog",
  },
  {
    match: (p) => includesAny(p, ["ผ้าม่าน"]) || /curtain/i.test(p),
    destination: "/products/curtain",
  },
];

/**
 * Resolve a legacy CMS pathname to a new site path, or null if not legacy.
 * Used from middleware (Unicode paths bypass next.config redirects on Vercel).
 */
export function legacyCmsRedirect(pathname: string): string | null {
  const path = decodePathname(pathname);

  if (isKnownAppPath(path)) return null;

  for (const rule of LEGACY_RULES) {
    if (rule.match(path)) return rule.destination;
  }

  if (MONGO_ID_SUFFIX.test(path)) {
    return "/products";
  }

  return null;
}
