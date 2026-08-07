"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useSectionDraft } from "@/components/admin/cms/section-draft-context";
import {
  DEVICE_WIDTH,
  isPreviewToParent,
  PREVIEW_QUERY,
  type DeviceKey,
  type PreviewToParent,
} from "@/lib/editor/protocol";
import { cn } from "@/lib/utils";

function subscribeOrigin() {
  return () => {};
}
function readOrigin() {
  return typeof window !== "undefined" ? window.location.origin : "";
}

export function EditorCanvas({
  siteUrl,
  livePath,
  pageKey,
  device = "desktop",
  className,
}: {
  siteUrl: string;
  livePath: string;
  pageKey: string;
  device?: DeviceKey;
  className?: string;
}) {
  const { drafts, select } = useSectionDraft();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const parentOrigin = useSyncExternalStore(
    subscribeOrigin,
    readOrigin,
    () => "",
  );

  // Remount fetch when path/page changes via key on outer wrapper in parent;
  // local fetch keyed by requestId
  const requestKey = `${pageKey}::${livePath}`;

  useEffect(() => {
    let cancelled = false;

    void fetch("/api/admin/cms/preview-token", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ pageKey }),
    })
      .then(async (res) => {
        const json = (await res.json()) as { token?: string; error?: string };
        if (!res.ok || !json.token) {
          throw new Error(json.error || "ออก preview token ไม่สำเร็จ");
        }
        if (!cancelled) setToken(json.token);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setTokenError(
            err instanceof Error ? err.message : "ออก preview token ไม่สำเร็จ",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [requestKey, pageKey]);

  const iframeSrc = useMemo(() => {
    if (!token) return null;
    const path = livePath.startsWith("/") ? livePath : `/${livePath}`;
    const url = new URL(path === "/" ? "/" : path, siteUrl);
    url.searchParams.set(PREVIEW_QUERY, token);
    return url.toString();
  }, [token, livePath, siteUrl]);

  const targetOrigin = useMemo(() => {
    try {
      return new URL(siteUrl).origin;
    } catch {
      return siteUrl;
    }
  }, [siteUrl]);

  useEffect(() => {
    if (!ready || !iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      { type: "preview:values", drafts },
      targetOrigin,
    );
  }, [ready, drafts, targetOrigin]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== targetOrigin) return;
      if (!isPreviewToParent(event.data)) return;
      const data = event.data as PreviewToParent;
      if (data.type === "preview:ready") {
        setReady(true);
        return;
      }
      if (data.type === "preview:select") {
        select(data.sectionId, data.fieldKey);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [targetOrigin, select]);

  const width = DEVICE_WIDTH[device];

  if (tokenError) {
    return (
      <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted">
        <p className="font-medium text-navy">โหลดพรีวิวไม่ได้</p>
        <p>{tokenError}</p>
        <p className="text-xs">
          ตรวจว่า ADMIN_SESSION_SECRET ตั้งค่าแล้ว และล็อกอินอยู่
        </p>
      </div>
    );
  }

  if (!iframeSrc) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center text-sm text-muted">
        กำลังเตรียมพรีวิว…
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-full min-h-0 justify-center overflow-auto bg-shell/50 p-3 sm:p-4",
        className,
      )}
    >
      <div
        className="relative h-full max-h-full overflow-hidden rounded-xl border border-line bg-white shadow-sm"
        style={{
          width: device === "desktop" ? "100%" : Math.min(width, 900),
          maxWidth: "100%",
        }}
      >
        <iframe
          key={iframeSrc}
          ref={iframeRef}
          title={`พรีวิว ${pageKey}`}
          src={iframeSrc}
          className="h-[min(78dvh,900px)] w-full border-0 bg-white"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          data-parent-origin={parentOrigin}
          onLoad={() => {
            /* ready comes from postMessage */
          }}
        />
      </div>
    </div>
  );
}
