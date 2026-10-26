import { NextResponse } from "next/server";
import { getLeadJob, JOB_STATUSES, listLeadJobs, updateLeadJobStatus, type JobStatus } from "@/lib/leads/store";
import { jobProgressLineCard, pushLineCard } from "@/lib/outbound/line";
import { getCategory } from "@/lib/product-catalog";
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

/** Verifies the LIFF ID token with LINE and returns the LINE userId (`sub`). */
async function verifiedLineUser(request: Request): Promise<string | null> {
  const clientId = process.env.LINE_LOGIN_CHANNEL_ID;
  const idToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!clientId || !idToken) return null;
  try {
    const res = await fetch("https://api.line.me/oauth2/v2.1/verify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ id_token: idToken, client_id: clientId }),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { sub?: string };
    return body.sub || null;
  } catch {
    return null;
  }
}

function view(job: NonNullable<Awaited<ReturnType<typeof getLeadJob>>>, userId: string) {
  const mine = Boolean(job.claimedUserId) && job.claimedUserId === userId;
  const base = {
    quoteNo: job.lead.quoteNo ?? null,
    claimedBy: job.claimedBy,
    claimedAt: job.claimedAt,
    jobStatus: job.jobStatus,
    jobStatusAt: job.jobStatusAt,
    mine,
    productType: job.lead.productType,
    requestedSize: job.lead.requestedSize ?? null,
  };
  // Customer details only go to the salesperson who owns the job.
  if (!mine) return base;
  return {
    ...base,
    contactName: job.lead.contactName,
    phone: job.lead.phone,
    installAddress: job.lead.installAddress,
    callbackDate: job.lead.callbackDate ?? null,
  };
}

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
  const userId = await verifiedLineUser(request);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const section = url.searchParams.get("section");
  if (section === "list") {
    const jobs = await listLeadJobs();
    return NextResponse.json(
      {
        leads: jobs.map((job) => ({
          id: job.lead.id,
          quoteNo: job.lead.quoteNo ?? null,
          contactName: job.lead.contactName,
          productType: job.lead.productType,
          requestedSize: job.lead.requestedSize ?? null,
          createdAt: job.lead.createdAt,
          claimedBy: job.claimedBy,
          jobStatus: job.jobStatus,
        })),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
  if (section === "web") {
    const period: ReportPeriod = url.searchParams.get("period") === "month" ? "month" : "week";
    const window = reportWindow(period, bangkokToday());
    const [current, previous] = await Promise.all([
      fetchWebReportStats(window.current),
      fetchWebReportStats(window.previous),
    ]);
    return NextResponse.json(
      {
        period,
        labels: reportLabels(window),
        current: reportStats(current),
        previous: reportStats(previous),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const leadId = url.searchParams.get("lead") ?? "";
  if (!UUID_RE.test(leadId)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const job = await getLeadJob(leadId);
  if (!job) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(view(job, userId), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const userId = await verifiedLineUser(request);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { lead?: string; status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const leadId = body.lead ?? "";
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
  return NextResponse.json({ ok: true, notified: line.ok, ...view(job, userId) });
}
