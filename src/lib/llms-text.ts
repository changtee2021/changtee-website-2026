import { aboutSegments, aboutSmartMotor } from "@/lib/about-content";
import { BRAND_FAQS, brandFacts } from "@/lib/brand-facts";
import { DEMO_BLOG, type BlogPost } from "@/lib/cms/blog-demo";
import { readCmsCollection } from "@/lib/cms/cms-server";
import { publishedBlog } from "@/lib/cms/public-content";
import { LEARN_ENABLED, LEARN_SHEETS } from "@/lib/learn";
import { PRODUCT_PILLARS, productCatalog } from "@/lib/product-catalog";
import { siteConfig, socialSameAsUrls } from "@/lib/site-config";

const CMS_READ_TIMEOUT_MS = 3000;

/** Same guard as sitemap: a slow CMS must never make llms.txt time out. */
async function blogPostsWithinTimeout(): Promise<BlogPost[]> {
  const remote = await Promise.race([
    readCmsCollection<BlogPost>("blog").catch(() => null),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), CMS_READ_TIMEOUT_MS)),
  ]);
  return publishedBlog(remote ?? DEMO_BLOG);
}

function link(base: string, path: string, title: string, note?: string) {
  return `- [${title}](${base}${path})${note ? `: ${note}` : ""}`;
}

/**
 * llms.txt (https://llmstxt.org) — a markdown brief AI assistants read to
 * understand the brand. `full` adds every product, guide, article and FAQ.
 */
