import { slugifyTh } from "@/lib/cms/content-status";
import {
  PRODUCT_OPTIONS,
  SPACE_TYPE_LABELS,
  type PortfolioItem,
  type SpaceType,
} from "@/lib/cms/portfolio-demo";
import { getCategory, getProduct } from "@/lib/product-catalog";

export type PortfolioPatternId =
  | "hero-gallery"
  | "before-after"
  | "corp"
  | "short";

export type PortfolioDraftTone = "friendly" | "formal" | "sales";

export type PortfolioImageRole = "cover" | "before" | "after" | "gallery";

export type PortfolioDraftImage = {
  id: string;
  url: string;
  role: PortfolioImageRole;
};

export type PortfolioJobFacts = {
  patternId: PortfolioPatternId;
  province: string;
  district: string;
  installDate: string;
  productSlug: string;
  variantSlug: string;
  spaceType: SpaceType;
  customerLabel: string;
  showCustomerName: boolean;
  approxSizeNote: string;
  painPoints: string;
  notesFromStaff: string;
  images: PortfolioDraftImage[];
  tone: PortfolioDraftTone;
};

export type PortfolioPatternMeta = {
  id: PortfolioPatternId;
  name: string;
  description: string;
  bestFor: string;
};

export const PORTFOLIO_PATTERNS: PortfolioPatternMeta[] = [
  {
    id: "hero-gallery",
    name: "Hero + แกลเลอรี",
    description: "รูปใหญ่ขึ้นต้น แล้วแกลเลอรีหน้างาน + รายละเอียดสั้น",
    bestFor: "บ้าน / คอนโด รูปสวย",
  },
  {
    id: "before-after",
    name: "Before / After",
    description: "เน้นเปรียบเทียบก่อน–หลังติดตั้ง",
    bestFor: "มีรูปก่อน–หลังชัด",
  },
  {
    id: "corp",
    name: "โปรเจกต์องค์กร",
    description: "โทนทางการ เน้นมาตรฐานและขนาดงาน",
    bestFor: "ออฟฟิศ / อาคาร",
  },
  {
    id: "short",
    name: "สั้นกระชับ",
    description: "1–2 ย่อหน้า พร้อมแท็ก — ลงเร็ว",
    bestFor: "รูปน้อย / ลงประจำวัน",
  },
];

export const TH_PROVINCES = [
  "กรุงเทพมหานคร",
  "นนทบุรี",
  "ปทุมธานี",
  "สมุทรปราการ",
  "สมุทรสาคร",
  "นครปฐม",
  "ชลบุรี",
  "ระยอง",
  "ฉะเชิงเทรา",
  "อยุธยา",
  "สระบุรี",
  "ราชบุรี",
  "เชียงใหม่",
  "เชียงราย",
  "ขอนแก่น",
  "นครราชสีมา",
  "อุบลราชธานี",
  "ภูเก็ต",
  "สงขลา",
  "อื่นๆ",
] as const;

export const MOCK_PORTFOLIO_IMAGES = [
  "/images/mock/curtain-living.jpg",
  "/images/mock/blinds-office.jpg",
  "/images/mock/roller-cafe.jpg",
  "/images/mock/portfolio-1.png",
  "/images/mock/showroom.png",
  "/images/mock/film.png",
] as const;

export function emptyJobFacts(): PortfolioJobFacts {
  const productSlug = PRODUCT_OPTIONS[0]?.value ?? "curtain";
  return {
    patternId: "hero-gallery",
    province: "กรุงเทพมหานคร",
    district: "",
    installDate: new Date().toISOString().slice(0, 10),
    productSlug,
    variantSlug: variantOptions(productSlug)[0]?.value ?? "",
    spaceType: "home-condo",
    customerLabel: "",
    showCustomerName: false,
    approxSizeNote: "",
    painPoints: "",
    notesFromStaff: "",
    images: [],
    tone: "friendly",
  };
}

function productName(slug: string) {
  return PRODUCT_OPTIONS.find((p) => p.value === slug)?.label ?? slug;
}

function variantName(productSlug: string, variantSlug: string) {
  if (!variantSlug) return "";
  return getProduct(productSlug, variantSlug)?.product.name ?? variantSlug;
}

function formatPlace(facts: PortfolioJobFacts) {
  const district = facts.district.trim();
  const province = facts.province.trim();
  if (district && province) return `${district} ${province}`;
  return province || district || "ไม่ระบุที่ตั้ง";
}

