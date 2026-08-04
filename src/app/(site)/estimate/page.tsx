import type { Metadata } from "next";
import { EstimateForm } from "@/components/forms/EstimateForm";

export const metadata: Metadata = {
  title: "ประเมินราคา",
  description: "คำนวณช่วงราคาผ้าม่านและม่านม้วนเบื้องต้น แล้วให้ทีมติดต่อเสนอราคาเป๊ะ",
};

export default function EstimatePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl font-semibold text-navy">ประเมินราคาคร่าวๆ</h1>
      <p className="mt-2 max-w-2xl text-muted">
        ดูช่วงราคาก่อน แล้วกรอกช่องทางติดต่อเพื่อรับราคาที่แม่นยำจากทีมเซลล์
      </p>
      <div className="mt-8">
        <EstimateForm />
      </div>
    </div>
  );
}
