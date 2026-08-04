import Image from "next/image";
import { siteConfig } from "@/lib/site-config";

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
};

export function SocialLinks({ className = "", size = 28 }: Props) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {siteConfig.social.map((item) => (
        <a
          key={item.label}
          href={item.href}
          target="_blank"
          rel="noreferrer"
          aria-label={item.label}
          title={item.label}
          className={`inline-flex items-center justify-center rounded-full transition hover:opacity-80 ${brandStyles[item.label] || "bg-navy"}`}
          style={{ width: size, height: size }}
        >
          <Image
            src={svgIcons[item.label] || item.icon}
            alt=""
            width={Math.round(size * 0.55)}
            height={Math.round(size * 0.55)}
            className="object-contain brightness-0 invert"
            unoptimized
          />
        </a>
      ))}
    </div>
  );
}
