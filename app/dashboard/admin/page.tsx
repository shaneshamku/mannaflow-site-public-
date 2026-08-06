import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { getDashboardAccess } from "@/lib/dashboard-auth";
import { ProvisionUserForm } from "@/components/dashboard/ProvisionUserForm";

export default async function AdminPage() {
  const access = await getDashboardAccess();
  if (!access) redirect("/login");
  if (access.role !== "MANNAFLOW_ADMIN") redirect("/dashboard");
  return <div className="flex flex-col h-full"><DashboardHeader title="Team provisioning" showAddLead={false} /><div className="flex-1 overflow-auto px-6 py-5"><ProvisionUserForm /></div></div>;
}
