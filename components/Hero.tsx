export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex items-center"
      style={{
        minHeight: "100vh",
        backgroundImage: "url('/images/bg-hero.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        paddingTop: "64px",
      }}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(53, 82, 74, 0.70)" }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 md:py-32">
        <p className="type-eyebrow mb-4 md:mb-6" style={{ color: "#F5F2EC" }}>
          Saving time and money on every lead
        </p>

        <h1
          className="type-display mb-5 md:mb-7"
          style={{
            fontSize: "clamp(1.6rem, 3.8vw, 3.25rem)",
            fontWeight: 500,
            fontVariationSettings: "'opsz' 120, 'wght' 500",
          }}
        >
          <span style={{ color: "#F5F2EC" }}>Less time chasing leads.</span>
          <br />
          <span style={{ color: "#32DE8A" }}>More time closing jobs.</span>
        </h1>

        <p
          className="type-subhead mb-7 md:mb-9"
          style={{
            color: "#A2E8DD",
            maxWidth: "52ch",
            fontSize: "clamp(0.95rem, 1.6vw, 1.1rem)",
            fontWeight: 600,
            fontVariationSettings: "'opsz' 36, 'wght' 600",
          }}
        >
          MannaFlow helps contractors{" "}
          <strong style={{ fontWeight: 700, color: "#32DE8A" }}>
            respond faster
          </strong>
          ,{" "}
          <strong style={{ fontWeight: 700, color: "#32DE8A" }}>
            follow up consistently
          </strong>
          , and keep every lead moving without adding more office work or
          pulling techs away from the job.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <a href="#contact" className="btn-primary">
            Book a Free Demo
          </a>
          <a href="#how-it-works" className="btn-ghost">
            See How It Works
          </a>
        </div>

        <p
          className="type-label mt-7 md:mt-10"
          style={{ color: "rgba(162, 232, 221, 0.65)" }}
        >
          Built for contractors who want fewer missed opportunities and less
          manual follow-up
        </p>
      </div>
    </section>
  );
}
