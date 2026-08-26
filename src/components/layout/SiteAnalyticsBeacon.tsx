"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { sendSiteAnalytics } from "@/lib/analytics/collect";

export function SiteAnalyticsBeacon() {
  const pathname = usePathname() || "/";

  useEffect(() => {
    sendSiteAnalytics({ kind: "page", path: pathname });

    const ping = () => {
      if (document.visibilityState !== "visible") return;
      sendSiteAnalytics({ kind: "ping", path: pathname });
    };
    const timer = window.setInterval(ping, 20_000);

    const onHide = () => {
      if (document.visibilityState === "hidden") {
        sendSiteAnalytics({ kind: "ping", path: pathname });
      }
    };
    document.addEventListener("visibilitychange", onHide);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [pathname]);

  return null;
}
