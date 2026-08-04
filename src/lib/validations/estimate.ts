import { z } from "zod";
import { DEMO_ESTIMATOR } from "@/lib/cms/estimator-demo";
import { computeEstimateRange } from "@/lib/estimate/engine";

export const estimateInputSchema = z.object({
  productType: z.string().trim().min(1, "เลือกประเภทสินค้า"),
  widthCm: z.coerce.number().positive("ระบุความกว้าง").max(2000),
  heightCm: z.coerce.number().positive("ระบุความสูง").max(2000),
  quantity: z.coerce.number().int().positive().max(200).default(1),
  fabricLayer: z.enum(["sheer", "blackout", "both", "na"]).default("na"),
  motorized: z.boolean().default(false),
  area: z.enum(["bkk", "upcountry"]).default("bkk"),
});

export type EstimateInput = z.infer<typeof estimateInputSchema>;

export function calculateEstimateRange(input: EstimateInput) {
  const result = computeEstimateRange(DEMO_ESTIMATOR, {
    productSlug: input.productType,
    widthCm: input.widthCm,
    heightCm: input.heightCm,
    quantity: input.quantity,
    fabricBoth: input.fabricLayer === "both",
    motorized: input.motorized,
    upcountry: input.area === "upcountry",
  });

  return {
    min: result.min,
    max: result.max,
    sqm: result.sqm,
    note: DEMO_ESTIMATOR.note,
  };
}
