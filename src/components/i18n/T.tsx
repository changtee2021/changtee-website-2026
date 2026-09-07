"use client";

import { type MessageKey } from "@/lib/i18n/messages";
import { useI18n } from "@/lib/i18n/use-i18n";

export function T({ k }: { k: MessageKey }) {
  const { t } = useI18n();
  return <>{t(k)}</>;
}
