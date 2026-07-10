const steps = [
  {
    title: "Map your current lead flow",
    body: "We look at calls, texts, website forms, after-hours inquiries, and follow-up gaps.",
  },
  {
    title: "Show the live demo",
    body: "You see how MannaFlow responds, qualifies, follows up, and organizes leads.",
  },
  {
    title: "Confirm the right setup",
    body: "If there is a fit, we recommend the simplest version to start with and confirm pricing on the call.",
  },
];

export default function NextSteps() {
  return (
    <section
      id="next-steps"
      style={{ backgroundColor: "#14181A" }}
      className="py-12 md:py-20"
    >
      <div className="max-w-6xl mx-auto px-6">
        <p className="type-eyebrow mb-3 md:mb-4" style={{ color: "#C9CFCC" }}>
          Simple Next Steps
        </p>
        <h2 className="type-headline mb-3 md:mb-4" style={{ color: "#F5F2EC" }}>
          See how MannaFlow would fit your business
        </h2>
        <p
          className="type-subhead mb-8 md:mb-16"
          style={{ color: "#C9CFCC", maxWidth: "58ch" }}
        >
          The demo is not a generic sales call. We will walk through how leads
          currently come into your business, where time is being lost, and what
          MannaFlow would handle first.
        </p>

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-px"
          style={{ backgroundColor: "#2A3134" }}
        >
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="p-5 md:p-8"
              style={{ backgroundColor: "#1C2224" }}
            >
              <p
                className="type-label mb-3"
                style={{ color: "#D98E4A", letterSpacing: "0.15em" }}
              >
                Step {i + 1}
              </p>
              <h3
                className="type-card-title mb-2 md:mb-3"
                style={{ color: "#F5F2EC" }}
              >
                {step.title}
              </h3>
              <p className="type-body" style={{ color: "#8A9BA3" }}>
                {step.body}
              </p>
            </div>
          ))}
        </div>

        <p
          className="type-body mt-8 md:mt-10"
          style={{ color: "#8A9BA3", maxWidth: "58ch" }}
        >
          No pressure. The goal is to find out whether this would actually save
          your team time.
        </p>
      </div>
    </section>
  );
}
