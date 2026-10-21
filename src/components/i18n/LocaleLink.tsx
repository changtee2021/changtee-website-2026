"use client";

import Link, { type LinkProps } from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useOptionalLocale } from "@/components/i18n/LocaleProvider";
import { localizedHref, type Locale } from "@/lib/i18n/locale";

type Props = Omit<LinkProps, "href"> &
  Omit<ComponentPropsWithoutRef<"a">, keyof LinkProps> & {
    href: string;
    /** Force a locale (defaults to the active LocaleProvider locale). */
    locale?: Locale;
    children?: ReactNode;
  };

/** `next/link` wrapper that prefixes the active (or forced) locale. */
export function LocaleLink({ href, locale: forceLocale, ...rest }: Props) {
  const { locale } = useOptionalLocale();
  const resolved = localizedHref(forceLocale ?? locale, href);
  return <Link href={resolved} {...rest} />;
}
