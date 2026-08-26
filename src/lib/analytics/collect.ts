import type { AnalyticsClickName } from "@/lib/analytics/labels";
import { readConsent } from "@/lib/cookie-consent";

const SESSION_KEY = "ctc.analytics.session";
const VISITOR_KEY = "ctc.analytics.visitor";

function randomId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 24);
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

function readOrCreate(storage: Storage, key: string) {
  try {
    const existing = storage.getItem(key);
    if (existing && /^[a-zA-Z0-9_-]{8,64}$/.test(existing)) return existing;
    const next = randomId();
    storage.setItem(key, next);
    return next;
  } catch {
    return randomId();
  }
}

export function getAnalyticsSessionId() {
  if (typeof window === "undefined") return "";
  return readOrCreate(window.sessionStorage, SESSION_KEY);
}

export function getAnalyticsVisitorId() {
  if (typeof window === "undefined") return null;
  if (!readConsent()?.analytics) return null;
  return readOrCreate(window.localStorage, VISITOR_KEY);
}

export function isAnalyticsPathIgnored(pathname: string) {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/dev")
  );
}

type AnalyticsPayload = {
  kind: "page" | "ping" | "click";
  path?: string;
  clickName?: string;
};

export function sendSiteAnalytics(payload: AnalyticsPayload) {
  if (typeof window === "undefined") return;
  if (navigator.webdriver) return;

  const path = payload.path || window.location.pathname || "/";
  if (isAnalyticsPathIgnored(path)) return;

  const body = JSON.stringify({
    kind: payload.kind,
    path,
    clickName: payload.clickName,
    sessionId: getAnalyticsSessionId(),
    visitorId: getAnalyticsVisitorId(),
  });

  const url = "/api/public/analytics";
  try {
    const blob = new Blob([body], { type: "application/json" });
    if (payload.kind !== "page" && navigator.sendBeacon) {
      navigator.sendBeacon(url, blob);
      return;
    }
  } catch {
    /* fall through to fetch */
  }

  void fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

export function trackSiteClick(clickName: AnalyticsClickName) {
  sendSiteAnalytics({ kind: "click", clickName });
}
