"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink, Eye } from "lucide-react";
import { DemoBadge } from "@/components/admin/cms/CmsShared";
import { cn } from "@/lib/utils";

export function CmsEditorShell({
  backHref,
  backLabel,
  title,
  subtitle,
  onPreview,
  previewHref,
  children,
  sidebar,
  footer,
}: {
  backHref: string;
  backLabel: string;
  title: string;
  subtitle?: string;
  /** Open in-app site preview (header + footer) */
  onPreview?: () => void;
  /** Live public URL when already published */
  previewHref?: string;
  children: React.ReactNode;
  sidebar: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 text-sm text-muted hover:text-navy"
          >
            <ArrowLeft className="size-4" />
            {backLabel}
          </Link>
          <h1 className="mt-2 font-display text-xl font-semibold text-navy sm:text-2xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-muted">
              {subtitle}{" "}
              <DemoBadge />
            </p>
          ) : (
            <p className="mt-1">
              <DemoBadge />
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onPreview ? (
            <button
              type="button"
              onClick={onPreview}
              className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-3 py-2 text-sm font-medium text-white hover:bg-navy-deep"
            >
              <Eye className="size-3.5" />
              ดูพรีวิว
            </button>
          ) : null}
          {previewHref ? (
            <a
              href={previewHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2 text-sm text-navy hover:bg-paper"
            >
              <ExternalLink className="size-3.5" />
              ดูบนเว็บ
            </a>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
        <div className="space-y-4 rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6">
          {children}
        </div>
        <aside
          className={cn(
            "space-y-4 rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5",
            "lg:sticky lg:top-4",
          )}
        >
          {sidebar}
        </aside>
      </div>

      {footer ? (
        <div className="sticky bottom-0 z-10 -mx-1 border-t border-line bg-[#eef2f7]/95 px-1 py-3 backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
