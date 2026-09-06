import { redirect } from "next/navigation";
import { getDashboardAccess } from "@/lib/dashboard-auth";
import { isUnionHealthTheme } from "@/lib/theme";
import { getDashboardLeads, getDashboardOverviewStats } from "@/lib/dashboard-data";
import { PipelineBoard } from "@/components/pipeline/PipelineBoard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { OverviewScorecards } from "@/components/dashboard/OverviewScorecards";
import { TopServicesCard } from "@/components/dashboard/TopServicesCard";
import { BookedByMonthChart } from "@/components/dashboard/BookedByMonthChart";

export default async function DashboardPage() {
  const access = await getDashboardAccess();
  if (!access) redirect("/login");

  const unionTheme = isUnionHealthTheme(access.organizationName);
  const [leads, overviewStats] = await Promise.all([
    unionTheme ? Promise.resolve([]) : getDashboardLeads(),
    unionTheme ? getDashboardOverviewStats() : Promise.resolve(null),
  ]);

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Overview" showAddLead={!unionTheme} />
      <div className="flex-1 overflow-auto px-6 py-5 space-y-6">
        {unionTheme && overviewStats ? (
          <>
            <OverviewScorecards stats={overviewStats} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <BookedByMonthChart data={overviewStats.bookedByMonth} />
              </div>
              <TopServicesCard services={overviewStats.topServices} />
            </div>
          </>
        ) : (
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Lead Pipeline</h2>
            <PipelineBoard initialLeads={leads} unionTheme={unionTheme} />
          </div>
        )}
      </div>
    </div>
  );
}
