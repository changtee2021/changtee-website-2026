"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MessageCircle, Phone, FileText, X } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

function DualChatIcon({ className }: { className?: string }) {
  return (
    <span className={`relative inline-block ${className ?? "h-5 w-5"}`} aria-hidden>
      <MessageCircle
        className="absolute left-0 top-0 h-[72%] w-[72%] opacity-80"
        strokeWidth={2.25}
      />
      <MessageCircle
        className="absolute bottom-0 right-0 h-[78%] w-[78%]"
        strokeWidth={2.25}
      />
    </span>
  );
}

export function FloatingActions() {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  const item = {
    hidden: reduced
      ? { opacity: 0 }
      : { opacity: 0, y: 18, x: 14, scale: 0.92 },
    show: reduced
      ? { opacity: 1 }
      : { opacity: 1, y: 0, x: 0, scale: 1 },
  };

  return (
    <div
      data-print-hide
      className="fixed bottom-4 right-3 z-50 hidden max-w-[calc(100vw-1.5rem)] flex-col items-end gap-2 lg:flex sm:bottom-5 sm:right-5"
    >
      <AnimatePresence>
        {open ? (
          <motion.div
            key="fab-actions"
            className="flex flex-col items-end gap-2"
            initial="hidden"
            animate="show"
            exit="hidden"
            variants={{
              hidden: { transition: { staggerChildren: reduced ? 0 : 0.04, staggerDirection: -1 } },
              show: { transition: { staggerChildren: reduced ? 0 : 0.07 } },
            }}
          >
            <motion.a
              href={siteConfig.lineUrl}
              target="_blank"
              rel="noreferrer"
              variants={item}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex max-w-full items-center gap-2 rounded-full bg-[#06C755] px-3 py-2 text-xs font-semibold text-white sm:px-4 sm:text-sm"
            >
              <MessageCircle className="h-4 w-4 shrink-0" />
              <span className="truncate">LINE {siteConfig.lineId}</span>
            </motion.a>
            <motion.div
              variants={item}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href="/quote"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-xs font-medium text-navy shadow sm:px-4 sm:text-sm"
                onClick={() => setOpen(false)}
              >
                <FileText className="h-4 w-4 shrink-0" />
                ใบเสนอราคา
              </Link>
            </motion.div>
            <motion.a
              href={`tel:${siteConfig.phoneTel}`}
              variants={item}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 rounded-full bg-brand-red px-3 py-2 text-xs font-semibold text-white sm:px-4 sm:text-sm"
            >
              <Phone className="h-4 w-4 shrink-0" />
              โทรเลย
            </motion.a>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "ปิดเมนูด่วน" : "เปิดเมนูด่วน"}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0b1f3a] text-white shadow-lg dark:bg-white dark:text-[#0b1f3a] sm:h-11 sm:w-11"
      >
        {open ? <X className="h-4 w-4" /> : <DualChatIcon className="h-5 w-5" />}
      </button>
    </div>
  );
}
