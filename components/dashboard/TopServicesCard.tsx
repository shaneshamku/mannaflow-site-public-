import { SERVICE_TYPE_LABELS } from "@/lib/pipeline";
import type { OverviewStats } from "@/lib/dashboard-data";

const DOT_COLORS = ["#1B2A5B", "#33478A", "#5B7FBF", "#8FA8D6", "#C3D0EC"];

export function TopServicesCard({ services }: { services: OverviewStats["topServices"] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Top Services</h3>
        <span className="text-gray-300 text-sm leading-none">⋮</span>
      </div>
      {services.length === 0 ? (
        <p className="text-sm text-gray-400">No bookings yet.</p>
      ) : (
        <div className="space-y-3.5">
          {services.map((s, i) => (
            <div key={s.type} className="flex items-center gap-3">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: DOT_COLORS[i % DOT_COLORS.length] }}
              />
              <span className="text-sm text-gray-700 flex-1 truncate">
                {SERVICE_TYPE_LABELS[s.type] ?? s.type}
              </span>
              <span className="text-sm font-medium text-gray-900 shrink-0">{s.count} booked</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
