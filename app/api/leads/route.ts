import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireDashboardAccess, organizationScope } from "@/lib/dashboard-auth";

export async function GET() {
  const { access, response } = await requireDashboardAccess();
  if (!access) return response!;

  const leads = await prisma.hvacLead.findMany({
    where: organizationScope(access),
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { activityLogs: true } } },
  });

  return NextResponse.json(leads);
}

export async function POST(req: NextRequest) {
  const { access, response } = await requireDashboardAccess();
  if (!access) return response!;

  const data = await req.json();
  const lead = await prisma.hvacLead.create({
    data: {
      ...data,
      organizationId: access.organizationId,
      serviceType: data.serviceType || null,
      urgencyLevel: data.urgencyLevel || null,
      currentStage: "NEW_LEAD",
      dateEnteredStage: new Date(),
    },
  });

  await prisma.hvacActivityLog.create({
    data: { leadId: lead.id, organizationId: lead.organizationId, type: "NOTE", content: "Lead created manually" },
  });

  return NextResponse.json(lead, { status: 201 });
}
