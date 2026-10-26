import { NextResponse } from "next/server";
import { isVideoMediaName } from "@/lib/leads/site-media";
import {
  claimLeadFromLine,
  getLeadJob,
  JOB_STATUSES,
  listLeadJobRows,
  updateLeadJobStatus,
  type JobStatus,
} from "@/lib/leads/store";
import { claimedLeadLineCard, jobProgressLineCard, LEAD_SALES_PICKERS, pushLineCard } from "@/lib/outbound/line";
import { getCategory } from "@/lib/product-catalog";
import { isStorageRef, leadImageRefs, storagePathFromRef } from "@/lib/security/lead-media";
import { createSignedUploadUrl } from "@/lib/storage/upload";
import {
  bangkokToday,
  fetchWebReportStats,
  reportLabels,
  reportWindow,
  type ReportPeriod,
  type WebReportStats,

} from "@/lib/reports/line-web-report";

export const runtime = "nodejs";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Verified tokens per warm instance, so list/detail/report calls skip the round trip to LINE. */
const verifiedTokens = new Map<string, { sub: string; expiresAt: number }>();
const VERIFIED_TOKEN_CACHE_MAX = 200;

/** Verifies the LIFF ID token with LINE and returns the LINE userId (`sub`). */
async function verifiedLineUser(request: Request): Promise<string | null> {
  const clientId = process.env.LINE_LOGIN_CHANNEL_ID;
  const idToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!clientId || !idToken) return null;

  const cached = verifiedTokens.get(idToken);
  if (cached && cached.expiresAt > Date.now()) return cached.sub;
  if (cached) verifiedTokens.delete(idToken);

  try {
    const res = await fetch("https://api.line.me/oauth2/v2.1/verify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ id_token: idToken, client_id: clientId }),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { sub?: string; exp?: number };
    if (!body.sub) return null;
    if (body.exp) {
      if (verifiedTokens.size >= VERIFIED_TOKEN_CACHE_MAX) {
        const oldest = verifiedTokens.keys().next().value;
        if (oldest) verifiedTokens.delete(oldest);
      }
      verifiedTokens.set(idToken, { sub: body.sub, expiresAt: body.exp * 1000 - 30_000 });
    }
    return body.sub;
  } catch {
    return null;
  }
}

/** Membership per warm instance; non-members are re-checked sooner so a newly added member gets in quickly. */
const memberCache = new Map<string, { ok: boolean; expiresAt: number }>();
const MEMBER_CACHE_MS = 10 * 60_000;
const NON_MEMBER_CACHE_MS = 60_000;

/**
 * Customer details on this page match what the sales LINE group already sees on the lead card,
 * so access is limited to members of that same group.
 */
