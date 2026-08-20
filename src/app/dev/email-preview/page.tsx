import { notFound } from "next/navigation";
import { EMAIL_PREVIEWS } from "@/lib/email/previews";

export const dynamic = "force-dynamic";

export default function EmailPreviewPage() {
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    notFound();
  }

  const groups = ["เมลถึงทีมงาน", "เมลตอบลูกค้า"] as const;

  return (
    <div className="min-h-screen bg-[#efeae2] text-[#111827]">
      <div className="mx-auto flex max-w-[1280px] gap-6 px-4 py-6 lg:px-8">
        <aside className="sticky top-6 hidden w-64 shrink-0 self-start rounded-2xl border border-[#ece7df] bg-white p-4 lg:block">
          <p className="text-[11px] font-bold tracking-[0.14em] text-[#6b7280]">
            EMAIL PREVIEW
          </p>
          <h1 className="mt-1 text-lg font-extrabold text-[#0b1f3a]">
            ตัวอย่างเมลทุกฟอร์ม
          </h1>
          <p className="mt-2 text-xs leading-5 text-[#6b7280]">
            ดูบนเครื่องเท่านั้น ไม่ขึ้นเว็บจริง
          </p>
          <nav className="mt-4 space-y-4">
            {groups.map((group) => (
              <div key={group}>
                <p className="mb-2 text-[11px] font-bold tracking-wide text-[#c8102e]">
                  {group}
                </p>
                <ul className="space-y-1">
                  {EMAIL_PREVIEWS.filter((item) => item.group === group).map(
                    (item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className="block rounded-lg px-2 py-1.5 text-sm font-medium text-[#0b1f3a] hover:bg-[#faf9f7]"
                        >
                          {item.title}
                        </a>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 space-y-10">
          {EMAIL_PREVIEWS.map((item) => (
            <section key={item.id} id={item.id} className="scroll-mt-6">
              <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="text-[11px] font-bold tracking-wide text-[#c8102e]">
                    {item.group} · ถึง{item.to}
                  </p>
                  <h2 className="text-xl font-extrabold text-[#0b1f3a]">
                    {item.title}
                  </h2>
                </div>
              </div>
              <div className="overflow-hidden rounded-2xl border border-[#ece7df] bg-white">
                <iframe
                  title={item.title}
                  srcDoc={item.html}
                  className="h-[920px] w-full border-0 bg-[#f3f1ec]"
                />
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
