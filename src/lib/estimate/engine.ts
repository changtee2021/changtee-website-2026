import { productCatalog } from "@/lib/product-catalog";

export type EstimatorRateRow = {
  productSlug: string;
  productName: string;
  basePerSqm: number;
  minJob: number;
  enabled: boolean;
};

export type EstimatorMultipliers = {
  fabricBoth: number;
  motorized: number;
  upcountry: number;
  rangeLow: number;
  rangeHigh: number;
  roundTo: number;
};

export type EstimatorSettings = {
  enabled: boolean;
  note: string;
  rates: EstimatorRateRow[];
  multipliers: EstimatorMultipliers;
};

export type EstimatePreviewInput = {
  productSlug: string;
  widthCm: number;
  heightCm: number;
  quantity: number;
  fabricBoth: boolean;
  motorized: boolean;
  upcountry: boolean;
};

export const DEFAULT_BASE_PER_SQM: Record<string, number> = {
  curtain: 900,
  "roller-blinds": 750,
  "venetian-blinds": 850,
  "vertical-blinds": 700,
  "pvc-partition": 650,
  motorized: 1200,
  surface: 400,
  "outdoor-factory": 950,
  service: 300,
};

export const DEFAULT_MULTIPLIERS: EstimatorMultipliers = {
  fabricBoth: 1.35,
  motorized: 1.45,
  upcountry: 1.1,
  rangeLow: 0.85,
  rangeHigh: 1.2,
  roundTo: 100,
};

export const DEFAULT_ESTIMATE_NOTE =
  "ราคาประมาณการเบื้องต้น ยังไม่รวมเงื่อนไขหน้างานจริง ทีมเซลล์จะติดต่อยืนยันราคาเป๊ะ";

export function buildDemoEstimatorSettings(
  catalog = productCatalog,
): EstimatorSettings {
  return {
    enabled: true,
    note: DEFAULT_ESTIMATE_NOTE,
    rates: catalog.map((product) => ({
      productSlug: product.slug,
      productName: product.name,
      basePerSqm: DEFAULT_BASE_PER_SQM[product.slug] ?? 800,
      minJob: product.slug === "service" ? 500 : 1500,
      enabled: true,
    })),
    multipliers: { ...DEFAULT_MULTIPLIERS },
  };
}

export function computeEstimateRange(
  settings: EstimatorSettings,
  input: EstimatePreviewInput,
) {
  const rate = settings.rates.find((row) => row.productSlug === input.productSlug);
  const unit = rate?.basePerSqm ?? 800;
  const sqm = (input.widthCm * input.heightCm) / 10_000;
  let mid = unit * Math.max(sqm, 0.5) * input.quantity;
  const multipliers = settings.multipliers;

  if (input.fabricBoth) mid *= multipliers.fabricBoth;
  if (input.motorized) mid *= multipliers.motorized;
  if (input.upcountry) mid *= multipliers.upcountry;

  const roundTo = Math.max(1, multipliers.roundTo);
  let min = Math.round((mid * multipliers.rangeLow) / roundTo) * roundTo;
  let max = Math.round((mid * multipliers.rangeHigh) / roundTo) * roundTo;
  const minJob = rate?.minJob ?? 0;

  if (minJob > 0) {
    min = Math.max(min, minJob);
    max = Math.max(max, min);
  }

  return {
    min,
    max,
    sqm: Number(sqm.toFixed(2)),
    mid: Math.round(mid),
    enabled: Boolean(settings.enabled && rate?.enabled !== false),
  };
}
