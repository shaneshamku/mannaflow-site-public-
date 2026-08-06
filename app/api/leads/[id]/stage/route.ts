import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ContractorPipelineStage } from "@prisma/client";
import { requireDashboardAccess, organizationScope } from "@/lib/dashboard-auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { leadFromRow, supabaseEnabled } from "@/lib/dashboard-data";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Context) {
  const { access, response } = await requireDashboardAccess();
  if (!access) return response!;

  const { id } = await params;
  const { stage } = (await req.json()) as { stage: ContractorPipelineStage };
  if (supabaseEnabled()) {
    const supabase = await createServerSupabaseClient();
    const { data: existing } = await supabase.from("leads").select("id, organization_id, current_stage").eq("id", id).maybeSingle();
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const { data: updated, error } = await supabase.from("leads").update({ current_stage: stage, date_entered_stage: new Date().toISOString() }).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await supabase.from("activities").insert({ lead_id: id, organization_id: existing.organization_id, type: "STAGE_CHANGE", content: `Stage changed from ${existing.current_stage} to ${stage}` });
    return NextResponse.json(leadFromRow(updated));
  }

  const lead = await prisma.contractorLead.findFirst({ where: { id, ...organizationScope(access) } });
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.contractorLead.update({
    where: { id },
    data: { currentStage: stage, dateEnteredStage: new Date() },
  });

  await prisma.contractorActivityLog.create({
    data: {
      leadId: id,
      organizationId: lead.organizationId,
      type: "STAGE_CHANGE",
      content: `Stage changed from ${lead.currentStage} to ${stage}`,
    },
  });

  return NextResponse.json(updated);
}
