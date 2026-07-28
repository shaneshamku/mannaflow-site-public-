import { ContractorUserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type DashboardAccess = {
  userId: string;
  organizationId: string;
  role: ContractorUserRole;
  organizationName: string;
};

export async function getDashboardAccess(): Promise<DashboardAccess | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const user = await prisma.contractorTechUser.findUnique({
    where: { email: session.user.email },
    select: { id: true, organizationId: true, role: true, organization: { select: { name: true } } },
  });
  return user && { userId: user.id, organizationId: user.organizationId, role: user.role, organizationName: user.organization.name };
}

export function organizationScope(access: DashboardAccess) {
  return access.role === ContractorUserRole.INTERNAL_ADMIN ? {} : { organizationId: access.organizationId };
}

export async function requireDashboardAccess() {
  const access = await getDashboardAccess();
  if (!access) return { access: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  return { access, response: null };
}
