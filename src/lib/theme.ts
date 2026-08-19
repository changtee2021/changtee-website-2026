export const THEME_STORAGE_KEY = "changtee.theme";

export type ThemeMode = "light" | "dark";

export function getStoredTheme(): ThemeMode | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw === "dark" || raw === "light") return raw;
  } catch {
    /* ignore */
  }
  return null;
}

export function resolveTheme(stored: ThemeMode | null): ThemeMode {
  return stored ?? "light";
}

export function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  root.classList.toggle("dark", mode === "dark");
  root.style.colorScheme = mode;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}

/** Admin is always light — do not write localStorage (keep public-site preference). */
export function forceLightAppearance() {
  const root = document.documentElement;
  root.classList.remove("dark");
  root.style.colorScheme = "light";
}

export function restoreStoredTheme() {
  applyTheme(resolveTheme(getStoredTheme()));
}

/** Inline script — runs before paint to avoid theme flash. Admin stays light. */
export const themeInitScript = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var r=document.documentElement;var h=location.hostname.toLowerCase();var p=location.pathname;var admin=p==="/admin"||p.indexOf("/admin/")===0||h==="admin.localhost"||h.indexOf("admin.")===0;if(admin){r.classList.remove("dark");r.style.colorScheme="light";return;}var d=localStorage.getItem(k)==="dark";r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light";}catch(e){}})();`;
