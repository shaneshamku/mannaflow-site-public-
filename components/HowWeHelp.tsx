const services = [
  {
    icon: "📞",
    name: "Voice Agent",
    description:
      "Answers your calls 24/7, qualifies the job, and books the appointment before a competitor picks up.",
    href: "/demo#voice-agent",
  },
  {
    icon: "💬",
    name: "Chatbot",
    description:
      "Handles website and text conversations, collects job details, and moves visitors toward a booked time.",
    href: "/demo#chatbot",
  },
  {
    icon: "📊",
    name: "Dashboard",
    description:
      "Every lead, conversation, and next step organized in one place, so you always know what's happening.",
    href: "/demo",
  },
  {
    icon: "🔁",
    name: "Nurture Campaign",
    description:
      "Timed follow-ups for open quotes and past customers, so no opportunity goes cold.",
    href: "/demo#nurture-campaign",
  },
];

export default function HowWeHelp() {
  return (
    <section
      id="how-it-works"
      style={{ backgroundColor: "#F5F2EC" }}
      className="py-12 md:py-20"
    >
      <div className="max-w-6xl mx-auto px-6">
        <p className="type-eyebrow mb-3 md:mb-4" style={{ color: "#627C85" }}>
          How We Help
        </p>
        <h2
          className="type-headline mb-8 md:mb-16"
          style={{ color: "#212926" }}
        >
          The lead work your team should not have to chase.
        </h2>

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-px"
          style={{ backgroundColor: "#DDD5C6" }}
        >
          {services.map((s) => (
            <div
              key={s.name}
              className="p-6 md:p-10 text-center"
              style={{
                backgroundColor: "#F5F2EC",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <span
                aria-hidden
                className="mb-3 md:mb-4"
                style={{ fontSize: "2rem", lineHeight: 1 }}
              >
                {s.icon}
              </span>
              <h3
                className="type-card-title mb-2 md:mb-3"
                style={{
                  color: "#212926",
                  fontWeight: 700,
                  fontVariationSettings: "'opsz' 36, 'wght' 700",
                }}
              >
                {s.name}
              </h3>
              <p
                className="type-body mb-5 md:mb-6"
                style={{ color: "#3D4744", maxWidth: "44ch" }}
              >
                {s.description}
              </p>
              <a
                href={s.href}
                className="btn-outline-dark"
                style={{
                  marginTop: "auto",
                  padding: "0.625rem 1.25rem",
                  fontSize: "0.75rem",
                }}
              >
                Click Here for Demo
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
