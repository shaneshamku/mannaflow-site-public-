const features = [
  {
    problem: "Missed calls while your team is on site",
    solution:
      "When your techs are working, driving, or handling emergencies, new leads can sit too long before someone responds.",
  },
  {
    problem: "Expensive coverage after hours",
    solution:
      "Call centers and overtime can help, but they add cost and still do not always qualify, book, and follow up the way your business needs.",
  },
  {
    problem: "Follow-up falls on whoever has time",
    solution:
      "Quotes, missed calls, and half-finished conversations often depend on manual reminders that are easy to forget.",
  },
  {
    problem: "Leads spread across too many places",
    solution:
      "Phone calls, texts, website forms, and chat messages create extra admin when they are not captured in one clear system.",
  },
];

export default function Industries() {
  return (
    <section
      id="industries"
      style={{ backgroundColor: "#35524A" }}
      className="py-12 md:py-20"
    >
      <div className="max-w-6xl mx-auto px-6">
        <p className="type-eyebrow mb-3 md:mb-4" style={{ color: "#32DE8A" }}>
          Built for busy contractors
        </p>
        <h2 className="type-headline mb-4 md:mb-6" style={{ color: "#F5F2EC" }}>
          Your team is busy doing the work. Leads still need a response.
        </h2>
        <p
          className="type-subhead mb-8 md:mb-16"
          style={{ color: "#A2E8DD", maxWidth: "58ch" }}
        >
          Most contractors already have a way to handle calls. The problem is
          the cost, the delays, and the follow-up that still slips through when
          the day gets busy.
        </p>

        <div
          className="grid grid-cols-2 gap-px"
          style={{ backgroundColor: "#627C85" }}
        >
          {features.map((f) => (
            <div
              key={f.problem}
              className="p-4 sm:p-6 md:p-10"
              style={{ backgroundColor: "#35524A" }}
            >
              <p
                className="mb-2 md:mb-3"
                style={{
                  fontFamily: "'MontaguSlab', Georgia, serif",
                  fontSize: "clamp(0.85rem, 2.2vw, 1.05rem)",
                  fontWeight: 600,
                  fontVariationSettings: "'opsz' 36, 'wght' 600",
                  lineHeight: 1.4,
                  color: "#F5F2EC",
                }}
              >
                {f.problem}
              </p>
              <p
                className="type-body"
                style={{
                  color: "#A2E8DD",
                  fontSize: "clamp(0.8rem, 2.2vw, 0.95rem)",
                  lineHeight: 1.55,
                }}
              >
                {f.solution}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
