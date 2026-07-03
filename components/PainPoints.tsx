const tasks = [
  {
    before: "Missed calls wait until someone is free",
    after: "Every missed caller gets a fast response",
  },
  {
    before: "Techs get interrupted during jobs",
    after: "Leads are handled without pulling techs off the work",
  },
  {
    before: "Office staff chase cold quotes manually",
    after: "Follow-ups go out on a clear schedule",
  },
  {
    before: "Website forms sit in an inbox",
    after: "New inquiries are captured and routed quickly",
  },
  {
    before: "Call centers take messages",
    after: "MannaFlow helps qualify, organize, and move the lead forward",
  },
  {
    before: "Owners guess what is slipping",
    after: "You can see which leads came in, what happened, and what needs attention",
  },
];

export default function PainPoints() {
  return (
    <section
      id="how-it-works"
      style={{ backgroundColor: "#F5F2EC" }}
      className="py-12 md:py-20"
    >
      <div className="max-w-5xl mx-auto px-6">
        <p className="type-eyebrow mb-3 md:mb-4" style={{ color: "#627C85" }}>
          How We Help
        </p>
        <h2 className="type-headline mb-3 md:mb-4" style={{ color: "#35524A" }}>
          The lead work your team should not have to chase.
        </h2>
        <p
          className="type-subhead mb-8 md:mb-16"
          style={{ color: "#35524A", maxWidth: "52ch" }}
        >
          MannaFlow helps handle the repetitive lead-response work that costs
          time, money, and focus every week.
        </p>

        <div>
          {/* Column headers */}
          <div
            className="grid grid-cols-2 pb-3 md:pb-4"
            style={{ borderBottom: "2px solid #35524A" }}
          >
            <p
              style={{
                fontFamily: "'MontaguSlab', Georgia, serif",
                fontSize: "clamp(0.6rem, 1.8vw, 0.8rem)",
                fontWeight: 700,
                fontVariationSettings: "'opsz' 24, 'wght' 700",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#627C85",
              }}
            >
              Before MannaFlow
            </p>
            <p
              style={{
                fontFamily: "'MontaguSlab', Georgia, serif",
                fontSize: "clamp(0.6rem, 1.8vw, 0.8rem)",
                fontWeight: 700,
                fontVariationSettings: "'opsz' 24, 'wght' 700",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#35524A",
              }}
            >
              With MannaFlow
            </p>
          </div>

          {tasks.map((task, i) => (
            <div
              key={i}
              className="grid grid-cols-2"
              style={{ borderBottom: "1px solid #A2E8DD" }}
            >
              {/* Before — deliberately muted */}
              <div
                className="py-3 md:py-5 pr-2 sm:pr-4 md:pr-8"
                style={{ borderRight: "1px solid #A2E8DD" }}
              >
                <p
                  className="type-body"
                  style={{
                    color: "#35524A",
                    textDecoration: "line-through",
                    textDecorationColor: "#779CAB",
                    fontSize: "clamp(0.8rem, 2.2vw, 1rem)",
                  }}
                >
                  {task.before}
                </p>
              </div>

              {/* After — prominent */}
              <div className="py-3 md:py-5 pl-2 sm:pl-4 md:pl-8">
                <p
                  style={{
                    fontFamily: "'MontaguSlab', Georgia, serif",
                    fontSize: "clamp(0.8rem, 2.2vw, 1rem)",
                    fontWeight: 600,
                    fontVariationSettings: "'opsz' 36, 'wght' 600",
                    lineHeight: 1.55,
                    color: "#35524A",
                  }}
                >
                  {task.after}
                </p>
              </div>
            </div>
          ))}

          <div className="pt-6 md:pt-8 pb-2">
            <p
              style={{
                fontFamily: "'MontaguSlab', Georgia, serif",
                fontSize: "clamp(1rem, 2vw, 1.35rem)",
                fontWeight: 600,
                fontVariationSettings: "'opsz' 48, 'wght' 600",
                color: "#35524A",
                lineHeight: 1.25,
              }}
            >
              MannaFlow keeps leads moving while your team keeps working.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
