import * as XLSX from "xlsx";
import type { AnalyticsBundle, NamedCount } from "@/lib/admin-analytics-demo";

type ExportInput = {
  rangeLabel: string;
  from: string;
  to: string;
  bundle: AnalyticsBundle;
  devices: NamedCount[];
  topPages: NamedCount[];
  clicks: NamedCount[];
  sources: NamedCount[];
  funnel: { step: string; value: number }[];
};

function sheetFromRows(rows: (string | number)[][]) {
  return XLSX.utils.aoa_to_sheet(rows);
}

export function downloadAnalyticsExcel(input: ExportInput) {
  const wb = XLSX.utils.book_new();
  const exportedAt = new Date().toLocaleString("th-TH");

  XLSX.utils.book_append_sheet(
    wb,
    sheetFromRows([
      ["รายงานสถิติเว็บช่างตี๋"],
      ["ช่วงเวลา", input.rangeLabel],
      ["จากวันที่", input.from],
      ["ถึงวันที่", input.to],
      ["ส่งออกเมื่อ", exportedAt],
      ["หมายเหตุ", "ข้อมูลตัวอย่าง (demo) — จะเปลี่ยนเป็นข้อมูลจริงหลังเชื่อม analytics"],
      [],
      ["ตัวชี้วัด", "ค่า", "เปลี่ยนแปลง", "หมายเหตุ"],
      ...input.bundle.kpis.map((k) => [k.label, k.value, k.delta, k.hint]),
    ]),
    "สรุป",
  );

  XLSX.utils.book_append_sheet(
    wb,
    sheetFromRows([
      ["ช่วง", "Users", "Pageviews"],
      ...input.bundle.traffic.map((t) => [t.label, t.users, t.pageviews]),
    ]),
    "การเข้าชม",
  );

  XLSX.utils.book_append_sheet(
    wb,
    sheetFromRows([
      ["หน้า", "ชื่อ", "จำนวน"],
      ...input.topPages.map((p) => [p.name, p.meta || "", p.value]),
    ]),
    "หน้าฮิต",
  );

  XLSX.utils.book_append_sheet(
    wb,
    sheetFromRows([
      ["CTA", "คลิก"],
      ...input.clicks.map((c) => [c.name, c.value]),
    ]),
    "คลิก",
  );

  XLSX.utils.book_append_sheet(
    wb,
    sheetFromRows([
      ["แหล่งที่มา", "สัดส่วน (%)"],
      ...input.sources.map((s) => [s.name, s.value]),
    ]),
    "แหล่งที่มา",
  );

  XLSX.utils.book_append_sheet(
    wb,
    sheetFromRows([
      ["อุปกรณ์", "สัดส่วน (%)"],
      ...input.devices.map((d) => [d.name, d.value]),
    ]),
    "อุปกรณ์",
  );

  XLSX.utils.book_append_sheet(
    wb,
    sheetFromRows([
      ["ขั้น Funnel", "จำนวน"],
      ...input.funnel.map((f) => [f.step, f.value]),
    ]),
    "Funnel",
  );

  const filename = `changtee-analytics_${input.from}_${input.to}.xlsx`;
  XLSX.writeFile(wb, filename);
}
