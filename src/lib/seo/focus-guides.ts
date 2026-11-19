/** Guides that should pass readers into the three ad-focus product lines. */

export type ReadingLink = {
  href: string;
  title: string;
};

const CURTAIN: ReadingLink[] = [
  {
    href: "/blog/which-curtain-style",
    title: "สไตล์บ้านของคุณเหมาะกับผ้าม่านแบบไหน?",
  },
  {
    href: "/blog/curtain-price-guide",
    title: "ผ้าม่านราคาคิดยังไง แกะให้ดูเป็นก้อน",
  },
  {
    href: "/blog/s-wave-vs-pleat",
    title: "ม่านลอน S-Wave ต่างจากม่านจีบยังไง",
  },
  {
    href: "/blog/how-to-measure-window",
    title: "วิธีวัดหน้าต่างเบื้องต้นก่อนขอราคา",
  },
];

const ROLLER: ReadingLink[] = [
  {
    href: "/blog/blinds-comparison",
    title: "ม่านม้วน vs มู่ลี่ vs ม่านปรับแสง เลือกยังไง",
  },
  {
    href: "/blog/summer-heat-curtain-tips",
    title: "เตรียมบ้านรับหน้าร้อน ม่านช่วยได้แค่ไหน",
  },
  {
    href: "/blog/zebra-magic-screen",
    title: "ม่านเมจิกสกรีน (Zebra) คืออะไร เหมาะใคร",
  },
  {
    href: "/blog/how-to-measure-window",
    title: "วิธีวัดหน้าต่างเบื้องต้นก่อนขอราคา",
  },
];

const VENETIAN: ReadingLink[] = [
  {
    href: "/blog/venetian-wood-vs-aluminum",
    title: "มู่ลี่ไม้ กับ มู่ลี่อลูมิเนียม เลือกแบบไหนไม่ผิดห้อง",
  },
  {
    href: "/blog/blinds-comparison",
    title: "ม่านม้วน vs มู่ลี่ vs ม่านปรับแสง เลือกยังไง",
  },
  {
    href: "/blog/clean-venetian-blinds-guide",
    title: "ทำความสะอาดมู่ลี่แบบไม่ต้องถอด",
  },
  {
    href: "/blog/how-to-measure-window",
    title: "วิธีวัดหน้าต่างเบื้องต้นก่อนขอราคา",
  },
];

const HUB: Record<string, ReadingLink[]> = {
  curtain: CURTAIN,
  "roller-blinds": ROLLER,
  "venetian-blinds": VENETIAN,
};

const PRODUCT: Record<string, ReadingLink[]> = {
  "curtain/s-wave": [
    CURTAIN[2]!,
    CURTAIN[0]!,
    {
      href: "/blog/ready-made-vs-custom-curtains",
      title: "ม่านสำเร็จรูป vs สั่งตัด ต่างกันยังไง",
    },
    CURTAIN[3]!,
  ],
  "curtain/pleat": [
    CURTAIN[2]!,
    CURTAIN[0]!,
    CURTAIN[1]!,
    CURTAIN[3]!,
  ],
  "curtain/eyelet": [
    {
      href: "/blog/eyelet-vs-tab-top",
      title: "ม่านตาไก่ vs ม่านคอกระเช้า เลือกยังไง",
    },
    CURTAIN[0]!,
    CURTAIN[1]!,
    CURTAIN[3]!,
  ],
  "curtain/motorized": [
    {
      href: "/blog/motorized-blind-guide",
      title: "ม่านมอเตอร์เหมาะกับห้องแบบไหน",
    },
    {
      href: "/blog/motorized-curtain-price-guide",
      title: "ม่านมอเตอร์ราคาคิดยังไง ต่างม่านมือดึง",
    },
    {
      href: "/blog/motor-smart-home-guide",
      title: "ม่านมอเตอร์เชื่อม Google Home / Apple Home ได้ไหม",
    },
    CURTAIN[3]!,
  ],
  "roller-blinds/standard": [
    ROLLER[0]!,
    ROLLER[1]!,
    {
      href: "/blog/dimout-vs-blackout",
      title: "Dimout กับ Blackout ต่างกันตรงไหน",
    },
    ROLLER[3]!,
  ],
  "roller-blinds/zebra": [
    ROLLER[2]!,
    {
      href: "/blog/zebra-blind-care-tips",
      title: "ดูแลม่านเมจิกสกรีนไม่ให้แถบเป๋",
    },
    ROLLER[0]!,
    ROLLER[1]!,
  ],
  "roller-blinds/motorized": [
    {
      href: "/blog/motorized-blind-guide",
      title: "ม่านมอเตอร์เหมาะกับห้องแบบไหน",
    },
    {
      href: "/blog/motorized-curtain-price-guide",
      title: "ม่านมอเตอร์ราคาคิดยังไง ต่างม่านมือดึง",
    },
    {
      href: "/blog/motor-wired-vs-battery",
      title: "ม่านมอเตอร์ต่อไฟบ้าน vs แบตเตอรี่",
    },
    ROLLER[0]!,
  ],
  "venetian-blinds/wood": VENETIAN,
  "venetian-blinds/aluminium": [
    {
      href: "/blog/kitchen-bathroom-humidity-blinds",
      title: "ห้องครัวและห้องน้ำ เลือกม่านทนชื้นยังไง",
    },
    VENETIAN[0]!,
    VENETIAN[2]!,
    VENETIAN[1]!,
  ],
};

export function readingLinks(
  categorySlug: string,
  productSlug?: string,
): ReadingLink[] {
  if (productSlug) {
    const specific = PRODUCT[`${categorySlug}/${productSlug}`];
    if (specific) return specific;
  }
  return HUB[categorySlug] ?? [];
}

export const FOCUS_CATEGORY_SLUGS = new Set([
  "curtain",
  "roller-blinds",
  "venetian-blinds",
]);

/** Articles that support the three focus lines — slightly higher sitemap weight. */
export const FOCUS_GUIDE_SLUGS = new Set([
  "which-curtain-style",
  "curtain-price-guide",
  "s-wave-vs-pleat",
  "eyelet-vs-tab-top",
  "ready-made-vs-custom-curtains",
  "how-to-measure-window",
  "blinds-comparison",
  "summer-heat-curtain-tips",
  "zebra-magic-screen",
  "zebra-blind-care-tips",
  "dimout-vs-blackout",
  "motorized-blind-guide",
  "motorized-curtain-price-guide",
  "motor-smart-home-guide",
  "motor-wired-vs-battery",
  "venetian-wood-vs-aluminum",
  "clean-venetian-blinds-guide",
  "kitchen-bathroom-humidity-blinds",
]);
