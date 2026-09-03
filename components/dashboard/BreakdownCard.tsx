export function BreakdownCard({
  title,
  items,
  barColorClass = "bg-[#1B2A5B]",
}: {
  title: string;
  items: { label: string; count: number }[];
  barColorClass?: string;
}) {
  const max = Math.max(...items.map((i) => i.count), 1);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">No data yet</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>{item.label}</span>
                <span className="font-medium">{item.count}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${barColorClass}`}
                  style={{ width: `${(item.count / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
