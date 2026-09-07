"use client";

import { Cookie } from "lucide-react";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import {
  COOKIE_CONSENT_EVENT,
  hasAnsweredConsent,
  writeConsent,
} from "@/lib/cookie-consent";
import { useI18n } from "@/lib/i18n/use-i18n";

type View = "banner" | "settings" | "hidden";

function subscribeConsent(onStoreChange: () => void) {
  window.addEventListener(COOKIE_CONSENT_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(COOKIE_CONSENT_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

let settingsOpenEpoch = 0;
const settingsListeners = new Set<() => void>();
let settingsWindowBound = false;

function ensureSettingsWindowListener() {
  if (typeof window === "undefined" || settingsWindowBound) return;
  settingsWindowBound = true;
  window.addEventListener("ctc-open-cookie-settings", () => {
    settingsOpenEpoch += 1;
    settingsListeners.forEach((l) => l());
  });
}

function subscribeSettings(onStoreChange: () => void) {
  ensureSettingsWindowListener();
  settingsListeners.add(onStoreChange);
  return () => {
    settingsListeners.delete(onStoreChange);
  };
}

function getSettingsEpoch() {
  return settingsOpenEpoch;
}

export function CookieBanner() {
  const { t } = useI18n();
  const answered = useSyncExternalStore(
    subscribeConsent,
    hasAnsweredConsent,
    () => true,
  );
  const settingsEpoch = useSyncExternalStore(
    subscribeSettings,
    getSettingsEpoch,
    () => 0,
  );
  const [forceSettings, setForceSettings] = useState(false);
  const [closedSettingsEpoch, setClosedSettingsEpoch] = useState(0);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const settingsRequested =
    forceSettings || settingsEpoch > closedSettingsEpoch;

  const view: View = settingsRequested
    ? "settings"
    : answered
      ? "hidden"
      : "banner";

  function save(next: { analytics: boolean; marketing: boolean }) {
    writeConsent(next);
    setForceSettings(false);
    setClosedSettingsEpoch(settingsEpoch);
  }

  function closeSettings() {
    setForceSettings(false);
    setClosedSettingsEpoch(settingsEpoch);
  }

  if (view === "hidden") return null;

  return (
    <div
      data-print-hide
      className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom,0px))] z-40 flex justify-start p-3 pr-20 lg:bottom-5 lg:left-5 lg:right-auto lg:p-0"
    >
      <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-white/50 bg-white/60 p-4 shadow-lg shadow-navy/10 backdrop-blur-xl sm:w-[24rem]">
        {view === "banner" ? (
          <>
            <p className="flex items-center gap-2 text-sm font-semibold text-navy">
              <Cookie className="size-4 shrink-0" aria-hidden />
              {t("cookie.title")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {t("cookie.bodyBefore")}{" "}
              <Link href="/cookies" className="font-medium text-navy underline underline-offset-2">
                {t("cookie.policy")}
              </Link>{" "}
              {t("cookie.and")}{" "}
              <Link href="/privacy" className="font-medium text-navy underline underline-offset-2">
                {t("cookie.privacy")}
              </Link>
            </p>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="min-h-11 rounded-full border border-line px-3 py-2 text-xs font-medium text-muted hover:bg-paper"
                onClick={() => setForceSettings(true)}
              >
                {t("cookie.settings")}
              </button>
              <button
                type="button"
                className="min-h-11 rounded-full border border-navy px-3 py-2 text-xs font-semibold text-navy hover:bg-paper"
                onClick={() => save({ analytics: false, marketing: false })}
              >
                {t("cookie.necessaryOnly")}
              </button>
              <button
                type="button"
                className="min-h-11 rounded-full bg-navy px-3 py-2 text-xs font-semibold text-white hover:bg-navy-deep"
                onClick={() => save({ analytics: true, marketing: true })}
              >
                {t("cookie.acceptAll")}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="flex items-center gap-2 text-sm font-semibold text-navy">
              <Cookie className="size-4 shrink-0" aria-hidden />
              {t("cookie.settingsTitle")}
            </p>
            <p className="mt-1 text-xs text-muted">
              {t("cookie.settingsHint")}
            </p>
            <div className="mt-4 space-y-3 text-sm">
              <label className="flex items-start justify-between gap-3 rounded-lg border border-line bg-paper px-3 py-2">
                <span>
                  <span className="font-medium text-navy">{t("cookie.necessary")}</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {t("cookie.necessaryHint")}
                  </span>
                </span>
                <input type="checkbox" checked disabled className="mt-1" />
              </label>
              <label className="flex items-start justify-between gap-3 rounded-lg border border-line px-3 py-2">
                <span>
                  <span className="font-medium text-navy">{t("cookie.analytics")}</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {t("cookie.analyticsHint")}
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="mt-1"
                />
              </label>
              <label className="flex items-start justify-between gap-3 rounded-lg border border-line px-3 py-2">
                <span>
                  <span className="font-medium text-navy">{t("cookie.marketing")}</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {t("cookie.marketingHint")}
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="mt-1"
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="min-h-11 rounded-full border border-line px-3 py-2 text-xs font-medium text-muted hover:bg-paper"
                onClick={closeSettings}
              >
                {t("cookie.cancel")}
              </button>
              <button
                type="button"
                className="min-h-11 rounded-full bg-navy px-3 py-2 text-xs font-semibold text-white hover:bg-navy-deep"
                onClick={() => save({ analytics, marketing })}
              >
                {t("cookie.save")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
