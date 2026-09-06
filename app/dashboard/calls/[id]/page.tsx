import { notFound, redirect } from "next/navigation";
import { getDashboardAccess } from "@/lib/dashboard-auth";
import { isUnionHealthTheme } from "@/lib/theme";
import { getCallLogDetail } from "@/lib/dashboard-data";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CallDetailView } from "@/components/dashboard/CallDetailView";

export default async function CallDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const access = await getDashboardAccess();
  if (!access) redirect("/login");

  const { id } = await params;
  const call = await getCallLogDetail(id);
  if (!call) notFound();

  const unionTheme = isUnionHealthTheme(access.organizationName);

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Call detail" showAddLead={false} />
      <div className="flex-1 overflow-auto px-6 py-5">
        <CallDetailView call={call} unionTheme={unionTheme} />
      </div>
    </div>
  );
}
