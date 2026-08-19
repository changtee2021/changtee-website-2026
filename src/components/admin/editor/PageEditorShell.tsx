"use client";

import {
  Menu,
  Monitor,
  PanelLeftClose,
  PanelLeftOpen,
  Smartphone,
  Tablet,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { EditorInspector } from "@/components/admin/editor/inspector/EditorInspector";
import { EditorTopBar } from "@/components/admin/editor/EditorTopBar";
import { PageTreeSidebar } from "@/components/admin/editor/PageTreeSidebar";
import { useSectionDraft } from "@/components/admin/cms/section-draft-context";
import type { DeviceKey } from "@/lib/editor/protocol";
import type { EditorPageNode } from "@/lib/editor/page-registry";
import { cn } from "@/lib/utils";

export function PageEditorShell({
  page,
  basePath,
  siteUrl,
  toolbar,
  device,
  onDeviceChange,
  children,
}: {
  page: EditorPageNode;
  basePath: string;
  siteUrl: string;
  toolbar?: ReactNode;
  device?: DeviceKey;
  onDeviceChange?: (device: DeviceKey) => void;
  children: ReactNode;
}) {
  const { dirty, fieldDirty, pageKey, selected } = useSectionDraft();
  const [treeOpen, setTreeOpen] = useState(false);
  const [treeCollapsed, setTreeCollapsed] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [closedWhileSelected, setClosedWhileSelected] = useState<string | null>(
    null,
  );

  const selectedKey = selected
    ? `${selected.sectionId}:${selected.field.key}`
    : null;
  const inspectorVisible = selectedKey
    ? closedWhileSelected !== selectedKey
    : inspectorOpen;

  useEffect(() => {
    try {
      setTreeCollapsed(
        window.localStorage.getItem("ctc-editor-tree-collapsed") === "1",
      );
    } catch {
      /* ignore */
    }
  }, []);

  function persistTreeCollapsed(next: boolean) {
    setTreeCollapsed(next);
    try {
      window.localStorage.setItem("ctc-editor-tree-collapsed", next ? "1" : "0");
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty && !fieldDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty, fieldDirty]);

  const dirtyKeys = dirty ? new Set([pageKey]) : new Set<string>();

  return (
    <div className="flex h-[100dvh] flex-col bg-[#eef2f7] text-ink">
      <EditorTopBar
        page={page}
        basePath={basePath}
        siteUrl={siteUrl}
        toolbar={
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-line text-navy hover:bg-paper lg:hidden"
              aria-label="เปิดผังเว็บ"
              onClick={() => setTreeOpen(true)}
            >
              <Menu className="size-4" />
            </button>
            <button
              type="button"
              className="hidden min-h-9 min-w-9 items-center justify-center rounded-lg border border-line text-navy hover:bg-paper lg:inline-flex"
              aria-label={treeCollapsed ? "เปิดผังเว็บ" : "หุบผังเว็บ"}
              title={treeCollapsed ? "เปิดผังเว็บ" : "หุบผังเว็บ"}
              onClick={() => persistTreeCollapsed(!treeCollapsed)}
            >
              {treeCollapsed ? (
                <PanelLeftOpen className="size-4" />
              ) : (
                <PanelLeftClose className="size-4" />
              )}
            </button>
            {device && onDeviceChange ? (
              <div className="hidden items-center rounded-full border border-line p-0.5 sm:flex">
                {(
                  [
                    ["desktop", Monitor, "Desktop"],
                    ["tablet", Tablet, "Tablet"],
                    ["mobile", Smartphone, "Mobile"],
                  ] as const
                ).map(([id, Icon, label]) => (
                  <button
                    key={id}
                    type="button"
                    title={label}
                    aria-label={label}
                    onClick={() => onDeviceChange(id)}
                    className={cn(
                      "rounded-full p-1.5",
                      device === id
                        ? "bg-navy text-white"
                        : "text-muted hover:text-navy",
                    )}
                  >
                    <Icon className="size-3.5" />
                  </button>
                ))}
              </div>
            ) : null}
            {toolbar}
          </div>
        }
      />

      {page.kind === "template" ? (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-950">
          🔁 โหมดเทมเพลต — แก้แล้วมีผลกับทุกหน้าที่ใช้แพทเทิร์นนี้ (เช่น หน้าสินค้าทุกตัว)
        </div>
      ) : null}

      {fieldDirty ? (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-medium text-amber-900">
          กำลังแก้จุดนี้ — กด “ยืนยันจุดนี้” ในแผงขวาก่อน แล้วค่อยไปแก้ส่วนอื่น
        </div>
      ) : dirty ? (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-medium text-amber-900">
          มีร่างที่ยังไม่บันทึก — ระบบจะบันทึกร่างให้อัตโนมัติ หรือกด “บันทึกร่าง” /
          “เผยแพร่”
        </div>
      ) : null}

      <div className="relative flex min-h-0 flex-1">
        {/* Desktop tree */}
        <div className="hidden lg:flex">
          {treeCollapsed ? (
            <div className="flex w-12 flex-col items-center border-r border-line bg-white py-3">
              <button
                type="button"
                onClick={() => persistTreeCollapsed(false)}
                className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-line text-navy hover:bg-paper"
                aria-label="เปิดผังเว็บ"
                title="เปิดผังเว็บ"
              >
                <PanelLeftOpen className="size-4" />
              </button>
            </div>
          ) : (
            <PageTreeSidebar
              activeId={page.id}
              basePath={basePath}
              dirtyPageKeys={dirtyKeys}
              onCollapse={() => persistTreeCollapsed(true)}
            />
          )}
        </div>

        {/* Mobile tree drawer */}
        <div
          className={cn(
            "fixed inset-0 z-50 lg:hidden",
            treeOpen ? "pointer-events-auto" : "pointer-events-none",
          )}
        >
          <button
            type="button"
            aria-label="ปิดผังเว็บ"
            className={cn(
              "absolute inset-0 bg-navy-deep/50 transition-opacity",
              treeOpen ? "opacity-100" : "opacity-0",
            )}
            onClick={() => setTreeOpen(false)}
          />
          <div
            className={cn(
              "absolute inset-y-0 left-0 flex w-[min(18rem,88vw)] transform transition-transform duration-200",
              treeOpen ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <div className="relative flex h-full w-full flex-col bg-white shadow-xl">
              <button
                type="button"
                className="absolute top-3 right-3 z-10 rounded-lg p-1.5 text-muted hover:bg-paper"
                aria-label="ปิด"
                onClick={() => setTreeOpen(false)}
              >
                <X className="size-4" />
              </button>
              <PageTreeSidebar
                activeId={page.id}
                basePath={basePath}
                dirtyPageKeys={dirtyKeys}
                className="w-full border-r-0"
              />
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-line bg-white px-3 py-1.5">
            <p className="text-[11px] text-muted sm:text-xs">
              พรีวิวเหมือนหน้าจริง — คลิกจุดที่มีกรอบเพื่อแก้
            </p>
            <button
              type="button"
              onClick={() => {
                if (inspectorVisible) {
                  if (selectedKey) setClosedWhileSelected(selectedKey);
                  else setInspectorOpen(false);
                } else {
                  setClosedWhileSelected(null);
                  setInspectorOpen(true);
                }
              }}
              className="rounded-lg border border-line px-2 py-1 text-xs font-semibold text-navy hover:bg-paper lg:hidden"
            >
              {inspectorVisible ? "หุบแผงแก้" : "เปิดแผงแก้"}
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-auto bg-shell/40">
            {children}
          </div>
        </div>

        {/* Inspector: desktop rail / mobile bottom sheet */}
        <div className="hidden lg:flex">
          <EditorInspector
            uploadFolder={page.uploadFolder || "cms"}
            open={inspectorVisible}
            onOpenChange={(open) => {
              if (open) {
                setClosedWhileSelected(null);
                setInspectorOpen(true);
              } else if (selectedKey) {
                setClosedWhileSelected(selectedKey);
              } else {
                setInspectorOpen(false);
              }
            }}
          />
        </div>

        {inspectorVisible ? (
          <div className="fixed inset-x-0 bottom-0 z-40 max-h-[55dvh] border-t border-line bg-white shadow-2xl lg:hidden">
            <EditorInspector
              uploadFolder={page.uploadFolder || "cms"}
              open
              onOpenChange={(open) => {
                if (!open) {
                  if (selectedKey) setClosedWhileSelected(selectedKey);
                  else setInspectorOpen(false);
                }
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
