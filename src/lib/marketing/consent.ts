export const MARKETING_CONSENT_VERSION = "2026-08-20";

export const MARKETING_CONSENT_TEXT =
  "ยินยอมรับข่าวสาร โปรโมชัน ทางอีเมล";

export type MarketingSource =
  | "quote"
  | "contact"
  | "fab"
  | "visit"
  | "presentation";

export function formFlagTrue(value: unknown): boolean {
  return value === "on" || value === "true" || value === true;
}

export function normalizeMarketingEmail(email: string): string {
  return email.trim().toLowerCase();
}
