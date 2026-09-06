import type { CallLogAnalytics } from "@/lib/dashboard-data";
import { ScorecardShell } from "./ScorecardShell";

function formatDuration(seconds: number): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function CallAnalyticsCards({ stats }: { stats: CallLogAnalytics }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <ScorecardShell label="Total Calls" value={String(stats.totalCalls)} />
      <ScorecardShell label="Avg Call Duration" value={formatDuration(stats.avgDurationSeconds)} />
      <ScorecardShell label="Call Success Rate" value={`${stats.successRatePercent}%`} />
      <ScorecardShell label="Positive Sentiment" value={`${stats.positiveSentimentPercent}%`} />
    </div>
  );
}
