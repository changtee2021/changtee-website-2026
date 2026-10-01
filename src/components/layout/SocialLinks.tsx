import Image from "next/image";
import { isPlaceholderSocialUrl, siteConfig } from "@/lib/site-config";

const brandStyles: Record<string, string> = {
  Facebook: "bg-[#1877F2]",
  YouTube: "bg-[#FF0000]",
  LINE: "bg-[#06C755]",
  Instagram: "bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]",
  TikTok: "bg-black",
};

const svgIcons: Record<string, string> = {
  Facebook: "/images/social/facebook.svg",
  YouTube: "/images/social/youtube.svg",
  LINE: "/images/social/line.svg",
  Instagram: "/images/social/instagram.svg",
  TikTok: "/images/social/tiktok.svg",
};

type Props = {
  className?: string;
  size?: number;
  /** White glyph only — no brand-color circle. */
  flat?: boolean;
  /** Space between icons, in pixels. */
  gap?: number;
};

export function SocialLinks({ className = "", size = 28, flat = false, gap = 8 }: Props) {
  return (
    <div className={`flex items-center ${className}`} style={{ gap }}>
      {siteConfig.social
        .filter((item) => !isPlaceholderSocialUrl(item.href))
        .map((item) => (
        <a
          key={item.label}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.label}
          title={item.label}
          className={
            flat
              ? "inline-flex items-center justify-center text-white transition hover:opacity-70"
              : `inline-flex items-center justify-center rounded-full transition hover:opacity-80 ${brandStyles[item.label] || "bg-navy"}`
          }
          style={{ width: size, height: size }}
        >
          <Image
            src={svgIcons[item.label] || item.icon}
            alt=""
            width={flat ? size : Math.round(size * 0.55)}
            height={flat ? size : Math.round(size * 0.55)}
            className="object-contain brightness-0 invert"
            unoptimized
          />
        </a>
      ))}
    </div>
  );
}
