export default function Hero() {
  return (
    <section id="hero" className="mf-hero">
      {/* Wave photo lives on the body only, below the header. Exact asset —
          no CSS-generated wave, no filters, no gradients, no overlay.
          The {" "} spaces survive JSX so the copy reads correctly on desktop,
          where .mf-br collapses; on mobile .mf-br forces the reference wrap. */}
      <div className="mf-hero-body">
        <div className="mf-hero-inner">
          <h1 className="mf-hero-headline">
            Stop chasing{" "}
            <br className="mf-br" />
            leads, <span className="accent">start</span>{" "}
            <br className="mf-br" />
            <span className="accent">scaling</span> your{" "}
            <br className="mf-br" />
            business
          </h1>

          <p className="mf-hero-sub">
            Capture, track, and close every{" "}
            <br className="mf-br" />
            customer automatically
          </p>

          <div className="mf-hero-actions">
            <a href="#contact" className="mf-hero-cta mf-hero-cta--primary">
              Book a Free Demo
            </a>
            <a
              href="#how-it-works"
              className="mf-hero-cta mf-hero-cta--secondary"
            >
              See How It Works
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
