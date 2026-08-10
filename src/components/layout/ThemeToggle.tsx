"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import {
  THEME_STORAGE_KEY,
  applyTheme,
  getStoredTheme,
  resolveTheme,
  type ThemeMode,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

const THEME_EVENT = "changtee-theme";

function subscribeTheme(onStoreChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === THEME_STORAGE_KEY) onStoreChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(THEME_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(THEME_EVENT, onStoreChange);
  };
}

function getThemeSnapshot(): ThemeMode {
  return resolveTheme(getStoredTheme());
}

export function ThemeToggle({ className }: { className?: string }) {
  const mode = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    () => "light" as ThemeMode,
  );

  function toggle() {
    const next: ThemeMode = mode === "dark" ? "light" : "dark";
    applyTheme(next);
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 transition hover:bg-white/15 hover:text-white",
        className,
      )}
      aria-label={mode === "dark" ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด"}
      title={mode === "dark" ? "โหมดสว่าง" : "โหมดมืด"}
    >
      {mode === "dark" ? (
        <Sun className="size-3.5" aria-hidden />
      ) : (
        <Moon className="size-3.5" aria-hidden />
      )}
      <span>{mode === "dark" ? "โหมดสว่าง" : "โหมดมืด"}</span>
    </button>
  );
}
