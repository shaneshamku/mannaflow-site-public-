import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AnalyticsCards } from "@/components/dashboard/AnalyticsCards";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { HvacPipelineStage } from "@prisma/client";
import { getDashboardAccess, organizationScope } from "@/lib/dashboard-auth";

async function getAnalytics(scope: { organizationId?: string }) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [stageCounts, newThisMonth, paidThisMonth, leadSources, serviceTypes, urgencyCounts, totalLeads, totalActive, emergencyCount, campaignCount] =
    await Promise.all([
      prisma.hvacLead.groupBy({ by: ["currentStage"], where: scope, _count: { id: true } }),
      prisma.hvacLead.count({ where: { ...scope, createdAt: { gte: startOfMonth } } }),
      prisma.hvacLead.count({ where: { ...scope, currentStage: "PAID", dateEnteredStage: { gte: startOfMonth } } }),
      prisma.hvacLead.groupBy({ by: ["leadSource"], where: scope, _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 5 }),
      prisma.hvacLead.groupBy({ by: ["serviceType"], where: scope, _count: { id: true } }),
      prisma.hvacLead.groupBy({ by: ["urgencyLevel"], where: scope, _count: { id: true } }),
      prisma.hvacLead.count({ where: scope }),
      prisma.hvacLead.count({ where: { ...scope, currentStage: { not: "PAID" } } }),
      prisma.hvacLead.count({ where: { ...scope, urgencyLevel: "EMERGENCY", currentStage: { notIn: ["PAID"] as HvacPipelineStage[] } } }),
      prisma.hvacCampaign.count({ where: { ...scope, status: "ACTIVE" } }),
    ]);

  const stageMap: Record<string, number> = {};
  for (const s of stageCounts) stageMap[s.currentStage] = s._count.id;

  return {
    totalLeads,
    totalActive,
    newThisMonth,
    paidThisMonth,
    emergencyCount,
    campaignCount,
    stageCounts: stageMap,
    leadSources: leadSources.map((l) => ({ source: l.leadSource, count: l._count.id })),
    serviceTypes: serviceTypes.map((s) => ({ type: s.serviceType, count: s._count.id })),
    urgencyCounts: urgencyCounts.map((u) => ({ level: u.urgencyLevel, count: u._count.id })),
  };
}

export default async function AnalyticsPage() {
  const access = await getDashboardAccess();
  if (!access) redirect("/login");

  const analytics = await getAnalytics(organizationScope(access));

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Analytics" showAddLead={false} />
      <div className="flex-1 overflow-auto px-6 py-5">
        <AnalyticsCards data={analytics} />
      </div>
    </div>
  );
}
