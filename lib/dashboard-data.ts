import { prisma } from "@/lib/prisma";
import { type ContractorLead, type ContractorPipelineStage, type ContractorServiceType, type ContractorUrgencyLevel } from "@prisma/client";
import { type DashboardAccess, organizationScope } from "@/lib/dashboard-auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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

export async function getDashboardLeads(access: DashboardAccess): Promise<ContractorLead[]> {
  if (!supabaseEnabled()) return prisma.contractorLead.findMany({ where: organizationScope(access), orderBy: { createdAt: "desc" } });
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
    outcome: (meta.outcome as string | null) ?? null,
    bookingStatus: (meta.booking_status as string | null) ?? null,
    callerName: (meta.caller_name as string | null) ?? null,
  };
}

// RLS scopes rows: a MannaFlow admin sees every org's calls (each carrying its
// organizationName); a client admin sees only its own. Supabase-only feature.
export async function getDashboardCallLogs(): Promise<DashboardCallLog[]> {
  if (!supabaseEnabled()) return [];
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("call_logs")
    .select("*, organizations(name)")
    .order("started_at", { ascending: false, nullsFirst: false })
    .limit(500);
  if (error) throw error;
  return (data ?? []).map((row) => callLogFromRow(row as Record<string, unknown>));
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
