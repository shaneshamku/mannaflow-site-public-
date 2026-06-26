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
        style={{ backgroundColor: "rgba(53, 82, 74, 0.72)" }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 md:py-32">
        <p className="type-eyebrow mb-4 md:mb-6" style={{ color: "#F5F2EC" }}>
          Automation for HVAC contractors
        </p>

        <h1
          className="type-display mb-5 md:mb-8"
          style={{ fontSize: "clamp(1.75rem, 5.5vw, 4.75rem)" }}
        >
          <span style={{ color: "#F5F2EC" }}>Your business runs 24/7.</span>
          <br />
          <span style={{ color: "#32DE8A" }}>You shouldn't have to.</span>
        </h1>

        <p
          className="type-subhead mb-7 md:mb-10"
          style={{ color: "#A2E8DD", maxWidth: "52ch" }}
        >
          mannaflow gives HVAC contractors their time back &mdash;{" "}
          <strong style={{ fontWeight: 700, color: "#32DE8A" }}>
            automated follow-up
          </strong>
          ,{" "}
          <strong style={{ fontWeight: 700, color: "#32DE8A" }}>
            round-the-clock call handling
          </strong>
          , and{" "}
          <strong style={{ fontWeight: 700, color: "#32DE8A" }}>
            lead capture
          </strong>{" "}
          that works while you're on the job.
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
          No long-term contracts
        </p>
      </div>
    </section>
  );
}
