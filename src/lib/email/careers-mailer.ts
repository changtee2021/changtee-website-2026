import { escapeHtml, fieldRow, getTransport } from "@/lib/email/mailer";
import { siteConfig } from "@/lib/site-config";
import type { JobApplication } from "@/lib/careers/types";

function buildHrApplicationHtml(
  application: JobApplication,
  resumeUrl: string | null,
) {
  return `<!doctype html>
<html><body style="font-family:Sarabun,Arial,sans-serif;background:#f7f7f7;padding:24px">
  <div style="max-width:720px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
    <div style="background:#c8102e;color:#fff;padding:16px 20px;font-size:20px;font-weight:700">📄 ใบสมัครงานใหม่</div>
    <div style="padding:16px 20px">
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${fieldRow("ตำแหน่งที่สนใจ", application.jobTitle || "สมัครทั่วไป (ยังไม่มีตำแหน่งเปิดรับ)")}
        ${fieldRow("ชื่อ-นามสกุล", application.fullName)}
        ${fieldRow("เบอร์โทรศัพท์", application.phone)}
        ${fieldRow("LINE ID", application.lineId)}
        ${fieldRow("E-mail", application.email)}
        ${fieldRow("ที่อยู่/จังหวัด", application.address)}
        ${fieldRow("ระดับการศึกษา", application.education)}
        ${fieldRow("ประสบการณ์ทำงาน", application.experienceNote)}
        ${fieldRow("เงินเดือนที่คาดหวัง", application.expectedSalary)}
        ${fieldRow("วันที่พร้อมเริ่มงาน", application.availableFrom)}
        ${fieldRow("ข้อความจากผู้สมัคร", application.coverNote)}
        ${fieldRow("ไฟล์เรซูเม่", application.resumeFileName || "ไม่ได้แนบไฟล์")}
      </table>
      ${
        resumeUrl
          ? `<p style="margin-top:12px"><a href="${escapeHtml(resumeUrl)}" style="color:#c8102e;font-weight:600">ดาวน์โหลดเรซูเม่ (ลิงก์หมดอายุใน 7 วัน)</a></p>`
          : ""
      }
      <p style="margin-top:16px;font-size:12px;color:#888">Application ID: ${application.id}</p>
    </div>
  </div>
</body></html>`;
}

function buildCandidateReplyHtml(application: JobApplication) {
  return `<!doctype html>
<html><body style="font-family:Sarabun,Arial,sans-serif;background:#f7f7f7;padding:24px">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
    <div style="background:#0b1f3a;color:#fff;padding:16px 20px;font-size:20px;font-weight:700">ช่างตี๋ ผ้าม่าน</div>
    <div style="padding:20px;font-size:15px;line-height:1.7;color:#222">
      <p>เรียนคุณ ${escapeHtml(application.fullName)}</p>
      <p>เราได้รับใบสมัครงานของคุณ${application.jobTitle ? ` ในตำแหน่ง <strong>${escapeHtml(application.jobTitle)}</strong>` : ""}เรียบร้อยแล้ว</p>
      <p>ทีมงานฝ่ายบุคคลจะพิจารณาข้อมูลของคุณ และจะติดต่อกลับหากคุณสมบัติตรงกับตำแหน่งที่เปิดรับในขณะนี้หรือในอนาคต</p>
      <p>หากต้องการสอบถามเพิ่มเติม ทัก LINE ได้ที่
      <a href="${siteConfig.lineUrl}">${siteConfig.lineId}</a></p>
      <p style="margin-top:24px">ขอบคุณที่สนใจร่วมงานกับเรา<br/>ฝ่ายบุคคล ช่างตี๋ ผ้าม่าน</p>
    </div>
  </div>
</body></html>`;
}

export async function sendJobApplicationEmails(
  application: JobApplication,
  resumeUrl: string | null,
) {
  const { transporter, from, adminTo } = getTransport();
  const hrTo = process.env.HR_EMAIL_TO?.trim() || adminTo;
  const results: Array<{ channel: string; ok: boolean; error?: string }> = [];
  const candidateEmail = application.email?.trim();

  try {
    await transporter.sendMail({
      from,
      to: hrTo,
      ...(candidateEmail ? { replyTo: candidateEmail } : {}),
      subject: `[ใบสมัครงาน] ${application.jobTitle || "สมัครทั่วไป"} · ${application.fullName}`,
      html: buildHrApplicationHtml(application, resumeUrl),
    });
    results.push({ channel: "hr-email", ok: true });
  } catch (err) {
    results.push({
      channel: "hr-email",
      ok: false,
      error: err instanceof Error ? err.message : "hr email failed",
    });
  }

  if (!candidateEmail) return results;

  try {
    await transporter.sendMail({
      from,
      to: candidateEmail,
      replyTo: hrTo,
      subject: "รับใบสมัครงานแล้ว — ช่างตี๋ ผ้าม่าน",
      html: buildCandidateReplyHtml(application),
    });
    results.push({ channel: "candidate-email", ok: true });
  } catch (err) {
    results.push({
      channel: "candidate-email",
      ok: false,
      error: err instanceof Error ? err.message : "candidate email failed",
    });
  }

  return results;
}
