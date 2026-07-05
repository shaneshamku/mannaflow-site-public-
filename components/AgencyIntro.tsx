export default function AgencyIntro() {
  return (
    <section
      id="about"
      style={{ backgroundColor: "#F5F2EC" }}
      className="py-14 md:py-20"
    >
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p
          style={{
            fontFamily: "'MontaguSlab', Georgia, serif",
            fontSize: "clamp(1.15rem, 2.6vw, 1.5rem)",
            fontWeight: 400,
            fontVariationSettings: "'opsz' 48, 'wght' 400",
            lineHeight: 1.7,
            color: "#3D4744",
          }}
        >
          MannaFlow is a lead-response agency for contractors. We build the{" "}
          <strong
            style={{
              fontWeight: 700,
              fontVariationSettings: "'opsz' 48, 'wght' 700",
              color: "#212926",
            }}
          >
            voice agents, chatbots, dashboards, and nurture campaigns
          </strong>{" "}
          that answer every inquiry, book the job, and keep your pipeline
          moving — while your team stays on the tools.
        </p>
      </div>
    </section>
  );
}
