import { NextRequest, NextResponse } from "next/server";
import { requireDashboardAccess } from "@/lib/dashboard-auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { leadFromRow, leadToSupabaseUpdate } from "@/lib/dashboard-data";

type Context = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Context) {
  const { access, response } = await requireDashboardAccess();
  if (!access) return response!;

  const { id } = await params;
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

export async function PATCH(req: NextRequest, { params }: Context) {
  const { access, response } = await requireDashboardAccess();
  if (!access) return response!;

  const { id } = await params;
  const data = await req.json();
  const supabase = await createServerSupabaseClient();
  const { data: lead, error } = await supabase.from("leads").update(leadToSupabaseUpdate(data)).eq("id", id).select().maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(leadFromRow(lead));
}
