import { NextResponse, type NextRequest } from "next/server";
import { refreshSupabaseSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return NextResponse.next({ request });
  }
  return refreshSupabaseSession(request);
}

export const config = {
  matcher: ["/login", "/dashboard/:path*", "/leads/:path*", "/api/:path*"],
};
