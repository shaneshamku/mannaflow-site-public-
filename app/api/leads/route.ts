import { NextRequest, NextResponse } from "next/server";
import { requireDashboardAccess } from "@/lib/dashboard-auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { leadFromRow, leadToSupabaseInsert } from "@/lib/dashboard-data";

export async function GET() {
  const { access, response } = await requireDashboardAccess();
  if (!access) return response!;
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json((data ?? []).map((lead) => leadFromRow(lead)));
}

export async function POST(req: NextRequest) {
  const { access, response } = await requireDashboardAccess();
  if (!access) return response!;
  const data = await req.json();
  if (!data.phone) return NextResponse.json({ error: "phone required" }, { status: 400 });
  const supabase = await createServerSupabaseClient();
  const { data: lead, error } = await supabase.from("leads").insert(leadToSupabaseInsert(data, access.organizationId)).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const { error: activityError } = await supabase.from("activities").insert({ lead_id: lead.id, organization_id: lead.organization_id, type: "NOTE", content: "Lead created manually" });
  if (activityError) return NextResponse.json({ error: activityError.message }, { status: 400 });
  return NextResponse.json(leadFromRow(lead), { status: 201 });
}
