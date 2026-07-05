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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="grid items-center gap-5 md:gap-6 p-6 md:p-8"
              style={{
                gridTemplateColumns: "minmax(7.5rem, 2fr) 1px 3fr",
                backgroundColor: "#1C2224",
                border: "1px solid #2A3134",
                borderRadius: "14px",
              }}
            >
              <div>
                <p
                  className="mb-2 md:mb-3"
                  style={{
                    fontFamily: "'MontaguSlab', Georgia, serif",
                    fontSize: "clamp(0.65rem, 1.7vw, 0.9rem)",
                    fontWeight: 700,
                    fontVariationSettings: "'opsz' 24, 'wght' 700",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "#D98E4A",
                  }}
                >
                  {stat.label}
                </p>
                <p
                  style={{
                    fontFamily: "'MontaguSlab', Georgia, serif",
                    fontSize: "clamp(3.25rem, 5.5vw, 4.5rem)",
                    fontWeight: 100,
                    fontVariationSettings: "'opsz' 120, 'wght' 100",
                    lineHeight: 0.95,
                    letterSpacing: "-0.04em",
                    color: "#F5F2EC",
                  }}
                >
                  {stat.value}
                </p>
              </div>

              <div
                aria-hidden
                style={{
                  backgroundColor: "#2A3134",
                  width: "1px",
                  alignSelf: "stretch",
                }}
              />

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
