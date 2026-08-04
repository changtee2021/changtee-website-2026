export const siteConfig = {
  name: "ช่างตี๋ ผ้าม่าน",
  nameEn: "Chang Tee Curtain",
  legalName: "บริษัท ช่างตี๋ ผ้าม่าน จำกัด",
  tagline: "ออกแบบ-ติดตั้ง ผ้าม่าน ครบวงจร",
  usp: "ถูก เร็ว ดี",
  description:
    "ผู้เชี่ยวชาญด้านผ้าม่านแบบครบวงจร มีโรงงานผลิตเอง วัดหน้างานฟรี ติดตั้งทั่วประเทศไทย",
  aboutHighlights: [
    {
      title: "ทำไมลูกค้าถึงมั่นใจเลือกช่างตี๋ ผ้าม่าน",
      body: "ทุกผืนผ้าม่านผ่านการตัดเย็บด้วยช่างฝีมือ พร้อม QC ก่อนส่งมอบและติดตั้งจริง เพื่อให้ลูกค้าได้รับงานคุณภาพดีที่สุด",
    },
    {
      title: "ใส่ใจรายละเอียด เพื่อทุกมุมบ้านของลูกค้า",
      body: "เราไม่ใช่แค่ร้านผ้าม่าน — แต่เป็นทีมมืออาชีพที่เข้าใจบ้านของคุณ",
    },
    {
      title: "หน้าร้านจริง มีโชว์รูมให้เลือกแบบ",
      body: "ครบ จบ ในที่เดียว — เลือกผ้า ดูตัวอย่าง และปรึกษาทีมงานได้ที่โชว์รูม",
    },
  ],
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
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
    { name: "เชลล์โล", phoneDisplay: "092-887-4288", phoneTel: "0928874288" },
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
      href: process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://www.facebook.com/",
      icon: "/images/social/facebook.svg",
    },
    {
      label: "YouTube",
      href: process.env.NEXT_PUBLIC_YOUTUBE_URL || "https://www.youtube.com/",
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
  brochureLabel: "Download Brochure ช่างตี๋ 2026",
} as const;

export const navItems = [
  { href: "/", label: "หน้าแรก" },
  { href: "/products", label: "สินค้า/บริการ" },
  { href: "/portfolio", label: "ผลงาน" },
  { href: "/estimate", label: "ประเมินราคา" },
  { href: "/blog", label: "บทความ" },
  { href: "/about", label: "เกี่ยวกับเรา" },
  { href: "/quote", label: "ขอใบเสนอราคา" },
] as const;
