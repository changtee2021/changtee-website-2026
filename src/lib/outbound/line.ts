/**
 * Shared LINE Messaging API push helper.
 * Reuses the same channel token as `src/lib/outbound/notify.ts` (sales notify)
 * but allows routing to a dedicated group per feature (visit / HR) when
 * `LINE_VISIT_TO_ID` / `LINE_HR_TO_ID` are set — falls back to `LINE_SALES_TO_ID`
 * so it works out of the box with a single existing LINE group.
 */

import { isVideoMediaName } from "@/lib/leads/site-media";
import { isStorageRef, leadImageRefs, storagePathFromRef } from "@/lib/security/lead-media";
import { createSignedUploadUrl } from "@/lib/storage/upload";

export function lineNotifyConfigured(): boolean {
  return Boolean(process.env.LINE_CHANNEL_ACCESS_TOKEN);
}

export type LineCardField = { label: string; value: string; max?: number };

export type LineCard = {
  title: string;
  fields: LineCardField[];
  /** Shown only when set, for example a one-off test send. */
  badge?: string;
  link?: { label: string; url: string };
  /** Customer phone for a tap-to-call button (works on LINE mobile). */
  call?: string;
  callLabel?: string;
  /**
   * Chat buttons: `text` is posted into the chat as the tapper. With `postback`
   * set, LINE also sends that data to `/api/line/webhook`.
   */
  pickers?: {
    prompt: string;
    options: { label: string; text: string; postback?: string }[];
  };
  tone?: "default" | "success";
  /** Public https image URLs shown as thumbnails inside the card; tap opens full size. */
  images?: string[];
};

const CARD_NAVY = "#0B1F3A";
const CARD_RED = "#C0392B";
const CARD_GREEN = "#1E8E5A";

