import { NextRequest, NextResponse } from "next/server";
import { CampaignStep, parseStepsInput, stepsToIntervals } from "@/lib/campaigns";
import { requireDashboardAccess } from "@/lib/dashboard-auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type Context = { params: Promise<{ id: string; leadId: string }> };

export async function GET(_req: NextRequest, { params }: Context) {
  const { access, response } = await requireDashboardAccess();
  if (!access) return response!;

  const { id, leadId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: assignment, error } = await supabase.from("campaign_leads").select("*, campaigns(steps)").eq("campaign_id", id).eq("lead_id", leadId).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!assignment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const hasOverride = assignment.step_overrides != null;
  const steps = (hasOverride ? assignment.step_overrides : (assignment.campaigns as { steps: CampaignStep[] }).steps) as CampaignStep[];
  const intervals = stepsToIntervals(steps ?? []);
  return NextResponse.json({ hasOverride, steps: (steps ?? []).map((step, i) => ({ ...step, intervalDays: intervals[i] })) });
}

export async function PATCH(req: NextRequest, { params }: Context) {
  const { access, response } = await requireDashboardAccess();
  if (!access) return response!;

  const { id, leadId } = await params;
  const data = await req.json();

  const parsed = parseStepsInput(data.steps);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const supabase = await createServerSupabaseClient();
  const { data: assignment, error } = await supabase.from("campaign_leads").update({ step_overrides: parsed.steps }).eq("campaign_id", id).eq("lead_id", leadId).select().maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!assignment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const intervals = stepsToIntervals(parsed.steps);
  return NextResponse.json({ hasOverride: true, steps: parsed.steps.map((step, i) => ({ ...step, intervalDays: intervals[i] })) });
}

export async function DELETE(_req: NextRequest, { params }: Context) {
  const { access, response } = await requireDashboardAccess();
  if (!access) return response!;

  const { id, leadId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: assignment, error } = await supabase.from("campaign_leads").update({ step_overrides: null }).eq("campaign_id", id).eq("lead_id", leadId).select().maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!assignment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
