import Image from "next/image";
import { whyItems } from "@/lib/mock-content";

export function WhyUs() {
  return (
    <section className="bg-paper py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center font-display text-2xl font-bold text-navy md:text-3xl">
          ทำไมต้องเลือกเรา?
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted">
          เราไม่ใช่แค่ร้านผ้าม่าน — แต่เป็นทีมมืออาชีพที่เข้าใจบ้านของคุณ
        </p>
        <div className="mx-auto mt-2 h-1 w-16 bg-brand-red" />

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {whyItems.map((item) => (
            <article key={item.title} className="overflow-hidden rounded-lg border border-line bg-white">
              <div className="relative aspect-[4/3] w-full bg-white">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-contain p-4"
                  sizes="360px"
                />
              </div>
              <div className="border-t border-line px-4 py-4 text-center">
                <h3 className="font-display text-xl font-bold text-brand-red">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
