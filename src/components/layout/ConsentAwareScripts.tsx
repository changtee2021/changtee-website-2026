"use client";

import Script from "next/script";
import { useEffect, useSyncExternalStore } from "react";
import {
  COOKIE_CONSENT_EVENT,
  type CookieConsentState,
  readConsent,
} from "@/lib/cookie-consent";

function subscribeConsent(onStoreChange: () => void) {
  window.addEventListener(COOKIE_CONSENT_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(COOKIE_CONSENT_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

const serverConsentSnapshot: CookieConsentState | null = null;

/** Live-site container; override with NEXT_PUBLIC_GTM_ID if a new one is created. */
const DEFAULT_GTM_ID = "GTM-5JX8PGT";

/** Loads GA4 / GTM / Meta Pixel only after analytics/marketing consent */
export function ConsentAwareScripts() {
  const consent = useSyncExternalStore(
    subscribeConsent,
    readConsent,
    () => serverConsentSnapshot,
  );

  const gtmId = process.env.NEXT_PUBLIC_GTM_ID?.trim() || DEFAULT_GTM_ID;
  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID?.trim();
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim();

  const allowAnalytics = Boolean(consent?.analytics);
  const allowMarketing = Boolean(consent?.marketing);

  // Update Google Consent Mode when consent is loaded or changed
  useEffect(() => {
    if (typeof window !== "undefined") {
      const win = window as Window & {
        dataLayer?: unknown[];
        gtag?: (...args: unknown[]) => void;
      };
      win.dataLayer = win.dataLayer || [];
      const gtag =
        win.gtag ||
        function gtag(...args: unknown[]) {
          win.dataLayer?.push(args);
        };
      win.gtag = gtag;

      gtag("consent", "update", {
        analytics_storage: allowAnalytics ? "granted" : "denied",
        ad_storage: allowMarketing ? "granted" : "denied",
        ad_user_data: allowMarketing ? "granted" : "denied",
        ad_personalization: allowMarketing ? "granted" : "denied",
      });
    }
  }, [allowAnalytics, allowMarketing]);

  const mainGoogleId = googleAdsId || ga4Id;

  return (
    <>
      {/* 1. Initialize Google Consent Mode with default (denied) states */}
      <Script id="consent-default" strategy="beforeInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){window.dataLayer.push(arguments);}
        if (typeof window.gtag !== 'function') {
          window.gtag = gtag;
        }
        window.gtag('consent', 'default', {
          analytics_storage: 'denied',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
          wait_for_update: 500
        });
      `}</Script>

      {/* 2. Load GTM unconditionally so it can run in Consent Mode */}
      {gtmId ? (
        <Script id="gtm" strategy="afterInteractive">{`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');
        `}</Script>
      ) : null}

      {/* 3. Load GA4 unconditionally so it can run in Consent Mode */}
      {ga4Id ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            if (typeof window.gtag !== 'function') {
              window.gtag = gtag;
            }
            window.gtag('js', new Date());
            window.gtag('config', '${ga4Id}', { anonymize_ip: true });
          `}</Script>
        </>
      ) : null}

      {/* 4. Load Google Ads unconditionally so it can run in Consent Mode and be detected by Google Ads crawler */}
      {googleAdsId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
            strategy="afterInteractive"
          />
          <Script id="google-ads" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            if (typeof window.gtag !== 'function') {
              window.gtag = gtag;
            }
            window.gtag('js', new Date());
            window.gtag('config', '${googleAdsId}');
          `}</Script>
        </>
      ) : null}

      {/* 5. Load Meta Pixel conditionally since it does not support Google Consent Mode */}
      {allowMarketing && pixelId ? (
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        `}</Script>
      ) : null}
    </>
  );
}
