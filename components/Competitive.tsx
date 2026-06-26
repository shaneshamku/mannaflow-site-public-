const rows = [
  {
    feature: "Setup time",
    others: "Weeks to months",
    us: "Days — guided setup included",
    usWins: true,
  },
  {
    feature: "Pricing",
    others: "Often $300–$1,500+/month depending on tier",
    us: "$297–$497/month flat — no per-user fees",
    usWins: true,
  },
  {
    feature: "AI-powered intake",
    others: "Basic or none — most tools use templated auto-replies",
    us: "Full conversational AI — qualifies leads and books jobs",
    usWins: true,
  },
  {
    feature: "Phone answering",
    others: "Not available — calls still go unanswered",
    us: "Voice agent picks up and handles callers 24/7",
    usWins: true,
  },
  {
    feature: "HVAC-specific",
    others: "Generic tools built for all industries",
    us: "Built specifically for HVAC lead qualification and booking",
    usWins: true,
  },
  {
    feature: "Contract required",
    others: "Annual contracts common, especially at higher tiers",
    us: "None — cancel any time",
    usWins: true,
  },
  {
    feature: "Operations management",
    others: "Strong — invoicing, dispatch, and job tracking are built in",
    us: "Not mannaflow's focus — pairs well with a tool like Jobber",
    usWins: false,
  },
];

const alternatives = [
  {
    name: "ServiceTitan",
    note: "Enterprise platform for 10+ tech operations. Powerful but priced for companies doing $2M+ in revenue, with complex onboarding. Not built for a local HVAC shop.",
  },
  {
    name: "Jobber / Housecall Pro",
    note: "Solid for scheduling and invoicing after the job is booked — but neither tool answers the phone or qualifies inbound leads. The gap mannaflow fills is exactly what they leave open.",
  },
  {
    name: "GoHighLevel (via agency)",
    note: "Many local agencies sell GHL-based packages for $400–$600/mo. The AI is generic, not HVAC-trained, and you depend on the agency to maintain it. Mannaflow is purpose-built and yours to control.",
  },
  {
    name: "Podium",
    note: "Strong for reviews and web chat, but no voice AI, no HVAC-specific qualification logic, and no phone answering. At a similar price, mannaflow delivers more of what an HVAC owner actually needs.",
  },
];

export default function Competitive() {
  return (
    <section
      id="compare"
      style={{ backgroundColor: "#F5F2EC" }}
      className="py-12 md:py-20"
    >
      <div className="max-w-6xl mx-auto px-6">
        <p className="type-eyebrow mb-3 md:mb-4" style={{ color: "#627C85" }}>
          How we compare
        </p>
        <h2 className="type-headline mb-3 md:mb-4" style={{ color: "#35524A" }}>
          Built for HVAC. Not bolted on.
        </h2>
        <p
          className="type-subhead mb-8 md:mb-16"
          style={{ color: "#627C85", maxWidth: "58ch" }}
        >
          Most tools in this space were built for large operations or general
          businesses — then marketed to HVAC contractors. mannaflow was designed
          from the ground up for the way a local HVAC business actually runs.
        </p>

        {/* Comparison table — scrollable on mobile */}
        <div className="overflow-x-auto mb-10 md:mb-20">
          <table style={{ width: "100%", minWidth: "520px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #35524A" }}>
                <th
                  style={{
                    textAlign: "left",
                    padding: "0.75rem 1rem 0.75rem 0",
                    fontFamily: "'MontaguSlab', Georgia, serif",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    fontVariationSettings: "'opsz' 24, 'wght' 700",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "#627C85",
                    width: "22%",
                  }}
                >
                  Feature
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "0.75rem 1rem",
                    fontFamily: "'MontaguSlab', Georgia, serif",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    fontVariationSettings: "'opsz' 24, 'wght' 700",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "#779CAB",
                    width: "39%",
                  }}
                >
                  Other tools
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "0.75rem 0 0.75rem 1rem",
                    fontFamily: "'MontaguSlab', Georgia, serif",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    fontVariationSettings: "'opsz' 24, 'wght' 700",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "#35524A",
                    width: "39%",
                  }}
                >
                  mannaflow
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.feature}
                  style={{ borderBottom: "1px solid #A2E8DD" }}
                >
                  <td
                    style={{
                      padding: "0.875rem 1rem 0.875rem 0",
                      fontFamily: "'MontaguSlab', Georgia, serif",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      fontVariationSettings: "'opsz' 36, 'wght' 600",
                      color: "#35524A",
                      verticalAlign: "top",
                    }}
                  >
                    {row.feature}
                  </td>
                  <td
                    style={{
                      padding: "0.875rem 1rem",
                      fontFamily: "'MontaguSlab', Georgia, serif",
                      fontSize: "0.875rem",
                      fontWeight: 400,
                      fontVariationSettings: "'opsz' 36, 'wght' 400",
                      color: "#779CAB",
                      lineHeight: 1.55,
                      verticalAlign: "top",
                    }}
                  >
                    {row.others}
                  </td>
                  <td
                    style={{
                      padding: "0.875rem 0 0.875rem 1rem",
                      fontFamily: "'MontaguSlab', Georgia, serif",
                      fontSize: "0.875rem",
                      fontWeight: row.usWins ? 600 : 400,
                      fontVariationSettings: row.usWins
                        ? "'opsz' 36, 'wght' 600"
                        : "'opsz' 36, 'wght' 400",
                      color: row.usWins ? "#35524A" : "#627C85",
                      lineHeight: 1.55,
                      verticalAlign: "top",
                    }}
                  >
                    {row.us}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Alternative breakdown */}
        <p className="type-eyebrow mb-5 md:mb-8" style={{ color: "#627C85" }}>
          What you may be comparing us to
        </p>

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-px"
          style={{ backgroundColor: "#A2E8DD" }}
        >
          {alternatives.map((alt) => (
            <div
              key={alt.name}
              className="p-5 md:p-8"
              style={{ backgroundColor: "#F5F2EC" }}
            >
              <h3
                className="type-card-title mb-2 md:mb-3"
                style={{ color: "#35524A" }}
              >
                {alt.name}
              </h3>
              <p className="type-body" style={{ color: "#627C85" }}>
                {alt.note}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
