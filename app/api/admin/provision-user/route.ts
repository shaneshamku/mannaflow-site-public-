import { NextRequest, NextResponse } from "next/server";
import { requireDashboardAccess } from "@/lib/dashboard-auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseEnabled } from "@/lib/dashboard-data";

type ProvisionRequest = {
  email?: string;
  password?: string;
  organizationName?: string;
  organizationId?: string;
  role?: "MANNAFLOW_ADMIN" | "CLIENT_ADMIN";
};

export async function POST(req: NextRequest) {
  const { access, response } = await requireDashboardAccess();
  if (!access) return response!;
  if (access.role !== "MANNAFLOW_ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!supabaseEnabled()) return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });

  const body = await req.json() as ProvisionRequest;
  const email = body.email?.trim().toLowerCase();
  const role = body.role;
  if (!email || !body.password || body.password.length < 12 || (role !== "MANNAFLOW_ADMIN" && role !== "CLIENT_ADMIN")) {
    return NextResponse.json({ error: "email, a password of at least 12 characters, and an allowed role are required" }, { status: 400 });
  }
  if (role === "CLIENT_ADMIN" && !body.organizationId && !body.organizationName?.trim()) {
    return NextResponse.json({ error: "Client admins require an existing organizationId or a new organizationName" }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();
  let organizationId = role === "MANNAFLOW_ADMIN" ? null : body.organizationId ?? null;
  if (role === "MANNAFLOW_ADMIN") {
    const { data: organization, error } = await admin.from("organizations").select("id").eq("kind", "INTERNAL").maybeSingle();
    if (error || !organization) return NextResponse.json({ error: error?.message ?? "MannaFlow Internal organization is missing" }, { status: 400 });
    organizationId = organization.id;
  }
  if (!organizationId && body.organizationName) {
    const { data: organization, error } = await admin.from("organizations").insert({ name: body.organizationName.trim(), kind: "CLIENT" }).select("id").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    organizationId = organization.id;
  }

  const { data: created, error: authError } = await admin.auth.admin.createUser({ email, password: body.password, email_confirm: true });
  if (authError || !created.user) return NextResponse.json({ error: authError?.message ?? "Unable to create user" }, { status: 400 });

  const { error: profileError } = await admin.from("profiles").insert({ id: created.user.id, email, role, organization_id: organizationId });
  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }
  return NextResponse.json({ id: created.user.id, email, role, organizationId }, { status: 201 });
}
