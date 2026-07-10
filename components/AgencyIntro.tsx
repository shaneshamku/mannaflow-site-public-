import IntegrationBar from "@/components/IntegrationBar";

export default function AgencyIntro() {
  return (
    <section
      id="about"
      style={{ backgroundColor: "#F5F2EC" }}
      className="py-14 md:py-20"
    >
      <div className="max-w-3xl mx-auto px-6">
        <p
          style={{
            fontFamily: "'MontaguSlab', Georgia, serif",
            fontSize: "clamp(1.15rem, 2.6vw, 1.5rem)",
            fontWeight: 400,
            fontVariationSettings: "'opsz' 48, 'wght' 400",
            lineHeight: 1.7,
            color: "#031D2A",
            textAlign: "justify",
            textAlignLast: "center",
          }}
        >
          MannaFlow helps contractors respond faster, book more jobs, and stop
          letting good leads slip through the cracks.
        </p>
      </div>

      <IntegrationBar />
    </section>
  );
}
