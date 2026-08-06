import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireDashboardAccess, organizationScope } from "@/lib/dashboard-auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseEnabled } from "@/lib/dashboard-data";

type Context = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Context) {
  const { access, response } = await requireDashboardAccess();
  if (!access) return response!;

  const { id } = await params;
  const { leadId } = await req.json();
  if (!leadId) return NextResponse.json({ error: "leadId required" }, { status: 400 });
  if (supabaseEnabled()) {
    const supabase = await createServerSupabaseClient();
    const [{ data: campaign }, { data: lead }] = await Promise.all([
      supabase.from("campaigns").select("id, organization_id").eq("id", id).maybeSingle(),
      supabase.from("leads").select("id, organization_id").eq("id", leadId).maybeSingle(),
    ]);
    if (!campaign || !lead || campaign.organization_id !== lead.organization_id) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const { data: assignment, error } = await supabase.from("campaign_leads").upsert({ campaign_id: id, lead_id: leadId, organization_id: campaign.organization_id }, { onConflict: "campaign_id,lead_id" }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(assignment, { status: 201 });
  }

  const [campaign, lead] = await Promise.all([
    prisma.contractorCampaign.findFirst({ where: { id, ...organizationScope(access) }, select: { id: true } }),
    prisma.contractorLead.findFirst({ where: { id: leadId, ...organizationScope(access) }, select: { id: true } }),
  ]);
  if (!campaign || !lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const assignment = await prisma.contractorCampaignLead.upsert({
    where: { campaignId_leadId: { campaignId: id, leadId } },
    update: {},
    create: { campaignId: id, leadId, organizationId: access.organizationId },
  });

  return NextResponse.json(assignment, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: Context) {
  const { access, response } = await requireDashboardAccess();
  if (!access) return response!;

  const { id } = await params;
  const leadId = req.nextUrl.searchParams.get("leadId");
  if (!leadId) return NextResponse.json({ error: "leadId required" }, { status: 400 });
  if (supabaseEnabled()) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.from("campaign_leads").delete().eq("campaign_id", id).eq("lead_id", leadId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  await prisma.contractorCampaignLead.deleteMany({ where: { campaignId: id, leadId, ...organizationScope(access) } });
  return NextResponse.json({ ok: true });
}
