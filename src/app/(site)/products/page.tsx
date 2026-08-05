import type { Metadata } from "next";
import { ProductsHub } from "@/components/products/ProductsHub";

export const metadata: Metadata = {
  title: "สินค้าและบริการ",
  description:
    "ผ้าม่าน ม่านม้วน มู่ลี่ ฉากกั้นห้อง ม่านไฟฟ้า ม่านภายนอก วอลเปเปอร์ ฟิล์ม และบริการครบวงจร โดยช่างตี๋",
};

export default function ProductsPage() {
  return <ProductsHub />;
}
