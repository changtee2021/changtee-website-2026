import nodemailer from "nodemailer";
import type { QuoteLead } from "@/lib/leads/types";
import { LEAD_STATUS_LABELS } from "@/lib/leads/types";
import { siteConfig } from "@/lib/site-config";

function getTransport() {
  const user = process.env.SMTP_USER || process.env.EMAIL_FROM || "changtee2021@gmail.com";
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);

  if (!pass) {
    throw new Error("SMTP_PASS / GMAIL_APP_PASSWORD is not configured");
  }

  return {
    from: process.env.EMAIL_FROM || `ช่างตี๋ ผ้าม่าน <${user}>`,
    adminTo: process.env.EMAIL_TO || user,
    transporter: nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    }),
  };
}

function fieldRow(label: string, value?: string | null) {
  const v = value?.trim() ? value : "-";
  return `<tr>
    <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;width:38%;vertical-align:top">${label}</td>
    <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#111;vertical-align:top">${escapeHtml(v)}</td>
  </tr>`;
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function buildAdminSummaryHtml(lead: QuoteLead) {
  return `<!doctype html>
<html><body style="font-family:Sarabun,Arial,sans-serif;background:#f7f7f7;padding:24px">
  <div style="max-width:720px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
    <div style="background:#c8102e;color:#fff;padding:16px 20px;font-size:20px;font-weight:700">ขอใบเสนอราคา</div>
    <div style="padding:16px 20px">
      <div style="font-size:14px;color:#333;margin-bottom:12px">แสดงผลจากฟอร์ม · สถานะ: ${LEAD_STATUS_LABELS[lead.status]}</div>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${fieldRow("ชื่อผู้ติดต่อ", lead.contactName)}
        ${fieldRow("ตำแหน่งงาน", lead.jobTitle)}
        ${fieldRow("เบอร์โทรศัพท์", lead.phone)}
        ${fieldRow("LINE ID", lead.lineId)}
        ${fieldRow("ประเภทผู้ติดต่อ", lead.contactType)}
        ${fieldRow("ชื่อธุรกิจ", lead.businessName)}
        ${fieldRow("ที่อยู่ สำหรับ ส่งของ หรือ ติดตั้ง", lead.installAddress)}
        ${fieldRow("เลขผู้เสียภาษี", lead.taxId)}
        ${fieldRow("E-mail", lead.email)}
        ${fieldRow("ที่อยู่ สำหรับ ออกใบเสนอราคา", lead.billingAddress)}
        ${fieldRow("ประเภทสินค้า", lead.productType)}
        ${fieldRow("ขนาดที่ต้องการ (กว้างxสูง)", lead.requestedSize)}
        ${fieldRow(
          "แนบภาพหน้างาน",
          lead.siteImageName ||
            (lead.siteImageUrls?.length
              ? `${lead.siteImageUrls.length} ไฟล์`
              : lead.siteImageUrl
                ? "มีไฟล์แนบ"
                : "No File Upload"),
        )}
        ${fieldRow("วันที่อยากติดตั้ง", lead.callbackDate)}
        ${fieldRow("หาเราเจอจากที่ไหน", lead.referralSource)}
        ${fieldRow("หมายเหตุ", lead.note)}
      </table>
      ${
        (lead.siteImageUrls?.length
          ? lead.siteImageUrls
          : lead.siteImageUrl
            ? [lead.siteImageUrl]
            : []
        ).length
          ? `<div style="margin-top:12px">${(
              lead.siteImageUrls?.length
                ? lead.siteImageUrls
                : lead.siteImageUrl
                  ? [lead.siteImageUrl]
                  : []
            )
              .map(
                (url, i) =>
                  `<a href="${escapeHtml(url)}" style="display:inline-block;margin:0 8px 8px 0;font-size:13px;color:#c8102e">รูปที่ ${i + 1}</a>`,
              )
              .join("")}</div>`
          : ""
      }
      <p style="margin-top:16px;font-size:12px;color:#888">Lead ID: ${lead.id}</p>
    </div>
  </div>
</body></html>`;
}

export function buildCustomerReplyHtml(lead: QuoteLead) {
  return `<!doctype html>
<html><body style="font-family:Sarabun,Arial,sans-serif;background:#f7f7f7;padding:24px">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
    <div style="background:#0b1f3a;color:#fff;padding:16px 20px;font-size:20px;font-weight:700">ช่างตี๋ ผ้าม่าน</div>
    <div style="padding:20px;font-size:15px;line-height:1.7;color:#222">
      <p>เรียนคุณ ${escapeHtml(lead.contactName)}</p>
      <p>เราได้รับคำขอใบเสนอราคาของท่านเรียบร้อยแล้ว ทีมงานจะตรวจสอบข้อมูลและติดต่อกลับโดยเร็วที่สุด ผ่านอีเมลหรือช่องทางที่ท่านให้ไว้</p>
      <p><strong>สรุปคำขอ</strong><br/>
      ประเภทสินค้า: ${escapeHtml(lead.productType || "-")}<br/>
      เบอร์โทร: ${escapeHtml(lead.phone)}<br/>
      อีเมล: ${escapeHtml(lead.email)}</p>
      <p>หากต้องการพูดคุยด่วน ทัก LINE ได้ที่
      <a href="${siteConfig.lineUrl}">${siteConfig.lineId}</a>
      หรือเปิดลิงก์ ${siteConfig.lineUrl}</p>
      <p style="margin-top:24px">ขอบคุณที่ไว้วางใจ<br/>ทีมงานช่างตี๋ ผ้าม่าน</p>
    </div>
  </div>
</body></html>`;
}

export async function sendQuoteEmails(lead: QuoteLead) {
  const { transporter, from, adminTo } = getTransport();
  const results: Array<{ channel: string; ok: boolean; error?: string }> = [];

  try {
    await transporter.sendMail({
      from,
      to: adminTo,
      replyTo: lead.email,
      subject: `[ขอใบเสนอราคา] ${lead.contactName} · ${lead.productType}`,
      html: buildAdminSummaryHtml(lead),
    });
    results.push({ channel: "admin-email", ok: true });
  } catch (err) {
    results.push({
      channel: "admin-email",
      ok: false,
      error: err instanceof Error ? err.message : "admin email failed",
    });
  }

  try {
    await transporter.sendMail({
      from,
      to: lead.email,
      replyTo: adminTo,
      subject: "รับเรื่องขอใบเสนอราคา — ช่างตี๋ ผ้าม่าน",
      html: buildCustomerReplyHtml(lead),
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