function formatInstallDate(iso: string) {
  if (!iso) return "";
  try {
    return new Date(`${iso}T12:00:00+07:00`).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function spaceLabel(space: SpaceType) {
  return SPACE_TYPE_LABELS[space];
}

function customerPhrase(facts: PortfolioJobFacts) {
  const name = facts.customerLabel.trim();
  if (!name || !facts.showCustomerName) return null;
  return name;
}

function orderedImages(facts: PortfolioJobFacts) {
  const cover = facts.images.find((i) => i.role === "cover");
  const before = facts.images.filter((i) => i.role === "before");
  const after = facts.images.filter((i) => i.role === "after");
  const gallery = facts.images.filter((i) => i.role === "gallery");
  const rest = facts.images.filter(
    (i) =>
      i.role !== "cover" &&
      i.role !== "before" &&
      i.role !== "after" &&
      i.role !== "gallery",
  );
  const ordered = [
    ...(cover ? [cover] : []),
    ...after,
    ...before,
    ...gallery,
    ...rest,
  ];
  const urls = Array.from(new Set(ordered.map((i) => i.url).filter(Boolean)));
  return urls;
}

function buildTags(facts: PortfolioJobFacts) {
  const tags = new Set<string>();
  tags.add(productName(facts.productSlug));
  const v = variantName(facts.productSlug, facts.variantSlug);
  if (v) tags.add(v);
  tags.add(spaceLabel(facts.spaceType));
  if (facts.province) tags.add(facts.province.replace("มหานคร", "").trim());
  if (facts.patternId === "before-after") tags.add("ก่อน-หลัง");
  if (facts.patternId === "corp") tags.add("องค์กร");
  return Array.from(tags).slice(0, 6);
}

function joinDetail(parts: string[]) {
  return parts.filter(Boolean).join("\n\n");
}

function generateTitle(facts: PortfolioJobFacts) {
  const product = productName(facts.productSlug);
  const variant = variantName(facts.productSlug, facts.variantSlug);
  const space = spaceLabel(facts.spaceType);
  const placeBit = facts.district.trim() || facts.province.trim();
  const main = variant || product;

  switch (facts.patternId) {
    case "before-after":
      return `ก่อน-หลังติดตั้ง${main} ${space}${placeBit ? ` ${placeBit}` : ""}`;
    case "corp":
      return `โปรเจกต์${main} ${space}${placeBit ? ` — ${placeBit}` : ""}`;
    case "short":
      return `${main} ${space}${placeBit ? ` ${placeBit}` : ""}`;
    default:
      return `${main}${space !== "บ้าน" ? ` ${space}` : ""}${placeBit ? ` ${placeBit}` : ""}`;
  }
}

function generateSummary(facts: PortfolioJobFacts, place: string) {
  const product = productName(facts.productSlug);
  const variant = variantName(facts.productSlug, facts.variantSlug);
  const item = variant ? `${product} (${variant})` : product;
  const space = spaceLabel(facts.spaceType);
  const pain = facts.painPoints.trim();

  if (facts.tone === "sales") {
    return pain
      ? `แก้ปัญหา${pain} ด้วย${item} ที่${place} — งาน${space}ติดตั้งจริงโดยช่างช่างที`
      : `ผลงานติดตั้ง${item} ที่${place} โทนสวย ใช้งานจริงทุกวัน`;
  }
  if (facts.tone === "formal") {
    return `ผลงานติดตั้ง${item} สำหรับ${space} บริเวณ${place}`;
  }
  return pain
    ? `ติดตั้ง${item} ที่${place} ช่วยเรื่อง${pain} ให้${space}น่าอยู่ขึ้น`
    : `ติดตั้ง${item} ที่${place} — งาน${space}จากหน้างานจริง`;
}

function generateDetail(facts: PortfolioJobFacts, place: string) {
  const product = productName(facts.productSlug);
  const variant = variantName(facts.productSlug, facts.variantSlug);
  const cat = getCategory(facts.productSlug);
  const space = spaceLabel(facts.spaceType);
  const dateLabel = formatInstallDate(facts.installDate);
  const customer = customerPhrase(facts);
  const size = facts.approxSizeNote.trim();
  const pain = facts.painPoints.trim();
  const notes = facts.notesFromStaff.trim();
  const skuLine = variant
    ? `รุ่น / SKU: ${variant}${facts.variantSlug ? ` (${facts.productSlug}/${facts.variantSlug})` : ""}`
    : `สินค้า: ${product}`;

  const introFriendly = customer
    ? `งานติดตั้ง${variant || product} ให้${customer} ที่${place}`
    : `งานติดตั้ง${variant || product} ที่${place}`;

  const introFormal = `รายงานผลงานติดตั้ง${variant || product} สำหรับ${space} บริเวณ${place}`;

  const factsBlock = [
    dateLabel ? `วันที่ติดตั้ง: ${dateLabel}` : "",
    skuLine,
    size ? `ขนาด / ขอบเขตโดยประมาณ: ${size}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  switch (facts.patternId) {
    case "before-after": {
      const p1 =
        facts.tone === "formal"
          ? introFormal
          : `${introFriendly} — เปรียบเทียบก่อนและหลังติดตั้งให้เห็นชัด`;
      const p2 = pain
        ? `ก่อนติดตั้ง: ${pain}`
        : "ก่อนติดตั้ง: พื้นที่มีแสง/ความเป็นส่วนตัวยังไม่ตรงการใช้งาน";
      const p3 = `หลังติดตั้ง: ใช้${variant || product}${cat ? ` ในกลุ่ม${cat.name}` : ""} ปรับบรรยากาศ${space}ให้อยู่สบายและดูแลง่ายขึ้น`;
      const p4 = notes || "ช่างวัด–ติดตั้งตามหน้างานจริง เก็บงานเรียบร้อยพร้อมใช้งาน";
      return joinDetail([p1, factsBlock, p2, p3, p4]);
    }
    case "corp": {
      const p1 = `${introFormal}${customer ? ` (${customer})` : ""}`;
      const p2 = [
        "จุดเน้นของงานองค์กร:",
        `- มาตรฐานการติดตั้งและความตรงต่อเวลา`,
        `- สินค้า${variant || product} เลือกให้เหมาะกับการใช้งาน${space}`,
        pain ? `- โจทย์จากลูกค้า: ${pain}` : "",
        size ? `- ขอบเขตงาน: ${size}` : "",
      ]
        .filter(Boolean)
        .join("\n");
      const p3 =
        notes ||
        "ทีมช่างทีประสานหน้างาน ติดตั้งเป็นระบบ และส่งมอบพร้อมใช้งาน";
      return joinDetail([p1, factsBlock, p2, p3]);
    }
    case "short": {
      const line = [
        facts.tone === "formal" ? introFormal : introFriendly,
        pain ? `เน้นแก้${pain}` : null,
        size ? `ขอบเขต ${size}` : null,
        dateLabel ? `ติดตั้งเมื่อ ${dateLabel}` : null,
        notes || null,
      ]
        .filter(Boolean)
        .join(" · ");
      return joinDetail([line, factsBlock]);
    }
    default: {
      const p1 =
        facts.tone === "sales"
          ? `${introFriendly} เลือก${variant || product} ให้เข้ากับไลฟ์สไตล์${space}`
          : facts.tone === "formal"
            ? introFormal
            : `${introFriendly} เน้นความสวยและการใช้งานจริงทุกวัน`;
      const p2 = pain
        ? `โจทย์จากลูกค้า: ${pain}`
        : cat
          ? `${cat.summary}`
          : "";
      const p3 = [
        `รายละเอียดสินค้า: ${variant || product}`,
        size ? `ขนาด / จำนวนโดยประมาณ: ${size}` : "",
        dateLabel ? `ติดตั้งเมื่อ ${dateLabel}` : "",
      ]
        .filter(Boolean)
        .join("\n");
      const p4 =
        notes ||
        "รูปจากหน้างานจริง — วัดพื้นที่ เลือกผ้า/ระบบ และติดตั้งโดยช่างช่างที";
      return joinDetail([p1, p2, factsBlock || p3, factsBlock ? p3 : "", p4]);
    }
  }
}

/** Template-based draft (Phase 1 — no LLM). Ready to swap for API later. */
export function generatePortfolioDraft(
  facts: PortfolioJobFacts,
  opts?: { id?: string; status?: PortfolioItem["status"]; pinned?: boolean },
): PortfolioItem {
  const place = formatPlace(facts);
  const title = generateTitle(facts).replace(/\s+/g, " ").trim();
  const summary = generateSummary(facts, place);
  const detail = generateDetail(facts, place);
  const gallery = orderedImages(facts);
  const image = gallery[0] || "/images/mock/curtain-living.jpg";
  const tags = buildTags(facts);

  const variant = variantName(facts.productSlug, facts.variantSlug);
  return {
    id: opts?.id ?? `pf-${Date.now()}`,
    title,
    slug: slugifyTh(title) || `work-${Date.now()}`,
    summary,
    detail,
    place,
    productSlug: facts.productSlug,
    spaceType: facts.spaceType,
    tags,
    image,
    gallery: gallery.length ? gallery : [image],
    status: opts?.status ?? "draft",
    pinned: opts?.pinned ?? false,
    sortOrder: 99,
    seoTitle: "",
    seoDescription: "",
    customerName: facts.customerLabel?.trim() ?? "",
    showCustomerName: facts.showCustomerName ?? false,
    installLocation: facts.approxSizeNote?.trim() ?? "",
    installDate: facts.installDate?.trim() ?? "",
    lineItems: [
      {
        productName: variant || productName(facts.productSlug),
        sku: facts.variantSlug || "",
        serialOrCode: "",
        material: "",
        color: "",
        quantity: "",
        notes: "",
      },
    ],
    internalNote: facts.notesFromStaff?.trim() ?? "",
    updatedAt: new Date().toISOString(),
  };
}

export function patternLabel(id: PortfolioPatternId) {
  return PORTFOLIO_PATTERNS.find((p) => p.id === id)?.name ?? id;
}

export function variantOptions(productSlug: string) {
  const cat = getCategory(productSlug);
  if (!cat) return [] as { value: string; label: string }[];
  return cat.children.map((c) => ({ value: c.slug, label: c.name }));
}
