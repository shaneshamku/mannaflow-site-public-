const services = [
  {
    name: "Chat Agent",
    tagline: "Always on. Never tired.",
    description:
      "A smart chatbot that handles inquiries, qualifies leads, and books appointments over SMS and on your website. Works while you are on the job, asleep, or away.",
  },
  {
    name: "Voice Agent",
    tagline: "Picks up when you can't.",
    description:
      "Answers calls, handles common questions, takes messages, and routes urgent requests. Every caller hears a professional response — every time.",
  },
  {
    name: "Agentic Dashboard",
    tagline: "Every lead. One place.",
    description:
      "See every conversation, every booked appointment, every active lead in a single dashboard. Know exactly where each lead stands without checking three different apps.",
  },
];

export default function Services() {
  return (
    <section
      id="services"
      style={{ backgroundColor: "#F5F2EC" }}
      className="py-12 md:py-20"
    >
      <div className="max-w-6xl mx-auto px-6">
        <p className="type-eyebrow mb-3 md:mb-4" style={{ color: "#627C85" }}>
          What you get
        </p>
        <h2 className="type-headline mb-8 md:mb-16" style={{ color: "#35524A" }}>
          Three tools. One monthly fee.
        </h2>

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-px"
          style={{ backgroundColor: "#A2E8DD" }}
        >
          {services.map((s) => (
            <div
              key={s.name}
              className="p-6 md:p-10"
              style={{ backgroundColor: "#F5F2EC" }}
            >
              <h3
                className="type-card-title mb-2"
                style={{ color: "#35524A" }}
              >
                {s.name}
              </h3>
              <p
                className="type-label mb-4 md:mb-6"
                style={{ color: "#32DE8A", letterSpacing: "0.12em" }}
              >
                {s.tagline}
              </p>
              <p className="type-body" style={{ color: "#627C85" }}>
                {s.description}
              </p>
            </div>
          ))}
        </div>

        <div className="pt-8 md:pt-12 text-center">
          <a href="#contact" className="btn-primary">
            See It In Action
          </a>
        </div>
      </div>
    </section>
  );
}
