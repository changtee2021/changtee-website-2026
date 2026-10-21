import type { Locale } from "@/lib/i18n/locale";
import type { ProductContent, ProductFaq } from "@/lib/product-content";

export type ProductContentOverlay = Partial<
  Omit<ProductContent, "faqs">
> & {
  faqs?: ProductFaq[];
  name?: string;
  summary?: string;
};

type OverlayPack = Record<string, ProductContentOverlay>;

/** English overlays for flagship industrial / roller products. */
const en: OverlayPack = {
  "outdoor-factory/pvc-strip": {
    name: "PVC Strip Curtain",
    summary: "Factory, warehouse, cold room",
    tagline:
      "Dust, insects, noise and temperature control — people and forklifts pass through freely",
    body: [
      "PVC strip curtains hang as overlapping vertical strips at doorways and walkways. When people or forklifts pass, the strips part and close again — blocking dust, smoke, insects and noise without opening a solid door every time.",
      "In factories they separate production and clean zones; in warehouses they cover wide openings for forklifts; in restaurants they divide the kitchen from the front of house. At cold rooms they cut cold-air loss and save energy.",
      "Four main ranges: standard clear, yellow insect-resistant, Super Polar cold-rated to −50°C, and opaque light-blocking colours — flat or ribbed impact surfaces in 200×2 and 300×3 mm.",
      "Chang Tee surveys the opening, recommends strip type, overlap and hanging rail, installs the set, and replaces worn strips one by one.",
    ],
    highlights: [
      "Dust and insect barrier",
      "Temperature control, lower energy use",
      "Cold-rated to −50°C (Super Polar)",
      "Replace strips one at a time",
    ],
    suitableFor: [
      "Factory / production line",
      "Warehouse storage",
      "Restaurant / back kitchen",
      "Food factory",
      "Cold room / refrigerated truck",
    ],
    care: "Wipe with mild soap or plastic-safe cleaner. Avoid strong solvents. Replace cloudy, torn or stiff strips individually.",
  },
  "pvc-partition/japanese": {
    name: "Japanese partition",
    summary: "Folding PVC room divider",
    tagline:
      "Folding PVC partition for rooms that need flexible space",
    body: [
      "Japanese-style PVC folding partitions divide rooms without a permanent wall — ideal when you need flexible living, dining or work space.",
      "Chang Tee measures height and opening direction, then installs a smooth folding set that stores neatly when open.",
    ],
    highlights: [
      "Folds to save space",
      "Custom height and width",
      "Easy to open and close",
      "Measured and installed on site",
    ],
    suitableFor: [
      "Home",
      "Condo",
      "Office",
      "Clinic",
    ],
  },
  "pvc-partition/euro": {
    name: "Euro partition",
    summary: "PVC partition with acrylic panels",
    tagline:
      "Bright PVC partition with acrylic vision panels",
    body: [
      "Euro partitions combine solid PVC panels with acrylic windows so light still reaches the room while space is clearly divided.",
      "Choose panel colours and acrylic layout to match the shop, office or clinic — measured and installed by Chang Tee.",
    ],
    highlights: [
      "Acrylic vision panels",
      "Custom colours",
      "Shop and office friendly",
      "On-site measure and install",
    ],
    suitableFor: [
      "Shop",
      "Office",
      "Clinic",
      "Showroom",
    ],
  },
  "roller-blinds/sunscreen": {
    name: "Sunscreen roller blind",
    summary: "Cut glare, keep the view",
    tagline:
      "Roller blinds that cut glare while keeping daylight and the view",
    body: [
      "Sunscreen fabrics reduce heat and glare without darkening the room completely — popular for living rooms, offices and glass façades.",
      "Chang Tee helps pick openness and colour for your sun direction, then measures and installs a clean roller cassette.",
    ],
    highlights: [
      "Cut glare, keep daylight",
      "Many openness levels",
      "Clean cassette look",
      "Free on-site measuring",
    ],
    suitableFor: [
      "Home",
      "Condo",
      "Office",
    ],
  },
  "outdoor-factory/outdoor-roller": {
    name: "Outdoor roller blind",
    summary: "Sun and rain on balconies and terraces",
    tagline:
      "Outdoor roller blinds for sun, rain splash and open terraces",
    body: [
      "Outdoor-rated fabrics and hardware handle sun and light rain better than indoor blinds — for balconies, cafés and semi-open areas.",
      "We survey fixing points and wind exposure before confirming the model and install method.",
    ],
    highlights: [
      "Outdoor-rated materials",
      "Shade before heat enters",
      "Balcony and café friendly",
      "Site survey before install",
    ],
    suitableFor: [
      "Balcony",
      "Café terrace",
      "Semi-outdoor",
    ],
  },
};

