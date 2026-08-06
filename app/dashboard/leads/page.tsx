import { redirect } from "next/navigation";
import { getDashboardAccess } from "@/lib/dashboard-auth";
import { getDashboardLeads } from "@/lib/dashboard-data";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { LeadsExplorer } from "@/components/leads/LeadsExplorer";

export default async function LeadsPage() {
  const access = await getDashboardAccess();
  if (!access) redirect("/login");

  const leads = await getDashboardLeads(access);

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Leads" />
      <div className="flex-1 min-h-0 px-6 py-5">
        <LeadsExplorer initialLeads={leads} />
      </div>
    </div>
  );
}
