import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getDashboardAccess, organizationScope } from "@/lib/dashboard-auth";
import { PipelineBoard } from "@/components/pipeline/PipelineBoard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default async function DashboardPage() {
  const access = await getDashboardAccess();
  if (!access) redirect("/login");

  const leads = await prisma.contractorLead.findMany({ where: organizationScope(access), orderBy: { createdAt: "desc" } });

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Overview" />
      <div className="flex-1 overflow-auto px-6 py-5 space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Lead Pipeline</h2>
          <PipelineBoard initialLeads={leads} />
        </div>
      </div>
    </div>
  );
}
