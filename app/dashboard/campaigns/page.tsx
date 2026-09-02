import { redirect } from "next/navigation";
import { getDashboardAccess } from "@/lib/dashboard-auth";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CampaignsExplorer } from "@/components/campaigns/CampaignsExplorer";
import { getDashboardCampaigns, getDashboardLeads } from "@/lib/dashboard-data";

export default async function CampaignsPage() {
  const access = await getDashboardAccess();
  if (!access) redirect("/login");

  const [campaigns, leads] = await Promise.all([getDashboardCampaigns(), getDashboardLeads()]);

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Campaigns" showAddLead={false} />
      <div className="flex-1 min-h-0 px-6 py-5">
        <CampaignsExplorer
          initialCampaigns={campaigns.map((c) => ({ ...c, steps: (c.steps as never[]) ?? [] }))}
          allLeads={leads}
        />
      </div>
    </div>
  );
}
