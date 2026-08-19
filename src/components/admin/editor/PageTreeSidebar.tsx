"use client";

import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Lock,
  PanelLeftClose,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  PAGE_TREE,
  type EditorPageNode,
} from "@/lib/editor/page-registry";
import { adminHref } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";

function TreeNode({
  node,
  depth,
  activeId,
  basePath,
  dirtyPageKeys,
}: {
  node: EditorPageNode;
  depth: number;
  activeId: string;
  basePath: string;
  dirtyPageKeys: Set<string>;
}) {
  const hasChildren = Boolean(node.children?.length);
  const [open, setOpen] = useState(
    depth < 1 ||
      Boolean(
        node.children?.some(
          (c) =>
            c.id === activeId ||
            c.children?.some((g) => g.id === activeId),
        ),
      ),
  );
  const isActive = node.id === activeId;
  const dirty = node.pageKey ? dirtyPageKeys.has(node.pageKey) : false;

  const href =
    node.status === "external" && node.externalPath
      ? adminHref(basePath, node.externalPath)
      : node.status === "editable"
        ? adminHref(basePath, `/editor/${node.id.replace(/\./g, "/")}`)
        : null;

  const toggle = () => setOpen((v) => !v);

  const chevronIcon = hasChildren ? (
    open ? (
      <ChevronDown className="size-3.5 shrink-0 opacity-70" aria-hidden />
    ) : (
      <ChevronRight className="size-3.5 shrink-0 opacity-70" aria-hidden />
    )
  ) : (
    <span className="inline-block w-3.5 shrink-0" />
  );

  const rowClass = cn(
    "flex w-full items-center gap-1 rounded-lg px-2 py-1.5 text-left text-sm transition",
    isActive ? "bg-navy text-white" : "text-navy/90 hover:bg-paper",
    node.status === "locked" || node.status === "soon" ? "opacity-60" : "",
  );

  const meta = (
    <>
      <span className="min-w-0 flex-1 truncate font-medium">
        {node.label}
        {node.kind === "template" && node.status !== "locked" ? (
          <span className="ml-1 text-[10px] font-semibold opacity-70">🔁</span>
        ) : null}
      </span>

      {dirty ? (
        <span
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            isActive ? "bg-brand-red-soft" : "bg-brand-red",
          )}
          title="มีร่างที่ยังไม่เผยแพร่"
        />
      ) : null}

      {node.status === "soon" ? (
        <span className="shrink-0 text-[10px] font-medium opacity-70">
          เร็วๆ นี้
        </span>
      ) : null}
      {node.status === "locked" && !hasChildren ? (
        <Lock className="size-3 shrink-0 opacity-50" />
      ) : null}
      {node.status === "external" ? (
        <ExternalLink className="size-3 shrink-0 opacity-60" />
      ) : null}
    </>
  );

  let body: React.ReactNode;
  if (href && (node.status === "editable" || node.status === "external")) {
    body = (
      <div className={rowClass} style={{ paddingLeft: 8 + depth * 12 }}>
        {hasChildren ? (
          <button
            type="button"
            className="shrink-0 rounded p-0.5 hover:bg-black/5"
            onClick={toggle}
            aria-label={open ? "หุบ" : "ขยาย"}
          >
            {chevronIcon}
          </button>
        ) : (
          chevronIcon
        )}
        <Link href={href} className="flex min-w-0 flex-1 items-center gap-1">
          {meta}
        </Link>
      </div>
    );
  } else if (hasChildren) {
    body = (
      <button
        type="button"
        className={cn(rowClass, "w-full")}
        style={{ paddingLeft: 8 + depth * 12 }}
        onClick={toggle}
        aria-expanded={open}
      >
        {chevronIcon}
        {meta}
      </button>
    );
  } else {
    body = (
      <div
        className={rowClass}
        style={{ paddingLeft: 8 + depth * 12 }}
        title={node.status === "soon" ? "ยังไม่มี section defs" : undefined}
      >
        {chevronIcon}
        {meta}
      </div>
    );
  }

  return (
    <div>
      {body}
      {hasChildren && open
        ? node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              activeId={activeId}
              basePath={basePath}
              dirtyPageKeys={dirtyPageKeys}
            />
          ))
        : null}
    </div>
  );
}

export function PageTreeSidebar({
  activeId,
  basePath,
  dirtyPageKeys = new Set(),
  className,
  onCollapse,
}: {
  activeId: string;
  basePath: string;
  dirtyPageKeys?: Set<string>;
  className?: string;
  onCollapse?: () => void;
}) {
  const roots = useMemo(() => PAGE_TREE, []);

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r border-line bg-white",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-wider text-muted uppercase">
            ผังเว็บ
          </p>
          <p className="mt-0.5 text-xs text-muted">เลือกหน้าเพื่อแก้ไข</p>
        </div>
        {onCollapse ? (
          <button
            type="button"
            onClick={onCollapse}
            className="hidden min-h-9 min-w-9 shrink-0 items-center justify-center rounded-lg border border-line text-navy hover:bg-paper lg:inline-flex"
            aria-label="หุบผังเว็บ"
            title="หุบผังเว็บ"
          >
            <PanelLeftClose className="size-4" />
          </button>
        ) : null}
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto p-2">
        {roots.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            depth={0}
            activeId={activeId}
            basePath={basePath}
            dirtyPageKeys={dirtyPageKeys}
          />
        ))}
      </nav>
    </aside>
  );
}
