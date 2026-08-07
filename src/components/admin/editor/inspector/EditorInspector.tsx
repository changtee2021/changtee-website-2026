"use client";

import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { useState } from "react";
import { FieldPanel } from "@/components/admin/editor/inspector/FieldPanel";
import { useSectionDraft } from "@/components/admin/cms/section-draft-context";
import { cn } from "@/lib/utils";

type Tab = "field" | "sections";

export function EditorInspector({
  uploadFolder,
  open,
  onOpenChange,
}: {
  uploadFolder: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { defs, selected } = useSectionDraft();
  const [tab, setTab] = useState<Tab>("field");

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        className="hidden h-full w-10 flex-col items-center gap-3 border-l border-line bg-white py-4 text-muted hover:bg-paper hover:text-navy lg:flex"
        aria-label="เปิดแผงแก้ไข"
      >
        <PanelRightOpen className="size-4" />
        <span
          className="text-[10px] font-semibold tracking-wide"
          style={{ writingMode: "vertical-rl" }}
        >
          แผงแก้ไข
        </span>
      </button>
    );
  }

  return (
    <aside className="flex h-full w-full flex-col border-l border-line bg-white lg:w-80">
      <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
        <div className="flex gap-1">
          {(
            [
              ["field", "จุดที่เลือก"],
              ["sections", "Sections"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                tab === id
                  ? "bg-navy text-white"
                  : "text-muted hover:bg-paper hover:text-navy",
              )}
            >
              {label}
              {id === "field" && selected ? " ·" : ""}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="rounded-lg p-1.5 text-muted hover:bg-paper hover:text-navy"
          aria-label="หุบแผงแก้ไข"
        >
          <PanelRightClose className="size-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {tab === "field" ? (
          <FieldPanel uploadFolder={uploadFolder} />
        ) : (
          <ul className="space-y-2">
            {defs.map((def) => (
              <li
                key={def.id}
                className="rounded-xl border border-line px-3 py-2"
              >
                <p className="text-sm font-semibold text-navy">{def.label}</p>
                <p className="mt-0.5 text-xs text-muted">{def.description}</p>
                <p className="mt-1 text-[11px] text-muted">
                  {def.fields.length} ฟิลด์
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
