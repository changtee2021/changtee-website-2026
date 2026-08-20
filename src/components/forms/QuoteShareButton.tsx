"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import Image from "next/image";
import { Check, Copy, Share2, X } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

const SHARE_TITLE = `ขอใบเสนอราคา — ${siteConfig.name}`;
const SHARE_TEXT = `กรอกแบบฟอร์มขอใบเสนอราคาผ้าม่านจาก${siteConfig.name}`;

function buildShareUrl() {
  if (typeof window !== "undefined") return window.location.href;
  return `${siteConfig.url.replace(/\/$/, "")}/quote`;
}

export function QuoteShareButton() {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState(`${siteConfig.url.replace(/\/$/, "")}/quote`);

  function openShare() {
    setUrl(buildShareUrl());
    setCopied(false);
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("คัดลอกลิงก์นี้", url);
    }
  }

  const lineHref = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`;
  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const waHref = `https://wa.me/?text=${encodeURIComponent(`${SHARE_TITLE}\n${url}`)}`;
  const mailHref = `mailto:?subject=${encodeURIComponent(SHARE_TITLE)}&body=${encodeURIComponent(`${SHARE_TEXT}\n${url}`)}`;

  return (
    <>
      <button
        type="button"
        onClick={openShare}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-sm font-medium text-navy transition hover:border-navy/30 hover:bg-white"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Share2 className="size-4 text-brand-red" />
        แชร์
      </button>

      {open ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="ปิด"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <h2 id={titleId} className="font-display text-lg font-semibold text-navy">
                แชร์
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-muted hover:bg-paper hover:text-navy"
                aria-label="ปิด"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="px-5 pb-4">
              <div className="flex gap-3 rounded-xl border border-line bg-paper/60 p-3">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-white">
                  <Image
                    src="/images/brand/logo.png"
                    alt=""
                    fill
                    className="object-contain p-1"
                    sizes="56px"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-navy">
                    ขอใบเสนอราคา
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted">
                    {SHARE_TEXT}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-xs font-medium text-muted">
                ลิงก์สำหรับการแชร์
              </p>
              <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2">
                <p className="min-w-0 flex-1 truncate text-sm text-ink">{url}</p>
                <button
                  type="button"
                  onClick={() => void copyLink()}
                  className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#1a73e8] hover:underline"
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
            </div>

            <div className="grid grid-cols-4 gap-2 border-t border-line bg-shell px-4 py-4 sm:px-5">
              <ShareChannel
                href={lineHref}
                label="LINE"
                className="bg-[#06C755]"
                iconSrc="/images/social/line.svg"
              />
              <ShareChannel
                href={fbHref}
                label="Facebook"
                className="bg-[#1877F2]"
                iconSrc="/images/social/facebook.svg"
              />
              <ShareChannel
                href={waHref}
                label="WhatsApp"
                className="bg-[#25D366]"
                icon={
                  <svg viewBox="0 0 24 24" className="size-5 fill-white" aria-hidden>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.85 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                }
              />
              <ShareChannel
                href={mailHref}
                label="อีเมล"
                className="bg-navy"
                icon={
                  <svg viewBox="0 0 24 24" className="size-5 fill-white" aria-hidden>
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                }
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function ShareChannel({
  href,
  label,
  className,
  iconSrc,
  icon,
}: {
  href: string;
  label: string;
  className: string;
  iconSrc?: string;
  icon?: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex flex-col items-center gap-1.5 rounded-xl px-1 py-1 text-center transition hover:bg-white/70"
    >
      <span
        className={`inline-flex size-11 items-center justify-center rounded-full ${className}`}
      >
        {iconSrc ? (
          <Image
            src={iconSrc}
            alt=""
            width={20}
            height={20}
            className="object-contain brightness-0 invert"
            unoptimized
          />
        ) : (
          icon
        )}
      </span>
      <span className="text-[11px] font-medium text-ink">{label}</span>
    </a>
  );
}
