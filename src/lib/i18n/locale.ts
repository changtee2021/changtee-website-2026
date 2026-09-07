export const LOCALE_STORAGE_KEY = "changtee.lang";
export const LOCALE_COOKIE = "changtee.lang";
export const LOCALE_EVENT = "changtee-locale";

export type Locale = "th" | "en";

export function isLocale(value: unknown): value is Locale {
  return value === "th" || value === "en";
}

export function getStoredLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(raw)) return raw;
  } catch {
    /* ignore */
  }
  return null;
}

export function resolveLocale(stored: Locale | null): Locale {
  return stored ?? "th";
}

export function applyLocale(locale: Locale) {
  const root = document.documentElement;
  root.lang = locale;
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
  try {
    document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;samesite=lax`;
  } catch {
    /* ignore */
  }
}

/** Inline script — sets <html lang> before paint. */
export const localeInitScript = `(function(){try{var k=${JSON.stringify(LOCALE_STORAGE_KEY)};var r=document.documentElement;var v="";try{v=localStorage.getItem(k)||""}catch(e){}if(v!=="en"&&v!=="th"){var c=document.cookie.split("; ");for(var i=0;i<c.length;i++){if(c[i].indexOf(k+"=")==0){v=c[i].slice(k.length+1);break}}}r.lang=v==="en"?"en":"th"}catch(e){}})();`;
