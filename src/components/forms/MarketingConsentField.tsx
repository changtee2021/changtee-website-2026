import Link from "next/link";
import { MARKETING_CONSENT_TEXT } from "@/lib/marketing/consent";

export function MarketingConsentField({
  checked,
  onChange,
}: {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 items-start gap-2 text-sm text-muted">
      <input
        type="checkbox"
        name="marketingOptIn"
        className="mt-1 size-4"
        {...(onChange
          ? {
              checked: Boolean(checked),
              onChange: (e) => onChange(e.target.checked),
            }
          : {})}
      />
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
