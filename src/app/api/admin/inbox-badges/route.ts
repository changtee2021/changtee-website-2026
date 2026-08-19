import { NextResponse } from "next/server";
import { assertAdminApiAccess } from "@/lib/admin-api-guard";
import { EMPTY_INBOX_BADGES } from "@/lib/admin-inbox";
import { DEMO_APPLICATIONS } from "@/lib/careers/applications-demo";
import { listJobApplications } from "@/lib/careers/store";
import { DEMO_LEADS } from "@/lib/leads/leads-demo";
import { listLeads } from "@/lib/leads/store";
import { visitKindOf } from "@/lib/visits/modes";
import { DEMO_VISITS } from "@/lib/visits/visits-demo";
import { listVisitBookings } from "@/lib/visits/store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const unauthorized = await assertAdminApiAccess(request);
  if (unauthorized) return unauthorized;

  try {
    const [leads, visits, applications] = await Promise.all([
      listLeads().catch(() => []),
      listVisitBookings().catch(() => []),
      listJobApplications().catch(() => []),
    ]);

    const leadRows = leads.length > 0 ? leads : DEMO_LEADS;
    const visitRows = visits.length > 0 ? visits : DEMO_VISITS;
    const applicationRows =
      applications.length > 0 ? applications : DEMO_APPLICATIONS;

    return NextResponse.json({
      leads: leadRows.filter((row) => row.status === "new").length,
      visits: visitRows.filter(
        (row) =>
          visitKindOf(row.bookingKind) === "factory-visit" &&
          row.status === "pending",
      ).length,
      presentations: visitRows.filter(
        (row) =>
          visitKindOf(row.bookingKind) === "product-presentation" &&
          row.status === "pending",
      ).length,
      applications: applicationRows.filter((row) => row.status === "new")
        .length,
    });
  } catch {
    return NextResponse.json(EMPTY_INBOX_BADGES);
  }
}
