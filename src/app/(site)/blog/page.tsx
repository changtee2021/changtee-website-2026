import Image from "next/image";
import type { Metadata } from "next";
import { blogMock } from "@/lib/mock-content";

export const metadata: Metadata = {
  title: "บทความ",
  description: "บทความความรู้เรื่องผ้าม่าน การดูแล และการเลือกม่านให้เหมาะกับบ้าน",
};

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-navy">บทความ</h1>
      <div className="mt-2 h-1 w-16 bg-brand-red" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {blogMock.map((post) => (
          <article key={post.title} className="overflow-hidden rounded-lg border border-line bg-white">
            <div className="relative aspect-[16/10]">
              <Image src={post.image} alt={post.title} fill className="object-cover" sizes="360px" />
            </div>
            <div className="p-4">
              <h2 className="font-semibold text-navy">{post.title}</h2>
              <p className="mt-2 text-sm text-muted">{post.excerpt}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
