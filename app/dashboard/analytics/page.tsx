import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AnalyticsCards } from "@/components/dashboard/AnalyticsCards";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { HvacPipelineStage } from "@prisma/client";

async function getAnalytics() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [stageCounts, newThisMonth, paidThisMonth, leadSources, serviceTypes, urgencyCounts, totalLeads, totalActive, emergencyCount, campaignCount] =
    await Promise.all([
      prisma.hvacLead.groupBy({ by: ["currentStage"], _count: { id: true } }),
      prisma.hvacLead.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.hvacLead.count({ where: { currentStage: "PAID", dateEnteredStage: { gte: startOfMonth } } }),
      prisma.hvacLead.groupBy({ by: ["leadSource"], _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 5 }),
      prisma.hvacLead.groupBy({ by: ["serviceType"], _count: { id: true } }),
      prisma.hvacLead.groupBy({ by: ["urgencyLevel"], _count: { id: true } }),
      prisma.hvacLead.count(),
      prisma.hvacLead.count({ where: { currentStage: { not: "PAID" } } }),
      prisma.hvacLead.count({ where: { urgencyLevel: "EMERGENCY", currentStage: { notIn: ["PAID"] as HvacPipelineStage[] } } }),
      prisma.hvacCampaign.count({ where: { status: "ACTIVE" } }),
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
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const analytics = await getAnalytics();

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Analytics" showAddLead={false} />
      <div className="flex-1 overflow-auto px-6 py-5">
        <AnalyticsCards data={analytics} />
      </div>
    </div>
  );
}
