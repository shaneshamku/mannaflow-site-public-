import { Sidebar } from "@/components/layout/Sidebar";
import { getDashboardAccess } from "@/lib/dashboard-auth";
import { isUnionHealthTheme } from "@/lib/theme";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const access = await getDashboardAccess();
  if (!access) redirect("/login");

  const unionTheme = isUnionHealthTheme(access.organizationName);

  return (
    <div className={`contractor-app flex h-screen overflow-hidden${unionTheme ? " theme-unionhealth" : ""}`}>
      <Sidebar
        organizationName={access.organizationName}
        internal={access.role === "MANNAFLOW_ADMIN"}
        unionTheme={unionTheme}
      />
      <main className="flex-1 min-w-0 overflow-hidden">{children}</main>
    </div>
  );
}
