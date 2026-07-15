import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { LeadsExplorer } from "@/components/leads/LeadsExplorer";

export default async function LeadsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const leads = await prisma.hvacLead.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Leads" />
      <div className="flex-1 min-h-0 px-6 py-5">
        <LeadsExplorer initialLeads={leads} />
      </div>
    </div>
  );
}
