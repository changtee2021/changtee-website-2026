"use client";

import { useEffect } from "react";

let lockCount = 0;

/** Prevent background scroll while a mobile overlay (menu, search) is open. */
export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    lockCount += 1;
    document.body.style.overflow = "hidden";
    return () => {
      lockCount -= 1;
      if (lockCount <= 0) {
        lockCount = 0;
        document.body.style.overflow = "";
      }
    };
  }, [locked]);
}
