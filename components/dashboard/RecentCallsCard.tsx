import Link from "next/link";
import type { CallLogAnalytics } from "@/lib/dashboard-data";

const SENTIMENT_STYLES: Record<string, string> = {
  Positive: "bg-green-50 text-green-700",
  Negative: "bg-red-50 text-red-700",
  Neutral: "bg-gray-100 text-gray-600",
};

function formatWhen(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function RecentCallsCard({ calls }: { calls: CallLogAnalytics["recentCalls"] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Call Highlights</h3>
      {calls.length === 0 ? (
        <p className="text-sm text-gray-400">No calls yet.</p>
      ) : (
        <div className="space-y-1">
          {calls.map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/calls/${c.id}`}
              className="group flex items-start gap-3 -mx-2 px-2 py-2 rounded-lg transition-colors hover:bg-gray-50"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{formatWhen(c.startedAt)}</span>
                  {c.callerName && <span className="text-xs font-medium text-gray-700">{c.callerName}</span>}
                  {c.sentiment && (
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${SENTIMENT_STYLES[c.sentiment] ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {c.sentiment}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 mt-1 line-clamp-2">{c.summary ?? "No summary available."}</p>
              </div>
              <span className="text-gray-300 group-hover:text-gray-400 shrink-0 mt-1">›</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
