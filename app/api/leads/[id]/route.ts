import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireDashboardAccess, organizationScope } from "@/lib/dashboard-auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { leadFromRow, leadToSupabaseUpdate, supabaseEnabled } from "@/lib/dashboard-data";

type Context = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Context) {
  const { access, response } = await requireDashboardAccess();
  if (!access) return response!;

  const { id } = await params;
  if (supabaseEnabled()) {
    const supabase = await createServerSupabaseClient();
    const { data: row, error } = await supabase.from("leads").select("*").eq("id", id).maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const [{ data: activities }, { data: messages }] = await Promise.all([
      supabase.from("activities").select("*").eq("lead_id", id).order("occurred_at", { ascending: false }),
      supabase.from("messages").select("*").eq("lead_id", id).order("occurred_at"),
    ]);
    return NextResponse.json({ ...leadFromRow(row), activityLogs: (activities ?? []).map((a) => ({ ...a, timestamp: a.occurred_at })), chatMessages: (messages ?? []).map((m) => ({ ...m, timestamp: m.occurred_at })) });
  }
  const lead = await prisma.contractorLead.findFirst({
    where: { id, ...organizationScope(access) },
    include: {
      activityLogs: { orderBy: { timestamp: "desc" } },
      chatMessages: { orderBy: { timestamp: "asc" } },
    },
  });

  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(lead);
}

export async function PATCH(req: NextRequest, { params }: Context) {
  const { access, response } = await requireDashboardAccess();
  if (!access) return response!;

  const { id } = await params;
  const data = await req.json();
  if (supabaseEnabled()) {
    const supabase = await createServerSupabaseClient();
    const { data: lead, error } = await supabase.from("leads").update(leadToSupabaseUpdate(data)).eq("id", id).select().maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(leadFromRow(lead));
  }
  const existing = await prisma.contractorLead.findFirst({ where: { id, ...organizationScope(access) }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const safeData = { ...data };
  delete safeData.organizationId;
  const lead = await prisma.contractorLead.update({ where: { id }, data: safeData });
  return NextResponse.json(lead);
}
