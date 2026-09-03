import { SERVICE_TYPE_LABELS } from "@/lib/pipeline";
import type { OverviewStats } from "@/lib/dashboard-data";
import { ScorecardShell, TrendPill } from "./ScorecardShell";

export function OverviewScorecards({ stats }: { stats: OverviewStats }) {
  const serviceLabel = stats.mostBookedService
    ? SERVICE_TYPE_LABELS[stats.mostBookedService] ?? stats.mostBookedService
    : "—";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <ScorecardShell label="Total Calls" value={String(stats.totalCallsThisMonth)} />
      <ScorecardShell
        label="Total Booked Customers"
        value={String(stats.totalBookedCustomersThisMonth)}
        pill={<TrendPill percent={stats.bookedGrowthRatePercent} />}
      />
      <ScorecardShell
        label="Growth Rate"
        value={`${stats.bookedGrowthRatePercent > 0 ? "+" : ""}${stats.bookedGrowthRatePercent}%`}
        pill={<TrendPill percent={stats.bookedGrowthRatePercent} />}
      />
      <ScorecardShell
        label="Top Service Booked"
        value={serviceLabel}
        pill={
          stats.mostBookedServiceCount > 0 ? (
            <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-[#E7EAF5] text-[#1B2A5B]">
              {stats.mostBookedServiceCount} booked
            </span>
          ) : undefined
        }
      />
    </div>
  );
}
