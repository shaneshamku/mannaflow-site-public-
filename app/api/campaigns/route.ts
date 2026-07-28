import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireDashboardAccess, organizationScope } from "@/lib/dashboard-auth";

export async function GET() {
  const { access, response } = await requireDashboardAccess();
  if (!access) return response!;

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
