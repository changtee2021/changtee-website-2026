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

export type PortfolioProductLine = {
  id: string;
  productSlug: string;
  variantSlug: string;
};

export type PortfolioJobFacts = {
  /** ชื่องานที่โชว์บนเว็บ — ว่างแล้วให้ AI ตั้งจากสินค้า + ลูกค้า */
  jobTitle: string;
  /** สถานที่ที่โชว์บนการ์ด / หน้ารายละเอียด */
  place: string;
  patternId: PortfolioPatternId;
  province: string;
  district: string;
  installDate: string;
  /** Primary product — always mirrors productLines[0] */
  productSlug: string;
  variantSlug: string;
  /** Installed products in order (ผ้าม่าน + ฉากกั้น ฯลฯ) */
  productLines: PortfolioProductLine[];
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

export function emptyProductLine(productSlug?: string): PortfolioProductLine {
  const slug = productSlug || PRODUCT_OPTIONS[0]?.value || "curtain";
  return {
    id: `pl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    productSlug: slug,
    variantSlug: variantOptions(slug)[0]?.value ?? "",
  };
}

export function resolvedProductLines(
  facts: Pick<PortfolioJobFacts, "productSlug" | "variantSlug" | "productLines">,
): PortfolioProductLine[] {
  if (facts.productLines?.length) return facts.productLines;
  return [
    {
      id: "pl-primary",
      productSlug: facts.productSlug,
      variantSlug: facts.variantSlug,
    },
  ];
}

export function emptyJobFacts(): PortfolioJobFacts {
  const first = emptyProductLine();
  return {
    jobTitle: "",
    place: "",
    patternId: "hero-gallery",
    province: "",
    district: "",
    installDate: "",
    productSlug: first.productSlug,
    variantSlug: first.variantSlug,
    productLines: [first],
    spaceType: "home-condo",
    customerLabel: "",
    showCustomerName: true,
    approxSizeNote: "",
    painPoints: "",
    notesFromStaff: "",
    images: [],
    tone: "friendly",
  };
}

function inferCategoryFromSku(sku: string): string {
  if (!sku) return "";
  for (const cat of PRODUCT_OPTIONS) {
    if (variantOptions(cat.value).some((v) => v.value === sku)) return cat.value;
  }
  return "";
}

function lineToProductLine(
  item: PortfolioItem,
  row: PortfolioItem["lineItems"][number],
  index: number,
): PortfolioProductLine {
  const category =
    row.categorySlug?.trim() ||
    inferCategoryFromSku(row.sku.trim()) ||
    (index === 0 ? item.productSlug : "");
  const slug = category || item.productSlug;
  const variants = variantOptions(slug);
  const sku = row.sku.trim();
  return {
    id: `pl-${item.id}-${index}`,
    productSlug: slug,
    variantSlug: variants.some((v) => v.value === sku) ? sku : "",
  };
}

export function factsFromPortfolioItem(item: PortfolioItem): PortfolioJobFacts {
  const urls = Array.from(
    new Set((item.gallery.length ? item.gallery : [item.image]).filter(Boolean)),
  );
  const cover = item.image.trim() || urls[0] || "";
  const sourceRows = item.lineItems.filter(
    (row, index) =>
      index === 0 ||
      Boolean(row.categorySlug?.trim() || row.sku.trim() || row.productName.trim()),
  );
  const productLines = sourceRows.length
    ? sourceRows.map((row, index) => lineToProductLine(item, row, index))
    : [
        {
          id: `pl-${item.id}-0`,
          productSlug: item.productSlug,
          variantSlug: variantOptions(item.productSlug).some(
            (v) => v.value === (item.lineItems[0]?.sku?.trim() ?? ""),
          )
            ? (item.lineItems[0]?.sku?.trim() ?? "")
            : "",
        },
      ];

  return {
    ...emptyJobFacts(),
    jobTitle: item.title,
    place: item.place,
    productSlug: productLines[0]?.productSlug || item.productSlug,
    variantSlug: productLines[0]?.variantSlug ?? "",
    productLines,
    spaceType: item.spaceType,
    customerLabel: item.customerName,
    showCustomerName: item.showCustomerName,
    installDate: item.installDate,
    approxSizeNote: item.installLocation,
    images: urls.map((url, index) => ({
      id: `img-${item.id}-${index}`,
      url,
      role: url === cover && urls.indexOf(cover) === index ? "cover" : "gallery",
    })),
  };
}

function productName(slug: string) {
  return PRODUCT_OPTIONS.find((p) => p.value === slug)?.label ?? slug;
}

function variantName(productSlug: string, variantSlug: string) {
  if (!variantSlug) return "";
  return getProduct(productSlug, variantSlug)?.product.name ?? variantSlug;
}

function lineLabel(line: PortfolioProductLine) {
  return variantName(line.productSlug, line.variantSlug) || productName(line.productSlug);
}

function installedLabels(facts: PortfolioJobFacts): string[] {
  const names = resolvedProductLines(facts)
    .map(lineLabel)
    .filter(Boolean);
  return Array.from(new Set(names));
}

function productPhrase(facts: PortfolioJobFacts) {
  const names = installedLabels(facts);
  if (names.length === 0) return productName(facts.productSlug);
  if (names.length === 1) return names[0]!;
  if (names.length === 2) return `${names[0]}กับ${names[1]}`;
  return `${names.slice(0, -1).join(" ")} และ${names[names.length - 1]}`;
}

function formatPlace(facts: PortfolioJobFacts) {
  if (facts.place?.trim()) return facts.place.trim();
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
  for (const line of resolvedProductLines(facts)) {
    tags.add(productName(line.productSlug));
    const v = variantName(line.productSlug, line.variantSlug);
    if (v) tags.add(v);
  }
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
  if (facts.jobTitle?.trim()) return facts.jobTitle.trim();
  const main = productPhrase(facts);
  const who = facts.customerLabel.trim();
  const placeBit =
    facts.place?.trim() || facts.district.trim() || facts.province.trim();
  if (who) return `${main} ${who}`;
  if (placeBit) return `${main} ${placeBit}`;
  return main;
}

function generateSummary(facts: PortfolioJobFacts, place: string) {
  const item = productPhrase(facts);
  const space = spaceLabel(facts.spaceType);
  const pain = facts.painPoints.trim();
  const who = facts.customerLabel.trim();
  const where = who && who !== place ? `${who} ${place}` : who || place;

  if (facts.tone === "sales") {
    return pain
      ? `${item}ช่วย${pain} ที่${where} — เหมาะ${space}ที่อยากได้ทั้งฟังก์ชันและความเรียบ`
      : `${item}ที่${where} เลือกให้เข้ากับ${space} ใช้งานจริงทุกวัน`;
  }
  if (facts.tone === "formal") {
    return `${item}สำหรับ${space}บริเวณ${where} เน้นการใช้งานและความเรียบร้อย`;
  }
  if (pain) {
    return `${item}ที่${where} ช่วยเรื่อง${pain} ให้${space}อยู่สบายขึ้น`;
  }
  return `${item}ที่${where} เลือกให้เข้ากับ${space} ทั้งคุมแสงและความเป็นระเบียบ`;
}

function generateDetail(facts: PortfolioJobFacts, place: string) {
  const lines = resolvedProductLines(facts);
  const product = productName(facts.productSlug);
  const variant = variantName(facts.productSlug, facts.variantSlug);
  const item = productPhrase(facts);
  const cat = getCategory(facts.productSlug);
  const space = spaceLabel(facts.spaceType);
  const dateLabel = formatInstallDate(facts.installDate);
  const customer = customerPhrase(facts);
  const size = facts.approxSizeNote.trim();
  const pain = facts.painPoints.trim();
  const notes = facts.notesFromStaff.trim();
  const skuLine =
    lines.length > 1
      ? `สินค้า: ${lines.map((line, index) => `${index + 1}. ${lineLabel(line)}`).join(" ")}`
      : variant
        ? `รุ่น / SKU: ${variant}${facts.variantSlug ? ` (${facts.productSlug}/${facts.variantSlug})` : ""}`
        : `สินค้า: ${product}`;

  const introFriendly = customer
    ? `งานติดตั้ง${item} ให้${customer} ที่${place}`
    : `งานติดตั้ง${item} ที่${place}`;

  const introFormal = `รายงานผลงานติดตั้ง${item} สำหรับ${space} บริเวณ${place}`;

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
      const p3 = `หลังติดตั้ง: ใช้${item}${cat ? ` ในกลุ่ม${cat.name}` : ""} ปรับบรรยากาศ${space}ให้อยู่สบายและดูแลง่ายขึ้น`;
      const p4 = notes || "ช่างวัด–ติดตั้งตามหน้างานจริง เก็บงานเรียบร้อยพร้อมใช้งาน";
      return joinDetail([p1, factsBlock, p2, p3, p4]);
    }
    case "corp": {
      const p1 = `${introFormal}${customer ? ` (${customer})` : ""}`;
      const p2 = [
        "จุดเน้นของงานองค์กร:",
        `- มาตรฐานการติดตั้งและความตรงต่อเวลา`,
        `- สินค้า${item} เลือกให้เหมาะกับการใช้งาน${space}`,
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
      const why = pain
        ? `${space}ที่${place} มีโจทย์${pain} เลยเลือก${item} ให้ตอบการใช้งานจริง`
        : `${space}ที่${place} เลือก${item} เพราะดูแลง่าย คุมแสงได้ และเข้ากับหน้างานโดยไม่แย่งบรรยากาศ`;
      const fit = cat
        ? `${cat.summary} เหมาะ${space}ที่อยากได้ทั้งฟังก์ชันและความเป็นระเบียบ`
        : `สไตล์นี้เหมาะ${space}ที่อยากคุมแสงและความเป็นส่วนตัวโดยไม่กินพื้นที่`;
      const extra = [
        size ? `ขอบเขตงานโดยประมาณ ${size}` : "",
        dateLabel ? `ติดตั้งเมื่อ ${dateLabel}` : "",
        notes,
      ]
        .filter(Boolean)
        .join(" ");
      return joinDetail([why, fit, extra]);
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

  const lines = resolvedProductLines(facts);
  return {
    id: opts?.id ?? `pf-${Date.now()}`,
    title,
    slug: slugifyTh(title) || `work-${Date.now()}`,
    summary,
    detail,
    place,
    productSlug: lines[0]?.productSlug || facts.productSlug,
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
    lineItems: lines.map((line) => ({
      categorySlug: line.productSlug,
      productName: lineLabel(line),
      sku: line.variantSlug || "",
      serialOrCode: "",
      material: "",
      color: "",
      quantity: "",
      notes: "",
    })),
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
