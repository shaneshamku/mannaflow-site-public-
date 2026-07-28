import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireDashboardAccess, organizationScope } from "@/lib/dashboard-auth";

type Context = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Context) {
  const { access, response } = await requireDashboardAccess();
  if (!access) return response!;

  const { id } = await params;
  const lead = await prisma.hvacLead.findFirst({
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
  const existing = await prisma.hvacLead.findFirst({ where: { id, ...organizationScope(access) }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const safeData = { ...data };
  delete safeData.organizationId;
  const lead = await prisma.hvacLead.update({ where: { id }, data: safeData });
  return NextResponse.json(lead);
}
