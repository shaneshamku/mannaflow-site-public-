export function ScorecardShell({
  label,
  value,
  pill,
}: {
  label: string;
  value: string;
  pill?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <span className="text-gray-300 text-sm leading-none">⋮</span>
      </div>
      <div className="flex items-end justify-between mt-2 gap-2">
        <p className="text-3xl font-bold text-gray-900 truncate">{value}</p>
        {pill}
      </div>
    </div>
  );
}

export function TrendPill({ percent }: { percent: number }) {
  const up = percent > 0;
  const flat = percent === 0;
  const style = flat
    ? "bg-gray-100 text-gray-600"
    : up
      ? "bg-green-50 text-green-700"
      : "bg-red-50 text-red-700";
  const arrow = flat ? "→" : up ? "↑" : "↓";
  return (
    <span className={`shrink-0 inline-flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${style}`}>
      {arrow} {Math.abs(percent)}%
    </span>
  );
}
