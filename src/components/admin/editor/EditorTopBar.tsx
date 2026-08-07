"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  RotateCcw,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { PublishDialog } from "@/components/admin/editor/PublishDialog";
import { useSectionDraft } from "@/components/admin/cms/section-draft-context";
import { blastRadiusForPageKey } from "@/lib/editor/blast-radius";
import type { EditorPageNode } from "@/lib/editor/page-registry";
import { cn } from "@/lib/utils";

type SaveState = "idle" | "saving" | "saved" | "error";

export function EditorTopBar({
  page,
  basePath,
  siteUrl,
  toolbar,
}: {
  page: EditorPageNode;
  basePath: string;
  siteUrl: string;
  toolbar?: ReactNode;
}) {
  const {
    dirty,
    fieldDirty,
    drafts,
    defs,
    defaults,
    pageKey,
    confirm,
    commitToStore,
    discard,
  } = useSectionDraft();

  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [draftUpdatedAt, setDraftUpdatedAt] = useState<string | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishBusy, setPublishBusy] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const backHref = basePath || "/admin";
  const liveHref =
    page.livePath.includes("[")
      ? siteUrl
      : `${siteUrl}${page.livePath === "/" ? "" : page.livePath}`;

  const blast = useMemo(() => blastRadiusForPageKey(pageKey), [pageKey]);

  const buildSections = useCallback(() => {
    const now = new Date().toISOString();
    return defs.map((def) => ({
      pageKey,
      sectionId: def.id,
      enabled: true,
      values: drafts[def.id] ?? defaults[def.id] ?? {},
      updatedAt: now,
    }));
  }, [defs, drafts, defaults, pageKey]);

  const saveDraft = useCallback(async (): Promise<string | null> => {
    if (fieldDirty) {
      setSaveError("ยืนยันจุดที่กำลังแก้ก่อน แล้วค่อยบันทึกร่าง");
      setSaveState("error");
      return null;
    }
    setSaveState("saving");
    setSaveError(null);
    try {
      const res = await fetch("/api/admin/cms/draft", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          pageKey,
          sections: buildSections(),
          baseUpdatedAt: draftUpdatedAt,
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        updatedAt?: string;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(json.error || "บันทึกร่างไม่สำเร็จ");
      }
      const nextAt = json.updatedAt ?? null;
      setDraftUpdatedAt(nextAt);
      confirm();
      setSaveState("saved");
      return nextAt;
    } catch (err) {
      setSaveState("error");
      setSaveError(err instanceof Error ? err.message : "บันทึกร่างไม่สำเร็จ");
      return null;
    }
  }, [fieldDirty, pageKey, buildSections, draftUpdatedAt, confirm]);

  // Auto-save draft 5s after edits settle
  useEffect(() => {
    if (!dirty || fieldDirty) return;
    if (autoTimer.current) clearTimeout(autoTimer.current);
    autoTimer.current = setTimeout(() => {
      void saveDraft();
    }, 5000);
    return () => {
      if (autoTimer.current) clearTimeout(autoTimer.current);
    };
  }, [dirty, fieldDirty, drafts, saveDraft]);

  async function publish() {
    setPublishBusy(true);
    setPublishError(null);
    const savedAt = await saveDraft();
    if (!savedAt) {
      setPublishBusy(false);
      setPublishError("บันทึกร่างไม่สำเร็จ — ยังเผยแพร่ไม่ได้");
      return;
    }
    try {
      const res = await fetch("/api/admin/cms/publish", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          pageKey,
          baseDraftUpdatedAt: savedAt,
        }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(json.error || "เผยแพร่ไม่สำเร็จ");
      commitToStore();
      setPublishOpen(false);
      setSaveState("saved");
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : "เผยแพร่ไม่สำเร็จ");
    } finally {
      setPublishBusy(false);
    }
  }

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line bg-white px-3 sm:gap-3 sm:px-4">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-navy hover:bg-paper sm:text-sm"
        >
          <ArrowLeft className="size-3.5" />
          <span className="hidden sm:inline">หลังบ้าน</span>
        </Link>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-medium tracking-wide text-muted uppercase">
            Page Editor
            {page.kind === "template" ? " · เทมเพลต" : ""}
          </p>
          <div className="flex min-w-0 items-center gap-2">
            <h1 className="truncate font-display text-sm font-semibold text-navy sm:text-base">
              {page.label}
            </h1>
            <span className="hidden truncate text-[11px] text-muted sm:inline">
              {saveState === "saving"
                ? "กำลังบันทึกร่าง…"
                : saveState === "saved"
                  ? "บันทึกร่างแล้ว"
                  : saveState === "error"
                    ? saveError || "บันทึกไม่สำเร็จ"
                    : dirty
                      ? "มีร่างที่ยังไม่บันทึก"
                      : "พร้อมแก้ไข"}
            </span>
          </div>
        </div>

        {toolbar}

        <a
          href={liveHref}
          target="_blank"
          rel="noreferrer"
          className="hidden items-center gap-1 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-navy hover:bg-paper sm:inline-flex"
        >
          ดูหน้าจริง
          <ExternalLink className="size-3" />
        </a>

        <button
          type="button"
          disabled={!dirty || fieldDirty}
          onClick={discard}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold sm:text-sm",
            dirty && !fieldDirty
              ? "border-line text-navy hover:bg-paper"
              : "cursor-not-allowed border-line text-muted opacity-50",
          )}
        >
          <RotateCcw className="size-3.5" />
          <span className="hidden md:inline">ทิ้งร่าง</span>
        </button>

        <button
          type="button"
          disabled={(!dirty && saveState !== "error") || fieldDirty || saveState === "saving"}
          onClick={() => void saveDraft()}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold sm:text-sm",
            dirty && !fieldDirty
              ? "border-navy/30 text-navy hover:bg-paper"
              : "cursor-not-allowed border-line text-muted opacity-50",
          )}
        >
          <Check className="size-3.5" />
          <span className="hidden md:inline">บันทึกร่าง</span>
        </button>

        <button
          type="button"
          disabled={fieldDirty || saveState === "saving"}
          onClick={() => {
            setPublishError(null);
            setPublishOpen(true);
          }}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-white sm:px-4 sm:text-sm",
            !fieldDirty
              ? "bg-brand-red hover:bg-brand-red-soft"
              : "cursor-not-allowed bg-navy/30",
          )}
        >
          <Upload className="size-3.5" />
          เผยแพร่{dirty ? " ·" : ""}
        </button>
      </header>

      <PublishDialog
        open={publishOpen}
        pageLabel={page.label}
        kind={page.kind}
        blastLabel={blast.label}
        samplePaths={blast.samplePaths}
        changeCount={dirty ? 1 : 0}
        busy={publishBusy}
        error={publishError}
        onCancel={() => !publishBusy && setPublishOpen(false)}
        onConfirm={() => void publish()}
      />
    </>
  );
}
