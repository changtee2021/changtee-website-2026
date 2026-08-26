import nodemailer from "nodemailer";
import type { QuoteLead } from "@/lib/leads/types";
import { LEAD_STATUS_LABELS } from "@/lib/leads/types";
import {
  attachmentGallery,
  escapeHtml,
  fieldLinkRow,
  fieldRow,
  fieldSection,
  fieldSectionPair,
  fieldStackRow,
  isImageAttachment,
  wrapCustomerEmail,
  wrapNoticeEmail,
  type EmailAttachmentView,
} from "@/lib/email/layout";
import { siteConfig } from "@/lib/site-config";
import {
  isDirectMediaUrl,
  isStorageRef,
  leadImageRefs,
  storagePathFromRef,
} from "@/lib/security/lead-media";
import { isVideoMediaName } from "@/lib/leads/site-media";
import { createSignedUploadUrl, downloadStoredFile } from "@/lib/storage/upload";

type QuoteMailFile = EmailAttachmentView & {
  bytes?: Buffer;
  contentType?: string;
};

export { escapeHtml, fieldRow };

export function getTransport() {
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

function contactMessage(lead: QuoteLead) {
  return (lead.note || "").replace(/^เรื่องที่ติดต่อ:[^\n]*\n*/u, "").trim();
}

function quoteFileNames(lead: QuoteLead) {
  return (lead.siteImageName || "")
    .split(" · ")
    .map((name) => name.trim())
    .filter(Boolean);
}

function absoluteMediaUrl(url: string) {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${siteConfig.url.replace(/\/$/, "")}${url.startsWith("/") ? url : `/${url}`}`;
}

async function readLocalUpload(url: string) {
  if (!url.startsWith("/uploads/")) return null;
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    return await fs.readFile(path.join(process.cwd(), "public", url));
  } catch {
    return null;
  }
}

export async function resolveQuoteAttachments(lead: QuoteLead): Promise<QuoteMailFile[]> {
  const refs = leadImageRefs(lead);
  const names = quoteFileNames(lead);
  const files = await Promise.all(
    refs.map(async (ref, index) => {
      const name = names[index] || `ไฟล์ที่ ${index + 1}`;
      if (isStorageRef(ref)) {
        const storagePath = storagePathFromRef(ref);
        const skipDownload = isVideoMediaName(name) || isVideoMediaName(storagePath);
        const [url, downloaded] = await Promise.all([
          createSignedUploadUrl(storagePath, 60 * 60 * 24 * 7),
          skipDownload ? Promise.resolve(null) : downloadStoredFile(storagePath),
        ]);
        return {
          name,
          url: url || "",
          bytes: downloaded?.bytes,
          contentType: downloaded?.contentType,
        };
      }
      if (isDirectMediaUrl(ref)) {
        const url = absoluteMediaUrl(ref);
        const bytes = await readLocalUpload(ref);
        return { name, url, bytes: bytes || undefined };
      }
      return { name, url: ref };
    }),
  );

  return files.map((file, index) => {
    const canInline =
      Boolean(file.bytes) &&
      file.bytes!.length <= 4.5 * 1024 * 1024 &&
      isImageAttachment(file.name, file.url);
    return {
      ...file,
      cid: canInline ? `site-${index}@changtee.email` : undefined,
    };
  });
}

function leadNoticeCopy(lead: QuoteLead) {
  if (lead.source === "contact") {
    return {
      title: "ข้อความติดต่อใหม่",
      subtitle: "จากฟอร์มติดต่อบริษัท",
      subject: `[ติดต่อบริษัท] ${lead.contactName} · ${lead.productType}`,
      customerSubject: "รับเรื่องติดต่อแล้ว — ช่างตี๋ ผ้าม่าน",
      customerIntro:
        "เราได้รับข้อความของท่านเรียบร้อยแล้ว ทีมงานจะอ่านรายละเอียดและติดต่อกลับโดยเร็วที่สุด ผ่านอีเมลหรือช่องทางที่ท่านให้ไว้",
    };
  }
  if (lead.source === "fab") {
    return {
      title: "คำขอจากปุ่มติดต่อด่วน",
      subtitle: "จากปุ่มติดต่อบนเว็บไซต์",
      subject: `[ติดต่อด่วน] ${lead.contactName} · ${lead.productType}`,
      customerSubject: "รับเรื่องติดต่อแล้ว — ช่างตี๋ ผ้าม่าน",
      customerIntro:
        "เราได้รับคำขอของท่านเรียบร้อยแล้ว ทีมงานจะติดต่อกลับโดยเร็วที่สุด ผ่านอีเมลหรือช่องทางที่ท่านให้ไว้",
    };
  }
  return {
    title: "ขอใบเสนอราคา",
    subtitle: `แสดงผลจากฟอร์ม · สถานะ: ${LEAD_STATUS_LABELS[lead.status]}`,
    subject: `[ขอใบเสนอราคา] ${lead.contactName} · ${lead.productType}`,
    customerSubject: "รับเรื่องขอใบเสนอราคา — ช่างตี๋ ผ้าม่าน",
    customerIntro:
      "เราได้รับคำขอใบเสนอราคาของท่านเรียบร้อยแล้ว ทีมงานจะตรวจสอบข้อมูลและติดต่อกลับโดยเร็วที่สุด ผ่านอีเมลหรือช่องทางที่ท่านให้ไว้",
  };
}

export function buildAdminSummaryHtml(
  lead: QuoteLead,
  attachments: EmailAttachmentView[] = [],
) {
  const copy = leadNoticeCopy(lead);

  if (lead.source === "contact") {
    return wrapNoticeEmail({
      title: copy.title,
      subtitle: copy.subtitle,
      accent: "red",
      body: `${fieldSection(
        "ผู้ติดต่อ",
        `${fieldRow("ชื่อผู้ติดต่อ", lead.contactName)}${fieldRow("ตำแหน่งงาน", lead.jobTitle)}${fieldRow("เบอร์โทรศัพท์", lead.phone)}${fieldRow("LINE ID", lead.lineId)}${fieldRow("E-mail", lead.email)}`,
      )}${fieldSection(
        "บริษัท",
        `${fieldRow("ชื่อบริษัท / องค์กร", lead.businessName)}${fieldRow("ประเภทผู้ติดต่อ", lead.contactType)}`,
      )}${fieldSection(
        "เรื่องที่ติดต่อ",
        `${fieldRow("หัวข้อ", lead.productType)}${fieldRow("ข้อความ", contactMessage(lead) || lead.note)}`,
      )}`,
      footer: `Lead ID: ${lead.id}`,
    });
  }

  if (lead.source === "fab") {
    return wrapNoticeEmail({
      title: copy.title,
      subtitle: copy.subtitle,
      accent: "red",
      body: `${fieldSection(
        "ผู้ติดต่อ",
        `${fieldRow("ชื่อ-นามสกุล", lead.contactName)}${fieldRow("เบอร์โทรศัพท์", lead.phone)}${fieldRow("LINE ID", lead.lineId)}${fieldRow("E-mail", lead.email)}`,
      )}${fieldSection(
        "สิ่งที่สนใจ",
        `${fieldRow("สินค้าที่สนใจ", lead.productType)}${fieldRow("รายละเอียดเพิ่มเติม", lead.note)}`,
      )}`,
      footer: `Lead ID: ${lead.id}`,
    });
  }

  const files = attachments.length
    ? attachments
    : quoteFileNames(lead).map((name) => ({ name, url: lead.siteImageUrl }));
  return wrapNoticeEmail({
    title: copy.title,
    subtitle: copy.subtitle,
    accent: "red",
    body: `${fieldSectionPair(
      fieldSection(
        "ผู้ติดต่อ",
        `${fieldStackRow("ชื่อผู้ติดต่อ", lead.contactName)}${fieldStackRow("ตำแหน่งงาน", lead.jobTitle)}${fieldStackRow("เบอร์โทรศัพท์", lead.phone)}${fieldStackRow("LINE ID", lead.lineId)}${fieldStackRow("E-mail", lead.email)}${fieldStackRow("ประเภทผู้ติดต่อ", lead.contactType)}`,
        { flush: true },
      ),
      fieldSection(
        "ธุรกิจและที่อยู่",
        `${fieldStackRow("ชื่อธุรกิจ", lead.businessName)}${fieldStackRow("เลขผู้เสียภาษี", lead.taxId)}${fieldStackRow("ที่อยู่ติดตั้ง / ส่งของ", lead.installAddress)}${fieldStackRow("ที่อยู่ออกใบเสนอราคา", lead.billingAddress)}`,
        { flush: true },
      ),
    )}${fieldSection(
      "งานที่ต้องการ",
      `${fieldRow("ประเภทสินค้า", lead.productType)}${fieldRow("ขนาดที่ต้องการ (กว้าง×สูง)", lead.requestedSize)}${fieldRow("วันที่อยากติดตั้ง", lead.callbackDate)}${fieldLinkRow("แนบภาพหน้างาน", files)}${fieldRow("หาเราเจอจากที่ไหน", lead.referralSource)}`,
    )}${attachmentGallery(files)}${fieldSection("หมายเหตุ", fieldRow("รายละเอียดเพิ่มเติม", lead.note))}`,
    footer: `Lead ID: ${lead.id}`,
  });
}

export function buildCustomerReplyHtml(lead: QuoteLead) {
  const copy = leadNoticeCopy(lead);
  const channels = fieldSection(
    "ช่องทางที่ท่านให้ไว้",
    `${fieldRow("เบอร์โทรศัพท์", lead.phone)}${fieldRow("E-mail", lead.email)}${fieldRow("LINE ID", lead.lineId)}`,
  );

  if (lead.source === "contact") {
    return wrapCustomerEmail({
      title: "รับข้อความของท่านแล้ว",
      subtitle: "ทีมงานจะอ่านรายละเอียดและติดต่อกลับ",
      greetingName: lead.contactName,
      intro: copy.customerIntro,
      nextStep: "ทีมงานจะติดต่อกลับผ่านอีเมล โทรศัพท์ หรือ LINE ภายใน 1 วันทำการ",
      summary: `${fieldSection(
        "เรื่องที่ติดต่อ",
        `${fieldRow("หัวข้อ", lead.productType)}${fieldRow("ข้อความ", contactMessage(lead) || lead.note)}`,
      )}${channels}`,
      signOff: "ขอบคุณที่ติดต่อเรา<br/>ทีมงานช่างตี๋ ผ้าม่าน",
    });
  }

  if (lead.source === "fab") {
    return wrapCustomerEmail({
      title: "รับคำขอติดต่อแล้ว",
      subtitle: "จากปุ่มติดต่อบนเว็บไซต์",
      greetingName: lead.contactName,
      intro: copy.customerIntro,
      nextStep: "ทีมงานจะติดต่อกลับผ่านอีเมล โทรศัพท์ หรือ LINE โดยเร็วที่สุด",
      summary: `${fieldSection(
        "สิ่งที่สนใจ",
        `${fieldRow("สินค้าที่สนใจ", lead.productType)}${fieldRow("รายละเอียดเพิ่มเติม", lead.note)}`,
      )}${channels}`,
      signOff: "ขอบคุณที่ติดต่อเรา<br/>ทีมงานช่างตี๋ ผ้าม่าน",
    });
  }

  return wrapCustomerEmail({
    title: "รับเรื่องขอใบเสนอราคาแล้ว",
    subtitle: "เราจะจัดทำใบเสนอราคาให้ท่านโดยเร็ว",
    greetingName: lead.contactName,
    intro: copy.customerIntro,
    nextStep: "ทีมงานจะตรวจข้อมูลหน้างาน แล้วติดต่อกลับพร้อมใบเสนอราคา",
    summary: `${fieldSection(
      "งานที่ขอใบเสนอราคา",
      `${fieldRow("ประเภทสินค้า", lead.productType)}${fieldRow("ขนาดที่ต้องการ", lead.requestedSize)}${fieldRow("วันที่อยากติดตั้ง", lead.callbackDate)}`,
    )}${channels}`,
    signOff: "ขอบคุณที่ไว้วางใจ<br/>ทีมงานช่างตี๋ ผ้าม่าน",
  });
}

export async function sendQuoteEmails(lead: QuoteLead) {
  const { transporter, from, adminTo } = getTransport();
  const results: Array<{ channel: string; ok: boolean; error?: string }> = [];
  const attachments = await resolveQuoteAttachments(lead);
  const customerEmail = lead.email.trim();

  try {
    await transporter.sendMail({
      from,
      to: adminTo,
      ...(customerEmail ? { replyTo: customerEmail } : {}),
      subject: leadNoticeCopy(lead).subject,
      html: buildAdminSummaryHtml(lead, attachments),
      attachments: attachments
        .filter((file) => file.bytes?.length)
        .map((file) => ({
          filename: file.name,
          content: file.bytes,
          contentType: file.contentType,
          cid: file.cid || undefined,
          contentDisposition: file.cid ? "inline" : "attachment",
        })),
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
      subject: leadNoticeCopy(lead).customerSubject,
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
