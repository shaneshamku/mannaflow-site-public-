const tasks = [
  {
    before: "Missed calls with no follow-up",
    after: "Instant auto-text to every missed caller",
  },
  {
    before: "Scheduling back-and-forth over text",
    after: "Chat agent books the appointment directly",
  },
  {
    before: "Leads going quiet overnight and on weekends",
    after: "24/7 response — including 2am on a Sunday",
  },
  {
    before: "Answering the same questions fifteen times a day",
    after: "AI handles FAQs so you don't have to",
  },
  {
    before: "Copying lead info from texts into your records",
    after: "Dashboard captures and organizes automatically",
  },
  {
    before: "Following up with leads who went cold",
    after: "Automated re-engagement sequences do it for you",
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
          What we automate
        </p>
        <h2 className="type-headline mb-3 md:mb-4" style={{ color: "#35524A" }}>
          The work that kills your week.
        </h2>
        <p
          className="type-subhead mb-8 md:mb-16"
          style={{ color: "#35524A", maxWidth: "52ch" }}
        >
          Every one of these used to require your attention. None of them do
          anymore.
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
              Before mannaflow
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
              After mannaflow
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
                fontSize: "clamp(1.1rem, 3vw, 1.75rem)",
                fontWeight: 600,
                fontVariationSettings: "'opsz' 48, 'wght' 600",
                color: "#35524A",
                lineHeight: 1.25,
              }}
            >
              mannaflow handles all of it.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
