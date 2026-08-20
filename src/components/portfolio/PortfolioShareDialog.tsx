"use client";

import { useEffect, useId, useState } from "react";
import Image from "next/image";
import { Check, Copy, Share2, X } from "lucide-react";
import { trackPortfolioShare } from "@/lib/cms/portfolio-analytics";
import { siteConfig } from "@/lib/site-config";

export function PortfolioShareDialog({
  portfolioId,
  slug,
  title,
  subtitle,
  coverSrc,
}: {
  portfolioId: string;
  slug: string;
  title: string;
  subtitle: string;
  coverSrc: string;
}) {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const path = `/portfolio/${slug || "preview"}`;
  const fallbackUrl = `${siteConfig.url.replace(/\/$/, "")}${path}`;
  const [url, setUrl] = useState(fallbackUrl);
  const shareText = `${title} — ผลงานติดตั้งจริงโดย${siteConfig.name}`;

  function openShare() {
    setUrl(
      typeof window !== "undefined" ? `${window.location.origin}${path}` : fallbackUrl,
    );
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

  function markShared() {
    trackPortfolioShare(portfolioId);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      markShared();
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("คัดลอกลิงก์นี้", url);
    }
  }

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
      href: `https://mail.google.com/mail/?view=cm&fs=1&su=${encodedText}&body=${encodeURIComponent(`${shareText}\n${url}`)}`,
      label: "Gmail",
      icon: "/images/social/gmail.svg",
    },
  ];

  return (
    <>
      <button
        type="button"
        onClick={openShare}
        aria-label="แชร์ผลงานนี้"
        title="แชร์"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="inline-flex size-[46px] shrink-0 items-center justify-center rounded-xl border border-navy/15 bg-paper text-navy hover:border-navy/30"
      >
        <Share2 className="size-5" aria-hidden />
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
              <h2
                id={titleId}
                className="font-display text-lg font-semibold text-navy"
              >
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
                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-paper">
                  <Image
                    src={coverSrc}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-semibold text-navy">
                    {title}
                  </p>
                  {subtitle ? (
                    <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted">
                      {subtitle}
                    </p>
                  ) : null}
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

            <div className="grid grid-cols-5 gap-1 border-t border-line bg-shell px-3 py-4 sm:px-5">
              {channels.map((ch) => (
                <a
                  key={ch.label}
                  href={ch.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={markShared}
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
                  <span className="text-[11px] font-medium text-ink">
                    {ch.label}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
