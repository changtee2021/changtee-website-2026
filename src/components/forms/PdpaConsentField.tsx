import Link from "next/link";

export function PdpaConsentField() {
  return (
    <label className="flex items-start gap-2 text-sm text-muted">
      <input type="checkbox" name="pdpaAccepted" className="mt-1" required />
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
