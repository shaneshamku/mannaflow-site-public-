const tiers = [
  {
    name: "Starter",
    price: "297",
    description:
      "For HVAC businesses that are done losing leads to missed calls.",
    features: [
      "Chat Agent (website + SMS)",
      "Missed call auto-response",
      "Lead capture dashboard",
      "Up to 500 conversations per month",
      "Email support",
    ],
    highlight: false,
    cta: "Book a Free Demo",
  },
  {
    name: "Growth",
    price: "497",
    description:
      "For established businesses ready to fully automate their front office.",
    features: [
      "Chat Agent and Voice Agent",
      "Missed call and voicemail AI",
      "Full agentic dashboard with reporting",
      "Unlimited conversations",
      "All HVAC lead types covered",
      "Priority support",
    ],
    highlight: true,
    cta: "Book a Free Demo",
  },
];

export default function Pricing() {
  return (
    <section
      id="pricing"
      style={{ backgroundColor: "#35524A" }}
      className="py-12 md:py-20"
    >
      <div className="max-w-5xl mx-auto px-6">
        <p className="type-eyebrow mb-3 md:mb-4" style={{ color: "#32DE8A" }}>
          Pricing
        </p>
        <h2 className="type-headline mb-3 md:mb-4" style={{ color: "#F5F2EC" }}>
          Simple pricing for real businesses.
        </h2>
        <p
          className="type-subhead mb-8 md:mb-16"
          style={{ color: "#A2E8DD", maxWidth: "50ch" }}
        >
          No enterprise contracts. No surprise fees. Cancel anytime.
        </p>

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-px"
          style={{ backgroundColor: "#627C85" }}
        >
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className="p-6 md:p-12 flex flex-col"
              style={{
                backgroundColor: tier.highlight ? "#F5F2EC" : "#35524A",
              }}
            >
              {/* Badge row */}
              <div style={{ minHeight: "1.5rem", marginBottom: "0.75rem" }}>
                {tier.highlight && (
                  <span
                    className="type-label"
                    style={{
                      color: "#35524A",
                      backgroundColor: "#32DE8A",
                      padding: "0.3rem 0.75rem",
                      letterSpacing: "0.15em",
                    }}
                  >
                    Most popular
                  </span>
                )}
              </div>

              <h3
                className="type-card-title mb-2"
                style={{ color: tier.highlight ? "#35524A" : "#F5F2EC" }}
              >
                {tier.name}
              </h3>

              <div className="flex items-baseline gap-2 mb-3 md:mb-4">
                <span
                  style={{
                    fontFamily: "'MontaguSlab', Georgia, serif",
                    fontSize: "clamp(2.25rem, 6vw, 3rem)",
                    fontWeight: 300,
                    fontVariationSettings: "'opsz' 96, 'wght' 300",
                    lineHeight: 1,
                    color: tier.highlight ? "#35524A" : "#32DE8A",
                    letterSpacing: "-0.03em",
                  }}
                >
                  ${tier.price}
                </span>
                <span
                  className="type-label"
                  style={{
                    color: tier.highlight ? "#627C85" : "#779CAB",
                    letterSpacing: "0.1em",
                  }}
                >
                  / month
                </span>
              </div>

              <p
                className="type-body mb-6 md:mb-8"
                style={{ color: tier.highlight ? "#627C85" : "#A2E8DD" }}
              >
                {tier.description}
              </p>

              <ul className="space-y-3 mb-8 md:mb-10 flex-1">
                {tier.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-3">
                    <span
                      style={{
                        color: "#32DE8A",
                        flexShrink: 0,
                        marginTop: "2px",
                        fontWeight: 700,
                      }}
                    >
                      &mdash;
                    </span>
                    <span
                      className="type-body"
                      style={{
                        color: tier.highlight ? "#35524A" : "#F5F2EC",
                      }}
                    >
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>

              <div>
                <a
                  href="#contact"
                  className={tier.highlight ? "btn-primary" : "btn-outline-light"}
                >
                  {tier.cta}
                </a>
              </div>
            </div>
          ))}
        </div>

        <p
          className="type-label mt-8 md:mt-10 text-center"
          style={{ color: "#779CAB", letterSpacing: "0.12em" }}
        >
          Not sure which plan fits? The demo will answer that. It's free.
        </p>
      </div>
    </section>
  );
}