function clip(value: string, max: number) {
  const text = value.replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/** LINE Flex bubble used for every staff alert. */
export function lineCardMessage(card: LineCard) {
  const rows = card.fields
    .map((field) => ({
      label: clip(field.label, 20),
      value: clip(field.value, field.max ?? 80),
    }))
    .filter((field) => field.value);

  const footerContents: Record<string, unknown>[] = [];
  const dialable = card.call?.replace(/[^\d+]/g, "");
  if (dialable) {
    footerContents.push({
      type: "button",
      style: "primary",
      height: "sm",
      color: CARD_RED,
      action: {
        type: "uri",
        label: clip(`${card.callLabel ?? "โทร"} ${card.call}`, 20),
        uri: `tel:${dialable}`,
      },
    });
  }
  if (card.pickers?.options.length) {
    footerContents.push({
      type: "text",
      text: clip(card.pickers.prompt, 40),
      size: "xs",
      color: "#6B7280",
      align: "center",
      margin: "md",
    });
    const options = card.pickers.options;
    for (let i = 0; i < options.length; i += 3) {
      footerContents.push({
        type: "box",
        layout: "horizontal",
        spacing: "sm",
        contents: options.slice(i, i + 3).map((option) => ({
          type: "button",
          style: "secondary",
          height: "sm",
          action: option.postback
            ? {
                type: "postback",
                label: clip(option.label, 20),
                data: option.postback.slice(0, 300),
                displayText: clip(option.text, 300),
              }
            : {
                type: "message",
                label: clip(option.label, 20),
                text: clip(option.text, 300),
              },
        })),
      });
    }
  }
  if (card.link) {
    footerContents.push({
      type: "button",
      style: "link",
      height: "sm",
      color: CARD_RED,
      action: {
        type: "uri",
        label: clip(card.link.label, 20),
        uri: card.link.url,
      },
    });
  }

  const success = card.tone === "success";

  const imageUrls = (card.images ?? [])
    .filter((url) => url.startsWith("https://") && url.length <= 2000)
    .slice(0, 3);
  const thumbnailRow = imageUrls.length
    ? [
        {
          type: "box",
          layout: "horizontal",
          spacing: "sm",
          margin: "md",
          contents: imageUrls.map((url) => ({
            type: "image",
            url,
            flex: 1,
            aspectRatio: "1:1",
            aspectMode: "cover",
            size: "full",
            action: { type: "uri", label: "ดูรูป", uri: url },
          })),
        },
      ]
    : [];

  return {
    type: "flex" as const,
    altText: clip(card.title, 80),
    contents: {
      type: "bubble",
      size: "mega",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: success ? CARD_GREEN : CARD_NAVY,
        paddingAll: "16px",
        contents: [
          {
            type: "text",
            text: card.badge ? `ทดสอบ · ช่างตี๋ ผ้าม่าน` : "ช่างตี๋ ผ้าม่าน",
            color: card.badge ? "#F6C945" : success ? "#D5F5E3" : "#F3D2D0",
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
        contents: [...rows.map((field) => ({
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
              wrap: true,
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
        })), ...thumbnailRow],
      },
      ...(footerContents.length
        ? {
            footer: {
              type: "box",
              layout: "vertical",
              spacing: "sm",
              paddingAll: "12px",
              contents: footerContents,
            },
          }
        : {}),
      styles: {
        header: { separator: false },
        body: { separator: true, separatorColor: success ? CARD_GREEN : CARD_RED },
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

export async function pushLineFlex(
  message: Record<string, unknown>,
  to?: string | null,
): Promise<{ ok: boolean; error?: string }> {
  return pushLinePayload(message, to);
}

/** Answers a webhook event; reply tokens are single-use and expire within a minute. */
export async function replyLineMessages(
  replyToken: string,
  messages: Record<string, unknown>[],
): Promise<{ ok: boolean; error?: string }> {
  try {
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (!token) throw new Error("LINE credentials not configured");

    const res = await fetch("https://api.line.me/v2/bot/message/reply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ replyToken, messages: messages.slice(0, 5) }),
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
  const short = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Bangkok",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const part = (type: string) => short.find((p) => p.type === type)?.value ?? "";
  return {
    dateText: new Intl.DateTimeFormat("th-TH", {
      timeZone: "Asia/Bangkok",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date),
    timeText: `${part("hour")}.${part("minute")}`,
    /** One line for the lead card, e.g. "D: 26/10/69   T: 10.41". */
    dateTimeText: `D: ${part("day")}/${part("month")}/${part("year")}   T: ${part("hour")}.${part("minute")}`,
  };
}

/** Maps links are long and unreadable inside the card; the address text is enough. */
function stripMapLinks(value: string) {
  return value
    .replace(/https?:\/\/(?:maps\.app\.goo\.gl|goo\.gl\/maps|maps\.google\.[^\s]+)\/\S*/gi, "")
    .replace(/google maps:\s*/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

export const LEAD_SALES_PICKERS = ["โจ้", "หนุ่ม", "ตุ่น", "โส", "เฟิร์น", "ตี๋", "ฝัน", "แมว"];

/** Signed https links (7 days) for a lead's photos so LINE can render thumbnails. Videos are skipped. */
export async function leadLineImageUrls(lead: {
  siteImageUrls?: string[] | null;
  siteImageUrl?: string | null;
}): Promise<string[]> {
  try {
    const refs = leadImageRefs(lead).filter((ref) => !isVideoMediaName(ref));
    const urls = await Promise.all(
      refs.slice(0, 3).map(async (ref) => {
        if (isStorageRef(ref)) {
          const path = storagePathFromRef(ref);
          if (!/\.(jpe?g|png|webp)$/i.test(path)) return "";
          return (await createSignedUploadUrl(path, 60 * 60 * 24 * 7)) || "";
        }
        return ref.startsWith("https://") ? ref : "";
      }),
    );
    return urls.filter(Boolean);
  } catch {
    return [];
  }
}

export const LEAD_CLAIM_ACTION = "claim";

/** Short staff card. Skips billing address and tax id — those stay in email and admin. */
export function leadLineCard(lead: {
  id: string;
  quoteNo?: string | null;
  source: string;
  contactName: string;
  phone: string;
  lineId?: string | null;
  businessName?: string | null;
  installAddress?: string | null;
  productType?: string | null;
  requestedSize?: string | null;
  callbackDate?: string | null;
  note?: string | null;
  createdAt?: string | null;
  badge?: string;
  images?: string[];
}): LineCard {
  const title = LEAD_SOURCE_LABELS[lead.source] || lead.source;
  const note = lead.note?.replace(/\s+/g, " ").trim();
  const installAddress = stripMapLinks(lead.installAddress ?? "");
  const when = bangkokParts(lead.createdAt || new Date().toISOString());
  const fields: LineCardField[] = [
    { label: "เลขที่", value: lead.quoteNo ?? "" },
    { label: "วันเวลา", value: when.dateTimeText },
    {
      label: "ชื่อ",
      value: `${lead.contactName}${lead.businessName ? ` (${lead.businessName})` : ""}`,
    },
    { label: "โทร", value: lead.phone },
  ];
  if (lead.lineId) fields.push({ label: "LINE", value: lead.lineId });
  if (lead.productType) fields.push({ label: "สินค้า", value: lead.productType });
  if (lead.requestedSize) fields.push({ label: "ขนาด", value: lead.requestedSize });
  if (installAddress && installAddress !== "-") {
    fields.push({ label: "ที่ติดตั้ง", value: installAddress, max: 200 });
  }
  if (lead.callbackDate) fields.push({ label: "วันติดตั้ง", value: lead.callbackDate });
  if (note) fields.push({ label: "โน้ต", value: note });
  return {
    title: `มีคำขอ${title}ใหม่`,
    badge: lead.badge,
    fields,
    images: lead.images,
    call: lead.phone,
    pickers: {
      prompt: "ใครรับงานนี้? กดชื่อเพื่อรับงาน",
      options: LEAD_SALES_PICKERS.map((name) => {
        const data = new URLSearchParams({
          action: LEAD_CLAIM_ACTION,
          lead: lead.id,
          by: name,
        });
        if (lead.badge) data.set("test", "1");
        return {
          label: name,
          text: `${name}รับงานนี้`,
          postback: data.toString(),
        };
      }),
    },
  };
}

function minutesBetween(fromIso: string, toIso: string) {
  const minutes = Math.round(
    (new Date(toIso).getTime() - new Date(fromIso).getTime()) / 60000,
  );
  if (!Number.isFinite(minutes) || minutes < 0) return null;
  if (minutes < 60) return `${minutes} นาที`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} ชม. ${rest} นาที` : `${hours} ชม.`;
}

/** Bot reply after a salesperson taps their name on a lead card. */
export function claimedLeadLineCard(claim: {
  claimedBy: string;
  claimedAt: string;
  lead: {
    id?: string;
    quoteNo?: string | null;
    contactName: string;
    phone: string;
    productType?: string | null;
    installAddress?: string | null;
    createdAt?: string | null;
  };
  badge?: string;
}): LineCard {
  const claimed = bangkokParts(claim.claimedAt);
  const { lead } = claim;
  const installAddress = stripMapLinks(lead.installAddress ?? "");
  const fields: LineCardField[] = [
    { label: "เลขที่", value: lead.quoteNo ?? "" },
    { label: "ผู้รับงาน", value: claim.claimedBy },
    { label: "วันที่รับงาน", value: claimed.dateText },
    { label: "เวลารับงาน", value: `${claimed.timeText} น.` },
    { label: "ลูกค้า", value: lead.contactName },
    { label: "โทร", value: lead.phone },
  ];
  if (lead.productType) fields.push({ label: "สินค้า", value: lead.productType });
  if (installAddress && installAddress !== "-") {
    fields.push({ label: "ที่ติดตั้ง", value: installAddress, max: 200 });
  }
  if (lead.createdAt) {
    const requested = bangkokParts(lead.createdAt);
    fields.push({
      label: "ลูกค้าส่งคำขอ",
      value: `${requested.dateText} · ${requested.timeText} น.`,
    });
    const waited = minutesBetween(lead.createdAt, claim.claimedAt);
    if (waited) fields.push({ label: "รับงานภายใน", value: waited });
  }
  return {
    title: `✅ ${claim.claimedBy}รับงานแล้ว`,
    badge: claim.badge,
    tone: "success",
    fields,
    call: lead.phone,
    callLabel: "โทรด่วน",
    link: lead.id ? jobTrackLink(lead.id) : undefined,
  };
}

/** Opens the LIFF job page inside LINE. Hidden until NEXT_PUBLIC_LIFF_ID is set. */
function jobTrackLink(leadId: string): LineCard["link"] {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
  if (!liffId) return undefined;
  return {
    label: "อัปเดตสถานะงาน",
    url: `https://liff.line.me/${liffId}?lead=${encodeURIComponent(leadId)}`,
  };
}

export const JOB_STATUS_LABELS = {
  done: "ปิดงานเรียบร้อย",
} as const;

/** Group card posted by the bot each time the owner moves the job forward. */
export function jobProgressLineCard(progress: {
  status: keyof typeof JOB_STATUS_LABELS;
  claimedBy: string;
  at: string;
  lead: {
    id: string;
    quoteNo?: string | null;
    contactName: string;
    installAddress?: string | null;
  };
}): LineCard {
  const when = bangkokParts(progress.at);
  const address = stripMapLinks(progress.lead.installAddress ?? "");
  const fields: LineCardField[] = [
    { label: "เลขที่", value: progress.lead.quoteNo ?? "" },
    { label: "ผู้รับงาน", value: progress.claimedBy },
    { label: "สถานะ", value: JOB_STATUS_LABELS[progress.status] },
    { label: "เวลา", value: `${when.dateText} · ${when.timeText} น.` },
    { label: "ลูกค้า", value: progress.lead.contactName },
  ];
  if (address && address !== "-") fields.push({ label: "ที่ติดตั้ง", value: address, max: 200 });
  const icon = "🏁";
  return {
    title: `${icon} ${progress.claimedBy}${JOB_STATUS_LABELS[progress.status]}`,
    tone: "success",
    fields,
    link: progress.status === "done" ? undefined : jobTrackLink(progress.lead.id),
  };
}

/** Text reply when someone taps a name on a lead that already has an owner. */
export function alreadyClaimedLineText(
  claimedBy: string,
  claimedAt: string,
  quoteNo?: string | null,
) {
  const when = bangkokParts(claimedAt);
  const job = quoteNo ? `งาน ${quoteNo} ` : "งานนี้";
  return `${job}${claimedBy}รับไปแล้ว เมื่อ ${when.dateText} เวลา ${when.timeText} น.`;
}
