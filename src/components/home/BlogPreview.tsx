"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HomePanel, PanelHeading } from "@/components/home/HomePanel";
import { Reveal } from "@/components/home/Reveal";
import { blogMock } from "@/lib/mock-content";
import { BLOG_CATEGORY_LABELS } from "@/lib/cms/blog-demo";

export function BlogPreview() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollBy(dir: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(300, el.clientWidth * 0.8), behavior: "smooth" });
  }

  return (
    <HomePanel>
      <div className="p-7 sm:p-9 md:p-12">
        <PanelHeading
          title="บทความจากทีมช่างตี๋"
          subtitle="ไอเดียแต่งบ้านและวิธีดูแลผ้าม่านแบบใช้ได้จริง"
          action={
            <div className="flex gap-2">
              <button
                type="button"
                aria-label="เลื่อนซ้าย"
                onClick={() => scrollBy(-1)}
                className="rounded-full bg-paper p-2.5 text-navy transition hover:bg-navy hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="เลื่อนขวา"
                onClick={() => scrollBy(1)}
                className="rounded-full bg-navy p-2.5 text-white transition hover:bg-navy-deep"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          }
        />

        <div ref={scrollerRef} className="no-scrollbar mt-9 flex gap-4 overflow-x-auto pb-1">
          {blogMock.slice(0, 4).map((post, i) => (
            <Reveal
              key={post.slug}
              delayStep={i}
              className="w-[72vw] shrink-0 sm:w-[260px]"
            >
              <Link href={`/blog/${post.slug}`} className="group block">
                <div className="relative aspect-square overflow-hidden rounded-[1.25rem] bg-paper">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    sizes="(max-width: 640px) 72vw, 260px"
                  />
                </div>
                <div className="mt-4">
                  <span className="text-[11px] font-medium text-brand-red">
                    {BLOG_CATEGORY_LABELS[post.category]}
                  </span>
                  <h3 className="mt-1 font-semibold text-navy group-hover:text-brand-red">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">{post.excerpt}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-7 text-center">
          <Link href="/blog" className="text-sm font-semibold text-brand-red hover:underline">
            อ่านบทความทั้งหมด
          </Link>
        </div>
      </div>
    </HomePanel>
  );
}
