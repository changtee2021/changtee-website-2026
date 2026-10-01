"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Copy, FileText, MessageCircle, Phone, X } from "lucide-react";
import { trackSiteClick } from "@/lib/analytics/collect";
import { siteConfig } from "@/lib/site-config";
import { useI18n } from "@/lib/i18n/use-i18n";

type PhoneContact = {
  name: string;
  phoneDisplay: string;
  phoneTel: string;
};

function uniquePhones(): PhoneContact[] {
  const seen = new Set<string>();
  const list: PhoneContact[] = [];
  for (const contact of [
    ...siteConfig.saleContacts,
    ...siteConfig.hotlineContacts,
  ]) {
    if (seen.has(contact.phoneTel)) continue;
    seen.add(contact.phoneTel);
    list.push(contact);
  }
  return list;
}

function MessengerIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2C6.48 2 2 6.13 2 11.7c0 2.84 1.16 5.32 3.07 7.1V22l2.97-1.63c1.14.32 2.36.5 3.63.5 5.52 0 10-4.13 10-9.7S17.52 2 12 2zm.96 11.64-2.53-2.7-4.91 2.7 5.42-5.77 2.58 2.7 4.86-2.7-5.42 5.77z" />
    </svg>
  );
}

function socialHref(label: "Facebook" | "YouTube" | "TikTok" | "LINE") {
  return siteConfig.social.find((item) => item.label === label)?.href ?? "#";
}

const pill =
  "inline-flex min-h-11 max-w-full items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold shadow-md";

