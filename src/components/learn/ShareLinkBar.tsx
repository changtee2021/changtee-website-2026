"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function ShareLinkBar({
  path,
  title,
  shareLine,
  className,
}: {
  path: string;
  title: string;
  shareLine: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}${path}`
      : `${siteConfig.url.replace(/\/$/, "")}${path}`;

  async function copyLink() {
    const text = `${shareLine}\n${url}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("คัดลอกลิงก์นี้", url);
    }
  }

  async function nativeShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text: shareLine, url });
        return;
      } catch {
        /* cancelled */
      }
    }
    void copyLink();
  }

  const lineHref = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-white p-3 sm:p-4",
        className,
      )}
    >
      <div className="mr-1 flex items-center gap-1.5 text-sm font-medium text-navy">
        <Share2 className="size-4 text-brand-red" />
        ส่งให้ลูกค้า
      </div>
      <button
        type="button"
        onClick={() => void copyLink()}
        className="inline-flex items-center gap-1.5 rounded-full bg-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-deep"
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        {copied ? "คัดลอกแล้ว" : "คัดลอกลิงก์"}
      </button>
      <a
        href={lineHref}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full bg-[#06C755] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
      >
        LINE
      </a>
      <button
        type="button"
        onClick={() => void nativeShare()}
        className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-medium text-navy hover:bg-white sm:hidden"
      >
        แชร์ต่อ
      </button>
      <p className="w-full text-[11px] text-muted sm:ml-auto sm:w-auto">
        เซลส่งลิงก์นี้ได้เลย — ลูกค้าเปิดมือถืออ่านจบในไม่กี่นาที
      </p>
    </div>
  );
}
