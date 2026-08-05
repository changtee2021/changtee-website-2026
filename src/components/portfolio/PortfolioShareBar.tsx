"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { trackPortfolioShare } from "@/lib/cms/portfolio-analytics";
import { cn } from "@/lib/utils";

export function PortfolioShareBar({
  portfolioId,
  slug,
  title,
  className,
}: {
  portfolioId: string;
  slug: string;
  title: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const path = `/portfolio/${slug || "preview"}`;
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}${path}`
      : `${siteConfig.url.replace(/\/$/, "")}${path}`;
  const text = `${title} — ผลงานติดตั้งจริงโดย${siteConfig.name}`;

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

  async function nativeShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        markShared();
        return;
      } catch {
        /* user cancelled */
      }
    }
    void copyLink();
  }

  const lineHref = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`;
  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-white p-3 sm:p-4",
        className,
      )}
    >
      <div className="mr-1 flex items-center gap-1.5 text-sm font-medium text-navy">
        <Share2 className="size-4 text-brand-red" />
        แชร์ผลงานนี้
      </div>
      <a
        href={lineHref}
        target="_blank"
        rel="noreferrer"
        onClick={markShared}
        className="inline-flex items-center gap-1.5 rounded-full bg-[#06C755] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
      >
        LINE
      </a>
      <a
        href={fbHref}
        target="_blank"
        rel="noreferrer"
        onClick={markShared}
        className="inline-flex items-center gap-1.5 rounded-full bg-[#1877F2] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
      >
        Facebook
      </a>
      <button
        type="button"
        onClick={() => void copyLink()}
        className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-medium text-navy hover:bg-white"
      >
        {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
        {copied ? "คัดลอกแล้ว" : "คัดลอกลิงก์"}
      </button>
      <button
        type="button"
        onClick={() => void nativeShare()}
        className="inline-flex items-center gap-1.5 rounded-full border border-navy/20 bg-navy px-3 py-1.5 text-xs font-medium text-white hover:bg-navy-deep sm:hidden"
      >
        แชร์ต่อ
      </button>
      <p className="w-full text-[11px] text-muted sm:ml-auto sm:w-auto">
        ส่งให้เพื่อนดูงานจริงก่อนตัดสินใจ
      </p>
    </div>
  );
}
