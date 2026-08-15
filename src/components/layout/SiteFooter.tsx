import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { LazyMapsEmbed } from "@/components/layout/LazyMapsEmbed";
import { SocialLinks } from "@/components/layout/SocialLinks";
import { CookieSettingsButton } from "@/components/legal/CookieSettingsButton";
import { BrochureLink } from "@/components/catalog/BrochureLink";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-line bg-panel">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-10 sm:py-12 lg:px-16">
        <div className="grid gap-8 md:grid-cols-2 md:gap-8 lg:grid-cols-[1.15fr_1fr_0.95fr] lg:gap-10">
          <div>
            <div className="flex items-start gap-3">
              <Image
                src="/images/brand/logo-footer.png"
                alt=""
                width={48}
                height={60}
                className="h-12 w-auto shrink-0 object-contain sm:h-16"
              />
              <div className="min-w-0">
                <div className="font-display text-lg font-bold uppercase tracking-wide text-navy sm:text-xl">
                  {siteConfig.nameEn}
                </div>
                <div className="text-sm font-semibold leading-5 text-brand-red">
                  Quickly Quality Professional
                </div>
                <div className="text-sm font-light leading-5 text-navy">
                  Curtain & Blinds Service Solution
                </div>
              </div>
            </div>
            <div className="mt-4 h-px w-16 bg-brand-red" />
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted">
              {siteConfig.description}
            </p>
            <SocialLinks className="mt-5" size={34} />
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/quote"
                className="inline-flex min-h-11 items-center rounded-md bg-brand-red px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-red-soft"
              >
                ขอใบเสนอราคา
              </Link>
              <Link
                href="/visit-factory"
                className="inline-flex min-h-11 items-center rounded-md border border-line px-3 py-1.5 text-xs font-medium text-navy hover:bg-paper"
              >
                นัดเยี่ยมชมโรงงาน
              </Link>
              <Link
                href="/careers"
                className="inline-flex min-h-11 items-center rounded-md border border-line px-3 py-1.5 text-xs font-medium text-navy hover:bg-paper"
              >
                ร่วมงานกับเรา
              </Link>
              <BrochureLink className="inline-flex min-h-11 items-center rounded-md border border-line px-3 py-1.5 text-xs font-medium text-navy hover:bg-paper">
                Download Brochure
              </BrochureLink>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-navy">
              Contact
            </h3>
            <div className="mt-1 h-0.5 w-10 bg-brand-red" />

            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
              SALE Tel
            </p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {siteConfig.saleContacts.map((c) => (
                <li
                  key={c.phoneTel}
                  className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                >
                  <span className="text-muted">{c.name}</span>
                  <a
                    href={`tel:${c.phoneTel}`}
                    className="shrink-0 font-medium text-navy hover:text-brand-red"
                  >
                    {c.phoneDisplay}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-5 space-y-2 text-sm">
              <p>
                <span className="text-muted">Email</span>
                <br />
                <a
                  href={`mailto:${siteConfig.emailTo}`}
                  className="font-medium break-all text-navy hover:text-brand-red"
                >
                  {siteConfig.emailTo}
                </a>
              </p>
              <p>
                <span className="text-muted">LINE</span>
                <br />
                <a
                  href={siteConfig.lineUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#06C755] hover:underline"
                >
                  {siteConfig.lineId}
                </a>
              </p>
              <p className="leading-6 text-ink/80">
                {siteConfig.address.line1}
                <br />
                {siteConfig.address.line2}
                <br />
                {siteConfig.address.city}
              </p>
              <p className="text-muted">{siteConfig.hours}</p>
            </div>
          </div>

          <div className="md:col-span-2 lg:col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-wide text-navy">
              Location
            </h3>
            <div className="mt-1 h-0.5 w-10 bg-brand-red" />
            <div className="mt-4 overflow-hidden rounded-xl border border-line bg-paper">
              <LazyMapsEmbed
                title="แผนที่โชว์รูมช่างตี๋ ผ้าม่าน"
                src={siteConfig.mapsEmbedUrl}
                className="aspect-[4/3] w-full lg:aspect-square"
              />
            </div>
            <a
              href={siteConfig.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-navy hover:text-brand-red"
            >
              เปิดใน Google Maps →
            </a>
          </div>
        </div>
      </div>

      <div className="bg-[#0b1220] text-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 text-xs text-white/70 sm:px-10 md:flex-row md:items-center md:justify-between lg:px-16">
          <nav className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-0 sm:gap-y-1">
            <Link href="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
            <span className="mx-3 hidden text-white/30 sm:inline" aria-hidden>
              |
            </span>
            <Link href="/cookies" className="hover:text-white">
              Cookie Policy
            </Link>
            <span className="mx-3 hidden text-white/30 sm:inline" aria-hidden>
              |
            </span>
            <Link href="/terms" className="hover:text-white">
              Terms of Service
            </Link>
            <span className="mx-3 hidden text-white/30 sm:inline" aria-hidden>
              |
            </span>
            <CookieSettingsButton
              label="Cookie Settings"
              className="text-left text-white/70 hover:text-white"
            />
          </nav>
          <p>
            © {year} {siteConfig.legalName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