/** Burmese overlays. */
const my: OverlayPack = {
  "outdoor-factory/pvc-strip": {
    name: "PVC အစင်းလိုက်ကာ",
    summary: "စက်ရုံ၊ ဂိုဒေါင်၊ အအေးခန်း",
    tagline:
      "ဖုန်နှင့် ပိုးမွှားကို ကာကွယ်ပြီး အပူချိန်ကို ထိန်းပေးသည် — လူနှင့် ဖို့ကလစ် ဖြတ်သွားနိုင်သည်",
    body: [
      "PVC အစင်းလိုက်ကာကို တံခါးဝ သို့မဟုတ် လမ်းကြောင်းတွင် ချိတ်ဆွဲထားသည်။ လူ သို့မဟုတ် ဖို့ကလစ် ဖြတ်သွားသောအခါ အစင်းများ ခွဲထွက်ပြီး ပြန်ပိတ်သွားသည်။ ဖုန်၊ မီးခိုး၊ ပိုးမွှားနှင့် ဆူညံသံကို ကာကွယ်ပေးသည်။",
      "စက်ရုံ၊ ဂိုဒေါင်၊ စားသောက်ဆိုင် မီးဖိုချောင်နှင့် အအေးခန်းများတွင် အသုံးပြုနိုင်သည်။ အအေးခန်းတွင် အအေးလေ ထွက်မှုကို လျှော့ချပြီး လျှပ်စစ်ဓာတ်အား သက်သာစေသည်။",
      "အမျိုးအစား ၄ မျိုး — ကြည်လင်သော အစင်း၊ ပိုးမွှားကာ အဝါရောင်၊ Super Polar (−၅၀°C အထိ) နှင့် အလင်းကာ အရောင်။ အရွယ်အစား ၂၀၀×၂ နှင့် ၃၀၀×၃ မီလီမီတာ။",
      "Chang Tee သည် နေရာကို လာရောက်တိုင်းတာပြီး သင့်တော်သော အစင်းနှင့် ချိတ်တန်းကို အကြံပြုကာ တပ်ဆင်ပေးသည်။ ပျက်စီးသော အစင်းကို တစ်ခုချင်း လဲလှယ်နိုင်သည်။",
    ],
    highlights: [
      "ဖုန်နှင့် ပိုးမွှား ကာကွယ်",
      "အပူချိန်ထိန်း၊ လျှပ်စစ်သက်သာ",
      "−၅၀°C အထိ ခံနိုင် (Super Polar)",
      "အစင်းတစ်ခုချင်း လဲလှယ်နိုင်",
    ],
    suitableFor: [
      "စက်ရုံ / ထုတ်လုပ်ရေးလိုင်း",
      "ဂိုဒေါင်",
      "စားသောက်ဆိုင် / မီးဖိုချောင်",
      "အစားအသောက် စက်ရုံ",
      "အအေးခန်း / အအေးခန်းကား",
    ],
    care: "ဆပ်ပြာပျော့ရည်ဖြင့် သုတ်ပါ။ ပြင်းထန်သော ဓာတုပစ္စည်းကို ရှောင်ပါ။ မှုန်ဝါး၊ ပြဲ သို့မဟုတ် မာကျောလာသော အစင်းကို တစ်ခုချင်း လဲပါ။",
  },
};

