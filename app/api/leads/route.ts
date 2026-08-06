import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireDashboardAccess, organizationScope } from "@/lib/dashboard-auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { leadFromRow, leadToSupabaseInsert, supabaseEnabled } from "@/lib/dashboard-data";

export async function GET() {
  const { access, response } = await requireDashboardAccess();
  if (!access) return response!;
  if (supabaseEnabled()) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json((data ?? []).map((lead) => leadFromRow(lead)));
  }

  const leads = await prisma.contractorLead.findMany({
    where: organizationScope(access),
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { activityLogs: true } } },
  });

  return NextResponse.json(leads);
}

export async function POST(req: NextRequest) {
  const { access, response } = await requireDashboardAccess();
  if (!access) return response!;
  if (supabaseEnabled()) {
    const data = await req.json();
    if (!data.phone) return NextResponse.json({ error: "phone required" }, { status: 400 });
    const supabase = await createServerSupabaseClient();
    const { data: lead, error } = await supabase.from("leads").insert(leadToSupabaseInsert(data, access.organizationId)).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    const { error: activityError } = await supabase.from("activities").insert({ lead_id: lead.id, organization_id: lead.organization_id, type: "NOTE", content: "Lead created manually" });
    if (activityError) return NextResponse.json({ error: activityError.message }, { status: 400 });
    return NextResponse.json(leadFromRow(lead), { status: 201 });
  }

  const data = await req.json();
  const lead = await prisma.contractorLead.create({
    data: {
      ...data,
      organizationId: access.organizationId,
      serviceType: data.serviceType || null,
      urgencyLevel: data.urgencyLevel || null,
      currentStage: "NEW_LEAD",
      dateEnteredStage: new Date(),
    },
  });

  await prisma.contractorActivityLog.create({
    data: { leadId: lead.id, organizationId: lead.organizationId, type: "NOTE", content: "Lead created manually" },
  });

  return NextResponse.json(lead, { status: 201 });
}
