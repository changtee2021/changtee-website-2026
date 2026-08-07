"use client";

import {
  useCallback,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  getPreviewControls,
  PreviewProvider,
} from "@/components/preview/preview-context";
import { applyPreviewPageSections } from "@/lib/cms/demo-store";
import {
  isParentToPreview,
  type ParentToPreview,
  PREVIEW_QUERY,
} from "@/lib/editor/protocol";

function allowedParentOrigins(): string[] {
  const origins = new Set<string>();
  if (typeof window !== "undefined") origins.add(window.location.origin);
  const admin = process.env.NEXT_PUBLIC_ADMIN_URL?.trim();
  if (admin) {
    try {
      origins.add(new URL(admin).origin);
    } catch {
      /* ignore */
    }
  }
  origins.add("https://admin.changtee-curtain.com");
  origins.add("http://admin.localhost:3000");
  origins.add("http://localhost:3000");
  return [...origins];
}

function inferPageKey(pathname: string): string {
  if (pathname === "/" || pathname === "") return "home";
  if (pathname.startsWith("/products/") && pathname.split("/").length >= 4) {
    return "product";
  }
  if (pathname.startsWith("/products/")) return "category";
  if (pathname === "/products") return "productsHub";
  if (pathname.startsWith("/blog/")) return "blogPost";
  if (pathname === "/blog") return "blogIndex";
  if (pathname.startsWith("/portfolio/")) return "portfolioItem";
  if (pathname === "/portfolio") return "portfolioIndex";
  if (pathname === "/about") return "about";
  if (pathname === "/contact") return "contact";
  if (pathname === "/quote") return "quote";
  return "home";
}

function subscribePreviewFlag() {
  return () => {};
}

function readPreviewActive(): boolean {
  if (typeof window === "undefined") return false;
  const token = new URLSearchParams(window.location.search).get(PREVIEW_QUERY);
  return Boolean(token) && window.parent !== window;
}

function readPreviewParentOrigin(): string {
  if (typeof window === "undefined") return "";
  if (document.referrer) {
    try {
      return new URL(document.referrer).origin;
    } catch {
      /* keep */
    }
  }
  return window.location.origin;
}

function readPreviewPageKey(): string {
  if (typeof window === "undefined") return "home";
  return inferPageKey(window.location.pathname);
}

export function SitePreviewRoot({ children }: { children: ReactNode }) {
  const active = useSyncExternalStore(
    subscribePreviewFlag,
    readPreviewActive,
    () => false,
  );
  const parentOrigin = useSyncExternalStore(
    subscribePreviewFlag,
    readPreviewParentOrigin,
    () => "",
  );
  const pageKey = useSyncExternalStore(
    subscribePreviewFlag,
    readPreviewPageKey,
    () => "home",
  );

  const onSelect = useCallback(
    (sectionId: string, fieldKey: string) => {
      if (!parentOrigin) return;
      window.parent.postMessage(
        { type: "preview:select", sectionId, fieldKey },
        parentOrigin,
      );
    },
    [parentOrigin],
  );

  useEffect(() => {
    if (!active || !parentOrigin) return;

    window.parent.postMessage(
      { type: "preview:ready", pageKey },
      parentOrigin,
    );

    const onMessage = (event: MessageEvent) => {
      if (!allowedParentOrigins().includes(event.origin)) return;
      if (!isParentToPreview(event.data)) return;
      const data = event.data as ParentToPreview;
      const ctl = getPreviewControls();

      if (data.type === "preview:values") {
        const now = new Date().toISOString();
        applyPreviewPageSections(
          Object.entries(data.drafts).map(([sectionId, values]) => ({
            pageKey,
            sectionId,
            enabled: true,
            values,
            updatedAt: now,
          })),
        );
        return;
      }
      if (data.type === "preview:scrollTo") {
        document
          .querySelector(`[data-ctc-spot^="${data.sectionId}:"]`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      if (data.type === "preview:highlight") {
        ctl?.setHighlightKey(data.fieldKey);
        return;
      }
      if (data.type === "preview:showAllSpots") {
        ctl?.setShowAllSpots(data.on);
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [active, parentOrigin, pageKey]);

  if (!active || !parentOrigin) {
    return <>{children}</>;
  }

  return (
    <PreviewProvider pageKey={pageKey} onSelect={onSelect}>
      <div
        className="sticky top-0 z-[100] border-b border-amber-300 bg-amber-50 px-3 py-1.5 text-center text-[11px] font-medium text-amber-950"
        aria-hidden
      >
        โหมดพรีวิวแก้ไข — ค่ายังไม่ขึ้นเว็บจนกว่าจะกดเผยแพร่จาก Page Editor
      </div>
      {children}
    </PreviewProvider>
  );
}
