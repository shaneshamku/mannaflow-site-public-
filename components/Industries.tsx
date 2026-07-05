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
      style={{ backgroundColor: "#EBE6DB" }}
      className="py-12 md:py-20"
    >
      <div className="max-w-6xl mx-auto px-6">
        <p className="type-eyebrow mb-3 md:mb-4" style={{ color: "#627C85" }}>
          What you&apos;re facing right now
        </p>
        <h2
          className="type-headline mb-8 md:mb-16"
          style={{ color: "#212926" }}
        >
          Your team is busy doing the work. Leads still need a response.
        </h2>

        <div
          className="grid grid-cols-2 gap-px"
          style={{ backgroundColor: "#C9C0AE" }}
        >
          {problems.map((p) => (
            <div
              key={p.title}
              className="p-4 sm:p-6 md:p-10"
              style={{ backgroundColor: "#EBE6DB" }}
            >
              <p
                className="mb-2 md:mb-3"
                style={{
                  fontFamily: "'MontaguSlab', Georgia, serif",
                  fontSize: "clamp(0.95rem, 2.4vw, 1.2rem)",
                  fontWeight: 700,
                  fontVariationSettings: "'opsz' 36, 'wght' 700",
                  lineHeight: 1.35,
                  color: "#212926",
                }}
              >
                {p.title}
              </p>
              <p
                className="type-body"
                style={{
                  color: "#3D4744",
                  fontSize: "clamp(0.8rem, 2.2vw, 0.95rem)",
                  lineHeight: 1.55,
                }}
              >
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
