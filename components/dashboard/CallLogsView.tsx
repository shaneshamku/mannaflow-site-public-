import { type DashboardCallLog } from "@/lib/dashboard-data";

function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatWhen(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const SENTIMENT_STYLES: Record<string, string> = {
  Positive: "bg-green-50 text-green-700 border-green-200",
  Negative: "bg-red-50 text-red-700 border-red-200",
  Neutral: "bg-gray-50 text-gray-600 border-gray-200",
};

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold mt-1 text-gray-900">{value}</p>
    </div>
  );
}

// List view of Retell call logs (view "A"). `showOrg` renders an organization
// column for MannaFlow admins viewing calls across every org.
export function CallLogsView({ calls, showOrg }: { calls: DashboardCallLog[]; showOrg: boolean }) {
  const total = calls.length;
  const booked = calls.filter((c) => c.bookingStatus === "booked").length;
  const durations = calls.map((c) => c.durationSeconds ?? 0).filter((d) => d > 0);
  const avg = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
  const positive = calls.filter((c) => c.sentiment === "Positive").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Calls" value={total} />
        <StatCard label="Booked" value={booked} />
        <StatCard label="Avg Duration" value={formatDuration(avg)} />
        <StatCard label="Positive Sentiment" value={positive} />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3 font-medium">When</th>
                {showOrg && <th className="px-4 py-3 font-medium">Organization</th>}
                <th className="px-4 py-3 font-medium">Caller</th>
                <th className="px-4 py-3 font-medium">Dir.</th>
                <th className="px-4 py-3 font-medium">Duration</th>
                <th className="px-4 py-3 font-medium">Outcome</th>
                <th className="px-4 py-3 font-medium">Sentiment</th>
                <th className="px-4 py-3 font-medium">Summary</th>
                <th className="px-4 py-3 font-medium">Recording</th>
              </tr>
            </thead>
            <tbody>
              {calls.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 last:border-0 align-top">
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">{formatWhen(c.startedAt)}</td>
                  {showOrg && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                        {c.organizationName ?? "—"}
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-3 whitespace-nowrap text-gray-900">
                    {c.callerName || c.fromPhone || "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500 capitalize">{c.direction ?? "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">{formatDuration(c.durationSeconds)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">{c.outcome ?? "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {c.sentiment ? (
                      <span className={`inline-block rounded-full border px-2 py-0.5 text-xs ${SENTIMENT_STYLES[c.sentiment] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                        {c.sentiment}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-md text-gray-600">{c.summary ?? "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {c.recordingUrl ? (
                      <a href={c.recordingUrl} target="_blank" rel="noopener noreferrer" className="text-forest underline">
                        Listen
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
              {calls.length === 0 && (
                <tr>
                  <td colSpan={showOrg ? 9 : 8} className="px-4 py-10 text-center text-gray-400">
                    No calls yet. Use “Sync Retell calls” to backfill.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
