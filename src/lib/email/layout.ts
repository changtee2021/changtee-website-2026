import { siteConfig } from "@/lib/site-config";

export function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatFieldValue(value: string) {
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return `<a href="mailto:${escapeHtml(value)}" style="color:#c8102e;font-weight:700;text-decoration:underline">${escapeHtml(value)}</a>`;
  }
  if (/^[0-9+\-\s()]{9,20}$/.test(value)) {
    const tel = value.replace(/[^\d+]/g, "");
    return `<a href="tel:${escapeHtml(tel)}" style="color:#111827;font-weight:600;text-decoration:none">${escapeHtml(value)}</a>`;
  }
  return escapeHtml(value);
}

export function fieldRow(label: string, value?: string | null) {
  const v = value?.trim() ? value.trim() : "-";
  return `<tr>
    <td style="padding:9px 0;border-bottom:1px solid #f0eee9;color:#6b7280;width:38%;vertical-align:top;font-size:13px">${escapeHtml(label)}</td>
    <td style="padding:9px 0 9px 12px;border-bottom:1px solid #f0eee9;color:#111827;vertical-align:top;font-size:14px;font-weight:600">${formatFieldValue(v)}</td>
  </tr>`;
}

export function fieldLinkRow(
  label: string,
  files: Array<{ name: string; href?: string | null; url?: string | null }>,
) {
  if (!files.length) return fieldRow(label, "ไม่ได้แนบไฟล์");
  const value = files
    .map((file) => {
      const name = file.name.trim() || "ไฟล์แนบ";
      const href = file.href?.trim() || file.url?.trim();
      if (!href) return escapeHtml(name);
      return `<a href="${escapeHtml(href)}" style="color:#c8102e;font-weight:700;text-decoration:underline">${escapeHtml(name)}</a>`;
    })
    .join("<br/>");
  return `<tr>
    <td style="padding:9px 0;border-bottom:1px solid #f0eee9;color:#6b7280;width:38%;vertical-align:top;font-size:13px">${escapeHtml(label)}</td>
    <td style="padding:9px 0 9px 12px;border-bottom:1px solid #f0eee9;vertical-align:top;font-size:14px;font-weight:600">${value}</td>
  </tr>`;
}

export function isImageAttachment(name: string, url?: string | null) {
  const target = `${name} ${url || ""}`;
  return /\.(jpe?g|png|gif|webp|bmp)(\?|#|$)/i.test(target);
}

export type EmailAttachmentView = {
  name: string;
  url?: string | null;
  cid?: string | null;
};

export function attachmentGallery(files: EmailAttachmentView[]) {
  if (!files.length) return "";
  const cells = files.map((file) => {
    const src = file.cid ? `cid:${file.cid}` : file.url || "";
    const preview = isImageAttachment(file.name, file.url) && src
      ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(file.name)}" width="260" style="display:block;width:100%;max-width:260px;height:auto;border-radius:8px;border:1px solid #ece7df" />`
      : `<div style="padding:22px 12px;background:#fff;border:1px dashed #d6d3cd;border-radius:8px;text-align:center;color:#6b7280;font-size:13px">ไฟล์แนบ</div>`;
    const link = file.url
      ? `<a href="${escapeHtml(file.url)}" style="color:#c8102e;font-weight:700;font-size:13px;text-decoration:underline">ดาวน์โหลด ${escapeHtml(file.name)}</a>`
      : `<span style="color:#111827;font-size:13px">${escapeHtml(file.name)}</span>`;
    return `<td style="padding:0 10px 12px 0;width:50%;vertical-align:top">${preview}<div style="margin-top:8px;line-height:1.5">${link}</div></td>`;
  });
  const rows: string[] = [];
  for (let i = 0; i < cells.length; i += 2) {
    rows.push(`<tr>${cells[i]}${cells[i + 1] || "<td></td>"}</tr>`);
  }
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;background:#faf9f7;border:1px solid #efeae3;border-radius:10px">
    <tr>
      <td style="padding:12px 16px 4px;font-size:12px;letter-spacing:.04em;color:#0b1f3a;font-weight:800;border-bottom:1px solid #efeae3">
        <span style="display:inline-block;width:8px;height:8px;background:#c8102e;border-radius:99px;margin-right:8px;vertical-align:middle"></span>ไฟล์แนบจากลูกค้า
      </td>
    </tr>
    <tr>
      <td style="padding:12px 16px 4px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows.join("")}</table>
      </td>
    </tr>
  </table>`;
}

export function fieldSection(title: string, rows: string) {
  if (!rows.trim()) return "";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;background:#faf9f7;border:1px solid #efeae3;border-radius:10px">
    <tr>
      <td style="padding:12px 16px 4px;font-size:12px;letter-spacing:.04em;color:#0b1f3a;font-weight:800;border-bottom:1px solid #efeae3">
        <span style="display:inline-block;width:8px;height:8px;background:#c8102e;border-radius:99px;margin-right:8px;vertical-align:middle"></span>${escapeHtml(title)}
      </td>
    </tr>
    <tr>
      <td style="padding:4px 16px 8px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
      </td>
    </tr>
  </table>`;
}

