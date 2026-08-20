import { getTransport } from "@/lib/email/mailer";
import {
  attachmentGallery,
  escapeHtml,
  fieldLinkRow,
  fieldRow,
  fieldSection,
  wrapCustomerEmail,
  wrapNoticeEmail,
} from "@/lib/email/layout";
import type { JobApplication } from "@/lib/careers/types";

export function buildHrApplicationHtml(
  application: JobApplication,
  resumeUrl: string | null,
) {
  const resumeFiles = application.resumeFileName
    ? [{ name: application.resumeFileName, url: resumeUrl }]
    : [];
  const portfolioFiles = (application.portfolioFiles || []).map((file) => ({
    name: file.name,
    url: file.signedUrl || null,
  }));
  const files = [...resumeFiles, ...portfolioFiles];
  return wrapNoticeEmail({
    title: "ใบสมัครงานใหม่",
    subtitle: application.jobTitle
      ? `ตำแหน่ง: ${application.jobTitle}`
      : "สมัครทั่วไป — ยังไม่มีตำแหน่งเปิดรับ",
    accent: "red",
    body: `${fieldSection(
      "ตำแหน่งที่สมัคร",
      fieldRow(
        "ตำแหน่งที่สนใจ",
        application.jobTitle || "สมัครทั่วไป (ยังไม่มีตำแหน่งเปิดรับ)",
      ),
    )}${fieldSection(
      "ข้อมูลผู้สมัคร",
      `${fieldRow("ชื่อ-นามสกุล", application.fullName)}${fieldRow("เบอร์โทรศัพท์", application.phone)}${fieldRow("LINE ID", application.lineId)}${fieldRow("E-mail", application.email)}${fieldRow("ที่อยู่/จังหวัด", application.address)}`,
    )}${fieldSection(
      "ประวัติการศึกษาและงาน",
      `${fieldRow("ระดับการศึกษา", application.education)}${fieldRow("ประสบการณ์ทำงาน", application.experienceNote)}`,
    )}${fieldSection(
      "รายละเอียดเพิ่มเติม",
      `${fieldRow("เงินเดือนที่คาดหวัง", application.expectedSalary)}${fieldRow("วันที่พร้อมเริ่มงาน", application.availableFrom)}${fieldRow("ข้อความจากผู้สมัคร", application.coverNote)}${fieldLinkRow("ไฟล์เรซูเม่", resumeFiles)}${portfolioFiles.length ? fieldLinkRow("ผลงานเพิ่มเติม", portfolioFiles) : ""}`,
    )}${attachmentGallery(files)}`,
    footer: `Application ID: ${application.id}`,
  });
}

export function buildCandidateReplyHtml(application: JobApplication) {
  return wrapCustomerEmail({
    title: "รับใบสมัครงานแล้ว",
    subtitle: application.jobTitle
      ? `ตำแหน่ง ${application.jobTitle}`
      : "สมัครทั่วไป — ยังไม่มีตำแหน่งเปิดรับ",
    greetingName: application.fullName,
    intro: `เราได้รับใบสมัครงานของคุณ${application.jobTitle ? ` ในตำแหน่ง <strong>${escapeHtml(application.jobTitle)}</strong>` : ""}เรียบร้อยแล้ว ทีมงานฝ่ายบุคคลจะพิจารณาข้อมูล และจะติดต่อกลับหากคุณสมบัติตรงกับตำแหน่งที่เปิดรับ`,
    nextStep: "ฝ่ายบุคคลจะติดต่อกลับเฉพาะเมื่อคุณสมบัติตรงกับตำแหน่งที่เปิดรับ",
    summary: `${fieldSection(
      "สรุปใบสมัคร",
      `${fieldRow("ตำแหน่ง", application.jobTitle || "สมัครทั่วไป")}${fieldRow("ระดับการศึกษา", application.education)}${fieldRow("วันที่พร้อมเริ่มงาน", application.availableFrom)}`,
    )}${fieldSection(
      "ช่องทางที่ท่านให้ไว้",
      `${fieldRow("เบอร์โทรศัพท์", application.phone)}${fieldRow("E-mail", application.email)}${fieldRow("LINE ID", application.lineId)}`,
    )}`,
    signOff: "ขอบคุณที่สนใจร่วมงานกับเรา<br/>ฝ่ายบุคคล ช่างตี๋ ผ้าม่าน",
  });
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
