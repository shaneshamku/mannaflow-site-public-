import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getDashboardAccess, organizationScope } from "@/lib/dashboard-auth";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CampaignsExplorer } from "@/components/campaigns/CampaignsExplorer";

export default async function CampaignsPage() {
  const access = await getDashboardAccess();
  if (!access) redirect("/login");

  const [campaigns, leads] = await Promise.all([
    prisma.contractorCampaign.findMany({
      where: organizationScope(access),
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { leads: true } } },
    }),
    prisma.contractorLead.findMany({
      where: organizationScope(access),
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, phone: true, currentStage: true },
    }),
  ]);

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Campaigns" showAddLead={false} />
      <div className="flex-1 min-h-0 px-6 py-5">
        <CampaignsExplorer
          initialCampaigns={campaigns.map((c) => ({ ...c, steps: (c.steps as any) ?? [] }))}
          allLeads={leads}
        />
      </div>
    </div>
  );
}
