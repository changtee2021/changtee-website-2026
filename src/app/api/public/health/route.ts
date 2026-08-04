import { NextResponse } from "next/server";
import { APP_SLUG, ERP_PROJECT_ID, SUPABASE_SCHEMA } from "@/lib/erp-config";

export async function GET() {
  return NextResponse.json({
    ok: true,
    app: APP_SLUG,
    schema: SUPABASE_SCHEMA,
    erpProjectId: ERP_PROJECT_ID,
    time: new Date().toISOString(),
  });
}
