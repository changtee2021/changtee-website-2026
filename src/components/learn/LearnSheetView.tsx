import Link from "next/link";
import { FabricLesson } from "@/components/learn/FabricLesson";
import { MotorLesson } from "@/components/learn/MotorLesson";
import { PartitionLesson } from "@/components/learn/PartitionLesson";
import { ShareLinkBar } from "@/components/learn/ShareLinkBar";
import { roomById, type LearnSheet } from "@/lib/learn";

export function LearnSheetView({ sheet }: { sheet: LearnSheet }) {
  const room = roomById(sheet.room);

  return (
    <div className="bg-shell pb-16">
      <div className="mx-auto max-w-3xl px-6 py-10 sm:px-10 lg:px-0">
        <Link
          href="/learn"
          className="text-sm font-semibold text-navy hover:text-brand-red"
        >
          ← ห้องเรียนรู้
        </Link>
        <p className="mt-6 text-[11px] font-semibold tracking-[0.18em] text-brand-red uppercase">
          {room?.label} · {sheet.kind === "video" ? "คลิปสอน" : "แผ่นความรู้"}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-navy sm:text-4xl">
          {sheet.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">{sheet.summary}</p>

        <ShareLinkBar
          className="mt-6"
          path={`/learn/${sheet.slug}`}
          title={sheet.title}
          shareLine={sheet.shareLine}
        />

        <div className="mt-10">
          {sheet.slug === "fabric" ? <FabricLesson /> : null}
          {sheet.slug === "partition-open" ? <PartitionLesson /> : null}
          {sheet.kind === "video" ? <MotorLesson sheet={sheet} /> : null}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          {sheet.productHref ? (
            <Link
              href={sheet.productHref}
              className="inline-flex rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:bg-paper"
            >
              ดูสินค้าที่เกี่ยวข้อง
            </Link>
          ) : null}
          <Link
            href="/quote"
            className="inline-flex rounded-full bg-brand-red px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-red-soft"
          >
            ขอวัดหน้างานฟรี
          </Link>
        </div>
      </div>
    </div>
  );
}
