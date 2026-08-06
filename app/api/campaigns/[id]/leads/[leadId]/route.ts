import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CampaignStep, parseStepsInput, stepsToIntervals } from "@/lib/campaigns";
import { requireDashboardAccess, organizationScope } from "@/lib/dashboard-auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseEnabled } from "@/lib/dashboard-data";

type Context = { params: Promise<{ id: string; leadId: string }> };

export async function GET(_req: NextRequest, { params }: Context) {
  const { access, response } = await requireDashboardAccess();
  if (!access) return response!;

  const { id, leadId } = await params;
  if (supabaseEnabled()) {
    const supabase = await createServerSupabaseClient();
    const { data: assignment, error } = await supabase.from("campaign_leads").select("*, campaigns(steps)").eq("campaign_id", id).eq("lead_id", leadId).maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (!assignment) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const hasOverride = assignment.step_overrides != null;
    const steps = (hasOverride ? assignment.step_overrides : (assignment.campaigns as { steps: CampaignStep[] }).steps) as CampaignStep[];
    const intervals = stepsToIntervals(steps ?? []);
    return NextResponse.json({ hasOverride, steps: (steps ?? []).map((step, i) => ({ ...step, intervalDays: intervals[i] })) });
  }
  const assignment = await prisma.contractorCampaignLead.findFirst({
    where: { campaignId: id, leadId, ...organizationScope(access) },
    include: { campaign: true },
  });
  if (!assignment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const hasOverride = assignment.stepOverrides != null;
  const steps = (hasOverride
    ? (assignment.stepOverrides as unknown as CampaignStep[])
    : (assignment.campaign.steps as unknown as CampaignStep[])) ?? [];
  const intervals = stepsToIntervals(steps);
  const stepsWithIntervals = steps.map((step, i) => ({ ...step, intervalDays: intervals[i] }));

  return NextResponse.json({ hasOverride, steps: stepsWithIntervals });
}

export async function PATCH(req: NextRequest, { params }: Context) {
  const { access, response } = await requireDashboardAccess();
  if (!access) return response!;

  const { id, leadId } = await params;
  const data = await req.json();

  const parsed = parseStepsInput(data.steps);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  if (supabaseEnabled()) {
    const supabase = await createServerSupabaseClient();
    const { data: assignment, error } = await supabase.from("campaign_leads").update({ step_overrides: parsed.steps }).eq("campaign_id", id).eq("lead_id", leadId).select().maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (!assignment) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const intervals = stepsToIntervals(parsed.steps);
    return NextResponse.json({ hasOverride: true, steps: parsed.steps.map((step, i) => ({ ...step, intervalDays: intervals[i] })) });
  }

  const existing = await prisma.contractorCampaignLead.findFirst({
    where: { campaignId: id, leadId, ...organizationScope(access) },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.contractorCampaignLead.update({
    where: { campaignId_leadId: { campaignId: id, leadId } },
    data: { stepOverrides: parsed.steps },
  });

  const intervals = stepsToIntervals(parsed.steps);
  const stepsWithIntervals = parsed.steps.map((step, i) => ({ ...step, intervalDays: intervals[i] }));
  return NextResponse.json({ hasOverride: true, steps: stepsWithIntervals });
}

export async function DELETE(_req: NextRequest, { params }: Context) {
  const { access, response } = await requireDashboardAccess();
  if (!access) return response!;

  const { id, leadId } = await params;
  if (supabaseEnabled()) {
    const supabase = await createServerSupabaseClient();
    const { data: assignment, error } = await supabase.from("campaign_leads").update({ step_overrides: null }).eq("campaign_id", id).eq("lead_id", leadId).select().maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (!assignment) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  }
  const existing = await prisma.contractorCampaignLead.findFirst({
    where: { campaignId: id, leadId, ...organizationScope(access) },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.contractorCampaignLead.update({
    where: { campaignId_leadId: { campaignId: id, leadId } },
    data: { stepOverrides: Prisma.DbNull },
  });

  return NextResponse.json({ ok: true });
}
