import type { FactoryVisitBooking } from "@/lib/visits/types";

export const DEMO_VISITS: FactoryVisitBooking[] = [
  {
    id: "visit-demo-1",
    fullName: "คุณสมชาย ใจดี",
    phone: "0812345678",
    email: "somchai@example.com",
    lineId: "somchai_line",
    businessName: "บริษัท ตัวอย่าง จำกัด",
    visitDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    session: "morning",
    visitorCount: 3,
    purpose: "พาลูกค้า/ผู้บริหารเยี่ยมชมก่อนสั่งผลิต",
    productInterest: "ม่านไฟฟ้า",
    note: null,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "visit-demo-2",
    fullName: "คุณพรทิพย์ วงศ์สุข",
    phone: "0898765432",
    email: null,
    lineId: "porntip99",
    businessName: null,
    visitDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    session: "evening",
    visitorCount: 1,
    purpose: "ดูตัวอย่างสินค้า/โชว์รูมโรงงาน",
    productInterest: "ผ้าม่าน",
    note: "สะดวกเฉพาะช่วงเย็นวันธรรมดา",
    status: "confirmed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
