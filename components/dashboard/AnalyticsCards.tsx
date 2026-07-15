const SERVICE_LABELS: Record<string, string> = {
  REPAIR: "Repair",
  INSTALLATION: "Installation",
  MAINTENANCE: "Maintenance",
  EMERGENCY: "Emergency",
};

const URGENCY_LABELS: Record<string, string> = {
  ROUTINE: "Routine",
  URGENT: "Urgent",
  EMERGENCY: "Emergency",
};

type Analytics = {
  totalLeads: number;
  totalActive: number;
  newThisMonth: number;
  paidThisMonth: number;
  emergencyCount: number;
  campaignCount: number;
  stageCounts: Record<string, number>;
  leadSources: { source: string; count: number }[];
  serviceTypes: { type: string | null; count: number }[];
  urgencyCounts: { level: string | null; count: number }[];
};

function StatCard({
  label,
  value,
  sub,
  urgent,
}: {
  label: string;
  value: number;
  sub?: string;
  urgent?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${urgent && value > 0 ? "bg-red-50 border-red-200" : "bg-white border-gray-200"}`}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${urgent && value > 0 ? "text-red-600" : "text-gray-900"}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export function AnalyticsCards({ data }: { data: Analytics }) {
  const maxSource = Math.max(...data.leadSources.map((s) => s.count), 1);
  const maxService = Math.max(...data.serviceTypes.map((s) => s.count), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Leads" value={data.totalLeads} />
        <StatCard label="Active Leads" value={data.totalActive} />
        <StatCard label="New This Month" value={data.newThisMonth} />
        <StatCard label="Jobs Paid This Month" value={data.paidThisMonth} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Open Emergencies" value={data.emergencyCount} urgent />
        <StatCard label="Active Campaigns" value={data.campaignCount} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Lead Sources</h3>
          {data.leadSources.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet</p>
          ) : (
            <div className="space-y-3">
              {data.leadSources.map((s) => (
                <div key={s.source}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{s.source}</span>
                    <span className="font-medium">{s.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(s.count / maxSource) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Service Types</h3>
          {data.serviceTypes.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet</p>
          ) : (
            <div className="space-y-3">
              {data.serviceTypes.map((s) => (
                <div key={s.type ?? "unknown"}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{s.type ? SERVICE_LABELS[s.type] ?? s.type : "Unknown"}</span>
                    <span className="font-medium">{s.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(s.count / maxService) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {data.urgencyCounts.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {data.urgencyCounts.map((u) => (
            <div key={u.level ?? "unknown"} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm text-center">
              <p className="text-xs text-gray-500 font-medium">{u.level ? URGENCY_LABELS[u.level] : "Unknown"}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{u.count}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
