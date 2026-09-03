import { type ContractorLead, type ContractorPipelineStage, type ContractorServiceType, type ContractorUrgencyLevel } from "@/lib/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Guards routes that need to fail gracefully (503) if Supabase env vars are
// missing in a given deployment, rather than crashing. Supabase is the only
// data path now — this is a configuration check, not a fallback selector.
export const supabaseEnabled = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

export function leadFromRow(row: Record<string, unknown>): ContractorLead {
  return {
    id: row.id as string, organizationId: row.organization_id as string, name: row.name as string | null,
    phone: row.phone as string, email: row.email as string | null, address: row.address as string | null,
    issueDescription: row.issue_description as string | null, serviceType: row.service_type as ContractorServiceType | null,
    urgencyLevel: row.urgency_level as ContractorUrgencyLevel | null, leadSource: row.lead_source as string,
    notes: row.notes as string | null, currentStage: row.current_stage as ContractorPipelineStage,
    dateEnteredStage: new Date(row.date_entered_stage as string), createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

export async function getDashboardLeads(): Promise<ContractorLead[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => leadFromRow(row as Record<string, unknown>));
}

export function leadToSupabaseInsert(data: Record<string, unknown>, organizationId: string) {
  return {
    organization_id: organizationId,
    name: typeof data.name === "string" ? data.name : null,
    phone: data.phone as string,
    email: typeof data.email === "string" ? data.email : null,
    address: typeof data.address === "string" ? data.address : null,
    issue_description: typeof data.issueDescription === "string" ? data.issueDescription : null,
    service_type: typeof data.serviceType === "string" && data.serviceType ? data.serviceType : null,
    urgency_level: typeof data.urgencyLevel === "string" && data.urgencyLevel ? data.urgencyLevel : null,
    lead_source: typeof data.leadSource === "string" && data.leadSource ? data.leadSource : "Unknown",
    notes: typeof data.notes === "string" ? data.notes : null,
    current_stage: "NEW_LEAD",
  };
}

export function leadToSupabaseUpdate(data: Record<string, unknown>) {
  const map: Record<string, string> = {
    name: "name", phone: "phone", email: "email", address: "address",
    issueDescription: "issue_description", serviceType: "service_type", urgencyLevel: "urgency_level",
    leadSource: "lead_source", notes: "notes", currentStage: "current_stage",
  };
  return Object.fromEntries(Object.entries(map).flatMap(([from, to]) =>
    data[from] === undefined || from === "organizationId" ? [] : [[to, data[from] || null]],
  ));
}

export function campaignFromRow(row: Record<string, unknown>) {
  return {
    id: row.id as string, organizationId: row.organization_id as string, name: row.name as string,
    path: row.path as string | null, description: row.description as string | null,
    status: row.status as "ACTIVE" | "PAUSED" | "COMPLETED", steps: (row.steps as unknown[]) ?? [],
    timezone: row.timezone as string, createdAt: row.created_at as string, updatedAt: row.updated_at as string,
  };
}

export async function getDashboardCampaigns() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("campaigns").select("*, campaign_leads(count)").order("created_at");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    ...campaignFromRow(row as Record<string, unknown>),
    _count: { leads: (row.campaign_leads as { count: number }[] | null)?.[0]?.count ?? 0 },
  }));
}

export type DashboardCallLog = {
  id: string;
  organizationId: string;
  organizationName: string | null;
  direction: string | null;
  fromPhone: string | null;
  toPhone: string | null;
  status: string | null;
  durationSeconds: number | null;
  recordingUrl: string | null;
  startedAt: string | null;
  summary: string | null;
  sentiment: string | null;
  outcome: string | null;
  bookingStatus: string | null;
  callerName: string | null;
};

