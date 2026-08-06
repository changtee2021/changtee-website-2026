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

/** Cached so useSyncExternalStore getSnapshot stays referentially stable. */
let consentCacheKey: string | undefined;
let consentSnapshot: CookieConsentState | null = null;

export function readConsent(): CookieConsentState | null {
  if (typeof window === "undefined") return null;
  const rawV2 = window.localStorage.getItem(COOKIE_CONSENT_KEY);
  const rawLegacy = window.localStorage.getItem("ctc-cookie-consent");
  const key = `${rawV2 ?? ""}\0${rawLegacy ?? ""}`;
  if (consentCacheKey === key) return consentSnapshot;

  consentCacheKey = key;
  const current = parseConsent(rawV2);
  consentSnapshot = current ?? parseConsent(rawLegacy);
  return consentSnapshot;
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
  const serialized = JSON.stringify(state);
  window.localStorage.setItem(COOKIE_CONSENT_KEY, serialized);
  // migrate away from legacy key
  window.localStorage.removeItem("ctc-cookie-consent");
  consentCacheKey = `${serialized}\0`;
  consentSnapshot = state;
  // Same-tab listeners only — do not fake a `storage` event (native storage
  // is cross-tab only; faking it can re-enter every consent subscriber).
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: state }));
  return state;
}

export function hasAnsweredConsent(): boolean {
  if (typeof window === "undefined") return true;
  return readConsent() !== null;
}
