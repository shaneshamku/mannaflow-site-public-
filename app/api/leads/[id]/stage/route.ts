import { NextRequest, NextResponse } from "next/server";
import type { ContractorPipelineStage } from "@/lib/types";
import { requireDashboardAccess } from "@/lib/dashboard-auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { leadFromRow } from "@/lib/dashboard-data";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Context) {
  const { access, response } = await requireDashboardAccess();
  if (!access) return response!;

  const { id } = await params;
  const { stage } = (await req.json()) as { stage: ContractorPipelineStage };
  const supabase = await createServerSupabaseClient();
  const { data: existing } = await supabase.from("leads").select("id, organization_id, current_stage").eq("id", id).maybeSingle();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { data: updated, error } = await supabase.from("leads").update({ current_stage: stage, date_entered_stage: new Date().toISOString() }).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await supabase.from("activities").insert({ lead_id: id, organization_id: existing.organization_id, type: "STAGE_CHANGE", content: `Stage changed from ${existing.current_stage} to ${stage}` });
  return NextResponse.json(leadFromRow(updated));
}
