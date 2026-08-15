"use client";

import { Cookie } from "lucide-react";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import {
  COOKIE_CONSENT_EVENT,
  hasAnsweredConsent,
  writeConsent,
} from "@/lib/cookie-consent";

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
      className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] z-50 flex justify-start p-3 lg:bottom-5 lg:left-5 lg:right-auto lg:p-0"
    >
      <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-white/50 bg-white/60 p-4 shadow-lg shadow-navy/10 backdrop-blur-xl sm:w-[24rem]">
        {view === "banner" ? (
          <>
            <p className="flex items-center gap-2 text-sm font-semibold text-navy">
              <Cookie className="size-4 shrink-0" aria-hidden />
              คุกกี้และความเป็นส่วนตัว
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              เราใช้คุกกี้ที่จำเป็นเพื่อให้เว็บไซต์ทำงาน และขอความยินยอมสำหรับคุกกี้วิเคราะห์/การตลาด
              อ่านเพิ่มที่{" "}
              <Link href="/cookies" className="font-medium text-navy underline underline-offset-2">
                นโยบายคุกกี้
              </Link>{" "}
              และ{" "}
              <Link href="/privacy" className="font-medium text-navy underline underline-offset-2">
                นโยบายความเป็นส่วนตัว
              </Link>
            </p>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="min-h-11 rounded-full border border-line px-3 py-2 text-xs font-medium text-muted hover:bg-paper"
                onClick={() => setForceSettings(true)}
              >
                ตั้งค่า
              </button>
              <button
                type="button"
                className="min-h-11 rounded-full border border-navy px-3 py-2 text-xs font-semibold text-navy hover:bg-paper"
                onClick={() => save({ analytics: false, marketing: false })}
              >
                ใช้เท่าที่จำเป็น
              </button>
              <button
                type="button"
                className="min-h-11 rounded-full bg-navy px-3 py-2 text-xs font-semibold text-white hover:bg-navy-deep"
                onClick={() => save({ analytics: true, marketing: true })}
              >
                ยอมรับทั้งหมด
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="flex items-center gap-2 text-sm font-semibold text-navy">
              <Cookie className="size-4 shrink-0" aria-hidden />
              ตั้งค่าคุกกี้
            </p>
            <p className="mt-1 text-xs text-muted">
              คุกกี้ที่จำเป็นเปิดเสมอ — เลือกประเภทอื่นได้ตามต้องการ
            </p>
            <div className="mt-4 space-y-3 text-sm">
              <label className="flex items-start justify-between gap-3 rounded-lg border border-line bg-paper px-3 py-2">
                <span>
                  <span className="font-medium text-navy">จำเป็น</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    ความปลอดภัย และการจำการตั้งค่าความยินยอม
                  </span>
                </span>
                <input type="checkbox" checked disabled className="mt-1" />
              </label>
              <label className="flex items-start justify-between gap-3 rounded-lg border border-line px-3 py-2">
                <span>
                  <span className="font-medium text-navy">วิเคราะห์</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    สถิติการเข้าชม เช่น GA4 / GTM
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
                  <span className="font-medium text-navy">การตลาด</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    วัดผลโฆษณา เช่น Meta Pixel
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
                ยกเลิก
              </button>
              <button
                type="button"
                className="min-h-11 rounded-full bg-navy px-3 py-2 text-xs font-semibold text-white hover:bg-navy-deep"
                onClick={() => save({ analytics, marketing })}
              >
                บันทึกการตั้งค่า
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