export function wrapNoticeEmail(opts: {
  title: string;
  subtitle?: string;
  accent?: "red" | "navy";
  body: string;
  footer?: string;
}) {
  const accent = opts.accent === "navy" ? "#0b1f3a" : "#c8102e";
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f3f1ec;font-family:Sarabun,Tahoma,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f1ec;padding:28px 12px">
    <tr>
      <td align="center">
        <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #ece7df">
          <tr>
            <td style="background:${accent};padding:22px 24px 18px">
              <div style="font-size:11px;letter-spacing:.14em;color:rgba(255,255,255,.75);font-weight:700">CHANG TEE CURTAIN</div>
              <div style="font-size:22px;line-height:1.3;color:#fff;font-weight:800;margin-top:4px">${escapeHtml(opts.title)}</div>
              ${
                opts.subtitle
                  ? `<div style="font-size:13px;color:rgba(255,255,255,.88);margin-top:6px">${escapeHtml(opts.subtitle)}</div>`
                  : ""
              }
            </td>
          </tr>
          <tr>
            <td style="padding:22px 24px 8px">${opts.body}</td>
          </tr>
          ${
            opts.footer
              ? `<tr><td style="padding:4px 24px 22px;font-size:12px;color:#9ca3af">${opts.footer}</td></tr>`
              : ""
          }
        </table>
      </td>
    </tr>
  </table>
</body></html>`;
}

export function nextStepBanner(text: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;background:#eef6f0;border:1px solid #cde5d4;border-radius:10px">
    <tr>
      <td style="padding:14px 16px">
        <div style="font-size:11px;letter-spacing:.08em;color:#166534;font-weight:800">ขั้นตอนถัดไป</div>
        <div style="font-size:14px;line-height:1.65;color:#14532d;margin-top:4px">${escapeHtml(text)}</div>
      </td>
    </tr>
  </table>`;
}

export function wrapCustomerEmail(opts: {
  title: string;
  subtitle?: string;
  greetingName: string;
  intro: string;
  nextStep?: string;
  summary?: string;
  signOff?: string;
}) {
  const lineUrl = siteConfig.lineUrl;
  const lineId = siteConfig.lineId;
  const phone = siteConfig.phoneDisplay;
  const phoneTel = siteConfig.phoneTel;
  const address = `${siteConfig.address.line1} ${siteConfig.address.line2} ${siteConfig.address.city}`;

  return wrapNoticeEmail({
    title: opts.title,
    subtitle: opts.subtitle || "ช่างตี๋ ผ้าม่าน — เราได้รับเรื่องของท่านแล้ว",
    accent: "navy",
    body: `
      <p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:#111827;font-weight:700">เรียนคุณ ${escapeHtml(opts.greetingName)}</p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.75;color:#374151">${opts.intro}</p>
      ${opts.nextStep ? nextStepBanner(opts.nextStep) : ""}
      ${opts.summary || ""}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 18px;background:#0b1f3a;border-radius:12px">
        <tr>
          <td style="padding:18px 16px" align="center">
            <div style="font-size:13px;color:rgba(255,255,255,.82);margin-bottom:10px">ต้องการคุยด่วน? ทัก LINE หรือโทรหาเรา</div>
            <a href="${escapeHtml(lineUrl)}" style="display:inline-block;background:#c8102e;color:#ffffff;text-decoration:none;font-weight:800;font-size:14px;padding:12px 22px;border-radius:999px">ทัก LINE ${escapeHtml(lineId)}</a>
            <div style="margin-top:12px;font-size:13px;color:rgba(255,255,255,.88)">
              หรือโทร <a href="tel:${escapeHtml(phoneTel)}" style="color:#ffffff;font-weight:700;text-decoration:none">${escapeHtml(phone)}</a>
            </div>
          </td>
        </tr>
      </table>
      <p style="margin:0;font-size:15px;line-height:1.7;color:#374151">${opts.signOff || "ขอบคุณที่ไว้วางใจ<br/>ทีมงานช่างตี๋ ผ้าม่าน"}</p>
    `,
    footer: `${escapeHtml(address)} · ${escapeHtml(siteConfig.hours)}`,
  });
}
