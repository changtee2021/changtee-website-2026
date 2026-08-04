export const COOKIE_CONSENT_KEY = "ctc-cookie-consent-v2";
export const COOKIE_CONSENT_EVENT = "ctc-cookie-consent-change";

export type CookieCategory = "necessary" | "analytics" | "marketing";

export type CookieConsentState = {
  version: 2;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

export const defaultConsentDenied: CookieConsentState = {
  version: 2,
  necessary: true,
  analytics: false,
  marketing: false,
  updatedAt: "",
};

export function parseConsent(raw: string | null): CookieConsentState | null {
  if (!raw) return null;
  // Legacy accept-all
  if (raw === "accepted") {
    return {
      version: 2,
      necessary: true,
      analytics: true,
      marketing: true,
      updatedAt: new Date().toISOString(),
    };
  }
  try {
    const parsed = JSON.parse(raw) as Partial<CookieConsentState>;
    if (parsed.version !== 2) return null;
    return {
      version: 2,
      necessary: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function readConsent(): CookieConsentState | null {
  if (typeof window === "undefined") return null;
  const current = parseConsent(window.localStorage.getItem(COOKIE_CONSENT_KEY));
  if (current) return current;
  // Legacy key from older banner (accept-all)
  return parseConsent(window.localStorage.getItem("ctc-cookie-consent"));
}

export function writeConsent(
  next: Omit<CookieConsentState, "version" | "necessary" | "updatedAt"> & {
    analytics: boolean;
    marketing: boolean;
  },
) {
  const state: CookieConsentState = {
    version: 2,
    necessary: true,
    analytics: next.analytics,
    marketing: next.marketing,
    updatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(state));
  // migrate away from legacy key
  window.localStorage.removeItem("ctc-cookie-consent");
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: state }));
  window.dispatchEvent(new Event("storage"));
  return state;
}

export function hasAnsweredConsent(): boolean {
  if (typeof window === "undefined") return true;
  const legacy = window.localStorage.getItem("ctc-cookie-consent");
  if (legacy === "accepted") return true;
  return parseConsent(window.localStorage.getItem(COOKIE_CONSENT_KEY)) !== null;
}
