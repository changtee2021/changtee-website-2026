import * as XLSX from "xlsx";
import {
  LEAD_STATUS_LABELS,
  type LeadStatus,
  type QuoteLead,
} from "@/lib/leads/types";

type ExportLeadsInput = {
  leads: QuoteLead[];
  from: string;
  to: string;
  statusFilter: string;
  productFilter: string;
  isDemo: boolean;
};

function sheetFromRows(rows: (string | number)[][]) {
  return XLSX.utils.aoa_to_sheet(rows);
}

function countBy<T extends string>(items: QuoteLead[], key: (l: QuoteLead) => T) {
  const map = new Map<string, number>();
  for (const item of items) {
    const k = key(item);
    map.set(k, (map.get(k) || 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

export function downloadLeadsExcel(input: ExportLeadsInput) {
  const wb = XLSX.utils.book_new();
  const exportedAt = new Date().toLocaleString("th-TH");

  XLSX.utils.book_append_sheet(
    wb,
    sheetFromRows([
      ["รายงานคำขอใบเสนอราคา — ช่างตี๋"],
      ["จากวันที่", input.from || "-"],
      ["ถึงวันที่", input.to || "-"],
      ["ฟิลเตอร์สถานะ", input.statusFilter],
      ["ฟิลเตอร์สินค้า", input.productFilter],
      ["จำนวนรายการ", input.leads.length],
      ["ส่งออกเมื่อ", exportedAt],
      [
        "หมายเหตุ",
        input.isDemo
          ? "ข้อมูลตัวอย่าง (demo)"
          : "ข้อมูลจากระบบ",
      ],
    ]),
    "สรุป",
  );

  XLSX.utils.book_append_sheet(
    wb,
    sheetFromRows([
      [
        "วันที่",
        "ชื่อผู้ติดต่อ",
        "เบอร์",
        "อีเมล",
        "สินค้า",
        "แหล่ง",
        "เซลล์ผู้ดูแล",
        "สถานะ",
        "เหตุผลยกเลิก",
        "ประเภทผู้ติดต่อ",
        "ธุรกิจ",
        "ที่อยู่ติดตั้ง",
        "หมายเหตุ",
      ],
      ...input.leads.map((l) => [
        new Date(l.createdAt).toLocaleString("th-TH"),
        l.contactName,
        l.phone,
        l.email,
        l.productType,
        l.referralSource || l.source,
        l.assigneeName || "",
        LEAD_STATUS_LABELS[l.status as LeadStatus] || l.status,
        l.cancelReason || "",
        l.contactType,
        l.businessName || "",
        l.installAddress,
        l.note || "",
      ]),
    ]),
    "รายการ",
  );

  XLSX.utils.book_append_sheet(
    wb,
    sheetFromRows([
      ["สถานะ", "จำนวน"],
      ...countBy(input.leads, (l) => LEAD_STATUS_LABELS[l.status] || l.status),
    ]),
    "สรุปสถานะ",
  );

  XLSX.utils.book_append_sheet(
    wb,
    sheetFromRows([
      ["สินค้า", "จำนวน"],
      ...countBy(input.leads, (l) => l.productType),
    ]),
    "สรุปสินค้า",
  );

  const stamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `changtee-leads_${stamp}.xlsx`);
}