async function isSalesGroupMember(userId: string): Promise<boolean> {
  const cached = memberCache.get(userId);
  if (cached && cached.expiresAt > Date.now()) return cached.ok;

  const chatId = process.env.LINE_SALES_TO_ID ?? "";
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const kind = chatId.startsWith("C") ? "group" : chatId.startsWith("R") ? "room" : null;
  if (!kind || !token) return false;

  try {
    const res = await fetch(`https://api.line.me/v2/bot/${kind}/${chatId}/member/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status !== 200 && res.status !== 404) {
      console.error("line member check", res.status);
      return false;
    }
    const ok = res.status === 200;
    memberCache.set(userId, { ok, expiresAt: Date.now() + (ok ? MEMBER_CACHE_MS : NON_MEMBER_CACHE_MS) });
    return ok;
  } catch {
    return false;
  }
}

async function authorizedUser(request: Request): Promise<{ userId: string } | NextResponse> {
  const userId = await verifiedLineUser(request);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!(await isSalesGroupMember(userId))) {
    return NextResponse.json({ error: "not_member" }, { status: 403 });
  }
  return { userId };
}

const MEDIA_URL_TTL_SEC = 60 * 60;

async function leadMedia(lead: { siteImageUrls?: string[] | null; siteImageUrl?: string | null }) {
  const media = await Promise.all(
    leadImageRefs(lead).map(async (ref) => {
      const url = isStorageRef(ref)
        ? await createSignedUploadUrl(storagePathFromRef(ref), MEDIA_URL_TTL_SEC)
        : ref.startsWith("https://")
          ? ref
          : null;
      return url ? { url, video: isVideoMediaName(ref) } : null;
    }),
  );
  return media.filter((item): item is { url: string; video: boolean } => item !== null);
}

async function view(job: NonNullable<Awaited<ReturnType<typeof getLeadJob>>>, userId: string) {
  const { lead } = job;
  return {
    quoteNo: lead.quoteNo ?? null,
    claimedBy: job.claimedBy,
    claimedAt: job.claimedAt,
    jobStatus: job.jobStatus,
    jobStatusAt: job.jobStatusAt,
    mine: Boolean(job.claimedUserId) && job.claimedUserId === userId,
    source: lead.source,
    createdAt: lead.createdAt,
    contactName: lead.contactName,
    jobTitle: lead.jobTitle ?? null,
    contactType: lead.contactType || null,
    businessName: lead.businessName ?? null,
    phone: lead.phone,
    lineId: lead.lineId ?? null,
    email: lead.email || null,
    productType: lead.productType,
    requestedSize: lead.requestedSize ?? null,
    callbackDate: lead.callbackDate ?? null,
    installAddress: lead.installAddress || null,
    billingAddress: lead.billingAddress ?? null,
    taxId: lead.taxId ?? null,
    referralSource: lead.referralSource || null,
    note: lead.note ?? null,
    media: await leadMedia(lead),
    salesPickers: job.claimedBy ? [] : LEAD_SALES_PICKERS,
  };
}

/** Report windows cover finished days only, so a short per-instance cache avoids re-running the heavy RPC. */
const REPORT_CACHE_MS = 10 * 60_000;
const reportCache = new Map<string, { expiresAt: number; body: unknown }>();

/** Same numbers the weekly/monthly LINE report card shows, with product slugs resolved to names. */
function reportStats(stats: WebReportStats) {
  return {
    ...stats,
    topProducts: stats.topProducts.map((product) => ({
      ...product,
      name: getCategory(product.slug)?.name ?? product.slug,
    })),
  };
}

export async function GET(request: Request) {
  const auth = await authorizedUser(request);
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  const url = new URL(request.url);
  const section = url.searchParams.get("section");
  if (section === "list") {
    const leads = await listLeadJobRows();
    return NextResponse.json({ leads }, { headers: { "Cache-Control": "no-store" } });
  }
  if (section === "web") {
    const period: ReportPeriod = url.searchParams.get("period") === "month" ? "month" : "week";
    const window = reportWindow(period, bangkokToday());
    const key = `${period}:${window.current.from}:${window.current.to}`;
    let report = reportCache.get(key);
    if (!report || report.expiresAt <= Date.now()) {
      const [current, previous] = await Promise.all([
        fetchWebReportStats(window.current),
        fetchWebReportStats(window.previous),
      ]);
      report = {
        expiresAt: Date.now() + REPORT_CACHE_MS,
        body: { period, labels: reportLabels(window), current: reportStats(current), previous: reportStats(previous) },
      };
      reportCache.set(key, report);
    }
    return NextResponse.json(report.body, { headers: { "Cache-Control": "no-store" } });
  }

  const leadId = url.searchParams.get("lead") ?? "";
  if (!UUID_RE.test(leadId)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const job = await getLeadJob(leadId);
  if (!job) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(await view(job, userId), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const auth = await authorizedUser(request);
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  let body: { lead?: string; status?: string; action?: string; by?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const leadId = body.lead ?? "";

  if (body.action === "claim") {
    const claimedBy = body.by ?? "";
    if (!UUID_RE.test(leadId) || !LEAD_SALES_PICKERS.includes(claimedBy)) {
      return NextResponse.json({ error: "bad_request" }, { status: 400 });
    }
    const claim = await claimLeadFromLine(leadId, claimedBy, userId);
    if (!claim) return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (!claim.isNewClaim) {
      return NextResponse.json({ error: "already_claimed", claimedBy: claim.claimedBy }, { status: 409 });
    }
    const line = await pushLineCard(
      claimedLeadLineCard({
        claimedBy: claim.claimedBy,
        claimedAt: claim.claimedAt,
        lead: { ...claim.lead, id: leadId },
      }),
    );
    const job = await getLeadJob(leadId);
    if (!job) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true, notified: line.ok, ...(await view(job, userId)) });
  }

  const status = body.status as JobStatus;
  if (!UUID_RE.test(leadId) || !JOB_STATUSES.includes(status)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const result = await updateLeadJobStatus(leadId, status, userId);
  if (!result.ok) {
    const code = result.reason === "forbidden" ? 403 : result.reason === "not_found" ? 404 : result.reason === "closed" ? 409 : 500;
    return NextResponse.json({ error: result.reason }, { status: code });
  }

  const { job } = result;
  const line = await pushLineCard(
    jobProgressLineCard({
      status,
      claimedBy: job.claimedBy ?? "",
      at: job.jobStatusAt ?? new Date().toISOString(),
      lead: {
        id: leadId,
        quoteNo: job.lead.quoteNo,
        contactName: job.lead.contactName,
        installAddress: job.lead.installAddress,
      },
    }),
  );
  return NextResponse.json({ ok: true, notified: line.ok, ...(await view(job, userId)) });
}
