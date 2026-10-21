"use client";

import { useTx } from "@/lib/i18n/use-tx";

/** Thai source text → active locale, for server components that have no locale param. */
export function Tx({ children }: { children: string }) {
  const { tx } = useTx();
  return <>{tx(children)}</>;
}
