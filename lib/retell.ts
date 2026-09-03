import crypto from "crypto";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

// Reuses the same public Twilio Function relay Luna's notify_owner tool
// already sends through (its own Twilio account, from +16473720370) — no
// TWILIO_* env vars needed. See voice-agent/luna/README.md "SMS relay".
const SMS_RELAY_URL = "https://mannaflow-sms-6105.twil.io/notify-owner";

async function sendSMS(to: string, body: string): Promise<void> {
  const res = await fetch(SMS_RELAY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, message: body }),
  });
  if (!res.ok) throw new Error(`SMS relay failed: ${res.status} ${await res.text()}`);
}

// Shared Retell -> Supabase call_logs ingestion. Used by both the real-time
// webhook (app/api/retell/webhook) and the admin backfill route
// (app/api/admin/retell/backfill). Both run without a signed-in user, so both
// use the service-role admin client and resolve the organization themselves.
// See docs/adr/0002-retell-call-log-ingestion.md.

const RETELL_BASE = "https://api.retellai.com";

type AdminClient = ReturnType<typeof createAdminSupabaseClient>;

export type RetellCall = {
  call_id: string;
  agent_id?: string;
  agent_name?: string;
  call_type?: string;
  call_status?: string;
  direction?: string;
  from_number?: string;
  to_number?: string;
  start_timestamp?: number;
  end_timestamp?: number;
  duration_ms?: number;
  recording_url?: string;
  transcript?: string;
  disconnection_reason?: string;
  call_analysis?: {
    call_summary?: string;
    user_sentiment?: string;
    call_successful?: boolean;
    in_voicemail?: boolean;
    custom_analysis_data?: Record<string, unknown>;
  };
  call_cost?: { combined_cost?: number };
};

// Maps a Retell call payload to a call_logs row. Call-specific analysis fields
// (which vary per agent) live in `metadata` so no schema change is needed when
// an agent's post-call fields change.
export function callLogRowFromRetell(call: RetellCall, organizationId: string) {
  const analysis = call.call_analysis ?? {};
  const custom = analysis.custom_analysis_data ?? {};
  return {
    organization_id: organizationId,
    provider: "retell",
    provider_call_id: call.call_id,
    direction: call.direction ?? null,
    from_phone: call.from_number ?? null,
    to_phone: call.to_number ?? null,
    status: call.call_status ?? null,
    duration_seconds: typeof call.duration_ms === "number" ? Math.round(call.duration_ms / 1000) : null,
    recording_url: call.recording_url ?? null,
    transcript: call.transcript ?? null,
    metadata: {
      agent_id: call.agent_id ?? null,
      agent_name: call.agent_name ?? null,
      call_type: call.call_type ?? null,
      disconnection_reason: call.disconnection_reason ?? null,
      summary: analysis.call_summary ?? null,
      sentiment: analysis.user_sentiment ?? null,
      successful: analysis.call_successful ?? null,
      in_voicemail: analysis.in_voicemail ?? null,
      outcome: (custom.call_outcome as string | undefined) ?? null,
      booking_status: (custom.booking_status as string | undefined) ?? null,
      urgency_level: (custom.urgency_level as string | undefined) ?? null,
      caller_name: (custom.caller_full_name as string | undefined) ?? null,
      issue_category: (custom.issue_category as string | undefined) ?? null,
      cost: call.call_cost?.combined_cost ?? null,
      custom,
    },
    started_at: call.start_timestamp ? new Date(call.start_timestamp).toISOString() : null,
    ended_at: call.end_timestamp ? new Date(call.end_timestamp).toISOString() : null,
  };
}

export async function resolveOrganizationIdForAgent(
  admin: AdminClient,
  agentId: string | undefined,
): Promise<string | null> {
  if (!agentId) return null;
  const { data } = await admin.from("organizations").select("id").eq("retell_agent_id", agentId).maybeSingle();
  return data?.id ?? null;
}

