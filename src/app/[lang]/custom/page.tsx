import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { IconNoren } from "@/components/icons/product-line-icons";
import { NOREN_QUOTE_PATH } from "@/lib/product-catalog";
import { pageMetadata } from "@/lib/seo/meta";
import { langFromParams } from "@/lib/i18n/lang-param";

const CUSTOM_PRODUCTS = [
  {
    href: NOREN_QUOTE_PATH,
    title: "ม่านญี่ปุ่น",
    blurb: "ใส่โลโก้หรือลายของร้านเอง เลือกขนาด ดูราคาทันที แล้วส่งขอใบเสนอราคาได้เลย",
    image: "/images/portfolio/noren-ichikara/01.webp",
    Icon: IconNoren,
  },
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const locale = await langFromParams(params);
  return pageMetadata({
    title: "Custom ออกแบบเอง",
    description:
      "ออกแบบสินค้าตามสั่งด้วยตัวเอง อัปโหลดภาพหรือโลโก้ ดูตัวอย่างและราคาประมาณการทันที แล้วส่งขอใบเสนอราคาจากช่างตี๋",
    path: "/custom",
    locale,
  });
}

export default function CustomPage() {
  return (
    <div className="min-h-full bg-shell px-6 py-8 sm:px-10 sm:py-12 lg:px-16">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="font-display text-2xl font-semibold text-navy sm:text-3xl">Custom</h1>
        <p className="mt-2 text-sm text-muted sm:text-base">
          เลือกสินค้าที่อยากออกแบบเอง อัปโหลดภาพหรือโลโก้ แล้วกดส่งขอใบเสนอราคาได้เลย
        </p>

        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CUSTOM_PRODUCTS.map(({ href, title, blurb, image, Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:border-navy hover:shadow-md"
              >
                <div className="relative aspect-[4/3] bg-paper">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <div className="flex items-center gap-2">
                    <Icon className="size-7" />
                    <h2 className="font-display text-lg font-semibold text-navy">{title}</h2>
                  </div>
                  <p className="mt-2 flex-1 text-sm text-muted">{blurb}</p>
                  <span className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-red px-5 text-sm font-semibold text-white group-hover:bg-brand-red-soft">
                    เริ่มออกแบบ
                    <ArrowRight className="size-4" aria-hidden />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
