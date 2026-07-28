import { Sidebar } from "@/components/layout/Sidebar";
import { getDashboardAccess } from "@/lib/dashboard-auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const access = await getDashboardAccess();
  if (!access) redirect("/login");

  return (
    <div className="contractor-app flex h-screen overflow-hidden">
      <Sidebar organizationName={access.organizationName} internal={access.role === "INTERNAL_ADMIN"} />
      <main className="flex-1 min-w-0 overflow-hidden">{children}</main>
    </div>
  );
}
