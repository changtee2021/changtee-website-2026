/**
 * Shared preview bridge contract (admin parent ↔ site iframe).
 * Keep this file type/const only — no imports — so both bundles can share it safely.
 */

export const PREVIEW_QUERY = "__preview";
export const PREVIEW_TOKEN_TTL_MS = 30 * 60_000;

export type DeviceKey = "desktop" | "tablet" | "mobile";

export const DEVICE_WIDTH: Record<DeviceKey, number> = {
  desktop: 1440,
  tablet: 768,
  mobile: 390,
};

export type SpotScope = "template" | "instance";

export type SpotRect = {
  sectionId: string;
  fieldKey: string;
  x: number;
  y: number;
  w: number;
  h: number;
  scope: SpotScope;
};

export type PreviewToParent =
  | { type: "preview:ready"; pageKey: string }
  | { type: "preview:select"; sectionId: string; fieldKey: string }
  | { type: "preview:spots"; spots: SpotRect[] }
  | { type: "preview:overflow"; fieldKey: string; device: DeviceKey };

export type ParentToPreview =
  | { type: "preview:values"; drafts: Record<string, Record<string, string>> }
  | { type: "preview:scrollTo"; sectionId: string }
  | { type: "preview:highlight"; fieldKey: string | null }
  | { type: "preview:showAllSpots"; on: boolean };

export function isPreviewToParent(value: unknown): value is PreviewToParent {
  if (!value || typeof value !== "object") return false;
  const type = (value as { type?: unknown }).type;
  return (
    type === "preview:ready" ||
    type === "preview:select" ||
    type === "preview:spots" ||
    type === "preview:overflow"
  );
}

export function isParentToPreview(value: unknown): value is ParentToPreview {
  if (!value || typeof value !== "object") return false;
  const type = (value as { type?: unknown }).type;
  return (
    type === "preview:values" ||
    type === "preview:scrollTo" ||
    type === "preview:highlight" ||
    type === "preview:showAllSpots"
  );
}
