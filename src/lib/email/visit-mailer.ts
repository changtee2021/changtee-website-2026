import { getTransport } from "@/lib/email/mailer";
import {
  attachmentGallery,
  fieldLinkRow,
  fieldRow,
  fieldSection,
  wrapCustomerEmail,
  wrapNoticeEmail,
} from "@/lib/email/layout";
import { isStorageRef, storagePathFromRef } from "@/lib/security/lead-media";
import { createSignedUploadUrl } from "@/lib/storage/upload";
import {
  formatVisitSites,
  VISIT_SESSION_LABELS,
  type FactoryVisitBooking,
} from "@/lib/visits/types";
import {
  PRESENTATION_VENUE_LABELS,
  type PresentationVenueId,
} from "@/lib/visits/presentation";
import { isPresentationKind } from "@/lib/visits/modes";

function venueText(visit: FactoryVisitBooking) {
  if (isPresentationKind(visit.bookingKind) && visit.presentationVenue) {
    const label =
      PRESENTATION_VENUE_LABELS[visit.presentationVenue as PresentationVenueId] ||
      visit.presentationVenue;
    return visit.venueAddress ? `${label} · ${visit.venueAddress}` : label;
  }
  return formatVisitSites(visit.visitSites);
}

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

export function buildAdminVisitHtml(visit: FactoryVisitBooking) {
  const presentation = isPresentationKind(visit.bookingKind);
  return wrapNoticeEmail({
    title: presentation ? "คำขอนัดนำเสนอสินค้า" : "คำขอนัดเยี่ยมชมโรงงาน",
    subtitle: "กรุณายืนยันหรือปฏิเสธการนัดกับลูกค้าโดยเร็ว",
    accent: "navy",
    body: `${fieldSection(
      "นัดหมาย",
      `${fieldRow("ประเภท", presentation ? "นัดนำเสนอสินค้า" : "นัดเยี่ยมชมโรงงาน")}${fieldRow("วันที่ต้องการ", formatVisitDate(visit.visitDate))}${fieldRow("รอบ", VISIT_SESSION_LABELS[visit.session])}${fieldRow("สถานที่นัด", venueText(visit))}${fieldRow("จำนวนผู้เข้าร่วม", String(visit.visitorCount))}`,
    )}${fieldSection(
      "ผู้ติดต่อ",
      `${fieldRow("ชื่อผู้ติดต่อ", visit.fullName)}${fieldRow("ตำแหน่ง", visit.contactPosition)}${fieldRow("ฝ่าย / แผนก", visit.department)}${fieldRow("เบอร์โทรศัพท์", visit.phone)}${fieldRow("LINE ID", visit.lineId)}${fieldRow("E-mail", visit.email)}`,
    )}${fieldSection(
      "บริษัท / องค์กร",
      `${fieldRow("ชื่อบริษัท/องค์กร", visit.businessName)}${fieldRow("ประเภทนิติบุคคล", visit.legalEntityType)}${fieldRow(presentation ? "เลขทะเบียนนิติบุคคล" : "เลขนิติบุคคล / บัตรประชาชน", visit.taxId)}${fieldRow("ประเภทธุรกิจ", visit.industry)}${fieldRow("ที่อยู่สำนักงาน", visit.officeAddress)}`,
    )}${fieldSection(
      "งานที่สนใจ",
      `${fieldRow("วัตถุประสงค์", visit.purpose)}${fieldRow("สินค้าที่สนใจ", visit.productInterest)}${visit.jobType ? fieldRow("ประเภทงาน", visit.jobType) : ""}${visit.estimatedScope ? fieldRow("ขอบเขตคร่าว ๆ", visit.estimatedScope) : ""}${visit.decisionTimeline ? fieldRow("ช่วงตัดสินใจ", visit.decisionTimeline) : ""}`,
    )}${fieldSection(
      "เอกสารแนบ",
      `${fieldLinkRow("Company Profile", visit.companyProfileName ? [{ name: visit.companyProfileName, href: visit.companyProfileUrl }] : [])}${fieldLinkRow("นามบัตร", visit.businessCardName ? [{ name: visit.businessCardName, href: visit.businessCardUrl }] : [])}`,
    )}${attachmentGallery(
      [
        visit.companyProfileName
          ? { name: visit.companyProfileName, url: visit.companyProfileUrl }
          : null,
        visit.businessCardName
          ? { name: visit.businessCardName, url: visit.businessCardUrl }
          : null,
      ].filter((file): file is { name: string; url: string | null | undefined } => Boolean(file)),
    )}${fieldSection("หมายเหตุ", fieldRow("รายละเอียดเพิ่มเติม", visit.note))}`,
    footer: `Booking ID: ${visit.id}`,
  });
}

