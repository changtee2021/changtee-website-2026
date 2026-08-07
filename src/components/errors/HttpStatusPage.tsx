import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

const COPY: Record<
  number,
  { title: string; description: string }
> = {
  400: {
    title: "คำขอไม่ถูกต้อง",
    description: "ข้อมูลที่ส่งมาไม่ครบหรือรูปแบบไม่ถูกต้อง ลองกลับไปกรอกใหม่",
  },
  401: {
    title: "ต้องเข้าสู่ระบบ",
    description: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาเข้าสู่ระบบก่อน",
  },
  403: {
    title: "ไม่มีสิทธิ์เข้าถึง",
    description: "บัญชีของคุณไม่สามารถเปิดหน้านี้ได้",
  },
  404: {
    title: "ไม่พบหน้านี้",
    description: "ลิงก์อาจหมดอายุ หรือหน้าที่คุณต้องการไม่มีในเว็บไซต์",
  },
  500: {
    title: "เซิร์ฟเวอร์ขัดข้อง",
    description: "ระบบมีปัญหาชั่วคราว ลองใหม่อีกครั้งในอีกสักครู่",
  },
  503: {
    title: "ปิดปรับปรุงชั่วคราว",
    description: "ระบบกำลังไม่พร้อมให้บริการชั่วคราว กรุณาลองใหม่ภายหลัง",
  },
  505: {
    title: "เวอร์ชันโปรโตคอลไม่รองรับ",
    description: "เบราว์เซอร์หรือการเชื่อมต่อนี้ยังใช้กับเว็บไซต์ไม่ได้",
  },
};

type Props = {
  code: number;
  title?: string;
  description?: string;
  showHome?: boolean;
  showQuote?: boolean;
  showRetry?: boolean;
  onRetry?: () => void;
  compact?: boolean;
};

export function HttpStatusPage({
  code,
  title,
  description,
  showHome = true,
  showQuote = true,
  showRetry = false,
  onRetry,
  compact = false,
}: Props) {
  const preset = COPY[code] ?? {
    title: "เกิดข้อผิดพลาด",
    description: "มีบางอย่างผิดปกติ ลองใหม่อีกครั้งหรือกลับหน้าแรก",
  };

  return (
    <div
      className={
        compact
          ? "mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center"
          : "flex min-h-screen flex-col items-center justify-center bg-shell px-4 text-center"
      }
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {siteConfig.nameEn} · HTTP {code}
      </p>
      <p className="mt-4 font-display text-6xl font-semibold text-navy/15 sm:text-7xl">
        {code}
      </p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-navy sm:text-3xl">
        {title ?? preset.title}
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
        {description ?? preset.description}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {showRetry && onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-deep"
          >
            ลองใหม่
          </button>
        ) : null}
        {showHome ? (
          <Link
            href="/"
            className={
              showRetry
                ? "rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:bg-paper"
                : "rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-deep"
            }
          >
            กลับหน้าแรก
          </Link>
        ) : null}
        {showQuote ? (
          <Link
            href="/quote"
            className="rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:bg-paper"
          >
            ขอใบเสนอราคา
          </Link>
        ) : null}
        <Link
          href="/contact"
          className="rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:bg-paper"
        >
          ติดต่อเรา
        </Link>
      </div>
    </div>
  );
}
