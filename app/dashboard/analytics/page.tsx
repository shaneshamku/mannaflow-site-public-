import { redirect } from "next/navigation";
import { AnalyticsCards } from "@/components/dashboard/AnalyticsCards";
import { CallAnalyticsCards } from "@/components/dashboard/CallAnalyticsCards";
import { BreakdownCard } from "@/components/dashboard/BreakdownCard";
import { CallVolumeChart } from "@/components/dashboard/CallVolumeChart";
import { RecentCallsCard } from "@/components/dashboard/RecentCallsCard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { getDashboardAccess } from "@/lib/dashboard-auth";
import { isUnionHealthTheme } from "@/lib/theme";
import { getSupabaseAnalytics, getCallLogAnalytics } from "@/lib/dashboard-data";

export default async function AnalyticsPage() {
  const access = await getDashboardAccess();
  if (!access) redirect("/login");

  const unionTheme = isUnionHealthTheme(access.organizationName);

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Analytics" showAddLead={false} />
      <div className="flex-1 overflow-auto px-6 py-5">
        {unionTheme ? (
          <CallOnlyAnalytics />
        ) : (
          <AnalyticsCards data={await getSupabaseAnalytics()} unionTheme={unionTheme} />
        )}
      </div>
    </div>
  );
}

async function CallOnlyAnalytics() {
  const stats = await getCallLogAnalytics();
  return (
    <div className="space-y-6">
      <CallAnalyticsCards stats={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <CallVolumeChart data={stats.callVolumeByDay} />
        </div>
        <RecentCallsCard calls={stats.recentCalls} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BreakdownCard title="Sentiment" items={stats.sentimentCounts} />
        <BreakdownCard title="Call Outcome" items={stats.outcomeCounts} barColorClass="bg-[#33478A]" />
      </div>
    </div>
  );
}
