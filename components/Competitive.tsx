import RaceDemo from "./demos/RaceDemo"

const rows = [
  {
    option: "Internal office staff",
    works: "Personal, familiar with the business",
    messy: "Limited hours, high workload, manual follow-up",
    isUs: false,
  },
  {
    option: "Technicians answering calls",
    works: "Fast when available",
    messy: "Interrupts jobs, creates inconsistent lead handling",
    isUs: false,
  },
  {
    option: "Call centers",
    works: "Helpful for basic coverage",
    messy:
      "Can be costly, may only take messages, often lacks job-specific follow-up",
    isUs: false,
  },
  {
    option: "Generic chat tools",
    works: "Easy to add to a website",
    messy: "Often disconnected from calls, texts, booking, and follow-up",
    isUs: false,
  },
  {
    option: "MannaFlow",
    works: "Built around contractor lead response",
    messy:
      "Best fit for businesses that already receive leads and want a cleaner way to handle them",
    isUs: true,
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
          Why Contractors Use MannaFlow
        </p>
        <h2 className="type-headline mb-3 md:mb-4" style={{ color: "#35524A" }}>
          A lighter way to handle lead response.
        </h2>
        <p
          className="type-subhead mb-8 md:mb-16"
          style={{ color: "#35524A", maxWidth: "58ch" }}
        >
          Many contractors already rely on office staff, technicians, or call
          centers to keep up with new inquiries. MannaFlow is designed to
          support that process, reduce the manual load, and keep leads moving
          without forcing a full system change.
        </p>

        {/* Speed race: call center vs MannaFlow */}
        <div className="mb-10 md:mb-20">
          <h3
            className="type-card-title mb-2"
            style={{ color: "#35524A" }}
          >
            Same customer. Two ways it can go.
          </h3>
          <p className="type-body mb-6" style={{ color: "#627C85", maxWidth: "58ch" }}>
            No hold music, no &ldquo;press 1 for service.&rdquo; Your customer
            gets a real answer and a booked time before a call center would
            have picked up. Use the <strong>Text / Voice</strong> toggle to see
            both ways MannaFlow answers.
          </p>
          <RaceDemo />
        </div>

        {/* Comparison table, scrollable on mobile */}
        <div className="overflow-x-auto mb-6 md:mb-8">
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
                  Option
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
                    color: "#627C85",
                    width: "34%",
                  }}
                >
                  What works
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
                    color: "#627C85",
                    width: "44%",
                  }}
                >
                  Where it gets expensive or messy
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.option}
                  style={{ borderBottom: "1px solid #A2E8DD" }}
                >
                  <td
                    style={{
                      padding: "0.875rem 1rem 0.875rem 0",
                      fontFamily: "'MontaguSlab', Georgia, serif",
                      fontSize: "0.875rem",
                      fontWeight: row.isUs ? 700 : 600,
                      fontVariationSettings: row.isUs
                        ? "'opsz' 36, 'wght' 700"
                        : "'opsz' 36, 'wght' 600",
                      color: "#35524A",
                      verticalAlign: "top",
                    }}
                  >
                    {row.option}
                  </td>
                  <td
                    style={{
                      padding: "0.875rem 1rem",
                      fontFamily: "'MontaguSlab', Georgia, serif",
                      fontSize: "0.875rem",
                      fontWeight: row.isUs ? 600 : 400,
                      fontVariationSettings: row.isUs
                        ? "'opsz' 36, 'wght' 600"
                        : "'opsz' 36, 'wght' 400",
                      color: "#35524A",
                      lineHeight: 1.55,
                      verticalAlign: "top",
                    }}
                  >
                    {row.works}
                  </td>
                  <td
                    style={{
                      padding: "0.875rem 0 0.875rem 1rem",
                      fontFamily: "'MontaguSlab', Georgia, serif",
                      fontSize: "0.875rem",
                      fontWeight: row.isUs ? 600 : 400,
                      fontVariationSettings: row.isUs
                        ? "'opsz' 36, 'wght' 600"
                        : "'opsz' 36, 'wght' 400",
                      color: "#35524A",
                      lineHeight: 1.55,
                      verticalAlign: "top",
                    }}
                  >
                    {row.messy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p
          className="type-body"
          style={{ color: "#35524A", maxWidth: "58ch" }}
        >
          MannaFlow does not replace your team. It helps your team stop wasting
          time on repetitive lead work.
        </p>
      </div>
    </section>
  );
}
