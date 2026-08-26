import Image from "next/image";
import Link from "next/link";
import { Check, MessageCircle, Phone } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

const NEXT_STEPS = [
  { step: "1", title: "ตรวจข้อมูล", body: "ทีมงานตรวจคำขอและช่องทางติดต่อของคุณ" },
  { step: "2", title: "ติดต่อกลับ", body: "โทรหรือทัก LINE ภายใน 24 ชม. ในเวลาทำการ" },
  { step: "3", title: "นัดวัดหน้างาน", body: "นัดหมายวัดและประเมินใบเสนอราคาฟรี" },
] as const;

export function ThankYouCard() {
  return (
    <section className="relative overflow-hidden bg-paper px-4 py-14 md:py-20">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -10%, color-mix(in oklab, var(--navy) 12%, transparent), transparent), radial-gradient(circle at 100% 80%, color-mix(in oklab, var(--red) 6%, transparent), transparent)",
        }}
      />

      <div className="relative mx-auto max-w-2xl animate-home-fade-up">
        <div className="rounded-[1.75rem] border border-line bg-white px-6 py-10 shadow-[0_12px_40px_-20px_rgba(11,31,58,0.35)] md:px-10 md:py-12">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy text-white">
              <Check className="h-8 w-8" strokeWidth={2.5} aria-hidden />
            </div>
            <p className="mt-5 text-sm font-semibold tracking-wide text-brand-red">
              {siteConfig.name}
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-navy md:text-4xl">
              รับเรื่องเรียบร้อยแล้ว
            </h1>
            <p className="mt-3 max-w-md text-base leading-relaxed text-muted">
              ขอบคุณที่ไว้วางใจช่างตี๋ ผ้าม่าน เราได้ส่งอีเมลยืนยันให้คุณแล้ว (หากระบุอีเมลไว้)
              ทีมงานจะติดต่อกลับโดยเร็วที่สุดผ่านช่องทางที่คุณให้ไว้
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <a
              href={`tel:${siteConfig.phoneTel}`}
              className="group flex flex-col rounded-2xl border border-line bg-paper p-5 text-left transition hover:border-navy/30"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-red text-white">
                <Phone className="h-5 w-5" aria-hidden />
              </span>
              <span className="mt-3 text-xs font-medium text-muted">ติดตามเรื่อง / พูดคุยด่วน</span>
              <span className="mt-1 font-display text-xl font-semibold text-navy group-hover:text-brand-red">
                {siteConfig.phoneDisplay}
              </span>
              <span className="mt-4 inline-flex w-fit rounded-full bg-brand-red px-4 py-2 text-sm font-semibold text-white">
                โทรเลย
              </span>
            </a>

            <a
              href={siteConfig.lineUrl}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col rounded-2xl border border-line bg-paper p-5 text-left transition hover:border-[#06C755]/40"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#06C755] text-white">
                  <MessageCircle className="h-5 w-5" aria-hidden />
                </span>
                <Image
                  src={siteConfig.lineQrUrl}
                  alt={`QR LINE ${siteConfig.lineId}`}
                  width={72}
                  height={72}
                  className="h-[72px] w-[72px] rounded-xl border border-line bg-white object-contain p-1"
                />
              </div>
              <span className="mt-3 text-xs font-medium text-muted">ทัก LINE ติดตามคำขอ</span>
              <span className="mt-1 font-display text-xl font-semibold text-navy">
                {siteConfig.lineId}
              </span>
              <span className="mt-1 text-xs text-muted">แจ้งว่าเพิ่งส่งคำขอใบเสนอราคาจากเว็บ</span>
              <span className="mt-3 inline-flex w-fit rounded-full bg-[#06C755] px-4 py-2 text-sm font-semibold text-white">
                แอดไลน์คุยกับเรา
              </span>
            </a>
          </div>

          <div className="mt-8 border-t border-line pt-8">
            <p className="text-center text-sm font-semibold text-navy">ขั้นตอนถัดไป</p>
            <ol className="mt-4 grid gap-4 sm:grid-cols-3">
              {NEXT_STEPS.map((item) => (
                <li key={item.step} className="text-center sm:text-left">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                    {item.step}
                  </span>
                  <p className="mt-2 text-sm font-semibold text-navy">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{item.body}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/portfolio"
              className="inline-flex rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-navy-deep"
            >
              ดูผลงานติดตั้ง
            </Link>
            <Link
              href="/"
              className="inline-flex rounded-full border border-navy px-5 py-3 text-sm font-semibold text-navy transition hover:bg-paper"
            >
              กลับหน้าแรก
            </Link>
          </div>
          <p className="mt-5 text-center text-sm text-muted">
            ส่งผิดหรืออยากแก้ข้อมูล?{" "}
            <Link href="/quote" className="font-semibold text-navy underline-offset-2 hover:underline">
              ส่งคำขออีกครั้ง
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
