export default function AgencyIntro() {
  return (
    <section
      id="about"
      style={{ backgroundColor: "#F5F2EC" }}
      className="py-10 md:py-14"
    >
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p className="type-subhead" style={{ color: "#3D4744" }}>
          MannaFlow is a lead-response agency for contractors. We build the{" "}
          <strong
            style={{
              fontWeight: 700,
              fontVariationSettings: "'opsz' 36, 'wght' 700",
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
