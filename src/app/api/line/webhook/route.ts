import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { claimLeadFromLine } from "@/lib/leads/store";
import {
  LEAD_CLAIM_ACTION,
  LEAD_SALES_PICKERS,
  alreadyClaimedLineText,
  claimedLeadLineCard,
  lineCardMessage,
  replyLineMessages,
} from "@/lib/outbound/line";

type LineWebhookEvent = {
  type?: string;
  replyToken?: string;
  source?: { userId?: string };
  postback?: { data?: string };
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validSignature(body: string, signature: string | null, secret: string) {
  if (!signature) return false;
  const expected = createHmac("sha256", secret).update(body).digest();
  let given: Buffer;
  try {
    given = Buffer.from(signature, "base64");
  } catch {
    return false;
  }
  return given.length === expected.length && timingSafeEqual(given, expected);
}

const TEST_CLAIM_LEAD = {
  contactName: "TEST",
  phone: "0812345678",
  productType: "ม่านม้วน",
  installAddress: "ทดสอบระบบ — ไม่ใช่ลูกค้าจริง",
};

async function handleClaim(event: LineWebhookEvent) {
  const replyToken = event.replyToken;
  if (!replyToken) return;
  const params = new URLSearchParams(event.postback?.data ?? "");
  if (params.get("action") !== LEAD_CLAIM_ACTION) return;

  const leadId = params.get("lead") ?? "";
  const claimedBy = params.get("by") ?? "";
  if (!LEAD_SALES_PICKERS.includes(claimedBy)) return;

  if (params.get("test") === "1") {
    const now = new Date().toISOString();
    const card = claimedLeadLineCard({
      claimedBy,
      claimedAt: now,
      lead: { ...TEST_CLAIM_LEAD, createdAt: new Date(Date.now() - 2 * 60000).toISOString() },
      badge: "test",
    });
    await replyLineMessages(replyToken, [lineCardMessage(card)]);
    return;
  }

  if (!UUID_RE.test(leadId)) return;
  const claim = await claimLeadFromLine(
    leadId,
    claimedBy,
    event.source?.userId ?? null,
  );
  if (!claim) {
    await replyLineMessages(replyToken, [
      { type: "text", text: "ไม่พบงานนี้ในระบบ กรุณาเช็กในหน้า admin" },
    ]);
    return;
  }

  if (!claim.isNewClaim) {
    await replyLineMessages(replyToken, [
      { type: "text", text: alreadyClaimedLineText(claim.claimedBy, claim.claimedAt) },
    ]);
    return;
  }

  const card = claimedLeadLineCard({
    claimedBy: claim.claimedBy,
    claimedAt: claim.claimedAt,
    lead: claim.lead,
  });
  await replyLineMessages(replyToken, [lineCardMessage(card)]);
}

export async function POST(request: Request) {
  const secret = process.env.LINE_LEAD_CHANNEL_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  const body = await request.text();
  if (!validSignature(body, request.headers.get("x-line-signature"), secret)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let events: LineWebhookEvent[] = [];
  try {
    events = (JSON.parse(body) as { events?: LineWebhookEvent[] }).events ?? [];
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  for (const event of events) {
    if (event.type !== "postback") continue;
    try {
      await handleClaim(event);
    } catch (err) {
      console.error(
        "line webhook claim",
        err instanceof Error ? err.message : "unknown error",
      );
    }
  }

  return NextResponse.json({ ok: true });
}
