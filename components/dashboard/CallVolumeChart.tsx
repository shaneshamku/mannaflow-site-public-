import type { CallLogAnalytics } from "@/lib/dashboard-data";

export function CallVolumeChart({ data }: { data: CallLogAnalytics["callVolumeByDay"] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const gridLines = [max, Math.round(max / 2), 0];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-gray-900">Call Volume (last 14 days)</h3>
        <span className="text-gray-300 text-sm leading-none">⋮</span>
      </div>
      <div className="flex-1 flex gap-3">
        <div className="flex flex-col justify-between text-[10px] text-gray-400 h-44">
          {gridLines.map((n, i) => (
            <span key={i}>{n}</span>
          ))}
        </div>
        <div className="flex-1 flex flex-col">
          <div className="relative h-44 flex items-end justify-between gap-1 border-b border-gray-100">
            {gridLines.slice(0, -1).map((n, i) => (
              <div
                key={i}
                className="absolute left-0 right-0 border-t border-gray-100"
                style={{ bottom: `${(n / max) * 100}%` }}
              />
            ))}
            {data.map((d) => (
              <div key={d.day} className="relative flex-1 h-full flex items-end justify-center">
                <div
                  className="w-full max-w-6 rounded-t-md bg-[#1B2A5B]"
                  style={{ height: `${Math.max((d.count / max) * 100, d.count > 0 ? 4 : 0)}%` }}
                  title={`${d.count} calls on ${d.day}`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between gap-1 mt-2">
            {data.map((d, i) => (
              <span
                key={d.day}
                className={`flex-1 text-center text-[10px] text-gray-500 ${i % 2 === 1 ? "" : "invisible"}`}
              >
                {d.day}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