function PhoneList({
  onBack,
  onPick,
}: {
  onBack: () => void;
  onPick: () => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const phones = uniquePhones();

  async function copyNumber(tel: string) {
    try {
      await navigator.clipboard.writeText(tel);
      setCopied(tel);
      window.setTimeout(() => setCopied((cur) => (cur === tel ? null : cur)), 1600);
    } catch {
      /* ignore */
    }
  }

  const { t } = useI18n();

  return (
    <div
      role="dialog"
      aria-label={t("fab.phones")}
      className="w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-white/70 bg-white p-3 text-navy shadow-[0_12px_40px_rgba(11,31,58,0.22)] dark:border-line dark:bg-[#1a2433] dark:text-white"
    >
      <div className="flex items-center justify-between gap-2 px-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
          SALE Tel
        </p>
        <button
          type="button"
          className="min-h-9 rounded-full px-2.5 text-xs font-semibold text-navy hover:bg-paper dark:text-white dark:hover:bg-white/8"
          onClick={onBack}
        >
          {t("fab.back")}
        </button>
      </div>
      <ul className="mt-1 max-h-[min(22rem,calc(100dvh-8rem))] overflow-y-auto">
        {phones.map((contact) => (
          <li key={contact.phoneTel}>
            <div className="flex items-center gap-1">
              <a
                href={`tel:${contact.phoneTel}`}
                className="flex min-h-11 min-w-0 flex-1 items-center justify-between gap-3 rounded-xl px-2.5 text-sm hover:bg-paper dark:hover:bg-white/8"
                onClick={() => {
                  trackSiteClick("phone");
                  onPick();
                }}
              >
                <span className="truncate text-muted">{contact.name}</span>
                <span className="shrink-0 font-semibold tabular-nums">
                  {contact.phoneDisplay}
                </span>
              </a>
              <button
                type="button"
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-muted hover:bg-paper hover:text-navy dark:hover:bg-white/8 dark:hover:text-white"
                aria-label={`${t("fab.copy")} ${contact.name}`}
                onClick={() => void copyNumber(contact.phoneTel)}
              >
                {copied === contact.phoneTel ? (
                  <Check className="size-4 text-[#06C755]" />
                ) : (
                  <Copy className="size-4" />
                )}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FloatingActions() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [phonesOpen, setPhonesOpen] = useState(false);
  const reduced = useReducedMotion();

  function closeAll() {
    setOpen(false);
    setPhonesOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (phonesOpen) setPhonesOpen(false);
      else closeAll();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, phonesOpen]);

  const item = {
    hidden: reduced
      ? { opacity: 0 }
      : { opacity: 0, y: 18, x: 14, scale: 0.92 },
    show: reduced
      ? { opacity: 1 }
      : { opacity: 1, y: 0, x: 0, scale: 1 },
  };

  return (
    <>
      {open ? (
        <div
          aria-hidden
          className="fixed inset-0 z-40 bg-navy/25 lg:bg-transparent"
          onClick={closeAll}
        />
      ) : null}

      <div
        data-print-hide
        className="fixed bottom-[max(1rem,env(safe-area-inset-bottom,0px))] right-3 z-50 flex max-w-[calc(100vw-1.5rem)] flex-col items-end gap-2 sm:bottom-5 sm:right-5"
      >
        <AnimatePresence mode="wait">
          {open && phonesOpen ? (
            <motion.div
              key="fab-phones"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <PhoneList onBack={() => setPhonesOpen(false)} onPick={closeAll} />
            </motion.div>
          ) : open ? (
            <motion.div
              key="fab-actions"
              className="flex flex-col items-end gap-2"
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={{
                hidden: {
                  transition: {
                    staggerChildren: reduced ? 0 : 0.04,
                    staggerDirection: -1,
                  },
                },
                show: { transition: { staggerChildren: reduced ? 0 : 0.07 } },
              }}
            >
              <motion.a
                href={socialHref("Facebook")}
                target="_blank"
                rel="noopener noreferrer"
                variants={item}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className={`${pill} bg-[#1877F2] text-white`}
                onClick={() => {
                  trackSiteClick("facebook");
                  closeAll();
                }}
              >
                <Image
                  src="/images/social/facebook.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="brightness-0 invert"
                  unoptimized
                />
                Facebook
              </motion.a>
              <motion.a
                href={socialHref("YouTube")}
                target="_blank"
                rel="noopener noreferrer"
                variants={item}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className={`${pill} bg-[#FF0000] text-white`}
                onClick={() => {
                  trackSiteClick("youtube");
                  closeAll();
                }}
              >
                <Image
                  src="/images/social/youtube.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="brightness-0 invert"
                  unoptimized
                />
                YouTube
              </motion.a>
              <motion.a
                href={socialHref("TikTok")}
                target="_blank"
                rel="noopener noreferrer"
                variants={item}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className={`${pill} bg-black text-white`}
                onClick={() => {
                  trackSiteClick("tiktok");
                  closeAll();
                }}
              >
                <Image
                  src="/images/social/tiktok.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="brightness-0 invert"
                  unoptimized
                />
                TikTok
              </motion.a>
              <motion.a
                href={siteConfig.lineUrl}
                target="_blank"
                rel="noreferrer"
                variants={item}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className={`${pill} bg-[#06C755] text-white`}
                onClick={() => {
                  trackSiteClick("line");
                  closeAll();
                }}
              >
                <MessageCircle className="size-4 shrink-0" />
                <span className="truncate">LINE {siteConfig.lineId}</span>
              </motion.a>
              <motion.div
                variants={item}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  href="/quote"
                  className={`${pill} border border-line bg-white text-navy`}
                  onClick={() => {
                    trackSiteClick("quote");
                    closeAll();
                  }}
                >
                  <FileText className="size-4 shrink-0" />
                  {t("fab.quote")}
                </Link>
              </motion.div>
              <motion.a
                href={`tel:${siteConfig.phoneTel}`}
                variants={item}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="max-lg:!hidden min-h-11 items-center gap-2 rounded-full bg-brand-red px-3.5 py-2 text-sm font-semibold text-white shadow-md lg:inline-flex"
                onClick={() => {
                  trackSiteClick("phone");
                  closeAll();
                }}
              >
                <Phone className="size-4 shrink-0" />
                {t("fab.call")}
              </motion.a>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="relative isolate overflow-visible">
          <span className="fab-glow" aria-hidden />
          <button
            type="button"
            aria-expanded={open}
            aria-label={open ? t("fab.close") : t("fab.open")}
            onClick={() => {
              if (open) closeAll();
              else setOpen(true);
            }}
            className="relative z-10 inline-flex size-14 items-center justify-center rounded-full bg-[#0b1f3a] text-white shadow-lg transition hover:bg-navy-deep active:scale-95 dark:bg-white dark:text-[#0b1f3a] lg:size-16"
          >
            {open ? (
              <X className="size-5 lg:size-6" />
            ) : (
              <MessengerIcon className="size-7 lg:size-8" />
            )}
          </button>
        </div>

        <div className="relative isolate overflow-visible lg:hidden">
          <span className="fab-glow fab-glow-red" aria-hidden />
          <a
            href={`tel:${siteConfig.phoneTel}`}
            aria-label={t("fab.call")}
            title={t("fab.call")}
            className="relative z-10 inline-flex size-14 items-center justify-center rounded-full bg-brand-red text-white shadow-[0_8px_24px_rgba(200,16,46,0.38)] transition hover:bg-brand-red-soft active:scale-95"
            onClick={() => {
              trackSiteClick("phone");
              closeAll();
            }}
          >
            <Phone className="size-6" strokeWidth={2.2} aria-hidden />
          </a>
        </div>
      </div>
    </>
  );
}
