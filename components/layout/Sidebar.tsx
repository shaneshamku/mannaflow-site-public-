"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const nav = [
  { href: "/dashboard", label: "Overview", icon: "⬛" },
  { href: "/dashboard/leads", label: "Leads", icon: "👤" },
  { href: "/dashboard/campaigns", label: "Campaigns", icon: "📣" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "📊" },
];

export function Sidebar({ organizationName, internal }: { organizationName: string; internal: boolean }) {
  const path = usePathname();

  return (
    <aside className="w-56 shrink-0 bg-gray-900 flex flex-col h-full">
      <div className="px-5 py-6 border-b border-gray-800">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xl">🔧</span>
          <h1 className="text-white font-bold text-lg leading-tight">MannaFlow</h1>
        </div>
        <p className="text-gray-400 text-xs">{internal ? "Internal workspace" : organizationName}</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map((item) => {
          const active =
            item.href === "/dashboard"
              ? path === item.href
              : path === item.href || path.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-orange-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-800">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <span>→</span> Sign out
        </button>
      </div>
    </aside>
  );
}
