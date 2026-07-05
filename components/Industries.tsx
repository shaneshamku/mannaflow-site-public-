const problems = [
  {
    title: "On-Site Delays",
    body: "Leads drop while techs are driving, wrenching, or on a job.",
  },
  {
    title: "Costly Coverage",
    body: "Answering services add huge overhead without actually booking or nurturing the lead.",
  },
  {
    title: "Broken Follow-Up",
    body: "Sent quotes and half-finished chats depend on manual, easily forgotten reminders.",
  },
  {
    title: "Scattered Channels",
    body: "Calls, texts, and website forms are spread everywhere instead of in one clear system.",
  },
];

export default function Industries() {
  return (
    <section
      id="industries"
      style={{ backgroundColor: "#F5F2EC" }}
      className="py-12 md:py-20"
    >
      <div className="max-w-4xl mx-auto px-6">
        <p className="type-eyebrow mb-3 md:mb-4" style={{ color: "#627C85" }}>
          What you&apos;re facing right now
        </p>
        <h2
          className="type-headline mb-8 md:mb-12"
          style={{ color: "#212926" }}
        >
          Your team is busy doing the work. Leads still need a response.
        </h2>

        <div>
          {problems.map((p, i) => (
            <div
              key={p.title}
              className="py-5 md:py-6"
              style={
                i > 0 ? { borderTop: "1px solid #DDD5C6" } : undefined
              }
            >
              <div
                style={{
                  borderLeft: "3px solid #2E7D5B",
                  paddingLeft: "1.25rem",
                }}
              >
                <p
                  className="mb-1.5 md:mb-2"
                  style={{
                    fontFamily: "'MontaguSlab', Georgia, serif",
                    fontSize: "clamp(1.1rem, 2.4vw, 1.35rem)",
                    fontWeight: 700,
                    fontVariationSettings: "'opsz' 36, 'wght' 700",
                    lineHeight: 1.3,
                    color: "#212926",
                  }}
                >
                  {p.title}
                </p>
                <p
                  className="type-body"
                  style={{ color: "#3D4744", maxWidth: "52ch" }}
                >
                  {p.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