/** Lao overlays. */
const lo: OverlayPack = {
  "outdoor-factory/pvc-strip": {
    name: "ຜ້າມ່ານເສັ້ນ PVC",
    summary: "ໂຮງງານ, ສາງສິນຄ້າ, ຫ້ອງເຢັນ",
    tagline:
      "ກັນຝຸ່ນ ກັນແມງໄມ້ ແລະ ຄວບຄຸມອຸນຫະພູມ — ຄົນ ແລະ ລົດຍົກ ຜ່ານໄປມາໄດ້ສະດວກ",
    body: [
      "ຜ້າມ່ານເສັ້ນ PVC ແຂວນເປັນເສັ້ນຊ້ອນກັນຢູ່ປະຕູ ຫຼື ທາງຜ່ານ. ເມື່ອຄົນ ຫຼື ລົດຍົກຜ່ານ ເສັ້ນຈະແຍກອອກ ແລ້ວປິດຄືນເອງ. ຊ່ວຍກັນຝຸ່ນ ຄວັນ ແມງໄມ້ ແລະ ສຽງດັງ.",
      "ໃຊ້ໄດ້ໃນໂຮງງານ, ສາງສິນຄ້າ, ຫຼັງຄົວຮ້ານອາຫານ ແລະ ຫ້ອງເຢັນ. ຢູ່ຫ້ອງເຢັນ ຊ່ວຍຫຼຸດຄວາມເຢັນຮົ່ວອອກ ແລະ ປະຢັດໄຟ.",
      "ມີ 4 ແບບຫຼັກ: ແບບໃສ, ແບບສີເຫຼືອງກັນແມງໄມ້, Super Polar (ທົນເຖິງ −50°C) ແລະ ແບບສີທຶບກັນແສງ. ຂະໜາດ 200×2 ແລະ 300×3 ມມ.",
      "Chang Tee ໄປວັດໜ້າງານ, ແນະນຳເສັ້ນ ແລະ ລາງແຂວນທີ່ເໝາະສົມ, ແລ້ວຕິດຕັ້ງໃຫ້. ເສັ້ນທີ່ເສຍ ປ່ຽນເປັນເສັ້ນໆໄດ້.",
    ],
    highlights: [
      "ກັນຝຸ່ນ ແລະ ແມງໄມ້",
      "ຄວບຄຸມອຸນຫະພູມ, ປະຢັດໄຟ",
      "ທົນເຢັນເຖິງ −50°C (Super Polar)",
      "ປ່ຽນເປັນເສັ້ນໆໄດ້",
    ],
    suitableFor: [
      "ໂຮງງານ / ສາຍການຜະລິດ",
      "ສາງສິນຄ້າ",
      "ຮ້ານອາຫານ / ຫຼັງຄົວ",
      "ໂຮງງານອາຫານ",
      "ຫ້ອງເຢັນ / ລົດຫ້ອງເຢັນ",
    ],
    care: "ເຊັດດ້ວຍນ້ຳສະບູອ່ອນໆ. ຫຼີກລ່ຽງນ້ຳຢາແຮງ. ເສັ້ນທີ່ຂຸ່ນ, ຂາດ ຫຼື ແຂງ ໃຫ້ປ່ຽນສະເພາະເສັ້ນນັ້ນ.",
  },
};

/** Khmer overlays. */
const km: OverlayPack = {
  "outdoor-factory/pvc-strip": {
    name: "វាំងននបន្ទះ PVC",
    summary: "រោងចក្រ ឃ្លាំង បន្ទប់ត្រជាក់",
    tagline:
      "ការពារធូលី សត្វល្អិត និងរក្សាសីតុណ្ហភាព — មនុស្ស និងរថយន្តលើកទំនិញ ឆ្លងកាត់បានស្រួល",
    body: [
      "វាំងននបន្ទះ PVC ព្យួរជាបន្ទះត្រួតគ្នានៅមាត់ទ្វារ ឬផ្លូវដើរ។ ពេលមនុស្ស ឬរថយន្តលើកទំនិញឆ្លងកាត់ បន្ទះនឹងបើកចេញ ហើយបិទវិញដោយខ្លួនឯង។ ជួយការពារធូលី ផ្សែង សត្វល្អិត និងសំឡេង។",
      "ប្រើបានក្នុងរោងចក្រ ឃ្លាំងទំនិញ ផ្ទះបាយភោជនីយដ្ឋាន និងបន្ទប់ត្រជាក់។ នៅបន្ទប់ត្រជាក់ វាជួយកាត់បន្ថយការលេចខ្យល់ត្រជាក់ និងសន្សំអគ្គិសនី។",
      "មាន ៤ ប្រភេទសំខាន់៖ បន្ទះថ្លា បន្ទះពណ៌លឿងការពារសត្វល្អិត Super Polar (ធន់ដល់ −៥០°C) និងបន្ទះពណ៌ការពារពន្លឺ។ ទំហំ ២០០×២ និង ៣០០×៣ ម.ម។",
      "Chang Tee មកវាស់ទីតាំង ណែនាំបន្ទះ និងរបារព្យួរដែលសមស្រប ហើយដំឡើងជូន។ បន្ទះដែលខូចអាចប្តូរម្តងមួយៗបាន។",
    ],
    highlights: [
      "ការពារធូលី និងសត្វល្អិត",
      "រក្សាសីតុណ្ហភាព សន្សំអគ្គិសនី",
      "ធន់ត្រជាក់ដល់ −៥០°C (Super Polar)",
      "ប្តូរបន្ទះម្តងមួយៗបាន",
    ],
    suitableFor: [
      "រោងចក្រ / ខ្សែសង្វាក់ផលិតកម្ម",
      "ឃ្លាំងទំនិញ",
      "ភោជនីយដ្ឋាន / ផ្ទះបាយ",
      "រោងចក្រម្ហូបអាហារ",
      "បន្ទប់ត្រជាក់ / ឡានត្រជាក់",
    ],
    care: "ជូតដោយទឹកសាប៊ូស្រាល។ ជៀសវាងសារធាតុគីមីខ្លាំង។ បន្ទះដែលស្រអាប់ រហែក ឬរឹង គួរប្តូរតែបន្ទះនោះ។",
  },
};

