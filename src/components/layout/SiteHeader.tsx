"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Home, Menu, X } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { productCatalog } from "@/lib/product-catalog";
import { SocialLinks } from "@/components/layout/SocialLinks";

const mainNav = [
  { href: "/", label: "หน้าแรก", home: true },
  { href: "/products", label: "สินค้า/บริการ", mega: true },
  { href: "/portfolio", label: "ผลงาน" },
  { href: "/blog", label: "บทความ" },
  { href: "/sale-gallery", label: "Sale Gallery" },
  { href: "/about", label: "เกี่ยวกับเรา" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);

  return (
    <header className="overflow-x-clip">
      {/* Top utility row — scrolls away */}
      <div className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-2 sm:py-3">
          <SocialLinks className="hidden sm:flex" size={28} />

          <Link
            href="/"
            className="mx-auto flex min-w-0 items-center justify-center sm:mx-0"
          >
            <Image
              src="/images/brand/logo.png"
              alt={`${siteConfig.name} ออกแบบ-ติดตั้ง ผ้าม่าน`}
              width={200}
              height={200}
              className="h-14 w-14 object-contain sm:h-20 sm:w-20 md:h-28 md:w-28"
              priority
            />
          </Link>

          <div className="hidden flex-col items-end gap-1 text-right text-sm lg:flex">
            <Link href="/quote" className="font-semibold text-navy hover:text-brand-red">
              ขอใบเสนอราคา - Quotation
            </Link>
            <a
              href="/brochure/company-profile-2026.pdf"
              className="text-muted hover:text-navy"
            >
              Download Brochure ช่างตี๋ 2026
            </a>
          </div>

          <div className="w-9 shrink-0 lg:hidden" aria-hidden />
        </div>
      </div>

      {/* Navy main nav */}
      <div className="bg-navy text-white">
        <nav className="mx-auto hidden max-w-6xl items-center gap-1 px-4 lg:flex">
          {mainNav.map((item) =>
            "mega" in item && item.mega ? (
              <div key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1 px-4 py-3 text-sm font-medium hover:bg-white/10"
                >
                  {item.label}
                  <ChevronDown className="h-3.5 w-3.5 opacity-80" />
                </Link>
                <div className="invisible absolute left-0 top-full z-50 w-[min(42rem,calc(100vw-2rem))] border border-line bg-white p-4 text-ink opacity-0 shadow-sm transition group-hover:visible group-hover:opacity-100">
                  <div className="grid grid-cols-2 gap-2">
                    {productCatalog.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/products/${cat.slug}`}
                        className="rounded-md px-3 py-2 hover:bg-paper"
                      >
                        <div className="text-sm font-semibold text-navy">{cat.name}</div>
                        <div className="text-xs text-muted line-clamp-1">{cat.summary}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-1.5 px-4 py-3 text-sm font-medium hover:bg-white/10"
              >
                {"home" in item && item.home ? <Home className="h-4 w-4" /> : null}
                {item.label}
              </Link>
            ),
          )}
          <div className="ml-auto flex items-center gap-2 py-2">
            <Link
              href="/estimate"
              className="rounded-md border border-white/30 px-3 py-1.5 text-sm hover:bg-white/10"
            >
              ประเมินราคา
            </Link>
            <Link
              href="/quote"
              className="rounded-md bg-brand-red px-3 py-1.5 text-sm font-semibold hover:bg-brand-red-soft"
            >
              ขอใบเสนอราคา
            </Link>
          </div>
        </nav>

        {/* Mobile sticky bar */}
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2 sm:px-4 lg:hidden">
          <button
            type="button"
            className="inline-flex shrink-0 rounded-md border border-white/30 p-2 text-white"
            aria-label="เมนู"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 sm:gap-2">
            <Link
              href="/estimate"
              className="truncate rounded-md border border-white/30 px-2.5 py-1.5 text-[11px] hover:bg-white/10 sm:px-3 sm:text-xs"
            >
              ประเมิน
            </Link>
            <Link
              href="/quote"
              className="truncate rounded-md bg-brand-red px-2.5 py-1.5 text-[11px] font-semibold hover:bg-brand-red-soft sm:px-3 sm:text-xs"
            >
              ขอราคา
            </Link>
          </div>
        </div>

        {open ? (
          <div className="max-h-[70vh] overflow-y-auto border-t border-white/15 bg-navy lg:hidden">
            <div className="mx-auto flex max-w-6xl flex-col px-4 py-2">
              {mainNav.map((item) =>
                "mega" in item && item.mega ? (
                  <div key={item.href} className="border-b border-white/10">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between py-3 text-left text-sm font-medium text-white"
                      onClick={() => setProductsOpen((v) => !v)}
                      aria-expanded={productsOpen}
                    >
                      {item.label}
                      <ChevronDown
                        className={`h-4 w-4 transition ${productsOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {productsOpen ? (
                      <div className="space-y-1 pb-3 pl-2">
                        <Link
                          href={item.href}
                          className="block rounded-md px-2 py-2 text-sm text-white/90 hover:bg-white/10"
                          onClick={() => setOpen(false)}
                        >
                          ดูทั้งหมด
                        </Link>
                        {productCatalog.map((cat) => (
                          <Link
                            key={cat.slug}
                            href={`/products/${cat.slug}`}
                            className="block rounded-md px-2 py-2 text-sm text-white/80 hover:bg-white/10"
                            onClick={() => setOpen(false)}
                          >
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="border-b border-white/10 py-3 text-sm font-medium text-white"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                ),
              )}
              <Link
                href="/contact"
                className="border-b border-white/10 py-3 text-sm text-white"
                onClick={() => setOpen(false)}
              >
                ติดต่อเรา
              </Link>
              <Link
                href="/estimate"
                className="border-b border-white/10 py-3 text-sm text-white"
                onClick={() => setOpen(false)}
              >
                ประเมินราคา
              </Link>
              <Link
                href="/quote"
                className="py-3 text-sm font-semibold text-white"
                onClick={() => setOpen(false)}
              >
                ขอใบเสนอราคา
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
