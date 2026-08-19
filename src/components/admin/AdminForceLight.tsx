"use client";

import { useLayoutEffect } from "react";
import { forceLightAppearance, restoreStoredTheme } from "@/lib/theme";

/** Keep every admin screen on light tokens, even if the public site is in dark mode. */
export function AdminForceLight() {
  useLayoutEffect(() => {
    forceLightAppearance();
    return () => {
      restoreStoredTheme();
    };
  }, []);
  return null;
}
