import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { ingestRetellCall, notifyOwnerOfCall, verifyRetellSignature, type RetellCall } from "@/lib/retell";
import { supabaseEnabled } from "@/lib/dashboard-data";

// Real-time Retell call ingestion. Configure this URL as the agent/account
// webhook in Retell. Public endpoint — authenticated only by the
// X-Retell-Signature HMAC, verified against RETELL_API_KEY.
// See docs/adr/0002-retell-call-log-ingestion.md.
export async function POST(req: NextRequest) {
  if (!supabaseEnabled() || !process.env.RETELL_API_KEY) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const rawBody = await req.text();
  if (!verifyRetellSignature(rawBody, req.headers.get("x-retell-signature"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: { event?: string; call?: RetellCall };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // call_ended captures the call; call_analyzed enriches it with post-call
  // analysis. Both upsert on provider_call_id, so ordering is safe. Ignore
  // call_started (nothing durable to store yet).
  if (payload.event !== "call_ended" && payload.event !== "call_analyzed") {
    return NextResponse.json({ ok: true, ignored: payload.event ?? null });
  }
  if (!payload.call?.call_id) {
    return NextResponse.json({ error: "Missing call" }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();
  const result = await ingestRetellCall(admin, payload.call);
  if (result.status === "error") {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  // Owner SMS fires once analysis data is actually present on the payload,
  // rather than trusting the event name literally being "call_analyzed" —
  // in production, Retell was observed delivering the analysis-enriched
  // payload under "call_ended" for this agent, so the earlier name-based
  // gate never opened. An event without analysis (a plain call_ended) still
  // won't match, so this can't double-fire off both legs. Never runs from
  // the backfill path, so historical calls don't trigger a flood of texts.
  // A notify failure never fails the webhook, but is reported back in the
  // response for diagnosability (this endpoint only ever responds to a
  // request bearing a valid HMAC signature).
  let notify: string | undefined;
  if (result.status === "ingested" && payload.call.call_analysis?.call_summary) {
    try {
      notify = await notifyOwnerOfCall(admin, result.organizationId, payload.call);
    } catch (err) {
      console.error("notifyOwnerOfCall failed", err);
      notify = `error: ${err instanceof Error ? err.message : String(err)}`;
    }
  }
  return NextResponse.json({ ok: true, status: result.status, notify });
}
