import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HvacPipelineStage } from "@prisma/client";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [stageCounts, newThisMonth, paidThisMonth, leadSources, serviceTypes, urgencyCounts] =
    await Promise.all([
      prisma.hvacLead.groupBy({ by: ["currentStage"], _count: { id: true } }),
      prisma.hvacLead.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.hvacLead.count({ where: { currentStage: "PAID", dateEnteredStage: { gte: startOfMonth } } }),
      prisma.hvacLead.groupBy({ by: ["leadSource"], _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 5 }),
      prisma.hvacLead.groupBy({ by: ["serviceType"], _count: { id: true } }),
      prisma.hvacLead.groupBy({ by: ["urgencyLevel"], _count: { id: true } }),
    ]);

  const stageMap: Record<string, number> = {};
  for (const s of stageCounts) stageMap[s.currentStage] = s._count.id;

  const totalActive = await prisma.hvacLead.count({
    where: { currentStage: { notIn: ["PAID"] as HvacPipelineStage[] } },
  });

  const emergencyCount = await prisma.hvacLead.count({
    where: { urgencyLevel: "EMERGENCY", currentStage: { notIn: ["PAID"] as HvacPipelineStage[] } },
  });

  return NextResponse.json({
    totalActive,
    newThisMonth,
    paidThisMonth,
    emergencyCount,
    stageCounts: stageMap,
    leadSources: leadSources.map((l) => ({ source: l.leadSource, count: l._count.id })),
    serviceTypes: serviceTypes.map((s) => ({ type: s.serviceType, count: s._count.id })),
    urgencyCounts: urgencyCounts.map((u) => ({ level: u.urgencyLevel, count: u._count.id })),
  });
}
