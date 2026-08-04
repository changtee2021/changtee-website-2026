import Image from "next/image";
import Link from "next/link";
import { blogMock } from "@/lib/mock-content";

export function BlogPreview() {
  return (
    <section className="bg-paper py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-bold text-navy sm:text-2xl md:text-3xl">
              บทความ
            </h2>
            <div className="mt-2 h-1 w-16 bg-brand-red" />
          </div>
          <Link
            href="/blog"
            className="shrink-0 text-sm font-semibold text-brand-red hover:underline"
          >
            ดูทั้งหมด
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {blogMock.slice(0, 3).map((post) => (
            <article key={post.title} className="overflow-hidden rounded-lg border border-line bg-white">
              <div className="relative aspect-[16/10]">
                <Image src={post.image} alt={post.title} fill className="object-cover" sizes="360px" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-navy">{post.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted">{post.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
