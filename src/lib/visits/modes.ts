export const VISIT_BOOKING_KINDS = [
  "factory-visit",
  "product-presentation",
] as const;

export type VisitBookingKind = (typeof VISIT_BOOKING_KINDS)[number];

export function parseVisitMode(
  raw: string | null | undefined,
): VisitBookingKind {
  return raw === "presentation" ? "product-presentation" : "factory-visit";
}

export function isPresentationKind(
  kind: string | null | undefined,
): kind is "product-presentation" {
  return kind === "product-presentation";
}

export function visitKindOf(
  kind: string | null | undefined,
): VisitBookingKind {
  return isPresentationKind(kind) ? "product-presentation" : "factory-visit";
}

export function visitModeHref(
  kind: VisitBookingKind,
  options?: { hash?: boolean },
): string {
  const hash = options?.hash === false ? "" : "#visit-form";
  return kind === "product-presentation"
    ? `/visit-factory?mode=presentation${hash}`
    : `/visit-factory${hash}`;
}

export const VISIT_MODE_LABELS: Record<VisitBookingKind, string> = {
  "factory-visit": "นัดเยี่ยมชมโรงงานเรา",
  "product-presentation": "นัดนำเสนอสินค้า",
};
