import type { Locale } from "@/lib/i18n/locale";
import { siteConfig } from "@/lib/site-config";

export type ChatChannel = {
  id: "wechat" | "viber" | "telegram" | "whatsapp";
  label: string;
  href: string;
  /** Tailwind classes for the pill background/text. */
  tone: string;
};

/** Apps customers in each market actually use; LINE + phone stay for everyone. */
const CHANNELS_BY_LOCALE: Record<Locale, ChatChannel["id"][]> = {
  th: [],
  en: ["whatsapp"],
  my: ["viber", "telegram"],
  lo: ["whatsapp"],
  km: ["telegram"],
  "zh-Hans": ["wechat"],
  "zh-Hant": ["wechat", "whatsapp"],
};

function channel(id: ChatChannel["id"]): ChatChannel | null {
  const c = siteConfig.chatChannels;
  switch (id) {
    case "wechat": {
      if (!c.wechatUrl) return null;
      return {
        id,
        label: c.wechatId ? `WeChat ${c.wechatId}` : "WeChat",
        href: c.wechatUrl,
        tone: "bg-[#07C160] text-white",
      };
    }
    case "viber":
      return c.viberUrl
        ? { id, label: "Viber", href: c.viberUrl, tone: "bg-[#7360F2] text-white" }
        : null;
    case "telegram":
      return c.telegramUrl
        ? { id, label: "Telegram", href: c.telegramUrl, tone: "bg-[#229ED9] text-white" }
        : null;
    case "whatsapp":
      return c.whatsappUrl
        ? { id, label: "WhatsApp", href: c.whatsappUrl, tone: "bg-[#25D366] text-white" }
        : null;
  }
}

/** Configured chat channels for this locale (unset env vars are skipped). */
export function localeContactChannels(locale: Locale): ChatChannel[] {
  return CHANNELS_BY_LOCALE[locale]
    .map(channel)
    .filter((item): item is ChatChannel => item !== null);
}
