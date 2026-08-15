/** Prefer explicit SITE_URL; then Vercel production/preview host; last localhost. */
function resolveSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  const prodHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (prodHost) return `https://${prodHost.replace(/^https?:\/\//, "")}`;
  const previewHost = process.env.VERCEL_URL?.trim();
  if (previewHost) return `https://${previewHost.replace(/^https?:\/\//, "")}`;
  return "http://localhost:3000";
}

/** Platform homepages used as empty-env placeholders — never put in JSON-LD sameAs. */
const PLACEHOLDER_SOCIAL_HOSTS = new Set([
  "www.facebook.com",
  "facebook.com",
  "www.instagram.com",
  "instagram.com",
  "www.tiktok.com",
  "tiktok.com",
  "www.youtube.com",
  "youtube.com",
]);

export function isPlaceholderSocialUrl(href: string): boolean {
  try {
    const u = new URL(href);
    if (!PLACEHOLDER_SOCIAL_HOSTS.has(u.hostname)) return false;
    const path = u.pathname.replace(/\/+$/, "");
    return path === "" || path === "/";
  } catch {
    return true;
  }
}

export const siteConfig = {
  name: "ช่างตี๋ ผ้าม่าน",
  nameEn: "Chang Tee Curtain",
  legalName: "บริษัท ช่างตี๋ ผ้าม่าน จำกัด",
  tagline: "ออกแบบ-ติดตั้ง ผ้าม่าน ครบวงจร",
  usp: "ถูก เร็ว ดี",
  description:
    "ผู้เชี่ยวชาญด้านผ้าม่านแบบครบวงจร มีโรงงานผลิตเอง วัดหน้างานฟรี ติดตั้งทั่วประเทศไทย",
  /** Default Open Graph / Twitter share image (1200-ish landscape preferred). */
  ogImage: "/images/generated/ct-hero-living.webp",
  /** Real showroom photo — use for all “ร้านเรา / โชว์รูม” placements. */
  showroomImage: "/images/about/showroom-interior.webp",
  aboutHighlights: [
    {
      title: "ช่างม่านที่เข้าใจคุณ",
      body: "เราเชื่อว่าผ้าม่านไม่ใช่แค่ของตกแต่ง แต่สะท้อนตัวตนและไลฟ์สไตล์ — รับฟัง ออกแบบ และติดตั้งให้รู้สึก “ใช่” ทุกครั้งที่มองเห็น",
    },
    {
      title: "เร็ว · คุณภาพ · มืออาชีพ",
      body: "มีโรงงานผลิตเอง ติดตั้งเร็วสุด 1–2 วัน คุมคุณภาพครบวงจร ประสการณ์กว่า 10 ปี รับประกันงานติดตั้ง 1 ปี",
    },
    {
      title: "บ้านถึงองค์กร ครบในที่เดียว",
      body: "ดูแลทั้งบ้าน คอนโด ร้านค้า ออฟฟิศ หน่วยงานราชการ และสถานศึกษา พร้อมโชว์รูมให้เลือกแบบจริง",
    },
  ],
  url: resolveSiteUrl(),
  /** Admin origin (e.g. https://admin.changtee-curtain.com). Empty = path `/admin`. */
  adminUrl: process.env.NEXT_PUBLIC_ADMIN_URL || "",
  /** Primary display phone — first SALE contact */
  phoneTel: process.env.NEXT_PUBLIC_PHONE_TEL || "0928874288",
  phoneDisplay: process.env.NEXT_PUBLIC_PHONE_DISPLAY || "092-887-4288",
  /** LINE Official Account */
  lineId: "@chang-tee",
  lineUrl: process.env.NEXT_PUBLIC_LINE_URL || "https://lin.ee/7Ul6K4n",
  lineQrUrl: "/images/line/line-oa-qr.png",
  lineQrSizes: {
    L: "/images/line/qr-L.png",
    M: "/images/line/qr-M.png",
    S: "/images/line/qr-S.png",
  },
  emailTo: process.env.EMAIL_TO || process.env.NEXT_PUBLIC_EMAIL_TO || "changtee2021@gmail.com",
  address: {
    line1: "310 ถนนไทยรามัญ",
    line2: "แขวงสามวาตะวันตก เขตคลองสามวา",
    city: "กรุงเทพมหานคร 10510",
  },
  hours: "เปิดบริการทุกวัน 08.00 น. – 20.00 น.",
  /** Google Maps — showroom */
  mapsUrl: "https://maps.app.goo.gl/K7NkC262igw8hy3a9",
  mapsLat: 13.8935427,
  mapsLng: 100.6961787,
  mapsEmbedUrl:
    "https://www.google.com/maps?q=13.8935427,100.6961787&z=16&hl=th&output=embed",
  saleContacts: [
    { name: "เซลล์โส", phoneDisplay: "092-887-4288", phoneTel: "0928874288" },
    { name: "เชลล์ตุ่น", phoneDisplay: "094-216-3761", phoneTel: "0942163761" },
    { name: "เชลล์โจ้", phoneDisplay: "094-216-3762", phoneTel: "0942163762" },
    { name: "เชลล์เฟิร์น", phoneDisplay: "094-216-3763", phoneTel: "0942163763" },
    { name: "เชลล์ฝัน", phoneDisplay: "081-550-8044", phoneTel: "0815508044" },
  ],
  /** Extra contacts from old contact page */
  hotlineContacts: [
    { name: "คุณฝัน", phoneDisplay: "080-064-8918", phoneTel: "0800648918" },
    { name: "คุณหนูตุ่น", phoneDisplay: "097-949-8645", phoneTel: "0979498645" },
  ],
  stats: [
    { label: "ลูกค้าที่ไว้วางใจ", value: "1,000+" },
    { label: "งานติดตั้ง", value: "10,000+" },
    { label: "รับประกันงานติดตั้ง", value: "1 ปี" },
    { label: "พื้นที่บริการ", value: "ทั่วไทย" },
  ],
  socialReference: "https://www.biw.co.th/",
  social: [
    {
      label: "Facebook",
      href:
        process.env.NEXT_PUBLIC_FACEBOOK_URL ||
        "https://www.facebook.com/ChangTeeCurtain",
      icon: "/images/social/facebook.svg",
    },
    {
      label: "YouTube",
      href:
        process.env.NEXT_PUBLIC_YOUTUBE_URL ||
        "https://www.youtube.com/@ช่างตี๋-ผ้าม่าน",
      icon: "/images/social/youtube.svg",
    },
    {
      label: "LINE",
      href: process.env.NEXT_PUBLIC_LINE_URL || "https://lin.ee/7Ul6K4n",
      icon: "/images/social/line.svg",
    },
    {
      label: "Instagram",
      href: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/",
      icon: "/images/social/instagram.svg",
    },
    {
      label: "TikTok",
      href: process.env.NEXT_PUBLIC_TIKTOK_URL || "https://www.tiktok.com/",
      icon: "/images/social/tiktok.svg",
    },
  ],
  brochureUrl: "/brochure/company-profile-2026.pdf",
  brochureManifestUrl: "/brochure/company-profile-2026/manifest.json",
  brochureLabel: "Download Brochure ช่างตี๋ 2026",
} as const;

/** Verified social profile URLs for schema.org sameAs (excludes bare platform homepages). */
export function socialSameAsUrls(
  social: readonly { href: string }[] = siteConfig.social,
): string[] {
  return social
    .map((s) => s.href)
    .filter((href) => href && !isPlaceholderSocialUrl(href));
}

export const navItems = [
  { href: "/", label: "หน้าแรก" },
  { href: "/products", label: "สินค้า/บริการ" },
  { href: "/portfolio", label: "ผลงาน" },
  { href: "/learn", label: "ห้องเรียนรู้" },
  { href: "/blog", label: "บทความ" },
  { href: "/contact", label: "เกี่ยวกับเรา" },
  { href: "/careers", label: "ร่วมงานกับเรา" },
  { href: "/quote", label: "ขอใบเสนอราคา" },
] as const;
