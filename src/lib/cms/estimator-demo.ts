import {
  buildDemoEstimatorSettings,
  computeEstimateRange,
  type EstimatePreviewInput,
  type EstimatorSettings,
} from "@/lib/estimate/engine";

export type {
  EstimatePreviewInput,
  EstimatorMultipliers,
  EstimatorRateRow,
  EstimatorSettings,
} from "@/lib/estimate/engine";

export const DEMO_ESTIMATOR: EstimatorSettings = buildDemoEstimatorSettings();

export function previewEstimate(
  settings: EstimatorSettings,
  input: EstimatePreviewInput,
) {
  return computeEstimateRange(settings, input);
}
