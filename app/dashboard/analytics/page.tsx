import { redirect } from "next/navigation";
import { AnalyticsCards } from "@/components/dashboard/AnalyticsCards";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { getDashboardAccess } from "@/lib/dashboard-auth";
import { getSupabaseAnalytics } from "@/lib/dashboard-data";

export default async function AnalyticsPage() {
  const access = await getDashboardAccess();
  if (!access) redirect("/login");

  const analytics = await getSupabaseAnalytics();

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Analytics" showAddLead={false} />
      <div className="flex-1 overflow-auto px-6 py-5">
        <AnalyticsCards data={analytics} />
      </div>
    </div>
  );
}
