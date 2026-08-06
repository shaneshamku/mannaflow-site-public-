// NEXT_PUBLIC_SUPABASE_* are inlined at build time; force a clean recompile of
// this module so a cached build cannot serve stale (empty) values. Rebuild also
// captures the current server env (e.g. NEXTAUTH_SECRET) for this deployment.
import { createBrowserClient } from "@supabase/ssr";

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
