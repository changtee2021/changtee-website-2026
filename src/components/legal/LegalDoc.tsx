import Link from "next/link";
import {
  LEGAL_EFFECTIVE_DATE,
  LEGAL_VERSION,
  legalContact,
  type LegalSection,
} from "@/lib/legal";

const legalNav = [
  { href: "/privacy", label: "นโยบายความเป็นส่วนตัว" },
  { href: "/cookies", label: "นโยบายคุกกี้" },
  { href: "/terms", label: "ข้อกำหนดการใช้บริการ" },
] as const;

type Props = {
  title: string;
  subtitle: string;
  sections: LegalSection[];
  currentPath: "/privacy" | "/cookies" | "/terms";
};

export function LegalDoc({ title, subtitle, sections, currentPath }: Props) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Legal / PDPA
          </p>
          <nav className="mt-3 space-y-1">
            {legalNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm ${
                  item.href === currentPath
                    ? "bg-navy font-semibold text-white"
                    : "text-ink/80 hover:bg-paper hover:text-navy"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 rounded-xl border border-line bg-paper p-3 text-xs leading-5 text-muted">
            <div>มีผล: {LEGAL_EFFECTIVE_DATE}</div>
            <div>เวอร์ชัน: {LEGAL_VERSION}</div>
            <div className="mt-2">
              ติดต่อ PDPA:{" "}
              <a href={`mailto:${legalContact.email}`} className="text-navy underline">
                {legalContact.email}
              </a>
            </div>
          </div>
        </aside>

        <article>
          <h1 className="font-display text-3xl font-semibold text-navy">{title}</h1>
          <p className="mt-3 text-sm leading-7 text-muted">{subtitle}</p>

          <ol className="mt-8 space-y-2 rounded-xl border border-line bg-white p-4 text-sm">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-navy hover:underline">
                  {s.title}
                </a>
              </li>
            ))}
          </ol>

          <div className="mt-10 space-y-10">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="font-display text-xl font-semibold text-navy">
                  {section.title}
                </h2>
                {section.paragraphs.map((p) => (
                  <p key={p.slice(0, 40)} className="mt-3 text-sm leading-7 text-ink/90">
                    {p}
                  </p>
                ))}
                {section.bullets?.length ? (
                  <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-7 text-ink/90">
                    {section.bullets.map((b) => (
                      <li key={b.slice(0, 48)}>{b}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
