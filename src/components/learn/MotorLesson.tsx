import type { LearnSheet } from "@/lib/learn";
import { LEARN_SHEETS } from "@/lib/learn";
import Link from "next/link";

export function MotorLesson({ sheet }: { sheet: LearnSheet }) {
  const siblings = LEARN_SHEETS.filter(
    (s) => s.room === "motor" && s.slug !== sheet.slug,
  );

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-line bg-navy">
        {sheet.videoSrc ? (
          <video
            className="aspect-video w-full bg-black"
            controls
            playsInline
            preload="metadata"
            poster={`/images/learn/${sheet.slug}.jpg`}
            src={sheet.videoSrc}
          >
            เบราว์เซอร์นี้เล่นวิดีโอไม่ได้ — เปิดลิงก์ไฟล์โดยตรงแทน
          </video>
        ) : (
          <div className="flex aspect-video items-center justify-center text-sm text-white/70">
            กำลังเตรียมคลิป
          </div>
        )}
      </div>
      <p className="mt-3 text-sm text-muted">
        คลิปสอนโดยช่างตี๋ · บีบอัดสำหรับดูบนเว็บ
        {sheet.videoDuration ? ` · ${sheet.videoDuration} นาที` : null}
      </p>

      {siblings.length ? (
        <div className="mt-8">
          <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">
            คลิปมอเตอร์อื่น
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {siblings.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/learn/${item.slug}`}
                  className="block rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-navy hover:border-navy/30"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
