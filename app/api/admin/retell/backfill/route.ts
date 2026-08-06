import { NextResponse } from "next/server";
import { requireDashboardAccess } from "@/lib/dashboard-auth";
import { supabaseEnabled } from "@/lib/dashboard-data";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { fetchRetellCallsPage, ingestRetellCall } from "@/lib/retell";

// MannaFlow-admin-only. Pulls every Retell call and upserts the mapped ones
// into call_logs. Idempotent (upsert on provider_call_id) and re-runnable to
// refresh. Calls whose agent maps to no org are skipped.
export async function POST() {
  const { access, response } = await requireDashboardAccess();
  if (!access) return response!;
  if (access.role !== "MANNAFLOW_ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!supabaseEnabled()) return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });

  const admin = createAdminSupabaseClient();
  const summary = { ingested: 0, skipped: 0, errors: 0, total: 0 };
  const errors: string[] = [];

  let paginationKey: string | undefined;
  // Safety cap so an unexpectedly large account can't loop forever.
  for (let page = 0; page < 50; page++) {
    const { items, paginationKey: next, hasMore } = await fetchRetellCallsPage({ limit: 100, paginationKey });
    for (const call of items) {
      summary.total++;
      const result = await ingestRetellCall(admin, call);
      if (result.status === "ingested") summary.ingested++;
      else if (result.status === "skipped_unmapped") summary.skipped++;
      else {
        summary.errors++;
        if (errors.length < 10) errors.push(`${result.callId}: ${result.error}`);
      }
    }
    if (!hasMore || !next) break;
    paginationKey = next;
  }

  return NextResponse.json({ ...summary, sampleErrors: errors });
}
