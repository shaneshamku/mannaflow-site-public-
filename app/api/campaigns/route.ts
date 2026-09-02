import { NextRequest, NextResponse } from "next/server";
import { requireDashboardAccess } from "@/lib/dashboard-auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { campaignFromRow, getDashboardCampaigns } from "@/lib/dashboard-data";

export async function GET() {
  const { access, response } = await requireDashboardAccess();
  if (!access) return response!;
  return NextResponse.json(await getDashboardCampaigns());
}

export async function POST(req: NextRequest) {
  const { access, response } = await requireDashboardAccess();
  if (!access) return response!;

  const data = await req.json();
  const supabase = await createServerSupabaseClient();
  const { data: campaign, error } = await supabase.from("campaigns").insert({ organization_id: access.organizationId, name: data.name, description: data.description || null, status: data.status || "ACTIVE", steps: data.steps ?? [] }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(campaignFromRow(campaign), { status: 201 });
}
