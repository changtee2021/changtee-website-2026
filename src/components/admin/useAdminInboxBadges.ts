"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ADMIN_INBOX_REFRESH_EVENT,
  EMPTY_INBOX_BADGES,
  type AdminInboxBadges,
} from "@/lib/admin-inbox";

export function useAdminInboxBadges() {
  const [badges, setBadges] = useState<AdminInboxBadges>(EMPTY_INBOX_BADGES);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/inbox-badges");
      if (!res.ok) return;
      const json = (await res.json()) as Partial<AdminInboxBadges>;
      setBadges({
        leads: Number(json.leads) || 0,
        visits: Number(json.visits) || 0,
        presentations: Number(json.presentations) || 0,
        applications: Number(json.applications) || 0,
      });
    } catch {
      /* keep last known counts */
    }
  }, []);

  useEffect(() => {
    void load();
    const onRefresh = () => {
      void load();
    };
    const onFocus = () => {
      void load();
    };
    window.addEventListener(ADMIN_INBOX_REFRESH_EVENT, onRefresh);
    window.addEventListener("focus", onFocus);
    const timer = window.setInterval(() => {
      void load();
    }, 60_000);
    return () => {
      window.removeEventListener(ADMIN_INBOX_REFRESH_EVENT, onRefresh);
      window.removeEventListener("focus", onFocus);
      window.clearInterval(timer);
    };
  }, [load]);

  return badges;
}