// Retell's structured custom_analysis_data.call_outcome field is empty for
// some agents (e.g. Union Health Network) — this text heuristic reads the
// free-text call_summary instead so the Outcome column isn't blank. It's an
// approximation, not authoritative: unusual phrasing can misclassify.
const NOT_BOOKED_RE = /\b(not|n't|no|unable to|couldn't|did not|declined to|chose not to)\b[^.?!]{0,30}\b(book(?:ed|ing)?|schedul(?:e|ed|ing)|appointment)\b/i;
const BOOKED_RE = /\b(booked|scheduled|confirmed)\b[^.?!]{0,30}\b(appointment|visit|service|call|consultation)\b|\bappointment\b[^.?!]{0,30}\b(booked|scheduled|confirmed|set up|set)\b/i;

function inferOutcomeFromSummary(summary: string | null): string | null {
  if (!summary) return null;
  if (NOT_BOOKED_RE.test(summary)) return "Not booked";
  if (BOOKED_RE.test(summary)) return "Booked";
  return null;
}

export function callLogFromRow(row: Record<string, unknown>): DashboardCallLog {
  const meta = (row.metadata as Record<string, unknown> | null) ?? {};
  const org = row.organizations as { name?: string } | { name?: string }[] | null;
  const organizationName = Array.isArray(org) ? org[0]?.name ?? null : org?.name ?? null;
  return {
    id: row.id as string,
    organizationId: row.organization_id as string,
    organizationName,
    direction: (row.direction as string | null) ?? null,
    fromPhone: (row.from_phone as string | null) ?? null,
    toPhone: (row.to_phone as string | null) ?? null,
    status: (row.status as string | null) ?? null,
    durationSeconds: (row.duration_seconds as number | null) ?? null,
    recordingUrl: (row.recording_url as string | null) ?? null,
    startedAt: (row.started_at as string | null) ?? null,
    summary: (meta.summary as string | null) ?? null,
    sentiment: (meta.sentiment as string | null) ?? null,
    outcome: (meta.outcome as string | null) ?? inferOutcomeFromSummary((meta.summary as string | null) ?? null),
    bookingStatus: (meta.booking_status as string | null) ?? null,
    callerName: (meta.caller_name as string | null) ?? null,
  };
}

// RLS scopes rows: a MannaFlow admin sees every org's calls (each carrying its
// organizationName); a client admin sees only its own. Supabase-only feature.
export async function getDashboardCallLogs(): Promise<DashboardCallLog[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("call_logs")
    .select("*, organizations(name)")
    .order("started_at", { ascending: false, nullsFirst: false })
    .limit(500);
  if (error) throw error;
  return (data ?? []).map((row) => callLogFromRow(row as Record<string, unknown>));
}

// A lead counts as "booked" once it reaches JOB_BOOKED or any later stage —
// i.e. it's no longer just a quote/inquiry.
const BOOKED_STAGES = new Set<ContractorPipelineStage>([
  "JOB_BOOKED",
  "JOB_COMPLETE",
  "INVOICE_SENT",
  "PAID",
]);

export type OverviewStats = {
  totalCallsThisMonth: number;
  totalBookedCustomersThisMonth: number;
  bookedGrowthRatePercent: number;
  mostBookedService: string | null;
  mostBookedServiceCount: number;
  topServices: { type: string; count: number }[];
  bookedByMonth: { month: string; count: number }[];
};

