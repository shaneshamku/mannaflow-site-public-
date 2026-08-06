import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { ingestRetellCall, verifyRetellSignature, type RetellCall } from "@/lib/retell";
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

  const result = await ingestRetellCall(createAdminSupabaseClient(), payload.call);
  if (result.status === "error") {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true, status: result.status });
}