export type IngestResult =
  | { callId: string; status: "ingested"; organizationId: string }
  | { callId: string; status: "skipped_unmapped"; agentId?: string }
  | { callId: string; status: "error"; error: string };

// Resolve org by agent, skip if unmapped, otherwise idempotent upsert on
// provider_call_id.
export async function ingestRetellCall(admin: AdminClient, call: RetellCall): Promise<IngestResult> {
  const organizationId = await resolveOrganizationIdForAgent(admin, call.agent_id);
  if (!organizationId) return { callId: call.call_id, status: "skipped_unmapped", agentId: call.agent_id };
  const row = callLogRowFromRetell(call, organizationId);
  const { error } = await admin.from("call_logs").upsert(row, { onConflict: "provider_call_id" });
  if (error) return { callId: call.call_id, status: "error", error: error.message };
  return { callId: call.call_id, status: "ingested", organizationId };
}

const BOOKING_LINES: Record<string, string> = {
  confirmed: "✅ Appointment booked.",
  requested: "📋 Booking requested — needs follow-up.",
  failed: "⚠️ Booking attempt failed — follow up.",
};

// Texts an org's owner_notify_phone (if set) after a call_analyzed webhook,
// simulating the "new call" alert a real client would receive. Never called
// from the backfill path — only the real-time call_analyzed leg, so historical
// calls don't trigger a flood of texts.
export async function notifyOwnerOfCall(
  admin: AdminClient,
  organizationId: string,
  call: RetellCall,
): Promise<void> {
  const { data: org } = await admin
    .from("organizations")
    .select("name, owner_notify_phone")
    .eq("id", organizationId)
    .maybeSingle();
  if (!org?.owner_notify_phone) return;

  const analysis = call.call_analysis ?? {};
  const custom = analysis.custom_analysis_data ?? {};
  const callerName = (custom.caller_full_name as string | undefined) || "Unknown caller";
  const callerPhone = call.from_number || "no number";
  const summary = analysis.call_summary?.trim() || "No summary available.";
  const bookingStatus = (custom.booking_status as string | undefined) ?? "none";
  const urgency = (custom.urgency_level as string | undefined) ?? "";

  const bookingLine = BOOKING_LINES[bookingStatus] ?? "No booking made.";
  const urgencyLine = /high|urgent|emergency/i.test(urgency)
    ? "\n⚠️ Flagged urgent — call back today."
    : "";

  const body = `New call — ${org.name}\n${callerName} · ${callerPhone}\n${summary}\n${bookingLine}${urgencyLine}`;
  await sendSMS(org.owner_notify_phone, body);
}

export async function fetchRetellCallsPage(opts: {
  limit?: number;
  paginationKey?: string;
}): Promise<{ items: RetellCall[]; paginationKey?: string; hasMore: boolean }> {
  const apiKey = process.env.RETELL_API_KEY;
  if (!apiKey) throw new Error("RETELL_API_KEY is required for Retell backfill");
  const res = await fetch(`${RETELL_BASE}/v3/list-calls`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      limit: opts.limit ?? 100,
      sort_order: "descending",
      ...(opts.paginationKey ? { pagination_key: opts.paginationKey } : {}),
    }),
  });
  if (!res.ok) throw new Error(`Retell list-calls failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { items?: RetellCall[]; pagination_key?: string; has_more?: boolean };
  return { items: data.items ?? [], paginationKey: data.pagination_key, hasMore: Boolean(data.has_more) };
}

// Verifies the X-Retell-Signature header: HMAC-SHA256 of the raw request body
// keyed by the Retell API key, hex-encoded. Constant-time compared.
export function verifyRetellSignature(rawBody: string, signature: string | null): boolean {
  const apiKey = process.env.RETELL_API_KEY;
  if (!apiKey || !signature) return false;
  const expected = crypto.createHmac("sha256", apiKey).update(rawBody, "utf8").digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
