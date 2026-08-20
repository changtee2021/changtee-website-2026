import Link from "next/link";
import { MARKETING_CONSENT_TEXT } from "@/lib/marketing/consent";

export function MarketingConsentField() {
  return (
    <label className="flex items-start gap-2 text-sm text-muted">
      <input type="checkbox" name="marketingOptIn" className="mt-1" />
      <span>
        {MARKETING_CONSENT_TEXT} ตาม{" "}
        <Link href="/privacy" className="text-navy underline">
          นโยบายความเป็นส่วนตัว
        </Link>
        <span className="ml-1 text-xs">(ไม่บังคับ)</span>
      </span>
    </label>
  );
}
