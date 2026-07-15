import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CampaignsExplorer } from "@/components/campaigns/CampaignsExplorer";

export default async function CampaignsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [campaigns, leads] = await Promise.all([
    prisma.hvacCampaign.findMany({
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { leads: true } } },
    }),
    prisma.hvacLead.findMany({
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
