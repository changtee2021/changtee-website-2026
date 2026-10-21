import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { Tx } from "@/components/i18n/Tx";

export function PdpaConsentField({
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
        name="pdpaAccepted"
        className="mt-1 size-4"
        required
        {...(onChange
          ? {
              checked: Boolean(checked),
              onChange: (e) => onChange(e.target.checked),
            }
          : {})}
      />
      <span>
        <Tx>
          ข้าพเจ้ายินยอมให้เก็บ ใช้ และประมวลผลข้อมูลส่วนบุคคลเพื่อติดต่อกลับ และจัดทำใบเสนอราคา/ให้บริการ ตาม
        </Tx>{" "}
        <Link href="/privacy" className="text-navy underline">
          <Tx>นโยบายความเป็นส่วนตัว</Tx>
        </Link>{" "}
        <Tx>และยอมรับ</Tx>{" "}
        <Link href="/terms" className="text-navy underline">
          <Tx>ข้อกำหนดการใช้บริการ</Tx>
        </Link>
      </span>
    </label>
  );
}
