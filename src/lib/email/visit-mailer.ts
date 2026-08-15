import { escapeHtml, fieldRow, getTransport } from "@/lib/email/mailer";
import { siteConfig } from "@/lib/site-config";
import {
  VISIT_SESSION_LABELS,
  type FactoryVisitBooking,
} from "@/lib/visits/types";

function formatVisitDate(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("th-TH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function buildAdminVisitHtml(visit: FactoryVisitBooking) {
  return `<!doctype html>
<html><body style="font-family:Sarabun,Arial,sans-serif;background:#f7f7f7;padding:24px">
  <div style="max-width:720px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
    <div style="background:#0b1f3a;color:#fff;padding:16px 20px;font-size:20px;font-weight:700">🏭 คำขอนัดเยี่ยมชมโรงงาน</div>
    <div style="padding:16px 20px">
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${fieldRow("วันที่ต้องการเข้าเยี่ยมชม", formatVisitDate(visit.visitDate))}
        ${fieldRow("รอบ", VISIT_SESSION_LABELS[visit.session])}
        ${fieldRow("ชื่อผู้ติดต่อ", visit.fullName)}
        ${fieldRow("ชื่อบริษัท/องค์กร", visit.businessName)}
        ${fieldRow("เบอร์โทรศัพท์", visit.phone)}
        ${fieldRow("LINE ID", visit.lineId)}
        ${fieldRow("E-mail", visit.email)}
        ${fieldRow("จำนวนผู้เข้าเยี่ยมชม", String(visit.visitorCount))}
        ${fieldRow("วัตถุประสงค์", visit.purpose)}
        ${fieldRow("สินค้าที่สนใจ", visit.productInterest)}
        ${fieldRow("หมายเหตุ", visit.note)}
      </table>
      <p style="margin-top:16px;font-size:12px;color:#888">Booking ID: ${visit.id}</p>
      <p style="margin-top:4px;font-size:13px;color:#c8102e">กรุณายืนยัน/ปฏิเสธการนัดกับลูกค้าโดยเร็ว</p>
    </div>
  </div>
</body></html>`;
}

function buildCustomerVisitHtml(visit: FactoryVisitBooking) {
  return `<!doctype html>
<html><body style="font-family:Sarabun,Arial,sans-serif;background:#f7f7f7;padding:24px">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
    <div style="background:#0b1f3a;color:#fff;padding:16px 20px;font-size:20px;font-weight:700">ช่างตี๋ ผ้าม่าน</div>
    <div style="padding:20px;font-size:15px;line-height:1.7;color:#222">
      <p>เรียนคุณ ${escapeHtml(visit.fullName)}</p>
      <p>เราได้รับคำขอนัดเยี่ยมชมโรงงานของท่านแล้ว</p>
      <p><strong>วันที่:</strong> ${escapeHtml(formatVisitDate(visit.visitDate))}<br/>
      <strong>รอบ:</strong> ${escapeHtml(VISIT_SESSION_LABELS[visit.session])}<br/>
      <strong>จำนวนผู้เข้าเยี่ยมชม:</strong> ${visit.visitorCount} คน</p>
      <p>ทีมงานจะติดต่อกลับเพื่อ<strong>ยืนยันวันเวลา</strong>ผ่านช่องทางที่ท่านให้ไว้ภายใน 1 วันทำการ</p>
      <p>หากต้องการพูดคุยด่วน ทัก LINE ได้ที่
      <a href="${siteConfig.lineUrl}">${siteConfig.lineId}</a></p>
      <p style="margin-top:24px">ขอบคุณที่ให้ความสนใจ<br/>ทีมงานช่างตี๋ ผ้าม่าน</p>
    </div>
  </div>
</body></html>`;
}

export async function sendFactoryVisitEmails(visit: FactoryVisitBooking) {
  const { transporter, from, adminTo } = getTransport();
  const results: Array<{ channel: string; ok: boolean; error?: string }> = [];
  const customerEmail = visit.email?.trim();

  try {
    await transporter.sendMail({
      from,
      to: adminTo,
      ...(customerEmail ? { replyTo: customerEmail } : {}),
      subject: `[นัดเยี่ยมชมโรงงาน] ${visit.fullName} · ${formatVisitDate(visit.visitDate)} ${VISIT_SESSION_LABELS[visit.session]}`,
      html: buildAdminVisitHtml(visit),
    });
    results.push({ channel: "admin-email", ok: true });
  } catch (err) {
    results.push({
      channel: "admin-email",
      ok: false,
      error: err instanceof Error ? err.message : "admin email failed",
    });
  }

  if (!customerEmail) return results;

  try {
    await transporter.sendMail({
      from,
      to: customerEmail,
      replyTo: adminTo,
      subject: "รับคำขอนัดเยี่ยมชมโรงงาน — ช่างตี๋ ผ้าม่าน",
      html: buildCustomerVisitHtml(visit),
    });
    results.push({ channel: "customer-email", ok: true });
  } catch (err) {
    results.push({
      channel: "customer-email",
      ok: false,
      error: err instanceof Error ? err.message : "customer email failed",
    });
  }

  return results;
}
