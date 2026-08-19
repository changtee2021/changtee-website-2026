export const ADMIN_INBOX_KEYS = [
  "leads",
  "visits",
  "presentations",
  "applications",
] as const;

export type AdminInboxKey = (typeof ADMIN_INBOX_KEYS)[number];

export type AdminInboxBadges = Record<AdminInboxKey, number>;

export const EMPTY_INBOX_BADGES: AdminInboxBadges = {
  leads: 0,
  visits: 0,
  presentations: 0,
  applications: 0,
};

export const ADMIN_INBOX_REFRESH_EVENT = "ctc-admin-inbox-refresh";

export function requestInboxBadgeRefresh() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ADMIN_INBOX_REFRESH_EVENT));
}
