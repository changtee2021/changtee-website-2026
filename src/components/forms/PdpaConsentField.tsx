import Link from "next/link";

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
        ข้าพเจ้ายินยอมให้เก็บ ใช้ และประมวลผลข้อมูลส่วนบุคคลเพื่อติดต่อกลับ
        และจัดทำใบเสนอราคา/ให้บริการ ตาม{" "}
        <Link href="/privacy" className="text-navy underline">
          นโยบายความเป็นส่วนตัว
        </Link>{" "}
        และยอมรับ{" "}
        <Link href="/terms" className="text-navy underline">
          ข้อกำหนดการใช้บริการ
        </Link>
      </span>
    </label>
  );
}
