import { NextResponse } from "next/server";
import { requireDashboardAccess } from "@/lib/dashboard-auth";
import { getSupabaseAnalytics } from "@/lib/dashboard-data";

export async function GET() {
  const { access, response } = await requireDashboardAccess();
  if (!access) return response!;
  return NextResponse.json(await getSupabaseAnalytics());
}
