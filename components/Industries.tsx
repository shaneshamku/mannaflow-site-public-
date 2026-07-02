const features = [
  {
    problem: "Missed calls from the job site",
    solution:
      "Instant text-back to every missed caller — while you're under a crawlspace or on a rooftop.",
  },
  {
    problem: "Scheduling handled over back-and-forth texts",
    solution:
      "Chat agent books the appointment directly, no phone tag required.",
  },
  {
    problem: "Leads cooling off overnight and on weekends",
    solution: "24/7 response that keeps leads warm even at 11pm on a Sunday.",
  },
  {
    problem: "New leads falling through the cracks",
    solution:
      "Every inquiry captured and logged — website, phone, or SMS — in one dashboard.",
  },
];

export default function Industries() {
  return (
    <section
      id="industries"
      style={{ backgroundColor: "#35524A" }}
      className="py-12 md:py-20"
    >
      <div className="max-w-6xl mx-auto px-6">
        <p className="type-eyebrow mb-3 md:mb-4" style={{ color: "#32DE8A" }}>
          Built for HVAC contractors
        </p>
        <h2 className="type-headline mb-4 md:mb-6" style={{ color: "#F5F2EC" }}>
          You can't answer calls from under a crawlspace.
        </h2>
        <p
          className="type-subhead mb-8 md:mb-16"
          style={{ color: "#A2E8DD", maxWidth: "58ch" }}
        >
          While you're on the job, leads are calling. Without a response,{" "}
          <span style={{ color: "#32DE8A" }}>they call your competitor</span>.
          mannaflow closes that gap before it costs you a customer.
        </p>

        <div
          className="grid grid-cols-2 gap-px"
          style={{ backgroundColor: "#627C85" }}
        >
          {features.map((f) => (
            <div
              key={f.problem}
              className="p-4 sm:p-6 md:p-10"
              style={{ backgroundColor: "#35524A" }}
            >
              <p
                className="type-body mb-2 md:mb-3"
                style={{
                  color: "#A2E8DD",
                  fontStyle: "italic",
                  fontSize: "clamp(0.8rem, 2.2vw, 1rem)",
                }}
              >
                {f.problem}
              </p>
              <p
                style={{
                  fontFamily: "'MontaguSlab', Georgia, serif",
                  fontSize: "clamp(0.8rem, 2.2vw, 1rem)",
                  fontWeight: 600,
                  fontVariationSettings: "'opsz' 36, 'wght' 600",
                  lineHeight: 1.5,
                  color: "#F5F2EC",
                }}
              >
                {f.solution}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
