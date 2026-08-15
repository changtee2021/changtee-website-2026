import Link from "next/link";
import { LEARN_SHEETS } from "@/lib/learn";
import { HomePanel } from "@/components/home/HomePanel";

export function LearnTeaser() {
  const preview = LEARN_SHEETS.slice(0, 3);

  return (
    <HomePanel tone="clear">
      <div className="px-1 py-6 sm:px-2 sm:py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-brand-red uppercase">
              คัมภีร์ช่างตี๋
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-navy md:text-3xl">
              ห้องเรียนรู้
            </h2>
            <p className="mt-2 max-w-lg text-sm text-muted">
              เรื่องที่ช่างรู้ แต่ร้านทั่วไปไม่ค่อยเล่า — ส่งลิงก์ให้ลูกค้าอ่านได้เลย
            </p>
          </div>
          <Link
            href="/learn"
            className="text-sm font-semibold text-brand-red hover:underline"
          >
            เข้าห้องเรียนรู้ →
          </Link>
        </div>
        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {preview.map((sheet) => (
            <li key={sheet.slug}>
              <Link
                href={`/learn/${sheet.slug}`}
                className="block rounded-2xl border border-line bg-white px-4 py-4 hover:border-navy/25"
              >
                <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">
                  {sheet.kind === "video" ? "คลิปสอน" : "แผ่นความรู้"}
                </p>
                <p className="mt-1 font-semibold text-navy">{sheet.title}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </HomePanel>
  );
}
