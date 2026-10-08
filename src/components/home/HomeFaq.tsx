import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { HomePanel, PanelHeading } from "@/components/home/HomePanel";
import { BRAND_FAQS } from "@/lib/brand-facts";

/**
 * Server-rendered so crawlers and AI answer engines read the same Q&A as the
 * FAQPage JSON-LD — schema must always mirror visible content.
 */
export function HomeFaq() {
  return (
    <HomePanel className="mt-4 sm:mt-6">
      <div id="faq" className="scroll-mt-24 p-7 sm:p-9 md:p-12">
        <PanelHeading
          title="คำถามที่พบบ่อย"
          subtitle="สิ่งที่ลูกค้าถามช่างตี๋บ่อยที่สุด — ตอบสั้น ตรง และเป็นข้อมูลจริง"
        />
        <div className="mx-auto mt-8 max-w-3xl divide-y divide-line rounded-2xl border border-line bg-white">
          {BRAND_FAQS.map((faq) => (
            <details key={faq.q} className="group px-5 sm:px-6">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-semibold text-navy [&::-webkit-details-marker]:hidden">
                <h3 className="text-sm sm:text-base">{faq.q}</h3>
                <ChevronDown
                  className="size-5 shrink-0 text-muted transition-transform group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <div className="pb-5 text-sm leading-relaxed text-muted">
                <p>{faq.a}</p>
                {faq.href ? (
                  <Link
                    href={faq.href}
                    className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-brand-red hover:underline"
                  >
                    ดูรายละเอียด →
                  </Link>
                ) : null}
              </div>
            </details>
          ))}
        </div>
      </div>
    </HomePanel>
  );
}
