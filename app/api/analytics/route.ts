import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ContractorPipelineStage } from "@prisma/client";
import { requireDashboardAccess, organizationScope } from "@/lib/dashboard-auth";
import { getSupabaseAnalytics, supabaseEnabled } from "@/lib/dashboard-data";

export async function GET() {
  const { access, response } = await requireDashboardAccess();
  if (!access) return response!;
  if (supabaseEnabled()) return NextResponse.json(await getSupabaseAnalytics());
  const scope = organizationScope(access);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [stageCounts, newThisMonth, paidThisMonth, leadSources, serviceTypes, urgencyCounts] =
    await Promise.all([
      prisma.contractorLead.groupBy({ by: ["currentStage"], where: scope, _count: { id: true } }),
      prisma.contractorLead.count({ where: { ...scope, createdAt: { gte: startOfMonth } } }),
      prisma.contractorLead.count({ where: { ...scope, currentStage: "PAID", dateEnteredStage: { gte: startOfMonth } } }),
      prisma.contractorLead.groupBy({ by: ["leadSource"], where: scope, _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 5 }),
      prisma.contractorLead.groupBy({ by: ["serviceType"], where: scope, _count: { id: true } }),
      prisma.contractorLead.groupBy({ by: ["urgencyLevel"], where: scope, _count: { id: true } }),
    ]);

  const stageMap: Record<string, number> = {};
  for (const s of stageCounts) stageMap[s.currentStage] = s._count.id;

  const totalActive = await prisma.contractorLead.count({
    where: { ...scope, currentStage: { notIn: ["PAID"] as ContractorPipelineStage[] } },
  });

  const emergencyCount = await prisma.contractorLead.count({
    where: { ...scope, urgencyLevel: "EMERGENCY", currentStage: { notIn: ["PAID"] as ContractorPipelineStage[] } },
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
