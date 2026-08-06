import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type DashboardAccess = {
  userId: string;
  organizationId: string;
  role: "MANNAFLOW_ADMIN" | "CLIENT_ADMIN" | "CLIENT_MEMBER";
  organizationName: string;
};

export async function getDashboardAccess(): Promise<DashboardAccess | null> {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, organization_id, role, organizations(name)")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.organization_id || !profile.organizations) return null;
    const organization = Array.isArray(profile.organizations) ? profile.organizations[0] : profile.organizations;
    if (!organization?.name) return null;

    return {
      userId: profile.id,
      organizationId: profile.organization_id,
      role: profile.role as DashboardAccess["role"],
      organizationName: organization.name,
    };
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const user = await prisma.contractorTechUser.findUnique({
    where: { email: session.user.email },
    select: { id: true, organizationId: true, role: true, organization: { select: { name: true } } },
  });
  return user && {
    userId: user.id,
    organizationId: user.organizationId,
    role: user.role === "INTERNAL_ADMIN" ? "MANNAFLOW_ADMIN" : user.role,
    organizationName: user.organization.name,
  };
}

export function organizationScope(access: DashboardAccess) {
  return access.role === "MANNAFLOW_ADMIN" ? {} : { organizationId: access.organizationId };
}

export async function requireDashboardAccess() {
  const access = await getDashboardAccess();
  if (!access) return { access: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  return { access, response: null };
}
