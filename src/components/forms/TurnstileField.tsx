"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        },
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || "";

/** Renders Cloudflare Turnstile when site key is present; otherwise nothing. */
export function TurnstileField({
  onToken,
}: {
  onToken: (token: string | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    if (!SITE_KEY || !ref.current) return;

    let cancelled = false;

    function mount() {
      if (cancelled || !ref.current || !window.turnstile) return;
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: SITE_KEY,
        callback: (token) => onToken(token),
        "expired-callback": () => onToken(null),
        theme: "light",
      });
    }

    if (window.turnstile) {
      mount();
    } else {
      const existing = document.querySelector<HTMLScriptElement>(
        'script[data-changtee-turnstile="1"]',
      );
      if (existing) {
        existing.addEventListener("load", mount);
      } else {
        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.dataset.changteeTurnstile = "1";
        script.addEventListener("load", mount);
        document.head.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
    };
  }, [onToken]);

  if (!SITE_KEY) return null;

  return <div ref={ref} className="mt-2" />;
}

export function isTurnstileEnabled() {
  return Boolean(SITE_KEY);
}