// Overview-page KPI scorecards + charts.
// "Booked customer" = a call whose Retell custom_analysis_data.booking_status
// came back "booked" (see lib/retell.ts callLogRowFromRetell) — i.e. the voice
// agent actually secured the appointment on that call, not just a lead that
// progressed in the pipeline.
// "Top service booked" still comes from leads.service_type on booked-stage
// leads, since call_logs metadata doesn't carry a service type.
export async function getDashboardOverviewStats(): Promise<OverviewStats> {
  const supabase = await createServerSupabaseClient();

  const [{ data: leadRows, error: leadError }, { data: callRows, error: callError }] = await Promise.all([
    supabase.from("leads").select("current_stage, date_entered_stage, service_type"),
    supabase.from("call_logs").select("direction, started_at, metadata"),
  ]);
  if (leadError) throw leadError;
  if (callError) throw callError;
  const leads = leadRows ?? [];
  const calls = callRows ?? [];

  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const isBookedCall = (c: { metadata: unknown }) =>
    ((c.metadata as Record<string, unknown> | null)?.booking_status ?? null) === "booked";

  const totalCallsThisMonth = calls.filter(
    (c) => c.direction === "inbound" && c.started_at && new Date(c.started_at) >= startOfThisMonth
  ).length;

  const bookedThisMonth = calls.filter(
    (c) => isBookedCall(c) && c.started_at && new Date(c.started_at) >= startOfThisMonth
  ).length;
  const bookedLastMonth = calls.filter((c) => {
    if (!isBookedCall(c) || !c.started_at) return false;
    const started = new Date(c.started_at);
    return started >= startOfLastMonth && started < startOfThisMonth;
  }).length;
  const bookedGrowthRatePercent =
    bookedLastMonth === 0
      ? bookedThisMonth > 0
        ? 100
        : 0
      : Math.round(((bookedThisMonth - bookedLastMonth) / bookedLastMonth) * 100);

  const bookedLeads = leads.filter((r) => BOOKED_STAGES.has(r.current_stage as ContractorPipelineStage));
  const serviceCounts = bookedLeads.reduce<Record<string, number>>((all, r) => {
    const key = (r.service_type as string | null) ?? "Unknown";
    all[key] = (all[key] ?? 0) + 1;
    return all;
  }, {});
  const topServices = Object.entries(serviceCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({ type, count }));

  const bookedByMonth = [...Array(6)].map((_, i) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const count = bookedLeads.filter((r) => {
      const entered = new Date(r.date_entered_stage as string);
      return entered.getFullYear() === monthDate.getFullYear() && entered.getMonth() === monthDate.getMonth();
    }).length;
    return { month: monthDate.toLocaleString("en-US", { month: "short" }), count };
  });

  return {
    totalCallsThisMonth,
    totalBookedCustomersThisMonth: bookedThisMonth,
    bookedGrowthRatePercent,
    mostBookedService: topServices[0]?.type ?? null,
    mostBookedServiceCount: topServices[0]?.count ?? 0,
    topServices: topServices.slice(0, 5),
    bookedByMonth,
  };
}

const OUTCOME_LABELS: Record<string, string> = {
  user_hangup: "Caller ended call",
  agent_hangup: "Agent ended call",
  call_transfer: "Transferred",
  voicemail_reached: "Reached voicemail",
  dial_busy: "Line busy",
  max_duration_reached: "Max duration reached",
  error: "Call error",
};

export type CallLogAnalytics = {
  totalCalls: number;
  avgDurationSeconds: number;
  successRatePercent: number;
  positiveSentimentPercent: number;
  sentimentCounts: { label: string; count: number }[];
  outcomeCounts: { label: string; count: number }[];
  callVolumeByDay: { day: string; count: number }[];
  recentCalls: { id: string; startedAt: string | null; sentiment: string | null; summary: string | null }[];
};

