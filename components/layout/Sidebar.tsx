"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import {
  LayoutDashboard,
  Users,
  Megaphone,
  Phone,
  BarChart3,
  Settings,
  LogOut,
  Wrench,
} from "lucide-react";
import type { ComponentType } from "react";

const nav = [
  { href: "/dashboard", label: "Overview", icon: "⬛", Icon: LayoutDashboard },
  { href: "/dashboard/leads", label: "Leads", icon: "👤", Icon: Users, hideForUnion: true },
  { href: "/dashboard/campaigns", label: "Campaigns", icon: "📣", Icon: Megaphone, hideForUnion: true },
  { href: "/dashboard/calls", label: "Calls", icon: "📞", Icon: Phone },
  { href: "/dashboard/analytics", label: "Analytics", icon: "📊", Icon: BarChart3 },
];

export function Sidebar({
  organizationName,
  internal,
  unionTheme = false,
}: {
  organizationName: string;
  internal: boolean;
  unionTheme?: boolean;
}) {
  const path = usePathname();

  async function handleSignOut() {
    await createBrowserSupabaseClient().auth.signOut();
    window.location.assign("/login");
  }

  return (
    <aside
      className={`w-56 shrink-0 flex flex-col h-full ${unionTheme ? "bg-[#1B2A5B]" : "bg-gray-900"}`}
    >
      <div className={`px-5 py-6 border-b ${unionTheme ? "border-white/10" : "border-gray-800"}`}>
        <div className="flex items-center gap-2 mb-0.5">
          {unionTheme ? (
            <Wrench className="w-5 h-5 text-white" strokeWidth={2} />
          ) : (
            <span className="text-xl">🔧</span>
          )}
          <h1 className="text-white font-bold text-lg leading-tight">MannaFlow</h1>
        </div>
        <p className={unionTheme ? "text-white/60 text-xs" : "text-gray-400 text-xs"}>
          {internal ? "Internal workspace" : organizationName}
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {[
          ...nav.filter((item) => !(unionTheme && item.hideForUnion)),
          ...(internal ? [{ href: "/dashboard/admin", label: "Team", icon: "⚙️", Icon: Settings as ComponentType<{ className?: string }> }] : []),
        ].map((item) => {
          const active =
            item.href === "/dashboard"
              ? path === item.href
              : path === item.href || path.startsWith(item.href + "/");
          const ItemIcon = item.Icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? unionTheme
                    ? "bg-[#33478A] text-white"
                    : "bg-orange-600 text-white"
                  : unionTheme
                    ? "text-white/60 hover:bg-white/10 hover:text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {unionTheme ? (
                <ItemIcon className="w-4 h-4" />
              ) : (
                <span className="text-base">{item.icon}</span>
              )}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className={`px-3 py-4 border-t ${unionTheme ? "border-white/10" : "border-gray-800"}`}>
        <button
          onClick={handleSignOut}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            unionTheme
              ? "text-white/60 hover:bg-white/10 hover:text-white"
              : "text-gray-400 hover:bg-gray-800 hover:text-white"
          }`}
        >
          {unionTheme ? <LogOut className="w-4 h-4" /> : <span>→</span>} Sign out
        </button>
      </div>
    </aside>
  );
}
