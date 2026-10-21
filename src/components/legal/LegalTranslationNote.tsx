"use client";

import { useTx } from "@/lib/i18n/use-tx";

/** Non-Thai locales read a translation; the Thai policy is the one that binds. */
export function LegalTranslationNote() {
  const { tx, locale } = useTx();
  if (locale === "th") return null;
  return (
    <p className="mt-4 rounded-xl border border-brand-red/30 bg-brand-red/5 px-4 py-3 text-sm leading-6 text-ink/90">
      {tx(
        "ฉบับแปลนี้จัดทำขึ้นเพื่อความสะดวกเท่านั้น หากเนื้อหาแตกต่างกัน ให้ถือฉบับภาษาไทยเป็นหลักและมีผลทางกฎหมาย",
      )}
    </p>
  );
}