// Call-log-only analytics for orgs (currently Union Health Network) that
// aren't using the lead pipeline / campaigns yet — everything here is
// derived from `call_logs`, sourced from the Retell webhook/backfill
// (lib/retell.ts), not from `leads`.
export async function getCallLogAnalytics(): Promise<CallLogAnalytics> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("call_logs")
    .select("id, started_at, duration_seconds, metadata")
    .order("started_at", { ascending: false, nullsFirst: false });
  if (error) throw error;
  const rows = data ?? [];
  const meta = (row: (typeof rows)[number]) => (row.metadata as Record<string, unknown> | null) ?? {};

  const totalCalls = rows.length;
  const durations = rows.map((r) => r.duration_seconds ?? 0).filter((d) => d > 0);
  const avgDurationSeconds = durations.length
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : 0;

  const successCount = rows.filter((r) => meta(r).successful === true).length;
  const successRatePercent = totalCalls ? Math.round((successCount / totalCalls) * 100) : 0;

  const sentimentTally: Record<string, number> = {};
  const outcomeTally: Record<string, number> = {};
  for (const r of rows) {
    const m = meta(r);
    const sentiment = (m.sentiment as string | null) ?? "Unknown";
    sentimentTally[sentiment] = (sentimentTally[sentiment] ?? 0) + 1;
    const reason = (m.disconnection_reason as string | null) ?? "Unknown";
    outcomeTally[reason] = (outcomeTally[reason] ?? 0) + 1;
  }
  const positiveSentimentPercent = totalCalls
    ? Math.round(((sentimentTally["Positive"] ?? 0) / totalCalls) * 100)
    : 0;

  const now = new Date();
  const callVolumeByDay = [...Array(14)].map((_, i) => {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (13 - i));
    const nextDay = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
    const count = rows.filter((r) => {
      if (!r.started_at) return false;
      const started = new Date(r.started_at);
      return started >= day && started < nextDay;
    }).length;
    return { day: day.toLocaleString("en-US", { day: "numeric", month: "short" }), count };
  });

  const recentCalls = rows.slice(0, 6).map((r) => {
    const m = meta(r);
    return {
      id: r.id as string,
      startedAt: (r.started_at as string | null) ?? null,
      sentiment: (m.sentiment as string | null) ?? null,
      summary: (m.summary as string | null) ?? null,
    };
  });

  return {
    totalCalls,
    avgDurationSeconds,
    successRatePercent,
    positiveSentimentPercent,
    sentimentCounts: Object.entries(sentimentTally)
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({ label, count })),
    outcomeCounts: Object.entries(outcomeTally)
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => ({ label: OUTCOME_LABELS[key] ?? key, count })),
    callVolumeByDay,
    recentCalls,
  };
}

export async function getSupabaseAnalytics() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("leads").select("current_stage, created_at, date_entered_stage, lead_source, service_type, urgency_level");
  if (error) throw error;
  const { count: campaignCount, error: campaignError } = await supabase.from("campaigns").select("id", { count: "exact", head: true }).eq("status", "ACTIVE");
  if (campaignError) throw campaignError;
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const rows = data ?? [];
  const countBy = (field: "lead_source" | "service_type" | "urgency_level") => Object.entries(rows.reduce<Record<string, number>>((all, row) => {
    const key = (row[field] as string | null) ?? ""; all[key] = (all[key] ?? 0) + 1; return all;
  }, {})).map(([key, count]) => [key || null, count] as const);
  const stageCounts = rows.reduce<Record<string, number>>((all, row) => { all[row.current_stage] = (all[row.current_stage] ?? 0) + 1; return all; }, {});
  return {
    totalLeads: rows.length,
    totalActive: rows.filter((r) => r.current_stage !== "PAID").length,
    newThisMonth: rows.filter((r) => new Date(r.created_at) >= startOfMonth).length,
    paidThisMonth: rows.filter((r) => r.current_stage === "PAID" && new Date(r.date_entered_stage) >= startOfMonth).length,
    emergencyCount: rows.filter((r) => r.urgency_level === "EMERGENCY" && r.current_stage !== "PAID").length,
    campaignCount: campaignCount ?? 0, stageCounts,
    leadSources: countBy("lead_source").sort((a, b) => b[1] - a[1]).slice(0, 5).map(([source, count]) => ({ source: source ?? "Unknown", count })),
    serviceTypes: countBy("service_type").map(([type, count]) => ({ type, count })),
    urgencyCounts: countBy("urgency_level").map(([level, count]) => ({ level, count })),
  };
}