/** Simplified Chinese overlays. */
const zhHans: OverlayPack = {
  "outdoor-factory/pvc-strip": {
    name: "PVC软门帘",
    summary: "工厂、仓库、冷库",
    tagline:
      "防尘防虫隔音控温 — 人与叉车仍可随时通行",
    body: [
      "PVC软门帘以重叠竖条悬挂在门口或通道。人或叉车通过时条帘自动分开再合拢，阻挡粉尘、烟气、昆虫与噪音，无需每次开关硬门。",
      "工厂用于分隔产线与洁净区；仓库覆盖宽门口方便叉车；餐厅分隔后厨与前厅。冷库门口可减少冷气外泄、更省电。",
      "四大系列：标准透明、防虫黄帘、耐寒 Super Polar（至 −50°C）、遮光不透明色 — 平面或防撞棱面，规格 200×2 与 300×3 毫米。",
      "Chang Tee 上门勘测门口、推荐条帘型号与重叠及吊轨，整套安装；磨损条帘可单条更换。",
    ],
    highlights: [
      "防尘防虫",
      "控温省电",
      "耐寒至 −50°C（Super Polar）",
      "可单条更换",
    ],
    suitableFor: [
      "工厂 / 产线",
      "仓库",
      "餐厅 / 后厨",
      "食品厂",
      "冷库 / 冷藏车",
    ],
    care: "用中性皂液或塑料清洁剂擦拭，避免强溶剂。浑浊、破损或变硬的条帘请单独更换。",
  },
};

/** Traditional Chinese overlays (軟門簾 / 丈量 / 報價). */
const zhHant: OverlayPack = {
  "outdoor-factory/pvc-strip": {
    name: "PVC軟門簾",
    summary: "工廠、倉庫、冷藏庫",
    tagline:
      "防塵防蟲隔音控溫 — 人與堆高機仍可隨時通行",
    body: [
      "PVC軟門簾以重疊直條懸掛於門口或走道。人或堆高機通過時條簾自動分開再合攏，阻擋粉塵、煙氣、昆蟲與噪音，無需每次開關硬門。",
      "工廠用於分隔產線與潔淨區；倉庫覆蓋寬門口方便堆高機；餐廳分隔後廚與前場。冷藏庫門口可減少冷氣外洩、更省電。",
      "四大系列：標準透明、防蟲黃簾、耐寒 Super Polar（至 −50°C）、遮光不透明色 — 平面或防撞棱面，規格 200×2 與 300×3 公釐。",
      "Chang Tee 到場丈量門口、推薦條簾型號與重疊及吊軌，整套安裝；磨損條簾可單條更換。歡迎索取報價。",
    ],
    highlights: [
      "防塵防蟲",
      "控溫省電",
      "耐寒至 −50°C（Super Polar）",
      "可單條更換",
    ],
    suitableFor: [
      "工廠 / 產線",
      "倉庫",
      "餐廳 / 後廚",
      "食品廠",
      "冷藏庫 / 冷藏車",
    ],
    care: "用中性皂液或塑膠清潔劑擦拭，避免強溶劑。混濁、破損或變硬的條簾請單獨更換。",
  },
};

const PACKS: Partial<Record<Locale, OverlayPack>> = {
  en,
  my,
  lo,
  km,
  "zh-Hans": zhHans,
  "zh-Hant": zhHant,
};

export function productHasLocaleOverlay(
  locale: Locale,
  categorySlug: string,
  productSlug: string,
): boolean {
  if (locale === "th") return true;
  const pack = PACKS[locale];
  if (!pack) return false;
  return Boolean(pack[`${categorySlug}/${productSlug}`]);
}

/** th + en always (EN falls back to catalog English), plus locales with a written overlay. */
export function productIndexableLocales(
  categorySlug: string,
  productSlug: string,
): Locale[] {
  const out: Locale[] = ["th", "en"];
  for (const locale of Object.keys(PACKS) as Locale[]) {
    if (out.includes(locale)) continue;
    if (productHasLocaleOverlay(locale, categorySlug, productSlug)) {
      out.push(locale);
    }
  }
  return out;
}

export function getProductOverlay(
  locale: Locale,
  categorySlug: string,
  productSlug: string,
): ProductContentOverlay | null {
  if (locale === "th") return null;
  const pack = PACKS[locale];
  if (!pack) return null;
  return pack[`${categorySlug}/${productSlug}`] ?? null;
}

export function mergeProductOverlay(
  base: ProductContent,
  overlay: ProductContentOverlay | null,
): ProductContent {
  if (!overlay) return base;
  return {
    tagline: overlay.tagline ?? base.tagline,
    body: overlay.body ?? base.body,
    highlights: overlay.highlights ?? base.highlights,
    suitableFor: overlay.suitableFor ?? base.suitableFor,
    care: overlay.care ?? base.care,
    faqs: overlay.faqs ?? base.faqs,
  };
}
