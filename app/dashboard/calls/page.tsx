import { redirect } from "next/navigation";
import { getDashboardAccess } from "@/lib/dashboard-auth";
import { isUnionHealthTheme } from "@/lib/theme";
import { getDashboardCallLogs } from "@/lib/dashboard-data";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CallLogsView } from "@/components/dashboard/CallLogsView";
import { RetellBackfillButton } from "@/components/dashboard/RetellBackfillButton";

export const dynamic = "force-dynamic";

export default async function CallsPage() {
  const access = await getDashboardAccess();
  if (!access) redirect("/login");

  const isAdmin = access.role === "MANNAFLOW_ADMIN";
  const calls = await getDashboardCallLogs();
  const unionTheme = isUnionHealthTheme(access.organizationName);

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Calls" showAddLead={false} />
      <div className="flex-1 overflow-auto px-6 py-5 space-y-4">
        {isAdmin && (
          <div className="flex justify-end">
            <RetellBackfillButton />
          </div>
        )}
        <CallLogsView calls={calls} showOrg={isAdmin} unionTheme={unionTheme} />
      </div>
    </div>
  );
}
