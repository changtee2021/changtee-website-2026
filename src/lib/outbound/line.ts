/**
 * Shared LINE Messaging API push helper.
 * Reuses the same channel token as `src/lib/outbound/notify.ts` (sales notify)
 * but allows routing to a dedicated group per feature (visit / HR) when
 * `LINE_VISIT_TO_ID` / `LINE_HR_TO_ID` are set — falls back to `LINE_SALES_TO_ID`
 * so it works out of the box with a single existing LINE group.
 */

export function lineNotifyConfigured(): boolean {
  return Boolean(process.env.LINE_CHANNEL_ACCESS_TOKEN);
}

export type LineCardField = { label: string; value: string };

export type LineCard = {
  title: string;
  fields: LineCardField[];
  /** Shown only when set, for example a one-off test send. */
  badge?: string;
  link?: { label: string; url: string };
};

const CARD_NAVY = "#0B1F3A";
const CARD_RED = "#C0392B";

function clip(value: string, max: number) {
  const text = value.replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/** LINE Flex bubble used for every staff alert. */
export function lineCardMessage(card: LineCard) {
  const rows = card.fields
    .map((field) => ({
      label: clip(field.label, 20),
      value: clip(field.value, 80),
    }))
    .filter((field) => field.value);

  return {
    type: "flex" as const,
    altText: clip(card.title, 80),
    contents: {
      type: "bubble",
      size: "mega",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: CARD_NAVY,
        paddingAll: "16px",
        contents: [
          {
            type: "text",
            text: card.badge ? `ทดสอบ · ช่างตี๋ ผ้าม่าน` : "ช่างตี๋ ผ้าม่าน",
            color: card.badge ? "#F6C945" : "#F3D2D0",
            size: "xs",
            weight: card.badge ? "bold" : "regular",
          },
          {
            type: "text",
            text: clip(card.title, 40),
            color: "#FFFFFF",
            weight: "bold",
            size: "lg",
            wrap: true,
            margin: "sm",
          },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        paddingAll: "16px",
        contents: rows.map((field) => ({
          type: "box",
          layout: "baseline",
          spacing: "md",
          contents: [
            {
              type: "text",
              text: field.label,
              color: "#6B7280",
              size: "sm",
              flex: 2,
            },
            {
              type: "text",
              text: field.value,
              color: CARD_NAVY,
              size: "sm",
              flex: 5,
              wrap: true,
              weight: "bold",
            },
          ],
        })),
      },
      ...(card.link
        ? {
            footer: {
              type: "box",
              layout: "vertical",
              paddingAll: "12px",
              contents: [
                {
                  type: "button",
                  style: "link",
                  height: "sm",
                  color: CARD_RED,
                  action: {
                    type: "uri",
                    label: clip(card.link.label, 20),
                    uri: card.link.url,
                  },
                },
              ],
            },
          }
        : {}),
      styles: {
        header: { separator: false },
        body: { separator: true, separatorColor: CARD_RED },
      },
    },
  };
}

async function pushLinePayload(
  message: Record<string, unknown>,
  to?: string | null,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const target = to || process.env.LINE_SALES_TO_ID;
    if (!token || !target) {
      throw new Error("LINE credentials not configured");
    }

    const res = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ to: target, messages: [message] }),
    });

    if (!res.ok) throw new Error(`LINE HTTP ${res.status}`);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "LINE failed",
    };
  }
}

export async function pushLineMessage(
  text: string,
  to?: string | null,
): Promise<{ ok: boolean; error?: string }> {
  return pushLinePayload({ type: "text", text: text.slice(0, 4900) }, to);
}

export async function pushLineCard(
  card: LineCard,
  to?: string | null,
): Promise<{ ok: boolean; error?: string }> {
  return pushLinePayload(lineCardMessage(card), to);
}

/** Destination for factory-visit booking alerts (falls back to sales group). */
export function visitLineTarget(): string | undefined {
  return process.env.LINE_VISIT_TO_ID || process.env.LINE_SALES_TO_ID;
}

/** Destination for HR / job application alerts (falls back to sales group). */
export function hrLineTarget(): string | undefined {
  return process.env.LINE_HR_TO_ID || process.env.LINE_SALES_TO_ID;
}

const LEAD_SOURCE_LABELS: Record<string, string> = {
  quote: "ใบเสนอราคา",
  contact: "ติดต่อ",
  fab: "ปุ่มลัดติดต่อ",
  estimate: "ประเมินราคา",
};

function bangkokParts(iso: string) {
  const date = new Date(iso);
  return {
    dateText: new Intl.DateTimeFormat("th-TH", {
      timeZone: "Asia/Bangkok",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date),
    timeText: new Intl.DateTimeFormat("th-TH", {
      timeZone: "Asia/Bangkok",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(date),
  };
}

/** Opens Gmail search for the staff notice, where the full details live. */
export function gmailNoticeLink(subject: string) {
  return `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(`subject:${subject}`)}`;
}

/** Short staff card. Skips address and tax id — those stay in email and admin. */
export function leadLineCard(lead: {
  source: string;
  contactName: string;
  phone: string;
  lineId?: string | null;
  businessName?: string | null;
  productType?: string | null;
  requestedSize?: string | null;
  callbackDate?: string | null;
  note?: string | null;
  createdAt?: string | null;
  badge?: string;
}): LineCard {
  const title = LEAD_SOURCE_LABELS[lead.source] || lead.source;
  const note = lead.note?.replace(/\s+/g, " ").trim();
  const when = bangkokParts(lead.createdAt || new Date().toISOString());
  const subjectKind =
    lead.source === "contact"
      ? "ติดต่อบริษัท"
      : lead.source === "fab"
        ? "ติดต่อด่วน"
        : "ขอใบเสนอราคา";
  const subject = `[${subjectKind}] ${lead.contactName} · ${lead.productType || title}`;
  const fields: LineCardField[] = [
    { label: "วันที่", value: when.dateText },
    { label: "เวลา", value: when.timeText },
    {
      label: "ชื่อ",
      value: `${lead.contactName}${lead.businessName ? ` (${lead.businessName})` : ""}`,
    },
    { label: "โทร", value: lead.phone },
  ];
  if (lead.lineId) fields.push({ label: "LINE", value: lead.lineId });
  if (lead.productType) fields.push({ label: "สินค้า", value: lead.productType });
  if (lead.requestedSize) fields.push({ label: "ขนาด", value: lead.requestedSize });
  if (lead.callbackDate) fields.push({ label: "ติดตั้ง", value: lead.callbackDate });
  if (note) fields.push({ label: "โน้ต", value: note });
  return {
    title: `มีคำขอ${title}ใหม่`,
    badge: lead.badge,
    fields,
    link: { label: "ดูรายละเอียดในเมล", url: gmailNoticeLink(subject) },
  };
}
