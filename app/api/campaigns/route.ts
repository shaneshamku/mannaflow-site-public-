import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireDashboardAccess, organizationScope } from "@/lib/dashboard-auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { campaignFromRow, getDashboardCampaigns, supabaseEnabled } from "@/lib/dashboard-data";

export async function GET() {
  const { access, response } = await requireDashboardAccess();
  if (!access) return response!;
  if (supabaseEnabled()) return NextResponse.json(await getDashboardCampaigns());

  const campaigns = await prisma.contractorCampaign.findMany({
    where: organizationScope(access),
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { leads: true } } },
  });

  return NextResponse.json(campaigns);
}

export async function POST(req: NextRequest) {
  const { access, response } = await requireDashboardAccess();
  if (!access) return response!;

  const data = await req.json();
  if (supabaseEnabled()) {
    const supabase = await createServerSupabaseClient();
    const { data: campaign, error } = await supabase.from("campaigns").insert({ organization_id: access.organizationId, name: data.name, description: data.description || null, status: data.status || "ACTIVE", steps: data.steps ?? [] }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(campaignFromRow(campaign), { status: 201 });
  }
  const campaign = await prisma.contractorCampaign.create({
    data: {
      organizationId: access.organizationId,
      name: data.name,
      description: data.description || null,
      status: data.status || "ACTIVE",
      steps: data.steps ?? [],
    },
  });

  return NextResponse.json(campaign, { status: 201 });
}
