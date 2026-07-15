import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PipelineBoard } from "@/components/pipeline/PipelineBoard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const leads = await prisma.hvacLead.findMany({ orderBy: { createdAt: "desc" } });

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