export function buildCustomerVisitHtml(visit: FactoryVisitBooking) {
  const presentation = isPresentationKind(visit.bookingKind);
  const kind = presentation ? "คำขอนัดนำเสนอสินค้า" : "คำขอนัดเยี่ยมชมโรงงาน";
  return wrapCustomerEmail({
    title: presentation ? "รับคำขอนัดนำเสนอสินค้าแล้ว" : "รับคำขอนัดเยี่ยมชมโรงงานแล้ว",
    subtitle: "รอทีมงานยืนยันวันเวลาให้อีกครั้ง",
    greetingName: visit.fullName,
    intro: `เราได้รับ${kind}ของท่านแล้ว ทีมงานจะติดต่อกลับเพื่อ<strong>ยืนยันวันเวลา</strong>ผ่านช่องทางที่ท่านให้ไว้ภายใน 1 วันทำการ`,
    nextStep: "นัดหมายนี้ยังไม่ยืนยันจนกว่าทีมงานจะติดต่อกลับ",
    summary: `${fieldSection(
      "สรุปนัดหมาย",
      `${fieldRow("วันที่ต้องการ", formatVisitDate(visit.visitDate))}${fieldRow("รอบ", VISIT_SESSION_LABELS[visit.session])}${fieldRow("สถานที่", venueText(visit))}${fieldRow("จำนวนผู้เข้าร่วม", `${visit.visitorCount} คน`)}`,
    )}${fieldSection(
      "ช่องทางที่ท่านให้ไว้",
      `${fieldRow("เบอร์โทรศัพท์", visit.phone)}${fieldRow("E-mail", visit.email)}${fieldRow("LINE ID", visit.lineId)}`,
    )}`,
    signOff: "ขอบคุณที่ให้ความสนใจ<br/>ทีมงานช่างตี๋ ผ้าม่าน",
  });
}

async function signVisitPath(path: string | null | undefined) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
    return path;
  }
  const storagePath = isStorageRef(path) ? storagePathFromRef(path) : path;
  return createSignedUploadUrl(storagePath, 60 * 60 * 24 * 7);
}

export async function sendFactoryVisitEmails(visit: FactoryVisitBooking) {
  const { transporter, from, adminTo } = getTransport();
  const results: Array<{ channel: string; ok: boolean; error?: string }> = [];
  const customerEmail = visit.email?.trim();
  const mailVisit: FactoryVisitBooking = {
    ...visit,
    companyProfileUrl:
      visit.companyProfileUrl || (await signVisitPath(visit.companyProfilePath)),
    businessCardUrl:
      visit.businessCardUrl || (await signVisitPath(visit.businessCardPath)),
  };

  try {
    await transporter.sendMail({
      from,
      to: adminTo,
      ...(customerEmail ? { replyTo: customerEmail } : {}),
      subject: `[${isPresentationKind(visit.bookingKind) ? "นัดนำเสนอสินค้า" : "นัดเยี่ยมชมโรงงาน"}] ${visit.fullName} · ${formatVisitDate(visit.visitDate)} ${VISIT_SESSION_LABELS[visit.session]}`,
      html: buildAdminVisitHtml(mailVisit),
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
      subject: isPresentationKind(visit.bookingKind)
        ? "รับคำขอนัดนำเสนอสินค้า — ช่างตี๋ ผ้าม่าน"
        : "รับคำขอนัดเยี่ยมชมโรงงาน — ช่างตี๋ ผ้าม่าน",
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
