"use client";

import { useEffect, useId, useState } from "react";
import Image from "next/image";
import { Check, Copy, PenLine, X } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import {
  formatBaht,
  norenLine,
  pieceSizeLabel,
  type NorenPiece,
} from "@/lib/noren/pricing";
import { miniSvg } from "@/components/noren/noren-svg";

const SHARE_TITLE = "ออกแบบม่านญี่ปุ่นสั่งทำ";

export function NorenShareDialog({
  open,
  url,
  pieces,
  estimate,
  onClose,
  onNewDesign,
}: {
  open: boolean;
  url: string;
  pieces: NorenPiece[];
  estimate: { exVat: number; vat: number; total: number; qty: number };
  onClose: () => void;
  onNewDesign: () => void;
}) {
  const titleId = useId();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      setCopied(false);
    };
  }, [open, onClose]);

  if (!open) return null;

  const shareText = `${SHARE_TITLE} — ประมาณการ ${formatBaht(estimate.total)} บาท รวม VAT โดย${siteConfig.name}`;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(shareText);
  const channels = [
    {
      href: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`,
      label: "LINE",
      icon: "/images/social/line-app.svg",
    },
    {
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      label: "Facebook",
      icon: "/images/social/facebook-app.svg",
    },
    {
      href: `https://wa.me/?text=${encodedText}%0A${encodedUrl}`,
      label: "WhatsApp",
      icon: "/images/social/whatsapp.svg",
    },
    {
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      label: "X",
      icon: "/images/social/x.svg",
    },
    {
      href: `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(SHARE_TITLE)}&body=${encodeURIComponent(`${shareText}\n${url}`)}`,
      label: "Gmail",
      icon: "/images/social/gmail.svg",
    },
  ];

  async function copyLink() {
    try {
      await Promise.race([
        navigator.clipboard.writeText(url),
        new Promise<never>((_, reject) => {
          window.setTimeout(() => reject(new Error("clipboard-timeout")), 1500);
        }),
      ]);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("คัดลอกลิงก์นี้", url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0" aria-label="ปิด" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-start gap-3 px-5 pt-4 pb-2">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-line bg-white">
            <Image
              src="/images/brand/logo.png"
              alt=""
              fill
              className="object-contain p-1"
              sizes="48px"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="font-display text-lg font-semibold text-navy">
              {SHARE_TITLE}
            </h2>
            <p className="text-xs text-muted">{siteConfig.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-11 shrink-0 place-items-center rounded-lg text-muted hover:bg-paper hover:text-navy"
            aria-label="ปิด"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto px-5 pb-4">
          <section className="rounded-xl bg-paper p-3">
            <h3 className="font-display text-base font-semibold text-navy">Preview</h3>
            <div className="mt-2 flex gap-3 overflow-x-auto">
              {pieces.map((p) => {
                const line = norenLine(p);
                return (
                  <div key={p.id} className="min-w-32 flex-1">
                    <b className="block text-sm text-navy">{p.name}</b>
                    <span className="block text-xs text-muted">{pieceSizeLabel(p)}</span>
                    <div dangerouslySetInnerHTML={{ __html: miniSvg(p) }} />
                    <small className="mt-1.5 block text-left text-xs text-muted">
                      {formatBaht(line.amount)} บาท
                    </small>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 space-y-1 rounded-xl border border-line bg-white px-3 py-2 text-sm text-muted">
              <div className="flex justify-between">
                <span>ราคาก่อน VAT</span>
                <b className="text-navy">{formatBaht(estimate.exVat)} บาท</b>
              </div>
              <div className="flex justify-between">
                <span>VAT 7%</span>
                <b className="text-navy">{formatBaht(estimate.vat)} บาท</b>
              </div>
              <div className="flex justify-between border-t border-line pt-1.5 font-display text-base font-semibold text-navy">
                <span>รวมทั้งสิ้น</span>
                <b className="text-brand-red">{formatBaht(estimate.total)} บาท</b>
              </div>
            </div>
          </section>
        </div>

        <div className="border-t border-line bg-shell px-4 py-4 sm:px-5">
          <p className="text-xs font-medium text-muted">ลิงก์สำหรับการแชร์</p>
          <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2">
            <p className="min-w-0 flex-1 truncate text-sm text-ink">{url}</p>
            <button
              type="button"
              onClick={() => void copyLink()}
              className="inline-flex min-h-11 shrink-0 items-center gap-1 px-1 text-sm font-semibold text-[#1a73e8] hover:underline"
            >
              {copied ? (
                <>
                  <Check className="size-3.5" />
                  คัดลอกแล้ว
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  คัดลอกลิงก์
                </>
              )}
            </button>
          </div>
          <div className="mt-3 grid grid-cols-5 gap-1">
            {channels.map((ch) => (
              <a
                key={ch.label}
                href={ch.href}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center gap-1.5 rounded-xl px-1 py-1 text-center transition hover:bg-white/70"
              >
                <span className="inline-flex size-11 items-center justify-center overflow-hidden rounded-[10px] bg-white shadow-sm ring-1 ring-black/5">
                  <Image
                    src={ch.icon}
                    alt=""
                    width={44}
                    height={44}
                    className="size-11"
                    unoptimized
                  />
                </span>
                <span className="text-[11px] font-medium text-ink">{ch.label}</span>
              </a>
            ))}
          </div>
          <button
            type="button"
            onClick={onNewDesign}
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-navy bg-white px-4 text-sm font-semibold text-navy hover:bg-paper"
          >
            <PenLine className="size-4" />
            ออกแบบใหม่
          </button>
        </div>
      </div>
    </div>
  );
}
