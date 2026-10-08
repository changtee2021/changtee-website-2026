"use client";

import type { ReactNode } from "react";
import {
  CmsServerDataContext,
  seedCmsStoresFromServer,
  type CmsServerData,
} from "@/lib/cms/demo-store";

/**
 * Hands server-loaded CMS data to the client stores.
 *
 * - Server render / hydration: hooks read `data` through context, so the HTML
 *   shows published content instead of the build-time seed.
 * - First client render: stores are seeded (silently) before children read
 *   them, so a stale localStorage copy never flashes before the live fetch.
 */
export function CmsServerHydrator({
  data,
  children,
}: {
  data: CmsServerData;
  children: ReactNode;
}) {
  // Browser only: on the server the module-level stores are shared between
  // requests, so we keep them untouched and rely on context instead.
  if (typeof window !== "undefined") {
    seedCmsStoresFromServer(data);
  }
  return (
    <CmsServerDataContext.Provider value={data}>
      {children}
    </CmsServerDataContext.Provider>
  );
}
