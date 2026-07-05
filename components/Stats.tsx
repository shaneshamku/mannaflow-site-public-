const stats = [
  {
    label: "Time",
    value: "24/7",
    body: "Every call and message answered — nights, weekends, and mid-job.",
  },
  {
    label: "Money",
    value: "1",
    body: "One flat monthly rate. No per-call fees, no per-lead charges.",
  },
  {
    label: "Effort",
    value: "0",
    body: "Manual follow-ups your team has to remember. MannaFlow runs them.",
  },
  {
    label: "Transparency",
    value: "100%",
    body: "Of your leads, conversations, and bookings visible in one place.",
  },
];

export default function Stats() {
  return (
    <section
      id="stats"
      style={{ backgroundColor: "#14181A" }}
      className="py-12 md:py-20"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-px"
          style={{ backgroundColor: "#2A3134" }}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="p-6 md:p-8"
              style={{ backgroundColor: "#1C2224" }}
            >
              <p
                className="type-eyebrow mb-4 md:mb-6"
                style={{ color: "#D98E4A" }}
              >
                {stat.label}
              </p>
              <p
                className="mb-3 md:mb-4"
                style={{
                  fontFamily: "'MontaguSlab', Georgia, serif",
                  fontSize: "clamp(2.75rem, 5.5vw, 4.5rem)",
                  fontWeight: 100,
                  fontVariationSettings: "'opsz' 120, 'wght' 100",
                  lineHeight: 0.95,
                  letterSpacing: "-0.04em",
                  color: "#F5F2EC",
                }}
              >
                {stat.value}
              </p>
              <p className="type-body" style={{ color: "#8A9BA3" }}>
                {stat.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