export async function buildLlmsText({ full }: { full: boolean }): Promise<string> {
  const base = siteConfig.url.replace(/\/$/, "");
  const sameAs = socialSameAsUrls();
  const lines: string[] = [];

  lines.push(`# ${siteConfig.name} (${siteConfig.nameEn})`);
  lines.push("");
  lines.push(
    `> ${siteConfig.positioning} จากประเทศไทย — ${siteConfig.concept} ตัวตนของแบรนด์คือ ช่าง + งานฝีมือ + ประสบการณ์: ออกแบบ ผลิตที่โรงงานของเราเอง และติดตั้งผ้าม่าน ม่านม้วน มู่ลี่ ม่านปรับแสง ฉากกั้นห้อง และม่านไฟฟ้า ครบวงจร ทั่วประเทศไทย`,
  );
  lines.push("");
  lines.push("## Brand / แบรนด์");
  lines.push("");
  lines.push(`- Thai name: ${siteConfig.name}`);
  lines.push(`- English name: ${siteConfig.nameEn}`);
  lines.push(`- Legal name: ${siteConfig.legalName}`);
  lines.push(`- Concept: ${siteConfig.concept}`);
  lines.push("- Identity: ช่าง + งานฝีมือ + ประสบการณ์ (Craftsman + Craftsmanship + Experience)");
  lines.push("- Promise: ประสบการณ์ของช่าง สู่มาตรฐานของงานออกแบบ (an installer's experience, built into design standards)");
  lines.push(`- Positioning: ${siteConfig.positioning}`);
  lines.push(`- Tagline (TH): ${siteConfig.tagline}`);
  lines.push("");
  lines.push("## Key facts / ข้อมูลสำคัญ");
  lines.push("");
  lines.push(`- Experience: ${brandFacts.experienceYears}+ years / ประสบการณ์กว่า ${brandFacts.experienceYears} ปี`);
  lines.push("- Own factory, own installation team / มีโรงงานผลิตและทีมช่างของเราเอง");
  lines.push("- Free on-site measuring / วัดหน้างานฟรี");
  lines.push(`- Fastest installation: ${brandFacts.fastestInstall} / ติดตั้งเร็วสุด ${brandFacts.fastestInstall}`);
  lines.push(`- Installation warranty: ${brandFacts.installWarranty} / รับประกันงานติดตั้ง ${brandFacts.installWarranty}`);
  lines.push(`- Motor warranty (motorized blinds): ${brandFacts.motorWarranty}`);
  lines.push(`- Customers: ${brandFacts.customers} · Installations: ${brandFacts.installs}`);
  lines.push(`- Service area: ${brandFacts.serviceArea} (nationwide Thailand)`);
  lines.push(`- Smart-home motors: ${aboutSmartMotor.brands}`);
  lines.push(
    `- Customers served: ${aboutSegments.map((s) => `${s.title} (${s.label})`).join(", ")}`,
  );
  lines.push("");
  lines.push("## Contact / ติดต่อ");
  lines.push("");
  lines.push(
    `- Showroom: ${siteConfig.address.line1} ${siteConfig.address.line2} ${siteConfig.address.city}`,
  );
  lines.push(`- Hours: ${siteConfig.hours}`);
  lines.push(`- Phone: ${siteConfig.phoneDisplay}`);
  lines.push(`- LINE: ${siteConfig.lineId} (${siteConfig.lineUrl})`);
  lines.push(`- Email: ${siteConfig.emailTo}`);
  lines.push(`- Google Maps: ${siteConfig.mapsUrl}`);
  for (const url of sameAs) lines.push(`- Social: ${url}`);
  lines.push("");
  lines.push("## Main pages / หน้าหลัก");
  lines.push("");
  lines.push(link(base, "/", "หน้าแรก / Home"));
  lines.push(link(base, "/products", "สินค้าและบริการ / Products", "ทุกหมวดสินค้า"));
  lines.push(link(base, "/portfolio", "ผลงานติดตั้ง / Portfolio", "งานจริงจากหน้างาน"));
  if (LEARN_ENABLED) {
    lines.push(link(base, "/learn", "ห้องเรียนรู้ / Learn", "ความรู้จากช่าง"));
  }
  lines.push(link(base, "/blog", "บทความ / Blog"));
  lines.push(link(base, "/quote", "ขอใบเสนอราคา / Get a quote", "วัดหน้างานฟรี"));
  lines.push(link(base, "/contact", "เกี่ยวกับเรา / About & contact"));
  lines.push(link(base, "/visit-factory", "เยี่ยมชมโรงงาน / Factory visit"));
  lines.push("");
  lines.push("## Product categories / หมวดสินค้า");
  lines.push("");
  lines.push(`Service pillars: ${PRODUCT_PILLARS.map((p) => `${p.name} (${p.nameEn})`).join(" · ")}`);
  lines.push("");
  for (const cat of productCatalog) {
    lines.push(link(base, `/products/${cat.slug}`, `${cat.name} / ${cat.nameEn}`, cat.summary));
    if (full) {
      for (const child of cat.children) {
        lines.push(
          `  ${link(
            base,
            `/products/${cat.slug}/${child.slug}`,
            child.nameEn ? `${child.name} / ${child.nameEn}` : child.name,
            child.summary,
          )}`,
        );
      }
    }
  }
  lines.push("");

  if (full) {
    if (LEARN_ENABLED) {
      lines.push("## Guides / ห้องเรียนรู้");
      lines.push("");
      for (const sheet of LEARN_SHEETS) {
        lines.push(link(base, `/learn/${sheet.slug}`, sheet.title, sheet.summary));
      }
      lines.push("");
    }

    const posts = await blogPostsWithinTimeout();
    if (posts.length) {
      lines.push("## Articles / บทความ");
      lines.push("");
      for (const post of posts) {
        lines.push(link(base, `/blog/${post.slug}`, post.title, post.excerpt));
      }
      lines.push("");
    }

    lines.push("## FAQ / คำถามที่พบบ่อย");
    lines.push("");
    for (const faq of BRAND_FAQS) {
      lines.push(`### ${faq.q}`);
      lines.push("");
      lines.push(faq.a);
      lines.push("");
    }
  } else {
    lines.push("## Optional");
    lines.push("");
    lines.push(link(base, "/llms-full.txt", "llms-full.txt", "every product, guide, article and FAQ"));
    lines.push(link(base, "/sitemap.xml", "Sitemap"));
    lines.push("");
  }

  return lines.join("\n");
}

export function llmsResponse(body: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
