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
        style={{ backgroundColor: "rgba(20, 24, 26, 0.68)" }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 md:py-32">
        <h1
          className="type-display mb-5 md:mb-7"
          style={{
            fontSize: "clamp(2rem, 6vw, 5rem)",
            fontWeight: 500,
            fontVariationSettings: "'opsz' 120, 'wght' 500",
            color: "#FFFFFF",
          }}
        >
          Stop chasing leads,
          <br />
          start scaling your business
        </h1>

        <p
          className="type-subhead mb-7 md:mb-9"
          style={{
            color: "#C9CFCC",
            maxWidth: "52ch",
            fontSize: "clamp(1.125rem, 2.4vw, 1.45rem)",
            fontWeight: 600,
            fontVariationSettings: "'opsz' 36, 'wght' 600",
          }}
        >
          Capture, track, and close every customer automatically
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <a href="#contact" className="btn-primary">
            Book a Free Demo
          </a>
          <a href="#how-it-works" className="btn-ghost">
            See How It Works
          </a>
        </div>

      </div>
    </section>
  );
}
